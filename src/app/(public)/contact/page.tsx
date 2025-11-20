'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
    Instagram,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Youtube
} from 'lucide-react';
import Link from 'next/link';

// Palette (for reference)
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

// --- REUSED BACKGROUND COMPONENTS ---
// These are copied from your LandingPage to create the same background

const ParallaxDesert = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: 'url(/14.png)',
                    opacity: 0.9
                }}
            >
                <div className="absolute inset-0 bg-black/50" />
            </div>
            <TwinklingStars />
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
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

    if (!isClient) return null;

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

// --- NEW HELPER COMPONENTS ---

const ContactItem = ({ icon, title, text, href }: { icon: React.ReactNode, title: string, text: string, href?: string }) => (
    <motion.div 
        className="flex items-start space-x-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-yellow-600/40 text-yellow-100 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg text-yellow-100">{title}</h3>
            {href ? (
                <a href={href} className="text-base sm:text-lg text-white hover:text-yellow-100 transition-colors duration-300 break-words">{text}</a>
            ) : (
                <p className="text-base sm:text-lg text-white break-words">{text}</p>
            )}
        </div>
    </motion.div>
);

const SocialIcon = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full bg-[#010101]/50 text-yellow-100 border border-transparent hover:border-yellow-500 hover:text-yellow-50 transition-all duration-300"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
    >
        {icon}
    </motion.a>
);

// --- CONTACT PAGE COMPONENT ---

export default function ContactPage() {

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
                    color: #fef3c7;
                  }
                }
                @supports not (background-clip: text) {
                  .gradient-title {
                    color: #fef3c7;
                  }
                }
            `}</style>
            
            <main className="relative w-full bg-[#010101] overflow-x-hidden text-white">
                <ParallaxDesert />
                
                {/* Floating Lanterns for ambient effect */}
                <FloatingLantern duration={12} size={50} x="10%" y="20%" delay={0} />
                <FloatingLantern duration={15} size={30} x="85%" y="30%" delay={2} />
                <FloatingLantern duration={18} size={40} x="5%" y="60%" delay={4} />
                <FloatingLantern duration={10} size={25} x="90%" y="70%" delay={1} />
                <FloatingLantern duration={16} size={45} x="20%" y="10%" delay={5} />
                <FloatingLantern duration={11} size={30} x="70%" y="80%" delay={0.5} />

                <div className="relative z-20">
                    <section id="contact" className="min-h-screen flex flex-col items-center justify-center p-4 pt-24">
                        <motion.div
                            className="w-full max-w-2xl bg-[#010101]/60 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-yellow-600/40 shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <motion.h1
                                className="font-display text-6xl md:text-7xl text-center gradient-title mb-10"
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                            >
                                Contact Us
                            </motion.h1>

                            <div className="space-y-6">
                                <ContactItem 
                                    icon={<Mail size={20} />}
                                    title="Reach out via email at"
                                    text="pecfestdev@gmail.com"
                                    href="mailto:pecfestdev@gmail.com"
                                />
                                <ContactItem 
                                    icon={<MapPin size={20} />}
                                    title="Visit us at"
                                    text="Punjab Engineering College, Sector-12, Chandigarh"
                                />
                            </div>

                            <div className="pt-6 mt-8 border-t border-yellow-600/30">
                                <h3 className="font-bold text-lg text-center text-yellow-100 mb-4 font-display">Follow Us on Social</h3>
                                <motion.div 
                                    className="flex justify-center space-x-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <SocialIcon href="https://www.instagram.com/pec.pecfest/" icon={<Instagram size={24} />} />
                                    <SocialIcon href="https://www.facebook.com/share/17WCNJbi6q/?mibextid=wwXIfr" icon={<Facebook size={24} />} />
                                    <SocialIcon href="https://www.youtube.com/@PECFESTOFFICIAL" icon={<Youtube size={24} />} />
                                </motion.div>
                            </div>
                        </motion.div>
                    </section>
                </div>

              
            </main>
        </>
    );
}