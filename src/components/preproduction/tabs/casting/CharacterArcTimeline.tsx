'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

interface CharacterArcTimelineProps {
  characterArc?: {
    keyBeats?: string[]
    emotionalJourney?: string
  }
  fallbackTitle?: string
}

export function CharacterArcTimeline({ characterArc, fallbackTitle = 'Character Arc' }: CharacterArcTimelineProps) {
  const beats = characterArc?.keyBeats || []
  const journey = characterArc?.emotionalJourney || ''

  if (!beats.length && !journey) {
    return (
      <div className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] text-xs text-[#e7e7e7]/60">
        {fallbackTitle}: No arc data yet.
      </div>
    )
  }

  return (
    <div className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] space-y-3">
      <div className="flex items-center gap-2 text-sm text-[#e7e7e7]">
        <Sparkles className="w-4 h-4 text-[#10B981]" />
        <span>{fallbackTitle}</span>
      </div>
      {journey && (
        <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
          {journey}
        </div>
      )}
      {beats.length > 0 && (
        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-[#36393f]" />
          <div className="space-y-3 pl-6">
            {beats.map((beat, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-[#10B981]" />
                <div className="text-xs text-[#e7e7e7]/80 leading-relaxed">{beat}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
























