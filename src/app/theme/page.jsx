import React from "react";
import {
   Zap,
   ShieldCheck,
   Layout,
   Type,
   MousePointer2,
   Layers,
   Palette,
   Smartphone,
   Monitor,
   Store,
   MessageSquare,
   Sparkles,
   Search,
   ChevronRight
} from "lucide-react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";

export default function ThemeReferencePage() {
   return (
      <div className="bg-[#F7F7F5] text-[#0A0A0F] min-h-screen selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
         <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

         <style dangerouslySetInnerHTML={{
            __html: `
        .ref-section { border-top: 1px solid rgba(0,0,0,0.05); padding-top: 24px; margin-bottom: 40px; }
        .ref-label { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6A00; margin-bottom: 8px; display: block; }
        .ref-title { font-size: 24px; font-weight: 800; color: #0A0A0F; tracking: -0.02em; }
        .ref-code { font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.03); color: #0A0A0F; font-size: 11px; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05); }
      `}} />

         {/* HEADER */}
         <header className="relative pt-32 pb-16 px-6 overflow-hidden">
            <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-8 animate-in fade-in duration-700">
                  <Sparkles size={12} className="text-[#FF6A00]" />
                  <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Enterprise Design Protocol</span>
               </div>
               <h1 className="text-[48px] md:text-[64px] font-bold tracking-tighter leading-none mb-6">
                  Visual <span className="text-[#FF6A00]">Identity.</span>
               </h1>
               <p className="text-[15px] font-medium text-[#0A0A0F]/40 max-w-2xl leading-relaxed mb-10">
                  The ShopBajar SaaS design system is engineered for high-performance commerce.
                  A monochrome-first aesthetic with precision-balanced contrast and enterprise-grade information density.
               </p>
               <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-black/[0.05] shadow-sm">
                     <span className="text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-widest">Protocol</span>
                     <span className="text-[11px] font-bold text-[#0A0A0F]">CLOUD-AI-v1</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-black/[0.05] shadow-sm">
                     <span className="text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-widest">Release</span>
                     <span className="text-[11px] font-bold text-[#0A0A0F]">MAY 2026</span>
                  </div>
               </div>
            </div>
         </header>

         <main className="max-w-5xl mx-auto px-6 py-12 space-y-24 pb-32">

            {/* 1. COLOR SPECTRUM */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="ref-section">
                  <span className="ref-label">Section 01</span>
                  <h2 className="ref-title">Color Spectrum</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.15em]">Primary Accent</h3>
                     <div className="grid grid-cols-3 gap-4">
                        {[
                           { hex: "#FF6A00", label: "Accent Core" },
                           { hex: "#FF6A0010", label: "Alpha Tint", isTransparent: true },
                           { hex: "#FF6A0020", label: "Border Soft", isTransparent: true },
                        ].map(c => (
                           <div key={c.label} className="space-y-2">
                              <div className="aspect-square rounded-md shadow-sm border border-black/[0.05]" style={{ background: c.hex }} />
                              <p className="text-[10px] font-bold text-[#0A0A0F] tracking-tight">{c.label}</p>
                              <p className="text-[9px] font-medium text-[#0A0A0F]/30 uppercase tracking-widest">{c.hex}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.15em]">Base Neutrals</h3>
                     <div className="grid grid-cols-3 gap-4">
                        {[
                           { hex: "#0A0A0F", label: "Deep Zinc" },
                           { hex: "#F7F7F5", label: "Ghost Shell" },
                           { hex: "#FFFFFF", label: "Absolute White" },
                        ].map(c => (
                           <div key={c.label} className="space-y-2">
                              <div className="aspect-square rounded-md shadow-sm border border-black/[0.05]" style={{ background: c.hex }} />
                              <p className="text-[10px] font-bold text-[#0A0A0F] tracking-tight">{c.label}</p>
                              <p className="text-[9px] font-medium text-[#0A0A0F]/30 uppercase tracking-widest">{c.hex}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* 2. TYPOGRAPHIC HIERARCHY */}
            <section>
               <div className="ref-section">
                  <span className="ref-label">Section 02</span>
                  <h2 className="ref-title">Typographic Hierarchy</h2>
               </div>
               <Card className="p-0 overflow-hidden bg-white border-black/[0.05] shadow-2xl">
                  <div className="p-10 border-b border-black/[0.03]">
                     <span className="ref-code mb-4 block w-fit">Hero Display</span>
                     <h1 className="text-[56px] font-bold text-[#0A0A0F] tracking-tighter leading-none">The digital network for commerce.</h1>
                  </div>
                  <div className="p-10 border-b border-black/[0.03]">
                     <span className="ref-code mb-4 block w-fit">Heading 01</span>
                     <h2 className="text-[32px] font-bold text-[#0A0A0F] tracking-tight">Scale your shop globally.</h2>
                  </div>
                  <div className="p-10 border-b border-black/[0.03]">
                     <span className="ref-code mb-4 block w-fit">Interface Body</span>
                     <p className="text-[15px] font-medium text-[#0A0A0F]/50 leading-relaxed max-w-xl">
                        Provision businesses and manage merchant configurations via the central command console.
                        Zero-latency discovery and real-time network orchestration.
                     </p>
                  </div>
                  <div className="p-10">
                     <span className="ref-code mb-4 block w-fit">Metadata / Labels</span>
                     <div className="flex gap-8">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Security Protocol</p>
                           <p className="text-[11px] font-bold text-[#0A0A0F]">ENCRYPTED-BUSINESS-V4</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em]">Network Status</p>
                           <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              SYNCHRONIZED
                           </p>
                        </div>
                     </div>
                  </div>
               </Card>
            </section>

            {/* 3. INTERFACE COMPONENTS */}
            <section>
               <div className="ref-section">
                  <span className="ref-label">Section 03</span>
                  <h2 className="ref-title">Interface Components</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.15em]">Control Units</h3>
                     <div className="p-8 bg-white rounded-md border border-black/[0.05] shadow-sm flex flex-wrap gap-4">
                        <Button variant="dark" size="md">Primary Action</Button>
                        <Button variant="outline" size="md">Secondary Unit</Button>
                        <Button variant="ghost" size="md" icon={ChevronRight}>Ghost Link</Button>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.15em]">Data Containers</h3>
                     <div className="p-8 bg-white rounded-md border border-black/[0.05] shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-md bg-[#0A0A0F] flex items-center justify-center shadow-lg">
                              <Store size={20} className="text-white" />
                           </div>
                           <div className="flex-1">
                              <p className="text-[14px] font-bold text-[#0A0A0F] tracking-tight">Verified Business</p>
                              <p className="text-[11px] font-medium text-[#0A0A0F]/40 uppercase tracking-widest">ID: SH-9042-X</p>
                           </div>
                           <div className="w-6 h-6 rounded-md bg-[#FF6A00]/5 flex items-center justify-center text-[#FF6A00]">
                              <ShieldCheck size={12} />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 4. DESIGN GOVERNANCE */}
            <section className="bg-[#0A0A0F] rounded-md p-12 text-white relative overflow-hidden">
               <div className="absolute inset-0 dot-grid opacity-[0.15] pointer-events-none" />
               <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#FF6A00]/10 rounded-full blur-[120px] pointer-events-none" />

               <div className="relative z-10 grid md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                     <div className="w-10 h-10 rounded-md bg-[#FF6A00] flex items-center justify-center shadow-lg">
                        <Zap size={20} className="text-white" />
                     </div>
                     <h2 className="text-[28px] font-bold tracking-tight">The Cloud AI <br />Design Language.</h2>
                     <p className="text-white/40 text-[14px] font-medium leading-relaxed">
                        Every interface element must communicate speed, intelligence, and reliability.
                        We prioritize compact spacing over empty padding to maximize information throughput.
                     </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                     {[
                        { icon: Layout, t: "Compact Spacing", d: "Avoid large empty voids. Use tight but breathable layouts (gap-4, p-6)." },
                        { icon: Monitor, t: "High Density", d: "Prioritize data visibility. Use small font sizes for metadata (text-[10px])." },
                        { icon: ShieldCheck, t: "Enterprise Trust", d: "Neutral zinc/black backgrounds with subtle glass-morphism borders." },
                     ].map((rule, i) => (
                        <div key={i} className="flex gap-4 p-5 rounded-md bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors group">
                           <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[#FF6A00] transition-colors">
                              <rule.icon size={18} />
                           </div>
                           <div>
                              <h4 className="text-[13px] font-bold text-white mb-1">{rule.t}</h4>
                              <p className="text-[11px] text-white/30 font-medium leading-tight">{rule.d}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

         </main>

         <footer className="py-20 border-t border-black/[0.03] text-center">
            <p className="text-[11px] font-bold text-[#0A0A0F]/15 uppercase tracking-[0.4em]">ShopBajar Engineering Hub · Identity Protocols</p>
         </footer>
      </div>
   );
}
