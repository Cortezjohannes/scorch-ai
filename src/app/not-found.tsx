'use client'

import Link from 'next/link'
import { motion } from '@/components/ui/ClientMotion'

export default function NotFound() {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      {/* Fire Icon */}
      <motion.div
        className="w-24 h-24 ember-shadow rounded-xl flex items-center justify-center mb-8 animate-emberFloat"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <span className="text-6xl">💥</span>
      </motion.div>

      {/* Revolutionary Title */}
      <motion.h1 
        className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-center elegant-fire fire-gradient animate-flameFlicker"
        initial={{ letterSpacing: "-0.1em", opacity: 0 }}
        animate={{ letterSpacing: "0.02em", opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        404 - EMPIRE NOT FOUND
      </motion.h1>

      {/* Revolutionary Subtitle */}
      <motion.p 
        className="text-lg md:text-xl text-white/90 mb-12 text-center max-w-md leading-relaxed elegant-fire"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        This territory has been <span className="text-[#D62828] font-bold">scorched</span> beyond recognition. 
        Return to the empire to continue your revolution.
      </motion.p>

      {/* Revolutionary Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/" className="burn-button px-10 py-4 text-xl font-black">
          <span className="relative z-10 elegant-fire">🏠 RETURN TO EMPIRE</span>
        </Link>
      </motion.div>
    </motion.div>
  )
} 