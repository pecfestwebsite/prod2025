import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";


export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();

    // Validate required fields (excluding eventId - it will be auto-generated)
    const requiredFields = [
      "category",
      "societyName",
      "eventName",
      "regFees",
      "dateTime",
      "location",
      "briefDescription",
      "image",
      "contactInfo",
      "isTeamEvent",
      "minTeamMembers",
      "maxTeamMembers",
    ];

    for (const field of requiredFields) {
      if (field === "isTeamEvent") {
        // isTeamEvent is a boolean, so we need to check if it's explicitly undefined
        if (body[field] === undefined) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      } else if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate category enum
    if (!["technical", "cultural", "convenor"].includes(body.category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be technical, cultural, or convenor" },
        { status: 400 }
      );
    }

    // Helper function to generate eventId
    const generateEventId = (
      eventName: string,
      societyName: string,
      additionalClub?: string
    ): string => {
      try {
        const eventNameSlug = eventName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");

        const societyNameSlug = societyName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");

        const additionalClubSlug =
          additionalClub && additionalClub !== "None"
            ? additionalClub
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "")
            : null;

        return additionalClubSlug
          ? `${eventNameSlug}_${societyNameSlug}_${additionalClubSlug}`
          : `${eventNameSlug}_${societyNameSlug}`;
      } catch (error) {
        console.error("Error generating eventId:", error);
        return `EVT${Date.now().toString().slice(-5)}`;
      }
    };

    // Prepare the event data with generated eventId
    const additionalClub = body.additionalClub || "None";
    const generatedEventId = generateEventId(
      body.eventName.trim(),
      body.societyName.trim(),
      additionalClub
    );

    console.log("🔧 API: Generated eventId:", generatedEventId);

    const eventData = {
      eventId: generatedEventId, // Set eventId explicitly BEFORE creating event
      category: body.category,
      societyName: body.societyName.trim(),
      additionalClub: additionalClub,
      eventName: body.eventName.trim(),
      regFees: Number(body.regFees),
      dateTime: new Date(body.dateTime),
      location: body.location.trim(),
      briefDescription: body.briefDescription.trim(),
      pdfLink: body.pdfLink ? body.pdfLink.trim() : "",
      image: body.image,
      contactInfo: body.contactInfo.trim(),
      isTeamEvent: Boolean(body.isTeamEvent),
      minTeamMembers: Number(body.minTeamMembers),
      maxTeamMembers: Number(body.maxTeamMembers),
      mapCoordinates:
        body.mapCoordinates?.latitude && body.mapCoordinates?.longitude
          ? {
              latitude: Number(body.mapCoordinates.latitude),
              longitude: Number(body.mapCoordinates.longitude),
            }
          : undefined,
    };

    console.log("📋 API: eventData to be saved:", {
      eventId: eventData.eventId,
      eventName: eventData.eventName,
    });

    // Create event with the explicitly generated eventId
    const newEvent = new Event(eventData);

    // Log the state before save
    console.log("📝 API: Before save - newEvent.eventId:", newEvent.eventId);
    console.log("📝 API: Before save - newEvent.isNew:", newEvent.isNew);

    // Save the event
    const savedEvent = await newEvent.save();

    // Log the state after save
    console.log("✅ API: After save - savedEvent.eventId:", savedEvent.eventId);
    console.log(
      "✅ API: After save - Full event:",
      JSON.stringify(
        { eventId: savedEvent.eventId, eventName: savedEvent.eventName },
        null,
        2
      )
    );

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);

    if (error instanceof Error) {
      // Handle MongoDB validation errors
      if (error.message.includes("validation failed")) {
        console.error("Validation error details:", (error as any).errors);
        return NextResponse.json(
          { error: `Validation failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const society = searchParams.get("society");
    const date = searchParams.get("date");
    const eventType = searchParams.get("eventType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query: any = {};

    // Category filter
    if (
      category &&
      category !== "all" &&
      ["technical", "cultural", "convenor"].includes(category)
    ) {
      query.category = category;
    }

    // Society filter
    if (society && society !== "all") {
      query.societyName = society;
    }

    // Date filter (filter by day of month)
    if (date && date !== "all") {
      const day = parseInt(date, 10);
      if (!isNaN(day)) {
        // Match events on that day (21, 22, or 23 November 2025)
        const startDate = new Date(2025, 10, day, 0, 0, 0); // Month is 0-indexed (10 = November)
        const endDate = new Date(2025, 10, day, 23, 59, 59);
        query.dateTime = { $gte: startDate, $lte: endDate };
      }
    }

    // Event type filter (team vs individual)
    if (eventType && eventType !== "all") {
      query.isTeamEvent = eventType === "team";
    }

    // Search filter (search in event name, society name, and description)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { eventName: searchRegex },
        { societyName: searchRegex },
        { briefDescription: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    // Fetch events with pagination
    const events = await Event.find(query)
      .sort({ eventName: 1 }) // Sort alphabetically by event name
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
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
