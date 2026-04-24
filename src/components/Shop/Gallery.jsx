import React, { useState } from "react";
import { Camera, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "../UI/SectionHeader";
import Button from "../UI/Button";

const ShopGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  const showNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const showPrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="py-0">
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 px-1">
        {images.map?.((image, i) => (
          <div
            key={i}
            onClick={() => openLightbox(i)}
            className="relative rounded-xl overflow-hidden shadow-sm group cursor-pointer aspect-square border border-navy/5"
          >
            <img
              src={image}
              alt={`Gallery image ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Slider */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors shadow-none"
            onClick={closeLightbox}
          >
            <X size={40} />
          </Button>

          <Button
            variant="ghost"
            className="absolute left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white !rounded-full flex items-center justify-center transition-all shadow-none"
            onClick={showPrev}
          >
            <ChevronLeft size={32} />
          </Button>

          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={images[activeIndex]}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl scale-in-center"
              alt="Expanded gallery"
            />
          </div>

          <Button
            variant="ghost"
            className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white !rounded-full flex items-center justify-center transition-all shadow-none"
            onClick={showNext}
          >
            <ChevronRight size={32} />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 font-black text-xs uppercase tracking-widest">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopGallery;
