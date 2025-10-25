import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/adminUser';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const testAdmin = {
      email: 'admin@pecfest.com',
      userId: 'admin@pecfest.com',
      accesslevel: 3, // webmaster
      clubsoc: 'admin',
      verified: true,
      name: 'Test Admin',
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: testAdmin.email });
    if (existingAdmin) {
      // Update existing admin to be verified
      existingAdmin.verified = true;
      existingAdmin.name = testAdmin.name;
      await existingAdmin.save();
      return NextResponse.json({ 
        success: true, 
        message: 'Test admin updated',
        admin: existingAdmin 
      });
    }

    // Create new admin
    const admin = new Admin(testAdmin);
    await admin.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Test admin created',
      admin 
    });
  } catch (error) {
    console.error('Error creating test admin:', error);
    return NextResponse.json(
      { error: 'Failed to create test admin' },
      { status: 500 }
    );
  }
}
