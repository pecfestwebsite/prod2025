import { NextRequest, NextResponse } from 'next/server';
import dbConnectRegistration from '@/lib/dbConnectRegistration';
import RegistrationForm from '@/models/GeminiForm';

// POST - Submit poster image
export async function POST(request: NextRequest) {
  try {
    await dbConnectRegistration();

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;
    const isFirstTime = formData.get('isFirstTime') === 'true';
    const posterFile = formData.get('posterImage') as File;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    if (!posterFile) {
      return NextResponse.json(
        { error: 'posterImage file is required' },
        { status: 400 }
      );
    }

    // Check if user already submitted
    const existing = await RegistrationForm.findOne({ userId });
    if (existing) {
      return NextResponse.json(
        { error: 'Registration form already submitted', alreadyExists: true },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await posterFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create new registration form entry
    const registrationForm = await RegistrationForm.create({
      userId,
      email,
      isFirstTime,
      posterImage: buffer,
      posterMimeType: posterFile.type,
      posterFilename: posterFile.name,
      posterTakenAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Poster uploaded successfully',
      formId: registrationForm._id,
    });
  } catch (error: any) {
    console.error('Error uploading poster:', error);
    return NextResponse.json(
      { error: 'Failed to upload poster', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Check if user has already submitted (returns boolean)
export async function GET(request: NextRequest) {
  try {
    await dbConnectRegistration();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    const query = userId ? { userId } : { email };
    const existing = await RegistrationForm.findOne(query);

    return NextResponse.json({
      hasSubmitted: !!existing,
      submittedAt: existing?.createdAt || null,
    });
  } catch (error: any) {
    console.error('Error checking registration form:', error);
    return NextResponse.json(
      { error: 'Failed to check registration form', details: error.message },
      { status: 500 }
    );
  }
}
