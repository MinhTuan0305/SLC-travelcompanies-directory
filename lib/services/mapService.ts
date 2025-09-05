import Fuse from 'fuse.js';

export interface Agency {
  ID: number;
  "Company name"?: string;
  "Head Office COUNTY"?: string;
  "SECTOR"?: string;
  "SIZE (BASED ON STAFF NUMBER)"?: string;
  "Geographic Specialisation"?: string;
  "Address"?: string;
  "ATOL Number"?: string;
}

export interface CountyFeature {
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
    NAME_1?: string;
    NAME_2?: string;
    ADMIN_NAME?: string;
    LAD_NAME?: string;
  };
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: CountyFeature[];
}

export interface MapStyle {
  fillColor: string;
  weight: number;
  opacity: number;
  color: string;
  dashArray: string;
  fillOpacity: number;
}

export class MapService {
  private agencies: Agency[] = [];
  private dbCounties: string[] = [];
  private fuse: Fuse<string> | null = null;

  constructor() {
    this.initializeFuse();
  }

  private initializeFuse() {
    // Fuse.js configuration for fuzzy matching
    const fuseOptions = {
      keys: [''],
      threshold: 0.4, // Lower threshold = more strict matching (0 = perfect, 1 = no match)
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      findAllMatches: false,
    };
    
    this.fuse = new Fuse([], fuseOptions);
  }

  // Load agencies data
  async loadAgencies(apiClient: any): Promise<void> {
    try {
      const { data: agenciesData, error } = await apiClient
        .from("uk_agency")
        .select("*");
      
      if (error) throw error;
      
      this.agencies = agenciesData || [];
      
      // Extract unique counties
      this.dbCounties = Array.from(
        new Set(
          this.agencies
            .map(agency => agency["Head Office COUNTY"])
            .filter(Boolean)
        )
      ) as string[];
      
      // Update Fuse.js index
      this.fuse?.setCollection(this.dbCounties);
      
      console.log(`MapService: Loaded ${this.agencies.length} agencies from ${this.dbCounties.length} counties`);
      console.log('MapService: DB Counties:', this.dbCounties);
      console.log('MapService: Sample counties:', this.dbCounties.slice(0, 10));
    } catch (error) {
      console.error('MapService: Error loading agencies:', error);
      throw error;
    }
  }

  // Load GeoJSON data
  async loadGeoJSON(geoJsonUrl: string): Promise<GeoJSONData> {
    try {
      const response = await fetch(geoJsonUrl);
      const geoData: GeoJSONData = await response.json();
      
      console.log(`MapService: Loaded GeoJSON with ${geoData.features.length} features`);
      
      // Debug: Show sample properties
      const sampleFeatures = geoData.features.slice(0, 5);
      console.log('MapService: Sample GeoJSON properties:');
      sampleFeatures.forEach((feature, index) => {
        console.log(`Feature ${index + 1}:`, {
          id: feature.id,
          properties: feature.properties
        });
      });
      
      return geoData;
    } catch (error) {
      console.error('MapService: Error loading GeoJSON:', error);
      throw error;
    }
  }

  // Get county name from GeoJSON feature
  getCountyName(feature: CountyFeature): string {
    // Try multiple possible property names for county
    const possibleNames = [
      feature.properties.CTYUA21NM,  // Common in UK GeoJSON
      feature.properties.NAME,
      feature.properties.name,
      feature.properties.County,
      feature.properties.county,
      feature.properties.NAME_1,
      feature.properties.NAME_2,
      feature.properties.ADMIN_NAME,
      feature.properties.LAD_NAME,
      feature.properties.CTYUA20NM,
      feature.properties.CTYUA19NM,
    ];
    
    const countyName = possibleNames.find(name => name && name.trim()) || `County ${feature.id}`;
    const result = countyName.trim();
    
    // Debug logging for all features (we need to see what's happening)
    console.log(`MapService: Feature ${feature.id} properties:`, feature.properties);
    console.log(`MapService: Extracted county name: "${result}"`);
    
    return result;
  }

  // Fuzzy match county name
  fuzzyMatchCounty(geoJsonName: string): string | null {
    if (!this.fuse || !geoJsonName) {
      console.log(`MapService: No fuse or empty name: "${geoJsonName}"`);
      return null;
    }
    
    console.log(`\n=== FUZZY MATCHING DEBUG ===`);
    console.log(`MapService: Searching for "${geoJsonName}" in ${this.dbCounties.length} counties`);
    console.log(`MapService: Available DB counties:`, this.dbCounties.slice(0, 10), this.dbCounties.length > 10 ? '...' : '');
    
    const results = this.fuse.search(geoJsonName);
    
    console.log(`MapService: Found ${results.length} results for "${geoJsonName}"`);
    
    if (results.length === 0) {
      console.log(`MapService: ❌ No results for "${geoJsonName}"`);
      return null;
    }
    
    // Log top 3 results for debugging
    console.log(`MapService: Top 3 fuzzy matches:`);
    results.slice(0, 3).forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.item}" (score: ${result.score})`);
    });
    
    const bestMatch = results[0];
    const threshold = 0.4; // Configurable threshold (0 = perfect, 1 = no match)
    
    // Only return matches with score <= threshold (good match)
    // Fuse.js: score 0 = perfect match, 1 = no match
    if (bestMatch.score !== undefined && bestMatch.score <= threshold) {
      console.log(`MapService: ✅ GOOD MATCH: "${geoJsonName}" -> "${bestMatch.item}" (score: ${bestMatch.score}, threshold: ${threshold})`);
      return bestMatch.item;
    }
    
    console.log(`MapService: ❌ NO GOOD MATCH for "${geoJsonName}" (best score: ${bestMatch.score}, threshold: ${threshold})`);
    console.log(`MapService: Rejecting match because score ${bestMatch.score} > threshold ${threshold}`);
    return null;
  }

  // Get top fuzzy matches for debugging (without threshold filtering)
  getTopFuzzyMatches(geoJsonName: string, limit: number = 3): Array<{item: string, score: number}> {
    if (!this.fuse || !geoJsonName) {
      return [];
    }
    
    const results = this.fuse.search(geoJsonName);
    return results.slice(0, limit).map(result => ({
      item: result.item,
      score: result.score || 0
    }));
  }

  // Get agencies for a county
  getAgenciesForCounty(countyName: string): Agency[] {
    const matchedCounty = this.fuzzyMatchCounty(countyName);
    
    if (!matchedCounty) {
      return [];
    }
    
    return this.agencies.filter(agency => 
      agency["Head Office COUNTY"] === matchedCounty
    );
  }

  // Get map style for a county
  getMapStyle(feature: CountyFeature, isHovered: boolean = false): MapStyle {
    const countyName = this.getCountyName(feature);
    const agencies = this.getAgenciesForCounty(countyName);
    const hasAgencies = agencies.length > 0;
    
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
  }

  // Get statistics
  getStatistics() {
    const countiesWithAgencies = this.dbCounties.filter(county => {
      const agencies = this.agencies.filter(agency => 
        agency["Head Office COUNTY"] === county
      );
      return agencies.length > 0;
    });

    return {
      totalAgencies: this.agencies.length,
      totalCounties: this.dbCounties.length,
      countiesWithAgencies: countiesWithAgencies.length,
      countiesWithoutAgencies: this.dbCounties.length - countiesWithAgencies.length,
    };
  }

  // Get all agencies (for debugging)
  getAllAgencies(): Agency[] {
    return this.agencies;
  }

  // Get all counties (for debugging)
  getAllCounties(): string[] {
    return this.dbCounties;
  }
}
