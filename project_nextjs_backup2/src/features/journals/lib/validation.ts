export const PATH_REGEX = /^[a-z0-9-]+$/;
export const INITIALS_REGEX = /^[A-Z0-9]+$/;

export function validatePath(path: string): string | null {
    if (!path) return "Path is required.";
    if (path.length < 2) return "Path must be at least 2 characters.";
    if (!PATH_REGEX.test(path)) return "Path must contain only lowercase letters, numbers, and hyphens.";
    return null;
}

export function validateInitials(initials: string): string | null {
    if (!initials) return "Initials are required.";
    if (!INITIALS_REGEX.test(initials)) return "Initials must be uppercase letters and numbers only.";
    return null;
}
