"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface Member {
  id: string
  name: string
  photoUrl: string
  role: string
}

interface Committee {
  committeeName: string
  members: Member[]
}

const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([])

  useEffect(() => {
    const generatedStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 0.5}px`,
      duration: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    setStars(generatedStars)
  }, [])

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[#ffd4b9] rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [star.opacity, star.opacity + 0.6, star.opacity] }}
          transition={{ duration: star.duration, repeat: Infinity, repeatType: "mirror" }}
        />
      ))}
    </>
  )
}

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <TwinklingStars />
    </div>
  )
}

const FloatingLantern = ({
  duration,
  size,
  x,
  y,
  delay,
}: { duration: number; size: number; x: string; y: string; delay: number }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 5 }}
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
        className="w-full h-4/6 bg-gradient-to-t from-[#b53da1]/60 to-[#ed6ab8]/60 rounded-t-full rounded-b-xl border-t-2 border-[#4321a9]"
        style={{ opacity: 0.7, boxShadow: `0 0 ${size * 1.5}px ${size / 1.5}px rgba(237, 106, 184, 0.4)` }}
      >
        <div className="w-full h-1/4 bg-[#4321a9]/40 rounded-b-xl"></div>
      </div>
      <div className="w-1/2 h-1/6 bg-[#2a0a56]/70 mx-auto rounded-b-full"></div>
    </motion.div>
  )
}

const MemberLantern = ({ member, index }: { member: Member; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageSrc, setImageSrc] = useState(member.photoUrl)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.05 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative w-56 h-96 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style jsx>{`
        @keyframes flicker {
          50% { opacity: 0.95; }
        }
        @keyframes sway {
          0% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
          100% { transform: rotate(3deg); }
        }
        @keyframes bob {
          0% { top: 0px; }
          50% { top: 15px; }
          100% { top: 0px; }
        }
      `}</style>

      <div 
        className="relative w-56 h-80"
        style={{
          animation: isHovered ? 'bob 3s infinite, sway 4s infinite' : 'none',
        }}
      >
        {/* Glow Effect */}
        {isHovered && (
          <div
            className="absolute w-36 h-48 top-16 left-10 opacity-60"
            style={{
              boxShadow: '0 0 300px #efc259',
              animation: 'flicker 0.2s infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top Cap */}
        <svg className="absolute w-36 h-11 left-10 top-0" viewBox="0 -5 140 45">
          <defs>
            <linearGradient id={`topGradient-${member.id}`} x1="0" x2="1" y1="0.4" y2="0.4">
              <stop offset="0" stopColor="#171717"></stop>
              <stop offset="0.7" stopColor="#4e4e4e"></stop>
              <stop offset="1" stopColor="#171717"></stop>
            </linearGradient>
          </defs>
          <path
            fill={`url(#topGradient-${member.id})`}
            d="M 10 0 C 10 0 38 -5 68 -5 C 98 -5 131 0 131 0 C 136 0 141 4 141 10 L 141 39 L 0 39 L 0 10 C 0 4 4 0 10 0 Z"
          />
        </svg>

        {/* Bottom Cap */}
        <svg className="absolute w-36 h-11 left-10 bottom-0" viewBox="0 0 140 45">
          <defs>
            <linearGradient id={`bottomGradient-${member.id}`} x1="0" x2="1" y1="0.4" y2="0.4">
              <stop offset="0" stopColor="#171717"></stop>
              <stop offset="0.7" stopColor="#4e4e4e"></stop>
              <stop offset="1" stopColor="#171717"></stop>
            </linearGradient>
          </defs>
          <path
            fill={`url(#bottomGradient-${member.id})`}
            d="M 0 0 L 141 0 L 141 29 C 141 34 136 39 131 39 C 131 39 98 43 68 43 C 38 43 10 39 10 39 C 4 39 0 35 0 29 L 0 0 Z"
          />
        </svg>

        {/* Main Lantern Body */}
        <svg className="absolute w-56 h-60 top-11" viewBox="0 0 220 240">
          <defs>
            <radialGradient id={`lanternGradient-${member.id}`}>
              <stop offset="0" stopColor="#ffd4b9"></stop>
              <stop offset="0.6" stopColor="#fea6cc"></stop>
              <stop offset="1" stopColor="#ed6ab8"></stop>
            </radialGradient>
            <clipPath id={`lanternClip-${member.id}`}>
              <rect rx="50" ry="50" x="0" y="0" width="219" height="240" />
            </clipPath>
          </defs>
          <rect
            fill={`url(#lanternGradient-${member.id})`}
            rx="50"
            ry="50"
            x="0"
            y="0"
            width="219"
            height="240"
          />
        </svg>

        {/* Member Photo with Circular Clip */}
        <div 
          className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full overflow-hidden border-4 border-[#171717]/80 shadow-2xl z-20"
          style={{
            boxShadow: isHovered ? '0 0 30px rgba(254, 166, 204, 0.8)' : '0 0 15px rgba(237, 106, 184, 0.6)',
          }}
        >
          <img
            src={imageSrc}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Try fallback images from public folder
              const fallbackImages = [
                '/WhatsApp Image 2025-10-12 at 01.16.49_ea688ec3.jpg',
                '/images/team/default.jpg',
                '/images/default-avatar.jpg',
                '/default.jpg',
              ]
              
              const currentIndex = fallbackImages.indexOf(imageSrc)
              if (currentIndex < fallbackImages.length - 1) {
                setImageSrc(fallbackImages[currentIndex + 1])
              } else {
                // If all fallbacks fail, use placeholder SVG
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ffd4b9;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23ed6ab8;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="100" height="100"/%3E%3Ccircle cx="50" cy="35" r="15" fill="%23fff" opacity="0.9"/%3E%3Cpath d="M 20 70 Q 50 55 80 70" fill="%23fff" opacity="0.9"/%3E%3C/svg%3E'
              }
            }}
          />
        </div>

        {/* Ridges Overlay */}
        <svg className="absolute w-56 h-60 top-11 opacity-40 pointer-events-none" viewBox="0 0 220 240">
          <defs>
            <linearGradient id={`ridges-${member.id}`} x1="0.5" x2="0.5" y1="0" y2="1">
              <stop offset="0" stopColor="#d4857a" stopOpacity="0.03"></stop>
              <stop offset="0.05" stopColor="#d68070" stopOpacity="1"></stop>
              <stop offset="0.11" stopColor="#d87b66" stopOpacity="0.03"></stop>
              <stop offset="0.17" stopColor="#da765c" stopOpacity="1"></stop>
              <stop offset="0.23" stopColor="#dc7152" stopOpacity="0.03"></stop>
              <stop offset="0.29" stopColor="#de6c48" stopOpacity="1"></stop>
              <stop offset="0.35" stopColor="#e0673e" stopOpacity="0.03"></stop>
              <stop offset="0.41" stopColor="#e26234" stopOpacity="1"></stop>
              <stop offset="0.47" stopColor="#e45d2a" stopOpacity="0.03"></stop>
              <stop offset="0.53" stopColor="#e65820" stopOpacity="1"></stop>
              <stop offset="0.59" stopColor="#e85316" stopOpacity="0.03"></stop>
              <stop offset="0.65" stopColor="#ea4e0c" stopOpacity="1"></stop>
              <stop offset="0.71" stopColor="#ec4902" stopOpacity="0.03"></stop>
              <stop offset="0.77" stopColor="#ed6ab8" stopOpacity="1"></stop>
              <stop offset="0.83" stopColor="#f07acc" stopOpacity="0.03"></stop>
              <stop offset="0.89" stopColor="#f38ae0" stopOpacity="1"></stop>
              <stop offset="0.95" stopColor="#f69af4" stopOpacity="0.03"></stop>
              <stop offset="1" stopColor="#faa8ff" stopOpacity="1"></stop>
            </linearGradient>
          </defs>
          <path
            fill={`url(#ridges-${member.id})`}
            d="M 50 0 L 169 0 C 197 0 219 22 219 50 L 219 190 C 219 218 197 240 169 240 L 50 240 C 22 240 0 218 0 190 L 0 50 C 0 36 6 23 16 14 C 24 5 37 0 50 0 Z"
          />
        </svg>

        {/* Seams */}
        <svg className="absolute w-8 h-60 top-11 left-6 opacity-35 pointer-events-none" viewBox="780 460 30 240">
          <path
            fill="rgba(237,106,184,0.8)"
            d="M 804 458 C 802 458 789 472 783 500 C 780 522 777 555 777 581 C 777 604 780 642 783 661 C 789 692 802 698 804 698 C 806 698 798 686 795 661 C 792 640 790 610 790 580 C 790 555 792 528 795 506 C 798 477 806 458 804 458 Z"
          />
        </svg>
        <svg className="absolute w-3 h-60 top-11 left-1/2 -translate-x-1/2 opacity-35 pointer-events-none" viewBox="850 460 10 240">
          <path
            fill="rgba(254,166,204,0.8)"
            d="M 857 459 C 854 459 850 521 850 580 C 850 640 854 698 857 698 C 859 698 860 640 860 580 C 860 521 859 459 857 459 Z"
          />
        </svg>
        <svg className="absolute w-8 h-60 top-11 right-6 opacity-35 pointer-events-none" viewBox="780 460 30 240">
          <path
            fill="rgba(237,106,184,0.8)"
            d="M 781 458 C 783 458 799 472 805 500 C 809 522 811 555 811 580 C 811 604 809 642 805 661 C 799 692 784 698 782 698 C 780 698 789 686 792 661 C 795 640 798 608 798 580 C 798 555 795 528 792 506 C 789 477 780 458 782 458 Z"
          />
        </svg>
      </div>

      {/* Member Info */}
      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] font-display">
          {member.name}
        </h3>
        <p className="text-sm text-[#fea6cc] font-arabian mt-1">{member.role}</p>
      </motion.div>
    </motion.div>
  )
}

export default function CommitteePage() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    // Using the provided JSON data directly
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
    ]
    
    setCommittees(committeesData)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a] overflow-hidden">
      <style>{`
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
      `}</style>
      <AnimatedBackground />

      {/* Floating Decorative Lanterns */}
      <FloatingLantern duration={4} size={30} x="5%" y="15%" delay={0} />
      <FloatingLantern duration={5} size={25} x="90%" y="25%" delay={1} />
      <FloatingLantern duration={6} size={35} x="8%" y="55%" delay={2} />
      <FloatingLantern duration={4.5} size={28} x="92%" y="65%" delay={1.5} />

      <div className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 sm:mb-28"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] tracking-wider">
            Our Committees
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-[#ed6ab8] to-transparent mb-6"></div>
          <p className="text-lg sm:text-xl text-[#fea6cc] font-arabian max-w-3xl mx-auto">
            The dedicated teams making Pecfest 2025 a grand success
          </p>
        </motion.div>

        {/* Committees */}
        {committees.map((committee, committeeIndex) => (
          <motion.div
            key={committee.committeeName}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-24 sm:mb-32"
          >
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] font-display"
            >
              {committee.committeeName}
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20">
              {committee.members.map((member, memberIndex) => (
                <MemberLantern
                  key={member.id}
                  member={member}
                  index={committeeIndex * 10 + memberIndex}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {committees.length === 0 && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-xl text-[#fea6cc]">Loading committees...</p>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#ed6ab8]/10 rounded-full blur-3xl opacity-30 z-0"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#b53da1]/10 rounded-full blur-3xl opacity-30 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4321a9]/5 rounded-full blur-3xl opacity-20 z-0"></div>
    </div>
  )
}