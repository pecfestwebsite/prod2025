'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, IndianRupee, ExternalLink, Clock, Filter, Search } from 'lucide-react';
import { IEvent } from '../../models/Event';

const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
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
  const mouseX = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX]);

  const layer1X = useTransform(mouseX, (v) => v * -0.01);
  const layer2X = useTransform(mouseX, (v) => v * -0.03);
  const layer3X = useTransform(mouseX, (v) => v * -0.06);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <TwinklingStars />
      
      <motion.div 
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#4321a9] opacity-70" 
        style={{ x: layer1X }}
      >
        <svg viewBox="0 0 1440 320"><path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#642aa5] opacity-80" 
        style={{ x: layer2X }}
      >
        <svg viewBox="0 0 1440 320"><path fill="currentColor" d="M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,250.7C672,267,768,245,864,213.3C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#2a0a56]" 
        style={{ x: layer3X }}
      >
        <svg viewBox="0 0 1440 320"><path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,218.7C672,203,768,149,864,154.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </motion.div>

      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-[#2a0a56]/60 to-transparent z-10"/>
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [societySearchTerm, setSocietySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

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
  const uniqueSocieties = ['all', ...Array.from(new Set(events.map(e => e.societyName)))].sort();

  // For now, we will use the static list provided.
  // In the future, you might want to use `uniqueSocieties` if the list should be dynamic from events.
  const societyOptions = ['all', ...societiesAndClubs];

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

  const selectedCategoryLabel = categoryOptions.find(c => c.value === selectedCategory)?.label;
  const selectedDateLabel = dateOptions.find(d => d.value === selectedDate)?.label;

  const filteredSocietyOptions = societyOptions.filter(society =>
    society.toLowerCase().includes(societySearchTerm.toLowerCase())
  );
  const societyDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events...');
        const response = await fetch('/api/events?limit=100');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Events data:', data);
        setEvents(data.events || []);
        setFilteredEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter and sort events
  useEffect(() => {
    let result = [...events];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(event => event.category === selectedCategory);
    }

    // Filter by society
    if (selectedSociety !== 'all') {
      result = result.filter(event => event.societyName === selectedSociety);
    }

    // Filter by date
    if (selectedDate !== 'all') {
      const day = parseInt(selectedDate, 10);
      result = result.filter(event => new Date(event.dateTime).getDate() === day);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort events
    result.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    setFilteredEvents(result);
  }, [events, selectedCategory, selectedSociety, selectedDate, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node)) {
        setIsSocietyDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(target)) {
        setIsDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
        return 'from-[#4321a9]/20 to-[#642aa5]/20 border-[#4321a9]/40 text-[#fea6cc]';
      case 'cultural':
        return 'from-[#8b2a6b]/30 to-[#a03a7b]/30 border-[#8b2a6b]/50 text-[#ffd4b9]';
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
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
        
        body { font-family: 'Amiri', serif; background-color: #010101; }
        .font-display { font-family: 'Cinzel', serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
        .font-elegant { font-family: 'Playfair Display', serif; }
        
        
        .arabian-border {
          border-image: linear-gradient(45deg, #b53da1, #ed6ab8, #fea6cc, #ffd4b9) 1;
        }
      `}</style>
      
      <main className="min-h-screen bg-gradient-to-b from-[#140600] via-[#4321a9] to-[#2a0a56] text-white relative">
        <AnimatedBackground />
        
        {/* Crescent Moon */}
        <div className="absolute top-20 left-24 z-20">
          <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#FFD983] drop-shadow-lg">
            <path fill="#FFD983" d="M30.312.776C32 19 20 32 .776 30.312c8.199 7.717 21.091 7.588 29.107-.429C37.9 21.867 38.03 8.975 30.312.776z"></path>
            <path d="M30.705 15.915a1.163 1.163 0 1 0 1.643 1.641a1.163 1.163 0 0 0-1.643-1.641zm-16.022 14.38a1.74 1.74 0 0 0 0 2.465a1.742 1.742 0 1 0 0-2.465zm13.968-2.147a2.904 2.904 0 0 1-4.108 0a2.902 2.902 0 0 1 0-4.107a2.902 2.902 0 0 1 4.108 0a2.902 2.902 0 0 1 0 4.107z" fill="#FFCC4D"></path>
          </svg>
        </div>
        
        {/* Header Section */}
        <div className="relative pt-20 pb-16 px-4 z-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              {/* Decorative Arabic Pattern */}
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
                <div className="mx-4 w-2 h-2 bg-[#ed6ab8] rounded-full"></div>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#fea6cc] to-transparent"></div>
              </div>
              
              <h1 className="font-display text-7xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] mb-6 tracking-wider">
                EVENTS
              </h1>
              
              
              
              {/* Decorative Arabic Pattern */}
              <div className="mt-6 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#fea7a0] to-transparent"></div>
                <div className="mx-3 w-1 h-1 bg-[#ffd4b9] rounded-full"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#b53da1] to-transparent"></div>
              </div>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-6xl mx-auto mb-12"
            >
              <div className="bg-gradient-to-r from-[#2a0a56]/40 via-[#4321a9]/30 to-[#2a0a56]/40 backdrop-blur-lg rounded-3xl p-6 border border-[#b53da1]/30">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#ffd4b9] w-6 h-6 transition-colors duration-300" />
                    <input
                      type="text"
                      placeholder="Search for events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-gradient-to-r from-[#010101]/80 via-[#140655]/70 to-[#010101]/80 backdrop-blur-md border-2 border-[#b53da1]/40 rounded-2xl text-white placeholder-[#ffd4b9]/70 font-arabian text-lg focus:outline-none focus:border-[#fea6cc] focus:ring-4 focus:ring-[#fea6cc]/30 focus:bg-gradient-to-r focus:from-[#010101]/90 focus:via-[#140655]/80 focus:to-[#010101]/90 hover:border-[#ed6ab8]/60 hover:shadow-2xl hover:shadow-[#b53da1]/30 transition-all duration-300"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Filter className="text-[#ffd4b9] w-6 h-6 transition-colors duration-300" />
                    <div className="relative" ref={categoryDropdownRef}>
                      <button
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="appearance-none w-full lg:w-auto text-left px-6 py-3 bg-gradient-to-r from-[#4321a9]/90 via-[#642aa5]/80 to-[#b53da1]/90 backdrop-blur-lg border-2 border-[#b53da1]/50 rounded-2xl text-white font-arabian text-lg focus:outline-none focus:border-[#fea6cc] focus:ring-4 focus:ring-[#fea6cc]/30 focus:bg-gradient-to-r focus:from-[#4321a9] focus:via-[#642aa5] focus:to-[#b53da1] hover:border-[#ed6ab8]/70 hover:shadow-2xl hover:shadow-[#b53da1]/40 hover:scale-105 transition-all duration-300 cursor-pointer pr-12 min-w-[180px] flex justify-between items-center"
                      >
                        <span className="truncate">{selectedCategoryLabel}</span>
                        <svg className={`w-6 h-6 text-[#ffd4b9] transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isCategoryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-2 w-full bg-[#010101]/80 backdrop-blur-xl border-2 border-[#b53da1]/50 rounded-2xl shadow-2xl shadow-[#b53da1]/40 overflow-hidden"
                        >
                          <ul className="max-h-60 overflow-y-auto">
                            {categoryOptions.map(option => (
                              <li
                                key={option.value}
                                onClick={() => {
                                  setSelectedCategory(option.value);
                                  setIsCategoryDropdownOpen(false);
                                }}
                                className="px-4 py-2 text-[#ffd4b9] font-arabian hover:bg-gradient-to-r hover:from-[#4321a9]/50 hover:to-[#b53da1]/50 cursor-pointer transition-colors duration-200"
                              >
                                {option.label}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>

                    {/* Society/Club Filter Button */}
                    <div className="relative" ref={societyDropdownRef}>
                      <button
                        onClick={() => setIsSocietyDropdownOpen(!isSocietyDropdownOpen)}
                        className="appearance-none w-full lg:w-auto text-left px-6 py-3 bg-gradient-to-r from-[#4321a9]/90 via-[#642aa5]/80 to-[#b53da1]/90 backdrop-blur-lg border-2 border-[#b53da1]/50 rounded-2xl text-white font-arabian text-lg focus:outline-none focus:border-[#fea6cc] focus:ring-4 focus:ring-[#fea6cc]/30 focus:bg-gradient-to-r focus:from-[#4321a9] focus:via-[#642aa5] focus:to-[#b53da1] hover:border-[#ed6ab8]/70 hover:shadow-2xl hover:shadow-[#b53da1]/40 hover:scale-105 transition-all duration-300 cursor-pointer pr-12 min-w-[180px] max-w-xs flex justify-between items-center"
                      >
                        <span className="truncate">{selectedSociety === 'all' ? 'All Societies/Clubs' : selectedSociety}</span>
                        <svg className={`w-6 h-6 text-[#ffd4b9] transition-transform duration-300 ${isSocietyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isSocietyDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 mt-2 w-full max-w-xs bg-[#010101]/80 backdrop-blur-xl border-2 border-[#b53da1]/50 rounded-2xl shadow-2xl shadow-[#b53da1]/40 overflow-hidden"
                        >
                            <div className="p-2">
                                <input
                                    type="text"
                                    placeholder="Search society..."
                                    value={societySearchTerm}
                                    onChange={(e) => setSocietySearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#140655]/50 border border-[#b53da1]/30 rounded-lg text-white placeholder-[#ffd4b9]/60 focus:outline-none focus:ring-2 focus:ring-[#fea6cc]"
                                />
                            </div>
                            <ul className="max-h-60 overflow-y-auto">
                                {filteredSocietyOptions.map(society => (
                                    <li
                                        key={society}
                                        onClick={() => {
                                            setSelectedSociety(society);
                                            setIsSocietyDropdownOpen(false);
                                            setSocietySearchTerm('');
                                        }}
                                        className="px-4 py-2 text-[#ffd4b9] font-arabian hover:bg-gradient-to-r hover:from-[#4321a9]/50 hover:to-[#b53da1]/50 cursor-pointer transition-colors duration-200"
                                    >
                                        {society === 'all' ? 'All Societies/Clubs' : society}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-4">
                    <div className="relative" ref={dateDropdownRef}>
                      <button
                        onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                        className="appearance-none w-full lg:w-auto text-left px-6 py-3 bg-gradient-to-r from-[#642aa5]/90 via-[#b53da1]/80 to-[#ed6ab8]/90 backdrop-blur-lg border-2 border-[#b53da1]/50 rounded-2xl text-white font-arabian text-lg focus:outline-none focus:border-[#fea6cc] focus:ring-4 focus:ring-[#fea6cc]/30 focus:bg-gradient-to-r focus:from-[#642aa5] focus:via-[#b53da1] focus:to-[#ed6ab8] hover:border-[#ed6ab8]/70 hover:shadow-2xl hover:shadow-[#b53da1]/40 hover:scale-105 transition-all duration-300 cursor-pointer pr-12 min-w-[180px] flex justify-between items-center"
                      >
                        <span className="truncate">{selectedDateLabel}</span>
                        <svg className={`w-6 h-6 text-[#ffd4b9] transition-transform duration-300 ${isDateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isDateDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 mt-2 w-full bg-[#010101]/80 backdrop-blur-xl border-2 border-[#b53da1]/50 rounded-2xl shadow-2xl shadow-[#b53da1]/40 overflow-hidden"
                        >
                          <ul className="max-h-60 overflow-y-auto">
                            {dateOptions.map(option => (
                              <li
                                key={option.value}
                                onClick={() => {
                                  setSelectedDate(option.value);
                                  setIsDateDropdownOpen(false);
                                }}
                                className="px-4 py-2 text-[#ffd4b9] font-arabian hover:bg-gradient-to-r hover:from-[#4321a9]/50 hover:to-[#b53da1]/50 cursor-pointer transition-colors duration-200"
                              >
                                {option.label}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            
          </div>
        </div>

        {/* Events Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-[#ffd4b9] mb-4 font-display">No Events Found</h3>
              <p className="text-xl text-[#fea6cc] font-arabian mb-2">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -15, scale: 1.03 }}
                  className="group"
                >
                  <div className={`relative bg-gradient-to-br ${getCategoryColor(event.category)} backdrop-blur-lg rounded-3xl p-8 border-2 h-full flex flex-col transition-all duration-500 hover:shadow-3xl hover:shadow-[#b53da1]/30`}>
                    {/* Decorative Corner Elements */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#ffd4b9] rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#ffd4b9] rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#ffd4b9] rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#ffd4b9] rounded-br-lg"></div>

                    {/* Category Badge */}
                    <div className="absolute top-6 right-6">
                      <div className="bg-gradient-to-r from-[#b53da1]/20 to-[#ed6ab8]/20 backdrop-blur-sm rounded-full p-3 border border-[#b53da1]/40">
                        <span className="text-3xl">{getCategoryIcon(event.category)}</span>
                      </div>
                    </div>

                    {/* Event Image */}
                    {event.image && (
                      <div className="mb-6 rounded-2xl overflow-hidden border-2 border-[#b53da1]/30 aspect-square">
                        <img
                          src={event.image}
                          alt={event.eventName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Event Details */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#ffd4b9] transition-colors duration-300 font-display text-center">
                        {event.eventName}
                      </h3>
                      
                      <p className="text-sm text-[#fea6cc] mb-4 font-arabian text-center italic">
                        by {event.societyName}
                      </p>

                      <p className="text-[#ffd4b9] text-base mb-6 flex-1 line-clamp-3 font-arabian leading-relaxed text-center">
                        {event.briefDescription}
                      </p>

                      {/* Event Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm bg-[#010101]/30 rounded-xl p-3">
                          <Calendar className="w-5 h-5 text-[#ffd4b9]" />
                          <span className="text-[#ffd4b9] font-arabian">{formatDate(event.dateTime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm bg-[#010101]/30 rounded-xl p-3">
                          <MapPin className="w-5 h-5 text-[#ffd4b9]" />
                          <span className="text-[#ffd4b9] font-arabian">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm bg-[#010101]/30 rounded-xl p-3">
                          <Users className="w-5 h-5 text-[#ffd4b9]" />
                          <span className="text-[#ffd4b9] font-arabian">
                            {event.team}/{event.teamLimit} teams
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm bg-[#010101]/30 rounded-xl p-3">
                          <IndianRupee className="w-5 h-5 text-[#ffd4b9]" />
                          <span className="text-[#ffd4b9] font-arabian">₹{event.regFees}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-auto">
                        <button className="flex-1 bg-gradient-to-r from-[#fea6cc] to-[#ffd4b9] text-[#010101] font-bold py-3 px-6 rounded-2xl hover:from-[#ffd4b9] hover:to-[#fea7a0] transition-all duration-300 transform hover:scale-105 font-arabian text-lg shadow-lg hover:shadow-xl">
                          Register Now
                        </button>
                        
                        {event.pdfLink && (
                          
                          <a
                            href={event.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-gradient-to-r from-[#2a0a56]/80 to-[#4321a9]/80 border-2 border-[#b53da1]/50 text-[#ffd4b9] py-3 px-6 rounded-2xl hover:bg-gradient-to-r hover:from-[#b53da1]/40 hover:to-[#ed6ab8]/40 hover:border-[#fea6cc] transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        

      </main>
    </>
  );
}
