"use client";

import React, { useState, useEffect } from "react";
import { getApprovedShops } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import Link from 'next/link';
import { Search, MapPin, Filter, Store, ArrowRight, ChevronDown, X } from "lucide-react";

export default function ExplorePage() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // Filter options (derived from data)
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getApprovedShops();
      setShops(data);
      setFilteredShops(data);

      // Extract unique values for filters
      const cats = Array.from(new Set(data.map(s => s.category))).filter(Boolean).sort();
      const cts = Array.from(new Set(data.map(s => s.city))).filter(Boolean).sort();
      const sts = Array.from(new Set(data.map(s => s.state))).filter(Boolean).sort();

      setCategories(cats);
      setCities(cts);
      setStates(sts);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = shops;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }

    if (selectedCity) {
      result = result.filter(s => s.city === selectedCity);
    }

    if (selectedState) {
      result = result.filter(s => s.state === selectedState);
    }

    setFilteredShops(result);
  }, [searchQuery, selectedCategory, selectedCity, selectedState, shops]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedState("");
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-navy uppercase tracking-tight mb-4">
            Explore Local <span className="text-primary">Shops</span>
          </h1>
          <p className="text-gray-600 max-w-2xl font-medium">
            Discover the best local businesses in your area. Use the filters below to refine your search.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-cream mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Shop name..."
                  className="w-full pl-10 pr-4 py-3 bg-cream/50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Category</label>
              <select
                className="w-full px-4 py-3 bg-cream/50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">City</label>
              <select
                className="w-full px-4 py-3 bg-cream/50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">State</label>
              <select
                className="w-full px-4 py-3 bg-cream/50 rounded-xl border-none focus:ring-2 focus:ring-primary text-sm font-medium appearance-none cursor-pointer"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {(searchQuery || selectedCategory || selectedCity || selectedState) && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"
              >
                <X size={14} /> Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-cream"></div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-[40px] p-20 text-center">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6 text-primary/50">
              <Store size={32} />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">No Shops Found</h2>
            <p className="text-gray-500 mb-8">Try adjusting your filters or search terms.</p>
            <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="text-gray-500 font-medium">
                Showing <span className="text-navy font-bold">{filteredShops.length}</span> shops
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShops.map((shop) => (
                <Link key={shop.id} href={`/${shop.city}/${shop.category}/${shop.slug}`}>
                  <Card className="h-full group hover:shadow-2xl transition-all duration-500 p-0 overflow-hidden flex flex-col">
                    <div 
                      className="h-2 w-full group-hover:h-3 transition-all duration-300" 
                      style={{ backgroundColor: shop.primaryColor || '#E94E1B' }}
                    ></div>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-6">
                        {shop.logo ? (
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/10 group-hover:scale-110 transition-transform">
                            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-cream rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Store size={24} />
                          </div>
                        )}
                        <span className="bg-cream/50 text-gray-500 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">
                          {shop.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-navy mb-2 group-hover:theme-text-primary transition-colors">{shop.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">{shop.description}</p>
                      
                      <div className="space-y-3 pt-6 border-t border-cream">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                          <MapPin size={14} className="text-primary/40" /> {shop.area}, {shop.city}
                        </div>
                        <div className="flex items-center justify-between text-primary font-black text-xs uppercase tracking-tighter">
                          <span>Visit Shop</span>
                          <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
