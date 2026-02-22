"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange?: (coords: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  readOnly?: boolean;
}

function MapPickerInner({ value, onChange, height = "300px", readOnly }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

    // Fix default marker icons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const defaultCenter = value || { lat: 6.5244, lng: 3.3792 }; // Lagos default
    const map = L.map(containerRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    }

    if (!readOnly) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        onChange?.({ lat, lng });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [L]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!L || !mapRef.current || !value) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(mapRef.current);
    }
    mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom());
  }, [L, value]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={containerRef} style={{ height, width: "100%" }} className="rounded-md border" />
    </>
  );
}

// Export as dynamic to avoid SSR issues with Leaflet
export const MapPicker = dynamic(() => Promise.resolve(MapPickerInner), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-md border bg-muted" style={{ height: "300px" }}>
      Loading map...
    </div>
  ),
});
