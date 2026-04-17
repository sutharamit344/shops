import React from 'react';
import { Phone, MessageSquare, Share2, QrCode } from 'lucide-react';
import Button from '@/components/UI/Button';

const ShopHeader = ({ name, phone, shareUrl, logo, primaryColor }) => {
  const whatsappUrl = `https://wa.me/91${phone}?text=Hi%20I%20found%20your%20shop%20on%20ShopSetu`;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name} on ShopSetu!`,
          url: shareUrl || window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl || window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <header className="bg-white border-b border-cream sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          {logo && (
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 shadow-sm"
              style={{ borderColor: primaryColor || '#E94E1B' }}
            >
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="shop-name text-lg md:text-2xl font-black text-navy truncate uppercase tracking-tighter">
            {name}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} className="p-3 hidden md:flex">
            <Share2 size={20} />
          </Button>
          <a href={`tel:+91${phone}`}>
            <Button variant="outline" className="p-3">
              <Phone size={20} />
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="whatsapp" className="p-3">
              <MessageSquare size={20} />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
