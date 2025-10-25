import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Logout endpoint
 * Accepts JWT token in Authorization header
 * Client should remove token from localStorage after successful logout
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Token verification is optional for logout
    // We mainly use this for logging/audit purposes
    if (token) {
      const secret = process.env.JWT_USER_SECRET || 'your-user-secret-key-change-in-production';
      try {
        const decoded = jwt.verify(token, secret);
        console.log('User logged out:', (decoded as any).email);
      } catch (error) {
        // Token might be expired, but logout is still successful
        console.log('Logout with expired/invalid token');
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}