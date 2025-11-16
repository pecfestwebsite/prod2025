import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import User from '@/models/User';

/**
 * Get detailed registrations with team member information
 * This endpoint fetches all registrations for a user and includes:
 * - Full team member details (emails, verification status, payment status)
 * - Accurate team member counts per event
 * - Team leader identification
 * 
 * Requires JWT token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    let token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      token = request.cookies.get('adminToken')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided. Please login first.' },
        { status: 401 }
      );
    }

    const userSecret = process.env.JWT_USER_SECRET || 'your-user-secret-key-change-in-production';
    const adminSecret = process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';

    let decoded;
    let isAdmin = false;

    // Try to verify with admin secret first
    try {
      decoded = jwt.verify(token, adminSecret) as {
        adminId?: string;
        userId?: string;
        email: string;
        iat?: number;
        exp?: number;
      };
      isAdmin = true;
    } catch (adminError) {
      // If admin secret fails, try user secret
      try {
        decoded = jwt.verify(token, userSecret) as {
          userId: string;
          email: string;
          iat?: number;
          exp?: number;
        };
        isAdmin = false;
      } catch (userError) {
        if (adminError instanceof jwt.TokenExpiredError || userError instanceof jwt.TokenExpiredError) {
          return NextResponse.json(
            { error: 'Token expired. Please login again.' },
            { status: 401 }
          );
        } else {
          return NextResponse.json(
            { error: 'Invalid token. Please login again.' },
            { status: 401 }
          );
        }
      }
    }

    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query: any = {};

    // Security check - regular users can only see their own registrations
    if (!isAdmin) {
      if (userId && userId !== decoded.userId && userId !== decoded.email) {
        return NextResponse.json(
          { error: 'Cannot view other user\'s registrations' },
          { status: 403 }
        );
      }
      query.userId = userId || decoded.email;
    } else {
      // Admin can filter by userId if provided
      if (userId) {
        query.userId = userId;
      }
    }

    // Fetch user's registrations
    const userRegistrations = await Registration.find(query)
      .sort({ dateTime: -1 })
      .limit(limit)
      .lean();

    // Get all unique event IDs to fetch event details
    const eventIds = [...new Set(userRegistrations.map((reg: any) => reg.eventId))];
    const events = await Event.find({ eventId: { $in: eventIds } }).lean();
    const eventMap = new Map(events.map((event: any) => [
      event.eventId, 
      { 
        eventName: event.eventName, 
        societyName: event.societyName, 
        regFees: event.regFees, 
        category: event.category 
      }
    ]));

    // Get unique (eventId, teamId) combinations for team events
    const teamEventCombos = userRegistrations
      .filter((reg: any) => reg.teamId)
      .map((reg: any) => ({ eventId: reg.eventId, teamId: reg.teamId }));

    // Fetch team members for each (eventId, teamId) combination
    const teamMembersMap = new Map<string, any[]>();
    
    for (const combo of teamEventCombos) {
      const key = `${combo.eventId}_${combo.teamId}`;
      
      // Fetch all registrations for this specific event and team
      const teamRegs = await Registration.find({
        eventId: combo.eventId,
        teamId: combo.teamId
      }).lean();

      // Get user details for all team members
      const memberUserIds = teamRegs.map((reg: any) => reg.userId);
      const memberUsers = await User.find({ 
        email: { $in: memberUserIds } 
      }).select('email name phoneNumber').lean();
      
      const memberUserMap = new Map(memberUsers.map((user: any) => [
        user.email, 
        { name: user.name, phoneNumber: user.phoneNumber }
      ]));

      // Enrich team registrations with user details
      const enrichedTeamMembers = teamRegs.map((reg: any) => {
        const userDetails = memberUserMap.get(reg.userId) || { name: '', phoneNumber: '' };
        return {
          userId: reg.userId,
          name: userDetails.name || 'Unknown',
          phoneNumber: userDetails.phoneNumber || 'N/A',
          feesPaid: reg.feesPaid || '',
          verified: reg.verified || false,
          dateTime: reg.dateTime,
          isLeader: !!(reg.feesPaid && reg.feesPaid !== '' && reg.feesPaid !== '0')
        };
      });

      teamMembersMap.set(key, enrichedTeamMembers);
    }

    // Enrich registrations with event details and team information
    const detailedRegistrations = userRegistrations.map((reg: any) => {
      const eventData = eventMap.get(reg.eventId) || { 
        eventName: 'Unknown Event', 
        societyName: 'Unknown Society', 
        regFees: 0, 
        category: 'convenor' 
      };

      const hasTeam = !!reg.teamId;
      const isTeamLeader = hasTeam && reg.feesPaid && reg.feesPaid !== '' && reg.feesPaid !== '0';
      
      let teamDetails = null;
      if (hasTeam) {
        const key = `${reg.eventId}_${reg.teamId}`;
        const teamMembers = teamMembersMap.get(key) || [];
        
        teamDetails = {
          teamId: reg.teamId,
          totalMembers: teamMembers.length,
          members: teamMembers,
          isLeader: isTeamLeader
        };
      }

      return {
        _id: reg._id,
        eventId: reg.eventId,
        eventName: eventData.eventName,
        societyName: eventData.societyName,
        regFees: eventData.regFees,
        category: eventData.category,
        userId: reg.userId,
        verified: reg.verified,
        feesPaid: reg.feesPaid,
        dateTime: reg.dateTime,
        accommodationRequired: reg.accommodationRequired,
        totalFees: reg.totalFees,
        team: teamDetails
      };
    });

    return NextResponse.json(
      {
        registrations: detailedRegistrations,
        total: detailedRegistrations.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching detailed registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
