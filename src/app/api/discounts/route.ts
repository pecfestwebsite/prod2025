import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Discount from '@/models/Discount';
import Admin from '@/models/adminUser';
import User from '@/models/User';

/**
 * Generate a unique discount code (6 letters + 2 numbers)
 */
function generateDiscountCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  
  // Generate 6 random letters
  for (let i = 0; i < 6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 2 random numbers
  code += Math.floor(Math.random() * 10).toString();
  code += Math.floor(Math.random() * 10).toString();
  
  return code;
}

/**
 * Ensure unique discount code
 */
async function generateUniqueDiscountCode(): Promise<string> {
  let code = generateDiscountCode();
  let exists = await Discount.findOne({ discountCode: code });
  
  while (exists) {
    code = generateDiscountCode();
    exists = await Discount.findOne({ discountCode: code });
  }
  
  return code;
}

/**
 * GET /api/discounts
 * Fetch all discounts (with optional filters)
 * Only for Super Admin (2) and Webmaster (3)
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get auth token from headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get admin user
    const admin = await Admin.findById(decoded.adminId).lean() as any;
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 401 }
      );
    }

    // Check if user can manage discounts (access level 2 or 3)
    if (admin.accesslevel !== 2 && admin.accesslevel !== 3) {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Admin and Webmaster can view discounts' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const filter: any = {};

    if (searchParams.get('adminEmail')) {
      filter.adminEmail = searchParams.get('adminEmail');
    }

    if (searchParams.get('userEmail')) {
      filter.userEmail = searchParams.get('userEmail');
    }

    if (searchParams.get('eventId')) {
      filter.eventId = searchParams.get('eventId');
    }

    const discounts = await Discount.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Ensure all discount amounts are numbers (handle any legacy issues)
    const processedDiscounts = discounts.map(discount => ({
      ...discount,
      discountAmount: typeof discount.discountAmount === 'number' ? discount.discountAmount : 0,
    }));

    return NextResponse.json(
      { 
        success: true,
        discounts: processedDiscounts,
        total: processedDiscounts.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discounts
 * Create a new discount code
 * Only for Super Admin (2) and Webmaster (3)
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { userEmail, eventId, eventName, discountAmount } = await req.json();

    console.log('POST /api/discounts - Request data:', {
      userEmail,
      eventId,
      eventName,
      discountAmount,
      type: typeof discountAmount,
    });

    // Validate input
    if (!userEmail || !eventId || !eventName || discountAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, eventId, eventName, discountAmount' },
        { status: 400 }
      );
    }

    if (typeof discountAmount !== 'number' || discountAmount <= 0) {
      return NextResponse.json(
        { error: 'Discount amount must be a positive number' },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get admin user
    const admin = await Admin.findById(decoded.adminId).lean() as any;
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 401 }
      );
    }

    // Check if user can manage discounts (access level 2 or 3)
    if (admin.accesslevel !== 2 && admin.accesslevel !== 3) {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Admin and Webmaster can create discounts' },
        { status: 403 }
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email: userEmail.toLowerCase() });
    if (!userExists) {
      return NextResponse.json(
        { error: 'User with this email does not exist' },
        { status: 404 }
      );
    }

    // Generate unique discount code
    const discountCode = await generateUniqueDiscountCode();

    // Create discount
    const discount = new Discount({
      discountCode,
      adminEmail: admin.email.toLowerCase(),
      userEmail: userEmail.toLowerCase(),
      eventId,
      eventName,
      discountAmount: Number(discountAmount), // Ensure it's explicitly a number
      isUsed: false,
    });

    console.log('Creating discount with data:', {
      discountCode,
      adminEmail: admin.email.toLowerCase(),
      userEmail: userEmail.toLowerCase(),
      eventId,
      eventName,
      discountAmount,
      type: typeof discountAmount,
    });

    console.log('Discount object before save:', {
      discountCode: discount.discountCode,
      discountAmount: discount.discountAmount,
      discountAmountType: typeof discount.discountAmount,
      discountKeys: Object.keys(discount.toObject ? discount.toObject() : discount),
    });

    await discount.save();

    // Query it back from the database immediately
    const refreshedDiscount = await Discount.findById(discount._id);

    console.log('Discount after save (refreshed from DB):', {
      _id: refreshedDiscount?._id,
      discountCode: refreshedDiscount?.discountCode,
      discountAmount: refreshedDiscount?.discountAmount,
      type: typeof refreshedDiscount?.discountAmount,
      allFields: refreshedDiscount ? JSON.parse(JSON.stringify(refreshedDiscount)) : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Discount code created successfully',
        discount: {
          _id: refreshedDiscount?._id,
          discountCode: refreshedDiscount?.discountCode,
          userEmail: refreshedDiscount?.userEmail,
          eventName: refreshedDiscount?.eventName,
          discountAmount: refreshedDiscount?.discountAmount,
          createdAt: refreshedDiscount?.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}
