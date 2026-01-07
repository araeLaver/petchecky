"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("PetChecky: Service Worker registered with scope:", registration.scope);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available
                  console.log("PetChecky: New content available, reload to update");
                  // Could show a toast/notification to the user here
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("PetChecky: Service Worker registration failed:", error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_COMPLETE") {
          console.log("PetChecky: Background sync completed");
          // Refresh data or show notification
        }
      });
    }
  }, []);

  return null;
}
