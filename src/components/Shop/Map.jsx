import React from 'react';
import Card from '@/components/UI/Card';
import { MapPin } from 'lucide-react';

const ShopMap = ({ area, city, mapEmbed }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="bg-primary/20 text-primary p-2.5 rounded-xl md:rounded-2xl">
          <MapPin size={24} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-navy uppercase tracking-tighter">Shop <span className="text-primary italic">Location</span></h2>
        </div>
      </div>

      <Card className="p-0 overflow-hidden h-[300px] md:h-[450px] rounded-3xl md:rounded-[40px] border-cream shadow-xl shadow-cream/20">
        {mapEmbed ? (
          <iframe
            src={mapEmbed}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shop Location"
            className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          ></iframe>
        ) : (
          <div className="w-full h-full bg-cream/10 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-primary/50 mb-4">
              <MapPin size={32} />
            </div>
            <p className="text-navy font-black uppercase tracking-widest text-sm mb-2">Location Information</p>
            <p className="text-gray-500 font-medium text-xs md:text-sm">
              {area}, {city}
            </p>
          </div>
        )}
      </Card>
    </section>
  );
};

export default ShopMap;
