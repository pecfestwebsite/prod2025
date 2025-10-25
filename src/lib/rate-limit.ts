import { NextRequest, NextResponse } from 'next/server';

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
}

const RATE_LIMIT_COOKIE = 'otp_rate_limit';
const MAX_ATTEMPTS = 3;
const TIME_WINDOW = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export function getRateLimitData(request: NextRequest): RateLimitData {
  const rateLimitCookie = request.cookies.get(RATE_LIMIT_COOKIE);
  if (!rateLimitCookie?.value) {
    return { attempts: 0, firstAttempt: Date.now() };
  }

  try {
    return JSON.parse(rateLimitCookie.value);
  } catch {
    return { attempts: 0, firstAttempt: Date.now() };
  }
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; response?: NextResponse } {
  const rateLimitData = getRateLimitData(request);
  const now = Date.now();

  // Reset if time window has passed
  if (now - rateLimitData.firstAttempt > TIME_WINDOW) {
    return { allowed: true };
  }

  // Check if max attempts reached
  if (rateLimitData.attempts >= MAX_ATTEMPTS) {
    const timeLeft = Math.ceil((TIME_WINDOW - (now - rateLimitData.firstAttempt)) / (60 * 1000));
    return {
      allowed: false,
      response: NextResponse.json(
        { error: `Maximum OTP attempts reached. Please try again after ${timeLeft} minutes.` },
        { status: 429 }
      )
    };
  }

  return { allowed: true };
}

export function updateRateLimit(response: NextResponse, request: NextRequest): NextResponse {
  const rateLimitData = getRateLimitData(request);
  const now = Date.now();

  // Reset if time window has passed
  if (now - rateLimitData.firstAttempt > TIME_WINDOW) {
    rateLimitData.attempts = 1;
    rateLimitData.firstAttempt = now;
  } else {
    rateLimitData.attempts += 1;
  }

  // Set cookie
  response.cookies.set(RATE_LIMIT_COOKIE, JSON.stringify(rateLimitData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TIME_WINDOW / 1000, // Convert to seconds
    path: '/'
  });

  return response;
}