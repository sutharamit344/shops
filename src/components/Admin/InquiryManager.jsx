"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  MessageSquare, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { useModal } from "@/hooks/useModal";

const InquiryManager = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showAlert, showConfirm } = useModal();

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetched);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const handleToggleRead = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "read" ? "new" : "read";
      await updateDoc(doc(db, "contact_messages", id), {
        status: newStatus
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    showConfirm({
      title: "Delete Inquiry",
      message: "Are you sure you want to permanently delete this message?",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "contact_messages", id));
          setMessages(prev => prev.filter(m => m.id !== id));
          showAlert({ title: "Deleted", message: "Inquiry has been removed.", type: "success" });
        } catch (error) {
          console.error("Error deleting inquiry:", error);
        }
      }
    });
  };

  const filteredMessages = messages.filter(m => {
    const matchesFilter = filter === "all" || m.status === filter;
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36] tracking-tight mb-2">Customer Inquiries</h1>
          <p className="text-[14px] text-[#666]">Manage messages and support requests from the contact form.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchMessages} 
            className="w-12 h-12 bg-white border border-[#1A1F36]/[0.07] rounded-xl flex items-center justify-center hover:border-[#FF6A00]/30 transition-all text-[#1A1F36]/75 shadow-md"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#FF6A00]" : ""} />
          </button>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6A00] transition-colors" size={18} />
               <input 
                 type="text"
                 placeholder="Search messages, names, emails..."
                 className="w-full h-12 bg-white border border-[#1A1F36]/[0.07] rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:border-[#FF6A00]/30 shadow-md transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-[#1A1F36]/[0.07] shadow-md">
               {["all", "new", "read"].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === f ? "bg-[#1A1F36] text-white" : "text-gray-400 hover:text-[#1A1F36]"
                   }`}
                 >
                   {f}
                 </button>
               ))}
            </div>
         </div>
         <div className="bg-white px-6 py-3 rounded-xl border border-[#1A1F36]/[0.07] shadow-md flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Inquiries</span>
            <span className="text-xl font-black text-[#1A1F36]">{messages.length}</span>
         </div>
      </div>

      {/* Message List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-[#1A1F36]/[0.07]" />)}
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden ${
                msg.status === 'new' ? 'border-[#FF6A00]/20 bg-white' : 'border-[#1A1F36]/[0.07] opacity-80'
              }`}
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                    msg.status === 'new' ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <User size={24} />
                    {msg.status === 'new' && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF6A00] rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#1A1F36] mb-1">{msg.name}</h3>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                         <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-[#FF6A00] transition-colors"><Mail size={12} /> {msg.email}</a>
                         <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                         <span className="flex items-center gap-1.5"><Calendar size={12} /> {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : "Just now"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleToggleRead(msg.id, msg.status)}
                         className={`h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                           msg.status === 'new' ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-[#1A1F36] hover:text-white'
                         }`}
                       >
                         {msg.status === 'new' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                         {msg.status === 'new' ? 'Mark as Read' : 'Mark as Unread'}
                       </button>
                       <button 
                         onClick={() => handleDelete(msg.id)}
                         className="h-9 w-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>

                  <div className="bg-[#FAFAF8] p-5 rounded-xl border border-[#1A1F36]/[0.03]">
                     <p className="text-[10px] font-black text-[#1A1F36]/30 uppercase tracking-[0.2em] mb-3">Subject: {msg.subject}</p>
                     <p className="text-[#1A1F36]/80 text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-[#1A1F36]/[0.05] rounded-3xl py-32 text-center shadow-md">
           <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
              <MessageSquare size={40} />
           </div>
           <h3 className="text-xl font-black text-[#1A1F36] mb-2 tracking-tight">Zero Inquiries Found</h3>
           <p className="text-gray-400 text-sm font-medium">When users fill out your contact form, they will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default InquiryManager;
