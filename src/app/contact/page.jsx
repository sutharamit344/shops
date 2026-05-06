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
  CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/UI/Button";
import Input from "@/components/UI/Input";
import Textarea from "@/components/UI/Textarea";
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
      title: "Email Support",
      value: CONTACT.email,
      description: "Our team will respond within 24 hours.",
      link: `mailto:${CONTACT.email}`
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: CONTACT.phone,
      description: "Direct chat for urgent queries.",
      link: `https://wa.me/${CONTACT.whatsapp}`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#1A1F36] pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6A00]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-[#FF6A00] font-black text-xs uppercase tracking-[0.3em] mb-6">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
            We'd Love to <span className="text-[#FF6A00]">Hear From You.</span>
          </h1>
          <p className="text-white/60 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Whether you have a question about shop listing, features, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          
          {/* Contact Info Sidebar */}
          <div className="space-y-12">
            <div className="space-y-8">
              {contactInfo.map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-center text-[#FF6A00] shadow-sm group-hover:bg-[#FF6A00] group-hover:text-white transition-all duration-300 flex-shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1A1F36] mb-1">{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} className="text-[#FF6A00] font-bold text-[15px] hover:underline decoration-2 underline-offset-4">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[#1A1F36] font-bold text-[15px]">{item.value}</p>
                    )}
                    <p className="text-gray-400 text-sm mt-1 font-medium">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[48px] border border-black/[0.05] p-8 md:p-16 shadow-2xl shadow-black/[0.03] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAFAF8] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />
              
              {submitted ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mx-auto mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-[#1A1F36] mb-4">Message Sent!</h2>
                  <p className="text-gray-500 font-medium text-lg mb-8 max-w-sm mx-auto">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#1A1F36] uppercase tracking-[0.2em] ml-1">Full Name</label>
                       <Input 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         placeholder="John Doe" 
                         required 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#1A1F36] uppercase tracking-[0.2em] ml-1">Email Address</label>
                       <Input 
                         name="email"
                         type="email" 
                         value={formData.email}
                         onChange={handleChange}
                         placeholder="john@example.com" 
                         required 
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#1A1F36] uppercase tracking-[0.2em] ml-1">Subject</label>
                    <Input 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Inquiry about Shop Listing" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#1A1F36] uppercase tracking-[0.2em] ml-1">Your Message</label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?" 
                      rows={6} 
                      required 
                    />
                  </div>
                  <div className="pt-4">
                    <Button 
                      size="xl" 
                      className="w-full md:w-auto" 
                      icon={Send} 
                      iconPosition="right" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
