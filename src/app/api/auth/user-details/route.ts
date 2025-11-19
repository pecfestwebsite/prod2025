import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).lean() as IUser | null;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', user: null },
        { status: 404 }
      );
    }

    // Return user details
    return NextResponse.json(
      {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name || null,
          phoneNumber: user.phoneNumber || null,
          college: user.college || null,
          branch: user.branch || null,
          studentId: user.studentId || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
