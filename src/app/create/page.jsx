"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { saveShop } from "@/lib/db";
import ShopForm from "@/components/Create/ShopForm";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import { CircleCheckBig, Store, ArrowRight, ShieldCheck, Rocket, Layout, Sparkles } from "lucide-react";
import Card from "@/components/UI/Card";

const CreateShopPage = () => {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (finalData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveShop({
        ...finalData,
        ownerId: user.uid,
        ownerEmail: user.email,
        status: "pending",
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        throw new Error("Failed to save shop to database.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-32 text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <CircleCheckBig size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-[#0A0A0F] mb-4 tracking-tight">
            Onboarding Initiated
          </h1>
          <p className="text-[15px] text-[#0A0A0F]/45 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
            Your business profile is now in the verification queue. Our engineering team 
            will review your business profile within 24 hours.
          </p>
          <div className="inline-flex items-center gap-3 py-2 px-4 bg-white rounded-lg border border-black/[0.05] shadow-sm">
            <div className="w-3.5 h-3.5 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-bold text-[#0A0A0F]/40 uppercase tracking-widest">Deploying Dashboard...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10">
        <Navbar />
        <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
        <main className="max-w-xl mx-auto px-4 py-32 text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-[#FF6A00]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Rocket size={32} className="text-[#FF6A00]" />
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-[#0A0A0F] mb-4 tracking-tight">
            Authenticate to begin
          </h1>
          <p className="text-[15px] text-[#0A0A0F]/45 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
            Access the merchant deployment suite. Authenticate with your enterprise 
            identity to provision your digital storefront.
          </p>
          <Button
            onClick={loginWithGoogle}
            variant="dark"
            size="xl"
            icon={ArrowRight}
            className="px-10 h-12"
          >
            Sign In with Google
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-32 relative z-10">
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-4">
            <ShieldCheck size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Merchant Provisioning</span>
          </div>
          <h1 className="text-[32px] md:text-[44px] font-bold text-[#0A0A0F] mb-3 tracking-tight leading-none">
            Deploy your business profile
          </h1>
          <p className="text-[14px] md:text-[15px] text-[#0A0A0F]/45 max-w-md mx-auto font-medium">
            Configure your professional business presence on the distributed ShopBajar network.
          </p>
        </div>

        <Card className="p-0 border-none shadow-2xl overflow-visible">
          <ShopForm
            onSubmit={handleCreate}
            isLoading={loading}
            error={error}
          />
        </Card>

        {/* Support Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 text-[#0A0A0F]/20">
                <Layout size={14} />
                <span className="text-[11px] font-bold uppercase tracking-widest">SaaS Architecture</span>
             </div>
             <div className="flex items-center gap-2 text-[#0A0A0F]/20">
                <Sparkles size={14} />
                <span className="text-[11px] font-bold uppercase tracking-widest">AI Assisted</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateShopPage;
