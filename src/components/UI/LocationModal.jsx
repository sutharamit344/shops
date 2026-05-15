"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Check, X, Map as MapIcon, Edit3, Loader2, Navigation } from "lucide-react";
import Button from "./Button";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

const LocationModal = ({ isOpen, onClose, detectedLocation, onConfirm, onRefresh, isRefreshing }) => {
  const [mapCoords, setMapCoords] = useState({ lat: 23.0225, lng: 72.5714 }); // Default to Ahmedabad
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressData, setAddressData] = useState({
    area: detectedLocation?.area || "",
    city: detectedLocation?.city || "",
    village: detectedLocation?.village || "",
    pincode: detectedLocation?.pincode || ""
  });

  // Sync coords when detected location changes
  useEffect(() => {
    if (detectedLocation?.lat && detectedLocation?.lng) {
      const lat = parseFloat(detectedLocation.lat);
      const lng = parseFloat(detectedLocation.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCoords({ lat, lng });
        setAddressData({
          area: detectedLocation.area || "",
          city: detectedLocation.city || "",
          village: detectedLocation.village || "",
          pincode: detectedLocation.pincode || ""
        });
      }
    }
  }, [detectedLocation]);

  const handleMapClick = async (latlng) => {
    setMapCoords({ lat: latlng.lat, lng: latlng.lng });
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=en`,
        { headers: { "User-Agent": "ShopBajar/1.0 (contact: sutharamit344@gmail.com)" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      
      const city = addr.city || addr.city_district || addr.state_district || addr.town || addr.village || "";
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || "";
      const village = addr.village || addr.hamlet || "";
      const pincode = addr.postcode || "";

      setAddressData({
        city,
        area,
        village,
        pincode
      });
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  if (!isOpen) return null;

  const handleApply = () => {
    onConfirm(addressData, true, mapCoords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0F]/40 backdrop-blur-[4px] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[340px] rounded-lg overflow-hidden shadow-2xl border border-black/[0.05] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-black/[0.05]">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-[15px] font-semibold text-[#0A0A0F] tracking-tight">Location Context</h2>
            <button onClick={onClose} className="p-1 rounded-md text-[#0A0A0F]/30 hover:bg-black/[0.04] hover:text-[#0A0A0F] transition-all">
              <X size={14} />
            </button>
          </div>
          <p className="text-[12px] text-[#0A0A0F]/40 font-medium">Pin your precise discovery area</p>
        </div>

        {/* Map Section */}
        <div className="p-4">
          <div className="relative rounded-lg overflow-hidden border border-black/[0.08] h-[160px] bg-gray-50">
            <MapComponent center={mapCoords} onLocationSelect={handleMapClick} />
            {isGeocoding && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                <Loader2 size={16} className="text-[#FF6A00] animate-spin" />
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-center">
             <span className="text-[10px] font-semibold text-[#0A0A0F]/20 uppercase tracking-widest">Tap to adjust marker</span>
          </div>
        </div>

        {/* Selection Info */}
        <div className="px-4 mb-4">
          <div className="bg-[#F7F7F5] rounded-lg p-3 border border-black/[0.03] flex items-start gap-3">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF6A00] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#0A0A0F] truncate leading-tight">
                {addressData.area || addressData.village || "Searching..."}
              </p>
              <p className="text-[11px] font-medium text-[#0A0A0F]/40 truncate mt-0.5">
                {addressData.city}{addressData.pincode ? ` • ${addressData.pincode}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="md" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              className="flex-1 font-semibold"
              onClick={handleApply}
            >
              Set Location
            </Button>
          </div>

          <div className="flex justify-center border-t border-black/[0.03] pt-3">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-[12px] font-semibold text-[#FF6A00] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Navigation size={12} className="fill-current" />
              )}
              Current Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
