'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAdminUser, filterEventsByAccessLevel } from '@/lib/accessControl';

interface IEvent {
  _id: string;
  eventId: string;
  category: 'technical' | 'cultural' | 'convenor';
  societyName: string;
  additionalClub?: string;
  eventName: string;
  regFees: number;
  dateTime: string;
  location: string;
  briefDescription: string;
  pdfLink: string;
  image: string;
  contactInfo: string;
  isTeamEvent: boolean;
  minTeamMembers: number;
  maxTeamMembers: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  accesslevel: number;
  clubsoc: string;
  verified: boolean;
}

export default function CalendarClient({ events }: { events: IEvent[] }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [sortVenues, setSortVenues] = useState(true); // Default to sorted
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'venue' | 'event'>('all');

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
    const filtered = filterEventsByAccessLevel(events, admin);
    setFilteredEvents(filtered);
  }, [events]);

  // Close any open dropdowns when modal opens
  useEffect(() => {
    if (selectedEvent) {
      // Dispatch event to close navbar dropdown
      window.dispatchEvent(new Event('closeDropdown'));
    }
  }, [selectedEvent]);

  // Get week days (Monday to Sunday)
  const getWeekDays = useMemo(() => {
    const start = new Date(selectedDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    start.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  // Filter events based on search query
  const getSearchFilteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return filteredEvents;
    
    const query = searchQuery.toLowerCase();
    return filteredEvents.filter(event => {
      if (searchType === 'venue') {
        return event.location.toLowerCase().includes(query);
      } else if (searchType === 'event') {
        return event.eventName.toLowerCase().includes(query);
      } else {
        // Search both
        return event.location.toLowerCase().includes(query) || 
               event.eventName.toLowerCase().includes(query);
      }
    });
  }, [filteredEvents, searchQuery, searchType]);

  // Get all unique venues from search-filtered events
  const getAllVenues = useMemo(() => {
    const venues = new Set<string>();
    getSearchFilteredEvents.forEach(event => venues.add(event.location));
    const venuesArray = Array.from(venues);
    return sortVenues ? venuesArray.sort() : venuesArray;
  }, [getSearchFilteredEvents, sortVenues]);

  // Get hour slots (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get events for a specific day, venue, and hour
  const getEventsForSlot = (dayDate: Date, venue: string, hour: number): IEvent[] => {
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const date = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${date}`;

    return getSearchFilteredEvents.filter(event => {
      const eventDate = new Date(event.dateTime);
      const eventYear = eventDate.getFullYear();
      const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
      const eventDate_num = String(eventDate.getDate()).padStart(2, '0');
      const eventDateKey = `${eventYear}-${eventMonth}-${eventDate_num}`;

      const eventHour = eventDate.getHours();
      return eventDateKey === dateKey && venue === event.location && eventHour === hour;
    });
  };

  // Navigate week
  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-600/80 border-blue-400';
      case 'cultural':
        return 'bg-pink-600/80 border-pink-400';
      case 'convenor':
        return 'bg-purple-600/80 border-purple-400';
      default:
        return 'bg-slate-600/80 border-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '⚙️';
      case 'cultural':
        return '🎭';
      case 'convenor':
        return '👑';
      default:
        return '✨';
    }
  };

  // Drag and drop handlers for horizontal scroll
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setIsDragging(true);
    setDragStart(e.pageX - element.offsetLeft);
    setScrollLeft(element.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const element = e.currentTarget;
    const x = e.pageX - element.offsetLeft;
    const walk = (x - dragStart) * 1.5; // Multiplier for scroll speed
    element.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Week Navigation */}
      <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 p-3 md:p-4">
        {/* Month and Year Display */}
        <div className="text-center mb-3">
          <div className="text-xs text-slate-400 uppercase font-semibold">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700/50 transition-all border border-slate-700/30 hover:border-purple-500/50 flex-shrink-0"
          >
            <ChevronLeft size={18} className="md:w-5 md:h-5" />
          </button>

          {/* Compact Week View - Scrollable on mobile, centered on desktop */}
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 justify-center md:justify-center">
            {getWeekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-semibold whitespace-nowrap transition-all border text-xs md:text-sm flex-shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                      : isToday
                      ? 'bg-slate-800/80 text-white border-purple-500/50 shadow-md shadow-purple-500/20'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-xs text-slate-400 uppercase hidden md:block">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-base md:text-lg font-bold">{day.getDate()}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="p-2 bg-slate-800/50 text-white rounded-lg hover:bg-slate-700/50 transition-all border border-slate-700/30 hover:border-purple-500/50 flex-shrink-0"
          >
            <ChevronRight size={18} className="md:w-5 md:h-5" />
          </button>
        </div>

        {/* Sort Venues Option */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sortVenues}
              onChange={(e) => setSortVenues(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-purple-600"
            />
            <span className="text-xs md:text-sm text-slate-300 font-semibold">Sort Venues Alphabetically</span>
          </label>
        </div>

        {/* Search Bar */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-col md:flex-row items-stretch md:items-center md:justify-center">
            <div className="flex gap-2 flex-1 md:flex-initial">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'all' | 'venue' | 'event')}
                className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-xs md:text-sm font-semibold hover:border-purple-500/50 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All</option>
                <option value="venue">Venue</option>
                <option value="event">Event</option>
              </select>
              
              <input
                type="text"
                placeholder={searchType === 'venue' ? 'Search venues...' : searchType === 'event' ? 'Search events...' : 'Search venues or events...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-xs md:text-sm placeholder-slate-400 hover:border-purple-500/50 focus:outline-none focus:border-purple-500 transition-all"
              />
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-lg hover:text-white hover:border-purple-500/50 transition-all text-sm font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <div className="text-xs md:text-sm text-slate-400 text-center">
              Found {getSearchFilteredEvents.length} event{getSearchFilteredEvents.length !== 1 ? 's' : ''} matching your search
            </div>
          )}
        </div>
      </div>

      {/* Calendar Table */}
      <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 overflow-hidden">
        <style>{`
          .calendar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .calendar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div 
          className="overflow-x-auto calendar-scroll select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <table className="w-full border-collapse">
            {/* Header with Time Slots */}
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="bg-slate-900 border-r border-slate-700/50 p-3 text-left text-white font-semibold w-32 sticky left-0 z-10">
                  Venue
                </th>
                {hours.map(hour => (
                  <th
                    key={hour}
                    className="bg-slate-900/80 border-r border-slate-700/50 p-2 text-center text-white font-semibold text-xs min-w-[100px]"
                  >
                    {String(hour).padStart(2, '0')}:00 - {String((hour + 1) % 24).padStart(2, '0')}:00
                  </th>
                ))}
              </tr>
            </thead>

            {/* Venue Rows */}
            <tbody>
              {getAllVenues.map((venue, venueIndex) => (
                <tr
                  key={venue}
                  className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${
                    venueIndex % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'
                  }`}
                >
                  {/* Venue Name */}
                  <td className="bg-slate-900 border-r border-slate-700/50 p-3 text-white font-semibold sticky left-0 z-10 text-sm">
                    {venue}
                  </td>

                  {/* Time Slots */}
                  {hours.map(hour => {
                    const slotEvents = getEventsForSlot(selectedDate, venue, hour);

                    return (
                      <td
                        key={`${venue}-${hour}`}
                        className="border-r border-slate-700/50 p-1 min-w-[100px] align-top bg-slate-900/20 hover:bg-slate-800/40 transition-colors"
                      >
                        {slotEvents.length > 0 && (
                          <div className="space-y-1">
                            {slotEvents.map(event => (
                              <button
                                key={event._id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full p-2 rounded text-xs text-white font-semibold cursor-pointer transition-all hover:shadow-lg hover:scale-105 border border-opacity-50 ${getCategoryColor(
                                  event.category
                                )}`}
                                title={event.eventName}
                              >
                                <div className="truncate">
                                  {getCategoryIcon(event.category)} {event.eventName}
                                </div>
                                <div className="text-xs opacity-75">
                                  {new Date(event.dateTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 pt-24"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-slate-900/95 rounded-2xl border-2 border-purple-500/50 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800/90 border-b border-purple-500/30 p-6 flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-4xl">
                  {getCategoryIcon(selectedEvent.category)}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedEvent.eventName}
                  </h2>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase text-white ${
                    selectedEvent.category === 'technical'
                      ? 'bg-blue-600/50'
                      : selectedEvent.category === 'cultural'
                      ? 'bg-pink-600/50'
                      : 'bg-purple-600/50'
                  }`}>
                    {selectedEvent.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Society</div>
                  <div className="text-white font-semibold">{selectedEvent.societyName}</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Registration Fee</div>
                  <div className="text-white font-semibold">₹{selectedEvent.regFees}</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Date & Time</div>
                  <div className="text-white font-semibold text-sm">
                    {new Date(selectedEvent.dateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' at '}
                    {new Date(selectedEvent.dateTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Location</div>
                  <div className="text-white font-semibold">{selectedEvent.location}</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Event Type</div>
                  <div className="text-white font-semibold">
                    {selectedEvent.isTeamEvent
                      ? `👥 Team (${selectedEvent.minTeamMembers}-${selectedEvent.maxTeamMembers})`
                      : '👤 Individual'}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Contact</div>
                  <div className="text-white font-semibold text-sm">{selectedEvent.contactInfo}</div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="text-xs text-slate-400 uppercase font-semibold mb-2">Description</div>
                <div className="text-slate-300 text-sm leading-relaxed">{selectedEvent.briefDescription}</div>
              </div>

              <a
                href={selectedEvent.pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-magenta-500 transition-all duration-300 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 border border-purple-500/30"
              >
                <span>📄</span>
                <span>View Details PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}