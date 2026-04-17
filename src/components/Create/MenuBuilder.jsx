"use client";

import React from "react";
import Button from "@/components/UI/Button";
import ImageUpload from "@/components/UI/ImageUpload";
import { Plus, Trash2, LayoutGrid, Tag, PlusCircle } from "lucide-react";

/**
 * Advanced Categorized Menu Builder
 * Structure: [{ category: 'Category Name', items: [{ name, price, image }] }]
 */
const MenuBuilder = ({ menuData, onChange }) => {
  const addCategory = () => {
    onChange([...(menuData || []), { category: "", items: [{ name: "", price: "", image: "", file: null }] }]);
  };

  const removeCategory = (catIndex) => {
    if (window.confirm("Are you sure you want to delete this entire category and all its items?")) {
      const updated = (menuData || []).filter((_, i) => i !== catIndex);
      onChange(updated);
    }
  };

  const updateCategoryName = (catIndex, name) => {
    const updated = [...menuData];
    updated[catIndex].category = name;
    onChange(updated);
  };

  const addItem = (catIndex) => {
    const updated = [...menuData];
    updated[catIndex].items.push({ name: "", price: "", image: "", file: null });
    onChange(updated);
  };

  const removeItem = (catIndex, itemIndex) => {
    if (window.confirm("Delete this item?")) {
      const updated = [...menuData];
      updated[catIndex].items = updated[catIndex].items.filter((_, i) => i !== itemIndex);
      onChange(updated);
    }
  };

  const updateItem = (catIndex, itemIndex, field, value) => {
    const updated = [...menuData];
    updated[catIndex].items[itemIndex][field] = value;
    onChange(updated);
  };

  const updateItemFile = (catIndex, itemIndex, file) => {
    const updated = [...menuData];
    updated[catIndex].items[itemIndex].file = file;
    // We also set the image field to a temporary preview URL for the builder UI
    updated[catIndex].items[itemIndex].image = file ? URL.createObjectURL(file) : "";
    onChange(updated);
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {menuData?.map((section, catIndex) => (
        <div key={catIndex} className="bg-white border border-cream rounded-3xl md:rounded-[32px] p-5 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 p-2">
            <button
              type="button"
              onClick={() => removeCategory(catIndex)}
              className="text-red-300 hover:text-red-500 transition-colors p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pr-8">
            <div className="bg-primary/10 text-primary p-2 md:p-3 rounded-xl md:rounded-2xl">
              <LayoutGrid size={20} />
            </div>
            <div className="flex-1">
              <input
                required
                placeholder="Category Name"
                value={section.category}
                onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                className="text-xl md:text-2xl font-black text-navy placeholder:text-gray-200 border-none focus:ring-0 w-full p-0"
              />
              <div className="h-0.5 w-12 bg-primary/20 mt-1"></div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {section.items?.map((item, itemIndex) => (
              <div key={itemIndex} className="flex flex-col md:flex-row gap-4 md:gap-6 p-3 md:p-4 rounded-2xl border border-dashed border-cream bg-cream/5 group">
                <div className="w-full md:w-28 lg:w-32">
                  <ImageUpload
                    compact
                    onSelect={(file) => updateItemFile(catIndex, itemIndex, file)}
                    currentImage={item.image}
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                    <input
                      required
                      placeholder="e.g. Burger"
                      value={item.name}
                      onChange={(e) => updateItem(catIndex, itemIndex, "name", e.target.value)}
                      className="w-full bg-white p-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price</label>
                    <input
                      placeholder="e.g. ₹99"
                      value={item.price}
                      onChange={(e) => updateItem(catIndex, itemIndex, "price", e.target.value)}
                      className="w-full bg-white p-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                    <textarea
                      placeholder="e.g. Juicy chicken breast with farm fresh lettuce..."
                      value={item.description || ""}
                      onChange={(e) => updateItem(catIndex, itemIndex, "description", e.target.value)}
                      rows={3}
                      className="w-full bg-white p-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-bold text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end md:items-end md:pb-2">
                  <button
                    type="button"
                    onClick={() => removeItem(catIndex, itemIndex)}
                    className="text-gray-300 hover:text-red-500 p-2 border border-cream rounded-lg md:border-none"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addItem(catIndex)}
              className="w-full py-3 border-2 border-dashed border-cream rounded-2xl text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest"
            >
              <PlusCircle size={16} /> Add Item
            </button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addCategory}
        className="w-full py-5 border-2 border-navy/10 text-navy/40 hover:text-navy hover:border-navy rounded-[24px] md:rounded-[32px] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-xs"
      >
        <Plus size={18} /> New Category Section
      </Button>
    </div>
  );
};

export default MenuBuilder;
