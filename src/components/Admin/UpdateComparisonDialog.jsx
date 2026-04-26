"use client";

import React, { useEffect, useState } from "react";
import { getShopById, getEntityLogs } from "@/lib/db";
import { X, ArrowRight, Image as ImageIcon, Check, Info, RefreshCw, Loader2, History, Clock } from "lucide-react";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";


const UpdateComparisonDialog = ({ shop, isOpen, onClose }) => {
  const [original, setOriginal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && (shop.originalId || shop.id)) {
      const fetchReviewData = async () => {
        setLoading(true);
        const [originalData, logsData] = await Promise.all([
          shop.originalId ? getShopById(shop.originalId) : Promise.resolve(null),
          getEntityLogs(shop.originalId || shop.id)
        ]);
        setOriginal(originalData);
        setHistory(logsData);
        setLoading(false);
      };
      fetchReviewData();
    }
  }, [isOpen, shop.originalId, shop.id]);

  if (!isOpen) return null;

  // Calculate exactly what changed
  const getChanges = () => {
    if (!original) return [];
    
    const fields = [
      { key: 'logo', label: 'Shop Logo', type: 'image' },
      { key: 'name', label: 'Shop Name' },
      { key: 'category', label: 'Category' },
      { key: 'phone', label: 'WhatsApp Contact' },
      { key: 'description', label: 'Description' },
      { key: 'area', label: 'Locality/Area' },
    ];

    return fields.filter(field => {
      const oldVal = original[field.key];
      const newVal = shop[field.key];
      return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    }).map(field => ({
      ...field,
      oldVal: original[field.key],
      newVal: shop[field.key]
    }));
  };

  const ChangeRecord = ({ label, oldVal, newVal, type }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#1A1F36]/[0.07] shadow-md animate-in slide-in-from-left duration-300">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
        <RefreshCw size={14} className="text-[#FF6B35]" />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest">{label} Updated</p>
        
        {type === 'image' ? (
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase block">From</span>
              {oldVal ? <img src={oldVal} className="h-12 w-12 object-cover rounded-lg border border-gray-100" /> : <ImageIcon size={20} className="text-gray-200" />}
            </div>
            <ArrowRight size={16} className="text-gray-300 mt-4" />
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-primary uppercase block">To</span>
              {newVal ? <img src={newVal} className="h-12 w-12 object-cover rounded-lg border-2 border-[#FF6B35] shadow-md" /> : <ImageIcon size={20} className="text-gray-200" />}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
             <div className="text-sm font-medium text-gray-400 line-through decoration-red-300 underline-offset-4">{oldVal || "—"}</div>
             <div className="text-sm font-black text-navy flex items-center gap-2">
                 <ArrowRight size={14} className="text-[#FF6B35]" /> {newVal || "—"}
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const changes = getChanges();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Change Summary"
      subtitle={`${shop.name} • Review Submitted Changes`}
      icon={History}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-8 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-navy font-black uppercase tracking-widest text-[10px]">Analyzing Update Case...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Proposed Changes Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw size={16} className="text-primary" />
                  <h3 className="text-[10px] font-black text-navy uppercase tracking-[0.2em]">Modified Fields ({changes.length})</h3>
                </div>
              </div>
              
              {changes.length === 0 ? (
                <div className="p-12 text-center bg-[#1A1F36]/[0.02] rounded-xl border border-[#1A1F36]/[0.07]">
                  <Check className="mx-auto text-whatsapp mb-3" size={32} />
                  <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">No primary identity changes detected.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {changes.map((change) => {
                    const { key, ...rest } = change;
                    return <ChangeRecord key={key} {...rest} />;
                  })}
                </div>
              )}
            </div>

            {/* Verified Activity Section */}
             <div className="space-y-6 pt-10 border-t border-[#1A1F36]/[0.07]">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-navy/40" />
                <h3 className="text-[10px] font-black text-navy uppercase tracking-[0.2em]">Action Activity Log</h3>
              </div>
              
              <div className="grid gap-3">
                {history.length === 0 ? (
                  <p className="text-[9px] text-navy/20 italic font-black uppercase tracking-widest text-center py-6">No audit history recorded yet.</p>
                ) : (
                  history.map(log => (
                     <div key={log.id} className="flex items-start gap-4 p-4 bg-[#1A1F36]/[0.02] rounded-xl border border-[#1A1F36]/[0.07] text-[10px]">
                       <div className="p-2 bg-white rounded-lg text-[#1A1F36]/20 shadow-md shrink-0 border border-[#1A1F36]/[0.07]">
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-bold text-navy leading-relaxed">{log.details}</p>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-navy/30">
                            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#1A1F36]/20" /> {log.performedBy}</span>
                           <span>{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Just now'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button variant="outline" className="flex-1 py-4 rounded-md border-navy/10 text-[10px] font-black uppercase tracking-widest" onClick={onClose}>
            Dismiss Review
          </Button>
           <Button className="flex-1 py-4 rounded-md shadow-md shadow-[#FF6B35]/20 text-[10px] font-black uppercase tracking-widest" onClick={onClose}>
            Close Summary
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateComparisonDialog;

