import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CountySelect from "../../components/CountySelect";
import SearchWithSuggestions from "../../components/SearchWithSuggestions";
import Hero from "../../components/hero";

type Agency = {
  ID: number;
  "Company name"?: string;
  "Head Office COUNTY"?: string;
  "SECTOR"?: string;
  "SIZE (BASED ON STAFF NUMBER)"?: string;
  "Geographic Specialisation"?: string;
  "Address"?: string;
  agency_img?: {
    "Logo URL"?: string;
  };
};

export default async function Agencies({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
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

  // 🔹 Main query with logo JOIN
  let query = supabase
    .from("uk_agency")
    .select(
      `
      * ,
      agency_img:agency_img_id (
        "Logo URL"
      )
    `,
      { count: "exact" }
    );

  if (searchQuery) {
    query = query.or(
      `"Company name".ilike.%${searchQuery}%,` +
      `"Address".ilike.%${searchQuery}%,` +
      `"Head Office COUNTY".ilike.%${searchQuery}%`
    );
  }
  if (sizeFilter) query = query.eq('"SIZE (BASED ON STAFF NUMBER)"', sizeFilter);
  if (countyFilter) query = query.eq('"Head Office COUNTY"', countyFilter);
  if (sectorFilter) query = query.eq("SECTOR", sectorFilter);
  if (geoFilter) query = query.eq('"Geographic Specialisation"', geoFilter);

  query = query.order('"Company name"', { ascending: sort === "asc" });
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data: agencies, error, count } = (await query) as { data: Agency[]; error: any; count: number };

  if (error) {
    console.error("Database error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((count || 0) / pageSize);
  const totalCount = count || 0;
  const hasFilter = searchQuery || sizeFilter || countyFilter || sectorFilter || geoFilter;

  const createPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sort !== "desc") params.set("sort", sort);
    if (sizeFilter) params.set("size", sizeFilter);
    if (countyFilter) params.set("county", countyFilter);
    if (sectorFilter) params.set("sector", sectorFilter);
    if (geoFilter) params.set("geo", geoFilter);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  // 🔹 Agency Card Component with Logo
  const AgencyCard = ({ agency }: { agency: Agency }) => (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Logo Section */}
      <div className="w-full h-40 bg-slate-50 flex items-center justify-center border-b border-slate-200">
        {agency.agency_img?.["Logo URL"] ? (
          <img
            src={agency.agency_img["Logo URL"]}
            alt={`${agency["Company name"]} logo`}
            className="max-h-32 max-w-full object-contain p-2"
          />
        ) : (
          <div className="text-slate-400 text-sm flex flex-col items-center">
            <span className="text-2xl mb-1">🏢</span>
            <span>No Logo</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              href={`/agencies/${agency.ID}`}
              className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 block"
            >
              {agency["Company name"] || "No name"}
            </Link>
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
              <span>📍</span>
              <span>{agency["Head Office COUNTY"] || "N/A"}</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">🏢</span>
            <span className="font-medium text-slate-600">Sector:</span>
            <span className="text-slate-700">{agency["SECTOR"] || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">👥</span>
            <span className="font-medium text-slate-600">Size:</span>
            <span className="text-slate-700">{agency["SIZE (BASED ON STAFF NUMBER)"] || "N/A"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-400 mt-0.5">🌍</span>
            <div className="flex-1">
              <span className="font-medium text-slate-600">Specialisation:</span>
              <span className="text-slate-700 ml-1 line-clamp-2">
                {agency["Geographic Specialisation"] || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-400 mt-0.5">🏠</span>
            <div className="flex-1">
              <span className="font-medium text-slate-600">Address:</span>
              <span className="text-slate-700 ml-1 line-clamp-2">{agency["Address"] || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center pt-4 border-t border-slate-100">
          <Link
            href={`/agencies/${agency.ID}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {!hasFilter && <Hero />}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {hasFilter && (
          <Link
            href="/agencies"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
            Back to All Agencies
          </Link>
        )}

        {/* 🔹 Enhanced Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🔍</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Search & Filter Agencies</h2>
          </div>

          <form className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 min-w-[250px]">
                <SearchWithSuggestions defaultValue={searchQuery} />
              </div>
              <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <select
                  name="sort"
                  defaultValue={sort}
                  className="border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select
                name="size"
                defaultValue={sizeFilter}
                className="border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">👥 All Sizes</option>
                {uniqueSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
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
                className="border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">🏢 All Sectors</option>
                {uniqueSectors.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <select
                name="geo"
                defaultValue={geoFilter}
                className="border border-slate-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">🌍 All Regions</option>
                {uniqueGeos.map((geo) => (
                  <option key={geo} value={geo}>{geo}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* 🔹 Header with results */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {hasFilter ? 'Search Results' : 'UK Travel Agencies'}
            </h1>
            {agencies && agencies.length > 0 && (
              <p className="text-slate-600">
                Showing {startIndex + 1} - {endIndex} of {totalCount} agencies
                {hasFilter && " (filtered)"}
              </p>
            )}
          </div>
          <Link
            href="/agencies/new"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            ➕ Add New Agency
          </Link>
        </div>

        {/* 🔹 Results */}
        {!agencies || agencies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No agencies found</h3>
            <p className="text-slate-600 mb-6">
              {hasFilter
                ? "Try adjusting your search filters or search terms."
                : "No agencies are currently in the database."}
            </p>
            <Link
              href="/agencies"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Clear filters and view all agencies →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agencies.map((agency) => (
              <AgencyCard key={agency.ID} agency={agency} />
            ))}
          </div>
        )}

        {/* 🔹 Pagination */}
        {agencies && agencies.length > 0 && totalPages > 1 && (
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center items-center space-x-1">
                {page > 1 ? (
                  <Link
                    href={createPageUrl(page - 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">
                    ← Previous
                  </span>
                )}

                {getPageNumbers()[0] > 1 && (
                  <>
                    <Link
                      href={createPageUrl(1)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      1
                    </Link>
                    {getPageNumbers()[0] > 2 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                  </>
                )}

                {getPageNumbers().map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={createPageUrl(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === pageNum
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-700 bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <Link
                      href={createPageUrl(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {totalPages}
                    </Link>
                  </>
                )}

                {page < totalPages ? (
                  <Link
                    href={createPageUrl(page + 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed">
                    Next →
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages} • {totalCount} total agencies
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
