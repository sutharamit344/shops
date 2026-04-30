"use client";

import React, { useEffect, useState } from "react";
import { Clock, History, RefreshCw, Calendar, CheckCircle2, Edit, Eye, AlertCircle } from "lucide-react";
import { getEntityLogs } from "@/lib/db";
import Button from "@/components/UI/Button";
import Dialog from "@/components/UI/Dialog";

const ShopHistoryDialog = ({ shop, isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && shop?.id) {
      const fetchLogs = async () => {
        setLoading(true);
        const data = await getEntityLogs(shop.id);
        setLogs(data);
        setLoading(false);
      };
      fetchLogs();
    }
  }, [isOpen, shop?.id]);

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <CheckCircle2 size={12} />;
    }
    if (actionLower.includes('edit') || actionLower.includes('update')) {
      return <Edit size={12} />;
    }
    if (actionLower.includes('reject') || actionLower.includes('delete')) {
      return <AlertCircle size={12} />;
    }
    return <Clock size={12} />;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Audit History"
      subtitle={`Complete modification history for ${shop?.name || 'shop'}`}
      icon={History}
      maxWidth="max-w-2xl"
    >
      <div className="relative">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#FF6B35] border-t-transparent animate-spin"></div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
              Loading history...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#FF6B35]/5 rounded-2xl flex items-center justify-center mx-auto">
              <Clock size={32} className="text-[#999]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#0F0F0F] mb-1">No history recorded</p>
              <p className="text-[12px] text-[#999]">No modifications have been made to this shop yet.</p>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[15px] top-6 bottom-6 w-[1px] bg-black/[0.06]"></div>

            {logs.map((log, idx) => (
              <div key={log.id || idx} className="relative flex gap-4 group">
                {/* Timeline Dot */}
                <div className="relative z-10 w-8 h-8 bg-white rounded-xl border border-black/[0.06] flex items-center justify-center text-[#FF6B35] group-hover:border-[#FF6B35]/30 group-hover:bg-[#FF6B35]/5 transition-all shrink-0">
                  {getActionIcon(log.action || log.details)}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#0F0F0F] bg-gray-50 px-3 py-1 rounded-lg border border-black/[0.04]">
                        {log.performedBy || 'System Admin'}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-[#999] flex items-center gap-1">
                      <Calendar size={10} />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#666] leading-relaxed pl-1">
                    {log.details || `${log.action} performed on shop`}
                  </p>

                  {log.changes && (
                    <div className="mt-2 pl-1">
                      <div className="bg-gray-50 rounded-lg p-3 text-[11px] font-mono text-[#666] border border-black/[0.04]">
                        {JSON.stringify(log.changes, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-black/[0.06] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-black/[0.06] text-[#0F0F0F] text-[11px] font-semibold rounded-xl hover:bg-gray-50 hover:border-[#FF6B35]/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ShopHistoryDialog;
