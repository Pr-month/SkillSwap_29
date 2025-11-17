import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected and which are public
const protectedRoutes = ['/account', '/account/:path*'];
const guestOnlyRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Helper function to check if a route matches a pattern
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Handle wildcard routes
    if (route.endsWith(':path*')) {
      const baseRoute = route.replace(':path*', '');
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies (if set by login process)
  const token = request.cookies.get('accessToken')?.value;

  // Simple check for token existence (we can't verify it server-side without the secret)
  const isAuthenticated = !!token;

  // Check if trying to access protected routes
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);

  // Check if trying to access auth routes
  const isAuthRoute = matchesRoute(pathname, guestOnlyRoutes);

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
