import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    href?: string;
  }>;
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

// Send verification email to user with event and user details
export const sendUserVerificationEmail = async (
  userEmail: string,
  userName: string,
  eventName: string,
  action: 'verified' | 'unverified',
  registrationDetails: {
    eventId: string;
    userId: string;
    teamId?: string;
    feesPaid?: string;
    dateTime: string;
  },
  timestamp: string
): Promise<boolean> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #140655;
              margin: 0;
              padding: 20px;
              position: relative;
            }
            
            .stars {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              pointer-events: none;
            }
            
            .star {
              position: absolute;
              color: white;
              font-size: 16px;
              animation: twinkle 3s infinite;
              opacity: 0.4;
            }
            
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.6; }
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(15, 4, 68, 0.9);
              border-radius: 25px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
              border: 2px solid rgba(102, 126, 234, 0.3);
              position: relative;
              z-index: 10;
            }
            
            .header {
              background: linear-gradient(135deg, #4321a9 0%, #10b981 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            
            .header h1 {
              margin: 0;
              font-size: 36px;
              font-weight: bold;
            }
            
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            
            .content {
              padding: 40px;
              text-align: center;
            }
            
            .content h2 {
              color: white;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
            }
            
            .status-box {
              background: linear-gradient(90deg, #2a0a56, #4321a9, #10b981, #059669);
              color: white;
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              padding: 35px;
              border-radius: 15px;
              margin: 30px 0;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
              font-family: 'Courier New', monospace;
            }
            
            .message {
              color: #e0e7ff;
              font-size: 15px;
              line-height: 1.7;
              margin: 15px 0;
            }
            
            .highlight {
              color: white;
              font-weight: bold;
            }
            
            .details-box {
              background: rgba(59, 130, 246, 0.15);
              border: 1px solid rgba(102, 126, 234, 0.3);
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              color: #a5b4fc;
              font-size: 14px;
              text-align: left;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid rgba(102, 126, 234, 0.2);
            }
            
            .detail-row:last-child {
              border-bottom: none;
            }
            
            .detail-label {
              font-weight: bold;
              color: white;
            }
            
            .detail-value {
              color: #a5b4fc;
              word-break: break-all;
            }
            
            .warning {
              background: rgba(59, 130, 246, 0.15);
              border: 1px solid rgba(102, 126, 234, 0.3);
              border-radius: 12px;
              padding: 15px;
              margin: 20px 0;
              color: #a5b4fc;
              font-size: 14px;
            }
            
            .footer {
              background: rgba(102, 126, 234, 0.1);
              padding: 25px 20px;
              text-align: center;
              color: #a5b4fc;
              font-size: 13px;
              border-top: 1px solid rgba(102, 126, 234, 0.2);
            }
            
            .footer p {
              margin: 8px 0;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PECFEST 2025</h1>
              <p>Registration Status Update</p>
            </div>
            
            <div class="content">
              <h2>✨ Your Registration has been Verified ✨</h2>
              
              <p class="message">
                Greetings ${escapeHtml(userName)}!
              </p>
              
              <div class="status-box">
                ✓ VERIFIED
              </div>
              
              <p class="message">
                <span class="highlight">Congratulations!</span><br>
                Your registration for <strong>${escapeHtml(eventName)}</strong> has been verified and approved.
              </p>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Event:</span>
                  <span class="detail-value">${escapeHtml(eventName)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Event ID:</span>
                  <span class="detail-value">${escapeHtml(registrationDetails.eventId)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Registered On:</span>
                  <span class="detail-value">${escapeHtml(registrationDetails.dateTime)}</span>
                </div>
                ${registrationDetails.teamId ? `
                <div class="detail-row">
                  <span class="detail-label">Team ID:</span>
                  <span class="detail-value">${escapeHtml(registrationDetails.teamId)}</span>
                </div>
                ` : ''}
                ${registrationDetails.feesPaid ? `
                <div class="detail-row">
                  <span class="detail-label">Fees Paid:</span>
                  <span class="detail-value">${escapeHtml(registrationDetails.feesPaid)}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="detail-label">Verified At:</span>
                  <span class="detail-value">${escapeHtml(timestamp)}</span>
                </div>
              </div>
              
              <div class="warning">
                You are all set! Your registration is confirmed. If you have any questions or need assistance, please contact our support team.
              </div>
            </div>
            
            <div class="footer">
              <p>🏮 PECFEST 2025 - Registration Verified 🏮</p>
              <p style="font-size: 12px; margin-top: 12px;">For support, contact <strong>support@pecfest.com</strong></p>
              <p style="font-size: 11px; margin-top: 8px; color: #a5b4fc;">Protected by mystical enchantments</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const subject = `✓ Registration Verified - ${eventName}`;

    return await sendEmail({
      to: userEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending user verification email:', error);
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

// Interface for initial registration confirmation email
interface RegistrationConfirmationData {
  userEmail: string;
  userName: string;
  eventName: string;
  eventId: string;
  teamId?: string;
  isLeader?: boolean;
  regFees: number;
  feesPaid: boolean;
  registrationDate: string;
  eventDateTime: string;
  eventLocation?: string;
  accommodationRequired?: boolean;
  accommodationMembers?: number;
  accommodationFees?: number;
  receiptUrl?: string;
}

// Generate HTML template for initial registration confirmation
const generateRegistrationConfirmationTemplate = (data: RegistrationConfirmationData): string => {
  const isFreeBadge = data.regFees === 0;
  const statusBadgeColor = isFreeBadge ? '#10b981' : '#f59e0b';
  const statusBadgeText = isFreeBadge ? '✅ REGISTERED' : '⏳ PENDING VERIFICATION';
  const statusBgGradient = isFreeBadge 
    ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #010101 0%, #140655 50%, #2a0a56 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(237, 106, 184, 0.3);
            overflow: hidden;
            border: 2px solid #b53da1;
          }
          .header {
            background: linear-gradient(135deg, #140655 0%, #2a0a56 50%, #4321a9 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(237, 106, 184, 0.2) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #fea6cc 0%, #ffd4b9 50%, #ed6ab8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            position: relative;
            z-index: 1;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
            color: #ffd4b9;
            position: relative;
            z-index: 1;
          }
          .status-section {
            background: ${statusBgGradient};
            border-top: 4px solid ${statusBadgeColor};
            padding: 20px;
            text-align: center;
            margin: 0;
          }
          .status-badge {
            display: inline-block;
            background: linear-gradient(135deg, #b53da1 0%, #ed6ab8 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(181, 61, 161, 0.4);
          }
          .content {
            padding: 30px 20px;
            background: linear-gradient(to bottom, #ffffff 0%, #faf5ff 100%);
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #140655;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            border-bottom: 3px solid #ed6ab8;
            padding-bottom: 10px;
            background: linear-gradient(90deg, #b53da1 0%, #ed6ab8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .info-grid {
            display: grid;
            gap: 12px;
          }
          .info-row {
            display: flex;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 10px;
            transition: all 0.3s ease;
          }
          .info-row:hover {
            background: #faf5ff;
            padding-left: 8px;
            border-left: 3px solid #ed6ab8;
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
          .highlight-box {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            border-left: 4px solid #b53da1;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 4px 10px rgba(181, 61, 161, 0.1);
          }
          .highlight-box h3 {
            margin: 0 0 10px 0;
            color: #4321a9;
            font-size: 16px;
            font-weight: 700;
          }
          .highlight-box p {
            margin: 5px 0;
            color: #2a0a56;
            font-size: 14px;
          }
          .alert-box {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-left: 4px solid #ef4444;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .alert-box p {
            margin: 5px 0;
            color: #991b1b;
            font-size: 13px;
          }
          .success-box {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 10px rgba(16, 185, 129, 0.1);
          }
          .success-box h3 {
            margin: 0 0 10px 0;
            color: #047857;
            font-size: 20px;
            font-weight: 700;
          }
          .success-box p {
            margin: 5px 0;
            color: #065f46;
            font-size: 14px;
          }
          .footer {
            background: linear-gradient(135deg, #140655 0%, #2a0a56 100%);
            padding: 25px;
            text-align: center;
            font-size: 11px;
            color: #ffd4b9;
            border-top: 3px solid #ed6ab8;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer strong {
            color: #fea6cc;
            font-size: 13px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #b53da1 0%, #ed6ab8 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 10px 0;
            box-shadow: 0 4px 15px rgba(237, 106, 184, 0.4);
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #ed6ab8 50%, transparent 100%);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration ${isFreeBadge ? 'Successful' : 'Confirmed'}!</h1>
            <p>Welcome to Pecfest 2025 - Where Creativity Meets Innovation</p>
          </div>
          
          <div class="status-section">
            <span class="status-badge">${statusBadgeText}</span>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${escapeHtml(data.userName)},</p>
            <p>Thank you for registering for <strong style="color: #b53da1;">${escapeHtml(data.eventName)}</strong>! We're thrilled to have you as part of Pecfest 2025.</p>
            
            ${isFreeBadge ? `
            <p style="color: #047857; font-weight: 600; font-size: 16px; margin: 20px 0;">
              ✅ Your registration is <strong>COMPLETE</strong>! This is a free event, so no payment verification is needed. You're all set!
            </p>
            ` : `
            <p>Your registration has been successfully submitted and is currently <strong style="color: #f59e0b;">pending verification</strong> by our admin team. You will receive another email once your payment receipt is verified.</p>
            `}
            
            <!-- REGISTRATION DETAILS SECTION -->
            <div class="section">
              <div class="section-title">📋 Registration Details</div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Event Name:</div>
                  <div class="info-value">${escapeHtml(data.eventName)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Event ID:</div>
                  <div class="info-value">${escapeHtml(data.eventId)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Registration Date:</div>
                  <div class="info-value">${escapeHtml(data.registrationDate)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Event Date & Time:</div>
                  <div class="info-value">${escapeHtml(data.eventDateTime)}</div>
                </div>
                ${data.eventLocation ? `
                <div class="info-row">
                  <div class="info-label">Location:</div>
                  <div class="info-value">${escapeHtml(data.eventLocation)}</div>
                </div>
                ` : ''}
                <div class="info-row">
                  <div class="info-label">Registration Status:</div>
                  <div class="info-value" style="color: ${isFreeBadge ? '#047857' : '#f59e0b'}; font-weight: 600;">
                    ${isFreeBadge ? '✅ Registered (No verification needed)' : '⏳ Pending Verification'}
                  </div>
                </div>
              </div>
            </div>

            <!-- YOUR DETAILS SECTION -->
            <div class="section">
              <div class="section-title">👤 Your Details</div>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${escapeHtml(data.userName)}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${escapeHtml(data.userEmail)}</div>
                </div>
              </div>
            </div>

            ${data.teamId ? `
            <!-- TEAM DETAILS SECTION -->
            <div class="highlight-box">
              <h3>👥 Team Registration</h3>
              <p><strong>Team ID:</strong> ${escapeHtml(data.teamId)}</p>
              <p><strong>Role:</strong> ${data.isLeader ? '👑 Team Leader' : '🤝 Team Member'}</p>
              ${data.isLeader ? `
              <p style="margin-top: 10px;"><strong>Important:</strong> Share this Team ID with your team members so they can join your team!</p>
              ` : ''}
            </div>
            ` : ''}

            <!-- PAYMENT DETAILS SECTION -->
            <div class="section">
              <div class="section-title">💰 Payment Information</div>
              ${isFreeBadge ? `
              <div class="success-box">
                <h3>🎊 Free Event - No Payment Required!</h3>
                <p style="font-size: 16px; margin-top: 10px;">This event is completely free. You're all registered and ready to go!</p>
              </div>
              ` : `
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-label">Registration Fee:</div>
                  <div class="info-value" style="font-weight: 700; color: #b53da1;">₹${data.regFees}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Payment Status:</div>
                  <div class="info-value">${data.feesPaid ? '✅ Receipt Submitted - Under Review' : '⏳ Pending Submission'}</div>
                </div>
              </div>
              `}
            </div>

            ${!data.feesPaid && data.regFees > 0 && !data.isLeader === false ? `
            <div class="alert-box">
              <p><strong>⚠️ Payment Receipt Required:</strong></p>
              <p>Please ensure that you have uploaded your payment receipt. Your registration will be verified once our team reviews your payment.</p>
            </div>
            ` : ''}

            ${data.accommodationRequired ? `
            <!-- ACCOMMODATION DETAILS SECTION -->
            <div class="section">
              <div class="section-title">🏨 Accommodation Details</div>
              <div class="highlight-box">
                <h3>✅ Accommodation Booked</h3>
                <div class="info-grid" style="margin-top: 15px;">
                  <div class="info-row">
                    <div class="info-label">Number of Members:</div>
                    <div class="info-value" style="font-weight: 700; color: #b53da1;">${data.accommodationMembers || 0}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Accommodation Fees:</div>
                    <div class="info-value" style="font-weight: 700; color: #b53da1;">₹${data.accommodationFees || 0}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value" style="color: #f59e0b; font-weight: 600;">⏳ Pending Confirmation</div>
                  </div>
                </div>
                <p style="margin-top: 15px; color: #2a0a56; font-size: 13px;">
                  <strong>Note:</strong> Your accommodation request is being processed. You will receive further details about check-in procedures and room allocation once your registration is verified.
                </p>
              </div>
            </div>
            ` : ''}

            <div class="divider"></div>

            <!-- WHAT'S NEXT SECTION -->
            <div class="section">
              <div class="section-title">📌 What's Next?</div>
              <div class="info-grid">
                <div style="padding: 10px 0;">
                  ${isFreeBadge ? `
                  <p style="margin: 8px 0; color: #047857; font-weight: 600;">✅ You're all set! Your registration is complete.</p>
                  <p style="margin: 8px 0;">📅 Mark your calendar for ${escapeHtml(data.eventDateTime)}</p>
                  <p style="margin: 8px 0;">📍 Location: ${escapeHtml(data.eventLocation || 'TBA')}</p>
                  <p style="margin: 8px 0;">🎊 Get ready for an amazing experience at Pecfest 2025!</p>
                  ` : `
                  <p style="margin: 8px 0;">✅ Your registration has been submitted successfully</p>
                  <p style="margin: 8px 0;">⏳ Our admin team will verify your registration${data.feesPaid ? ' and payment receipt' : ''}</p>
                  <p style="margin: 8px 0;">📧 You'll receive an email notification once verified</p>
                  <p style="margin: 8px 0;">🎊 Once verified, you're all set for the event!</p>
                  `}
                </div>
              </div>
            </div>

            <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@pecfest.com" style="color: #ed6ab8; text-decoration: none; font-weight: 600;">support@pecfest.com</a></p>
            
            <p style="margin-top: 20px; font-size: 16px;">We look forward to seeing you at the event! 🎉</p>
            
            <p style="margin-top: 30px; color: #4b5563;">Best regards,<br><strong style="color: #b53da1; font-size: 15px;">Pecfest 2025 Event Management Team</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>🎪 PECFEST 2025 - Events Team</strong></p>
            <p style="margin: 10px 0; opacity: 0.9;">Punjab Engineering College's Premier Cultural & Technical Festival</p>
            <div class="divider" style="background: linear-gradient(90deg, transparent 0%, #fea6cc 50%, transparent 100%); margin: 15px auto; width: 80%;"></div>
            <p style="opacity: 0.8;">This is an automated confirmation email. Please do not reply to this email.</p>
            <p style="opacity: 0.8;">For support, contact us at <a href="mailto:support@pecfest.com" style="color: #fea6cc; text-decoration: none;">support@pecfest.com</a></p>
            <p style="margin-top: 15px; opacity: 0.7;">&copy; ${new Date().getFullYear()} Pecfest. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send registration confirmation email (when user first registers)
export const sendRegistrationConfirmationEmail = async (
  data: RegistrationConfirmationData
): Promise<boolean> => {
  try {
    const subject = `Registration Confirmed - ${data.eventName} | Pecfest 2025`;
    const html = generateRegistrationConfirmationTemplate(data);

    const emailOptions: EmailOptions = {
      to: data.userEmail,
      subject,
      html,
    };

    // Add receipt attachment for team leaders only
    if (data.isLeader && data.receiptUrl) {
      emailOptions.attachments = [
        {
          filename: 'payment-receipt.jpg',
          href: data.receiptUrl,
        },
      ];
    }

    return await sendEmail(emailOptions);
  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
    return false;
  }
};
