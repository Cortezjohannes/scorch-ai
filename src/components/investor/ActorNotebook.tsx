'use client'

import React, { useState } from 'react'
import type { CharacterDepthSection } from '@/types/investor-materials'

interface ActorNotebookProps {
  characterDepth: CharacterDepthSection[]
}

export default function ActorNotebook({ characterDepth }: ActorNotebookProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<number>(0)

  if (characterDepth.length === 0) {
    return (
      <div className="text-center text-white/70 py-12">
        <p>Character depth materials not available</p>
      </div>
    )
  }

  const currentChar = characterDepth[selectedCharacter]

  return (
    <div className="space-y-6">
      {/* Character Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {characterDepth.map((char, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCharacter(idx)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCharacter === idx
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#121212] text-white/70 hover:bg-white/5 hover:text-white border border-white/10'
            }`}
          >
            {char.characterName}
          </button>
        ))}
      </div>

      {/* Notebook Content */}
      <div className="bg-[#1A1A1A] rounded-xl p-8 border border-[#10B981]/20 relative" style={{ fontFamily: 'serif' }}>
        {/* Paper Texture Effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }} />

        <div className="relative z-10">
          {/* Character Name Header */}
          <h3
            className="text-3xl font-bold mb-6 text-white"
            style={{ fontFamily: 'cursive', transform: 'rotate(-1deg)' }}
          >
            {currentChar.characterName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              {/* Through-Line */}
              {currentChar.studyGuide?.throughLine && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-white/50 uppercase tracking-wider">Through-Line</p>
                  <p className="text-base leading-relaxed text-white/90">
                    {currentChar.studyGuide.throughLine}
                  </p>
                </div>
              )}

              {/* Super Objective */}
              {currentChar.studyGuide?.superObjective && (
                <div className="p-4 bg-[#10B981]/10 border-l-4 border-[#10B981] rounded-r-lg">
                  <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Super Objective</p>
                  <p className="text-lg font-semibold text-white">
                    {currentChar.studyGuide.superObjective}
                  </p>
                </div>
              )}

              {/* Key Scenes */}
              {currentChar.studyGuide?.keyScenes && currentChar.studyGuide.keyScenes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-white/50 uppercase tracking-wider">Key Scenes</p>
                  <ol className="space-y-2">
                    {currentChar.studyGuide.keyScenes.map((scene, idx) => (
                      <li key={idx} className="text-white/90">
                        {idx + 1}. {scene}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Performance References */}
              {currentChar.performanceReference && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-white/50 uppercase tracking-wider">Performance References</p>
                  <div className="p-4 bg-[#121212] rounded-lg border border-white/10">
                    <p className="text-white/90 mb-2">
                      Watch: {currentChar.performanceReference.references.join(', ')}
                    </p>
                    {currentChar.performanceReference.notes && (
                      <p className="text-sm text-white/70 italic">{currentChar.performanceReference.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Margin Notes Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-4 p-4 bg-[#10B981]/10 rounded-lg border-l-2 border-[#10B981]">
                <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">Notes</p>
                <div className="space-y-3 text-xs text-white/70 italic">
                  {currentChar.studyGuide?.superObjective && (
                    <p>
                      Focus on the core drive: "{currentChar.studyGuide.superObjective.substring(0, 50)}..."
                    </p>
                  )}
                  {currentChar.performanceReference?.references.length > 0 && (
                    <p>
                      Study {currentChar.performanceReference.references[0]} for inspiration
                    </p>
                  )}
                  <p>
                    Remember: Every scene serves the through-line
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

