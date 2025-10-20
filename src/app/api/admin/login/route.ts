import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Admin, { IAdmin } from '@/models/adminUser';

// Generate simple token without external library
function generateToken(adminId: string, email: string): string {
  const payload = {
    adminId,
    email,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  // Simple token encoding (for production, use a proper JWT library)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if admin exists in MongoDB with this email
    const admin = (await Admin.findOne({ email: email.trim() }).lean()) as IAdmin | null;

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found with this email' },
        { status: 404 }
      );
    }

    // Generate token
    const adminId = (admin as any)._id?.toString() || '';
    const token = generateToken(adminId, admin.email);

    return NextResponse.json(
      {
        success: true,
        token,
        admin: {
          id: adminId,
          userId: admin.userId,
          email: admin.email,
          name: admin.name,
          accesslevel: admin.accesslevel,
          clubsoc: admin.clubsoc,
          verified: admin.verified,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
