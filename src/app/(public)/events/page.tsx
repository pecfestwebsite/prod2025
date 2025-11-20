'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, MapPin, Users, IndianRupee, ExternalLink, Filter, Search, ChevronDown, Share2, Clock } from 'lucide-react';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { IEvent } from '../../../models/Event';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';

const EventRegistrationForm = dynamic(() => import('@/components/EventRegistrationForm'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"><div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>,
  ssr: false
});

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  opacity: number;
}

interface CanvasStar extends Star {
  baseOpacity: number;
}

const TwinklingStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<CanvasStar[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    starsRef.current = Array.from({ length: 400 }).map((_, i) => {
      const baseOpacity: number = Math.random() * 0.5 + 0.2;
      return {
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        duration: Math.random() * 2 + 1.5,
        opacity: baseOpacity,
        baseOpacity: baseOpacity,
      };
    });

    let startTime = Date.now();

    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        const cycle = (elapsedTime / star.duration) * Math.PI;
        star.opacity = star.baseOpacity + (Math.sin(cycle) * (1 - star.baseOpacity) * 0.8);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 212, 185, ${star.opacity})`;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  );
};

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <TwinklingStars />
    </div>
  );
};

const ShimmerCard = () => (
  <div className="relative bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-transparent backdrop-blur-sm rounded-2xl border-2 border-purple-500/20 overflow-hidden h-[600px]">
    <div className="absolute inset-0 w-full h-full shimmer-animation" />
    <div className="flex flex-col h-full">
      <div className="h-2/3 bg-purple-800/20" />
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-purple-700/30 rounded-lg" />
        <div className="h-4 bg-purple-700/20 rounded-lg w-1/2" />
        <div className="h-4 bg-purple-700/20 rounded-lg w-2/3" />
      </div>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#140655] via-[#4321a9] to-[#2a0a56] pt-32">
    <div className="max-w-7xl mx-auto px-4">
      {/* Header Skeleton */}
      <div className="text-center mb-16">
        <div className="h-24 w-3/4 mx-auto bg-purple-800/20 rounded-lg shimmer-animation" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="hidden md:block mb-8">
        <div className="h-16 w-full max-w-3xl mx-auto bg-purple-800/20 rounded-full shimmer-animation" />
      </div>
      <div className="md:hidden mb-8">
        <div className="h-12 w-full bg-purple-800/20 rounded-lg shimmer-animation" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2">
        {[...Array(6)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    </div>
  </div>
);


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
        className="w-full flex justify-between items-center pl-3 pr-2 py-2 bg-gradient-to-r from-purple-900/80 to-violet-900/80 border border-purple-400/60 rounded-lg text-sm text-white focus:outline-none focus:border-purple-300 font-medium transition-all hover:border-purple-300/80 hover:from-purple-800/80 hover:to-violet-800/80"
      >
        <span className={selectedOption ? 'text-purple-100 font-medium' : 'text-purple-200/80'}>
          {selectedOption ? selectedOption.label.replace(/[🌟📅🏛️👥⚙️🎭👤]/g, '') : placeholder}
        </span>
        <ChevronDown size={14} className={`text-purple-300 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* 2. Dropdown Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 5 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-1 z-[200] bg-gradient-to-b from-purple-800/95 to-violet-900/95 backdrop-blur-xl rounded-xl shadow-2xl p-2 origin-top border border-purple-400/60 max-h-60 overflow-y-auto custom-scrollbar"
        >
          {/* Custom Scrollbar Styles */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #a855f7; border-radius: 10px; border: 1px solid #7c3aed; }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #a855f7 #7c3aed; }
          `}</style>
          
          <ul className="space-y-1">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all ${
                  option.value === value
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold shadow-lg'
                    : 'text-purple-100 hover:bg-purple-700/40 hover:text-white'
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
        style={{ height: 'calc(100vh - 200px)', maxHeight: '520px', willChange: 'transform' }}
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
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
  const parallaxRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Smooth parallax scroll effect
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.2}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Snap scroll when search bar leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            window.scrollTo({ top: entry.target.getBoundingClientRect().bottom + window.scrollY, behavior: 'smooth' });
          }
        });
      },
      { threshold: [0], rootMargin: '-1px 0px 0px 0px' }
    );

    if (searchBarRef.current) {
      observer.observe(searchBarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mark initial load completion once data is fetched
  useEffect(() => {
    if (!loading && !hasLoadedInitialData) {
      setHasLoadedInitialData(true);
    }
  }, [loading, hasLoadedInitialData]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const closeFilterMenu = useCallback(() => {
    setIsFilterMenuOpen(false);
  }, []);

  const availableLetters = useMemo(() => {
    const letters = new Set(filteredEvents.map(e => e.eventName[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [filteredEvents]);


  // Fetch events with pagination - 12 at a time
  const fetchEvents = useCallback(async (page: number, resetEvents: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`Fetching events page ${page}...`);
      
      // Build query params - bypass limit for search
      const params = new URLSearchParams({
        page: page.toString(),
        limit: debouncedSearchTerm.trim() ? '1000' : EVENTS_PER_PAGE.toString(),
      });
      
      // Add filters
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedSociety !== 'all') {
        params.append('society', selectedSociety);
      }
      if (selectedDate !== 'all') {
        params.append('date', selectedDate);
      }
      if (selectedEventType !== 'all') {
        params.append('eventType', selectedEventType);
      }
      if (debouncedSearchTerm.trim()) {
        params.append('search', debouncedSearchTerm.trim());
      }
      
      const response = await fetch(`/api/events?${params.toString()}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Events data:', data);
      
      if (data.events && data.events.length > 0) {
        setEvents(prev => resetEvents ? data.events : [...prev, ...data.events]);
        setHasMore(debouncedSearchTerm.trim() ? false : data.pagination.page < data.pagination.totalPages);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        if (resetEvents) setEvents([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, selectedSociety, selectedDate, selectedEventType, debouncedSearchTerm, EVENTS_PER_PAGE]);

  // Initial fetch and refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    setEvents([]);
    setHasMore(true);
    void fetchEvents(1, true);
  }, [selectedCategory, selectedSociety, selectedDate, selectedEventType, debouncedSearchTerm, fetchEvents]);

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
          void fetchEvents(nextPage, false);
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
  }, [events.length, hasMore, loadingMore, currentPage, fetchEvents]);

  // Simplified filtering - just sort the fetched events
  // Backend handles the actual filtering now
  useEffect(() => {
    const result = [...events].sort((a, b) => a.eventName.localeCompare(b.eventName));
    setFilteredEvents(result);
  }, [events]);

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

  const closedRegistrations = useMemo(() => new Set(['pecathon_acm_eic']), []);

  if (loading && !hasLoadedInitialData) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @font-face {
          font-family: 'Arabic';
          src: url('/arabic.otf') format('opentype');
          font-display: swap;
        }
        .font-display { font-family: 'Protest Guerrilla', sans-serif;}
        .font-arabic { font-family: 'Arabic', serif; }
        .arabian-border {
          border-image: linear-gradient(45deg, #b53da1, #ed6ab8, #fea6cc, #ffd4b9) 1;
        }
        @supports (background-clip: text) {
          .gradient-title {
            color: white;
            background: linear-gradient(to right, #fbbf24, #f59e0b, #d97706);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        @supports not (background-clip: text) {
          .gradient-title {
            color: #fbbf24;
          }
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 3s linear infinite;
          animation-play-state: running;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      
      <main className="min-h-screen text-white relative" style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16051d 50%, #1a0a2e 100%)',
      }}>
        {/* Fixed gradient fade overlay at top - allows navbar to show but fades rest */}
        <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#1a0a2e] via-[#1a0a2e]/80 to-transparent z-40 pointer-events-none" />
        

        
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-purple-900/20 z-0" />
        <AnimatedBackground />

        {/* Parallax Background with Purple Overlay */}
        <div 
          ref={parallaxRef}
          className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden will-change-transform"
          style={{
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <img 
            src="/12.png" 
            alt="Clouds" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Header Section */}
        <div className="relative pt-24 pb-8 px-4 z-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-arabic text-6xl sm:text-7xl md:text-9xl py-8 animate-gradient bg-gradient-to-r from-white via-yellow-400 via-amber-500 via-yellow-600 via-amber-700 to-white bg-clip-text text-transparent bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] tracking-wider">
                Events
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Floating Search Bar - Matching Navbar Style (Desktop only) */}
        <div className="hidden md:block py-4 px-4 relative z-50" ref={searchBarRef}>
          <div className="w-fit max-w-[90%] mx-auto mt-4" ref={filterMenuRef}>
            {/* Search Bar */}
            <div className="py-3 px-6 bg-[#010101]/60 backdrop-blur-sm rounded-full border border-purple-500/30 shadow-2xl will-change-auto">
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-4">
                <div className="relative flex-1 w-[280px] md:w-[480px]">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-amber-300 placeholder:text-amber-400/50 focus:outline-none font-medium text-sm"
                  />
                </div>
                <div className="h-5 w-0.5 bg-gradient-to-b from-purple-500/30 to-amber-500/30"></div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFilterMenuOpen(!isFilterMenuOpen);
                  }}
                  className="flex items-center justify-center gap-2 text-amber-400 hover:text-amber-200 transition-colors duration-300 font-semibold text-xs whitespace-nowrap"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  <ChevronDown size={16} className={`transform transition-transform ${isFilterMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </form>
            </div>

            {/* Filters Horizontal Panel Below */}
            <AnimatePresence>
              {isFilterMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mt-3 bg-gradient-to-r from-purple-900/85 to-purple-950/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-purple-500/60"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <CustomSelect
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={(value) => setSelectedCategory(value as string)}
                        placeholder="🌟 All Categories"
                      />
                    </div>
                    <div className="flex-1">
                      <CustomSelect
                        options={dateOptions}
                        value={selectedDate}
                        onChange={(value) => setSelectedDate(value as string)}
                        placeholder="📅 All Dates"
                      />
                    </div>
                    <div className="flex-1">
                      <CustomSelect
                        options={societyOptionsForSelect}
                        value={selectedSociety}
                        onChange={(value) => setSelectedSociety(value as string)}
                        placeholder="🏛️ All Societies"
                      />
                    </div>
                    <div className="flex-1">
                      <CustomSelect
                        options={eventTypeOptions}
                        value={selectedEventType}
                        onChange={(value) => setSelectedEventType(value as string)}
                        placeholder="👥 All Types"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Filters Only */}
        <div className="md:hidden px-4 pb-6 relative z-50" ref={searchBarRef}>
          <div className="bg-gradient-to-r from-purple-900/85 to-purple-950/90 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/60 shadow-xl will-change-auto">
            {/* Horizontal Filter Layout */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{msOverflowStyle: 'none', scrollbarWidth: 'none'}}>
              
              <div className="flex gap-2 min-w-max">
                <div className="min-w-[120px]">
                  <CustomSelect
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value as string)}
                    placeholder="Category"
                  />
                </div>
                
                <div className="min-w-[100px]">
                  <CustomSelect
                    options={dateOptions}
                    value={selectedDate}
                    onChange={(value) => setSelectedDate(value as string)}
                    placeholder="Date"
                  />
                </div>
                
                <div className="min-w-[140px]">
                  <CustomSelect
                    options={societyOptionsForSelect.slice(0, 15)}
                    value={selectedSociety}
                    onChange={(value) => setSelectedSociety(value as string)}
                    placeholder="Society"
                  />
                </div>
                
                <div className="min-w-[100px]">
                  <CustomSelect
                    options={eventTypeOptions}
                    value={selectedEventType}
                    onChange={(value) => setSelectedEventType(value as string)}
                    placeholder="Type"
                  />
                </div>
                
                {/* Clear Button */}
                {(selectedCategory !== 'all' || selectedDate !== 'all' || selectedSociety !== 'all' || selectedEventType !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDate('all');
                      setSelectedSociety('all');
                      setSelectedEventType('all');
                    }}
                    className="px-3 py-2 bg-red-600/80 hover:bg-red-500/80 text-white text-xs font-medium rounded-lg transition-all flex-shrink-0 border border-red-500/50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

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
                  const eventStarted = new Date(event.dateTime) <= new Date();

                  return (
                    <motion.div
                      key={event._id}
                      // Conditionally add the ref and data-letter for the alphabet index
                      ref={isFirstOfLetter ? el => { if (el) sectionRefs.current[firstLetter] = el; } : null}
                      data-letter={isFirstOfLetter ? firstLetter : undefined}
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
                            loading="lazy"
                            src={event.image?.includes('PECFEST_2024') ? '/Pecfest X Mood Indigo Letter Head.pdf_20240920_201728_0000.png' : (event.image || '/Pecfest X Mood Indigo Letter Head.pdf_20240920_201728_0000.png')}
                            alt={event.eventName}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            style={(event.image?.includes('PECFEST_2024') || !event.image) ? { transform: 'rotate(-90deg)' } : {}}
                          />
                        </div>

                        {/* Event Name & Actions */}
                        <div className="flex-1 flex flex-col mt-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-[#ffd4b9] transition-colors duration-300 font-display text-center flex-1">
                            {event.eventName}
                          </h3>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-6">
                            {eventStarted ? (
                              <div className="flex-1 py-3 px-6 rounded-2xl border border-slate-400/40 bg-slate-700/40 text-slate-200 font-semibold text-center">
                                Registration closed
                              </div>
                            ) : (
                              <motion.button 
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowRegistrationForm(true);
                                }}
                                className={`flex-1 font-bold py-3 px-6 rounded-2xl transition-all duration-500 transform font-protest text-lg shadow-lg relative overflow-hidden ${
                                  closedRegistrations.has(event.eventId)
                                    ? 'bg-slate-600/60 text-slate-200 cursor-not-allowed border border-slate-400/40'
                                    : 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 text-[#4321a9]/80 hover:from-yellow-300 hover:via-amber-400 hover:to-yellow-500 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30'
                                }`}
                                whileHover={closedRegistrations.has(event.eventId) ? undefined : { 
                                  scale: 1.05,
                                  boxShadow: "0 20px 40px rgba(251, 191, 36, 0.4)"
                                }}
                                whileTap={closedRegistrations.has(event.eventId) ? undefined : { scale: 0.98 }}
                                style={
                                  closedRegistrations.has(event.eventId)
                                    ? undefined
                                    : {
                                        background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                                        backgroundSize: "200% 200%",
                                        animation: "gradientShift 3s ease-in-out infinite"
                                      }
                                }
                                disabled={closedRegistrations.has(event.eventId)}
                              >
                                <span className="relative z-10">
                                  {closedRegistrations.has(event.eventId) ? 'Registration Closed' : 'Register Now'}
                                </span>
                                {!closedRegistrations.has(event.eventId) && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                              </motion.button>
                            )}
                            
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
                {!loadingMore && hasMore && (
                  <div className="text-center">
                    <div className="text-[#fea6cc] text-base font-medium mb-3">
                      👇 Scroll to load more events
                    </div>
                    <p className="text-[#fea6cc]/50 text-xs mb-4">
                      Showing {events.length} events • Page {currentPage} of {totalPages}
                    </p>
                    <button
                      onClick={() => {
                        console.log('🖱️ Manual load button clicked');
                        const nextPage = currentPage + 1;
                        // setCurrentPage is handled inside fetchEvents
                        fetchEvents(nextPage, false);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-medium rounded-full hover:from-[#ed6ab8] hover:to-[#fea6cc] transition-all"
                    >
                      Load More Events
                    </button>
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
