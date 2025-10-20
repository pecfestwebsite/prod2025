// Shared session store for all auth routes
// In production, replace this with Redis or a database
interface Session {
  email: string;
  createdAt: number;
}

export const sessionStore = new Map<string, Session>();

export const otpStore = new Map<string, { otp: string; expiresAt: number }>();