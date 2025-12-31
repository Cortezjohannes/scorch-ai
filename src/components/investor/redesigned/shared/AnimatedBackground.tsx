'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'waves' | 'grid' | 'cinematic' | 'none'
  color?: string
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export default function AnimatedBackground({
  variant = 'particles',
  color = '#10B981',
  intensity = 'medium',
  className = ''
}: AnimatedBackgroundProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const particleCount = intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60
  const waveCount = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 8

  const renderParticles = () => (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: color,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )

  const renderWaves = () => (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 1200 800">
        {Array.from({ length: waveCount }).map((_, i) => (
          <motion.path
            key={i}
            d={`M0,${400 + i * 50} Q300,${350 + i * 50} 600,${400 + i * 50} T1200,${450 + i * 50} V800 H0 Z`}
            fill={color}
            fillOpacity="0.05"
            animate={{
              d: [
                `M0,${400 + i * 50} Q300,${350 + i * 50} 600,${400 + i * 50} T1200,${450 + i * 50} V800 H0 Z`,
                `M0,${420 + i * 50} Q300,${370 + i * 50} 600,${420 + i * 50} T1200,${470 + i * 50} V800 H0 Z`,
                `M0,${400 + i * 50} Q300,${350 + i * 50} 600,${400 + i * 50} T1200,${450 + i * 50} V800 H0 Z`
              ]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5
            }}
          />
        ))}
      </svg>
    </div>
  )

  const renderGrid = () => (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated grid lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )

  const renderCinematic = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Film grain effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'grain 0.5s steps(10) infinite'
        }}
      />

      {/* Light rays */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-px opacity-20"
          style={{
            height: '100%',
            background: `linear-gradient(to bottom, ${color}40, transparent)`,
            left: `${20 + i * 15}%`,
            transformOrigin: 'top'
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )

  const renderContent = () => {
    switch (variant) {
      case 'particles':
        return renderParticles()
      case 'waves':
        return renderWaves()
      case 'grid':
        return renderGrid()
      case 'cinematic':
        return renderCinematic()
      default:
        return null
    }
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {renderContent()}

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
      `}</style>
    </div>
  )
}