import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { sessionStore, otpStore } from '@/lib/session-store';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    const rawEmail = typeof email === 'string' ? email.trim() : '';
    const rawOtp = typeof otp === 'string' ? otp.trim() : String(otp || '');

    if (!rawEmail || !rawOtp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = rawEmail.toLowerCase();
    const sanitizedOtp = rawOtp.replace(/\D/g, '').slice(0, 6);

    if (!/^\d{6}$/.test(sanitizedOtp)) {
      return NextResponse.json(
        { error: 'Invalid code format. Enter the 6-digit code.' },
        { status: 400 }
      );
    }
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

    if (storedData.otp !== sanitizedOtp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid, upsert user in DB
    await dbConnect();
    const now = new Date();
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: { email: normalizedEmail },
        $set: { lastLoginAt: now },
        $inc: { loginCount: 1 },
      },
      { upsert: true, new: true }
    );

    // Create session
    const sessionId = nanoid(32);
    sessionStore.set(sessionId, {
      email: normalizedEmail,
      createdAt: Date.now(),
    });

    // Delete used OTP
    otpStore.delete(normalizedEmail);

    // Log user json once login
    const userPayload = {
      email: user.email,
      userId: user.userId,
      name: (user as any).name,
      college: (user as any).college,
      studentId: (user as any).studentId,
      phoneNumber: (user as any).phoneNumber,
      referralCode: (user as any).referralCode,
      branch: (user as any).branch,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
    };
    console.log('User logged in:', userPayload);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userPayload,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}