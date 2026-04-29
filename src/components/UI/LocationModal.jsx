"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Check, X, Map as MapIcon, Edit3, Loader2, Navigation } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

const LocationModal = ({ isOpen, onClose, detectedLocation, onConfirm }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [pincodeAreas, setPincodeAreas] = useState([]);
  const [mapCoords, setMapCoords] = useState({ lat: 23.0225, lng: 72.5714 }); // Default to Ahmedabad
  const [editedData, setEditedData] = useState({
    area: detectedLocation?.area || "",
    city: detectedLocation?.city || "",
    village: detectedLocation?.village || "",
    pincode: detectedLocation?.pincode || ""
  });

  // Update map coords if detected location comes in initially with coordinates
  useEffect(() => {
    if (detectedLocation?.lat && detectedLocation?.lng) {
      setMapCoords({ lat: detectedLocation.lat, lng: detectedLocation.lng });
    }
  }, [detectedLocation]);

  // PINCODE INTELLIGENCE
  useEffect(() => {
    const fetchPin = async () => {
      if (editedData.pincode?.length === 6) {
        setIsFetchingPin(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${editedData.pincode}`);
          const data = await res.json();
          if (data[0].Status === "Success") {
            const postOffices = data[0].PostOffice;
            const details = postOffices[0];
            
            setPincodeAreas(postOffices.map(po => po.Name));
            
            setEditedData(prev => ({
              ...prev,
              city: details.District,
              area: details.Name,
              village: details.Block !== "NA" ? details.Block : ""
            }));
          }
        } catch (err) {
          console.error("PIN fetch failed", err);
        } finally {
          setIsFetchingPin(false);
        }
      }
    };
    fetchPin();
  }, [editedData.pincode]);

  const handleMapClick = async (latlng) => {
    setMapCoords({ lat: latlng.lat, lng: latlng.lng });
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=en`,
        { headers: { "User-Agent": "ShopSetu_Marketplace_App" } }
      );
      const data = await res.json();
      const address = data.address || {};
      
      const city = address.city || address.city_district || address.state_district || address.town || address.village || "";
      const area = address.suburb || address.neighbourhood || address.residential || "";
      const village = address.village || address.hamlet || "";
      const pincode = address.postcode || "";

      setEditedData({
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

  const handleConfirm = () => {
    onConfirm(editedData, isEditing, showMap ? mapCoords : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1F36]">Confirm Location</h2>
              <p className="text-[13px] text-[#1A1F36]/50 font-medium">Is this where you are right now?</p>
            </div>
          </div>

          {!isEditing ? (
            <div className="bg-[#FAFAF8] rounded-2xl p-6 border border-[#1A1F36]/[0.04] mb-8">
              <div className="space-y-4">
                {detectedLocation?.village && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[15px] font-medium text-[#1A1F36]/70">Village: {detectedLocation.village}</span>
                  </div>
                )}
                {detectedLocation?.area && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                    <span className="text-[17px] font-extrabold text-[#1A1F36]">{detectedLocation.area}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1A1F36]/20" />
                  <span className="text-[15px] font-medium text-[#1A1F36]/70">
                    {detectedLocation?.city}
                    {detectedLocation?.pincode && ` - ${detectedLocation.pincode}`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {!showMap ? (
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center gap-2 font-bold text-[14px] hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <MapIcon size={16} />
                  Choose on Map instead
                </button>
              ) : (
                <div className="relative">
                  <MapComponent center={mapCoords} onLocationSelect={handleMapClick} />
                  {isGeocoding && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                      <Loader2 size={24} className="text-[#FF6B35] animate-spin" />
                    </div>
                  )}
                </div>
              )}

              <Input
                label="City"
                value={editedData.city}
                onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                placeholder="Ahmedabad"
              />
              <Input
                label="Area"
                value={editedData.area}
                onChange={(e) => setEditedData({ ...editedData, area: e.target.value })}
                placeholder="Gota"
                list="area-suggestions"
              />
              <datalist id="area-suggestions">
                {pincodeAreas.map((area, idx) => (
                  <option key={idx} value={area} />
                ))}
              </datalist>
               <Input
                label="Village (Optional)"
                value={editedData.village}
                onChange={(e) => setEditedData({ ...editedData, village: e.target.value })}
                placeholder="Chenpur"
              />
              <div className="relative">
                <Input
                  label="PIN Code (Optional)"
                  value={editedData.pincode}
                  onChange={(e) => setEditedData({ ...editedData, pincode: e.target.value })}
                  placeholder="380060"
                  maxLength={6}
                />
                {isFetchingPin && (
                  <div className="absolute right-4 top-[38px] text-blue-500 animate-spin">
                    <Loader2 size={16} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!isEditing ? (
              <>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full shadow-lg shadow-[#FF6B35]/20"
                  icon={Check}
                  onClick={handleConfirm}
                >
                  Yes, that's correct
                </Button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 py-3 text-[13px] font-bold text-[#1A1F36]/40 hover:text-[#1A1F36] transition-colors"
                >
                  <Edit3 size={14} />
                  No, I'll type it manually
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="dark" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleConfirm}
                >
                  Save & Apply
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
