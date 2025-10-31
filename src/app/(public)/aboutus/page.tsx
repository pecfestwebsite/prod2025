'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

// --- BACKGROUND COMPONENTS (Copied from LandingPage) ---
// Color Palette:
// #010101 - Black
// #140655 - Deep Blue
// #4321a9 - Violet
// #2a0a56 - Dark Purple
// #642aa5 - Mid Purple
// #b53da1 - Magenta
// #ed6ab8 - Pink
// #fea6cc - Light Pink
// #fea7a0 - Salmon
// #ffd4b9 - Peach

interface Star {
  id: number;
  x: string;
  y: string;
  size: string;
  duration: number;
  opacity: number;
}

const TwinklingStars = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 80}%`,
      size: `${Math.random() * 1.5 + 0.5}px`,
      duration: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[#ffd4b9] rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [star.opacity, star.opacity + 0.5, star.opacity] }}
          transition={{ duration: star.duration, repeat: Infinity, repeatType: 'mirror' }}
        />
      ))}
    </>
  );
};

const ParallaxDesert = () => {
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
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#010101] via-[#140655] to-[#2a0a56]">
      <TwinklingStars />

      <motion.div
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#4321a9] opacity-70"
        style={{ x: layer1X }}
      >
        <svg viewBox="0 0 1440 320">
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,208C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#642aa5] opacity-80"
        style={{ x: layer2X }}
      >
        <svg viewBox="0 0 1440 320">
          <path
            fill="currentColor"
            d="M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,250.7C672,267,768,245,864,213.3C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-0 w-[150%] left-[-25%] h-auto text-[#2a0a56]"
        style={{ x: layer3X }}
      >
        <svg viewBox="0 0 1440 320">
          <path
            fill="currentColor"
            d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,218.7C672,203,768,149,864,154.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </motion.div>

      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-[#010101]/60 to-transparent z-10" />
    </div>
  );
};

const FloatingLantern = ({
  duration,
  size,
  x,
  y,
  delay
}: { duration: number, size: number, x: string, y: string, delay: number }) => {
  return (
    <motion.div
      className="absolute"
      style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 10 }}
      animate={{ y: [0, -20, 0], x: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
        delay,
      }}
    >
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#ed6ab8]/0 via-[#ed6ab8]/80 to-[#fea6cc]"
        style={{ height: '100vh' }}
      />
      <div
        className="w-2/3 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-t-full"
        style={{ boxShadow: `0 0 ${size / 1.5}px rgba(237, 106, 184, 0.3)` }}
      ></div>

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

// --- NEW ABOUT PAGE COMPONENT ---

export default function AboutPage() {
  return (
    <>
      {/* Global Font Styles (Copied from LandingPage) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Aladin&family=Inter:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        
        body { font-family: 'Inter', sans-serif; background-color: #010101; }
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-aladin { font-family: 'Aladin', cursive; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
        
        @supports (background-clip: text) {
          .gradient-title {
            color: white;
            background: linear-gradient(to right, #fea6cc, #ffd4b9, #fea7a0);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }
        @supports not (background-clip: text) {
          .gradient-title {
            color: #fea6cc;
          }
        }
      `}</style>

      <main className="relative w-full bg-[#010101] overflow-x-hidden pt-10 text-white">
        {/* Render the same background elements */}
        <ParallaxDesert />
        <FloatingLantern duration={12} size={50} x="10%" y="20%" delay={0} />
        <FloatingLantern duration={15} size={30} x="85%" y="30%" delay={2} />
        <FloatingLantern duration={18} size={40} x="5%" y="60%" delay={4} />
        <FloatingLantern duration={10} size={25} x="90%" y="70%" delay={1} />
        <FloatingLantern duration={16} size={45} x="20%" y="10%" delay={5} />
        <FloatingLantern duration={11} size={30} x="70%" y="80%" delay={0.5} />


        {/* Page Content */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center pb-30 sm:p-8 pt-48">

          {/* About Content Box */}
          <motion.div
            className="w-full max-w-3xl pt-30 bg-[#010101]/60 backdrop-blur-md border border-[#b53da1]/40 rounded-2xl p-6 sm:p-10 text-center shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          >
            <motion.h1
              className="font-display text-5xl md:text-6xl gradient-title drop-shadow-[0_4px_10px_rgba(181,61,161,0.3)]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              About Us
            </motion.h1>

            <motion.p
              className="font-sans text-lg sm:text-xl text-[#ffd4b9] mt-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Dive into PECFEST 2025! Step into a neon-infused world where
              innovation meets artistic expression. PECFEST 2025 is your
              ticket to an electrifying experience that blends cutting-edge
              tech with vibrant culture. Join over 50,000 creators and
              dreamers as we shatter conventions. Get inspired by visionary
              talks, lose yourself in mind-blowing performances, and
              connect with a diverse community that thrives on passion.
              Embrace the future where tradition meets innovation, and
              creativity knows no limits.
            </motion.p>

            <motion.p
              className="font-aladin text-3xl text-[#fea6cc] mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 100 }}
            >
              Are you ready to ride the wave of inspiration?
            </motion.p>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Sparkles size={20} />
                Explore Events
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}