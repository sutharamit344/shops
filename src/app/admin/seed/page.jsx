"use client";

import React, { useState } from "react";
import { collection, addDoc, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import Button from "@/components/UI/Button";
import { Loader2, Check, Zap, ShieldCheck, Trash2 } from "lucide-react";

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
  { name: "Maninagar", lat: 22.9965, lng: 72.6015, pincode: "380008" }
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

const BUILDINGS = ["Capital Heights", "Galaxy Arcade", "Sun Moon Plaza", "Fortune Business Hub", "Shreeji Towers", "Akshar Residency", "Silicon Valley Center", "Maruti Complex", "Shukan Mall", "City Center"];

export default function SeederPage() {
  const [status, setStatus] = useState("idle"); // idle, clearing, seeding, finished
  const [progress, setProgress] = useState(0);

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

  const generateShops = async () => {
    try {
      // 1. CLEAR COLLECTIONS
      setStatus("clearing");
      await Promise.all([
        clearCollection("shops"),
        clearCollection("locations")
      ]);

      // 2. START SEEDING
      setStatus("seeding");
      const total = 500;
      
      for (let i = 0; i < total; i++) {
        const area = AREAS[Math.floor(Math.random() * AREAS.length)];
        const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
        
        const adj = cat.adjectives[Math.floor(Math.random() * cat.adjectives.length)];
        const noun = cat.nouns[Math.floor(Math.random() * cat.nouns.length)];
        const shopName = `${adj} ${noun} - ${area.name} Unit ${i + 1}`;
        
        const lat = area.lat + (Math.random() - 0.5) * 0.015;
        const lng = area.lng + (Math.random() - 0.5) * 0.015;

        const shopData = {
          name: shopName,
          slug: slugify(shopName),
          category: cat.name,
          city: "Ahmedabad",
          state: "Gujarat",
          area: area.name,
          pincode: area.pincode,
          village: "",
          zone: "Main Road",
          building: building,
          shopNo: `G-${Math.floor(Math.random() * 50) + 1}`,
          phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
          description: `Premium ${cat.name} providing top-quality service in ${area.name}. We specialize in a wide range of ${cat.name.toLowerCase()} products and services with customer satisfaction as our priority.`,
          rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
          status: "approved",
          createdAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
          lat,
          lng,
          logo: `https://api.dicebear.com/7.x/shapes/svg?seed=${shopName}`,
          coverImage: cat.img,
          ownerId: "system_seeder",
          isCertified: true,
          businessHours: "9:00 AM - 9:00 PM",
          primaryColor: "#FF6B35",
          secondaryColor: "#1A1F36"
        };

        await addDoc(collection(db, "shops"), shopData);
        setProgress(i + 1);
      }
      setStatus("finished");
    } catch (err) {
      console.error("Seeding failed", err);
      setStatus("idle");
      alert("Error clearing/seeding database. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-[#1A1F36]/5 border border-[#1A1F36]/[0.02]">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[28px] bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] mb-8">
            {status === "clearing" ? <Trash2 className="animate-pulse" size={40} /> : <ShieldCheck size={40} />}
          </div>
          
          <h1 className="text-3xl font-black text-[#1A1F36] mb-4 tracking-tight">Marketplace Reset & Seed</h1>
          <p className="text-[#1A1F36]/50 font-medium mb-10 text-[15px] leading-relaxed">
            {status === "clearing" 
              ? "Wiping old data to ensure a clean slate..." 
              : "Generating 500 premium shop profiles in Ahmedabad with proper GPS, addresses, and images."}
          </p>

          {status === "idle" && (
            <Button size="lg" className="w-full shadow-lg shadow-[#FF6B35]/20" icon={Zap} onClick={generateShops}>
              Clear & Seed 500 Shops
            </Button>
          )}

          {(status === "seeding" || status === "clearing") && (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between font-bold text-sm mb-1">
                <span className="text-[#FF6B35]">{status === "clearing" ? "Clearing Database..." : "Pushing Records..."}</span>
                <span className="text-[#1A1F36]/40">{status === "clearing" ? "---" : `${progress} / 500`}</span>
              </div>
              <div className="h-4 w-full bg-[#FAFAF8] rounded-full overflow-hidden border border-[#1A1F36]/[0.04]">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] transition-all duration-300"
                  style={{ width: status === "clearing" ? "100%" : `${(progress / 500) * 100}%` }}
                />
              </div>
            </div>
          )}

          {status === "finished" && (
            <div className="w-full space-y-6 animate-in zoom-in duration-500">
              <div className="p-5 bg-green-50 text-green-600 rounded-3xl flex flex-col items-center gap-2 font-bold">
                <Check size={24} />
                <span>Platform is now clean & populated!</span>
              </div>
              <Button variant="dark" size="lg" className="w-full" onClick={() => window.location.href = '/explore'}>
                Launch Marketplace
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
