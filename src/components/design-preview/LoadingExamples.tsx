'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useTheme } from '@/context/ThemeContext'

interface LoadingExamplesProps {
  theme: 'light' | 'dark'
}

// Sample data for Tier 1 loaders
const SAMPLE_ENGINES = [
  { id: 'premise', name: 'Premise Engine', icon: '🎯', description: 'Analyzing story foundation' },
  { id: 'character', name: 'Character Engine', icon: '👥', description: 'Creating 3D characters' },
  { id: 'narrative', name: 'Narrative Engine', icon: '📖', description: 'Building story structure' },
  { id: 'world', name: 'World Engine', icon: '🌍', description: 'Building immersive settings' },
  { id: 'dialogue', name: 'Dialogue Engine', icon: '💬', description: 'Crafting conversations' },
]

const SAMPLE_STEPS = [
  { name: 'Locking Script', status: 'complete' },
  { name: 'Casting', status: 'complete' },
  { name: 'Scheduling', status: 'active' },
  { name: 'Location Scouting', status: 'pending' },
  { name: 'Props & Wardrobe', status: 'pending' },
]

// Helper function for time formatting
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Tier 1 Concept A: Production Console
function Tier1Console({ isDark, progress, currentEngine, elapsed, engines, steps }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <div className={`w-full h-full rounded-xl ${isDark ? 'bg-[#10B981]/20 border-[#10B981]/40' : 'bg-black/10 border-black/20'} border-2 flex items-center justify-center`}>
              <span className="text-3xl">⚡</span>
            </div>
          </motion.div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            GREENLIT PRODUCTION CONSOLE
          </h2>
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
            Session {Math.random().toString(36).substring(2, 8)} • {formatTime(elapsed)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'}`}>
              Overall Progress
            </span>
            <span className={`text-lg font-bold ${isDark ? 'text-[#10B981]' : 'text-black'}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
            <motion.div
              className={`h-full ${isDark ? 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#33FFAD]' : 'bg-gradient-to-r from-black to-gray-800'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step List */}
        <div className="w-full max-w-2xl space-y-3">
          {steps.map((step: any, index: number) => {
            const isComplete = step.status === 'complete'
            const isActive = step.status === 'active'
            return (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  isActive
                    ? isDark ? 'bg-[#10B981]/20 border-[#10B981]/40' : 'bg-black/10 border-black/20'
                    : isComplete
                    ? isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                    : isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                } border`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? isDark ? 'bg-[#10B981]' : 'bg-black'
                    : isActive
                    ? isDark ? 'bg-[#10B981]/50' : 'bg-black/50'
                    : isDark ? 'bg-white/20' : 'bg-black/20'
                }`}>
                  {isComplete ? (
                    <span className="text-white text-sm">✓</span>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                    {step.name}
                  </div>
                  {isActive && (
                    <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      Processing...
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Current Engine */}
        <div className={`w-full max-w-2xl p-4 rounded-lg ${isDark ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-black/10 border-black/20'} border`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-[#10B981]' : 'text-black'}`}>
            Active Engine
          </div>
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
            {engines[currentEngine]?.icon} {engines[currentEngine]?.name}
          </div>
          <div className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            {engines[currentEngine]?.description}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Tier 1 Concept B: Story Forge
function Tier1Forge({ isDark, progress, currentEngine, elapsed, engines }: any) {
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Background Particles - Rising from Bottom */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const startX = 10 + Math.random() * 80
            const startDelay = Math.random() * 3
            const duration = 3 + Math.random() * 2
            const riseDistance = 150 + Math.random() * 100
            
            return (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 ${isDark ? 'bg-[#10B981]' : 'bg-[#E2C376]'} rounded-full`}
                style={{
                  left: `${startX}%`,
                  top: '100%',
                  boxShadow: isDark 
                    ? `0 0 8px #10B981, 0 0 12px #10B981`
                    : `0 0 8px #E2C376, 0 0 12px #E2C376`,
                }}
                animate={{
                  y: -riseDistance,
                  opacity: [0, 1, 0.8, 0],
                  scale: [0.5, 1.2, 1, 0.5],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: startDelay,
                  ease: "easeOut",
                }}
              />
            )
          })}
        </div>

        {/* Progress Ring with Breathing Glow */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="96"
              cy="96"
              r="60"
              stroke={isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="60"
              stroke={isDark ? '#10B981' : '#E2C376'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: offset,
                filter: [
                  isDark ? 'drop-shadow(0 0 8px #10B981)' : 'drop-shadow(0 0 8px #E2C376)',
                  isDark ? 'drop-shadow(0 0 16px #10B981)' : 'drop-shadow(0 0 16px #E2C376)',
                  isDark ? 'drop-shadow(0 0 8px #10B981)' : 'drop-shadow(0 0 8px #E2C376)',
                ],
              }}
              transition={{ 
                strokeDashoffset: { duration: 0.3 },
                filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-4xl font-bold ${isDark ? 'text-[#10B981]' : 'text-[#E2C376]'}`}>
                {Math.round(progress)}%
              </div>
              <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                {formatTime(elapsed)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <motion.div
            key={currentEngine}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className={`text-5xl ${isDark ? 'text-[#10B981]' : 'text-[#E2C376]'}`}>
              {engines[currentEngine]?.icon}
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
              {engines[currentEngine]?.name}
            </h3>
            <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
              {engines[currentEngine]?.description}
            </p>
          </motion.div>

          {/* Playbook Flavor Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-lg ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border`}
          >
            <p className={`text-sm italic ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              "Every great story starts with a single moment. We're crafting yours now."
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Tier 1 Concept C: Minimal Timeline
function Tier1Timeline({ isDark, progress, currentEngine, elapsed, engines }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Timeline Banner */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#10B981]/20' : 'bg-white/95 backdrop-blur-sm border-b border-black/20'} p-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                Generating Story Bible
              </h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                {engines[currentEngine]?.name} • {formatTime(elapsed)}
              </p>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-[#10B981]' : 'text-black'}`}>
              {Math.round(progress)}%
            </div>
          </div>
          
          {/* Progress Track */}
          <div className="relative">
            <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
              <motion.div
                className={`h-full rounded-full ${isDark ? 'bg-[#10B981]' : 'bg-black'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Milestones */}
            <div className="absolute top-0 left-0 right-0 flex justify-between mt-3">
              {engines.map((engine: any, index: number) => {
                const isComplete = index < currentEngine
                const isActive = index === currentEngine
                return (
                  <div key={engine.id} className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      isComplete
                        ? isDark ? 'bg-[#10B981]' : 'bg-black'
                        : isActive
                        ? isDark ? 'bg-[#10B981] ring-2 ring-[#10B981]/50' : 'bg-black ring-2 ring-black/50'
                        : isDark ? 'bg-white/20' : 'bg-black/20'
                    }`} />
                    <div className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      {engine.icon}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dimmed Content Area */}
      <div className="flex-1 p-8 opacity-40 pointer-events-none">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className={`h-8 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} w-3/4`} />
          <div className={`h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} w-1/2`} />
          <div className="space-y-2 mt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Tier 2: Page-Level Loaders
function Tier2PageLoader({ pageType, variant, isLoaded, isDark }: any) {
  if (isLoaded) {
    return <Tier2LoadedState pageType={pageType} isDark={isDark} />
  }

  if (variant === 'skeleton') {
    return <Tier2Skeleton pageType={pageType} isDark={isDark} />
  }

  return <Tier2Minimal pageType={pageType} isDark={isDark} />
}

function Tier2Skeleton({ pageType, isDark }: any) {
  if (pageType === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Hero Skeleton */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <div className={`h-8 rounded w-1/3 mb-4 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
          <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <div className={`h-6 rounded w-2/3 mb-3 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-full mb-2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pageType === 'projects') {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex items-center gap-4`}>
            <div className={`w-16 h-16 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            <div className="flex-1 space-y-2">
              <div className={`h-5 rounded w-1/3 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Story Bible
  return (
    <div className="flex gap-6">
      {/* Sidebar Skeleton */}
      <div className={`w-64 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-8 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
        ))}
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 space-y-4">
        <div className={`h-10 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
        ))}
      </div>
    </div>
  )
}

function Tier2Minimal({ pageType, isDark }: any) {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto"
        >
          <div className={`w-full h-full border-4 ${isDark ? 'border-[#10B981] border-t-transparent' : 'border-black border-t-transparent'} rounded-full`} />
        </motion.div>
        <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>
          Loading {pageType === 'dashboard' ? 'dashboard' : pageType === 'projects' ? 'projects' : 'story bible'}...
        </div>
      </div>
    </div>
  )
}

function Tier2LoadedState({ pageType, isDark }: any) {
  if (pageType === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-[#10B981]/10 border-[#10B981]/30' : 'bg-black/10 border-black/20'} border`}>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            Welcome Back
          </h3>
          <p className={`${isDark ? 'text-white/70' : 'text-black/70'}`}>
            Continue working on your latest project
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Project Alpha', 'Project Beta', 'Project Gamma'].map((name, i) => (
            <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <div className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{name}</div>
              <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Last edited 2 hours ago</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pageType === 'projects') {
    return (
      <div className="space-y-4">
        {['Project Alpha', 'Project Beta', 'Project Gamma'].map((name, i) => (
          <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex items-center gap-4`}>
            <div className={`w-16 h-16 rounded ${isDark ? 'bg-[#10B981]/20' : 'bg-black/20'} flex items-center justify-center`}>
              <span className="text-2xl">📚</span>
            </div>
            <div className="flex-1">
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{name}</div>
              <div className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>Last edited 2 hours ago</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <div className={`w-64 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
        <div className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Sections</div>
        {['Premise', 'Characters', 'Narrative', 'World'].map((section, i) => (
          <div key={i} className={`py-2 ${isDark ? 'text-white/70' : 'text-black/70'}`}>{section}</div>
        ))}
      </div>
      <div className="flex-1">
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Story Bible</h2>
        <div className={`space-y-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
          <p>Your story bible content appears here...</p>
        </div>
      </div>
    </div>
  )
}

// Tier 3: Inline/Button Loaders
function Tier3InlineLoaders({ buttonVariant, isLoading, progress, onToggle, isDark }: any) {
  return (
    <div className="space-y-8">
      {/* Primary Button Loaders */}
      <div className="space-y-4">
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
          Primary Action Buttons
        </h4>
        <div className="flex gap-4 flex-wrap">
          {buttonVariant === 'spinner' ? (
            <button
              onClick={onToggle}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isLoading
                  ? isDark
                    ? 'bg-[#10B981]/50 text-white cursor-wait'
                    : 'bg-black/50 text-white cursor-wait'
                  : isDark
                  ? 'bg-[#10B981] text-black hover:bg-[#059669]'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              )}
              {isLoading ? 'Generating...' : 'Generate Story Bible'}
            </button>
          ) : (
            <button
              onClick={onToggle}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all relative overflow-hidden ${
                isLoading
                  ? isDark
                    ? 'bg-[#10B981]/50 text-white cursor-wait'
                    : 'bg-black/50 text-white cursor-wait'
                  : isDark
                  ? 'bg-[#10B981] text-black hover:bg-[#059669]'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <span className="relative z-10">
                {isLoading ? `Generating... ${Math.round(progress)}%` : 'Generate Story Bible'}
              </span>
              {isLoading && (
                <motion.div
                  className={`absolute inset-0 ${isDark ? 'bg-[#059669]' : 'bg-gray-700'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* List Row Placeholders */}
      <div className="space-y-4">
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
          List Row Placeholders
        </h4>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-1/3 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
                <div className={`h-3 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoadingExamples({ theme }: LoadingExamplesProps) {
  const { theme: contextTheme } = useTheme()
  const isDark = contextTheme === 'dark' || theme === 'dark'

  // Tier 1 state
  const [tier1Concept, setTier1Concept] = useState<'console' | 'forge' | 'timeline'>('forge')
  const [tier1Progress, setTier1Progress] = useState(45)
  const [tier1CurrentEngine, setTier1CurrentEngine] = useState(2)
  const [tier1Elapsed, setTier1Elapsed] = useState(0)

  // Tier 2 state
  const [tier2PageType, setTier2PageType] = useState<'dashboard' | 'projects' | 'storybible'>('dashboard')
  const [tier2Variant, setTier2Variant] = useState<'skeleton' | 'minimal'>('skeleton')
  const [tier2Loaded, setTier2Loaded] = useState(false)

  // Tier 3 state
  const [tier3ButtonVariant, setTier3ButtonVariant] = useState<'spinner' | 'progress'>('progress')
  const [tier3ButtonLoading, setTier3ButtonLoading] = useState(false)
  const [tier3ButtonProgress, setTier3ButtonProgress] = useState(0)

  // Simulate progress for Tier 1
  useEffect(() => {
    const interval = setInterval(() => {
      setTier1Progress(prev => {
        if (prev >= 100) return 0
        return prev + 0.5
      })
      setTier1Elapsed(prev => prev + 1)
      setTier1CurrentEngine(prev => {
        if (tier1Progress >= 80) return Math.min(4, prev + 1)
        if (tier1Progress >= 60) return Math.min(3, prev)
        if (tier1Progress >= 40) return Math.min(2, prev)
        return prev
      })
    }, 100)
    return () => clearInterval(interval)
  }, [tier1Progress])

  // Simulate button progress for Tier 3
  useEffect(() => {
    if (tier3ButtonLoading && tier3ButtonVariant === 'progress') {
      const interval = setInterval(() => {
        setTier3ButtonProgress(prev => {
          if (prev >= 100) {
            setTier3ButtonLoading(false)
            return 0
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [tier3ButtonLoading, tier3ButtonVariant])

  return (
    <div className={`w-full space-y-12 p-8 ${isDark ? 'dark-bg-primary' : 'light-bg-primary'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'dark-text-primary' : 'light-text-primary'}`}>
          Loading Systems Preview
        </h2>
        <p className={`${isDark ? 'dark-text-secondary' : 'light-text-secondary'}`}>
          Compare different loading experiences across all tiers
        </p>
      </div>

      {/* Tier 1: Cinematic Engine Loads */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-2xl font-semibold ${isDark ? 'dark-text-primary' : 'light-text-primary'}`}>
            Tier 1: Cinematic Engine Loads
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTier1Concept('console')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tier1Concept === 'console'
                  ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
              }`}
            >
              Production Console
            </button>
            <button
              onClick={() => setTier1Concept('forge')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tier1Concept === 'forge'
                  ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
              }`}
            >
              Story Forge
            </button>
            <button
              onClick={() => setTier1Concept('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tier1Concept === 'timeline'
                  ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
              }`}
            >
              Minimal Timeline
            </button>
          </div>
        </div>

        <div className={`rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-[#0a0a0a]' : 'border-black/20 bg-white'} p-8 min-h-[500px] relative overflow-hidden`}>
          <AnimatePresence mode="wait">
            {tier1Concept === 'console' && (
              <Tier1Console
                key="console"
                isDark={isDark}
                progress={tier1Progress}
                currentEngine={tier1CurrentEngine}
                elapsed={tier1Elapsed}
                engines={SAMPLE_ENGINES}
                steps={SAMPLE_STEPS}
              />
            )}
            {tier1Concept === 'forge' && (
              <Tier1Forge
                key="forge"
                isDark={isDark}
                progress={tier1Progress}
                currentEngine={tier1CurrentEngine}
                elapsed={tier1Elapsed}
                engines={SAMPLE_ENGINES}
              />
            )}
            {tier1Concept === 'timeline' && (
              <Tier1Timeline
                key="timeline"
                isDark={isDark}
                progress={tier1Progress}
                currentEngine={tier1CurrentEngine}
                elapsed={tier1Elapsed}
                engines={SAMPLE_ENGINES}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Tier 2: Page-Level Loaders */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-2xl font-semibold ${isDark ? 'dark-text-primary' : 'light-text-primary'}`}>
            Tier 2: Page-Level Loaders
          </h3>
          <div className="flex gap-4">
            <select
              value={tier2PageType}
              onChange={(e) => {
                setTier2PageType(e.target.value as any)
                setTier2Loaded(false)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-black/10 text-black border-black/20'} border`}
            >
              <option value="dashboard">Dashboard</option>
              <option value="projects">Projects</option>
              <option value="storybible">Story Bible</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setTier2Variant('skeleton')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tier2Variant === 'skeleton'
                    ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                    : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
                }`}
              >
                Skeleton
              </button>
              <button
                onClick={() => setTier2Variant('minimal')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tier2Variant === 'minimal'
                    ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                    : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
                }`}
              >
                Minimal
              </button>
            </div>
            <button
              onClick={() => setTier2Loaded(!tier2Loaded)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
              }`}
            >
              {tier2Loaded ? 'Show Loading' : 'Show Loaded'}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-[#0a0a0a]' : 'border-black/20 bg-white'} p-8 min-h-[400px]`}>
          <Tier2PageLoader
            pageType={tier2PageType}
            variant={tier2Variant}
            isLoaded={tier2Loaded}
            isDark={isDark}
          />
        </div>
      </section>

      {/* Tier 3: Inline/Button Loaders */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`text-2xl font-semibold ${isDark ? 'dark-text-primary' : 'light-text-primary'}`}>
            Tier 3: Inline & Button Loaders
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTier3ButtonVariant('spinner')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tier3ButtonVariant === 'spinner'
                  ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
              }`}
            >
              Spinner Icon
            </button>
            <button
              onClick={() => setTier3ButtonVariant('progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tier3ButtonVariant === 'progress'
                  ? isDark ? 'bg-[#10B981] text-black' : 'bg-black text-white'
                  : isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'
              }`}
            >
              Progress Pill
            </button>
          </div>
        </div>

        <div className={`rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-[#0a0a0a]' : 'border-black/20 bg-white'} p-8`}>
          <Tier3InlineLoaders
            buttonVariant={tier3ButtonVariant}
            isLoading={tier3ButtonLoading}
            progress={tier3ButtonProgress}
            onToggle={() => setTier3ButtonLoading(!tier3ButtonLoading)}
            isDark={isDark}
          />
        </div>
      </section>
    </div>
  )
}
