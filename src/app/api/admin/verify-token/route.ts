import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/adminUser';

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header first
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    // If no Authorization header, check for adminToken cookie
    if (!token) {
      token = request.cookies.get('adminToken')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided', valid: false },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    try {
      // Verify token
      const decoded = jwt.verify(token, secret) as {
        adminId: string;
        email: string;
        iat?: number;
        exp?: number;
      };

      // Optional: Check if admin still exists in database
      await dbConnect();
      const admin = await Admin.findById(decoded.adminId).lean();

      if (!admin) {
        return NextResponse.json(
          { error: 'Admin not found', valid: false },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          valid: true,
          admin: {
            id: decoded.adminId,
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
