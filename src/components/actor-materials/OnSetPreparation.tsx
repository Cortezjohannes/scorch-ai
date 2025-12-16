'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { OnSetPreparation } from '@/types/actor-materials'

interface Props {
  preparation: OnSetPreparation
}

export default function OnSetPreparation({ preparation }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {preparation.preScene && preparation.preScene.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Pre-Scene</h4>
          <ul className="space-y-2">
            {preparation.preScene.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 ${prefix}-text-secondary`}>
                <input type="checkbox" className={`mt-1 w-4 h-4 ${prefix}-text-accent rounded`} />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {preparation.warmUp && preparation.warmUp.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Warm-Up</h4>
          <ul className="space-y-2">
            {preparation.warmUp.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 ${prefix}-text-secondary`}>
                <input type="checkbox" className={`mt-1 w-4 h-4 ${prefix}-text-accent rounded`} />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {preparation.emotionalPrep && preparation.emotionalPrep.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Emotional Prep</h4>
          <ul className="space-y-2">
            {preparation.emotionalPrep.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 ${prefix}-text-secondary`}>
                <input type="checkbox" className={`mt-1 w-4 h-4 ${prefix}-text-accent rounded`} />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {preparation.mentalChecklist && preparation.mentalChecklist.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Mental Checklist</h4>
          <ul className="space-y-2">
            {preparation.mentalChecklist.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 ${prefix}-text-secondary`}>
                <input type="checkbox" className={`mt-1 w-4 h-4 ${prefix}-text-accent rounded`} />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}





