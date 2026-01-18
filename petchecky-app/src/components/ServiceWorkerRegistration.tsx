"use client";

import { useEffect } from "react";

const isDevelopment = process.env.NODE_ENV === "development";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (isDevelopment) {
            console.log("PetChecky: Service Worker registered with scope:", registration.scope);
          }

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available - could show a toast/notification to the user here
                  if (isDevelopment) {
                    console.log("PetChecky: New content available, reload to update");
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          if (isDevelopment) {
            console.error("PetChecky: Service Worker registration failed:", error);
          }
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_COMPLETE") {
          if (isDevelopment) {
            console.log("PetChecky: Background sync completed");
          }
          // Refresh data or show notification
        }
      });
    }
  }, []);

  return null;
}
