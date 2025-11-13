'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, MapPin, Users, IndianRupee, ExternalLink, Filter, Search, ChevronDown } from 'lucide-react';
import { IEvent } from '../../../models/Event';
import Link from 'next/link';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import { useAuth } from '@/lib/hooks/useAuth';
export const dynamic = 'force-dynamic';

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
    <div className="fixed inset-0 z-0 overflow-hidden">
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
          className="fixed"
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


const AlphabetIndex = ({ onLetterSelect, activeLetter, availableLetters }: { 
  onLetterSelect: (letter: string) => void, 
  activeLetter: string,
  availableLetters: string[]
}) => {
  const indexRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ letter: string; y: number } | null>(null);

  const handleLetterClick = useCallback((letter: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onLetterSelect(letter);
    const rect = event.currentTarget.getBoundingClientRect();
    setIndicator({ letter, y: rect.top + rect.height / 2 });
    setTimeout(() => setIndicator(null), 800);
  }, [onLetterSelect]);

  return (
    <>
      <div
        ref={indexRef}
        className="z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-l-xl py-3 px-2 select-none"
        style={{ 
          position: 'fixed',
          top: '50%',
          right: '0',
          transform: 'translate3d(0, -50%, 0) translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          height: 'calc(100vh - 250px)', 
          maxHeight: '450px',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTransform: 'translate3d(0, -50%, 0) translateZ(0)',
          pointerEvents: 'auto',
          WebkitPerspective: 1000,
          perspective: 1000
        }}
      >
        {availableLetters.map((letter) => (
          <div
            key={letter}
            data-letter={letter}
            onClick={(e) => handleLetterClick(letter, e)}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLetterClick(letter, e as any);
            }}
            className={`flex-1 flex items-center justify-center min-h-[18px] w-full text-[10px] sm:text-xs font-bold transition-all duration-150 cursor-pointer active:scale-110 ${
              activeLetter === letter ? 'text-[#ffd4b9] scale-125' : 'text-purple-300/80'
            }`}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
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
  const [selectedFeeType, setSelectedFeeType] = useState<string>('all');
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
  const EVENTS_PER_PAGE = 12; // Load 12 events at a time (4 rows of 3)
  const prevSearchTerm = useRef<string>('');
  const [allEventsLoaded, setAllEventsLoaded] = useState(false);

  // Society name mapping: abbreviation -> full name (matches backend abbreviations)
  const societyNameMapping: Record<string, string> = {
    // Clubs
    'Dramatics': 'Dramatics',
    'SAASC': 'SAASC',
    'APC': 'Art & Photography Club',
    'ELC': 'Electoral Literacy Club',
    'Music': 'Music Club',
    'HEB': 'Hindi Editorial Board',
    'PDC': 'Projection & Design Club',
    'PEB': 'Punjabi Editorial Board',
    'Rotaract': 'Rotaract Club',
    'SCC': 'Student Counselling Cell (SCC)',
    'CIM': 'Communication, Information & Media Cell(CIM)',
    'EIC': 'Entrepreneurship & Innovation Cell(EIC)',
    'WEC': 'Women Empowerment Cell(WEC)',
    'EEB': 'English Editorial Board',
    'NCC': 'National Cadet Corps(NCC) (Army Wing)',
    'NCC-Naval': 'National Cadet Corps (NCC)(Naval Wing)',
    'NSS': 'National NSS',
    'Sports': 'Sports',
    'DhyanKendra': 'Dhyan Kendra',
    
    // Technical Societies
    'Robotics': 'Robotics',
    'ACM': 'Association for Computer Machinery(ACM-CSS)',
    'ATS': 'Aerospace Technical Society(ATS)',
    'ASME': 'American Society of Mechanical Engineers (ASME)',
    'ASCE': 'American Society of Civil Engineers(ASCE)',
    'ASPS': 'Autonomy & Space Physics Society (ASPS)',
    'IEEE': 'Institute of Electronics & Electrical Engineers(IEEE)',
    'IGS': 'Indian Geotechnical Society(IGS)',
    'IIM': 'Indian Institute of Metals(IIM)',
    'SESI': 'Solar Energy Society of India(SESI)',
    'SAE': 'Society of Automotive Engineers(SAE)',
    'SME': 'Society of Manufacturing Engineers(SME)'
  };

  // Static list of all societies to show in filter (in alphabetical order)
  const allSocietiesForFilter = [
    'ATS', 'ASCE', 'ASME', 'APC', 'ACM', 'ASPS', 'CIM', 'DhyanKendra', 'Dramatics',
    'ELC', 'EEB', 'EIC', 'HEB', 'IGS', 'IIM', 'IEEE', 'Music', 'NCC-Naval', 'NCC',
    'NSS', 'PDC', 'PEB', 'Robotics', 'Rotaract', 'SAASC', 'SAE', 'SME', 'SESI',
    'Sports', 'SCC', 'WEC'
  ];
  
  // Create society options with full names for display
  const societyOptionsForSelect = [
    { value: 'all', label: '🏛️ All Societies' },
    ...allSocietiesForFilter.map(society => ({
      value: society, // Backend abbreviation
      label: societyNameMapping[society] || society // Display name
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

  const feeTypeOptions = [
    { value: 'all', label: '💰 All Fees' },
    { value: 'free', label: '🎉 Free' },
    { value: 'paid', label: '💳 Paid' },
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

  
  // Get available letters from currently loaded/filtered events for A-Z navigation
  // As more events load (alphabetically from backend), more letters become available
  const availableLetters = useMemo(() => {
    const letters = new Set(filteredEvents.map(e => e.eventName[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [filteredEvents]);


  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Fetch events from backend with pagination
  // Events are sorted alphabetically (A-Z) by the backend API
  const fetchEvents = useCallback(async (page: number, resetEvents: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        setEvents(prev => {
          if (resetEvents) {
            return data.events;
          }
          // Filter out duplicates when appending
          const existingIds = new Set(prev.map((e: IEvent) => e._id));
          const newEvents = data.events.filter((event: IEvent) => !existingIds.has(event._id));
          return [...prev, ...newEvents];
        });
        
        setCurrentPage(data.pagination.page);
        const morePages = data.pagination.page < data.pagination.totalPages;
        setHasMore(morePages);
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
  }, [selectedCategory]);

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
      }
    };

    loadAllEventsForSearch();
  }, [searchTerm, hasMore, loadingMore, currentPage, fetchEvents, allEventsLoaded, totalPages, EVENTS_PER_PAGE, selectedCategory]);

  // Load more when scroll reaches bottom
  useEffect(() => {
    // Wait a bit for the DOM to be ready
    const timeoutId = setTimeout(() => {
      const currentRef = loadMoreRef.current;
      
      if (!currentRef || !hasMore || loadingMore) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only load more if: intersecting, has more pages, not already loading
            if (entry.isIntersecting && hasMore && !loadingMore) {
              fetchEvents(currentPage + 1, false);
            }
          });
        },
        { 
          root: null,
          rootMargin: '300px',
          threshold: 0
        }
      );

      observer.observe(currentRef);

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentPage, hasMore, loadingMore, fetchEvents, events.length, filteredEvents.length]);

  // Filter and sort events (client-side filtering for other filters)
  // Backend already provides alphabetically sorted events, we maintain that order after filtering
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

    // Filter by fee type
    if (selectedFeeType !== 'all') {
      if (selectedFeeType === 'free') {
        result = result.filter(event => event.regFees === 0);
      } else if (selectedFeeType === 'paid') {
        result = result.filter(event => event.regFees > 0);
      }
    }

    // Filter by search term (client-side filter on already fetched search results)
    if (searchTerm) {
      result = result.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Maintain alphabetical order (events come pre-sorted from backend, but re-sort after filtering)
    result.sort((a, b) => a.eventName.localeCompare(b.eventName));

    setFilteredEvents(result);
  }, [events, selectedSociety, selectedDate, searchTerm, selectedEventType, selectedFeeType]);

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

  // Handle A-Z index navigation - scroll to the selected letter's section
  const handleLetterSelect = (letter: string) => {
    const element = sectionRefs.current[letter];
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
      timeZone: 'UTC',
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
      
      <main className="min-h-screen bg-blue-800/5 text-white">
        <AnimatedBackground />

        {/* 4 Lanterns - 2 on each side */}
        <FloatingLantern duration={18} size={50} x="15%" y="5%" delay={0} />    {/* Leftmost, long */}
        <FloatingLantern duration={15} size={28} x="2%" y="15%" delay={1.2} /> {/* Inner left, short */}
        <FloatingLantern duration={17} size={28} x="80%" y="8%" delay={0.5} />  {/* Rightmost, long */}
        <FloatingLantern duration={14} size={27} x="95%" y="18%" delay={1.8} />  {/* Inner right, short */}

        {/* Header Section */}
        <div className="relative pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 z-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Decorative Arabic Pattern */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
                <div className="mx-3 sm:mx-4 w-2 h-2 bg-[#ed6ab8] rounded-full"></div>
                <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-transparent via-[#fea6cc] to-transparent"></div>
              </div>
              
              <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl py-2 gradient-title drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] mb-4 sm:mb-6 tracking-wider">
                EVENTS
              </h1>
              
              {/* Decorative Arabic Pattern */}
              <div className="mt-4 sm:mt-6 flex justify-center">
                <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-transparent via-[#fea7a0] to-transparent"></div>
                <div className="mx-2 sm:mx-3 w-1 h-1 bg-[#ffd4b9] rounded-full"></div>
                <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
              </div>
            </motion.div>

            
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="sticky top-20 mx-2 sm:mx-4 md:mx-auto max-w-4xl rounded-full z-30 py-2 sm:py-3 bg-blue-800/10 backdrop-blur-lg shadow-lg" ref={filterMenuRef}>
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 flex items-center gap-2 md:gap-4">
            

            {/* Search Bar */}
            <div className="relative flex-grow md:flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#ffd4b9] w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 font-medium transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white text-sm sm:text-base font-medium hover:border-purple-400/80 transition-all whitespace-nowrap"
              >
                <Filter size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown size={14} className={`sm:w-4 sm:h-4 transform transition-transform ${isFilterMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
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

                  <CustomSelect
                    options={feeTypeOptions}
                    value={selectedFeeType}
                    onChange={(value) => setSelectedFeeType(value as string)}
                    placeholder="💰 All Fees"
                  />


                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Indicator */}
        {searchTerm && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#2a0a56]/60 to-[#4321a9]/60 backdrop-blur-md border border-[#b53da1]/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#fea6cc] flex-shrink-0" />
                <span className="text-white text-sm sm:text-base font-medium">
                  Found <span className="text-[#ffd4b9] font-bold">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} for <span className="truncate max-w-[150px] sm:max-w-none inline-block">"{searchTerm}"</span>
                </span>
              </div>
              {!allEventsLoaded && hasMore && (
                <span className="text-[#fea6cc] text-xs sm:text-sm flex items-center gap-2">
                  <span className="animate-pulse">●</span>
                  Loading more...
                </span>
              )}
            </motion.div>
          </div>
        )}

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-20 sm:pb-24 relative z-10">
          {filteredEvents.length === 0 && !loading && events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-20"
            >
              <div className="text-5xl sm:text-6xl md:text-8xl mb-4 sm:mb-6 animate-pulse">📜</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ffd4b9] mb-3 sm:mb-4 font-display px-4">No Events Found</h3>
              <p className="text-base sm:text-lg md:text-xl text-[#fea6cc] font-arabian mb-2 px-4">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : filteredEvents.length === 0 && !loading && events.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-20"
            >
              <div className="text-5xl sm:text-6xl md:text-8xl mb-4 sm:mb-6 animate-pulse">🔍</div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ffd4b9] mb-3 sm:mb-4 font-display px-4">No Matching Events</h3>
              <p className="text-base sm:text-lg md:text-xl text-[#fea6cc] font-arabian mb-2 px-4">Try a different search term or adjust your filters</p>
            </motion.div>
          ) : null}
          
          {filteredEvents.length > 0 && (
            <div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                            src={event.image?.includes('PECFEST 2025') ? '/final.png' : (event.image || '/final.png')}
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
                                timeZone: 'UTC',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'Date TBA'}
                            </div>
                            <div className="text-xs text-[#ffd4b9]/70">
                              🕒 {event.dateTime ? new Date(event.dateTime).toLocaleTimeString('en-US', {
                                timeZone: 'UTC',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Time TBA'}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                            <button 
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowRegistrationForm(true);
                              }}
                              className="flex-1 bg-gradient-to-r from-[#fea6cc] to-[#ffd4b9] text-[#010101] font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-[#ffd4b9] hover:to-[#fea7a0] transition-all duration-300 active:scale-95 sm:hover:scale-105 font-arabian text-base sm:text-lg shadow-lg hover:shadow-xl"
                            >
                              Register Now
                            </button>
                            
                            <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Link href={`/events/${event.eventId}`} className="flex items-center justify-center bg-gradient-to-r from-[#2a0a56]/80 to-[#4321a9]/80 border-2 border-[#b53da1]/50 text-[#ffd4b9] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-gradient-to-r hover:from-[#b53da1]/40 hover:to-[#ed6ab8]/40 hover:border-[#fea6cc] transition-all duration-300 shadow-lg hover:shadow-xl">
                                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Scroll-based Loading Indicator */}
              <div 
                ref={loadMoreRef} 
                className="mt-8 sm:mt-12 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] gap-3 sm:gap-4 rounded-xl p-4 sm:p-6"
                style={{ border: '2px dashed rgba(254, 166, 204, 0.3)', backgroundColor: 'rgba(42, 10, 86, 0.2)' }}
              >
                {loadingMore && (
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#fea6cc] border-t-transparent rounded-full"
                    />
                    <p className="text-[#fea6cc] text-xs sm:text-sm">Loading more events...</p>
                  </div>
                )}
                {!loadingMore && hasMore && !searchTerm && (
                  <div className="text-center px-4">
                    <div className="text-[#fea6cc] text-sm sm:text-base font-medium mb-2 sm:mb-3">
                      👇 Scroll down for more events
                    </div>
                    <p className="text-[#fea6cc]/50 text-xs">
                      Loaded {events.length} of {totalPages * EVENTS_PER_PAGE} events
                    </p>
                  </div>
                )}
                {searchTerm && (
                  <div className="text-center text-[#fea6cc]/70 text-xs sm:text-sm px-4">
                    🔍 Showing all search results
                  </div>
                )}
                {!hasMore && events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6 sm:py-8 px-4"
                  >
                    <div className="text-[#ffd4b9] text-base sm:text-lg font-medium">✨ You've reached the end ✨</div>
                    <p className="text-[#fea6cc] text-xs sm:text-sm mt-2">All {events.length} events loaded</p>
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
        {showAlphabetIndex && availableLetters.length > 0 && (
          <AlphabetIndex onLetterSelect={handleLetterSelect} activeLetter={activeLetter} availableLetters={availableLetters} />
        )}
      </main>
    </>
  );
}