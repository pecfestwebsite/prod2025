'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

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

export default function CalendarClient({ events }: { events: IEvent[] }) {
  // Helper function to parse date string as IST
  const parseISTDate = (dateString: string): Date => {
    // Parse the date string and interpret it as IST (UTC)
    const date = new Date(dateString);
    return date;
  };

  // Helper function to get IST date components
  const getISTDateComponents = (date: Date) => {
    const istString = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const istDate = new Date(istString);
    return {
      year: istDate.getFullYear(),
      month: istDate.getMonth(),
      date: istDate.getDate(),
      hours: istDate.getHours(),
      minutes: istDate.getMinutes(),
    };
  };

  const filteredEvents = events;
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const hydrateRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set loading to false after events are loaded
    setTimeout(() => setIsLoading(false), 800); // Small delay for smooth transition
  }, [events]);

  // Mark as hydrated after first render
  useEffect(() => {
    if (!hydrateRef.current) {
      hydrateRef.current = true;
      setIsHydrated(true);
    }
  }, []);

  // Focus management for modal
  useEffect(() => {
    if (selectedEvent) {
      // Save previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;
      // Trap focus in modal
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [selectedEvent]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
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

  // Filter events by category (hidden categories)
  const getCategoryFilteredEvents = useMemo(() => {
    if (hiddenCategories.size === 0) return getSearchFilteredEvents;
    return getSearchFilteredEvents.filter(event => !hiddenCategories.has(event.category));
  }, [getSearchFilteredEvents, hiddenCategories]);

  // Toggle category visibility
  const toggleCategory = (category: string) => {
    setHiddenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Get search suggestions based on search type
  const getSearchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions: string[] = [];
    
    if (searchType === 'venue' || searchType === 'all') {
      const venues = new Set<string>();
      filteredEvents.forEach(event => venues.add(event.location));
      const matchingVenues = Array.from(venues)
        .filter(venue => venue.toLowerCase().includes(query))
        .slice(0, 5);
      suggestions.push(...matchingVenues);
    }
    
    if (searchType === 'event' || searchType === 'all') {
      const matchingEvents = filteredEvents
        .filter(event => event.eventName.toLowerCase().includes(query))
        .map(event => event.eventName)
        .filter((name, index, self) => self.indexOf(name) === index) // Unique names
        .slice(0, 5);
      suggestions.push(...matchingEvents);
    }
    
    return suggestions.slice(0, 8); // Max 8 suggestions
  }, [searchQuery, searchType, filteredEvents]);

  // Get all unique dates with events in ascending order, and always include today
  const getAllDatesWithEvents = useMemo(() => {
    const datesMap = new Map<string, Date>();
    
    // Always add today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    datesMap.set(todayKey, new Date(today));
    
    getCategoryFilteredEvents.forEach(event => {
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
  }, [getCategoryFilteredEvents]);

  // Get 3 visible dates based on offset, with the middle one being the focus
  const getVisibleDates = useMemo(() => {
    const startIndex = Math.max(0, Math.min(dateOffset ?? 0, getAllDatesWithEvents.length - 3));
    return getAllDatesWithEvents.slice(startIndex, startIndex + 3);
  }, [getAllDatesWithEvents, dateOffset]);

  // Set initial dateOffset to show today centered (as the middle date)
  useEffect(() => {
    if (dateOffset === null && getAllDatesWithEvents.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = getAllDatesWithEvents.findIndex(date => date.toDateString() === today.toDateString());
      
      if (todayIndex !== -1) {
        // Center today by offsetting by 1 (so it appears in the middle of 3 dates)
        const centeredOffset = Math.max(0, todayIndex - 1);
        setDateOffset(centeredOffset);
      } else {
        // If today is not in the list, start from the beginning
        setDateOffset(0);
      }
    }
  }, [getAllDatesWithEvents, dateOffset]);

  // Keyboard navigation - placed after getAllDatesWithEvents is defined
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigatePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigateNext();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        jumpToToday();
      } else if (e.key === 'Escape' && selectedEvent) {
        setSelectedEvent(null);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedEvent]); // Removed getAllDatesWithEvents from deps as it's used in callbacks only

  // Get all unique venues from search-filtered events
  const getAllVenues = useMemo(() => {
    const venues = new Set<string>();
    getCategoryFilteredEvents.forEach(event => venues.add(event.location));
    const venuesArray = Array.from(venues);
    return sortVenues ? venuesArray.sort() : venuesArray;
  }, [getCategoryFilteredEvents, sortVenues]);

  // Get venues that have events on the selected date only
  const getVenuesForSelectedDate = useMemo(() => {
    const venues = new Set<string>();
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    getCategoryFilteredEvents.forEach(event => {
      const eventStart = new Date(event.dateTime);
      const eventEnd = new Date(event.endDateTime);
      
      // Event overlaps with selected day
      if (eventStart <= dayEnd && eventEnd >= dayStart) {
        venues.add(event.location);
      }
    });
    
    const venuesArray = Array.from(venues);
    return sortVenues ? venuesArray.sort() : venuesArray;
  }, [getCategoryFilteredEvents, selectedDate, sortVenues]);

  // Get events for a specific day, venue, and hour (including events that span across this hour)
  const getEventsForSlot = (dayDate: Date, venue: string, hour: number): IEvent[] => {
    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const date = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${date}`;

    return getCategoryFilteredEvents.filter(event => {
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

  // Show hours from first event to last event of the selected date
  // Only shows hours if there are actually events displayed
  const getActiveHours = useMemo(() => {
    // First, check if there are any events on this date in any venue
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const selectedDate_num = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateKey = `${selectedYear}-${selectedMonth}-${selectedDate_num}`;
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Filter events that actually occur on this date
    const eventsOnThisDate = getCategoryFilteredEvents.filter(event => {
      const startDate = new Date(event.dateTime);
      const endDate = new Date(event.endDateTime);
      return startDate <= dayEnd && endDate >= dayStart;
    });
    
    if (eventsOnThisDate.length === 0) return [];
    
    let minHour = 23;
    let maxHour = 0;
    
    eventsOnThisDate.forEach(event => {
      const startDate = new Date(event.dateTime);
      const endDate = new Date(event.endDateTime);
      
      const eventYear = startDate.getFullYear();
      const eventMonth = String(startDate.getMonth() + 1).padStart(2, '0');
      const eventDate_num = String(startDate.getDate()).padStart(2, '0');
      const eventStartDateKey = `${eventYear}-${eventMonth}-${eventDate_num}`;
      
      const eventEndYear = endDate.getFullYear();
      const eventEndMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const eventEndDate_num = String(endDate.getDate()).padStart(2, '0');
      const eventEndDateKey = `${eventEndYear}-${eventEndMonth}-${eventEndDate_num}`;
      
      // Event spans this day
      if (selectedDateKey === eventStartDateKey && selectedDateKey === eventEndDateKey) {
        // Single-day event
        const startHour = startDate.getHours();
        const endHour = endDate.getHours();
        minHour = Math.min(minHour, startHour);
        maxHour = Math.max(maxHour, endHour);
      } else if (selectedDateKey === eventStartDateKey) {
        // Start day of multi-day event
        const startHour = startDate.getHours();
        minHour = Math.min(minHour, startHour);
        maxHour = 23;
      } else if (selectedDateKey === eventEndDateKey) {
        // End day of multi-day event
        const endHour = endDate.getHours();
        minHour = 0;
        maxHour = Math.max(maxHour, endHour);
      } else {
        // Middle day - all hours
        minHour = 0;
        maxHour = 23;
      }
    });
    
    // Create continuous array from minHour to maxHour
    const hours = [];
    for (let i = minHour; i <= maxHour; i++) {
      hours.push(i);
    }
    return hours;
  }, [selectedDate, getCategoryFilteredEvents]);

  // Calculate event span across time slots based on width
  const getEventWidthSpan = (event: IEvent, dayDate: Date) => {
    const startDate = new Date(event.dateTime);
    const endDate = new Date(event.endDateTime);
    
    // Check if start and end are the same time (test phase events)
    const isSameTime = startDate.getTime() === endDate.getTime();
    
    // Get the day's start and end times
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Clamp event times to the day
    const clampedStart = new Date(Math.max(startDate.getTime(), dayStart.getTime()));
    let clampedEnd = new Date(Math.min(endDate.getTime(), dayEnd.getTime()));
    
    // If same time, add 1 hour to end time
    if (isSameTime) {
      clampedEnd = new Date(clampedStart.getTime() + 60 * 60 * 1000); // Add 1 hour
    }
    
    // Check if this is a multi-day event
    const eventStartDay = new Date(startDate);
    eventStartDay.setHours(0, 0, 0, 0);
    const eventEndDay = new Date(endDate);
    eventEndDay.setHours(0, 0, 0, 0);
    const isMultiDay = eventStartDay.getTime() !== eventEndDay.getTime();
    
    // Check if current day is the start day or end day of multi-day event
    const currentDayStart = new Date(dayDate);
    currentDayStart.setHours(0, 0, 0, 0);
    const isStartDay = currentDayStart.getTime() === eventStartDay.getTime();
    const isEndDay = currentDayStart.getTime() === eventEndDay.getTime();
    
    // Calculate which hours the event spans
    const startHour = clampedStart.getHours();
    const endHour = clampedEnd.getHours();
    
    // Calculate offset within the starting hour (in minutes)
    const startMinutes = clampedStart.getMinutes();
    const startMinuteOffset = startMinutes / 60;
    
    // Calculate offset within the ending hour (in minutes)
    const endMinutes = clampedEnd.getMinutes();
    let endMinuteOffset = endMinutes / 60;
    
    // Adjust endHour based on whether event actually uses that hour
    let adjustedEndHour = endHour;
    
    // For multi-day events on start day, span to end of day or last visible hour
    if (isMultiDay && isStartDay && !isEndDay) {
      adjustedEndHour = 23; // Last hour of the day
      endMinuteOffset = 1; // Span to end of day (23:59)
    }
    // For multi-day events on end day, show from start of day to end time
    else if (isMultiDay && isEndDay && !isStartDay) {
      // If event ends at exactly the hour start (e.g., 13:00), don't include that hour
      if (endMinutes === 0 && endHour > 0) {
        adjustedEndHour = endHour - 1;
        endMinuteOffset = 1; // Show full previous hour
      } else {
        // Event ends partway through an hour, show that partial hour
        adjustedEndHour = endHour;
        endMinuteOffset = endMinutes / 60;
      }
    }
    // For single-day events
    else if (!isMultiDay) {
      // If end time has 0 minutes and is after start, don't count that hour
      if (endMinutes === 0 && endHour > startHour) {
        adjustedEndHour = endHour - 1;
        endMinuteOffset = 1; // Show full previous hour
      } else {
        // Event ends partway through an hour or same hour as start
        adjustedEndHour = endHour;
        endMinuteOffset = endMinutes / 60;
        
        // If same time event, ensure it spans at least 1 hour
        if (isSameTime) {
          endMinuteOffset = 1;
        }
      }
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
      columnSpan, // How many time slots it spans
      isSameTime // Track if this is a TBD event
    };
  };

  // Navigate week
  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedDate(newDate);
  };

  // Navigation handlers
  const handleNavigatePrev = () => {
    const newOffset = Math.max(0, (dateOffset ?? 0) - 1);
    setTransitionDirection('left');
    setIsTransitioning(true);
    setDateOffset(newOffset);
    const newVisibleDates = getAllDatesWithEvents.slice(newOffset, newOffset + 3);
    if (newVisibleDates.length >= 2) {
      setSelectedDate(newVisibleDates[1]);
    } else if (newVisibleDates.length > 0) {
      setSelectedDate(newVisibleDates[0]);
    }
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 300);
  };

  const handleNavigateNext = () => {
    const newOffset = Math.min(getAllDatesWithEvents.length - 3, (dateOffset ?? 0) + 1);
    setTransitionDirection('right');
    setIsTransitioning(true);
    setDateOffset(newOffset);
    const newVisibleDates = getAllDatesWithEvents.slice(newOffset, newOffset + 3);
    if (newVisibleDates.length >= 2) {
      setSelectedDate(newVisibleDates[1]);
    } else if (newVisibleDates.length > 0) {
      setSelectedDate(newVisibleDates[0]);
    }
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 300);
  };

  const jumpToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setIsTransitioning(true);
    setSelectedDate(today);
    const todayIndex = getAllDatesWithEvents.findIndex(d => d.toDateString() === today.toDateString());
    if (todayIndex !== -1) {
      const centeredOffset = Math.max(0, Math.min(todayIndex - 1, getAllDatesWithEvents.length - 3));
      setDateOffset(centeredOffset);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-600/80 border-blue-400';
      case 'cultural':
        return 'bg-purple-600/80 border-purple-400';
      case 'convenor':
        return 'bg-amber-600/80 border-amber-400';
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
      {/* Loading Skeleton */}
      {isLoading ? (
        <>
          {/* Date Navigation Skeleton */}
          <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 p-3 md:p-4">
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
              {/* Prev Button Skeleton */}
              <div className="w-10 h-10 bg-slate-800/50 rounded-lg animate-skeleton"></div>
              
              {/* Date Cards Skeleton */}
              <div className="flex gap-2 md:gap-4 justify-center flex-1 max-w-lg">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-24 md:w-32 h-20 md:h-24 bg-slate-800/50 rounded-lg animate-skeleton"></div>
                ))}
              </div>
              
              {/* Next Button Skeleton */}
              <div className="w-10 h-10 bg-slate-800/50 rounded-lg animate-skeleton"></div>
            </div>
            
            {/* Sort Checkbox Skeleton */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-4 h-4 bg-slate-800/50 rounded animate-skeleton"></div>
              <div className="w-48 h-4 bg-slate-800/50 rounded animate-skeleton"></div>
            </div>
            
            {/* Search Bar Skeleton */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-24 h-10 bg-slate-800/50 rounded-lg animate-skeleton"></div>
              <div className="flex-1 max-w-2xl h-10 bg-slate-800/50 rounded-lg animate-skeleton"></div>
            </div>
          </div>
          
          {/* Legend Skeleton */}
          <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-800/50 rounded animate-skeleton"></div>
                  <div className="w-16 h-4 bg-slate-800/50 rounded animate-skeleton"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calendar Table Skeleton */}
          <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 p-4">
            <div className="space-y-4">
              {/* Table Header Skeleton */}
              <div className="flex gap-2">
                <div className="w-48 h-8 bg-slate-800/50 rounded animate-skeleton"></div>
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex-1 h-8 bg-slate-800/50 rounded animate-skeleton"></div>
                  ))}
                </div>
              </div>
              
              {/* Table Rows Skeleton */}
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex gap-2">
                  <div className="w-48 h-16 bg-slate-800/50 rounded animate-skeleton"></div>
                  <div className="flex-1 h-16 bg-slate-800/50 rounded animate-skeleton relative">
                    {/* Event blocks skeleton */}
                    <div className="absolute left-[10%] top-2 w-[30%] h-12 bg-purple-500/20 rounded animate-skeleton"></div>
                    <div className="absolute left-[50%] top-2 w-[25%] h-12 bg-blue-500/20 rounded animate-skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
      {/* Title - Mobile/Tablet Only - Outside container */}
      <div className="lg:hidden text-center mb-6">
        <h1 className="font-arabic text-6xl md:text-7xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
          Calendar
        </h1>
      </div>

      {/* Week Navigation */}
      <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 p-3 md:p-4 py-3 relative z-40">

        {/* Three Column Layout - Desktop */}
        <div className="flex flex-col lg:flex-row" style={{ gap: '1rem' }}>
          {/* Title on Left - Desktop Only */}
          <div className="hidden lg:flex lg:w-[33%] items-center justify-center rounded-xl shadow-lg overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 animate-gradient" style={{ padding: '2rem' }}>
            <h1 className="font-arabic text-white tracking-wider" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
              Calendar
            </h1>
          </div>
          
          {/* Dates in Center */}
          <div className="w-full lg:w-[33%] flex items-center justify-center">
            <div className="flex flex-col items-center w-full h-full" style={{ gap: '1rem' }}>
          {/* 3 Visible Dates - Centered */}
          <div className="flex justify-center w-full flex-1" style={{ gap: '1rem' }}>
            {getVisibleDates.length > 0 ? (
              getVisibleDates.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                
                // Count all events on this day, including multi-day events that span across it
                const eventsOnDay = getCategoryFilteredEvents.filter(e => {
                  const eventStart = new Date(e.dateTime);
                  const eventEnd = new Date(e.endDateTime);
                  const dayStart = new Date(day);
                  dayStart.setHours(0, 0, 0, 0);
                  const dayEnd = new Date(day);
                  dayEnd.setHours(23, 59, 59, 999);
                  
                  // Event overlaps with this day if it starts before day ends and ends after day starts
                  return eventStart <= dayEnd && eventEnd >= dayStart;
                }).length;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDate(day);
                      // Center the clicked date
                      const clickedDateIndex = getAllDatesWithEvents.findIndex(d => d.toDateString() === day.toDateString());
                      if (clickedDateIndex !== -1) {
                        // Calculate offset to center this date (make it the middle of 3)
                        const centeredOffset = Math.max(0, Math.min(clickedDateIndex - 1, getAllDatesWithEvents.length - 3));
                        setDateOffset(centeredOffset);
                      }
                    }}
                    className={`relative rounded-lg font-semibold whitespace-nowrap transition-calendar border flex-shrink-0 h-full flex flex-col justify-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-magenta-600 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                        : isToday
                        ? 'bg-slate-800/80 text-white border-purple-500/50 shadow-md shadow-purple-500/20'
                        : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:border-purple-500/50'
                    }`}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', flex: '1', minWidth: '0' }}
                  >
                    {/* Event Count Badge */}
                    {eventsOnDay > 0 && (
                      <div className="absolute bg-purple-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg" style={{ top: '-0.5rem', right: '-0.5rem', width: '1.5rem', height: '1.5rem', fontSize: '0.75rem' }}>
                        {eventsOnDay}
                      </div>
                    )}
                    
                    <div className="text-slate-400 uppercase hidden md:block" style={{ fontSize: '0.75rem' }}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="font-bold" style={{ fontSize: '1.5rem' }}>{day.getDate()}</div>
                    <div className="text-slate-400" style={{ fontSize: '0.75rem' }}>
                      {day.toLocaleDateString('en-US', { timeZone:'UTC',month: 'short' })}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-slate-400" style={{ fontSize: '0.875rem', padding: '0.5rem 0' }}>
                No events scheduled
              </div>
            )}
          </div>
          
          {/* Previous/Next Buttons */}
          <div className="flex items-center w-full" style={{ gap: '0.5rem' }}>
            <button
              onClick={handleNavigatePrev}
              disabled={dateOffset === 0}
              className={`flex-1 font-semibold transition-calendar rounded-lg border ${
                dateOffset === 0
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border-slate-700/50'
                  : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:border-purple-500/50'
              }`}
              style={{ fontSize: '0.875rem', padding: '0.75rem' }}
            >
              Previous
            </button>
            <button
              onClick={handleNavigateNext}
              disabled={(dateOffset ?? 0) >= getAllDatesWithEvents.length - 3}
              className={`flex-1 font-semibold transition-calendar rounded-lg border ${
                (dateOffset ?? 0) >= getAllDatesWithEvents.length - 3
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border-slate-700/50'
                  : 'bg-slate-800/40 text-slate-300 border-slate-700/50 hover:border-purple-500/50'
              }`}
              style={{ fontSize: '0.875rem', padding: '0.75rem' }}
            >
              Next
            </button>
          </div>
            </div>
          </div>
          
          {/* Right Side - Search & Filters */}
          <div className="w-full lg:w-[33%] flex flex-col">
            {/* Expand Button - Mobile/Tablet Only */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-slate-800/40 text-slate-300 font-semibold rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all flex items-center justify-center w-full"
              style={{ padding: '0.75rem', fontSize: '0.875rem', gap: '0.5rem', marginBottom: '0.5rem' }}
            >
              <span>{showFilters ? '▲' : '▼'}</span>
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            
            <div className={`bg-amber-400/10 rounded-xl border border-amber-400/30 transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-[1000px] lg:opacity-100'}`} style={{ padding: showFilters || window.innerWidth >= 1024 ? '1.5rem' : '0', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="font-semibold text-indigo-400" style={{ fontSize: '0.875rem' }}>Event Types</label>
              <div className="flex flex-wrap" style={{ gap: '0.75rem' }}>
                {Array.from(new Set(filteredEvents.map(e => e.category))).sort().map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-lg font-semibold transition-all ${
                      hiddenCategories.has(category)
                        ? 'bg-slate-800/40 text-slate-500 line-through border border-slate-700/50'
                        : 'bg-amber-500/20 text-indigo-300 border border-amber-400/30 hover:bg-amber-500/30'
                    }`}
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {getCategoryIcon(category)} {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="font-semibold text-indigo-400" style={{ fontSize: '0.875rem' }}>Search</label>
              <div className="flex" style={{ gap: '0.5rem' }}>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'all' | 'venue' | 'event')}
                  className="rounded-lg bg-slate-800/60 border border-amber-400/30 text-indigo-200 font-semibold focus:outline-none focus:border-amber-400"
                  style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                >
                  <option value="all">All</option>
                  <option value="venue">Venue</option>
                  <option value="event">Event</option>
                </select>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchQuery('');
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setFocusedSuggestionIndex(prev => 
                        prev < getSearchSuggestions.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setFocusedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
                      e.preventDefault();
                      const selectedSuggestion = getSearchSuggestions[focusedSuggestionIndex];
                      setSearchQuery(selectedSuggestion);
                      setShowSuggestions(false);
                      
                      // Navigate to first matching event's date
                      setTimeout(() => {
                        const matchingEvents = getCategoryFilteredEvents.filter(evt => 
                          evt.eventName.toLowerCase().includes(selectedSuggestion.toLowerCase()) || 
                          evt.location.toLowerCase().includes(selectedSuggestion.toLowerCase())
                        );
                        
                        if (matchingEvents.length > 0) {
                          const firstEvent = matchingEvents[0];
                          const eventStartDate = new Date(firstEvent.dateTime);
                          eventStartDate.setHours(0, 0, 0, 0);
                          
                          const eventDateIndex = getAllDatesWithEvents.findIndex(d => {
                            const compareDate = new Date(d);
                            compareDate.setHours(0, 0, 0, 0);
                            return compareDate.getTime() === eventStartDate.getTime();
                          });
                          
                          if (eventDateIndex !== -1) {
                            const centeredOffset = Math.max(0, Math.min(eventDateIndex - 1, getAllDatesWithEvents.length - 3));
                            setDateOffset(centeredOffset);
                            setSelectedDate(eventStartDate);
                          }
                        } else {
                          // If no match found, show today
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          setSelectedDate(today);
                          setDateOffset(0);
                        }
                      }, 100);
                    } else if (e.key === 'Escape') {
                      setSearchQuery('');
                    }
                  }}
                  className="flex-1 rounded-lg bg-slate-800/60 border border-amber-400/30 text-indigo-100 placeholder-indigo-300/50 focus:outline-none focus:border-amber-400"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="bg-slate-900/50 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 overflow-hidden relative">
        {/* Transition Overlay with Direction Indicator */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-16 h-16">
                {/* Spinning circle */}
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                
                {/* Direction Arrow */}
                {transitionDirection && (
                  <div className={`absolute inset-0 flex items-center justify-center text-2xl text-purple-400 ${
                    transitionDirection === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'
                  }`}>
                    {transitionDirection === 'left' ? '◀' : '▶'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <style>{`
          .calendar-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.4) rgba(15, 23, 42, 0.3);
          }
          .calendar-scroll::-webkit-scrollbar {
            height: 8px;
          }
          .calendar-scroll::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.3);
            border-radius: 4px;
          }
          .calendar-scroll::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.4);
            border-radius: 4px;
          }
          .calendar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.6);
          }
          
          .event-legend-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.3) rgba(15, 23, 42, 0.2);
          }
          .event-legend-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .event-legend-scroll::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.2);
            border-radius: 3px;
          }
          .event-legend-scroll::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.3);
            border-radius: 3px;
          }
          .event-legend-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.5);
          }
          
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-100% + 40px));
            }
          }
          
          .event-name-container,
          .event-time-container {
            position: relative;
            overflow: hidden;
          }
          
          .event-name-text,
          .event-time-text {
            display: inline-block;
            white-space: nowrap;
            padding-right: 20px;
          }
          
          /* Marquee animation will be applied via JS only when text overflows */
          .text-overflow-marquee {
            animation: marquee 8s linear infinite;
          }
          
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
        `}</style>
        {isHydrated ? (
        <>
        {/* Desktop/Tablet Table View - Hidden on mobile */}
        <div 
          className={`overflow-x-auto calendar-scroll select-none hidden md:block ${!isTransitioning ? 'animate-fade-in-up' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <table className="w-full border-collapse min-w-max">
            {/* Header with Time Slots */}
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="bg-slate-900 border-r border-slate-700/50 p-3 text-left text-white font-semibold w-48 min-w-[12rem] sticky left-0 z-20">
                  Venue
                </th>
                {getActiveHours.length > 0 ? (
                  getActiveHours.map(hour => (
                    <th
                      key={hour}
                      className="bg-slate-900/80 border-r border-slate-700/50 p-2 text-center text-white font-semibold text-xs"
                    >
                      {String(hour).padStart(2, '0')}:00 - {String((hour + 1) % 24).padStart(2, '0')}:00
                    </th>
                  ))
                ) : (
                  <th className="bg-slate-900/80 border-r border-slate-700/50 p-2 text-center text-white font-semibold text-xs min-w-[200px]">
                    No events scheduled
                  </th>
                )}
              </tr>
            </thead>

            {/* Venue Rows */}
            <tbody>
              {getVenuesForSelectedDate.length === 0 ? (
                <tr>
                  <td colSpan={100} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📅</span>
                      <p className="text-lg font-semibold">No events scheduled</p>
                      <p className="text-sm">There are no events for this date</p>
                    </div>
                  </td>
                </tr>
              ) : (
              getVenuesForSelectedDate.map((venue, venueIndex) => {
                // Get all unique events for this venue on the selected date
                // Include multi-day events that span across the selected date
                const venueEvents = getCategoryFilteredEvents.filter(
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
                    } ${!isTransitioning ? 'animate-fade-in-up' : ''}`}
                    style={{ 
                      height: '60px',
                      animationDelay: !isTransitioning ? `${venueIndex * 50}ms` : '0ms'
                    }}
                  >
                    {/* Venue Name */}
                    <td className="bg-slate-900 border-r border-slate-700/50 p-3 text-white font-semibold sticky left-0 z-20 text-sm w-48 min-w-[12rem]" style={{ height: '60px' }}>
                      <div className="truncate" title={venue}>{venue}</div>
                    </td>

                    {/* Time Slots Container */}
                    <td colSpan={getActiveHours.length || 1} className="relative p-0 overflow-hidden" style={{ height: '60px' }}>
                      <div className="flex h-full w-full relative">
                        {/* Time slot columns */}
                        {getActiveHours.length > 0 ? (
                          getActiveHours.map(hour => (
                            <div
                              key={`slot-${venue}-${hour}`}
                              className="flex-1 border-r border-slate-700/50 bg-slate-900/20 hover:bg-slate-800/40 transition-colors relative"
                            />
                          ))
                        ) : (
                          <div className="flex-1 border-r border-slate-700/50 text-center text-slate-400 text-xs p-2">
                            No events scheduled
                          </div>
                        )}
                        
                        {/* Events overlay - positioned exactly by time */}
                        <div className="absolute inset-0 pointer-events-none">
                          {getActiveHours.length > 0 && venueEvents.map((event, idx) => {
                            const eventStart = new Date(event.dateTime);
                            const eventEnd = new Date(event.endDateTime);
                            const isSameTime = eventStart.getTime() === eventEnd.getTime();
                            
                            // If same time (TBD event), add 1 hour for visibility
                            const displayEnd = isSameTime ? new Date(eventStart.getTime() + 60 * 60 * 1000) : eventEnd;
                            
                            // Get the current day boundaries
                            const dayStart = new Date(selectedDate);
                            dayStart.setHours(0, 0, 0, 0);
                            const dayEnd = new Date(selectedDate);
                            dayEnd.setHours(23, 59, 59, 999);
                            
                            // Check if this is a multi-day event
                            const eventStartDay = new Date(eventStart);
                            eventStartDay.setHours(0, 0, 0, 0);
                            const eventEndDay = new Date(displayEnd);
                            eventEndDay.setHours(0, 0, 0, 0);
                            const isMultiDay = eventStartDay.getTime() !== eventEndDay.getTime();
                            
                            // Clamp event to current day's visible range
                            const clampedStart = new Date(Math.max(eventStart.getTime(), dayStart.getTime()));
                            const clampedEnd = new Date(Math.min(displayEnd.getTime(), dayEnd.getTime()));
                            
                            // Skip if event doesn't overlap with current day
                            if (eventStart > dayEnd || displayEnd < dayStart) return null;
                            
                            // Get visible hour range
                            const firstHour = getActiveHours[0];
                            const lastHour = getActiveHours[getActiveHours.length - 1];
                            
                            // Calculate start and end hours/minutes for display (using clamped times)
                            const startHour = clampedStart.getHours();
                            const startMinute = clampedStart.getMinutes();
                            const endHour = clampedEnd.getHours();
                            const endMinute = clampedEnd.getMinutes();
                            
                            // Skip if event is outside visible hour range
                            if (startHour > lastHour || endHour < firstHour) return null;
                            
                            // For multi-day events, extend to visible boundaries
                            let displayStartHour = startHour;
                            let displayStartMinute = startMinute;
                            let displayEndHour = endHour;
                            let displayEndMinute = endMinute;
                            
                            // If event started before today, show from start of visible hours
                            if (eventStart < dayStart) {
                              displayStartHour = Math.max(firstHour, 0);
                              displayStartMinute = 0;
                            }
                            
                            // If event continues after today AND is already clamped to day end,
                            // make sure it extends to last visible hour
                            if (displayEnd > dayEnd && endHour < lastHour) {
                              // Only extend if the clamped end is before the last visible hour
                              displayEndHour = lastHour;
                              displayEndMinute = 59;
                            }
                            
                            // Clamp to visible hour range (don't exceed what's shown)
                            if (displayStartHour < firstHour) {
                              displayStartHour = firstHour;
                              displayStartMinute = 0;
                            }
                            // Don't reduce endHour if it's already at or past lastHour (full day events)
                            if (displayEndHour > lastHour && displayEnd <= dayEnd) {
                              displayEndHour = lastHour;
                              displayEndMinute = 59;
                            }
                            
                            // Calculate total minutes in visible range
                            const totalMinutesRange = (lastHour - firstHour + 1) * 60;
                            
                            // Calculate position and width as percentage
                            const startMinutesFromFirst = (displayStartHour - firstHour) * 60 + displayStartMinute;
                            const endMinutesFromFirst = (displayEndHour - firstHour) * 60 + displayEndMinute;
                            
                            // Ensure valid range
                            if (startMinutesFromFirst >= totalMinutesRange || endMinutesFromFirst <= 0) return null;
                            if (endMinutesFromFirst <= startMinutesFromFirst) return null;
                            
                            const leftPercent = (startMinutesFromFirst / totalMinutesRange) * 100;
                            const widthPercent = ((endMinutesFromFirst - startMinutesFromFirst) / totalMinutesRange) * 100;
                            
                            // Ensure minimum visibility
                            if (widthPercent < 2) return null;
                            
                            // Visual indicators for multi-day events
                            const continuesFromPrevDay = eventStart < dayStart;
                            const continuesToNextDay = displayEnd > dayEnd;

                            return (
                              <button
                                key={event._id}
                                onClick={() => {
                                  setSelectedEvent(event);
                                  // Navigate to event's start date
                                  const eventStartDate = new Date(event.dateTime);
                                  eventStartDate.setHours(0, 0, 0, 0);
                                  const eventDateIndex = getAllDatesWithEvents.findIndex(d => {
                                    const compareDate = new Date(d);
                                    compareDate.setHours(0, 0, 0, 0);
                                    return compareDate.getTime() === eventStartDate.getTime();
                                  });
                                  if (eventDateIndex !== -1) {
                                    const centeredOffset = Math.max(0, Math.min(eventDateIndex - 1, getAllDatesWithEvents.length - 3));
                                    setDateOffset(centeredOffset);
                                    setSelectedDate(eventStartDate);
                                  }
                                }}
                                className={`absolute top-1 p-2 text-xs text-white font-semibold cursor-pointer border overflow-hidden pointer-events-auto z-10 box-border ${
                                  isSameTime 
                                    ? 'border-dashed border-2 border-yellow-400/70 opacity-90' 
                                    : 'border-opacity-50'
                                } ${
                                  continuesFromPrevDay ? 'rounded-l-none border-l-4' : 'rounded-l'
                                } ${
                                  continuesToNextDay ? 'rounded-r-none border-r-4' : 'rounded-r'
                                } ${getCategoryColor(
                                  event.category
                                )}`}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                  height: 'calc(100% - 8px)',
                                  minHeight: '40px',
                                  maxWidth: `${widthPercent}%`, // Ensure it doesn't exceed calculated width
                                }}
                                title={`${event.eventName}${continuesFromPrevDay ? ' (continues from previous day)' : ''}${continuesToNextDay ? ' (continues to next day)' : ''}`}
                                ref={(el) => {
                                  if (el) {
                                    // Check for text overflow and apply marquee only if needed
                                    setTimeout(() => {
                                      const nameContainer = el.querySelector('.event-name-container');
                                      const nameText = el.querySelector('.event-name-text');
                                      const timeContainer = el.querySelector('.event-time-container');
                                      const timeText = el.querySelector('.event-time-text');
                                      
                                      if (nameContainer && nameText) {
                                        if (nameText.scrollWidth > nameContainer.clientWidth) {
                                          nameText.classList.add('text-overflow-marquee');
                                        } else {
                                          nameText.classList.remove('text-overflow-marquee');
                                        }
                                      }
                                      
                                      if (timeContainer && timeText) {
                                        if (timeText.scrollWidth > timeContainer.clientWidth) {
                                          timeText.classList.add('text-overflow-marquee');
                                        } else {
                                          timeText.classList.remove('text-overflow-marquee');
                                        }
                                      }
                                    }, 100);
                                  }
                                }}
                              >
                                {/* Multi-day indicators */}
                                {continuesFromPrevDay && (
                                  <div 
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-white/40 flex items-center justify-center group"
                                    title="Event continues from previous day"
                                  >
                                    <span className="text-[10px]">◀</span>
                                  </div>
                                )}
                                {continuesToNextDay && (
                                  <div 
                                    className="absolute right-0 top-0 bottom-0 w-1 bg-white/40 flex items-center justify-center group"
                                    title="Event continues to next day"
                                  >
                                    <span className="text-[10px]">▶</span>
                                  </div>
                                )}
                                
                                {isSameTime && (
                                  <div className="absolute top-0 right-0 bg-yellow-400/90 text-black text-[10px] px-1.5 py-0.5 rounded-bl font-bold z-10 animate-pulse-badge">
                                    TBD
                                  </div>
                                )}
                                <div className="px-1 overflow-hidden relative event-name-container">
                                  <div className="event-name-text">
                                    {getCategoryIcon(event.category)} {event.eventName}
                                  </div>
                                </div>
                                <div className="text-xs opacity-75 px-1 overflow-hidden relative event-time-container">
                                  <div className="event-time-text">
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
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Current Time Indicator - only show if viewing today */}
                        {selectedDate.toDateString() === new Date().toDateString() && (() => {
                          const now = currentTime;
                          const currentHour = now.getHours();
                          const currentMinute = now.getMinutes();
                          const firstHour = getActiveHours[0] || 0;
                          const lastHour = getActiveHours[getActiveHours.length - 1] || 23;
                          const totalMinutesRange = (lastHour - firstHour + 1) * 60;
                          const currentMinutesFromFirst = (currentHour - firstHour) * 60 + currentMinute;
                          
                          // Only show if current time is within the visible hour range
                          if (currentHour >= firstHour && currentHour <= lastHour) {
                            const leftPercent = (currentMinutesFromFirst / totalMinutesRange) * 100;
                            return (
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none"
                                style={{ left: `${leftPercent}%` }}
                              >
                                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Visible only on mobile */}
        <div className={`md:hidden p-4 space-y-4 ${!isTransitioning ? 'animate-scale-in' : ''}`}>
          {getVenuesForSelectedDate.length > 0 ? (
            getVenuesForSelectedDate.map((venue, venueIndex) => {
              // Get all events for this venue on the selected date
              const venueEvents = getCategoryFilteredEvents.filter(event => {
                if (event.location !== venue) return false;
                
                const eventStart = new Date(event.dateTime);
                const eventEnd = new Date(event.endDateTime);
                const dayStart = new Date(selectedDate);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(selectedDate);
                dayEnd.setHours(23, 59, 59, 999);
                
                return eventStart <= dayEnd && eventEnd >= dayStart;
              }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

              if (venueEvents.length === 0) return null;

              return (
                <div 
                  key={venue} 
                  className={`bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden ${!isTransitioning ? 'animate-fade-in-up' : ''}`}
                  style={{ 
                    animationDelay: !isTransitioning ? `${venueIndex * 80}ms` : '0ms'
                  }}
                >
                  {/* Venue Header */}
                  <div className="bg-slate-900/70 px-4 py-3 border-b border-slate-700/50">
                    <h3 className="text-white font-bold text-sm">{venue}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{venueEvents.length} event{venueEvents.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Events List */}
                  <div className="divide-y divide-slate-700/30">
                    {venueEvents.map(event => {
                      const startDate = new Date(event.dateTime);
                      const endDate = new Date(event.endDateTime);
                      const isSameTime = startDate.getTime() === endDate.getTime();

                      return (
                        <button
                          key={event._id}
                          onClick={() => {
                            setSelectedEvent(event);
                            // Navigate to event's start date
                            const eventStartDate = new Date(event.dateTime);
                            eventStartDate.setHours(0, 0, 0, 0);
                            const eventDateIndex = getAllDatesWithEvents.findIndex(d => {
                              const compareDate = new Date(d);
                              compareDate.setHours(0, 0, 0, 0);
                              return compareDate.getTime() === eventStartDate.getTime();
                            });
                            if (eventDateIndex !== -1) {
                              const centeredOffset = Math.max(0, Math.min(eventDateIndex - 1, getAllDatesWithEvents.length - 3));
                              setDateOffset(centeredOffset);
                              setSelectedDate(eventStartDate);
                            }
                          }}
                          className={`w-full p-3 text-left transition-all hover:bg-slate-800/50 ${getCategoryColor(event.category)} bg-opacity-10 border-l-4`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{getCategoryIcon(event.category)}</span>
                                <h4 className="font-semibold text-white text-sm truncate">{event.eventName}</h4>
                                {isSameTime && (
                                  <span className="bg-yellow-400/90 text-black text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 animate-pulse-badge">
                                    TBD
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <span>🕐</span>
                                <span>
                                  {startDate.toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {' '}-{' '}
                                  {endDate.toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {event.briefDescription && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.briefDescription}</p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-lg mb-2">📅</p>
              <p>No events scheduled for this date</p>
            </div>
          )}
        </div>
        </>
        ) : (
          <div className="p-8 text-center text-slate-400">
            Loading calendar...
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 pt-24"
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
                      ? 'bg-purple-600/50'
                      : 'bg-amber-600/50'
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
      </>
      )}
    </div>
  );
}