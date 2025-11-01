import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * Update user profile
 * Requires JWT token in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided. Please login first.' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_USER_SECRET || 'your-user-secret-key-change-in-production';
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        iat?: number;
        exp?: number;
      };
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { error: 'Token expired. Please login again.' },
          { status: 401 }
        );
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Invalid token. Please login again.' },
          { status: 401 }
        );
      }
      throw jwtError;
    }

    const body = await request.json();
    const { email, name, college, studentId, phoneNumber, referralCode, branch } = body || {};

    console.log('Received update request:', { email, name, college, studentId, phoneNumber, referralCode, branch });

    // Validate required fields
    if (!email || !name || !college || !studentId || !phoneNumber || !branch) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    // Ensure the token email matches the profile being updated
    if (decoded.email !== normalizedEmail) {
      return NextResponse.json(
        { error: 'Cannot update another user\'s profile' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Prepare update object
    const updateData: any = {
      name,
      college,
      studentId,
      phoneNumber,
      branch,
    };

    // Only include referralCode if it has a value
    if (referralCode && referralCode.trim() !== '') {
      updateData.referralCode = referralCode;
    }

    console.log('Updating user with data:', updateData);

    // Update user with profile information
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('User after update:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please verify your email first.' },
        { status: 404 }
      );
    }

    const userPayload = {
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
    };

    console.log('User profile updated:', userPayload);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userPayload,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
