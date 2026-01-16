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
import CharacterDetailModal from '@/components/story-bible/CharacterDetailModal'

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
  
  // Guard to prevent multiple simultaneous generation attempts (fixes infinite loop)
  const [isGeneratingGuard, setIsGeneratingGuard] = useState(false)
  const [guardStartTime, setGuardStartTime] = useState<number | null>(null)
  
  // Auto-reset guard after 10 minutes (prevents stuck guard on iPad)
  useEffect(() => {
    if (isGeneratingGuard && guardStartTime) {
      const timeout = setTimeout(() => {
        const elapsed = Date.now() - guardStartTime
        if (elapsed > 10 * 60 * 1000) { // 10 minutes
          console.warn('⚠️ Guard timeout - auto-resetting after 10 minutes')
          setIsGeneratingGuard(false)
          setGuardStartTime(null)
        }
      }, 10 * 60 * 1000)
      
      return () => clearTimeout(timeout)
    }
  }, [isGeneratingGuard, guardStartTime])

  // Removed generationMode - YOLO is now a pilot writer function for episode 1 only

  // Track if form has been initialized to prevent reset after inspiration choice
  const [formInitialized, setFormInitialized] = useState(false)
  const [isRewriteMode, setIsRewriteMode] = useState(false)

  // Character modal state
  const [showCharacterModal, setShowCharacterModal] = useState(false)
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<{type: string, index?: number | string, field?: string, subfield?: string} | null>(null)
  const [editValue, setEditValue] = useState('')

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
  // Made non-blocking with timeout for iPad/mobile compatibility
  const checkForDuplicate = async (): Promise<boolean> => {
    if (!storyBibleId) return false
    
    // Use Promise.race to add timeout (5 seconds max for duplicate check)
    const duplicateCheck = getEpisode(storyBibleId, episodeNumber, user?.id)
    const timeout = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 5000)
    )
    
    try {
      const existing = await Promise.race([duplicateCheck, timeout])
      return !!existing
    } catch (error) {
      console.error('Error checking for duplicate (non-blocking):', error)
      // Don't block generation if duplicate check fails - just log and continue
      return false
    }
  }

  // STAGE 2: Generate Script
  const handleWriteScript = async () => {
    if (!beatSheet.trim()) {
      alert('Please generate or edit the beat sheet first')
      return
    }

    // Check for duplicate (non-blocking - won't fail generation if check fails)
    try {
    const isDuplicate = await checkForDuplicate()
    if (isDuplicate) {
      setPendingGeneration(() => () => doWriteScript())
      setShowDuplicateDialog(true)
      return
      }
    } catch (error) {
      // If duplicate check fails, log but don't block generation
      console.warn('⚠️ Duplicate check failed, proceeding with generation:', error)
    }

    await doWriteScript()
  }

  const doWriteScript = async () => {
    // GUARD: Prevent multiple simultaneous generation attempts
    if (isGeneratingGuard) {
      const elapsed = guardStartTime ? Date.now() - guardStartTime : 0
      console.warn(`⚠️ Generation already in progress (${Math.round(elapsed / 1000)}s elapsed), ignoring duplicate call`)
      // If guard has been stuck for more than 2 minutes, reset it (iPad recovery)
      if (elapsed > 2 * 60 * 1000) {
        console.warn('⚠️ Guard appears stuck - resetting for iPad recovery')
        setIsGeneratingGuard(false)
        setGuardStartTime(null)
        // Continue with generation after reset
      } else {
        return
      }
    }
    
    setIsGeneratingGuard(true)
    setGuardStartTime(Date.now())
    setScriptGen({ isGenerating: true, error: null })
    setShowGenerationModal(false) // Close error modal if open
    setShowErrorModal(false)
    setShowGenerationModal(true)

    try {
      // Validate inputs BEFORE making any requests
      console.log('🚀 Starting episode generation...')
      console.log('📋 Pre-flight checks:', {
        hasStoryBible: !!storyBible,
        episodeNumber,
        hasBeatSheet: !!beatSheet?.trim(),
        beatSheetLength: beatSheet?.trim().length || 0,
        endpoint: premiumMode ? '/api/generate/episode-premium' : '/api/generate/episode-from-beats'
      })
      
      // Critical validations
      if (!storyBible) {
        throw new Error('Story bible is required but missing')
      }
      
      if (!beatSheet || !beatSheet.trim()) {
        throw new Error('Beat sheet is required but missing')
      }
      
      if (!episodeNumber || episodeNumber < 1) {
        throw new Error(`Invalid episode number: ${episodeNumber}`)
      }
      
      // Use user's vibe settings for advanced mode
      const finalVibeSettings = vibeSettings
      
      const endpoint = premiumMode ? '/api/generate/episode-premium' : '/api/generate/episode-from-beats'
      
      // Validate endpoint exists (basic check)
      if (!endpoint.startsWith('/api/')) {
        throw new Error(`Invalid endpoint: ${endpoint}`)
      }
      
      // Prepare request body
      // NOTE: episode-premium endpoint doesn't accept previousEpisode/allPreviousEpisodes
      const requestBody = premiumMode ? {
        storyBible,
        episodeNumber,
        beatSheet: beatSheet.trim(),
        vibeSettings: finalVibeSettings,
        directorsNotes: directorsNotes.trim(),
        previousChoice
        // Don't send previousEpisode/allPreviousEpisodes to premium endpoint
      } : {
        storyBible,
        episodeNumber,
        beatSheet: beatSheet.trim(),
        vibeSettings: finalVibeSettings,
        directorsNotes: directorsNotes.trim(),
        previousChoice,
        previousEpisode,
        allPreviousEpisodes
      }
      
      // Validate request body can be stringified
      let bodyString: string
      try {
        bodyString = JSON.stringify(requestBody)
        console.log('✅ Request body stringified successfully, size:', new Blob([bodyString]).size, 'bytes')
      } catch (stringifyError) {
        console.error('❌ Failed to stringify request body:', stringifyError)
        throw new Error(`Failed to prepare request: ${stringifyError instanceof Error ? stringifyError.message : 'Unknown error'}`)
      }
      
      // Validate request body size (iPad/mobile may have limits)
      const bodySizeMB = new Blob([bodyString]).size / (1024 * 1024)
      if (bodySizeMB > 5) {
        console.warn(`⚠️ Large request body: ${bodySizeMB.toFixed(2)}MB - may cause issues on mobile`)
      }
      
      // For iPad: Try without AbortController first (it may be causing immediate failures)
      // iPad Safari/Chrome have known issues with AbortController on large requests
      let response: Response | undefined
      let lastError: Error | null = null
      
      console.log(`📡 Making fetch request to: ${endpoint}`)
      console.log(`📡 Request method: POST`)
      console.log(`📡 Request body size: ${bodySizeMB.toFixed(2)}MB`)
      console.log(`📡 iPad mode: Skipping AbortController for better compatibility`)
      
      // Retry logic for iPad network issues (up to 3 attempts)
      // Try WITHOUT AbortController first (iPad compatibility)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Retry attempt ${attempt} for episode generation...`)
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
          
          // Build fetch options - NO AbortController for iPad compatibility
          const fetchOptions: RequestInit = {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: bodyString,
            // Explicitly don't use keepalive on iPad (can cause issues)
            keepalive: false,
            // Don't use AbortController - iPad has issues with it on large requests
          }
          
          console.log(`📡 Fetch attempt ${attempt + 1} starting (no AbortController)...`)
          const fetchStartTime = Date.now()
          
          // Make the fetch request
          response = await fetch(endpoint, fetchOptions)
          
          const fetchDuration = Date.now() - fetchStartTime
          console.log(`✅ Fetch attempt ${attempt + 1} succeeded in ${fetchDuration}ms`)
          console.log(`✅ Response status: ${response.status} ${response.statusText}`)
          
          // If we got a response, break out of retry loop
          break
        } catch (fetchErr) {
          lastError = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr))
          const errorDetails = {
            name: lastError.name,
            message: lastError.message,
            stack: lastError.stack?.substring(0, 300)
          }
          console.error(`❌ Fetch attempt ${attempt + 1} failed:`, errorDetails)
          
          // Check for specific error types
          if (lastError.name === 'TypeError' && lastError.message === 'Failed to fetch') {
            console.error('❌ Network error - request may be blocked or endpoint unreachable')
            console.error('   Check: 1) Network connection 2) Endpoint exists 3) CORS settings 4) Request size limits')
          }
          
          // Don't retry on 4xx errors (client errors)
          if (lastError.message.includes('status: 4')) {
            console.error('❌ Client error (4xx), not retrying')
            throw lastError
          }
          
          // On last attempt, throw the error
          if (attempt === 2) {
            console.error('❌ All fetch attempts failed')
            throw lastError
          }
        }
      }
      
      if (!response) {
        throw lastError || new Error('Failed to get response after retries')
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
          console.error('❌ API Error Response:', errorData)
        } catch (e) {
          // If we can't parse the error, use the status text
          errorMessage = `${errorMessage} - ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Parse response with enhanced error handling for iPad
      let data: any
      let responseText: string
      try {
        console.log('📥 Starting to read response body...')
        const readStartTime = Date.now()
        
        // Read response text with timeout monitoring
        responseText = await response.text()
        
        const readDuration = Date.now() - readStartTime
        console.log(`✅ Response body read in ${readDuration}ms`)
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response body received from API')
        }
        
        // Log response size (iPad diagnostic)
        const responseSizeMB = (responseText.length / (1024 * 1024)).toFixed(2)
        console.log(`📦 Response size: ${responseSizeMB}MB (${responseText.length} bytes)`)
        
        // Warn if response is very large (iPad issue indicator)
        if (responseText.length > 5 * 1024 * 1024) {
          console.warn(`⚠️ Response is very large (${responseSizeMB}MB) - this may cause iPad parsing issues`)
        }
        
        console.log('🔄 Parsing JSON response...')
        const parseStartTime = Date.now()
        
        data = JSON.parse(responseText)
        
        const parseDuration = Date.now() - parseStartTime
        console.log(`✅ JSON parsed in ${parseDuration}ms`)
        console.log('✅ API Response received:', { 
          success: data.success, 
          hasEpisode: !!data.episode,
          episodeScenes: data.episode?.scenes?.length || 0 
        })
      } catch (parseError) {
        console.error('❌ Failed to parse API response:', parseError)
        console.error('   Response text length:', responseText?.length || 0)
        console.error('   Response text (first 500 chars):', responseText?.substring(0, 500) || 'No response text available')
        console.error('   Response text (last 500 chars):', responseText?.substring(responseText.length - 500) || 'N/A')
        
        // Check if response was truncated (iPad issue)
        if (responseText && responseText.length > 0 && !responseText.trim().endsWith('}')) {
          console.error('❌ Response appears to be truncated - iPad may have cut off the response mid-stream')
          throw new Error(`Response truncated (${(responseText.length / (1024 * 1024)).toFixed(2)}MB received, incomplete JSON). This is a known iPad issue with large responses.`)
        }
        
        throw new Error(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`)
      }
      
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
            directorsNotes: directorsNotes.trim(),
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
          
          // Set episode data - this will trigger completion detection in the loader
          console.log(`✅ Episode saved to Firestore, setting episodeData for loader detection`)
          setGeneratedEpisodeData(savedEpisode)
          
          // DON'T close modal yet - let the loader detect completion and handle redirect
          // The loader will call onComplete which will close modal and redirect
          setScriptGen({ isGenerating: false, error: null })
          
          // Reset guard after successful save (loader will handle completion)
          setIsGeneratingGuard(false)
          setGuardStartTime(null)
        } catch (saveError: any) {
          console.error('❌ Failed to save episode:', saveError)
          setShowGenerationModal(false)
          setScriptGen({ isGenerating: false, error: null })
          setIsGeneratingGuard(false) // Reset guard on save error
          setGuardStartTime(null)
          
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
      console.error('❌ Script generation error:', error)
      
      // Provide more specific error messages with iPad/mobile context
      let errorMessage = 'Failed to generate script'
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage = 'Generation timed out after 10 minutes. The API may still be processing - check Cloud Run logs to verify if content was generated. If you\'re on mobile, try keeping the app in the foreground.'
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = `Response parsing failed: ${error.message}. This may indicate the API response was incomplete or malformed. Try again.`
        } else if (error.message.includes('Empty response')) {
          errorMessage = 'Received empty response from API. Check Cloud Run logs to verify if content was generated. This can happen on mobile devices with poor network connections.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = `Network error: ${error.message}. This is common on mobile devices. Please check your connection and try again.`
        } else if (error.message.includes('status: 5')) {
          errorMessage = 'Server error occurred. The API may be overloaded. Please try again in a moment.'
        } else {
          errorMessage = error.message
        }
      }
      
      setShowGenerationModal(false)
      setScriptGen({ 
        isGenerating: false, 
        error: errorMessage
      })
      
      setErrorModalData({
        message: errorMessage,
        type: 'episode',
        retryFunction: () => {
          // Reset guard before retrying
          setIsGeneratingGuard(false)
          setGuardStartTime(null)
          doWriteScript()
        }
      })
      setShowErrorModal(true)
    } finally {
      // Always reset guard when done (success or error)
      setIsGeneratingGuard(false)
      setGuardStartTime(null)
    }
  }

  // YOLO Mode: One-click generation with intelligent defaults
  const handleYOLO = async () => {
    // Check for duplicate (non-blocking - won't fail generation if check fails)
    try {
    const isDuplicate = await checkForDuplicate()
    if (isDuplicate) {
      setPendingGeneration(() => () => doYOLO())
      setShowDuplicateDialog(true)
      return
      }
    } catch (error) {
      // If duplicate check fails, log but don't block generation
      console.warn('⚠️ Duplicate check failed, proceeding with YOLO generation:', error)
    }

    await doYOLO()
  }

  const doYOLO = async () => {
    // GUARD: Prevent multiple simultaneous generation attempts
    if (isGeneratingGuard) {
      const elapsed = guardStartTime ? Date.now() - guardStartTime : 0
      console.warn(`⚠️ Generation already in progress (${Math.round(elapsed / 1000)}s elapsed), ignoring duplicate call`)
      // If guard has been stuck for more than 2 minutes, reset it (iPad recovery)
      if (elapsed > 2 * 60 * 1000) {
        console.warn('⚠️ Guard appears stuck - resetting for iPad recovery')
        setIsGeneratingGuard(false)
        setGuardStartTime(null)
        // Continue with generation after reset
      } else {
        return
      }
    }
    
    setIsGeneratingGuard(true)
    setGuardStartTime(Date.now())
    setScriptGen({ isGenerating: true, error: null })
    setShowGenerationModal(false) // Close error modal if open
    setShowErrorModal(false)
    setShowGenerationModal(true)

    try {
      // Validate inputs BEFORE making any requests
      console.log('🚀 Starting YOLO episode generation...')
      console.log('📋 Pre-flight checks:', {
        hasStoryBible: !!storyBible,
        episodeNumber,
        endpoint: '/api/generate/episode'
      })
      
      // Critical validations
      if (!storyBible) {
        throw new Error('Story bible is required but missing')
      }
      
      if (!episodeNumber || episodeNumber < 1) {
        throw new Error(`Invalid episode number: ${episodeNumber}`)
      }
      
      // Use orchestrator for pilot generation with comprehensive story bible context
      // For episode 1, this generates a pilot based on ALL story bible tabs
      
      const endpoint = '/api/generate/episode'
      
      // Validate endpoint exists (basic check)
      if (!endpoint.startsWith('/api/')) {
        throw new Error(`Invalid endpoint: ${endpoint}`)
      }
      
      // Prepare request body
      const requestBody = {
          storyBible,
          episodeNumber,
          previousChoice,
        previousEpisode: null, // Episode 1 has no previous episode
        allPreviousEpisodes: [], // Episode 1 has no previous episodes
          useIntelligentDefaults: true
      }
      
      // Validate request body can be stringified
      let bodyString: string
      try {
        bodyString = JSON.stringify(requestBody)
        console.log('✅ Request body stringified successfully, size:', new Blob([bodyString]).size, 'bytes')
      } catch (stringifyError) {
        console.error('❌ Failed to stringify request body:', stringifyError)
        throw new Error(`Failed to prepare request: ${stringifyError instanceof Error ? stringifyError.message : 'Unknown error'}`)
      }
      
      // Validate request body size (iPad/mobile may have limits)
      const bodySizeMB = new Blob([bodyString]).size / (1024 * 1024)
      if (bodySizeMB > 5) {
        console.warn(`⚠️ Large request body: ${bodySizeMB.toFixed(2)}MB - may cause issues on mobile`)
      }
      
      // For iPad: Try without AbortController first (it may be causing immediate failures)
      // iPad Safari/Chrome have known issues with AbortController on large requests
      let response: Response | undefined
      let lastError: Error | null = null
      
      console.log(`📡 Making fetch request to: ${endpoint}`)
      console.log(`📡 Request method: POST`)
      console.log(`📡 Request body size: ${bodySizeMB.toFixed(2)}MB`)
      console.log(`📡 iPad mode: Skipping AbortController for better compatibility`)
      
      // Retry logic for iPad network issues (up to 3 attempts)
      // Try WITHOUT AbortController first (iPad compatibility)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`🔄 Retry attempt ${attempt} for YOLO generation...`)
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
          
          // Build fetch options - NO AbortController for iPad compatibility
          const fetchOptions: RequestInit = {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: bodyString,
            // Explicitly don't use keepalive on iPad (can cause issues)
            keepalive: false,
            // Don't use AbortController - iPad has issues with it on large requests
          }
          
          console.log(`📡 Fetch attempt ${attempt + 1} starting (no AbortController)...`)
          const fetchStartTime = Date.now()
          
          // Make the fetch request
          response = await fetch(endpoint, fetchOptions)
          
          const fetchDuration = Date.now() - fetchStartTime
          console.log(`✅ Fetch attempt ${attempt + 1} succeeded in ${fetchDuration}ms`)
          console.log(`✅ Response status: ${response.status} ${response.statusText}`)
          
          // If we got a response, break out of retry loop
          break
        } catch (fetchErr) {
          lastError = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr))
          const errorDetails = {
            name: lastError.name,
            message: lastError.message,
            stack: lastError.stack?.substring(0, 300)
          }
          console.error(`❌ Fetch attempt ${attempt + 1} failed:`, errorDetails)
          
          // Check for specific error types
          if (lastError.name === 'TypeError' && lastError.message === 'Failed to fetch') {
            console.error('❌ Network error - request may be blocked or endpoint unreachable')
            console.error('   Check: 1) Network connection 2) Endpoint exists 3) CORS settings 4) Request size limits')
          }
          
          // Don't retry on 4xx errors (client errors)
          if (lastError.message.includes('status: 4')) {
            console.error('❌ Client error (4xx), not retrying')
            throw lastError
          }
          
          // On last attempt, throw the error
          if (attempt === 2) {
            console.error('❌ All fetch attempts failed')
            throw lastError
          }
        }
      }
      
      if (!response) {
        throw lastError || new Error('Failed to get response after retries')
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
          console.error('❌ API Error Response:', errorData)
        } catch (e) {
          // If we can't parse the error, use the status text
          errorMessage = `${errorMessage} - ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Parse response with enhanced error handling for iPad
      let data: any
      let responseText: string
      try {
        console.log('📥 Starting to read response body...')
        const readStartTime = Date.now()
        
        // Read response text with timeout monitoring
        responseText = await response.text()
        
        const readDuration = Date.now() - readStartTime
        console.log(`✅ Response body read in ${readDuration}ms`)
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response body received from API')
        }
        
        // Log response size (iPad diagnostic)
        const responseSizeMB = (responseText.length / (1024 * 1024)).toFixed(2)
        console.log(`📦 Response size: ${responseSizeMB}MB (${responseText.length} bytes)`)
        
        // Warn if response is very large (iPad issue indicator)
        if (responseText.length > 5 * 1024 * 1024) {
          console.warn(`⚠️ Response is very large (${responseSizeMB}MB) - this may cause iPad parsing issues`)
        }
        
        console.log('🔄 Parsing JSON response...')
        const parseStartTime = Date.now()
        
        data = JSON.parse(responseText)
        
        const parseDuration = Date.now() - parseStartTime
        console.log(`✅ JSON parsed in ${parseDuration}ms`)
        console.log('✅ API Response received:', { 
          success: data.success, 
          hasEpisode: !!data.episode,
          episodeScenes: data.episode?.scenes?.length || 0 
        })
      } catch (parseError) {
        console.error('❌ Failed to parse API response:', parseError)
        console.error('   Response text length:', responseText?.length || 0)
        console.error('   Response text (first 500 chars):', responseText?.substring(0, 500) || 'No response text available')
        console.error('   Response text (last 500 chars):', responseText?.substring(responseText.length - 500) || 'N/A')
        
        // Check if response was truncated (iPad issue)
        if (responseText && responseText.length > 0 && !responseText.trim().endsWith('}')) {
          console.error('❌ Response appears to be truncated - iPad may have cut off the response mid-stream')
          throw new Error(`Response truncated (${(responseText.length / (1024 * 1024)).toFixed(2)}MB received, incomplete JSON). This is a known iPad issue with large responses.`)
        }
        
        throw new Error(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`)
      }
      
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
        
        // Set episode data - this will trigger completion detection in the loader
        console.log(`✅ YOLO Episode saved to Firestore, setting episodeData for loader detection`)
        setGeneratedEpisodeData(savedEpisode)
        
        // DON'T close modal yet - let the loader detect completion and handle redirect
        // The loader will call onComplete which will close modal and redirect
        setScriptGen({ isGenerating: false, error: null })
        
        // Reset guard after successful save (loader will handle completion)
        setIsGeneratingGuard(false)
        setGuardStartTime(null)
      } else {
        throw new Error(data.error || 'Failed to generate episode')
      }
    } catch (error) {
      console.error('❌ YOLO generation error:', error)
      
      // Provide more specific error messages with iPad/mobile context
      let errorMessage = 'Failed to generate episode'
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          errorMessage = 'Generation timed out after 10 minutes. The API may still be processing - check Cloud Run logs to verify if content was generated. If you\'re on mobile, try keeping the app in the foreground.'
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = `Response parsing failed: ${error.message}. This may indicate the API response was incomplete or malformed. Try again.`
        } else if (error.message.includes('Empty response')) {
          errorMessage = 'Received empty response from API. Check Cloud Run logs to verify if content was generated. This can happen on mobile devices with poor network connections.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = `Network error: ${error.message}. This is common on mobile devices. Please check your connection and try again.`
        } else if (error.message.includes('status: 5')) {
          errorMessage = 'Server error occurred. The API may be overloaded. Please try again in a moment.'
        } else {
          errorMessage = error.message
        }
      }
      
      setShowGenerationModal(false)
      setScriptGen({ 
        isGenerating: false, 
        error: errorMessage
      })
      
      setErrorModalData({
        message: errorMessage,
        type: 'episode',
        retryFunction: () => {
          // Reset guard before retrying
          setIsGeneratingGuard(false)
          setGuardStartTime(null)
          doYOLO()
        }
      })
      setShowErrorModal(true)
    } finally {
      // Always reset guard when done (success or error)
      setIsGeneratingGuard(false)
      setGuardStartTime(null)
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
                  </div>

                  {/* Character Context - Scrollable list above Quick Actions */}
                  <div className="mb-4">
                    <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Character Context</h3>
                    <div className={`text-xs ${prefix}-text-tertiary mb-2`}>Click any character to view details</div>
                    <div className={`max-h-64 overflow-y-auto ${prefix}-card ${prefix}-border rounded-lg p-2`}>
                      {storyBible?.mainCharacters && storyBible.mainCharacters.length > 0 ? (
                        <div className="space-y-2">
                          {storyBible.mainCharacters.map((char: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedCharacterIndex(idx)
                                setShowCharacterModal(true)
                              }}
                              className={`w-full p-2.5 rounded-lg ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 hover:border-[#10B981]/50 border-2 border-transparent transition-all duration-200 text-left cursor-pointer group`}
                              title={`Click to view ${char.name || 'character'} details`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 border-[#10B981]/40 group-hover:border-[#10B981] group-hover:scale-105 transition-all flex items-center justify-center text-xs font-bold text-[#10B981] flex-shrink-0">
                                  {char.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                            </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium ${prefix}-text-primary truncate group-hover:text-[#10B981] transition-colors flex items-center gap-1.5`}>
                                    {char.name || 'Unnamed Character'}
                                    <span className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                                  </div>
                                  {char.title && (
                                    <div className={`text-xs ${prefix}-text-secondary line-clamp-1 truncate`}>
                                      {char.title}
                            </div>
                          )}
                        </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-sm ${prefix}-text-secondary text-center py-4`}>
                          No characters defined
                      </div>
                    )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Quick Actions</h3>
                    {episodeNumber === 1 ? (
                      <button
                        onClick={handleYOLO}
                        disabled={scriptGen.isGenerating}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium mb-2 ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-wait`}
                      >
                        {scriptGen.isGenerating ? '🤖 Writing Pilot...' : 'Help me write the pilot'}
                      </button>
                    ) : (
                      (previousEpisode || allPreviousEpisodes.length > 0) && (
                      <button
                        onClick={async () => {
                          setGeneratingChoices(true)
                          setShowInspirationOptions(true)
                          
                          try {
                            // Generate episode ideas based on all previous episodes and comprehensive story bible
                            const response = await fetch('/api/generate/choice-recommendations', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                storyBible,
                                episodeNumber,
                                previousEpisode,
                                allPreviousEpisodes,
                                storyBibleId,
                                userId: user?.id
                              })
                            })
                            
                            if (!response.ok) {
                                throw new Error('Failed to generate episode ideas')
                            }
                            
                            const data = await response.json()
                            
                            if (data.success && data.choices) {
                              setPreviousEpisodeOptions(data.choices)
                                console.log(`✅ Generated ${data.choices.length} episode ideas`)
                            } else {
                              throw new Error('Invalid response format')
                            }
                          } catch (error) {
                              console.error('Error generating episode ideas:', error)
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
                          {generatingChoices ? '🤖 Analyzing Story...' : 'Generate Episode Ideas'}
                      </button>
                      )
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

                    {/* Vibe Settings */}
                      <VibeSettingsPanel
                        vibeSettings={vibeSettings}
                        onSettingsChange={setVibeSettings}
                        theme={theme}
                      />

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

                    {/* Director's Notes */}
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
                    storyBibleId={storyBibleId}
                    allPreviousEpisodes={allPreviousEpisodes}
                    episodeGoal={episodeGoal}
                    beatSheet={beatSheet}
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
                      AI-Generated Episode Ideas
                    </h3>
                    <button
                      onClick={() => setShowInspirationOptions(false)}
                      className={`text-xl ${prefix}-text-secondary hover:${prefix}-text-primary`}
                    >
                      ×
                    </button>
                  </div>
                  <p className={`text-sm ${prefix}-text-secondary mb-6 flex-shrink-0`}>
                    Based on comprehensive analysis of all story bible tabs and all previous episodes, here are 3 episode ideas for Episode {episodeNumber} that continue the story naturally. 
                    Each idea references specific events, characters, callbacks, and plot threads from your complete story. 
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
            storyBibleId={storyBibleId || storyBible?.id}
            onComplete={() => {
              // Modal completion - close modal and redirect
              console.log('✅ Modal onComplete called - closing modal and redirecting')
              setShowGenerationModal(false)
              setScriptGen({ isGenerating: false, error: null })
              
              // Build episode URL and redirect
              const storyBibleIdForRedirect = storyBibleId || storyBible?.id || `bible_${storyBible?.seriesTitle?.replace(/\s+/g, '_').toLowerCase()}`
              const episodeUrl = storyBibleIdForRedirect 
                ? `/episode/${episodeNumber}?storyBibleId=${storyBibleIdForRedirect}`
                : `/episode/${episodeNumber}`
              
              console.log(`🔄 Redirecting to: ${episodeUrl}`)
              
              // Redirect immediately
              setTimeout(() => {
                try {
                  router.push(episodeUrl)
                  console.log('✅ Router.push called successfully')
                  // Fallback check
                  setTimeout(() => {
                    if (window.location.pathname !== episodeUrl.split('?')[0]) {
                      console.warn('⚠️ Router.push may have failed, using window.location')
                      window.location.href = episodeUrl
                    }
                  }, 1000)
                } catch (err) {
                  console.error('❌ Redirect error:', err)
                  window.location.href = episodeUrl
                }
              }, 300)
              
              onComplete?.()
            }}
          />

          {/* Duplicate Dialog */}
          <DuplicateEpisodeConfirmDialog
            isOpen={showDuplicateDialog}
            episodeNumber={episodeNumber}
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
            onClose={() => {
              setShowErrorModal(false)
              setIsGeneratingGuard(false) // Reset guard on close
              setGuardStartTime(null)
            }}
            errorMessage={errorModalData?.message || ''}
            generationType={errorModalData?.type || 'episode'}
            onRetry={() => {
              // Prevent infinite loops - only retry if guard is not active
              if (isGeneratingGuard) {
                console.warn('⚠️ Generation already in progress, ignoring retry')
                setShowErrorModal(false)
                return
              }
              
              setShowErrorModal(false) // Close modal first
              
              if (errorModalData?.retryFunction) {
                // Small delay to ensure modal closes before retry
                setTimeout(() => {
                  errorModalData.retryFunction()
                }, 200)
              }
            }}
          />

          {/* Character Detail Modal */}
          {showCharacterModal && selectedCharacterIndex !== null && storyBible?.mainCharacters?.[selectedCharacterIndex] && (
            <CharacterDetailModal
              isOpen={showCharacterModal}
              onClose={() => {
                setShowCharacterModal(false)
                setSelectedCharacterIndex(null)
                setEditingField(null)
                setEditValue('')
              }}
              character={storyBible.mainCharacters[selectedCharacterIndex]}
              characterIndex={selectedCharacterIndex}
              onSave={async () => {
                // Read-only in episode generation suite - no save action
                console.log('Character view is read-only in episode generation suite')
              }}
              onDelete={() => {
                // Read-only - no delete action
                console.log('Character view is read-only in episode generation suite')
              }}
              isLocked={true}
              theme={theme}
              editingField={editingField}
              editValue={editValue}
              onStartEditing={(type, field, currentValue, index, subfield) => {
                setEditingField({ type, field, index, subfield })
                setEditValue(currentValue)
              }}
              onSaveEdit={() => {
                // Read-only - no save
                setEditingField(null)
                setEditValue('')
              }}
              onCancelEditing={() => {
                setEditingField(null)
                setEditValue('')
              }}
              onEditValueChange={(value) => {
                setEditValue(value)
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}

