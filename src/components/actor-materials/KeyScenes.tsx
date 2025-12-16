'use client'

import React, { useState, useMemo } from 'react'
import type { KeyScene } from '@/types/actor-materials'
import { useTheme } from '@/context/ThemeContext'

interface Props {
  keyScenes: KeyScene[]
}

export default function KeyScenes({ keyScenes }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [showOnlyFiveStar, setShowOnlyFiveStar] = useState(false)
  const [sortBy, setSortBy] = useState<'importance' | 'episode' | 'scene'>('importance')
  
  const filteredAndSorted = useMemo(() => {
    let filtered = showOnlyFiveStar ? keyScenes.filter(s => s.importance === 5) : keyScenes
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importance - a.importance
      } else if (sortBy === 'episode') {
        return a.episodeNumber - b.episodeNumber || a.sceneNumber - b.sceneNumber
      } else {
        return a.sceneNumber - b.sceneNumber
      }
    })
  }, [keyScenes, showOnlyFiveStar, sortBy])
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlyFiveStar}
            onChange={(e) => setShowOnlyFiveStar(e.target.checked)}
            className="w-4 h-4"
          />
          <span className={`text-sm ${prefix}-text-secondary`}>Show only 5-star scenes</span>
        </label>
        <span className={`text-sm ${prefix}-text-secondary`}>|</span>
        <span className={`text-sm ${prefix}-text-secondary`}>Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className={`px-2 py-1 rounded text-sm ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border`}
        >
          <option value="importance">Importance</option>
          <option value="episode">Episode</option>
          <option value="scene">Scene Number</option>
        </select>
          </div>
          
      {filteredAndSorted.length === 0 ? (
        <div className={`p-6 rounded-lg ${prefix}-card-secondary text-center`}>
          <p className={`${prefix}-text-secondary`}>No scenes match the current filter.</p>
        </div>
      ) : (
        filteredAndSorted.map((scene, i) => (
          <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`font-medium ${prefix}-text-primary`}>
                Episode {scene.episodeNumber}, Scene {scene.sceneNumber}
              </div>
              <div className="flex">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={j < scene.importance ? 'text-yellow-400' : 'text-gray-400'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          
            <div className="space-y-2 text-sm">
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Why It Matters: </span>
                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                  {scene.whyItMatters.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Focus On: </span>
                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                  {scene.whatToFocusOn.map((item, j) => (
                    <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
              <div>
                <span className={`font-medium ${prefix}-text-primary`}>Quick Prep: </span>
                <ul className={`list-disc list-inside ml-4 ${prefix}-text-secondary`}>
                {scene.quickPrepTips.map((tip, j) => (
                    <li key={j}>{tip}</li>
                ))}
              </ul>
              </div>
            </div>
          </div>
        ))
          )}
    </div>
  )
}





