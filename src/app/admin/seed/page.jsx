"use client";

import React, { useState } from "react";
import Button from "@/components/UI/Button";
import { Loader2, Check, Zap, ShieldCheck, Trash2, Database, Rocket, FileText } from "lucide-react";
import { seedQuickTest, clearAllData } from "@/lib/seedQuickTest";
import { seedTestShops } from "@/lib/seedShops";
import { seedBlogs } from "@/lib/seedBlogs";

export default function SeederPage() {
  const [status, setStatus] = useState("idle"); // idle, clearing, seeding, finished
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  const handleAction = async (action) => {
    setError(null);
    try {
      if (action === "clear") {
        setStatus("clearing");
        await clearAllData();
        setStatus("finished");
        return;
      }

      if (action === "quick") {
        setStatus("seeding_quick");
        await seedQuickTest((current, total) => {
          setProgress({ current, total });
        });
        setStatus("finished");
        return;
      }

      if (action === "full") {
        setStatus("seeding_full");
        await seedTestShops(200, (current, total) => {
          setProgress({ current, total });
        });
        setStatus("finished");
        return;
      }
      
      if (action === "blogs") {
        setStatus("seeding_blogs");
        await seedBlogs((current, total) => {
          setProgress({ current, total });
        });
        setStatus("finished");
        return;
      }
    } catch (err) {
      console.error("Action failed", err);
      setError(err.message);
      setStatus("idle");
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "clearing": return "Wiping database...";
      case "seeding_quick": return "Generating Gota Test Data...";
      case "seeding_full": return "Populating Marketplace...";
      case "seeding_blogs": return "Writing Journal Articles...";
      case "finished": return "Platform Ready!";
      default: return "Ready to Seed";
    }
  };

  const getPercentage = () => {
    if (progress.total === 0) return 0;
    return (progress.current / progress.total) * 100;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-[#1A1F36]/5 border border-[#1A1F36]/[0.02]">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[28px] bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00] mb-8">
            {status === "clearing" ? <Trash2 className="animate-pulse" size={40} /> : 
             status === "finished" ? <Check size={40} /> : <Database size={40} />}
          </div>
          
          <h1 className="text-3xl font-black text-[#1A1F36] mb-4 tracking-tight">Platform Data Engine</h1>
          <p className="text-[#1A1F36]/50 font-medium mb-10 text-[15px] leading-relaxed max-w-sm">
            Quickly populate or reset your marketplace data for testing location-based discovery and filters.
          </p>

          {status === "idle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <button
                onClick={() => handleAction("quick")}
                className="group flex flex-col items-center gap-4 p-6 bg-[#FAFAF8] hover:bg-[#FF6A00] hover:text-white rounded-[32px] border border-black/[0.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#FF6A00] group-hover:scale-110 transition-transform">
                  <Rocket size={24} />
                </div>
                <div className="text-left w-full">
                  <h3 className="font-bold text-[15px]">Quick Test</h3>
                  <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider mt-1">Gota, Ahmedabad Focus</p>
                </div>
              </button>

              <button
                onClick={() => handleAction("full")}
                className="group flex flex-col items-center gap-4 p-6 bg-[#FAFAF8] hover:bg-[#1A1F36] hover:text-white rounded-[32px] border border-black/[0.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1A1F36] group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <div className="text-left w-full">
                  <h3 className="font-bold text-[15px]">Distributed Seed</h3>
                  <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider mt-1">200 Shops Across States</p>
                </div>
              </button>
              <button
                onClick={() => handleAction("blogs")}
                className="group flex flex-col items-center gap-4 p-6 bg-[#FAFAF8] hover:bg-emerald-600 hover:text-white rounded-[32px] border border-black/[0.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <div className="text-left w-full">
                  <h3 className="font-bold text-[15px]">Seed Journal</h3>
                  <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider mt-1">4 Premium Articles</p>
                </div>
              </button>
              <button
                onClick={() => handleAction("clear")}
                className="md:col-span-2 group flex items-center gap-4 p-5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-[24px] transition-all duration-300"
              >
                <Trash2 size={20} />
                <span className="font-bold text-sm">Wipe All Marketplace Data</span>
              </button>
            </div>
          )}

          {(status.startsWith("seeding") || status === "clearing") && (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between font-bold text-sm mb-1">
                <span className="text-[#FF6A00]">{getStatusText()}</span>
                <span className="text-[#1A1F36]/40">{status === "clearing" ? "Wait..." : `${progress.current} / ${progress.total}`}</span>
              </div>
              <div className="h-4 w-full bg-[#FAFAF8] rounded-full overflow-hidden border border-[#1A1F36]/[0.04]">
                <div 
                  className="h-full bg-[#FF6A00] transition-all duration-300"
                  style={{ width: status === "clearing" ? "100%" : `${getPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {status === "finished" && (
            <div className="w-full space-y-6 animate-in zoom-in duration-500">
              <div className="p-6 bg-emerald-50 text-emerald-600 rounded-[32px] flex flex-col items-center gap-3 font-bold">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={20} />
                </div>
                <span>Data Processed Successfully!</span>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={() => window.location.href = '/explore'}>
                  Explore Marketplace
                </Button>
                <button onClick={() => setStatus("idle")} className="text-[13px] font-bold text-[#1A1F36]/40 hover:text-[#1A1F36]">
                  Back to Tools
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold w-full">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
