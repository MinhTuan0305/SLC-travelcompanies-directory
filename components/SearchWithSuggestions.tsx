// components/SearchWithSuggestions.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: number;
  name: string;
  sector: string;
  county: string;
}

interface SearchWithSuggestionsProps {
  defaultValue?: string;
  onSelect?: (suggestion: Suggestion | null) => void;
}

// 🚀 Cache for search results
const searchCache = new Map<string, Suggestion[]>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

export default function SearchWithSuggestions({ 
  defaultValue = "", 
  onSelect 
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🚀 Memoized search function
  const searchCompanies = useCallback(async (searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check cache first
    const cacheKey = searchQuery.toLowerCase().trim();
    const cachedResult = searchCache.get(cacheKey);
    const cacheTime = cacheTimestamps.get(cacheKey);
    
    if (cachedResult && cacheTime && Date.now() - cacheTime < CACHE_EXPIRY) {
      setSuggestions(cachedResult);
      setIsOpen(cachedResult.length > 0);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    try {
      // Create client dynamically
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      // 🚀 Optimized query - only select needed fields, add limit early
      const { data, error } = await supabase
        .from("uk_agency")
        .select('ID, "Company name", SECTOR, "Head Office COUNTY"')
        .or(
          `"Company name".ilike.%${searchQuery}%,` +
          `"Address".ilike.%${searchQuery}%,` +
          `"Head Office COUNTY".ilike.%${searchQuery}%`
        )
        .order('"Company name"') // Add consistent ordering
        .limit(8); // Reduce limit for faster response

      if (error) {
        console.error("Search error:", error);
        setSuggestions([]);
        return;
      }

      if (controller.signal.aborted) return;

      const formattedSuggestions = data?.map(item => ({
        id: item.ID,
        name: item["Company name"] || "No name",
        sector: item.SECTOR || "Unknown",
        county: item["Head Office COUNTY"] || "Unknown"
      })) || [];

      // 🚀 Cache the results
      searchCache.set(cacheKey, formattedSuggestions);
      cacheTimestamps.set(cacheKey, Date.now());

      // Clean old cache entries (keep last 50)
      if (searchCache.size > 50) {
        const oldestKey = Array.from(cacheTimestamps.entries())
          .sort(([,a], [,b]) => a - b)[0][0];
        searchCache.delete(oldestKey);
        cacheTimestamps.delete(oldestKey);
      }

      setSuggestions(formattedSuggestions);
      setIsOpen(formattedSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error("Search error:", err);
        setSuggestions([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // 🚀 Debounced search with cleanup
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchCompanies(query);
    }, 250); // Reduced debounce time

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, searchCompanies]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = useCallback((suggestion: Suggestion) => {
    // 🚀 Use router.prefetch for faster navigation
    router.prefetch(`/agencies/${suggestion.id}`);
    router.push(`/agencies/${suggestion.id}`);
    
    // Close dropdown
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Update input value
    setQuery(suggestion.name);
    
    // Call onSelect callback if provided
    onSelect?.(suggestion);
  }, [router, onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSelect?.(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search by company name, address, county..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          autoComplete="off"
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.id}-${index}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-150 ${
                index === selectedIndex ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">
                {suggestion.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {suggestion.sector} • {suggestion.county}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No companies found for &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  );
}