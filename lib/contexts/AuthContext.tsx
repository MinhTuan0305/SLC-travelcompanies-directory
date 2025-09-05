"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Check if user is admin
  const checkAdminStatus = async (userId: string, userEmail?: string): Promise<boolean> => {
    if (!userId) {
      console.log("❌ No user ID, returning false for admin check");
      return false;
    }
    
    try {
      console.log("🔍 Checking admin status for user ID:", userId, "Email:", userEmail);
      
      // First check user metadata (fallback)
      if (userEmail && (userEmail.includes('admin') || userEmail.includes('@admin'))) {
        console.log("✅ Admin detected via email pattern");
        return true;
      }
      
      // Check specific admin emails
      const adminEmails = ['admin@example.com', 'admin@slc.com', 'tuan@admin.com'];
      if (userEmail && adminEmails.includes(userEmail.toLowerCase())) {
        console.log("✅ Admin detected via specific email list");
        return true;
      }
      
      // Check against profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      console.log("📊 Profile query result:", { profile, error });
      
      if (!error && profile?.role === 'admin') {
        console.log("✅ Admin logged in (via profiles table)");
        return true;
      }
      
      // If profiles table doesn't exist or has no data, check user metadata
      if (error && error.code === 'PGRST116') {
        console.log("⚠️ Profiles table not found, checking user metadata");
        // This will be handled by the caller with user object
        return false;
      }
      
      console.log("👤 Normal user");
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      if (data.user) {
        setUser(data.user);
        const adminStatus = await checkAdminStatus(data.user.id, data.user.email);
        setIsAdmin(adminStatus);
        
        // Redirect to homepage after successful login
        if (typeof window !== 'undefined') {
          window.location.href = '/agencies';
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Refresh admin status function
  const refreshAdminStatus = async () => {
    if (user) {
      console.log("🔄 Refreshing admin status...");
      const adminStatus = await checkAdminStatus(user.id, user.email);
      setIsAdmin(adminStatus);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          const adminStatus = await checkAdminStatus(user.id, user.email);
          setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state change:", event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          const adminStatus = await checkAdminStatus(session.user.id, session.user.email);
          setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    refreshAdminStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
