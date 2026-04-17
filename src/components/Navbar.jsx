"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/UI/Button";
import { LogIn, LogOut, User as UserIcon, Shield, Menu as MenuIcon, X, User } from "lucide-react";

import { isUserAdmin } from "@/lib/db";
import { useEffect } from "react";

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
    <nav className="bg-navy transition-all duration-300 w-full z-50 py-4 md:py-6 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl italic uppercase">S</span>
            </div>
            <span className="text-2xl font-black text-white hover:text-primary transition-colors tracking-tighter uppercase italic">Shop<span className="text-primary italic-none">Setu</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link href="/explore" className="text-cream/80 hover:text-primary px-4 py-2 text-sm font-black uppercase tracking-widest transition-all">Explore</Link>
            <Link href="/create" className="text-cream/80 hover:text-primary px-4 py-2 text-sm font-black uppercase tracking-widest transition-all">Sell Online</Link>

            <div className="h-6 w-[1px] bg-cream/10 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="text-cream/80 hover:text-primary px-4 py-2 text-sm font-black uppercase tracking-widest transition-all">My Shops</Link>
                {isAdmin && (
                  <Link href="/admin" className="text-primary hover:text-white px-4 py-2 text-sm font-black uppercase tracking-widest bg-primary/10 rounded-xl transition-all">Admin</Link>
                )}
                <button onClick={logout} className="ml-2 text-cream/40 hover:text-red-400 p-2 transition-colors"><LogOut size={20} /></button>
              </div>
            ) : (
              <Button onClick={loginWithGoogle} className="ml-4 shadow-xl shadow-primary/20">Sign In</Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {user && (
              <Link href="/dashboard" className="text-primary bg-primary/10 p-2.5 rounded-xl shadow-inner">
                <User size={24} />
              </Link>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-primary transition-colors p-2">
              {isMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-navy/95 backdrop-blur-xl border-t border-cream/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-2">
            <Link href="/explore" className="block text-cream/90 hover:text-primary hover:bg-cream/5 px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all">Explore Marketplace</Link>
            <Link href="/create" className="block text-cream/90 hover:text-primary hover:bg-cream/5 px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all">Start Selling</Link>

            {user && (
              <>
                <div className="h-[1px] bg-cream/10 my-4 mx-4"></div>
                <Link href="/dashboard" className="block text-cream/90 hover:text-primary hover:bg-cream/5 px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all">My Business Dashboard</Link>
                {isAdmin && (
                  <Link href="/admin" className="block text-primary hover:bg-primary hover:text-white px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all">Admin Panel</Link>
                )}
                <button onClick={logout} className="w-full text-left text-red-400 hover:bg-red-400/10 px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all">Sign Out</button>
              </>
            )}

            {!user && (
              <div className="pt-4">
                <Button onClick={loginWithGoogle} className="w-full py-6 text-xl rounded-2xl">Sign In with Google</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
