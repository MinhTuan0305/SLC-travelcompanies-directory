// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // ✅ sửa lại đúng tên env

    if (!url || !key) {
      throw new Error(
        "❌ Missing Supabase environment variables. " +
          "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local"
      );
    }

    client = createBrowserClient(url, key);
  }

  return client;
}
