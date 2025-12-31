'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import type { MarketingSection } from '@/types/investor-materials'

interface MarketingPitchDeckProps {
  marketing: MarketingSection
  seriesTitle: string
  posterImageUrl?: string
  teaserVideoUrl?: string
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
  const [showPresenterNotes, setShowPresenterNotes] = useState(false)

  // Generate slides
  const slides = [
    {
      id: 'cover',
      title: seriesTitle,
      subtitle: 'Marketing Strategy',
      content: (
        <div className="text-center space-y-8">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl"
          >
            {seriesTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl text-white/90"
          >
            Marketing Strategy
          </motion.p>
        </div>
      ),
      backgroundImage: posterImageUrl
    },
    {
      id: 'audience',
      title: 'Target Audience',
      subtitle: 'Who We\'re Reaching',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-[#e2c376]">Primary</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-white text-lg leading-relaxed">
                {marketing.targetAudience.primary}
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-[#e2c376]">Secondary</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <p className="text-white text-lg leading-relaxed">
                {marketing.targetAudience.secondary}
              </p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 'loglines',
      title: 'Loglines',
      subtitle: 'The Hook',
      content: (
        <div className="space-y-6">
          {marketing.loglines.map((logline, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border-l-4 border-[#e2c376]"
            >
              <p className="text-white text-xl md:text-2xl leading-relaxed italic">
                "{logline}"
              </p>
              <div className="mt-4 text-sm text-white/60">Option {idx + 1}</div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'selling-points',
      title: 'Key Selling Points',
      subtitle: 'What Makes This Special',
      content: (
        <div className="space-y-4">
          {marketing.keySellingPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-lg p-6"
            >
              <div className="w-10 h-10 bg-[#e2c376] rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <p className="text-white text-lg md:text-xl flex-1 leading-relaxed">{point}</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'taglines',
      title: 'Taglines',
      subtitle: 'Memorable One-Liners',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketing.taglines.map((tagline, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-gradient-to-br from-[#e2c376]/20 to-[#e2c376]/10 backdrop-blur-sm rounded-lg p-8 border-2 border-[#e2c376]/30 text-center"
            >
              <p className="text-[#e2c376] text-xl md:text-2xl font-bold leading-relaxed">
                "{tagline}"
              </p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'visual-style',
      title: 'Visual Style',
      subtitle: 'Brand Aesthetics',
      content: (
        <div className="space-y-8">
          {marketing.visualStyle && (
            <>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#e2c376]">Color Palette</h3>
                <p className="text-white text-lg leading-relaxed">
                  {marketing.visualStyle.colorPalette}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#e2c376]">Imagery Themes</h3>
                <p className="text-white text-lg leading-relaxed">
                  {marketing.visualStyle.imageryThemes}
                </p>
              </div>
            </>
          )}
          {posterImageUrl && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#e2c376] mb-4">Series Poster</h3>
              <div className="max-w-md mx-auto">
                <img
                  src={posterImageUrl}
                  alt="Series Poster"
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>
            </div>
          )}
        </div>
      )
    },
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center space-y-3 bg-white/5 backdrop-blur-sm rounded-lg p-6"
              >
                <div className="text-4xl mb-2">
                  {platform === 'TikTok' && '🎵'}
                  {platform === 'Instagram' && '📸'}
                  {platform === 'YouTube' && '📺'}
                  {platform === 'Twitter' && '🐦'}
                  {!['TikTok', 'Instagram', 'YouTube', 'Twitter'].includes(platform) && '📱'}
                </div>
                <p className="text-white font-semibold text-lg">{platform}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="text-lg font-semibold text-[#e2c376] mb-3">Content Approach</h4>
            <p className="text-white text-lg leading-relaxed">
              {marketing.socialMediaStrategy.contentApproach}
            </p>
          </div>
        </div>
      )
    }
  ]

  const navigateSlide = (direction: 'next' | 'prev') => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      } else {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      }
      setIsTransitioning(false)
    }, 300)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        navigateSlide('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateSlide('prev')
      } else if (e.key === 'o' || e.key === 'O') {
        setShowOverview(!showOverview)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide, showOverview])

  const currentSlideData = slides[currentSlide]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background Image */}
      {currentSlideData.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${currentSlideData.backgroundImage})` }}
        />
      )}

      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#e2c376]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOverview(!showOverview)}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#36393f] rounded-lg text-sm"
            >
              {showOverview ? 'Hide' : 'Show'} Overview (O)
            </button>
            <div className="text-sm text-white/70">
              Slide {currentSlide + 1} of {slides.length}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPresenterNotes(!showPresenterNotes)}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#36393f] rounded-lg text-sm"
            >
              {showPresenterNotes ? 'Hide' : 'Show'} Notes
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#e2c376] hover:bg-[#d4b46a] text-black rounded-lg text-sm font-medium"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-40 flex items-center justify-center min-h-[calc(100vh-120px)] p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl w-full"
          >
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {currentSlideData.title}
              </h2>
              {currentSlideData.subtitle && (
                <p className="text-lg md:text-xl lg:text-2xl text-[#e2c376] font-light">
                  {currentSlideData.subtitle}
                </p>
              )}
            </div>
            <div className="px-4 md:px-8">{currentSlideData.content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8">
        <button
          onClick={() => navigateSlide('prev')}
          disabled={currentSlide === 0 || isTransitioning}
          className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#36393f] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          ← Previous
        </button>
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === idx ? 'bg-[#e2c376]' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => navigateSlide('next')}
          disabled={currentSlide === slides.length - 1 || isTransitioning}
          className="px-6 py-3 bg-[#e2c376] hover:bg-[#d4b46a] disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-lg transition-colors font-medium"
        >
          Next →
        </button>
      </div>

      {/* Slide Overview Modal */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOverview(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <h3 className="text-xl font-bold mb-6">Slide Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx)
                      setShowOverview(false)
                    }}
                    className={`aspect-video rounded-lg border-2 p-3 text-left transition-colors ${
                      currentSlide === idx
                        ? 'border-[#e2c376] bg-[#e2c376]/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">
                      {idx + 1}. {slide.title}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presenter Notes */}
      {showPresenterNotes && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#121212] border border-[#e2c376]/20 rounded-lg p-4 max-w-xs text-sm text-white/80">
          <p className="font-semibold mb-2">Presenter Notes:</p>
          <p>
            {currentSlide === 0 && 'Pause for dramatic effect on title reveal'}
            {currentSlide === 1 && 'Emphasize the dual audience strategy'}
            {currentSlide === 2 && 'Highlight each logline with enthusiasm'}
            {currentSlide === 3 && 'Walk through each selling point'}
            {currentSlide === 4 && 'Show tagline mockups'}
            {currentSlide === 5 && 'Walk through visual style choices'}
            {currentSlide === 6 && 'Emphasize multi-platform approach'}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-[#e2c376]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}





