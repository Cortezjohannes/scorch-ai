'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface BeatSheetEditorProps {
  value: string
  onChange: (value: string) => void
  isGenerating: boolean
  theme: 'light' | 'dark'
}

export default function BeatSheetEditor({
  value,
  onChange,
  isGenerating,
  theme
}: BeatSheetEditorProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'

  // Count scenes/beats
  const beatCount = value.split('\n').filter(line => line.trim().length > 0).length
  const wordCount = value.split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="relative">
      {isGenerating ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`min-h-[200px] p-4 rounded-lg ${prefix}-card ${prefix}-border flex items-center justify-center ${prefix}-shadow-sm`}
        >
          <div className="text-center">
            <div className={`w-8 h-8 border-4 ${prefix === 'dark' ? 'border-[#10B981]' : 'border-[#C9A961]'} border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
            <p className={`text-sm ${prefix}-text-secondary`}>Generating beat sheet...</p>
          </div>
        </motion.div>
      ) : (
        <>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full min-h-[200px] p-4 rounded-lg ${prefix}-card ${prefix}-border resize-none ${prefix}-text-primary font-mono text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${prefix === 'dark' ? 'focus:ring-[#10B981]' : 'focus:ring-[#C9A961]'} ${prefix}-shadow-sm`}
            placeholder="Beat sheet will appear here after generation, or you can write your own..."
          />
          {value && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 flex items-center justify-between text-xs ${prefix}-text-tertiary`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded ${prefix}-bg-secondary ${prefix}-text-secondary text-xs font-medium`}>
                  {beatCount} beat{beatCount !== 1 ? 's' : ''}
                </span>
                <span className={`px-2 py-0.5 rounded ${prefix}-bg-secondary ${prefix}-text-secondary text-xs font-medium`}>
                  {wordCount} words
                </span>
              </div>
              <div className={`px-2 py-0.5 rounded ${prefix}-bg-secondary ${prefix}-text-secondary text-xs font-medium`}>
                {value.length} chars
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

