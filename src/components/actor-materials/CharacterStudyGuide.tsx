'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { CharacterStudyGuide } from '@/types/actor-materials'
import GuidedTooltip from './GuidedTooltip'

interface Props {
  studyGuide: CharacterStudyGuide
  readingMode?: 'professional' | 'guided'
}

export default function CharacterStudyGuide({ studyGuide, readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  return (
    <div className="space-y-4">
      {/* Background */}
      <div>
        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
          Background
          {readingMode === 'guided' && (
            <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
              (Your character's history and context)
            </span>
          )}
        </h4>
        <p className={`${prefix}-text-secondary`}>{studyGuide.background}</p>
      </div>
      
      {/* Motivations */}
      <div>
        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
          Core Motivations
          {readingMode === 'guided' && (
            <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
              (What drives your character)
            </span>
          )}
        </h4>
        <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
          {studyGuide.motivations.map((motivation, i) => (
            <li key={i}>{motivation}</li>
          ))}
        </ul>
      </div>
      
      {/* Relationships - Hidden (available in Relationships tab) */}
      {false && studyGuide.relationships && studyGuide.relationships.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Relationships
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (How your character connects with others)
              </span>
            )}
          </h4>
          <div className="space-y-2">
            {studyGuide.relationships.map((rel, i) => (
              <div key={i} className={`p-3 rounded-lg ${prefix}-card-secondary`}>
                <span className={`font-medium ${prefix}-text-primary`}>{rel.characterName}: </span>
                <span className={`${prefix}-text-secondary`}>{rel.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Character Arc */}
      <div>
        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
          Character Arc
          {readingMode === 'guided' && (
            <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
              (How your character changes throughout the story)
            </span>
          )}
        </h4>
        <p className={`${prefix}-text-secondary`}>{studyGuide.characterArc}</p>
      </div>
      
      {/* Internal Conflicts */}
      {studyGuide.internalConflicts && studyGuide.internalConflicts.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Internal Conflicts
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (Inner struggles your character faces)
              </span>
            )}
          </h4>
          <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary`}>
            {studyGuide.internalConflicts.map((conflict, i) => (
              <li key={i}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}





