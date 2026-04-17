import React from "react";
import Card from "@/components/UI/Card";
import { UtensilsCrossed, Tag, Camera } from "lucide-react";

const ShopMenu = ({ menu }) => {
  if (!menu || menu.length === 0) return null;

  // Handle both legacy flat array and new categorized structure
  const sections = Array.isArray(menu[0]?.items)
    ? menu
    : [{ category: "Our Menu / Services", items: menu }];

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-primary/20 text-primary p-2.5 rounded-xl md:rounded-2xl">
          <UtensilsCrossed size={24} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tighter">Menu & <span className="text-primary italic">Services</span></h2>
        </div>
      </div>

      <div className="space-y-10 md:space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-black text-navy flex items-center gap-2 px-2 uppercase tracking-tight">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              {section.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {section.items?.map((item, i) => (
                <Card key={i} className="hover:shadow-xl transition-all border-cream bg-white overflow-hidden p-0 group rounded-2xl md:rounded-3xl">
                  <div className="flex">
                    {item.image && (
                      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative overflow-hidden bg-cream/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-center min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <h4 className="font-extrabold text-navy text-base md:text-lg leading-tight truncate">{item.name}</h4>
                        {item.price && (
                          <span className="text-primary font-black whitespace-nowrap text-sm md:text-base">{item.price}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-[10px] md:text-xs font-semibold line-clamp-2 mt-1 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-gray-400 text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-60">
                        verified service
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopMenu;
