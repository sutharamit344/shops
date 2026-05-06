"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Skip SW in development to avoid chunk loading issues and HMR conflicts
      if (process.env.NODE_ENV === "development") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
            console.log("Service Worker unregistered for development");
          }
        });
        return;
      }

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered"))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  return null;
}
