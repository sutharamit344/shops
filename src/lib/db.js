import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import { unstable_cache } from "next/cache";
import { slugify } from "./slugify";

const COLLECTION_NAME = "shops";
const LOGS_COLLECTION = "activity_logs";

/**
 * HELPER: Resolves a slugified parameter to its original DB value.
 */
async function resolveParameter(slug, type) {
  try {
    if (!slug) return slug;
    
    // For categories, check the categories collection first
    if (type === 'category') {
      const cats = await getCategories();
      const match = cats.find(c => slugify(c.name) === slug.toLowerCase());
      if (match) return match.name;
    }

    // For others, check approved shops
    const shops = await getApprovedShops();
    const field = type === 'city' ? 'city' : type === 'area' ? 'area' : type === 'zone' ? 'zone' : 'category';
    
    const match = shops.find(s => s[field] && slugify(s[field]) === slug.toLowerCase());
    return match ? match[field] : slug;
  } catch (error) {
    console.error(`Error resolving ${type} slug:`, error);
    return slug;
  }
}

/**
 * Recursively converts Firestore Timestamps to ISO strings to ensure
 * serializability for Next.js Client Components.
 */
function serializeTimestamps(obj) {
  if (!obj || typeof obj !== "object") return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeTimestamps(item));
  }

  // Handle Firebase Timestamps
  if (typeof obj.toDate === "function") {
    return obj.toDate().toISOString();
  }

  // Handle objects recursively
  const serialized = {};
  for (const [key, value] of Object.entries(obj)) {
    serialized[key] = serializeTimestamps(value);
  }
  return serialized;
}

/**
 * Standardizes document data with ID and serialized timestamps.
 */
function standardizeData(docSnap) {
  if (!docSnap.exists || !docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...serializeTimestamps(docSnap.data()),
  };
}

/**
 * Checks if current user is an admin via a 'canary' read.
 * This hides admin emails from client-side code.
 */
export async function isUserAdmin() {
  try {
    const docRef = doc(db, "meta", "adminCheck");
    await getDoc(docRef);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Saves a new shop to Firestore. (Not cached)
 */
export async function saveShop(shopData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...shopData,
      status: "pending",
      createdAt: serverTimestamp(),
      ownerId: shopData.ownerId || null,
      ownerEmail: shopData.ownerEmail || null,
    });

    // Log the action
    await logActivity(
      "CREATE",
      `New shop "${shopData.name}" submitted.`,
      docRef.id,
      "shop",
      shopData.ownerEmail,
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error };
  }
}

/**
 * Gets a shop by slug. Optionally allows fetching non-approved shops (for preview).
 */
export async function getShopBySlug(slug, allowHidden = false) {
  try {
    // 1. Try exact match
    const constraints = [where("slug", "==", slug), limit(1)];
    if (!allowHidden) {
      constraints.push(where("status", "==", "approved"));
    }

    let q = query(collection(db, COLLECTION_NAME), ...constraints);
    let snap = await getDocs(q);

    // 2. If no match and slug has spaces/caps, try matching by name or lowercase
    if (snap.empty) {
      const fallbackConstraints = [
        where("slug", "==", slug.toLowerCase()),
        limit(1),
      ];
      if (!allowHidden) {
        fallbackConstraints.push(where("status", "==", "approved"));
      }
      q = query(collection(db, COLLECTION_NAME), ...fallbackConstraints);
      snap = await getDocs(q);
    }

    if (snap.empty) return null;

    const shop = standardizeData(snap.docs[0]);

    // Status check (extra safety)
    if (!allowHidden && shop.status !== "approved") return null;

    return shop;
  } catch (error) {
    if (error.code !== "permission-denied") {
      console.error("Error getting shop: ", error);
    }
    return null;
  }
}

/**
 * Gets all approved shops by category.
 */
export async function getShopsByCategory(categorySlug) {
  try {
    const category = await resolveParameter(categorySlug, 'category');
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(standardizeData);
    return results.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  } catch (error) {
    console.error("Error getting shops by category: ", error);
    throw error;
  }
}

/**
 * Gets all approved shops by city.
 */
export async function getShopsByCity(citySlug) {
  try {
    const city = await resolveParameter(citySlug, 'city');
    const q = query(
      collection(db, COLLECTION_NAME),
      where("city", "==", city),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(standardizeData);
  } catch (error) {
    console.error("Error getting shops by city: ", error);
    return [];
  }
}

/**
 * Gets all approved shops by city and category.
 */
export async function getShopsByCityAndCategory(citySlug, categorySlug) {
  try {
    const city = await resolveParameter(citySlug, 'city');
    const category = await resolveParameter(categorySlug, 'category');
    // 1. Try exact match
    const q = query(
      collection(db, COLLECTION_NAME),
      where("city", "==", city),
      where("category", "==", category),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(standardizeData);
    }

    // 2. Fallback: Try common casing patterns if no exact match
    // This is useful because URLs are often lowercased by users or browsers
    const capitalize = (s) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    // Try capitalized city/category (e.g., "Ahmedabad", "IT Company")
    const capCity = capitalize(city);
    const capCategory = category.split(" ").map(capitalize).join(" ");

    if (capCity !== city || capCategory !== category) {
      const qFallback = query(
        collection(db, COLLECTION_NAME),
        where("city", "==", capCity),
        where("category", "==", capCategory),
        where("status", "==", "approved"),
      );
      const snapFallback = await getDocs(qFallback);
      if (!snapFallback.empty) {
        return snapFallback.docs.map(standardizeData);
      }
    }

    return [];
  } catch (error) {
    console.error("Error getting shops by city and category: ", error);
    return [];
  }
}

/**
 * Gets all approved shops by city and area.
 */
export async function getShopsByCityAndArea(citySlug, areaSlug) {
  try {
    const city = await resolveParameter(citySlug, 'city');
    const area = await resolveParameter(areaSlug, 'area');
    const q = query(
      collection(db, COLLECTION_NAME),
      where("city", "==", city),
      where("area", "==", area),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(standardizeData);
  } catch (error) {
    console.error("Error getting shops by city and area: ", error);
    return [];
  }
}

/**
 * Gets all approved shops by city, area and zone.
 */
export async function getShopsByZoneInArea(citySlug, areaSlug, zoneSlug) {
  try {
    const city = await resolveParameter(citySlug, 'city');
    const area = await resolveParameter(areaSlug, 'area');
    const zone = await resolveParameter(zoneSlug, 'zone');
    const q = query(
      collection(db, COLLECTION_NAME),
      where("city", "==", city),
      where("area", "==", area),
      where("zone", "==", zone),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(standardizeData);
  } catch (error) {
    console.error("Error getting shops by zone in area: ", error);
    return [];
  }
}

/**
 * Gets all approved shops by zone (Legacy/Universal).
 */
export async function getShopsByZone(zone) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("zone", "==", zone),
      where("status", "==", "approved"),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(standardizeData);
    return results.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  } catch (error) {
    console.error("Error getting shops by zone: ", error);
    throw error;
  }
}

/**
 * Gets all pending shops for admin review. (Not cached)
 */

/**
 * Gets all pending shops for admin review. (Not cached)
 */
export async function getPendingShops() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "in", ["pending", "rejected"]),
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()
        ? doc.data().createdAt.toDate().toISOString()
        : null,
    }));
    return results.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  } catch (error) {
    console.error("Error getting pending shops: ", error);
    return [];
  }
}

/**
 * Gets all approved shops.
 */
export const getApprovedShops = unstable_cache(
  async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("status", "==", "approved"),
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData);
      return results.sort(
        (a, b) =>
          new Date(b.approvedAt || b.updatedAt) -
          new Date(a.approvedAt || a.updatedAt),
      );
    } catch (error) {
      console.error("Error getting approved shops: ", error);
      return [];
    }
  },
  ['approved-shops'],
  { revalidate: 3600, tags: ['shops'] }
);

export async function getUpdatedShops() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "approved"),
      where("needsVerification", "==", true),
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(standardizeData);
    return results.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  } catch (error) {
    console.error("Error getting updated shops: ", error);
    return [];
  }
}

/**
 * Marks a shop update as verified by admin.
 */
export async function verifyShopUpdate(id, adminEmail = "Admin") {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    const shopName = docSnap.exists() ? docSnap.data().name : "Unknown Shop";

    await updateDoc(docRef, {
      needsVerification: false,
      lastVerifiedAt: serverTimestamp(),
    });

    await logActivity(
      "VERIFY",
      `Verified latest updates for "${shopName}"`,
      id,
      "shop",
      adminEmail,
    );
    return { success: true };
  } catch (error) {
    console.error("Error verifying shop update: ", error);
    return { success: false, error };
  }
}

/**
 * Approves a shop.
 */
export async function approveShop(id, adminEmail = "Admin") {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Document not found");
    const data = docSnap.data();

    // Directly approve the pending/rejected record
    await updateDoc(docRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      adminComment: "", // Clear any previous rejection comments
    });

    await logActivity(
      "APPROVE",
      `Approved brand new shop "${data.name}"`,
      id,
      "shop",
      adminEmail,
    );
    return { success: true };
  } catch (error) {
    console.error("Error approving shop: ", error);
    return { success: false, error };
  }
}

/**
 * Rejects a shop with a reason.
 */
export async function rejectShop(id, reason, adminEmail = "Admin") {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    const shopName = docSnap.exists() ? docSnap.data().name : "Unknown Shop";

    await updateDoc(docRef, {
      status: "rejected",
      adminComment: reason,
      rejectedAt: serverTimestamp(),
    });

    await logActivity(
      "REJECT",
      `Rejected "${shopName}". Reason: ${reason}`,
      id,
      "shop",
      adminEmail,
    );
    return { success: true };
  } catch (error) {
    console.error("Error rejecting shop: ", error);
    return { success: false, error };
  }
}

/**
 * Gets active categories.
 */
export const getCategories = unstable_cache(
  async () => {
    try {
      const q = query(
        collection(db, "categories"),
        where("status", "==", "approved"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData);
      // Sort in memory to avoid index requirements
      return results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting categories: ", error);
      return [];
    }
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);

/**
 * Gets pending categories for admin.
 */
export async function getPendingCategories() {
  try {
    const q = query(
      collection(db, "categories"),
      where("status", "==", "pending"),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(standardizeData);
    // Sort in memory to avoid index requirements
    return results.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    );
  } catch (error) {
    console.error("Error getting pending categories: ", error);
    return [];
  }
}

/**
 * Proposes a new category.
 */
export async function proposeCategory(name) {
  try {
    const q = query(collection(db, "categories"), where("name", "==", name));
    const snap = await getDocs(q);
    if (!snap.empty) return { success: true, id: snap.docs[0].id }; // Already exists

    const docRef = await addDoc(collection(db, "categories"), {
      name,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    await logActivity(
      "CAT_PROPOSE",
      `Proposed new category: ${name}`,
      docRef.id,
      "category",
      "User",
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error proposing category: ", error);
    return { success: false, error };
  }
}

/**
 * Admin: Adds an approved category.
 */
export async function addApprovedCategory(name) {
  try {
    const q = query(collection(db, "categories"), where("name", "==", name));
    const snap = await getDocs(q);
    if (!snap.empty) {
      // If it exists but is pending, approve it
      if (snap.docs[0].data().status === "pending") {
        await updateDoc(doc(db, "categories", snap.docs[0].id), {
          status: "approved",
        });
      }
      return { success: true, id: snap.docs[0].id };
    }

    const docRef = await addDoc(collection(db, "categories"), {
      name,
      status: "approved",
      createdAt: serverTimestamp(),
    });
    await logActivity(
      "CAT_CREATE",
      `Approved new category: ${name}`,
      docRef.id,
      "category",
      "Admin",
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding approved category: ", error);
    return { success: false, error };
  }
}

/**
 * Admin: Deletes a category and optionally reassigns its shops.
 */
export async function deleteAndReassignCategory(sourceId, targetName = null) {
  try {
    const docRef = doc(db, "categories", sourceId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Source category not found");

    const sourceName = docSnap.data().name;

    // 1. If a target category name is provided, move all shops
    if (targetName) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("category", "==", sourceName),
      );
      const snap = await getDocs(q);

      const batchPromises = snap.docs.map((shopDoc) =>
        updateDoc(doc(db, COLLECTION_NAME, shopDoc.id), {
          category: targetName,
          updatedAt: serverTimestamp(),
        }),
      );
      await Promise.all(batchPromises);
    }

    // 2. Delete the category document
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error in delete and reassign: ", error);
    return { success: false, error };
  }
}

/**
 * Approves a category.
 */
export async function approveCategory(id) {
  try {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, { status: "approved" });
    return { success: true };
  } catch (error) {
    console.error("Error approving category: ", error);
    return { success: false, error };
  }
}

/**
 * Gets active clusters.
 */
export const getClusters = unstable_cache(
  async () => {
    try {
      const q = query(
        collection(db, "clusters"),
        where("status", "==", "approved"),
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(standardizeData);
      return results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
      console.error("Error getting clusters: ", error);
      return [];
    }
  },
  ['clusters'],
  { revalidate: 3600, tags: ['clusters'] }
);

/**
 * Gets pending clusters for admin.
 */
export async function getPendingClusters() {
  try {
    const q = query(
      collection(db, "clusters"),
      where("status", "==", "pending"),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(standardizeData);
    return results.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    );
  } catch (error) {
    console.error("Error getting pending clusters: ", error);
    return [];
  }
}

/**
 * Proposes a new cluster.
 */
export async function proposeCluster(name, category) {
  try {
    const q = query(
      collection(db, "clusters"), 
      where("name", "==", name),
      where("category", "==", category)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { success: true, id: snap.docs[0].id };

    const docRef = await addDoc(collection(db, "clusters"), {
      name,
      category,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    await logActivity(
      "CLUSTER_PROPOSE",
      `Proposed new cluster: ${name} for ${category}`,
      docRef.id,
      "cluster",
      "User",
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error proposing cluster: ", error);
    return { success: false, error };
  }
}

/**
 * Approves a cluster.
 */
export async function approveCluster(id) {
  try {
    const docRef = doc(db, "clusters", id);
    await updateDoc(docRef, { status: "approved" });
    return { success: true };
  } catch (error) {
    console.error("Error approving cluster: ", error);
    return { success: false, error };
  }
}

/**
 * Deletes a shop.
 */
export async function deleteShop(id, adminEmail = "Admin") {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    const shopName = docSnap.exists() ? docSnap.data().name : "Unknown Shop";

    await deleteDoc(docRef);
    await logActivity(
      "DELETE",
      `Deleted shop "${shopName}"`,
      id,
      "shop",
      adminEmail,
    );
    return { success: true };
  } catch (error) {
    console.error("Error deleting shop: ", error);
    return { success: false, error };
  }
}
/**
 * Gets a shop by ID.
 */
export async function getShopById(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    return standardizeData(docSnap);
  } catch (error) {
    console.error("Error getting shop by ID: ", error);
    return null;
  }
}

/**
 * Gets all shops owned by a specific user.
 */
export async function getShopsByOwner(ownerId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("ownerId", "==", ownerId),
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()
        ? doc.data().createdAt.toDate().toISOString()
        : null,
    }));

    return results.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  } catch (error) {
    console.error("Error getting owner shops: ", error);
    return [];
  }
}

/**
 * Updates an existing shop.
 */
export async function updateShop(id, data) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Shop not found");
    const currentData = docSnap.data();

    // Calculate what changed for the log
    const changedFields = Object.keys(data).filter(
      (key) => JSON.stringify(data[key]) !== JSON.stringify(currentData[key]),
    );
    const changeSummary =
      changedFields.length > 0
        ? `Updated: ${changedFields.join(", ")}`
        : "Revitalized profile (no field changes)";

    // If shop is already approved, UPDATE DIRECTLY (No shadow document)
    if (currentData.status === "approved") {
      const { id: _, ...safeData } = data;
      await updateDoc(docRef, {
        ...safeData,
        updatedAt: serverTimestamp(),
        needsVerification: true, // Flag for admin oversight
      });

      await logActivity(
        "UPDATE_LIVE",
        changeSummary,
        id,
        "shop",
        currentData.ownerEmail,
      );
      return { success: true, mode: "direct" };
    }

    // Otherwise (pending or rejected), just update the existing document
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      status: "pending", // Always reset to pending if it wasn't already approved
    });
    await logActivity(
      "UPDATE_DIRECT",
      `Directly updated shop "${currentData.name}"`,
      id,
      "shop",
      currentData.ownerEmail,
    );
    return { success: true, mode: "simple" };
  } catch (error) {
    console.error("Error updating shop: ", error);
    return { success: false, error };
  }
}

/**
 * Submits a new rating for a shop and updates the aggregate average.
 * Also stores the individual rating and comment in a subcollection.
 */
export async function submitShopRating(
  shopId,
  rating,
  comment = "",
  userName = "Customer",
) {
  try {
    const shopRef = doc(db, COLLECTION_NAME, shopId);
    const ratingsRef = collection(db, COLLECTION_NAME, shopId, "ratings");

    await runTransaction(db, async (transaction) => {
      const shopSnap = await transaction.get(shopRef);
      if (!shopSnap.exists()) throw new Error("Shop not found");

      const shopData = shopSnap.data();
      const currentAvg = shopData.avgRating || 0;
      const currentTotal = shopData.totalRatings || 0;

      const newTotal = currentTotal + 1;
      const newAvg = (currentAvg * currentTotal + rating) / newTotal;

      // 1. Create a new document in the ratings subcollection
      const newRatingRef = doc(ratingsRef);
      transaction.set(newRatingRef, {
        rating,
        comment,
        userName,
        createdAt: serverTimestamp(),
      });

      // 2. Update the shop's aggregate rating metadata
      transaction.update(shopRef, {
        avgRating: parseFloat(newAvg.toFixed(1)),
        totalRatings: newTotal,
      });

      // 3. Log the rating
      logActivity(
        "RATING",
        `${userName} rated "${shopData.name}" as ${rating} stars.`,
        shopId,
        "shop",
        userName,
      );
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting rating: ", error);
    return { success: false, error };
  }
}

/**
 * Deletes a rating and updates the aggregate average.
 */
export async function deleteShopRating(shopId, ratingId) {
  try {
    const shopRef = doc(db, COLLECTION_NAME, shopId);
    const ratingRef = doc(db, COLLECTION_NAME, shopId, "ratings", ratingId);

    await runTransaction(db, async (transaction) => {
      const shopSnap = await transaction.get(shopRef);
      const ratingSnap = await transaction.get(ratingRef);

      if (!shopSnap.exists()) throw new Error("Shop not found");
      if (!ratingSnap.exists()) throw new Error("Rating not found");

      const shopData = shopSnap.data();
      const ratingData = ratingSnap.data();

      const currentAvg = shopData.avgRating || 0;
      const currentTotal = shopData.totalRatings || 0;
      const deletedRating = ratingData.rating;

      let newTotal = currentTotal - 1;
      let newAvg = 0;

      if (newTotal > 0) {
        newAvg = (currentAvg * currentTotal - deletedRating) / newTotal;
      }

      // 1. Delete the rating document
      transaction.delete(ratingRef);

      // 2. Update the shop's aggregate rating metadata
      transaction.update(shopRef, {
        avgRating: parseFloat(newAvg.toFixed(1)),
        totalRatings: Math.max(0, newTotal),
      });

      // 3. Log the deletion
      logActivity(
        "RATING_DELETE",
        `Admin/Owner deleted a review from ${ratingData.userName}`,
        shopId,
        "shop",
        "System/Owner"
      );
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting rating: ", error);
    return { success: false, error };
  }
}

/**
 * Gets recent ratings for a shop.
 */
export async function getShopRatings(shopId, limitCount = 10) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME, shopId, "ratings"),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(standardizeData);
  } catch (error) {
    console.error("Error getting shop ratings: ", error);
    return [];
  }
}
/**
 * LOGGING SYSTEM
 */

export async function logActivity(
  action,
  details,
  entityId,
  entityType,
  userEmail,
) {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      action,
      details,
      entityId,
      entityType,
      performedBy: userEmail || "System",
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function getGlobalLogs(limitCount = 50) {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

export async function getEntityLogs(entityId, limitCount = 5) {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      where("entityId", "==", entityId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map(standardizeData);
  } catch (error) {
    console.error("Error fetching entity logs:", error);
    return [];
  }
}
