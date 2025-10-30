import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Discount from '@/models/Discount';
import Admin from '@/models/adminUser';

/**
 * DELETE /api/discounts/[id]
 * Delete a discount code
 * Only for Super Admin (2) and Webmaster (3)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

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
        { error: 'Forbidden: Only Super Admin and Webmaster can delete discounts' },
        { status: 403 }
      );
    }

    // Delete discount
    const discount = await Discount.findByIdAndDelete(id);

    if (!discount) {
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Discount deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}
