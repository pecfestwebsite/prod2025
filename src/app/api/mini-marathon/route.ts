import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import MiniMarathon from '@/models/MiniMarathon'; // This model now stores ALL MM registrations
import User from '@/models/User';

// Define the expected body structure for the POST request
interface PostBody {
  eventId: string;
  isPecStudent: boolean; // CRITICAL: Student type flag sent from frontend
}

/**
 * GET: Check the count of non-PEC registrations for mini marathon quota.
 * Quota check MUST filter for isPecStudent: false.
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

    // 🛑 KEY CHANGE: Filter count to include ONLY non-PEC students
    const nonPecCount = await MiniMarathon.countDocuments({
      eventId,
      isPecStudent: false
    });

    // Non-PEC limit is 100 slots
    const NON_PEC_LIMIT = 100;

    return NextResponse.json(
      {
        count: nonPecCount,
        canRegister: nonPecCount < NON_PEC_LIMIT,
        // Return max and remaining slots for frontend display
        limit: NON_PEC_LIMIT
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking mini marathon registrations (GET):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------------------------------

/**
 * POST: Create a new mini marathon registration (secondary log).
 * This handles both PEC (no limit) and Non-PEC (limit enforced) students.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. TOKEN VERIFICATION (Remains the same)
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

    try {
      decoded = jwt.verify(token, userSecret) as { userId: string; email: string; };
    } catch (userError) {
      try {
        decoded = jwt.verify(token, adminSecret) as { adminId?: string; userId?: string; email: string; };
      } catch (adminError) {
        if (userError instanceof jwt.TokenExpiredError || adminError instanceof jwt.TokenExpiredError) {
          return NextResponse.json({ error: 'Token expired. Please login again.' }, { status: 401 });
        } else {
          return NextResponse.json({ error: 'Invalid token. Please login again.' }, { status: 401 });
        }
      }
    }

    await dbConnect();
    const body: PostBody = await request.json(); // Safely parse with type

    if (!body.eventId || body.isPecStudent === undefined) {
      return NextResponse.json(
        { error: 'eventId and isPecStudent flag are required' },
        { status: 400 }
      );
    }

    const email = decoded.email;
    const NON_PEC_LIMIT = 100;


    // 2. EXISTING REGISTRATION CHECK (Check all Mini-Marathon records)
    const existingRegistration = await MiniMarathon.findOne({
      eventId: body.eventId,
      email: email,
    });

    if (existingRegistration) {
      return NextResponse.json(
        {
          error: 'You are already registered for the mini marathon', // Now applies to all
          alreadyRegistered: true,
        },
        { status: 409 }
      );
    }

    // 3. NON-PEC LIMIT CHECK (Applied ONLY if the student is Non-PEC)
    let currentNonPecCount = 0;

    if (body.isPecStudent === false) {
      currentNonPecCount = await MiniMarathon.countDocuments({
        eventId: body.eventId,
        isPecStudent: false
      });

      if (currentNonPecCount >= NON_PEC_LIMIT) {
        return NextResponse.json(
          {
            error: `Registration limit reached. Maximum ${NON_PEC_LIMIT} non-PEC students can register for mini marathon.`,
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    // 4. FETCH USER DETAILS & CREATE REGISTRATION
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
      name: user.name, // Fetched from the User model
      dateTime: new Date(),
      isPecStudent: body.isPecStudent, // Save the student type
    };

    const newRegistration = await MiniMarathon.create(registrationData);

    // Calculate remaining slots *only* if the registered user was Non-PEC
    let remainingSlots = undefined;
    if (body.isPecStudent === false) {
      remainingSlots = NON_PEC_LIMIT - (currentNonPecCount + 1);
    }

    return NextResponse.json(
      {
        message: 'Mini marathon registration successful (Secondary Log)',
        registration: newRegistration,
        remainingNonPecSlots: remainingSlots
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating mini marathon registration (POST):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}