import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * Get current authenticated user
 * Uses JWT token from Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
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

      // Fetch full user details from database
      await dbConnect();
      const user = await User.findOne({ userId: decoded.userId }).lean() as any;

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({
        user: {
          email: user.email,
          userId: user.userId,
          name: user.name,
          college: user.college,
          studentId: user.studentId,
          phoneNumber: user.phoneNumber,
          referralCode: user.referralCode,
          branch: user.branch,
          lastLoginAt: user.lastLoginAt,
          loginCount: user.loginCount,
        },
      });
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ user: null }, { status: 200 });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ user: null }, { status: 200 });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}