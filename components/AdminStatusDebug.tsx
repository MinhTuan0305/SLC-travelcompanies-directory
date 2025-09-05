"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function AdminStatusDebug() {
  const { user, isAdmin, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white rounded text-xs z-50" data-debug-panel>
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-opacity-90"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="font-bold">Debug Panel</span>
        <span className="text-lg">{isCollapsed ? '▼' : '▲'}</span>
      </div>
      
      {!isCollapsed && (
        <div className="p-2 border-t border-gray-600">
          <div>User: {user?.email || 'Not logged in'}</div>
          <div>Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
          <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
        </div>
      )}
    </div>
  );
}
