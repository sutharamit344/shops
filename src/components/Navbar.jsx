"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginWithGoogle, logout } from "@/redux/thunks/authThunks";
import {
  Store, Menu as MenuIcon, X,
  LogOut, Navigation, RotateCcw
} from "lucide-react";
import { isUserAdmin } from "@/lib/db";
import Button from "@/components/UI/Button";
import SmartSearch from "@/components/Search/SmartSearch";
import { setCity, setArea, setAllFilters, resetFilters } from "@/redux/slices/filterSlice";
import { slugify } from "@/lib/slugify";

const Navbar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { nearby: isNearbyActive } = useSelector((state) => state.filters);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

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

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "ShopSetu_Marketplace_App" } }
          );
          const data = await res.json();
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.state_district;
          const area = address.suburb || address.neighbourhood || address.residential || address.industrial;

          if (city) {
            const cleanCity = city.replace(/ District| Division/g, "");
            const cleanArea = area ? area.replace(/ District| Division/g, "") : "";

            dispatch(setCity(cleanCity));
            if (cleanArea) dispatch(setArea(cleanArea));

            const params = new URLSearchParams(searchParams.toString());
            params.set("city", slugify(cleanCity));
            if (cleanArea) params.set("area", slugify(cleanArea));
            params.set("nearby", "true");

            router.push(`/explore?${params.toString()}`);
            localStorage.setItem('last_city', cleanCity);
            if (cleanArea) localStorage.setItem('last_area', cleanArea);
          }
        } catch (error) {
          console.error("Location error:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false)
    );
  };

  const handleNearbyToggle = () => {
    if (isNearbyActive) {
      dispatch(setAllFilters({ nearby: false, city: "", area: "" }));
      const params = new URLSearchParams(searchParams.toString());
      params.delete("nearby");
      params.delete("city");
      params.delete("area");
      router.push(`/explore?${params.toString()}`);
    } else {
      dispatch(setAllFilters({ nearby: true }));
      const params = new URLSearchParams(searchParams.toString());
      params.set("nearby", "true");
      router.push(`/explore?${params.toString()}`);
      detectLocation();
    }
  };

  const handleReset = () => {
    dispatch(resetFilters());
    router.push("/explore");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center px-6 md:px-12 bg-white/95 backdrop-blur-md border-b border-[#1A1F36]/[0.06]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
        <div className="w-9 h-9 rounded-xl bg-[#FF6B35] flex items-center justify-center transition-transform group-hover:scale-105">
          <Store size={18} className="text-white" />
        </div>
        <span className="text-[16px] font-black tracking-tighter text-[#1A1F36]">
          Shop<span className="text-[#FF6B35]">Setu</span>
        </span>
      </Link>

      {/* Desktop Search Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center max-w-3xl mx-12 gap-3 group">
        <div className="flex-1 min-w-[320px]">
          <SmartSearch />
        </div>
        <div className="flex items-center gap-2 group-focus-within:hidden">
          <Button
            variant={isNearbyActive ? "primary" : "ghost"}
            onClick={handleNearbyToggle}
            loading={isDetecting}
            icon={Navigation}
            className="h-10 px-4 text-[12px] font-bold"
          />
          <Button
            variant="ghost"
            onClick={handleReset}
            icon={RotateCcw}
            className="h-10 px-4 text-[12px] font-bold"
          />
        </div>
      </div>

      {/* Navigation & Auth */}
      <div className="ml-auto flex items-center gap-5 flex-shrink-0">
        <div className="hidden md:flex items-center gap-8 mr-4">
          <Link href="/explore" className="text-[14px] font-bold text-[#1A1F36]/40 hover:text-[#FF6B35] transition-colors">Marketplace</Link>
          {isAdmin && <Link href="/admin" className="text-[14px] font-bold text-[#1A1F36]/40 hover:text-[#FF6B35] transition-colors">Admin</Link>}
        </div>

        {user ? (
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-all p-1.5 pr-5 bg-[#1A1F36]/[0.03] border border-[#1A1F36]/[0.06] rounded-full">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-[#1A1F36]/10" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1A1F36] text-white flex items-center justify-center text-[11px] font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden md:block text-[12px] font-bold text-[#1A1F36]">
              {user.displayName?.split(' ')[0] || "Account"}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:flex items-center gap-8">
            <button
              onClick={() => dispatch(loginWithGoogle())}
              className="text-[14px] font-bold text-[#1A1F36]/40 hover:text-[#1A1F36] transition-colors"
            >
              Sign in
            </button>
            <Button
              variant="dark"
              size="sm"
              className="h-10 px-6 text-[12px] font-bold"
              onClick={() => window.location.href = '/create'}
            >
              List shop
            </Button>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-[#1A1F36] p-2 hover:bg-[#1A1F36]/5 rounded-xl transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#1A1F36]/[0.06] p-8 flex flex-col gap-8 lg:hidden animate-in slide-in-from-top-4 duration-300 shadow-2xl z-50">
          <div className="flex flex-col gap-6">
            <Link href="/explore" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-[#1A1F36] tracking-tight">Marketplace</Link>
            <Link href="/create" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-[#1A1F36] tracking-tight">List Your Business</Link>
          </div>

          <div className="pt-8 border-t border-[#1A1F36]/[0.06] flex flex-col gap-4">
            {!user ? (
              <Button onClick={() => { dispatch(loginWithGoogle()); setIsMenuOpen(false); }} variant="dark" className="w-full h-14 text-base">Sign In with Google</Button>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full h-14 flex items-center justify-center bg-[#1A1F36] rounded-xl text-[15px] font-bold text-white shadow-lg">Go to Dashboard</Link>
                <button onClick={() => { dispatch(logout()); setIsMenuOpen(false); }} className="w-full h-14 text-red-500 text-[15px] font-bold flex items-center justify-center gap-2">
                  <LogOut size={18} />
                  Logout Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
