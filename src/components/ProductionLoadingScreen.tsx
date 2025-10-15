'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductionLoadingScreenProps {
  onComplete: (generatedContent: any) => void
  storyBible: any
  arcIndex: number
  arcEpisodes: any[]
  workspaceEpisodes?: any
  userChoices?: any[]
}

const CONTENT_TYPES = [
  { id: 'script', label: 'Script', icon: '📝', description: 'Professional screenplay formatting' },
  { id: 'storyboard', label: 'Storyboard', icon: '🎬', description: 'Visual scene breakdowns' },
  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Character casting guides' },
  { id: 'props', label: 'Props & Wardrobe', icon: '🎪', description: 'Production requirements' },
  { id: 'location', label: 'Location', icon: '📍', description: 'Filming locations' },
  { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Promotional strategy' },
  { id: 'postProduction', label: 'Post-Production', icon: '✂️', description: 'Editing guidelines' }
]

// Helper function to get detailed engine information for each content type
const getEngineDetails = (contentType: string): string => {
  const engineDetails: Record<string, string> = {
    script: 'Activating Strategic Dialogue Engine & Fractal Narrative Engine',
    storyboard: 'Initializing Visual Storytelling Engine & Cinematography Engine', 
    casting: 'Deploying 3D Character Engine & Performance Coaching Engine',
    props: 'Engaging Production Design Engine & World Building Engine',
    location: 'Launching Location Scouting Engine & Environmental Design',
    marketing: 'Activating Genre Mastery Engine & Audience Analysis',
    postProduction: 'Initializing Sound Design Engine & Post-Production Workflow'
  }
  return engineDetails[contentType] || 'Activating AI content generation engines'
}

// Helper function to get specific enhancement details for episode processing
const getEnhancementDetails = (contentType: string, episode: number, totalEpisodes: number): string => {
  const enhancementMessages: Record<string, string[]> = {
    script: [
      'Analyzing character psychology and motivations',
      'Crafting dialogue with strategic story purpose', 
      'Building dramatic tension and pacing',
      'Refining character voice consistency',
      'Optimizing scene transitions and flow'
    ],
    storyboard: [
      'Designing cinematic shot compositions',
      'Planning camera movements and angles',
      'Creating visual mood and atmosphere',
      'Mapping lighting and color schemes',
      'Finalizing visual storytelling beats'
    ],
    casting: [
      'Analyzing character archetypes and needs',
      'Matching personality traits to roles',
      'Considering physical appearance requirements',
      'Evaluating chemistry between characters',
      'Generating casting recommendations'
    ],
    props: [
      'Cataloging essential story props',
      'Designing period-appropriate costumes',
      'Planning wardrobe for character arcs',
      'Identifying key visual elements',
      'Creating production shopping lists'
    ],
    location: [
      'Scouting thematically appropriate locations',
      'Analyzing practical filming requirements',
      'Considering budget and accessibility factors',
      'Mapping scene-to-location assignments',
      'Generating location alternatives'
    ],
    marketing: [
      'Identifying target audience segments',
      'Crafting compelling story hooks',
      'Developing promotional taglines',
      'Analyzing market positioning',
      'Creating audience engagement strategies'
    ],
    postProduction: [
      'Planning editing rhythm and pacing',
      'Designing sound design approach',
      'Mapping color grading strategies',
      'Identifying key visual effects needs',
      'Creating post-production timelines'
    ]
  }
  
  const messages = enhancementMessages[contentType] || ['Processing content with AI engines']
  const messageIndex = Math.min(episode - 1, messages.length - 1)
  return `${messages[messageIndex]} (Episode ${episode}/${totalEpisodes})`
}

export default function ProductionLoadingScreen({ 
  onComplete, 
  storyBible, 
  arcIndex, 
  arcEpisodes,
  workspaceEpisodes = {},
  userChoices = []
}: ProductionLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [overallProgress, setOverallProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [generatedContent, setGeneratedContent] = useState<any>({})
  const [currentStatus, setCurrentStatus] = useState('Initializing production pipeline...')
  const [isComplete, setIsComplete] = useState(false)

  const totalSteps = CONTENT_TYPES.length
  // Get actual episode count from story bible for this arc
  const currentArc = storyBible?.narrativeArcs?.[arcIndex]
  const totalEpisodes = currentArc?.episodes?.length || arcEpisodes.length || 10

  // Multi-model AI system handles mode selection automatically
  const getUserMode = () => {
    console.log('🎯 Using intelligent multi-model routing')
    return 'auto'
  }

  useEffect(() => {
    generateAllContent()
  }, [])

  const generateAllContent = async () => {
    const allContent: any = {}
    
    for (let stepIndex = 0; stepIndex < CONTENT_TYPES.length; stepIndex++) {
      const contentType = CONTENT_TYPES[stepIndex]
      setCurrentStep(stepIndex)
      // Enhanced status message with AI engine details
      const engineDetails = getEngineDetails(contentType.id)
      setCurrentStatus(`${contentType.icon} Initializing ${contentType.label}: ${engineDetails}`)
      setStepProgress(0)
      
      try {
        // Enhanced status with specific content details
        const enhancementDetails = getEnhancementDetails(contentType.id, 1, totalEpisodes)
        setCurrentStatus(`${contentType.icon} ${contentType.label}: ${enhancementDetails}`)
        setStepProgress(20)
        
        // Generate content for this content type (API returns all episodes at once)
        const fullPreProduction = await generateContentType(
          contentType.id, 
          storyBible, 
          arcIndex, 
          arcEpisodes
        )
        
        setStepProgress(80)
        
        // Extract the specific content type from the full preProduction response
        let episodeContents: any[] = []
        if (fullPreProduction && !fullPreProduction.error) {
          const specificContent = fullPreProduction[contentType.id]
          if (specificContent) {
            // For episode-based content like script, use episode array directly
            if (specificContent.episodes && Array.isArray(specificContent.episodes)) {
              episodeContents = specificContent.episodes.map((ep: any, index: number) => ({
                episodeNumber: index + 1,
                title: arcEpisodes[index]?.title || ep.title || `Episode ${index + 1}`,
                ...ep
              }))
            } else {
              // For non-episode based content, create single entry
              episodeContents.push({
                episodeNumber: 1,
                title: `${contentType.label} Guide`,
                ...specificContent
              })
            }
          }
        }
        
        // Structure the content properly for each content type
        let structuredContent: Record<string, any> = {}
        if (episodeContents.length > 0) {
          switch (contentType.id) {
            case 'script':
              structuredContent = { script: { episodes: episodeContents } }
              break
            case 'storyboard':
              structuredContent = { 
                storyboard: { 
                  episodes: episodeContents,
                  visualStyle: fullPreProduction.storyboard?.visualStyle || {
                    description: "Cinematic visual style with dynamic lighting and modern aesthetics",
                    cinematicReferences: []
                  }
                } 
              }
              break
            case 'casting':
              // Use characters directly from API response
              const characters = fullPreProduction.casting?.characters || []
              structuredContent = { casting: { characters: characters } }
              break
            default:
              // For non-episode content (props, location, marketing, postProduction), use direct content
              if (fullPreProduction[contentType.id]) {
                structuredContent = { [contentType.id]: fullPreProduction[contentType.id] }
              } else {
                structuredContent = { [contentType.id]: { episodes: episodeContents } }
              }
          }
        } else {
          // Fallback to arc-level generation if episode-level fails
          const content = await generateContentType(contentType.id, storyBible, arcIndex, arcEpisodes)
          structuredContent = content || {}
        }
        
        allContent[contentType.id] = structuredContent[contentType.id] || {}
        setGeneratedContent((prev: Record<string, any>) => ({ ...prev, [contentType.id]: structuredContent[contentType.id] || {} }))
        
        // Update overall progress
        const newOverallProgress = ((stepIndex + 1) / totalSteps) * 100
        setOverallProgress(newOverallProgress)
        
        // Brief pause between content types
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        console.error(`Error generating ${contentType.id}:`, error)
        // Continue with next content type even if one fails
      }
    }
    
    setCurrentStatus('Production complete! Preparing results...')
    setIsComplete(true)
    
    // Save all content to localStorage
    localStorage.setItem(`reeled-preproduction-${arcIndex}`, JSON.stringify(allContent))
    localStorage.removeItem('reeled-auto-generate')
    
    // Complete after a brief delay
    setTimeout(() => {
      onComplete(allContent)
    }, 1000)
  }

  // Helper function to generate content for a specific type
  const generateContentType = async (
    contentType: string, 
    storyBible: any, 
    arcIndex: number, 
    arcEpisodes: any[],
    episodeIndex?: number
  ): Promise<any> => {
    try {
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyBible,
          arcIndex,
          arcEpisodes,
          contentType,
          episodeIndex,
          mode: getUserMode(),
          // ENHANCED: Include workspace data for story coherence
          workspaceEpisodes: workspaceEpisodes || {},
          userChoices: userChoices || []
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate ${contentType}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // API returns preProduction object, not content
        return result.preProduction || result.content
      } else {
        throw new Error(result.error || `Failed to generate ${contentType}`)
      }
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error)
      return { error: `Failed to generate ${contentType}` }
    }
  }

  const currentContentType = CONTENT_TYPES[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF99]/5 via-transparent to-[#00FF99]/5 animate-pulse" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00FF99]/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
        {/* Revolutionary Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-4 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
              <span className="text-4xl">🎬</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black elegant-fire fire-gradient animate-flameFlicker">
              GREENLIT PRODUCTION
            </h1>
          </motion.div>
          <p className="text-xl md:text-2xl text-white/90 mb-2 elegant-fire">
            {storyBible?.seriesTitle || 'Your Series'} - Arc {arcIndex + 1}
          </p>
          <p className="text-lg text-white/70 elegant-fire">
            Generating pre-production materials for your series
          </p>
        </motion.div>

        {/* Revolutionary Current Step Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-7xl mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentContentType?.icon}
            </motion.div>
            <h2 className="text-3xl font-black text-[#00FF99] mb-3 elegant-fire">
              {currentContentType?.label}
            </h2>
            <p className="text-lg text-white/90 elegant-fire">
              {currentContentType?.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Revolutionary Progress Bars */}
        <div className="space-y-8 mb-12">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-lg text-white/80 mb-3 elegant-fire">
              <span>EMPIRE PROGRESS</span>
              <span className="font-black text-[#00FF99]">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-6 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden border border-[#00FF99]/20">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00CC7A] via-[#00FF99] to-[#33FFAD]"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step Progress */}
          <div>
            <div className="flex justify-between text-lg text-white/80 mb-3 elegant-fire">
              <span>{currentContentType?.label} PROGRESS</span>
              <span className="font-black text-[#00FF99]">{Math.round(stepProgress)}%</span>
            </div>
            <div className="h-4 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden border border-[#00FF99]/20">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00CC7A]/70 via-[#00FF99]/70 to-[#33FFAD]/70"
                style={{ width: `${stepProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Revolutionary Content Type Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          {CONTENT_TYPES.map((type, index) => (
            <motion.div
              key={type.id}
              className={`p-6 rebellious-card transition-all ${
                index < currentStep 
                  ? 'border-[#00FF99]/60 shadow-[#00FF99]/20' 
                  : index === currentStep
                    ? 'border-[#00CC7A]/40 shadow-[#00CC7A]/20'
                    : 'border-[#00FF99]/20'
              }`}
              animate={index === currentStep ? { 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0 0 rgba(214, 40, 40, 0)", "0 0 0 8px rgba(214, 40, 40, 0.1)", "0 0 0 0 rgba(214, 40, 40, 0)"]
              } : {}}
              transition={{ duration: 2, repeat: index === currentStep ? Infinity : 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl text-center mb-3">{type.icon}</div>
              <div className="text-sm text-center font-black elegant-fire">{type.label}</div>
              {index < currentStep && (
                <motion.div
                  className="text-[#00FF99] text-center mt-3 text-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  ✅
                </motion.div>
              )}
              {index === currentStep && (
                <motion.div
                  className="text-[#00CC7A] text-center mt-3 text-xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Revolutionary Murphy Pillar Engines Display */}
        <motion.div 
          className="mb-8 p-8 rebellious-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-[#00FF99] mb-3 elegant-fire">🎬 PRODUCTION ENGINES</h3>
            <p className="text-lg text-white/90 elegant-fire">AI-powered production intelligence systems</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Casting Intelligence', icon: '🎭', active: currentStep >= 2 },
              { name: 'Script & Storyboard', icon: '📝', active: currentStep >= 0 },
              { name: 'World Building', icon: '🏗️', active: currentStep >= 4 },
              { name: 'Visual Design', icon: '👗', active: currentStep >= 3 },
              { name: 'Production Planning', icon: '📅', active: currentStep >= 1 },
              { name: 'Marketing Strategy', icon: '📢', active: currentStep >= 5 },
              { name: 'Post-Production', icon: '🎞️', active: currentStep >= 6 },
              { name: 'Genre Mastery', icon: '🎪', active: currentStep >= 1 }
            ].map((engine, index) => (
              <motion.div
                key={engine.name}
                className={`p-4 rebellious-card text-center transition-all ${
                  engine.active 
                    ? 'border-[#00CC7A]/40 shadow-[#00CC7A]/20' 
                    : 'border-[#00FF99]/20'
                }`}
                animate={engine.active ? {
                  boxShadow: ["0 0 0 0 rgba(214, 40, 40, 0)", "0 0 0 8px rgba(214, 40, 40, 0.1)", "0 0 0 0 rgba(214, 40, 40, 0)"]
                } : {}}
                transition={{ duration: 2, repeat: engine.active ? Infinity : 0 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="text-2xl mb-2">{engine.icon}</div>
                <div className="text-sm font-black elegant-fire">{engine.name}</div>
                {engine.active && (
                  <motion.div
                    className="text-[#00CC7A] text-center mt-2 text-xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚡
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revolutionary Status and Episode Counter */}
        <motion.div 
          className="text-center"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white/90 mb-3 text-lg elegant-fire">{currentStatus}</p>
          {!isComplete && (
            <p className="text-white/70 text-lg elegant-fire">
              Processing Episode {currentEpisode} of {totalEpisodes}
            </p>
          )}
        </motion.div>

        {/* Revolutionary Completion Animation */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-[#121212]/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="text-9xl mb-8"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1 }}
                >
                  🏆
                </motion.div>
                <h2 className="text-4xl font-black elegant-fire fire-gradient animate-flameFlicker mb-6">
                  EMPIRE PRODUCTION COMPLETE!
                </h2>
                <p className="text-xl text-white/90 elegant-fire">
                  All pre-production materials have been forged for your revolution
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 