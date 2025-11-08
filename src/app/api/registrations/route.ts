import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import User from '@/models/User';
import { sendRegistrationConfirmationEmail } from '@/lib/email';

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

    // Check if user is already registered for this event
    const existingRegistration = await Registration.findOne({
      eventId: body.eventId,
      userId: userId,
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: 'You are already registered for this event',
          alreadyRegistered: true,
          registration: existingRegistration,
        },
        { status: 409 } // 409 Conflict
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

    // Calculate total fees: event fees + accommodation fees - discount
    const eventFees = event.regFees || 0;
    const accommodationFees = body.accommodationFees || 0;
    const discount = body.discount || 0;
    const totalFees = Math.max(0, eventFees + accommodationFees - discount);

    const registrationData = {
      eventId: body.eventId.trim(),
      userId: userId,
      teamId: body.teamId ? body.teamId.trim() : '',
      verified: body.verified ?? false,
      feesPaid,
      discount: discount,
      accommodationRequired: body.accommodationRequired || false,
      accommodationMembers: body.accommodationMembers || 0,
      accommodationFees: accommodationFees,
      totalFees: totalFees,
      dateTime: body.dateTime ? new Date(body.dateTime) : new Date(),
    };

    const newRegistration = await Registration.create(registrationData);

    // Fetch user details for sending email
    const user = await User.findOne({ email: userId });

    // Send confirmation email to the user
    try {
      const emailData = {
        userEmail: userId,
        userName: user?.name || 'Participant',
        eventName: event.eventName,
        eventId: event.eventId,
        teamId: body.teamId || undefined,
        isLeader: body.isLeader || false,
        regFees: event.regFees,
        feesPaid: feesPaid !== '' && feesPaid !== 0,
        registrationDate: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }),
        eventDateTime: new Date(event.dateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }),
        eventdateTime: event.dateTime,
        eventEndDateTime: event.endDateTime,
        eventLocation: event.location,
        accommodationRequired: body.accommodationRequired || false,
        accommodationMembers: body.accommodationMembers || 0,
        accommodationFees: accommodationFees,
        receiptUrl: typeof feesPaid === 'string' ? feesPaid : undefined,
      };

      console.log(`📧 Sending registration confirmation email to user: ${userId}`);
      console.log(`   Event: ${event.eventName} (${event.eventId})`);
      console.log(`   Paid: ${emailData.feesPaid ? 'Yes' : 'No'} | Team: ${emailData.teamId || 'Individual'}`);
      
      // Send email asynchronously (don't wait for it to complete)
      sendRegistrationConfirmationEmail(emailData).catch((error) => {
        console.error('❌ Failed to send registration confirmation email:', error);
      });
    } catch (emailError) {
      // Log email error but don't fail the registration
      console.error('❌ Error preparing registration confirmation email:', emailError);
    }

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
    const search = searchParams.get('search'); // New search parameter
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Support both 'page' parameter and direct 'skip' parameter
    const skipParam = searchParams.get('skip');
    let skip = 0;
    let page = 1;
    
    if (skipParam) {
      skip = parseInt(skipParam);
      page = Math.floor(skip / limit) + 1; // Calculate page number from skip
    } else {
      page = parseInt(searchParams.get('page') || '1');
      skip = (page - 1) * limit;
    }

    let query: any = {};

    // If admin, allow seeing all registrations or filtered by optional params
    // If user, only allow seeing their own registrations

    if (!isAdmin) {
      // Regular users can only see their own registrations
      // 🚀 FIX IMPLEMENTED: Skip the userId filter if teamId is present for validation
      if (teamId) {
        // Do nothing. Query will rely on eventId and teamId to find the team record.
      } else {
        // If userId is requested, ensure it matches the authenticated user (by userId or email)
        if (userId && userId !== decoded.userId && userId !== decoded.email) {
          return NextResponse.json(
            { error: 'Cannot view other user\'s registrations' },
            { status: 403 }
          );
        }
        // If NO teamId, apply userId filter for security
        query.userId = userId || decoded.email;
      }
    } else {
      // Admin can filter by userId if provided, otherwise see all
      if (userId) {
        query.userId = userId;
      }
    }

    // if (!isAdmin) {
    //   // Regular users can only see their own registrations
    //   // If userId is requested, ensure it matches the authenticated user (by userId or email)
    //   if (userId && userId !== decoded.userId && userId !== decoded.email) {
    //     return NextResponse.json(
    //       { error: 'Cannot view other user\'s registrations' },
    //       { status: 403 }
    //     );
    //   }
    //   // If no userId specified, default to current user's registrations (using email)
    //   query.userId = userId || decoded.email;
    // } else {
    //   // Admin can filter by userId if provided, otherwise see all
    //   if (userId) {
    //     query.userId = userId;
    //   }
    // }

    if (eventId) {
      query.eventId = eventId;
    }

    if (teamId) {
      query.teamId = teamId;
    }

    if (verified !== null) {
      query.verified = verified === 'true';
    }

    // Add search functionality - search in userId, eventId, and eventName
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { userId: searchRegex },
        { eventId: searchRegex },
        { eventName: searchRegex }
      ];
    }

    // Use the skip value directly (either from 'skip' param or calculated from 'page')
    // Fetch registrations with pagination
    const registrations = await Registration.find(query)
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all unique event IDs to fetch event details
    const eventIds = [...new Set(registrations.map((reg: any) => reg.eventId))];
    const events = await Event.find({ eventId: { $in: eventIds } }).lean();
    const eventMap = new Map(events.map((event: any) => [event.eventId, { eventName: event.eventName, societyName: event.societyName }]));

    // Combine registration data with event details
    const enrichedRegistrations = registrations.map((reg: any) => {
      const eventData = eventMap.get(reg.eventId) || { eventName: 'Unknown Event', societyName: 'Unknown Society' };
      return {
        ...reg,
        eventName: eventData.eventName,
        societyName: eventData.societyName,
      };
    });

    // Get total count for pagination
    const total = await Registration.countDocuments(query);

    return NextResponse.json(
      {
        registrations: enrichedRegistrations,
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
