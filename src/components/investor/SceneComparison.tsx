'use client'

import React from 'react'
import type { KeyScenesSection } from '@/types/investor-materials'

interface SceneComparisonProps {
  keyScenes: KeyScenesSection
}

export default function SceneComparison({ keyScenes }: SceneComparisonProps) {
  const episode3 = keyScenes.episode3
  const episode8 = keyScenes.episode8

  if (!episode3 || !episode8) {
    return (
      <div className="text-center text-white/70 py-12">
        <p>Key scenes comparison not available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">The Transformation</h2>
        <p className="text-white/70">From doubt to conviction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Episode 3 - The Setup */}
        <div className="bg-[#121212] rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm font-semibold">
              Episode {episode3.episodeNumber}
            </span>
            <h3 className="text-xl font-bold text-white">The Doubt</h3>
          </div>
          <p className="text-white/70 mb-4">{episode3.context}</p>
          <div className="p-4 bg-[#0A0A0A] rounded-lg border border-white/5 mb-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-white/90">
              {episode3.excerpt.substring(0, 300)}...
            </pre>
          </div>
          <div className="p-4 border-l-4 border-white/20 bg-white/5 rounded-r-lg">
            <p className="text-sm font-semibold text-white/50 mb-1">Why This Matters</p>
            <p className="text-sm text-white/80">{episode3.whyItMatters}</p>
          </div>
        </div>

        {/* Episode 8 - The Payoff */}
        <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/40 relative">
          <div className="absolute top-4 right-4 px-2 py-1 bg-[#10B981]/20 text-[#10B981] text-xs font-semibold rounded">
            PAYOFF
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-lg bg-[#10B981]/20 text-[#10B981] text-sm font-semibold">
              Episode {episode8.episodeNumber}
            </span>
            <h3 className="text-xl font-bold text-white">The Validation</h3>
          </div>
          <p className="text-white/70 mb-4">{episode8.context}</p>
          <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#10B981]/20 mb-4">
            <pre className="whitespace-pre-wrap font-mono text-xs text-white/90">
              {episode8.excerpt.substring(0, 300)}...
            </pre>
          </div>
          <div className="p-4 border-l-4 border-[#10B981] bg-[#10B981]/10 rounded-r-lg">
            <p className="text-sm font-semibold text-[#10B981] mb-1">Why This Matters</p>
            <p className="text-sm text-white/90">{episode8.whyItMatters}</p>
          </div>
        </div>
      </div>

      {/* Connecting Arrow */}
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-white/20 to-[#10B981]"></div>
          <div className="text-2xl text-[#10B981] animate-pulse">→</div>
          <div className="h-px w-16 bg-gradient-to-l from-white/20 to-[#10B981]"></div>
        </div>
      </div>
    </div>
  )
}

