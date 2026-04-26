"use client";

import React, { useState } from "react";
import { seedTestShops, clearShops, clearAllData } from "@/lib/seedShops";
import Navbar from "@/components/Navbar";
import { Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";

export default function SeedDashboard() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState("idle"); // idle, clearing, seeding, completed, error



  const handleWipeAll = async () => {
    if (!confirm("CRITICAL WARNING: This will DELETE EVERYTHING in Firestore (shops, logs, categories, clusters). This action is irreversible. Proceed?")) return;
    
    setLoading(true);
    setStatus("wiping");
    try {
      await clearAllData();
      setStatus("completed");
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async (count) => {
    if (!confirm(`Are you sure? This will insert ${count} NEW shops into your live Firestore database.`)) return;
    
    setLoading(true);
    setStatus("seeding");
    try {
      await seedTestShops(count, (current, total) => {
        setProgress({ current, total });
      });
      setStatus("completed");
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-20 px-6">
        <div className="bg-white rounded-[32px] p-12 shadow-xl border border-black/[0.04] text-center space-y-8">
          <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-3xl flex items-center justify-center mx-auto text-[#FF6B35]">
            <Database size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#1A1F36]">Data Seeding Tool</h1>
            <p className="text-gray-500">Populate your Firestore with high-quality shops for testing.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-4">
              <button
                onClick={() => handleSeed(500)}
                className="w-full h-16 bg-white border-2 border-black/[0.06] text-[#1A1F36] rounded-2xl font-bold text-lg hover:border-[#FF6B35] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Database size={20} />
                Seed 500 Shops
              </button>

              <button
                onClick={handleWipeAll}
                className="w-full h-16 bg-red-600 text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <AlertCircle size={20} />
                Wipe All Firestore Data
              </button>
            </div>
          )}

          {status === "wiping" && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
                <Loader2 className="animate-spin" size={24} />
                <span>Wiping all Firestore collections...</span>
              </div>
            </div>
          )}

          {status === "clearing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
                <Loader2 className="animate-spin" size={24} />
                <span>Deleting all existing shops...</span>
              </div>
            </div>
          )}

          {(status === "seeding" || status === "completed") && (
            <div className="space-y-6">
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#FF6B35] transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-3 text-[#FF6B35] font-bold">
                <Loader2 className="animate-spin" size={20} />
                <span>Inserting {progress.current} of {progress.total} shops...</span>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 space-y-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-green-900">Successfully Seeded!</h3>
                <p className="text-green-700">50 shops have been added to Gujarat and Rajasthan.</p>
              </div>
              <button 
                onClick={() => window.location.href = "/"}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
              >
                Go to Search
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4 text-red-700">
              <AlertCircle className="mx-auto" size={40} />
              <p className="font-bold">An error occurred during seeding. Check console for details.</p>
              <button 
                onClick={() => setStatus("idle")}
                className="text-red-900 underline font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur p-6 rounded-2xl border border-black/[0.04]">
            <h4 className="font-bold text-[#1A1F36] mb-2">Gujarat (25 Shops)</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Ahmedabad</li>
              <li>• Surat</li>
              <li>• Vadodara</li>
              <li>• Rajkot</li>
              <li>• Bhavnagar</li>
            </ul>
          </div>
          <div className="bg-white/60 backdrop-blur p-6 rounded-2xl border border-black/[0.04]">
            <h4 className="font-bold text-[#1A1F36] mb-2">Rajasthan (25 Shops)</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Jaipur</li>
              <li>• Jodhpur</li>
              <li>• Udaipur</li>
              <li>• Ajmer</li>
              <li>• Bikaner</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
