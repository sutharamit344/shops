import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { slugify } from "./slugify";

/**
 * Quick Seeding Script for ShopBajar
 * Focuses data in Ahmedabad (Gota area) for efficient platform testing.
 */

const TEST_LOCATION = {
  city: "Ahmedabad",
  state: "Gujarat",
  area: "Gota",
  pincode: "382481",
  lat: 23.0782,
  lng: 72.5312
};

const NEARBY_AREAS = [
  { name: "Sola", lat: 23.0658, lng: 72.5229 },
  { name: "Chandlodia", lat: 23.0652, lng: 72.5414 },
  { name: "Vasant Nagar", lat: 23.0850, lng: 72.5280 }
];

const CATEGORIES = [
  "Restaurant", "Cafe", "Salon", "Clinic", "Kirana Store",
  "Hardware Store", "Medical Store", "Boutique", "Bakery", "Gym"
];

const SHOP_DATA = [
  { name: "Gota Garden Restaurant", cat: "Restaurant", cluster: "Gota Food Hub" },
  { name: "Blue Lagoon Cafe", cat: "Cafe", cluster: "Gota Food Hub" },
  { name: "Style Icon Salon", cat: "Salon", cluster: "Luxury Square" },
  { name: "Healthy Life Clinic", cat: "Clinic", cluster: "" },
  { name: "Ganesh Kirana Store", cat: "Kirana Store", cluster: "Vasantnagar Market" },
  { name: "Shiv Hardware & Tools", cat: "Hardware Store", cluster: "Vasantnagar Market" },
  { name: "MedCity Pharmacy", cat: "Medical Store", cluster: "" },
  { name: "Trends Boutique", cat: "Boutique", cluster: "Luxury Square" },
  { name: "The Baker's Pride", cat: "Bakery", cluster: "Gota Food Hub" },
  { name: "Iron Fitness Gym", cat: "Gym", cluster: "" },
  { name: "Spicy Tadka", cat: "Restaurant", cluster: "Gota Food Hub" },
  { name: "Coffee Culture", cat: "Cafe", cluster: "" },
  { name: "Glow Hair & Beauty", cat: "Salon", cluster: "Luxury Square" },
  { name: "Shreeji Provision Store", cat: "Kirana Store", cluster: "Vasantnagar Market" },
  { name: "Sunrise Medical", cat: "Medical Store", cluster: "" },
];

export async function clearAllData() {
  const collections = ["shops", "activity_logs", "categories", "clusters", "locations"];
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return { success: true };
}

export async function seedQuickTest(onProgress) {
  try {
    console.log("Starting Quick Seeding...");
    
    // 1. Seed Categories
    const categoryIds = {};
    for (const catName of CATEGORIES) {
      const docRef = await addDoc(collection(db, "categories"), {
        name: catName,
        status: "approved",
        createdAt: serverTimestamp()
      });
      categoryIds[catName] = docRef.id;
    }

    // 2. Seed Clusters
    const clusters = [
      { name: "Gota Food Hub", category: "Restaurant" },
      { name: "Vasantnagar Market", category: "Kirana Store" },
      { name: "Luxury Square", category: "Salon" }
    ];
    
    const clusterData = {};
    for (const c of clusters) {
      const docRef = await addDoc(collection(db, "clusters"), {
        ...c,
        ...TEST_LOCATION,
        status: "approved",
        createdAt: serverTimestamp()
      });
      clusterData[c.name] = docRef.id;
    }

    // 3. Seed Shops in Gota
    let i = 0;
    for (const shop of SHOP_DATA) {
      i++;
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      
      const data = {
        name: shop.name,
        slug: slugify(`${shop.name}-${i}`),
        category: shop.cat,
        clusterType: shop.cluster,
        city: TEST_LOCATION.city,
        state: TEST_LOCATION.state,
        area: TEST_LOCATION.area,
        pincode: TEST_LOCATION.pincode,
        lat: TEST_LOCATION.lat + latOffset,
        lng: TEST_LOCATION.lng + lngOffset,
        address: `Gota, Ahmedabad, Gujarat ${TEST_LOCATION.pincode}`,
        phone: `99887700${String(i).padStart(2, '0')}`,
        whatsapp: `99887700${String(i).padStart(2, '0')}`,
        description: `Premium ${shop.cat} providing best service in ${TEST_LOCATION.area}.`,
        status: "approved",
        avgRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        totalRatings: Math.floor(Math.random() * 100) + 5,
        isVerified: true,
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        ownerEmail: "test@shopbajar.com",
        image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&auto=format&fit=crop`
      };

      await addDoc(collection(db, "shops"), data);
      if (onProgress) onProgress(i, SHOP_DATA.length + NEARBY_AREAS.length);
    }

    // 4. Seed Nearby Shops to test radius
    for (const area of NEARBY_AREAS) {
      i++;
      const data = {
        name: `${area.name} Local Market`,
        slug: slugify(`${area.name}-market-${i}`),
        category: "Kirana Store",
        city: TEST_LOCATION.city,
        state: TEST_LOCATION.state,
        area: area.name,
        pincode: TEST_LOCATION.pincode,
        lat: area.lat,
        lng: area.lng,
        address: `${area.name}, Ahmedabad, Gujarat`,
        status: "approved",
        avgRating: 4.2,
        totalRatings: 15,
        createdAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        ownerEmail: "test@shopbajar.com",
        image: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop`
      };
      await addDoc(collection(db, "shops"), data);
      if (onProgress) onProgress(i, SHOP_DATA.length + NEARBY_AREAS.length);
    }

    console.log("Quick Seeding Completed!");
    return { success: true };
  } catch (error) {
    console.error("Seeding failed:", error);
    return { success: false, error: error.message };
  }
}
