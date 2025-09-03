"use client";
import { useEffect, useState } from 'react';

interface ImagePreloaderProps {
  images: string[];
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
}

export default function ImagePreloader({ 
  images, 
  onLoadComplete, 
  onLoadError 
}: ImagePreloaderProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loaded = new Set<string>();

    const preloadImages = async () => {
      try {
        const promises = images.map((src) => {
          return new Promise<string>((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
              if (isMounted) {
                loaded.add(src);
                setLoadedImages(new Set(loaded));
                resolve(src);
              }
            };
            
            img.onerror = () => {
              if (isMounted) {
                console.warn(`Failed to load image: ${src}`);
                resolve(src); // Still resolve to continue with other images
              }
            };
            
            // Set loading priority
            img.loading = 'eager';
            img.src = src;
          });
        });

        await Promise.all(promises);
        
        if (isMounted) {
          setIsComplete(true);
          onLoadComplete?.();
        }
      } catch (error) {
        if (isMounted) {
          onLoadError?.(error as Error);
        }
      }
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, [images, onLoadComplete, onLoadError]);

  // Return null since this is just a preloader component
  return null;
}
