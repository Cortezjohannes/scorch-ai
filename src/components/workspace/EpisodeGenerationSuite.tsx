'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { saveEpisode, getEpisode, deleteEpisode, getEpisodesForStoryBible } from '@/services/episode-service'
import { saveEpisodeReflection, updateLockStatus } from '@/services/story-bible-firestore'
import { episodeReflectionService } from '@/services/episode-reflection-service'
import { storyBibleLock } from '@/services/story-bible-lock'
import EpisodeGenerationModal from '@/components/EpisodeGenerationModal'
import DuplicateEpisodeConfirmDialog from '@/components/DuplicateEpisodeConfirmDialog'
import GenerationErrorModal from '@/components/modals/GenerationErrorModal'
import VibeSettingsPanel from './generation/VibeSettingsPanel'
import BeatSheetEditor from './generation/BeatSheetEditor'
import ContextPanel from './generation/ContextPanel'

interface EpisodeGenerationSuiteProps {
  isOpen: boolean
  onClose: () => void
  episodeNumber: number
  storyBible: any
  storyBibleId?: string
  previousChoice?: string
  onComplete?: () => void
  onEpisodeChange?: (episodeNumber: number) => void
  onStoryBibleUpdate?: (updatedStoryBible: any) => void
}

interface VibeSettings {
  tone: number
  pacing: number
  dialogueStyle: number
}

interface BeatSheetGeneration {
  isGenerating: boolean
  error: string | null
  generatedBeats: string
}

interface ScriptGeneration {
  isGenerating: boolean
  error: string | null
}

export default function EpisodeGenerationSuite({
  isOpen,
  onClose,
  episodeNumber,
  storyBible,
  storyBibleId,
  previousChoice,
  onComplete,
  onEpisodeChange,
  onStoryBibleUpdate
}: EpisodeGenerationSuiteProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'

  // State management (preserving all existing functionality)
  const [episodeGoal, setEpisodeGoal] = useState('')
  const [beatSheet, setBeatSheet] = useState('')
  const [directorsNotes, setDirectorsNotes] = useState('')
  const [vibeSettings, setVibeSettings] = useState<VibeSettings>({
    tone: 50,
    pacing: 50,
    dialogueStyle: 50
  })
  
  const [premiumMode, setPremiumMode] = useState(true)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [generatedEpisodeData, setGeneratedEpisodeData] = useState<any>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [pendingGeneration, setPendingGeneration] = useState<(() => Promise<void>) | null>(null)
  
  const [beatSheetGen, setBeatSheetGen] = useState<BeatSheetGeneration>({
    isGenerating: false,
    error: null,
    generatedBeats: ''
  })
  
  const [scriptGen, setScriptGen] = useState<ScriptGeneration>({
    isGenerating: false,
    error: null
  })

  // Previous episode options for inspiration
  const [previousEpisodeOptions, setPreviousEpisodeOptions] = useState<any[]>([])
  const [showInspirationOptions, setShowInspirationOptions] = useState(false)
  const [analyzingChoice, setAnalyzingChoice] = useState(false)
  const [generatingChoices, setGeneratingChoices] = useState(false)

  // Previous episode for context
  const [previousEpisode, setPreviousEpisode] = useState<any>(null)
  const [allPreviousEpisodes, setAllPreviousEpisodes] = useState<any[]>([])
  const [previousEpisodeSummary, setPreviousEpisodeSummary] = useState<string>('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  
  // All episodes for rewrite functionality
  const [allEpisodes, setAllEpisodes] = useState<Record<number, any>>({})
  
  // Error Modal state
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalData, setErrorModalData] = useState<{
    message: string
    type: 'beat sheet' | 'episode'
    retryFunction: () => void
  } | null>(null)

  // Generation mode
  const [generationMode, setGenerationMode] = useState<'advanced' | 'yolo'>('advanced')

  // Track if form has been initialized to prevent reset after inspiration choice
  const [formInitialized, setFormInitialized] = useState(false)
  const [isRewriteMode, setIsRewriteMode] = useState(false)

  // Reset form when modal opens or episode number changes (but not if form was just filled by inspiration choice)
  useEffect(() => {
    if (isOpen && !formInitialized) {
      setEpisodeGoal('')
      setBeatSheet('')
      setDirectorsNotes('')
      setVibeSettings({ tone: 50, pacing: 50, dialogueStyle: 50 })
      setBeatSheetGen({ isGenerating: false, error: null, generatedBeats: '' })
      setScriptGen({ isGenerating: false, error: null })
      setPreviousEpisodeSummary('')
      setLoadingSummary(false)
      setFormInitialized(true)
      setIsRewriteMode(false)
    }
  }, [isOpen, episodeNumber, formInitialized])

  // Reset formInitialized when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormInitialized(false)
    }
  }, [isOpen])

  // Check if "Write the Episode" button should be enabled
  const canWriteScript = beatSheet.trim().length > 0 && !scriptGen.isGenerating

  // Load previous episode data for context and inspiration
  useEffect(() => {
    const loadPreviousEpisodes = async () => {
      try {
        let allEpisodesData: Record<number, any> = {}
        
        if (storyBibleId && user) {
          // Load all episodes from Firestore
          allEpisodesData = await getEpisodesForStoryBible(storyBibleId, user.id)
        } else {
          // Fallback to localStorage
          const savedEpisodes = localStorage.getItem('greenlit-episodes') || 
                              localStorage.getItem('scorched-episodes') || 
                              localStorage.getItem('reeled-episodes')
          
          if (savedEpisodes) {
            allEpisodesData = JSON.parse(savedEpisodes)
          }
        }
        
        // Store all episodes for rewrite functionality (always, regardless of episode number)
        setAllEpisodes(allEpisodesData)
        const episodeCount = Object.keys(allEpisodesData).length
        console.log(`✅ Loaded ${episodeCount} total episodes for rewrite functionality`)
        console.log('📋 Episodes:', Object.keys(allEpisodesData).map(k => `Ep ${k}`).join(', '))
        
        // Only load previous episode context if episodeNumber > 1
        if (episodeNumber <= 1) {
          setPreviousEpisode(null)
          setAllPreviousEpisodes([])
          return
        }
        
        // Get immediate previous episode
        const prevEp = allEpisodesData[episodeNumber - 1]
        if (prevEp) {
          setPreviousEpisode(prevEp)
          if (prevEp.branchingOptions && Array.isArray(prevEp.branchingOptions)) {
            setPreviousEpisodeOptions(prevEp.branchingOptions)
          }
        }
        
        // Get ALL previous episodes (episodes 1 through episodeNumber - 1)
        const previousEpisodesArray = Object.values(allEpisodesData)
          .filter((ep: any) => {
            const epNum = ep.episodeNumber || 0
            return epNum > 0 && epNum < episodeNumber
          })
          .sort((a: any, b: any) => {
            const aNum = a.episodeNumber || 0
            const bNum = b.episodeNumber || 0
            return aNum - bNum
          })
        
        setAllPreviousEpisodes(previousEpisodesArray)
        console.log(`✅ Loaded ${previousEpisodesArray.length} previous episodes for context`)
      } catch (error) {
        console.error('Error loading previous episodes:', error)
      }
    }
    
    loadPreviousEpisodes()
  }, [episodeNumber, storyBibleId, user])


  // Generate AI summary of previous episode
  const generatePreviousEpisodeSummary = async (prevEpisode: any) => {
    try {
      setLoadingSummary(true)
      
      const response = await fetch('/api/generate/previous-episode-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousEpisode: prevEpisode,
          seriesTitle: storyBible?.seriesTitle
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.summary) {
        setPreviousEpisodeSummary(data.summary)
      } else {
        throw new Error(data.error || 'No summary generated')
      }
    } catch (error: any) {
      console.error('Error generating previous episode summary:', error)
      if (prevEpisode.synopsis) {
        setPreviousEpisodeSummary(prevEpisode.synopsis)
      }
    } finally {
      setLoadingSummary(false)
    }
  }

  // Trigger summary generation when previous episode is loaded
  useEffect(() => {
    if (previousEpisode && episodeNumber > 1) {
      generatePreviousEpisodeSummary(previousEpisode)
    }
  }, [previousEpisode, episodeNumber])

  // STAGE 1: Generate Beat Sheet
  const handleGenerateBeatSheet = async (goalOverride?: string, autoGenerateEpisode?: boolean): Promise<boolean> => {
    const goalToUse = goalOverride || episodeGoal
    
    if (!goalToUse.trim()) {
      alert('Please enter an episode goal first')
      return false
    }

    setBeatSheetGen({ isGenerating: true, error: null, generatedBeats: '' })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000)

      const response = await fetch('/api/generate/beat-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          episodeGoal: goalToUse.trim(),
          previousChoice,
          previousEpisode, // Pass previous episode for context
          allPreviousEpisodes // Pass all previous episodes for full context
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.beatSheet) {
        setBeatSheet(data.beatSheet)
        setBeatSheetGen({ isGenerating: false, error: null, generatedBeats: data.beatSheet })
        
        // Auto-generate episode if requested (Quick mode)
        if (autoGenerateEpisode) {
          setTimeout(() => {
            handleWriteScript()
          }, 500)
        }
        
        return true
      } else {
        throw new Error(data.error || 'Failed to generate beat sheet')
      }
    } catch (error) {
      console.error('Beat sheet generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate beat sheet'
      
      setBeatSheetGen({ 
        isGenerating: false, 
        error: errorMessage,
        generatedBeats: ''
      })
      
      setErrorModalData({
        message: errorMessage,
        type: 'beat sheet',
        retryFunction: () => handleGenerateBeatSheet(goalToUse, autoGenerateEpisode)
      })
      setShowErrorModal(true)
      return false
    }
  }

  // Removed Quick mode - it was redundant with YOLO mode

  // Check for duplicate episodes before generation
  const checkForDuplicate = async (): Promise<boolean> => {
    if (!storyBibleId) return false
    try {
      const existing = await getEpisode(storyBibleId, episodeNumber, user?.id)
      return !!existing
    } catch (error) {
      console.error('Error checking for duplicate:', error)
      return false
    }
  }

  // STAGE 2: Generate Script
  const handleWriteScript = async () => {
    if (!beatSheet.trim()) {
      alert('Please generate or edit the beat sheet first')
      return
    }

    const isDuplicate = await checkForDuplicate()
    if (isDuplicate) {
      setPendingGeneration(() => () => doWriteScript())
      setShowDuplicateDialog(true)
      return
    }

    await doWriteScript()
  }

  const doWriteScript = async () => {
    setScriptGen({ isGenerating: true, error: null })
    setShowGenerationModal(true)

    try {
      // Get intelligent defaults for YOLO mode (Advanced uses user's vibe settings)
      const finalVibeSettings = generationMode === 'advanced' 
        ? vibeSettings 
        : await getIntelligentDefaults()
      
      const endpoint = premiumMode ? '/api/generate/episode-premium' : '/api/generate/episode-from-beats'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          beatSheet: beatSheet.trim(),
          vibeSettings: finalVibeSettings,
          directorsNotes: generationMode === 'advanced' ? directorsNotes.trim() : '',
          previousChoice,
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.episode) {
        const storyBibleId = storyBible?.id || `bible_${storyBible?.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
        
        const finalEpisode = {
          ...data.episode,
          episodeNumber,
          storyBibleId,
          _generationComplete: true,
          generationType: data.episode.generationType || (premiumMode ? 'premium-enhanced' : 'standard'),
          version: data.episode.version || 1,
          editCount: data.episode.editCount || 0,
          generatedAt: data.episode.generatedAt || new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: 'completed' as const,
          // Store vibe settings and generation settings for script generation
          vibeSettings: finalVibeSettings,
          generationSettings: {
            vibeSettings: finalVibeSettings,
            directorsNotes: generationMode === 'advanced' ? directorsNotes.trim() : '',
            beatSheet: beatSheet.trim()
          }
        }
        
        try {
          // Save episode and get the saved version with generated ID
          const savedEpisode = await saveEpisode(finalEpisode, storyBibleId, user?.id)
          
          if (user && storyBibleId) {
            try {
              const reflectionData = await episodeReflectionService.analyzeEpisode(
                savedEpisode,
                storyBible,
                []
              )
              
              await saveEpisodeReflection(
                user.id,
                storyBibleId,
                savedEpisode.id,
                reflectionData
              )
              
              const lockStatus = storyBibleLock.checkLockStatus(episodeNumber)
              await updateLockStatus(user.id, storyBibleId, lockStatus.isLocked, episodeNumber)
            } catch (reflectionError) {
              console.error('⚠️ Failed to save episode reflection:', reflectionError)
            }
          }
          
          setGeneratedEpisodeData(savedEpisode)
          
          setTimeout(() => {
            setShowGenerationModal(false)
            setScriptGen({ isGenerating: false, error: null })
            
            setTimeout(() => {
              const episodeUrl = storyBibleId 
                ? `/episode/${episodeNumber}?storyBibleId=${storyBibleId}`
                : `/episode/${episodeNumber}`
              router.push(episodeUrl)
              onComplete?.()
            }, 300)
          }, 1500)
        } catch (saveError: any) {
          console.error('❌ Failed to save episode:', saveError)
          setShowGenerationModal(false)
          setScriptGen({ isGenerating: false, error: null })
          
          if (saveError.message?.includes('AUTH_EXPIRED')) {
            const message = saveError.message.replace('AUTH_EXPIRED:', '')
            if (confirm(`${message}\n\nWould you like to go to the login page now?`)) {
              router.push('/login')
            }
            return
          }
          
          alert(`Failed to save episode: ${saveError.message}\n\nThe episode was generated but could not be saved. Please try again.`)
        }
      } else {
        throw new Error(data.error || 'Failed to generate script')
      }
    } catch (error) {
      console.error('Script generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate script'
      
      setShowGenerationModal(false)
      setScriptGen({ 
        isGenerating: false, 
        error: errorMessage
      })
      
      setErrorModalData({
        message: errorMessage,
        type: 'episode',
        retryFunction: () => doWriteScript()
      })
      setShowErrorModal(true)
    }
  }

  // YOLO Mode: One-click generation with intelligent defaults
  const handleYOLO = async () => {
    const isDuplicate = await checkForDuplicate()
    if (isDuplicate) {
      setPendingGeneration(() => () => doYOLO())
      setShowDuplicateDialog(true)
      return
    }

    await doYOLO()
  }

  const doYOLO = async () => {
    setScriptGen({ isGenerating: true, error: null })
    setShowGenerationModal(true)

    try {
      // Use orchestrator for intelligent defaults
      const response = await fetch('/api/generate/episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousChoice,
          previousEpisode,
          allPreviousEpisodes,
          useIntelligentDefaults: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.episode) {
        const storyBibleId = storyBible?.id || `bible_${storyBible?.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
        
        const finalEpisode = {
          ...data.episode,
          episodeNumber,
          storyBibleId,
          _generationComplete: true,
          generationType: 'yolo-intelligent',
          version: 1,
          generatedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: 'completed' as const
        }
        
        // Save episode and get the saved version with generated ID
        const savedEpisode = await saveEpisode(finalEpisode, storyBibleId, user?.id)
        
        // Save reflection and update lock status (authenticated users only)
        if (user && storyBibleId) {
          try {
            const reflectionData = await episodeReflectionService.analyzeEpisode(
              savedEpisode,
              storyBible,
              []
            )
            
            await saveEpisodeReflection(
              user.id,
              storyBibleId,
              savedEpisode.id,
              reflectionData
            )
            
            const lockStatus = storyBibleLock.checkLockStatus(episodeNumber)
            await updateLockStatus(user.id, storyBibleId, lockStatus.isLocked, episodeNumber)
          } catch (reflectionError) {
            console.error('⚠️ Failed to save episode reflection:', reflectionError)
          }
        }
        
        setGeneratedEpisodeData(savedEpisode)
        
        setTimeout(() => {
          setShowGenerationModal(false)
          setScriptGen({ isGenerating: false, error: null })
          
          setTimeout(() => {
            const episodeUrl = storyBibleId 
              ? `/episode/${episodeNumber}?storyBibleId=${storyBibleId}`
              : `/episode/${episodeNumber}`
            router.push(episodeUrl)
            onComplete?.()
          }, 300)
        }, 1500)
      } else {
        throw new Error(data.error || 'Failed to generate episode')
      }
    } catch (error) {
      console.error('YOLO generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate episode'
      
      setShowGenerationModal(false)
      setScriptGen({ 
        isGenerating: false, 
        error: errorMessage
      })
      
      setErrorModalData({
        message: errorMessage,
        type: 'episode',
        retryFunction: () => doYOLO()
      })
      setShowErrorModal(true)
    }
  }

  // Get intelligent defaults for vibe settings
  const getIntelligentDefaults = async (): Promise<VibeSettings> => {
    try {
      const response = await fetch('/api/analyze-story-for-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousChoice
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings?.vibeSettings) {
          return data.settings.vibeSettings
        }
      }
    } catch (error) {
      console.error('Error getting intelligent defaults:', error)
    }
    
    // Fallback to balanced defaults
    return {
      tone: 50,
      pacing: 50,
      dialogueStyle: 50
    }
  }

  // Handle inspiration choice selection - now uses orchestrator system with full episode context
  const handleInspirationChoice = async (option: any) => {
    try {
      // Show loading state
      setShowInspirationOptions(false)
      setAnalyzingChoice(true)
      setBeatSheetGen({ isGenerating: true, error: null, generatedBeats: '' })
      
      console.log('🔀 Using orchestrator system to analyze choice with full episode context...')
      console.log(`   Previous episode: ${previousEpisode ? 'Yes' : 'None'}`)
      console.log(`   All previous episodes: ${allPreviousEpisodes?.length || 0} episodes`)
      
      // Use the orchestrator's story analyzer which has access to all previous episodes
      const response = await fetch('/api/analyze-story-for-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible,
          episodeNumber,
          previousChoice: option.text, // Use the selected choice as previousChoice
          previousEpisode, // Pass the immediate previous episode
          allPreviousEpisodes // Pass all previous episodes for full context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze choice with episode context')
      }

      const data = await response.json()
      
      if (data.success && data.settings) {
        const settings = data.settings
        
        // Ensure form is marked as initialized to prevent reset
        setFormInitialized(true)
        
        // Fill all form fields with AI analysis (now includes previous episode context)
        setEpisodeGoal(settings.episodeGoal || option.text)
        
        if (settings.vibeSettings) {
          setVibeSettings({
            tone: settings.vibeSettings.tone || 50,
            pacing: settings.vibeSettings.pacing || 50,
            dialogueStyle: settings.vibeSettings.dialogueStyle || 50
          })
        }
        
        setDirectorsNotes(settings.directorsNotes || `Building on: "${option.text}"`)
        
        // Automatically generate beat sheet after AI analysis
        // The beat sheet generation will also use previousEpisode context
        const goalToGenerate = settings.episodeGoal || option.text
        setAnalyzingChoice(false) // Analysis complete, now generating beat sheet
        setTimeout(() => {
          handleGenerateBeatSheet(goalToGenerate, false)
        }, 500) // Small delay to ensure state is updated
      } else {
        // Fallback to simple fill if AI analysis fails
        setFormInitialized(true)
        setAnalyzingChoice(false)
        setEpisodeGoal(option.text)
        setDirectorsNotes(`Building on: "${option.text}"\n\n${option.description}`)
        
        setTimeout(() => {
          handleGenerateBeatSheet(option.text, false)
        }, 500)
      }
    } catch (error) {
      console.error('Error analyzing choice:', error)
      setAnalyzingChoice(false)
      // Fallback to simple fill
      setFormInitialized(true)
      setEpisodeGoal(option.text)
      setDirectorsNotes(`Building on: "${option.text}"\n\n${option.description}`)
      
      setTimeout(() => {
        handleGenerateBeatSheet(option.text, false)
      }, 500)
    }
  }

  // Get arc info for episode
  const getArcInfo = () => {
    if (!storyBible?.narrativeArcs) return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: episodeNumber, totalInArc: 10 }
    
    let runningCount = 0
    for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
      const arc = storyBible.narrativeArcs[i]
      const arcEpisodeCount = arc.episodes?.length || 10
      
      if (episodeNumber <= runningCount + arcEpisodeCount) {
        return {
          arcIndex: i,
          arcTitle: arc.title || `Arc ${i + 1}`,
          episodeInArc: episodeNumber - runningCount,
          totalInArc: arcEpisodeCount
        }
      }
      runningCount += arcEpisodeCount
    }
    
    return { arcIndex: 0, arcTitle: 'Arc 1', episodeInArc: episodeNumber, totalInArc: 10 }
  }

  const arcInfo = getArcInfo()

  // Check if we're near the end of the current arc (last 2 episodes)
  const isNearEndOfArc = arcInfo.episodeInArc >= arcInfo.totalInArc - 1
  const isLastArc = arcInfo.arcIndex === (storyBible?.narrativeArcs?.length || 1) - 1

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !scriptGen.isGenerating && !beatSheetGen.isGenerating) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, scriptGen.isGenerating, beatSheetGen.isGenerating])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Full-screen overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`absolute inset-4 md:inset-8 lg:inset-12 ${prefix}-card ${prefix}-border border rounded-xl overflow-hidden flex flex-col ${prefix}-shadow-lg`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="episode-generation-title"
            >
              {/* Header */}
              <div className={`h-16 md:h-20 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-4 md:px-6 flex-shrink-0`}>
                <div className="flex-1 min-w-0">
                  <h1 id="episode-generation-title" className={`text-base md:text-lg font-bold ${prefix}-text-primary truncate`}>
                    Episode {episodeNumber}: {storyBible?.narrativeArcs?.[arcInfo.arcIndex]?.episodes?.[arcInfo.episodeInArc - 1]?.title || `Episode ${episodeNumber}`}
                  </h1>
                  <p className={`text-xs ${prefix}-text-secondary truncate`}>
                    {arcInfo.arcTitle} • Episode {arcInfo.episodeInArc} of {arcInfo.totalInArc}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  {/* Mode Selector */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setGenerationMode('advanced')}
                      className={`px-2 md:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        generationMode === 'advanced'
                          ? `${prefix}-bg-accent ${prefix}-text-accent shadow-md`
                          : `${prefix}-text-secondary hover:${prefix}-bg-secondary`
                      }`}
                      aria-pressed={generationMode === 'advanced'}
                    >
                      Advanced
                    </button>
                    <button
                      onClick={() => setGenerationMode('yolo')}
                      className={`px-2 md:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        generationMode === 'yolo'
                          ? `${prefix}-bg-accent ${prefix}-text-accent shadow-md`
                          : `${prefix}-text-secondary hover:${prefix}-bg-secondary`
                      }`}
                      aria-pressed={generationMode === 'yolo'}
                    >
                      YOLO
                    </button>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={scriptGen.isGenerating || beatSheetGen.isGenerating}
                    className={`text-xl md:text-2xl ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors p-1 rounded hover:${prefix}-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Three-Panel Layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Sidebar: Episode Info & Quick Actions (20%) */}
                <div className={`hidden md:block w-64 border-r ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto flex-shrink-0`}>
                  <div className="mb-4">
                    <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Episode Context</h3>
                    <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border mb-2`}>
                      <div className={`text-xs ${prefix}-text-secondary mb-1`}>Arc</div>
                      <div className={`text-sm font-medium ${prefix}-text-primary`}>{arcInfo.arcTitle}</div>
                    </div>
                    {storyBible?.mainCharacters && (
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs ${prefix}-text-secondary mb-2`}>Characters</div>
                        <div className="flex gap-1 flex-wrap">
                          {storyBible.mainCharacters.slice(0, 4).map((char: any, idx: number) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xs font-bold text-[#10B981]"
                              title={char.name}
                            >
                              {char.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {storyBible.mainCharacters.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-[#36393f] flex items-center justify-center text-xs text-[#e7e7e7]/50">
                              +{storyBible.mainCharacters.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Quick Actions</h3>
                    {episodeNumber > 1 && (previousEpisode || allPreviousEpisodes.length > 0) && (
                      <button
                        onClick={async () => {
                          setGeneratingChoices(true)
                          setShowInspirationOptions(true)
                          
                          try {
                            // Generate NEW choice recommendations based on all previous episodes
                            const response = await fetch('/api/generate/choice-recommendations', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                storyBible,
                                episodeNumber,
                                previousEpisode,
                                allPreviousEpisodes
                              })
                            })
                            
                            if (!response.ok) {
                              throw new Error('Failed to generate choice recommendations')
                            }
                            
                            const data = await response.json()
                            
                            if (data.success && data.choices) {
                              setPreviousEpisodeOptions(data.choices)
                              console.log(`✅ Generated ${data.choices.length} new choice recommendations`)
                            } else {
                              throw new Error('Invalid response format')
                            }
                          } catch (error) {
                            console.error('Error generating choice recommendations:', error)
                            // Fallback to previous episode's choices if generation fails
                            if (previousEpisode?.branchingOptions) {
                              setPreviousEpisodeOptions(previousEpisode.branchingOptions)
                            }
                          } finally {
                            setGeneratingChoices(false)
                          }
                        }}
                        disabled={generatingChoices}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium mb-2 ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-wait`}
                      >
                        {generatingChoices ? '🤖 Analyzing Story...' : 'Use Previous Episode Choice'}
                      </button>
                    )}
                    {episodeNumber > 1 && (
                      <button
                        onClick={() => {
                          const prevEpisodeNum = episodeNumber - 1
                          console.log(`🔄 Rewriting previous episode ${prevEpisodeNum}`)
                          console.log('onEpisodeChange available:', !!onEpisodeChange)
                          console.log('Current episode number:', episodeNumber)
                          console.log('Previous episode exists:', !!allEpisodes[prevEpisodeNum])
                          
                          // Reset form initialization flag - this will trigger useEffect to reset form when episode number changes
                          setFormInitialized(false)
                          setIsRewriteMode(true)
                          
                          // Change to previous episode number - this will trigger useEffect to reload data and reset form
                          if (onEpisodeChange) {
                            console.log('Calling onEpisodeChange with:', prevEpisodeNum)
                            onEpisodeChange(prevEpisodeNum)
                          } else {
                            console.error('❌ onEpisodeChange callback not provided')
                            console.error('This should not happen - callback should be provided by parent component')
                          }
                        }}
                        disabled={!onEpisodeChange}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium mb-2 border ${prefix}-border ${prefix === 'dark' ? 'bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' : 'bg-[#C9A961]/10 hover:bg-[#C9A961]/20 text-[#C9A961] border-[#C9A961]/30'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        🔄 Rewrite Previous Episode
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const storyBibleId = storyBible?.id || `bible_${storyBible?.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
                        router.push(`/story-bible?id=${storyBibleId}`)
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary transition-colors`}
                    >
                      View Story Bible
                    </button>
                  </div>
                </div>

                {/* Center Panel: Creative Controls (50%) */}
                <div className={`flex-1 ${prefix}-bg-primary p-4 md:p-6 overflow-y-auto relative`}>
                  {/* Prominent Loading Indicator */}
                  {(analyzingChoice || beatSheetGen.isGenerating) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-4 left-4 right-4 z-10 ${prefix}-bg-accent/90 ${prefix}-border border-2 ${prefix}-border-accent rounded-lg p-4 shadow-lg backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 border-2 ${prefix === 'dark' ? 'border-[#10B981]' : 'border-[#C9A961]'} border-t-transparent rounded-full animate-spin flex-shrink-0`}></span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${prefix}-text-primary`}>
                            {analyzingChoice 
                              ? '🤖 AI is analyzing your choice and generating content...' 
                              : beatSheetGen.isGenerating 
                              ? '📋 Generating beat sheet...' 
                              : 'Generating...'}
                          </p>
                          <p className={`text-xs ${prefix}-text-secondary mt-0.5`}>
                            {analyzingChoice 
                              ? 'This may take 10-30 seconds. Please wait...' 
                              : 'Creating detailed narrative beats for your episode...'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-6" style={{ marginTop: (analyzingChoice || beatSheetGen.isGenerating) ? '80px' : '0' }}>
                    {/* Episode Goal */}
                    <div className="relative">
                      <label className={`text-sm font-semibold ${prefix}-text-primary mb-2 block`}>
                        Episode Goal
                        {analyzingChoice && (
                          <span className={`ml-2 text-xs ${prefix}-text-accent flex items-center gap-1`}>
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                            Analyzing choice...
                          </span>
                        )}
                      </label>
                      <textarea
                        value={episodeGoal}
                        onChange={(e) => setEpisodeGoal(e.target.value)}
                        disabled={analyzingChoice}
                        className={`w-full min-h-[120px] p-3 rounded-lg ${prefix}-card ${prefix}-border resize-y ${prefix}-text-primary focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-70 disabled:cursor-wait`}
                        placeholder="What should this episode accomplish? What character development or plot points need to happen?"
                      />
                      <div className={`text-xs mt-1 ${prefix}-text-tertiary`}>
                        {episodeGoal.length} characters
                      </div>
                    </div>

                    {/* Vibe Settings (Advanced Mode Only) */}
                    {generationMode === 'advanced' && (
                      <VibeSettingsPanel
                        vibeSettings={vibeSettings}
                        onSettingsChange={setVibeSettings}
                        theme={theme}
                      />
                    )}

                    {/* Beat Sheet */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-semibold ${prefix}-text-primary`}>
                          Beat Sheet
                        </label>
                        <div className="flex gap-2">
                          {!beatSheet && (
                            <button
                              onClick={() => handleGenerateBeatSheet()}
                              disabled={beatSheetGen.isGenerating || !episodeGoal.trim()}
                              className={`text-xs ${prefix}-text-accent hover:underline disabled:opacity-50`}
                            >
                              {beatSheetGen.isGenerating ? 'Generating...' : 'Auto-Generate'}
                            </button>
                          )}
                          {beatSheet && (
                            <button
                              onClick={() => handleGenerateBeatSheet()}
                              disabled={beatSheetGen.isGenerating}
                              className={`text-xs ${prefix}-text-secondary hover:underline disabled:opacity-50`}
                            >
                              Regenerate
                            </button>
                          )}
                        </div>
                      </div>
                      <BeatSheetEditor
                        value={beatSheet}
                        onChange={setBeatSheet}
                        isGenerating={beatSheetGen.isGenerating}
                        theme={theme}
                      />
                    </div>

                    {/* Director's Notes (Advanced Mode Only) */}
                    {generationMode === 'advanced' && (
                      <div className="relative">
                        <label className={`text-sm font-semibold ${prefix}-text-primary mb-2 block`}>
                          Director's Notes
                          {analyzingChoice && (
                            <span className={`ml-2 text-xs ${prefix}-text-accent flex items-center gap-1`}>
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Analyzing choice...
                            </span>
                          )}
                        </label>
                        <textarea
                          value={directorsNotes}
                          onChange={(e) => setDirectorsNotes(e.target.value)}
                          disabled={analyzingChoice}
                          className={`w-full min-h-[160px] p-3 rounded-lg ${prefix}-card ${prefix}-border resize-y ${prefix}-text-primary focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-70 disabled:cursor-wait`}
                          placeholder="Any specific direction, tone notes, or production considerations..."
                        />
                      </div>
                    )}

                    {/* Premium Mode Toggle */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="premium-mode"
                        checked={premiumMode}
                        onChange={(e) => setPremiumMode(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="premium-mode" className={`text-sm ${prefix}-text-secondary`}>
                        Premium Mode (19 engines)
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      {generationMode === 'yolo' ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleYOLO}
                          disabled={scriptGen.isGenerating}
                          className={`flex-1 px-4 md:px-6 py-3 rounded-lg font-bold text-base md:text-lg ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${prefix}-shadow-md hover:${prefix}-shadow-lg`}
                        >
                          {scriptGen.isGenerating ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Generating...
                            </span>
                          ) : (
                            '🚀 YOLO - Just Write It!'
                          )}
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleWriteScript}
                            disabled={!canWriteScript}
                            className={`flex-1 px-4 md:px-6 py-3 rounded-lg font-bold text-base md:text-lg ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${prefix}-shadow-md hover:${prefix}-shadow-lg`}
                          >
                            {scriptGen.isGenerating ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                Generating...
                              </span>
                            ) : (
                              '✨ Generate Episode'
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleGenerateBeatSheet(undefined, false)}
                            disabled={beatSheetGen.isGenerating || !episodeGoal.trim()}
                            className={`px-4 md:px-6 py-3 rounded-lg font-medium border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary disabled:opacity-50 transition-all duration-200`}
                          >
                            {beatSheetGen.isGenerating ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                Generating...
                              </span>
                            ) : beatSheet ? (
                              'Regenerate'
                            ) : (
                              'Generate Beat Sheet'
                            )}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Context & Reference (30%) */}
                <div className={`hidden lg:block w-80 border-l ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto flex-shrink-0`}>
                  <ContextPanel
                    previousEpisode={previousEpisode}
                    previousEpisodeSummary={previousEpisodeSummary}
                    loadingSummary={loadingSummary}
                    storyBible={storyBible}
                    episodeNumber={episodeNumber}
                    arcInfo={arcInfo}
                    theme={theme}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Inspiration Options Modal */}
          <AnimatePresence>
            {showInspirationOptions && previousEpisodeOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowInspirationOptions(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className={`${prefix}-card ${prefix}-border border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className={`text-xl font-bold ${prefix}-text-primary`}>
                      AI-Generated Choice Recommendations
                    </h3>
                    <button
                      onClick={() => setShowInspirationOptions(false)}
                      className={`text-xl ${prefix}-text-secondary hover:${prefix}-text-primary`}
                    >
                      ×
                    </button>
                  </div>
                  <p className={`text-sm ${prefix}-text-secondary mb-6 flex-shrink-0`}>
                    Based on analysis of all previous episodes, here are 3 intelligent choice recommendations for Episode {episodeNumber}. 
                    Each choice references specific events, characters, and plot threads from your story. 
                    Select one to continue your narrative.
                  </p>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {generatingChoices && (
                      <div className={`mb-4 p-4 rounded-lg ${prefix}-bg-accent/20 ${prefix}-border border ${prefix}-border-accent flex items-center gap-3`}>
                        <span className={`w-5 h-5 border-2 ${prefix === 'dark' ? 'border-[#10B981]' : 'border-[#C9A961]'} border-t-transparent rounded-full animate-spin`}></span>
                        <div>
                          <p className={`text-sm font-semibold ${prefix}-text-primary`}>Analyzing all previous episodes...</p>
                          <p className={`text-xs ${prefix}-text-secondary`}>Reading story context and generating intelligent choice recommendations</p>
                        </div>
                      </div>
                    )}
                    {analyzingChoice && (
                      <div className={`mb-4 p-4 rounded-lg ${prefix}-bg-accent/20 ${prefix}-border border ${prefix}-border-accent flex items-center gap-3`}>
                        <span className={`w-5 h-5 border-2 ${prefix === 'dark' ? 'border-[#10B981]' : 'border-[#C9A961]'} border-t-transparent rounded-full animate-spin`}></span>
                        <div>
                          <p className={`text-sm font-semibold ${prefix}-text-primary`}>Analyzing your choice...</p>
                          <p className={`text-xs ${prefix}-text-secondary`}>Generating episode goal, vibe settings, and director's notes</p>
                        </div>
                      </div>
                    )}
                    {!generatingChoices && previousEpisodeOptions.length > 0 && (
                      <div className="space-y-3 pr-2">
                        {previousEpisodeOptions.map((option, index) => (
                          <button
                            key={option.id || index}
                            onClick={() => handleInspirationChoice(option)}
                            disabled={analyzingChoice}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all disabled:opacity-50 disabled:cursor-wait ${
                              option.isCanonical
                                ? `${prefix}-border-accent ${prefix}-bg-accent/10`
                                : `${prefix}-border ${prefix}-card hover:${prefix}-border-accent`
                            }`}
                          >
                            <div className={`font-semibold mb-2 ${prefix}-text-primary`}>
                              {option.text}
                            </div>
                            {option.description && (
                              <div className={`text-sm ${prefix}-text-secondary leading-relaxed`}>
                                {option.description}
                              </div>
                            )}
                            {option.isCanonical && (
                              <div className={`text-xs mt-2 ${prefix}-text-accent font-medium`}>
                                ✓ Canonical Path
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {!generatingChoices && previousEpisodeOptions.length === 0 && (
                      <div className={`p-4 rounded-lg ${prefix}-bg-secondary/50 ${prefix}-border border text-center`}>
                        <p className={`text-sm ${prefix}-text-secondary`}>No choice recommendations available. Click the button again to generate.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation Modal */}
          <EpisodeGenerationModal
            isOpen={showGenerationModal}
            episodeNumber={episodeNumber}
            seriesTitle={storyBible?.seriesTitle || 'Series'}
            isPremiumMode={premiumMode}
            episodeData={generatedEpisodeData}
            onComplete={() => {
              setShowGenerationModal(false)
              onComplete?.()
            }}
          />

          {/* Duplicate Dialog */}
          <DuplicateEpisodeConfirmDialog
            isOpen={showDuplicateDialog}
            onClose={() => setShowDuplicateDialog(false)}
            onConfirm={async () => {
              // Close the dialog immediately
              setShowDuplicateDialog(false)
              
              // Start generation after closing
              if (pendingGeneration) {
                const gen = pendingGeneration
                setPendingGeneration(null)
                // Run generation (don't await - let it run and show generation modal)
                gen().catch((error) => {
                  console.error('Generation error after duplicate confirmation:', error)
                })
              }
            }}
            onCancel={() => {
              setPendingGeneration(null)
              setShowDuplicateDialog(false)
            }}
          />

          {/* Error Modal */}
          <GenerationErrorModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            errorMessage={errorModalData?.message || ''}
            generationType={errorModalData?.type || 'episode'}
            onRetry={() => {
              if (errorModalData?.retryFunction) {
                errorModalData.retryFunction()
              }
              setShowErrorModal(false)
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}

