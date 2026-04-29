"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Star, MapPin, ShieldCheck, Clock } from "lucide-react";
import Dialog from "@/components/UI/Dialog";
import Button from "@/components/UI/Button";
import { setSortBy, toggleTag } from "@/redux/slices/filterSlice";

const FilterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { sortBy, tags } = useSelector((state) => state.filters);

  const sortOptions = [
    { id: "relevance", label: "Most Relevant", icon: Star },
    { id: "distance", label: "Nearest to Me", icon: MapPin },
    { id: "rating", label: "Highest Rated", icon: Star },
  ];

  const tagOptions = [
    { id: "openNow", label: "Open Now", icon: Clock },
    { id: "verified", label: "Verified Only", icon: ShieldCheck },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sort & Filter"
      subtitle="Refine your shop discovery"
      maxWidth="max-w-sm"
    >
      <div className="space-y-8">
        {/* Sort Section */}
        <div>
          <h4 className="text-[13px] font-bold text-[#1A1F36] uppercase tracking-wider mb-4 opacity-40">
            Sort By
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => dispatch(setSortBy(option.id))}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  sortBy === option.id
                    ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                    : "border-black/[0.04] bg-white text-[#1A1F36]/60 hover:border-black/[0.1]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <option.icon size={18} />
                  <span className="text-[14px] font-bold">{option.label}</span>
                </div>
                {sortBy === option.id && (
                  <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <h4 className="text-[13px] font-bold text-[#1A1F36] uppercase tracking-wider mb-4 opacity-40">
            Quick Filters
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {tagOptions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => dispatch(toggleTag(tag.id))}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  tags[tag.id]
                    ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                    : "border-black/[0.04] bg-white text-[#1A1F36]/60 hover:border-black/[0.1]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tag.icon size={18} />
                  <span className="text-[14px] font-bold">{tag.label}</span>
                </div>
                <div className={`w-10 h-6 rounded-full transition-all relative ${
                  tags[tag.id] ? "bg-[#FF6B35]" : "bg-gray-200"
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    tags[tag.id] ? "left-5" : "left-1"
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="dark"
          className="w-full h-14 rounded-2xl text-[15px] font-bold shadow-lg"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </div>
    </Dialog>
  );
};

export default FilterModal;
