'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import type { VoicePatterns } from '@/types/actor-materials'

interface Props {
  voicePatterns: VoicePatterns
  readingMode?: 'professional' | 'guided'
}

export default function VoicePatterns({ voicePatterns, readingMode = 'professional' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  return (
    <div className="space-y-4">
      {voicePatterns.vocabulary && voicePatterns.vocabulary.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Vocabulary
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (Words your character uses)
              </span>
            )}
          </h4>
          <div className="flex flex-wrap gap-2">
            {voicePatterns.vocabulary.map((word, i) => (
              <span key={i} className={`px-2 py-1 rounded ${prefix}-bg-accent/20 ${prefix}-text-accent text-sm`}>
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
          Speech Rhythm
          {readingMode === 'guided' && (
            <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
              (The pace and flow of your character's speech)
            </span>
          )}
        </h4>
        <p className={`${prefix}-text-secondary`}>{voicePatterns.rhythm}</p>
      </div>
      
      {voicePatterns.accent && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Accent/Dialect
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (Regional or cultural speech patterns)
              </span>
            )}
          </h4>
          <p className={`${prefix}-text-secondary`}>{voicePatterns.accent}</p>
        </div>
      )}
      
      {voicePatterns.keyPhrases && voicePatterns.keyPhrases.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>Key Phrases</h4>
          <ul className={`list-disc list-inside space-y-1 ${prefix}-text-secondary italic`}>
            {voicePatterns.keyPhrases.map((phrase, i) => (
              <li key={i}>"{phrase}"</li>
            ))}
          </ul>
        </div>
      )}
      
      {voicePatterns.verbalTics && voicePatterns.verbalTics.length > 0 && (
        <div>
          <h4 className={`font-medium mb-2 ${prefix}-text-primary`}>
            Verbal Tics
            {readingMode === 'guided' && (
              <span className={`ml-2 text-xs ${prefix}-text-secondary`}>
                (Repeated words or sounds your character makes)
              </span>
            )}
          </h4>
          <div className="flex flex-wrap gap-2">
            {voicePatterns.verbalTics.map((tic, i) => (
              <span key={i} className={`px-2 py-1 rounded ${prefix}-bg-secondary ${prefix}-text-secondary text-sm`}>
                {tic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}





