import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';   // ✅ Import Event model

/**
 * Create a new registration
 * Requires JWT token in Authorization header or cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token - check Authorization header first, then cookies
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

    // Set userId from the decoded token's email
    const userId = decoded.email;

    const event = await Event.findOne({ eventId: body.eventId });
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid eventId, event not found' },
        { status: 404 }
      );
    }
    if (event.regFees > 0) {
      if (body.feesPaid === undefined || body.feesPaid === null) {
        return NextResponse.json(
          { error: 'feesPaid is required for paid events' },
          { status: 400 }
        );
      }
    }
    const feesPaid = event.regFees === 0 ? 0 : body.feesPaid;

    const registrationData = {
      eventId: body.eventId.trim(),
      userId: userId,
      teamId: body.teamId ? body.teamId.trim() : '',
      verified: body.verified ?? false,
      feesPaid,
      dateTime: body.dateTime ? new Date(body.dateTime) : new Date(),
    };

    const newRegistration = await Registration.create(registrationData);

    return NextResponse.json(
      { message: 'Registration successful', registration: newRegistration },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


/**
 * Get registrations
 * Users can only see their own registrations or admins can see all
 * Requires JWT token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token - check Authorization header first, then cookies
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
    let isAdmin = false;
    
    // Try to verify with admin secret first
    try {
      decoded = jwt.verify(token, adminSecret) as {
        adminId?: string;
        userId?: string;
        email: string;
        iat?: number;
        exp?: number;
      };
      isAdmin = true;
    } catch (adminError) {
      // If admin secret fails, try user secret
      try {
        decoded = jwt.verify(token, userSecret) as {
          userId: string;
          email: string;
          iat?: number;
          exp?: number;
        };
        isAdmin = false;
      } catch (userError) {
        if (adminError instanceof jwt.TokenExpiredError || userError instanceof jwt.TokenExpiredError) {
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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = {};

    // If admin, allow seeing all registrations or filtered by optional params
    // If user, only allow seeing their own registrations
    if (!isAdmin) {
      // Regular users can only see their own registrations
      // If userId is requested, ensure it matches the authenticated user (by userId or email)
      if (userId && userId !== decoded.userId && userId !== decoded.email) {
        return NextResponse.json(
          { error: 'Cannot view other user\'s registrations' },
          { status: 403 }
        );
      }
      // If no userId specified, default to current user's registrations (using email)
      query.userId = userId || decoded.email;
    } else {
      // Admin can filter by userId if provided, otherwise see all
      if (userId) {
        query.userId = userId;
      }
    }

    if (eventId) {
      query.eventId = eventId;
    }

    if (teamId) {
      query.teamId = teamId;
    }

    if (verified !== null) {
      query.verified = verified === 'true';
    }

    const skip = (page - 1) * limit;

    // Fetch registrations with pagination
    const registrations = await Registration.find(query)
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Registration.countDocuments(query);

    return NextResponse.json(
      {
        registrations,
        total, // Add total at root level for easy access
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
