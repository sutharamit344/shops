"use client";

import React from "react";
import Link from "next/link";
import { Cookie, Info, ShieldCheck, ChevronLeft, Globe, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/config";

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-[#1A1F36] tracking-tight">{title}</h2>
    </div>
    <div className="text-[15px] text-[#1A1F36]/60 leading-relaxed pl-6 ml-5 border-l border-[#1A1F36]/[0.07]">
      {children}
    </div>
  </div>
);

export default function CookiesPolicy() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Navbar />
      
      {/* Header */}
      <header className="bg-[#1A1F36] text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FF6A00] transition-colors mb-8 text-[11px] font-bold uppercase tracking-[0.2em] group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">Cookies Policy</h1>
          <p className="text-white/60 text-lg max-w-2xl font-medium leading-relaxed">
            Understanding how we use cookies to provide a better, more personalized experience on {BRAND}.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#FF6A00]">
            <span className="px-4 py-2 bg-[#FF6A00]/15 rounded-full border border-[#FF6A00]/20 backdrop-blur-md">Last Updated: April 25, 2026</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-[40px] border border-[#1A1F36]/[0.07] p-8 md:p-20 shadow-xl space-y-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAFAF8] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />

          <Section icon={Cookie} title="1. What are Cookies?">
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
            </p>
          </Section>

          <Section icon={Info} title="2. How We Use Cookies">
            <p className="mb-4">We use cookies for several reasons, including:</p>
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Essential Cookies:</span> These are necessary for the platform to function, such as keeping you logged in.</li>
              <li><span className="font-bold text-[#1A1F36]">Analytics Cookies:</span> These help us understand how visitors interact with our marketplace so we can improve the experience.</li>
              <li><span className="font-bold text-[#1A1F36]">Preference Cookies:</span> These allow us to remember your location (e.g., Gota, Ahmedabad) and other settings.</li>
            </ul>
          </Section>

          <Section icon={Settings} title="3. Managing Your Cookies">
            <p>
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" className="text-[#FF6A00] font-bold hover:underline">aboutcookies.org</a>.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="4. Privacy & Consent">
            <p>
              By continuing to use {BRAND}, you consent to our use of cookies as described in this policy. For more information on how we handle your personal data, please visit our <Link href="/privacy" className="text-[#FF6A00] font-bold hover:underline">Privacy Policy</Link>.
            </p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
