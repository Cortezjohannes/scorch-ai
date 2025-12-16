'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { PlaybookContent } from '@/utils/playbookContent'

interface CoWriterAvatarProps {
  currentField: string
  content: PlaybookContent
  isTyping: boolean
  visualStyle?: 'minimal' | 'cinematic' | 'conversational' | 'professional'
}

export default function CoWriterAvatar({ currentField, content, isTyping, visualStyle = 'conversational' }: CoWriterAvatarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [displayedText, setDisplayedText] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isTyping && content.message) {
      setIsAnimating(true)
      setDisplayedText('')
      setShowExamples(false)
      
      let currentIndex = 0
      const typingSpeed = 15 // milliseconds per character (faster typing)
      
      const typingInterval = setInterval(() => {
        if (currentIndex < content.message.length) {
          setDisplayedText(content.message.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          setIsAnimating(false)
        }
      }, typingSpeed)

      return () => clearInterval(typingInterval)
    } else {
      // If not typing, show full message immediately
      setDisplayedText(content.message || '')
      setIsAnimating(false)
    }
  }, [content.message, isTyping, currentField])

  // Get styles based on visual style - using CSS variables directly
  const getAvatarStyles = () => {
    const containerBgStyle = isDark 
      ? { backgroundColor: 'var(--dark-bg-secondary)' }
      : { backgroundColor: 'var(--light-bg-secondary)' }
    
    const containerBorderStyle = isDark
      ? { borderColor: 'var(--dark-border)' }
      : { borderColor: 'var(--light-border)' }
    
    const bubbleBgStyle = isDark
      ? { backgroundColor: 'var(--dark-bg-tertiary)' }
      : { backgroundColor: 'var(--light-bg-primary)' }
    
    const textPrimaryStyle = isDark
      ? { color: 'var(--dark-text-primary)' }
      : { color: 'var(--light-text-primary)' }
    
    const textSecondaryStyle = isDark
      ? { color: 'var(--dark-text-secondary)' }
      : { color: 'var(--light-text-secondary)' }
    
    const accentStyle = isDark
      ? { color: 'var(--dark-green-primary)' }
      : { color: 'var(--light-gold-primary)' }
    
    const accentBgStyle = isDark
      ? { backgroundColor: 'var(--dark-green-accent)' }
      : { backgroundColor: 'var(--light-gold-accent)' }
    
    switch (visualStyle) {
      case 'minimal':
        return {
          container: { ...containerBgStyle, ...containerBorderStyle },
          containerClasses: 'border rounded-lg p-6 mb-6',
          avatar: { ...accentBgStyle },
          avatarClasses: 'w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0',
          bubble: { ...bubbleBgStyle },
          bubbleClasses: 'rounded-2xl p-4 relative',
          title: { ...textPrimaryStyle },
          titleClasses: 'font-semibold',
          text: { ...textSecondaryStyle },
          textClasses: 'leading-relaxed',
          button: { ...accentStyle },
          buttonClasses: 'text-sm hover:underline font-medium'
        }
      case 'cinematic':
        return {
          container: { ...containerBgStyle, ...containerBorderStyle },
          containerClasses: `border-2 p-8 mb-6 ${isDark ? 'border-[#10B981]/30' : 'border-[#10B981]/50'}`,
          avatar: { backgroundColor: '#10B981' },
          avatarClasses: 'w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-lg',
          bubble: { ...bubbleBgStyle, ...containerBorderStyle },
          bubbleClasses: `rounded-2xl p-6 relative border ${isDark ? 'border-[#10B981]/20' : 'border-[#10B981]/30'}`,
          title: { ...textPrimaryStyle },
          titleClasses: 'font-bold text-lg',
          text: { ...textPrimaryStyle },
          textClasses: 'leading-relaxed text-base',
          button: { color: isDark ? '#34D399' : '#059669' },
          buttonClasses: 'text-sm hover:underline font-semibold'
        }
      case 'conversational':
        return {
          container: { ...containerBgStyle },
          containerClasses: 'rounded-3xl p-4 mb-3',
          avatar: { ...accentBgStyle },
          avatarClasses: 'w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0',
          bubble: { ...bubbleBgStyle },
          bubbleClasses: 'rounded-3xl p-5 relative shadow-md',
          title: { ...textPrimaryStyle },
          titleClasses: 'font-semibold text-base',
          text: { ...textSecondaryStyle },
          textClasses: 'leading-relaxed',
          button: { ...accentStyle },
          buttonClasses: 'text-sm hover:underline font-medium'
        }
      case 'professional':
        return {
          container: { ...containerBgStyle, ...containerBorderStyle },
          containerClasses: `border-l-4 p-5 mb-6 ${isDark ? 'border-l-[#10B981]' : 'border-l-[#10B981]'}`,
          avatar: { ...accentBgStyle },
          avatarClasses: 'w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0',
          bubble: { ...bubbleBgStyle, ...containerBorderStyle },
          bubbleClasses: 'rounded-lg p-4 relative border',
          title: { ...textPrimaryStyle },
          titleClasses: 'font-semibold text-sm uppercase tracking-wide',
          text: { ...textSecondaryStyle },
          textClasses: 'leading-relaxed text-sm',
          button: { ...accentStyle },
          buttonClasses: 'text-xs hover:underline font-semibold uppercase tracking-wide'
        }
      default:
        return {
          container: { ...containerBgStyle, ...containerBorderStyle },
          containerClasses: 'border rounded-lg p-6 mb-6',
          avatar: { ...accentBgStyle },
          avatarClasses: 'w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0',
          bubble: { ...bubbleBgStyle },
          bubbleClasses: 'rounded-2xl p-4 relative',
          title: { ...textPrimaryStyle },
          titleClasses: 'font-semibold',
          text: { ...textSecondaryStyle },
          textClasses: 'leading-relaxed',
          button: { ...accentStyle },
          buttonClasses: 'text-sm hover:underline font-medium'
        }
    }
  }
  
  const styles = getAvatarStyles()
  
  const bubbleTailBg = isDark ? 'var(--dark-bg-tertiary)' : 'var(--light-bg-primary)'
  const exampleBg = isDark ? 'var(--dark-bg-secondary)' : 'var(--light-bg-secondary)'
  const exampleTextPrimary = isDark ? 'var(--dark-text-primary)' : 'var(--light-text-primary)'
  const exampleTextSecondary = isDark ? 'var(--dark-text-secondary)' : 'var(--light-text-secondary)'
  
  return (
    <div className={styles.containerClasses} style={styles.container}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={styles.avatarClasses} style={styles.avatar}>
          <span>✍️</span>
        </div>
        
        {/* Message Bubble */}
        <div className="flex-1">
          <div className={styles.bubbleClasses} style={styles.bubble}>
            {/* Chat bubble tail */}
            <div 
              className="absolute -left-2 top-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-b-8 border-b-transparent"
              style={{ borderRightColor: bubbleTailBg }}
            />
            
            {/* Message content */}
            <div className="space-y-3">
              <h3 className={styles.titleClasses} style={styles.title}>
                {content.title}
              </h3>
              
              <p className={styles.textClasses} style={styles.text}>
                {displayedText}
                {isAnimating && (
                  <span 
                    className="inline-block w-2 h-5 ml-1 animate-pulse"
                    style={isDark ? { backgroundColor: 'var(--dark-green-primary)' } : { backgroundColor: 'var(--light-gold-primary)' }}
                  />
                )}
              </p>
              
              {/* Show Examples Button */}
              {!isAnimating && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowExamples(!showExamples)}
                  className={styles.buttonClasses}
                  style={styles.button}
                >
                  {showExamples ? 'Hide Examples' : 'Show Examples'}
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Examples Section */}
          <AnimatePresence>
            {showExamples && !isAnimating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid md:grid-cols-2 gap-4"
              >
                {/* Mid Input Example */}
                <div 
                  className="border-2 border-red-500/30 rounded-lg p-4"
                  style={{ backgroundColor: exampleBg }}
                >
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Mid Input</h4>
                  <p 
                    className="text-sm italic"
                    style={{ color: exampleTextSecondary }}
                  >
                    "{content.midExample}"
                  </p>
                </div>
                
                {/* S-Tier Input Example */}
                <div 
                  className={`border-2 ${isDark ? 'border-[#10B981]/30' : 'border-[#10B981]/50'} rounded-lg p-4`}
                  style={{ backgroundColor: exampleBg }}
                >
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#10B981' : '#059669' }}
                  >
                    S-Tier Input
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: exampleTextPrimary }}
                  >
                    "{content.sTierExample}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

