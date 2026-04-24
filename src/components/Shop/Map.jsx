import React from 'react';
import Card from '@/components/UI/Card';
import SectionHeader from '@/components/UI/SectionHeader';

const ShopMap = ({ area, city, mapEmbed }) => {
  return (
    <section className="py-2">
      <SectionHeader title="Location" subtitle="Visit our physical store" />
      <Card className="p-0 overflow-hidden mt-4 h-64 shadow-sm border-cream">
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
          ></iframe>
        ) : (
          <div className="w-full h-full bg-cream/10 flex flex-col items-center justify-center p-10 text-center">
             <p className="text-navy/40 font-bold text-xs uppercase tracking-widest">{area}, {city}</p>
             <p className="text-[10px] text-gray-400 mt-2">Map view not available</p>
          </div>
        )}
      </Card>
    </section>
  );
};

export default ShopMap;
