import React from "react";

export default function ThemeReferencePage() {
  return (
    <div className="bg-[#FAFAF8] text-[#1A1F36] min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        .token-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        @keyframes theme-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse-green { 0%,100%{background-color:rgba(37,211,102,0.1)} 70%{background-color:rgba(37,211,102,0.3)} }
        .animate-theme-float { animation: theme-float 3s ease-in-out infinite; }
        .animate-wa { animation: pulse-green 2s infinite; }
        .skeleton { background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e6 50%, #f0f0ee 75%); background-size: 200% 100%; animation: theme-shimmer 1.5s infinite; }
        @keyframes theme-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .ref-section { border-top: 2px solid #FF6B35; padding-top: 10px; margin-bottom: 28px; }
        .ref-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #FF6B35; }
        .ref-title { font-size: 22px; font-weight: 800; color: #1A1F36; margin-top: 2px; letter-spacing: -0.02em; }
        .ref-code { font-family: 'JetBrains Mono', monospace; background: #1A1F36; color: #FF6B35; font-size: 11px; padding: 2px 8px; border-radius: 6px; display: inline-block; }
      `}} />

      {/* HEADER */}
      <div className="bg-[#1A1F36] text-white px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Shop<span className="text-[#FF6B35]">Setu</span></span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-2">UI Theme Reference</h1>
          <p className="text-white/50 text-sm font-medium max-w-xl">
            This is the single source of truth for ShopBajar's visual design. Every color, component, spacing rule, and pattern used in the product lives on this page.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Tailwind CSS", "Next.js App Router", "Plus Jakarta Sans", "Mobile-first"].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold">{tag}</span>
            ))}
            <span className="px-3 py-1.5 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold">v1.0</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-20">
        {/* 1. COLOR PALETTE */}
        <section>
          <div className="ref-section">
            <p className="ref-label">01</p>
            <h2 className="ref-title">Color Palette</h2>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-[#1A1F36]/40 uppercase tracking-widest mb-3">Primary — Brand Orange</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { hex: "#FF6B35", label: "primary" },
                { hex: "#E85C25", label: "hover" },
                { hex: "rgba(255,107,53,0.1)", label: "tint bg", isTransparent: true },
                { hex: "rgba(255,107,53,0.2)", label: "badge bg", isTransparent: true }
              ].map(color => (
                <div key={color.label} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl shadow-md" style={{ background: color.hex, border: color.isTransparent ? '1px solid rgba(255,107,53,0.2)' : 'none' }}></div>
                  <span className="ref-code">{color.hex.includes('rgba') ? color.label : color.hex}</span>
                  <span className="text-[10px] text-[#1A1F36]/40 font-medium">{color.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-[#1A1F36]/40 uppercase tracking-widest mb-3">Dark — Navy</p>
            <div className="flex gap-4 flex-wrap">
              {[
                { hex: "#1A1F36", label: "navy" },
                { hex: "rgba(26,31,54,0.6)", label: "secondary text" },
                { hex: "rgba(26,31,54,0.1)", label: "border" },
                { hex: "rgba(26,31,54,0.06)", label: "card border" }
              ].map(color => (
                <div key={color.label} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl shadow-md" style={{ background: color.hex, border: '1px solid rgba(26,31,54,0.1)' }}></div>
                  <span className="ref-code">{color.hex.includes('rgba') ? color.label : color.hex}</span>
                  <span className="text-[10px] text-[#1A1F36]/40 font-medium">{color.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. TYPOGRAPHY */}
        <section>
          <div className="ref-section">
            <p className="ref-label">02</p>
            <h2 className="ref-title">Typography</h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.07] overflow-hidden">
            <div className="p-6 border-b border-[#1A1F36]/[0.06]">
              <span className="ref-code mb-3 block">Display — Hero only</span>
              <p className="text-[56px] font-extrabold text-[#1A1F36] leading-none tracking-[-0.03em]">Take Your Shop Online</p>
            </div>
            <div className="p-6 border-b border-[#1A1F36]/[0.06]">
              <span className="ref-code mb-3 block">H1 — Page headings</span>
              <h1 className="text-4xl font-bold text-[#1A1F36] tracking-tight">Create Your Shop Page</h1>
            </div>
            <div className="p-6 border-b border-[#1A1F36]/[0.06]">
              <span className="ref-code mb-3 block">Body — Descriptions</span>
              <p className="text-[15px] text-[#1A1F36]/60 leading-relaxed max-w-lg">Trusted kirana store serving Maninagar for over 20 years. Fresh groceries and home delivery available daily.</p>
            </div>
            <div className="p-6">
              <span className="ref-code mb-3 block">Price — Mono + Orange</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#FF6B35] font-mono">₹380</span>
                <span className="text-sm text-[#1A1F36]/40 font-mono line-through">₹450</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BUTTONS */}
        <section>
          <div className="ref-section">
            <p className="ref-label">03</p>
            <h2 className="ref-title">Buttons</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#1A1F36]/[0.07] p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <button className="inline-flex items-center gap-2 h-10 px-5 bg-[#FF6B35] text-white text-[13px] font-semibold rounded-xl transition-all active:scale-95">Primary Button</button>
              <button className="inline-flex items-center gap-2 h-10 px-5 border-2 border-[#FF6B35] text-[#FF6B35] text-[13px] font-semibold rounded-xl hover:bg-[#FF6B35] hover:text-white transition-all active:scale-95">Outline</button>
              <button className="inline-flex items-center gap-2 h-10 px-5 bg-[#25D366] text-white text-[13px] font-semibold rounded-xl transition-all active:scale-95">WhatsApp</button>
              <button className="inline-flex items-center gap-2 h-10 px-5 bg-[#1A1F36] text-white text-[13px] font-semibold rounded-xl transition-all active:scale-95">Dark Button</button>
            </div>
          </div>
        </section>

        {/* 4. CARDS */}
        <section>
          <div className="ref-section">
            <p className="ref-label">04</p>
            <h2 className="ref-title">Cards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group block bg-white rounded-2xl border border-[#1A1F36]/[0.07] hover:border-[#FF6B35]/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-[#FF6B35] to-transparent opacity-60"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1F36] text-white flex items-center justify-center font-bold text-xl">S</div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">Kirana</span>
                </div>
                <h3 className="font-bold text-[#1A1F36] text-[17px] mb-1">Sharma Kirana Store</h3>
                <p className="text-[13px] text-[#1A1F36]/50 line-clamp-2">Premium groceries delivered to your doorstep in 30 minutes.</p>
              </div>
            </div>
            
            <div className="p-6 bg-[#1A1F36] rounded-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-4">Live Performance</p>
              <p className="text-5xl font-bold">124 <span className="text-[#25D366] text-2xl">↑</span></p>
              <p className="text-white/50 text-[13px] mt-1">WhatsApp leads this month</p>
            </div>
          </div>
        </section>

        {/* AI RULES */}
        <section className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-2xl p-8">
          <p className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-widest mb-6">AI Agent Guidelines</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3 text-[14px] font-medium text-[#1A1F36]/70">
              <p>✅ Use <span className="text-[#FF6B35] font-bold">#FF6B35</span> for all primary actions</p>
              <p>✅ Use <span className="text-[#1A1F36] font-bold">#1A1F36</span> for all headings</p>
              <p>✅ Use <span className="text-[#25D366] font-bold">#25D366</span> for WhatsApp ONLY</p>
              <p>✅ Always use <span className="font-bold">rounded-xl (12px)</span> for buttons</p>
            </div>
            <div className="space-y-3 text-[14px] font-medium text-[#1A1F36]/70">
              <p>❌ Never use pure black (#000000)</p>
              <p>❌ Never use red for primary buttons</p>
              <p>❌ Never use font-size below 10px</p>
              <p>❌ Never use border-radius below 8px</p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="py-10 border-t border-[#1A1F36]/[0.06] text-center">
        <p className="text-[12px] text-[#1A1F36]/30 font-medium">ShopBajar UI Reference Guide · 2026</p>
      </footer>
    </div>
  );
}
