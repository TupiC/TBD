"use client";

import * as React from "react";
import Image from "next/image";
import  MapTile  from "./map-tile";
import { Experience } from "@/types/experience.type";

type GalleryWithMapProps = {
  images: string[];              
  onMapClick?: () => void;
  experience: Experience;
  mapLabel?: string;
  heroAlt?: string;
  className?: string;             
  height?: number;                
  roundedClassName?: string;     
  ringClassName?: string;         
};


export default function GalleryWithMap({
  images,
  onMapClick,
  experience,
  mapLabel = "MAP",
  heroAlt,
  className,
  height = 360,
  roundedClassName = "rounded-2xl",
  ringClassName = "ring-1 ring-black/5 dark:ring-white/10",
}: GalleryWithMapProps) {
  const [hero, img2, img3] = [images?.[0], images?.[1], images?.[2]];

  if (!hero) {
    return (
      <div
        className={[
          "relative w-full overflow-hidden",
          roundedClassName,
          ringClassName,
          className,
        ].join(" ")}
        style={{ height }}
      >
        <MapTile center={[experience.geo.lat, experience.geo.lon]} zoom={14} />
      </div>
    );
  }

  return (
    <div
      className={[
        "relative w-full overflow-hidden",
        roundedClassName,
        ringClassName,
        className,
      ].join(" ")}
      style={{ height }}
    >
      <div className="grid grid-cols-[2fr_1fr] grid-rows-2 h-full gap-0">
        {/* Hero spans both rows */}
        <div className="relative row-span-2 h-full">
          <Image
            src={hero}
            alt={heroAlt ?? "gallery image"}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover"
            priority={false}
            unoptimized
          />
        </div>

        {/* Top-right = MAP */}
        <div className="relative" style={{ height: height / 2 }}>
            <MapTile center={[experience.geo.lat, experience.geo.lon]} zoom={14} />
        </div>

        {/* Bottom-right = next image or neutral block */}
        <div className="relative" style={{ height: height / 2 }}>
          {(img2 || img3) ? (
            <Image
              src={(img2 || img3) as string}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-neutral-200" />
          )}
        </div>
      </div>
    </div>
  );
}
