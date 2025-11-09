"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Sponsor {
  id: number;
  name: string;
  tier: "Title" | "Marketing" | "Media" | "Partner";
  logo: string;
}

const TIERS = ["Title", "Marketing", "Media", "Partner"] as const;

function groupSponsors(list: Sponsor[]) {
  const grouped: Record<string, Sponsor[]> = {};
  TIERS.forEach((tier) => (grouped[tier] = []));
  list.forEach((s) => grouped[s.tier].push(s));
  return grouped;
}

const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);
  useEffect(() => {
    const generated = Array.from({ length: 160 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${Math.random() * 5 + 2}px`,
      duration: Math.random() * 1.5 + 1.5,
    }));
    setStars(generated);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[#ffd4b9] rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity }}
        />
      ))}
    </>
  );
};

const ScrollContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex justify-center items-center w-full px-4">
      <div
        className="fixed w-full mt-175 max-w-5xl h-[80vh] bg-no-repeat bg-center bg-contain"
        style={{
          backgroundImage: "url('/scroll.png')",
          backgroundSize: "100% 100%",
        }}
      >
        <div className="absolute top-[15.5%] left-[8%] right-[8%] bottom-[15.5%] overflow-y-auto text-center scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA: This is temporary. Remove this block to use your real API.
    const mockSponsors: Sponsor[] = [
      { id: 1, name: "Trident", tier: "Title", logo: "/TridentLogo.png" },
      // You can add more mock sponsors here to test the layout
      // { id: 2, name: "Marketing Co.", tier: "Marketing", logo: "/marketing-logo.png" },
      // { id: 3, name: "Media Inc.", tier: "Media", logo: "/media-logo.png" },
      // { id: 4, name: "Partner LLC", tier: "Partner", logo: "/partner-logo.png" },
    ];
    setTimeout(() => {
      setSponsors(mockSponsors);
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

        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
        .font-aladin { font-family: 'Aladin', cursive; }

        .gradient-title {
          background: linear-gradient(to right, #79254aff, #343080ff, #6e3a7fff);
          background-size: 50% auto;
          background-position: center;
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
        </div>

        <ScrollContainer>
          {loading ? (
            <div className="gradient-title font-display text-5xl mt-30 pt-10">Loading...</div>
          ) : (
            <>
          <motion.h1
            className="font-display text-5xl mt-4 md:text-7xl gradient-title tracking-wide uppercase flex flex-col items-center leading-[0.95] mb-14"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            OUR SPONSORS
          </motion.h1>


              {TIERS.map(
                (tier) =>
                  grouped[tier].length > 0 && (
                    <section key={tier} className="mb-10">
                      <h2 className="font-aladin text-4xl text-[#2B005F] mb-4">{tier} Sponsors</h2>

                      <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 w-full max-w-4xl mx-auto px-6">
                        {grouped[tier].map((s) => (
                          <div key={s.id} className="flex flex-col items-center">
                            <div className="bg-black/25 p-4 rounded-lg backdrop-blur-sm shadow-lg">
                              <Image
                                src={s.logo}
                                alt={s.name}
                                height={90}
                                width={230}
                                className="object-contain"
                              />
                            </div>
                            <span className="mt-2 text-2xl text-[#21004D] font-display">
                              {s.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
              )}
            </>
          )}
        </ScrollContainer>
      </main>
    </>
  );
}