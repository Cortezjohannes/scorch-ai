'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AnimatedStoryLoaderProps {
  isVisible: boolean
  progress?: number
  currentStep?: string
}

export default function AnimatedStoryLoader({ isVisible, progress = 0, currentStep = 'Initializing Murphy Engine...' }: AnimatedStoryLoaderProps) {
  const [currentEngine, setCurrentEngine] = useState(0)
  const [showEngines, setShowEngines] = useState(false)
  const [activeEngines, setActiveEngines] = useState<number[]>([])
  const [realTimeProgress, setRealTimeProgress] = useState(0)
  const [particleCount, setParticleCount] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(0.3)
  const [dynamicMessage, setDynamicMessage] = useState('Writing the narrative of your series...')

  const engines = [
    { name: 'Premise Engine', icon: '🎯', color: '#e2c376', description: 'Analyzing story foundation and thematic structure' },
    { name: '3D Character Engine', icon: '👥', color: '#76c3e2', description: 'Creating psychologically complex characters' },
    { name: 'Fractal Narrative Engine', icon: '📚', color: '#76e2a5', description: 'Building multi-layered story architecture' },
    { name: 'Strategic Dialogue Engine', icon: '🗣️', color: '#e276c3', description: 'Crafting purposeful character conversations' },
    { name: 'Intelligent Trope System', icon: '🎭', color: '#c376e2', description: 'Subverting and enhancing genre conventions' },
    { name: 'Living World Engine', icon: '🌍', color: '#e2a576', description: 'Creating dynamic, reactive environments' },
    { name: 'Relationship Engine', icon: '🔗', color: '#76e2d4', description: 'Mapping character dynamics and connections' },
    { name: 'Genre Mastery System', icon: '🎨', color: '#d476e2', description: 'Optimizing for genre-specific storytelling' },
    { name: 'Tension Escalation Engine', icon: '⚡', color: '#e27676', description: 'Building dramatic tension and pacing' },
    { name: 'World Building Engine', icon: '🏗️', color: '#a5e276', description: 'Establishing setting and atmosphere' },
    { name: 'Theme Integration Engine', icon: '🎭', color: '#d4a5e2', description: 'Thematic coherence systems' },
    { name: 'Pacing Rhythm Engine', icon: '🎵', color: '#c3e276', description: 'Optimizing story rhythm and flow' },
    { name: 'Hook Cliffhanger Engine', icon: '🪝', color: '#e2c376', description: 'Creating compelling hooks and cliffhangers' },
    { name: 'Engagement Engine', icon: '🎯', color: '#76e2c3', description: 'Maximizing audience engagement' }
  ]

  useEffect(() => {
    if (!isVisible) return

    // Animated entrance sequence
    const timer = setTimeout(() => {
      setShowEngines(true)
    }, 500)

    // Particle animation
    const particleInterval = setInterval(() => {
      setParticleCount(prev => (prev + 1) % 8)
    }, 2000)

    // Glow intensity animation
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => prev === 0.3 ? 0.8 : 0.3)
    }, 3000)

    // Dynamic messaging rotation
    const messages = [
      'Writing the narrative of your series...',
      'Crafting compelling characters...',
      'Building immersive worlds...',
      'Weaving intricate plot threads...',
      'Creating dramatic tension...',
      'Designing meaningful choices...',
      'Orchestrating genre mastery...',
      'Engineering story cohesion...',
      'Synthesizing creative elements...',
      'Finalizing your story bible...'
    ]

    const messageInterval = setInterval(() => {
      setDynamicMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 4000) // Change message every 4 seconds

    return () => {
      clearTimeout(timer)
      clearInterval(particleInterval)
      clearInterval(glowInterval)
      clearInterval(messageInterval)
    }
  }, [isVisible])

  // Real-time progress simulation based on currentStep
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setRealTimeProgress(prev => {
        // If we have an actual progress value, use it, otherwise simulate
        if (progress > 0) {
          return Math.min(progress, prev + 0.5)
        }
        
        // Simulate progress based on step content
        if (currentStep.includes('Premise')) {
          return Math.min(15, prev + 1)
        } else if (currentStep.includes('Character')) {
          return Math.min(45, prev + 1)
        } else if (currentStep.includes('Narrative') || currentStep.includes('Story')) {
          return Math.min(85, prev + 0.8)
        } else if (currentStep.includes('Complete') || currentStep.includes('Finished')) {
          return 100
        }
        
        return Math.min(90, prev + 0.3)
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isVisible, currentStep, progress])

  // Engine activation based on progress and step
  useEffect(() => {
    if (!showEngines) return

    const engineActivationRules = [
      { step: 'Premise', engines: [0] }, // Premise Engine
      { step: 'Character', engines: [0, 1] }, // + 3D Character Engine
      { step: 'Narrative', engines: [0, 1, 2, 3, 4] }, // + Narrative engines
      { step: 'Enhancement', engines: [0, 1, 2, 3, 4, 5, 6] }, // + More engines
      { step: 'Complete', engines: Array.from({length: engines.length}, (_, i) => i) } // All engines
    ]

    const activeRule = engineActivationRules.find(rule => currentStep.includes(rule.step))
    if (activeRule) {
      setActiveEngines(activeRule.engines)
    }

    // Cycle through engines more dynamically
    const interval = setInterval(() => {
      if (activeEngines.length > 0) {
        setCurrentEngine(prev => {
          const nextIndex = activeEngines.indexOf(prev) + 1
          return activeEngines[nextIndex % activeEngines.length]
        })
      } else {
        setCurrentEngine((prev) => (prev + 1) % Math.min(3, engines.length))
      }
    }, 600)

    return () => clearInterval(interval)
  }, [showEngines, engines.length])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      style={{ fontFamily: 'League Spartan, sans-serif' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>
      {/* Background particle effects */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#e2c376]/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Floating geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute w-2 h-2 border border-[#e2c376]/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear"
          }}
        />
      ))}
      <div className="max-w-4xl w-full px-8">
        {/* Revolutionary Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat bg-[#e2c376]/10 border border-[#e2c376]/30">
            <span className="text-4xl">🔥</span>
          </div>
          <h1 className="text-6xl font-black elegant-fire fire-gradient animate-flameFlicker mb-4">
            SCORCHED STORY ENGINE
          </h1>
          <p className="text-xl text-white/90 elegant-fire">
            Forging {engines.length} Revolutionary AI Engines
          </p>
        </motion.div>

        {/* Enhanced Central Logo Animation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", bounce: 0.3 }}
        >
          <div className="relative">
            {/* Revolutionary Rotating Rings */}
            <motion.div
              className="w-40 h-40 border-2 border-[#e2c376]/40 rounded-full absolute inset-0 ember-shadow"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="w-32 h-32 border-4 border-[#FF6B00]/60 rounded-full absolute inset-4 ember-shadow"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Revolutionary Pulsing Core */}
            <motion.div
              className="absolute inset-8 bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376] rounded-full flex items-center justify-center ember-shadow"
              animate={{ 
                scale: [1, 1.15, 1],
                boxShadow: [
                  `0 0 20px rgba(226, 195, 118, ${glowIntensity})`,
                  `0 0 40px rgba(226, 195, 118, ${glowIntensity + 0.3})`,
                  `0 0 20px rgba(226, 195, 118, ${glowIntensity})`
                ],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.span 
                className="text-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🏛️
              </motion.span>
            </motion.div>

            {/* Enhanced orbiting particles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-4px',
                  marginLeft: '-4px',
                }}
                animate={{
                  x: [0, 70, 0, -70, 0],
                  y: [0, -70, 0, 70, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Floating sparkles */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-[#e2c376] rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-2px',
                  marginLeft: '-2px',
                }}
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Enhanced Engine Grid */}
        {showEngines && (
          <motion.div
            className="grid grid-cols-8 gap-2 mb-8 max-w-6xl mx-auto overflow-x-auto"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          >
            {engines.map((engine, index) => (
              <motion.div
                key={engine.name}
                className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-700 ${
                  index === currentEngine
                    ? 'border-[#e2c376] bg-gradient-to-b from-[#e2c376]/20 to-[#e2c376]/5 scale-110 shadow-2xl shadow-[#e2c376]/30 backdrop-blur-sm'
                    : 'border-[#36393f] bg-[#1a1a1a]/50 hover:border-[#4a4a4a] hover:bg-[#1a1a1a]/70'
                }`}
                initial={{ opacity: 0, scale: 0, rotateY: -90 }}
                animate={{ 
                  opacity: 1, 
                  scale: index === currentEngine ? 1.1 : 1,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.08,
                  scale: { duration: 0.4, type: "spring" },
                  rotateY: { duration: 0.6 }
                }}
                whileHover={{ 
                  scale: 1.08,
                  rotateY: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  className="text-xl mb-1 relative"
                  animate={index === currentEngine ? { 
                    scale: [1, 1.4, 1],
                    rotate: [0, 15, -15, 0],
                    y: [0, -5, 0]
                  } : {
                    scale: 1,
                    rotate: 0,
                    y: 0
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: index === currentEngine ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    transition: { duration: 0.2 }
                  }}
                >
                  {engine.icon}
                  {index === currentEngine && (
                    <motion.div
                      className="absolute inset-0 bg-[#e2c376] rounded-full blur-sm"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] text-center font-medium transition-colors duration-300 leading-tight ${
                  index === currentEngine ? 'text-[#e2c376] font-semibold' : 'text-[#e7e7e7]/60'
                }`}>
                  {engine.name.split(' ')[0]}
                </span>
                {index === currentEngine && (
                  <motion.div
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#e2c376] to-transparent mt-1"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Progress Information */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {/* Revolutionary Message */}
          <motion.p
            className="text-xl text-[#e2c376] font-black elegant-fire animate-flameFlicker"
            key={dynamicMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            🔥 {dynamicMessage}
          </motion.p>

          {/* Revolutionary Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="w-full bg-black/50 border border-[#e2c376]/30 rounded-full h-4 overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376] rounded-full relative ember-shadow"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(realTimeProgress, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              {/* Progress glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 20px rgba(226, 195, 118, ${glowIntensity})`,
                }}
                animate={{ 
                  boxShadow: [
                    `0 0 20px rgba(226, 195, 118, ${glowIntensity})`,
                    `0 0 30px rgba(226, 195, 118, ${glowIntensity + 0.2})`,
                    `0 0 20px rgba(226, 195, 118, ${glowIntensity})`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <motion.p 
              className="text-sm text-[#e7e7e7]/60 mt-2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(realTimeProgress)}% Complete
            </motion.p>
          </div>

          {/* Enhanced Engine Status */}
          {showEngines && (
            <motion.div
              className="space-y-3"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-center space-x-2 text-sm text-[#e7e7e7]/70">
                <span>🎼</span>
                <span>Master Conductor Orchestrating</span>
                <span>{engines[currentEngine]?.icon}</span>
              </div>
              
              {/* Current Engine Details */}
              <motion.div
                className="text-center bg-[#1a1a1a]/80 rounded-lg p-3 border border-[#36393f]/50 max-w-md mx-auto"
                key={currentEngine}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-lg">{engines[currentEngine]?.icon}</span>
                  <span className="text-[#e2c376] font-medium text-sm">
                    {engines[currentEngine]?.name}
                  </span>
                </div>
                <p className="text-xs text-[#e7e7e7]/80 leading-relaxed">
                  {engines[currentEngine]?.description}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Fun Facts */}
          <motion.div
            className="text-sm text-[#e7e7e7]/50 max-w-lg mx-auto"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💡 Creating unique character names from diverse cultural traditions...
          </motion.div>

          {/* Anti-Template Message */}
          <motion.div
            className="text-xs text-[#e2c376]/70 max-w-md mx-auto mt-2"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            ✨ NO templates - every element is AI-generated for your unique story
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}