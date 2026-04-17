"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/UI/Button";
import Navbar from "@/components/Navbar";
import {
  Store,
  MessageSquare,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-cream pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-navy mb-8 leading-tight text-balance">
            Take Your Local Shop <br />
            <span className="text-primary italic">To The Digital World</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create a professional digital presence for your shop in 2 minutes.
            Get orders directly on WhatsApp. No coding required.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/create">
              <Button className="text-xl py-6 px-10 shadow-xl shadow-primary/20">
                Create My Shop Page <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link
              href="/explore"
              className="text-navy font-bold flex items-center gap-2 hover:gap-3 transition-all duration-300"
            >
              Browse Categories <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-primary mb-2">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-bold text-navy">Digital Identity</h3>
              <p className="text-gray-600">
                Get a unique URL for your shop that you can share with anyone.
              </p>
            </div>
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-primary mb-2">
                <Store size={32} />
              </div>
              <h3 className="text-2xl font-bold text-navy">Simple Dashboard</h3>
              <p className="text-gray-600">
                Add products, services, and photos with zero technical
                knowledge.
              </p>
            </div>
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-whatsapp mb-2">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-bold text-navy">WhatsApp Orders</h3>
              <p className="text-gray-600">
                Customers can contact you directly on WhatsApp for orders and
                queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-cream/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center text-navy mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "Fill in your shop details and add products.",
              "Our team approves and generates your page.",
              "Share your link and start getting customers.",
            ].map((step, i) => (
              <div
                key={i}
                className="flex gap-4 items-start p-6 bg-white rounded-2xl border border-cream shadow-sm"
              >
                <CheckCircle2
                  className="text-whatsapp flex-shrink-0 mt-1"
                  size={24}
                />
                <p className="text-lg font-medium text-navy">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-2xl font-black mb-4 font-outfit">ShopSetu</p>
          <p className="opacity-60">
            © 2026 ShopSetu. Built for local businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}
