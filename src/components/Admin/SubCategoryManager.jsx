"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import { Plus, Check, X, Tag, Loader2, AlertCircle, Trash2, Edit2, Search, Layers, ChevronDown, Utensils, Coffee, Shirt, Smartphone, Stethoscope, ShoppingBag, Hammer, Pill, Scissors, Dumbbell, Camera, Car, Gift, Home, Briefcase, Store, Hash, Wrench, Settings, Plug, PaintBucket, Construction, HardHat, Bike, Truck, Fuel, Cake, IceCream, Dog, Flower2, Book, Apple, UtensilsCrossed, Pizza, Beef, Beer, Wine, Sandwich, Egg, Fish, Cookie, Croissant, Bean, Candy, Soup, Milk, Gamepad2, Music, Mic2, ChefHat, Glasses, PawPrint } from "lucide-react";
import {
  getCategories,
  getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory
} from "@/lib/db";
import Dialog from "@/components/UI/Dialog";
import { useToast } from "@/hooks/useToast";
import IconSlider from "./IconSlider";

const ICON_OPTIONS = [
  { name: "Layers", icon: Layers },
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

const SubCategoryIcon = ({ name, className = "w-4 h-4" }) => {
  const option = ICON_OPTIONS.find(o => o.name === name) || ICON_OPTIONS[0];
  const IconComponent = option.icon;
  return <IconComponent className={className} />;
};

const SubCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newIcon, setNewIcon] = useState("Layers");
  const [subToEdit, setSubToEdit] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedParent, setEditedParent] = useState("");
  const [editedIcon, setEditedIcon] = useState("Layers");
  const [subToDelete, setSubToDelete] = useState(null);

  // Action Loading
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([
        getCategories(),
        getSubCategories()
      ]);
      setCategories(cats);
      setSubCategories(subs);
      if (cats.length > 0) {
        setNewParent(cats[0].name);
      }
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
    if (!newName.trim() || !newParent) return;
    setIsProcessing(true);
    const res = await addSubCategory(newName.trim(), newParent, newIcon);
    if (res.success) {
      setNewName("");
      setNewIcon("Layers");
      setShowAddModal(false);
      success("Subcategory added successfully!");
      fetchData();
    } else {
      error(res.error || "Failed to add subcategory");
    }
    setIsProcessing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editedName.trim() || !editedParent || !subToEdit) return;
    setIsProcessing(true);
    const res = await updateSubCategory(subToEdit.id, editedName.trim(), editedParent, editedIcon);
    if (res.success) {
      setShowEditModal(false);
      success("Subcategory updated successfully!");
      fetchData();
    } else {
      error(res.error || "Update failed.");
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!subToDelete) return;
    setIsProcessing(true);
    const res = await deleteSubCategory(subToDelete.id);
    if (res.success) {
      setShowDeleteModal(false);
      success("Subcategory removed.");
      fetchData();
    } else {
      error(res.error || "Deletion failed.");
    }
    setIsProcessing(false);
  };

  const filteredSubs = subCategories.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.parentCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center py-24 gap-4 text-center">
      <Loader2 className="animate-spin text-[#FF6A00] w-10 h-10 mb-2" />
      <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Mapping Taxonomy Hierarchy...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header & Controls */}
      <div className="bg-white rounded-[32px] border border-[#1A1F36]/[0.06] shadow-md overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#1A1F36]/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1F36] tracking-tight">Sub Category Master</h2>
            <p className="text-[13px] text-[#999] font-medium mt-1">Define specific niches within your primary industries.</p>
          </div>
          <div className="flex items-center gap-3">
            {searchQuery && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00]/5 border border-[#FF6A00]/10 rounded-lg animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-widest">{filteredSubs.length} Found</span>
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6A00] transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subcategories..."
                className="pl-11 pr-6 py-2.5 bg-white border border-[#1A1F36]/[0.08] rounded-xl outline-none focus:border-[#FF6A00] transition-all text-[13px] font-medium w-64"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="h-10 px-6 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] hover:bg-[#333] transition-all active:scale-95 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} /> Add Subcategory
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#1A1F36]/[0.04]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest">Subcategory Name</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest">Parent Industry</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1F36]/[0.02]">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1A1F36]/5 text-[#1A1F36] rounded-xl flex items-center justify-center group-hover:bg-[#FF6A00] group-hover:text-white transition-all">
                        <SubCategoryIcon name={sub.icon} size={18} />
                      </div>
                      <span className="font-bold text-[#1A1F36] text-[15px]">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
                      <span className="text-[13px] font-bold text-[#1A1F36]/75">{sub.parentCategory}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSubToEdit(sub);
                          setEditedName(sub.name);
                          setEditedParent(sub.parentCategory);
                          setEditedIcon(sub.icon || "Layers");
                          setShowEditModal(true);
                        }}
                        className="w-10 h-10 bg-gray-50 text-[#1A1F36]/60 rounded-xl hover:bg-[#1A1F36] hover:text-white transition-all flex items-center justify-center border border-black/[0.03]"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => { setSubToDelete(sub); setShowDeleteModal(true); }}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No subcategories found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">
          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">New Subcategory</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Subcategory Name</label>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all"
                placeholder="e.g. Engine Specialist"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Parent Category</label>
              <div className="relative">
                <select
                  value={newParent}
                  onChange={e => setNewParent(e.target.value)}
                  className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Select Icon</label>
              <IconSlider 
                options={ICON_OPTIONS} 
                selected={newIcon} 
                onSelect={setNewIcon} 
                activeColor="#FF6A00"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={isProcessing || !newName.trim()} className="flex-1 h-12 bg-[#FF6A00] text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-[#E85C25] transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Initialize"}</button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog isOpen={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">

          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">Update Sub category</h3>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">New Name</label>
              <input autoFocus value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Parent Category</label>
              <div className="relative">
                <select
                  value={editedParent}
                  onChange={e => setEditedParent(e.target.value)}
                  className="w-full h-14 rounded-xl bg-gray-50 border border-[#1A1F36]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
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
              <button type="submit" disabled={isProcessing || !editedName.trim()} className="flex-1 h-12 bg-[#1A1F36] text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-[#333] transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Subcategory"}</button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100 mx-auto"><Trash2 size={28} /></div>
          <h3 className="text-xl font-bold text-[#1A1F36] mb-1">Remove Subcategory</h3>
          <p className="text-[#666] text-[14px] mb-8">Are you sure you want to delete <span className="font-bold text-red-500">"{subToDelete?.name}"</span>? This action is permanent.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 h-12 bg-white border border-[#1A1F36]/[0.06] rounded-xl text-[#1A1F36] font-bold text-[13px] hover:bg-gray-50 transition-all">Abort</button>
            <button onClick={handleDelete} disabled={isProcessing} className="flex-1 h-12 bg-red-600 text-white rounded-xl font-bold text-[13px] shadow-md hover:bg-red-700 transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirm Deletion"}</button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default SubCategoryManager;
