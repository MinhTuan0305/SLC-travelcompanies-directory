"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FloatingSearchBarProps {
  searchQuery?: string;
}

export default function FloatingSearchBar({ 
  searchQuery = ""
}: FloatingSearchBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      
      // Show floating search bar when scrolling past hero
      if (scrollY > heroHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/agencies?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-luxury animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-luxury-navy">Quick Search</h3>
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search agencies..."
                className="w-full px-6 py-3 text-lg bg-white border border-gray-200 text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all duration-300 rounded-l-md"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full bg-gradient-luxury text-white px-6 font-medium hover:bg-luxury-gold-dark transition-all duration-300 rounded-r-md"
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
