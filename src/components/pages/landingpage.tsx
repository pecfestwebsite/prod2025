'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll, useMotionValueEvent } from 'framer-motion';
import { Instagram, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Navbar from '@/components/Navbar';

// Palette :
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

            <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-[#010101]/60 to-transparent z-10"/>
        </div>
    );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
    const paddedValue = String(value).padStart(2, '0');
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-24 sm:w-28 sm:h-32 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={paddedValue}
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute text-5xl sm:text-7xl font-bold text-white"
                        style={{ textShadow: '0 0 10px rgba(237, 106, 184, 0.5)' }} 
                    >
                        {paddedValue}
                    </motion.div>
                </AnimatePresence>
            </div>
            <span className="text-sm sm:text-base text-[#fea6cc] uppercase tracking-widest font-sans">{label}</span>
        </div>
    );
};


const FloatingLantern = ({ duration, size, x, y, delay }: { duration: number, size: number, x: string, y: string, delay: number }) => {
    return (
        <motion.div
            className="absolute"
            style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 10 }} 
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

const TwinklingStars = () => {
    const [stars, setStars] = useState<any[]>([]);

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
            {stars.map(star => (
                <motion.div
                    key={star.id}
                    className="absolute bg-[#ffd4b9] rounded-full"
                    style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
                    animate={{ opacity: [star.opacity, star.opacity + 0.5, star.opacity] }}
                    transition={{ duration: star.duration, repeat: Infinity, repeatType: 'mirror' }}
                />))}
        </>
    );
};

const Countdown = () => {
    const calculateTimeLeft = () => {
        const targetDate = new Date('2025-11-21T00:00:00+05:30').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 }); 
    const [isLive, setIsLive] = useState(false);
    const [isClient, setIsClient] = useState(false); 

    useEffect(() => {
        setIsClient(true);
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (newTimeLeft.days <= 0 && newTimeLeft.hours <= 0 && newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0) {
                setIsLive(true); 
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isClient) return null;

    return (
        <div className="flex justify-center items-center space-x-2 sm:space-x-8 my-10 font-sans" role="timer" aria-live="polite">
            {isClient && ( 
                isLive ? (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl sm:text-6xl font-bold text-white bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] px-8 py-4 rounded-lg shadow-lg font-aladin"
                    >
                        🎉 It’s Live Now!
                    </motion.div>
                ) : (
                    <>
                        {Object.entries(timeLeft).map(([unit, value]) => <TimeUnit key={unit} value={value} label={unit} />)}
                    </>
                )
            )}
        </div>
    );
};

function AboutSection() {
    return (
        <section id="about" className="relative py-20 sm:py-32 px-4 overflow-hidden bg-gradient-to-b from-transparent to-[#010101]/80">
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-purple-900/30 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-blue-900/30 to-transparent blur-3xl"></div>
            
            <div className="relative z-20 max-w-4xl mx-auto text-center">
                <motion.h2 
                    className="font-display text-5xl md:text-6xl gradient-title drop-shadow-[0_4px_10px_rgba(181,61,161,0.3)]"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.7 }}
                >
                    About Us
                </motion.h2>
                <motion.p 
                    className="font-sans text-lg sm:text-xl text-[#ffd4b9] mt-8 leading-relaxed max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    Dive into PECFEST 2025! Step into a neon-infused world where innovation meets artistic expression. PECFEST 2025 is your ticket to an electrifying experience that blends cutting-edge tech with vibrant culture. Join over 50,000 creators and dreamers as we shatter conventions. Get inspired by visionary talks, lose yourself in mind-blowing performances, and connect with a diverse community that thrives on passion. Embrace the future where tradition meets innovation, and creativity knows no limits.
                </motion.p>
                <motion.p 
                    className="font-aladin text-3xl text-[#fea6cc] mt-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 100 }}
                >
                    Are you ready to ride the wave of inspiration?
                </motion.p>
            </div>
        </section>
    );
}

export default function LandingPage() {
    const { user, loading } = useAuth();

    return (
        <>
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
            
            <main className="relative w-full bg-[#010101] overflow-x-hidden text-white">
                <ParallaxDesert />
                
                {/* Crescent Moon Icon */}
                {/* <motion.div */}
                    {/* // className="absolute top-12 left-48 z-40" */}
                    {/* // animate={{ rotate: [0, -10, 0], scale: [1, 1.05, 1] }} */}
                    {/* // transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} */}
                {/* > */}
                    {/* <svg width="60" height="60" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"
                        className="text-[#ffd4b9] drop-shadow-[0_0_10px_#ffd4b9]">
                        <path fill="currentColor" d="M30.312.776C32 19 20 32 .776 30.312c8.199 7.717 21.091 7.588 29.107-.429C37.9 21.867 38.03 8.975 30.312.776z"></path>
                        {/* The second path for craters can be added here if desired, but it might not be visible with a single color */}
                        {/* <path d="M30.705 15.915a1.163 1.163 0 1 0 1.643 1.641a1.163 1.163 0 0 0-1.643-1.641zm-16.022 14.38a1.74 1.74 0 0 0 0 2.465a1.742 1.742 0 1 0 0-2.465zm13.968-2.147a2.904 2.904 0 0 1-4.108 0a2.902 2.902 0 0 1 0-4.107a2.902 2.902 0 0 1 4.108 0a2.902 2.902 0 0 1 0 4.107z" fill="#FFCC4D"></path> */}
                    {/* </svg>  */}
                {/* </motion.div> */}
                
                <FloatingLantern duration={12} size={50} x="10%" y="20%" delay={0} />
                <FloatingLantern duration={15} size={30} x="85%" y="30%" delay={2} />
                <FloatingLantern duration={18} size={40} x="5%" y="60%" delay={4} />
                <FloatingLantern duration={10} size={25} x="90%" y="70%" delay={1} />
                <FloatingLantern duration={16} size={45} x="20%" y="10%" delay={5} />
                <FloatingLantern duration={11} size={30} x="70%" y="80%" delay={0.5} />

                {/* <Navbar /> */}

                <div className="relative z-20">

                    <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                        <header className="flex flex-col items-center pt-20">
                            <motion.h1
                                className="font-display text-8xl md:text-9xl gradient-title drop-shadow-[0_4px_10px_rgba(181,61,161,0.3)] flex flex-col items-center leading-[0.8]"
                                initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}
                            >
                                <span>PEC</span>
                                <span>FEST </span>
                            </motion.h1>
                            
                            <motion.h2
                                className="font-arabian text-4xl md:text-5xl text-[#fea6cc] mt-4 tracking-widest" 
                                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            >Coming Soon</motion.h2>
                        </header>
                        <Countdown />
                        <motion.div
                            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
                        >
                            {!loading && (
                                <Link 
                                    href={user ? "/events" : "/register"} 
                                    className={`${
                                        user 
                                            ? "border-2 border-[#ed6ab8] hover:bg-[#ed6ab8]/20" 
                                            : "bg-gradient-to-r from-[#b53da1] to-[#ed6ab8]"
                                    } text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all duration-300`}
                                >
                                    {user ? "Register Events" : "Login"}
                                </Link>
                            )}
                        </motion.div>
                    </section>

                    <AboutSection />

                </div>

                <footer className="relative w-full p-6 text-center text-[#fea6cc] z-30 bg-[#010101]/40">
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <a href="https://www.instagram.com/pec.pecfest/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-[#ffd4b9] transition-colors">
                            <Instagram size={20} />
                            <span>@pec.pecfest</span>
                        </a>
                        <span className="hidden sm:inline">|</span>
                        <div className="flex items-center space-x-2">
                            <MapPin size={20} />
                            <span>Punjab Engineering College, Chandigarh</span>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}
