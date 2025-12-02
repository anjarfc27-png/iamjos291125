"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const SupabaseContext = createContext<SupabaseClient | null>(null);

type Props = {
  children: ReactNode;
};

export function SupabaseProvider({ children }: Props) {
  const client = useMemo(() => getSupabaseBrowserClient(), []);

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase harus dipakai di dalam SupabaseProvider.");
  }

  return ctx;
}

