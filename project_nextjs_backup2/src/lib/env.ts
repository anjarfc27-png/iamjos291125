import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const publicResult = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: publicResult.success
    ? publicResult.data.NEXT_PUBLIC_SUPABASE_URL
    : "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publicResult.success
    ? publicResult.data.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "",
};

export const isPublicEnvValid = publicResult.success;

if (!publicResult.success && process.env.NODE_ENV === "production") {
  throw new Error(
    `Konfigurasi Supabase publik belum lengkap: ${publicResult.error.message}`,
  );
}

export const serverEnv =
  typeof window === "undefined"
    ? (() => {
        const result = serverSchema.safeParse({
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        });

        if (!result.success) {
          if (process.env.NODE_ENV === "production") {
            throw new Error(
              `Konfigurasi Supabase server belum lengkap: ${result.error.message}`,
            );
          }
          return null;
        }

        return result.data;
      })()
    : null;

