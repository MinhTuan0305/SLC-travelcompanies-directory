// components/AgenciesSearchBar.tsx
"use client";

import React from "react";

interface AgenciesSearchBarProps {
  searchQuery: string;
  sort: string;
  sizeFilter: string;
  countyFilter: string;
  sectorFilter: string;
  geoFilter: string;
  uniqueSizes: string[];
  countyOptions: string[];
  uniqueSectors: string[];
  uniqueGeos: string[];
}

const AgenciesSearchBar: React.FC<AgenciesSearchBarProps> = ({
  searchQuery,
  sort,
  sizeFilter,
  countyFilter,
  sectorFilter,
  geoFilter,
  uniqueSizes,
  countyOptions,
  uniqueSectors,
  uniqueGeos,
}) => {
  return (
    <div className="flex items-center bg-white border-2 border-yellow-400 rounded-lg shadow-md overflow-hidden">
      {/* 🔹 Search Input */}
      <input
        type="text"
        defaultValue={searchQuery}
        placeholder="Where are you going?"
        className="flex-1 px-4 py-3 outline-none"
      />

      {/* 🔹 Size Filter */}
      <select defaultValue={sizeFilter} className="px-4 py-3 border-l outline-none">
        <option value="">All sizes</option>
        {uniqueSizes.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* 🔹 County Filter */}
      <select defaultValue={countyFilter} className="px-4 py-3 border-l outline-none">
        <option value="">All counties</option>
        {countyOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* 🔹 Sector Filter */}
      <select defaultValue={sectorFilter} className="px-4 py-3 border-l outline-none">
        <option value="">All sectors</option>
        {uniqueSectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* 🔹 Geo Filter */}
      <select defaultValue={geoFilter} className="px-4 py-3 border-l outline-none">
        <option value="">All geos</option>
        {uniqueGeos.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {/* 🔹 Sort */}
      <select defaultValue={sort} className="px-4 py-3 border-l outline-none">
        <option value="">Sort by</option>
        <option value="name">Name</option>
        <option value="size">Size</option>
      </select>

      {/* 🔹 Button */}
      <button className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700">
        Search
      </button>
    </div>
  );
};

export default AgenciesSearchBar;
