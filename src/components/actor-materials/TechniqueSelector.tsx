'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { ActingTechnique } from '@/types/actor-materials'

interface Props {
  selectedTechnique?: ActingTechnique
  onTechniqueChange: (technique: ActingTechnique | undefined) => void
  currentTechnique?: ActingTechnique
}

const TECHNIQUES: Array<{ value: ActingTechnique; label: string; category: string }> = [
  // Psychological
  { value: 'stanislavski', label: 'Stanislavski Method', category: 'Psychological' },
  { value: 'meisner', label: 'Meisner Technique', category: 'Psychological' },
  { value: 'method-acting', label: 'Method Acting', category: 'Psychological' },
  { value: 'adler', label: 'Adler Technique', category: 'Psychological' },
  { value: 'hagen', label: 'Hagen Technique', category: 'Psychological' },
  // Physical
  { value: 'chekhov', label: 'Chekhov Technique', category: 'Physical' },
  { value: 'laban', label: 'Laban Movement Analysis', category: 'Physical' },
  { value: 'alexander', label: 'Alexander Technique', category: 'Physical' },
  { value: 'viewpoints', label: 'Viewpoints', category: 'Physical' },
  { value: 'suzuki', label: 'Suzuki Method', category: 'Physical' },
  { value: 'biomechanics', label: 'Biomechanics (Meyerhold)', category: 'Physical' },
  { value: 'butoh', label: 'Butoh', category: 'Physical' },
  // Voice
  { value: 'linklater', label: 'Linklater Technique', category: 'Voice' },
  { value: 'fitzmaurice', label: 'Fitzmaurice Voicework', category: 'Voice' },
  { value: 'roy-hart', label: 'Roy Hart Technique', category: 'Voice' },
  // Practical
  { value: 'practical-aesthetics', label: 'Practical Aesthetics', category: 'Practical' },
  { value: 'spolin', label: 'Spolin Method', category: 'Practical' },
  // Classical & Style
  { value: 'classical', label: 'Classical Acting', category: 'Classical & Style' },
  { value: 'brechtian', label: 'Brechtian Techniques', category: 'Classical & Style' },
  { value: 'grotowski', label: 'Grotowski Method', category: 'Classical & Style' },
  // Improvisational
  { value: 'improv', label: 'Improv', category: 'Improvisational' },
  { value: 'spolin-games', label: 'Spolin Games', category: 'Improvisational' }
]

export default function TechniqueSelector({ selectedTechnique, onTechniqueChange, currentTechnique }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const groupedTechniques = TECHNIQUES.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = []
    }
    acc[tech.category].push(tech)
    return acc
  }, {} as Record<string, typeof TECHNIQUES>)
  
  return (
    <div className={`${prefix}-card rounded-xl p-4`}>
      <label className={`block text-sm font-medium ${prefix}-text-primary mb-2`}>
        Acting Technique (Optional - Select for personalized exercises)
      </label>
      <select
        value={selectedTechnique || ''}
        onChange={(e) => onTechniqueChange(e.target.value ? (e.target.value as ActingTechnique) : undefined)}
        className={`w-full px-4 py-2 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded-lg focus:outline-none focus:border-${prefix === 'dark' ? '[#34D399]' : '[#10B981]'} ${prefix}-input`}
      >
        <option value="">General (No specific technique)</option>
        {Object.entries(groupedTechniques).map(([category, techniques]) => (
          <optgroup key={category} label={category}>
            {techniques.map((tech) => (
              <option key={tech.value} value={tech.value}>
                {tech.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      
      {selectedTechnique && selectedTechnique !== currentTechnique && (
        <div className={`mt-3 p-3 ${prefix}-bg-accent/10 border ${prefix}-border-accent/30 rounded-lg`}>
          <p className={`text-sm ${prefix}-text-accent`}>
            Changing technique will regenerate materials. This may take a few minutes.
          </p>
        </div>
      )}
    </div>
  )
}





