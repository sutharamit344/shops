"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  ChevronLeft,
  Globe,
  Mail,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Search,
  Database
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

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Header */}
      <header className="pt-32 pb-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
            <Shield size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Data Governance</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-6 tracking-tight leading-none">
            Privacy <span className="text-[#FF6A00]">Policy.</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-black/[0.05] shadow-sm">
              <span className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">Last Modified</span>
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
          <Section icon={ShieldCheck} title="1. Identity Governance">
            <p className="mb-4">
              {BRAND} operates as a distributed commerce network. Your data privacy is the foundational layer of our platform architecture. We are committed to absolute transparency regarding how your professional business identity is indexed and displayed.
            </p>
            <p>
              This policy outlines the protocols for data collection, retention, and encryption within the {BRAND} ecosystem.
            </p>
          </Section>

          <Section icon={Database} title="2. Information Indexing">
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-[12px] font-bold text-[#0A0A0F] uppercase tracking-wider">A. Professional Identity</h3>
                <p>We collect essential merchant credentials (name, email, phone) required for business authorization and verification.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[12px] font-bold text-[#0A0A0F] uppercase tracking-wider">B. Business Configuration</h3>
                <p>Information regarding your storefront (category, geolocation, operational hours) is provisioned for public indexing to facilitate discovery across the network.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[12px] font-bold text-[#0A0A0F] uppercase tracking-wider">C. Telemetry Data</h3>
                <p>System-level logs, including IP addresses and interaction patterns, are captured to optimize network routing and prevent unauthorized access.</p>
              </div>
            </div>
          </Section>

          <Section icon={Eye} title="3. Data Utilization">
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Discovery Optimization:</span> Your business profiles are indexed to ensure maximum visibility on search engines and internal maps.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Communication Routing:</span> Real-time lead notifications are transmitted via secure WhatsApp/Email gateways.</p>
              </li>
            </ul>
          </Section>

          <Section icon={Lock} title="4. Encryption & Security">
            <p>
              All merchant data is stored in high-availability, encrypted databases. We utilize industry-standard TLS protocols for data in transit. While we implement rigorous security matrices, absolute security in a distributed network cannot be guaranteed.
            </p>
          </Section>

          <Section icon={Search} title="5. Business Control Rights">
            <p className="mb-4">You maintain full sovereignty over your indexed data:</p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Real-time Updates:</span> Modify your storefront parameters instantly via the merchant dashboard.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Business Decommissioning:</span> Request full data wipe and business deletion by contacting the support desk.</p>
              </li>
            </ul>
          </Section>

          <div className="pt-16 border-t border-black/[0.05]">
            <h2 className="text-[20px] font-bold text-[#0A0A0F] mb-8 tracking-tight">Support Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="mailto:support@shopbajar.com" className="flex items-center gap-5 p-5 bg-[#F7F7F5] rounded-md border border-black/[0.05] hover:border-[#FF6A00]/30 transition-all group">
                <div className="w-10 h-10 rounded-md bg-white shadow-sm flex items-center justify-center text-[#FF6A00] group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-0.5">Primary Support</p>
                  <p className="font-bold text-[#0A0A0F] text-[13px] truncate">support@shopbajar.com</p>
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
