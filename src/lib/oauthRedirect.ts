/**
 * Returns the stable OAuth redirect URI (the backend edge function).
 * This is the only URI that needs to be registered in Google/Microsoft console.
 */
export function getStableOAuthRedirectUri(): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${projectId}.supabase.co/functions/v1/email-oauth-redirect`;
}
