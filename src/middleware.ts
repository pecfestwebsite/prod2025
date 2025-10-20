import { NextRequest, NextResponse } from 'next/server';

function verifyToken(token: string): boolean {
  try {
    // Simple token verification (decoding base64)
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    
    // Check if token has expired
    if (payload.exp && payload.exp < Date.now()) {
      return false;
    }
    
    return !!(payload.adminId && payload.email);
  } catch (error) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value;
  const pathname = request.nextUrl.pathname;

  // Routes that don't require authentication
  const publicRoutes = ['/admin/login'];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // If route requires auth and user doesn't have token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify token if it exists
  if (token && !isPublicRoute) {
    if (!verifyToken(token)) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
    // Token is valid, proceed
    return NextResponse.next();
  }

  // If user is logged in and tries to access login page
  if (isPublicRoute && token && pathname === '/admin/login') {
    if (verifyToken(token)) {
      // Token is valid, redirect to dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Token is invalid, allow access to login page
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
