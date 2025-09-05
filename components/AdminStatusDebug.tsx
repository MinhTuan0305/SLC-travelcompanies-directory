"use client";

import { useAuth } from "@/lib/contexts/AuthContext";

export default function AdminStatusDebug() {
  const { user, isAdmin, isLoading } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
      <div>User: {user?.email || 'Not logged in'}</div>
      <div>Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
      <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
    </div>
  );
}
