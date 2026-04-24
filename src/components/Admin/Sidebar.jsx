"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, LayoutDashboard, Store, Tag, 
  History, LogOut, ArrowLeft, ExternalLink, Settings
} from "lucide-react";

const Sidebar = ({ activeTab, onTabChange }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shops', label: 'Businesses', icon: Store },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'activity', label: 'Global Logs', icon: History }
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-black/[0.06] z-[100] hidden lg:flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)]">
      {/* Header / Identity */}
      <div className="p-6 border-b border-black/[0.03]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#0F0F0F] tracking-tight leading-none">
              Studio<span className="text-[#FF6B35]">Admin</span>
            </span>
            <span className="text-[9px] font-bold text-[#999] uppercase tracking-widest mt-1">
              Authority Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 mt-2">
        <p className="px-4 mb-2 text-[10px] font-bold text-[#bbb] uppercase tracking-[0.2em]">
          Management
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? "bg-[#FF6B35]/5 text-[#FF6B35]" 
                : "text-[#666] hover:bg-[#F5F5F3] hover:text-[#0F0F0F]"
            }`}
          >
            <item.icon 
              size={18} 
              className={activeTab === item.id ? "text-[#FF6B35]" : "text-[#ccc] group-hover:text-[#666] transition-colors"} 
            />
            <span className="text-[13px] font-semibold tracking-tight">
              {item.label}
            </span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            )}
          </button>
        ))}

        <div className="pt-6">
          <p className="px-4 mb-2 text-[10px] font-bold text-[#bbb] uppercase tracking-[0.2em]">
            System
          </p>
          <Link 
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#666] hover:bg-[#F5F5F3] hover:text-[#0F0F0F] transition-all"
          >
            <ExternalLink size={18} className="text-[#ccc]" />
            <span className="text-[13px] font-semibold tracking-tight">Public Site</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#666] hover:bg-[#F5F5F3] hover:text-[#0F0F0F] transition-all">
            <Settings size={18} className="text-[#ccc]" />
            <span className="text-[13px] font-semibold tracking-tight">Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-black/[0.03]">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={18} className="text-red-400 group-hover:text-red-500" />
          <span className="text-[13px] font-semibold tracking-tight">Exit Suite</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
