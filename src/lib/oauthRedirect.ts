/**
 * Generate the OAuth redirect URI for email providers (Gmail/Outlook).
 * This helper ensures the redirect URI is consistent across the app.
 */
export function getEmailOAuthRedirectUri(provider: 'gmail' | 'outlook'): string {
  return `${window.location.origin}/dashboard/settings?oauth=${provider}`;
}
