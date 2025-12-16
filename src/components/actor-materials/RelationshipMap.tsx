'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { RelationshipMap as RelationshipMapType } from '@/types/actor-materials'

interface Props {
  relationships: RelationshipMapType[]
}

const relationshipIcons: Record<string, string> = {
  ally: '🤝',
  enemy: '⚔️',
  love: '❤️',
  family: '👨‍👩‍👧',
  mentor: '🎓',
  rival: '🔥',
  neutral: '➖',
  complex: '🌀'
}

export default function RelationshipMap({ relationships }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {relationships.map((rel, i) => (
        <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{relationshipIcons[rel.relationshipType] || '➖'}</span>
            <div>
              <h4 className={`font-semibold ${prefix}-text-primary`}>{rel.characterName}</h4>
              <span className={`text-sm font-medium ${prefix}-text-secondary`}>
                {rel.relationshipType.charAt(0).toUpperCase() + rel.relationshipType.slice(1)}
              </span>
            </div>
          </div>
          
          <p className={`${prefix}-text-secondary mb-3`}>{rel.description}</p>
          
          {rel.keyMoments && rel.keyMoments.length > 0 && (
            <div className="mb-3">
              <p className={`text-sm font-medium ${prefix}-text-primary mb-2`}>Key Moments:</p>
              <div className="space-y-1">
                {rel.keyMoments.map((moment, j) => (
                  <div key={j} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                    <span className={`${prefix}-text-accent`}>•</span>
                    <span>
                      Episode {moment.episodeNumber} • Scene {moment.sceneNumber}: {moment.moment}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {rel.evolution && (
            <div className={`p-3 rounded ${prefix}-card-secondary`}>
              <p className={`text-sm font-medium ${prefix}-text-primary mb-1`}>Evolution:</p>
              <p className={`text-sm ${prefix}-text-secondary`}>{rel.evolution}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}





