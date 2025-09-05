"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export default function AdminTestPanel() {
  const { user, isAdmin, refreshAdminStatus } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed

  const runAdminTest = async () => {
    setTesting(true);
    setTestResults([]);
    const results: string[] = [];

    try {
      const supabase = createClient();
      
      // Test 1: Check user data
      results.push(`✅ User ID: ${user?.id || 'None'}`);
      results.push(`✅ User Email: ${user?.email || 'None'}`);
      results.push(`✅ Current Admin Status: ${isAdmin ? 'YES' : 'NO'}`);

      // Test 2: Check profiles table
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          results.push(`❌ Profiles table error: ${error.message}`);
        } else {
          results.push(`✅ Profile role: ${profile?.role || 'None'}`);
        }
      }

      // Test 3: Check user metadata
      results.push(`✅ User metadata: ${JSON.stringify(user?.user_metadata || {})}`);

      // Test 4: Manual admin check
      if (user?.email) {
        const emailPattern = user.email.includes('admin') || user.email.includes('@admin');
        const specificEmails = ['admin@example.com', 'admin@slc.com', 'tuan@admin.com'];
        const specificEmail = specificEmails.includes(user.email.toLowerCase());
        
        results.push(`✅ Email pattern check: ${emailPattern ? 'MATCH' : 'NO MATCH'}`);
        results.push(`✅ Specific email check: ${specificEmail ? 'MATCH' : 'NO MATCH'}`);
      }

    } catch (error) {
      results.push(`❌ Test error: ${error}`);
    }

    setTestResults(results);
    setTesting(false);
  };

  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      
      // Insert or update user as admin
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'admin'
        });

      if (error) {
        alert(`Error making admin: ${error.message}`);
      } else {
        alert('Successfully made admin! Refreshing status...');
        await refreshAdminStatus();
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-w-md" data-debug-panel>
      {/* Header - Always visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-bold text-sm">Admin Test Panel</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {isAdmin ? '✅ Admin' : '❌ User'}
          </span>
          <span className="text-lg">{isCollapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      
      {/* Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2 text-xs mb-3">
            <div>User: {user?.email || 'Not logged in'}</div>
            <div>Admin: {isAdmin ? '✅ Yes' : '❌ No'}</div>
          </div>

          <div className="space-y-2">
            <button
              onClick={runAdminTest}
              disabled={testing}
              className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Admin Test'}
            </button>

            <button
              onClick={makeAdmin}
              disabled={!user}
              className="w-full bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
            >
              Make Me Admin
            </button>

            <button
              onClick={refreshAdminStatus}
              className="w-full bg-yellow-500 text-white px-2 py-1 rounded text-xs"
            >
              Refresh Status
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
              <div className="font-bold mb-1">Test Results:</div>
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
