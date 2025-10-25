import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  // Get admin session ID from cookie
  const sessionId = request.cookies.get('adminToken')?.value;
  
  // Remove session from store if it exists
  if (sessionId) {
    sessionStore.delete(sessionId);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });

  // Clear admin session cookie
  response.cookies.delete('adminToken');

  return response;
}
