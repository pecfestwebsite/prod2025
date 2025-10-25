import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Let the Auth0 React SDK handle the callback
  // This route should just redirect to the main app
  // The Auth0 React SDK will handle the token exchange automatically
  return NextResponse.redirect(new URL('/', request.url));
}