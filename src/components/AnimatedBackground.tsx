'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AnimatedBackgroundProps {
  showParticles?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export default function AnimatedBackground({ 
  showParticles = true, 
  intensity = 'medium' 
}: AnimatedBackgroundProps) {
  const [particleCount, setParticleCount] = useState(6)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // Adjust particle count based on intensity
    switch (intensity) {
      case 'low':
        setParticleCount(3)
        break
      case 'medium':
        setParticleCount(6)
        break
      case 'high':
        setParticleCount(12)
        break
    }
  }, [intensity])

  // Don't render animated content until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#00FF99]/10 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 20, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#00CC7A]/10 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -20, 0],
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-[#00FF99]/5 blur-2xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [-30, 30, -30],
          y: [-20, 20, -20]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 4
        }}
      />

      {/* Floating particles */}
      {showParticles && (
        <div className="absolute inset-0">
          {[...Array(particleCount)].map((_, i) => {
            // Use deterministic positioning based on index to prevent hydration mismatches
            const baseX = (i * 200) % 1200
            const baseY = 800 + (i * 100)
            const baseDuration = 4 + (i % 3) // 4-6 seconds
            const baseDelay = i * 0.8
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#00FF99] rounded-full opacity-40"
                initial={{ 
                  x: baseX, 
                  y: baseY,
                  scale: 0 
                }}
                animate={{ 
                  y: -50,
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  delay: baseDelay,
                  ease: "easeOut"
                }}
              />
            )
          })}
        </div>
      )}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 153, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 153, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
