"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginWithGoogle, logout } from "@/redux/thunks/authThunks";
import {
  Menu as MenuIcon, X,
  LogOut, SlidersHorizontal
} from "lucide-react";
import { isUserAdmin } from "@/lib/db";
import Button from "@/components/UI/Button";
import SmartSearch from "@/components/Search/SmartSearch";
import { slugify } from "@/lib/slugify";
import FilterModal from "@/components/Search/FilterModal";

import { BRAND } from "@/lib/config";

const Navbar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentCity, setCurrentCity] = useState("ahmedabad");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last_city');
      if (saved) setCurrentCity(slugify(saved));

      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

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

  const isHome = pathname === "/";

  // Refined Color Logic
  const isDarkTheme = isHome && !scrolled;

  const navStyles = (isHome && !scrolled && !isMenuOpen)
    ? "bg-transparent border-transparent py-5 md:py-7"
    : (isDarkTheme
      ? "bg-[#020617] border-white/10 shadow-xl py-3 md:py-4"
      : "bg-white border-black/[0.05] shadow-lg py-3 md:py-4");

  const textColor = isDarkTheme ? "text-white" : "text-[#1A1F36]";
  const linkColor = isDarkTheme ? "text-white/70" : "text-[#1A1F36]/60";
  const logoMainColor = isDarkTheme ? "text-white" : "text-[#1A1F36]";

  if (!mounted) return <div className="h-24" />;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center px-5 md:px-16 transition-all duration-500 border-b ${navStyles}`}>
        {/* Logo */}
        <Link href="/" prefetch={false} className="flex items-center gap-3 md:gap-4 flex-shrink-0 group">
          <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 border ${isDarkTheme ? "border-white/20 bg-white/5" : "border-black/5 bg-white shadow-md"}`}>
            <Image
              src="/sb-logo.png"
              alt={BRAND}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <span className={`text-[22px] md:text-[32px] font-black tracking-tighter transition-colors duration-300 ${logoMainColor}`}>
            {BRAND.startsWith("Shop") ? (
              <>
                Shop<span className="text-[#FF6A00]">{BRAND.replace("Shop", "")}</span>
              </>
            ) : (
              BRAND
            )}
          </span>
        </Link>

        {/* Desktop Search Section (Hidden on Home Hero) */}
        {!isHome && (
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-2xl mx-8 gap-3">
            <div className="flex-1">
              <SmartSearch />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="h-11 px-5 rounded-xl border border-black/[0.06] bg-white text-[#1A1F36] hover:bg-gray-50 flex items-center gap-2 text-[13px] font-bold transition-all shadow-sm"
            >
              <SlidersHorizontal size={16} className="text-[#FF6A00]" />
              <span>Filter</span>
            </button>
          </div>
        )}

        {/* Navigation & Auth */}
        <div className="ml-auto flex items-center gap-3 md:gap-8 flex-shrink-0">
          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${currentCity}`} className={`text-[15px] font-black uppercase tracking-widest ${linkColor} hover:text-[#FF6A00] transition-colors`}>Marketplace</Link>
            {isAdmin && <Link href="/admin" className={`text-[15px] font-black uppercase tracking-widest ${linkColor} hover:text-[#FF6A00] transition-colors`}>Admin</Link>}
          </div>

          {user ? (
            <Link href="/dashboard" className={`hidden lg:flex items-center gap-3 hover:opacity-80 transition-all p-1.5 pr-4 md:pr-6 ${isDarkTheme ? "bg-white/10 border-white/10" : "bg-[#1A1F36]/[0.03] border-[#1A1F36]/[0.06]"} border rounded-full relative`}>
              {user.photoURL ? (
                <div className=" w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-black/10 relative">
                  <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                </div>
              ) : (
                <div className="hidden lg:block w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1A1F36] text-white flex items-center justify-center text-[12px] font-bold uppercase">
                  {user.email?.charAt(0)}
                </div>
              )}
              <span className={`hidden sm:block text-[14px] font-black uppercase tracking-wide ${textColor}`}>
                {user.displayName?.split(' ')[0] || "Account"}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-6">
              <button
                onClick={() => dispatch(loginWithGoogle())}
                className={`text-[14px] font-black uppercase tracking-widest ${linkColor} hover:text-[#FF6A00] transition-colors`}
              >
                Sign in
              </button>
              <Button
                variant={isDarkTheme ? "primary" : "dark"}
                size="md"
                className="h-11 px-8 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg"
                onClick={() => router.push('/create')}
              >
                List shop
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden p-2 rounded-xl transition-colors ${isDarkTheme ? "text-white hover:bg-white/10" : "text-[#1A1F36] hover:bg-black/5"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className={`fixed inset-0 top-[71px] z-[200] ${isDarkTheme ? "bg-[#020617]" : "bg-white"} p-6 flex flex-col lg:hidden animate-in fade-in slide-in-from-right-4 duration-500`}>
            <div className="flex flex-col gap-1 pt-6">
              <Link
                href={`/${currentCity}`}
                onClick={() => setIsMenuOpen(false)}
                className={`py-4 px-2 text-[20px] font-bold tracking-tight ${textColor} border-b ${isDarkTheme ? "border-white/5" : "border-black/5"}`}
              >
                Marketplace
              </Link>

              <Link
                href="/create"
                onClick={() => setIsMenuOpen(false)}
                className={`py-4 px-2 text-[20px] font-bold tracking-tight ${textColor} border-b ${isDarkTheme ? "border-white/5" : "border-black/5"}`}
              >
                List Your Business
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-4 px-2 text-[20px] font-bold tracking-tight ${textColor} border-b ${isDarkTheme ? "border-white/5" : "border-black/5"}`}
                >
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-auto pb-8 flex flex-col gap-4">
              {!user ? (
                <Button
                  onClick={() => { dispatch(loginWithGoogle()); setIsMenuOpen(false); }}
                  variant="primary"
                  className="w-full h-14 text-[14px] font-black uppercase tracking-widest rounded-xl shadow-lg"
                >
                  Sign In with Google
                </Button>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full h-14 flex items-center justify-center ${isDarkTheme ? "bg-white text-black" : "bg-[#1A1F36] text-white"} rounded-xl text-[14px] font-black uppercase tracking-widest shadow-xl`}
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => { dispatch(logout()); setIsMenuOpen(false); }}
                    className={`w-full h-12 ${isDarkTheme ? "text-white/40" : "text-black/40"} text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2`}
                  >
                    <LogOut size={16} />
                    Sign Out Account
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
};

export default Navbar;
