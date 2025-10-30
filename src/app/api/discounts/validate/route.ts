import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Discount from '@/models/Discount';

/**
 * POST /api/discounts/validate
 * Validate discount code for a user and event
 * Checks if:
 * 1. Discount code exists
 * 2. User email matches
 * 3. Event ID matches
 * 4. Discount hasn't been used yet
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { discountCode, userEmail, eventId } = await req.json();

    console.log('POST /api/discounts/validate - Request:', {
      discountCode,
      userEmail,
      eventId,
    });

    // Validate input
    if (!discountCode || !userEmail || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: discountCode, userEmail, eventId' },
        { status: 400 }
      );
    }

    // Find discount
    const discount = await Discount.findOne({
      discountCode: discountCode.toUpperCase(),
      userEmail: userEmail.toLowerCase(),
      eventId: eventId,
    });

    console.log('Discount found:', discount ? {
      _id: discount._id,
      discountCode: discount.discountCode,
      discountAmount: discount.discountAmount,
      type: typeof discount.discountAmount,
      isUsed: discount.isUsed,
    } : 'Not found');

    if (!discount) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Invalid discount code for this email and event',
        },
        { status: 200 }
      );
    }

    // Check if already used
    if (discount.isUsed) {
      return NextResponse.json(
        {
          valid: false,
          message: 'This discount code has already been used',
        },
        { status: 200 }
      );
    }

    // Ensure discountAmount is a valid number (handle legacy discounts)
    const discountAmount = typeof discount.discountAmount === 'number' && !isNaN(discount.discountAmount) 
      ? discount.discountAmount 
      : 0;

    console.log('Returning discount with amount:', {
      discountCode: discount.discountCode,
      discountAmount,
      type: typeof discountAmount,
    });

    return NextResponse.json(
      {
        valid: true,
        message: 'Discount code is valid',
        discount: {
          _id: discount._id,
          discountCode: discount.discountCode,
          eventName: discount.eventName,
          discountAmount: discountAmount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error validating discount:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount' },
      { status: 500 }
    );
  }
}
