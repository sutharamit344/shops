"use client";

import React, { useEffect, useState } from "react";
import { getGlobalLogs } from "@/lib/db";
import Pagination from "@/components/UI/Pagination";
import { Clock, User, Info, CheckCircle2, XCircle, AlertCircle, ShoppingBag, Tag, Trash2, ArrowRight } from "lucide-react";
import Card from "@/components/UI/Card";

const GlobalActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const data = await getGlobalLogs();
      setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getLogIcon = (action) => {
    switch (action) {
      case "CREATE": return <ShoppingBag size={14} />;
      case "APPROVE": 
      case "APPROVE_UPDATE": return <CheckCircle2 size={14} />;
      case "REJECT": return <XCircle size={14} />;
      case "CAT_CREATE": return <Tag size={14} />;
      case "DELETE": return <Trash2 size={14} />;
      case "UPDATE_SUBMIT": return <AlertCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  const getActionLabel = (action) => {
    return action.replace("_", " ").toLowerCase();
  };

  if (loading) return (
    <div className="space-y-4 py-8">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-32 bg-white rounded-[24px] animate-pulse border border-black/[0.06] shadow-sm"></div>
      ))}
    </div>
  );

  if (logs.length === 0) return (
    <div className="bg-white border border-black/[0.06] rounded-[32px] py-24 text-center shadow-sm">
       <div className="w-20 h-20 bg-gray-50 text-[#ccc] rounded-[28px] flex items-center justify-center mx-auto mb-6">
          <History size={40} />
       </div>
       <h3 className="text-xl font-bold text-[#0F0F0F] mb-1">No activity recorded yet</h3>
       <p className="text-[14px] text-[#666]">The audit trail will appear here as the platform evolves.</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-5 px-2">
        <div className="w-1.5 h-12 bg-[#0F0F0F] rounded-full"></div>
        <div>
          <h2 className="text-[28px] font-bold text-[#0F0F0F] tracking-tight italic">Platform Ledger</h2>
          <p className="text-[13px] font-medium text-[#999] tracking-wide uppercase">immutable audit trail</p>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedLogs.map((log) => (
          <div key={log.id} className="p-6 bg-white border border-black/[0.06] hover:border-[#FF6B35]/30 hover:shadow-xl hover:shadow-black/[0.02] transition-all rounded-[28px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F0F0F]/5 group-hover:bg-[#FF6B35] transition-colors"></div>
            <div className="flex items-start gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                log.action.includes('APPROVE') ? 'bg-green-50 text-green-600 border-green-100' : 
                log.action.includes('REJECT') ? 'bg-red-50 text-red-500 border-red-100' : 
                log.action.includes('CAT') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-[#666] border-black/[0.04]'
              }`}>
                {getLogIcon(log.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0F0F0F] text-white shadow-lg shadow-black/10">
                      {getActionLabel(log.action)}
                    </span>
                    <span className="text-[12px] font-medium text-[#999] flex items-center gap-1.5">
                      <Clock size={12} className="opacity-40" /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[12px] font-bold text-[#0F0F0F] flex items-center gap-2">
                     <User size={12} className="text-[#FF6B35]" /> {log.performedBy}
                  </div>
                </div>
                
                <p className="text-[15px] font-bold text-[#0F0F0F] mb-3 tracking-tight">{log.details}</p>
                
                {log.entityId && (
                  <div className="text-[11px] font-bold text-[#999] uppercase tracking-widest flex items-center gap-2">
                    <span className="opacity-40">Ref:</span> <span className="text-[#FF6B35]">{log.entityId.slice(0, 8)}...</span> <ArrowRight size={12} className="opacity-40" /> <span className="text-[#0F0F0F]">{log.entityType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
           <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
             totalItems={logs.length}
             itemsPerPage={itemsPerPage}
           />
        </div>
      )}
    </div>
  );
};

export default GlobalActivity;
