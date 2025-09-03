"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  variant?: "hero" | "main";
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  insideForm?: boolean; // New prop to indicate if used inside another form
}

export default function SearchBar({ 
  variant = "main", 
  className = "",
  placeholder = "Search by company name, address, county...",
  defaultValue = "",
  insideForm = false // Default to false
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update search query when defaultValue changes
  useEffect(() => {
    setSearchQuery(defaultValue);
  }, [defaultValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", searchQuery.trim());
      router.push(`/agencies?${params.toString()}`);
    }
  };

  // If inside another form, don't render form element
  if (insideForm) {
    if (variant === "hero") {
      return (
        <div className={`w-full max-w-2xl animate-scale-in ${className}`}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-8 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-luxury-gold/20 transition-all duration-300 rounded-l-md"
            />
            <button 
              type="submit"
              className="absolute right-0 top-0 h-full bg-gradient-luxury text-white px-8 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
            >
              Search
            </button>
          </div>
        </div>
      );
    }

    // Main search variant without form
    return (
      <div className={`w-full ${className}`}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-6 py-4 text-lg bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-l-md"
          />
          <button 
            type="submit"
            className="absolute right-0 top-0 h-full bg-gradient-luxury text-white px-6 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
          >
            Search
          </button>
        </div>
      </div>
    );
  }

  // Normal rendering with form (when not inside another form)
  if (variant === "hero") {
    return (
      <div className={`w-full max-w-2xl animate-scale-in ${className}`}>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-8 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-luxury-gold/20 transition-all duration-300 rounded-l-md"
          />
          <button 
            type="submit"
            className="absolute right-0 top-0 h-full bg-gradient-luxury text-white px-8 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
          >
            Search
          </button>
        </form>
      </div>
    );
  }

  // Main search variant with form
  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 text-lg bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-l-md"
        />
        <button 
          type="submit"
          className="absolute right-0 top-0 h-full bg-gradient-luxury text-white px-6 py-3 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
        >
          Search
        </button>
      </form>
    </div>
  );
}
