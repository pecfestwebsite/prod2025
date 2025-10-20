import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { otpStore, sessionStore } from '@/lib/session-store';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, name, college, studentId, phoneNumber, referralCode, branch } = body || {};

    if (!email || !otp || !name || !college || !studentId || !phoneNumber || !branch) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    // Validate OTP from store
    const storedData = otpStore.get(normalizedEmail);
    if (!storedData) {
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }
    if (storedData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // If email exists, ask to login instead
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      );
    }

    // Create new user
    const now = new Date();
    const user = await User.create({
      email: normalizedEmail,
      name,
      college,
      studentId,
      phoneNumber,
      referralCode,
      branch,
      lastLoginAt: now,
      loginCount: 1,
    });

    // consume OTP and set session
    otpStore.delete(normalizedEmail);
    const sessionId = nanoid(32);
    sessionStore.set(sessionId, {
      email: normalizedEmail,
      createdAt: Date.now(),
    });

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
    console.log('User registered:', userPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userPayload,
    });
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}


