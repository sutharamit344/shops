"use client";

import React, { useState, useEffect } from "react";
import FullLoader from "./UI/FullLoader";

const AppWrapper = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Small delay to make the transition feel professional
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <FullLoader message="Initializing ShopBajar..." />;
  }

  return <>{children}</>;
};

export default AppWrapper;
