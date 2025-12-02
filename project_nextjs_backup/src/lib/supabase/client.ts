"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isPublicEnvValid, publicEnv } from "../env";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    if (!isPublicEnvValid) {
      console.error("Supabase environment (URL/anon key) belum dikonfigurasi. Cek file .env.");
      // Return a dummy client or throw, but logging is better for dev
      throw new Error("Supabase environment missing");
    }

    browserClient = createBrowserClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return browserClient;
}

