"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldCheck, LayoutDashboard, Store, Tag, Layers,
  History, LogOut, ArrowLeft, ExternalLink, Settings, X,
  ChevronLeft, ChevronRight, Database, FileText, MessageSquare
} from "lucide-react";

const Sidebar = ({ activeTab, onTabChange, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shops', label: 'Businesses', icon: Store },
    { id: 'blogs', label: 'Journal', icon: FileText },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'subcategories', label: 'Subcategories', icon: Layers },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'activity', label: 'Global Logs', icon: History }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 bottom-0 bg-white border-r border-[#0A0A0F]/[0.07] z-[300] flex flex-col shadow-md transition-all duration-300 lg:translate-x-0 ${
        isCollapsed ? "lg:w-24" : "lg:w-72"
      } ${
        isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
      }`}>
      <div className={`p-6 border-b border-[#0A0A0F]/[0.03] flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF6A00] rounded-lg flex items-center justify-center shadow-md shadow-[#FF6A00]/20 shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="text-[14px] font-bold text-[#0A0A0F] tracking-tight leading-none">
                Studio<span className="text-[#FF6A00]">Admin</span>
              </span>
              <span className="text-[9px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mt-1">
                Authority Suite
              </span>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button 
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#666]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 p-4 space-y-1 mt-2 overflow-y-auto no-scrollbar ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {!isCollapsed && (
          <p className="px-4 mb-2 text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em] animate-in fade-in">
            Management
          </p>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              if (onClose) onClose();
            }}
            className={`flex items-center rounded-lg transition-all duration-200 group ${
              isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"
            } ${
              activeTab === item.id 
                ? "bg-[#0A0A0F] text-white shadow-md shadow-[#0A0A0F]/10" 
                : "text-[#0A0A0F]/75 hover:bg-[#FAFAF8] hover:text-[#0A0A0F]"
            }`}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon 
              size={18} 
              className={activeTab === item.id ? "text-white" : "text-[#ccc] group-hover:text-[#666] transition-colors"} 
            />
            {!isCollapsed && (
              <span className="text-[13px] font-semibold tracking-tight animate-in fade-in">
                {item.label}
              </span>
            )}
            {activeTab === item.id && !isCollapsed && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
            )}
          </button>
        ))}

        <div className={`pt-6 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
          {!isCollapsed && (
            <p className="px-4 mb-2 text-[10px] font-bold text-[#0A0A0F]/20 uppercase tracking-[0.2em] animate-in fade-in">
              System
            </p>
          )}
          <Link 
            href="/"
            className={`flex items-center rounded-lg transition-all ${
              isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"
            } text-[#0A0A0F]/75 hover:bg-[#FAFAF8] hover:text-[#0A0A0F]`}
            title={isCollapsed ? "Public Site" : ""}
          >
            <ExternalLink size={18} className="text-[#ccc]" />
            {!isCollapsed && (
              <span className="text-[13px] font-semibold tracking-tight animate-in fade-in">Public Site</span>
            )}
          </Link>
          <button 
            className={`flex items-center rounded-lg transition-all ${
              isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"
            } text-[#0A0A0F]/75 hover:bg-[#FAFAF8] hover:text-[#0A0A0F]`}
            title={isCollapsed ? "Settings" : ""}
          >
            <Settings size={18} className="text-[#ccc]" />
            {!isCollapsed && (
              <span className="text-[13px] font-semibold tracking-tight animate-in fade-in">Settings</span>
            )}
          </button>
        </div>
      </nav>

      {/* Collapse Toggle Button (Desktop Only) */}
      <div className="hidden lg:block absolute -right-5 top-20 z-[400]">
        <button 
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-full bg-white border border-[#0A0A0F]/[0.07] flex items-center justify-center text-[#0A0A0F]/75 hover:bg-[#0A0A0F] hover:text-white transition-all shadow-md group active:scale-90"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Footer / User Profile */}
      <div className={`p-4 border-t border-[#0A0A0F]/[0.03] ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <button 
          onClick={logout}
          className={`flex items-center rounded-lg text-red-500 hover:bg-red-50 transition-all group ${
            isCollapsed ? "w-12 h-12 justify-center" : "w-full px-4 py-3 gap-3"
          }`}
          title={isCollapsed ? "Exit Suite" : ""}
        >
          <LogOut size={18} className="text-red-400 group-hover:text-red-500" />
          {!isCollapsed && (
            <span className="text-[13px] font-semibold tracking-tight animate-in fade-in">Exit Suite</span>
          )}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

