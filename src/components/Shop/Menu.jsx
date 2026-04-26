import React, { useState } from "react";
import { UtensilsCrossed, X, ShoppingBag, ServerIcon, Search } from "lucide-react";


const ShopMenu = ({ menu, businessType = "mixed", onItemClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  if (!menu || menu.length === 0) return null;

  const isServiceOnly = businessType === "service";

  const sections = Array.isArray(menu[0]?.items)
    ? menu
    : [{ category: isServiceOnly ? "Our Services" : "Catalog", items: menu }];

  const categories = ["all", ...sections.map((s) => s.category)];

  const filteredSections = sections
    .map((section) => {
      const catName = section.category || "";
      if (activeCategory !== "all" && activeCategory !== catName) return null;

      const filteredItems = section.items?.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      });

      if (!filteredItems || filteredItems.length === 0) return null;
      return { ...section, items: filteredItems };
    })
    .filter(Boolean);

  return (
    <section className="py-0 space-y-4">
      {/* Refined Search Pod */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-primary transition-colors" size={16} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-navy/10 rounded-md focus:border-primary/50 outline-none text-[13px] font-medium transition-all text-navy placeholder:text-navy/20 shadow-sm"
        />
      </div>

      {/* Modern Category Pills */}
      {!searchQuery && categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                ${activeCategory === cat
                  ? "bg-navy text-white border-navy shadow-md scale-[1.02]"
                  : "bg-white text-navy/40 border-navy/10 hover:border-navy/20 shadow-sm"}
              `}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      )}

      {/* High-End Item Grid */}
      <div className="space-y-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-navy/5 rounded-md border border-dashed border-navy/10">
            <p className="text-navy/20 text-[10px] font-black uppercase tracking-widest">
              No results found
            </p>
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-5 px-1">
                <h3 className="text-[11px] font-black text-navy/40 uppercase tracking-[0.4em] italic">{section.category}</h3>
                <div className="h-[1px] flex-1 bg-navy/5"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => onItemClick(item)}
                    className="cursor-pointer group bg-white p-2.5 rounded-md border border-navy/10 hover:border-primary/40 hover:bg-navy/[0.01] shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4"
                  >
                    {item.image ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-navy/5 flex items-center justify-center text-navy/10 flex-shrink-0">
                        <ShoppingBag size={20} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-bold text-navy text-[12px] truncate uppercase tracking-tight italic">
                          {item.name}
                        </h4>
                        {item.price && (
                          <span className="text-primary font-black text-[11px]">
                            ₹{Number(item.price)}
                          </span>
                        )}
                      </div>
                      <p className="text-navy/30 text-[9px] font-medium line-clamp-1 italic">
                        {item.description || "Premium selection"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ShopMenu;
