"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Clock, 
  ArrowLeft,
  Copy,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Custom SVG Icons for better compatibility with old lucide versions
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const TwitterIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const LinkedinIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const BlogSingleClient = ({ blog }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.documentElement;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const windowScrollTop = window.scrollY;
      if (totalHeight > 0) {
        setReadingProgress((windowScrollTop / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const relatedQ = query(collection(db, "blogs"), limit(4));
        const relatedSnap = await getDocs(relatedQ);
        setRelatedBlogs(relatedSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.slug !== blog.slug)
          .slice(0, 3)
        );
      } catch (error) {
        console.error("Error fetching related blogs:", error);
      }
    };
    fetchRelated();
  }, [blog.slug]);

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = blog.createdAt ? new Date(
    blog.createdAt.seconds ? blog.createdAt.seconds * 1000 : blog.createdAt
  ).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : "Recent Post";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-black/5 z-[100]">
        <div 
          className="h-full bg-[#FF6A00]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      
      <main className="pt-28 md:pt-32 pb-16 md:pb-20">
        {/* Article Header Section */}
        <header className="max-w-4xl mx-auto px-5 md:px-6 mb-8 md:mb-16">
          <div className="flex items-center gap-4 mb-6 md:mb-10">
            <Link href="/blog" className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-[#0A0A0F]/40 uppercase tracking-widest hover:text-[#FF6A00] transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Journal
            </Link>
            <span className="w-1 h-1 rounded-full bg-black/10"></span>
            <span className="text-[10px] md:text-[11px] font-black text-[#FF6A00] uppercase tracking-widest">{blog.category || "Insight"}</span>
          </div>

          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-[#0A0A0F] mb-6 md:mb-10 leading-[1.1] tracking-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 pb-6 md:pb-10 border-b border-black/5">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/20 relative overflow-hidden">
                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author}`} alt={blog.author} fill className="object-cover opacity-80" />
              </div>
              <div>
                <p className="text-[11px] md:text-[13px] font-black text-[#0A0A0F] uppercase tracking-wider mb-0.5">{blog.author || "ShopBajar Editorial"}</p>
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{formattedDate}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-black/10"></span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {blog.readTime || "5 min"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
               <button onClick={copyToClipboard} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#0A0A0F] hover:text-white transition-all">
                 {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
               </button>
               <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#1877F2] hover:text-white transition-all">
                 <FacebookIcon size={16} />
               </button>
               <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#1DA1F2] hover:text-white transition-all">
                 <TwitterIcon size={16} />
               </button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="max-w-7xl mx-auto px-5 md:px-6 mb-12 md:mb-20">
          <div className="relative aspect-video md:aspect-[21/9] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl border border-black/5 group">
            <Image 
              src={blog.coverImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-7xl mx-auto px-5 md:px-6 flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          
          {/* Left: Floating Sidebar */}
          <aside className="hidden lg:block w-20 flex-shrink-0">
            <div className="sticky top-32 flex flex-col items-center gap-4">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 mb-4">Share Story</span>
              <button onClick={copyToClipboard} title="Copy Link" className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm">
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              </button>
              <button title="Share on Facebook" className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all shadow-sm">
                <FacebookIcon size={20} />
              </button>
              <button title="Share on Twitter" className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all shadow-sm">
                <TwitterIcon size={20} />
              </button>
              <button title="Share on LinkedIn" className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/60 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all shadow-sm">
                <LinkedinIcon size={20} />
              </button>
            </div>
          </aside>

          {/* Center: Content */}
          <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
            <div 
              ref={contentRef}
              className="blog-content w-full"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Newsletter Subscription Inside Content */}
            <div className="my-20 p-10 md:p-14 bg-[#0A0A0F] rounded-[32px] md:rounded-[48px] text-white relative overflow-hidden group">
               <div className="relative z-10 max-w-lg">
                  <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">Get insights like this delivered weekly.</h3>
                  <p className="text-white/60 font-medium mb-10 leading-relaxed text-sm">Join 12,000+ business owners receiving the ShopBajar Journal directly in their inbox.</p>
                  <form className="flex flex-col sm:flex-row gap-4">
                     <input 
                       type="email" 
                       placeholder="your@email.com" 
                       className="flex-1 h-12 bg-white/10 border border-white/20 rounded-lg px-6 font-bold focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/30"
                     />
                     <button className="h-12 bg-[#FF6A00] hover:bg-[#FF8533] text-white font-black px-8 rounded-lg transition-all shadow-xl shadow-[#FF6A00]/20 whitespace-nowrap">
                        Join Journal
                     </button>
                  </form>
               </div>
            </div>

            {/* Author Footer Card */}
            <div className="flex flex-col sm:flex-row items-center gap-8 py-12 border-y border-black/5 mb-20 text-center sm:text-left">
               <div className="w-20 h-20 rounded-[24px] bg-[#FAFAF8] border border-black/5 flex items-center justify-center text-[#0A0A0F]/20 relative overflow-hidden flex-shrink-0 shadow-lg">
                  <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author}`} alt={blog.author} fill className="object-cover opacity-80" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-[#0A0A0F] mb-2 uppercase tracking-tight">Written by {blog.author || "Editorial Team"}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed mb-4 text-sm">Dedicated to empowering local shops with digital intelligence and growth strategies.</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Recommended Section */}
      {relatedBlogs.length > 0 && (
        <section className="bg-[#FAFAF8] py-20 md:py-32 border-t border-black/5">
          <div className="max-w-7xl mx-auto px-5 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 text-center md:text-left">
               <div>
                 <p className="text-[10px] font-black text-[#FF6A00] uppercase tracking-[0.2em] mb-4">You might also like</p>
                 <h2 className="text-3xl lg:text-5xl font-black text-[#0A0A0F] tracking-tight">Continue Reading</h2>
               </div>
               <Link href="/blog" className="group flex items-center gap-3 text-[10px] font-black text-[#0A0A0F] uppercase tracking-widest hover:text-[#FF6A00] transition-colors">
                 All Journal Articles
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedBlogs.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="group block">
                  <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden border border-black/5 shadow-xl mb-6 group-hover:shadow-2xl transition-all duration-500">
                    <Image 
                      src={item.coverImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"} 
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black text-[#0A0A0F] uppercase tracking-widest shadow-sm">
                          {item.category}
                       </span>
                    </div>
                  </div>
                  <h4 className="text-lg lg:text-xl font-black text-[#0A0A0F] group-hover:text-[#FF6A00] transition-colors leading-[1.3] mb-3 line-clamp-2 tracking-tight">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><Clock size={10} /> {item.readTime}</span>
                     <span className="w-0.5 h-0.5 rounded-full bg-black/10"></span>
                     <span>By {(item.author || 'Editor').split(' ')[0]}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogSingleClient;
