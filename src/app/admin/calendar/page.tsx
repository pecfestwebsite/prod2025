import { Suspense } from 'react';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import CalendarClient from './CalendarClient';
export const dynamic = 'force-dynamic';
export interface IEvent {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  additionalClub?: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  endDateTime: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string;
  contactInfo: string;
  isTeamEvent: boolean;
  minTeamMembers: number;
  maxTeamMembers: number;
}

async function getEvents(): Promise<IEvent[]> {
  try {
    await dbConnect();
    
    const events = await Event.find({})
      .sort({ dateTime: 1 }) // Sort by start date/time ascending
      .lean() as any[];
    
    const mappedEvents: IEvent[] = [];
    
    for (const event of events) {
      try {
        // Handle both old (dateTime) and new (dateTime/endDateTime) formats
        const startDT = event.dateTime || event.dateTime;
        const endDT = event.endDateTime || event.dateTime;
        
        // Only include events that have proper datetime fields
        if (!startDT || !endDT) {
          console.warn('Skipping event without proper datetime fields:', event.eventId);
          continue;
        }

        mappedEvents.push({
          _id: event._id.toString(),
          eventId: event.eventId,
          category: event.category,
          societyName: event.societyName,
          additionalClub: event.additionalClub,
          eventName: event.eventName,
          regFees: event.regFees,
          dateTime: new Date(startDT).toISOString(),
          endDateTime: new Date(endDT).toISOString(),
          location: event.location,
          briefDescription: event.briefDescription,
          pdfLink: event.pdfLink,
          image: event.image,
          contactInfo: event.contactInfo,
          isTeamEvent: event.isTeamEvent,
          minTeamMembers: event.minTeamMembers,
          maxTeamMembers: event.maxTeamMembers,
        });
      } catch (mapError) {
        console.error('Error mapping event:', event.eventId, mapError);
        continue;
      }
    }
    
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
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
      <p className="mt-4 text-slate-300 font-semibold animate-pulse">Unveiling the celestial schedule...</p>
    </div>
  );
}

export default async function CalendarPage() {
  const events = await getEvents();

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
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl ">📅</span>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: "'Protest Guerrilla', sans-serif" }}>
              Celestial Calendar
            </h1>
            <span className="text-5xl filter brightness-0 invert">⭐</span>
          </div>
          <p className="mt-3 text-lg text-slate-300 font-medium italic">
            ✨ The Timeline of Enchanted Gatherings ✨
          </p>
          
          {/* Stats */}
          <div className="mt-6 inline-block bg-gradient-to-r from-purple-900/80 to-indigo-900/80 px-8 py-3 rounded-2xl border-2 border-purple-500/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl filter brightness-0 invert">🎪</span>
              <div>
                <p className="text-xs text-slate-300 font-semibold uppercase">Total Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingState />}>
          <CalendarClient events={events} />
        </Suspense>

        {/* Footer decoration */}
        <div className="mt-8 text-center">
          <p className="text-slate-400/70 text-sm italic">
            ✧ May the stars guide you to the perfect gathering ✧
          </p>
        </div>
      </div>
    </div>
  );
}