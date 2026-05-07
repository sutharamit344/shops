"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import { BRAND } from "@/lib/config";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Custom SVG Icons for better compatibility with old lucide versions
  const InstagramIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  );

  const TwitterIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
  );

  const LinkedinIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
  );

  const FacebookIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  );

  const socialLinks = [
    { icon: InstagramIcon, href: "https://www.instagram.com/shopbajar_official/", label: "Instagram" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
    { icon: FacebookIcon, href: "#", label: "Facebook" },
  ];

  const columns = [
    {
      title: "Marketplace",
      links: [
        { label: "Browse Shops", href: "/explore" },
        { label: "Categories", href: "/explore" },
        { label: "Top Areas", href: "/explore" },
        { label: "Featured Hubs", href: "/explore" },
      ],
    },
    {
      title: "For Business",
      links: [
        { label: "List Your Shop", href: "/create" },
        { label: "Business Dashboard", href: "/dashboard" },
        { label: "Help Center", href: "/help" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-black/[0.05] pt-20 pb-10 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/brand-logo-v1.png"
                alt={BRAND}
                width={48}
                height={48}
                className="w-12 h-12 md:w-14 md:h-14 object-contain transition-all duration-300 group-hover:scale-105"
              />
              <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#1A1F36]">
                Shop<span className="text-[#FF6A00]">Bajar</span>
              </span>
            </Link>
            <p className="text-[15px] md:text-base text-[#1A1F36]/50 font-medium leading-relaxed max-w-sm">
              Empowering Bharat's local businesses with a world-class digital
              presence. Found on Google, connected via WhatsApp.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="w-10 h-10 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-[#1A1F36]/40 hover:text-[#FF6A00] hover:border-[#FF6A00]/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {columns.map((column, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-[11px] font-black text-[#1A1F36] uppercase tracking-[0.2em]">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-[14px] font-bold text-[#1A1F36]/40 hover:text-[#FF6A00] transition-colors"
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
        <div className="pt-10 border-t border-black/[0.05] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[12px] font-bold text-[#1A1F36]/30 uppercase tracking-widest">
              © {currentYear} {BRAND} Bharat • Local Marketplace Platform
            </p>
            <p className="text-[10px] font-bold text-[#1A1F36]/20 uppercase tracking-widest">
              Developed by <a href="https://webiestindiasolutions.com/" target="_blank" rel="noopener noreferrer" className="text-[#FF6A00] hover:underline">Webiest India Solutions</a>
            </p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black text-[#1A1F36]/30 uppercase tracking-[0.2em]">
            <Link href="/privacy" className="hover:text-[#FF6A00] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#FF6A00] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[#FF6A00] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
