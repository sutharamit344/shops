import React from 'react';
import Card from '@/components/UI/Card';
import { MapPin, Tag } from 'lucide-react';

const ShopAbout = ({ description, area, city, category }) => {
  return (
    <section className="py-8">
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-cream text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Tag size={12} /> {category}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} /> {area}, {city}
          </span>
        </div>
        <h2 className="text-xl font-bold text-navy">About our shop</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </Card>
    </section>
  );
};

export default ShopAbout;
