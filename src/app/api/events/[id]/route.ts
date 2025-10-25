import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import jwt from 'jsonwebtoken';
import { sendEventDeletionEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Find event by eventId (not MongoDB _id)
    const event = await Event.findOne({ eventId: id });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Find and update event
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId: id },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Event updated successfully',
        event: updatedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating event:', error);

    if (error instanceof Error) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Find and delete event
    const deletedEvent = await Event.findOneAndDelete({ eventId: id });

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Send deletion notification email asynchronously
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      let adminName = 'Admin';
      let adminEmail = 'admin@pecfest.com';

      if (token) {
        try {
          const adminSecret = process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';
          const decoded = jwt.verify(token, adminSecret) as any;
          adminName = decoded.name || 'Admin';
          adminEmail = decoded.email || 'admin@pecfest.com';
        } catch {
          console.warn('⚠️ Could not decode admin token for event deletion notification');
        }
      }

      const deletionTimestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
      });

      // Send email to webmaster and Kaavya
      const recipients = ['pecfestdev@gmail.com', 'kaavya7705@gmail.com'];
      
      try {
        const eventDeletionData = {
          eventId: deletedEvent.eventId,
          eventName: deletedEvent.eventName,
          category: deletedEvent.category,
          societyName: deletedEvent.societyName,
          regFees: deletedEvent.regFees,
          dateTime: new Date(deletedEvent.dateTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
          }),
          location: deletedEvent.location,
          briefDescription: deletedEvent.briefDescription,
        };

        // Send to each recipient
        for (const recipient of recipients) {
          await sendEventDeletionEmail(
            recipient,
            eventDeletionData,
            adminName,
            adminEmail,
            deletionTimestamp
          );
        }
        console.log('✅ Event deletion emails sent successfully to all recipients');
      } catch (emailError) {
        console.error('❌ Error sending event deletion email:', emailError);
      }
    } catch (error) {
      console.error('❌ Error in event deletion notification process:', error);
    }

    return NextResponse.json(
      {
        message: 'Event deleted successfully',
        event: deletedEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
