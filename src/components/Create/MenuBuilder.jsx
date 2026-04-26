"use client";

import React from "react";
import Button from "@/components/UI/Button";
import ImageUpload from "@/components/UI/ImageUpload";
import { useModal } from "@/hooks/useModal";
import { Plus, Trash2, LayoutGrid, PlusCircle } from "lucide-react";

const UNIT_OPTIONS = [
  { group: "Common", units: ["pc", "unit", "pkg", "set"] },
  { group: "Weight/Vol", units: ["kg", "gm", "ltr", "ml", "box", "pkt"] },
  { group: "Service", units: ["hr", "min", "session", "visit", "person", "sqft"] }
];

/**
 * Advanced Menu Builder: Redesigned for Proper Alignment and Field Structure
 */
const MenuBuilder = ({ menuData, onChange, businessType = "mixed" }) => {
  const { showConfirm } = useModal();
  const isService = businessType === "service";

  const addCategory = () => {
    onChange([...(menuData || []), { 
      category: isService ? "Our Services" : "Our Products", 
      defaultUnit: isService ? "session" : "pc",
      items: [{ name: "", price: "", unit: isService ? "session" : "pc", description: "", image: "", file: null }] 
    }]);
  };

  const removeCategory = (catIndex) => {
    showConfirm({
      title: "Remove Category",
      message: `Are you sure you want to remove the "${menuData[catIndex].category}" category? All items inside will be deleted from your draft.`,
      confirmText: "Remove Category",
      type: "error",
      onConfirm: () => {
        const updated = (menuData || []).filter((_, i) => i !== catIndex);
        onChange(updated);
      }
    });
  };

  const updateCategoryName = (catIndex, name) => {
    const updated = [...menuData];
    updated[catIndex].category = name;
    onChange(updated);
  };

  const updateCategoryUnit = (catIndex, unit) => {
    const updated = [...menuData];
    updated[catIndex].defaultUnit = unit;
    updated[catIndex].items = updated[catIndex].items.map(item => ({ ...item, unit }));
    onChange(updated);
  };

  const addItem = (catIndex) => {
    const updated = [...menuData];
    const defaultUnit = updated[catIndex].defaultUnit || (isService ? "session" : "pc");
    updated[catIndex].items.push({ name: "", price: "", unit: defaultUnit, image: "", file: null });
    onChange(updated);
  };

  const removeItem = (catIndex, itemIndex) => {
    const updated = [...menuData];
    updated[catIndex].items = updated[catIndex].items.filter((_, i) => i !== itemIndex);
    onChange(updated);
  };

  const updateItem = (catIndex, itemIndex, field, value) => {
    const updated = [...menuData];
    updated[catIndex].items[itemIndex][field] = value;
    onChange(updated);
  };

  const updateItemFile = (catIndex, itemIndex, file) => {
    const updated = [...menuData];
    updated[catIndex].items[itemIndex].file = file;
    updated[catIndex].items[itemIndex].image = file ? URL.createObjectURL(file) : "";
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {menuData?.map((section, catIndex) => (
        <div key={catIndex} className="bg-white border border-gray-200 rounded-3xl p-5 md:p-8 relative">
          {/* Category Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2.5 bg-primary/5 text-primary rounded-xl">
                <LayoutGrid size={22} />
              </div>
              <div className="flex-1">
                <input
                  required
                  placeholder="Category Name"
                  value={section.category}
                  onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                  className="w-full text-xl md:text-2xl font-black text-navy placeholder:text-gray-200 border-b border-transparent focus:border-primary outline-none transition-all p-0 bg-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Default Unit</span>
                <select 
                  value={section.defaultUnit || ""}
                  onChange={(e) => updateCategoryUnit(catIndex, e.target.value)}
                  className="bg-transparent text-sm font-bold text-navy outline-none cursor-pointer"
                >
                  {UNIT_OPTIONS.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.units.map(u => <option key={u} value={u}>/{u}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => removeCategory(catIndex)} 
                className="p-2 text-gray-300 hover:text-red-500 shadow-none !rounded-md"
              >
                <Trash2 size={20} />
              </Button>
            </div>
          </div>

          {/* Item List */}
          <div className="space-y-6">
            {section.items?.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-4 md:gap-6 group items-start">
                {/* 1. Image Hub */}
                <div className="w-20 md:w-28 flex-shrink-0">
                  <ImageUpload compact onSelect={(file) => updateItemFile(catIndex, itemIndex, file)} currentImage={item.image} />
                </div>

                {/* 2. Structured Fields */}
                <div className="flex-1 space-y-4">
                  {/* Top Row: Name, Price, Unit (Perfectly Aligned) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:items-end">
                    <div className="md:col-span-6 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{isService ? "Service Name" : "Item Name"}</label>
                      <input
                        required
                        placeholder={isService ? "e.g. Haircut" : "e.g. Cheese Burger"}
                        value={item.name}
                        onChange={(e) => updateItem(catIndex, itemIndex, "name", e.target.value)}
                        className="w-full bg-gray-50/30 p-3 rounded-xl border border-gray-200 focus:border-primary font-bold text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={item.price}
                        onChange={(e) => updateItem(catIndex, itemIndex, "price", e.target.value)}
                        className="w-full bg-gray-50/30 p-3 rounded-xl border border-gray-200 focus:border-primary font-bold text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                      <select 
                        value={item.unit || ""}
                        onChange={(e) => updateItem(catIndex, itemIndex, "unit", e.target.value)}
                        className="w-full bg-gray-50/30 p-3 rounded-xl border border-gray-200 focus:border-primary font-bold text-sm outline-none cursor-pointer appearance-none"
                      >
                        {UNIT_OPTIONS.map(group => (
                          <optgroup key={group.group} label={group.group}>
                            {group.units.map(u => <option key={u} value={u}>/{u}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bottom Row: Description (Aligned properly under identity) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      {isService ? "Detailed Description" : "Product Details"}
                    </label>
                    <textarea
                      placeholder={isService ? "Duration, what's included..." : "Features, ingredients..."}
                      value={item.description || ""}
                      onChange={(e) => updateItem(catIndex, itemIndex, "description", e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50/30 p-3 rounded-xl border border-gray-200 focus:border-primary font-medium text-sm outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* 3. Action Hub */}
                <div className="flex flex-col justify-center pt-5">
                   <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => removeItem(catIndex, itemIndex)} 
                    className="p-2 text-gray-200 hover:text-red-500 shadow-none !rounded-md"
                   >
                     <Trash2 size={18} />
                   </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              type="button"
              onClick={() => addItem(catIndex)}
              className="w-full py-4 border border-dashed border-gray-200 !rounded-2xl text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-none"
            >
              <PlusCircle size={18} /> Add {isService ? "Service" : "Item"}
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addCategory}
        className="w-full py-6 border-dashed border-navy/10 text-navy/40 hover:text-navy hover:border-navy uppercase font-black tracking-[0.2em] text-[11px]"
      >
        <Plus size={18} className="mr-1" /> New {isService ? "Service Category" : "Product Group"}
      </Button>
    </div>
  );
};

export default MenuBuilder;
