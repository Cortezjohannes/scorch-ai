'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useRouter } from 'next/navigation'
import StoryForgeLoader from '@/components/loaders/StoryForgeLoader'
import { RecentStories } from '@/components/RecentStories'
import AnimatedBackground from '@/components/AnimatedBackground'
import PitchPlaybookModal from '@/components/PitchPlaybookModal'
import { useAuth } from '@/context/AuthContext'
import { saveStoryBible } from '@/services/story-bible-service'
import { 
  saveGenerationPreferences, 
  loadGenerationPreferences, 
  getDefaultPreferences,
  getDefaultAdvancedSettings,
  GENRE_OPTIONS,
  LANGUAGE_OPTIONS,
  SERIES_LENGTH_OPTIONS,
  type GenerationPreferences,
  type AdvancedSettings
} from '@/services/generation-preferences'
import CoWriterAvatar from '@/components/design-preview/CoWriterAvatar'
import { playbookContent } from '@/utils/playbookContent'
import { useTheme } from '@/context/ThemeContext'
import ProgressButton from '@/components/loaders/ProgressButton'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'


export default function DemoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { theme: contextTheme } = useTheme()
  const isDark = contextTheme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [logline, setLogline] = useState<string>('')
  const [protagonist, setProtagonist] = useState<string>('')
  const [stakes, setStakes] = useState<string>('')
  const [vibe, setVibe] = useState<string>('')
  const [setting, setSetting] = useState<string>('')
  const [theme, setTheme] = useState<string>('')
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  
  // Character creator state
  const [characterInfo, setCharacterInfo] = useState<string>('')
  
  // Viewport height tracking for dynamic textarea sizing
  const [viewportHeight, setViewportHeight] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 800)
  const [maxTextareaHeight, setMaxTextareaHeight] = useState<number>(400)
  
  // Progressive disclosure state - order: logline, protagonist, setting, stakes, vibe, theme, advanced, characterCreator, additionalInfo
  const [currentField, setCurrentField] = useState<'logline' | 'protagonist' | 'setting' | 'stakes' | 'vibe' | 'theme' | 'advanced' | 'characterCreator' | 'additionalInfo'>('logline')
  const [guidedRevealedFields, setGuidedRevealedFields] = useState<Set<string>>(new Set(['logline']))
  const [isTyping, setIsTyping] = useState(true)
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set())
  
  // Advanced generation options - toggle and settings
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(getDefaultAdvancedSettings())
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']))
  const [showLogoLoading, setShowLogoLoading] = useState(true)
  const [showIntroduction, setShowIntroduction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Initializing Greenlit...')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [showPitchPlaybook, setShowPitchPlaybook] = useState(false)
  
  // Load saved generation preferences
  useEffect(() => {
    const savedPrefs = loadGenerationPreferences()
    if (savedPrefs) {
      if (savedPrefs.useAdvancedSettings !== undefined) {
        setUseAdvancedSettings(savedPrefs.useAdvancedSettings)
      }
      if (savedPrefs.advancedSettings) {
        setAdvancedSettings(savedPrefs.advancedSettings)
      }
      console.log('📖 Loaded saved preferences:', savedPrefs)
    }
  }, [])
  
  // Fallback to ensure form shows
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isFormVisible) {
        setShowIntroduction(false)
        setIsFormVisible(true)
      }
    }, 5000) // 5 second fallback
    
    return () => clearTimeout(fallbackTimer)
  }, [isFormVisible])

  const [showEmberParticles, setShowEmberParticles] = useState(false)
  
  // Logo loading sequence - goes directly to form
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogoLoading(false)
      setIsFormVisible(true) // Skip the 2nd introduction
    }, 3000) // 3 seconds of twinkling logo

    return () => clearTimeout(logoTimer)
  }, [])
  
  // Check if current field is filled
  const isCurrentFieldFilled = useCallback(() => {
    switch (currentField) {
      case 'logline':
        return logline.trim().length > 0
      case 'protagonist':
        return protagonist.trim().length > 0
      case 'setting':
        return setting.trim().length > 0
      case 'stakes':
        return stakes.trim().length > 0
      case 'vibe':
        return vibe.trim().length > 0
      case 'theme':
        return theme.trim().length > 0
      case 'additionalInfo':
        return true // Additional info is optional, always "filled"
      case 'advanced':
        return true // Advanced settings are always "filled" (optional)
      case 'characterCreator':
        return true // Character creator is optional, always "filled"
      default:
        return false
    }
  }, [currentField, logline, protagonist, setting, stakes, vibe, theme])
  
  // Field order: logline, protagonist, setting, stakes, vibe, theme, advanced, characterCreator (if advanced on), additionalInfo
  const fieldOrder: Array<'logline' | 'protagonist' | 'setting' | 'stakes' | 'vibe' | 'theme' | 'advanced' | 'characterCreator' | 'additionalInfo'> = ['logline', 'protagonist', 'setting', 'stakes', 'vibe', 'theme', 'advanced', 'characterCreator', 'additionalInfo']
  
  // Get effective field order (characterCreator only shows if advanced settings is enabled)
  const effectiveFieldOrder = useMemo(() => {
    const base: Array<'logline' | 'protagonist' | 'setting' | 'stakes' | 'vibe' | 'theme' | 'advanced' | 'characterCreator' | 'additionalInfo'> = ['logline', 'protagonist', 'setting', 'stakes', 'vibe', 'theme', 'advanced']
    if (useAdvancedSettings) {
      base.push('characterCreator')
    }
    base.push('additionalInfo')
    return base
  }, [useAdvancedSettings])
  
  
  // Calculate max textarea height based on viewport
  useEffect(() => {
    const calculateMaxHeight = () => {
      if (typeof window === 'undefined') return
      
      const vh = window.innerHeight
      setViewportHeight(vh)
      
      // Find the current textarea to measure available space
      const textareaId = currentField === 'characterCreator' ? 'characterInfo' : 
                        currentField === 'additionalInfo' ? 'additionalInfo' : 
                        currentField
      const textarea = document.getElementById(textareaId) as HTMLTextAreaElement
      
      if (textarea) {
        const textareaRect = textarea.getBoundingClientRect()
        const textareaTop = textareaRect.top
        
        // Find the bottom of the form/container (look for buttons or form end)
        const form = textarea.closest('form') || textarea.closest('[class*="space-y"]')
        let bottomBoundary = vh
        
        if (form) {
          // Find buttons below the textarea
          const buttons = form.querySelectorAll('button')
          buttons.forEach(btn => {
            const btnRect = btn.getBoundingClientRect()
            if (btnRect.top > textareaTop && btnRect.bottom < bottomBoundary) {
              bottomBoundary = btnRect.bottom
            }
          })
        }
        
        // Calculate available height: from textarea top to bottom boundary, minus padding
        const availableHeight = bottomBoundary - textareaTop - 40 // 40px for margins/padding
        const calculatedMax = Math.max(200, Math.min(600, availableHeight))
        
        setMaxTextareaHeight(calculatedMax)
      } else {
        // Fallback: estimate based on viewport size
        // Mobile: ~600px reserved, Desktop: ~500px reserved
        const reservedSpace = vh < 768 ? 600 : 500
        const calculatedMax = Math.max(200, Math.min(600, vh - reservedSpace))
        setMaxTextareaHeight(calculatedMax)
      }
    }
    
    // Calculate on mount, resize, and field change
    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateMaxHeight, 50)
    
    // Use requestAnimationFrame for smooth resize updates
    let rafId: number
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(calculateMaxHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
    }
  }, [currentField]) // Recalculate when field changes (examples might show/hide)

  // Auto-resize textarea helper
  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, maxTextareaHeight)
      textarea.style.height = `${newHeight}px`
      textarea.style.overflowY = textarea.scrollHeight > maxTextareaHeight ? 'auto' : 'hidden'
    }
  }, [maxTextareaHeight])

  // Handle textarea changes with auto-resize
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>, setter: (value: string) => void) => {
    setter(e.target.value)
    autoResizeTextarea(e.target)
  }, [autoResizeTextarea])
  
  // Field navigation for progressive disclosure
  const handleNextField = useCallback(() => {
    const currentIndex = effectiveFieldOrder.indexOf(currentField)
    
    if (currentIndex < effectiveFieldOrder.length - 1) {
      const nextField = effectiveFieldOrder[currentIndex + 1]
      setCurrentField(nextField)
      setGuidedRevealedFields(prev => new Set([...prev, nextField]))
      setIsTyping(true)
      setCompletedFields(prev => new Set([...prev, currentField]))
    }
  }, [currentField, effectiveFieldOrder])
  
  // Back button navigation
  const handlePreviousField = useCallback(() => {
    const currentIndex = effectiveFieldOrder.indexOf(currentField)
    
    if (currentIndex > 0) {
      const prevField = effectiveFieldOrder[currentIndex - 1]
      setCurrentField(prevField)
      setIsTyping(true)
    }
  }, [currentField, effectiveFieldOrder])
  
  
  // Keyboard shortcut handler - use refs to avoid re-renders
  const isCurrentFieldFilledRef = React.useRef(isCurrentFieldFilled)
  const handleNextFieldRef = React.useRef(handleNextField)
  
  // Update refs when callbacks change
  useEffect(() => {
    isCurrentFieldFilledRef.current = isCurrentFieldFilled
    handleNextFieldRef.current = handleNextField
  }, [isCurrentFieldFilled, handleNextField])

  // Auto-resize textareas when field changes
  useEffect(() => {
    const textareaIds = ['logline', 'protagonist', 'setting', 'stakes', 'vibe', 'theme', 'characterInfo', 'additionalInfo']
    textareaIds.forEach(id => {
      const textarea = document.getElementById(id) as HTMLTextAreaElement
      if (textarea) {
        autoResizeTextarea(textarea)
      }
    })
  }, [currentField, autoResizeTextarea])
  
  // Set up keyboard listener once
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (isCurrentFieldFilledRef.current()) {
          handleNextFieldRef.current()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, []) // Empty deps - only set up once
  
  // Update typing state when field changes
  useEffect(() => {
    if (playbookContent[currentField]) {
      setIsTyping(true)
      const typingDuration = playbookContent[currentField].message.length * 15 + 500
      const timeout = setTimeout(() => {
        setIsTyping(false)
      }, typingDuration)
      return () => clearTimeout(timeout)
    }
  }, [currentField])
  
  // Track field completion - removed to prevent page refresh on every keystroke
  // Field completion is now checked on-demand via isCurrentFieldFilled()

  // Handle user selecting a creative mode and starting the flow
  const handleStart = async () => {
    if (!logline.trim()) {
      alert('Please enter a logline for your series');
      return;
    }
    
    if (!protagonist.trim()) {
      alert('Please enter your protagonist details');
      return;
    }
    
    if (!stakes.trim()) {
      alert('Please enter the stakes for your series');
      return;
    }
    
    if (!vibe.trim()) {
      alert('Please enter the vibe for your series');
      return;
    }
    
    if (!theme.trim()) {
      alert('Please enter a theme for your series');
      return;
    }
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep('Preparing your Greenlit production suite...');
    const startTimeValue = Date.now();
    setStartTime(startTimeValue);
    setElapsedTime(0);

    // Rebellious AI progression steps
    const progressSteps = [
      { progress: 15, step: 'Story Foundation: Clarifying your series premise and goals...' },
      { progress: 25, step: 'Character Builder: Developing leads with depth and intention...' },
      { progress: 40, step: 'Structure Engine: Mapping arcs and episode flow...' },
      { progress: 55, step: 'Dialogue Pass: Establishing voice and tone...' },
      { progress: 70, step: 'Worldbuilding: Defining rules, locations, and tone...' },
      { progress: 85, step: 'Showrunner Sync: Aligning creative with production realities...' },
      { progress: 95, step: 'Finalizing assets and preparing your workspace...' }
    ];

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeValue) / 1000));
    }, 1000);

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setLoadingProgress(progressSteps[stepIndex].progress);
        setCurrentStep(progressSteps[stepIndex].step);
        stepIndex++;
      }
    }, 3000); // Update every 3 seconds
    
    try {
      // Save generation preferences
      const prefsToSave = getDefaultPreferences()
      prefsToSave.useAdvancedSettings = useAdvancedSettings
      prefsToSave.advancedSettings = advancedSettings
      saveGenerationPreferences(prefsToSave)
      console.log('💾 Generation preferences saved:', { useAdvancedSettings, advancedSettings })
      
      console.log('📡 Making API call to /api/generate/story-bible');
      console.log('🎨 Advanced settings:', useAdvancedSettings ? advancedSettings : 'Using defaults');
      
      // Generate story bible via API
      const response = await fetch('/api/generate/story-bible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logline: logline.trim(),
          protagonist: protagonist.trim(),
          stakes: stakes.trim(),
          vibe: vibe.trim(),
          setting: setting.trim(),
          theme: theme.trim(),
          additionalInfo: additionalInfo.trim(),
          // Character information if provided
          characterInfo: characterInfo.trim() || null,
          // Advanced generation options
          useAdvancedSettings,
          advancedSettings: useAdvancedSettings ? advancedSettings : null,
          // Don't auto-generate images - let user generate them manually in story bible view
          generateImages: false,
          userId: user?.id
        }),
      });

      console.log('📡 API response received:', response.status, response.ok);

      if (!response.ok) {
        console.log('❌ API response not ok:', response.status, response.statusText);
        throw new Error('Failed to generate story bible');
      }

      const data = await response.json();
      
      console.log('✅ Story bible generated successfully:', data);
      
      // Complete the process
      clearInterval(progressInterval);
      clearInterval(timeInterval);
      setLoadingProgress(100);
      setCurrentStep("You're Already Greenlit. Let's build your show.");
      
      if (data.storyBible) {
        console.log('🔥 Story Bible generated successfully!');
        
        // Get user ID - try hook first, then Firebase auth directly
        let userIdToUse = user?.id;
        if (!userIdToUse) {
          try {
            const { auth } = await import('@/lib/firebase');
            const currentUser = auth.currentUser;
            if (currentUser) {
              userIdToUse = currentUser.uid;
              console.log('🔍 useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse);
            }
          } catch (authError) {
            console.error('❌ Error checking Firebase auth:', authError);
          }
        }
        
        // Generate a local ID for the story bible if it doesn't have one
        const localId = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const storyBibleWithId = {
          ...data.storyBible,
          id: data.storyBible.id || localId,
          seriesTitle: data.storyBible.seriesTitle || logline.substring(0, 50),
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        let finalStoryBibleId: string = storyBibleWithId.id;
        
        // Save to Firestore if user is logged in
        if (userIdToUse) {
          console.log('👤 User logged in, saving to Firestore...', { userId: userIdToUse });
          try {
            const savedBible = await saveStoryBible(storyBibleWithId, userIdToUse);
            finalStoryBibleId = savedBible.id;
            console.log('✅ Saved to Firestore successfully! Story Bible ID:', finalStoryBibleId);
          } catch (error) {
            console.error('❌ Error saving to Firestore:', error);
            // Continue with local ID - the story bible is still in memory
          }
        } else {
          console.log('⚠️ Guest mode - saving to localStorage only');
        }
        
        // Always save to localStorage as backup
        const storyBibleData = {
          storyBible: storyBibleWithId,
          logline: logline.trim(),
          protagonist: protagonist.trim(),
          stakes: stakes.trim(),
          vibe: vibe.trim(),
          theme: theme.trim(),
          createdAt: new Date().toISOString(),
          platform: 'Greenlit - Production Platform'
        };
        localStorage.setItem('greenlit-story-bible', JSON.stringify(storyBibleData));
        console.log('💾 Saved to localStorage as backup');
        
        // Set flag to indicate story bible was just generated (for prompting image generation)
        sessionStorage.setItem(`story-bible-just-generated-${finalStoryBibleId}`, 'true');
        console.log('🎨 Set flag for prompting image generation');
        
        console.log('🚀 Redirecting to story bible page...');
        
        // CRITICAL: Wait a moment for state to settle before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to the story bible page with the ID
        router.push(`/story-bible?id=${finalStoryBibleId}`);
      } else {
        console.error('❌ No story bible data in response:', data);
        throw new Error('The process failed - no story data received');
      }
    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      console.error('❌ Error details:', error?.message || error);
      clearInterval(progressInterval);
      clearInterval(timeInterval);
      
      setCurrentStep(`⚠️ Generation failed: ${error?.message || 'Unknown error'}`);
      setLoadingProgress(0);
      
      // Show error for longer before resetting
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep('Ready to try again');
        alert(`Story Bible generation failed: ${error?.message || 'Please try again.'}`);
      }, 3000);
    }
  };

  
  // Get current field's playbook content
  const currentPlaybookContent = useMemo(() => {
    return playbookContent[currentField] || playbookContent.logline
  }, [currentField])
  
  // Check if all required fields (1-6) are completed
  const allRequiredFieldsCompleted = logline.trim() && protagonist.trim() && stakes.trim() && vibe.trim() && setting.trim() && theme.trim()
  
  // Check if on advanced settings screen
  const isOnAdvancedScreen = currentField === 'advanced'
  
  // Get current field number based on effective field order
  const currentFieldNumber = effectiveFieldOrder.indexOf(currentField) + 1
  const totalFields = effectiveFieldOrder.length
  
  // Helper to toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }
  
  // Helper to update a single advanced setting
  const updateAdvancedSetting = (key: keyof AdvancedSettings, value: AdvancedSettings[keyof AdvancedSettings]) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }))
  }
  
  return (
    <div className={`min-h-screen ${isDark ? 'dark-bg-primary' : 'light-bg-primary'} ${isDark ? 'text-white' : 'text-black'} relative`}>
      <AnimatedBackground variant="particles" intensity="medium" page="demo" />
      <StoryForgeLoader
        isVisible={isLoading}
        progress={loadingProgress}
        currentStep={currentStep}
        statusMessage={currentStep}
        elapsedTime={elapsedTime}
        engines={[
          { id: 'premise', name: 'Premise Engine', icon: '🎯', description: 'Analyzing story foundation and thematic structure' },
          { id: 'character', name: 'Character Engine', icon: '👥', description: 'Creating complex 3D characters with psychology' },
          { id: 'narrative', name: 'Narrative Engine', icon: '📖', description: 'Building fractal story structure and arcs' },
          { id: 'world', name: 'World Engine', icon: '🌍', description: 'Building immersive settings and environments' },
          { id: 'dialogue', name: 'Dialogue Engine', icon: '💬', description: 'Crafting strategic character conversations' },
          { id: 'tension', name: 'Tension Engine', icon: '⚡', description: 'Building and releasing dramatic tension' },
          { id: 'genre', name: 'Genre Engine', icon: '🎭', description: 'Optimizing for genre-specific storytelling' },
          { id: 'choice', name: 'Choice Engine', icon: '🔀', description: 'Creating meaningful branching narratives' },
          { id: 'theme', name: 'Theme Engine', icon: '🎨', description: 'Integrating thematic elements throughout' },
          { id: 'living', name: 'Living World Engine', icon: '🌱', description: 'Making the world feel alive and reactive' },
          { id: 'trope', name: 'Trope Engine', icon: '🔄', description: 'Subverting and enhancing genre conventions' },
          { id: 'cohesion', name: 'Cohesion Engine', icon: '🔗', description: 'Ensuring story elements connect logically' }
        ]}
        currentEngineIndex={Math.floor((loadingProgress / 100) * 12)}
      />

      {/* Twinkling Logo Loading Screen */}
      <AnimatePresence>
        {showLogoLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-48 h-48 flex items-center justify-center mx-auto mb-8"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 1, 0.4],
                    filter: [
                      "brightness(0.8) drop-shadow(0 0 20px rgba(0, 255, 153, 0.4))",
                      "brightness(1.5) drop-shadow(0 0 40px rgba(0, 255, 153, 0.8))",
                      "brightness(0.8) drop-shadow(0 0 20px rgba(0, 255, 153, 0.4))"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-40 h-40"
                >
                  <img 
                    src="/greenlitailogo.png" 
                    alt="Greenlit Logo" 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </motion.div>
              
              {/* "You're Already Greenlit" text */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-4xl md:text-6xl font-bold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #10B981, #ffffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)'
                }}
              >
                You're Already Greenlit.
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative flex flex-col items-center justify-center min-h-screen py-8">
        {/* Cinematic Introduction Sequence */}
      <AnimatePresence>
        {showIntroduction && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
              className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                  filter: [
                    "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))",
                    "brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 153, 0.6))",
                    "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))"
                  ]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16"
              >
                <img 
                  src="/greenlitailogo.png" 
                  alt="Greenlit Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
            
            {/* Emergency skip button */}
            <button 
              onClick={() => {
                setShowIntroduction(false)
                setIsFormVisible(true)
              }}
              className="mt-4 px-4 py-2 bg-[#10B981] text-black rounded-lg text-sm"
            >
              Skip Introduction
            </button>
              
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-7xl font-bold mb-4 font-medium greenlit-gradient"
              >
                GREENLIT
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-2xl text-white font-semibold font-medium"
              >
                The Studio System is Broken. Build Your Own.
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-8 text-[#10B981] text-lg font-medium"
              >
                ⚡ Initializing Production Systems...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Ember Particles */}
      {showEmberParticles && (
        <div className="fixed inset-0 pointer-events-none z-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#10B981] rounded-full opacity-40"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 50,
                scale: 0 
              }}
              animate={{ 
                y: -50, 
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: Math.random() * 3 + 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
      
        {/* Hero Section */}
          {isFormVisible && (
        <div className="max-w-6xl w-full mx-auto px-4">
          {/* Guest Warning Banner - Compact */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
              className={`mb-3 bg-gradient-to-r ${isDark ? 'from-orange-500/10 to-yellow-500/10 border-orange-500/30' : 'from-orange-100 to-yellow-100 border-orange-300'} border rounded-lg p-2`}
                >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚠️</span>
                  <p className={`${isDark ? 'text-white' : 'text-black'} text-xs font-medium`}>Not logged in - saved locally only</p>
                    </div>
                    <button
                      onClick={() => router.push('/login')}
                  className="px-3 py-1 bg-[#10B981] text-black font-bold rounded text-xs whitespace-nowrap hover:bg-[#059669] transition-colors"
                    >
                  Login
                    </button>
                  </div>
                </motion.div>
              )}

          {/* Simplified Header */}
          <div className="relative w-full mb-6 mt-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-1 font-medium greenlit-gradient tracking-tight">
                Writers' Room
              </h1>
              <p className={`text-sm ${isDark ? 'text-white/90' : 'text-black/90'} font-medium`}>
                Let's co-write your story.
                  </p>
                </div>
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-0 right-0">
              <GlobalThemeToggle />
            </div>
                      </div>
                      
          {/* Guided Co-Writer Form - Progressive Disclosure */}
          <div className="space-y-4">
            {/* Co-Writer Avatar */}
            <div>
              <CoWriterAvatar
                currentField={currentField}
                content={currentPlaybookContent}
                isTyping={isTyping}
                visualStyle="conversational"
              />
                        </div>
                      
            {/* Progress Indicator with Back Button */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {/* Back Button */}
                {currentFieldNumber > 1 && (
                  <button
                    onClick={handlePreviousField}
                    className={`flex items-center gap-1 text-sm font-medium ${isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'} transition-colors`}
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                )}
              <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                  {currentField === 'advanced' ? 'Advanced Settings' : 
                   currentField === 'characterCreator' ? 'Character Creator' : 
                   currentField === 'additionalInfo' ? 'Additional Information' : 
                   `Question ${currentFieldNumber} of 6`}
              </span>
              </div>
              <div className="flex gap-1">
                {fieldOrder.map((field, index) => (
                  <div
                    key={field}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index < currentFieldNumber
                        ? 'bg-[#10B981]'
                        : index === currentFieldNumber - 1
                        ? 'bg-[#10B981] ring-2 ring-[#10B981]/50'
                        : isDark
                        ? 'bg-white/20'
                        : 'bg-black/20'
                    }`}
                  />
                  ))}
                </div>
                    </div>

                  {/* Current Field Input */}
                  <div className="relative">
                      {currentField === 'logline' && (
                        <>
                          <label htmlFor="logline" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      1. The Story: What's the epic tale you're about to tell?
                    </label>
                      <textarea
                        id="logline"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                        style={isDark ? {} : {
                          backgroundColor: '#FFFFFF',
                          color: '#1A1A1A',
                          border: '1px solid #E2E8F0',
                          padding: '0.75rem',
                          borderRadius: '0.375rem',
                          width: '100%',
                            minHeight: '80px',
                            maxHeight: `${maxTextareaHeight}px`,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                        rows={3}
                        placeholder="(e.g., A hopeless romantic architect tells his kids the epic story of how he met their mother, recounting years of dating mishaps, friendship drama, and the one that got away - all while sitting in a booth at MacLaren's Pub.)"
                        value={logline}
                        onChange={(e) => handleTextareaChange(e, setLogline)}
                        ref={(el) => {
                          if (el && currentField === 'logline') {
                            autoResizeTextarea(el)
                          }
                        }}
                      />
                        </>
                      )}
                      
                      {currentField === 'protagonist' && (
                        <>
                          <label htmlFor="protagonist" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      2. The Hero: Who's the main character we'll root for through every twist and turn?
                    </label>
                      <textarea
                        id="protagonist"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                        style={isDark ? {} : {
                          backgroundColor: '#FFFFFF',
                          color: '#1A1A1A',
                          border: '1px solid #E2E8F0',
                          padding: '0.75rem',
                          borderRadius: '0.375rem',
                          width: '100%',
                          minHeight: '60px',
                          maxHeight: `${maxTextareaHeight}px`,
                          overflowY: 'auto'
                        }}
                        rows={2}
                        placeholder="(e.g., Ted Mosby, a 27-year-old architect with an idealistic view of love and destiny. He's searching for 'the one' while navigating the chaotic world of dating in New York City with his best friends Marshall, Lily, Barney, and Robin.)"
                        value={protagonist}
                        onChange={(e) => handleTextareaChange(e, setProtagonist)}
                        ref={(el) => {
                          if (el && currentField === 'protagonist') {
                            autoResizeTextarea(el)
                          }
                        }}
                      />
                        </>
                      )}
                      
                      {currentField === 'setting' && (
                        <>
                          <label htmlFor="setting" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      3. The World: Where and when does your story take place?
                    </label>
                      <textarea
                        id="setting"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                          style={isDark ? {} : {
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            border: '1px solid #E2E8F0',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            width: '100%',
                            minHeight: '80px',
                            maxHeight: `${maxTextareaHeight}px`,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        rows={3}
                        placeholder="(e.g., Set in early 2000s New York City—specifically the Upper West Side where Ted and his friends live, work, and hang out. The story unfolds across iconic locations like MacLaren's Pub (their regular spot), Ted's apartment, Marshall and Lily's place, and various dating locations throughout Manhattan. It's a city where anything can happen, and every corner holds a potential love story or life-changing moment.)"
                        value={setting}
                        onChange={(e) => handleTextareaChange(e, setSetting)}
                        ref={(el) => {
                          if (el && currentField === 'setting') {
                            autoResizeTextarea(el)
                          }
                        }}
                      />
                        </>
                      )}
                      
                      {currentField === 'stakes' && (
                        <>
                          <label htmlFor="stakes" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      4. The Drama: What's at risk if our hero doesn't succeed?
                    </label>
                      <textarea
                        id="stakes"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                        style={isDark ? {} : {
                          backgroundColor: '#FFFFFF',
                          color: '#1A1A1A',
                          border: '1px solid #E2E8F0',
                          padding: '0.75rem',
                          borderRadius: '0.375rem',
                          width: '100%',
                          minHeight: '60px',
                          maxHeight: `${maxTextareaHeight}px`,
                          overflowY: 'auto'
                        }}
                        rows={2}
                        placeholder="(e.g., If Ted doesn't find true love soon, he'll settle for someone who's 'good enough' and miss out on the epic romance he's been waiting for. Meanwhile, Marshall and Lily's relationship faces the ultimate test as they navigate career changes and the pressure to start a family.)"
                        value={stakes}
                        onChange={(e) => handleTextareaChange(e, setStakes)}
                        ref={(el) => {
                          if (el && currentField === 'stakes') {
                            autoResizeTextarea(el)
                          }
                        }}
                      />
                        </>
                      )}
                      
                      {currentField === 'vibe' && (
                        <>
                          <label htmlFor="vibe" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      5. The Feel: What's the mood and energy? ('X meets Y' format works best)
                    </label>
                          <textarea
                        id="vibe"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                            style={isDark ? {} : {
                              backgroundColor: '#FFFFFF',
                              color: '#1A1A1A',
                              border: '1px solid #E2E8F0',
                              padding: '0.75rem',
                              borderRadius: '0.375rem',
                              width: '100%',
                              minHeight: '80px',
                              maxHeight: `${maxTextareaHeight}px`,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                        rows={3}
                        placeholder="(e.g., Witty ensemble comedy with heart and nostalgia. 'Friends' meets 'The Wonder Years' with a romantic twist - think warm, relatable humor mixed with genuine emotional moments and clever storytelling.)"
                        value={vibe}
                            onChange={(e) => handleTextareaChange(e, setVibe)}
                            ref={(el) => {
                              if (el && currentField === 'vibe') {
                                autoResizeTextarea(el)
                              }
                            }}
                          />
                        </>
                      )}
                      
                      {currentField === 'theme' && (
                        <>
                          <label htmlFor="theme" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                      6. The Heart: What deeper message will resonate with your audience?
                    </label>
                          <textarea
                        id="theme"
                        className={`resize-none ${isDark ? 'input-field' : ''}`}
                            style={isDark ? {} : {
                              backgroundColor: '#FFFFFF',
                              color: '#1A1A1A',
                              border: '1px solid #E2E8F0',
                              padding: '0.75rem',
                              borderRadius: '0.375rem',
                              width: '100%',
                              minHeight: '80px',
                              maxHeight: `${maxTextareaHeight}px`,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                        rows={3}
                        placeholder="(e.g., The journey to finding true love, The importance of friendship and chosen family, Growing up and accepting change, The difference between settling and finding 'the one', The power of timing in relationships.)"
                        value={theme}
                            onChange={(e) => handleTextareaChange(e, setTheme)}
                            ref={(el) => {
                              if (el && currentField === 'theme') {
                                autoResizeTextarea(el)
                              }
                            }}
                          />
                        </>
                      )}
                      
                    </div>

                  {/* Continue Button - show for fields 1-6 and characterCreator/additionalInfo */}
                  {currentFieldNumber <= 6 && (
                    <button
                      onClick={handleNextField}
                      disabled={!isCurrentFieldFilled()}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                        isCurrentFieldFilled()
                          ? isDark 
                            ? 'bg-[#10B981] text-black hover:bg-[#059669] cursor-pointer'
                            : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                          : `${isDark ? 'bg-white/10 text-white/50' : 'bg-black/10 text-black/50'} cursor-not-allowed`
                      }`}
                    >
                      Continue (Ctrl+Enter / Cmd+Enter)
                    </button>
                  )}
                  
                  {/* 6th Field: Advanced Settings Screen */}
                  {currentField === 'advanced' && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      {/* Toggle Switch for Advanced Settings */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1A1A1A]/50' : 'bg-white/50'} border border-[#10B981]/20`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                              Use Advanced Settings
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                              Customize your story generation with detailed options
                            </p>
                          </div>
                    <button
                            onClick={() => setUseAdvancedSettings(!useAdvancedSettings)}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                              useAdvancedSettings ? 'bg-[#10B981]' : isDark ? 'bg-white/20' : 'bg-black/20'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                                useAdvancedSettings ? 'translate-x-8' : 'translate-x-1'
                              }`}
                            />
                    </button>
                        </div>
                      </div>

                      {/* Advanced Settings Sections */}
                  <AnimatePresence>
                        {useAdvancedSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            {/* Core Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('core')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Core Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('core') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('core') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Series Title */}
                                  <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Series Title (Optional - AI will generate if left empty)
                                    </label>
                                    <input
                                      type="text"
                                      value={advancedSettings.seriesTitle}
                                      onChange={(e) => updateAdvancedSetting('seriesTitle', e.target.value)}
                                      placeholder="Leave empty for AI to decide"
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    />
                                  </div>
                                  {/* Initial Characters */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Initial Character Count
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={advancedSettings.initialCharacterCount || ''}
                                      onChange={(e) => updateAdvancedSetting('initialCharacterCount', e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="AI decides"
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    />
                                  </div>
                                  {/* Genre */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Genre
                                    </label>
                                    <select
                                      value={advancedSettings.genre}
                                      onChange={(e) => updateAdvancedSetting('genre', e.target.value)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      {GENRE_OPTIONS.map((genre) => (
                                        <option key={genre.value} value={genre.value}>{genre.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Tone Slider */}
                                  <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Tone: {advancedSettings.tone <= 33 ? 'Gritty' : advancedSettings.tone >= 67 ? 'Lighthearted' : 'Balanced'}
                                    </label>
                                    <div className="flex items-center gap-4">
                                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>Gritty</span>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={advancedSettings.tone}
                                        onChange={(e) => updateAdvancedSetting('tone', parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gradient-to-r from-gray-600 via-gray-400 to-yellow-300 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                                      />
                                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>Lighthearted</span>
                                    </div>
                                  </div>
                                  {/* Mature Themes */}
                                  <div className="flex items-center justify-between">
                                    <label className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                                      Mature Themes (R16+)
                                    </label>
                                    <button
                                      onClick={() => updateAdvancedSetting('matureThemes', !advancedSettings.matureThemes)}
                                      className={`relative w-12 h-6 rounded-full transition-colors ${
                                        advancedSettings.matureThemes ? 'bg-[#10B981]' : isDark ? 'bg-white/20' : 'bg-black/20'
                                      }`}
                                    >
                                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                        advancedSettings.matureThemes ? 'translate-x-6' : 'translate-x-0.5'
                                      }`} />
                                    </button>
                                  </div>
                                  {/* Dialogue Language */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Dialogue Language
                                    </label>
                                    <select
                                      value={advancedSettings.dialogueLanguage}
                                      onChange={(e) => updateAdvancedSetting('dialogueLanguage', e.target.value)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      {LANGUAGE_OPTIONS.map((lang) => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}
                        </div>
                        
                            {/* Structural Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('structural')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Structural Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('structural') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('structural') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Series Length */}
                          <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Target Series Length
                            </label>
                            <select
                                      value={advancedSettings.seriesLength}
                                      onChange={(e) => {
                                        const preset = SERIES_LENGTH_OPTIONS.find(o => o.value === e.target.value)
                                        updateAdvancedSetting('seriesLength', e.target.value as any)
                                        if (preset) {
                                          updateAdvancedSetting('episodesPerArc', preset.episodesPerArc)
                                        }
                                      }}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      {SERIES_LENGTH_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                            </select>
                                  </div>
                                  {/* Episodes per Arc */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Episodes per Arc
                                    </label>
                                    <input
                                      type="number"
                                      min="4"
                                      max="20"
                                      value={advancedSettings.episodesPerArc}
                                      onChange={(e) => updateAdvancedSetting('episodesPerArc', parseInt(e.target.value) || 8)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    />
                                  </div>
                                  {/* Ending Type */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Ending Type
                                    </label>
                                    <select
                                      value={advancedSettings.endingType}
                                      onChange={(e) => updateAdvancedSetting('endingType', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="open-ended">Open-ended / Cliffhanger</option>
                                      <option value="conclusive">Conclusive</option>
                                      <option value="ambiguous">Ambiguous</option>
                                      <option value="cyclical">Cyclical</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                          </div>
                          
                            {/* Narrative Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('narrative')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Narrative Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('narrative') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('narrative') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* POV Style */}
                          <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Point of View Style
                            </label>
                            <select
                                      value={advancedSettings.povStyle}
                                      onChange={(e) => updateAdvancedSetting('povStyle', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="single">Single Protagonist</option>
                                      <option value="ensemble">Ensemble Cast</option>
                                      <option value="rotating">Rotating POV</option>
                                      <option value="unreliable">Unreliable Narrator</option>
                            </select>
                                  </div>
                                  {/* Timeline Structure */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Timeline Structure
                                    </label>
                                    <select
                                      value={advancedSettings.timelineStructure}
                                      onChange={(e) => updateAdvancedSetting('timelineStructure', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="linear">Linear</option>
                                      <option value="non-linear">Non-linear / Flashbacks</option>
                                      <option value="multiple">Multiple Timelines</option>
                                      <option value="real-time">Real-time</option>
                                    </select>
                                  </div>
                                  {/* Conflict Type */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Conflict Type
                                    </label>
                                    <select
                                      value={advancedSettings.conflictType}
                                      onChange={(e) => updateAdvancedSetting('conflictType', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="internal">Internal (Psychological)</option>
                                      <option value="interpersonal">Interpersonal</option>
                                      <option value="external">External (Environment/Society)</option>
                                      <option value="cosmic">Cosmic / Existential</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                          </div>
                          
                            {/* Character Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('character')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Character Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('character') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('character') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Protagonist Morality */}
                          <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Protagonist Morality
                            </label>
                            <select
                                      value={advancedSettings.protagonistMorality}
                                      onChange={(e) => updateAdvancedSetting('protagonistMorality', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="heroic">Heroic</option>
                                      <option value="anti-hero">Anti-hero</option>
                                      <option value="ambiguous">Morally Ambiguous</option>
                                      <option value="villain">Villain Protagonist</option>
                            </select>
                                  </div>
                                  {/* Romance Subplot */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Romance Subplot
                                    </label>
                                    <select
                                      value={advancedSettings.romanceSubplot}
                                      onChange={(e) => updateAdvancedSetting('romanceSubplot', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="none">None</option>
                                      <option value="light">Light / Background</option>
                                      <option value="central">Central Plot Element</option>
                                      <option value="primary">Primary Focus</option>
                                    </select>
                                  </div>
                                  {/* Character Age Range */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Character Age Range
                                    </label>
                                    <select
                                      value={advancedSettings.characterAgeRange}
                                      onChange={(e) => updateAdvancedSetting('characterAgeRange', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="children">Children</option>
                                      <option value="teens">Teens</option>
                                      <option value="young-adults">Young Adults</option>
                                      <option value="adults">Adults</option>
                                      <option value="mixed">Mixed Generations</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                          </div>
                          
                            {/* Production Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('production')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Production Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('production') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('production') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Setting Scope */}
                          <div>
                                <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Setting Scope
                            </label>
                            <select
                                      value={advancedSettings.settingScope}
                                      onChange={(e) => updateAdvancedSetting('settingScope', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="single">Single Location (Bottle Show)</option>
                                      <option value="limited">Limited Locations</option>
                                      <option value="multiple">Multiple Locations</option>
                                      <option value="epic">Epic Scope</option>
                            </select>
                          </div>
                                  {/* Visual Style */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Visual Style
                                    </label>
                                    <select
                                      value={advancedSettings.visualStyle}
                                      onChange={(e) => updateAdvancedSetting('visualStyle', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="realistic">Realistic / Grounded</option>
                                      <option value="stylized">Stylized</option>
                                      <option value="surreal">Surreal</option>
                                      <option value="documentary">Documentary-style</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Audience Settings Section */}
                            <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-[#1A1A1A]/30' : 'border-black/10 bg-white/30'} overflow-hidden`}>
                              <button
                                onClick={() => toggleSection('audience')}
                                className={`w-full p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Audience Settings</span>
                                <span className={`${isDark ? 'text-white/60' : 'text-black/60'}`}>{expandedSections.has('audience') ? '▼' : '▶'}</span>
                              </button>
                              {expandedSections.has('audience') && (
                                <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Humor Level */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Humor Level
                                    </label>
                                    <select
                                      value={advancedSettings.humorLevel}
                                      onChange={(e) => updateAdvancedSetting('humorLevel', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="serious">Serious / No Humor</option>
                                      <option value="occasional">Occasional Levity</option>
                                      <option value="dark-comedy">Dark Comedy</option>
                                      <option value="full-comedy">Full Comedy</option>
                                    </select>
                                  </div>
                                  {/* Violence Level */}
                                  <div>
                                    <label className={`block text-sm font-medium ${isDark ? 'text-white/80' : 'text-black/80'} mb-2`}>
                                      Violence Level
                                    </label>
                                    <select
                                      value={advancedSettings.violenceLevel}
                                      onChange={(e) => updateAdvancedSetting('violenceLevel', e.target.value as any)}
                                      className={`w-full px-4 py-3 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-black'} border border-[#10B981]/20 rounded-lg focus:outline-none focus:border-[#10B981]/40`}
                                    >
                                      <option value="none">None</option>
                                      <option value="implied">Implied</option>
                                      <option value="moderate">Moderate</option>
                                      <option value="graphic">Graphic (may trigger content moderation)</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Continue Button for Advanced Settings */}
                  <button
                    onClick={handleNextField}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      isDark 
                        ? 'bg-[#10B981] text-black hover:bg-[#059669] cursor-pointer'
                        : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                    }`}
                  >
                    Continue (Ctrl+Enter / Cmd+Enter)
                  </button>
                    </motion.div>
                  )}
                  
                  {/* 7th Field: Character Creator (only if advanced settings is ON) */}
                  {currentField === 'characterCreator' && useAdvancedSettings && (
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <label htmlFor="characterInfo" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                          Character Information: Share details about other characters in your story (Optional)
                        </label>
                        <textarea
                          id="characterInfo"
                          className={`resize-none ${isDark ? 'input-field' : ''}`}
                          style={isDark ? {} : {
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            border: '1px solid #E2E8F0',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            width: '100%',
                            minHeight: '150px',
                            maxHeight: `${maxTextareaHeight}px`,
                            overflowY: 'auto'
                          }}
                          rows={6}
                          placeholder="(e.g., Barney Stinson - Suit-obsessed womanizer with elaborate schemes and catchphrases. Best friend of Ted, known for his 'Bro Code' and legendary dating strategies. Has a mysterious job and a hidden sensitive side.

--

Marshall Eriksen - Ted's best friend and roommate, a gentle giant from Minnesota. Environmental lawyer who loves his wife Lily more than anything. Known for his catchphrase 'Lawyered!' and his love of food.

--

Lily Aldrin - Marshall's wife and kindergarten teacher. The group's voice of reason who meddles in everyone's love lives. Has a shopping addiction and a dark side that occasionally surfaces.

--

Robin Scherbatsky - Canadian news anchor and Ted's on-again-off-again love interest. Independent, career-focused, and secretly loves dogs despite claiming to hate them. Has a complicated relationship with commitment.)"
                          value={characterInfo}
                          onChange={(e) => handleTextareaChange(e, setCharacterInfo)}
                          ref={(el) => {
                            if (el && currentField === 'characterCreator') {
                              autoResizeTextarea(el)
                            }
                          }}
                        />
                        <p className={`text-xs mt-2 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                          💡 Tip: Write as much or as little as you want for each character. Separate different characters with a blank line and "--" between them. The AI will use this information and generate the rest.
                        </p>
                      </div>
                      
                      {/* Continue Button for Character Creator */}
                      <button
                        onClick={handleNextField}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                          isDark 
                            ? 'bg-[#10B981] text-black hover:bg-[#059669] cursor-pointer'
                            : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        }`}
                      >
                        Continue (Ctrl+Enter / Cmd+Enter)
                      </button>
                    </motion.div>
                  )}
                  
                  {/* 8th Field: Additional Information (Last) */}
                  {currentField === 'additionalInfo' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <label htmlFor="additionalInfo" className={`block mb-2 ${isDark ? 'text-white' : 'text-black'} font-semibold text-base`}>
                          Additional Information: Anything else you'd like to share? (Optional)
                        </label>
                        <textarea
                          id="additionalInfo"
                          className={`resize-none ${isDark ? 'input-field' : ''}`}
                          style={isDark ? {} : {
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            border: '1px solid #E2E8F0',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            width: '100%',
                            minHeight: '100px',
                            maxHeight: `${maxTextareaHeight}px`,
                            overflowY: 'auto'
                          }}
                          rows={4}
                          placeholder="(e.g., The show is inspired by the creators' real-life experiences dating in New York City. Many of the stories are based on actual events from their friend group, including the legendary 'slap bet' and the 'naked man' strategy. The framing device of Ted telling the story to his kids was inspired by the creators wanting to tell their own kids about their dating adventures. The show explores themes of friendship, timing in relationships, and the idea that sometimes the journey is more important than the destination.)"
                          value={additionalInfo}
                          onChange={(e) => handleTextareaChange(e, setAdditionalInfo)}
                          ref={(el) => {
                            if (el && currentField === 'additionalInfo') {
                              autoResizeTextarea(el)
                            }
                          }}
                        />
                      </div>

                      {/* Generate Story Bible Button - Only on Additional Info screen */}
                      <motion.div 
                        className="pt-4"
                        initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                  >
                      <ProgressButton
              onClick={handleStart}
                        isLoading={isLoading}
                        progress={loadingProgress}
                          disabled={!allRequiredFieldsCompleted}
                        className="w-full py-6 text-xl"
                      >
                        {isLoading ? '✨ CREATING YOUR SERIES...' : 'Generate Story Bible →'}
                      </ProgressButton>
                    </motion.div>
                  </motion.div>
                  )}
              
                  {/* Generate Story Bible Button - For Advanced Settings screen if character creator is skipped */}
                  {currentField === 'advanced' && !useAdvancedSettings && (
              <motion.div
                      className="pt-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <ProgressButton
                        onClick={handleStart}
                        isLoading={isLoading}
                        progress={loadingProgress}
                        disabled={!allRequiredFieldsCompleted}
                        className="w-full py-6 text-xl"
                      >
                        {isLoading ? '✨ CREATING YOUR SERIES...' : 'Generate Story Bible →'}
                      </ProgressButton>
              </motion.div>
              )}
              </div>

              {/* Professional Footer */}
            </div>
          )}
      </main>
      
      {/* Pitch Playbook Modal */}
      <PitchPlaybookModal 
        isOpen={showPitchPlaybook} 
        onClose={() => setShowPitchPlaybook(false)} 
      />
      
    </div>
  )
}
