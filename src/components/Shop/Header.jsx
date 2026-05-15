import React, { useState, useEffect } from 'react';
import { Phone, Share2, QrCode, ChevronLeft, MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/useModal';

const ShopHeader = ({ name, phone, shareUrl, logo, isSticky, onQRClick }) => {
  const router = useRouter();
  const { showAlert } = useModal();
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappUrl = `https://wa.me/91${phone}?text=Hi%20I%20found%20your%20shop%20on%20ShopBajar`;

  const handleShare = async () => {
    const shareData = {
      title: name,
      text: `Check out ${name} on ShopBajar!`,
      url: shareUrl || (typeof window !== "undefined" ? window.location.href : ""),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          fallbackCopy();
        }
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || (typeof window !== "undefined" ? window.location.href : ""));
      setShowCopiedFeedback(true);
      setTimeout(() => setShowCopiedFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showAlert({
        title: "Sharing Failed",
        message: "Unable to copy the link automatically. Please copy the URL from your browser address bar.",
        type: "error"
      });
    }
  };

  const handleWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.04L0 24l6.117-1.605a11.803 11.803 0 005.925 1.598h.005c6.635 0 12.032-5.396 12.035-12.031a11.772 11.772 0 00-3.517-8.503z" />
    </svg>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-black/[0.05] py-2 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)]'
            : 'bg-transparent py-4'
          }`}
      >
        <div className="flex items-center justify-between px-4 h-12 max-w-7xl mx-auto">
          {/* Left Section - Back Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isScrolled
                  ? 'bg-black/[0.03] text-[#0F0F0F] hover:bg-black/[0.08]'
                  : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                }`}
              aria-label="Go back"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <div className={`flex items-center gap-3 transition-all duration-500 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              {logo && (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-black/[0.06] shadow-sm">
                  <img src={logo} alt={name} className="w-full h-full object-cover" />
                </div>
              )}

              <h1 className="text-[15px] font-bold text-[#0F0F0F] truncate max-w-[150px] md:max-w-md tracking-tight">
                {name}
              </h1>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-[12px] font-bold rounded-lg hover:shadow-[0_4px_15px_-3px_rgba(37,211,102,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => window.location.href = `tel:+91${phone}`}
                className={`flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${isScrolled
                    ? 'bg-[#0F0F0F] text-white shadow-lg shadow-black/10'
                    : 'bg-white text-[#0F0F0F] shadow-lg shadow-black/5'
                  }`}
              >
                <Phone size={16} />
                <span>Call Shop</span>
              </button>
            </div>

            {/* Mobile/Compact Icons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleWhatsApp}
                className={`md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isScrolled
                    ? 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                  }`}
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} strokeWidth={2.5} />
              </button>

              <button
                onClick={handleShare}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isScrolled
                    ? 'bg-black/[0.03] text-[#0F0F0F] hover:bg-black/[0.08]'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                  }`}
                aria-label="Share"
              >
                <Share2 size={18} strokeWidth={2.5} />
              </button>

              {onQRClick && (
                <button
                  onClick={onQRClick}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isScrolled
                      ? 'bg-black/[0.03] text-[#0F0F0F] hover:bg-black/[0.08]'
                      : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20'
                    }`}
                  aria-label="QR Code"
                >
                  <QrCode size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification for Copied Link */}
      {showCopiedFeedback && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
          <div className="bg-[#0F0F0F] text-white px-4 py-2.5 rounded-lg shadow-lg text-[12px] font-medium flex items-center gap-2">
            <span>✓</span>
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ShopHeader;
