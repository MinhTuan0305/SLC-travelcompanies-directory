//store locator page with search and pagination
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCache } from "@/lib/hooks/useCache";
import dynamic from "next/dynamic";

// Lazy load components
const ResourcePreloader = dynamic(() => import("@/components/ResourcePreloader"), {
  loading: () => null
});

const OptimizedPagination = dynamic(() => import("@/components/OptimizedPagination"), {
  loading: () => (
    <div className="flex justify-center items-center space-x-2 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-8"></div>
      <div className="h-8 bg-gray-200 rounded w-8"></div>
      <div className="h-8 bg-gray-200 rounded w-8"></div>
    </div>
  )
});

interface Store {
  store_id: number;
  agency_id: number;
  trading_name: string | null;
  legal_name: string | null;
  head_office_county: string | null;
  head_office_address: string | null;
  stores_county: string | null;
  other_store_location_uk: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function StoresPage() {
  const supabase = createClient();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { get: getCache, set: setCache } = useCache<{stores: Store[], count: number}>(2 * 60 * 1000); // 2 minutes cache

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Tính toán pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // fetch dữ liệu với pagination và caching
  const fetchStores = useCallback(async (keyword: string = "", page: number = 1) => {
    const cacheKey = `stores_${keyword}_${page}`;
    const cachedData = getCache(cacheKey);
    
    if (cachedData) {
      setStores(cachedData.stores);
      setTotalCount(cachedData.count);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("store_locator")
      .select(
        "store_id,agency_id,trading_name,legal_name,head_office_county,head_office_address,stores_county,\"Other Store Location (UK)\"",
        { count: "exact" }
      )
      .order('agency_id', { ascending: false, nullsFirst: false })
      .range(from, to);

    if (keyword) {
      query = query.or(
        `trading_name.ilike.%${keyword}%,stores_county.ilike.%${keyword}%,head_office_address.ilike.%${keyword}%,\"Other Store Location (UK)\".ilike.%${keyword}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching stores:", error.message);
    } else {
      // chuyển đổi tên trường cho dễ truy cập trong TS
      type StoreRow = {
        store_id: number;
        agency_id: number | null;
        trading_name: string | null;
        legal_name: string | null;
        head_office_county: string | null;
        head_office_address: string | null;
        stores_county: string | null;
        "Other Store Location (UK)"?: string | null;
      };
      const storesWithNormalizedField = (data as StoreRow[]).map((s) => ({
        ...s,
        other_store_location_uk: s["Other Store Location (UK)"] || null,
      }));
      
      const result = {
        stores: storesWithNormalizedField as Store[],
        count: count || 0
      };
      
      // Cache the result
      setCache(cacheKey, result);
      
      setStores(result.stores);
      setTotalCount(result.count);
    }
    setLoading(false);
  }, [supabase, getCache, setCache]);

  // load initial
  useEffect(() => {
    fetchStores(searchTerm, currentPage);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang đầu khi search
    fetchStores(searchTerm, 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchStores("", 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner text="Loading stores..." />
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Preload critical resources */}
      <ResourcePreloader resources={['/videoherp.mp4']} type="video" />
      {/* Hero Section with Video Background */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            src="/videoherp.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Store Locator
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Discover travel agency locations across the United Kingdom. 
              Find the perfect store near you for personalized travel experiences.
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-8">
            <button
              onClick={() => {
                const searchSection = document.querySelector('.sticky-search-section');
                searchSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-luxury-gold hover:bg-luxury-gold-dark text-white px-8 py-4 text-lg font-medium transition-all duration-200 shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1 rounded-lg"
            >
              Find Your Store
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Section */}
      <div className="sticky-search-section bg-white shadow-luxury border border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-luxury-navy mb-4">Find Your Nearest Store</h2>
            <p className="text-luxury-navy/70 text-lg">Search by store name, county, or address</p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by store name, county, or address..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 text-lg border border-gray-200 focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-colors bg-white rounded-lg shadow-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-luxury hover:bg-luxury-gold-dark text-white px-8 py-4 text-lg font-medium transition-all duration-200 whitespace-nowrap shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1 rounded-lg"
                >
                  Search Stores
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-4 text-lg font-medium text-luxury-navy bg-white border border-gray-200 hover:bg-gray-50 hover:border-luxury-gold transition-colors rounded-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-luxury-navy">Store Locations</h3>
            <p className="text-luxury-navy/70 mt-1">
              Showing {Math.min(startIndex + 1, totalCount)} - {Math.min(startIndex + ITEMS_PER_PAGE, totalCount)} of {totalCount} stores
              {searchTerm && (
                <span className="ml-2 text-luxury-gold">
                  (filtered by "{searchTerm}")
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Store Cards Grid */}
        {stores.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {stores.map((store) => {
              const mapQuery = store.other_store_location_uk || "";
              
              return (
                                 <div
                   key={store.store_id}
                   className="bg-white shadow-luxury border border-gray-100/50 overflow-hidden hover:shadow-luxury-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                 >
                   <div className="p-6 flex flex-col flex-1">
                     {/* Store Header */}
                     <div className="mb-4">
                       <h4 className="font-semibold text-luxury-navy text-lg">
                         {store.trading_name || "Store Location"}
                       </h4>
                       {store.legal_name && store.legal_name !== store.trading_name && (
                         <p className="text-sm text-luxury-navy/70">
                           {store.legal_name}
                         </p>
                       )}
                     </div>

                     {/* Store Details */}
                     <div className="space-y-3 flex-1">
                       {/* Store Location */}
                       {store.other_store_location_uk && (
                         <div>
                           <span className="font-medium text-luxury-navy/70 text-sm">Store Location:</span>
                           <p className="text-luxury-navy font-medium">
                             {store.other_store_location_uk}
                           </p>
                         </div>
                       )}

                       {/* County */}
                       {store.stores_county && (
                         <div>
                           <span className="font-medium text-luxury-navy/70 text-sm">County:</span>
                           <p className="text-luxury-navy">{store.stores_county}</p>
                         </div>
                       )}

                       {/* Head Office Address */}
                       {store.head_office_address && (
                         <div>
                           <span className="font-medium text-luxury-navy/70 text-sm">Head Office:</span>
                           <p className="text-luxury-navy text-sm">{store.head_office_address}</p>
                         </div>
                       )}
                     </div>

                     {/* Action Buttons - Always at bottom */}
                     <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                       {/* View Details Button */}
                       {store.agency_id && store.agency_id > 0 ? (
                         <Link
                           href={`/agencies/${store.agency_id}`}
                           className="flex-1 text-center px-4 py-3 text-sm font-medium text-luxury-gold bg-luxury-gold/10 border border-luxury-gold/20 hover:bg-luxury-gold/20 hover:border-luxury-gold/30 transition-all duration-200"
                         >
                           View Agency Details
                         </Link>
                       ) : (
                         <button
                           disabled
                           className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                         >
                           No Agency Details
                         </button>
                       )}

                       {/* Get Directions Button */}
                       {mapQuery ? (
                         <a
                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                             mapQuery
                           )}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 text-center px-4 py-3 text-sm font-medium text-white bg-luxury-gold hover:bg-luxury-gold-dark transition-colors shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-0.5"
                         >
                           Get Directions
                         </a>
                       ) : (
                         <button
                           disabled
                           className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed"
                         >
                           No Directions
                         </button>
                       )}
                     </div>
                   </div>
                 </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-luxury-navy mb-2">No stores found</h3>
            <p className="text-luxury-navy/70">
              {searchTerm 
                ? `No stores match your search for "${searchTerm}". Try adjusting your search criteria.`
                : "No stores are currently available."
              }
            </p>
            {searchTerm && (
              <button
                onClick={handleClear}
                className="mt-4 px-6 py-2 text-sm font-medium text-luxury-gold bg-luxury-gold/10 border border-luxury-gold/20 hover:bg-luxury-gold/20 hover:border-luxury-gold/30 transition-all duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Optimized Pagination */}
        <OptimizedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}