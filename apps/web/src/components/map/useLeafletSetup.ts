"use client";

import { useEffect, useRef } from "react";

export function useLeafletSetup() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!document.querySelector("link[href*='leaflet.css']")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    (async () => {
      const leaflet = await import("leaflet");
      const L: any = (leaflet as any).default ?? leaflet;
      L?.Icon?.Default?.mergeOptions?.({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);
}
