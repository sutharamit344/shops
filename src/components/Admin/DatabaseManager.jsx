"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, writeBatch, serverTimestamp, getCountFromServer, query, where, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import { Loader2, Check, Zap, ShieldCheck, Trash2, Database, BarChart3, Package, MapPin, Tag, RefreshCw, ShieldAlert } from "lucide-react";

const AREAS = [
  { name: "Gota", lat: 23.1058, lng: 72.5413, pincode: "382481" },
  { name: "Sola", lat: 23.0754, lng: 72.5254, pincode: "380060" },
  { name: "Thaltej", lat: 23.0500, lng: 72.5100, pincode: "380059" },
  { name: "Bopal", lat: 23.0341, lng: 72.4632, pincode: "380058" },
  { name: "Satellite", lat: 23.0305, lng: 72.5221, pincode: "380015" },
  { name: "Prahlad Nagar", lat: 23.0120, lng: 72.5030, pincode: "380015" },
  { name: "Vastrapur", lat: 23.0351, lng: 72.5293, pincode: "380015" },
  { name: "Chandkheda", lat: 23.1116, lng: 72.5833, pincode: "382424" },
  { name: "Nikol", lat: 23.0494, lng: 72.6743, pincode: "382350" },
  { name: "Maninagar", lat: 22.9965, lng: 72.6015, pincode: "380008" },
  { name: "Navrangpura", lat: 23.0373, lng: 72.5613, pincode: "380009" },
  { name: "Paldi", lat: 23.0135, lng: 72.5631, pincode: "380007" },
  { name: "Ellisbridge", lat: 23.0232, lng: 72.5714, pincode: "380006" },
  { name: "Naroda", lat: 23.0647, lng: 72.6483, pincode: "382330" },
  { name: "Memnagar", lat: 23.0497, lng: 72.5358, pincode: "380052" }
];

const CATEGORIES = [
  { name: "Grocery Store", adjectives: ["Shree", "Krishna", "Om", "Jai", "Best", "Fresh"], nouns: ["Mart", "Provision Store", "Bazaar", "Kirana"], img: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80" },
  { name: "Electronics Shop", adjectives: ["A-1", "Modern", "Super", "Digital", "Prime", "Elite"], nouns: ["Electronics", "Mobile", "Gadget Zone", "Computers"], img: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80" },
  { name: "Fashion Boutique", adjectives: ["Style", "Modern", "Ethnic", "Classic", "Glamour", "New"], nouns: ["Boutique", "Collection", "Wear", "Fabrics"], img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?w=800&q=80" },
  { name: "Bakery & Cafe", adjectives: ["Sweet", "Brown", "Oven", "Deli", "Tasty", "Classic"], nouns: ["Bakery", "Bakes", "Cafe", "Treats"], img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80" },
  { name: "Pharmacy", adjectives: ["Lifeline", "Wellness", "City", "Health", "Care", "Global"], nouns: ["Pharmacy", "Medicals", "Health Care", "Pharma"], img: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80" },
  { name: "Hardware Store", adjectives: ["Bharat", "National", "Shakti", "Diamond", "Everest"], nouns: ["Hardware", "Sanitary", "Paints", "Tools"], img: "https://images.unsplash.com/photo-1530124560677-bdaea027df01?w=800&q=80" },
  { name: "Toy Shop", adjectives: ["Kids", "Magic", "Dream", "Toy", "Little", "Fun"], nouns: ["World", "Zone", "Kingdom", "Planet"], img: "https://images.unsplash.com/photo-1536640712247-c575adcfc623?w=800&q=80" },
  { name: "Pet Store", adjectives: ["Pet", "Doggy", "Happy", "Furry", "Tail", "Smart"], nouns: ["Store", "Groomers", "Planet", "Care"], img: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800&q=80" }
];

const CLUSTERS = ["Ahmedabad West Hub", "City Center Market", "North Zone Bazaar", "Satellite Business District", "Maninagar Heritage Lane"];
const BUILDINGS = ["Capital Heights", "Galaxy Arcade", "Sun Moon Plaza", "Fortune Business Hub", "Shreeji Towers", "Akshar Residency", "Silicon Valley Center", "Maruti Complex", "Shukan Mall", "City Center"];

const DatabaseManager = () => {
  const [stats, setStats] = useState({ shops: 0, locations: 0, categories: 0, clusters: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const fetchCount = async (name) => {
        try {
          const snap = await getCountFromServer(collection(db, name));
          return snap.data().count;
        } catch (err) {
          console.error(`Permission denied for ${name}:`, err);
          return "Error";
        }
      };

      const [sCount, lCount, cCount, clCount] = await Promise.all([
        fetchCount("shops"),
        fetchCount("locations"),
        fetchCount("categories"),
        fetchCount("clusters")
      ]);

      setStats({
        shops: sCount,
        locations: lCount,
        categories: cCount,
        clusters: clCount
      });
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const clearCollection = async (collectionName) => {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const batches = [];
    let currentBatch = writeBatch(db);
    let count = 0;

    for (const doc of snapshot.docs) {
      currentBatch.delete(doc.ref);
      count++;
      if (count === 500) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) batches.push(currentBatch.commit());
    await Promise.all(batches);
  };

  const seedData = async (amount) => {
    setStatus("seeding");
    setProgress({ current: 0, total: amount });
    
    try {
      // 1. SEED CATEGORIES & CLUSTERS FIRST (Unique Entries)
      for (const cat of CATEGORIES) {
        const catSlug = slugify(cat.name);
        await setDoc(doc(db, "categories", catSlug), {
          name: cat.name,
          slug: catSlug,
          status: "approved",
          icon: "Store",
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      for (const cluster of CLUSTERS) {
        const clusterSlug = slugify(cluster);
        await setDoc(doc(db, "clusters", clusterSlug), {
          name: cluster,
          slug: clusterSlug,
          status: "approved",
          city: "Ahmedabad",
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      // 2. SEED SHOPS
      for (let i = 0; i < amount; i++) {
        const area = AREAS[Math.floor(Math.random() * AREAS.length)];
        const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
        const cluster = CLUSTERS[Math.floor(Math.random() * CLUSTERS.length)];
        
        const adj = cat.adjectives[Math.floor(Math.random() * cat.adjectives.length)];
        const noun = cat.nouns[Math.floor(Math.random() * cat.nouns.length)];
        const shopName = `${adj} ${noun} - ${area.name} ${i + 1}`;
        
        const lat = area.lat + (Math.random() - 0.5) * 0.015;
        const lng = area.lng + (Math.random() - 0.5) * 0.015;

        const shopData = {
          name: shopName,
          slug: slugify(shopName),
          category: cat.name,
          clusterType: cluster,
          city: "Ahmedabad",
          state: "Gujarat",
          area: area.name,
          pincode: area.pincode,
          village: "",
          zone: "Main Road",
          building: building,
          shopNo: `G-${Math.floor(Math.random() * 50) + 1}`,
          phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
          description: `Experience professional ${cat.name.toLowerCase()} services in the heart of ${area.name}. We pride ourselves on quality and customer satisfaction.`,
          rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
          status: "approved",
          createdAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
          lat,
          lng,
          logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${shopName}`,
          coverImage: cat.img,
          ownerId: "pro_seeder",
          isCertified: Math.random() > 0.3,
          businessHours: "10:00 AM - 8:00 PM",
          primaryColor: "#FF6B35",
          secondaryColor: "#1A1F36"
        };

        await addDoc(collection(db, "shops"), shopData);
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }
      setStatus("finished");
      fetchStats();
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  const handleWipeCollection = async (col, label) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete all ${label}? This cannot be undone.`)) return;
    setStatus("clearing");
    try {
      await clearCollection(col);
      setStatus("finished");
      fetchStats();
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  const handleWipeAll = async () => {
    if (!confirm("⚠️ FINAL WARNING: This will delete ALL shops, locations, categories, clusters, and activity logs. Your platform will be completely empty. Proceed?")) return;
    setStatus("clearing");
    try {
      await Promise.all([
        clearCollection("shops"),
        clearCollection("locations"),
        clearCollection("activity_logs"),
        clearCollection("categories"),
        clearCollection("clusters")
      ]);
      setStatus("finished");
      fetchStats();
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1F36] tracking-tight mb-2">Database Management</h1>
          <p className="text-[14px] text-[#666]">Monitor collection health and populate testing data.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="w-12 h-12 bg-white border border-[#1A1F36]/[0.07] rounded-xl flex items-center justify-center hover:border-[#FF6B35]/30 transition-all text-[#1A1F36]/60 shadow-sm"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-[#FF6B35]" : ""} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: "shops", label: "Total Shops", count: stats.shops, icon: Package, color: "#FF6B35" },
          { id: "locations", label: "Cached Locations", count: stats.locations, icon: MapPin, color: "#1A1F36" },
          { id: "categories", label: "Categories", count: stats.categories, icon: Tag, color: "#25D366" },
          { id: "clusters", label: "Clusters", count: stats.clusters, icon: ShieldCheck, color: "#6366f1" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-[#1A1F36]/[0.06] shadow-sm flex items-center justify-between group">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">{item.label}</p>
              <h2 className="text-2xl font-black text-[#1A1F36]">{loading ? "..." : item.count}</h2>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: `${item.color}10`, color: item.color }}
              >
                <item.icon size={20} />
              </div>
              <button 
                onClick={() => handleWipeCollection(item.id, item.label)}
                className="p-1.5 text-red-200 hover:text-red-500 transition-colors"
                title={`Wipe ${item.label}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seed Actions */}
        <div className="bg-white p-10 rounded-[40px] border border-[#1A1F36]/[0.06] shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1A1F36]">Quick Seeding</h3>
              <p className="text-[13px] text-[#666]">Insert fresh realistic data (Adds to existing).</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[50, 100, 500].map(amount => (
              <button
                key={amount}
                disabled={status !== "idle" && status !== "finished"}
                onClick={() => seedData(amount)}
                className="h-24 rounded-2xl border-2 border-dashed border-[#1A1F36]/[0.1] hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span className="text-2xl font-black text-[#1A1F36] group-hover:text-[#FF6B35]">{amount}</span>
                <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Shops</span>
              </button>
            ))}
          </div>

          <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">System Wipe</span>
            </div>
            <p className="text-[12px] text-red-600/60 leading-relaxed">
              Delete <strong>ALL</strong> dynamic data (Shops, Locations, Activity) in one click. Categories will be preserved.
            </p>
            <button
              onClick={handleWipeAll}
              disabled={status !== "idle" && status !== "finished"}
              className="w-full h-12 bg-red-600 text-white rounded-xl font-bold text-[13px] hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Wipe All Records
            </button>
          </div>
        </div>

        {/* Progress Display */}
        <div className="bg-[#1A1F36] p-10 rounded-[40px] shadow-xl flex flex-col justify-center items-center text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Database size={200} />
          </div>
          
          {(status === "idle" || status === "finished") ? (
            <div className="space-y-6 relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={40} className="text-[#FF6B35]" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">System Ready</h3>
              <p className="text-white/40 text-[14px] max-w-xs mx-auto">Select a seeding option to begin populating your marketplace with proper data.</p>
              {status === "finished" && (
                <div className="flex items-center gap-2 text-[#25D366] font-bold justify-center animate-in zoom-in">
                  <Check size={20} />
                  <span>Success! Database Updated</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-8 relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                {status === "clearing" ? <Trash2 size={40} className="text-red-400" /> : <Loader2 size={40} className="text-[#FF6B35] animate-spin" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  {status === "clearing" ? "Clearing Database..." : `Seeding ${progress.total} Shops...`}
                </h3>
                <p className="text-white/40 text-[13px] uppercase tracking-widest font-bold">
                  {status === "seeding" ? `${progress.current} / ${progress.total} Completed` : "Processing cleanup"}
                </p>
              </div>
              
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-[#FF6B35] transition-all duration-300"
                  style={{ width: status === "clearing" ? "100%" : `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-white/20 text-[10px] font-medium italic">Please remain on this page during processing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
