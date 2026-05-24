"use client";

import React from "react";
import Link from "next/link";
import {
  Gavel,
  Scale,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  CircleHelp,
  Mail,
  MessageSquare,
  Shield,
  Globe,
  ShieldCheck,
  Layout,
  Lock
} from "lucide-react";

import { BRAND } from "@/lib/config";
import Footer from "@/components/Footer";
import Card from "@/components/UI/Card";
import Navbar from "@/components/Navbar";

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
        <Icon size={18} />
      </div>
      <h2 className="text-[18px] font-bold text-[#0A0A0F] tracking-tight">{title}</h2>
    </div>
    <div className="text-[14px] text-[#0A0A0F]/50 font-medium leading-relaxed pl-14">
      {children}
    </div>
  </div>
);

export default function TermsAndConditions() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Header */}
      <header className="pt-32 pb-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
            <Lock size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Legal Framework</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-6 tracking-tight leading-none">
            Terms & <span className="text-[#FF6A00]">Conditions.</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-black/[0.05] shadow-sm">
              <span className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">Effective Version</span>
              <span className="text-[11px] font-bold text-[#0A0A0F]">APR 25, 2026</span>
            </div>
            <Link href="/" className="text-[11px] font-bold text-[#0A0A0F]/40 hover:text-[#FF6A00] uppercase tracking-widest flex items-center gap-2 transition-colors">
              <ChevronLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pb-32 relative z-10">
        <Card className="p-8 md:p-16 shadow-2xl border-none space-y-20 bg-white">
          <Section icon={Scale} title="1. Agreement to Terms">
            <p className="mb-4">
              Welcome to the {BRAND} distributed business network. By accessing our platform, you agree to be bound by these Terms & Conditions. These terms constitute a legally binding agreement between you ("Verified Business" or "User") and {BRAND} regarding your participation in our digital commerce ecosystem.
            </p>
            <p>
              Non-compliance with these parameters will result in immediate disconnection from the platform services.
            </p>
          </Section>

          <Section icon={UserCheck} title="2. Business Responsibilities">
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Identity Security:</span> You are responsible for maintaining the encryption and security of your merchant credentials. All actions indexed under your ID are your legal responsibility.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Data Integrity:</span> You warrant that all information provisioned during business setup is accurate, authentic, and professionally verified.</p>
              </li>
            </ul>
          </Section>

          <Section icon={AlertTriangle} title="3. Operational Constraints">
            <p className="mb-4">You agree to operate within the following platform boundaries:</p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p>No automated crawling or unauthorized indexing of the business directory.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p>No distribution of malicious code or interference with network orchestration.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p>Strict prohibition of listing regulated or illegal assets as per local jurisdiction.</p>
              </li>
            </ul>
          </Section>

          <Section icon={Shield} title="4. Intellectual Property">
            <p>
              The {BRAND} platform architecture, design system, and proprietary algorithms are protected under international IP laws. Merchant-generated storefront content remains the property of the merchant, but {BRAND} is granted a perpetual license to index and display this data across the network.
            </p>
          </Section>

          <Section icon={CircleHelp} title="5. Limitation of Liability">
            <p>
              {BRAND} operates as a decentralized discovery hub. We are not liable for direct or indirect losses resulting from merchant-customer transactions. The service is provided "as-provisioned" without uptime guarantees.
            </p>
          </Section>

          <div className="pt-16 border-t border-black/[0.05]">
            <h2 className="text-[20px] font-bold text-[#0A0A0F] mb-8 tracking-tight">Legal Contact Desk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="mailto:legal@shopbajar.com" className="flex items-center gap-5 p-5 bg-[#F7F7F5] rounded-md border border-black/[0.05] hover:border-[#FF6A00]/30 transition-all group">
                <div className="w-10 h-10 rounded-md bg-white shadow-sm flex items-center justify-center text-[#FF6A00] group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-0.5">Legal Identity</p>
                  <p className="font-bold text-[#0A0A0F] text-[13px] truncate">legal@shopbajar.com</p>
                </div>
              </a>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
