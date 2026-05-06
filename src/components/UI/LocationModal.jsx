"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Check, X, Map as MapIcon, Edit3, Loader2, Navigation } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

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

  // Sync coords when detected location changes (initial load or refresh)
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1F36]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] animate-in zoom-in-95 duration-300">
        {/* Header - Compact */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-[#FF6A00]">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A1F36] tracking-tight leading-none mb-1">Change Location</h2>
              <p className="text-[12px] text-[#1A1F36]/50 font-bold">Pin your location on the map</p>
            </div>
          </div>
        </div>

        {/* Map Section - Compact */}
        <div className="px-5 mb-4">
          <div className="relative rounded-[20px] overflow-hidden border border-[#1A1F36]/[0.08] shadow-inner h-[180px] bg-gray-50">
            <MapComponent center={mapCoords} onLocationSelect={handleMapClick} />
            {isGeocoding && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <Loader2 size={20} className="text-[#FF6A00] animate-spin" />
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] font-black text-[#1A1F36]/20 uppercase tracking-[0.15em]">
            Tap map to move pin
          </p>
        </div>

        {/* Address Display - Compact */}
        <div className="px-5 mb-5">
          <div className="bg-[#FAFAF8] rounded-[20px] p-4 border border-[#1A1F36]/[0.04]">
            <div className="flex items-start gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF6A00] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[15px] font-black text-[#1A1F36] leading-tight truncate">
                  {addressData.area || addressData.village || "Select on Map"}
                </p>
                <p className="text-[12px] font-bold text-[#1A1F36]/40 truncate">
                  {addressData.city}{addressData.pincode ? ` • ${addressData.pincode}` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Compact */}
        <div className="px-5 pb-5 space-y-4">
          <div className="flex gap-2.5">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 h-12 rounded-xl border-[#1A1F36]/[0.08] text-[#1A1F36]/60 font-black text-[13px]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              className="flex-1 h-12 rounded-xl shadow-lg shadow-[#FF6A00]/20 font-black text-[13px]"
              onClick={handleApply}
            >
              Save
            </Button>
          </div>

          {/* Refresh Current Location - Inline */}
          <div className="flex justify-center">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-[12px] font-extrabold text-[#FF6A00] hover:text-[#FF6A00]/80 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Navigation size={12} fill="currentColor" />
              )}
              Use My Current Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
