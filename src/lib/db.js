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
  runTransaction
} from "firebase/firestore";
import { db } from "./firebase";
import { unstable_cache } from "next/cache";

const COLLECTION_NAME = "shops";

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
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error };
  }
}

/**
 * Gets a shop by slug and status approved.
 */
export async function getShopBySlug(slug) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("slug", "==", slug),
      where("status", "==", "approved"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  } catch (error) {
    console.error("Error getting shop: ", error);
    return null;
  }
}

/**
 * Gets all approved shops by category.
 */
export async function getShopsByCategory(category) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("category", "==", category),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null
      };
    });
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error getting shops by category: ", error);
    throw error;
  }
}

/**
 * Gets all approved shops.
 */
export async function getApprovedShops() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : null
      };
    });
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error getting approved shops: ", error);
    return [];
  }
}
/**
 * Gets all pending shops for admin review. (Not cached)
 */
export async function getPendingShops() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "in", ["pending", "update-review"])
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ? doc.data().createdAt.toDate().toISOString() : null
    }));
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error getting pending shops: ", error);
    return [];
  }
}

/**
 * Approves a shop.
 */
export async function approveShop(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) throw new Error("Document not found");
    const data = docSnap.data();

    if (data.status === "update-review" && data.originalId) {
      // 1. Merge data into original
      const originalRef = doc(db, COLLECTION_NAME, data.originalId);
      const { status, originalId, ...updateData } = data;
      await updateDoc(originalRef, {
        ...updateData,
        status: "approved",
        updatedAt: serverTimestamp()
      });
      // 2. Delete the shadow document
      await deleteDoc(docRef);
    } else {
      // Normal approval
      await updateDoc(docRef, { status: "approved" });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error approving shop: ", error);
    return { success: false, error };
  }
}

/**
 * Rejects a shop with a reason.
 */
export async function rejectShop(id, reason) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { 
      status: "rejected",
      adminComment: reason,
      rejectedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error rejecting shop: ", error);
    return { success: false, error };
  }
}

/**
 * Gets active categories.
 */
export async function getCategories() {
  try {
    const q = query(
      collection(db, "categories"),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in memory to avoid index requirements
    return results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } catch (error) {
    console.error("Error getting categories: ", error);
    return [];
  }
}

/**
 * Gets pending categories for admin.
 */
export async function getPendingCategories() {
  try {
    const q = query(
      collection(db, "categories"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort in memory to avoid index requirements
    return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
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
      createdAt: serverTimestamp()
    });
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
          await updateDoc(doc(db, "categories", snap.docs[0].id), { status: "approved" });
       }
       return { success: true, id: snap.docs[0].id };
    }

    const docRef = await addDoc(collection(db, "categories"), {
      name,
      status: "approved",
      createdAt: serverTimestamp()
    });
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
        where("category", "==", sourceName)
      );
      const snap = await getDocs(q);
      
      const batchPromises = snap.docs.map(shopDoc => 
        updateDoc(doc(db, COLLECTION_NAME, shopDoc.id), { 
          category: targetName,
          updatedAt: serverTimestamp()
        })
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
 * Deletes a shop.
 */
export async function deleteShop(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
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
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
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
      where("ownerId", "==", ownerId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ? doc.data().createdAt.toDate().toISOString() : null
    }));
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    // If shop is already approved, create a shadow document for review
    if (currentData.status === "approved") {
      const { id: _, ...safeData } = data; // Remove ID if present
      await addDoc(collection(db, COLLECTION_NAME), {
        ...safeData,
        originalId: id,
        status: "update-review",
        createdAt: serverTimestamp(),
        ownerId: currentData.ownerId,
        ownerEmail: currentData.ownerEmail
      });
      return { success: true, mode: "review" };
    }

    // Otherwise (pending or rejected), just update the existing document
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      status: "pending" // Always reset to pending if it wasn't already approved
    });
    return { success: true, mode: "simple" };
  } catch (error) {
    console.error("Error updating shop: ", error);
    return { success: false, error };
  }
}

/**
 * Submits a new rating for a shop and updates the aggregate average.
 */
export async function submitShopRating(shopId, rating) {
  try {
    const shopRef = doc(db, COLLECTION_NAME, shopId);
    
    await runTransaction(db, async (transaction) => {
      const shopSnap = await transaction.get(shopRef);
      if (!shopSnap.exists()) throw new Error("Shop not found");

      const shopData = shopSnap.data();
      const currentAvg = shopData.avgRating || 0;
      const currentTotal = shopData.totalRatings || 0;

      const newTotal = currentTotal + 1;
      const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

      transaction.update(shopRef, {
        avgRating: parseFloat(newAvg.toFixed(1)),
        totalRatings: newTotal
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting rating: ", error);
    return { success: false, error };
  }
}
