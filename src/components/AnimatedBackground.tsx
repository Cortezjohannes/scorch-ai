'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface AnimatedBackgroundProps {
  showParticles?: boolean
  intensity?: 'low' | 'medium' | 'high'
  variant?: 'particles' | 'grid' | 'halo' | 'none'
  backgroundType?: 'particles' | 'gradient-mesh' | 'none' // Deprecated, use variant instead
  page?: string // Optional hint for page-specific tuning
}

export default function AnimatedBackground({ 
  showParticles = true, 
  intensity = 'medium',
  variant,
  backgroundType = 'particles', // Deprecated, kept for backward compatibility
  page
}: AnimatedBackgroundProps) {
  // Use variant if provided, otherwise fall back to backgroundType for backward compatibility
  const effectiveVariant = variant || (backgroundType === 'gradient-mesh' ? 'halo' : backgroundType === 'none' ? 'none' : 'particles')
  const [particleCount, setParticleCount] = useState(6)
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
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
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]' : 'bg-white'}`} />
      </div>
    )
  }

  // Halo/gradient mesh background option
  if (effectiveVariant === 'halo' || backgroundType === 'gradient-mesh') {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
        <div className={`absolute inset-0 ${isDark ? 'bg-[#121212]' : 'bg-white'}`} />
        <motion.div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 20% 30%, rgba(52, 211, 153, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(226, 195, 118, 0.2) 0%, transparent 50%)'
              : 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(226, 195, 118, 0.12) 0%, transparent 50%)'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 60% 40%, rgba(52, 211, 153, 0.2) 0%, transparent 50%)'
              : 'radial-gradient(circle at 60% 40%, rgba(16, 185, 129, 0.12) 0%, transparent 50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    )
  }

  // Grid variant (subtle grid pattern only)
  if (effectiveVariant === 'grid') {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]' : 'bg-white'}`} />
        {/* Subtle grid pattern - theme-aware */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.01]'}`}
          style={{
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(226, 195, 118, 0.08)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(226, 195, 118, 0.08)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    )
  }

  // No background option
  if (effectiveVariant === 'none' || backgroundType === 'none') {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
        <div className={`absolute inset-0 ${isDark ? 'bg-[#121212]' : 'bg-white'}`} />
      </div>
    )
  }

  // Default particles background
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -999 }}>
      {/* Main gradient background - theme-aware */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]' : 'bg-white'}`} />
      
      {/* Animated gradient orbs - theme-aware opacity */}
      {isDark && (
        <>
          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#10B981]/10 blur-3xl"
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
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#059669]/10 blur-3xl"
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
            className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-[#10B981]/5 blur-2xl"
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
        </>
      )}

      {/* Floating particles - theme-aware colors */}
      {showParticles && (
        <div className="absolute inset-0">
          {[...Array(particleCount)].map((_, i) => {
            // Use deterministic positioning based on index to prevent hydration mismatches
            const baseX = (i * 200) % 1200
            const baseY = 800 + (i * 100)
            const baseDuration = 4 + (i % 3) // 4-6 seconds
            const baseDelay = i * 0.8
            // Theme-aware particle colors: gold for light, green for dark
            const particleColor = isDark ? '#10B981' : '#E2C376'
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: particleColor,
                  opacity: isDark ? 0.4 : 0.3
                }}
                initial={{ 
                  x: baseX, 
                  y: baseY,
                  scale: 0 
                }}
                animate={{ 
                  y: -50,
                  scale: [0, 1, 0],
                  opacity: [0, isDark ? 0.6 : 0.5, 0]
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

      {/* Subtle grid pattern - theme-aware */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.015]' : 'opacity-[0.008]'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(16, 185, 129, 0.04)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(16, 185, 129, 0.04)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
