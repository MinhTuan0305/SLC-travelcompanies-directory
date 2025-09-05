"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FloatingSearchBarProps {
  searchQuery?: string;
  atolQuery?: string;
}

export default function FloatingSearchBar({ 
  searchQuery = "",
  atolQuery = ""
}: FloatingSearchBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [atolValue, setAtolValue] = useState(atolQuery);
  const router = useRouter();

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const searchSection = document.getElementById('search-section');
      if (searchSection) {
        const searchSectionTop = searchSection.offsetTop;
        const scrollY = window.scrollY;
        
        // Show floating search bar when scrolling past search section
        if (scrollY > searchSectionTop + searchSection.offsetHeight) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        // Fallback: show after scrolling past hero if search section not found
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        
        if (scrollY > heroHeight * 0.5) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) {
      params.set('q', searchValue.trim());
    }
    if (atolValue.trim()) {
      params.set('atol', atolValue.trim());
    }
    if (params.toString()) {
      router.push(`/agencies?${params.toString()}`);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-luxury animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-luxury-navy">Quick Search</h3>
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search agencies..."
                className="flex-1 px-4 py-3 text-sm bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-l-md"
              />
              <input
                type="text"
                value={atolValue}
                onChange={(e) => setAtolValue(e.target.value)}
                placeholder="ATOL number..."
                className="flex-1 px-4 py-3 text-sm bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-md"
              />
              <button 
                type="submit"
                className="bg-gradient-luxury text-white px-6 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
