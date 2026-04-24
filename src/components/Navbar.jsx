"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Store, ArrowRight, Menu as MenuIcon, X,
  LayoutDashboard, Shield, LogOut
} from "lucide-react";
import { isUserAdmin } from "@/lib/db";

const Navbar = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-black/[0.06]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center shadow-sm">
          <Store size={16} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[#0F0F0F]">
          Shop<span className="text-[#FF6B35]">Setu</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#666]">
        <Link href="/explore" className="hover:text-[#0F0F0F] transition-colors">Explore</Link>
      </div>

      {/* Auth Actions */}
      <div className="ml-8 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="hidden md:block text-[13px] font-bold text-[#0F0F0F]">
                {user.displayName || "My Profile"}
              </span>{user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Profile"} className="w-8 h-8 rounded-full object-cover border border-black/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center text-[12px] font-bold">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/create"
              className="h-8 px-4 bg-[#0F0F0F] text-white text-[12px] font-semibold rounded-lg hover:bg-[#333] transition-colors flex items-center gap-1.5"
            >
              List your shop <ArrowRight size={13} />
            </Link>
          </>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#0F0F0F] p-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#FAFAF8] border-b border-black/[0.06] p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2 duration-200">
          <Link href="/explore" onClick={() => setIsMenuOpen(false)} className="text-[14px] font-medium text-[#666]">Explore</Link>
          {isAdmin && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-[14px] font-medium text-[#FF6B35]">Admin Panel</Link>}
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-[14px] font-medium text-[#666]">Pricing</Link>
          <div className="pt-4 border-t border-black/[0.06] flex flex-col gap-3">
            {!user ? (
              <button onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }} className="w-full h-10 border border-black/10 rounded-lg text-[13px] font-semibold">Sign In</button>
            ) : (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full h-10 border border-red-100 text-red-500 rounded-lg text-[13px] font-semibold">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
