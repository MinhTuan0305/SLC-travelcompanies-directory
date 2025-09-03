"use client";
import { useState, useEffect, Suspense } from "react";
import SearchBar from "./SearchBar";

const images = [
  "/Hero.jpg",   // Ảnh 1
  "/Hero2.jpg",  // Ảnh 2
  "/Hero3.jpg",  // Ảnh 3
  "/Hero4.jpg",  // Ảnh 4
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Chuyển ảnh mỗi 6 giây (chậm hơn cho luxury feel)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Static first image - always visible, no hydration issues */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${images[0]}')` }}
      />
      
      {/* Animated slider overlay - only visible after hydration */}
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
        
        {/* Luxury Search Bar - Using SearchBar Component */}
        <Suspense fallback={<div className="w-full max-w-2xl h-16 bg-white/95 rounded-md animate-pulse"></div>}>
          <SearchBar 
            variant="hero" 
            placeholder="Search for luxury travel experiences..."
          />
        </Suspense>
        
        {/* Luxury Indicators - Square Design */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 transition-all duration-300 ${
                index === current 
                  ? 'bg-luxury-gold scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
