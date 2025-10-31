import { Suspense } from 'react';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import RegistrationsClient from './RegistrationsClient';

export const dynamic = 'force-dynamic';

interface RegistrationWithEvent {
  _id: string;
  eventId: string;
  eventName: string;
  societyName: string;
  userId: string;
  teamId: string;
  verified: boolean;
  feesPaid: string;
  dateTime: string;
  createdAt: string;
  discount?: number;
  accommodationMembers?: number;
  totalFees?: number;
}

async function getRegistrations(): Promise<RegistrationWithEvent[]> {
  try {
    await dbConnect();

    // Fetch all registrations with their related event data
    const registrations = await Registration.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Get all unique event IDs
    const eventIds = [...new Set(registrations.map((reg: any) => reg.eventId))];

    // Fetch all events
    const events = await Event.find({ eventId: { $in: eventIds } }).lean();

    // Create a map of eventId to event data for quick lookup
    const eventMap = new Map(events.map((event: any) => [event.eventId, { eventName: event.eventName, societyName: event.societyName }]));

    // Combine registration data with event names and society names
    return registrations.map((reg: any) => {
      const eventData = eventMap.get(reg.eventId) || { eventName: 'Unknown Event', societyName: 'Unknown Society' };
      return {
        _id: reg._id.toString(),
        eventId: reg.eventId,
        eventName: eventData.eventName,
        societyName: eventData.societyName,
        userId: reg.userId,
        teamId: reg.teamId || '',
        verified: reg.verified,
        feesPaid: reg.feesPaid,
        dateTime: reg.dateTime.toISOString(),
        createdAt: reg.createdAt.toISOString(),
        discount: reg.discount || 0,
        accommodationMembers: reg.accommodationMembers || 0,
        totalFees: reg.totalFees || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl filter brightness-0 invert">🌙</span>
        </div>
      </div>
      <p className="mt-4 text-slate-300 font-semibold animate-pulse">Unveiling the mystical scrolls...</p>
    </div>
  );
}

export default async function RegistrationsPage() {
  const registrations = await getRegistrations();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#140655' }}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-white text-xl animate-pulse filter brightness-0 invert">✦</div>
        <div className="absolute top-40 right-20 text-white text-2xl animate-pulse delay-100 filter brightness-0 invert">✧</div>
        <div className="absolute bottom-32 left-32 text-white text-lg animate-pulse delay-200 filter brightness-0 invert">✦</div>
        <div className="absolute top-60 right-40 text-white text-xl animate-pulse delay-300 filter brightness-0 invert">✧</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 flex-wrap">
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">🌙</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Tales of Registration
            </h1>
            <span className="text-4xl sm:text-5xl filter brightness-0 invert">⭐</span>
          </div>
          <p className="mt-3 text-lg text-slate-300 font-medium italic">
            ✨ Chronicles of the Event Seekers ✨
          </p>

          {/* Stats Cards */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">📜</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Total Scrolls
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {registrations.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900 to-green-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">✓</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Blessed
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {registrations.filter((r) => r.verified).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900 to-amber-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl filter brightness-0 invert">⏳</span>
                <div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold uppercase tracking-wider">
                    Awaiting
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {registrations.filter((r) => !r.verified).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          {/* Ornamental top border */}
          <div className="h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>

          <div className="p-2 sm:p-6">
            <Suspense fallback={<LoadingState />}>
              <RegistrationsClient registrations={registrations} />
            </Suspense>
          </div>

          {/* Ornamental bottom border */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
        </div>

        {/* Footer decoration */}
        <div className="mt-8 text-center">
          <p className="text-slate-400/70 text-sm italic">
            ✧ May your journey through these records be enlightening ✧
          </p>
        </div>
      </div>
    </div>
  );
}
