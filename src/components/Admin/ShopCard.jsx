"use client";

import React, { useState } from "react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import { Check, X, Store, Mail, MapPin, ExternalLink, Trash2 } from "lucide-react";
import { approveShop, rejectShop } from "@/lib/db";

const AdminShopCard = ({ shop, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    if (!confirm(`Approve "${shop.name}"?`)) return;
    setLoading(true);
    const res = await approveShop(shop.id);
    if (res.success) {
      onRefresh();
    } else {
      alert("Error approving shop");
    }
    setLoading(false);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return alert("Please provide a reason for rejection");

    setLoading(true);
    const res = await rejectShop(shop.id, reason);
    if (res.success) {
      onRefresh();
    } else {
      alert("Error rejecting shop");
    }
    setLoading(false);
  };

  return (
    <Card className="hover:shadow-lg transition-all border-cream bg-white">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center text-primary">
              <Store size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-black text-navy">{shop.name}</h3>
                {shop.status === "update-review" && (
                  <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20 animate-pulse">
                    Update Case
                  </span>
                )}
              </div>
              <p className="text-primary text-sm font-semibold uppercase">{shop.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span>{shop.ownerEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span>{shop.area}, {shop.city}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm italic line-clamp-2">"{shop.description}"</p>
        </div>

        <div className="flex md:flex-col gap-3 justify-center min-w-[140px]">
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="bg-whatsapp hover:bg-green-600 text-white flex items-center justify-center gap-2 py-2.5 px-4 shadow-md hover:shadow-lg rounded-xl"
          >
            <Check size={18} /> Approve
          </Button>

          <Button
            onClick={() => setShowRejectForm(!showRejectForm)}
            disabled={loading}
            variant="outline"
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all ${showRejectForm ? 'bg-red-50 border-red-200 text-red-600' : 'text-gray-500 border-gray-100 hover:bg-gray-50'
              }`}
          >
            <X size={18} /> {showRejectForm ? 'Cancel' : 'Reject'}
          </Button>
        </div>
      </div>

      {showRejectForm && (
        <form onSubmit={handleReject} className="mt-6 pt-6 border-t border-cream animate-in slide-in-from-top duration-300">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2 block">Rejection Reason</label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Please provide a clearer shop image or correct the phone number."
            className="w-full p-4 bg-red-50/30 border-none focus:ring-2 focus:ring-red-200 rounded-2xl text-sm font-medium mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200">
              Confirm Rejection
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default AdminShopCard;
