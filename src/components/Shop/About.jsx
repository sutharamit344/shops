import React from 'react';
import Card from '@/components/UI/Card';
import { MapPin, Tag } from 'lucide-react';

const ShopAbout = ({ description, area, city, category }) => {
  return (
    <section className="py-0">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border border-primary/10">
            <Tag size={10} /> {category}
          </span>
          <span className="bg-white/5 text-white/30 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/5">
            <MapPin size={10} /> {area}, {city}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Philosophy</h2>
          <p className="text-white/60 text-[12px] leading-relaxed whitespace-pre-wrap font-medium italic">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShopAbout;
