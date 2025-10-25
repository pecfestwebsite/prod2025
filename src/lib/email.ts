import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface RegistrationEmailData {
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
  timestamp: string;
}

// Initialize Nodemailer transporter
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  let emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.error('Email credentials not configured.');
    return null;
  }

  // Remove spaces and quotes from email password
  emailPassword = emailPassword
    .replace(/^["']|["']$/g, '')
    .replace(/\s/g, '');

  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } else if (emailService === 'custom') {
    // For custom SMTP server
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  return null;
};

// Send email using transporter
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...options,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Generate HTML template for registration verification email
const generateRegistrationVerificationTemplate = (data: RegistrationEmailData): string => {
  const actionStatus = data.action === 'verified' ? 'VERIFIED' : 'UNVERIFIED';
  const actionColor = data.action === 'verified' ? '#10b981' : '#ef4444';
  const actionBgColor = data.action === 'verified' ? '#f0fdf4' : '#fef2f2';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .status-section {
            background: ${actionBgColor};
            border-top: 4px solid ${actionColor};
            padding: 20px;
            margin: 0;
          }
          .status-badge {
            display: inline-block;
            background-color: ${actionColor};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
          }
          .content {
            padding: 30px 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .info-grid {
            display: grid;
            gap: 12px;
          }
          .info-row {
            display: flex;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 10px;
          }
          .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .info-label {
            font-weight: 600;
            color: #4b5563;
            min-width: 150px;
            font-size: 13px;
          }
          .info-value {
            color: #1f2937;
            font-size: 13px;
            word-break: break-word;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #6b7280;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Status Notification</h1>
          </div>
          
          <div class="status-section">
            <span class="status-badge">${actionStatus}</span>
          </div>
          
          <div class="content">
            <p>Dear ${escapeHtml(data.userName)},</p>
            <p>We are writing to inform you that your registration status for <strong>${escapeHtml(data.eventName)}</strong> has been updated in our system.</p>
            <p>Your registration was <strong>${data.action === 'verified' ? 'verified and approved' : 'unverified'}</strong> on ${escapeHtml(data.timestamp)}.</p>
            
            <!-- USER DETAILS SECTION -->
            <div class="section">
              <div class="section-title">User Details</div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${escapeHtml(data.userName)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">User ID:</div>
                  <div class="info-value">${escapeHtml(data.registrationDetails.userId)}</div>
                </div>
              </div>
            </div>

            <!-- REGISTRATION DETAILS SECTION -->
            <div class="section">
              <div class="section-title">Registration Details</div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Event:</div>
                  <div class="info-value">${escapeHtml(data.eventName)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Event ID:</div>
                  <div class="info-value">${escapeHtml(data.registrationDetails.eventId)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Registered On:</div>
                  <div class="info-value">${escapeHtml(data.registrationDetails.dateTime)}</div>
                </div>
                ${data.registrationDetails.teamId ? `
                <div class="info-row">
                  <div class="info-label">Team ID:</div>
                  <div class="info-value">${escapeHtml(data.registrationDetails.teamId)}</div>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- ADMIN DETAILS SECTION -->
            <div class="section">
              <div class="section-title">Admin Action</div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Admin Name:</div>
                  <div class="info-value">${escapeHtml(data.adminName)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Admin Email:</div>
                  <div class="info-value">${escapeHtml(data.adminEmail)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Action:</div>
                  <div class="info-value">${data.action === 'verified' ? 'Registration Verified' : 'Registration Unverified'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Timestamp:</div>
                  <div class="info-value">${escapeHtml(data.timestamp)}</div>
                </div>
              </div>
            </div>

            <p>If you have any questions regarding your registration status, please contact our support team at pecfest@example.com or reply to this email.</p>
            <p>Thank you for your interest in Pecfest 2025.</p>
            
            <p>Best regards,<br>Pecfest 2025 Event Management Team</p>
          </div>
            <div class="footer">
            <p><strong>Pecfest 2025 - Events Team</strong></p>
            <p>This is an automated notification from Pecfest 2025 event management system. Please do not reply to this email as this mailbox is not monitored. For support, contact pecfest@example.com</p>
            <p>&copy; ${new Date().getFullYear()} Pecfest. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Helper function to escape HTML
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Send registration verification email
export const sendRegistrationVerificationEmail = async (
  data: RegistrationEmailData
): Promise<boolean> => {
  try {
    const subject =
      data.action === 'verified'
        ? `Registration Verified - ${data.eventName}`
        : `Registration Status Changed - ${data.eventName}`;

    const html = generateRegistrationVerificationTemplate(data);

    return await sendEmail({
      to: data.userEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending registration verification email:', error);
    return false;
  }
};

// Send admin notification email
export const sendAdminNotificationEmail = async (
  adminEmail: string,
  adminName: string,
  data: RegistrationEmailData
): Promise<boolean> => {
  try {
    const subject = `[Admin Notification] Registration ${
      data.action === 'verified' ? 'Verified' : 'Unverified'
    } - ${data.eventName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: #1f2937;
              color: white;
              padding: 20px;
            }
            .content {
              padding: 20px;
            }
            .detail-item {
              margin: 10px 0;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .footer {
              background: #f5f5f5;
              padding: 15px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Admin Notification - Registration Action Performed</h2>
            </div>
            <div class="content">
              <p>A registration action has been performed in the admin panel. Please review the details below.</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #1f2937;">
                <div class="detail-item"><strong>Action Performed:</strong> Registration ${data.action === 'verified' ? 'Verified' : 'Unverified'}</div>
                <div class="detail-item"><strong>Admin Name:</strong> ${escapeHtml(data.adminName)}</div>
                <div class="detail-item"><strong>Admin Email:</strong> ${escapeHtml(data.adminEmail)}</div>
                <div class="detail-item"><strong>Event Name:</strong> ${escapeHtml(data.eventName)}</div>
                <div class="detail-item"><strong>User Email:</strong> ${escapeHtml(data.userEmail)}</div>
                <div class="detail-item"><strong>User Name:</strong> ${escapeHtml(data.userName)}</div>
                <div class="detail-item"><strong>User ID:</strong> ${escapeHtml(data.registrationDetails.userId)}</div>
                ${data.registrationDetails.teamId ? `<div class="detail-item"><strong>Team ID:</strong> ${escapeHtml(data.registrationDetails.teamId)}</div>` : ''}
                <div class="detail-item"><strong>Timestamp:</strong> ${escapeHtml(data.timestamp)}</div>
              </div>

              <p>This action has been recorded in the system.</p>
            </div>
            <div class="footer">
              <p><strong>Pecfest 2025 - Admin Panel Alert</strong></p>
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Pecfest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

// Send event deletion notification email
export const sendEventDeletionEmail = async (
  webmasterEmail: string,
  eventDetails: {
    eventId: string;
    eventName: string;
    category: string;
    societyName: string;
    regFees: number;
    dateTime: string;
    location: string;
    briefDescription: string;
  },
  adminName: string,
  adminEmail: string,
  deletionTimestamp: string
): Promise<boolean> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 700px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .status-section {
              background: #fee2e2;
              border-top: 4px solid #dc2626;
              padding: 20px;
              margin: 0;
            }
            .status-badge {
              display: inline-block;
              background-color: #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 14px;
            }
            .content {
              padding: 30px 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 700;
              color: #1f2937;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .info-grid {
              display: grid;
              gap: 12px;
            }
            .info-row {
              display: flex;
              border-bottom: 1px solid #f3f4f6;
              padding-bottom: 10px;
            }
            .info-row:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #4b5563;
              min-width: 150px;
              font-size: 13px;
            }
            .info-value {
              color: #1f2937;
              font-size: 13px;
              word-break: break-word;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Event Deletion Notification</h1>
            </div>
            
            <div class="status-section">
              <span class="status-badge">EVENT DELETED</span>
            </div>
            
            <div class="content">
              <p>An event has been deleted from the Pecfest 2025 system. Please review the details below.</p>
              
              <!-- EVENT DETAILS SECTION -->
              <div class="section">
                <div class="section-title">Deleted Event Details</div>
                <div class="info-grid">
                  <div class="info-row">
                    <div class="info-label">Event Name:</div>
                    <div class="info-value">${escapeHtml(eventDetails.eventName)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Event ID:</div>
                    <div class="info-value">${escapeHtml(eventDetails.eventId)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Category:</div>
                    <div class="info-value">${escapeHtml(eventDetails.category)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Society/Club:</div>
                    <div class="info-value">${escapeHtml(eventDetails.societyName)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Registration Fee:</div>
                    <div class="info-value">₹${eventDetails.regFees}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Date & Time:</div>
                    <div class="info-value">${escapeHtml(eventDetails.dateTime)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Location:</div>
                    <div class="info-value">${escapeHtml(eventDetails.location)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Description:</div>
                    <div class="info-value">${escapeHtml(eventDetails.briefDescription)}</div>
                  </div>
                </div>
              </div>

              <!-- ADMIN DETAILS SECTION -->
              <div class="section">
                <div class="section-title">Admin Action</div>
                <div class="info-grid">
                  <div class="info-row">
                    <div class="info-label">Admin Name:</div>
                    <div class="info-value">${escapeHtml(adminName)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Admin Email:</div>
                    <div class="info-value">${escapeHtml(adminEmail)}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Deleted At:</div>
                    <div class="info-value">${escapeHtml(deletionTimestamp)}</div>
                  </div>
                </div>
              </div>

              <p>The event has been removed from the active events list.</p>
              
              <p>Regards,<br>Pecfest 2025 Event Management System</p>
            </div>
            
            <div class="footer">
              <p><strong>Pecfest 2025 - Event Management System</strong></p>
              <p>This is an automated alert from the Pecfest 2025 event management system. Please review this notification and retain for your records.</p>
              <p>&copy; ${new Date().getFullYear()} Pecfest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail({
      to: webmasterEmail,
      subject: `Event Deleted - ${escapeHtml(eventDetails.eventName)}`,
      html,
    });
  } catch (error) {
    console.error('Error sending event deletion email:', error);
    return false;
  }
};
