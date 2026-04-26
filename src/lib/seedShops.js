import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { slugify } from "./slugify";

export async function clearShops() {
  const querySnapshot = await getDocs(collection(db, "shops"));
  const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "shops", d.id)));
  await Promise.all(deletePromises);
  return { success: true };
}

export async function clearAllData() {
  const collections = ["shops", "activity_logs", "categories", "clusters"];
  
  for (const colName of collections) {
    const querySnapshot = await getDocs(collection(db, colName));
    const deletePromises = querySnapshot.docs.map(async (d) => {
      // Handle subcollections for shops
      if (colName === "shops") {
        const ratingsSnap = await getDocs(collection(db, "shops", d.id, "ratings"));
        const ratingDeletes = ratingsSnap.docs.map(rd => deleteDoc(rd.ref));
        await Promise.all(ratingDeletes);
      }
      return deleteDoc(doc(db, colName, d.id));
    });
    await Promise.all(deletePromises);
  }
  return { success: true };
}

const CITIES = {
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Bikaner"]
};

const CITY_AREAS = {
  Ahmedabad: ["C.G. Road", "Satellite", "Prahlad Nagar", "Vastrapur", "Maninagar"],
  Surat: ["Adajan", "Vesu", "Varachha", "Piplod", "Katargam"],
  Vadodara: ["Alkapuri", "Akota", "Sayajigunj", "Gotri", "Fatehgunj"],
  Rajkot: ["Kalavad Road", "Yagnik Road", "Race Course", "University Road"],
  Bhavnagar: ["Kala Nala", "Waghawadi Road", "Ghogha Circle"],
  Jaipur: ["C-Scheme", "Malviya Nagar", "Raja Park", "Vaishali Nagar", "Mansarovar"],
  Jodhpur: ["Sardarpura", "Shastri Nagar", "Kamla Nehru Nagar", "Ratanada"],
  Udaipur: ["Fateh Sagar", "Hiran Magri", "Panchwati", "Sector 11"],
  Ajmer: ["Vaishali Nagar", "Adarsh Nagar", "Civil Lines"],
  Bikaner: ["JNV Colony", "Gangashahar", "Rani Bazar"]
};

const CATEGORIES = [
  "Restaurant", "Cafe", "Salon", "Clinic", "Kirana Store", 
  "Mobile Shop", "Milk Dairy", "Hardware Store", "Stationery",
  "Medical Store", "Boutique", "Bakery", "Tailor Shop"
];

const SHOP_NAME_TEMPLATES = [
  "{City} {Category}",
  "New {City} {Category}",
  "Royal {Category}",
  "Shree {Category}",
  "Krishna {Category}",
  "The Local {Category}",
  "Famous {Category}"
];

const OWNER_EMAILS = [
  "sutharamit344@gmail.com",
  "amusuthar866@gmail.com",
  "webiestindiasolution@gmail.com"
];

const DESCRIPTIONS = [
  "Serving our local community with fresh products and friendly service.",
  "Your one-stop neighborhood shop for all daily essentials.",
  "Experience the best local taste and service at our convenient location.",
  "Quality products at the best local prices. Visit us today!",
  "A trusted family-owned business serving the area for many years."
];

export async function seedTestShops(count = 50, onProgress) {
  const total = count;
  const addedCategories = new Set();
  const addedClusters = new Set();

  // First, get existing to avoid duplicates if not wiped
  try {
    const catSnap = await getDocs(collection(db, "categories"));
    catSnap.forEach(d => addedCategories.add(d.data().name));
    
    const clusterSnap = await getDocs(collection(db, "clusters"));
    clusterSnap.forEach(d => addedClusters.add(`${d.data().name}:${d.data().category}`));
  } catch (e) {
    console.error("Error fetching existing meta:", e);
  }

  for (let i = 1; i <= total; i++) {
    const states = Object.keys(CITIES);
    const state = states[Math.floor(Math.random() * states.length)];
    const cityList = CITIES[state];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    const areaList = CITY_AREAS[city] || ["Main Market"];
    const area = areaList[Math.floor(Math.random() * areaList.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Ensure Category exists in collection
    if (!addedCategories.has(category)) {
      try {
        await addDoc(collection(db, "categories"), {
          name: category,
          status: "approved",
          createdAt: serverTimestamp()
        });
        addedCategories.add(category);
      } catch (e) { console.error("Error seeding category:", e); }
    }

    // Generate Cluster Type (e.g. Food Park, IT Hub) for 20% of shops
    let clusterType = "";
    if (Math.random() > 0.8) {
      const suffixes = ["Hub", "Park", "Plaza", "Center", "Market", "Point", "Zone"];
      clusterType = `${category} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
      
      // Ensure Cluster exists in collection
      const clusterKey = `${clusterType}:${category}`;
      if (!addedClusters.has(clusterKey)) {
        try {
          await addDoc(collection(db, "clusters"), {
            name: clusterType,
            category: category,
            status: "approved",
            createdAt: serverTimestamp()
          });
          addedClusters.add(clusterKey);
        } catch (e) { console.error("Error seeding cluster:", e); }
      }
    }

    // Generate natural local name
    const template = SHOP_NAME_TEMPLATES[Math.floor(Math.random() * SHOP_NAME_TEMPLATES.length)];
    const name = template.replace("{City}", city).replace("{Category}", clusterType || category);
    
    const slug = slugify(`${name}-${area}-${i}`);

    const shopData = {
      name,
      slug,
      category,
      clusterType,
      city,
      state,
      area,
      address: `Shop No. ${100 + i}, ${area}, ${city}`,
      phone: `98765${String(i).padStart(5, '0')}`,
      whatsapp: `98765${String(i).padStart(5, '0')}`,
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
      status: "approved",
      avgRating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
      totalRatings: Math.floor(Math.random() * 200) + 10,
      views: Math.floor(Math.random() * 5000) + 100,
      isVerified: true,
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      ownerEmail: OWNER_EMAILS[Math.floor(Math.random() * OWNER_EMAILS.length)],
      image: `https://images.unsplash.com/photo-${1555396273 + i}-367ea4eb4db5?w=800&auto=format&fit=crop`
    };

    try {
      await addDoc(collection(db, "shops"), shopData);
      if (onProgress) onProgress(i, total);
    } catch (error) {
      console.error(`Failed to seed shop ${i}:`, error);
    }
  }

  return { success: true, count: total };
}
