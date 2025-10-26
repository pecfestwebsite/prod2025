import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Admin, { IAdmin } from '@/models/adminUser';
import OTP from '@/models/OTP';
import bcrypt from 'bcryptjs';

// Generate JWT token with 12 hour expiration
function generateJWTToken(adminId: string, email: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const token = jwt.sign(
    {
      adminId,
      email,
    },
    secret,
    { expiresIn: '12h' } // 12 hours expiration
  );
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate and normalize email and OTP
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

    // Connect to database
    await dbConnect();

    // Verify OTP from database
    const storedOTP = await OTP.findOne({ email: normalizedEmail });

    if (!storedOTP) {
      console.log('OTP not found for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const currentTime = new Date();
    if (currentTime > storedOTP.expiresAt) {
      await OTP.deleteOne({ email: normalizedEmail });
      console.log('OTP expired for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const isOtpMatched = await bcrypt.compare(sanitizedOtp, storedOTP.otp);

    if (!isOtpMatched) {
      console.log('Invalid OTP for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it from database
    await OTP.deleteOne({ email: normalizedEmail });

    // Check if admin exists in MongoDB
    const admin = (await Admin.findOne({ email: normalizedEmail }).lean()) as IAdmin | null;

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found with this email' },
        { status: 404 }
      );
    }

    // Check if admin is verified
    if (!admin.verified) {
      return NextResponse.json(
        { error: 'Admin not found with this email' },
        { status: 404 }
      );
    }

    // Generate token
    const adminId = (admin as any)._id?.toString() || '';
    const token = generateJWTToken(adminId, admin.email);

    console.log('Admin logged in:', normalizedEmail);

    // Create response with token in cookies
    const response = NextResponse.json(
      {
        success: true,
        token,
        admin: {
          id: adminId,
          userId: admin.userId,
          email: admin.email,
          name: admin.name,
          accesslevel: admin.accesslevel,
          clubsoc: admin.clubsoc,
          verified: admin.verified,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set HTTP cookie on server side (12 hours)
    // In development, secure should be false. In production, it should be true.
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 12 * 60 * 60,
      path: '/',
    });

    console.log('Token set in cookie (Production:', isProduction, '):', token.substring(0, 20) + '...');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

// Handle GET requests - redirect to login page or return error
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to login.' },
    { status: 405 }
  );
}