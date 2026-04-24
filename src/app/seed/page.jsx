"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";
import Button from "@/components/UI/Button";
import Navbar from "@/components/Navbar";
import { Trash2, Database, RefreshCw, CheckCircle2 } from "lucide-react";

const PROPER_SHOPS = [
  {
    name: "Webiest India Solutions",
    slug: "webiest-india",
    category: "IT Service",
    city: "Ahmedabad",
    phone: "919876543210",
    description: "Premium web development and digital transformation services for global brands.",
    status: "approved",
    avgRating: 5.0,
    totalRatings: 15,
    primaryColor: "#0F0F0F",
    logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
  },
  {
    name: "The Sourdough Studio",
    slug: "sourdough-studio-mumbai",
    category: "Bakery",
    city: "Mumbai",
    phone: "919820011223",
    description: "Artisanal bakery specializing in long-fermentation sourdough and organic pastries.",
    status: "approved",
    avgRating: 4.9,
    totalRatings: 84,
    primaryColor: "#795548",
    logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  },
  {
    name: "Luxe Aesthetics",
    slug: "luxe-aesthetics-delhi",
    category: "Salon",
    city: "Delhi",
    phone: "919810055667",
    description: "Modern beauty clinic offering advanced skincare and celebrity styling services.",
    status: "approved",
    avgRating: 4.8,
    totalRatings: 42,
    primaryColor: "#E91E63",
    logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
  },
  {
    name: "Blue Tokai Coffee Roasters",
    slug: "blue-tokai-ahmedabad",
    category: "Cafe",
    city: "Ahmedabad",
    phone: "919876500998",
    description: "Specialty coffee roastery and cafe serving single-origin Indian coffees.",
    status: "approved",
    avgRating: 4.7,
    totalRatings: 156,
    primaryColor: "#1A237E",
    logo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop",
  },
  {
    name: "Urban Green Pharmacy",
    slug: "urban-green-mumbai",
    category: "Pharmacy",
    city: "Mumbai",
    phone: "919820099887",
    description: "Full-service pharmacy with organic wellness products and health consultations.",
    status: "approved",
    avgRating: 4.6,
    totalRatings: 210,
    primaryColor: "#2E7D32",
    logo: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=200&h=200&fit=crop",
  }
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("");

  const resetAndSeed = async () => {
    if (!confirm("This will DELETE ALL SHOPS in your database. Are you sure?")) return;

    setLoading(true);
    setMessage("");
    try {
      const shopsRef = collection(db, "shops");

      // Step 1: Delete all existing shops
      setStep("Wiping existing database records...");
      const querySnapshot = await getDocs(shopsRef);
      const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(doc(db, "shops", docSnap.id)));
      await Promise.all(deletePromises);

      // Step 2: Seed new data
      setStep(`Injecting ${PROPER_SHOPS.length} premium records...`);
      for (const shop of PROPER_SHOPS) {
        await addDoc(shopsRef, {
          ...shop,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
        });
      }

      setMessage("Database successfully revitalized with clean data!");
      setStep("");
    } catch (error) {
      console.error("Seed error:", error);
      setMessage("Error during revitalization: " + error.message);
      setStep("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-32 pb-20 text-center">
        <div className="bg-white rounded-[40px] p-12 border border-black/[0.06] shadow-xl shadow-black/[0.02]">
          <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-[30px] flex items-center justify-center mx-auto mb-8">
            <RefreshCw size={40} className={`text-[#FF6B35] ${loading ? 'animate-spin' : ''}`} />
          </div>

          <h1 className="text-3xl font-black text-[#0F0F0F] mb-4 tracking-tight">Database Revitalizer</h1>
          <p className="text-[15px] text-[#666] mb-10 leading-relaxed">
            Use this tool to wipe your current shop listings and replace them with properly formatted, high-fidelity sample data.
          </p>

          {step && (
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-black/[0.04] animate-pulse">
              <p className="text-[12px] font-bold text-[#FF6B35] uppercase tracking-widest">{step}</p>
            </div>
          )}

          {message && (
            <div className={`mb-10 p-6 rounded-[28px] flex items-center gap-4 text-left ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              <CheckCircle2 size={24} />
              <p className="text-[14px] font-bold">{message}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={resetAndSeed}
              disabled={loading}
              className="h-14 bg-[#0F0F0F] text-white text-[14px] font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-black/90 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {loading ? "Processing..." : <><Trash2 size={18} /> Clear & Seed Data</>}
            </Button>

            <p className="text-[11px] text-[#999] font-bold uppercase tracking-widest">
              Warning: This action is irreversible
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
