"use client";

import { useEffect } from 'react';

interface ResourcePreloaderProps {
  resources: string[];
  type?: 'image' | 'video' | 'script' | 'style';
}

export default function ResourcePreloader({ resources, type = 'image' }: ResourcePreloaderProps) {
  useEffect(() => {
    resources.forEach(resource => {
      if (type === 'image') {
        const img = new Image();
        img.src = resource;
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.src = resource;
        video.preload = 'metadata';
      } else if (type === 'script') {
        const script = document.createElement('script');
        script.src = resource;
        script.async = true;
        document.head.appendChild(script);
      } else if (type === 'style') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = resource;
        document.head.appendChild(link);
      }
    });
  }, [resources, type]);

  return null; // This component doesn't render anything
}
