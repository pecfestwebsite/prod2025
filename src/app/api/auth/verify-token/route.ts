import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * Verify user JWT token
 * Similar to admin verify-token but for regular users
 * Expected: Bearer token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided', valid: false },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_USER_SECRET || 'your-user-secret-key-change-in-production';
    
    try {
      // Verify token
      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        iat?: number;
        exp?: number;
      };

      // Optional: Check if user still exists in database
      await dbConnect();
      const user = await User.findOne({ userId: decoded.userId }).lean();

      if (!user) {
        return NextResponse.json(
          { error: 'User not found', valid: false },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          valid: true,
          user: {
            userId: decoded.userId,
            email: decoded.email,
          },
        },
        { status: 200 }
      );
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { error: 'Token expired', valid: false },
          { status: 401 }
        );
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Invalid token', valid: false },
          { status: 401 }
        );
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during token verification', valid: false },
      { status: 500 }
    );
  }
}
