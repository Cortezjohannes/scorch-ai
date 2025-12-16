'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import type { MonologuePractice } from '@/types/actor-materials'

interface Props {
  monologues: MonologuePractice[]
}

export default function MonologuePractice({ monologues }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const [expandedMonologues, setExpandedMonologues] = useState<Set<number>>(new Set())
  
  const toggleMonologue = (index: number) => {
    const newExpanded = new Set(expandedMonologues)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedMonologues(newExpanded)
  }
  
  return (
    <div className="space-y-4">
      {monologues.map((monologue, i) => {
        const isExpanded = expandedMonologues.has(i)
        
        return (
          <motion.div
            key={i}
            className={`${prefix}-card rounded-lg overflow-hidden`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <button
              onClick={() => toggleMonologue(i)}
              className={`w-full p-4 flex items-center justify-between text-left ${prefix}-bg-secondary transition-colors hover:${prefix}-bg-tertiary`}
            >
              <div>
                <span className={`text-sm font-medium ${prefix}-text-accent`}>
                  Episode {monologue.episodeNumber} • Scene {monologue.sceneNumber}
                </span>
              </div>
              <span className={`${prefix}-text-secondary`}>{isExpanded ? '▼' : '▶'}</span>
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-4"
                >
                  <div className={`p-4 rounded ${prefix}-card-secondary`}>
                    <p className={`text-sm font-medium ${prefix}-text-primary mb-2`}>Monologue Text:</p>
                    <div className={`${prefix}-text-secondary whitespace-pre-wrap text-sm leading-relaxed`}>
                      {monologue.text}
                    </div>
                  </div>
                  
                  {monologue.practiceNotes && monologue.practiceNotes.length > 0 && (
                    <div className={`p-3 rounded ${prefix}-card-secondary`}>
                      <p className={`text-sm font-medium ${prefix}-text-primary mb-2`}>Practice Notes:</p>
                      <ul className="space-y-1">
                        {monologue.practiceNotes.map((note, j) => (
                          <li key={j} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                            <span className={`${prefix}-text-accent mt-1`}>•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {monologue.performanceTips && monologue.performanceTips.length > 0 && (
                    <div className={`p-3 ${prefix}-bg-accent/10 border ${prefix}-border-accent/30 rounded`}>
                      <p className={`text-sm font-medium ${prefix}-text-accent mb-2`}>Performance Tips:</p>
                      <ul className="space-y-1">
                        {monologue.performanceTips.map((tip, j) => (
                          <li key={j} className={`text-sm ${prefix}-text-secondary flex items-start gap-2`}>
                            <span className={`${prefix}-text-accent mt-1`}>✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}





