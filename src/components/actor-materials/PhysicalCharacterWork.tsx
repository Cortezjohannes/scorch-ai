'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { PhysicalCharacterWork } from '@/types/actor-materials'

interface Props {
  physicalWork: PhysicalCharacterWork
  readingMode?: 'professional' | 'guided'
}

export default function PhysicalCharacterWork({ physicalWork, readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {physicalWork.bodyLanguage && physicalWork.bodyLanguage.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Body Language
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (How your character uses their body to communicate)
              </span>
            )}
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
            {physicalWork.bodyLanguage.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {physicalWork.movement && physicalWork.movement.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Movement
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (How your character walks and moves)
              </span>
            )}
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
            {physicalWork.movement.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {physicalWork.posture && physicalWork.posture.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Posture
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (How your character stands and sits)
              </span>
            )}
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
            {physicalWork.posture.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      
      {physicalWork.transformationNotes && (
        <div className={`p-3 rounded-lg ${prefix}-bg-accent/10 border ${prefix}-border-accent/30`}>
          <p className={`text-sm font-medium mb-1 ${prefix}-text-accent`}>Physical Transformation:</p>
          <p className={`text-sm ${prefix}-text-secondary`}>{physicalWork.transformationNotes}</p>
        </div>
      )}
    </div>
  )
}





