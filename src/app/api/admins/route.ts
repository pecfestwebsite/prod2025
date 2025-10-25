import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/adminUser';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields (name is optional)
    const requiredFields = ['email', 'userId', 'accesslevel', 'clubsoc'];
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Prepare the admin data
    const adminData = {
      email: body.email.trim(),
      userId: body.userId.trim(),
      accesslevel: body.accesslevel,
      clubsoc: body.clubsoc.trim(),
      name: body.name ? body.name.trim() : 'Admin',
      verified: body.verified !== undefined ? body.verified : false,
      dateTime: body.dateTime ? new Date(body.dateTime) : new Date(),
    };
    
    // Create the admin
    const newAdmin = await Admin.create(adminData);
    
    return NextResponse.json(
      {
        message: 'Admin created successfully',
        admin: newAdmin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Handle duplicate key errors
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'An admin with this email or userId already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const accesslevel = searchParams.get('accesslevel');
    const verified = searchParams.get('verified');
    const clubsoc = searchParams.get('clubsoc');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (accesslevel !== null) {
      query.accesslevel = parseInt(accesslevel);
    }
    
    if (verified !== null) {
      query.verified = verified === 'true';
    }
    
    if (clubsoc) {
      query.clubsoc = clubsoc;
    }
    
    const skip = (page - 1) * limit;
    
    // Fetch admins with pagination
    const admins = await Admin.find(query)
      .sort({ accesslevel: -1, dateTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Admin.countDocuments(query);
    
    return NextResponse.json(
      {
        admins,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}