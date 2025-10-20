import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;

  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const session = sessionStore.get(sessionId);

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Check if session is expired (7 days)
  if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
    sessionStore.delete(sessionId);
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: { email: session.email },
  });
}