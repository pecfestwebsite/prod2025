'use client';

import { useState, useMemo, useEffect } from 'react';
import { getAdminUser, filterEventsByAccessLevel } from '@/lib/accessControl';

interface IEvent {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string;
  contactInfo: string;
  team: number;
  teamLimit: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

type ViewMode = 'week' | 'day';

export default function CalendarClient({ events }: { events: IEvent[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
    const filtered = filterEventsByAccessLevel(events, admin);
    setFilteredEvents(filtered);
  }, [events]);

  // Helper function to get local date key (YYYY-MM-DD)
  const getLocalDateKey = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: IEvent[] } = {};
    
    filteredEvents.forEach(event => {
      const dateKey = getLocalDateKey(event.dateTime);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each day by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
    });

    return grouped;
  }, [filteredEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  // Get week days
  const getWeekDays = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  // Get category icon and color
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'technical':
        return { icon: '⚙', bg: 'from-blue-900/80 to-cyan-900/80', border: 'border-blue-400/50', text: 'text-blue-300' };
      case 'cultural':
        return { icon: '🎭', bg: 'from-pink-900/80 to-rose-900/80', border: 'border-pink-400/50', text: 'text-pink-300' };
      case 'convenor':
        return { icon: '👑', bg: 'from-purple-900/80 to-indigo-900/80', border: 'border-purple-400/50', text: 'text-purple-300' };
      default:
        return { icon: '✨', bg: 'from-gray-900/80 to-slate-900/80', border: 'border-gray-400/50', text: 'text-gray-300' };
    }
  };

  // Navigate week
  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  // Navigate day
  const navigateDay = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Selector & Navigation */}
      <div className="bg-slate-900/50 rounded-2xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* View Mode Buttons */}
          <div className="flex gap-2">
            {(['day', 'week'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 capitalize ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-500/50'
                    : 'bg-slate-800/50 text-slate-300 border-2 border-slate-700/30 hover:border-purple-500/30'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => viewMode === 'day' ? navigateDay(-1) : navigateWeek(-1)}
              className="p-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700/50 transition-all border-2 border-slate-700/30 hover:border-purple-500/30"
            >
              ← Prev
            </button>
            <div className="text-white font-bold text-lg">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => viewMode === 'day' ? navigateDay(1) : navigateWeek(1)}
              className="p-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700/50 transition-all border-2 border-slate-700/30 hover:border-purple-500/30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {viewMode === 'week' && (
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {getWeekDays.map((day, index) => {
                const year = day.getFullYear();
                const month = String(day.getMonth() + 1).padStart(2, '0');
                const dayNum = String(day.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${dayNum}`;
                const dayEvents = eventsByDate[dateKey] || [];
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-900/50 to-magenta-900/50 border-purple-400 shadow-lg shadow-purple-500/30'
                        : isToday
                        ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-purple-500/50'
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className="text-xs text-slate-400 font-semibold uppercase">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                        {day.getDate()}
                      </div>
                    </div>

                    {dayEvents.length > 0 ? (
                      <div className="space-y-2">
                        {dayEvents.slice(0, 2).map(event => {
                          const style = getCategoryStyle(event.category);
                          return (
                            <div
                              key={event._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={`cursor-pointer p-2 rounded-lg bg-gradient-to-r ${style.bg} border ${style.border} text-xs hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]`}
                            >
                              <div className="flex items-start gap-1">
                                <span className="text-sm filter brightness-0 invert">{style.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-semibold truncate">
                                    {event.eventName}
                                  </div>
                                  <div className="text-slate-300 text-xs">
                                    {new Date(event.dateTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(day);
                              setViewMode('day');
                            }}
                            className="text-center text-slate-300 text-xs font-semibold py-1 cursor-pointer hover:text-white transition-colors"
                          >
                            ... {dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 text-xs italic">
                        No events
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl backdrop-blur-md border-2 border-slate-400/25 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric' 
              })}
            </h2>

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDateEvents.map(event => {
                  const style = getCategoryStyle(event.category);
                  return (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className={`cursor-pointer bg-gradient-to-r ${style.bg} border-2 ${style.border} rounded-2xl p-5 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl filter brightness-0 invert">{style.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {event.eventName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${style.text} bg-black/30`}>
                              {event.category}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="filter brightness-0 invert">🏢</span>
                              <span>{event.societyName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="filter brightness-0 invert">⏰</span>
                              <span>
                                {new Date(event.dateTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="filter brightness-0 invert">📍</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <span className="filter brightness-0 invert">💰</span>
                              <span>₹{event.regFees}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block filter brightness-0 invert">🌙</span>
                <p className="text-white text-lg font-semibold">A day of rest...</p>
                <p className="text-slate-400 text-sm mt-2">No events scheduled for this day.</p>
              </div>
            )}
          </div>

          <div className="h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 pt-24 sm:pt-20"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-slate-900/50 rounded-3xl border-2 border-purple-500 max-w-2xl w-full max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-gradient-to-r from-slate-300 via-orange-300 to-slate-300"></div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-5xl filter brightness-0 invert">{getCategoryStyle(selectedEvent.category).icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedEvent.eventName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryStyle(selectedEvent.category).text} bg-black/30`}>
                        {selectedEvent.category}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:text-slate-300 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">🏢</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Society</div>
                    <div className="text-lg">{selectedEvent.societyName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">📅</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Date & Time</div>
                    <div className="text-lg">
                      {new Date(selectedEvent.dateTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(selectedEvent.dateTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">📍</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Location</div>
                    <div className="text-lg">{selectedEvent.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">💰</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Registration Fee</div>
                    <div className="text-lg">₹{selectedEvent.regFees}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">👥</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Team Info</div>
                    <div className="text-lg">{selectedEvent.team}/{selectedEvent.teamLimit} teams registered</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl filter brightness-0 invert">📝</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase mb-1">Description</div>
                    <div className="text-sm leading-relaxed">{selectedEvent.briefDescription}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl filter brightness-0 invert">📞</span>
                  <div>
                    <div className="text-xs text-slate-400 uppercase">Contact</div>
                    <div className="text-lg">{selectedEvent.contactInfo}</div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={selectedEvent.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-magenta-500 transition-all duration-300 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 border-2 border-purple-500/30"
                  >
                    <span className="filter brightness-0 invert">📄</span>
                    <span>View Details PDF</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-purple-500 via-magenta-500 to-purple-500"></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}