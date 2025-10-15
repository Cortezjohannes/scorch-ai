'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ScriptElement {
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical'
  content: string
  character?: string
  dialogue?: string
}

interface ProfessionalScreenplayDisplayProps {
  screenplay: string
  title?: string
  episodeNumber?: number
}

export default function ProfessionalScreenplayDisplay({ 
  screenplay, 
  title = "Episode Script",
  episodeNumber = 1 
}: ProfessionalScreenplayDisplayProps) {
  
  const parseScreenplay = (screenplay: string): ScriptElement[] => {
    if (!screenplay) return []
    
    const lines = screenplay.split('\n').filter(line => line.trim())
    const elements: ScriptElement[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Scene heading (INT./EXT.)
      if (line.match(/^(INT\.|EXT\.)/)) {
        elements.push({
          type: 'scene_heading',
          content: line
        })
      }
      // Character name (ALL CAPS, not followed by dialogue indicators)
      else if (line.match(/^[A-Z][A-Z\s]+$/) && line.length < 50 && !line.includes('.')) {
        elements.push({
          type: 'character',
          content: line
        })
      }
      // Parenthetical (in parentheses)
      else if (line.match(/^\(.*\)$/)) {
        elements.push({
          type: 'parenthetical',
          content: line
        })
      }
      // Dialogue (everything else that's not action)
      else if (line.length > 0 && !line.match(/^(INT\.|EXT\.)/)) {
        // Check if this is dialogue by looking at context
        const isDialogue = elements.length > 0 && 
          (elements[elements.length - 1].type === 'character' || 
           elements[elements.length - 1].type === 'parenthetical')
        
        if (isDialogue) {
          elements.push({
            type: 'dialogue',
            content: line
          })
        } else {
          elements.push({
            type: 'action',
            content: line
          })
        }
      }
    }
    
    return elements
  }

  const elements = parseScreenplay(screenplay)
  
  if (elements.length === 0) {
    return (
      <div className="bg-white text-black font-mono text-xs leading-relaxed p-8 max-w-4xl mx-auto shadow-2xl">
        <div className="text-center py-12">
          <p className="text-gray-600">No script content available</p>
        </div>
      </div>
    )
  }

  const renderScriptElement = (element: ScriptElement, index: number) => {
    switch (element.type) {
      case 'scene_heading':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="font-bold text-black mb-4 mt-8 first:mt-4"
            style={{ marginLeft: '0px' }}
          >
            {element.content}
          </motion.div>
        )
      
      case 'action':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="text-black mb-4 leading-relaxed max-w-none"
            style={{ 
              marginLeft: '0px',
              marginRight: '0px',
              textAlign: 'left'
            }}
          >
            {element.content}
          </motion.div>
        )
      
      case 'character':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="font-bold text-black mt-6 mb-1"
            style={{ 
              marginLeft: '192px', // ~3.7 inches from left in 12pt
              textAlign: 'left'
            }}
          >
            {element.content}
          </motion.div>
        )
      
      case 'parenthetical':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="text-black mb-1 italic"
            style={{ 
              marginLeft: '240px', // ~4.5 inches from left in 12pt
              textAlign: 'left'
            }}
          >
            {element.content}
          </motion.div>
        )
      
      case 'dialogue':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="text-black mb-4 leading-relaxed"
            style={{ 
              marginLeft: '120px', // ~2.2 inches from left in 12pt
              marginRight: '120px', // ~2.2 inches from right in 12pt
              textAlign: 'left'
            }}
          >
            {element.content}
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div 
      className="bg-white text-black font-mono text-xs leading-relaxed p-8 mx-auto max-w-4xl rounded-lg shadow-2xl"
      style={{ 
        fontSize: '12px',
        fontFamily: 'Courier, monospace',
        lineHeight: 1.6,
        minHeight: '800px'
      }}
    >
      {/* Title Page */}
      <div className="text-center mb-12 page-break">
        <h1 className="text-2xl font-bold mb-4 uppercase">{title}</h1>
        <h2 className="text-xl mb-8">Episode {episodeNumber}</h2>
        <div className="mt-16">
          <p className="mb-2">Written by</p>
          <p className="font-bold">AI Story Engine</p>
        </div>
      </div>

      {/* Script Content */}
      {elements.map((element, index) => renderScriptElement(element, index))}
    </div>
  )
}


