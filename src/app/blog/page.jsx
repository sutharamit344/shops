"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  Clock,
  User,
  Tag,
  ChevronRight,
  Sparkles,
  Calendar,
  MessageSquare,
  Bookmark,
  FileText,
  Filter,
  ShieldCheck,
  Layout,
  TrendingUp
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { BRAND } from "@/lib/config";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Growth", "Marketing", "Business", "Insights", "Success Stories"];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const fetchedBlogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Hero Header */}
      <section className="pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
              <ShieldCheck size={12} className="text-[#FF6A00]" />
              <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Knowledge Node</span>
            </div>
            <h1 className="text-[36px] md:text-[52px] font-bold text-[#0A0A0F] mb-4 tracking-tight leading-none">
              Business <span className="text-[#FF6A00]">Insights.</span>
            </h1>
            <p className="text-[15px] md:text-[16px] text-[#0A0A0F]/45 font-medium leading-relaxed max-w-sm">
              Engineering guides and merchant success stories from the distributed network.
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-3.5 flex items-center text-[#0A0A0F]/20 group-focus-within:text-[#FF6A00] transition-colors">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Filter articles..."
              className="w-full h-10 bg-white border border-black/[0.08] rounded-md pl-10 pr-4 text-[13.5px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all shadow-sm placeholder:text-[#0A0A0F]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category Navigation - High Density */}
      <div className="sticky top-[60px] z-30 bg-white/80 backdrop-blur-xl border-y border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 text-[#0A0A0F]/20">
            <Filter size={14} />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat
                    ? "bg-[#0A0A0F] text-white shadow-xl"
                    : "text-[#0A0A0F]/40 hover:bg-black/[0.03] hover:text-[#0A0A0F]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[380px] bg-white rounded-md animate-pulse border border-black/[0.05]"></div>
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="space-y-16">

            {/* Grid Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog, idx) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className={`group flex flex-col h-full bg-white rounded-md border border-black/[0.05] overflow-hidden hover:border-[#FF6A00]/40 transition-all duration-300 shadow-sm hover:shadow-xl ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "md:col-span-2 lg:col-span-2 md:flex-row" : ""}`}
                >
                  <div className={`relative overflow-hidden bg-black/[0.02] shrink-0 ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "md:w-1/2 aspect-[16/10] md:aspect-auto" : "aspect-[16/9]"}`}>
                    <Image
                      src={blog.coverImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-[#0A0A0F]/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded shadow-xl border border-white/10">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col p-6 md:p-8">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#FF6A00]" /> {new Date(blog.createdAt?.seconds ? blog.createdAt.seconds * 1000 : blog.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {blog.readTime}</span>
                    </div>
                    <h3 className={`${idx === 0 && searchQuery === "" && activeCategory === "All" ? "text-[24px] md:text-[32px]" : "text-[18px]"} font-bold text-[#0A0A0F] mb-3 group-hover:text-[#FF6A00] transition-colors leading-tight tracking-tight`}>
                      {blog.title}
                    </h3>
                    <p className={`text-[#0A0A0F]/45 font-medium leading-relaxed mb-6 line-clamp-2 ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "text-[16px]" : "text-[14px]"}`}>
                      {blog.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-black/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-black/[0.02] border border-black/5 flex items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
                          <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author}`} alt={blog.author} fill className="object-cover opacity-80" />
                        </div>
                        <span className="text-[11px] font-bold text-[#0A0A0F]/60 uppercase tracking-widest">{blog.author.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-[#FF6A00] uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                        Access <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter - High Density */}
            <Card className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 bg-white shadow-2xl border-none">
              <div className="max-w-md text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/5 text-emerald-500 rounded-md border border-emerald-500/10 mb-4">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Network Growth</span>
                </div>
                <h3 className="text-[24px] font-bold text-[#0A0A0F] mb-2 tracking-tight">Weekly Transmission.</h3>
                <p className="text-[#0A0A0F]/45 font-medium text-[14px]">Join the mailing list for Bharat's fastest-growing merchant node.</p>
              </div>
              <form className="flex-1 max-w-lg w-full flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="communication@node.com"
                  className="flex-1 h-11 bg-white border border-black/[0.08] rounded-md px-4 text-[13.5px] font-medium outline-none focus:border-[#FF6A00]/40 transition-all shadow-sm"
                />
                <Button size="lg" className="px-8 h-11 shadow-xl">Subscribe</Button>
              </form>
            </Card>

          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-md border border-dashed border-black/[0.1] animate-in fade-in">
            <div className="w-12 h-12 bg-black/[0.02] rounded-md flex items-center justify-center mx-auto mb-6 text-[#0A0A0F]/10">
              <FileText size={24} />
            </div>
            <h3 className="text-[18px] font-bold text-[#0A0A0F] mb-1 tracking-tight">No indexing results</h3>
            <p className="text-[#0A0A0F]/40 text-[13px] font-medium">Try adjusting your node filters or search parameters.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="mt-6 text-[10px] font-bold text-[#FF6A00] uppercase tracking-widest hover:underline">Reset Node Filters</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogListPage;
