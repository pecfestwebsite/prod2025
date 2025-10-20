import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';
import { otpStore } from '@/lib/session-store';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), { otp, expiresAt });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Arabian Nights themed email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🌙 Your Portal Access Code - PECFEST 2025',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              color: #ffd700;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 18px;
              opacity: 0.9;
            }
            .content {
              padding: 40px;
              text-align: center;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffd700;
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 10px;
              padding: 30px;
              border-radius: 15px;
              margin: 30px 0;
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
            }
            .message {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .lantern {
              font-size: 40px;
              display: inline-block;
              animation: swing 3s ease-in-out infinite;
            }
            @keyframes swing {
              0%, 100% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="lantern">🏮</div>
              <h1>PECFEST 2025</h1>
              <p>Arabian Nights</p>
            </div>
            <div class="content">
              <h2 style="color: #764ba2; margin-top: 0;">✨ Your  Code Has Arrived ✨</h2>
              <p class="message">
                Greetings, traveler! Your portal access code is ready.
              </p>
              <div class="otp-box">
                ${otp}
              </div>
              <p class="message">
                <strong>This code expires in 10 minutes.</strong><br>
                Enter this code to unlock your  experience.
              </p>
              <p class="message" style="color: #999; font-size: 14px;">
                If you didn't request this code, you can safely ignore this message.
              </p>
            </div>
            <div class="footer">
              <p>🌙 PECFEST 2025 - OTP 🌙</p>
              <p>May your journey be filled with wonder</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your PECFEST 2025 login code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}