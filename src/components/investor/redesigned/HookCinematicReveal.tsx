'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { HookSection } from '@/types/investor-materials'

interface HookCinematicRevealProps {
  hook: HookSection
  onContinue?: () => void
  posterImageUrl?: string
  teaserVideoUrl?: string
}

export default function HookCinematicReveal({
  hook,
  onContinue,
  posterImageUrl,
  teaserVideoUrl
}: HookCinematicRevealProps) {
  const [stage, setStage] = useState<'poster' | 'tearing' | 'revealed'>('poster')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Keyboard handler for continue
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleContinue()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleContinue = () => {
    if (stage === 'poster') {
      setStage('tearing')
      setTimeout(() => setStage('revealed'), 2000)
    } else if (stage === 'revealed') {
      onContinue?.()
    }
  }

  const handlePosterClick = () => {
    if (stage === 'poster') {
      handleContinue()
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] cursor-pointer"
      onClick={handlePosterClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background (if available) */}
      <AnimatePresence>
        {teaserVideoUrl && stage === 'poster' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <video
              src={teaserVideoUrl}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              style={{ filter: 'blur(2px) brightness(0.4)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parallax Background Image */}
      <AnimatePresence>
        {posterImageUrl && stage === 'poster' && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${posterImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(1px) brightness(0.3)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Spotlight Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.1) 0%, transparent 70%)`,
          opacity: isHovered && stage === 'poster' ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Film Grain Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'grain 0.5s steps(10) infinite'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#10B981] rounded-full opacity-60"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
              scale: 0
            }}
            animate={{
              y: -10,
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeOut'
            }}
            style={{
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full p-8">

        {/* Poster Stage */}
        <AnimatePresence mode="wait">
          {stage === 'poster' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Title with Cinematic Typography */}
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-6xl md:text-8xl font-black text-white mb-6 tracking-wider"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3), 0 0 90px rgba(16, 185, 129, 0.1)',
                  letterSpacing: '0.1em'
                }}
              >
                {hook.seriesTitle}
              </motion.h1>

              {/* Genre Badge */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="inline-block mb-4"
              >
                <span className="px-6 py-3 bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] text-lg font-semibold rounded-full backdrop-blur-sm">
                  {hook.genre}
                </span>
              </motion.div>

              {/* Theme Badge */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="inline-block mb-8"
              >
                <span className="px-6 py-3 bg-white/10 border border-white/30 text-white text-lg font-semibold rounded-full backdrop-blur-sm">
                  {hook.theme}
                </span>
              </motion.div>

              {/* Hover Reveal Synopsis */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-8 p-6 bg-black/60 backdrop-blur-sm rounded-lg border border-[#10B981]/30 max-w-2xl mx-auto"
                  >
                    <p className="text-white/90 text-lg leading-relaxed">
                      {hook.synopsis || 'A compelling story waiting to be told...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click Prompt */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-12 text-white/60 text-sm"
              >
                <motion.span
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Click to continue • Press SPACE or ENTER
                </motion.span>
              </motion.div>
            </motion.div>
          )}

          {/* Tearing Stage */}
          {stage === 'tearing' && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              {/* Tearing Animation - Poster rips apart */}
              <motion.div
                initial={{ clipPath: 'inset(0 0 0 0)' }}
                animate={{ clipPath: 'inset(0 50% 0 0)' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute left-0 top-0 w-1/2 h-full bg-[#0A0A0A]"
                style={{
                  backgroundImage: posterImageUrl ? `url(${posterImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <motion.div
                initial={{ clipPath: 'inset(0 0 0 0)' }}
                animate={{ clipPath: 'inset(0 0 0 50%)' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="absolute right-0 top-0 w-1/2 h-full bg-[#0A0A0A]"
                style={{
                  backgroundImage: posterImageUrl ? `url(${posterImageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Rip effect overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 5px,
                    rgba(239, 68, 68, 0.3) 5px,
                    rgba(239, 68, 68, 0.3) 10px
                  )`,
                  animation: 'shimmer 0.5s infinite alternate'
                }}
              />
            </motion.div>
          )}

          {/* Revealed Stage */}
          {stage === 'revealed' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center max-w-6xl mx-auto px-8"
            >
              {/* Full Details Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side - Enhanced Title */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                    {hook.seriesTitle}
                  </h1>

                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-[#10B981] text-black font-bold rounded-lg">
                      {hook.genre}
                    </span>
                    <span className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg">
                      {hook.theme}
                    </span>
                  </div>
                </motion.div>

                {/* Right Side - Full Synopsis */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-[#10B981] mb-4">Synopsis</h2>
                    <p className="text-white/90 text-lg leading-relaxed">
                      {hook.synopsis || 'A compelling story waiting to be told...'}
                    </p>
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    onClick={handleContinue}
                    className="w-full px-8 py-4 bg-[#10B981] text-black font-bold text-lg rounded-lg hover:bg-[#059669] transition-colors"
                  >
                    Continue to Pitch Materials
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0) }
          10% { transform: translate(-5%, -10%) }
          20% { transform: translate(-15%, 5%) }
          30% { transform: translate(7%, -25%) }
          40% { transform: translate(-5%, 25%) }
          50% { transform: translate(-15%, 10%) }
          60% { transform: translate(15%, 0%) }
          70% { transform: translate(0%, 15%) }
          80% { transform: translate(3%, 35%) }
          90% { transform: translate(-10%, 10%) }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
      `}</style>
    </div>
  )
}
