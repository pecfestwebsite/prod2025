"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Sponsor {
  id: number;
  name: string;
  tier: keyof typeof TIERS_CONFIG;
  logo: string;
  link?: string;
}

const TIERS_CONFIG = {
  Title: { title: "Title Sponsor", color: "text-yellow-300" },
  "Co-Title": { title: "Co-Title", color: "text-yellow-400" },
  "Associate Sponsor": { title: "Associate Sponsor", color: "text-slate-200" },
  "Corporate Partner": {
    title: "Corporate Partners",
    color: "text-orange-300",
  },
  "Food Partners": { title: "Food Partners", color: "text-green-300" },
  "Kraft Street": { title: "Kraft Street", color: "text-pink-300" },
  Partners: { title: "Partners", color: "text-cyan-300" },
  // Keeping these for potential future use
  Gold: { title: "Gold Sponsors", color: "text-yellow-500" },
  Silver: { title: "Silver Sponsors", color: "text-gray-400" },
  Bronze: { title: "Bronze Sponsors", color: "text-orange-400" },
} as const;

const TIERS: (keyof typeof TIERS_CONFIG)[] = [
  "Title",
  "Co-Title",
  "Associate Sponsor",
  "Partners",
  "Corporate Partner",
  "Food Partners",
  "Kraft Street",
];

function groupSponsors(list: Sponsor[]) {
  const grouped: Record<string, Sponsor[]> = {};
  TIERS.forEach((tier) => (grouped[tier] = []));
  list.forEach((s) => grouped[s.tier].push(s));
  return grouped;
}

const AnimatedTitle = ({ title }: { title: string }) => {
  const shimmerVariants = {
    initial: { backgroundPosition: "200% 0" },
    animate: {
      backgroundPosition: "-200% 0",
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
        delay: 1,
      },
    },
  };

  return (
    <motion.h1
      className="font-display text-4xl sm:text-5xl md:text-7xl mt-4 tracking-wide uppercase text-center leading-[0.95] mb-8 sm:mb-14 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
    >
      <span className="gradient-title">{title}</span>
      <motion.span className="absolute inset-0 shimmer-effect" initial="initial" animate="animate" />
    </motion.h1>
  );
};

const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 80}%`,
      size: `${Math.random() * 1.5 + 0.5}px`,
      duration: Math.random() * 1.5 + 1.5,
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

const ShootingStars = () => {
  const [shootingStars, setShootingStars] = useState<any[]>([]);

  useEffect(() => {
    const createStar = () => ({
      id: Math.random(),
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100 - 50}%`, // Start off-screen
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 10 + 5,
    });

    const interval = setInterval(() => {
      setShootingStars((currentStars) => [...currentStars.slice(-4), createStar()]);
    }, 10000); // New star every 10 seconds

    setShootingStars([createStar()]);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute h-[2px] bg-gradient-to-r from-yellow-200/0 via-yellow-200 to-yellow-200/0"
          style={{ top: star.top, left: star.left, width: "200px" }}
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: "150vw", opacity: [0, 1, 0] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
};

const ScrollContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex justify-center items-center w-full px-4 py-18">
      <motion.div // The main scroll image
        className="fixed w-full mt-175 max-w-5xl h-[80vh] sm:h-[90vh] bg-no-repeat bg-center bg-contain origin-top"
        style={{
          backgroundImage: "url('/scroll.png')",
          backgroundSize: "100% 100%",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.6, 0.01, 0.05, 0.95], delay: 0.2 }}
      >
        <div className="absolute top-[18%] bottom-[18%] left-[10%] right-[10%] sm:top-[15.5%] sm:left-[8%] sm:right-[8%] sm:bottom-[15.5%] overflow-y-auto text-center scrollbar-none">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
const SponsorTierSection = ({ tier, sponsors }: { tier: keyof typeof TIERS_CONFIG; sponsors: Sponsor[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.section
      ref={ref}
      className="mb-12"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <h2 className="font-aladin text-4xl sm:text-5xl gradient-title mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {TIERS_CONFIG[tier].title}
      </h2>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 w-full max-w-5xl mx-auto px-4">
        {sponsors.map((s) => (
          <motion.a
            key={s.id}
            href={s.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center no-underline w-[45%] md:w-[40%]"
            // variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div
              className={`relative w-3/4 sm:w-2/3 h-[80px] transition-all duration-300 group-hover:[filter:drop-shadow(0_0_8px_rgba(255,220,180,0.6))] ${
                s.id === 23 ? "bg-slate-900/60" : "bg-slate-900/30"
              } p-2 rounded-xl backdrop-blur-sm shadow-lg flex items-center justify-center`}
            >
              <Image
                src={s.logo}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                priority={s.id === 1}
                className="object-contain"
              />
            </div>
            <span className="mt-3 text-xl sm:text-2xl text-[#21004D] font-display tracking-wider">{s.name}</span>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA: This is temporary. Remove this block to use yadur real API.
    const sponsorsData: Sponsor[] = [
      { id: 1, name: "Trident Group", tier: "Title", logo: "/TridentLogo.png" },
      { id: 2, name: "House of Google AI", tier: "Co-Title", logo: "https://drive.google.com/uc?export=view&id=1PFx-6nO6BKVOc1mPTvlLTuHTFO25GqQ_" },
      { id: 3, name: "Mach City", tier: "Associate Sponsor", logo: "https://drive.google.com/uc?export=view&id=1ZG9zHFEn1FZ3yvH-EqCQsIr_QYa1dhiU" },
      { id: 36, name: "Mendallion Auram", tier: "Associate Sponsor", logo: "https://drive.google.com/uc?export=view&id=1oaVxUeoEW2T-GN2CP6v5Cm2dYT9xeGka" },
      { id: 4, name: "Couture Perfumery", tier: "Corporate Partner", logo: "https://drive.google.com/uc?export=view&id=13_MzTsevZP5-bJPXw_gsHizNmC13mfGR" },
      { id: 5, name: "Denver", tier: "Corporate Partner", logo: "https://drive.google.com/uc?export=view&id=136h9whocnCN2iJPR5VsYoHGVlS-3z3nZ" },
      { id: 6, name: "Dubai Royal by Elvis", tier: "Corporate Partner", logo: "https://drive.google.com/uc?export=view&id=1l7Az7o3p75Nti_6N4RBW3PXuOVc9Ioj_" },
      { id: 7, name: "Audichaiwla", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1dzVfn-kQv37jk_AYVbAD3oUcOiYucG8a" },
      { id: 8, name: "Bon Bon Bakery", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1884ZTw79p1JMu0SVSJLQZsLtuhz5a0oG" },
      { id: 9, name: "Burgerito", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1yCCURi3Uc1CT5YFzIajopmxe045GALCh" },
      { id: 10, name: "Burki", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1cYCI2x79slDzMz820m7w9uuq-TSpUhFn" },
      { id: 40, name: "Covi", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=19VoP9bmRFmjWrii5lYuhvF0xW70HQLIA" },
      { id: 11, name: "Don Clooney Logo", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1dE0KA_SUNqS89se610r3KE0VYkKPWhDx" },
      { id: 18, name: "Desi Chatkare", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1gLC05UOHXVF88tX-PdBCngb70Lp7eT7H" },
      { id: 12, name: "Eggcult x Trujoe's", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1km2KlWoFuP9UlTfEblEuBO03MYjrL9Ae" },
      { id: 13, name: "Janta Premium", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1EHcaKCRknuJ9cCK5s2FchD1miKg3nhFm" },
      { id: 14, name: "Markfed & Sohna", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1Zg0MLWd2twhutX6lr3-I0lo4KfWKuwE2" },
      { id: 15, name: "Rominus", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=18G9-MKVrUg0jcjlPdKdot7Seed9mJydY" },
      { id: 16, name: "Saanwara", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1mDCQCELeuBbim9eaJAFCF5dPTvJVAuyT" },
      { id: 17, name: "Verka", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1no-DWjXl9bzMTmcAzowQNqo2G4qOyaoQ" },
      { id: 19, name: "ZERO OIL FOOD point", tier: "Food Partners", logo: "https://drive.google.com/uc?export=view&id=1qIh9ZcG7zAKprJ5QU_6bk-TacG2C6eQ6" },
      { id: 20, name: "Cosmic Jewels", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1Mz69gYSvcvAIl_nNm9SMEFDuD48IMKQB" },
      { id: 21, name: "Crochet Lover", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=10vw4i_CsWC7lxV3oMEceImO-0JgaaQ_d" },
      { id: 22, name: "FleaCrew", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1h7ADn2Yuf9w5S_BDAtDM4aIzjU1zX8Ds" },
      { id: 23, name: "Heeya Care", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1JL_H5rrwws2ToGjI9MSUIPt0dJdtTsL5" },
      { id: 24, name: "Makeup & Adah", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1K54C5W8fxJTYO5BSHhQRNKCzaPc0oMPp" },
      { id: 25, name: "Mamta Bakes", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1X2WqbGJSiyY6RaaMyMwa7v_KhZmqVPoZ" },
      { id: 26, name: "Nawab Perfumes Logo", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1DJm-thaP8bc_xdNmZOO8Jw2EyRoCMARG" },
      { id: 27, name: "PS Magic", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=1FRiwZ_2gwsUt7prtHeKKh4IeFdJamRn4" },
      { id: 28, name: "Rivyah", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=12_VJUs8N5zrXe5CxumKvs2WgaGl0N84q" },
      { id: 29, name: "Studded Wings", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=10AQYw-R8mKzFGUSVN_pkQ-Lm5Xu_lSdw" },
      { id: 30, name: "HML", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1UFsBBIARQnsJ2CqI_WQhknmPJpvU4Bbk" },
      { id: 31, name: "Instax", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1J_wgwjztSrfwTX55dnE4w5LXLdjDC_lS" },
      { id: 32, name: "Jio Saavan", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1jyVdlv2AiZI9omhRy8UEFGZJ7ZxKGiVD" },
      { id: 33, name: "Khayal Health", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1s1Xjo4rkJKJSiiW9UZ-tfrh_Lu4kbK-f" },
      { id: 34, name: "Make Your Own Perfume", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1Q6g0CBqSMOi5zt8DF7yr2Ta6b5irsiT8" },
      { id: 35, name: "Head Masters", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1IpF7WXPm157fm3MNnnzYI_MG6QaX1EcW" },
      { id: 38, name: "The Sacred Shuffle", tier: "Kraft Street", logo: "https://drive.google.com/uc?export=view&id=172rZSbBFgKBlxZMfzoA2bji1fwz9CQqc" },
      { id: 39, name: "Vardhaman Textiles", tier: "Corporate Partner", logo: "https://drive.google.com/uc?export=view&id=1VejpmyraGfBt57iTFhpdUu03BCASUMXP" },
      { id: 41, name: "Sonalika", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1bk_b1_ZOpj6QkqhJQdVFIF7zCFywT5AX" },
      { id: 42, name: "State Bank of India", tier: "Partners", logo: "https://drive.google.com/uc?export=view&id=1W4v7JsMGoRh_dkl_LT2MPXqijLli5-MD" },
      { id: 43, name: "TCC", tier: "Partners", logo: "https://drive.google.com/uc?id=1_OH25sFOHKEAr_OoK9ASFge9O2ptjOmR" },
      { id: 37, name: "Zenroz", tier: "Kraft Street", logo: "https://drive.google.com/uc?id=16yy3I3nkI8AT0haTsN1w56mmllfOyPpf" },

    ];

    setTimeout(() => {
      setSponsors(sponsorsData);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  const grouped = groupSponsors(sponsors);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Aladin&family=Inter:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');

        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @font-face {
          font-family: 'Arabic';
          src: url('/arabic.otf') format('opentype');
          font-display: swap;
        }
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabic { font-family: 'Arabic', serif; }
        .arabian-border {
          border-image: linear-gradient(45deg, #b53da1, #ed6ab8, #fea6cc, #ffd4b9) 1;
        }

        .gradient-title {
          background: linear-gradient(to right, #79254aff, #343080ff, #6e3a7fff);
          background-size: 50% auto;
          background-position: center;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .shimmer-effect {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <main>
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/sponsor-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="fixed inset-0 pointer-events-none">
          <TwinklingStars />
          <ShootingStars />
        </div>

        <ScrollContainer>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-900 border-t-purple-500"></div>
            </div>
          ) : (
            <>
              <AnimatedTitle title="Our Sponsors" />
              {TIERS.map(
                (tier) =>
                  grouped[tier]?.length > 0 && (
                    <SponsorTierSection key={tier} tier={tier} sponsors={grouped[tier]} />
                  )
              )}
            </>
          )}
        </ScrollContainer>
      </main>
    </>
  );
}