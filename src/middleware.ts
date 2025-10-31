import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('adminToken')?.value;
    const publicRoutes = ['/admin/login'];
    const isPublicRoute = publicRoutes.includes(pathname);

    console.log('[Middleware] Path:', pathname, 'Has Cookie Token:', !!token);

    // If on login page and already have token, redirect to dashboard
    if (pathname === '/admin/login' && token) {
      console.log('[Middleware] Already logged in, redirecting to dashboard');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If accessing protected route without token, redirect to login
    if (!isPublicRoute && !token) {
      console.log('[Middleware] No token for protected route, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Allow request
    return NextResponse.next();
  }

  // Client routes protection
  const sessionCookie = request.cookies.get('session')?.value;
  const publicClientRoutes = ['/', '/register', '/events', '/brochure'];

  // Check if the current path is a public route or a sub-path of a public route (like /events/some-id)
  const isPublicClientRoute = publicClientRoutes.some(route => pathname.startsWith(route));

  // If user is not logged in and trying to access protected routes
  if (!sessionCookie && !isPublicClientRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Run on all routes except static files and API
  ],
};
