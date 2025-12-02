import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { isPublicEnvValid, publicEnv } from "../env";

export async function createSupabaseServerClient() {
  if (!isPublicEnvValid) {
    throw new Error(
      "Supabase environment (URL/anon key) belum dikonfigurasi. Cek file .env.",
    );
  }

  // Get cookies instance - call it once per request
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          try {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          } catch {}
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name);
          } catch {
            cookieStore.set(name, "", options);
          }
        },
      },
    },
  );
}

