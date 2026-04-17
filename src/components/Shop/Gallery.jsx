import React, { useState } from "react";
import { Camera, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
          <Camera size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-navy uppercase tracking-tighter">Shop <span className="text-primary italic">Gallery</span></h2>
          <div className="h-1 w-12 bg-primary/20 mt-1"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map?.((image, i) => (
          <div
            key={i}
            onClick={() => openLightbox(i)}
            className={`relative rounded-3xl overflow-hidden shadow-md group cursor-pointer 
               ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-video md:aspect-auto" : "aspect-square"}`}
          >
            <img
              src={image}
              alt={`Gallery image ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
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
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={closeLightbox}
          >
            <X size={40} />
          </button>

          <button 
            className="absolute left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
            onClick={showPrev}
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            <img 
              src={images[activeIndex]} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl scale-in-center"
              alt="Expanded gallery"
            />
          </div>

          <button 
            className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
            onClick={showNext}
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 font-black text-xs uppercase tracking-widest">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
};

export default ShopGallery;
