export interface RouteConfig {
  // Routes that require authentication
  protectedRoutes: string[]
  // Routes that redirect authenticated users away (like login)
  authForbiddenRoutes: string[]
  // Routes that are accessible to everyone
  publicRoutes: string[]
  // Default redirect for authenticated users trying to access auth-forbidden routes
  authRedirect: string
  // Default redirect for unauthenticated users trying to access protected routes
  loginRedirect: string
}

export const routeConfig: RouteConfig = {
  protectedRoutes: [
    '/new',
    '/deck',
    '/settings',
    '/upgrade',
    '/payment',
    '/api/user',
  ],
  authForbiddenRoutes: [
    '/login',
    '/auth/callback',
  ],
  publicRoutes: [
    '/',
    '/legal',
    '/logout',
  ],
  authRedirect: '/new',
  loginRedirect: '/login',
}

/**
 * Check if a path matches any pattern in the given routes array
 */
export function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (route === path) return true
    
    // Prefix match (for dynamic routes like /deck/[id])
    if (route.endsWith('/') && path.startsWith(route)) return true
    if (!route.endsWith('/') && path.startsWith(route + '/')) return true
    
    return false
  })
}

/**
 * Determine the route type for a given path
 */
export function getRouteType(path: string): 'protected' | 'authForbidden' | 'public' {
  if (matchesRoute(path, routeConfig.protectedRoutes)) {
    return 'protected'
  }
  
  if (matchesRoute(path, routeConfig.authForbiddenRoutes)) {
    return 'authForbidden'
  }
  
  return 'public'
}

/**
 * Check if a route should redirect based on auth status
 */
export function shouldRedirect(path: string, isAuthenticated: boolean): string | null {
  const routeType = getRouteType(path)
  
  if (routeType === 'protected' && !isAuthenticated) {
    return routeConfig.loginRedirect
  }
  
  if (routeType === 'authForbidden' && isAuthenticated) {
    return routeConfig.authRedirect
  }
  
  return null
} 