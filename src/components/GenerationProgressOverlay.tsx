'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Helper function to provide detailed progress information
const getProgressDetails = (currentStep: string, stepIndex: number, totalSteps: number): string => {
  // Analyze the current step to provide contextual information
  const step = currentStep.toLowerCase()
  
  if (step.includes('script')) {
    return 'Analyzing character motivations and crafting dialogue that serves the story purpose. Each line advances plot or reveals character.'
  }
  if (step.includes('storyboard')) {
    return 'Designing visual compositions and camera angles to enhance storytelling. Planning shots that create emotional impact.'
  }
  if (step.includes('casting')) {
    return 'Matching character archetypes with performance requirements. Considering chemistry between characters and their story arcs.'
  }
  if (step.includes('props') || step.includes('wardrobe')) {
    return 'Cataloging essential props and costume requirements. Every item supports character development or plot advancement.'
  }
  if (step.includes('location')) {
    return 'Scouting locations that enhance thematic elements. Considering practical filming needs and budget constraints.'
  }
  if (step.includes('marketing')) {
    return 'Developing audience engagement strategies and promotional hooks. Identifying what makes your story uniquely compelling.'
  }
  if (step.includes('post')) {
    return 'Planning editing rhythms and sound design approaches. Creating a post-production roadmap for maximum impact.'
  }
  if (step.includes('murphy') || step.includes('engine')) {
    return 'Coordinating multiple AI engines to ensure narrative coherence. Quality over speed for professional results.'
  }
  
  // Fallback based on step number
  const progressPhases = [
    'Initializing AI engines and preparing content generation systems',
    'Analyzing story structure and character relationships for optimal development',
    'Generating content using advanced narrative AI and professional formatting',
    'Refining and enhancing content with specialized production engines',
    'Finalizing materials and ensuring professional quality standards'
  ]
  
  const phaseIndex = Math.min(Math.floor((stepIndex / totalSteps) * progressPhases.length), progressPhases.length - 1)
  return progressPhases[phaseIndex] || 'Processing your story with advanced AI technology'
}

interface GenerationProgressOverlayProps {
  isVisible: boolean
  progress: number
  currentStep: string
  totalSteps: number
  currentStepIndex: number
}

export default function GenerationProgressOverlay({
  isVisible,
  progress,
  currentStep,
  totalSteps,
  currentStepIndex
}: GenerationProgressOverlayProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Reset timer when overlay becomes visible
  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now())
      setElapsedTime(0)
    } else if (!isVisible) {
      setStartTime(null)
      setElapsedTime(0)
    }
  }, [isVisible, startTime])

  // Update elapsed time every second
  useEffect(() => {
    if (!isVisible || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000) // seconds
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible, startTime])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null
  
  const formattedProgress = Math.min(Math.max(Math.round(progress), 0), 100)
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl p-8">
        <motion.div 
          className="bg-[#1a1a1a] border border-[#36393f] rounded-2xl p-8 shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-[#e2c376] mb-6 text-center">
            Generating Pre-Production Materials
          </h2>
          
          {/* Main progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#e7e7e7]/70">Overall Progress</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#e2c376]/70 font-mono">{formatTime(elapsedTime)}</span>
                <span className="text-[#e2c376] font-medium">{formattedProgress}%</span>
              </div>
            </div>
            <div className="w-full h-4 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#e2c376] to-[#c4a75f]" 
                initial={{ width: '0%' }}
                animate={{ width: `${formattedProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Current step indicator */}
          <div className="mb-8">
            <div className="mb-4 text-center">
              <span className="text-[#e7e7e7] font-medium">
                Step {currentStepIndex} of {totalSteps}:
              </span>
              <motion.span 
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block text-xl text-[#e2c376] font-bold mt-1"
              >
                {currentStep}
              </motion.span>
            </div>
          </div>
          
          {/* Animated elements */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <motion.div 
                className="w-24 h-24 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-[#e2c376]">
                  {formattedProgress}%
                </span>
              </div>
            </div>
            
            <motion.div 
              className="ml-8"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-3 h-3 bg-[#e2c376] rounded-full"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-[#e7e7e7]/70 mt-2">
                AI is crafting your content...
              </p>
            </motion.div>
          </div>
          
          {/* Generation tips */}
                      <motion.div
              className="text-center text-[#e7e7e7]/60 text-sm mt-6 px-8 space-y-3"
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <p className="text-[#e7e7e7]/80">The AI is analyzing your story and creating professional pre-production materials.</p>
              
              {/* Enhanced progress details based on current step */}
              <motion.div
                className="bg-[#252628] rounded-lg p-3 border border-[#36393f]/40"
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs text-[#e2c376]/90 mb-1">Current Process:</p>
                <p className="text-xs text-[#e7e7e7]/90 leading-relaxed">
                  {getProgressDetails(currentStep, currentStepIndex, totalSteps)}
                </p>
              </motion.div>
              
              <p className="text-xs text-[#e7e7e7]/50">
                Quality content generation takes time - your patience creates better results ✨
              </p>
            </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 