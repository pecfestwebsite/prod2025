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
  const publicClientRoutes = ['/', '/register', '/register', '/events', '/brochure'];

  // If user is not logged in and trying to access protected routes
  if (!sessionCookie && !publicClientRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/events/:path*', '/brochure/:path*'],
};
