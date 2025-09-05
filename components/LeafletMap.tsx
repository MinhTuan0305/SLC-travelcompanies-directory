"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface Agency {
  ID: number;
  "Company name"?: string;
  "Head Office COUNTY"?: string;
  "SECTOR"?: string;
  "SIZE (BASED ON STAFF NUMBER)"?: string;
  "Geographic Specialisation"?: string;
  "Address"?: string;
  "ATOL Number"?: string;
}

interface CountyFeature {
  type: "Feature";
  id: number;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    [key: string]: any;
    NAME?: string;
    name?: string;
    County?: string;
    county?: string;
  };
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: CountyFeature[];
}

// Fuzzy matching function for county names
function fuzzyMatchCounty(geojsonName: string, dbCounties: string[]): string | null {
  if (!geojsonName || !dbCounties.length) return null;
  
  const normalizedGeoName = geojsonName.toLowerCase().trim();
  
  // Direct match
  const directMatch = dbCounties.find(county => 
    county.toLowerCase().trim() === normalizedGeoName
  );
  if (directMatch) return directMatch;
  
  // Remove common suffixes and prefixes
  const cleanGeoName = normalizedGeoName
    .replace(/\b(county|shire|borough|city|district|unitary|metropolitan)\b/g, '')
    .replace(/\b(greater|greater london|inner|outer)\b/g, '')
    .trim();
  
  // Partial match
  const partialMatch = dbCounties.find(county => {
    const cleanDbName = county.toLowerCase()
      .replace(/\b(county|shire|borough|city|district|unitary|metropolitan)\b/g, '')
      .replace(/\b(greater|greater london|inner|outer)\b/g, '')
      .trim();
    
    return cleanDbName.includes(cleanGeoName) || cleanGeoName.includes(cleanDbName);
  });
  
  if (partialMatch) return partialMatch;
  
  // Word-based matching
  const geoWords = cleanGeoName.split(/\s+/);
  const wordMatch = dbCounties.find(county => {
    const cleanDbName = county.toLowerCase()
      .replace(/\b(county|shire|borough|city|district|unitary|metropolitan)\b/g, '')
      .replace(/\b(greater|greater london|inner|outer)\b/g, '')
      .trim();
    
    const dbWords = cleanDbName.split(/\s+/);
    return geoWords.some(word => 
      word.length > 2 && dbWords.some(dbWord => 
        dbWord.includes(word) || word.includes(dbWord)
      )
    );
  });
  
  return wordMatch || null;
}

export default function LeafletMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbCounties, setDbCounties] = useState<string[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [containerReady, setContainerReady] = useState(false);

  // Load agencies and counties from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        
        // Get all agencies
        const { data: agenciesData, error: agenciesError } = await supabase
          .from("uk_agency")
          .select("*");
        
        if (agenciesError) throw agenciesError;
        
        setAgencies(agenciesData || []);
        
        // Get unique counties
        const uniqueCounties = Array.from(
          new Set(
            (agenciesData || [])
              .map(agency => agency["Head Office COUNTY"])
              .filter(Boolean)
          )
        ) as string[];
        
        setDbCounties(uniqueCounties);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load agencies data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check container readiness
  useEffect(() => {
    const checkContainer = () => {
      if (mapRef.current && mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
        setContainerReady(true);
      } else {
        setContainerReady(false);
      }
    };

    checkContainer();
    
    // Check again after a short delay
    const timer = setTimeout(checkContainer, 100);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Initialize map
  useEffect(() => {
    if (loading || !mapRef.current || mapLoaded || !containerReady) return;

    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default;
        
        // CSS is imported at the top of the file

        // Fix default markers for Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Check if map is already initialized
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Container is already checked by containerReady state

        // Create map
        if (!mapRef.current) {
          console.error("Map container not found");
          return;
        }
        
        const map = L.map(mapRef.current, {
          preferCanvas: true, // Use canvas renderer for better performance
          zoomControl: true,
          attributionControl: true
        }).setView([54.5, -2.5], 6);
        
        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Load GeoJSON data
        const response = await fetch("/data/uk-counties.geojson");
        const geoData: GeoJSONData = await response.json();

        // Create style function
        const getStyle = (feature: CountyFeature, isHovered: boolean = false) => {
          const matchedCounty = fuzzyMatchCounty(
            feature.properties.NAME || feature.properties.name || feature.properties.County || feature.properties.county || "",
            dbCounties
          );
          
          const hasAgencies = matchedCounty !== null;
          
          return {
            fillColor: isHovered 
              ? "#f59e0b" // Amber for hover
              : hasAgencies 
                ? "#3b82f6" // Blue for counties with agencies
                : "#e5e7eb", // Gray for counties without agencies
            weight: isHovered ? 3 : 1,
            opacity: 1,
            color: isHovered ? "#d97706" : "#6b7280",
            dashArray: "",
            fillOpacity: isHovered ? 0.8 : 0.6
          };
        };

        // Add GeoJSON layer
        const geoJsonLayer = L.geoJSON(geoData, {
          style: (feature) => getStyle(feature as CountyFeature),
          onEachFeature: (feature, layer) => {
            // Try multiple property names to get county name
            const countyName = (feature.properties.NAME || 
                              feature.properties.name || 
                              feature.properties.County || 
                              feature.properties.county ||
                              feature.properties.NAME_1 ||
                              feature.properties.NAME_2 ||
                              feature.properties.ADMIN_NAME ||
                              feature.properties.LAD_NAME ||
                              `County ${feature.id}`) as string;
            
            const matchedCounty = fuzzyMatchCounty(countyName, dbCounties);
            const countyAgencies = matchedCounty 
              ? agencies.filter(agency => agency["Head Office COUNTY"] === matchedCounty)
              : [];

            // Tooltip
            layer.bindTooltip(`
              <div class="text-sm">
                <strong>${countyName}</strong><br/>
                ${matchedCounty ? `${countyAgencies.length} agencies` : 'No agencies found'}
              </div>
            `);

            // Hover events
            layer.on('mouseover', (e) => {
              setHoveredCounty(countyName);
              const layer = e.target;
              layer.setStyle(getStyle(feature as CountyFeature, true));
            });

            layer.on('mouseout', (e) => {
              setHoveredCounty(null);
              const layer = e.target;
              layer.setStyle(getStyle(feature as CountyFeature, false));
            });

            // Click events
            layer.on('click', (e) => {
              setSelectedCounty(countyName);
              
              if (matchedCounty && countyAgencies.length > 0) {
                // Show popup with agencies
                const popupContent = `
                  <div class="p-2">
                    <h3 class="font-bold text-lg mb-2">${countyName}</h3>
                    <p class="text-sm text-gray-600 mb-3">${countyAgencies.length} agencies found</p>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      ${countyAgencies.slice(0, 5).map(agency => `
                        <div class="border-b border-gray-200 pb-1">
                          <div class="font-medium text-sm">${agency["Company name"] || "N/A"}</div>
                          <div class="text-xs text-gray-500">${agency["SECTOR"] || "N/A"}</div>
                        </div>
                      `).join('')}
                      ${countyAgencies.length > 5 ? `<div class="text-xs text-gray-500">... and ${countyAgencies.length - 5} more</div>` : ''}
                    </div>
                    <div class="mt-3">
                      <a href="/agencies?county=${encodeURIComponent(matchedCounty)}" 
                         class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All Agencies →
                      </a>
                    </div>
                  </div>
                `;
                
                layer.bindPopup(popupContent).openPopup();
              } else {
                // Show popup for counties without agencies
                layer.bindPopup(`
                  <div class="p-2">
                    <h3 class="font-bold text-lg mb-2">${countyName}</h3>
                    <p class="text-sm text-gray-600">No agencies found in this county</p>
                  </div>
                `).openPopup();
              }
            });
          }
        }).addTo(map);

        // Fit map to UK bounds
        map.fitBounds(geoJsonLayer.getBounds());

      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map");
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [loading, agencies, dbCounties, mapLoaded, containerReady]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading map...</div>
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

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[400px]" 
        style={{ minHeight: '400px' }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="font-bold text-sm mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
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
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
        <h3 className="font-bold text-sm mb-2">Map Instructions</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Hover over counties to see basic info</p>
          <p>• Click on counties to view agencies</p>
          <p>• Blue counties have agencies, gray ones don't</p>
          <p>• Use fuzzy matching for county name variations</p>
        </div>
      </div>

      {/* Selected County Info */}
      {selectedCounty && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <h3 className="font-bold text-sm mb-2">Selected: {selectedCounty}</h3>
          <Link 
            href="/agencies"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Agencies List
          </Link>
        </div>
      )}
    </div>
  );
}
