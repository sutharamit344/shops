import React from "react";
import Link from "next/link";
import { Gavel, Scale, AlertTriangle, UserCheck, ChevronLeft, HelpCircle, Mail, MessageSquare, Shield, Globe } from "lucide-react";

import { BRAND } from "@/lib/config";

export const metadata = {
  title: `Terms & Conditions | ${BRAND}`,
  description: `Read the rules and guidelines for using the ${BRAND} platform.`,
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-[#1A1F36] tracking-tight">{title}</h2>
    </div>
    <div className="text-[15px] text-[#1A1F36]/60 leading-relaxed pl-6 ml-5 border-l border-[#1A1F36]/[0.07]">
      {children}
    </div>
  </div>
);

export default function TermsAndConditions() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <header className="bg-[#1A1F36] text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FF6B35] transition-colors mb-8 text-[11px] font-bold uppercase tracking-[0.2em] group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">Terms & Conditions</h1>
          <p className="text-white/60 text-lg max-w-2xl font-medium leading-relaxed">
            Legal framework and operational guidelines for using the {BRAND} digital ecosystem.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#FF6B35]">
            <span className="px-4 py-2 bg-[#FF6B35]/15 rounded-full border border-[#FF6B35]/20 backdrop-blur-md">Effective: April 25, 2026</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-[40px] border border-[#1A1F36]/[0.07] p-8 md:p-20 shadow-xl space-y-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAFAF8] rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50" />

          <Section icon={Scale} title="1. Agreement to Terms">
            <p className="mb-4">
              Welcome to {BRAND}. By accessing our platform, you agree to be bound by these Terms & Conditions. These terms constitute a legally binding agreement between you ("User" or "Merchant") and {BRAND} Technologies Pvt Ltd regarding your use of our marketplace.
            </p>
            <p>
              If you do not agree with any part of these terms, you are prohibited from using or accessing the platform.
            </p>
          </Section>

          <Section icon={UserCheck} title="2. User Accounts & Responsibilities">
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Account Security:</span> You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</li>
              <li><span className="font-bold text-[#1A1F36]">Information Accuracy:</span> You represent and warrant that all information provided during registration is accurate, current, and complete.</li>
              <li><span className="font-bold text-[#1A1F36]">Suspension:</span> We reserve the right to suspend or terminate accounts that provide false information or violate our security protocols.</li>
            </ul>
          </Section>

          <Section icon={AlertTriangle} title="3. Platform Usage & Prohibitions">
            <p className="mb-4">You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc space-y-3 pl-5">
              <li>Copying, distributing, or disclosing any part of the service in any medium.</li>
              <li>Using any automated system (robots, spiders, etc.) to access the service.</li>
              <li>Attempting to interfere with the servers or network security of {BRAND}.</li>
              <li>Listing products or services that are illegal under Indian law or infringe on the rights of others.</li>
              <li>Impersonating another person or entity or misrepresenting your affiliation.</li>
            </ul>
          </Section>

          <Section icon={Gavel} title="4. Shop Listings & Content">
            <ul className="list-disc space-y-3 pl-5">
              <li><span className="font-bold text-[#1A1F36]">Merchant Ownership:</span> Sellers are solely responsible for the content of their listings, including descriptions, pricing, and images.</li>
              <li><span className="font-bold text-[#1A1F36]">Accuracy Guarantee:</span> Merchants must ensure that their product/service info is accurate and not misleading to customers.</li>
              <li><span className="font-bold text-[#1A1F36]">Audit Rights:</span> {BRAND} reserves the right to review, edit, or remove any content that violates these terms or our quality standards.</li>
            </ul>
          </Section>

          <Section icon={MessageSquare} title="5. Lead Generation & Communication">
            <p>
              {BRAND} facilitates connections via WhatsApp and other channels. We are not a party to the actual transactions between buyers and sellers. We do not guarantee the completion of any transaction or the conduct of any user.
            </p>
          </Section>

          <Section icon={Shield} title="6. Intellectual Property">
            <p>
              The {BRAND} platform, including its original content (excluding user-generated shop content), features, and functionality, are and will remain the exclusive property of {BRAND} Technologies. Our trademarks and brand assets may not be used without prior written consent.
            </p>
          </Section>

          <Section icon={HelpCircle} title="7. Limitation of Liability">
            <p>
              In no event shall {BRAND}, nor its directors, employees, or partners, be liable for any indirect, incidental, or consequential damages resulting from your use of the platform. We provide the service on an "as is" and "as available" basis without any warranties of any kind.
            </p>
          </Section>

          <Section icon={AlertTriangle} title="8. Termination">
            <p>
              We may terminate or suspend your access to our platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive.
            </p>
          </Section>

          <Section icon={Globe} title="9. Governing Law">
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi.
            </p>
          </Section>

          <Section icon={MessageSquare} title="10. Changes to Terms">
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the updated terms on our website. Your continued use of the platform after such changes constitutes acceptance of the new Terms.
            </p>
          </Section>

          <div className="pt-16 border-t border-[#1A1F36]/[0.07]">
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-8 tracking-tight">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <a href="mailto:legal@shopbajar.com" className="flex items-center gap-5 p-6 bg-[#FAFAF8] rounded-3xl border border-[#1A1F36]/[0.05] hover:border-[#FF6B35]/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#FF6B35] group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">Legal Inquiries</p>
                  <p className="font-bold text-[#1A1F36] text-[15px]">legal@shopbajar.com</p>
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
