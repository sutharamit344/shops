"use client";

import React, { useState } from "react";
import { Upload, X, ImageIcon, Loader2, Plus } from "lucide-react";
import { uploadImage } from "@/lib/storage";

const ImageUpload = ({
  onUpload,
  onSelect,
  label,
  folder = "general",
  currentImage = null,
  compact = false,
  multiple = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  React.useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // If multiple selection is allowed
    if (multiple && onSelect) {
      onSelect(files);
      e.target.value = "";
      return;
    }

    const file = files[0];
    // Local Preview for immediate feedback
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // If onSelect is provided, we defer the upload (Batch Mode)
    if (onSelect) {
      onSelect(file);
      return;
    }

    // Default: Upload immediately (Legacy/Standalone Mode)
    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
      const path = `uploads/${folder}/${fileName}`;
      const url = await uploadImage(file, path);
      onUpload(url);
      // Reset preview so the widget returns to the "+" placeholder after upload
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (onSelect) onSelect(null);
    if (onUpload) onUpload("");
  };

  const heightClass = compact ? "h-20 w-20" : "h-32 w-32";
  const containerClass = compact ? "rounded-xl" : "rounded-2xl";

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative group">
        {preview ? (
          <div className={`relative ${heightClass} ${containerClass} overflow-hidden border border-black/[0.06] bg-white shadow-sm`}>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={12} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center ${heightClass} ${containerClass} border-2 border-dashed border-black/[0.08] bg-gray-50/30 hover:bg-gray-50 hover:border-[#FF6B35]/30 transition-all cursor-pointer group`}>
            <div className="flex flex-col items-center justify-center px-3 text-center">
              {uploading ? (
                <Loader2 size={compact ? 16 : 20} className="text-[#FF6B35] animate-spin" />
              ) : (
                <>
                  <Plus size={compact ? 16 : 20} className="text-[#999] group-hover:text-[#FF6B35] transition-colors mb-1" />
                  {!compact && (
                    <p className="text-[9px] text-[#999] font-medium">Add</p>
                  )}
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              multiple={multiple}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;