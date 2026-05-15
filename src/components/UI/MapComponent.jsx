"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons not loading correctly in Webpack/Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DraggableMarker = ({ position, onLocationSelect }) => {
  const markerRef = React.useRef(null);
  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          onLocationSelect(marker.getLatLng());
        }
      },
    }),
    [onLocationSelect]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo(center, map.getZoom(), {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  return null;
};

export default function MapComponent({ center, onLocationSelect, height = "300px" }) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#0A0A0F]/10 mb-4 z-0 relative shadow-inner" style={{ height }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={center} onLocationSelect={onLocationSelect} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <MapCenterUpdater center={center} />
      </MapContainer>
    </div>
  );
}

