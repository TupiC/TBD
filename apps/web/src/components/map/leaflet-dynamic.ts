// components/map/leaflet-dynamic.ts
"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";


type AnyComp = ComponentType<any>;

export const MapContainer = dynamic<any>(
  () => import("react-leaflet").then(m => m.MapContainer as any),
  { ssr: false }
) as unknown as AnyComp;

export const TileLayer = dynamic<any>(
  () => import("react-leaflet").then(m => m.TileLayer as any),
  { ssr: false }
) as unknown as AnyComp;

export const Marker = dynamic<any>(
  () => import("react-leaflet").then(m => m.Marker as any),
  { ssr: false }
) as unknown as AnyComp;

export const Popup = dynamic<any>(
  () => import("react-leaflet").then(m => m.Popup as any),
  { ssr: false }
) as unknown as AnyComp;
