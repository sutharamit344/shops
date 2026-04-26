"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + showMax - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - showMax + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em] italic">
        Showing <span className="text-navy">{startItem}-{endItem}</span> of <span className="text-navy">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-3 !rounded-md border border-navy/10 bg-white text-navy disabled:opacity-20 hover:bg-navy hover:text-white transition-all shadow-md group"
          title="First Page"
        >
          <ChevronsLeft size={16} className="group-hover:scale-110 transition-transform" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-3 !rounded-md border border-navy/10 bg-white text-navy disabled:opacity-20 hover:bg-navy hover:text-white transition-all shadow-md"
        >
          <ChevronLeft size={18} />
        </Button>
        
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "primary" : "ghost"}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 !rounded-md font-black text-[10px] transition-all shadow-md transform ${
                currentPage === page 
                ? "bg-navy text-white scale-110 z-10" 
                : "bg-white text-navy/40 border border-navy/10 hover:border-navy/30 hover:bg-navy/5"
              }`}
            >
              {String(page).padStart(2, '0')}
            </Button>
          ))}
        </div>

        {/* Next Page */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-3 !rounded-md border border-navy/10 bg-white text-navy disabled:opacity-20 hover:bg-navy hover:text-white transition-all shadow-md"
        >
          <ChevronRight size={18} />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-3 !rounded-md border border-navy/10 bg-white text-navy disabled:opacity-20 hover:bg-navy hover:text-white transition-all shadow-md group"
          title="Last Page"
        >
          <ChevronsRight size={16} className="group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
