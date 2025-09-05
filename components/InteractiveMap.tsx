"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapService, CountyFeature, Agency } from "@/lib/services/mapService";
import dynamic from "next/dynamic";
import AgencySidebar from "./AgencySidebar";
import MapLegend from "./MapLegend";
import MapInstructions from "./MapInstructions";

// Dynamic imports for React Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then(mod => ({ default: mod.MapContainer })), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => ({ default: mod.TileLayer })), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(mod => ({ default: mod.GeoJSON })), { ssr: false });

interface InteractiveMapProps {
  geoJsonUrl?: string;
  apiClient?: any;
}

export default function InteractiveMap({ 
  geoJsonUrl = "/data/uk-counties.geojson",
  apiClient 
}: InteractiveMapProps) {
  const [mapService] = useState(() => new MapService());
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
  const [matchedCounty, setMatchedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [statistics, setStatistics] = useState({
    totalAgencies: 0,
    totalCounties: 0,
    countiesWithAgencies: 0,
    countiesWithoutAgencies: 0,
  });

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Use provided API client or create default one
        const client = apiClient || createClient();
        
        // Load agencies and GeoJSON data
        await Promise.all([
          mapService.loadAgencies(client),
          mapService.loadGeoJSON(geoJsonUrl).then(setGeoData)
        ]);
        
        // Update state
        setAgencies(mapService.getAllAgencies());
        setStatistics(mapService.getStatistics());
        
        setLoading(false);
      } catch (err) {
        console.error("Error initializing map data:", err);
        setError("Failed to load map data");
        setLoading(false);
      }
    };

    initializeData();
  }, [mapService, geoJsonUrl, apiClient]);

  // Handle county click
  const handleCountyClick = (feature: CountyFeature) => {
    const countyName = mapService.getCountyName(feature);
    
    console.log(`\n=== COUNTY CLICK DEBUG ===`);
    console.log(`Clicked GeoJSON county: "${countyName}"`);
    
    // Get top fuzzy matches for detailed logging
    const topMatches = mapService.getTopFuzzyMatches(countyName, 3);
    console.log(`Top fuzzy matches:`, topMatches.map(m => `"${m.item}" (score: ${m.score})`));
    
    // Get agencies and final match
    const agencies = mapService.getAgenciesForCounty(countyName);
    const matched = mapService.fuzzyMatchCounty(countyName);
    
    console.log(`Selected match: ${matched || 'None'}`);
    console.log(`Found ${agencies.length} agencies for this county`);
    
    setSelectedCounty(countyName);
    setSelectedAgencies(agencies);
    setMatchedCounty(matched);
  };

  // Handle county hover
  const handleCountyHover = (feature: CountyFeature, isHovered: boolean) => {
    const countyName = mapService.getCountyName(feature);
    setHoveredCounty(isHovered ? countyName : null);
  };

  // Close sidebar
  const handleCloseSidebar = () => {
    setSelectedCounty(null);
    setSelectedAgencies([]);
    setMatchedCounty(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading map data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <div className="text-gray-800 font-medium mb-2">Error Loading Map</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-600">Loading map data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="w-full h-full min-h-[400px]" style={{ minHeight: '400px' }}>
          <MapContainer
            center={[54.5, -2.5]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setMapReady(true)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            
            {mapReady && (
              <GeoJSON
                data={geoData}
                style={(feature) => mapService.getMapStyle(feature as CountyFeature)}
                onEachFeature={(feature, layer) => {
                  const countyName = mapService.getCountyName(feature as CountyFeature);
                  const agencies = mapService.getAgenciesForCounty(countyName);
                  const matched = mapService.fuzzyMatchCounty(countyName);

                  // Tooltip
                  layer.bindTooltip(`
                    <div class="text-sm">
                      <strong>${countyName}</strong><br/>
                      ${agencies.length} agencies
                      ${matched && matched !== countyName ? `<br/><small>Matched: ${matched}</small>` : ''}
                    </div>
                  `);

                  // Hover events
                  layer.on('mouseover', () => {
                    handleCountyHover(feature as CountyFeature, true);
                    (layer as any).setStyle(mapService.getMapStyle(feature as CountyFeature, true));
                  });

                  layer.on('mouseout', () => {
                    handleCountyHover(feature as CountyFeature, false);
                    (layer as any).setStyle(mapService.getMapStyle(feature as CountyFeature, false));
                  });

                  // Click events
                  layer.on('click', () => {
                    handleCountyClick(feature as CountyFeature);
                  });
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Map Overlays */}
        <MapLegend statistics={statistics} />
        <MapInstructions />
      </div>

      {/* Agency Sidebar */}
      {selectedCounty && (
        <AgencySidebar
          countyName={selectedCounty}
          agencies={selectedAgencies}
          matchedCounty={matchedCounty}
          onClose={handleCloseSidebar}
        />
      )}
    </div>
  );
}
