"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import {
  Plus, Check, X, Tag, Loader2, AlertCircle, Trash2, Edit2, Search,
  Utensils, Coffee, Shirt, Smartphone, Stethoscope, ShoppingBag,
  Hammer, Pill, Scissors, Dumbbell, Camera,
  Car, Gift, Home, Briefcase, Store, Hash,
  Wrench, Settings, Plug, PaintBucket, Construction, HardHat,
  Bike, Truck, Fuel, Cake, IceCream, Dog, Flower2, Book, Apple,
  UtensilsCrossed, Pizza, Beef, Beer, Wine, Sandwich, Egg, Fish,
  Cookie, Croissant, Bean, Candy, Soup, Milk, Gamepad2, Music, Mic2,
  ChefHat, Glasses, PawPrint
} from "lucide-react";
import {
  getCategories, getPendingCategories, approveCategory,
  updateCategory, addApprovedCategory, deleteAndReassignCategory,
  getClusters, getPendingClusters, approveCluster, rejectCluster
} from "@/lib/db";
import Dialog from "@/components/UI/Dialog";
import { useToast } from "@/hooks/useToast";
import IconSlider from "./IconSlider";

const ICON_OPTIONS = [
  { name: "Tag", icon: Tag },
  { name: "Utensils", icon: Utensils },
  { name: "UtensilsCrossed", icon: UtensilsCrossed },
  { name: "Coffee", icon: Coffee },
  { name: "Croissant", icon: Croissant },
  { name: "Cookie", icon: Cookie },
  { name: "Cake", icon: Cake },
  { name: "IceCream", icon: IceCream },
  { name: "Pizza", icon: Pizza },
  { name: "Sandwich", icon: Sandwich },
  { name: "Soup", icon: Soup },
  { name: "Beef", icon: Beef },
  { name: "Fish", icon: Fish },
  { name: "Egg", icon: Egg },
  { name: "Milk", icon: Milk },
  { name: "Bean", icon: Bean },
  { name: "Candy", icon: Candy },
  { name: "Beer", icon: Beer },
  { name: "Wine", icon: Wine },
  { name: "ChefHat", icon: ChefHat },
  { name: "Shirt", icon: Shirt },
  { name: "Smartphone", icon: Smartphone },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Hammer", icon: Hammer },
  { name: "Pill", icon: Pill },
  { name: "Scissors", icon: Scissors },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Camera", icon: Camera },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Music", icon: Music },
  { name: "Mic2", icon: Mic2 },
  { name: "Car", icon: Car },
  { name: "Bike", icon: Bike },
  { name: "Truck", icon: Truck },
  { name: "Fuel", icon: Fuel },
  { name: "Gift", icon: Gift },
  { name: "Home", icon: Home },
  { name: "Briefcase", icon: Briefcase },
  { name: "Store", icon: Store },
  { name: "Wrench", icon: Wrench },
  { name: "Settings", icon: Settings },
  { name: "Plug", icon: Plug },
  { name: "PaintBucket", icon: PaintBucket },
  { name: "Construction", icon: Construction },
  { name: "HardHat", icon: HardHat },
  { name: "Dog", icon: Dog },
  { name: "PawPrint", icon: PawPrint },
  { name: "Flower2", icon: Flower2 },
  { name: "Book", icon: Book },
  { name: "Apple", icon: Apple },
  { name: "Glasses", icon: Glasses }
];

const CategoryIcon = ({ name, className = "w-4 h-4" }) => {
  const option = ICON_OPTIONS.find(o => o.name === name) || ICON_OPTIONS[0];
  const IconComponent = option.icon;
  return <IconComponent className={className} />;
};

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [newCat, setNewCat] = useState("");
  const [newIcon, setNewIcon] = useState("Tag");
  const [catToEdit, setCatToEdit] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedIcon, setEditedIcon] = useState("Tag");
  const [catToDelete, setCatToDelete] = useState(null);
  const [replacementName, setReplacementName] = useState("");

  // Action Loading
  const [isProcessing, setIsProcessing] = useState(false);

  // Clusters
  const [allClusters, setAllClusters] = useState([]);
  const [pendingClusters, setPendingClusters] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Fetch failed:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setIsProcessing(true);
    const res = await addApprovedCategory(newCat.trim(), newIcon);
    if (res.success) {
      setNewCat("");
      setNewIcon("Tag");
      setShowAddModal(false);
      success("Category initialized successfully!");
      fetchData();
    } else {
      error(res.error || "Failed to add category");
    }
    setIsProcessing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editedName.trim() || !catToEdit) return;
    setIsProcessing(true);
    const res = await updateCategory(catToEdit.id, editedName.trim(), editedIcon);
    if (res.success) {
      setShowEditModal(false);
      success("Global taxonomy updated.");
      fetchData();
    } else {
      error(res.error || "Update failed.");
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    setIsProcessing(true);
    const res = await deleteAndReassignCategory(catToDelete.id, replacementName);
    if (res.success) {
      setShowDeleteModal(false);
      success("Category removal complete.");
      fetchData();
    } else {
      error(res.error || "Deletion failed.");
    }
    setIsProcessing(false);
  };

  const handleApprove = async (id) => {
    const res = await approveCategory(id);
    if (res.success) fetchData();
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center py-24 gap-4 text-center">
      <Loader2 className="animate-spin text-[#FF6A00] w-10 h-10 mb-2" />
      <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Taxonomy Audit in Progress...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Pending Section */}
      {(pending.length > 0 || pendingClusters.length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-8 bg-yellow-400 rounded-full"></div>
            <h2 className="text-[20px] font-bold text-[#1A1F36]">Review Proposals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(cat => (
              <div key={cat.id} className="p-4 bg-white border border-yellow-200 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-yellow-500" />
                  <span className="font-bold text-[#1A1F36]">{cat.name}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full uppercase tracking-wider">New Category</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(cat.id)} className="w-9 h-9 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"><Check size={16} /></button>
                  <button onClick={() => { setCatToDelete(cat); setShowDeleteModal(true); }} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {pendingClusters.map(cluster => (
              <div key={cluster.id} className="p-4 bg-white border border-blue-200 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <Hash size={16} className="text-blue-500" />
                  <div className="min-w-0">
                    <p className="font-bold text-[#1A1F36] truncate">{cluster.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{cluster.category} • Cluster</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveCluster(cluster.id).then(fetchData)} className="w-9 h-9 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"><Check size={16} /></button>
                  <button onClick={() => rejectCluster(cluster.id).then(fetchData)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Listing Section */}
      <div className="bg-white rounded-[32px] border border-[#1A1F36]/[0.06] shadow-md overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#1A1F36]/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1F36] tracking-tight">Category Master</h2>
            <p className="text-[13px] text-[#999] font-medium mt-1">Manage platform taxonomy and industry groupings.</p>
          </div>
          <div className="flex items-center gap-3">
            {searchQuery && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00]/5 border border-[#FF6A00]/10 rounded-lg animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-widest">{filteredCategories.length} Found</span>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6A00] transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="pl-11 pr-6 py-2.5 bg-white border border-[#1A1F36]/[0.08] rounded-xl outline-none focus:border-[#FF6A00] transition-all text-[13px] font-medium w-64"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-10 px-6 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] hover:bg-[#333] transition-all active:scale-95 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#1A1F36]/[0.04]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest text-center">Associated Clusters</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1F36]/[0.02]">
              {filteredCategories.map((cat) => {
                const clusterCount = allClusters.filter(c => c.category === cat.name).length;
                return (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#FF6A00]/10 text-[#FF6A00] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CategoryIcon name={cat.icon} className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[#1A1F36] text-[15px]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold ${clusterCount > 0 ? 'bg-[#1A1F36] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {clusterCount} Clusters
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setCatToEdit(cat);
                            setEditedName(cat.name);
                            setEditedIcon(cat.icon || "Tag");
                            setShowEditModal(true);
                          }}
                          className="w-10 h-10 bg-gray-50 text-[#1A1F36]/75 rounded-xl hover:bg-[#1A1F36] hover:text-white transition-all flex items-center justify-center border border-black/[0.03]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setCatToDelete(cat); setReplacementName(""); setShowDeleteModal(true); }}
                          className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCategories.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No categories found matching your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">
          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">New Category</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Name</label>
              <input autoFocus value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all" placeholder="e.g. Wellness Spa" />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Select Visual Icon</label>
              <IconSlider 
                options={ICON_OPTIONS} 
                selected={newIcon} 
                onSelect={setNewIcon} 
                activeColor="#FF6A00"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={isProcessing || !newCat.trim()} className="flex-1 h-12 bg-[#FF6A00] text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-[#E85C25] transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Initialize"}</button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">
          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">Update Classification</h3>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">New Name</label>
              <input autoFocus value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all" />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Change Icon</label>
              <IconSlider 
                options={ICON_OPTIONS} 
                selected={editedIcon} 
                onSelect={setEditedIcon} 
                activeColor="#1A1F36"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={isProcessing || !editedName.trim()} className="flex-1 h-12 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-[#333] transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Global"}</button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100"><Trash2 size={28} /></div>
          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">Remove Category</h3>
          <p className="text-[#666] text-[14px] mb-8">You are deleting <span className="font-bold text-red-500">"{catToDelete?.name}"</span>. Choose a migration target for shops.</p>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Migration Target</label>
              <select
                value={replacementName}
                onChange={e => setReplacementName(e.target.value)}
                className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-red-400 cursor-pointer appearance-none"
              >
                <option value="">Destructive (No Migration)</option>
                {categories.filter(c => c.id !== catToDelete?.id).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all">Abort</button>
              <button onClick={handleDelete} disabled={isProcessing} className="flex-1 h-12 bg-red-600 text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-red-700 transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirm Deletion"}</button>
            </div>
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default CategoryManager;
