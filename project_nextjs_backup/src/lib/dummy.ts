// Default to false in real Supabase environments to avoid schema mismatches.
// Enable explicitly with NEXT_PUBLIC_USE_DUMMY=true if you want dummy editor data.
export const USE_DUMMY = (process.env.NEXT_PUBLIC_USE_DUMMY ?? 'false').toLowerCase() === 'true';