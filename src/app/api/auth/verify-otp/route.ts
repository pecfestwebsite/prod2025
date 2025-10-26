import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Constants for attempt limits
const MAX_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

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

    // Find OTP in database
    const storedOTP = await OTP.findOne({ email: normalizedEmail });
    const currentTime = new Date();

    if (!storedOTP) {
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (currentTime > storedOTP.expiresAt) {
      await OTP.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check for failed attempts
    const isMatch = await bcrypt.compare(sanitizedOtp, storedOTP.otp);
    if (!isMatch) {
      // Increment attempts
      storedOTP.attempts += 1;

      // Calculate remaining attempts before lockout
      const remainingAttempts = MAX_ATTEMPTS - storedOTP.attempts;
      
      if (storedOTP.attempts >= MAX_ATTEMPTS) {
        // Delete OTP after max attempts
        await OTP.deleteOne({ email: normalizedEmail });
        return NextResponse.json(
          { 
            error: 'Maximum attempts reached. Please request a new OTP.',
            remainingAttempts: 0
          },
          { status: 400 }
        );
      }
      
      // Save updated attempts
      await storedOTP.save();
      
      return NextResponse.json(
        { 
          error: `Invalid OTP. ${remainingAttempts} attempts remaining before account lockout.`,
          remainingAttempts: remainingAttempts,
          attemptsUsed: storedOTP.attempts
        },
        { status: 400 }
      );
    }

    // OTP is valid, proceed with user login
    const loginTime = new Date();
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: { email: normalizedEmail },
        $set: { lastLoginAt: loginTime },
        $inc: { loginCount: 1 },
      },
      { upsert: true, new: true }
    );

    // Generate JWT token with 7 day expiration (similar to admin panel)
    // Use JWT_USER_SECRET (separate from admin JWT_SECRET)
    const jwtUserSecret = process.env.JWT_USER_SECRET;
    if (!jwtUserSecret) {
      console.error('JWT_USER_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: user.userId, email: normalizedEmail },
      jwtUserSecret,
      { expiresIn: '7d' }
    );

    // Delete used OTP from database
    await OTP.deleteOne({ email: normalizedEmail });

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

    // Create response with JWT token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userPayload,
      token: token, // Send token to client to store in localStorage
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