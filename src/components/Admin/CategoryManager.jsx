"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import { Plus, Check, X, Tag, Loader2, AlertCircle, Trash2, Shuffle, ShieldAlert } from "lucide-react";
import { 
  getCategories, getPendingCategories, approveCategory, 
  proposeCategory, addApprovedCategory, deleteAndReassignCategory,
  getClusters, getPendingClusters, approveCluster
} from "@/lib/db";
import Dialog from "@/components/UI/Dialog";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [replacementName, setReplacementName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  // Cluster State
  const [allClusters, setAllClusters] = useState([]);
  const [pendingClusters, setPendingClusters] = useState([]);
  const [selectedCatForClusters, setSelectedCatForClusters] = useState(null);
  const [clusterActionLoading, setClusterActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [cats, pends, clusters, pClusters] = await Promise.all([
      getCategories(), 
      getPendingCategories(),
      getClusters(),
      getPendingClusters()
    ]);
    setCategories(cats);
    setPending(pends);
    setAllClusters(clusters);
    setPendingClusters(pClusters);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    const res = await approveCategory(id);
    if (res.success) fetchData();
  };

  const handleApproveCluster = async (id) => {
    setClusterActionLoading(true);
    const res = await approveCluster(id);
    if (res.success) fetchData();
    setClusterActionLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setAdding(true);
    const res = await addApprovedCategory(newCat.trim());
    if (res.success) {
      setNewCat("");
      setShowAddModal(false);
      setSuccessMsg(`"${newCat}" added successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    }
    setAdding(false);
  };

  const handleDeleteClick = (cat) => {
    setCatToDelete(cat);
    setReplacementName("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    const res = await deleteAndReassignCategory(catToDelete.id, replacementName);
    if (res.success) {
      setSuccessMsg(`"${catToDelete.name}" removed and reassigned.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowDeleteModal(false);
      fetchData();
    }
    setIsDeleting(false);
  };

  const seedDefaults = async () => {
    setLoading(true);
    const defaults = ["Restaurant", "Grocery", "Clothing", "Pharmacy", "Electronics", "Salon"];
    for (const cat of defaults) {
      await addApprovedCategory(cat);
    }
    setSuccessMsg("Default categories initialized!");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchData();
  };

  if (loading) return (
    <div className="flex flex-col items-center py-24 gap-4 text-center">
      <Loader2 className="animate-spin text-[#FF6B35] w-10 h-10 mb-2" />
      <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Retrieving Taxonomy...</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Pending Categories */}
      {pending.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-8 bg-yellow-400 rounded-full"></div>
            <div>
               <h2 className="text-xl font-bold text-[#1A1F36] tracking-tight">Proposed Classifications</h2>
               <p className="text-[12px] text-[#999] font-medium tracking-wide">Suggested by shop owners during registration</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((cat) => (
              <div key={cat.id} className="p-5 flex items-center justify-between bg-white border border-[#1A1F36]/[0.07] shadow-md rounded-2xl hover:border-yellow-400/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#999] group-hover:text-yellow-500 transition-colors">
                    <Tag size={18} />
                  </div>
                   <span className="font-bold text-[#1A1F36] text-[15px] tracking-tight">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(cat.id)} className="w-10 h-10 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center border border-green-100">
                    <Check size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(cat)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Clusters */}
      {pendingClusters.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-8 bg-blue-400 rounded-full"></div>
            <div>
               <h2 className="text-xl font-bold text-[#1A1F36] tracking-tight">Proposed Clusters</h2>
               <p className="text-[12px] text-[#999] font-medium tracking-wide">Suggested groupings for smart search</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingClusters.map((cluster) => (
              <div key={cluster.id} className="p-5 flex items-center justify-between bg-white border border-[#1A1F36]/[0.07] shadow-md rounded-2xl hover:border-blue-400/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#999] group-hover:text-blue-500 transition-colors">
                    <Shuffle size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1A1F36] text-[15px] tracking-tight">{cluster.name}</span>
                    <span className="text-[10px] text-[#999] font-bold uppercase tracking-widest">{cluster.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleApproveCluster(cluster.id)} 
                    disabled={clusterActionLoading}
                    className="w-10 h-10 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center border border-green-100 disabled:opacity-50"
                  >
                    <Check size={18} />
                  </button>
                  {/* Reuse delete for rejection if needed, but for now just approve */}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Global Listing */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#FF6B35] rounded-full shadow-lg shadow-[#FF6B35]/20"></div>
            <div>
              <h2 className="text-2xl font-bold text-[#1A1F36] tracking-tight italic">Active Taxonomy</h2>
              <p className="text-[#999] font-medium text-[12px] tracking-wide uppercase">Verified industry groupings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {successMsg && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-[11px] uppercase tracking-wider bg-white px-5 py-2.5 rounded-full border border-green-100 shadow-sm animate-in fade-in zoom-in">
                <Check size={14} /> {successMsg}
              </div>
            )}
            <button 
              onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2.5 px-7 py-3.5 bg-[#1A1F36] text-white rounded-2xl font-bold text-[13px] shadow-md hover:bg-[#333] transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>
        </div>

        {/* Add Category Dialog */}
        <Dialog
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          showHeader={false}
          maxWidth="max-w-md"
        >
          <div className="p-8">
             <div className="w-14 h-14 bg-[#FF6B35] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#FF6B35]/20">
                <Plus size={28} className="text-white" />
             </div>
             <h3 className="text-xl font-bold text-[#1A1F36] mb-1">New Classification</h3>
             <p className="text-[#666] text-[14px] mb-8">Define a new industry group for the platform ecosystem.</p>

             <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Category Name</label>
                   <input
                      autoFocus
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="e.g. Luxury Watches"
                      className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.07] px-6 font-bold text-[#1A1F36] outline-none focus:border-[#FF6B35] transition-all"
                   />
                </div>
                
                <div className="flex gap-3 pt-2">
                   <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all"
                   >
                      Cancel
                   </button>
                   <button 
                    type="submit" 
                    disabled={adding || !newCat.trim()} 
                    className="flex-1 h-12 bg-[#FF6B35] text-white rounded-xl font-bold text-[13px] shadow-md shadow-[#FF6B35]/20 hover:bg-[#E85C25] transition-all disabled:opacity-50"
                   >
                      {adding ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Initialize"}
                   </button>
                </div>
             </form>
          </div>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className={`group relative flex flex-col p-5 bg-white border rounded-2xl shadow-md transition-all hover:shadow-lg ${selectedCatForClusters?.id === cat.id ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/10' : 'border-[#1A1F36]/[0.07] hover:border-[#FF6B35]/30'}`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setSelectedCatForClusters(selectedCatForClusters?.id === cat.id ? null : cat)}
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[#FF6B35] group-hover:rotate-12 transition-transform">
                    <Tag size={14} />
                  </div>
                  <span className="text-[14px] font-bold text-[#1A1F36] tracking-tight">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center border border-red-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Cluster List for this category */}
              {selectedCatForClusters?.id === cat.id && (
                <div className="space-y-2 mt-2 pt-4 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[9px] font-bold text-[#999] uppercase tracking-widest mb-3">Associated Clusters</p>
                  <div className="flex flex-wrap gap-2">
                    {allClusters
                      .filter(cluster => cluster.category === cat.name)
                      .map(cluster => (
                        <div key={cluster.id} className="px-3 py-1 bg-gray-50 text-[#1A1F36] text-[11px] font-bold rounded-lg border border-[#1A1F36]/[0.05]">
                          {cluster.name}
                        </div>
                      ))}
                    {allClusters.filter(cluster => cluster.category === cat.name).length === 0 && (
                      <p className="text-[11px] text-[#999] italic">No clusters yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-24 bg-white rounded-2xl border border-dashed border-[#1A1F36]/[0.1] shadow-md">
              <div className="w-20 h-20 bg-gray-50 text-[#ccc] rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#1A1F36] mb-2 tracking-tight">Taxonomy is Empty</h3>
              <p className="text-[#666] text-[14px] mb-10 max-w-xs mx-auto">The system needs a basic industry set to enable shop submissions.</p>
              <button 
                onClick={seedDefaults} 
                className="h-12 px-10 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] hover:bg-[#333] transition-all shadow-md"
              >
                Seed Defaults
              </button>
            </div>
          )}
        </div>
      </section>

      <Dialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        showHeader={false}
        maxWidth="max-w-md"
      >
        <div className="p-8">
           <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5 border border-red-100">
              <ShieldAlert size={28} />
           </div>
           <h3 className="text-xl font-bold text-[#1A1F36] mb-1">Decommissioning Protocol</h3>
           <p className="text-[#666] text-[14px] mb-8">You are removing <span className="font-bold text-[#1A1F36]">"{catToDelete?.name}"</span>. Choose a replacement for existing shops.</p>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Migration Target</label>
                <div className="relative">
                  <select
                    className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.07] px-6 font-bold text-[#1A1F36] outline-none focus:border-red-400 transition-all appearance-none cursor-pointer"
                    value={replacementName}
                    onChange={(e) => setReplacementName(e.target.value)}
                  >
                    <option value="">Destructive Delete (No Migration)</option>
                    {categories.filter(c => c.id !== catToDelete?.id).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#999]">
                    <Shuffle size={14} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.07] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 bg-red-600 text-white rounded-xl font-bold text-[13px] shadow-md shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Decommission"}
                </button>
              </div>
           </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
