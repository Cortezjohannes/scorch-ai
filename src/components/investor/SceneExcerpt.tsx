'use client'

import React from 'react'
import type { SceneExcerpt as SceneExcerptType } from '@/types/investor-materials'

interface SceneExcerptProps {
  scene: SceneExcerptType
}

export default function SceneExcerpt({ scene }: SceneExcerptProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#10B981]/20">
      <div className="mb-4">
        <span className="text-[#10B981] font-semibold text-sm">
          Episode {scene.episodeNumber}: {scene.episodeTitle}
        </span>
        <h3 className="text-xl font-bold mt-1">
          Scene {scene.sceneNumber}: {scene.sceneTitle}
        </h3>
      </div>

      <div className="bg-[#121212] rounded-lg p-4 mb-4">
        <pre className="whitespace-pre-wrap font-mono text-sm text-white/90 leading-relaxed">
          {scene.excerpt}
        </pre>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-white/50 text-xs">CONTEXT</span>
          <p className="text-white/70 text-sm">{scene.context}</p>
        </div>
        <div>
          <span className="text-white/50 text-xs">WHY THIS MATTERS</span>
          <p className="text-white/80 text-sm font-medium">{scene.whyItMatters}</p>
        </div>
      </div>
    </div>
  )
}

