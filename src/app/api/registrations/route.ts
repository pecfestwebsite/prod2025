import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['eventId', 'userId', 'teamUserIds', 'feesPaid'];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== false && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate that teamUserIds is an array
    if (!Array.isArray(body.teamUserIds)) {
      return NextResponse.json(
        { error: 'teamUserIds must be an array' },
        { status: 400 }
      );
    }

    // Prepare the registration data
    const registrationData = {
      eventId: body.eventId.trim(),
      userId: body.userId.trim(),
      teamUserIds: body.teamUserIds.map((id: string) => id.trim()),
      verified: body.verified !== undefined ? body.verified : false,
      feesPaid: body.feesPaid, // base64url encoded
      dateTime: body.dateTime ? new Date(body.dateTime) : new Date(),
    };

    // Create the registration
    const newRegistration = await Registration.create(registrationData);

    return NextResponse.json(
      {
        message: 'Registration created successfully',
        registration: newRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating registration:', error);

    if (error instanceof Error) {
      // Handle MongoDB validation errors
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = {};

    if (eventId) {
      query.eventId = eventId;
    }

    if (userId) {
      query.userId = userId;
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
