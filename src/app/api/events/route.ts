import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();

    // Validate required fields (excluding eventId - it will be auto-generated)
    const requiredFields = [
      'category',
      'societyName',
      'eventName',
      'regFees',
      'dateTime',
      'location',
      'briefDescription',
      'pdfLink',
      'image',
      'contactInfo',
      'teamLimit',
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate category enum
    if (!['technical', 'cultural', 'convenor'].includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be technical, cultural, or convenor' },
        { status: 400 }
      );
    }

    // Prepare the event data (eventId will be auto-generated in the pre-save hook)
    const eventData = {
      category: body.category,
      societyName: body.societyName.trim(),
      eventName: body.eventName.trim(),
      regFees: Number(body.regFees),
      dateTime: new Date(body.dateTime),
      location: body.location.trim(),
      briefDescription: body.briefDescription.trim(),
      pdfLink: body.pdfLink.trim(),
      image: body.image, // base64url encoded
      contactInfo: body.contactInfo.trim(),
      team: Number(body.team) || 0,
      teamLimit: Number(body.teamLimit),
      mapCoordinates: body.mapCoordinates?.latitude && body.mapCoordinates?.longitude
        ? {
            latitude: Number(body.mapCoordinates.latitude),
            longitude: Number(body.mapCoordinates.longitude),
          }
        : undefined,
    };

    // Create and save the event
    // Note: We use new Event() followed by save() instead of Event.create()
    // to ensure pre-save hooks run before validation
    const newEvent = new Event(eventData);
    await newEvent.save();

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);

    if (error instanceof Error) {
      // Handle MongoDB validation errors
      if (error.message.includes('validation failed')) {
        console.error('Validation error details:', (error as any).errors);
        return NextResponse.json(
          { error: `Validation failed: ${error.message}` },
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
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = {};

    if (category && ['technical', 'cultural', 'convenor'].includes(category)) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    // Fetch events with pagination
    const events = await Event.find(query)
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    return NextResponse.json(
      {
        events,
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
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
