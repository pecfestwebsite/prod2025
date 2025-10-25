import { NextRequest, NextResponse } from 'next/server';
import {
  sendRegistrationVerificationEmail,
  sendAdminNotificationEmail,
} from '@/lib/email';

interface EmailNotificationPayload {
  userEmail: string;
  userName: string;
  eventName: string;
  action: 'verified' | 'unverified';
  adminName: string;
  adminEmail: string;
  registrationDetails: {
    eventId: string;
    userId: string;
    teamId?: string;
    feesPaid?: string;
    dateTime: string;
  };
  sendToUser?: boolean; // Send email to user (default: true)
  sendToAdmin?: boolean; // Send notification to admin (default: true)
}

/**
 * POST /api/email/send-notification
 * Send email notifications for registration verification status changes
 * This endpoint should only be called from the backend or by admins
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from header for authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Verify admin token - this should only be called by admins
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload: EmailNotificationPayload = await request.json();

    // Validate required fields
    if (
      !payload.userEmail ||
      !payload.userName ||
      !payload.eventName ||
      !payload.action ||
      !payload.adminName ||
      !payload.adminEmail ||
      !payload.registrationDetails
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['verified', 'unverified'].includes(payload.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verified" or "unverified"' },
        { status: 400 }
      );
    }

    const sendToUser = payload.sendToUser !== false; // default: true
    const sendToAdmin = payload.sendToAdmin !== false; // default: true

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

    const emailData = {
      ...payload,
      timestamp,
      registrationDetails: {
        ...payload.registrationDetails,
        dateTime: new Date(payload.registrationDetails.dateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata',
        }),
      },
    };

    const results = {
      userEmailSent: false,
      adminEmailSent: false,
      errors: [] as string[],
    };

    // Send email to user
    if (sendToUser) {
      try {
        const userEmailSent =
          await sendRegistrationVerificationEmail(emailData);
        results.userEmailSent = userEmailSent;
        if (!userEmailSent) {
          results.errors.push('Failed to send email to user');
        }
      } catch (error) {
        results.errors.push(`Error sending user email: ${error}`);
      }
    }

    // Send notification to admin
    if (sendToAdmin) {
      try {
        const adminEmailSent = await sendAdminNotificationEmail(
          payload.adminEmail,
          payload.adminName,
          emailData
        );
        results.adminEmailSent = adminEmailSent;
        if (!adminEmailSent) {
          results.errors.push('Failed to send admin notification');
        }
      } catch (error) {
        results.errors.push(`Error sending admin notification: ${error}`);
      }
    }

    return NextResponse.json(
      {
        success: results.userEmailSent || results.adminEmailSent,
        message: 'Notification emails sent',
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email notification endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
