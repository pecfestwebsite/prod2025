import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  // Get session ID from cookie
  const sessionId = request.cookies.get('session')?.value;
  
  // Remove session from store if it exists
  if (sessionId) {
    sessionStore.delete(sessionId);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear session cookie
  response.cookies.delete('session');

  return response;
}