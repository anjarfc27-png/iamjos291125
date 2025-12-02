import { createSupabaseServerClient } from "./supabase/server";
import { getUserById, getUserRoles } from "./db";
import type { User, UserRole } from "./auth";

/**
 * Get current user in server components (doesn't require NextRequest)
 * Uses Supabase session to get user data
 */
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    // Try Supabase session first
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Get user data from database
    let dbUserId = session.user.user_metadata?.user_id;
    if (!dbUserId) {
      const { getUserByEmail } = await import('./db');
      const userDataByEmail = await getUserByEmail(session.user.email || '');
      dbUserId = userDataByEmail?.user_id;
    }
    if (!dbUserId) {
      dbUserId = session.user.id;
    }

    const userData = await getUserById(dbUserId);
    if (!userData) {
      return null;
    }

    const roles = await getUserRoles(dbUserId);

    return {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      roles
    };
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}


