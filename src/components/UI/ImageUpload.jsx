"use client";

import React, { useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/storage";

const ImageUpload = ({ onUpload, onSelect, label, folder = "general", currentImage = null, compact = false, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // If multiple selection is allowed
    if (multiple && onSelect) {
      onSelect(files);
      // Reset input value so the same files can be selected again (clears the "field" as requested)
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

  const heightClass = compact ? "h-24 md:h-32" : "h-40 md:h-52";

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>}
      
      <div className="relative group">
        {preview ? (
          <div className={`relative w-full ${heightClass} rounded-2xl md:rounded-3xl overflow-hidden border-2 border-cream shadow-sm`}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <button 
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={14} />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={24} />
              </div>
            )}
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center w-full ${heightClass} rounded-2xl md:rounded-3xl border-2 border-dashed border-cream bg-cream/10 hover:bg-cream/30 transition-all cursor-pointer group`}>
            <div className="flex flex-col items-center justify-center px-4 text-center">
               {uploading ? (
                 <Loader2 className="text-primary animate-spin" size={24} />
               ) : (
                 <>
                   <Upload className="text-primary group-hover:-translate-y-1 transition-transform mb-2" size={compact ? 20 : 28} />
                   <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-tighter">Photo</p>
                 </>
               )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} multiple={multiple} />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
