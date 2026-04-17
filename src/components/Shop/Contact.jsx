import React from 'react';
import Card from '@/components/UI/Card';
import { Phone, MessageSquare, MapPin } from 'lucide-react';
import Button from '@/components/UI/Button';

const ShopContact = ({ phone, area, city, name }) => {
  const whatsappUrl = `https://wa.me/91${phone}?text=Hi%20I%20found%20${name}%20on%20ShopSetu`;

  return (
    <section className="py-8 mb-20">
      <Card className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-bold text-navy">Get in touch</h2>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={20} className="text-primary" />
            <span>{area}, {city}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={20} className="text-primary" />
            <span>+91 {phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href={`tel:+91${phone}`} className="w-full">
            <Button variant="dark" className="w-full py-4">
              <Phone size={20} /> Call Now
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="whatsapp" className="w-full py-4">
              <MessageSquare size={20} /> WhatsApp
            </Button>
          </a>
        </div>
      </Card>
    </section>
  );
};

export default ShopContact;
