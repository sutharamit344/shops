"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { saveShop } from "@/lib/db";
import ShopForm from "@/components/Create/ShopForm";
import Navbar from "@/components/Navbar";
import Button from "@/components/UI/Button";
import { CheckCircle2, Store, ArrowRight, ShieldCheck } from "lucide-react";
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
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32">
          <Card className="p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={40} className="text-[#25D366]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1F36] mb-4 tracking-tight">
              Application Submitted!
            </h1>
            <p className="text-[16px] text-[#1A1F36]/50 mb-10 max-w-md mx-auto font-medium leading-relaxed">
              Your business page is now under review. Our team verifies every listing to maintain quality. You'll be notified via email once approved.
            </p>
            <div className="flex items-center justify-center gap-3 py-3 px-6 bg-[#FAFAF8] rounded-xl border border-[#1A1F36]/[0.04] inline-flex mx-auto">
              <div className="w-4 h-4 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin"></div>
              <span className="text-[12px] font-bold text-[#1A1F36]/40 uppercase tracking-widest">Redirecting to Dashboard</span>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-32">
          <Card className="p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Store size={40} className="text-[#FF6B35]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1F36] mb-4 tracking-tight">
              Sign in to list your shop
            </h1>
            <p className="text-[16px] text-[#1A1F36]/50 mb-10 max-w-md mx-auto font-medium leading-relaxed">
              Please sign in with Google to create your shop profile, manage products, and get discovered by local customers.
            </p>
            <Button
              onClick={loginWithGoogle}
              variant="dark"
              size="xl"
              icon={ArrowRight}
              iconPosition="right"
              className="px-10 shadow-xl shadow-[#1A1F36]/20"
            >
              Sign In with Google
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-36 pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#FF6B35]/10 rounded-full mb-6 border border-[#FF6B35]/20">
            <ShieldCheck size={14} className="text-[#FF6B35]" />
            <span className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.15em]">Official Merchant Onboarding</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1F36] mb-4 tracking-tight leading-none">
            Create your shop page
          </h1>
          <p className="text-[17px] text-[#1A1F36]/40 max-w-lg mx-auto font-medium">
            Fill in the details below to launch your professional business profile on ShopBajar.
          </p>
        </div>

        <Card className="shadow-2xl shadow-[#1A1F36]/5 p-2 md:p-4">
          <ShopForm
            onSubmit={handleCreate}
            isLoading={loading}
            error={error}
          />
        </Card>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-[13px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">
            Need help? Check out our{' '}
            <a href="#" className="text-[#FF6B35] hover:underline">Setup Guide</a>{' '}
            or{' '}
            <a href="#" className="text-[#FF6B35] hover:underline">Support</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateShopPage;
