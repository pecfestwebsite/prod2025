import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import bcrypt from "bcryptjs";
import { checkRateLimit, updateRateLimit } from '@/lib/rate-limit';
import dbConnect from '@/lib/dbConnect';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Check device-based rate limit
    const rateLimitCheck = checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    // Check for existing OTP
    const existingOTP = await OTP.findOne({ email: normalizedEmail });

    // Check cooldown period (60 seconds between attempts)
    if (existingOTP && existingOTP.createdAt) {
      const timeSinceLastAttempt = now.getTime() - existingOTP.createdAt.getTime();
      if (timeSinceLastAttempt < 60000) {
        const remainingCooldown = Math.ceil((60000 - timeSinceLastAttempt) / 1000);
        return NextResponse.json(
          { error: `Please wait ${remainingCooldown} seconds before requesting another OTP.` },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update or create OTP in database
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otp: hashedOtp,
        createdAt: now,
        expiresAt,
        attempts: 0,
        isAdmin: false,
      },
      { upsert: true, new: true }
    );

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
      subject: 'Your Portal Access Code - PECFEST 2025',
      html: `
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
        background: linear-gradient(135deg, #4321a9 0%, #b53da1 100%);
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
      
      .otp-box {
        background: linear-gradient(90deg, #2a0a56, #4321a9, #642aa5, #b53da1);
        color: white;
        font-size: 48px;
        font-weight: bold;
        text-align: center;
        letter-spacing: 12px;
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
    PFA Code ${otp}
    <div class="container">
      <div class="header">
        <h1>PECFEST 2025</h1>
        <p>Portal Access</p>
      </div>
      
      <div class="content">
        <h2>✨ Your Code Has Arrived ✨</h2>
        
        <p class="message">
          Greetings, traveler! Your portal access code is ready.
        </p>
        
        <div class="otp-box">
          ${otp}</div>
        
        <p class="message">
          <span class="highlight">This code expires in 10 minutes.</span><br>
          Enter this code to unlock your admin experience.
        </p>
        
        <div class="warning">
          If you didn't request this code, you can safely ignore this message.
        </div>
      </div>
      
      <div class="footer">
        <p>🏮 PECFEST 2025 - OTP 🏮</p>
        <p style="font-size: 12px; margin-top: 12px; color: #a5b4fc;">Protected by mystical enchantments</p>
      </div>
    </div>
  </body>
</html>
      `,
      text: `Your PECFEST 2025 login code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    // Create success response and update rate limit cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
    return updateRateLimit(response, request);
  } catch (error) {
    console.error('Error sending OTP:');
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}