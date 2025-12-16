'use client'

import React from 'react'
import type { GOTEAnalysis as GOTEAnalysisType } from '@/types/actor-materials'
import { useTheme } from '@/context/ThemeContext'

interface Props {
  gotAnalysis: GOTEAnalysisType[]
  viewMode?: 'table' | 'cards'
  readingMode?: 'professional' | 'guided'
}

export default function GOTEAnalysis({ gotAnalysis, viewMode = 'cards', readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  if (viewMode === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${prefix}-border`}>
              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Scene</th>
              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Goal</th>
              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Obstacle</th>
              <th className={`text-left py-2 px-4 ${prefix}-text-primary`}>Tactics</th>
            </tr>
          </thead>
          <tbody>
            {gotAnalysis.map((gote, i) => (
              <tr key={i} className={`border-b ${prefix}-border`}>
                <td className={`py-3 px-4 ${prefix}-text-secondary`}>Ep {gote.episodeNumber}, Sc {gote.sceneNumber}</td>
                <td className={`py-3 px-4 ${prefix}-text-secondary`}>{gote.goal}</td>
                <td className={`py-3 px-4 ${prefix}-text-secondary`}>{gote.obstacle}</td>
                <td className={`py-3 px-4 ${prefix}-text-secondary`}>
                  <ul className="list-disc list-inside">
                    {gote.tactics.map((t, j) => (
                      <li key={j} className="text-xs">{t}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Card view (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {gotAnalysis.map((gote, i) => (
        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
          <div className={`text-sm font-medium mb-2 ${prefix}-text-primary`}>
            Episode {gote.episodeNumber}, Scene {gote.sceneNumber}
              </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Goal: </span>
              <span className={`${prefix}-text-secondary`}>{gote.goal}</span>
                          </div>
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Obstacle: </span>
              <span className={`${prefix}-text-secondary`}>{gote.obstacle}</span>
                      </div>
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Tactics: </span>
              <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                {gote.tactics.map((t, j) => (
                  <li key={j}>{t}</li>
                        ))}
                      </ul>
                    </div>
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Expectation: </span>
              <span className={`${prefix}-text-secondary`}>{gote.expectation}</span>
                  </div>
                  {gote.techniqueNotes && (
              <div className={`mt-2 p-2 rounded ${prefix}-bg-accent/10 border ${prefix}-border-accent/30`}>
                <span className={`text-xs font-medium ${prefix}-text-accent`}>Technique Notes: </span>
                <span className={`text-xs ${prefix}-text-secondary`}>{gote.techniqueNotes}</span>
                    </div>
                  )}
            {readingMode === 'guided' && (
              <div className={`mt-2 p-2 rounded ${prefix}-bg-secondary text-xs ${prefix}-text-secondary italic`}>
                💡 Tip: Use this GOTE analysis to prepare for each scene. Know your goal, understand the obstacle, and choose your tactics.
              </div>
              )}
          </div>
        </div>
      ))}
    </div>
  )
}





