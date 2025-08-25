'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SeriesCompletePage() {
  const router = useRouter()
  const [storyBible, setStoryBible] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load story bible from localStorage (check both keys)
  useEffect(() => {
    try {
      // Check for both new and old localStorage keys
      let savedBible = localStorage.getItem('scorched-story-bible')
      if (!savedBible) {
        savedBible = localStorage.getItem('reeled-story-bible')
      }
      
      if (savedBible) {
        const parsed = JSON.parse(savedBible)
        setStoryBible(parsed.storyBible || parsed)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl">🔥</span>
          </motion.div>
          <motion.div 
            className="w-12 h-12 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/90 text-lg elegant-fire">Finalizing your empire...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen p-8 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="rebellious-card p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 via-[#FF6B00]/10 to-[#e2c376]/10 opacity-50"></div>
          
          <div className="relative z-10">
            {/* Revolutionary completion header */}
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="inline-block mb-8"
              >
                <div className="w-28 h-28 mx-auto ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
                  <span className="text-7xl">🏆</span>
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ letterSpacing: "-0.1em", opacity: 0 }}
                animate={{ letterSpacing: "0.02em", opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 elegant-fire fire-gradient animate-flameFlicker"
              >
                EMPIRE COMPLETE!
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed elegant-fire"
              >
                You've conquered all <span className="text-[#e2c376] font-bold">60 episodes</span> of <span className="text-[#D62828] font-bold">{storyBible?.seriesTitle || "your revolutionary series"}</span>!
                <br />
                <span className="text-[#FF6B00] font-bold">Hollywood has been scorched.</span>
              </motion.p>
            </div>

            {/* Revolutionary Series Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-black text-[#e2c376] mb-6 text-center elegant-fire">🏛️ EMPIRE OVERVIEW</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/40 rounded-xl text-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <p className="text-sm text-[#e2c376] font-bold mb-2 elegant-fire">TOTAL EPISODES</p>
                  <p className="text-4xl font-black text-white elegant-fire">60</p>
                </motion.div>
                <motion.div 
                  className="p-6 bg-gradient-to-br from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/40 rounded-xl text-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                >
                  <p className="text-sm text-[#e2c376] font-bold mb-2 elegant-fire">NARRATIVE ARCS</p>
                  <p className="text-4xl font-black text-white elegant-fire">6</p>
                </motion.div>
                <motion.div 
                  className="p-6 bg-gradient-to-br from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/40 rounded-xl text-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  <p className="text-sm text-[#e2c376] font-bold mb-2 elegant-fire">CHOICES FORGED</p>
                  <p className="text-4xl font-black text-white elegant-fire">59</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Revolutionary Quote */}
            <motion.blockquote 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7, duration: 0.8 }}
              className="border-l-4 border-[#e2c376] pl-6 mb-10 text-center"
            >
              <p className="text-xl md:text-2xl italic text-white/90 elegant-fire leading-relaxed">
                "Every <span className="text-[#D62828] font-bold">choice</span> you forged has led to this moment. 
                The <span className="text-[#e2c376] font-bold">empire</span> you built is uniquely yours. 
                <span className="text-[#FF6B00] font-bold">Hollywood</span> will never be the same."
              </p>
            </motion.blockquote>

            {/* Revolutionary Call to Action Buttons */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
          <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/story-bible" className="block">
                  <button className="burn-button w-full px-8 py-4 text-lg font-black">
                    <span className="relative z-10 elegant-fire">📜 REVIEW EMPIRE RECORDS</span>
                  </button>
                </Link>
          </motion.div>

          <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/" className="block">
                  <button className="w-full px-8 py-4 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#e2c376]/40 text-white font-black rounded-xl hover:border-[#e2c376]/80 transition-all text-lg">
                    <span className="elegant-fire">🔥 FORGE NEW EMPIRE</span>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
        </motion.div>
    </div>
    </motion.div>
  )
} 