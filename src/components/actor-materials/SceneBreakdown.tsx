'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { SceneBreakdown as SceneBreakdownType } from '@/types/actor-materials'

interface Props {
  breakdowns: SceneBreakdownType[]
  readingMode?: 'professional' | 'guided'
}

export default function SceneBreakdown({ breakdowns, readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {breakdowns.map((scene, i) => (
        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
          <div className={`font-medium mb-2 ${prefix}-text-primary`}>
            Episode {scene.episodeNumber}, Scene {scene.sceneNumber}
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Objective: </span>
              <span className={`${prefix}-text-secondary`}>{scene.objective}</span>
              </div>
            <div>
              <span className={`font-medium ${prefix}-text-primary`}>Emotional State: </span>
              <span className={`px-2 py-1 rounded ${prefix}-bg-accent/20 ${prefix}-text-accent`}>
                {scene.emotionalState}
                            </span>
                          </div>
            {scene.tactics && scene.tactics.length > 0 && (
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Tactics: </span>
                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                  {scene.tactics.map((tactic, j) => (
                    <li key={j}>{tactic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
            {scene.keyLines && scene.keyLines.length > 0 && (
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Key Lines: </span>
                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                  {scene.keyLines.map((line, j) => (
                    <li key={j} className="italic">"{line}"</li>
                        ))}
                </ul>
                    </div>
                  )}
            {scene.subtext && (
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Subtext: </span>
                <span className={`italic ${prefix}-text-secondary`}>{scene.subtext}</span>
                    </div>
                  )}
            {readingMode === 'guided' && (
              <div className={`mt-2 p-2 rounded ${prefix}-bg-secondary text-xs ${prefix}-text-secondary italic`}>
                💡 Tip: Your objective is what you want in this scene. The emotional state is how you feel. Tactics are how you'll try to get what you want.
                    </div>
                  )}
          </div>
        </div>
      ))}
    </div>
  )
}





