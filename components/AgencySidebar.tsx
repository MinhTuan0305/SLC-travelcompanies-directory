"use client";

import { Agency } from "@/lib/services/mapService";
import Link from "next/link";

interface AgencySidebarProps {
  countyName: string;
  agencies: Agency[];
  matchedCounty: string | null;
  onClose: () => void;
}

export default function AgencySidebar({ 
  countyName, 
  agencies, 
  matchedCounty, 
  onClose 
}: AgencySidebarProps) {
  if (agencies.length === 0) {
    return (
      <div className="w-80 bg-white shadow-lg border-l border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">{countyName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Agencies Found</h3>
            <p className="text-gray-600 text-sm">
              {matchedCounty 
                ? `No agencies found in ${matchedCounty}`
                : `No matching county found for "${countyName}"`
              }
            </p>
            {!matchedCounty && (
              <p className="text-red-500 text-xs mt-2">
                County name doesn't match any in our database
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white shadow-lg border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{countyName}</h2>
            <p className="text-sm text-gray-600">
              {agencies.length} agencies found
              {matchedCounty && matchedCounty !== countyName && (
                <span className="text-blue-600 ml-1">
                  (matched: {matchedCounty})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <Link
          href={`/agencies?county=${encodeURIComponent(matchedCounty || countyName)}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View All in Agencies Page
        </Link>
      </div>

      {/* Agencies List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {agencies.map((agency) => (
            <div
              key={agency.ID}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              {/* Company Name */}
              <h3 className="font-medium text-gray-900 mb-1">
                {agency["Company name"] || "N/A"}
              </h3>
              
              {/* Sector */}
              {agency["SECTOR"] && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Sector:</span> {agency["SECTOR"]}
                </p>
              )}
              
              {/* Size */}
              {agency["SIZE (BASED ON STAFF NUMBER)"] && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Size:</span> {agency["SIZE (BASED ON STAFF NUMBER)"]}
                </p>
              )}
              
              {/* Address */}
              {agency["Address"] && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  <span className="font-medium">Address:</span> {agency["Address"]}
                </p>
              )}
              
              {/* ATOL Number */}
              {agency["ATOL Number"] && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">ATOL:</span> {agency["ATOL Number"]}
                </p>
              )}
              
              {/* Geographic Specialisation */}
              {agency["Geographic Specialisation"] && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Specialization:</span> {agency["Geographic Specialisation"]}
                </p>
              )}
              
              {/* View Details Link */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <Link
                  href={`/agencies/${agency.ID}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Showing {agencies.length} of {agencies.length} agencies
        </p>
      </div>
    </div>
  );
}
