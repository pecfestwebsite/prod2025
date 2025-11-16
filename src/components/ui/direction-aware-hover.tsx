"use client"

import type React from "react"
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
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
  const [isMobile, setIsMobile] = useState(false)
  const [pointerPos, setPointerPos] = useState({ x: "50%", y: "50%", fromCenter: 0, fromTop: 0.5, fromLeft: 0.5 })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const CLIP_ID = "mughal-gate-clip"

  return (
    <div ref={wrapRef} className={`relative w-full h-80 perspective ${className}`} style={{ perspective: "1200px" }}>
      {/* Inline SVG DEFINITIONS for Mughal gate clipPath */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        <defs>
          <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
            {/* Normalized path from 624x750 viewBox to 0-1 range */}
            <path d="
              M 0 0.883416
              V 0.25516
              C 0.00948 0.226392, 0.0504 0.167355, 0.138217 0.161351
              C 0.193011 0.095685, 0.317115 0.0375235, 0.5 0
              C 0.682885 0.0375235, 0.806989 0.095685, 0.861783 0.161351
              C 0.94996 0.167355, 0.99052 0.226392, 1 0.25516
              V 0.883416
              L 0.937083 1
              H 0.062917
              L 0 0.883416
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      {/* Overlaid SVG border using your exact path with embroidery */}
      <svg
        viewBox="0 0 624 750"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full z-20"
      >
        {/* Shadow layer */}
        <path
          d="M0 662.562V191.37C5.91867 169.794 31.4532 125.516 86.2424 121.013C120.433 71.7636 197.839 28.1426 312 0C426.161 28.1426 503.567 71.7636 537.758 121.013C592.547 125.516 618.081 169.794 624 191.37V662.562L584.684 750H39.3164L0 662.562Z"
          fill="none"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
        {/* White border */}
        <path
          d="M2 662.562V191.37C7.8 169.794 32.5 125.516 86.2424 121.013C120.433 71.7636 197.839 28.1426 312 1C426.161 29.1426 503.567 71.7636 537.758 121.013C591.547 125.516 616.5 169.794 622 191.37V662.562L584.684 748H39.3164L2 662.562Z"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Pink accent border */}
        <path
          d="M4 662.562V191.37C9.5 170 33 126 86.2424 121.513C120.433 72 197.839 29 312 2C426.161 30 503.567 72 537.758 121.513C591.047 126 614.5 170 620 191.37V662.562L584.684 746H39.3164L4 662.562Z"
          fill="none"
          stroke="rgba(237,106,184,0.25)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Embroidery decorations - Top arch pattern */}
        <g opacity="0.6">
          {/* Center top ornament */}
          <circle cx="312" cy="15" r="4" fill="rgba(255,212,185,0.8)" />
          <circle cx="312" cy="25" r="3" fill="rgba(254,166,204,0.7)" />
          <circle cx="312" cy="35" r="2.5" fill="rgba(237,106,184,0.6)" />
          
          {/* Left side ornaments */}
          <circle cx="200" cy="45" r="3" fill="rgba(255,212,185,0.7)" />
          <circle cx="180" cy="65" r="2.5" fill="rgba(254,166,204,0.6)" />
          <circle cx="160" cy="85" r="2" fill="rgba(237,106,184,0.5)" />
          
          {/* Right side ornaments */}
          <circle cx="424" cy="45" r="3" fill="rgba(255,212,185,0.7)" />
          <circle cx="444" cy="65" r="2.5" fill="rgba(254,166,204,0.6)" />
          <circle cx="464" cy="85" r="2" fill="rgba(237,106,184,0.5)" />
          
          {/* Decorative lines - left */}
          <line x1="100" y1="140" x2="120" y2="160" stroke="rgba(237,106,184,0.4)" strokeWidth="1.5" />
          <line x1="80" y1="180" x2="100" y2="200" stroke="rgba(237,106,184,0.4)" strokeWidth="1.5" />
          
          {/* Decorative lines - right */}
          <line x1="524" y1="140" x2="504" y2="160" stroke="rgba(237,106,184,0.4)" strokeWidth="1.5" />
          <line x1="544" y1="180" x2="524" y2="200" stroke="rgba(237,106,184,0.4)" strokeWidth="1.5" />
          
          {/* Bottom corner ornaments */}
          <circle cx="60" cy="680" r="3" fill="rgba(255,212,185,0.6)" />
          <circle cx="564" cy="680" r="3" fill="rgba(255,212,185,0.6)" />
        </g>
      </svg>

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
          WebkitClipPath: `url(#${CLIP_ID})`,
          clipPath: `url(#${CLIP_ID})`,
        }}
        className="relative w-full h-full overflow-hidden cursor-pointer group"
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
          animate={{ opacity: isMobile ? 1 : (isHovered ? 1 : 0.6) }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
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
            animate={{ opacity: (isMobile || isHovered) ? 1 : 0, y: (isMobile || isHovered) ? 0 : 20 }}
            transition={{ duration: 0.4, delay: (isMobile || isHovered) ? 0.1 : 0 }}
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
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">{name}</h3>
              <p className="text-xs lg:text-sm text-[#ffd4b9]">{role}</p>
            </motion.div>

            {/* Social links - Hidden on mobile */}
            <motion.div 
              className="hidden lg:flex gap-3 pointer-events-auto"
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
