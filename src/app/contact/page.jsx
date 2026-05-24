"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  ChevronRight,
  Globe,
  Clock,
  CircleCheckBig,
  ShieldCheck,
  Sparkles,
  Layout
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import Textarea from "@/components/UI/Textarea";
import Card from "@/components/UI/Card";
import { BRAND, CONTACT } from "@/lib/config";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contact_messages"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "new"
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Network Support",
      value: CONTACT.email,
      description: "Direct engineering support node.",
      link: `mailto:${CONTACT.email}`
    },
    {
      icon: MessageSquare,
      title: "Merchant Desk",
      value: CONTACT.phone,
      description: "Direct priority line for business.",
      link: `https://wa.me/${CONTACT.whatsapp}`
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#FF6A00]/10 selection:text-[#FF6A00]">
      <Navbar />
      <div className="absolute inset-0 dot-grid opacity-[0.05] pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative z-10 max-w-7xl mx-auto">
        <div className="animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF6A00]/5 border border-[#FF6A00]/10 mb-6">
            <ShieldCheck size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.2em]">Communication Node</span>
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold text-[#0A0A0F] mb-6 tracking-tight leading-none">
            Get in <span className="text-[#FF6A00]">Touch.</span>
          </h1>
          <p className="text-[15px] md:text-[17px] text-[#0A0A0F]/45 font-medium leading-relaxed max-w-xl">
            Whether you're deploying a new shop node or require technical assistance,
            our engineering team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {contactInfo.map((item, i) => (
              <Card key={i} className="p-5 hover:border-[#FF6A00]/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-[#0A0A0F]/20 group-hover:text-[#FF6A00] transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-widest mb-0.5">{item.title}</p>
                    <a href={item.link} className="text-[14px] font-bold text-[#0A0A0F] hover:text-[#FF6A00] truncate block">
                      {item.value}
                    </a>
                  </div>
                </div>
              </Card>
            ))}

            <Card variant="dark" padding={false} className="p-6 border-none shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-[#FF6A00]" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Priority Node</span>
              </div>
              <p className="text-[13px] text-white/60 font-medium leading-relaxed mb-6">
                Merchants with active nodes receive priority technical support
                within the deployment dashboard.
              </p>
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-10">Documentation</Button>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-8 p-0 border-none shadow-2xl overflow-hidden">
            <div className="bg-white p-8 md:p-12">
              {submitted ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-8">
                    <CircleCheckBig size={32} />
                  </div>
                  <h2 className="text-[28px] font-bold text-[#0A0A0F] mb-3 tracking-tight">Transmission Received</h2>
                  <p className="text-[#0A0A0F]/45 font-medium text-[15px] mb-10 max-w-sm mx-auto leading-relaxed">
                    Your inquiry has been successfully indexed. Our team will contact your node shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Send New Inquiry</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Merchant Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Rivera"
                      required
                    />
                    <Input
                      label="Contact Identity"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  <Input
                    label="Inquiry Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. API Integration, Node Deployment"
                    required
                  />
                  <Textarea
                    label="Message Payload"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your technical requirements..."
                    rows={6}
                    required
                  />
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[#0A0A0F]/20">
                      <Layout size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">SaaS Suite</span>
                    </div>
                    <Button
                      size="lg"
                      icon={Send}
                      iconPosition="right"
                      type="submit"
                      disabled={loading}
                      className="px-10 h-12 shadow-xl"
                    >
                      {loading ? "Transmitting..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
