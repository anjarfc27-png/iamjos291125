"use client";

import { ReactNode } from "react";

import { ReactQueryProvider } from "@/providers/react-query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <I18nProvider>
      <ReactQueryProvider>
        <SupabaseProvider>
          <AuthProvider>{children}</AuthProvider>
        </SupabaseProvider>
      </ReactQueryProvider>
    </I18nProvider>
  );
}

