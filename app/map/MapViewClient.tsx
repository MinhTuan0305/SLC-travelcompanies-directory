"use client";

import dynamic from "next/dynamic";

// Dynamic import of InteractiveMap component to avoid SSR issues
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Loading map...</div>
      </div>
    </div>
  ),
});

export default function MapViewClient() {
  return <InteractiveMap />;
}