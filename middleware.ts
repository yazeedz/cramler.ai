import { createClient } from './app/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create Supabase client and response
  const { supabase, response } = createClient(request)
  
  // Use getUser() instead of getSession() for proper authentication validation
  // This validates the token with Supabase's servers rather than just reading cookies
  let user = null
  let error = null
  
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
    error = result.error
  } catch (authError) {
    // Handle refresh token errors gracefully - just means user is not authenticated
    console.log('Auth check failed (user not authenticated):', authError.message)
    user = null
    error = authError
  }
  
  const url = request.nextUrl.clone()
  const isLoginPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth')
  const isLogoutPage = url.pathname.startsWith('/logout')
  const isLegalPage = url.pathname.startsWith('/legal')
  const isProtectedPage = !isLoginPage && !isLogoutPage && !isLegalPage && url.pathname !== '/' 
  
  // If user is authenticated (and token is valid)
  if (user && !error) {
    response.headers.set('x-user-authenticated', 'true')
    response.headers.set('x-trigger-sync', 'true')
    
    // Redirect authenticated users away from login/auth pages
    if (isLoginPage) {
      url.pathname = '/new'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.headers.set('x-middleware-cache', 'no-cache')
      return redirectResponse
    }
    // Allow access to logout page for authenticated users
  } else {
    response.headers.set('x-user-authenticated', 'false')
    
    // Redirect unauthenticated users away from logout page
    if (isLogoutPage) {
      url.pathname = '/login'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.headers.set('x-middleware-cache', 'no-cache')
      return redirectResponse
    }
    
    // Redirect unauthenticated users to login for protected pages
    if (isProtectedPage) {
      url.pathname = '/login'
      const redirectResponse = NextResponse.redirect(url)
      redirectResponse.headers.set('x-middleware-cache', 'no-cache')
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 