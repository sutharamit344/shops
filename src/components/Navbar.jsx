"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginWithGoogle, logout } from "@/redux/thunks/authThunks";
import {
  Menu as MenuIcon, X, LogOut, SlidersHorizontal,
  LayoutGrid, ChevronDown, Store, LogIn
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentCity, setCurrentCity] = useState("ahmedabad");
  const [currentArea, setCurrentArea] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("last_city");
      const savedArea = localStorage.getItem("last_area");
      if (savedCity) setCurrentCity(slugify(savedCity));
      if (savedArea) setCurrentArea(slugify(savedArea));

      const handleScroll = () => setScrolled(window.scrollY > 24);
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const isHome = pathname === "/";
  const isDiscovery = !isHome && pathname !== "/create" && pathname !== "/dashboard";

  // Nav appearance
  const navBg = scrolled || !isHome || isMenuOpen
    ? "bg-white/90 backdrop-blur-xl border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.05)]"
    : isHome
    ? "bg-transparent border-transparent"
    : "bg-white/90 backdrop-blur-xl border-black/[0.06]";

  const isDark = isHome && !scrolled && !isMenuOpen;
  const textPrimary = isDark ? "text-white" : "text-[#0A0A0F]";
  const textMuted = isDark ? "text-white/55" : "text-[#0A0A0F]/45";

  if (!mounted) return <div className="h-[60px]" />;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[60px] border-b transition-all duration-300 ${navBg}`}
      >
        <div className="max-w-7xl mx-auto w-full h-full px-4 md:px-6 flex items-center">
        {/* Logo */}
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-2.5 flex-shrink-0 group mr-4 md:mr-6"
        >
          <Image
            src="/brand-logo-v1.png"
            alt={BRAND}
            width={30}
            height={30}
            className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className={`text-[16px] font-bold tracking-tight transition-colors duration-200 ${isDark ? "text-white" : "text-[#0A0A0F]"}`}
          >
            {BRAND.startsWith("Shop") ? (
              <>
                Shop<span className="text-[#FF6A00]">{BRAND.replace("Shop", "")}</span>
              </>
            ) : (
              BRAND
            )}
          </span>
        </Link>

        {/* Desktop Search — visible on discovery/inner pages */}
        {!isHome && (
          <div className="hidden lg:flex flex-1 items-center gap-2 max-w-xl">
            <div className="flex-1">
              <SmartSearch />
            </div>
          </div>
        )}

        {/* Right side nav */}
        <div className={`ml-auto flex items-center gap-1 md:gap-2 ${isHome ? "" : "flex-shrink-0"}`}>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Link
              href={currentArea ? `/${currentCity}/${currentArea}` : `/${currentCity}`}
              className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-medium transition-all duration-150 ${textMuted} hover:bg-black/[0.04] hover:${isDark ? "text-white" : "text-[#0A0A0F]"}`}
            >
              <LayoutGrid size={13} />
              Marketplace
            </Link>
          </div>

          {/* Auth section */}
          {user ? (
            <Link
              href="/dashboard"
              className={`hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg transition-all duration-150 ${isDark ? "hover:bg-white/10" : "hover:bg-black/[0.04]"}`}
            >
              {user.photoURL ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-black/10 relative flex-shrink-0">
                  <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#FF6A00] text-white flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0">
                  {user.email?.charAt(0)}
                </div>
              )}
              <span className={`text-[13px] font-medium ${textPrimary}`}>
                {user.displayName?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown size={12} className={`${textMuted}`} />
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => dispatch(loginWithGoogle())}
                className={`h-8 px-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${textMuted} hover:${isDark ? "text-white bg-white/10" : "text-[#0A0A0F] bg-black/[0.04]"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/create")}
                className="h-8 px-3.5 rounded-lg bg-[#0A0A0F] text-white text-[13px] font-semibold hover:bg-[#1a1a24] transition-all duration-150 shadow-sm"
              >
                List shop
              </button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${isDark ? "text-white hover:bg-white/10" : "text-[#0A0A0F] hover:bg-black/[0.05]"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
        </div>

        {/* Mobile slide-in menu */}
        {isMenuOpen && (
          <div
            className={`fixed inset-0 top-[60px] z-[200] ${isDark ? "bg-[#0A0A0F]" : "bg-white"} p-5 flex flex-col lg:hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {/* Mobile Search */}
            <div className="mb-5">
              <SmartSearch />
            </div>

            <div className="flex flex-col gap-0.5">
              <Link
                href={currentArea ? `/${currentCity}/${currentArea}` : `/${currentCity}`}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-[15px] font-semibold ${isDark ? "text-white/80 hover:bg-white/5 hover:text-white" : "text-[#0A0A0F]/70 hover:bg-black/[0.04] hover:text-[#0A0A0F]"} transition-all`}
              >
                <LayoutGrid size={17} />
                Marketplace
              </Link>
              <Link
                href="/create"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-[15px] font-semibold ${isDark ? "text-white/80 hover:bg-white/5 hover:text-white" : "text-[#0A0A0F]/70 hover:bg-black/[0.04] hover:text-[#0A0A0F]"} transition-all`}
              >
                <Store size={17} />
                List Your Business
              </Link>
            </div>

            <div className="mt-auto pt-5 border-t border-black/[0.06] flex flex-col gap-2">
              {!user ? (
                <button
                  onClick={() => { dispatch(loginWithGoogle()); setIsMenuOpen(false); }}
                  className="w-full h-11 rounded-lg bg-[#FF6A00] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#E65F00] transition-all"
                >
                  <LogIn size={16} />
                  Sign In with Google
                </button>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full h-11 flex items-center justify-center rounded-lg ${isDark ? "bg-white text-[#0A0A0F]" : "bg-[#0A0A0F] text-white"} text-[14px] font-semibold`}
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => { dispatch(logout()); setIsMenuOpen(false); }}
                    className={`w-full h-10 ${isDark ? "text-white/35" : "text-[#0A0A0F]/30"} text-[12px] font-medium flex items-center justify-center gap-2`}
                  >
                    <LogOut size={14} />
                    Sign Out
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
