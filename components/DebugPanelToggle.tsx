"use client";

import { useState, useEffect } from "react";

export default function DebugPanelToggle() {
  const [isVisible, setIsVisible] = useState(true);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Load visibility state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('debug-panels-visible');
    if (saved !== null) {
      setIsVisible(JSON.parse(saved));
    }
  }, []);

  // Save visibility state to localStorage
  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    localStorage.setItem('debug-panels-visible', JSON.stringify(newVisibility));
    
    // Toggle all debug panels
    const panels = document.querySelectorAll('[data-debug-panel]');
    panels.forEach(panel => {
      (panel as HTMLElement).style.display = newVisibility ? 'block' : 'none';
    });
  };

  return (
    <button
      onClick={toggleVisibility}
      className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50 hover:bg-gray-700"
      title={isVisible ? 'Hide Debug Panels' : 'Show Debug Panels'}
    >
      {isVisible ? '👁️ Hide' : '👁️ Show'} Debug
    </button>
  );
}
