/**
 * Generates a user prefix for pitch URLs
 * Uses first 2 characters of the user's name, or email if no name
 */
export function getUserPrefix(fullName: string | null | undefined, email: string | null | undefined): string {
  // Try to use full name first
  if (fullName && fullName.trim()) {
    const cleanName = fullName.trim().toLowerCase();
    // Get first 2 letters from the name (skip spaces/special chars)
    const letters = cleanName.replace(/[^a-z]/g, '');
    if (letters.length >= 2) {
      return letters.slice(0, 2);
    }
  }
  
  // Fallback to email
  if (email) {
    const localPart = email.split('@')[0].toLowerCase();
    const letters = localPart.replace(/[^a-z]/g, '');
    if (letters.length >= 2) {
      return letters.slice(0, 2);
    }
  }
  
  // Ultimate fallback
  return 'xx';
}

/**
 * Generates a clean client slug from the client name
 */
export function getClientSlug(clientName: string): string {
  return clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Generates a full pitch slug in the format: userPrefix/clientSlug
 * Example: "la/everyman-ai" for Luuk Alleman's Everyman AI pitch
 */
export function generatePitchSlug(
  clientName: string,
  fullName: string | null | undefined,
  email: string | null | undefined
): string {
  const userPrefix = getUserPrefix(fullName, email);
  const clientSlug = getClientSlug(clientName);
  return `${userPrefix}/${clientSlug}`;
}

/**
 * Parses a pitch slug into its components
 */
export function parsePitchSlug(slug: string): { userPrefix: string; clientSlug: string } | null {
  const parts = slug.split('/');
  if (parts.length === 2) {
    return {
      userPrefix: parts[0],
      clientSlug: parts[1],
    };
  }
  // Handle legacy slugs (no slash)
  return null;
}
