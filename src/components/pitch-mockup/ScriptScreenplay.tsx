'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import type { PilotSection, StorySection } from '@/types/investor-materials'

interface ScriptScreenplayProps {
  pilot: PilotSection
  story: StorySection
  episodeScripts?: Record<number, PilotSection>
}

export default function ScriptScreenplay({
  pilot,
  story,
  episodeScripts = {}
}: ScriptScreenplayProps) {
  const [selectedEpisode, setSelectedEpisode] = useState(pilot.episodeNumber)
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const currentScript = episodeScripts[selectedEpisode] || pilot
  const scriptLines = currentScript.fullScript.split('\n')

  // Parse screenplay elements
  const parseScript = () => {
    const elements: Array<{
      type: 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition'
      content: string
      character?: string
    }> = []

    scriptLines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) {
        elements.push({ type: 'action', content: '' })
        return
      }

      // Scene heading (INT./EXT.)
      if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.)/i)) {
        elements.push({ type: 'scene-heading', content: trimmed })
      }
      // Transition (FADE IN, CUT TO, etc.)
      else if (trimmed.match(/^(FADE|CUT|DISSOLVE|SMASH)/i)) {
        elements.push({ type: 'transition', content: trimmed })
      }
      // Character name (all caps, centered)
      else if (trimmed.match(/^[A-Z][A-Z\s]+$/) && trimmed.length > 1 && !trimmed.includes('(')) {
        elements.push({ type: 'character', content: trimmed, character: trimmed })
      }
      // Parenthetical (wrapped in parentheses)
      else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        elements.push({ type: 'parenthetical', content: trimmed })
      }
      // Dialogue (everything else after character name)
      else if (elements.length > 0 && elements[elements.length - 1].type === 'character') {
        elements.push({ type: 'dialogue', content: trimmed })
      }
      // Action/description
      else {
        elements.push({ type: 'action', content: trimmed })
      }
    })

    return elements
  }

  const scriptElements = parseScript()

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[#1a1a1a]' : ''} transition-all duration-300`}>
      {/* Controls */}
      <div className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-sm border-b border-[#e2c376]/20 p-4 mb-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Episode Selector */}
          <div className="flex flex-wrap gap-2">
            {story.episodes.map((ep) => (
              <button
                key={ep.episodeNumber}
                onClick={() => setSelectedEpisode(ep.episodeNumber)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedEpisode === ep.episodeNumber
                    ? 'bg-[#e2c376] text-black'
                    : 'bg-[#2a2a2a] text-white/80 hover:bg-[#36393f]'
                }`}
              >
                Ep {ep.episodeNumber}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              Line Numbers
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="px-3 py-1 bg-[#2a2a2a] text-white rounded text-sm border border-[#36393f]"
            >
              <option value={12}>12pt</option>
              <option value={14}>14pt</option>
              <option value={16}>16pt</option>
              <option value={18}>18pt</option>
            </select>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1 bg-[#2a2a2a] text-white rounded text-sm hover:bg-[#36393f]"
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      {/* Screenplay Content */}
      <div className={`max-w-5xl mx-auto ${isFullscreen ? 'h-[calc(100vh-120px)] overflow-auto' : ''}`}>
        <div
          className="screenplay-container bg-[#FAF9F6] text-black p-12 mx-auto rounded-lg shadow-2xl"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            lineHeight: 1.6,
            minHeight: isFullscreen ? 'auto' : '800px'
          }}
        >
          {/* Title Page */}
          <div className="text-center mb-16 page-break">
            <h1 className="text-3xl font-bold mb-4 uppercase tracking-wider">
              {story.episodes.find(e => e.episodeNumber === selectedEpisode)?.title || currentScript.episodeTitle}
            </h1>
            <h2 className="text-xl mb-8 text-gray-700">Episode {selectedEpisode}</h2>
            <div className="mt-16">
              <p className="mb-2 text-gray-600">Written by</p>
              <p className="font-bold text-lg">AI Story Engine</p>
            </div>
          </div>

          {/* Script Content */}
          <div className="space-y-6">
            {scriptElements.map((element, idx) => {
              if (element.type === 'scene-heading') {
                return (
                  <div key={idx} className="mt-8 mb-4">
                    {showLineNumbers && (
                      <div className="text-gray-400 text-xs mb-1">Scene {idx}</div>
                    )}
                    <div className="font-bold uppercase text-center tracking-wider text-lg">
                      {element.content}
                    </div>
                  </div>
                )
              }

              if (element.type === 'transition') {
                return (
                  <div key={idx} className="text-right font-bold uppercase text-sm mb-4">
                    {element.content}
                  </div>
                )
              }

              if (element.type === 'character') {
                return (
                  <div key={idx} className="text-center font-bold uppercase tracking-wide mt-6 mb-2">
                    {element.content}
                  </div>
                )
              }

              if (element.type === 'parenthetical') {
                return (
                  <div key={idx} className="text-center italic text-sm mb-2 max-w-md mx-auto">
                    {element.content}
                  </div>
                )
              }

              if (element.type === 'dialogue') {
                return (
                  <div key={idx} className="max-w-md mx-auto text-center mb-4 leading-relaxed">
                    {element.content}
                  </div>
                )
              }

              if (element.type === 'action') {
                if (!element.content) {
                  return <div key={idx} className="mb-2">&nbsp;</div>
                }
                return (
                  <div key={idx} className="mb-4 leading-relaxed max-w-2xl">
                    {element.content}
                  </div>
                )
              }

              return null
            })}
          </div>

          {/* Page Number */}
          <div className="mt-16 text-center text-sm text-gray-500 font-mono">
            {currentScript.sceneStructure.totalPages} pages
          </div>
        </div>
      </div>

      {/* Screenplay Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        
        .screenplay-container {
          font-family: 'Courier Prime', 'Courier New', monospace;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        @media print {
          .screenplay-container {
            background: white !important;
            color: black !important;
            padding: 1in !important;
          }
        }
      `}</style>
    </div>
  )
}





