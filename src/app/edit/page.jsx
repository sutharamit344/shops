"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getShopById, updateShop } from "@/lib/db";
import ShopForm from "@/components/Create/ShopForm";
import Navbar from "@/components/Navbar";
import { CircleCheckBig, CircleAlert, ArrowLeft, Store, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

const EditShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getShopById(id);
        if (data) {
          if (user && data.ownerId !== user.uid) {
            setError("Unauthorized: Access denied for this business.");
            return;
          }
          setInitialData(data);
        } else {
          setError("Business not found.");
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
        setError("Failed to load business configuration.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchShopData();
  }, [id, user, authLoading]);

  const handleUpdate = async (finalData) => {
    setSaving(true);
    setError(null);
    try {
      const result = await updateShop(id, {
        ...finalData,
        status: initialData.status,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        throw new Error("Failed to update business parameters.");
      }
    } catch (err) {
      console.error(err);
      setError("Sync failed. Please verify network connectivity.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-[18px] font-bold text-[#0A0A0F] mb-1 tracking-tight">Initializing Business Editor</h1>
            <p className="text-[12px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em]">Fetching Configuration...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-32 text-center">
          <Card className="p-12 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CircleAlert size={32} className="text-red-500" />
            </div>
            <h1 className="text-[24px] font-bold text-[#0A0A0F] mb-3 tracking-tight">{error}</h1>
            <p className="text-[14px] text-[#0A0A0F]/45 mb-10 font-medium">
              We encountered a permission or availability issue while requesting this resource.
            </p>
            <Link href="/dashboard">
              <Button variant="dark" size="lg" icon={ArrowLeft}>Return to Dashboard</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-32 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <CircleCheckBig size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold text-[#0A0A0F] mb-4 tracking-tight">
            Business Synchronized
          </h1>
          <p className="text-[15px] text-[#0A0A0F]/45 mb-10 max-w-sm mx-auto font-medium">
            Your business configuration has been successfully updated across the distributed network.
          </p>
          <div className="inline-flex items-center gap-3 py-2 px-4 bg-white rounded-lg border border-black/[0.05] shadow-sm">
            <div className="w-3.5 h-3.5 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-bold text-[#0A0A0F]/40 uppercase tracking-widest">Re-routing Console...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-32 relative z-10">
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-4">
            <ShieldCheck size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Business Management</span>
          </div>
          <h1 className="text-[32px] md:text-[44px] font-bold text-[#0A0A0F] mb-3 tracking-tight leading-none">
            Configure {initialData?.name}
          </h1>
          <p className="text-[14px] md:text-[15px] text-[#0A0A0F]/45 max-w-md mx-auto font-medium">
            Modify your professional business parameters and update your digital storefront.
          </p>
        </div>

        <Card className="p-0 border-none shadow-2xl overflow-visible">
          <ShopForm
            initialData={initialData}
            onSubmit={handleUpdate}
            isLoading={saving}
            isEdit={true}
            error={error}
          />
        </Card>

        {/* Support Section */}
        <div className="mt-16 text-center">
           <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[#0A0A0F]/20">
                 <Sparkles size={14} />
                 <span className="text-[11px] font-bold uppercase tracking-widest">Live Updates</span>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

const EditShopPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <EditShopContent />
    </Suspense>
  );
};

export default EditShopPage;
