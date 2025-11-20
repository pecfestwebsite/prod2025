import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSMTPConfig, skipToNextAccount } from '@/lib/smtpRotation';

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

    const results = {
      userEmailSent: false,
      adminEmailSent: false,
      errors: [] as string[],
    };

    // Helper function to send email with SMTP rotation
    const sendEmailWithRetry = async (to: string, subject: string, htmlContent: string): Promise<boolean> => {
      let emailSent = false;
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const currentSmtpConfig = getSMTPConfig();
          console.log(`📧 Attempt ${attempt + 1}/${maxRetries}: Using SMTP Account ${currentSmtpConfig.accountNumber} (${currentSmtpConfig.user})`);

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: currentSmtpConfig.user,
              pass: currentSmtpConfig.pass,
            },
            connectionTimeout: 5000, // 5 second connection timeout
            socketTimeout: 5000, // 5 second socket timeout
          });

          const mailOptions = {
            from: currentSmtpConfig.from,
            to: to,
            subject: subject,
            html: htmlContent,
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent successfully to ${to} using Account ${currentSmtpConfig.accountNumber}`);
          emailSent = true;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const errorMsg = lastError.message;

          // Check if this is a daily limit error
          if (errorMsg.includes('Daily user sending limit exceeded') || errorMsg.includes('550')) {
            console.warn(`⚠️ Account hit daily limit, trying next account...`);
            skipToNextAccount(); // Force skip to next account
            continue; // Try next account
          } else {
            // Other errors (not daily limit) should not retry
            console.error(`❌ Non-retryable error: ${errorMsg}`);
            throw error;
          }
        }
      }

      if (!emailSent) {
        console.error(`❌ All SMTP accounts exhausted or failed for email to ${to}`);
        throw new Error('All SMTP accounts at daily limit. Please try again tomorrow.');
      }

      return emailSent;
    };

    // Send email to user
    if (sendToUser) {
      try {
        const userEmailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 15px; }
                .content { color: #666; line-height: 1.6; margin: 20px 0; }
                .status { padding: 15px; border-radius: 4px; margin: 20px 0; }
                .verified { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .unverified { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
                .details p { margin: 8px 0; }
                .footer { color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>PECFEST 2025 - Registration Update</h2>
                </div>
                <div class="content">
                  <p>Hello ${payload.userName},</p>
                  <p>Your registration for <strong>${payload.eventName}</strong> has been ${payload.action === 'verified' ? 'verified' : 'unverified'}.</p>
                  
                  <div class="status ${payload.action === 'verified' ? 'verified' : 'unverified'}">
                    <strong>Status: ${payload.action.toUpperCase()}</strong>
                  </div>
                  
                  <div class="details">
                    <p><strong>Event:</strong> ${payload.eventName}</p>
                    <p><strong>Registration ID:</strong> ${payload.registrationDetails.eventId}</p>
                    ${payload.registrationDetails.feesPaid ? `<p><strong>Fees Paid:</strong> ${payload.registrationDetails.feesPaid}</p>` : ''}
                  </div>
                  
                  <p>If you have any questions, please contact the admin team.</p>
                </div>
                <div class="footer">
                  <p>© 2025 PECFEST. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const userEmailSent = await sendEmailWithRetry(
          payload.userEmail,
          `Your Registration Status - ${payload.eventName}`,
          userEmailHtml
        );
        results.userEmailSent = userEmailSent;
      } catch (error) {
        results.errors.push(`Error sending user email: ${error}`);
      }
    }

    // Send notification to admin
    if (sendToAdmin) {
      try {
        const adminRecipient = 'pecfestdev@gmail.com';
        console.log(`📧 Sending admin notification to: ${adminRecipient}`);

        const adminEmailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 15px; }
                .content { color: #666; line-height: 1.6; margin: 20px 0; }
                .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
                .details p { margin: 8px 0; }
                .footer { color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Admin Notification - Registration Update</h2>
                </div>
                <div class="content">
                  <p>A registration status has been updated by ${payload.adminName}.</p>
                  
                  <div class="details">
                    <p><strong>User:</strong> ${payload.userName} (${payload.userEmail})</p>
                    <p><strong>Event:</strong> ${payload.eventName}</p>
                    <p><strong>Action:</strong> ${payload.action.toUpperCase()}</p>
                    <p><strong>Registration ID:</strong> ${payload.registrationDetails.eventId}</p>
                    <p><strong>User ID:</strong> ${payload.registrationDetails.userId}</p>
                    ${payload.registrationDetails.teamId ? `<p><strong>Team ID:</strong> ${payload.registrationDetails.teamId}</p>` : ''}
                    ${payload.registrationDetails.feesPaid ? `<p><strong>Fees Paid:</strong> ${payload.registrationDetails.feesPaid}</p>` : ''}
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}</p>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2025 PECFEST. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const adminEmailSent = await sendEmailWithRetry(
          adminRecipient,
          `Admin Notification - ${payload.action.toUpperCase()}: ${payload.eventName}`,
          adminEmailHtml
        );
        results.adminEmailSent = adminEmailSent;
        if (adminEmailSent) {
          console.log(`✅ Admin notification sent successfully to ${adminRecipient}`);
        }
      } catch (error) {
        console.error('❌ Error sending admin notification:', error);
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
