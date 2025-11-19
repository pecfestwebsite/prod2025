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

  return ( <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: '#2D1845' }}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-800 rounded-full blur-3xl"></div>
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
        <style>{`
          @font-face {
            font-family: 'Arabic';
            src: url('/arabic.otf') format('opentype');
            font-display: swap;
          }
          .font-arabic { font-family: 'Arabic', serif; }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            animation: gradient 4s ease infinite;
          }
        `}</style>

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