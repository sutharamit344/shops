"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, MapPin, ShieldCheck, Clock } from "lucide-react";
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
      subtitle="Refine your discovery experience"
      maxWidth="max-w-[340px]"
      footer={
        <Button
          variant="dark"
          size="md"
          className="w-full font-semibold"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sort Section */}
        <div>
          <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-3 px-1">
            Sort Results By
          </h4>
          <div className="flex flex-col gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => dispatch(setSortBy(option.id))}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-all text-left ${sortBy === option.id
                    ? "border-[#FF6A00]/40 bg-[#FF6A00]/5 text-[#FF6A00]"
                    : "border-black/[0.05] bg-white text-[#0A0A0F]/60 hover:border-black/[0.1] hover:bg-black/[0.01]"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <option.icon size={14} className={sortBy === option.id ? "text-[#FF6A00]" : "text-[#0A0A0F]/30"} />
                  <span className={`text-[13px] font-medium ${sortBy === option.id ? "text-[#FF6A00]" : ""}`}>{option.label}</span>
                </div>
                {sortBy === option.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_8px_rgba(255,106,0,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <h4 className="text-[10px] font-bold text-[#0A0A0F]/30 uppercase tracking-[0.1em] mb-3 px-1">
            Preference
          </h4>
          <div className="flex flex-col gap-1">
            {tagOptions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => dispatch(toggleTag(tag.id))}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-all text-left ${tags[tag.id]
                    ? "border-[#FF6A00]/40 bg-[#FF6A00]/5 text-[#FF6A00]"
                    : "border-black/[0.05] bg-white text-[#0A0A0F]/60 hover:border-black/[0.1] hover:bg-black/[0.01]"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <tag.icon size={14} className={tags[tag.id] ? "text-[#FF6A00]" : "text-[#0A0A0F]/30"} />
                  <span className={`text-[13px] font-medium ${tags[tag.id] ? "text-[#FF6A00]" : ""}`}>{tag.label}</span>
                </div>

                {/* Compact Switch */}
                <div className={`w-8 h-4 rounded-full transition-all relative ${tags[tag.id] ? "bg-[#FF6A00]" : "bg-black/[0.1]"
                  }`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${tags[tag.id] ? "left-4.5" : "left-0.5"
                    }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default FilterModal;
