/**
 * Site configuration utilities
 */

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    if (typeof window !== 'undefined') {
      // Client-side: check hostname
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === '0.0.0.0' ||
          window.location.port === '3000') {
        return `${window.location.protocol}//${window.location.host}`
      }
    }
    return 'http://localhost:3000'
  }
  
  // In production, always prioritize NEXT_PUBLIC_SITE_URL for consistency
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // If no env var, use current location (client-side) or fallback
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`
  }
  
  // Server-side fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Final fallback
  return 'https://cramler.ai'
}

/**
 * Get the redirect URL for OAuth authentication
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.port === '3000')) {
    return `http://localhost:3000${path}`
  }

  // Use NEXT_PUBLIC_SITE_URL if available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`
  }

  // Fallback to Supabase auth callback
  return `https://xqobmnzxpriwagqrvene.supabase.co/auth/v1/callback`
}

/**
 * Site configuration object
 */
export const siteConfig = {
  name: "Cramler AI",
  description: "Your AI-powered learning companion.",
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/logo.svg`,
  links: {
    twitter: "https://twitter.com/cramler",
    github: "https://github.com/cramler",
  },
} 