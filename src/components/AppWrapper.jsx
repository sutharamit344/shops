"use client";

import React, { useState, useEffect } from "react";
import FullLoader from "./UI/FullLoader";

const AppWrapper = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Instantly remove loader overlay once client mounts and hydrates
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Premium Loader Overlay */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-[9999] transition-all duration-500 ease-in-out ${
            !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FullLoader message="Initializing ShopBajar..." />
        </div>
      )}

      {/* Main Application Content - Rendered immediately on server for SEO & reliability */}
      <div className="transition-opacity duration-300 opacity-100">
        {children}
      </div>
    </>
  );
};

export default AppWrapper;
