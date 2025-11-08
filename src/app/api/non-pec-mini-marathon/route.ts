import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import NonPecMiniMarathon from '@/models/NonPecMiniMarathon';
import User from '@/models/User';

/**
 * Check the count of non-PEC registrations for mini marathon
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const count = await NonPecMiniMarathon.countDocuments({ eventId });

    return NextResponse.json(
      { count, canRegister: count < 100 },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking non-PEC registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new non-PEC mini marathon registration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    let token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      token = request.cookies.get('adminToken')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided. Please login first.' },
        { status: 401 }
      );
    }

    const userSecret = process.env.JWT_USER_SECRET || 'your-user-secret-key-change-in-production';
    const adminSecret = process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';

    let decoded;

    // Try to verify with user secret first
    try {
      decoded = jwt.verify(token, userSecret) as {
        userId: string;
        email: string;
        iat?: number;
        exp?: number;
      };
    } catch (userError) {
      // If user secret fails, try admin secret
      try {
        decoded = jwt.verify(token, adminSecret) as {
          adminId?: string;
          userId?: string;
          email: string;
          iat?: number;
          exp?: number;
        };
      } catch (adminError) {
        if (userError instanceof jwt.TokenExpiredError || adminError instanceof jwt.TokenExpiredError) {
          return NextResponse.json(
            { error: 'Token expired. Please login again.' },
            { status: 401 }
          );
        } else {
          return NextResponse.json(
            { error: 'Invalid token. Please login again.' },
            { status: 401 }
          );
        }
      }
    }

    await dbConnect();
    const body = await request.json();

    if (!body.eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const email = decoded.email;

    // Check if user is already registered as non-PEC for this event
    const existingRegistration = await NonPecMiniMarathon.findOne({
      eventId: body.eventId,
      email: email,
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: 'You are already registered as a non-PEC student for this event',
          alreadyRegistered: true,
        },
        { status: 409 }
      );
    }

    // Check if limit of 100 non-PEC registrations is reached
    const currentCount = await NonPecMiniMarathon.countDocuments({ eventId: body.eventId });

    if (currentCount >= 100) {
      return NextResponse.json(
        {
          error: 'Registration limit reached. Maximum 100 non-PEC students can register for mini marathon.',
          limitReached: true,
        },
        { status: 403 }
      );
    }

    // Fetch user details
    const user = await User.findOne({ email: email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const registrationData = {
      eventId: body.eventId.trim(),
      email: email,
      name: user.name,
      dateTime: new Date(),
    };

    const newRegistration = await NonPecMiniMarathon.create(registrationData);

    return NextResponse.json(
      { 
        message: 'Non-PEC registration successful', 
        registration: newRegistration,
        remainingSlots: 100 - currentCount - 1
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating non-PEC registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
