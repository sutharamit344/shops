"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
} from "lucide-react";
import { BRAND } from "@/lib/config";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/shopbajar_official/",
      icon: (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
      )
    },
    {
      label: "Twitter",
      href: "#",
      icon: (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
      )
    },
  ];

  const columns = [
    {
      title: "Marketplace",
      links: [
        { label: "Browse Shops", href: "/explore" },
        { label: "Categories", href: "/explore" },
        { label: "Featured Hubs", href: "/explore" },
      ],
    },
    {
      title: "Business",
      links: [
        { label: "List Your Shop", href: "/create" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Help Center", href: "/help" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-black/[0.05] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/brand-logo-v1.png"
                alt={BRAND}
                width={32}
                height={32}
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-[18px] font-bold tracking-tight text-[#0A0A0F]">
                Shop<span className="text-[#FF6A00]">Bajar</span>
              </span>
            </Link>
            <p className="text-[14px] text-[#0A0A0F]/45 font-medium leading-relaxed max-w-sm">
              The premier digital growth platform for local businesses in Bharat. Establish 
              your digital storefront and scale your reach with direct WhatsApp connectivity.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center text-[#0A0A0F]/30 hover:text-[#FF6A00] hover:bg-[#FF6A00]/5 transition-all"
                >
                  <item.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map((column, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.2em]">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-[13px] font-semibold text-[#0A0A0F]/50 hover:text-[#FF6A00] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/[0.05] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[11px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.1em]">
              © {currentYear} {BRAND} Bharat • Local Discovery Protocol
            </p>
            <p className="text-[10px] font-medium text-[#0A0A0F]/20">
              Developed by <a href="#" className="text-[#FF6A00]/40 hover:text-[#FF6A00]">Webiest India Solutions</a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-[#0A0A0F]/25 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-[#FF6A00] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#FF6A00] transition-colors">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-black/[0.05]" />
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
              <span className="text-emerald-500/50">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
