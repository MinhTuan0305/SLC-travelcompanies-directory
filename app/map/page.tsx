"use client";

import dynamic from "next/dynamic";

// Dynamic import of MapViewClient component with loading state
const MapViewClient = dynamic(
  () => import("@/app/map/MapViewClient"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map...</div>
      </div>
    ),
  }
);

export default function MapViewPage() {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapViewClient />
    </div>
  );
}
