'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [sortVenues, setSortVenues] = useState(true); // Default to sorted
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'venue' | 'event'>('all');
  const [dateOffset, setDateOffset] = useState<number | null>(null); // Will be set after dates are loaded
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrateRef = useRef(false);

  useEffect(() => {
    const admin = getAdminUser();
    setAdminUser(admin);
    const filtered = filterEventsByAccessLevel(events, admin);
    setFilteredEvents(filtered);
  }, [events]);

  // Mark as hydrated after first render
  useEffect(() => {
    if (!hydrateRef.current) {
      hydrateRef.current = true;
      setIsHydrated(true);
    }
  }, []);

  // Close any open dropdowns when modal opens
  useEffect(() => {
    if (selectedEvent) {
      // Dispatch event to close navbar dropdown
      window.dispatchEvent(new Event('closeDropdown'));
    }
  }, [selectedEvent]);

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

  // Get all unique dates with events in ascending order, and always include today
  const getAllDatesWithEvents = useMemo(() => {
    const datesMap = new Map<string, Date>();
    
    // Always add today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    datesMap.set(todayKey, new Date(today));
    
    getSearchFilteredEvents.forEach(event => {
      const startDate = new Date(event.dateTime);
      const endDate = new Date(event.endDateTime);
      
      // For each date the event spans, add it to the map
      let currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);
      const endDateStart = new Date(endDate);
      endDateStart.setHours(0, 0, 0, 0);
      
      while (currentDate <= endDateStart) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const date = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${date}`;
        
        if (!datesMap.has(dateKey)) {
          datesMap.set(dateKey, new Date(currentDate));
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return Array.from(datesMap.values()).sort((a, b) => a.getTime() - b.getTime());
  }, [getSearchFilteredEvents]);

  // Get 3 visible dates based on offset
  const getVisibleDates = useMemo(() => {
    const startIndex = Math.max(0, Math.min(dateOffset ?? 0, getAllDatesWithEvents.length - 3));
    return getAllDatesWithEvents.slice(startIndex, startIndex + 3);
  }, [getAllDatesWithEvents, dateOffset]);

  // Set initial dateOffset to show today on load
  useEffect(() => {
    if (dateOffset === null && getAllDatesWithEvents.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = getAllDatesWithEvents.findIndex(date => date.toDateString() === today.toDateString());
      setDateOffset(Math.max(0, todayIndex));
    }
  }, [getAllDatesWithEvents, dateOffset]);

  // Get all unique venues from search-filtered events
  const getAllVenues = useMemo(() => {
    const venues = new Set<string>();
    getSearchFilteredEvents.forEach(event => venues.add(event.location));
    const venuesArray = Array.from(venues);
    return sortVenues ? venuesArray.sort() : venuesArray;
  }, [getSearchFilteredEvents, sortVenues]);

  // Get events for a specific day, venue, and hour (including events that span across this hour)
  const getEventsForSlot = (dayDate: Date, venue: string, hour: number): IEvent[] => {
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const date = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${date}`;

    return getSearchFilteredEvents.filter(event => {
      const startDate = new Date(event.dateTime);
      const endDate = new Date(event.endDateTime);

      const eventYear = startDate.getFullYear();
      const eventMonth = String(startDate.getMonth() + 1).padStart(2, '0');
      const eventDate_num = String(startDate.getDate()).padStart(2, '0');
      const eventDateKey = `${eventYear}-${eventMonth}-${eventDate_num}`;

      if (eventDateKey !== dateKey || venue !== event.location) {
        return false;
      }

      // Check if the event spans across this hour
      const slotStart = new Date(dayDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(dayDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Event is shown if it overlaps with this hour slot
      return startDate < slotEnd && endDate > slotStart;
    });
  };

  // Get all unique hours that have events for the selected date
  const getActiveHours = useMemo(() => {
    const activeHours = new Set<number>();
    getAllVenues.forEach(venue => {
      getSearchFilteredEvents.forEach(event => {
        if (event.location !== venue) return;
        
        const startDate = new Date(event.dateTime);
        const endDate = new Date(event.endDateTime);
        
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const selectedDate_num = String(selectedDate.getDate()).padStart(2, '0');
        const selectedDateKey = `${selectedYear}-${selectedMonth}-${selectedDate_num}`;
        
        const eventYear = startDate.getFullYear();
        const eventMonth = String(startDate.getMonth() + 1).padStart(2, '0');
        const eventDate_num = String(startDate.getDate()).padStart(2, '0');
        const eventStartDateKey = `${eventYear}-${eventMonth}-${eventDate_num}`;
        
        const eventEndYear = endDate.getFullYear();
        const eventEndMonth = String(endDate.getMonth() + 1).padStart(2, '0');
        const eventEndDate_num = String(endDate.getDate()).padStart(2, '0');
        const eventEndDateKey = `${eventEndYear}-${eventEndMonth}-${eventEndDate_num}`;
        
        // Check if event spans this day
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        if (startDate <= dayEnd && endDate >= dayStart) {
          // Event spans this day
          if (selectedDateKey === eventStartDateKey && selectedDateKey === eventEndDateKey) {
            // Single-day event - add only the hours this event spans
            const startHour = startDate.getHours();
            const endHour = endDate.getHours();
            for (let i = startHour; i <= endHour; i++) {
              activeHours.add(i);
            }
          } else if (selectedDateKey === eventStartDateKey) {
            // This is the start day of multi-day event - add hours from event start time to 23:59
            const startHour = startDate.getHours();
            for (let i = startHour; i <= 23; i++) {
              activeHours.add(i);
            }
          } else if (selectedDateKey === eventEndDateKey) {
            // This is the end day of multi-day event - add hours from 00:00 to event end time
            const endHour = endDate.getHours();
            for (let i = 0; i <= endHour; i++) {
              activeHours.add(i);
            }
          } else {
            // This is a middle day - add all hours 00:00 to 23:59
            for (let i = 0; i <= 23; i++) {
              activeHours.add(i);
            }
          }
        }
      });
    });
    return Array.from(activeHours).sort((a, b) => a - b);
  }, [selectedDate, getAllVenues, getSearchFilteredEvents]);

  // Calculate event span across time slots based on width
  const getEventWidthSpan = (event: IEvent, dayDate: Date) => {
    const startDate = new Date(event.dateTime);
    const endDate = new Date(event.endDateTime);
    
    // Get the day's start and end times
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Clamp event times to the day
    const clampedStart = new Date(Math.max(startDate.getTime(), dayStart.getTime()));
    const clampedEnd = new Date(Math.min(endDate.getTime(), dayEnd.getTime()));
    
    // Check if this is a multi-day event
    const eventStartDay = new Date(startDate);
    eventStartDay.setHours(0, 0, 0, 0);
    const eventEndDay = new Date(endDate);
    eventEndDay.setHours(0, 0, 0, 0);
    const isMultiDay = eventStartDay.getTime() !== eventEndDay.getTime();
    
    // Check if current day is the start day or end day of multi-day event
    const isStartDay = clampedStart.getTime() === startDate.getTime();
    const isEndDay = clampedEnd.getTime() === endDate.getTime();
    
    // Calculate which hours the event spans
    const startHour = clampedStart.getHours();
    const endHour = clampedEnd.getHours();
    
    // Calculate offset within the starting hour (in minutes)
    const startMinutes = clampedStart.getMinutes();
    const startMinuteOffset = startMinutes / 60;
    
    // Calculate offset within the ending hour (in minutes)
    const endMinutes = clampedEnd.getMinutes();
    let endMinuteOffset = endMinutes / 60;
    
    // For multi-day events on start day, span to end of day (minute offset = 1)
    if (isMultiDay && isStartDay && !isEndDay) {
      endMinuteOffset = 1; // Span to end of day (23:59)
    }
    
    // For single-day events, if end time has 0 minutes, don't count that hour
    // (the event ends exactly at the hour start, not including any part of it)
    let adjustedEndHour = endHour;
    if (!isMultiDay && endMinutes === 0 && endHour > startHour) {
      adjustedEndHour = endHour - 1; // Don't include the hour where event ends exactly at the start
      endMinuteOffset = 0; // No part of that hour is shown
    }
    
    // Calculate total duration in hours
    const durationMinutes = (clampedEnd.getTime() - clampedStart.getTime()) / 60000;
    const durationHours = durationMinutes / 60;
    
    // Column span: how many hour columns this event touches
    // startHour = which column it starts in
    // adjustedEndHour = which column it ends in
    let columnSpan = adjustedEndHour - startHour + 1; // Always include both start and end hours
    
    // For multi-day events on start day, span all the way to hour 23 (next day's 00:00)
    if (isMultiDay && isStartDay && !isEndDay) {
      columnSpan = 24 - startHour; // From startHour to hour 23 (24 hours - startHour)
    }
    
    return {
      startHour,
      endHour: adjustedEndHour,
      startMinuteOffset, // 0-1, where 0 is start of hour, 1 is end
      endMinuteOffset,   // 0-1, where 0 is start of hour, 1 is end
      durationHours,
      columnSpan // How many time slots it spans
    };
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
        {/* Dates List with Navigation */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
          {/* Previous Button */}
          <button
            onClick={() => setDateOffset(Math.max(0, (dateOffset ?? 0) - 1))}
            disabled={dateOffset === 0}
            className={`p-2 rounded-lg transition-all border flex-shrink-0 ${
              dateOffset === 0
                ? 'bg-slate-800/20 text-slate-600 border-slate-700/30 cursor-not-allowed'
                : 'bg-slate-800/50 text-white border-slate-700/50 hover:bg-slate-700/50 hover:border-purple-500/50'
            }`}
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>

          {/* 3 Visible Dates - Centered */}
          <div className="flex gap-2 md:gap-4 justify-center">
            {getVisibleDates.length > 0 ? (
              getVisibleDates.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`px-3 md:px-4 py-2 md:py-3 rounded-lg font-semibold whitespace-nowrap transition-all border text-xs md:text-sm flex-shrink-0 min-w-fit ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                        : isToday
                        ? 'bg-slate-800/80 text-white border-purple-500/50 shadow-md shadow-purple-500/20'
                        : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-xs text-slate-400 uppercase hidden md:block">
                      {day.toLocaleDateString('en-US', {weekday: 'short' })}
                    </div>
                    <div className="text-lg md:text-2xl font-bold">{day.getDate()}</div>
                    <div className="text-xs text-slate-400">
                      {day.toLocaleDateString('en-US', { timeZone:'UTC',month: 'short' })}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-sm text-slate-400 py-2">
                No events scheduled
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setDateOffset(Math.min(getAllDatesWithEvents.length - 3, (dateOffset ?? 0) + 1))}
            disabled={(dateOffset ?? 0) >= getAllDatesWithEvents.length - 3}
            className={`p-2 rounded-lg transition-all border flex-shrink-0 ${
              (dateOffset ?? 0) >= getAllDatesWithEvents.length - 3
                ? 'bg-slate-800/20 text-slate-600 border-slate-700/30 cursor-not-allowed'
                : 'bg-slate-800/50 text-white border-slate-700/50 hover:bg-slate-700/50 hover:border-purple-500/50'
            }`}
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
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
        {isHydrated ? (
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
                {getActiveHours.length > 0 ? (
                  getActiveHours.map(hour => (
                    <th
                      key={hour}
                      className="bg-slate-900/80 border-r border-slate-700/50 p-2 text-center text-white font-semibold text-xs min-w-[100px]"
                    >
                      {String(hour).padStart(2, '0')}:00 - {String((hour + 1) % 24).padStart(2, '0')}:00
                    </th>
                  ))
                ) : (
                  <th className="bg-slate-900/80 border-r border-slate-700/50 p-2 text-center text-white font-semibold text-xs min-w-[100px]">
                    No events scheduled
                  </th>
                )}
              </tr>
            </thead>

            {/* Venue Rows */}
            <tbody>
              {getAllVenues.map((venue, venueIndex) => {
                // Get all unique events for this venue on the selected date
                // Include multi-day events that span across the selected date
                const venueEvents = getSearchFilteredEvents.filter(
                  event => {
                    if (event.location !== venue) return false;
                    
                    const eventStart = new Date(event.dateTime);
                    const eventEnd = new Date(event.endDateTime);
                    const dayStart = new Date(selectedDate);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(selectedDate);
                    dayEnd.setHours(23, 59, 59, 999);
                    
                    // Event overlaps with this day if it starts before day ends and ends after day starts
                    return eventStart <= dayEnd && eventEnd >= dayStart;
                  }
                );
                
                return (
                  <tr
                    key={venue}
                    className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors relative ${
                      venueIndex % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'
                    }`}
                    style={{ height: '60px' }}
                  >
                    {/* Venue Name */}
                    <td className="bg-slate-900 border-r border-slate-700/50 p-3 text-white font-semibold sticky left-0 z-10 text-sm" style={{ height: '60px' }}>
                      {venue}
                    </td>

                    {/* Time Slots Container */}
                    <td colSpan={getActiveHours.length || 1} className="relative p-0" style={{ height: '60px' }}>
                      <div className="flex h-full w-full relative">
                        {/* Time slot columns */}
                        {getActiveHours.length > 0 ? (
                          getActiveHours.map(hour => (
                            <div
                              key={`slot-${venue}-${hour}`}
                              className="flex-1 border-r border-slate-700/50 min-w-[100px] bg-slate-900/20 hover:bg-slate-800/40 transition-colors relative"
                            />
                          ))
                        ) : (
                          <div className="flex-1 border-r border-slate-700/50 text-center text-slate-400 text-xs p-2">
                            No events scheduled
                          </div>
                        )}
                        
                        {/* Events overlay - spans across multiple columns */}
                        <div className="absolute inset-0 pointer-events-none">
                          {venueEvents.map((event, idx) => {
                            const span = getEventWidthSpan(event, selectedDate);
                            if (span.columnSpan <= 0) return null;
                            
                            const columnWidth = 100 / Math.max(getActiveHours.length, 1);
                            const startColumnIndex = getActiveHours.indexOf(span.startHour);
                            
                            // Skip if start hour is not in active hours (event is outside visible range)
                            if (startColumnIndex === -1) return null;
                            
                            // Debug log
                            if (event.eventName === 'ada' || event.eventName.toLowerCase().includes('ada')) {
                              console.log('Event ada:', {
                                dateTime: event.dateTime,
                                endDateTime: event.endDateTime,
                                span,
                                activeHours: getActiveHours,
                                startColumnIndex,
                                columnWidth
                              });
                            }
                            
                            // Calculate left position: which column it starts in + offset within that column
                            const leftPercent = startColumnIndex * columnWidth + (span.startMinuteOffset * columnWidth);
                            
                            // Find the actual end column index in activeHours
                            let actualEndColumnIndex = startColumnIndex;
                            for (let i = startColumnIndex; i < getActiveHours.length; i++) {
                              if (getActiveHours[i] <= span.endHour) {
                                actualEndColumnIndex = i;
                              } else {
                                break;
                              }
                            }
                            
                            // Calculate width by summing each column's contribution
                            let totalWidth = 0;
                            for (let colIdx = startColumnIndex; colIdx <= actualEndColumnIndex; colIdx++) {
                              const hour = getActiveHours[colIdx];
                              
                              if (colIdx === startColumnIndex) {
                                // First column: from startMinuteOffset to end of hour
                                totalWidth += (1 - span.startMinuteOffset) * columnWidth;
                              } else if (colIdx === actualEndColumnIndex) {
                                // Last column: from start of hour to endMinuteOffset
                                // Only apply endMinuteOffset if this is actually the end hour
                                if (hour === span.endHour) {
                                  totalWidth += span.endMinuteOffset * columnWidth;
                                } else {
                                  // This hour is before the end, show full width
                                  totalWidth += columnWidth;
                                }
                              } else {
                                // Middle columns: full width
                                totalWidth += columnWidth;
                              }
                            }
                            
                            const widthPercent = totalWidth;

                            return (
                              <button
                                key={event._id}
                                onClick={() => setSelectedEvent(event)}
                                className={`absolute top-1 p-2 rounded text-xs text-white font-semibold cursor-pointer transition-all hover:shadow-lg hover:z-50 border border-opacity-50 overflow-hidden pointer-events-auto ${getCategoryColor(
                                  event.category
                                )}`}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${Math.max(widthPercent - 2, 50)}%`,
                                  height: 'calc(100% - 8px)',
                                  minHeight: '40px',
                                  marginRight: '2px'
                                }}
                                title={event.eventName}
                              >
                                <div className="truncate px-1">
                                  {getCategoryIcon(event.category)} {event.eventName}
                                </div>
                                <div className="text-xs opacity-75 px-1 truncate">
                                  {new Date(event.dateTime).toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  -{' '}
                                  {new Date(event.endDateTime).toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            Loading calendar...
          </div>
        )}
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
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Start Date & Time</div>
                  <div className="text-white font-semibold text-sm">
                    {new Date(selectedEvent.dateTime).toLocaleDateString('en-US', {
                      timeZone: 'UTC',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' at '}
                    {new Date(selectedEvent.dateTime).toLocaleTimeString('en-US', {
                      timeZone: 'UTC',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase font-semibold mb-1">End Date & Time</div>
                  <div className="text-white font-semibold text-sm">
                    {new Date(selectedEvent.endDateTime).toLocaleDateString('en-US', {
                      timeZone: 'UTC',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' at '}
                    {new Date(selectedEvent.endDateTime).toLocaleTimeString('en-US', {
                      timeZone: 'UTC',
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