import type { User } from '@/lib/auth'

/**
 * Get redirect path based on user roles
 * Priority: admin > manager > editor > author > reviewer
 */
export function getRedirectPathByRole(user: User | null): string {
  if (!user || !user.roles || user.roles.length === 0) {
    return "/";
  }

  const rolePaths = user.roles.map(r => r.role_path);

  // Priority: admin > manager > editor > assistant > copyeditor > proofreader > layout-editor > author > reviewer
  if (rolePaths.includes("admin")) {
    return "/admin";
  } else if (rolePaths.includes("manager")) {
    return "/manager";
  } else if (rolePaths.includes("editor") || rolePaths.includes("section_editor")) {
    return "/editor";
  } else if (rolePaths.includes("assistant")) {
    return "/assistant";
  } else if (rolePaths.includes("copyeditor")) {
    return "/copyeditor";
  } else if (rolePaths.includes("proofreader")) {
    return "/proofreader";
  } else if (rolePaths.includes("layout-editor")) {
    return "/layout-editor";
  } else if (rolePaths.includes("author")) {
    return "/author";
  } else if (rolePaths.includes("reviewer")) {
    return "/reviewer";
  } else if (rolePaths.includes("subscription-manager")) {
    return "/subscription-manager";
  } else if (rolePaths.includes("reader")) {
    return "/reader";
  }

  return "/";
}
