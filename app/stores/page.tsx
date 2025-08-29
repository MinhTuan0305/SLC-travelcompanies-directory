//store locator page with search and pagination
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

  // Tính toán pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // fetch dữ liệu với pagination
  const fetchStores = async (keyword: string = "", page: number = 1) => {
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
      console.error(
        "❌ Error fetching stores:",
        error.message,
        error.details,
        error.hint
      );
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
      
      // Debug data to check agency_id values
      console.log("🔍 Store data:", storesWithNormalizedField);
      storesWithNormalizedField.forEach(store => {
        console.log(`Store ${store.store_id}:`, {
          agency_id: store.agency_id,
          type: typeof store.agency_id,
          truthy: !!store.agency_id
        });
      });
      
      setStores(storesWithNormalizedField as Store[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  // load initial
  useEffect(() => {
    fetchStores(searchTerm, currentPage);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang đầu khi search
    fetchStores(searchTerm, 1);
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

  // Tạo array số trang để hiển thị
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Điều chỉnh startPage nếu endPage đã ở cuối
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return <div className="p-6">Loading stores...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stores Locator</h1>

      {/* Search box */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, county or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Clear
          </button>
        )}
      </form>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {Math.min(startIndex + 1, totalCount)} - {Math.min(startIndex + ITEMS_PER_PAGE, totalCount)} of {totalCount} stores
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>

      {/* Results */}
      <ul className="space-y-4 mb-6">
        {stores.map((store) => {
          const mapQuery = store.other_store_location_uk || "";
          
          return (
            <li
              key={store.store_id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <p className="font-semibold">{store.trading_name}</p>

              {/* Store Location */}
              {store.other_store_location_uk && (
                <p className="text-base font-medium text-gray-800">
                  <span className="font-semibold">Store Location:</span>{" "}
                  {store.other_store_location_uk}
                </p>
              )}

              {/* Head Office Address */}
              {store.head_office_address && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Head Office:</span>{" "}
                  {store.head_office_address}
                </p>
              )}

              {/* County */}
              <p className="text-sm text-gray-600 mt-1">
                County: {store.stores_county}
              </p>

              {/* Buttons container */}
              <div className="flex gap-2 mt-3">
                {/* View Details Button - Always show, disabled if no agency_id */}
                {store.agency_id && store.agency_id > 0 ? (
                  <Link
                    href={`/agencies/${store.agency_id}`}
                    className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-block px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    View Details
                  </button>
                )}

                {/* Take me there Button - Link to Google Maps */}
                {mapQuery && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      mapQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Take me there
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {stores.length === 0 && !loading && (
        <p className="text-gray-500 mt-4">No stores found.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {/* First page */}
          {getPageNumbers()[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                1
              </button>
              {getPageNumbers()[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Page numbers */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm border rounded-lg ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <>
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
}