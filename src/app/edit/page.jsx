"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getShopById, updateShop } from "@/lib/db";
import ShopForm from "@/components/Create/ShopForm";
import Navbar from "@/components/Navbar";
import { CheckCircle2, AlertCircle, ArrowLeft, Store, Loader2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/UI/Button";

const EditShopPage = () => {
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
          // Ownership verification
          if (user && data.ownerId !== user.uid) {
            setError("Unauthorized: You do not own this shop.");
            return;
          }
          setInitialData(data);
        } else {
          setError("Shop not found.");
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
        setError("Failed to load shop configuration.");
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
        status: initialData.status, // Preserve existing status (approved/pending/rejected)
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      } else {
        throw new Error("Failed to update database record.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/[0.06] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <Loader2 size={32} className="text-[#FF6B35] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#0F0F0F] mb-1">Loading Editor</h1>
            <p className="text-[13px] text-[#666]">Fetching your shop details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/[0.06]">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F0F0F] mb-3">{error}</h1>
            <p className="text-[14px] text-[#666] mb-8">
              We encountered an issue while trying to load your shop settings.
            </p>
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-[#0F0F0F] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-all">
                Return to Dashboard
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/[0.06]">
            <div className="w-20 h-20 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-[#25D366]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-3 tracking-tight">
              Changes Saved!
            </h1>
            <p className="text-[14px] text-[#666] mb-6 max-w-md mx-auto">
              Your shop information has been updated successfully.
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#999]">
              <div className="w-5 h-5 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin"></div>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-32 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B35]/10 rounded-full mb-4">
            <Store size={14} className="text-[#FF6B35]" />
            <span className="text-[10px] font-semibold text-[#FF6B35] uppercase tracking-wider">Management Mode</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-2 tracking-tight">
            Edit {initialData?.name}
          </h1>
          <p className="text-[14px] text-[#666] max-w-md mx-auto">
            Update your shop details below. Changes will be reflected immediately after saving.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden p-6">
          <ShopForm
            initialData={initialData}
            onSubmit={handleUpdate}
            isLoading={saving}
            isEdit={true}
            error={error}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#999]">
            Need help? Check out our{' '}
            <a href="/guide" className="text-[#FF6B35] hover:underline font-semibold">
              management guide
            </a>{' '}
            or{' '}
            <a href="/contact" className="text-[#FF6B35] hover:underline font-semibold">
              contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default EditShopPage;
