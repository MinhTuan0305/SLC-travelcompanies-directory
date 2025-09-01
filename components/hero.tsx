"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/Hero.jpg",   // Ảnh 1
  "/Hero2.jpg",  // Ảnh 2
  "/Hero3.jpg",  // Ảnh 3
  "/Hero4.jpg",  // Ảnh 4
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload first image and lazy load others
  useEffect(() => {
    const preloadFirstImage = new window.Image();
    preloadFirstImage.src = images[0];
    preloadFirstImage.onload = () => setImagesLoaded(true);
  }, []);

  // Chuyển ảnh mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px] md:h-[800px] lg:h-screen overflow-hidden">
      {/* Loading placeholder */}
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Loading...</p>
          </div>
        </div>
      )}

      {/* Slider Container */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="w-full h-full flex-shrink-0 relative"
          >
            <Image
              src={img}
              alt={`Hero image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0} // Only prioritize first image
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
              quality={85} // Reduce quality slightly for better performance
            />
          </div>
        ))}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4 bg-black bg-opacity-30">
        <h1 className="font-title text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-6 drop-shadow-lg">
          UK Travel Agency Directory
        </h1>
        <p className="font-body text-xl md:text-2xl text-center max-w-3xl drop-shadow-md">
          Discover and connect with trusted travel agencies across the United Kingdom
        </p>
      </div>
    </div>
  );
}
