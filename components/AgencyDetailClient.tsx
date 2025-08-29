"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Agency {
  ID?: number;
  ["Company name"]?: string;
  ["Legal Comapny Name (As Per Companies House)"]?: string; // SỬA: thiếu chữ 'a' trong Company
  ["Company profile/ About Us"]?: string;
  SECTOR?: string;
  ["SIZE (BASED ON STAFF NUMBER)"]?: string;
  ["Head Office COUNTY"]?: string;
  Address?: string;
  ["Other Store Locations (UK)"]?: string;
  ["ATOL Number"]?: string;
  ["Geographic Specialisation"]?: string;
  ["Destinations Selling (Country / Continent)"]?: string;
  ["Link to website"]?: string;
}

// Lazy load map
const CompanyMap = dynamic(() => import("./CompanyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading interactive map...</p>
      </div>
    </div>
  ),
});

// ✅ Fix: nhận string | undefined
const getGoogleMapsUrl = (address?: string) => {
  if (!address) return "#";
  const formattedAddress = address.replace(/\s+/g, "+").replace(/,/g, "%2C");
  return `https://www.google.com/maps/search/?api=1&query=${formattedAddress}`;
};

// ✅ Fix: nhận string | undefined
const formatWebsiteUrl = (url?: string) => {
  if (!url) return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};

const InfoCard = ({
  title,
  content,
  icon,
  className = "",
}: {
  title: string;
  content?: string;
  icon?: string;
  className?: string;
}) => (
  <div
    className={`group relative p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <p className="text-slate-700 leading-relaxed">{content || "N/A"}</p>
    </div>
  </div>
);

export default function AgencyDetailClient({ agency }: { agency: Agency }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!agency.ID) return;
    const confirmDelete = confirm(
      `⚠️ This action cannot be undone!\n\nAre you sure you want to delete "${agency["Company name"]}"?`
    );
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("uk_agency")
        .delete()
        .eq("ID", agency.ID);
      if (error) {
        alert("❌ Delete failed: " + error.message);
      } else {
        alert("✅ Agency deleted successfully.");
        router.push("/agencies");
      }
    } catch (err) {
      alert("❌ An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/agencies"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">
            ←
          </span>
          Back to Agencies
        </Link>

        {/* Hero */}
        <div className="mb-8 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Travel Agency
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3">
                {agency["Company name"] || "N/A"}
              </h1>
              {/* Legal Company Name - SỬA TÊN FIELD */}
              {agency["Legal Comapny Name (As Per Companies House)"] && (
                <p className="text-lg text-slate-600 mb-2">
                  <span className="font-medium">Legal Name:</span>{" "}
                  {agency["Legal Comapny Name (As Per Companies House)"]}
                </p>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <span>📍</span>
                <span className="font-medium">
                  {agency["Head Office COUNTY"] || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/agencies/${agency.ID}/edit`}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mb-8 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600">ℹ️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">About Us</h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg">
            {agency["Company profile/ About Us"] || "N/A"}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <InfoCard title="Sector" content={agency.SECTOR} icon="🏢" />
          <InfoCard
            title="Company Size"
            content={agency["SIZE (BASED ON STAFF NUMBER)"]}
            icon="👥"
          />
          <InfoCard
            title="Head Office Address"
            content={agency.Address}
            icon="🏠"
          />
          <InfoCard
            title="Legal Name"
            content={agency["Legal Comapny Name (As Per Companies House)"]}
            icon="📋"
          />
          <InfoCard title="ATOL Number" content={agency["ATOL Number"]} icon="🛡️" />
          <InfoCard
            title="Geographic Specialisation"
            content={agency["Geographic Specialisation"]}
            icon="🌍"
          />
          <InfoCard
            title="Other Store Locations (UK)"
            content={agency["Other Store Locations (UK)"]}
            icon="📍"
            className="md:col-span-2 xl:col-span-3"
          />
          <InfoCard
            title="Destinations We Sell"
            content={agency["Destinations Selling (Country / Continent)"]}
            icon="✈️"
            className="md:col-span-2 xl:col-span-3"
          />
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">🗺️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Find Us</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={getGoogleMapsUrl(agency.Address)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors duration-200 ${
                  agency.Address
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-300 text-slate-600 cursor-not-allowed"
                }`}
              >
                🧭 {agency.Address ? "Get Directions" : "N/A"}
              </a>
              <a
                href={formatWebsiteUrl(agency["Link to website"])}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors duration-200 ${
                  agency["Link to website"]
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-slate-300 text-slate-600 cursor-not-allowed"
                }`}
              >
                🌐 {agency["Link to website"] ? "Visit Website" : "N/A"}
              </a>
            </div>
          </div>
          {agency.Address ? (
            <div className="rounded-xl overflow-hidden shadow-sm">
              <CompanyMap address={agency.Address} />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-400 border border-slate-200 rounded-xl">
              No map available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
