'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { PerformanceReference } from '@/types/actor-materials'

interface Props {
  references: PerformanceReference[]
}

export default function PerformanceReference({ references }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {references.map((ref, i) => (
        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 ${prefix}-bg-secondary rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
              🎬
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${prefix}-text-primary`}>{ref.characterName}</h4>
              <p className={`text-sm ${prefix}-text-secondary mb-2`}>{ref.source}</p>
              <p className={`${prefix}-text-secondary mb-3`}>{ref.reason}</p>
              
              {ref.keySimilarities && ref.keySimilarities.length > 0 && (
                <div className="mb-3">
                  <p className={`text-sm font-medium ${prefix}-text-primary mb-2`}>Key Similarities:</p>
                  <ul className="space-y-1">
                    {ref.keySimilarities.map((similarity, j) => (
                      <li key={j} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                        <span className={`${prefix}-text-accent mt-1`}>•</span>
                        <span>{similarity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {ref.sceneExample && (
                <div className={`p-2 rounded ${prefix}-card-secondary`}>
                  <p className={`text-xs ${prefix}-text-secondary`}>
                    <span className="font-medium">Watch:</span> {ref.sceneExample}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}





