'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Menu, X, Home, Search, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState<number>(-1);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBrochurePage = pathname === '/brochure';
  const isRegisterPage = pathname === '/register';
  const isEventsPage = pathname === '/events';
  const isHomePage = pathname === '/';
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setShowNavbar(window.scrollY > 500);
      } else {
        setShowNavbar(window.scrollY > window.innerHeight * 0.2);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const navItems = [
    { label: 'About', href: '/#about' },
    { label: 'Events', href: '/events' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Sponsors', href: '/sponsors' },
    { label: 'Committee', href: '/team' },
    { label: 'Developers', href: '/developers' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ];

  const leftNavItems: Array<{ label: string; href: string; isSection?: boolean }> = [
    { label: 'About', href: '/#about' },
    { label: 'Events', href: '/events' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Sponsors', href: '/sponsors' },
  ];
  
  const rightNavItems = [
    { label: 'Committee', href: '/team' },
    { label: 'Developers', href: '/developers' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ];

  const fuzzyMatch = (text: string, query: string): boolean => {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (textLower.includes(queryLower)) return true;
    
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === queryLower.length;
  };

  const highlightMatch = (text: string, query: string): React.JSX.Element => {
    if (!query) return <>{text}</>;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) {
      return <>{text}</>;
    }
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    
    return (
      <>
        {before}
        <mark className="bg-amber-500/30 text-amber-100 font-bold">
          {match}
        </mark>
        {after}
      </>
    );
  };

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`/api/events?limit=1000`);
        const data = await response.json();
        if (data.events) {
          setPopularEvents(data.events.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching popular events:', error);
      }
    };
    fetchPopular();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (mobileSearchTerm.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedFilterIndex(-1);
        return;
      }

      try {
        const response = await fetch(`/api/events?limit=1000`);
        const data = await response.json();
        
        if (data.events) {
          let filtered = data.events.filter((event: any) => 
            fuzzyMatch(event.eventName || '', mobileSearchTerm) ||
            fuzzyMatch(event.societyName || '', mobileSearchTerm) ||
            fuzzyMatch(event.location || '', mobileSearchTerm)
          );

          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          if (activeQuickFilter === 'free') {
            filtered = filtered.filter((event: any) => !event.regFees || event.regFees === 0);
          } else if (activeQuickFilter === 'paid') {
            filtered = filtered.filter((event: any) => event.regFees && event.regFees > 0);
          } else if (activeQuickFilter === 'technical') {
            filtered = filtered.filter((event: any) => 
              event.eventCategory?.toLowerCase().includes('technical') ||
              event.societyName?.toLowerCase().includes('tech')
            );
          } else if (activeQuickFilter === 'cultural') {
            filtered = filtered.filter((event: any) => 
              event.eventCategory?.toLowerCase().includes('cultural') ||
              event.societyName?.toLowerCase().includes('cultural')
            );
          } else if (activeQuickFilter === 'today') {
            filtered = filtered.filter((event: any) => {
              const eventDate = new Date(event.dateTime);
              return eventDate >= today && eventDate < tomorrow;
            });
          } else if (activeQuickFilter === 'tomorrow') {
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            filtered = filtered.filter((event: any) => {
              const eventDate = new Date(event.dateTime);
              return eventDate >= tomorrow && eventDate < dayAfter;
            });
          }
          
          setSearchResults(filtered.slice(0, 5));
          setShowSearchResults(true);
          setSelectedFilterIndex(-1);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [mobileSearchTerm, activeQuickFilter]);

  const handleNavClick = (e: React.MouseEvent, href: string, isSection?: boolean) => {
    if (isSection && href === '/#about') {
      e.preventDefault();
      if (pathname === '/') {
        // Already on home page, just scroll
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to home page with hash
        router.push('/#about');
        // Wait for navigation and then scroll
        setTimeout(() => {
          const aboutSection = document.getElementById('about');
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        
        .font-protest {
          font-family: 'Protest Guerrilla', sans-serif;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {isRegisterPage ? (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-60 font-[var(--font-geist)]"
        >
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] hover:from-[#ed6ab8] hover:to-[#b53da1] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-7 h-7 text-white" />
                </motion.div>
              </Link>
              <div />
            </div>
          </div>
        </motion.nav>
      ) : (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-60 font-[var(--font-geist)] ${isBrochurePage ? 'pt-10' : ''}`}
        >
          {/* Desktop Navbar */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{
              opacity: isHomePage ? (showNavbar ? 1 : 0) : 1,
              y: isHomePage ? (showNavbar ? 0 : -20) : 0,
              scale: isHomePage ? (showNavbar ? 1 : 0.97) : 1,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="hidden md:flex w-fit mx-auto mt-4 py-3 relative bg-[#010101]/40 backdrop-blur-sm rounded-full border border-amber-600/40 overflow-visible shadow-2xl shadow-purple-900/50"
            style={{ pointerEvents: isHomePage ? (showNavbar ? 'auto' : 'none') : 'auto' }}
          >
            <div className="flex items-center justify-center relative px-4 gap-1">
              <div className="flex items-center gap-2">
                {leftNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.isSection && pathname === '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href, item.isSection)}
                      className={`transition-all duration-300 text-base font-bold whitespace-nowrap px-5 py-3 rounded-full font-protest ${
                        isActive 
                          ? "bg-white text-purple-900 shadow-lg shadow-amber-500/30" 
                          : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 animate-gradient text-transparent bg-clip-text hover:bg-white/10"
                      }`}
                      style={{ 
                        animation: isActive ? "none" : "gradient 3s ease infinite",
                        backgroundSize: "200% 100%"
                      }}
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  );
                })}
              </div>

              <Link href="/" className="flex-shrink-0 -my-10">
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src="/logo.png"
                    alt="PECFest Center Logo"
                    width={100}
                    height={100}
                    className="drop-shadow-[0_0_15px_rgba(217,119,6,0.6)]"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(217,119,6,0.8))' }}
                  />
                </motion.div>
              </Link>

              <div className="flex items-center gap-2">
                {rightNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`transition-all duration-300 text-base font-bold whitespace-nowrap px-5 py-3 rounded-full font-protest ${
                        isActive 
                          ? "bg-white text-purple-900 shadow-lg shadow-amber-500/30" 
                          : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 animate-gradient text-transparent bg-clip-text hover:bg-white/10"
                      }`}
                      style={{ 
                        animation: isActive ? "none" : "gradient 3s ease infinite",
                        backgroundSize: "200% 100%"
                      }}
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Desktop Login/Profile */}
          <div className="hidden md:block fixed top-4 right-4 z-60">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-purple-950/95 via-purple-900/95 to-violet-950/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-900/50 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-violet-600/20">
                      <p className="text-amber-100 text-sm font-bold truncate font-protest">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2 px-4 py-3 text-amber-300 hover:bg-purple-600/30 hover:text-amber-200 transition-all duration-200 cursor-pointer"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="font-bold text-sm font-protest">My Profile</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all duration-200 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-bold text-sm font-protest">Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-600/50 text-sm font-protest"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden fixed top-0 left-0 right-0 z-60 ${isHomePage ? 'bg-transparent' : 'bg-gradient-to-r from-purple-950/95 via-[#1a0a2e]/95 to-purple-950/95 backdrop-blur-xl border-b border-amber-600/40 shadow-2xl shadow-purple-900/50'}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg rounded-full"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              {!isHomePage && (
                <div className="flex-1 mx-3" ref={searchRef}>
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={mobileSearchTerm}
                    onChange={(e) => {
                      setMobileSearchTerm(e.target.value);
                      if (e.target.value.length >= 2) setShowSearchResults(true);
                    }}
                    onFocus={() => {
                      if (mobileSearchTerm.length < 2 && popularEvents.length > 0) {
                        setShowSearchResults(true);
                      } else if (searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      const currentResults = mobileSearchTerm.length >= 2 ? searchResults : popularEvents;
                      
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedFilterIndex((prev) => 
                          prev < currentResults.length - 1 ? prev + 1 : prev
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedFilterIndex((prev) => (prev > 0 ? prev - 1 : -1));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (selectedFilterIndex >= 0 && currentResults[selectedFilterIndex]) {
                          router.push(`/events/${currentResults[selectedFilterIndex].eventId}`);
                          setShowSearchResults(false);
                          setMobileSearchTerm('');
                          setSelectedFilterIndex(-1);
                        } else if (mobileSearchTerm && searchResults.length > 0) {
                          router.push(`/events/${searchResults[0].eventId}`);
                          setShowSearchResults(false);
                          setMobileSearchTerm('');
                        } else if (mobileSearchTerm) {
                          router.push(`/events?search=${encodeURIComponent(mobileSearchTerm)}`);
                          setShowSearchResults(false);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSearchResults(false);
                        setSelectedFilterIndex(-1);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-purple-950/40 backdrop-blur-sm border border-amber-600/30 rounded-full text-amber-300 placeholder:text-amber-400/50 focus:outline-none focus:border-amber-500/50 font-medium text-sm"
                  />
                  
                  {showSearchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 bg-purple-950/95 backdrop-blur-xl border border-amber-600/40 rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto z-50"
                    >
                      <div className="p-2 border-b border-amber-600/30 sticky top-0 bg-purple-950/95 backdrop-blur-xl z-10">
                        <div className="flex flex-wrap gap-1.5">
                          {['all', 'free', 'paid', 'today', 'tomorrow'].map((filter) => (
                            <button
                              key={filter}
                              onClick={() => setActiveQuickFilter(filter)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                activeQuickFilter === filter
                                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                                  : 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30'
                              }`}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2">
                        {mobileSearchTerm.length >= 2 ? (
                          searchResults.length > 0 ? (
                            <>
                              <div className="text-amber-400 text-xs font-semibold px-2 py-1.5">
                                Events ({searchResults.length})
                              </div>
                              {searchResults.map((event: any, index: number) => (
                                <Link
                                  key={event.eventId}
                                  href={`/events/${event.eventId}`}
                                  onClick={() => {
                                    setShowSearchResults(false);
                                    setMobileSearchTerm('');
                                    setSelectedFilterIndex(-1);
                                  }}
                                  className={`block p-2.5 rounded-lg transition-colors duration-200 ${
                                    selectedFilterIndex === index
                                      ? 'bg-amber-600/30 border border-amber-500/50'
                                      : 'hover:bg-amber-600/20 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-600/20 rounded-lg overflow-hidden">
                                      {event.image && (
                                        <img 
                                          src={event.image} 
                                          alt={event.eventName}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-amber-100 font-semibold text-xs">
                                        {highlightMatch(event.eventName || '', mobileSearchTerm)}
                                      </div>
                                      <div className="text-amber-300/70 text-xs truncate">
                                        {highlightMatch(event.societyName || '', mobileSearchTerm)}
                                      </div>
                                      {event.location && (
                                        <div className="flex items-center gap-1 text-amber-400/80 text-xs mt-0.5">
                                          <MapPin className="w-3 h-3" />
                                          <span className="truncate">{highlightMatch(event.location, mobileSearchTerm)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </>
                          ) : (
                            <div className="px-2 py-8 text-center text-amber-400/70 text-xs">
                              No events found for "{mobileSearchTerm}"
                            </div>
                          )
                        ) : (
                          <>
                            <div className="text-amber-400 text-xs font-semibold px-2 py-1.5">
                              Popular Events
                            </div>
                            {popularEvents.map((event: any, index: number) => (
                              <Link
                                key={event.eventId}
                                href={`/events/${event.eventId}`}
                                onClick={() => {
                                  setShowSearchResults(false);
                                  setMobileSearchTerm('');
                                  setSelectedFilterIndex(-1);
                                }}
                                className={`block p-2.5 rounded-lg transition-colors duration-200 ${
                                  selectedFilterIndex === index
                                    ? 'bg-amber-600/30 border border-amber-500/50'
                                    : 'hover:bg-amber-600/20 border border-transparent'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600/20 rounded-lg overflow-hidden">
                                    {event.image && (
                                      <img 
                                        src={event.image} 
                                        alt={event.eventName}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-amber-100 font-semibold text-xs truncate">
                                      {event.eventName}
                                    </div>
                                    <div className="text-amber-300/70 text-xs truncate">
                                      {event.societyName}
                                    </div>
                                    {event.location && (
                                      <div className="flex items-center gap-1 text-amber-400/80 text-xs mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
                </div>
              )}
              {isHomePage && <div className="flex-1" />}

              {user ? (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg rounded-full"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              ) : (
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg text-xs font-protest"
                  >
                    Login
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {user && showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden fixed top-16 right-4 w-48 bg-gradient-to-br from-purple-950/95 via-purple-900/95 to-violet-950/95 backdrop-blur-xl border border-purple-500/40 shadow-2xl shadow-purple-900/50 overflow-hidden z-50 rounded-2xl"
            >
              <div className="px-4 py-3 border-b border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-violet-600/20">
                <p className="text-amber-100 text-sm font-bold truncate font-protest">{user.email}</p>
              </div>
              <Link
                href="/profile"
                className="w-full flex items-center gap-2 px-4 py-3 text-amber-300 hover:bg-purple-600/30 hover:text-amber-200 transition-all duration-200 cursor-pointer"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                <span className="font-bold text-sm font-protest">My Profile</span>
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-bold text-sm font-protest">Logout</span>
              </button>
            </motion.div>
          )}
        </motion.nav>
      )}
      
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/50 z-[45] md:hidden"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 w-64 z-60 md:hidden bg-white/5 shadow-3xl border-r border-white/10"
              style={{
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              }}
            >
              <div className="pt-8 pb-6 px-6 border-b border-white/10 flex items-center justify-center" style={{ minHeight: '140px' }}>
                <Image
                  src="/logo.png"
                  alt="PECFest Logo"
                  width={100}
                  height={100}
                  className="mx-auto drop-shadow-[0_0_15px_rgba(217,119,6,0.6)]"
                />
              </div>

              <button
                onClick={() => setShowMobileMenu(false)}
                className="absolute flex items-center justify-center w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 transition-all duration-300 shadow-lg rounded-full z-10"
                style={{ top: '50%', right: '-30px', transform: 'translateY(-50%)' }}
              >
                <X className="w-6 h-6 text-amber-400" />
              </button>

              <div className="h-full flex flex-col pt-8 px-6">
                <div className="space-y-4">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <React.Fragment key={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full"
                        >
                          <Link
                            href={item.href}
                            onClick={() => setShowMobileMenu(false)}
                            className={`block transition-all duration-300 font-semibold text-xl py-3 px-4 text-left rounded-lg border font-protest ${
                              isActive
                                ? 'bg-white text-purple-900 shadow-lg shadow-amber-500/30 border-amber-500/50'
                                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-600/20 border-transparent hover:border-amber-600/30 hover:shadow-lg hover:shadow-amber-600/20'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                        {index === 0 && user && (
                          <motion.div
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full"
                          >
                            <Link
                              href="/profile"
                              onClick={() => setShowMobileMenu(false)}
                              className={`block transition-all duration-300 font-semibold text-xl py-3 px-4 text-left rounded-lg border ${
                                pathname === '/profile'
                                  ? 'bg-white text-purple-900 shadow-lg shadow-amber-500/30 border-amber-500/50'
                                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-600/20 border-transparent hover:border-amber-600/30 hover:shadow-lg hover:shadow-amber-600/20'
                              }`}
                            >
                              Profile
                            </Link>
                          </motion.div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  {user ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <button 
                        onClick={() => {
                          logout();
                          setShowMobileMenu(false);
                        }}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-600/40 text-lg text-left rounded-lg border border-red-500/50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Link href="/register" onClick={() => setShowMobileMenu(false)}>
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-600/40 text-lg text-left rounded-lg border border-amber-500/50 font-protest">
                          Login
                        </button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}