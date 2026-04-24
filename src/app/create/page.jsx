"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { saveShop } from "@/lib/db";
import ShopForm from "@/components/Create/ShopForm";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import { CheckCircle2, Store, ArrowRight } from "lucide-react";

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
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/[0.06]">
            <div className="w-20 h-20 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-[#25D366]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-3 tracking-tight">
              Shop Submitted!
            </h1>
            <p className="text-[14px] text-[#666] mb-6 max-w-md mx-auto">
              Your page is now under review by our team. We'll notify you once it's approved.
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-black/[0.06]">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store size={40} className="text-[#FF6B35]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-3 tracking-tight">
              Sign in to continue
            </h1>
            <p className="text-[14px] text-[#666] mb-8 max-w-md mx-auto">
              Please sign in with Google to create your shop page and get discovered online.
            </p>
            <button
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F0F0F] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-all"
            >
              Sign In with Google <ArrowRight size={16} />
            </button>
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
            <span className="text-[10px] font-semibold text-[#FF6B35] uppercase tracking-wider">Get Started</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-2 tracking-tight">
            Create your shop page
          </h1>
          <p className="text-[14px] text-[#666] max-w-md mx-auto">
            Fill in the details below to create your professional shop page and start getting discovered online.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden p-6">
          <ShopForm
            onSubmit={handleCreate}
            isLoading={loading}
            error={error}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#999]">
            Need help? Check out our{' '}
            <a href="/guide" className="text-[#FF6B35] hover:underline font-semibold">
              setup guide
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

export default CreateShopPage;