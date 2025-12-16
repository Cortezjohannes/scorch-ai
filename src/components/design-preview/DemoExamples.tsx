'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import CoWriterAvatar from './CoWriterAvatar'
import { playbookContent } from '@/utils/playbookContent'

interface DemoExamplesProps {
  theme: 'light' | 'dark'
}

type LayoutConcept = 1 | 2 | 3 | 4 | 5
type VisualStyle = 'minimal' | 'cinematic' | 'conversational' | 'professional'

export default function DemoExamples({ theme }: DemoExamplesProps) {
  const { theme: contextTheme } = useTheme()
  const actualTheme = theme || contextTheme || 'dark'
  const isDark = actualTheme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [activeLayout, setActiveLayout] = useState<LayoutConcept>(1)
  const [activeStyle, setActiveStyle] = useState<VisualStyle>('minimal')
  
  // Form state for interactive mockups
  const [logline, setLogline] = useState('')
  const [protagonist, setProtagonist] = useState('')
  const [stakes, setStakes] = useState('')
  const [vibe, setVibe] = useState('')
  const [themeField, setThemeField] = useState('')
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  const [tonePreference, setTonePreference] = useState<'balanced' | 'light' | 'dark' | 'gritty' | 'whimsical'>('balanced')
  const [pacing, setPacing] = useState<'slow-burn' | 'moderate' | 'fast-paced'>('moderate')
  const [complexity, setComplexity] = useState<'straightforward' | 'layered' | 'complex'>('layered')
  const [focusArea, setFocusArea] = useState<'character' | 'plot' | 'world' | 'balanced'>('balanced')
  
  // Progressive disclosure state
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set(['logline']))
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [showReview, setShowReview] = useState(false)
  
  // Hybrid state
  const [showRemainingFields, setShowRemainingFields] = useState(false)
  
  // Guided Co-Writer state
  const [guidedRevealedFields, setGuidedRevealedFields] = useState<Set<string>>(new Set(['logline']))
  const [currentField, setCurrentField] = useState('logline')
  const [isTyping, setIsTyping] = useState(true)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  const completionTimeouts = useRef<Record<string, NodeJS.Timeout>>({})
  
  const isFormValid = logline.trim() && protagonist.trim() && stakes.trim() && vibe.trim() && themeField.trim()
  
  const handleFieldComplete = (fieldName: string) => {
    if (activeLayout === 3) { // Progressive disclosure
      const fieldOrder = ['logline', 'protagonist', 'stakes', 'vibe', 'theme']
      const currentIndex = fieldOrder.indexOf(fieldName)
      if (currentIndex < fieldOrder.length - 1) {
        setRevealedFields(prev => new Set([...prev, fieldOrder[currentIndex + 1]]))
      }
    }
    // Note: Guided Co-Writer (layout 5) now uses manual progression via handleNextField
  }
  
  // Effect to handle guided co-writer - only update typing state when field changes
  useEffect(() => {
    if (activeLayout === 5) {
      // When switching to a new field, ensure typing animation completes
      const currentContent = playbookContent[currentField]
      if (currentContent && isTyping) {
        const typingDuration = currentContent.message.length * 15 + 500
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, typingDuration)
        return () => clearTimeout(timeout)
      }
    }
  }, [currentField, activeLayout, isTyping])
  
  const renderLayout = () => {
    switch (activeLayout) {
      case 1:
        return renderSingleFormLayout()
      case 2:
        return renderWizardLayout()
      case 3:
        return renderProgressiveLayout()
      case 4:
        return renderHybridLayout()
      case 5:
        return renderGuidedCoWriterLayout()
      default:
        return renderSingleFormLayout()
    }
  }
  
  const renderSingleFormLayout = () => {
    return (
      <div className="space-y-8">
        {renderHero()}
        {renderGuestBanner()}
        <div className="space-y-6">
          {renderField('logline', '1. The Story: What\'s the epic tale you\'re about to tell?', logline, setLogline, 'A hopeless romantic architect tells his kids the epic story of how he met their mother...')}
          {renderField('protagonist', '2. The Protagonist: Who is your main character?', protagonist, setProtagonist, 'Ted Mosby, a romantic architect searching for "the one"...')}
          {renderField('stakes', '3. The Stakes: What happens if they fail?', stakes, setStakes, 'If Ted doesn\'t find true love, he\'ll spend his life alone, telling stories to his kids...')}
          {renderField('vibe', '4. The Vibe: What\'s the tone and atmosphere?', vibe, setVibe, 'Witty ensemble comedy with heart and nostalgia. Friends meets The Wonder Years...')}
          {renderField('theme', '5. The Theme: What\'s the deeper meaning?', themeField, setThemeField, 'Love takes time, timing matters, and the journey is as important as the destination...')}
        </div>
        {renderAdvancedOptions()}
        {renderGenerateButton()}
      </div>
    )
  }
  
  const renderWizardLayout = () => {
    const steps = [
      { num: 1, label: 'Story', field: 'logline', title: 'What\'s the epic tale you\'re about to tell?' },
      { num: 2, label: 'Protagonist', field: 'protagonist', title: 'Who is your main character?' },
      { num: 3, label: 'Stakes', field: 'stakes', title: 'What happens if they fail?' },
      { num: 4, label: 'Vibe', field: 'vibe', title: 'What\'s the tone and atmosphere?' },
      { num: 5, label: 'Theme', field: 'theme', title: 'What\'s the deeper meaning?' },
    ]
    
    const currentStepData = steps[currentStep - 1]
    
    return (
      <div className="space-y-8">
        {renderHero()}
        {renderGuestBanner()}
        
        {/* Progress Indicator */}
        <div className={`${prefix}-card p-6`}>
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === step.num
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : currentStep > step.num
                      ? `${prefix}-bg-accent/20 ${prefix}-text-accent`
                      : `${prefix}-bg-secondary ${prefix}-text-secondary`
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className={`text-xs mt-2 ${prefix}-text-secondary`}>{step.label}</span>
                </div>
                {step.num < steps.length && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > step.num ? prefix + '-bg-accent' : prefix + '-bg-secondary'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Current Step Content */}
        <div className={`${prefix}-card p-8`}>
          <h3 className={`text-2xl font-bold mb-6 ${prefix}-text-primary`}>
            {currentStepData.title}
          </h3>
          {renderField(
            currentStepData.field,
            '',
            currentStep === 1 ? logline : currentStep === 2 ? protagonist : currentStep === 3 ? stakes : currentStep === 4 ? vibe : themeField,
            currentStep === 1 ? setLogline : currentStep === 2 ? setProtagonist : currentStep === 3 ? setStakes : currentStep === 4 ? setVibe : setThemeField,
            getPlaceholderForField(currentStepData.field)
          )}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`px-6 py-3 ${prefix}-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentStep < 5) {
                  setCurrentStep(currentStep + 1)
                } else {
                  setShowReview(true)
                }
              }}
              className={`px-6 py-3 ${prefix}-btn-primary`}
            >
              {currentStep === 5 ? 'Review & Generate' : 'Next'}
            </button>
          </div>
        </div>
        
        {showReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${prefix}-card p-8 mt-6`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${prefix}-text-primary`}>
              Review Your Story
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Story:</h4>
                <p className={`${prefix}-text-secondary`}>{logline || 'Not provided'}</p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Protagonist:</h4>
                <p className={`${prefix}-text-secondary`}>{protagonist || 'Not provided'}</p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Stakes:</h4>
                <p className={`${prefix}-text-secondary`}>{stakes || 'Not provided'}</p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Vibe:</h4>
                <p className={`${prefix}-text-secondary`}>{vibe || 'Not provided'}</p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>Theme:</h4>
                <p className={`${prefix}-text-secondary`}>{themeField || 'Not provided'}</p>
              </div>
            </div>
            {renderAdvancedOptions()}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setShowReview(false)}
                className={`px-6 py-3 ${prefix}-btn-secondary`}
              >
                Back to Edit
              </button>
              {renderGenerateButton()}
            </div>
          </motion.div>
        )}
        {currentStep === 5 && !showReview && renderAdvancedOptions()}
      </div>
    )
  }
  
  const renderProgressiveLayout = () => {
    return (
      <div className="space-y-8">
        {renderHero()}
        {renderGuestBanner()}
        
        <AnimatePresence>
          {revealedFields.has('logline') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderField('logline', '1. The Story: What\'s the epic tale you\'re about to tell?', logline, setLogline, 'A hopeless romantic architect tells his kids the epic story...', () => handleFieldComplete('logline'))}
            </motion.div>
          )}
          
          {revealedFields.has('protagonist') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderField('protagonist', '2. The Protagonist: Who is your main character?', protagonist, setProtagonist, 'Ted Mosby, a romantic architect...', () => handleFieldComplete('protagonist'))}
            </motion.div>
          )}
          
          {revealedFields.has('stakes') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderField('stakes', '3. The Stakes: What happens if they fail?', stakes, setStakes, 'If Ted doesn\'t find true love...', () => handleFieldComplete('stakes'))}
            </motion.div>
          )}
          
          {revealedFields.has('vibe') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderField('vibe', '4. The Vibe: What\'s the tone and atmosphere?', vibe, setVibe, 'Witty ensemble comedy with heart...', () => handleFieldComplete('vibe'))}
            </motion.div>
          )}
          
          {revealedFields.has('theme') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderField('theme', '5. The Theme: What\'s the deeper meaning?', themeField, setThemeField, 'Love takes time, timing matters...', () => handleFieldComplete('theme'))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {revealedFields.has('theme') && (
          <>
            {renderAdvancedOptions()}
            {renderGenerateButton()}
          </>
        )}
      </div>
    )
  }
  
  const renderHybridLayout = () => {
    return (
      <div className="space-y-8">
        {renderHero()}
        {renderGuestBanner()}
        
        <div className="space-y-6">
          {renderField('logline', '1. The Story: What\'s the epic tale you\'re about to tell?', logline, setLogline, 'A hopeless romantic architect tells his kids the epic story...')}
          {renderField('protagonist', '2. The Protagonist: Who is your main character?', protagonist, setProtagonist, 'Ted Mosby, a romantic architect...')}
        </div>
        
        {!showRemainingFields ? (
          <div className="flex justify-center">
            <button
              onClick={() => setShowRemainingFields(true)}
              disabled={!logline.trim() || !protagonist.trim()}
              className={`px-8 py-4 ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg`}
            >
              Continue →
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {renderField('stakes', '3. The Stakes: What happens if they fail?', stakes, setStakes, 'If Ted doesn\'t find true love...')}
            {renderField('vibe', '4. The Vibe: What\'s the tone and atmosphere?', vibe, setVibe, 'Witty ensemble comedy with heart...')}
            {renderField('theme', '5. The Theme: What\'s the deeper meaning?', themeField, setThemeField, 'Love takes time, timing matters...')}
            {renderAdvancedOptions()}
            {renderGenerateButton()}
          </motion.div>
        )}
      </div>
    )
  }
  
  const handleNextField = () => {
    const fieldOrder = ['logline', 'protagonist', 'stakes', 'vibe', 'theme']
    const currentIndex = fieldOrder.indexOf(currentField)
    
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1]
      setIsTyping(true)
      setCurrentField(nextField)
      setGuidedRevealedFields(prev => new Set([...prev, nextField]))
      
      // Stop typing after message is fully displayed
      const nextContent = playbookContent[nextField]
      const typingDuration = nextContent.message.length * 15 + 500
      setTimeout(() => setIsTyping(false), typingDuration)
    }
  }
  
  const renderGuidedCoWriterLayout = () => {
    const currentContent = playbookContent[currentField] || playbookContent.logline
    const fieldOrder = ['logline', 'protagonist', 'stakes', 'vibe', 'theme']
    const currentIndex = fieldOrder.indexOf(currentField)
    const isLastField = currentIndex === fieldOrder.length - 1
    
    // Get current field value
    const currentValue = currentField === 'logline' ? logline : 
                        currentField === 'protagonist' ? protagonist :
                        currentField === 'stakes' ? stakes :
                        currentField === 'vibe' ? vibe : themeField
    
    const canProceed = currentValue.trim().length > 0
    
    return (
      <div className="space-y-8">
        {/* Co-Writer Avatar */}
        <CoWriterAvatar 
          currentField={currentField}
          content={currentContent}
          isTyping={isTyping}
          visualStyle={activeStyle}
        />
        
        {/* Single Form Field - One at a time */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentField}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentField === 'logline' && renderField('logline', '1. The Story: What\'s the epic tale you\'re about to tell?', logline, setLogline, 'A hopeless romantic architect tells his kids the epic story...', undefined, handleNextField)}
            {currentField === 'protagonist' && renderField('protagonist', '2. The Protagonist: Who is your main character?', protagonist, setProtagonist, 'Ted Mosby, a romantic architect...', undefined, handleNextField)}
            {currentField === 'stakes' && renderField('stakes', '3. The Stakes: What happens if they fail?', stakes, setStakes, 'If Ted doesn\'t find true love...', undefined, handleNextField)}
            {currentField === 'vibe' && renderField('vibe', '4. The Vibe: What\'s the tone and atmosphere?', vibe, setVibe, 'Witty ensemble comedy with heart...', undefined, handleNextField)}
            {currentField === 'theme' && renderField('theme', '5. The Theme: What\'s the deeper meaning?', themeField, setThemeField, 'Love takes time, timing matters...', undefined, handleNextField)}
          </motion.div>
        </AnimatePresence>
        
        {/* Continue Button */}
        {!isLastField && (
          <div className="flex justify-center">
            <button
              onClick={handleNextField}
              disabled={!canProceed}
              className={`px-8 py-4 ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium rounded-lg transition-all`}
            >
              Continue
              <span className="ml-2 text-sm opacity-70">(Ctrl+Enter / Cmd+Enter)</span>
            </button>
          </div>
        )}
        
        {/* Show advanced options and generate button on last field */}
        {isLastField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {renderAdvancedOptions()}
            {renderGenerateButton()}
          </motion.div>
        )}
      </div>
    )
  }
  
  const getPlaceholderForField = (field: string) => {
    const placeholders: Record<string, string> = {
      logline: 'A hopeless romantic architect tells his kids the epic story of how he met their mother...',
      protagonist: 'Ted Mosby, a romantic architect searching for "the one"...',
      stakes: 'If Ted doesn\'t find true love, he\'ll spend his life alone...',
      vibe: 'Witty ensemble comedy with heart and nostalgia. Friends meets The Wonder Years...',
      theme: 'Love takes time, timing matters, and the journey is as important as the destination...'
    }
    return placeholders[field] || ''
  }
  
  const renderField = (
    id: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
    onComplete?: () => void,
    onNext?: () => void
  ) => {
    const fieldStyles = getFieldStyles()
    
    return (
      <div className={fieldStyles.fieldContainer}>
        <label htmlFor={id} className={fieldStyles.label}>
          {label}
        </label>
        <div className="relative">
          <textarea
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              // For progressive disclosure only, trigger completion after user stops typing
              if (onComplete && e.target.value.trim() && activeLayout === 3) {
                // Clear any existing timeout for this field
                if (completionTimeouts.current[id]) {
                  clearTimeout(completionTimeouts.current[id])
                }
                // Set a new timeout - trigger completion after user stops typing for 1 second
                completionTimeouts.current[id] = setTimeout(() => {
                  onComplete()
                  delete completionTimeouts.current[id]
                }, 1000)
              }
            }}
            onKeyDown={(e) => {
              // Handle Ctrl+Enter / Cmd+Enter for guided co-writer layout
              if (activeLayout === 5 && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                if (e.currentTarget.value.trim() && onNext) {
                  onNext()
                }
              }
            }}
            placeholder={placeholder}
            rows={3}
            className={fieldStyles.textarea}
          />
          {value.trim() && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3"
            >
              <span className={fieldStyles.checkmark}>✓</span>
            </motion.div>
          )}
        </div>
      </div>
    )
  }
  
  const renderHero = () => {
    const heroStyles = getHeroStyles()
    
    return (
      <div className={heroStyles.container}>
        <div className={heroStyles.content}>
          {activeStyle === 'conversational' ? (
            <div className="flex items-start gap-4">
              <div className={heroStyles.avatar}>🤖</div>
              <div className="flex-1">
                <div className={heroStyles.bubble}>
                  <p className={heroStyles.bubbleText}>
                    Hey! I'm your AI co-writer. Let's build your story together. 
                    Start by telling me about the epic tale you want to tell.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={heroStyles.logoContainer}>
                <img src="/greenlitailogo.png" alt="Greenlit" className={heroStyles.logo} />
              </div>
              <h1 className={heroStyles.title}>Writers' Room</h1>
              <p className={heroStyles.subtitle}>
                Let's co-write your story.
                <br />
                <span className={heroStyles.accent}>Greenlit will build the world.</span>
              </p>
              <p className={heroStyles.meta}>
                30+ Production Engines • 70% Revenue Share • Direct-to-Audience Distribution
              </p>
            </>
          )}
        </div>
      </div>
    )
  }
  
  const renderGuestBanner = () => {
    if (activeStyle === 'conversational') return null
    
    const bannerStyles = getBannerStyles()
    
    return (
      <div className={bannerStyles.container}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className={bannerStyles.title}>You're not logged in</p>
            <p className={bannerStyles.subtitle}>Your story bible will only be saved locally on this device.</p>
          </div>
          <button className={bannerStyles.button}>
            Login to Save Permanently
          </button>
        </div>
      </div>
    )
  }
  
  const renderAdvancedOptions = () => {
    const advancedStyles = getAdvancedStyles()
    
    return (
      <div className={advancedStyles.container}>
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className={advancedStyles.toggle}
        >
          <span>Advanced Options</span>
          <span>{advancedExpanded ? '▼' : '▶'}</span>
        </button>
        
        {advancedExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={advancedStyles.content}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={advancedStyles.optionLabel}>Tone Preference</label>
                <select
                  value={tonePreference}
                  onChange={(e) => setTonePreference(e.target.value as any)}
                  className={advancedStyles.select}
                >
                  <option value="balanced">Balanced</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="gritty">Gritty</option>
                  <option value="whimsical">Whimsical</option>
                </select>
              </div>
              
              <div>
                <label className={advancedStyles.optionLabel}>Pacing</label>
                <select
                  value={pacing}
                  onChange={(e) => setPacing(e.target.value as any)}
                  className={advancedStyles.select}
                >
                  <option value="slow-burn">Slow Burn</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast-paced">Fast-Paced</option>
                </select>
              </div>
              
              <div>
                <label className={advancedStyles.optionLabel}>Complexity</label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value as any)}
                  className={advancedStyles.select}
                >
                  <option value="straightforward">Straightforward</option>
                  <option value="layered">Layered</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
              
              <div>
                <label className={advancedStyles.optionLabel}>Focus Area</label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value as any)}
                  className={advancedStyles.select}
                >
                  <option value="character">Character</option>
                  <option value="plot">Plot</option>
                  <option value="world">World</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }
  
  const renderGenerateButton = () => {
    const buttonStyles = getButtonStyles()
    
    return (
      <div className="flex justify-center">
        <button
          disabled={!isFormValid}
          className={`${buttonStyles.button} ${!isFormValid ? buttonStyles.disabled : ''}`}
        >
          Generate Story Bible
        </button>
      </div>
    )
  }
  
  // Style getters based on activeStyle
  const getHeroStyles = () => {
    const base = {
      container: '',
      content: '',
      logoContainer: '',
      logo: '',
      title: '',
      subtitle: '',
      accent: '',
      meta: '',
      avatar: '',
      bubble: '',
      bubbleText: ''
    }
    
    switch (activeStyle) {
      case 'minimal':
        return {
          ...base,
          container: `text-center mb-8`,
          content: `space-y-4`,
          logoContainer: `w-16 h-16 mx-auto mb-4`,
          logo: `w-full h-full object-contain`,
          title: `text-4xl font-bold ${prefix}-text-primary`,
          subtitle: `text-xl ${prefix}-text-secondary`,
          accent: `${prefix}-text-accent font-semibold`,
          meta: `text-sm ${prefix}-text-tertiary`
        }
      case 'cinematic':
        return {
          ...base,
          container: `text-center mb-8 relative`,
          content: `space-y-6`,
          logoContainer: `w-20 h-20 mx-auto mb-6 relative`,
          logo: `w-full h-full object-contain filter drop-shadow-lg`,
          title: `text-6xl font-black ${prefix}-text-primary tracking-tight`,
          subtitle: `text-2xl ${prefix}-text-primary font-medium`,
          accent: `${isDark ? 'text-[#34D399]' : 'text-[#10B981]'} font-bold`,
          meta: `text-lg ${prefix}-text-secondary`
        }
      case 'conversational':
        return {
          ...base,
          container: `mb-8`,
          content: ``,
          avatar: `w-12 h-12 rounded-full ${prefix}-bg-accent flex items-center justify-center text-2xl flex-shrink-0`,
          bubble: `${prefix}-card p-4 rounded-2xl`,
          bubbleText: `${prefix}-text-primary`
        }
      case 'professional':
        return {
          ...base,
          container: `${prefix}-card p-6 mb-8`,
          content: `space-y-3`,
          logoContainer: `w-12 h-12 mb-3`,
          logo: `w-full h-full object-contain`,
          title: `text-3xl font-bold ${prefix}-text-primary`,
          subtitle: `text-base ${prefix}-text-secondary`,
          accent: `${prefix}-text-accent font-semibold`,
          meta: `text-xs ${prefix}-text-tertiary uppercase tracking-wide`
        }
      default:
        return base
    }
  }
  
  const getFieldStyles = () => {
    switch (activeStyle) {
      case 'minimal':
        return {
          fieldContainer: `space-y-2`,
          label: `block ${prefix}-text-primary font-medium`,
          textarea: `w-full px-4 py-3 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded-lg focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-[#34D399]' : 'focus:ring-[#C9A961]'} resize-none`,
          checkmark: `${prefix}-text-accent text-lg`
        }
      case 'cinematic':
        return {
          fieldContainer: `space-y-3 ${prefix}-card p-6`,
          label: `block ${prefix}-text-primary font-bold text-lg`,
          textarea: `w-full px-4 py-4 ${prefix}-bg-secondary ${prefix}-text-primary border-2 ${prefix}-border rounded-lg focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-[#34D399]' : 'focus:ring-[#10B981]'} resize-none`,
          checkmark: `${isDark ? 'text-[#34D399]' : 'text-[#10B981]'} text-xl`
        }
      case 'conversational':
        return {
          fieldContainer: `space-y-2`,
          label: `block ${prefix}-text-primary font-medium`,
          textarea: `w-full px-4 py-3 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded-2xl focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-[#34D399]' : 'focus:ring-[#C9A961]'} resize-none`,
          checkmark: `${prefix}-text-accent text-lg`
        }
      case 'professional':
        return {
          fieldContainer: `space-y-2`,
          label: `block ${prefix}-text-primary font-semibold text-sm uppercase tracking-wide`,
          textarea: `w-full px-4 py-3 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded focus:outline-none focus:ring-1 ${isDark ? 'focus:ring-[#34D399]' : 'focus:ring-[#C9A961]'} resize-none`,
          checkmark: `${prefix}-text-accent`
        }
      default:
        return {
          fieldContainer: '',
          label: '',
          textarea: '',
          checkmark: ''
        }
    }
  }
  
  const getBannerStyles = () => {
    switch (activeStyle) {
      case 'minimal':
        return {
          container: `${prefix}-bg-secondary border ${prefix}-border rounded-lg p-4 mb-6`,
          title: `${prefix}-text-primary font-medium`,
          subtitle: `${prefix}-text-secondary text-sm`,
          button: `px-4 py-2 ${prefix}-btn-primary text-sm`
        }
      case 'cinematic':
        return {
          container: `bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-4 mb-6`,
          title: `${prefix}-text-primary font-medium`,
          subtitle: `${prefix}-text-secondary text-sm`,
          button: `px-4 py-2 ${isDark ? 'bg-[#10B981] text-[#121212]' : 'bg-[#10B981] text-white'} font-bold rounded-lg text-sm`
        }
      case 'professional':
        return {
          container: `${prefix}-bg-secondary border-l-4 border-yellow-500 ${prefix}-border rounded p-4 mb-6`,
          title: `${prefix}-text-primary font-semibold text-sm`,
          subtitle: `${prefix}-text-secondary text-xs`,
          button: `px-4 py-2 ${prefix}-btn-primary text-xs`
        }
      default:
        return {
          container: '',
          title: '',
          subtitle: '',
          button: ''
        }
    }
  }
  
  const getAdvancedStyles = () => {
    switch (activeStyle) {
      case 'minimal':
        return {
          container: `${prefix}-card p-4`,
          toggle: `w-full flex justify-between items-center ${prefix}-text-primary font-medium py-2`,
          content: `mt-4 pt-4 border-t ${prefix}-border`,
          optionLabel: `block ${prefix}-text-secondary text-sm mb-2`,
          select: `w-full px-3 py-2 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded`
        }
      case 'cinematic':
        return {
          container: `${prefix}-card p-6`,
          toggle: `w-full flex justify-between items-center ${prefix}-text-primary font-bold text-lg py-3`,
          content: `mt-6 pt-6 border-t ${prefix}-border`,
          optionLabel: `block ${prefix}-text-primary font-medium mb-3`,
          select: `w-full px-4 py-3 ${prefix}-bg-secondary ${prefix}-text-primary border-2 ${prefix}-border rounded-lg`
        }
      case 'conversational':
        return {
          container: `${prefix}-card p-4 rounded-2xl`,
          toggle: `w-full flex justify-between items-center ${prefix}-text-primary font-medium py-2`,
          content: `mt-4 pt-4 border-t ${prefix}-border`,
          optionLabel: `block ${prefix}-text-secondary text-sm mb-2`,
          select: `w-full px-3 py-2 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded-xl`
        }
      case 'professional':
        return {
          container: `${prefix}-card p-4`,
          toggle: `w-full flex justify-between items-center ${prefix}-text-primary font-semibold text-sm uppercase tracking-wide py-2`,
          content: `mt-4 pt-4 border-t ${prefix}-border`,
          optionLabel: `block ${prefix}-text-secondary text-xs uppercase mb-2`,
          select: `w-full px-3 py-2 ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border rounded text-sm`
        }
      default:
        return {
          container: '',
          toggle: '',
          content: '',
          optionLabel: '',
          select: ''
        }
    }
  }
  
  const getButtonStyles = () => {
    switch (activeStyle) {
      case 'minimal':
        return {
          button: `px-8 py-4 ${prefix}-btn-primary text-lg font-medium rounded-lg`,
          disabled: `opacity-50 cursor-not-allowed`
        }
      case 'cinematic':
        return {
          button: `px-12 py-5 ${isDark ? 'bg-[#10B981] text-[#121212]' : 'bg-[#10B981] text-white'} font-bold text-xl rounded-lg shadow-lg ${isDark ? 'shadow-[#10B981]/30' : 'shadow-[#10B981]/20'}`,
          disabled: `opacity-50 cursor-not-allowed`
        }
      case 'conversational':
        return {
          button: `px-8 py-4 ${prefix}-btn-primary text-lg font-medium rounded-2xl`,
          disabled: `opacity-50 cursor-not-allowed`
        }
      case 'professional':
        return {
          button: `px-8 py-4 ${prefix}-btn-primary text-base font-semibold rounded uppercase tracking-wide`,
          disabled: `opacity-50 cursor-not-allowed`
        }
      default:
        return {
          button: '',
          disabled: ''
        }
    }
  }
  
  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Demo Page Redesign
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Explore different layout concepts and visual styles for the story creation interface
        </p>
      </div>
      
      {/* Layout Selector */}
      <div className={`${prefix}-card p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
          Layout Concept
        </h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { num: 1, label: 'Single Long-Form' },
            { num: 2, label: 'Multi-Step Wizard' },
            { num: 3, label: 'Progressive Disclosure' },
            { num: 4, label: 'Hybrid Approach' },
            { num: 5, label: 'Guided Co-Writer' }
          ].map((layout) => (
            <button
              key={layout.num}
              onClick={() => {
                setActiveLayout(layout.num as LayoutConcept)
                setCurrentStep(1)
                setShowReview(false)
                setRevealedFields(new Set(['logline']))
                setShowRemainingFields(false)
                if (layout.num === 5) {
                  setGuidedRevealedFields(new Set(['logline']))
                  setCurrentField('logline')
                  setIsTyping(true)
                  setCompletedFields(new Set())
                  // Stop typing after initial message is displayed
                  setTimeout(() => {
                    setIsTyping(false)
                  }, playbookContent.logline.message.length * 15 + 500)
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeLayout === layout.num
                  ? `${prefix}-bg-accent ${prefix}-text-accent`
                  : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent/20`
              }`}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Style Selector */}
      <div className={`${prefix}-card p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>
          Visual Style
        </h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { id: 'minimal', label: 'Clean & Minimal' },
            { id: 'cinematic', label: 'Cinematic/Dramatic' },
            { id: 'conversational', label: 'Conversational' },
            { id: 'professional', label: 'Professional Suite' }
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id as VisualStyle)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeStyle === style.id
                  ? `${prefix}-bg-accent ${prefix}-text-accent`
                  : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent/20`
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`${prefix}-card p-8`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeLayout}-${activeStyle}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderLayout()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

