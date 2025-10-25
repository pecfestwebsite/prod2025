"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { motion, useSpring } from "framer-motion"
import { Instagram, Linkedin, Mail, Phone } from "lucide-react"

interface SocialLinks {
  instagram?: string
  linkedin?: string
  email?: string
  phone?: string
}

interface DirectionAwareHoverProps {
  imageUrl: string
  name: string
  role: string
  socialLinks: SocialLinks
  className?: string
}

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)
const round = (value: number, precision = 3) => Number.parseFloat(value.toFixed(precision))
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

export function DirectionAwareHover({ imageUrl, name, role, socialLinks, className = "" }: DirectionAwareHoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [pointerPos, setPointerPos] = useState({ x: "50%", y: "50%", fromCenter: 0, fromTop: 0.5, fromLeft: 0.5 })

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current
      const wrap = wrapRef.current

      if (!card || !wrap) return

      const rect = card.getBoundingClientRect()
      const offsetX = event.clientX - rect.left
      const offsetY = event.clientY - rect.top

      const percentX = clamp((100 / rect.width) * offsetX)
      const percentY = clamp((100 / rect.height) * offsetY)

      const centerX = percentX - 50
      const centerY = percentY - 50

      // Update pointer position for gradient effects
      setPointerPos({
        x: `${percentX}%`,
        y: `${percentY}%`,
        fromCenter: clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1),
        fromTop: percentY / 100,
        fromLeft: percentX / 100,
      })

      // Update 3D rotation
      rotateX.set((centerY / rect.height) * -25)
      rotateY.set((centerX / rect.width) * 25)
    },
    [rotateX, rotateY],
  )

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
    scale.set(1.05)
  }, [scale])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    setPointerPos({ x: "50%", y: "50%", fromCenter: 0, fromTop: 0.5, fromLeft: 0.5 })
  }, [rotateX, rotateY, scale])

  const cardStyle = useMemo(
    () =>
      ({
        "--pointer-x": pointerPos.x,
        "--pointer-y": pointerPos.y,
        "--pointer-from-center": pointerPos.fromCenter,
        "--pointer-from-top": pointerPos.fromTop,
        "--pointer-from-left": pointerPos.fromLeft,
      }) as React.CSSProperties,
    [pointerPos],
  )

  return (
    <div ref={wrapRef} className={`relative w-full h-80 perspective ${className}`} style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          ...cardStyle,
          rotateX,
          rotateY,
          scale,
        }}
        className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group"
      >
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: isHovered
              ? `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), 
                  rgba(237, 106, 184, 0.3) 0%, 
                  rgba(181, 61, 161, 0.15) 30%, 
                  rgba(15, 10, 26, 0.8) 100%)`
              : "radial-gradient(farthest-side circle at 50% 50%, rgba(237, 106, 184, 0.1) 0%, rgba(15, 10, 26, 0.9) 100%)",
          }}
        />

        <motion.img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(circle at var(--pointer-x) var(--pointer-y), 
                  rgba(255, 255, 255, 0.15) 0%, 
                  rgba(255, 255, 255, 0) 50%)`
              : "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 50%)",
            mixBlendMode: "screen",
          }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y), 
              rgba(200, 150, 255, 0.2) 0%, 
              rgba(100, 50, 150, 0.1) 50%, 
              rgba(0, 0, 0, 0) 100%)`,
            mixBlendMode: "overlay",
          }}
          animate={{ opacity: isHovered ? 0.8 : 0.3 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 30px rgba(237, 106, 184, 0.4), 
                 0 0 30px rgba(237, 106, 184, 0.3),
                 inset 0 0 60px rgba(255, 212, 185, 0.2)`
              : `inset 0 0 20px rgba(237, 106, 184, 0.2), 
                 0 0 20px rgba(237, 106, 184, 0.1)`,
          }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformPerspective: "1000px",
          }}
        >
          {/* Top accent bar */}
          <motion.div
            className="h-1 w-16 bg-gradient-to-r from-[#ffd4b9] to-[#ed6ab8] rounded-full"
            animate={{
              width: isHovered ? 32 : 64,
              opacity: isHovered ? 1 : 0.6,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Bottom user info section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.4, delay: isHovered ? 0.1 : 0 }}
            className="space-y-4"
            style={{
              rotateX: isHovered ? rotateX : 0,
              rotateY: isHovered ? rotateY : 0,
              transformPerspective: "1000px",
              z: 50,
            }}
          >
            {/* User details */}
            <motion.div
              style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
              <p className="text-sm text-[#ffd4b9]">{role}</p>
            </motion.div>

            {/* Social links */}
            <motion.div 
              className="flex gap-3 pointer-events-auto"
              style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
              }}
            >
              {socialLinks.instagram && (
                <motion.a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ed6ab8]/70 hover:bg-[#ed6ab8] text-white transition-colors backdrop-blur-sm"
                  style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                  }}
                >
                  <Instagram size={18} />
                </motion.a>
              )}

              {socialLinks.linkedin && (
                <motion.a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ed6ab8]/70 hover:bg-[#ed6ab8] text-white transition-colors backdrop-blur-sm"
                  style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                  }}
                >
                  <Linkedin size={18} />
                </motion.a>
              )}

              {socialLinks.email && (
                <motion.a
                  href={`mailto:${socialLinks.email}`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ed6ab8]/70 hover:bg-[#ed6ab8] text-white transition-colors backdrop-blur-sm pointer-events-auto"
                  style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                  }}
                >
                  <Mail size={18} />
                </motion.a>
              )}

              {socialLinks.phone && (
                <motion.a
                  href={`tel:${socialLinks.phone}`}
                  whileHover={{ scale: 1.15, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#ed6ab8]/70 hover:bg-[#ed6ab8] text-white transition-colors backdrop-blur-sm pointer-events-auto"
                  style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                  }}
                >
                  <Phone size={18} />
                </motion.a>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
