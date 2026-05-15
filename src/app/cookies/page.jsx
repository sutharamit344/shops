"use client";

import React from "react";
import Link from "next/link";
import { Cookie, Info, ShieldCheck, ChevronLeft, Globe, Settings, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/UI/Card";
import { BRAND } from "@/lib/config";

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/5 border border-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
        <Icon size={18} />
      </div>
      <h2 className="text-[18px] font-bold text-[#0A0A0F] tracking-tight">{title}</h2>
    </div>
    <div className="text-[14px] text-[#0A0A0F]/50 font-medium leading-relaxed pl-14">
      {children}
    </div>
  </div>
);

export default function CookiesPolicy() {
  return (
    <div className="bg-[#F7F7F5] min-h-screen selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />
      
      {/* Header */}
      <header className="pt-32 pb-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
            <Cookie size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Cookie Protocol</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-6 tracking-tight leading-none">
            Cookie <span className="text-[#FF6A00]">Policy.</span>
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-black/[0.05] shadow-sm">
               <span className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest">Version Alpha</span>
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
          <Section icon={Info} title="1. Identity Framework">
            <p>
              Cookies are minor indexing packets transferred to your hardware node. They are utilized to optimize network orchestration and remember your specific terminal configurations.
            </p>
          </Section>

          <Section icon={Settings} title="2. Utilization Metrics">
            <p className="mb-4">We deploy cookies for several critical operations:</p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Core Authentication:</span> Persistent session management to ensure your merchant console remains accessible.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Network Analytics:</span> Aggregated telemetry to understand node interaction patterns and discoverability.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] mt-2 shrink-0" />
                <p><span className="font-bold text-[#0A0A0F]">Regional Cache:</span> Remembering your geographic hub (e.g. Ahmedabad) to provide low-latency regional discovery.</p>
              </li>
            </ul>
          </Section>

          <Section icon={Lock} title="3. Terminal Management">
            <p>
              Participants can manage cookie preferences via terminal/browser settings. Disabling these packets may result in suboptimal network performance or session termination.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="4. Privacy Synchronicity">
            <p>
              By continuing to interface with the {BRAND} network, you acknowledge our cookie deployment protocols. For deep-packet inspection of our data practices, refer to the <Link href="/privacy" className="text-[#FF6A00] font-bold hover:underline">Privacy Governance</Link>.
            </p>
          </Section>

        </Card>
      </main>

      <Footer />
    </div>
  );
}
