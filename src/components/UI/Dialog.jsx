"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Modern Dialog Component
 * Re-designed for premium cloud platform aesthetics: compact spacing, clean typography.
 */
export default function Dialog({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon: Icon,
  maxWidth = "max-w-md",
  showClose = true,
  showHeader = true,
  footer
}) {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0A0A0F]/40 backdrop-blur-[4px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full ${maxWidth} shadow-2xl border border-black/[0.05] animate-in zoom-in-95 duration-200 relative max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-black/[0.05] flex-shrink-0">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
                  <Icon size={16} />
                </div>
              )}
              <div>
                <h3 className="text-[15px] font-semibold text-[#0A0A0F] tracking-tight leading-none">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[12px] text-[#0A0A0F]/40 mt-1 leading-none font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#0A0A0F]/30 hover:bg-black/[0.04] hover:text-[#0A0A0F] transition-all"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-black/[0.05] flex-shrink-0 bg-[#F7F7F5]/50 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
