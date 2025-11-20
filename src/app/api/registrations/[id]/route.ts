import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import User from '@/models/User';
import Event from '@/models/Event';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { sendUserVerificationEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if id is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid registration ID' },
        { status: 400 }
      );
    }

    // Find registration by ID
    const registration = await Registration.findById(id);

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        registration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching registration:', error);
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

    // Check if id is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid registration ID' },
        { status: 400 }
      );
    }

    // Get current registration to check if verified status changed
    const currentRegistration = await Registration.findById(id);
    if (!currentRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Find and update registration
    const updatedRegistration = await Registration.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Send email if verification status changed
    if (body.verified !== undefined && body.verified !== currentRegistration.verified) {
      try {
        console.log(`📧 Verification status changed for registration ${id}`);
        console.log(`   From: ${currentRegistration.verified} → To: ${body.verified}`);
        
        // Get admin information from JWT token
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
            console.log(`👤 Admin: ${adminName} (${adminEmail})`);
          } catch {
            // If token verification fails, use defaults
            console.warn('⚠️ Could not decode admin token for email notification');
          }
        }

        // Get user and event details
        console.log(`🔍 Looking up user with userId: ${updatedRegistration.userId}`);
        
        // Try to find user - handle both cases where userId might be email or actual user ID
        let user = await User.findOne({ userId: updatedRegistration.userId });
        
        // If not found by userId, try by email (in case userId field contains email)
        if (!user && updatedRegistration.userId.includes('@')) {
          console.log(`   First lookup failed, trying email lookup...`);
          user = await User.findOne({ email: updatedRegistration.userId });
        }
        
        console.log(`🔍 Looking up event with eventId: ${updatedRegistration.eventId}`);
        const event = await Event.findOne({ eventId: updatedRegistration.eventId });

        if (!user) {
          console.warn(`⚠️ User not found: ${updatedRegistration.userId}`);
          console.log(`   Available user fields in registration:`, {
            userId: updatedRegistration.userId,
            eventId: updatedRegistration.eventId,
          });
        }
        
        if (!event) {
          console.warn(`⚠️ Event not found: ${updatedRegistration.eventId}`);
        }

        // Send email if we have both user and event with valid email
        if (user && event && user.email) {
          // Format timestamp
          const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC',
          });

          // Format registration date
          const registrationDate = new Date(updatedRegistration.dateTime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
          });

          // Send email to user ONLY if verification is approved
          if (body.verified === true) {
            console.log(`✅ Sending verification approval email to user: ${user.email}`);
            sendUserVerificationEmail(
              user.email,
              user.name || user.email,
              event.eventName,
              'verified',
              {
                eventId: updatedRegistration.eventId,
                userId: updatedRegistration.userId,
                teamId: updatedRegistration.teamId,
                feesPaid: updatedRegistration.feesPaid,
                dateTime: registrationDate,
              },
              timestamp
            ).catch((error) => {
              console.error('❌ Error sending user verification email:', error);
            });
          } else {
            console.log(`⚠️ Registration marked as unverified - NOT sending approval email to user`);
          }

          // Always send admin notification to pecfestdev for record keeping (both verified and unverified)
          console.log(`📧 Sending admin notification to pecfestdev@gmail.com (Action: ${body.verified ? 'verified' : 'unverified'})`);
          sendEmailNotification({
            userEmail: user.email, // Original user email for context
            userName: user.name || user.email,
            eventName: event.eventName,
            action: body.verified ? 'verified' : 'unverified',
            adminName,
            adminEmail,
            registrationDetails: {
              eventId: updatedRegistration.eventId,
              userId: updatedRegistration.userId,
              teamId: updatedRegistration.teamId,
              feesPaid: updatedRegistration.feesPaid,
              dateTime: updatedRegistration.dateTime.toISOString(),
            },
            sendToUser: false,   // Don't send to user (already sent above if verified)
            sendToAdmin: true,   // Send admin notification to pecfestdev
          }).catch((error) => {
            console.error('❌ Error sending admin notification to pecfestdev:', error);
          });
        } else {
          console.warn('⚠️ Could not find user or event for email notification');
          console.log(`   User found: ${!!user}, Event found: ${!!event}, Email: ${user?.email}`);
        }
      } catch (error) {
        // Log email error but don't fail the registration update
        console.error('❌ Error in email notification process:', error);
      }
    }

    return NextResponse.json(
      {
        message: 'Registration updated successfully',
        registration: updatedRegistration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating registration:', error);

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

// Helper function to send email notification asynchronously
async function sendEmailNotification(payload: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/email/send-notification`;
    
    console.log(`🌐 Calling email API: ${url}`);
    console.log(`📧 Email payload:`, {
      to: payload.userEmail,
      action: payload.action,
      event: payload.eventName,
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer system-internal-call',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Email notification API error: ${response.status} ${response.statusText}`);
      console.error(`Response:`, responseData);
    } else {
      console.log(`✅ Email notification sent successfully`);
      console.log(`Response:`, responseData);
    }
  } catch (error) {
    console.error('❌ Error calling email notification API:', error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Check if id is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid registration ID' },
        { status: 400 }
      );
    }

    // Find and delete registration
    const deletedRegistration = await Registration.findByIdAndDelete(id);

    if (!deletedRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registration deleted successfully',
        registration: deletedRegistration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
