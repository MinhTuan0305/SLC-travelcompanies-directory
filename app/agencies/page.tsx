import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import CountySelect from "../../components/CountySelect";
import SearchBar from "../../components/SearchBar";
import QuickJumpSelect from "../../components/QuickJumpSelect";
import Hero from "../../components/hero";
import ErrorBoundary from "../../components/ErrorBoundary";
import AgenciesHeader from "../../components/AgenciesHeader";

// Lazy load components that are not immediately visible
const FloatingSearchBar = dynamic(() => import("../../components/FloatingSearchBar"), {
  loading: () => null
});

type Agency = {
  ID: number;
  "Company name"?: string;
  "Head Office COUNTY"?: string;
  "SECTOR"?: string;
  "SIZE (BASED ON STAFF NUMBER)"?: string;
  "Geographic Specialisation"?: string;
  "Address"?: string;
  "ATOL Number"?: string;
  agency_img?: {
    "Logo URL"?: string;
  };
};

export default async function Agencies({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    atol?: string;
    sort?: string;
    page?: string;
    size?: string;
    county?: string;
    sector?: string;
    geo?: string;
  }>;
}) {
  const supabase = await createClient();

  // 🔹 Resolve searchParams
  const params = await searchParams;
  const searchQuery = params?.q || "";
  const atolQuery = params?.atol || "";
  const sort = params?.sort || "desc";
  const sizeFilter = params?.size || "";
  const countyFilter = params?.county || "";
  const sectorFilter = params?.sector || "";
  const geoFilter = params?.geo || "";
  const page = parseInt(params?.page || "1", 10);
  const pageSize = 12;

  // 🔹 Unique filter values
  const { data: sizeOptions } = await supabase.from("uk_agency").select('"SIZE (BASED ON STAFF NUMBER)"');
  const uniqueSizes = Array.from(
    new Set(sizeOptions?.map((row) => row["SIZE (BASED ON STAFF NUMBER)"]?.trim()).filter(Boolean))
  ).sort();
  
  // Create improved size filter options with specific ranges
  const predefinedSizes = ["Micro", "Small", "Medium", "Large"];
  const existingSizes = uniqueSizes.filter(size => !predefinedSizes.includes(size));
  
  const sizeFilterOptions = [
    { value: "", label: "All Sizes" },
    { value: "Micro", label: "Micro (<10 staff)" },
    { value: "Small", label: "Small (<50 staff)" },
    { value: "Medium", label: "Medium (50-99 staff)" },
    { value: "Large", label: "Large (100+ staff)" },
    // Keep existing sizes for backward compatibility (excluding predefined ones)
    ...existingSizes.map(size => ({ value: size, label: size }))
  ];

  const { data: countyOptions } = await supabase.from("uk_agency").select('"Head Office COUNTY"');
  const uniqueCounties = Array.from(
    new Set(countyOptions?.map((row) => row["Head Office COUNTY"]?.trim()).filter(Boolean))
  ).sort();
  const countyOptionsForSelect = uniqueCounties.map((c) => ({ value: c, label: c }));

  const { data: sectorOptions } = await supabase.from("uk_agency").select("SECTOR");
  const uniqueSectors = Array.from(
    new Set(sectorOptions?.map((row) => row["SECTOR"]?.trim()).filter(Boolean))
  ).sort();

  const { data: geoOptions } = await supabase.from("uk_agency").select('"Geographic Specialisation"');
  const uniqueGeos = Array.from(
    new Set(geoOptions?.map((row) => row["Geographic Specialisation"]?.trim()).filter(Boolean))
  ).sort();

  // 🔹 Fallback to simple query to avoid field name issues
  let query = supabase
    .from("uk_agency")
    .select("*", { count: "exact" });

  if (searchQuery && searchQuery.trim()) {
    const cleanSearchQuery = searchQuery.trim().replace(/[%_]/g, '\\$&'); // Escape special characters
    query = query.or(
      `"Company name".ilike.%${cleanSearchQuery}%,` +
      `"Address".ilike.%${cleanSearchQuery}%,` +
      `"Head Office COUNTY".ilike.%${cleanSearchQuery}%`
    );
  }
  
  // Add ATOL number search
  if (atolQuery && atolQuery.trim()) {
    const cleanAtolQuery = atolQuery.trim().replace(/[%_]/g, '\\$&'); // Escape special characters
    query = query.ilike('"ATOL Number"', `%${cleanAtolQuery}%`);
  }
  if (sizeFilter && sizeFilter.trim()) {
    const trimmedSize = sizeFilter.trim();
    
    // Handle new size ranges
    if (trimmedSize === "Micro") {
      // Micro: <10 staff
      query = query.or('"SIZE (BASED ON STAFF NUMBER)".ilike.%micro%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%1-9%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%<10%');
    } else if (trimmedSize === "Small") {
      // Small: <50 staff
      query = query.or('"SIZE (BASED ON STAFF NUMBER)".ilike.%small%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%1-49%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%<50%');
    } else if (trimmedSize === "Medium") {
      // Medium: 50-99 staff
      query = query.or('"SIZE (BASED ON STAFF NUMBER)".ilike.%medium%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%50-99%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%50-99%');
    } else if (trimmedSize === "Large") {
      // Large: 100+ staff
      query = query.or('"SIZE (BASED ON STAFF NUMBER)".ilike.%large%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%100+%,' +
                      '"SIZE (BASED ON STAFF NUMBER)".ilike.%>100%');
    } else {
      // Use exact match for existing size values
      query = query.eq('"SIZE (BASED ON STAFF NUMBER)"', trimmedSize);
    }
  }
  if (countyFilter && countyFilter.trim()) query = query.eq('"Head Office COUNTY"', countyFilter.trim());
  if (sectorFilter && sectorFilter.trim()) query = query.eq("SECTOR", sectorFilter.trim());
  if (geoFilter && geoFilter.trim()) query = query.eq('"Geographic Specialisation"', geoFilter.trim());

  query = query.order('"Company name"', { ascending: sort === "asc" });
  
  // Validate pagination parameters
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize) || 10)); // Max 100 items per page
  query = query.range((safePage - 1) * safePageSize, safePage * safePageSize - 1);

  let agencies, error, count;
  
  try {
    const result = await query;
    agencies = result.data;
    error = result.error;
    count = result.count;
  } catch (err) {
    console.error("Query execution error:", err);
    error = { message: `Query failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    agencies = null;
    count = null;
  }

  if (error) {
    console.error("Database error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Try a simple fallback query
    try {
      console.log("Attempting fallback query...");
      const fallbackResult = await supabase
        .from("uk_agency")
        .select("ID, \"Company name\", SECTOR, \"Head Office COUNTY\", Address, agency_img_id", { count: "exact" })
        .order('"Company name"')
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (!fallbackResult.error) {
        console.log("Fallback query successful");
        agencies = fallbackResult.data;
        count = fallbackResult.count;
        error = null;
      } else {
        console.error("Fallback query also failed:", fallbackResult.error);
      }
    } catch (fallbackErr) {
      console.error("Fallback query execution error:", fallbackErr);
    }
    
    // If still error, show error page
    if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Database Error</h2>
            <p className="text-red-600">Unable to fetch agencies. Please try again later.</p>
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-700">Error Details</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
          </div>
        </div>
      </div>
    );
    }
  }

  const hasFilter = searchQuery || sizeFilter || countyFilter || sectorFilter || geoFilter;
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / safePageSize);

  // 🔹 Agency Card Component
  const AgencyCard = ({ agency }: { agency: Agency }) => (
    <div className="bg-white shadow-luxury border border-gray-100/50 overflow-hidden hover:shadow-luxury-hover hover:-translate-y-1 transition-all duration-300">
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 mb-4 bg-slate-50">
          {agency.agency_img?.["Logo URL"] ? (
            <img
              src={agency.agency_img["Logo URL"]}
              alt={`${agency["Company name"]} logo`}
              className="max-h-16 max-w-full object-contain"
            />
          ) : (
            <div className="text-slate-400 text-2xl">🏢</div>
          )}
        </div>

        {/* Company Info */}
        <div className="text-center mb-4">
                          <h3 className="text-xxl font-bold text-luxury-navy mb-2 leading-tight">
                  {agency["Company name"] || "N/A"}
                </h3>
          <div className="flex items-center justify-center gap-2 text-sm text-luxury-navy/70">
            <span>📍</span>
            <span>{agency["Head Office COUNTY"] || "N/A"}</span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">🏢</span>
            <div className="flex-1">
              <span className="font-medium text-luxury-navy/70">Sector:</span>
              <span className="text-luxury-navy ml-1">{agency["SECTOR"] || "N/A"}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">👥</span>
            <div className="flex-1">
              <span className="font-medium text-luxury-navy/70">Size:</span>
              <span className="text-luxury-navy ml-1">{agency["SIZE (BASED ON STAFF NUMBER)"] || "N/A"}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5">🌍</span>
            <div className="flex-1">
              <span className="font-medium text-luxury-navy/70">Specialization:</span>
              <span className="text-luxury-navy ml-1">{agency["Geographic Specialisation"] || "N/A"}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-400 mt-0.5">🏠</span>
            <div className="flex-1">
              <span className="font-medium text-luxury-navy/70">Address:</span>
              <span className="text-luxury-navy ml-1 line-clamp-2">{agency["Address"] || "N/A"}</span>
            </div>
          </div>
          {agency["ATOL Number"] && (
            <div className="flex items-start gap-2 text-sm">
              <span className="text-slate-400 mt-0.5">📋</span>
              <div className="flex-1">
                <span className="font-medium text-luxury-navy/70">ATOL:</span>
                <span className="text-luxury-navy ml-1">{agency["ATOL Number"]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-100">
          <Link
            href={`/agencies/${agency.ID}`}
            className="text-sm font-medium text-luxury-gold hover:text-luxury-gold-dark transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {!hasFilter && <Hero />}
      
      {/* Floating Search Bar */}
        <FloatingSearchBar searchQuery={searchQuery} atolQuery={atolQuery} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasFilter && (
          <Link
            href="/agencies"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 text-sm font-medium text-luxury-gold bg-luxury-gold/10 border border-luxury-gold/20 hover:bg-luxury-gold/20 hover:border-luxury-gold/30 transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
            Back to All Agencies
          </Link>
        )}

        {/* 🔹 Enhanced Search Section with SearchBar Component */}
        <div id="search-section" className="bg-white shadow-luxury border border-gray-100/50 p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-luxury-navy">Search & Filter Agencies</h2>
          </div>

          <form className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search by company name, address, county..."
                  className="w-full px-6 py-4 text-lg bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-l-md"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  name="atol"
                  defaultValue={atolQuery}
                  placeholder="Search by ATOL number..."
                  className="w-full px-6 py-4 text-lg bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-md"
                />
              </div>
              <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <select
                  name="sort"
                  defaultValue={sort}
                  className="border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors bg-white"
                >
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-luxury hover:bg-luxury-gold-dark text-white px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                name="size"
                defaultValue={sizeFilter}
                className="border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors bg-white"
              >
                {sizeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <div className="min-w-0">
                <CountySelect
                  options={countyOptionsForSelect}
                  value={countyFilter}
                  key={`county-select-${countyFilter}`}
                />
              </div>

              <select
                name="sector"
                defaultValue={sectorFilter}
                className="border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors bg-white"
              >
                <option value="">All Sectors</option>
                {uniqueSectors.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <select
                name="geo"
                defaultValue={geoFilter}
                className="border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors bg-white"
              >
                <option value="">All Regions</option>
                {uniqueGeos.map((geo) => (
                  <option key={geo} value={geo}>{geo}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <AgenciesHeader 
          page={page} 
          pageSize={pageSize} 
          totalCount={totalCount} 
        />

        {/* Agencies Grid */}
        {agencies && agencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agencies.map((agency) => (
              <AgencyCard key={agency.ID} agency={agency} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-luxury-navy mb-2">No agencies found</h3>
            <p className="text-luxury-navy/70">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-12">
            {/* Pagination Info */}
            <div className="text-sm text-luxury-navy/70">
              Page {page} of {totalPages} • {totalCount} results
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              {page > 2 && (
                <>
                  <Link
                    href={`/agencies?${new URLSearchParams({
                      ...params,
                      page: "1",
                    })}`}
                    className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 rounded-l-lg"
                  >
                    1
                  </Link>
                  {page > 3 && (
                    <span className="px-2 text-luxury-navy/50">...</span>
                  )}
                </>
              )}
              
              {/* Previous Page */}
              {page > 1 ? (
              <Link
                href={`/agencies?${new URLSearchParams({
                  ...params,
                  page: (page - 1).toString(),
                })}`}
                  className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 flex items-center gap-1"
              >
                  <span>←</span>
                  <span className="hidden sm:inline">Previous</span>
              </Link>
              ) : (
                <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed flex items-center gap-1">
                  <span>←</span>
                  <span className="hidden sm:inline">Previous</span>
                </span>
              )}
              
              {/* Current Page and Adjacent Pages */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
              <Link
                key={pageNum}
                href={`/agencies?${new URLSearchParams({
                  ...params,
                  page: pageNum.toString(),
                })}`}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  pageNum === page
                        ? "text-white bg-luxury-gold border border-luxury-gold shadow-luxury"
                        : "text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold hover:shadow-sm"
                }`}
              >
                {pageNum}
              </Link>
                );
              })}
            
              {/* Next Page */}
              {page < totalPages ? (
              <Link
                href={`/agencies?${new URLSearchParams({
                  ...params,
                  page: (page + 1).toString(),
                })}`}
                  className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span>→</span>
                </Link>
              ) : (
                <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed flex items-center gap-1">
                  <span className="hidden sm:inline">Next</span>
                  <span>→</span>
                </span>
              )}
              
              {/* Last Page */}
              {page < totalPages - 1 && (
                <>
                  {page < totalPages - 2 && (
                    <span className="px-2 text-luxury-navy/50">...</span>
                  )}
                  <Link
                    href={`/agencies?${new URLSearchParams({
                      ...params,
                      page: totalPages.toString(),
                    })}`}
                    className="px-3 py-2 text-sm font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-luxury-gold/5 hover:border-luxury-gold transition-all duration-200 rounded-r-lg"
                  >
                    {totalPages}
              </Link>
                </>
              )}
            </div>
            
            {/* Quick Jump */}
            <QuickJumpSelect 
              currentPage={page}
              totalPages={totalPages}
              searchParams={params}
            />
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
