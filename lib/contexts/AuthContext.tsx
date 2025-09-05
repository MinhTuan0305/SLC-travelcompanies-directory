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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Check if user is admin
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      console.log("❌ No user, returning false for admin check");
      return false;
    }
    
    try {
      console.log("🔍 Checking admin status for user:", user.email);
      
      // Check user metadata for admin role (fallback)
      if (user.user_metadata?.role === 'admin') {
        console.log("✅ Admin logged in (via metadata)");
        return true;
      }
      
      // Check against profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log("📊 Profile query result:", { profile, error });
      
      if (!error && profile?.role === 'admin') {
        console.log("✅ Admin logged in (via profiles table)");
        return true;
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
        const adminStatus = await checkAdminStatus();
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
          
          // Check admin status from profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          console.log("🔍 Initialize auth - Profile query result:", { profile, profileError });
          console.log("🔍 Initialize auth - Profile role:", profile?.role);
          console.log("🔍 Initialize auth - Is admin check:", profile?.role === "admin");

          if (profile?.role === "admin") {
            console.log("✅ Admin logged in");
            setIsAdmin(true);
          } else {
            console.log("👤 Normal user");
            setIsAdmin(false);
          }
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
        if (session?.user) {
          setUser(session.user);
          const adminStatus = await checkAdminStatus();
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
