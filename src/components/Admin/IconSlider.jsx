import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const IconSlider = ({ options, selected, onSelect, activeColor = "#FF6A00" }) => {
  const [query, setQuery] = useState("");
  const scrollRef = React.useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(query.toLowerCase())
  );

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Icon Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6A00] transition-colors" size={14} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons (e.g. coffee, car)..."
          className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-[#1A1F36]/[0.06] rounded-xl text-[12px] font-medium outline-none focus:border-[#FF6A00]/30 focus:bg-white transition-all"
        />
      </div>

      <div className="relative group/slider">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 scroll-smooth min-h-[60px]"
        >
          {filteredOptions.map((opt) => (
            <button
              key={opt.name}
              type="button"
              onClick={() => onSelect(opt.name)}
              className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                selected === opt.name 
                  ? `scale-110 shadow-lg border-transparent` 
                  : 'bg-gray-50 text-gray-400 border-[#1A1F36]/[0.05] hover:bg-white hover:border-[#1A1F36]/[0.1] hover:text-[#1A1F36]'
              }`}
              style={selected === opt.name ? { backgroundColor: activeColor, color: '#fff' } : {}}
              title={opt.name}
            >
              <opt.icon size={22} />
            </button>
          ))}
          {filteredOptions.length === 0 && (
            <div className="flex items-center justify-center w-full py-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No icons match</p>
            </div>
          )}
        </div>
      
      {/* Navigation arrows - only show on hover */}
      <button 
        type="button"
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#1A1F36]/[0.08] rounded-full shadow-md flex items-center justify-center text-[#1A1F36] opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50 z-10"
      >
        <ChevronLeft size={16} />
      </button>
      <button 
        type="button"
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#1A1F36]/[0.08] rounded-full shadow-md flex items-center justify-center text-[#1A1F36] opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50 z-10"
      >
        <ChevronRight size={16} />
      </button>
      </div>
    </div>
  );
};

export default IconSlider;
