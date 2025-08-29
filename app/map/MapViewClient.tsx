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
  // Set to true to show maintenance notice
  const isUnderMaintenance = true;

  if (isUnderMaintenance) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg border">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Under Maintenance
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Our map feature is currently undergoing maintenance to improve your experience. 
            We apologize for any inconvenience and appreciate your patience.
          </p>
          
          {/* Additional info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Estimated completion:</strong> We're working hard to restore this feature as soon as possible.
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Check Again
            </button>
            
            <a
              href="/agencies"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
            >
              Browse Agencies Instead
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapViewClient />
    </div>
  );
}