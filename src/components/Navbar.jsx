"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { loginWithGoogle, logout } from "@/redux/thunks/authThunks";
import {
  Store, ArrowRight, Menu as MenuIcon, X,
  LayoutDashboard, Shield, LogOut
} from "lucide-react";
import { isUserAdmin } from "@/lib/db";
import Button from "@/components/UI/Button";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 bg-white/90 backdrop-blur-md border-b border-[#1A1F36]/[0.06]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mr-auto group">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <Store size={16} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[#1A1F36]">
          Shop<span className="text-[#FF6B35]">Setu</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-[#1A1F36]/50">
        <Link href="/explore" className="hover:text-[#1A1F36] transition-colors">Explore</Link>
        <Link href="/pricing" className="hover:text-[#1A1F36] transition-colors">Pricing</Link>
        <Link href="/about" className="hover:text-[#1A1F36] transition-colors">About</Link>
      </div>

      {/* Auth Actions */}
      <div className="ml-8 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-all p-1 pr-3 bg-[#1A1F36]/[0.03] border border-[#1A1F36]/[0.06] rounded-full">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Profile"} className="w-7 h-7 rounded-full object-cover border border-[#1A1F36]/10" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1A1F36] text-white flex items-center justify-center text-[11px] font-bold">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden md:block text-[12px] font-bold text-[#1A1F36]">
                {user.displayName?.split(' ')[0] || "My Dashboard"}
              </span>
            </Link>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => dispatch(loginWithGoogle())} 
              className="text-[13px] font-semibold text-[#1A1F36]/50 hover:text-[#1A1F36] transition-colors px-2"
            >
              Sign in
            </button>
            <Button
              variant="dark"
              size="sm"
              href="/create"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => window.location.href = '/create'}
            >
              List your shop
            </Button>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#1A1F36] p-1.5 hover:bg-[#1A1F36]/5 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#1A1F36]/[0.06] p-6 flex flex-col gap-5 md:hidden animate-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex flex-col gap-4">
            <Link href="/explore" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-semibold text-[#1A1F36]/70">Explore Marketplace</Link>
            <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-semibold text-[#1A1F36]/70">Pricing & Plans</Link>
            {isAdmin && <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-[15px] font-semibold text-[#FF6B35]">Admin Panel</Link>}
          </div>
          
          <div className="pt-5 border-t border-[#1A1F36]/[0.06] flex flex-col gap-3">
            {!user ? (
              <Button onClick={() => { dispatch(loginWithGoogle()); setIsMenuOpen(false); }} variant="dark" className="w-full">Sign In with Google</Button>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full h-11 flex items-center justify-center bg-[#1A1F36]/5 rounded-xl text-[14px] font-bold text-[#1A1F36]">Go to Dashboard</Link>
                <button onClick={() => { dispatch(logout()); setIsMenuOpen(false); }} className="w-full h-11 text-red-500 text-[14px] font-bold">Logout Account</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
