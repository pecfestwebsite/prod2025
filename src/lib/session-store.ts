// Shared session store for all auth routes
// Uses global object to persist across hot-reloads in development
// In production, replace this with Redis or a database

interface Session {
  email: string;
  createdAt: number;
}

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
  lastAttempt: number;
  dailyCount?: number;
  dailyCountResetTime?: number;
}

// Attach stores to global object to survive hot-reloads
declare global {
  var __sessionStore: Map<string, Session> | undefined;
  var __otpStore: Map<string, OTPData> | undefined;
}

// Initialize if not already present (survives hot-reload)
if (!global.__sessionStore) {
  global.__sessionStore = new Map<string, Session>();
}
if (!global.__otpStore) {
  global.__otpStore = new Map<string, OTPData>();
}

export const sessionStore = global.__sessionStore;
export const otpStore = global.__otpStore;