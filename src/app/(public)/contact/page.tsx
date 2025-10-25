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

// --- NEW HELPER COMPONENTS ---

const ContactItem = ({ icon, title, text, href }: { icon: React.ReactNode, title: string, text: string, href?: string }) => (
    <motion.div 
        className="flex items-start space-x-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#b53da1]/50 to-[#ed6ab8]/50 text-[#fea6cc] mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg text-[#fea6cc]">{title}</h3>
            {href ? (
                <a href={href} className="text-base sm:text-lg text-white hover:text-[#ffd4b9] transition-colors duration-300 break-words">{text}</a>
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
        className="p-3 rounded-full bg-[#010101]/50 text-[#fea6cc] border border-transparent hover:border-[#ed6ab8] hover:text-[#ed6ab8] transition-all duration-300"
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
                            className="w-full max-w-2xl bg-[#010101]/60 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-[#b53da1]/40 shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <motion.h1
                                className="font-aladin text-6xl md:text-7xl text-center text-transparent bg-clip-text bg-gradient-to-r from-[#fea6cc] via-[#ffd4b9] to-[#fea7a0] mb-10"
                                initial={{ opacity: 0, y: -30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                            >
                                Contact Us
                            </motion.h1>

                            <div className="space-y-6">
                                <ContactItem 
                                    icon={<Phone size={20} />}
                                    title="Call us directly at"
                                    text="XXXXX-XXXXX"
                                />
                                <ContactItem 
                                    icon={<Mail size={20} />}
                                    title="Reach out via email at"
                                    text="convener.pecfest@pec.edu.in"
                                    href="mailto:convener.pecfest@pec.edu.in"
                                />
                                <ContactItem 
                                    icon={<MapPin size={20} />}
                                    title="Visit us at"
                                    text="Punjab Engineering College, Sector-12, Chandigarh"
                                />
                            </div>

                            <div className="pt-6 mt-8 border-t border-[#b53da1]/30">
                                <h3 className="font-bold text-lg text-center text-[#fea6cc] mb-4">Follow Us on Social</h3>
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