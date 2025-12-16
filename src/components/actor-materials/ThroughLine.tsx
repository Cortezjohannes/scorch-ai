'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { ThroughLine as ThroughLineType } from '@/types/actor-materials'

interface Props {
  throughLine: ThroughLineType
  readingMode?: 'professional' | 'guided'
}

export default function ThroughLine({ throughLine, readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className={`p-4 rounded-lg ${prefix}-card-accent`}>
      <p className={`font-semibold mb-2 ${prefix}-text-primary`}>
        {throughLine.superObjective}
      </p>
      <p className={`text-sm mb-3 ${prefix}-text-secondary`}>
        {throughLine.explanation}
        {readingMode === 'guided' && (
          <span className="block mt-2 text-xs italic">
            This is your character's driving force - keep it in mind for every scene.
          </span>
        )}
      </p>
      {throughLine.keyScenes && throughLine.keyScenes.length > 0 && (
        <div className={`mt-3 text-sm ${prefix}-text-secondary`}>
          Key Scenes: {throughLine.keyScenes.join(', ')}
        </div>
      )}
    </div>
  )
}





