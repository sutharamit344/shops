import React from 'react';
import Card from '@/components/UI/Card';
import { Phone, MessageSquare, MapPin } from 'lucide-react';
import Button from '@/components/UI/Button';

const ShopContact = ({ phone, area, city, name }) => {
  const whatsappUrl = `https://wa.me/91${phone}?text=Hi%20I%20found%20${name}%20on%20ShopSetu`;

  return (
    <section className="py-0 h-full">
      <div className="text-center space-y-6 flex flex-col justify-center h-full">
        <h2 className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Connect</h2>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5 text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5 w-full justify-center">
            <MapPin size={12} className="text-primary" />
            <span>{area}, {city}</span>
          </div>

          <div className="flex items-center gap-2.5 text-white/40 text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5 w-full justify-center">
            <Phone size={12} className="text-primary" />
            <span>+91 {phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <a href={`tel:+91${phone}`} className="w-full">
            <Button size="sm" className="w-full bg-primary text-white py-3 rounded-xl shadow-lg shadow-primary/10 transition-all text-[10px] font-black uppercase tracking-widest">
              <Phone size={12} /> Call Now
            </Button>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button size="sm" className="w-full bg-[#25D366] text-white py-3 rounded-xl shadow-lg shadow-[#25D366]/10 transition-all text-[10px] font-black uppercase tracking-widest">
              <MessageSquare size={12} /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ShopContact;
