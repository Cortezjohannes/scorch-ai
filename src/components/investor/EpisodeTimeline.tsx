'use client'

import React from 'react'
import type { EpisodeSummary } from '@/types/investor-materials'

interface EpisodeTimelineProps {
  episodes: EpisodeSummary[]
}

export default function EpisodeTimeline({ episodes }: EpisodeTimelineProps) {
  return (
    <div className="space-y-6">
      {episodes.map((episode, idx) => (
        <div
          key={idx}
          className="relative pl-8 pb-8 border-l-2 border-[#10B981]/30 last:border-0"
        >
          <div className="absolute -left-2 top-0 w-4 h-4 bg-[#10B981] rounded-full border-2 border-[#0A0A0A]"></div>
          <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/20">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[#10B981] font-semibold text-sm">
                  Episode {episode.episodeNumber}
                </span>
                <h3 className="text-xl font-bold mt-1">{episode.title}</h3>
              </div>
            </div>
            <p className="text-white/80 mb-3">{episode.summary}</p>
            {episode.keyBeat && (
              <p className="text-white/60 text-sm italic">"{episode.keyBeat}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

