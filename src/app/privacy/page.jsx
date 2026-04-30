import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, ChevronLeft, Globe, Mail, Phone, AlertTriangle } from "lucide-react";

import { BRAND } from "@/lib/config";

export const metadata = {
  title: `Privacy Policy | ${BRAND}`,
  description: `Learn how ${BRAND} protects your data and maintains your privacy.`,
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-[#1A1F36] tracking-tight">{title}</h2>
    </div>
    <div className="text-[15px] text-[#1A1F36]/60 leading-relaxed pl-13 ml-13 border-l border-[#1A1F36]/[0.07] pl-6 ml-5">
      {children}
    </div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <header className="bg-[#1A1F36] text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FF6B35] transition-colors mb-8 text-[11px] font-bold uppercase tracking-[0.2em] group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">Privacy Policy</h1>
          <p className="text-white/60 text-lg max-w-2xl font-medium leading-relaxed">
            Protecting your digital identity is fundamental to our mission at {BRAND}. Read how we secure your data.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#FF6B35]">
            <span className="px-4 py-2 bg-[#FF6B35]/15 rounded-full border border-[#FF6B35]/20 backdrop-blur-md">Last Updated: April 25, 2026</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-[40px] border border-[#1A1F36]/[0.07] p-8 md:p-20 shadow-xl space-y-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAFAF8] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />

          <Section icon={Shield} title="1. Introduction & Commitment">
            <p className="mb-4">
              {BRAND} ("we," "us," or "our") operates a digital marketplace platform connecting local shop owners with customers in Bharat. We understand that your privacy is critical, and we are committed to being transparent about the data we collect and how we use it.
            </p>
            <p>
              By using our platform, you consent to the data practices described in this policy. We comply with the Information Technology Act, 2000 of India and align our practices with global standards for data protection.
            </p>
          </Section>

          <Section icon={FileText} title="2. Information We Collect">
            <div className="space-y-6">
              <p>We collect information through three primary channels:</p>

              <div className="space-y-4">
                <h3 className="text-[#1A1F36] font-bold text-sm uppercase tracking-wider">A. Personal Information</h3>
                <p>When you register as a seller or interact with the platform, we collect your name, email address, phone number, and physical address for business verification.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[#1A1F36] font-bold text-sm uppercase tracking-wider">B. Shop & Business Details</h3>
                <p>Sellers provide shop names, categories, descriptions, operational hours, product listings, and images. This information is intended for public display to help customers discover your business.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[#1A1F36] font-bold text-sm uppercase tracking-wider">C. Usage & Technical Data</h3>
                <p>We automatically collect information about your device, IP address, browser type, and how you navigate the platform to ensure security and optimize performance.</p>
              </div>
            </div>
          </Section>

          <Section icon={Eye} title="3. How We Use Information">
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Service Delivery:</span> To create and manage your shop profile and facilitate discovery on Google and our marketplace.</li>
              <li><span className="font-bold text-[#1A1F36]">Communication:</span> To send you important updates, security alerts, and lead notifications via WhatsApp or Email.</li>
              <li><span className="font-bold text-[#1A1F36]">Improvement:</span> To analyze usage trends and develop new features tailored for local commerce.</li>
              <li><span className="font-bold text-[#1A1F36]">Safety:</span> To verify business authenticity and prevent fraudulent listings.</li>
            </ul>
          </Section>

          <Section icon={Globe} title="4. Sharing of Information">
            <p className="mb-4">We do not sell your personal data to third parties. We only share information in the following circumstances:</p>
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Service Providers:</span> We work with trusted partners like Firebase (hosting), Google Analytics, and WhatsApp for business functionality.</li>
              <li><span className="font-bold text-[#1A1F36]">Legal Requirements:</span> If required by law or in response to valid requests by public authorities in India.</li>
              <li><span className="font-bold text-[#1A1F36]">Public Display:</span> Any information you add to your public shop profile is visible to all marketplace visitors.</li>
            </ul>
          </Section>

          <Section icon={Lock} title="5. Data Security">
            <p>
              We maintain reasonable physical, electronic, and procedural safeguards to protect your information. Your data is stored on secure servers with encrypted authentication protocols. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section icon={Eye} title="6. User Rights">
            <p className="mb-4">You have full control over your data on {BRAND}:</p>
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Access & Update:</span> You can edit your shop and profile data at any time via your dashboard.</li>
              <li><span className="font-bold text-[#1A1F36]">Deletion:</span> You may request the deletion of your account and all associated shop data by contacting our support team.</li>
              <li><span className="font-bold text-[#1A1F36]">Opt-Out:</span> You can unsubscribe from non-essential communications at any time.</li>
            </ul>
          </Section>

          <Section icon={Lock} title="7. Cookies Policy">
            <p>
              We use "cookies" to collect information and improve our services. Cookies help us remember your login status and preferences. You can instruct your browser to refuse all cookies, but some parts of our platform may not function correctly as a result.
            </p>
          </Section>

          <Section icon={AlertTriangle} title="8. Children's Privacy">
            <p>
              {BRAND} is intended for business owners and adult users. We do not knowingly collect personal information from children under the age of 13. If we become aware that a child has provided us with personal data, we will delete it immediately.
            </p>
          </Section>

          <Section icon={Globe} title="9. Changes to Policy">
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </Section>

          <div className="pt-16 border-t border-[#1A1F36]/[0.07]">
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-8 tracking-tight">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <a href="mailto:support@shopbajar.com" className="flex items-center gap-5 p-6 bg-[#FAFAF8] rounded-3xl border border-[#1A1F36]/[0.05] hover:border-[#FF6B35]/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#FF6B35] group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Support Email</p>
                  <p className="font-bold text-[#1A1F36] text-[15px]">support@shopbajar.com</p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-24 text-center border-t border-[#1A1F36]/[0.06] bg-white">
        <p className="text-[#1A1F36]/20 text-[10px] font-bold uppercase tracking-[0.3em]">{BRAND} Marketplace Authority • 2026</p>
      </footer>
    </div>
  );
}
