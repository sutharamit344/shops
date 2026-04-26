"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import { approveShop, rejectShop, verifyShopUpdate } from "@/lib/db";
import { useModal } from "@/hooks/useModal";
import ShopHistoryDialog from "@/components/Shop/HistoryDialog";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AlertCircle, Check, History, Mail, MapPin, RefreshCw, ShieldCheck, Store, X, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { slugify } from "@/lib/slugify";

const AdminShopCard = ({ shop, onRefresh, isSelected = false, onToggleSelect }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reason, setReason] = useState("");

  const { showAlert, showConfirm } = useModal();

  const handleApprove = async () => {
    showConfirm({
      title: "Approve Shop",
      message: `Are you sure you want to approve "${shop.name}"? This will make the shop live and public.`,
      confirmText: "Yes, Approve",
      onConfirm: async () => {
        setLoading(true);
        const res = await approveShop(shop.id, user?.email);
        if (res.success) {
          onRefresh();
        } else {
          showAlert({ title: "Error", message: "Error approving shop. Please try again.", type: "error" });
        }
        setLoading(false);
      }
    });
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return showAlert({ title: "Error", message: "Please provide a reason for rejection", type: "error" });

    setLoading(true);
    const res = await rejectShop(shop.id, reason, user?.email);
    if (res.success) {
      setShowRejectForm(false);
      onRefresh();
    } else {
      showAlert({ title: "Error", message: "Error rejecting shop. Please try again.", type: "error" });
    }
    setLoading(false);
  };

  const handleVerifyUpdate = async () => {
    setLoading(true);
    const res = await verifyShopUpdate(shop.id, user?.email);
    if (res.success) {
      onRefresh();
    } else {
      showAlert({ title: "Error", message: "Error verifying update. Please try again.", type: "error" });
    }
    setLoading(false);
  };

  // Determine view context
  const isUpdate = shop.needsVerification === true;
  const isApproved = shop.status === 'approved' && !isUpdate;
  const isRejected = shop.status === 'rejected';
  const isPending = shop.status === 'pending';

  return (
    <div className={`bg-white rounded-2xl border shadow-md hover:shadow-lg transition-all p-5 group relative overflow-hidden ${
      isSelected
        ? "border-[#FF6B35]/60 shadow-[#FF6B35]/10"
        : "border-[#1A1F36]/[0.07] hover:border-[#FF6B35]/30"
    }`}>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1A1F36]/5 group-hover:bg-[#FF6B35] transition-colors" />

      {/* Checkbox */}
      {onToggleSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(shop.id); }}
          className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all z-10 ${
            isSelected ? "bg-[#FF6B35] border-[#FF6B35]" : "bg-white border-gray-200 hover:border-[#FF6B35]/50"
          }`}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </button>
      )}

      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div className="flex-1 flex items-center gap-5 min-w-0">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-[#1A1F36]/[0.07] shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <Store size={24} className="text-[#FF6B35]" />
            )}
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-[17px] font-bold text-[#1A1F36] tracking-tight truncate max-w-[300px]">{shop.name}</h3>

              {isUpdate && (
                <div className="bg-[#FF6B35]/10 text-[#FF6B35] px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#FF6B35]/20 animate-pulse">
                  <RefreshCw size={10} className="animate-spin" /> Audit Update
                </div>
              )}

              {isApproved && (
                <div className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-green-100">
                  <CheckCircle2 size={10} /> Live
                </div>
              )}

              {isRejected && (
                <div className="bg-red-50 text-red-500 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-100">
                  <AlertCircle size={10} /> Rejected
                </div>
              )}

              {isPending && !isUpdate && (
                <div className="bg-[#FF6B35]/10 text-[#FF6B35] px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#FF6B35]/20">
                  <Clock size={10} /> Pending
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] font-medium text-[#666] tracking-wide">
              <span className="text-[#FF6B35] font-bold">{shop.category}</span>
              <span className="flex items-center gap-1.5"><MapPin size={12} className="opacity-40" /> {shop.city}</span>
              <span className="flex items-center gap-1.5 hidden sm:flex"><Mail size={12} className="opacity-40" /> {shop.ownerEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:min-w-fit">
          {isApproved && (
            <Link
              href={`/${slugify(shop.city)}/${slugify(shop.category)}/${slugify(shop.slug)}`}
              target="_blank"
              className="px-4 py-2 bg-white border border-[#1A1F36]/[0.07] hover:border-[#1A1F36] rounded-xl text-[11px] font-bold uppercase tracking-wider text-[#1A1F36] transition-all flex items-center gap-2 shadow-md"
            >
              <ExternalLink size={14} /> View Page
            </Link>
          )}

          {isUpdate && (
            <button
              onClick={handleVerifyUpdate}
              disabled={loading}
              className="px-6 py-2 bg-[#1A1F36] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-2 hover:bg-[#333] transition-all"
            >
              <Check size={14} /> Verify Update
            </button>
          )}

          {(isPending || isRejected) && (
            <>
              <button
                onClick={handleApprove}
                disabled={loading}
                 className="px-6 py-2 bg-green-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-md shadow-green-600/20 flex items-center gap-2 hover:bg-green-700 transition-all"
              >
                <Check size={14} /> Approve
              </button>

              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={loading}
                 className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${showRejectForm ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-[#1A1F36]/[0.07] text-[#1A1F36]/60 hover:border-red-500 hover:text-red-500'}`}
              >
                <X size={14} /> {showRejectForm ? 'Cancel' : 'Reject'}
              </button>
            </>
          )}

          {(isUpdate || isApproved || isPending) && (
            <button
              onClick={() => setShowHistory(true)}
               className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#1A1F36]/60 hover:bg-[#1A1F36] hover:text-white transition-all shadow-md"
              title="Audit Logs"
            >
              <History size={16} />
            </button>
          )}
        </div>
      </div>

      {showRejectForm && (
        <form onSubmit={handleReject} className="mt-5 pt-5 border-t border-[#1A1F36]/[0.07] animate-in slide-in-from-top-2 duration-300">
          <div className="flex gap-3">
            <input
              required
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this shop being rejected? (Shown to owner)"
              className="flex-1 px-4 py-3 bg-red-50/50 border border-red-100 rounded-xl text-[13px] text-red-900 placeholder:text-red-300 outline-none focus:border-red-400 transition-all"
            />
            <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 px-6 py-3 text-white rounded-xl shadow-md shadow-red-500/20 text-[11px] font-bold uppercase tracking-wider transition-all">
              Confirm Rejection
            </button>
          </div>
        </form>
      )}

      <ShopHistoryDialog
        shop={shop}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};

export default AdminShopCard;
