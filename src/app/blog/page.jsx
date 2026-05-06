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
  Filter
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
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
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      {/* Compact Header */}
      <section className="bg-[#1A1F36] pt-24 pb-12 md:pt-32 md:pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6A00]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
               <span className="w-8 h-px bg-[#FF6A00]"></span>
               <p className="text-[#FF6A00] font-black text-[10px] uppercase tracking-[0.3em]">Official Journal</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Grow Your <span className="text-[#FF6A00]">Business.</span>
            </h1>
            <p className="text-white/40 text-sm md:text-base font-medium leading-relaxed max-w-sm">
              Practical guides and success stories from the heart of local commerce in Bharat.
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
             <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-[#FF6A00] transition-colors">
                <Search size={16} />
             </div>
             <input 
               type="text" 
               placeholder="Search articles..."
               className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white text-sm outline-none focus:bg-white focus:text-[#1A1F36] transition-all font-medium placeholder:text-white/20"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>
      </section>

      {/* Category Chips - Sticky on Mobile */}
      <div className="sticky top-[71px] z-30 bg-white/80 backdrop-blur-md border-b border-black/[0.05] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex-shrink-0 text-[#1A1F36]/30 mr-2">
            <Filter size={16} />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? "bg-[#1A1F36] text-white shadow-lg shadow-[#1A1F36]/20" 
                : "bg-gray-100 text-[#1A1F36]/40 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-white rounded-[32px] animate-pulse border border-black/[0.03]"></div>
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="space-y-16">
            
            {/* Grid Posts - Compact & Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredBlogs.map((blog, idx) => (
                <Link 
                  key={blog.id} 
                  href={`/blog/${blog.slug}`} 
                  className={`group flex flex-col h-full ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "md:col-span-2 lg:col-span-2 md:flex-row md:gap-8" : ""}`}
                >
                  <div className={`relative rounded-[32px] overflow-hidden border border-black/[0.05] shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-white flex-shrink-0 ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "md:w-1/2 aspect-[4/3] md:aspect-auto" : "aspect-[16/10] mb-6"}`}>
                    <Image 
                      src={blog.coverImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#1A1F36]/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex-1 flex flex-col justify-center ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "py-4" : "px-2"}`}>
                    <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">
                       <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#FF6A00]" /> {new Date(blog.createdAt?.seconds ? blog.createdAt.seconds * 1000 : blog.createdAt).toLocaleDateString()}</span>
                       <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                       <span className="flex items-center gap-1.5"><Clock size={12} /> {blog.readTime}</span>
                    </div>
                    <h3 className={`${idx === 0 && searchQuery === "" && activeCategory === "All" ? "text-2xl md:text-3xl lg:text-4xl" : "text-xl"} font-black text-[#1A1F36] mb-3 group-hover:text-[#FF6A00] transition-colors leading-tight tracking-tight`}>
                      {blog.title}
                    </h3>
                    <p className={`text-gray-500 font-medium leading-relaxed mb-6 line-clamp-2 ${idx === 0 && searchQuery === "" && activeCategory === "All" ? "text-base" : "text-sm"}`}>
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/[0.03]">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#1A1F36]/20 relative overflow-hidden">
                             <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author}`} alt={blog.author} fill className="object-cover opacity-80" />
                          </div>
                          <span className="text-[10px] font-black text-[#1A1F36] uppercase tracking-widest">{blog.author.split(' ')[0]}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-[#FF6A00] uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          Read Story <ArrowRight size={14} />
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Minimal Newsletter Section */}
            <div className="bg-[#FAFAF8] border border-black/[0.05] rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="max-w-md text-center md:text-left">
                  <h3 className="text-2xl font-black text-[#1A1F36] mb-2 tracking-tight">Weekly insights, delivered.</h3>
                  <p className="text-gray-500 font-medium text-sm">Join the mailing list for Bharat's fastest-growing marketplace.</p>
               </div>
               <form className="flex-1 max-w-lg w-full flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 h-12 bg-white border border-black/[0.06] rounded-xl px-5 text-sm font-medium outline-none focus:border-[#FF6A00] transition-all"
                  />
                  <Button className="h-12 shadow-lg shadow-[#FF6A00]/20">Subscribe</Button>
               </form>
            </div>

          </div>
        ) : (
          <div className="text-center py-32 bg-white border-2 border-dashed border-black/[0.03] rounded-[40px]">
             <div className="w-16 h-16 bg-[#FAFAF8] rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FileText size={32} />
             </div>
             <h3 className="text-xl font-black text-[#1A1F36] mb-2 tracking-tight">No results found</h3>
             <p className="text-gray-400 text-sm font-medium">Try adjusting your filters or search query.</p>
             <button onClick={() => {setSearchQuery(""); setActiveCategory("All");}} className="mt-6 text-[10px] font-black text-[#FF6A00] uppercase tracking-widest hover:underline">Clear all filters</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogListPage;
