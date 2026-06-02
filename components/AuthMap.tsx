"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Map, MapMarker, MarkerContent, MapPopup, type MapRef } from "@/components/ui/map";

type Testimonial = {
  quote: string;
  name: string;
  initials: string;
  gradient: string;
  subtitle: string;
};

function useScatteredPoints(
  centerLng: number,
  centerLat: number,
  count: number,
) {
  return useMemo(() => {
    // Tighter horizontal and vertical spread to ensure markers and popups stay
    // safely within the 65% map bounds without touching the edges or clipping.
    const offsets = [
      { lng: -0.008, lat: 0.002 },
      { lng: 0.010, lat: 0.001 },
      { lng: -0.012, lat: -0.002 },
      { lng: 0.006, lat: -0.003 },
      { lng: 0.012, lat: 0.002 },
      { lng: -0.004, lat: 0.003 },
      { lng: -0.010, lat: -0.001 },
      { lng: 0.008, lat: 0.001 },
    ];

    return Array.from({ length: count }, (_, i) => {
      const offset = offsets[i % offsets.length];
      return { 
        lng: centerLng + offset.lng, 
        lat: centerLat + offset.lat 
      } as const;
    });
  }, [centerLng, centerLat, count]);
}

export default function AuthMap({ testimonials }: { testimonials: Testimonial[] }) {
  const mapRef = useRef<MapRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const mapPoints = useScatteredPoints(82.1391, 22.0797, testimonials.length);

  useEffect(() => {
    const timer = setInterval(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black flex flex-1" style={{ minHeight: "100vh" }}>
      <Map
        ref={mapRef}
        className="absolute inset-0"
        center={[82.1391, 22.0797]}
        zoom={14.5}
        pitch={0}
        bearing={0}
        styles={{ dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" }}
        attributionControl={false}
      >
        {testimonials.map((_, i) => (
          <MapMarker key={i} longitude={mapPoints[i].lng} latitude={mapPoints[i].lat}>
            <MarkerContent>
              <div
                className={`rounded-full border-2 border-white shadow-lg transition-all duration-700 ease-in-out ${
                  i === activeIndex 
                    ? "w-6 h-6 bg-[#E8392A] scale-110" 
                    : "w-4 h-4 bg-gray-500/80 hover:bg-gray-400"
                }`}
              />
            </MarkerContent>
          </MapMarker>
        ))}

        <MapPopup
          className="auth-map-popup"
          key={activeIndex}
          closeButton={false}
          maxWidth="none"
          offset={20}
          longitude={mapPoints[activeIndex].lng}
          latitude={mapPoints[activeIndex].lat}
        >
          <div className="min-w-[260px] max-w-[280px] bg-white rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative border border-gray-100">
            {/* Large Quote Mark */}
            <svg className="w-10 h-10 text-gray-100 absolute top-4 left-4 -z-0" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            
            <p className="text-[14px] text-[#0f172a] leading-[1.4] mb-5 font-medium relative z-10 pt-1 tracking-tight">
              {testimonials[activeIndex].quote}
            </p>
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${testimonials[activeIndex].gradient} flex items-center justify-center text-[11px] font-bold text-white shadow-sm`}>
                {testimonials[activeIndex].initials}
              </div>
              <div className="text-[13px] font-semibold text-slate-600">
                @{testimonials[activeIndex].name.replace(/\s+/g, '').replace('.', '').toLowerCase()}
              </div>
            </div>
          </div>
        </MapPopup>
      </Map>
    </div>
  );
}
