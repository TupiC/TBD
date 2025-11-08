'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import react-leaflet components so they are only loaded on the client
// This avoids "window is not defined" during server-side evaluation/build.
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  {
    ssr: false,
  }
)
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})
// ---------- Types ----------
export type MapPoint = {
  id: string | number
  lat: number // y
  lng: number // x
  title?: string
  thumbnailUrl?: string
  description?: string
}

export type PointMapProps = {
  center?: [number, number]
  zoom?: number
  points: MapPoint[]
  height?: number | string
  disableScrollWheel?: boolean
}

export default function MyMap({
  center, //[47.80094, 13.04458] is salzburg
  zoom = 13,
  points = [],
  height = '100%',
  disableScrollWheel = false,
}: PointMapProps): JSX.Element {
  const pts = points ?? []
  let initialCenter: [number, number]
  if (center) initialCenter = center
  else if (pts.length > 0) initialCenter = [pts[0]!.lat, pts[0]!.lng]
  else initialCenter = [47.80094, 13.04458]
  const [markerIcon, setMarkerIcon] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    // Load leaflet library on the client and programmatically insert the CSS link
    import('leaflet').then((leafletModule) => {
      const L = (leafletModule as any).default ?? leafletModule
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -36],
        shadowSize: [41, 41],
      })
      if (mounted) setMarkerIcon(icon)
    })

    // add CSS via CDN link to avoid TS module resolution for CSS files
    const existing = document.querySelector("link[href*='leaflet']")
    if (!existing) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    return () => {
      mounted = false
    }
  }, [])

  // Cast dynamic components to any to avoid prop typing mismatches from react-leaflet
  const MapContainerAny = MapContainer as any
  const TileLayerAny = TileLayer as any
  const MarkerAny = Marker as any
  const PopupAny = Popup as any

  // ensure height is a valid CSS value: number -> pixels
  const cssHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div style={{ width: '100%', height: cssHeight, flex: 1 }}>
      <MapContainerAny
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom={!disableScrollWheel}
        style={{ width: '100%', height: cssHeight }}
      >
        <TileLayerAny
          url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
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
                {p.title && <h4 style={{ margin: '0 0 6px' }}>{p.title}</h4>}
                {p.thumbnailUrl && (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title ?? 'thumbnail'}
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
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
  )
}

// ---------- Optional helper: adapt {x,y} to {lat,lng} ----------
export type XYPoint = { id: string | number; x: number; y: number }
export const xyToMapPoint = (p: XYPoint): MapPoint => ({
  id: p.id,
  lng: p.x, // x -> lng
  lat: p.y, // y -> lat
})
