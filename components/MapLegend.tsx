"use client";

interface MapLegendProps {
  statistics: {
    totalAgencies: number;
    totalCounties: number;
    countiesWithAgencies: number;
    countiesWithoutAgencies: number;
  };
}

export default function MapLegend({ statistics }: MapLegendProps) {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-10 max-w-xs">
      <h3 className="font-bold text-sm mb-3">Map Legend</h3>
      
      {/* Color Legend */}
      <div className="space-y-2 text-xs mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Counties with agencies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Counties without agencies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span>Hovered county</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="border-t border-gray-200 pt-3">
        <h4 className="font-medium text-xs mb-2">Statistics</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Agencies:</span>
            <span className="font-medium">{statistics.totalAgencies}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Counties:</span>
            <span className="font-medium">{statistics.totalCounties}</span>
          </div>
          <div className="flex justify-between">
            <span>With Agencies:</span>
            <span className="font-medium text-blue-600">{statistics.countiesWithAgencies}</span>
          </div>
          <div className="flex justify-between">
            <span>Without Agencies:</span>
            <span className="font-medium text-gray-500">{statistics.countiesWithoutAgencies}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
