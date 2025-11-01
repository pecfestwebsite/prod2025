'use client';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TeamMemberCard } from '@/components/TeamMemberCard';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  name: string;
  photoUrl: string;
  role: string;
}

interface Committee {
  committeeName: string;
  members: TeamMember[];
}

const committeesData: Committee[] = [
  {
    "committeeName": "Organizing Committee",
    "members": [
      {
        "id": "22104040",
        "name": "Aarav Bhardwaj",
        "photoUrl": "/images/team/Aarav_Bhardwaj.jpg",
        "role": "Convener"
      },
      {
        "id": "22105021",
        "name": "Saarthak Goyal",
        "photoUrl": "/images/team/Saarthak_Goyal.jpg",
        "role": "Co-Convener"
      }
    ]
  },
  {
    "committeeName": "Marketing",
    "members": [
      {
        "id": "22107011",
        "name": "Manik Goyal",
        "photoUrl": "/images/team/Manik_Goyal.jpg",
        "role": "Head"
      },
      {
        "id": "22108035",
        "name": "Raushan Kumar",
        "photoUrl": "/images/team/Raushan_Kumar.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Mega Shows",
    "members": [
      {
        "id": "22106005",
        "name": "Harmanpreet Kaur",
        "photoUrl": "/images/team/Harmanpreet_Kaur.jpg",
        "role": "Head"
      },
      {
        "id": "22104009",
        "name": "Lakshit Jain",
        "photoUrl": "/images/team/Lakshit_Jain.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22107025",
        "name": "Hrdiyaa Nijhawan",
        "photoUrl": "/images/team/Hrdiyaa_Nijhawan.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22105029",
        "name": "Aanya Saini",
        "photoUrl": "/images/team/Aanya_Saini.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22103021",
        "name": "Brahmnoor Singh",
        "photoUrl": "/images/team/Brahmnoor_Singh.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Alumni and Industry Relations",
    "members": [
      {
        "id": "22105068",
        "name": "Vaibhav Makkar",
        "photoUrl": "/images/team/Vaibhav_Makkar.jpg",
        "role": "Head"
      },
      {
        "id": "22107018",
        "name": "Ekom P Saidha",
        "photoUrl": "/images/team/Ekom_P_Saidha.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22105133",
        "name": "Archie Garg",
        "photoUrl": "/images/team/Archie_Garg.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Printing & Stationery",
    "members": [
      {
        "id": "22109036",
        "name": "Vikas Attri",
        "photoUrl": "/images/team/Vikas_Attri.jpg",
        "role": "Head"
      },
      {
        "id": "22105076",
        "name": "Rishabh Saggar",
        "photoUrl": "/images/team/Rishabh_Saggar.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22102101",
        "name": "Aashish dodwal",
        "photoUrl": "/images/team/Aashish_dodwal.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Infrastructure",
    "members": [
      {
        "id": "22105025",
        "name": "Harshul Singla",
        "photoUrl": "/images/team/Harshul_Singla.jpg",
        "role": "Head"
      },
      {
        "id": "22101025",
        "name": "Varun",
        "photoUrl": "/images/team/Varun.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22108052",
        "name": "Jatin Chauhan",
        "photoUrl": "/images/team/Jatin_Chauhan.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22102127",
        "name": "Indra Kumar",
        "photoUrl": "/images/team/Indra_Kumar.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Creative",
    "members": [
      {
        "id": "22107088",
        "name": "Gopal Pareek",
        "photoUrl": "/images/team/Gopal_Pareek.jpg",
        "role": "Head"
      },
      {
        "id": "22106054",
        "name": "Sartaaj",
        "photoUrl": "/images/team/Sartaaj.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22102037",
        "name": "Aayush Chauhan",
        "photoUrl": "/images/team/Sartaaj.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22104074",
        "name": "Hitesh Kochar",
        "photoUrl": "/images/team/Sartaaj.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22102097",
        "name": "Rishabh Tripathi",
        "photoUrl": "/images/team/Sartaaj.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Event Coordination (Cultural)",
    "members": [
      {
        "id": "22107027",
        "name": "Avi Sinha",
        "photoUrl": "/images/team/Avi_Sinha.jpg",
        "role": "Head"
      },
      {
        "id": "22102113",
        "name": "Mihika Arora",
        "photoUrl": "/images/team/Mihika_Arora.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Event Coordination (Technical)",
    "members": [
      {
        "id": "22105086",
        "name": "Kunal Dhawan",
        "photoUrl": "/images/team/Kunal_Dhawan.jpg",
        "role": "Head"
      },
      {
        "id": "22105005",
        "name": "Aryaman Sharma",
        "photoUrl": "/images/team/Aryaman_Sharma.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Finance",
    "members": [
      {
        "id": "22105031",
        "name": "Ishaan Gupta",
        "photoUrl": "/images/team/Ishaan_Gupta.jpg",
        "role": "Head"
      },
      {
        "id": "22105048",
        "name": "Sidharth Chauhan",
        "photoUrl": "/images/team/Sidharth_Chauhan.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22105142",
        "name": "Tushar Saini",
        "photoUrl": "/images/team/Tushar_Saini.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Public Relations & Media",
    "members": [
      {
        "id": "22108011",
        "name": "Kinjal Gulati",
        "photoUrl": "/images/team/Kinjal_Gulati.jpg",
        "role": "Head"
      },
      {
        "id": "22109033",
        "name": "V. Ajith",
        "photoUrl": "/images/team/V_Ajith.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Hospitality & Logistics",
    "members": [
      {
        "id": "22108058",
        "name": "Mahesh Ratta",
        "photoUrl": "/images/team/Mahesh_Ratta.jpg",
        "role": "Head"
      },
      {
        "id": "22109017",
        "name": "Vansh Dhiman",
        "photoUrl": "/images/team/Vansh_Dhiman.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Website Management",
    "members": [
      {
        "id": "22106063",
        "name": "Ribhav Aggarwal",
        "photoUrl": "/images/team/Ribhav_Aggarwal.jpg",
        "role": "Head"
      },
      {
        "id": "22103104",
        "name": "Prasuk Jain",
        "photoUrl": "/images/team/Prasuk_Jain.jpg",
        "role": "Co-Head"
      }
    ]
  },
  {
    "committeeName": "Publicity",
    "members": [
      {
        "id": "22105026",
        "name": "Saksham Prashar",
        "photoUrl": "/images/team/Saksham_Prashar.jpg",
        "role": "Head"
      },
      {
        "id": "22103088",
        "name": "Saira Garg",
        "photoUrl": "/images/team/Saira_Garg.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22103009",
        "name": "Mananpreet kaur",
        "photoUrl": "/images/team/Mananpreet_Kaur.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22105009",
        "name": "Ishnoor Singh",
        "photoUrl": "/images/team/Ishnoor_Singh.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Security and Discipline",
    "members": [
      {
        "id": "22103128",
        "name": "Sehajdeep Singh",
        "photoUrl": "/images/team/Sehajdeep_Singh.jpg",
        "role": "Head"
      },
      {
        "id": "22104024",
        "name": "Armaan Singh Brar",
        "photoUrl": "/images/team/Armaan_Singh_Brar.jpg",
        "role": "Co-Head"
      },
      {
        "id": "22105053",
        "name": "Vansh Bhatia",
        "photoUrl": "/images/team/Vansh_Bhatia.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22103075",
        "name": "Pratham Garg",
        "photoUrl": "/images/team/Pratham_Garg.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22106040",
        "name": "Gauravpreet Singh",
        "photoUrl": "/images/team/Gauravpreet_Singh.jpg",
        "role": "Operational Head"
      },
      {
        "id": "22109028",
        "name": "Mayank Saharan",
        "photoUrl": "/images/team/Mayank_Saharan.jpg",
        "role": "Operational Head"
      }
    ]
  },
  {
    "committeeName": "Coverage Committee",
    "members": [
      {
        "id": "22104103",
        "name": "Akshay Sharma",
        "photoUrl": "/images/team/Akshay_Sharma.jpg",
        "role": "Head"
      },
      {
        "id": "22105054",
        "name": "Aniket Singh Indora",
        "photoUrl": "/images/team/Aniket_Singh_Indora.jpg",
        "role": "Co-Head"
      }
    ]
  }
];

// Color gradients matching the website theme
const slideColors = [
  'linear-gradient(135deg, #140655 0%, #2a0a56 50%, #4321a9 100%)', // Deep purple
  'linear-gradient(135deg, #b53da1 0%, #ed6ab8 50%, #fea6cc 100%)', // Pink
  'linear-gradient(135deg, #010101 0%, #140655 50%, #2a0a56 100%)', // Dark purple
  'linear-gradient(135deg, #2a0a56 0%, #4321a9 50%, #6b3dc4 100%)', // Medium purple
  'linear-gradient(135deg, #ed6ab8 0%, #fea6cc 50%, #ffd4b9 100%)', // Pink to peach
  'linear-gradient(135deg, #010101 0%, #2a0a56 50%, #b53da1 100%)', // Dark to pink
  'linear-gradient(135deg, #4321a9 0%, #b53da1 50%, #ed6ab8 100%)', // Purple to pink
  'linear-gradient(135deg, #140655 0%, #4321a9 50%, #ed6ab8 100%)', // Deep purple to pink
  'linear-gradient(135deg, #2a0a56 0%, #ed6ab8 50%, #fea6cc 100%)', // Purple to light pink
  'linear-gradient(135deg, #010101 0%, #b53da1 50%, #fea6cc 100%)', // Dark to pink
  'linear-gradient(135deg, #4321a9 0%, #2a0a56 50%, #140655 100%)', // Reverse purple
  'linear-gradient(135deg, #b53da1 0%, #4321a9 50%, #2a0a56 100%)', // Pink to purple
  'linear-gradient(135deg, #fea6cc 0%, #ed6ab8 50%, #b53da1 100%)', // Light to dark pink
  'linear-gradient(135deg, #010101 0%, #4321a9 50%, #fea6cc 100%)', // Dark to light
  'linear-gradient(135deg, #2a0a56 0%, #b53da1 50%, #ffd4b9 100%)', // Purple to peach
  'linear-gradient(135deg, #140655 0%, #4321a9 50%, #ed6ab8 100%)', // Deep purple to pink
];

// Twinkling Stars Component
const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 80}%`,
      size: `${Math.random() * 2 + 0.5}px`,
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
          className="absolute bg-[#ffd4b9] rounded-full pointer-events-none"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size, zIndex: 1 }}
          animate={{ opacity: [star.opacity, star.opacity + 0.5, star.opacity] }}
          transition={{ duration: star.duration, repeat: Infinity, repeatType: 'mirror' }}
        />
      ))}
    </>
  );
};

// Floating Lantern Component
const FloatingLantern = ({ duration, size, x, y, delay }: { duration: number, size: number, x: string, y: string, delay: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
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

export default function Page() {
  useEffect(() => {
    gsap.registerPlugin(Observer, ScrollTrigger);

    const sections = gsap.utils.toArray<HTMLElement>('.slide');
    const images = gsap.utils.toArray<HTMLElement>('.image').reverse();
    const slideImages = gsap.utils.toArray<HTMLElement>('.slide__img');
    const outerWrappers = gsap.utils.toArray<HTMLElement>('.slide__outer');
    const innerWrappers = gsap.utils.toArray<HTMLElement>('.slide__inner');
    const count = document.querySelector('.count') as HTMLElement | null;
    const wrap = gsap.utils.wrap(0, sections.length);
    let animating = false;
    let currentIndex = 0;

    gsap.set(outerWrappers, { xPercent: 100 });
    gsap.set(innerWrappers, { xPercent: -100 });
    gsap.set('.slide:nth-of-type(1) .slide__outer', { xPercent: 0 });
    gsap.set('.slide:nth-of-type(1) .slide__inner', { xPercent: 0 });

    function gotoSection(index: number, direction: number) {
      animating = true;
      index = wrap(index);

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'expo.inOut' },
        onComplete: () => {
          animating = false;
        }
      });

      const currentSection = sections[currentIndex];
      const heading = currentSection.querySelector('.slide__heading') as HTMLElement;
      const nextSection = sections[index];
      const nextHeading = nextSection.querySelector('.slide__heading') as HTMLElement;
      
      // Get card wrappers for animation
      const currentCards = currentSection.querySelectorAll('.team-card-wrapper');
      const nextCards = nextSection.querySelectorAll('.team-card-wrapper');

      // Set z-index and visibility for sections
      gsap.set(sections, { zIndex: 0, autoAlpha: 0 });
      gsap.set(sections[currentIndex], { zIndex: 1, autoAlpha: 1 });
      gsap.set(sections[index], { zIndex: 2, autoAlpha: 1 });
      
      // Only animate images if they exist
      if (images.length > 0) {
        gsap.set(images, { zIndex: 0, autoAlpha: 0 });
        if (images[index]) gsap.set(images[index], { zIndex: 1, autoAlpha: 1 });
        if (images[currentIndex]) gsap.set(images[currentIndex], { zIndex: 2, autoAlpha: 1 });
      }

      tl.set(count, { textContent: `${index + 1}` }, 0.32)
        .fromTo(
          outerWrappers[index],
          { xPercent: 100 * direction },
          { xPercent: 0 },
          0
        )
        .fromTo(
          innerWrappers[index],
          { xPercent: -100 * direction },
          { xPercent: 0 },
          0
        )
        .to(
          heading,
          { '--width': 800, xPercent: 30 * direction },
          0
        )
        .fromTo(
          nextHeading,
          { '--width': 800, xPercent: -30 * direction },
          { '--width': 200, xPercent: 0 },
          0
        )
        // Animate out current cards
        .to(
          currentCards,
          {
            opacity: 0,
            y: -30 * direction,
            scale: 0.9,
            stagger: 0.05,
            duration: 0.5,
            ease: 'power2.in'
          },
          0
        )
        // Animate in next cards
        .fromTo(
          nextCards,
          {
            opacity: 0,
            y: 30 * direction,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.6,
            ease: 'power2.out'
          },
          0.4
        );

      // Only animate images if they exist
      if (images.length > 0 && images[index]) {
        tl.fromTo(
          images[index],
          { xPercent: 125 * direction, scaleX: 1.5, scaleY: 1.3 },
          { xPercent: 0, scaleX: 1, scaleY: 1, duration: 1 },
          0
        );
      }
      
      if (images.length > 0 && images[currentIndex]) {
        tl.fromTo(
          images[currentIndex],
          { xPercent: 0, scaleX: 1, scaleY: 1 },
          { xPercent: -125 * direction, scaleX: 1.5, scaleY: 1.3 },
          0
        );
      }
      
      // Only animate slide images if they exist
      if (slideImages.length > 0 && slideImages[index]) {
        tl.fromTo(
          slideImages[index],
          { scale: 2 },
          { scale: 1 },
          0
        );
      }
      
      tl.timeScale(0.8);

      currentIndex = index;
    }

    Observer.create({
      type: 'wheel,touch,pointer',
      preventDefault: true,
      wheelSpeed: -1,
      onUp: () => {
        if (animating) return;
        gotoSection(currentIndex + 1, +1);
      },
      onDown: () => {
        if (animating) return;
        gotoSection(currentIndex - 1, -1);
      },
      tolerance: 10
    });

    document.addEventListener('keydown', (e) => {
      if ((e.code === 'ArrowUp' || e.code === 'ArrowLeft') && !animating) {
        gotoSection(currentIndex - 1, -1);
      }
      if (
        (e.code === 'ArrowDown' ||
          e.code === 'ArrowRight' ||
          e.code === 'Space' ||
          e.code === 'Enter') &&
        !animating
      ) {
        gotoSection(currentIndex + 1, 1);
      }
    });
  }, []);

  return (
    <main>
      {/* Slides */}
      {committeesData.map((committee, i) => (
        <section className="slide" key={i}>
          <div className="slide__outer">
            <div className="slide__inner">
              <div 
                className="slide__content" 
                style={{ background: slideColors[i % slideColors.length] }}
              >
                {/* Stars */}
                <TwinklingStars />
                
                {/* Lanterns */}
                <FloatingLantern duration={6} size={30} x="10%" y="15%" delay={0} />
                <FloatingLantern duration={7} size={25} x="85%" y="25%" delay={1} />
                <FloatingLantern duration={5.5} size={28} x="15%" y="60%" delay={2} />
                <FloatingLantern duration={6.5} size={32} x="90%" y="70%" delay={1.5} />
                
                <div className="slide__container">
                  <h2 className="slide__heading">{committee.committeeName}</h2>
                  <div className="slide__members">
                    {committee.members.map((member, idx) => (
                      <div 
                        key={member.id}
                        className="team-card-wrapper"
                        style={{
                          animationDelay: `${idx * 0.1}s`
                        }}
                      >
                        <TeamMemberCard member={member} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Overlay */}
      <section className="overlay">
        <div className="overlay__content">
          <p className="overlay__count">
            0<span className="count">1</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>PECFEST 2025 - Team</p>
        <p>Scroll to explore committees</p>
      </footer>

      {/* Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sora&display=swap");
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @font-face {
          font-family: "Bandeins Sans & Strange Variable";
          src: url("https://res.cloudinary.com/dldmpwpcp/raw/upload/v1566406079/BandeinsStrangeVariable_esetvq.ttf");
        }
        * {
          box-sizing: border-box;
          user-select: none;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        figure {
          margin: 0;
          overflow: hidden;
        }
        html,
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          height: 100vh;
        }
        body {
          color: #fff;
          background: #010101;
          font-family: "Sora", sans-serif;
        }
        footer {
          position: fixed;
          z-index: 999;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          width: 100%;
          height: 5em;
          font-size: clamp(0.9rem, 1.5vw, 1rem);
          background: rgba(1, 1, 1, 0.5);
          backdrop-filter: blur(10px);
        }
        a {
          color: #fff;
          text-decoration: none;
        }
        .slide {
          height: 100%;
          width: 100%;
          top: 0;
          position: fixed;
          visibility: hidden;
        }
        .slide__outer,
        .slide__inner {
          width: 100%;
          height: 100%;
          overflow-y: hidden;
        }
        .slide__content {
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          transition: background 0.8s ease;
          overflow: hidden;
        }
        .slide__container {
          position: relative;
          max-width: 1400px;
          width: 100vw;
          margin: 0 auto;
          height: 90vh;
          display: flex;
          flex-direction: column;
          padding: 2rem 1rem;
          z-index: 10;
        }
        .slide__heading {
          --width: 200;
          text-align: center;
          font-family: 'Protest Guerrilla', sans-serif;
          font-size: clamp(2.5rem, 8vw, 6rem);
          font-weight: 900;
          font-variation-settings: "wdth" var(--width);
          margin: 0 0 2rem 0;
          padding: 0;
          z-index: 999;
          background: linear-gradient(to right, #fea6cc, #ffd4b9, #fea7a0);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 4px 10px rgba(181, 61, 161, 0.3));
        }
        .slide__members {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
          align-items: center;
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          z-index: 10;
        }
        .slide__members::-webkit-scrollbar {
          width: 8px;
        }
        .slide__members::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .slide__members::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .slide__members::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Card Animation */
        @keyframes slideInCard {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeOutCard {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
        }
        
        .team-card-wrapper {
          animation: slideInCard 0.6s ease-out forwards;
          opacity: 0;
          position: relative;
          z-index: 10;
        }
        
        .slide:not(.slide:nth-of-type(1)) .team-card-wrapper {
          opacity: 0;
        }
        
        .slide:nth-of-type(1) {
          visibility: visible;
        }
        
        .slide:nth-of-type(1) .team-card-wrapper {
          animation: slideInCard 0.6s ease-out forwards;
        }
        
        .overlay {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          pointer-events: none;
        }
        .overlay__content {
          max-width: 1400px;
          width: 100vw;
          margin: 0 auto;
          padding: 0 1rem;
          height: 90vh;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(10, 1fr);
        }
        .overlay__count {
          grid-area: 1 / 10 / 2 / 10;
          font-size: clamp(2rem, 3vw, 4rem);
          margin: 0;
          padding: 1rem 0;
          text-align: right;
          border-bottom: 4px solid rgba(255, 255, 255, 0.8);
          color: #f2f1fc;
          text-shadow: 0 0 10px rgba(237, 106, 184, 0.5);
          font-weight: 700;
        }
        @media screen and (min-width: 900px) {
          .slide__container {
            padding: 3rem;
          }
          .slide__heading {
            margin-bottom: 3rem;
          }
          .overlay__content {
            padding: 0 3rem;
          }
          .overlay__count {
            grid-area: 1 / 10 / 2 / 11;
          }
        }
        
        @media screen and (max-width: 768px) {
          .slide__members {
            gap: 1.5rem;
            padding: 0.5rem;
          }
          .slide__heading {
            font-size: clamp(2rem, 6vw, 3rem);
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
