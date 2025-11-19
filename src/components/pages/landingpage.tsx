"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useScroll,
  useMotionValueEvent,
  useAnimationFrame,
  useSpring,
} from "framer-motion";
import { Instagram, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import Navbar from "@/components/Navbar";
import TwinklingStars from "@/components/ui/TwinklingStars";

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
  const time = useMotionValue(0);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  useAnimationFrame((t) => time.set(t / 1000));

  const layer1X = useTransform(mouseX, (v) => v * -0.06);
  const layer2X = useTransform(mouseX, (v) => v * -0.03);
  const layer3X = useTransform(mouseX, (v) => v * -0.01);
  const layer4X = useTransform(mouseX, (v) => v * -0.02);

  const drift1X = useTransform(time, (t) => (-t * 40) % 1920);
  const drift2X = useTransform(time, (t) => (-t * 5) % 1920);
  const drift3X = useTransform(time, (t) => (-t * 15) % 1920);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden w-full h-screen bg-gradient-to-b from-[#24153e] via-[#64446e] to-[#714c63]">
      <TwinklingStars />
      <div className="absolute h-screen w-screen bg-black"></div>
      {/* CLOUDS */}
{/* CLOUDS */}
<motion.div
  className="absolute inset-0 w-full h-auto text-[#f7ba85] opacity-70 will-change-transform"
  style={{ x: layer1X }}
>
  <motion.div
    className={`flex will-change-transform`}
    style={{ x: drift3X }}
  >
    <img
      src="clouds.webp"
      className={`relative inset-0`}
      width="1920px"
    />
    <img
      src="clouds.webp"
      className={`relative inset-0`}
      width="1920px"
    />
  </motion.div>
</motion.div>

{/* BACKGROUND CITY */}
<motion.div
  className={`absolute bottom-[-5%] left-[-12.4%] w-[2880px] h-auto text-[#f7ba85] opacity-70 will-change-transform overflow-hidden object-center`}
>
  <img
    src="bgcity.webp"
    width="1920px"
  />
</motion.div>

{/* MID DUNES */}
<motion.div
  className={`absolute flex bottom-0 left-0  w-[2880px] h-auto text-[#f7ba85] opacity-80 will-change-transform overflow-hidden object-center`}
  style={{ x: drift2X }}
>
  <img
    src="bglayer3.webp"
    width="1920px"
  />
  <img
    src="bglayer3.webp"
    width="1920px"
  />
</motion.div>

{/* CASTLES */}
<motion.div
  className={` absolute flex bottom-0 left-[-12.4%]  w-[3840px] h-auto text-[#f7ba85] will-change-transform overflow-hidden object-center`}
  style={{ x: drift3X }}
>
  <img
    src="castle(6).webp"
    width="1920px"

  />
  <img
    src="castle(6).webp"
    width="1920px"
  />
  <img
    src="castle(6).webp"
    width="1920px"
  />
</motion.div>

{/* CITY FOREGROUND */}
<motion.div
  className={`absolute bottom-0 left-0  w-[2880px] h-auto opacity-100 will-change-transform overflow-hidden object-center`}
  style={{ x: layer2X }}
>
  <motion.div className="flex" style={{ x: drift1X }}>
    <img src="city2.webp"/>
    <img src="city2.webp"/>
    <img src="city2.webp"/>
    <img src="city2.webp"/>
  </motion.div>
</motion.div>

{/* TENT LAYER */}
<motion.div
  className={` absolute bottom-[%] left-[-12.5%] w-[2880px] h-auto text-[#A06A21] object-center`}
  style={{ x: layer3X }}
>
  <img src="tent.webp"/>
</motion.div>


      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-[#010101]/60 to-transparent z-10" />
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
  const paddedValue = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-24 sm:w-28 sm:h-32 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={paddedValue}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute text-5xl sm:text-7xl font-bold text-white"
            style={{ textShadow: "0 0 5px #f7ba85" }}
          >
            {paddedValue}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-sm sm:text-base text-[#f7ba85] uppercase tracking-widest font-sans" style={{ textShadow: "0px 0px 4px #f6d0af" }}>
        {label}
      </span>
    </div>
  );
};

const FloatingLantern = ({
  duration,
  size,
  x,
  y,
  delay,
}: {
  duration: number;
  size: number;
  x: string;
  y: string;
  delay: number;
}) => {
  return (
    <motion.div
      className="fixed"
      style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 10 }}
      animate={{ y: [0, -20, 0], x: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      }}
    >
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#ed6ab8]/0 via-[#ed6ab8]/80 to-[#fea6cc]"
        style={{ height: "100vh" }}
      />
      <div
        className="w-2/3 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-t-full"
        style={{ boxShadow: `0 0 ${size / 1.5}px rgba(237, 106, 184, 0.3)` }}
      ></div>

      <div
        className="w-full h-4/6 bg-gradient-to-t from-[#b53da1] to-[#ed6ab8] rounded-t-full rounded-b-xl border-t-2 border-[#4321a9]"
        style={{
          opacity: 0.7,
          boxShadow: `0 0 ${size * 1.5}px ${
            size / 1.5
          }px rgba(237, 106, 184, 0.6)`,
        }}
      >
        <div className="w-full h-1/4 bg-[#4321a9]/40 rounded-b-xl"></div>
      </div>
      <div className="w-1/2 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-b-full"></div>
    </motion.div>
  );
};

const Countdown = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-11-21T00:00:00+05:30").getTime();
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

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLive, setIsLive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (
        newTimeLeft.days <= 0 &&
        newTimeLeft.hours <= 0 &&
        newTimeLeft.minutes <= 0 &&
        newTimeLeft.seconds <= 0
      ) {
        setIsLive(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isClient) return null;

  return (
    <div
      className="flex justify-center items-center space-x-2 sm:space-x-8 my-5 mb-10 font-sans"
      role="timer"
      aria-live="polite"
    >
      {isClient &&
        (isLive ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-bold text-white bg-gradient-to-r from-[#b53da1] to-[#ed6ab8] px-8 py-4 rounded-lg shadow-lg font-aladin"
          >
            🎉 It's Live Now!
          </motion.div>
        ) : (
          <>
            {Object.entries(timeLeft).map(([unit, value]) => (
              <TimeUnit key={unit} value={value} label={unit} />
            ))}
          </>
        ))}
    </div>
  );
};

function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-20 sm:py-32 px-4 overflow-hidden bg-gradient-to-b from-transparent to-[#010101]/80"
    >
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-purple-900/30 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-blue-900/30 to-transparent blur-3xl"></div>

      <div className="relative z-20 max-w-4xl mx-auto text-center">
        <motion.h2
          className="font-display text-5xl md:text-6xl gradient-title drop-shadow-[0_4px_10px_rgba(181,61,161,0.3)] [text-shadow:_0px_0px_2px_#ffdb6d] [text-stroke:2px_#F2B501]"
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
          Dive into PECFEST 2025! Step into a neon-infused world where
          innovation meets artistic expression. PECFEST 2025 is your ticket to
          an electrifying experience that blends cutting-edge tech with vibrant
          culture. Join over 50,000 creators and dreamers as we shatter
          conventions. Get inspired by visionary talks, lose yourself in
          mind-blowing performances, and connect with a diverse community that
          thrives on passion. Embrace the future where tradition meets
          innovation, and creativity knows no limits.
        </motion.p>
        <motion.p
          className="font-aladin text-3xl text-[#d0b25a] mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            type: "spring",
            stiffness: 100,
          }}
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
                
                body { font-family: 'Inter', sans-serif; background-color: #010101; background-image: linear-gradient(to bottom, #24153e, #64446e, #714c63); }
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

        <FloatingLantern duration={12} size={50} x="10%" y="20%" delay={0} />
        <FloatingLantern duration={15} size={30} x="85%" y="30%" delay={2} />
        <FloatingLantern duration={18} size={40} x="5%" y="40%" delay={4} />
        <FloatingLantern duration={10} size={25} x="90%" y="40%" delay={1} />
        <FloatingLantern duration={16} size={45} x="20%" y="10%" delay={5} />
        <FloatingLantern duration={11} size={30} x="70%" y="40%" delay={0.5} />

        <Navbar />

        <div className="relative z-20">
          <section
            id="home"
            className="min-h-screen flex flex-col items-center justify-center text-center p-4"
          >
            <header className="flex flex-col items-center pt-20">
              <motion.h1
                className="font-display text-8xl md:text-9xl gradient-title drop-shadow-[0_4px_10px_rgba(181,61,161,0.3)] flex flex-col items-center leading-[0.8]"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute top-[-15%] flex justify-center items-center">
                  <div className="absolute inset-0 bg-white blur-[40px] w-[250px] h-[50px] rounded-full"></div>

                  <img
                    src="TridentLogo.png"
                    className="relative inset-0 w-[250px] mb-1"
                  />
                </div>
                <span className="text-[24px] m-3 max-[480px]:m-10">Presents</span>
                <img
                  src="logo.png"
                  width={"35%"}
                  height={"35%"}
                  className="max-[480px]:w-[40%] max-[480px]:h-[40%]"
                />
              </motion.h1>

              <motion.h2
                className="font-arabian text-4xl md:text-5xl text-[#f9f5f2] [text-shadow:_4px_4px_10px_#A06A21] tracking-widest"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                Coming Soon
              </motion.h2>
            </header>
            <Countdown />
            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
            >
              <style>{`
                .fancy-btn {
                  --line_color: #b8860b;
                  --back_color: #fff8dc;
                  position: relative;
                  z-index: 0;
                  width: 240px;
                  height: 56px;
                  text-decoration: none;
                  font-size: 14px;
                  font-weight: bold;
                  color: #ffd700;
                  letter-spacing: 2px;
                  transition: all 0.3s ease;
                }
                .fancy-btn:hover {
                  color: #8b6914;
                  letter-spacing: 6px;
                }
                .fancy-btn__text {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  height: 100%;
                }
                .fancy-btn::before,
                .fancy-btn::after,
                .fancy-btn__text::before,
                .fancy-btn__text::after {
                  content: "";
                  position: absolute;
                  height: 3px;
                  border-radius: 2px;
                  background: var(--line_color);
                  transition: all 0.5s ease;
                }
                .fancy-btn::before {
                  top: 0;
                  left: 54px;
                  width: calc(100% - 56px * 2 - 16px);
                }
                .fancy-btn::after {
                  top: 0;
                  right: 54px;
                  width: 8px;
                }
                .fancy-btn__text::before {
                  bottom: 0;
                  right: 54px;
                  width: calc(100% - 56px * 2 - 16px);
                }
                .fancy-btn__text::after {
                  bottom: 0;
                  left: 54px;
                  width: 8px;
                }
                .fancy-btn__line {
                  position: absolute;
                  top: 0;
                  width: 56px;
                  height: 100%;
                  overflow: hidden;
                }
                .fancy-btn__line::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  width: 150%;
                  height: 100%;
                  box-sizing: border-box;
                  border-radius: 300px;
                  border: solid 3px var(--line_color);
                }
                .fancy-btn__line:nth-child(1),
                .fancy-btn__line:nth-child(1)::before {
                  left: 0;
                }
                .fancy-btn__line:nth-child(2),
                .fancy-btn__line:nth-child(2)::before {
                  right: 0;
                }

                .fancy-btn:hover::before,
                .fancy-btn:hover .fancy-btn__text::before {
                  width: 8px;
                }
                .fancy-btn:hover::after,
                .fancy-btn:hover .fancy-btn__text::after {
                  width: calc(100% - 56px * 2 - 16px);
                }
                .fancy-btn__drow1,
                .fancy-btn__drow2 {
                  position: absolute;
                  z-index: -1;
                  border-radius: 16px;
                  transform-origin: 16px 16px;
                  background: var(--back_color);
                }
                .fancy-btn__drow1 {
                  top: -16px;
                  left: 40px;
                  width: 32px;
                  height: 0;
                  transform: rotate(30deg);
                }
                .fancy-btn__drow2 {
                  top: 44px;
                  left: 77px;
                  width: 32px;
                  height: 0;
                  transform: rotate(-127deg);
                }
                .fancy-btn__drow1::before,
                .fancy-btn__drow1::after,
                .fancy-btn__drow2::before,
                .fancy-btn__drow2::after {
                  content: "";
                  position: absolute;
                  background: var(--back_color);
                }
                .fancy-btn__drow1::before {
                  bottom: 0;
                  left: 0;
                  width: 0;
                  height: 32px;
                  border-radius: 16px;
                  transform-origin: 16px 16px;
                  transform: rotate(-60deg);
                }
                .fancy-btn__drow1::after {
                  top: -10px;
                  left: 45px;
                  width: 0;
                  height: 32px;
                  border-radius: 16px;
                  transform-origin: 16px 16px;
                  transform: rotate(69deg);
                }
                .fancy-btn__drow2::before {
                  bottom: 0;
                  left: 0;
                  width: 0;
                  height: 32px;
                  border-radius: 16px;
                  transform-origin: 16px 16px;
                  transform: rotate(-146deg);
                }
                .fancy-btn__drow2::after {
                  bottom: 26px;
                  left: -40px;
                  width: 0;
                  height: 32px;
                  border-radius: 16px;
                  transform-origin: 16px 16px;
                  transform: rotate(-262deg);
                }
                .fancy-btn:hover .fancy-btn__drow1 {
                  animation: drow1 ease-in 0.06s;
                  animation-fill-mode: forwards;
                }
                .fancy-btn:hover .fancy-btn__drow1::before {
                  animation: drow2 linear 0.08s 0.06s;
                  animation-fill-mode: forwards;
                }
                .fancy-btn:hover .fancy-btn__drow1::after {
                  animation: drow3 linear 0.03s 0.14s;
                  animation-fill-mode: forwards;
                }
                .fancy-btn:hover .fancy-btn__drow2 {
                  animation: drow4 linear 0.06s 0.2s;
                  animation-fill-mode: forwards;
                }
                .fancy-btn:hover .fancy-btn__drow2::before {
                  animation: drow3 linear 0.03s 0.26s;
                  animation-fill-mode: forwards;
                }
                .fancy-btn:hover .fancy-btn__drow2::after {
                  animation: drow5 linear 0.06s 0.32s;
                  animation-fill-mode: forwards;
                }
                @keyframes drow1 {
                  0% { height: 0; }
                  100% { height: 100px; }
                }
                @keyframes drow2 {
                  0% { width: 0; opacity: 0; }
                  10% { opacity: 0; }
                  11% { opacity: 1; }
                  100% { width: 120px; }
                }
                @keyframes drow3 {
                  0% { width: 0; }
                  100% { width: 80px; }
                }
                @keyframes drow4 {
                  0% { height: 0; }
                  100% { height: 120px; }
                }
                @keyframes drow5 {
                  0% { width: 0; }
                  100% { width: 124px; }
                }
              `}</style>
              {!loading && (
                <Link href={user ? "/events" : "/register"} className="fancy-btn">
                  <div className="fancy-btn__line"></div>
                  <div className="fancy-btn__line"></div>
                  <span className="fancy-btn__text">{user ? "REGISTER EVENTS" : "LOGIN"}</span>
                  <div className="fancy-btn__drow1"></div>
                  <div className="fancy-btn__drow2"></div>
                </Link>
              )}
            </motion.div>
          </section>

          <AboutSection />
        </div>

        <footer className="relative w-full py-12 px-6 text-center z-30 bg-[#010101] border-t border-amber-600/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-2xl font-display bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">PECFEST 2025</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-[#fea6cc]"
              >
                <a
                  href="https://www.instagram.com/pec.pecfest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-[#ffd4b9] transition-all duration-300 hover:scale-105 group"
                >
                  <Instagram size={20} className="group-hover:animate-pulse" />
                  <span className="font-medium">@pec.pecfest</span>
                </a>
                
                <a
                  href="https://maps.app.goo.gl/wgYE4wBdCbNSV6gd9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-[#fea6cc]/80 hover:text-[#ffd4b9] transition-all duration-300 hover:scale-105 group"
                >
                  <MapPin size={20} className="group-hover:animate-pulse" />
                  <span className="font-medium">Punjab Engineering College, Chandigarh</span>
                </a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-sm text-[#fea6cc]/60 font-medium"
              >
                © 2025 PECFEST. All rights reserved.
              </motion.div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}