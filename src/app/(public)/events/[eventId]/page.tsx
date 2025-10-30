'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, MapPin, Users, IndianRupee, ArrowLeft, ExternalLink, Phone, Mail } from 'lucide-react';
import { IEvent } from '@/models/Event';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import EventRegistrationForm from '@/components/EventRegistrationForm';

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

export default function EventDescriptionPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);

        if (!response.ok) {
          throw new Error('Event not found');
        }

        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

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
        return 'from-[#4321a9]/25 to-[#2a0a56]/25 border-[#642aa5]/50 text-[#fea6cc]';
      case 'cultural':
        return 'from-[#642aa5]/25 to-[#4321a9]/25 border-[#b53da1]/50 text-[#fea6cc]';
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#140655] via-[#4321a9] to-[#2a0a56] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#ffd4b9] mb-4">Event Not Found</h2>
          <Link href="/events" className="text-[#fea6cc] hover:text-[#ffd4b9] underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');

        body { font-family: 'Scheherazade New', serif; background-color: #010101; }
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
        .font-elegant { font-family: 'Playfair Display', serif; }
      `}</style>

      <main className="min-h-screen bg-blue-800/5 text-white relative">
        <AnimatedBackground />

        <FloatingLantern duration={18} size={50} x="25%" y="5%" delay={0} />
        <FloatingLantern duration={15} size={28} x="5%" y="15%" delay={1.2} />
        <FloatingLantern duration={17} size={28} x="80%" y="8%" delay={0.5} />
        <FloatingLantern duration={14} size={27} x="95%" y="18%" delay={1.8} />

        {/* Navigation Bar */}
        <div className="sticky top-0 z-30 py-4 bg-blue-800/10 backdrop-blur-lg shadow-lg">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
            <Link href="/events" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white font-medium hover:border-purple-400/80 transition-all">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-900/40 border-2 border-purple-500/50 rounded-full text-white font-medium hover:border-purple-400/80 transition-all">
              <Home size={16} />
              <span className="hidden md:inline">Home</span>
            </Link>
          </div>
        </div>

        {/* Event Details Container */}
        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`relative bg-gradient-to-br ${getCategoryColor(event.category)} backdrop-blur-lg rounded-3xl p-8 border-2 shadow-2xl`}>
              {/* Category Badge */}
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-gradient-to-r from-[#b53da1]/20 to-[#ed6ab8]/20 backdrop-blur-sm rounded-full p-4 border border-[#b53da1]/40">
                  <span className="text-4xl">{getCategoryIcon(event.category)}</span>
                </div>
              </div>

              {/* Event Image */}
              {event.image && (
                <div className="rounded-2xl overflow-hidden border-2 border-[#b53da1]/30 mb-8 w-full">
                  <img
                    src={event.image}
                    alt={event.eventName}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {/* Event Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] mb-4 font-display text-center drop-shadow-[0_4px_10px_rgba(237,106,184,0.3)]">
                {event.eventName}
              </h1>

              {/* Society Name */}
              <p className="text-2xl text-[#fea6cc] text-center mb-8 font-arabian">
                Organized by {event.societyName}
                {event.additionalClub && event.additionalClub !== 'None' && (
                  <span> & {event.additionalClub}</span>
                )}
              </p>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Date & Time */}
                <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6 text-[#ffd4b9]" />
                    <h3 className="text-xl font-bold text-[#ffd4b9] font-elegant">Date & Time</h3>
                  </div>
                  <p className="text-white font-arabian text-lg">{formatDate(event.dateTime)}</p>
                </div>

                {/* Location */}
                <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6 text-[#ffd4b9]" />
                    <h3 className="text-xl font-bold text-[#ffd4b9] font-elegant">Location</h3>
                  </div>
                  <p className="text-white font-arabian text-lg">{event.location}</p>
                </div>

                {/* Team Info */}
                <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-[#ffd4b9]" />
                    <h3 className="text-xl font-bold text-[#ffd4b9] font-elegant">Team Info</h3>
                  </div>
                  <p className="text-white font-arabian text-lg">
                    {event.isTeamEvent
                      ? `Team Event (${event.minTeamMembers}-${event.maxTeamMembers} members)`
                      : 'Individual Event'}
                  </p>
                </div>

                {/* Registration Fee */}
                <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <IndianRupee className="w-6 h-6 text-[#ffd4b9]" />
                    <h3 className="text-xl font-bold text-[#ffd4b9] font-elegant">Registration Fee</h3>
                  </div>
                  <p className="text-white font-arabian text-lg">
                    {event.regFees === 0 ? 'Free' : `₹${event.regFees}`}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30 mb-8">
                <h3 className="text-2xl font-bold text-[#ffd4b9] mb-4 font-elegant">About This Event</h3>
                <p className="text-white font-arabian text-lg leading-relaxed whitespace-pre-wrap">
                  {event.briefDescription}
                </p>
              </div>

              {/* Contact Info */}
              <div className="bg-black/20 rounded-2xl p-6 border border-[#b53da1]/30 mb-8">
                <h3 className="text-2xl font-bold text-[#ffd4b9] mb-4 font-elegant">Contact Information</h3>
                <p className="text-white font-arabian text-lg whitespace-pre-wrap">
                  {event.contactInfo}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowRegistrationForm(true)}
                  className="flex-1 bg-gradient-to-r from-[#fea6cc] to-[#ffd4b9] text-[#010101] font-bold py-4 px-8 rounded-2xl hover:from-[#ffd4b9] hover:to-[#fea7a0] transition-all duration-300 transform hover:scale-105 font-arabian text-xl shadow-lg hover:shadow-xl"
                >
                  Register Now
                </button>

                {event.pdfLink && (
                  <a
                    href={event.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2a0a56]/80 to-[#4321a9]/80 border-2 border-[#b53da1]/50 text-[#ffd4b9] py-4 px-8 rounded-2xl hover:bg-gradient-to-r hover:from-[#b53da1]/40 hover:to-[#ed6ab8]/40 hover:border-[#fea6cc] transition-all duration-300 shadow-lg hover:shadow-xl font-arabian text-xl font-bold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Details PDF</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Registration Form Modal */}
        {showRegistrationForm && event && (
          <EventRegistrationForm
            event={event}
            onClose={() => setShowRegistrationForm(false)}
            onSuccess={() => setShowRegistrationForm(false)}
          />
        )}
      </main>
    </>
  );
}
