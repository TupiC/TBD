"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

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
    center,
    zoom = 13,
    points = [],
    height = "100%",
    disableScrollWheel = false,
}: PointMapProps): JSX.Element {
    const pts = points ?? [];

    // ----- compute center/bounds -----
    let initialCenter: [number, number];
    let initialBounds: [[number, number], [number, number]] | undefined;

    if (center) {
        initialCenter = center;
    } else if (pts.length > 0) {
        const sum = pts.reduce(
            (acc, p) => ({
                lat: acc.lat + (Number(p.lat) || 0),
                lng: acc.lng + (Number(p.lng) || 0),
            }),
            { lat: 0, lng: 0 }
        );
        initialCenter = [sum.lat / pts.length, sum.lng / pts.length];

        let minLat = Infinity,
            maxLat = -Infinity,
            minLng = Infinity,
            maxLng = -Infinity;
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
        initialCenter = [47.80094, 13.04458]; // Salzburg
    }

    // ----- leaflet icon setup (client only) -----
    const [markerIcon, setMarkerIcon] = useState<any | null>(null);
    useEffect(() => {
        let mounted = true;
        import("leaflet").then((leafletModule) => {
            const L = (leafletModule as any).default ?? leafletModule;
            const icon = L.icon({
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [0, -36],
                shadowSize: [41, 41],
            });
            try {
                L.Icon?.Default?.mergeOptions?.({
                    iconUrl:
                        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconRetinaUrl:
                        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    shadowUrl:
                        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                });
            } catch {}
            if (mounted) setMarkerIcon(icon);
        });

        if (!document.querySelector("link[href*='leaflet']")) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }
        return () => {
            mounted = false;
        };
    }, []);

    // ----- keep map sized when inside hidden tabs / resizes -----
    const mapRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize(false);
            }
        });
        if (containerRef.current) ro.observe(containerRef.current);
        const onResize = () => mapRef.current?.invalidateSize(false);
        window.addEventListener("resize", onResize);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, []);

    // ----- react-leaflet any casts -----
    const MapContainerAny = MapContainer as any;
    const TileLayerAny = TileLayer as any;
    const MarkerAny = Marker as any;
    const PopupAny = Popup as any;

    const cssHeight = typeof height === "number" ? `${height}px` : height;

    const mapInitProps: any = (() => {
        if (center) return { center: initialCenter };
        if (initialBounds && pts.length > 1)
            return {
                bounds: initialBounds,
                boundsOptions: { padding: [20, 20] },
            };
        return { center: initialCenter };
    })();

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", height: cssHeight, flex: 1, minHeight: 0 }}
        >
            <MapContainerAny
                {...mapInitProps}
                whenCreated={(map: any) => {
                    mapRef.current = map;
                    if (!center && initialBounds && pts.length > 1) {
                        try {
                            map.fitBounds(initialBounds, { padding: [20, 20] });
                        } catch {}
                    }
                    // pulses to handle creation in hidden tabs
                    requestAnimationFrame(() => map.invalidateSize());
                    setTimeout(() => map.invalidateSize(), 150);
                }}
                zoom={zoom}
                scrollWheelZoom={!disableScrollWheel}
                style={{ width: "100%", height: cssHeight }}
            >
                <TileLayerAny
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {markerIcon &&
                    pts.map((p) => (
                        <MarkerAny
                            key={p.id}
                            position={[p.lat, p.lng]}
                            icon={markerIcon}
                        >
                            <PopupAny>
                                <div style={{ maxWidth: 240 }}>
                                    {p.title && (
                                        <h4 style={{ margin: "0 0 6px" }}>
                                            {p.title}
                                        </h4>
                                    )}
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
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 14,
                                                lineHeight: 1.4,
                                            }}
                                        >
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
