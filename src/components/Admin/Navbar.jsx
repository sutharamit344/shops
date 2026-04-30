"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldCheck, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Store, 
  Tag, 
  History,
  Menu,
  X,
  ExternalLink
} from "lucide-react";

import Button from "@/components/UI/Button";

const AdminNavbar = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shops', label: 'Audit Queue', icon: Store },
    { id: 'categories', label: 'Taxonomy', icon: Tag },
    { id: 'activity', label: 'Audit Logs', icon: History }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[300] transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md py-2 border-b border-black/[0.06] shadow-sm" : "bg-white py-4 border-b border-black/[0.04]"
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-12">
          
          {/* Admin Identity */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20 group-hover:scale-105 transition-transform">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#0F0F0F] tracking-tight">ShopBajar <span className="text-[#FF6B35]">Admin</span></span>
                <span className="text-[9px] font-bold text-[#999] uppercase tracking-widest leading-none">Authority Control</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
               {navItems.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => onTabChange(item.id)}
                   className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                     activeTab === item.id 
                      ? "bg-[#0F0F0F] text-white shadow-lg" 
                      : "text-[#666] hover:text-[#0F0F0F] hover:bg-gray-50"
                   }`}
                 >
                   <item.icon size={14} />
                   {item.label}
                 </button>
               ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="hidden md:flex items-center gap-2 text-[#666] hover:text-[#0F0F0F] text-[11px] font-bold uppercase tracking-wider transition-colors mr-2">
              <ExternalLink size={14} /> Live Site
            </Link>

            <button 
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              <LogOut size={14} /> Exit
            </button>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#0F0F0F] transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-black/[0.06] animate-in slide-in-from-top duration-300 max-h-[calc(100vh-64px)] overflow-y-auto">
           <div className="p-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === item.id 
                      ? "bg-[#0F0F0F] text-white shadow-xl" 
                      : "text-[#666] hover:text-[#0F0F0F] hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="h-[1px] bg-black/[0.06] my-4"></div>
              <Link href="/" className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-[12px] font-bold text-[#666] uppercase tracking-wider">
                <ExternalLink size={18} /> Public View
              </Link>
           </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
