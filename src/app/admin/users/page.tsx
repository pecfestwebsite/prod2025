import { Suspense } from 'react';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import User from '@/models/User';
import Event from '@/models/Event';
import UsersClient from './UsersClient';

interface UserWithRegistrations {
  _id: string;
  userId: string;
  email: string;
  name?: string;
  college?: string;
  studentId?: string;
  phoneNumber?: string;
  branch?: string;
  registrations: {
    eventId: string;
    eventName: string;
    societyName: string;
    additionalClub?: string;
    verified: boolean;
    dateTime: string;
    teamId: string;
  }[];
  createdAt: string;
}

async function getUsersWithRegistrations(): Promise<UserWithRegistrations[]> {
  try {
    await dbConnect();

    // Fetch all users
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    // Fetch all registrations
    const registrations = await Registration.find({}).lean();

    // Get all unique event IDs
    const eventIds = [...new Set(registrations.map((reg: any) => reg.eventId))];

    // Fetch all events
    const events = await Event.find({ eventId: { $in: eventIds } }).lean();

    // Create a map of eventId to event data for quick lookup
    const eventMap = new Map(
      events.map((event: any) => [
        event.eventId,
        { eventName: event.eventName, societyName: event.societyName, additionalClub: event.additionalClub },
      ])
    );

    // Create a map of userId to their registrations
    const userRegistrationsMap = new Map<string, any[]>();
    registrations.forEach((reg: any) => {
      // reg.userId contains the email, so we match by email
      if (!userRegistrationsMap.has(reg.userId)) {
        userRegistrationsMap.set(reg.userId, []);
      }

      const eventData = eventMap.get(reg.eventId) || {
        eventName: 'Unknown Event',
        societyName: 'Unknown Society',
        additionalClub: undefined,
      };
      userRegistrationsMap.get(reg.userId)!.push({
        eventId: reg.eventId,
        eventName: eventData.eventName,
        societyName: eventData.societyName,
        additionalClub: eventData.additionalClub,
        verified: reg.verified,
        dateTime: reg.dateTime.toISOString(),
        teamId: reg.teamId || '',
      });
    });

    // Combine user data with their registrations
    return users.map((user: any) => ({
      _id: user._id?.toString() || '',
      userId: user.userId || '',
      email: user.email || '',
      name: user.name || undefined,
      college: user.college || undefined,
      studentId: user.studentId || undefined,
      phoneNumber: user.phoneNumber || undefined,
      branch: user.branch || undefined,
      registrations: userRegistrationsMap.get(user.email) || [],
      createdAt: user.createdAt ? (user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date(user.createdAt).toISOString()) : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching users with registrations:', error);
    return [];
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl filter brightness-0 invert">👥</span>
        </div>
      </div>
      <p className="mt-4 text-slate-300 font-semibold animate-pulse">Gathering user chronicles...</p>
    </div>
  );
}

export default async function UsersPage() {
  const usersData = await getUsersWithRegistrations();

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-white text-lg md:text-xl animate-pulse filter brightness-0 invert">✦</div>
        <div className="absolute top-40 right-20 text-white text-xl md:text-2xl animate-pulse delay-100 filter brightness-0 invert">✧</div>
        <div className="absolute bottom-32 left-32 text-white text-base md:text-lg animate-pulse delay-200 filter brightness-0 invert">✦</div>
        <div className="absolute top-60 right-40 text-white text-lg md:text-xl animate-pulse delay-300 filter brightness-0 invert">✧</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-3 md:mb-4 flex-wrap">
            <span className="text-3xl md:text-4xl lg:text-5xl filter brightness-0 invert">👥</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Tales of Users
            </h1>
            <span className="text-3xl md:text-4xl lg:text-5xl filter brightness-0 invert">✨</span>
          </div>
          <p className="mt-2 md:mt-3 text-base md:text-lg text-slate-300 font-medium italic px-2">
            ✨ Chronicle of Festival Seekers & Their Events ✨
          </p>

          {/* Stats Cards */}
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 md:gap-6 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl lg:text-3xl filter brightness-0 invert">👤</span>
                <div>
                  <div className="text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Users
                  </div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                    {usersData.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 to-green-900 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl lg:text-3xl filter brightness-0 invert">🎭</span>
                <div>
                  <div className="text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Events
                  </div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                    {new Set(usersData.flatMap(u => u.registrations.map(r => r.eventId))).size}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900 to-amber-900 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl lg:text-3xl filter brightness-0 invert">📜</span>
                <div>
                  <div className="text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Registrations
                  </div>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mt-1">
                    {usersData.reduce((sum, u) => sum + u.registrations.length, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-900/50 rounded-2xl md:rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          {/* Ornamental top border */}
          <div className="h-1 md:h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>

          <div className="p-3 sm:p-4 md:p-6">
            <Suspense fallback={<LoadingState />}>
              <UsersClient users={usersData} />
            </Suspense>
          </div>

          {/* Ornamental bottom border */}
          <div className="h-1 md:h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
        </div>

        {/* Footer decoration */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-slate-400/70 text-xs md:text-sm italic px-2">
            ✧ May your journey through these chronicles be enlightening ✧
          </p>
        </div>
      </div>
    </div>
  );
}
