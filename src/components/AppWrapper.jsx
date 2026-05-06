"use client";

import React, { useState, useEffect } from "react";
import FullLoader from "./UI/FullLoader";

const AppWrapper = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    // Shorter delay for better responsiveness and to avoid "stuck" feeling
    const mountTimer = setTimeout(() => {
      setIsMounted(true);

      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, 50);

      const doneTimer = setTimeout(() => {
        setIsAnimationDone(true);
      }, 800);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(doneTimer);
      };
    }, 500);

    // Safety Valve: Absolute max wait of 5 seconds
    const safetyTimer = setTimeout(() => {
      setIsMounted(true);
      setIsVisible(false);
      setIsAnimationDone(true);
    }, 5000);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <>
      {/* Premium Loader Overlay */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-[9999] transition-all duration-700 ease-in-out ${
            !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FullLoader message="Initializing ShopBajar..." />
        </div>
      )}

      {/* Main Application Content */}
      <div
        className={`transition-all duration-700 ease-out ${
          !isMounted ? "opacity-0" : "opacity-100"
        }`}
      >
        {isMounted && children}
      </div>
    </>
  );
};

export default AppWrapper;
