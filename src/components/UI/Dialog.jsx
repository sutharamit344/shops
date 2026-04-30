"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Modern Dialog Component
 * A clean, accessible modal dialog for your application.
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
  showHeader = true
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
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-md animate-in fade-in zoom-in duration-200 relative max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-5 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                  <Icon size={18} />
                </div>
              )}
              <div>
                <h3 className="text-[16px] font-bold text-[#0F0F0F] tracking-tight">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] text-[#999] mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] hover:bg-gray-100 hover:text-[#0F0F0F] transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 ">
          {children}
        </div>
      </div>
    </div>
  );
}
