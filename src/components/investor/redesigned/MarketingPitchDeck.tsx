'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { MarketingSection } from '@/types/investor-materials'

interface MarketingPitchDeckProps {
  marketing: MarketingSection
  seriesTitle: string
  posterImageUrl?: string
  teaserVideoUrl?: string
}

interface Slide {
  id: string
  title: string
  subtitle?: string
  content: React.ReactNode
  background?: string
  backgroundImage?: string
}

export default function MarketingPitchDeck({
  marketing,
  seriesTitle,
  posterImageUrl,
  teaserVideoUrl
}: MarketingPitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showPresenterNotes, setShowPresenterNotes] = useState(false)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        navigateSlide('next')
      }, 8000) // 8 seconds per slide
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [autoPlay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        navigateSlide('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateSlide('prev')
      } else if (e.key === 'Escape') {
        setShowOverview(false)
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault()
        setShowOverview(!showOverview)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide])

  const navigateSlide = (direction: 'next' | 'prev') => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentSlide(prev => (prev + 1) % slides.length)
      } else {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
      }
      setIsTransitioning(false)
    }, 500)
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
      setShowOverview(false)
    }
  }

  const exportToPDF = () => {
    // Simple PDF export simulation
    window.print()
  }

  // Generate slides based on marketing data
  const slides: Slide[] = [
    // Slide 1: Cover
    {
      id: 'cover',
      title: seriesTitle,
      subtitle: 'Marketing Strategy',
      backgroundImage: posterImageUrl,
      content: (
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl">
              {seriesTitle}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 font-light">
              Marketing Strategy
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-white/60 text-lg"
          >
            Presented by AI Assistant
          </motion.div>
        </div>
      )
    },

    // Slide 2: Target Audience
    {
      id: 'audience',
      title: 'Target Audience',
      subtitle: 'Who We\'re Reaching',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Audience */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-[#10B981]">Primary Audience</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-white text-lg">{marketing.targetAudience.primary}</p>
              </div>

              {/* Animated demographic icons */}
              <div className="flex justify-center space-x-8">
                {['👥', '🎓', '📱', '🎬'].map((icon, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8 + idx * 0.2, type: 'spring' }}
                    className="text-4xl"
                  >
                    {icon}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Secondary Audience */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-[#10B981]">Secondary Audience</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-white text-lg">{marketing.targetAudience.secondary}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },

    // Slide 3: Key Selling Points
    {
      id: 'selling-points',
      title: 'Key Selling Points',
      subtitle: 'What Makes This Special',
      content: (
        <div className="space-y-6">
          {marketing.keySellingPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.3 }}
              className="flex items-center space-x-6 bg-white/5 backdrop-blur-sm rounded-lg p-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.3 + 0.5, type: 'spring' }}
                className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center text-2xl"
              >
                ✓
              </motion.div>
              <p className="text-white text-xl flex-1">{point}</p>
            </motion.div>
          ))}
        </div>
      )
    },

    // Slide 4: Platform Strategy
    {
      id: 'platforms',
      title: 'Platform Strategy',
      subtitle: 'Multi-Channel Approach',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {marketing.socialMediaStrategy.platforms.map((platform, idx) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="text-center space-y-3"
              >
                <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center text-3xl mx-auto">
                  {platform === 'TikTok' && '🎵'}
                  {platform === 'Instagram' && '📸'}
                  {platform === 'YouTube' && '📺'}
                  {platform === 'Twitter' && '🐦'}
                  {!['TikTok', 'Instagram', 'YouTube', 'Twitter'].includes(platform) && '📱'}
                </div>
                <p className="text-white font-semibold">{platform}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
          >
            <h4 className="text-lg font-semibold text-[#10B981] mb-3">Content Approach</h4>
            <p className="text-white">{marketing.socialMediaStrategy.contentApproach}</p>
          </motion.div>
        </div>
      )
    },

    // Slide 5: Visual Identity
    {
      id: 'visual-identity',
      title: 'Visual Identity',
      subtitle: 'Brand Aesthetics',
      content: (
        <div className="space-y-8">
          {/* Color Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-[#10B981]">Color Palette</h3>
            <div className="flex space-x-4">
              {['#10B981', '#0A0A0A', '#121212', '#1A1A1A', '#FFFFFF'].map((color, idx) => (
                <motion.div
                  key={color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                  className="w-16 h-16 rounded-lg border-2 border-white/20 flex items-center justify-center text-xs font-mono"
                  style={{ backgroundColor: color, color: color === '#FFFFFF' ? '#000' : '#FFF' }}
                >
                  {color}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Poster Showcase */}
          {marketing.visualAssets?.seriesPoster?.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-[#10B981]">Series Poster</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                <img
                  src={marketing.visualAssets.seriesPoster.imageUrl}
                  alt="Series Poster"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          )}

          {/* Teaser Video */}
          {teaserVideoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-[#10B981]">Teaser Trailer</h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
                <video
                  src={teaserVideoUrl}
                  controls
                  className="w-full rounded-lg"
                  poster={marketing.visualAssets?.seriesTeaser?.imageUrl}
                />
              </div>
            </motion.div>
          )}
        </div>
      )
    },

    // Slide 6: Campaign Timeline
    {
      id: 'timeline',
      title: 'Campaign Timeline',
      subtitle: 'Launch Strategy',
      content: (
        <div className="space-y-8">
          {/* Timeline visualization */}
          <div className="relative">
            {marketing.arcLaunchStrategy && (
              <div className="space-y-6">
                {/* Pre-Launch */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-6"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-blue-400">Pre-Launch Phase</h4>
                    <ul className="text-white/80 space-y-1 mt-2">
                      {marketing.arcLaunchStrategy.preLaunch.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Launch */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-6"
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-green-400">Launch Phase</h4>
                    <ul className="text-white/80 space-y-1 mt-2">
                      {marketing.arcLaunchStrategy.launch.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Post-Launch */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center space-x-6"
                >
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-purple-400">Post-Launch Phase</h4>
                    <ul className="text-white/80 space-y-1 mt-2">
                      {marketing.arcLaunchStrategy.postLaunch.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-sm">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Timeline line */}
            <div className="absolute left-2 top-6 bottom-6 w-0.5 bg-[#10B981]/50"></div>
          </div>
        </div>
      )
    },

    // Slide 7: Success Metrics
    {
      id: 'metrics',
      title: 'Success Metrics',
      subtitle: 'Projected Impact',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Animated counters */}
            {[
              { label: 'Target Reach', value: '500K+', icon: '👥' },
              { label: 'Engagement Rate', value: '15%', icon: '📈' },
              { label: 'Platform Growth', value: '200%', icon: '🚀' }
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2, type: 'spring' }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center"
              >
                <div className="text-4xl mb-4">{metric.icon}</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.2 + 0.5, type: 'spring' }}
                  className="text-3xl font-bold text-[#10B981] mb-2"
                >
                  {metric.value}
                </motion.div>
                <p className="text-white/80">{metric.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
          >
            <h4 className="text-lg font-semibold text-[#10B981] mb-3">Key Performance Indicators</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60">Views</p>
                <p className="text-white font-semibold">1M+</p>
              </div>
              <div>
                <p className="text-white/60">Shares</p>
                <p className="text-white font-semibold">50K+</p>
              </div>
              <div>
                <p className="text-white/60">Followers</p>
                <p className="text-white font-semibold">100K+</p>
              </div>
              <div>
                <p className="text-white/60">Revenue</p>
                <p className="text-white font-semibold">$250K+</p>
              </div>
            </div>
          </motion.div>
        </div>
      )
    }
  ]

  const currentSlideData = slides[currentSlide]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background */}
      {currentSlideData.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${currentSlideData.backgroundImage})` }}
        />
      )}

      {/* Header Controls */}
      <div className="relative z-50 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm transition-colors"
          >
            {showOverview ? 'Hide Overview' : 'Slide Overview'} (O)
          </button>

          <div className="text-sm text-white/70">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="rounded"
            />
            <span>Auto Play</span>
          </label>

          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] rounded-lg text-sm transition-colors"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl w-full"
          >
            {/* Slide Header */}
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
              >
                {currentSlideData.title}
              </motion.h2>
              {currentSlideData.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-[#10B981] font-light"
                >
                  {currentSlideData.subtitle}
                </motion.p>
              )}
            </div>

            {/* Slide Content */}
            <div className="px-8">
              {currentSlideData.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="relative z-50 flex items-center justify-center space-x-8 p-6">
        <button
          onClick={() => navigateSlide('prev')}
          disabled={currentSlide === 0 || isTransitioning}
          className="px-6 py-3 bg-[#10B981]/20 hover:bg-[#10B981]/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
        >
          ← Previous
        </button>

        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === idx ? 'bg-[#10B981]' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigateSlide('next')}
          disabled={currentSlide === slides.length - 1 || isTransitioning}
          className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
        >
          Next →
        </button>
      </div>

      {/* Slide Overview Modal */}
      <AnimatePresence>
        {showOverview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOverview(false)}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#121212] rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Slide Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {slides.map((slide, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`aspect-video rounded-lg border-2 p-3 text-left transition-colors ${
                          currentSlide === idx
                            ? 'border-[#10B981] bg-[#10B981]/20'
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                        }`}
                      >
                        <div className="text-sm font-semibold text-white mb-1">
                          {idx + 1}. {slide.title}
                        </div>
                        {slide.subtitle && (
                          <div className="text-xs text-white/60">{slide.subtitle}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Presenter Notes Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPresenterNotes(!showPresenterNotes)}
          className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 backdrop-blur-sm rounded-lg text-sm transition-colors"
        >
          {showPresenterNotes ? 'Hide Notes' : 'Presenter Notes'}
        </button>

        <AnimatePresence>
          {showPresenterNotes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full right-0 mb-2 w-80 bg-[#121212] border border-[#10B981]/20 rounded-lg p-4 text-sm text-white/80"
            >
              <p><strong>Current Slide:</strong> {currentSlideData.title}</p>
              <p className="mt-2">
                <strong>Tips:</strong> {
                  currentSlide === 0 ? 'Pause for dramatic effect on title reveal' :
                  currentSlide === 1 ? 'Emphasize the dual audience strategy' :
                  currentSlide === 2 ? 'Highlight each selling point with enthusiasm' :
                  currentSlide === 3 ? 'Show platform-specific examples' :
                  currentSlide === 4 ? 'Walk through the color palette choices' :
                  currentSlide === 5 ? 'Emphasize the strategic timeline' :
                  'Focus on the impressive projected metrics'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-[#10B981]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}
