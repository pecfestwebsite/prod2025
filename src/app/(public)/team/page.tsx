"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover"
import { getGDriveImageUrl } from "@/lib/utils"

interface TeamMember {
  id: string
  name: string
  image: string
  role: string
}

interface Committee {
  committeeName: string
  members: TeamMember[]
}


const TwinklingStars = () => {
  const [stars, setStars] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
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

  if (!isClient) return null

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-[#ffd4b9] rounded-full"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
          animate={{ opacity: [star.opacity, star.opacity + 0.6, star.opacity] }}
          transition={{ duration: star.duration, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
        />
      ))}
    </>
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
      className="absolute"
      style={{ width: size, height: size * 1.5, left: x, top: y, zIndex: 5 }}
      animate={{ y: [0, -20, 0], x: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
      transition={{
        duration: duration,
        repeat: Number.POSITIVE_INFINITY,
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

const TeamCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      viewport={{ once: true, margin: "-50px" }}
      className="h-60 sm:h-64 md:h-72 group relative perspective mx-auto w-full max-w-[320px] sm:max-w-none"
      whileHover={!isMobile ? {
        y: -12,
        transition: { duration: 0.3 },
      } : {}}
    >
      {/* Outer Glow - Hidden on mobile, no clip */}
      <motion.div
        className="hidden lg:block absolute -inset-4 bg-gradient-to-br from-[#ed6ab8] via-[#b53da1] to-[#4321a9] blur-3xl opacity-0 group-hover:opacity-[0.175] transition-opacity duration-500 -z-20"
        animate={{
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
        }}
      />

      {/* Inner Shadow - Hidden on mobile, no clip */}
      <motion.div
        className="hidden lg:block absolute -inset-2 bg-gradient-to-br from-[#ed6ab8]/30 to-[#b53da1]/30 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
        }}
      />
      
      <DirectionAwareHover
        imageUrl={member.image ? getGDriveImageUrl(member.image) : "https://via.placeholder.com/400x600/4321a9/ffffff?text=No+Image"}
        name={member.name}
        role={member.role}
        socialLinks={{}}
      />
    </motion.div>
  )
}

export default function TeamPage() {
  const [committeeData, setCommitteeData] = useState<Committee[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        const response = await fetch("/data/committee.json")
        const data = await response.json()
        setCommitteeData(data)
      } catch (error) {
        console.error("Error loading committee data:", error)
        setError(true)
      }
    }

    fetchCommittees()
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
      `}</style>
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-30"
        style={{ backgroundImage: 'url(/bg3.jpg)' }}
      />
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <TwinklingStars />
      </div>

      {/* Floating Lanterns */}
      <FloatingLantern duration={4} size={30} x="10%" y="20%" delay={0} />
      <FloatingLantern duration={5} size={25} x="80%" y="30%" delay={1} />
      <FloatingLantern duration={6} size={35} x="15%" y="60%" delay={2} />
      <FloatingLantern duration={4.5} size={28} x="85%" y="70%" delay={1.5} />

      <div className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-24"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] tracking-wider px-4">
            Meet Our Team
          </h1>
          <div className="h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-transparent via-[#ed6ab8] to-transparent mb-6"></div>
          <p className="text-base sm:text-lg md:text-xl text-[#fea6cc] font-arabian max-w-3xl mx-auto px-4">
            The passionate leaders driving Pecfest 2025
          </p>
        </motion.div>

        {/* Committees */}
        {committeeData.map((committee, committeeIndex) => (
          <motion.div
            key={committee.committeeName}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: committeeIndex * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20 sm:mb-32"
          >
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 md:mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] font-display px-4"
            >
              {committee.committeeName}
            </motion.h2>
            
            {/* Responsive Grid - Centered with extra spacing for glow */}
            <div className="flex flex-wrap justify-center gap-10 sm:gap-12 md:gap-16 lg:gap-20 xl:gap-24 max-w-7xl mx-auto px-8 sm:px-10 md:px-12 lg:px-16">
              {committee.members.map((member, index) => (
                <div key={member.id} className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-3rem)] xl:w-[calc(25%-4rem)]">
                  <TeamCard member={member} index={index} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {(!committeeData || error || committeeData.length === 0) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center"
          >
            <p className="text-lg sm:text-xl text-slate-300 px-4">
              No committee data found. Please add committee information.
            </p>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-5 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-[#ed6ab8]/10 rounded-full blur-3xl opacity-30 z-0"></div>
      <div className="absolute bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-[#b53da1]/10 rounded-full blur-3xl opacity-30 z-0"></div>
    </div>
  )
}
