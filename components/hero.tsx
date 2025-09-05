"use client";
import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import SearchBar from "./SearchBar";

const images = [
  "/Hero.jpg",   // Ảnh 1
  "/Hero2.jpg",  // Ảnh 2
  "/Hero3.jpg",  // Ảnh 3
  "/Hero4.jpg",  // Ảnh 4
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize image change handler
  const handleImageChange = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Memoize next image calculation
  const nextImage = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, []);

  // Optimized interval with cleanup
  useEffect(() => {
    if (!isLoaded) return;
    
    const interval = setInterval(nextImage, 6000);
    return () => clearInterval(interval);
  }, [nextImage, isLoaded]);

  // Preload images and set loaded state
  useEffect(() => {
    const preloadImages = () => {
      const promises = images.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      });
      
      Promise.all(promises)
        .then(() => setIsLoaded(true))
        .catch(() => setIsLoaded(true)); // Still show even if some images fail
    };

    preloadImages();
  }, []);

  // Memoize indicators to prevent unnecessary re-renders
  const indicators = useMemo(() => (
    images.map((_, index) => (
      <button
        key={index}
        onClick={() => handleImageChange(index)}
        className={`w-3 h-3 transition-all duration-300 ${
          index === current 
            ? 'bg-luxury-gold scale-125 shadow-lg' 
            : 'bg-white/50 hover:bg-white/80'
        }`}
        aria-label={`Go to slide ${index + 1}`}
      />
    ))
  ), [current, handleImageChange]);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Static first image - always visible, no hydration issues */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${images[0]}')` }}
      />
      
      {/* Animated slider overlay - only visible after images are loaded */}
      {isLoaded && (
        <div
          className="absolute inset-0 flex transition-transform duration-2000 ease-in-out"
          style={{ 
            transform: `translateX(-${current * 100}%)`,
            opacity: 1
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
        </div>
      )}

      {/* Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/50" />
      
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        {/* Main Title */}
        <h1 className="font-playfair text-hero font-bold text-white mb-8 animate-fade-in drop-shadow-2xl">
          UK Travel Agency Directory
        </h1>
        
        {/* Subtitle */}
        <p className="font-inter text-body-lg text-white/90 max-w-4xl mb-12 animate-slide-up drop-shadow-lg">
          Discover and connect with the world's most prestigious travel agencies across the United Kingdom
        </p>
        
        {/* Find Agency Button */}
        <div className="animate-scale-in">
          <button
            onClick={() => {
              const searchSection = document.getElementById('search-section');
              if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-luxury hover:bg-luxury-gold-dark text-white px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-luxury hover:shadow-luxury-hover transform hover:-translate-y-1 rounded-md"
          >
            Find Agency
          </button>
        </div>
        
        {/* Luxury Indicators - Square Design */}
        {isLoaded && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-4">
            {indicators}
          </div>
        )}
      </div>
    </div>
  );
}
