'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import type { OnSetPreparation } from '@/types/actor-materials'

interface OnSetPrepModalProps {
  isOpen: boolean
  onClose: () => void
  onSetPrep: OnSetPreparation
  characterName: string
}

export default function OnSetPrepModal({
  isOpen,
  onClose,
  onSetPrep,
  characterName
}: OnSetPrepModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  
  // Load checked items from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(`onset-prep-${characterName}`)
      if (saved) {
        try {
          setCheckedItems(JSON.parse(saved))
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [isOpen, characterName])
  
  // Save checked items to localStorage
  useEffect(() => {
    if (Object.keys(checkedItems).length > 0) {
      localStorage.setItem(`onset-prep-${characterName}`, JSON.stringify(checkedItems))
    }
  }, [checkedItems, characterName])
  
  const toggleItem = (section: string, index: number) => {
    const key = `${section}-${index}`
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-4xl ${prefix}-card rounded-2xl shadow-2xl overflow-hidden my-8`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${prefix}-border flex items-center justify-between`}>
              <div>
                <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>
                  On-Set Preparation Checklist
                </h2>
                <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                  {characterName}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`text-2xl ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors`}
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div className={`p-6 overflow-y-auto max-h-[calc(100vh-200px)] ${prefix}-bg-primary`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pre-Scene */}
                {onSetPrep.preScene && onSetPrep.preScene.length > 0 && (
                  <div className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                    <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Pre-Scene</h5>
                    <ul className={`space-y-1 ${prefix}-text-secondary`}>
                      {onSetPrep.preScene.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checkedItems[`preScene-${i}`] || false}
                            onChange={() => toggleItem('preScene', i)}
                            className="mt-1"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Warm-Up */}
                {onSetPrep.warmUp && onSetPrep.warmUp.length > 0 && (
                  <div className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                    <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Warm-Up</h5>
                    <ul className={`space-y-1 ${prefix}-text-secondary`}>
                      {onSetPrep.warmUp.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checkedItems[`warmUp-${i}`] || false}
                            onChange={() => toggleItem('warmUp', i)}
                            className="mt-1"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Emotional Prep */}
                {onSetPrep.emotionalPrep && onSetPrep.emotionalPrep.length > 0 && (
                  <div className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                    <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Emotional Prep</h5>
                    <ul className={`space-y-1 ${prefix}-text-secondary`}>
                      {onSetPrep.emotionalPrep.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checkedItems[`emotionalPrep-${i}`] || false}
                            onChange={() => toggleItem('emotionalPrep', i)}
                            className="mt-1"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Mental Checklist */}
                {onSetPrep.mentalChecklist && onSetPrep.mentalChecklist.length > 0 && (
                  <div className={`p-4 rounded-lg ${prefix}-card-secondary`}>
                    <h5 className={`font-medium mb-2 ${prefix}-text-primary`}>Mental Checklist</h5>
                    <ul className={`space-y-1 ${prefix}-text-secondary`}>
                      {onSetPrep.mentalChecklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checkedItems[`mentalChecklist-${i}`] || false}
                            onChange={() => toggleItem('mentalChecklist', i)}
                            className="mt-1"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className={`p-6 border-t ${prefix}-border flex items-center justify-between`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium ${prefix}-btn-secondary`}
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className={`px-4 py-2 rounded-lg font-medium ${prefix}-btn-primary`}
              >
                Print
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

