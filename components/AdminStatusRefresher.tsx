"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function AdminStatusRefresher() {
  const { user, refreshAdminStatus } = useAuth();

  useEffect(() => {
    // Refresh admin status every 30 seconds if user is logged in
    if (user) {
      const interval = setInterval(() => {
        refreshAdminStatus();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, refreshAdminStatus]);

  // Also refresh on window focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshAdminStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, refreshAdminStatus]);

  return null; // This component doesn't render anything
}
