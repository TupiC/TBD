"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components so they are only loaded on the client
// This avoids "window is not defined" during server-side evaluation/build.
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export type MapPoint = {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  url?: string;
};

type PointMapProps = {
  center?: [number, number];
  zoom?: number;
  points: MapPoint[];
  height?: number | string;
  disableScrollWheel?: boolean;
};

export default function MyMap({
  center, // [47.80094, 13.04458] is salzburg
  zoom = 13,
  points = [],
  height = "100%",
  disableScrollWheel = false,
}: PointMapProps): JSX.Element {
  const pts = points ?? [];

  // compute centroid and bounds
  let initialCenter: [number, number];
  let initialBounds: [[number, number], [number, number]] | undefined =
    undefined;

  if (center) {
    initialCenter = center;
  } else if (pts.length > 0) {
    // centroid (average)
    const sum = pts.reduce(
      (acc, p) => {
        acc.lat += Number(p.lat) || 0;
        acc.lng += Number(p.lng) || 0;
        return acc;
      },
      { lat: 0, lng: 0 }
    );
    const avgLat = sum.lat / pts.length;
    const avgLng = sum.lng / pts.length;
    initialCenter = [avgLat, avgLng];

    // bounds (min/max)
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    pts.forEach((p) => {
      const lat = Number(p.lat) || 0;
      const lng = Number(p.lng) || 0;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    if (minLat !== Infinity && minLng !== Infinity) {
      initialBounds = [
        [minLat, minLng],
        [maxLat, maxLng],
      ];
    }
  } else {
    // fallback: Salzburg coordinates
    initialCenter = [47.80094, 13.04458];
  }

  const [markerIcon, setMarkerIcon] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    // Load leaflet library on the client and programmatically insert the CSS link
    import("leaflet").then((leafletModule) => {
      const L = (leafletModule as any).default ?? leafletModule;
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -36],
        shadowSize: [41, 41],
      });
      if (mounted) setMarkerIcon(icon);
    });

    // add CSS via CDN link to avoid TS module resolution for CSS files
    const existing = document.querySelector("link[href*='leaflet']");
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Cast dynamic components to any to avoid prop typing mismatches from react-leaflet
  const MapContainerAny = MapContainer as any;
  const TileLayerAny = TileLayer as any;
  const MarkerAny = Marker as any;
  const PopupAny = Popup as any;

  // ensure height is a valid CSS value: number -> pixels
  const cssHeight = typeof height === "number" ? `${height}px` : height;

  // Prepare props for the MapContainer:
  // - If the caller provided an explicit `center` prop, pass `center` so we keep that behavior.
  // - Otherwise, if we have multiple points, pass computed `initialBounds` so the map fits all markers.
  // - If there's only one point, pass the computed centroid as `center` so we don't end up with a degenerate bounds zoom.
  const mapInitProps: any = (() => {
    if (center) return { center: initialCenter };
    if (initialBounds && pts.length > 1)
      return { bounds: initialBounds, boundsOptions: { padding: [20, 20] } };
    return { center: initialCenter };
  })();

  return (
    <div style={{ width: "100%", height: cssHeight, flex: 1 }}>
      <MapContainerAny
        {...mapInitProps}
        // ensure bounds are applied after the map is created (works around cases where
        // passing `bounds` as a prop alone doesn't trigger fitting)
        whenCreated={(map: any) => {
          if (!center && initialBounds && pts.length > 1) {
            try {
              map.fitBounds(initialBounds, { padding: [20, 20] });
            } catch (e) {
              // ignore - map may not support fitBounds in some test envs
            }
          }
        }}
        zoom={zoom}
        scrollWheelZoom={!disableScrollWheel}
        style={{ width: "100%", height: cssHeight }}
      >
        <TileLayerAny
          url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution={
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />

        {pts.map((p) => (
          <MarkerAny
            key={p.id}
            position={[p.lat, p.lng]}
            icon={markerIcon ?? undefined}
          >
            <PopupAny>
              <div style={{ maxWidth: 240 }}>
                {p.title && <h4 style={{ margin: "0 0 6px" }}>{p.title}</h4>}
                {p.thumbnailUrl && (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title ?? "thumbnail"}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                )}
                {p.description && (
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                )}
              </div>
            </PopupAny>
          </MarkerAny>
        ))}
      </MapContainerAny>
    </div>
  );
}

// // ---------- Optional helper: adapt {x,y} to {lat,lng} ----------
// export type XYPoint = { id: string | number; x: number; y: number }
// export const xyToMapPoint = (p: XYPoint): MapPoint => ({
//   id: p.id,
//   lng: p.x, // x -> lng
//   lat: p.y, // y -> lat
// })
