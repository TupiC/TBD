import type { JSX } from "react";
import dynamic from "next/dynamic";
import React from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";



export interface MapTileProps {
  center: [number, number]; 
  zoom?: number;
  height?: number | string;
  className?: string;
}

export default function MapTileLeaflet({
  center,
  zoom = 13,
  height = "100%",
  className,
}: MapTileProps): JSX.Element {
  const cssHeight = typeof height === "number" ? `${height}px` : height;
  React.useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      const L: any = (leaflet as any).default ?? leaflet;
      if (L?.Icon?.Default?.mergeOptions) {
        L.Icon.Default.mergeOptions({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      }

      // Ensure Leaflet CSS is present
      if (!document.querySelector("link[href*='leaflet.css']")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
    })();
  }, []);

  const hideAttribution = (
    <style>{`.leaflet-control-attribution{display:none!important}`}</style>
  );

  const MapContainerAny = MapContainer as any;
  const TileLayerAny = TileLayer;
  const MarkerAny = Marker;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className ?? ""}`}
      style={{ height: cssHeight }}
    >
      {hideAttribution}
      <MapContainerAny
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}           
        attributionControl={false}  
      >
        <TileLayerAny
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerAny position={center} />
      </MapContainerAny>
    </div>
  );
}
