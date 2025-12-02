import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isPublicEnvValid, publicEnv, serverEnv } from "../env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Admin client hanya boleh dipakai di server.");
  }

  if (!isPublicEnvValid || !serverEnv) {
    throw new Error(
      "Supabase service role belum dikonfigurasi. Tambahkan variabel env yang diperlukan.",
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}

