'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, MapPin, Users, IndianRupee, ExternalLink, Filter, Search, ChevronDown } from 'lucide-react';
import { IEvent } from '../../../models/Event';
import Link from 'next/link';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import { useAuth } from '@/lib/hooks/useAuth';

const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const generatedStars = Array.from({ length: 400 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 0.5}px`,
      duration: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setStars(generatedStars);
  }, []);

  if (!isClient) return null;

  return (
    <>
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute bg-[#ffd4b9] rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [star.opacity, star.opacity + 0.6, star.opacity] }}
          transition={{ duration: star.duration, repeat: Infinity, repeatType: 'mirror' }}
        />
      ))}
    </>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <TwinklingStars />
    </div>
  );
};


const CustomSelect = ({ options, value, onChange, placeholder }: {
  options: { value: string, label: string }[],
  value: string,
  onChange: (value: string) => void,
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* 1. Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center pl-4 pr-3 py-2.5 bg-black/30 border-2 border-purple-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all hover:border-purple-400/70"
      >
        <span className={selectedOption ? 'text-white' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-purple-400 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* 2. Dropdown Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 5 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-gradient-to-b from-[#2a0a56]/90 to-[#140655]/90 backdrop-blur-lg rounded-xl shadow-2xl p-2 origin-top border border-purple-500/50 max-h-60 overflow-y-auto custom-scrollbar"
        >
          {/* Custom Scrollbar Styles */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #b53da1; border-radius: 10px; border: 1px solid #2a0a56; }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #b53da1 #2a0a56; }
          `}</style>
          
          <ul className="space-y-1">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all ${
                  option.value === value
                    ? 'bg-gradient-to-r from-[#ed6ab8] to-[#b53da1] text-white font-bold'
                    : 'text-slate-200 hover:bg-white/10 hover:text-[#ffd4b9]'
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};


const FloatingLantern = ({ duration, size, x, y, delay }: { duration: number, size: number, x: string, y: string, delay: number }) => {
  return (
      <motion.div
          className="absolute"
          style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 5 }} 
          animate={{ y: [0, -20, 0], x: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay }}
      >
          <div 
              className="absolute bottom-full left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#ed6ab8]/0 via-[#ed6ab8]/80 to-[#fea6cc]"
              style={{ height: '100vh' }} 
          />
          <div className="w-2/3 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-t-full" style={{ boxShadow: `0 0 ${size / 1.5}px rgba(237, 106, 184, 0.3)`}}></div>
         
          <div 
              className="w-full h-4/6 bg-gradient-to-t from-[#b53da1]/60 to-[#ed6ab8]/60 rounded-t-full rounded-b-xl border-t-2 border-[#4321a9]" 
              style={{ opacity: 0.7, boxShadow: `0 0 ${size * 1.5}px ${size / 1.5}px rgba(237, 106, 184, 0.4)` }}
          >
              <div className="w-full h-1/4 bg-[#4321a9]/40 rounded-b-xl"></div>
          </div>
          <div className="w-1/2 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-b-full"></div>
      </motion.div>
  );
};


const AlphabetIndex = ({ onLetterSelect, activeLetter }: { onLetterSelect: (letter: string) => void, activeLetter: string }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const indexRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [indicator, setIndicator] = useState<{ letter: string; y: number } | null>(null);

  const handleInteraction = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const y = clientY - rect.top;
    const percent = y / rect.height;
    const index = Math.floor(percent * alphabet.length);
    const letter = alphabet[index];

    if (letter) {
      onLetterSelect(letter);
      const letterElement = target.children[index] as HTMLElement;
      if (letterElement) {
        const letterRect = letterElement.getBoundingClientRect();
        setIndicator({ letter, y: letterRect.top + letterRect.height / 2 });
      }
    }
  }, [alphabet, onLetterSelect]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleInteraction(event as any);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleInteraction(event as any);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setTimeout(() => setIndicator(null), 500);
  };

  const handlePointerLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => setIndicator(null), 500);
    }
  };

  return (
    <>
      <div
        ref={indexRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-l-full py-2 px-1 sm:px-2 cursor-pointer touch-none"
        style={{ height: 'calc(100vh - 200px)', maxHeight: '520px' }}
      >
        {alphabet.map(letter => (
          <div
            key={letter}
            data-letter={letter}
            className={`flex-1 flex items-center justify-center text-xs sm:text-base font-bold transition-all duration-200 ${
              activeLetter === letter ? 'text-[#ffd4b9] scale-150' : 'text-purple-300/70 hover:text-white'
            }`}
          >
            {letter}
          </div>
        ))}
      </div>
      {indicator && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed right-16 w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl font-bold pointer-events-none z-50"
          style={{ top: indicator.y - 32 }}
        >
          {indicator.letter}
        </motion.div>
      )}
    </>
  );
};



export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showAlphabetIndex, setShowAlphabetIndex] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeLetter, setActiveLetter] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const { user } = useAuth();
  const [isFilterBarSticky, setIsFilterBarSticky] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const EVENTS_PER_PAGE = 12;
  const prevSearchTerm = useRef<string>('');
  const [allEventsLoaded, setAllEventsLoaded] = useState(false);

  const societiesAndClubs = [
    // CLUBS
    "Rotaract Club", "Projection & Design Club", "Music Club", "English Editorial Board",
    "Hindi Editorial Board", "Punjabi Editorial Board", "SAASC", "Dramatics",
    "Art & Photography Club", "Electoral Literacy Club",
    // TECHNICAL SOCIETIES
    "Indian Institute of Metals(IIM)", "Indian Geotechnical Society(IGS)",
    "Solar Energy Society of India(SESI)", "Robotics", "Society of Automotive Engineers(SAE)",
    "Institute of Electronics & Electrical Engineers(IEEE)", "Society of Manufacturing Engineers(SME)",
    "Autonomy & Space Physics Society (ASPS)", "American Society of Civil Engineers(ASCE)",
    "Association for Computer Machinery(ACM-CSS)", "American Society of Mechanical Engineers (ASME)",
    "Aerospace Technical Society(ATS)",
    // Cells
    "Student Counselling Cell (SCC)", "Communication, Information & Media Cell(CIM)",
    "Entrepreneurship & Innovation Cell(EIC)", "Women Empowerment Cell(WEC)"
  ,
    // Others
    "National Cadet Corps(NCC) (Army Wing)",
    "National Cadet Corps (NCC)(Naval Wing)",
    "National NSS",
    "Sports",
    "Dhyan Kendra"].sort();

  const uniqueCategories = ['all', ...Array.from(new Set(events.map(e => e.category)))];
  
  // Use the static list
  const societyOptionsForSelect = [
    { value: 'all', label: '🏛️ All Societies' },
    ...societiesAndClubs.map(society => ({
      value: society,
      label: society
    }))
  ];

  const categoryOptions = [
    { value: 'all', label: '🌟 All Categories' },
    { value: 'technical', label: '⚙️ Technical' },
    { value: 'cultural', label: '🎭 Cultural' },
  ];

  const dateOptions = [
    { value: 'all', label: '📅 All Dates' },
    { value: '21', label: '21 November' },
    { value: '22', label: '22 November' },
    { value: '23', label: '23 November' },
  ];

  const eventTypeOptions = [
    // { value: 'all', label: '👥 Team/Individual' },
    { value: 'individual', label: '👤 Individual' },
    { value: 'team', label: '👥 Team' },
  ];

  const selectedCategoryLabel = categoryOptions.find(c => c.value === selectedCategory)?.label;
  const selectedDateLabel = dateOptions.find(d => d.value === selectedDate)?.label;

  const filterMenuRef = useRef<HTMLDivElement>(null);

  const closeFilterMenu = useCallback(() => {
    setIsFilterMenuOpen(false);
  }, []);

  
  // const groupedEvents = useMemo(() => {
  //   const groups: { [key: string]: IEvent[] } = {};
  //   filteredEvents.forEach(event => {
  //     const firstLetter = event.eventName[0].toUpperCase();
  //     if (!groups[firstLetter]) {
  //       groups[firstLetter] = [];
  //     }
  //     groups[firstLetter].push(event);
  //   });
  //   return Object.keys(groups).sort().reduce(
  //     (acc, key) => { 
  //       acc[key] = groups[key];
  //       return acc;
  //     }, 
  //     {} as { [key: string]: IEvent[] }
  //   );
  // }, [filteredEvents]);

  
  const availableLetters = useMemo(() => {
    const letters = new Set(filteredEvents.map(e => e.eventName[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [filteredEvents]);


  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Fetch events from backend with pagination
  const fetchEvents = useCallback(async (page: number, resetEvents: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`Fetching events page ${page}...`);
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: EVENTS_PER_PAGE.toString(),
      });
      
      // Add category filter if selected
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/events?${params.toString()}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Events data:', data);
      
      if (data.events && data.events.length > 0) {
        setEvents(prev => {
          if (resetEvents) {
            return data.events;
          }
          // Filter out duplicates when appending
          const existingIds = new Set(prev.map(e => e._id));
          const newEvents = data.events.filter((event: IEvent) => !existingIds.has(event._id));
          return [...prev, ...newEvents];
        });
        setCurrentPage(data.pagination.page);
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setTotalPages(data.pagination.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, EVENTS_PER_PAGE]);

  // Initial fetch
  useEffect(() => {
    setCurrentPage(1);
    setEvents([]);
    setHasMore(true);
    setAllEventsLoaded(false);
    fetchEvents(1, true);
  }, [selectedCategory, fetchEvents]);

  // When user starts searching, automatically load all events in background
  useEffect(() => {
    const loadAllEventsForSearch = async () => {
      // Only load all events if user is searching and we haven't loaded all yet
      if (searchTerm.trim() && hasMore && !loadingMore && !allEventsLoaded) {
        console.log('🔍 Search detected, silently loading all events in background...');
        
        // Load all remaining pages silently in background
        let currentLoadPage = currentPage + 1;
        let stillHasMore: boolean = true;
        
        while (stillHasMore && currentLoadPage <= totalPages) {
          try {
            const params = new URLSearchParams({
              page: currentLoadPage.toString(),
              limit: EVENTS_PER_PAGE.toString(),
            });
            
            if (selectedCategory !== 'all') {
              params.append('category', selectedCategory);
            }
            
            const response = await fetch(`/api/events?${params.toString()}`);
            const data = await response.json();
            
            if (data.events && data.events.length > 0) {
              // Filter out duplicates by checking _id
              setEvents(prev => {
                const existingIds = new Set(prev.map(e => e._id));
                const newEvents = data.events.filter((event: IEvent) => !existingIds.has(event._id));
                return [...prev, ...newEvents];
              });
              stillHasMore = data.pagination.page < data.pagination.totalPages;
              currentLoadPage++;
            } else {
              stillHasMore = false;
            }
            
            // Small delay to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error('Error loading events in background:', error);
            break;
          }
        }
        
        setAllEventsLoaded(true);
        setHasMore(false);
        console.log('✅ All events loaded for comprehensive search');
      }
    };

    loadAllEventsForSearch();
  }, [searchTerm, hasMore, loadingMore, currentPage, fetchEvents, allEventsLoaded, totalPages, EVENTS_PER_PAGE, selectedCategory]);

  // Load more when scroll reaches bottom
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    console.log('🔄 IntersectionObserver setup:', { 
      currentRef: !!currentRef, 
      hasMore, 
      loadingMore, 
      currentPage,
      eventsCount: events.length
    });
    
    // Don't set up observer until we have events loaded
    if (events.length === 0) {
      console.log('⏸️ Waiting for initial events to load');
      return;
    }
    
    if (!currentRef) {
      console.log('❌ No ref found');
      return;
    }

    if (!hasMore) {
      console.log('⏸️ No more events to load');
      return;
    }

    if (loadingMore) {
      console.log('⏸️ Already loading');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        console.log('👁️ IntersectionObserver callback:', { 
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          hasMore,
          loadingMore
        });
        
        if (entry.isIntersecting) {
          console.log('✅ INTERSECTION DETECTED - Loading next page...');
          const nextPage = currentPage + 1;
          console.log('📄 Calling fetchEvents for page:', nextPage);
          fetchEvents(nextPage, false);
        }
      },
      { 
        threshold: 0,
        rootMargin: '300px'
      }
    );

    observer.observe(currentRef);
    console.log('✅ Observer attached successfully to element:', currentRef);

    return () => {
      console.log('🧹 Cleaning up observer');
      observer.disconnect();
    };
  }, [hasMore, loadingMore, currentPage, fetchEvents]);

  // Filter and sort events (client-side filtering for other filters)
  useEffect(() => {
    let result = [...events];

    // Filter by society
    if (selectedSociety !== 'all') {
      result = result.filter(event => event.societyName === selectedSociety);
    }

    // Filter by date
    if (selectedDate !== 'all') {
      const day = parseInt(selectedDate, 10);
      result = result.filter(event => new Date(event.dateTime).getDate() === day);
    }

    // Filter by event type
    if (selectedEventType !== 'all') {
      result = result.filter(event => 
        selectedEventType === 'team' ? event.isTeamEvent : !event.isTeamEvent
      );
    }

    // Filter by search term (client-side filter on already fetched search results)
    if (searchTerm) {
      result = result.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort events
    result.sort((a, b) => a.eventName.localeCompare(b.eventName));

    setFilteredEvents(result);
  }, [events, selectedSociety, selectedDate, searchTerm, selectedEventType]);

  // Detect if the filter bar is sticky
  useEffect(() => {
    const handleScroll = () => {
      if (filterMenuRef.current) {
        const { top } = filterMenuRef.current.getBoundingClientRect();
        // top-20 in tailwind is 5rem = 80px.
        // We check if the element's top position is at or above the sticky position.
        setIsFilterBarSticky(top <= 80);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show/hide alphabet index on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowAlphabetIndex(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setShowAlphabetIndex(false);
      }, 10000); // Hide after 3 seconds of inactivity
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleLetterSelect = (letter: string) => {
    let targetLetter = letter;
    if (!availableLetters.includes(targetLetter)) {
      const prevLetters = availableLetters.filter(l => l < targetLetter);
      const nextLetters = availableLetters.filter(l => l > targetLetter);

      const prev = prevLetters.length > 0 ? prevLetters[prevLetters.length - 1] : null;
      const next = nextLetters.length > 0 ? nextLetters[0] : null;

      if (prev && next) {
        const distToPrev = targetLetter.charCodeAt(0) - prev.charCodeAt(0);
        const distToNext = next.charCodeAt(0) - targetLetter.charCodeAt(0);
        targetLetter = distToNext <= distToPrev ? next : prev;
      } else if (next) {
        targetLetter = next;
      } else if (prev) {
        targetLetter = prev;
      } else {
        return;
      }
    }
    const element = sectionRefs.current[targetLetter];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Observer for active letter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const letter = (entry.target as HTMLElement).dataset.letter;
            if (letter) {
              setActiveLetter(letter);
            }
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
        // Disconnect from all observed elements
        Object.values(sectionRefs.current).forEach(el => {
            if (el) observer.unobserve(el);
        });
    };
  }, [filteredEvents]); // MODIFIED: Re-run when filteredEvents changes


  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        closeFilterMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeFilterMenu]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'from-[#4321a9]/25 to-[#2a0a56]/25 border-[#642aa5]/50 text-[#fea6cc]'; // Lighter Violet/Dark Purple
      case 'cultural':
        return 'from-[#642aa5]/25 to-[#4321a9]/25 border-[#b53da1]/50 text-[#fea6cc]'; // Lighter Mid Purple/Violet
      default:
        return 'from-[#2a0a56]/20 to-[#140655]/20 border-[#2a0a56]/40 text-[#fea6cc]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return '⚙️';
      case 'cultural':
        return '🎭';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#140655] via-[#4321a9] to-[#2a0a56] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#fea6cc] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .arabian-border {
          border-image: linear-gradient(45deg, #b53da1, #ed6ab8, #fea6cc, #ffd4b9) 1;
        }
        @supports (background-clip: text) {
          .gradient-title {
            color: white;
            background: linear-gradient(to right, #ffd4b9, #fea6cc, #ed6ab8);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        @supports not (background-clip: text) {
          .gradient-title {
            color: #ffd4b9;
          }
        }
      `}</style>
      
      <main className="min-h-screen bg-blue-800/5 text-white relative">
        <AnimatedBackground />

        {/* 4 Lanterns - 2 on each side */}
        <FloatingLantern duration={18} size={50} x="15%" y="5%" delay={0} />    {/* Leftmost, long */}
        <FloatingLantern duration={15} size={28} x="2%" y="15%" delay={1.2} /> {/* Inner left, short */}
        <FloatingLantern duration={17} size={28} x="80%" y="8%" delay={0.5} />  {/* Rightmost, long */}
        <FloatingLantern duration={14} size={27} x="95%" y="18%" delay={1.8} />  {/* Inner right, short */}

        {/* Header Section */}
        <div className="relative pt-24 pb-8 px-4 z-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Decorative Arabic Pattern */}
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
                <div className="mx-4 w-2 h-2 bg-[#ed6ab8] rounded-full"></div>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#fea6cc] to-transparent"></div>
              </div>
              
              <h1 className="font-display text-6xl sm:text-7xl md:text-9xl py-2 gradient-title drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] mb-6 tracking-wider">
                EVENTS
              </h1>
              
              {/* Decorative Arabic Pattern */}
              <div className="mt-6 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#fea7a0] to-transparent"></div>
                <div className="mx-3 w-1 h-1 bg-[#ffd4b9] rounded-full"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
              </div>
            </motion.div>

            
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="sticky top-20 mx-2 sm:mx-4 md:mx-auto max-w-4xl rounded-full z-30 py-2 sm:py-4 bg-blue-800/10 backdrop-blur-lg shadow-lg" ref={filterMenuRef}>
          <div className="max-w-4xl mx-auto px-4 md:px-6 flex items-center gap-2 md:gap-4">
            

            {/* Search Bar */}
            <div className="relative flex-grow md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#ffd4b9] w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white font-medium hover:border-purple-400/80 transition-all"
              >
                <Filter size={16} />
                <span className="hidden md:inline">Filters</span>
                <ChevronDown size={16} className={`transform transition-transform ${isFilterMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Filters Dropdown Menu */}
              {isFilterMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 z-40 w-64 bg-gradient-to-b from-blue-900/70 to-indigo-900/70 backdrop-blur-lg rounded-2xl shadow-2xl p-4 space-y-3 origin-top-right border border-purple-500/30"
                >
                  
                  
                  <CustomSelect
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value as string)}
                    placeholder="🌟 All Categories"
                  />

                  <CustomSelect
                    options={societyOptionsForSelect}
                    value={selectedSociety}
                    onChange={(value) => setSelectedSociety(value as string)}
                    placeholder="🏛️ All Societies"
                  />

                  <CustomSelect
                    options={dateOptions}
                    value={selectedDate}
                    onChange={(value) => setSelectedDate(value as string)}
                    placeholder="📅 All Dates"
                  />

                  <CustomSelect
                    options={eventTypeOptions}
                    value={selectedEventType}
                    onChange={(value) => setSelectedEventType(value as string)}
                    placeholder="👥 All Types"
                  />


                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Indicator */}
        {searchTerm && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#2a0a56]/60 to-[#4321a9]/60 backdrop-blur-md border border-[#b53da1]/50 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#fea6cc]" />
                <span className="text-white font-medium">
                  Found <span className="text-[#ffd4b9] font-bold">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
              </div>
              {!allEventsLoaded && hasMore && (
                <span className="text-[#fea6cc] text-sm flex items-center gap-2">
                  <span className="animate-pulse">●</span>
                  Loading more...
                </span>
              )}
            </motion.div>
          </div>
        )}

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-24 relative z-10">
          {filteredEvents.length === 0 && !loading && events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl sm:text-8xl mb-6 animate-pulse">📜</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#ffd4b9] mb-4 font-display">No Events Found</h3>
              <p className="text-lg sm:text-xl text-[#fea6cc] font-arabian mb-2">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : filteredEvents.length === 0 && !loading && events.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl sm:text-8xl mb-6 animate-pulse">🔍</div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#ffd4b9] mb-4 font-display">No Matching Events</h3>
              <p className="text-lg sm:text-xl text-[#fea6cc] font-arabian mb-2">Try a different search term or adjust your filters</p>
            </motion.div>
          ) : null}
          
          {filteredEvents.length > 0 && (
            <div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => {
                  
                  // Check if this is the first event for its letter
                  const firstLetter = event.eventName[0].toUpperCase();
                  const isFirstOfLetter = index === 0 || event.eventName[0].toUpperCase() !== filteredEvents[index - 1].eventName[0].toUpperCase();

                  return (
                    <motion.div
                      key={`${event._id}-${event.eventId}-${index}`}
                      // Conditionally add the ref and data-letter for the alphabet index
                      ref={isFirstOfLetter ? el => { sectionRefs.current[firstLetter] = el; } : null}
                      data-letter={isFirstOfLetter ? firstLetter : null}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      whileHover={{ y: -15, scale: 1.03 }}
                      className="group"
                    >
                      <div className={`relative bg-gradient-to-br ${getCategoryColor(event.category)} backdrop-blur-lg rounded-3xl p-6 border h-full flex flex-col transition-all duration-500 hover:shadow-3xl hover:shadow-[#b53da1]/30`}>
                        {/* Category Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-gradient-to-r from-[#b53da1]/20 to-[#ed6ab8]/20 backdrop-blur-sm rounded-full p-3 border border-[#b53da1]/40">
                            <span className="text-3xl">{getCategoryIcon(event.category)}</span>
                          </div>
                        </div>

                        {/* Event Image */}
                        <div className="rounded-2xl overflow-hidden border-2 border-[#b53da1]/30 aspect-square bg-black/20 flex items-center justify-center">
                          <img
                            src={event.image?.includes('PECFEST_2024') ? '/final.png' : (event.image || '/final.png')}
                            alt={event.eventName}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Event Name & Actions */}
                        <div className="flex-1 flex flex-col mt-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-[#ffd4b9] transition-colors duration-300 font-display text-center flex-1">
                            {event.eventName}
                          </h3>

                          {/* Event Date & Time Display */}
                          <div className="mt-3 space-y-1 text-center">
                            <div className="text-xs text-[#fea6cc] font-semibold">
                              📅 {event.dateTime ? new Date(event.dateTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'Date TBA'}
                            </div>
                            <div className="text-xs text-[#ffd4b9]/70">
                              🕒 {event.dateTime ? new Date(event.dateTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Time TBA'}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-6">
                            <button 
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowRegistrationForm(true);
                              }}
                              className="flex-1 bg-gradient-to-r from-[#fea6cc] to-[#ffd4b9] text-[#010101] font-bold py-3 px-6 rounded-2xl hover:from-[#ffd4b9] hover:to-[#fea7a0] transition-all duration-300 transform hover:scale-105 font-arabian text-lg shadow-lg hover:shadow-xl"
                            >
                              Register Now
                            </button>
                            
                            <motion.div whileHover={{ y: -2, scale: 1.05 }}>
                              <Link href={`/events/${event.eventId}`} className="flex items-center justify-center bg-gradient-to-r from-[#2a0a56]/80 to-[#4321a9]/80 border-2 border-[#b53da1]/50 text-[#ffd4b9] p-3 rounded-2xl hover:bg-gradient-to-r hover:from-[#b53da1]/40 hover:to-[#ed6ab8]/40 hover:border-[#fea6cc] transition-all duration-300 shadow-lg hover:shadow-xl">
                                <ExternalLink className="w-5 h-5" />
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Loading More Indicator */}
              <div 
                ref={loadMoreRef} 
                className="mt-12 flex flex-col items-center justify-center min-h-[120px] gap-4 rounded-xl p-6"
                style={{ border: '2px dashed rgba(254, 166, 204, 0.3)', backgroundColor: 'rgba(42, 10, 86, 0.2)' }}
              >
                {loadingMore && (
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-[#fea6cc] border-t-transparent rounded-full"
                    />
                    <p className="text-[#fea6cc] text-sm">Loading more events...</p>
                  </div>
                )}
                {!loadingMore && hasMore && !searchTerm && (
                  <div className="text-center">
                    <div className="text-[#fea6cc] text-base font-medium mb-3">
                      👇 Scroll to load more events
                    </div>
                    <p className="text-[#fea6cc]/50 text-xs mb-4">
                      ({events.length} of {totalPages * 12} total)
                    </p>
                    <button
                      onClick={() => {
                        console.log('🖱️ Manual load button clicked');
                        const nextPage = currentPage + 1;
                        setCurrentPage(nextPage);
                        fetchEvents(nextPage, false);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-medium rounded-full hover:from-[#ed6ab8] hover:to-[#fea6cc] transition-all"
                    >
                      Load More Events
                    </button>
                  </div>
                )}
                {searchTerm && (
                  <div className="text-center text-[#fea6cc]/70 text-sm">
                    🔍 Showing all search results
                  </div>
                )}
                {!hasMore && events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="text-[#ffd4b9] text-lg font-medium">✨ You've reached the end ✨</div>
                    <p className="text-[#fea6cc] text-sm mt-2">All {events.length} events loaded</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedEvent && (
          <EventRegistrationForm
            event={selectedEvent!}
            onClose={() => {
              setShowRegistrationForm(false);
              setSelectedEvent(null);
            }}
            onSuccess={() => {
              setShowRegistrationForm(false);
              setSelectedEvent(null);
            }}
          />
        )}

        {/* Alphabet Index */}
        <AnimatePresence>
          {showAlphabetIndex && availableLetters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <AlphabetIndex onLetterSelect={handleLetterSelect} activeLetter={activeLetter} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}