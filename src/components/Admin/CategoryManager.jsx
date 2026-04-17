"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/UI/Card";
import Button from "@/components/UI/Button";
import { Plus, Check, X, Tag, Loader2, AlertCircle, Trash2, Shuffle } from "lucide-react";
import { getCategories, getPendingCategories, approveCategory, proposeCategory, addApprovedCategory, deleteAndReassignCategory } from "@/lib/db";

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

  const fetchData = async () => {
    setLoading(true);
    const [cats, pends] = await Promise.all([getCategories(), getPendingCategories()]);
    setCategories(cats);
    setPending(pends);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    const res = await approveCategory(id);
    if (res.success) fetchData();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setAdding(true);
    const res = await addApprovedCategory(newCat.trim());
    if (res.success) {
      setNewCat("");
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
    <div className="flex flex-col items-center py-20 gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-navy font-black uppercase tracking-widest text-xs">Loading Categories...</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Pending Requests */}
      {pending.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1 h-8 bg-yellow-400 rounded-full"></div>
            <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Proposed Categories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((cat) => (
              <Card key={cat.id} className="p-4 flex items-center justify-between bg-white border-yellow-100 shadow-yellow-100/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Tag size={18} /></div>
                  <span className="font-bold text-navy">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(cat.id)} className="bg-whatsapp hover:bg-green-600 p-2 rounded-lg">
                    <Check size={18} />
                  </Button>
                  <Button onClick={() => handleDeleteClick(cat)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors border border-red-100">
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Add New */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Add Category</h2>
          </div>
          {successMsg && (
            <div className="flex items-center gap-2 text-whatsapp font-bold text-xs animate-bounce bg-green-50 px-4 py-2 rounded-full border border-green-100">
               <Check size={14} /> {successMsg}
            </div>
          )}
        </div>
        <Card className="p-6 rounded-[32px] border-cream bg-white">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Enter category name..."
              className="flex-1 p-4 rounded-2xl bg-cream/20 border-none focus:ring-2 focus:ring-primary font-bold"
            />
            <Button type="submit" disabled={adding} className="px-8 rounded-2xl">
              {adding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
            </Button>
          </form>
        </Card>
      </section>

      {/* active List */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1 h-8 bg-navy rounded-full"></div>
          <h2 className="text-2xl font-black text-navy uppercase tracking-tight">Active Library</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative flex items-center gap-2 px-5 py-2.5 bg-white border border-cream rounded-full text-navy font-extrabold text-sm shadow-sm hover:shadow-md transition-all">
              <Tag size={14} className="text-primary" />
              {cat.name}
              <button 
                onClick={() => handleDeleteClick(cat)}
                className="ml-2 p-1 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="w-full text-center py-20 bg-cream/10 rounded-[40px] border-2 border-dashed border-cream">
              <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-black text-navy mb-2">Category Library Empty</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Initialize the system to enable shop submissions</p>
              <Button onClick={seedDefaults} className="bg-navy hover:bg-black rounded-2xl px-10">
                Seed Default Categories
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Delete/Merge Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 rounded-[40px] border-none shadow-2xl bg-white scale-in-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-navy uppercase tracking-tight">Delete Category</h3>
              <p className="text-gray-500 font-medium">Removing <span className="text-red-500 font-bold">"{catToDelete?.name}"</span></p>
            </div>

            <div className="space-y-6">
              <div className="bg-cream/30 p-6 rounded-3xl space-y-4 border border-cream">
                <div className="flex items-center gap-3 text-sm font-black text-navy uppercase tracking-widest">
                  <Shuffle size={18} className="text-primary" />
                  Replace and Move Shops to:
                </div>
                <select 
                  className="w-full p-4 rounded-2xl bg-white border-2 border-cream focus:ring-2 focus:ring-primary font-bold text-sm"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                >
                  <option value="">Don't Replace (Dangerous)</option>
                  {categories.filter(c => c.id !== catToDelete?.id).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-relaxed">
                  All shops currently in "{catToDelete?.name}" will be automatically migrated to the new category.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20" 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Confirm Delete"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
