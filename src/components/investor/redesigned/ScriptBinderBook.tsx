'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { PilotSection, StorySection } from '@/types/investor-materials'

interface ScriptBinderBookProps {
  pilot: PilotSection
  story: StorySection
  storyBibleId: string
  linkId?: string
  episodeScripts?: Record<number, PilotSection>
}

interface PageData {
  type: 'cover' | 'title' | 'scene' | 'divider'
  episodeNumber?: number
  episodeTitle?: string
  sceneNumber?: number
  sceneHeading?: string
  content?: string
  pageNumber?: number
}

export default function ScriptBinderBook({
  pilot,
  story,
  storyBibleId,
  linkId,
  episodeScripts = {}
}: ScriptBinderBookProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isTurning, setIsTurning] = useState(false)
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set())
  const [actorsView, setActorsView] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)

  // Generate all pages for the binder
  const generatePages = (): PageData[] => {
    const pages: PageData[] = []

    // Cover page
    pages.push({
      type: 'cover',
      content: story.episodes[0]?.title || pilot.episodeTitle
    })

    // Title page
    pages.push({
      type: 'title',
      content: `${story.episodes[0]?.title || pilot.episodeTitle}\n\nWritten by AI Assistant\n\nFADE IN:`
    })

    // Episode pages
    story.episodes.forEach((episode, episodeIndex) => {
      const episodeNum = episode.episodeNumber

      // Episode divider
      pages.push({
        type: 'divider',
        episodeNumber: episodeNum,
        episodeTitle: episode.title,
        content: `EPISODE ${episodeNum}\n\n${episode.title}\n\n${episode.summary || ''}`
      })

      // Get script for this episode
      const script = episodeScripts[episodeNum] || (episodeNum === pilot.episodeNumber ? pilot : null)

      if (script && script.fullScript?.pages) {
        script.fullScript.pages.forEach((page, pageIndex) => {
          pages.push({
            type: 'scene',
            episodeNumber: episodeNum,
            episodeTitle: episode.title,
            sceneNumber: page.sceneNumber,
            sceneHeading: page.sceneHeading,
            content: page.content,
            pageNumber: pageIndex + 1
          })
        })
      } else {
        // Fallback: basic episode content
        pages.push({
          type: 'scene',
          episodeNumber: episodeNum,
          episodeTitle: episode.title,
          content: `${episode.summary}\n\n${episode.episodeRundown || ''}`
        })
      }
    })

    return pages
  }

  const pages = generatePages()
  const totalPages = pages.length

  // Audio effects
  const playPageTurnSound = () => {
    if (!soundEnabled) return
    // Create a simple page turn sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Fallback: no sound
    }
  }

  const turnPage = (direction: 'next' | 'prev') => {
    if (isTurning) return

    setIsTurning(true)
    playPageTurnSound()

    setTimeout(() => {
      if (direction === 'next' && currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1)
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(prev => prev - 1)
      }
      setIsTurning(false)
    }, 300)
  }

  const toggleBookmark = (pageIndex: number) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(pageIndex)) {
        newBookmarks.delete(pageIndex)
      } else {
        newBookmarks.add(pageIndex)
      }
      return newBookmarks
    })
  }

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentPage(pageIndex)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        turnPage('next')
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        turnPage('prev')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, isTurning])

  const renderPageContent = (page: PageData, pageIndex: number) => {
    const isBookmarked = bookmarks.has(pageIndex)

    switch (page.type) {
      case 'cover':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="text-4xl md:text-6xl font-black text-[#10B981] tracking-wider">
                SCREENPLAY
              </div>
              <div className="text-2xl md:text-4xl font-bold text-white">
                {page.content}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-widest">
                Pilot Episode
              </div>
            </motion.div>
          </div>
        )

      case 'title':
        return (
          <div className="flex flex-col justify-center h-full p-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {story.episodes[0]?.title || pilot.episodeTitle}
              </div>
              <div className="text-lg text-white/70">
                Written by AI Assistant
              </div>
              <div className="text-xl font-bold text-[#10B981] mt-8">
                FADE IN:
              </div>
            </motion.div>
          </div>
        )

      case 'divider':
        return (
          <div className="flex flex-col justify-center h-full p-12 bg-gradient-to-br from-[#10B981]/10 to-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="text-2xl md:text-4xl font-black text-[#10B981] tracking-wider">
                EPISODE {page.episodeNumber}
              </div>
              <div className="text-xl md:text-3xl font-bold text-white">
                {page.episodeTitle}
              </div>
              <div className="text-white/80 leading-relaxed max-w-2xl mx-auto">
                {page.content?.split('\n').slice(2).join('\n')}
              </div>
            </motion.div>
          </div>
        )

      case 'scene':
        return (
          <div className="h-full screenplay-page">
            {/* Page header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20">
              <div className="text-sm text-white/60">
                {page.episodeTitle} - Scene {page.sceneNumber}
              </div>
              <div className="text-sm text-white/60">
                Page {page.pageNumber || pageIndex}
              </div>
            </div>

            {/* Scene heading */}
            {page.sceneHeading && (
              <div className="mb-6 text-center">
                <div className="inline-block bg-[#10B981]/20 px-4 py-2 rounded text-[#10B981] font-bold text-sm uppercase tracking-wider">
                  {page.sceneHeading}
                </div>
              </div>
            )}

            {/* Script content with screenplay formatting */}
            <div className="screenplay-content leading-relaxed">
              {page.content?.split('\n').map((line, idx) => {
                // Parse screenplay format
                if (line.trim().startsWith('INT.') || line.trim().startsWith('EXT.')) {
                  return (
                    <div key={idx} className="mb-4 text-center">
                      <span className="text-[#10B981] font-bold uppercase tracking-wider">
                        {line.trim()}
                      </span>
                    </div>
                  )
                }

                if (line.trim().match(/^[A-Z][A-Z\s]+$/) && line.trim().length > 0 && !line.includes('(')) {
                  // Character name
                  const characterName = line.trim()
                  const isSelected = selectedCharacter === characterName

                  return (
                    <div key={idx} className="mb-2 text-center">
                      <span
                        className={`font-bold uppercase cursor-pointer transition-colors ${
                          isSelected ? 'text-[#10B981] bg-[#10B981]/20 px-2 py-1 rounded' :
                          actorsView ? 'text-[#10B981] hover:text-white' : 'text-white'
                        }`}
                        onClick={() => setSelectedCharacter(isSelected ? null : characterName)}
                      >
                        {characterName}
                      </span>
                    </div>
                  )
                }

                if (line.trim().startsWith('(') && line.trim().endsWith(')')) {
                  // Parenthetical
                  return (
                    <div key={idx} className="mb-2 text-center italic text-white/80">
                      {line.trim()}
                    </div>
                  )
                }

                if (line.trim().length > 0) {
                  // Dialogue
                  return (
                    <div key={idx} className="mb-4 max-w-md mx-auto text-center">
                      <span className="text-white leading-relaxed">
                        {line.trim()}
                      </span>
                    </div>
                  )
                }

                return <div key={idx} className="mb-2">&nbsp;</div>
              })}
            </div>
          </div>
        )

      default:
        return <div>Unknown page type</div>
    }
  }

  if (!isOpen) {
    // Closed binder view
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ rotateY: -15, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="relative w-80 h-96 mx-auto cursor-pointer perspective-1000"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Binder spine */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-2xl"
                 style={{
                   transform: 'translateZ(-10px)',
                   boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                 }}>
              {/* Brass rings */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-600 rounded-full shadow-inner"></div>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 translate-y-8 w-2 h-2 bg-yellow-600 rounded-full shadow-inner"></div>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 -translate-y-8 w-2 h-2 bg-yellow-600 rounded-full shadow-inner"></div>

              {/* Cover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg border-l-8 border-yellow-600"
                   style={{
                     transform: 'translateZ(5px) rotateY(-2deg)',
                     background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)'
                   }}>
                {/* Title embossed */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-black text-xl tracking-wider transform -rotate-90"
                       style={{
                         textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(16, 185, 129, 0.3)',
                         fontSize: '1.5rem'
                       }}>
                    SCREENPLAY
                  </div>
                </div>

                {/* Series title */}
                <div className="absolute bottom-8 left-8 right-8 text-white font-bold text-sm text-center">
                  {story.episodes[0]?.title || pilot.episodeTitle}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Screenplay Binder</h3>
            <p className="text-white/70 mb-4">Click to open the professional screenplay</p>
            <p className="text-sm text-white/50">Use arrow keys to navigate • Space for next page</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Open binder view
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg transition-colors"
            >
              Close Binder
            </button>
            <div className="text-sm text-white/70">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actorsView}
                onChange={(e) => setActorsView(e.target.checked)}
                className="rounded"
              />
              Actor's View
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded"
              />
              Sound Effects
            </label>

            <button
              onClick={() => toggleBookmark(currentPage)}
              className={`px-3 py-1 rounded text-sm ${
                bookmarks.has(currentPage)
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {bookmarks.has(currentPage) ? '★' : '☆'} Bookmark
            </button>
          </div>
        </div>
      </div>

      {/* Main Binder Layout */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="relative perspective-1000 w-full max-w-6xl">

          {/* Left Side - Table of Contents / Bookmarks */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute left-0 top-0 w-64 h-96 bg-[#121212] border border-[#10B981]/20 rounded-lg p-4 overflow-y-auto"
          >
            <h4 className="font-bold text-[#10B981] mb-4">Contents</h4>
            <div className="space-y-2">
              {pages.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => goToPage(idx)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    currentPage === idx
                      ? 'bg-[#10B981] text-black'
                      : 'hover:bg-white/10 text-white/70'
                  } ${bookmarks.has(idx) ? 'border-l-4 border-yellow-500' : ''}`}
                >
                  {page.type === 'cover' && 'Cover'}
                  {page.type === 'title' && 'Title Page'}
                  {page.type === 'divider' && `Episode ${page.episodeNumber}`}
                  {page.type === 'scene' && `Scene ${page.sceneNumber || idx}`}
                </button>
              ))}
            </div>

            {bookmarks.size > 0 && (
              <>
                <h4 className="font-bold text-[#10B981] mt-6 mb-4">Bookmarks</h4>
                <div className="space-y-2">
                  {Array.from(bookmarks).map(idx => (
                    <button
                      key={idx}
                      onClick={() => goToPage(idx)}
                      className="w-full text-left px-3 py-2 rounded text-sm bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    >
                      Page {idx + 1}: {pages[idx]?.episodeTitle || pages[idx]?.sceneHeading || 'Scene'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Center - Main Binder */}
          <div className="mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-96 h-96"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Binder Spine */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-2xl"
                style={{
                  transform: 'translateZ(-5px)',
                  width: '20px',
                  left: '-10px'
                }}
              />

              {/* Binder Rings */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-full flex flex-col justify-around items-center"
                   style={{ transform: 'translateZ(10px)' }}>
                <div className="w-3 h-3 bg-yellow-600 rounded-full shadow-inner"></div>
                <div className="w-3 h-3 bg-yellow-600 rounded-full shadow-inner"></div>
                <div className="w-3 h-3 bg-yellow-600 rounded-full shadow-inner"></div>
              </div>

              {/* Page */}
              <motion.div
                className="absolute inset-0 bg-[#FAF9F6] rounded-lg shadow-lg overflow-hidden"
                style={{
                  transform: 'translateZ(5px)',
                  background: 'linear-gradient(135deg, #FAF9F6 0%, #F5F3F0 100%)',
                  border: '1px solid #E5E3E0'
                }}
                animate={{
                  rotateY: isTurning ? -15 : 0,
                  scale: isTurning ? 0.95 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Page texture */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />

                {/* Page content */}
                <div className="h-full p-8 text-black overflow-y-auto screenplay-container">
                  {renderPageContent(pages[currentPage], currentPage)}
                </div>

                {/* Page number */}
                <div className="absolute bottom-4 right-6 text-sm text-gray-500 font-mono">
                  {currentPage + 1}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Navigation */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute right-0 top-0 w-64 flex flex-col gap-4"
          >
            <button
              onClick={() => turnPage('prev')}
              disabled={currentPage === 0 || isTurning}
              className="w-full px-6 py-4 bg-[#10B981]/20 hover:bg-[#10B981]/30 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
            >
              ← Previous
            </button>

            <button
              onClick={() => turnPage('next')}
              disabled={currentPage === totalPages - 1 || isTurning}
              className="w-full px-6 py-4 bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
            >
              Next →
            </button>

            <div className="text-center text-sm text-white/60">
              Use ← → arrow keys or click buttons
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for screenplay formatting */}
      <style jsx>{`
        .screenplay-page {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
        }

        .screenplay-content {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #000;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        @media print {
          .screenplay-container {
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
            color: black !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
