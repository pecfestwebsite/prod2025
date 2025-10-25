"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover"

interface Developer {
  id: string
  name: string
  role: string
  image: string
  bio: string
  instagram?: string
  linkedin?: string
  email?: string
  phone?: string
}

interface DevelopersData {
  heads: Developer[]
  developers: Developer[]
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
          transition={{ duration: star.duration, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" }}
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

const DeveloperCard = ({ developer, index }: { developer: Developer; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-64 sm:h-72 md:h-80 group"
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#ed6ab8]/20 to-[#b53da1]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
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
        imageUrl={developer.image}
        name={developer.name}
        role={developer.role}
        socialLinks={{
          instagram: developer.instagram,
          linkedin: developer.linkedin,
          email: developer.email,
          phone: developer.phone,
        }}
      />
    </motion.div>
  )
}

export default function DevelopersPage() {
  const [developersData, setDevelopersData] = useState<DevelopersData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch("/data/developers.json")
        const data = await response.json()
        setDevelopersData(data)
      } catch (error) {
        console.error("Error loading developers data:", error)
        setError(true)
      }
    }

    fetchDevelopers()
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a0f2e] to-[#0f0a1a] overflow-hidden">
      <style>{`
        .font-display { font-family: 'Protest Guerrilla', sans-serif; }
        .font-arabian { font-family: 'Scheherazade New', serif; }
      `}</style>
      <AnimatedBackground />

      {/* Floating Lanterns */}
      <FloatingLantern duration={4} size={30} x="10%" y="20%" delay={0} />
      <FloatingLantern duration={5} size={25} x="80%" y="30%" delay={1} />
      <FloatingLantern duration={6} size={35} x="15%" y="60%" delay={2} />
      <FloatingLantern duration={4.5} size={28} x="85%" y="70%" delay={1.5} />

      <div className="relative z-10 pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] drop-shadow-[0_8px_20px_rgba(237,106,184,0.4)] tracking-wider">
            Meet Our Developers
          </h1>
          <p className="text-base sm:text-lg text-[#fea6cc] font-arabian max-w-2xl mx-auto">
            The talented minds behind the Pecfest 2025 experience
          </p>
        </motion.div>

        {/* Heads Section */}
        {developersData?.heads && developersData.heads.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] font-display">
              Leadership Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-4xl mx-auto">
              {developersData.heads.map((head, index) => (
                <DeveloperCard key={head.id} developer={head} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Developers Section */}
        {developersData?.developers && developersData.developers.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ffd4b9] via-[#fea6cc] to-[#ed6ab8] font-display">
              Development Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
              {developersData.developers.map((dev, index) => (
                <DeveloperCard key={dev.id} developer={dev} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {(!developersData ||
          error ||
          (developersData.heads.length === 0 && developersData.developers.length === 0)) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-xl text-slate-300">No developers found. Please add developers to the data file.</p>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#ed6ab8]/10 rounded-full blur-3xl opacity-30 z-0"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#b53da1]/10 rounded-full blur-3xl opacity-30 z-0"></div>
    </div>
  )
}
