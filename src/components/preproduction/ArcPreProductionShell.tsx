'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import type { ArcPreProductionData } from '@/types/preproduction'
import { subscribeToPreProduction, updatePreProduction, getEpisodeRangeForArc } from '@/services/preproduction-firestore'
import { getEpisodePreProduction } from '@/services/preproduction-firestore'
import { getStoryBible } from '@/services/story-bible-service'
import { ExportToolbar } from './shared/ExportToolbar'
import { GenerationProgressOverlay, type GenerationStep } from './shared/GenerationProgressOverlay'
import { RegenerateAllModal } from './shared/RegenerateAllModal'
import { regenerateAllArcContent } from '@/services/arc-regeneration-service'
import { aggregateCastingFromEpisodes, aggregateEquipmentFromEpisodes, aggregatePermitsFromEpisodes } from '@/services/arc-preproduction-aggregator'

// Arc-specific Tab Components
import { CastingTab } from './tabs/CastingTab'
import { ScheduleRehearsalTab } from './tabs/ScheduleRehearsalTab'
import { BudgetTrackerTab } from './tabs/BudgetTrackerTab'
import { EquipmentTab } from './tabs/EquipmentTab'
import { PermitsTab } from './tabs/PermitsTab'
import { SeriesLocationsTab } from './tabs/SeriesLocationsTab'
import { SeriesPropsWardrobeTab } from './tabs/SeriesPropsWardrobeTab'
import { ArcMarketingTab } from './tabs/ArcMarketingTab'

type ArcTabType = 
  | 'casting'
  | 'schedule'
  | 'budget'
  | 'equipment'
  | 'locations'
  | 'props'
  | 'permits'
  | 'marketing'

const ARC_TABS = [
  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Actor info' },
  { id: 'schedule', label: 'Schedule', icon: '📅', description: 'Shoot timeline' },
  { id: 'budget', label: 'Budget', icon: '💰', description: 'Cost tracking' },
  { id: 'equipment', label: 'Equipment', icon: '🎥', description: 'Gear checklist' },
  { id: 'locations', label: 'Locations', icon: '📍', description: 'Series locations' },
  { id: 'props', label: 'Props/Wardrobe', icon: '👗', description: 'Series items' },
  { id: 'permits', label: 'Permits', icon: '📄', description: 'Legal docs' },
  { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Arc marketing strategy' }
] as const

interface ArcPreProductionShellProps {
  preProductionId: string
  userId: string
  storyBibleId: string
  arcIndex: number
  onBack?: () => void
}

export function ArcPreProductionShell({ 
  preProductionId, 
  userId, 
  storyBibleId,
  arcIndex,
  onBack 
}: ArcPreProductionShellProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ArcTabType>('casting')
  const [preProductionData, setPreProductionData] = useState<ArcPreProductionData | null>(null)
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodePreProdData, setEpisodePreProdData] = useState<Record<number, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Auto-generation state
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [currentGenerationStep, setCurrentGenerationStep] = useState<string | undefined>()
  const [generationProgress, setGenerationProgress] = useState(0)
  const [shouldAutoOpenPropsQuestionnaire, setShouldAutoOpenPropsQuestionnaire] = useState(false)
  
  // Regenerate All Modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  
  // State to track data loading and processing
  const [dataLoaded, setDataLoaded] = useState(false)
  const [aggregationComplete, setAggregationComplete] = useState(false)
  
  // Refs to prevent duplicate operations
  const hasCheckedAutoGen = useRef(false)
  const prevAutoGeneratingRef = useRef(false)
  const hasTriggeredInitialQuestionnaire = useRef(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Define handleTabUpdate early so it can be used in useEffects
  const handleTabUpdate = useCallback(async (tabName: string, tabData: any) => {
    if (!preProductionData || !user?.id) return

    setIsSyncing(true)
    try {
      // If tabName is empty, it's a batch update (from aggregation)
      const updateData = tabName ? { [tabName]: tabData } : tabData
      await updatePreProduction(
        preProductionId,
        updateData,
        user.id,
        storyBibleId
      )
    } catch (error) {
      console.error('❌ Error updating tab:', error)
      setIsSyncing(false)
    }
  }, [preProductionData, user?.id, preProductionId, storyBibleId])

  // Define updateStepStatus helper
  const updateStepStatus = useCallback((stepId: string, status: GenerationStep['status'], error?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ))
  }, [])

  // Generate all tabs once on first load (full regeneration)
  const autoGenerateAllTabsOnce = useCallback(async () => {
    if (!preProductionData || !storyBible || !episodePreProdData || !user?.id) return

    setIsAutoGenerating(true)

    const steps: GenerationStep[] = [
      { id: 'casting', label: 'Casting', status: 'pending' },
      { id: 'locations', label: 'Locations', status: 'pending' },
      { id: 'props', label: 'Props/Wardrobe', status: 'pending' },
      { id: 'equipment', label: 'Equipment', status: 'pending' },
      { id: 'permits', label: 'Permits', status: 'pending' },
      { id: 'marketing', label: 'Marketing', status: 'pending' },
      { id: 'budget', label: 'Budget', status: 'pending' },
      { id: 'schedule', label: 'Schedule', status: 'pending' }
    ]

    setGenerationSteps(steps)
    setGenerationProgress(0)

    try {
      const episodeNumbers = preProductionData.episodeNumbers || []

      const regenResult = await regenerateAllArcContent({
        arcPreProductionId: preProductionId,
        storyBibleId,
        arcIndex,
        episodeNumbers,
        userId: user.id,
        storyBibleData: storyBible,
        episodePreProdData,
        castingData: preProductionData.casting,
        onProgress: (p) => {
          setCurrentGenerationStep(p.step)
          updateStepStatus(p.step, p.status === 'error' ? 'error' : 'generating')
          if (typeof p.progress === 'number') setGenerationProgress(p.progress)
        }
      })

      const updates: any = {}
      if (regenResult.data?.casting) updates.casting = regenResult.data.casting
      if (regenResult.data?.arcLocations) updates.locations = regenResult.data.arcLocations
      if (regenResult.data?.arcPropsWardrobe) updates.propsWardrobe = regenResult.data.arcPropsWardrobe
      if (regenResult.data?.equipment) updates.equipment = regenResult.data.equipment
      if (regenResult.data?.schedule) updates.shootingSchedule = regenResult.data.schedule
      if (regenResult.data?.budget) updates.budget = regenResult.data.budget
      if (regenResult.data?.permits) updates.permits = regenResult.data.permits
      if (regenResult.data?.arcMarketing) updates.arcMarketing = regenResult.data.arcMarketing

      if (Object.keys(updates).length > 0) {
        await handleTabUpdate('', updates)
      }

      steps.forEach(step => {
        const hasData =
          (step.id === 'casting' && updates.casting) ||
          (step.id === 'locations' && updates.locations) ||
          (step.id === 'props' && updates.propsWardrobe) ||
          (step.id === 'equipment' && updates.equipment) ||
          (step.id === 'schedule' && updates.shootingSchedule) ||
          (step.id === 'budget' && updates.budget) ||
          (step.id === 'permits' && updates.permits) ||
          (step.id === 'marketing' && updates.arcMarketing)

        if (hasData) {
          updateStepStatus(step.id, 'completed')
        } else if ((regenResult.errors as any)?.[step.id]) {
          updateStepStatus(step.id, 'error', (regenResult.errors as any)[step.id])
        }
      })

      setGenerationProgress(100)
    } catch (error) {
      console.error('❌ Full auto-generation failed:', error)
    } finally {
      setIsAutoGenerating(false)
      setCurrentGenerationStep(undefined)
    }
  }, [preProductionData, storyBible, episodePreProdData, user?.id, updateStepStatus, handleTabUpdate, preProductionId, storyBibleId, arcIndex])

  // Define autoGenerateArcPreProduction early so it can be used in useEffects
  const autoGenerateArcPreProduction = useCallback(async () => {
    if (!preProductionData || !storyBible || !episodePreProdData || !user?.id) return

    setIsAutoGenerating(true)
    
    // Initialize steps
    const steps: GenerationStep[] = [
      { id: 'casting', label: 'Casting', status: 'pending' },
      { id: 'schedule', label: 'Schedule', status: 'pending' },
      { id: 'locations', label: 'Locations', status: 'pending' },
      { id: 'permits', label: 'Permits', status: 'pending' }
    ]
    
    setGenerationSteps(steps)
    setGenerationProgress(0)

    try {
      // 1. Generate or Aggregate Casting
      updateStepStatus('casting', 'generating')
      setCurrentGenerationStep('casting')
      
      const aggregatedCasting = aggregateCastingFromEpisodes(episodePreProdData)
      
      // If no casting data in episodes, generate it
      if (!aggregatedCasting.cast || aggregatedCasting.cast.length === 0) {
        console.log('📊 No casting data in episodes, generating arc-wide casting...')
        
        // Aggregate breakdown and script data from episodes
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const aggregatedScripts: any[] = []
        
        Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
          const epNum = parseInt(epNumStr)
          
          // Check for script breakdown
          const breakdown = epPreProd.scriptBreakdown
          if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
            aggregatedBreakdown.scenes.push(...breakdown.scenes)
            aggregatedBreakdown.totalScenes += breakdown.scenes.length
          }
          
          // Check for scripts
          const scripts = epPreProd.scripts
          if (scripts?.fullScript) {
            aggregatedScripts.push(scripts.fullScript)
          }
        })
        
        // Need at least one script for casting generation
        if (aggregatedBreakdown.scenes.length > 0 && aggregatedScripts.length > 0) {
          try {
            const castingResponse = await fetch('/api/generate/casting', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                preProductionId,
                storyBibleId,
                arcPreProductionId: preProductionId,
                episodeNumbers: preProductionData.episodeNumbers || [],
                userId: user.id,
                breakdownData: aggregatedBreakdown,
                scriptData: aggregatedScripts[0],
                storyBibleData: storyBible
              })
            })
            
            if (castingResponse.ok) {
              const castingResult = await castingResponse.json()
              await handleTabUpdate('casting', castingResult.casting)
              updateStepStatus('casting', 'completed')
            } else {
              const errorText = await castingResponse.text()
              let errorMessage = 'Failed to generate casting'
              try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.details || errorData.error || errorMessage
              } catch {
                errorMessage = errorText || `Server error: ${castingResponse.status}`
              }
              updateStepStatus('casting', 'error', errorMessage)
            }
          } catch (error: any) {
            console.error('Casting generation error:', error)
            updateStepStatus('casting', 'error', error.message || 'Failed to generate casting')
          }
        } else {
          console.log('⚠️  Skipping casting generation - missing prerequisites')
          updateStepStatus('casting', 'completed')
        }
      } else {
        // Use aggregated data
        await handleTabUpdate('casting', aggregatedCasting)
        updateStepStatus('casting', 'completed')
      }
      
      setGenerationProgress(33)

      // 2. Generate Schedule (cross-episode)
      const hasAnyBreakdown = Object.values(episodePreProdData).some((epPreProd: any) => 
        epPreProd?.scriptBreakdown?.scenes && epPreProd.scriptBreakdown.scenes.length > 0
      )
      
      if (hasAnyBreakdown) {
        updateStepStatus('schedule', 'generating')
        setCurrentGenerationStep('schedule')

        const episodeNumbers = preProductionData.episodeNumbers || []
        try {
          const scheduleResponse = await fetch('/api/generate/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyBibleId,
              episodeNumbers,
              schedulingMode: 'cross-episode',
              optimizationPriority: 'location',
              userId: user.id,
              arcPreProductionId: preProductionId,
              episodePreProdData
            })
          })

          if (scheduleResponse.ok) {
            const scheduleResult = await scheduleResponse.json()
            await handleTabUpdate('shootingSchedule', scheduleResult.schedule)
            updateStepStatus('schedule', 'completed')
          } else {
            const errorText = await scheduleResponse.text()
            let errorMessage = 'Failed to generate schedule'
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.details || errorData.error || errorMessage
            } catch {
              errorMessage = errorText || `Server error: ${scheduleResponse.status}`
            }
            updateStepStatus('schedule', 'error', errorMessage)
          }
        } catch (error: any) {
          console.error('Schedule generation error:', error)
          updateStepStatus('schedule', 'error', error.message || 'Failed to generate schedule')
        }
      } else {
        console.log('⚠️  Skipping schedule generation - no episode breakdowns found')
        updateStepStatus('schedule', 'completed')
      }
      setGenerationProgress(50)

      // 3. Aggregate Equipment from episodes (if available)
      const aggregatedEquipment = aggregateEquipmentFromEpisodes(episodePreProdData)
      const equipmentAny = aggregatedEquipment as any
      const eqCount = (equipmentAny.items?.length || 0) + 
        (equipmentAny.camera?.length || 0) + 
        (equipmentAny.lighting?.length || 0) + 
        (equipmentAny.audio?.length || 0)
      
      if (eqCount > 0) {
        await handleTabUpdate('equipment', aggregatedEquipment)
      }

      // 4. Generate Locations (arc-level)
      updateStepStatus('locations', 'generating')
      setCurrentGenerationStep('locations')

      // Check if all episodes have scripts and breakdowns
      const episodesWithScripts = Object.entries(episodePreProdData).filter(([_, epPreProd]: [string, any]) => {
        return epPreProd.scripts?.fullScript && epPreProd.scriptBreakdown?.scenes?.length > 0
      })

      if (episodesWithScripts.length === 0) {
        console.log('⚠️  Skipping location generation - no episodes with scripts and breakdowns found')
        updateStepStatus('locations', 'completed')
      } else {
        // Aggregate breakdown and script data from all episodes with episode numbers
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0
        }
        const aggregatedScripts: any[] = []
        const episodeNumbers = preProductionData.episodeNumbers || []

        console.log('📊 Aggregating breakdown and script data from episodes for location generation...')
        Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
          const epNum = parseInt(epNumStr)

          // Check for script breakdown
          const breakdown = epPreProd.scriptBreakdown
          if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
            console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
            // Add episode number to each scene for arc context
            const scenesWithEpisode = breakdown.scenes.map((scene: any) => ({
              ...scene,
              linkedEpisode: epNum,
              episodeNumber: epNum
            }))
            aggregatedBreakdown.scenes.push(...scenesWithEpisode)
            aggregatedBreakdown.totalScenes += breakdown.scenes.length
          } else {
            console.log(`  ⚠️  Episode ${epNum}: No breakdown scenes found`)
          }

          // Check for scripts
          const scripts = epPreProd.scripts
          if (scripts?.fullScript) {
            console.log(`  ✅ Episode ${epNum}: Found script`)
            aggregatedScripts.push(scripts.fullScript)
          } else {
            console.log(`  ⚠️  Episode ${epNum}: No script found`)
          }
        })

        console.log(`📊 Aggregation results:`, {
          totalScenes: aggregatedBreakdown.scenes.length,
          totalScripts: aggregatedScripts.length,
          episodesWithData: episodesWithScripts.length
        })

        // Check if we have at least one episode with both script and breakdown
        if (aggregatedBreakdown.scenes.length > 0 && aggregatedScripts.length > 0) {
          try {
            // Get casting data if available
            const castingData = preProductionData.casting

            const locationResponse = await fetch('/api/generate/locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                arcPreProductionId: preProductionId,
                storyBibleId,
                userId: user.id,
                arcIndex,
                episodeNumbers,
                aggregatedBreakdownData: aggregatedBreakdown,
                aggregatedScriptData: aggregatedScripts[0], // Use first script as reference
                storyBibleData: storyBible,
                castingData
              })
            })

            if (locationResponse.ok) {
              const locationResult = await locationResponse.json()
              // Save location options to production assistant (user will select and save locations)
              await handleTabUpdate('locations', {
                ...((preProductionData as any).locations || {}),
                pendingOptions: locationResult.locations,
                arcIndex,
                episodeNumbers,
                lastUpdated: Date.now()
              })
              updateStepStatus('locations', 'completed')
              console.log('✅ Location generation complete - options saved for user selection')
            } else {
              const errorText = await locationResponse.text()
              let errorMessage = 'Failed to generate locations'
              try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.details || errorData.error || errorMessage
              } catch {
                errorMessage = errorText || `Server error: ${locationResponse.status}`
              }
              updateStepStatus('locations', 'error', errorMessage)
            }
          } catch (error: any) {
            console.error('Location generation error:', error)
            updateStepStatus('locations', 'error', error.message || 'Failed to generate locations')
          }
        } else {
          console.log('⚠️  Skipping location generation - insufficient data')
          if (aggregatedBreakdown.scenes.length === 0) {
            console.log('  - No breakdown scenes found')
          }
          if (aggregatedScripts.length === 0) {
            console.log('  - No scripts found')
          }
          updateStepStatus('locations', 'completed')
        }
      }

      setGenerationProgress(75)

      // 5. Aggregate Permits from episodes
      updateStepStatus('permits', 'generating')
      setCurrentGenerationStep('permits')
      
      const aggregatedPermits = aggregatePermitsFromEpisodes(episodePreProdData)
      await handleTabUpdate('permits', aggregatedPermits)

      updateStepStatus('permits', 'completed')
      setGenerationProgress(100)

      console.log('✅ Production assistant auto-generation complete!')
    } catch (error: any) {
      console.error('❌ Error in auto-generation:', error)
      // Find current step by checking which one is generating
      setGenerationSteps(prev => {
        const currentStep = prev.find(s => s.status === 'generating')
        if (currentStep) {
          return prev.map(step => 
            step.id === currentStep.id ? { ...step, status: 'error' as const, error: error.message || 'Unknown error' } : step
          )
        }
        return prev
      })
    } finally {
      setIsAutoGenerating(false)
      setCurrentGenerationStep(undefined)
    }
  }, [preProductionData, storyBible, episodePreProdData, user?.id, preProductionId, storyBibleId, handleTabUpdate, updateStepStatus])

  // After auto-generation overlay completes, switch to Props tab and auto-open questionnaire (only if no data exists)
  useEffect(() => {
    const hasPropsData =
      !!preProductionData?.propsWardrobe &&
      ((((preProductionData as any).propsWardrobe?.props?.length || 0) > 0) ||
        (((preProductionData as any).propsWardrobe?.wardrobe?.length || 0) > 0))
    const hasEquipmentData =
      !!(preProductionData as any)?.equipment &&
      Object.values((preProductionData as any).equipment || {}).some((arr: any) => Array.isArray(arr) && arr.length > 0)

    if (prevAutoGeneratingRef.current && !isAutoGenerating && !hasPropsData && !hasEquipmentData) {
      setActiveTab('props')
      setShouldAutoOpenPropsQuestionnaire(true)
    }
    prevAutoGeneratingRef.current = isAutoGenerating
  }, [isAutoGenerating, preProductionData])

  // After initial load completes, auto-open props/equipment questionnaire once
  useEffect(() => {
    if (isLoading) return
    if (!preProductionData) return
    if (hasTriggeredInitialQuestionnaire.current) return

    const hasPropsData =
      !!preProductionData.propsWardrobe &&
      ((((preProductionData as any).propsWardrobe?.props?.length || 0) > 0) ||
        (((preProductionData as any).propsWardrobe?.wardrobe?.length || 0) > 0))
    const hasEquipmentData =
      !!(preProductionData as any).equipment &&
      Object.values((preProductionData as any).equipment || {}).some((arr: any) => Array.isArray(arr) && arr.length > 0)

    if (hasPropsData || hasEquipmentData) {
      hasTriggeredInitialQuestionnaire.current = true
      return
    }

    // Ensure we only trigger once per load
    hasTriggeredInitialQuestionnaire.current = true
    setActiveTab('props')
    setShouldAutoOpenPropsQuestionnaire(true)
  }, [isLoading, preProductionData])

  // Load all data in correct order
  useEffect(() => {
    if (dataLoaded || !user?.id) return
    
    const loadAllData = async () => {
      try {
        setIsLoading(true)
        
        // Step 1: Load story bible
        console.log('📖 Loading story bible...')
        const bible = await getStoryBible(storyBibleId, user.id)
        if (!bible) {
          console.error('❌ Story bible not found')
          setIsLoading(false)
          return
        }
        setStoryBible(bible)
        
        // Step 2: Get episode range for arc
        const episodeNumbers = getEpisodeRangeForArc(bible, arcIndex)
        if (episodeNumbers.length === 0) {
          console.error('❌ No episodes found for arc')
          setIsLoading(false)
          return
        }
        
        // Step 3: Load episode pre-production data for all episodes in arc
        console.log(`📋 Loading episode pre-production data for ${episodeNumbers.length} episodes...`)
        const episodeData: Record<number, any> = {}
        
        for (const epNum of episodeNumbers) {
          try {
            const epPreProd = await getEpisodePreProduction(user.id, storyBibleId, epNum)
            if (epPreProd) {
              episodeData[epNum] = epPreProd
              console.log(`  ✅ Episode ${epNum}: Loaded pre-production data`)
              
              // DUMP ENTIRE DOCUMENT STRUCTURE to see what's actually there
              console.log(`    📄 Episode ${epNum} FULL DOCUMENT STRUCTURE:`, {
                allKeys: Object.keys(epPreProd),
                hasLocations: 'locations' in epPreProd,
                locationsValue: epPreProd.locations,
                // Check if locations might be stored under a different key
                allTopLevelArrays: Object.entries(epPreProd)
                  .filter(([k, v]) => Array.isArray(v) && (v as any[]).length > 0)
                  .map(([k, v]) => ({ key: k, length: (v as any[]).length, firstItem: (v as any[])[0] })),
                // Check all object properties that might contain arrays
                allObjectProperties: Object.entries(epPreProd)
                  .filter(([k, v]) => v && typeof v === 'object' && !Array.isArray(v))
                  .map(([k, v]) => ({
                    key: k,
                    subKeys: Object.keys(v as any),
                    hasArrays: Object.entries(v as any)
                      .filter(([sk, sv]) => Array.isArray(sv) && (sv as any[]).length > 0)
                      .map(([sk, sv]) => ({ subKey: sk, length: (sv as any[]).length }))
                  }))
              })
              
              // Diagnostic logging for locations - FULL STRUCTURE
              const locations = epPreProd.locations
              console.log(`    📍 Episode ${epNum} locations check:`, {
                hasLocations: !!locations,
                locationsType: typeof locations,
                isObject: locations && typeof locations === 'object' && !Array.isArray(locations),
                isArray: Array.isArray(locations),
                locationsKeys: locations ? Object.keys(locations) : [],
                hasLocationsArray: !!locations?.locations,
                locationsArrayIsArray: Array.isArray(locations?.locations),
                locationsArrayLength: locations?.locations?.length || 0,
                hasSelectedLocations: !!(locations as any)?.selectedLocations,
                selectedLocationsLength: (locations as any)?.selectedLocations?.length || 0,
                // FULL structure - not truncated
                fullLocationsStructure: locations ? JSON.stringify(locations, null, 2) : 'null',
                // Check all array properties in the locations object
                allArrayProperties: locations && typeof locations === 'object' && !Array.isArray(locations)
                  ? Object.entries(locations)
                      .filter(([k, v]) => Array.isArray(v))
                      .map(([k, v]) => ({ key: k, length: (v as any[]).length, sample: (v as any[])[0] }))
                  : []
              })
            } else {
              console.log(`  ⚠️  Episode ${epNum}: No pre-production data found`)
            }
          } catch (error) {
            console.error(`  ❌ Error loading episode ${epNum} pre-production:`, error)
          }
        }
        
        setEpisodePreProdData(episodeData)
        console.log(`✅ Loaded ${Object.keys(episodeData).length} episodes with pre-production data`)
        
        setDataLoaded(true)
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading arc data:', error)
        setIsLoading(false)
      }
    }
    
    loadAllData()
  }, [user?.id, storyBibleId, arcIndex, dataLoaded])

  // Subscribe to real-time updates (after data is loaded)
  useEffect(() => {
    if (!dataLoaded || !userId || !storyBibleId || !preProductionId) return
    
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }
    
    console.log('📡 Setting up real-time subscription...')
    setIsLoading(true)
    
    const unsubscribe = subscribeToPreProduction(userId, storyBibleId, preProductionId, (data) => {
      // Ensure it's arc type
      if (data && data.type === 'arc') {
        setPreProductionData(data as ArcPreProductionData)
        setIsLoading(false)
        setIsSyncing(false)
      } else if (data === null) {
        console.warn('⚠️  Production assistant document not found')
        setIsLoading(false)
      }
    })
    
    unsubscribeRef.current = unsubscribe
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [userId, storyBibleId, preProductionId, dataLoaded])

  // Aggregation logic (separate from auto-generation)
  useEffect(() => {
    if (aggregationComplete) return
    if (!preProductionData || !storyBible || !episodePreProdData || Object.keys(episodePreProdData).length === 0) return
    if (isLoading) return

    console.log('🔍 Checking if aggregation is needed...')
    
    // Check if production assistant data is empty
    const hasCasting = preProductionData.casting?.cast && preProductionData.casting.cast.length > 0
    const hasSchedule = preProductionData.shootingSchedule?.days && preProductionData.shootingSchedule.days.length > 0
    const equipment = preProductionData.equipment as any
    const hasEquipment = equipment && (
      (Array.isArray(equipment.items) && equipment.items.length > 0) ||
      (Array.isArray(equipment.camera) && equipment.camera.length > 0) ||
      (Array.isArray(equipment.lighting) && equipment.lighting.length > 0) ||
      (Array.isArray(equipment.audio) && equipment.audio.length > 0)
    )
    const hasPermits = preProductionData.permits && (preProductionData.permits as any).permits && Array.isArray((preProductionData.permits as any).permits) && (preProductionData.permits as any).permits.length > 0
    // Locations are now generated at arc level, not aggregated from episodes
    
    // Aggregate missing data from episodes (excluding locations - they're generated at arc level)
    const needsAggregation = !hasCasting || !hasEquipment || !hasPermits
    
    console.log('🔍 Aggregation check:', {
      hasCasting,
      hasEquipment,
      hasPermits,
      needsAggregation,
      episodeCount: Object.keys(episodePreProdData).length,
      note: 'Locations are generated at arc level, not aggregated'
    })
    
    if (needsAggregation) {
      setAggregationComplete(true)
      
      const aggregateData = async () => {
        try {
          const updates: any = {}
          
          if (!hasCasting) {
            console.log('📊 Aggregating casting from episodes...')
            const aggregatedCasting = aggregateCastingFromEpisodes(episodePreProdData)
            if (aggregatedCasting.cast && aggregatedCasting.cast.length > 0) {
              updates.casting = aggregatedCasting
              console.log(`  ✅ Aggregated ${aggregatedCasting.cast.length} cast members`)
            }
          }
          
          if (!hasEquipment) {
            console.log('📊 Aggregating equipment from episodes...')
            const aggregatedEquipment = aggregateEquipmentFromEpisodes(episodePreProdData)
            const equipmentAny = aggregatedEquipment as any
            const eqCount = (equipmentAny.items?.length || 0) + 
              (equipmentAny.camera?.length || 0) + 
              (equipmentAny.lighting?.length || 0) + 
              (equipmentAny.audio?.length || 0)
            if (eqCount > 0) {
              updates.equipment = aggregatedEquipment
              console.log(`  ✅ Aggregated ${eqCount} equipment items`)
            }
          }
          
          if (!hasPermits) {
            console.log('📊 Aggregating permits from episodes...')
            const aggregatedPermits = aggregatePermitsFromEpisodes(episodePreProdData)
            if (aggregatedPermits.permits && aggregatedPermits.permits.length > 0) {
              updates.permits = aggregatedPermits
              console.log(`  ✅ Aggregated ${aggregatedPermits.permits.length} permits`)
            }
          }
          
          // Locations are now generated at arc level, not aggregated from episodes
          
          // Save aggregated data to arc document
          if (Object.keys(updates).length > 0) {
            console.log(`💾 Saving ${Object.keys(updates).length} aggregated sections to arc document`)
            await handleTabUpdate('', updates)
            console.log('✅ Aggregation complete')
          } else {
            console.log('⚠️  No data to aggregate - episodes may not have pre-production data')
          }
        } catch (error) {
          console.error('❌ Error during aggregation:', error)
        }
      }
      
      aggregateData()
    } else {
      setAggregationComplete(true)
    }
  }, [preProductionData, storyBible, episodePreProdData, isLoading, aggregationComplete, handleTabUpdate])

  // Auto-generation logic (only if ALL data is empty)
  useEffect(() => {
    if (hasCheckedAutoGen.current) return
    if (!preProductionData || !storyBible || !episodePreProdData || Object.keys(episodePreProdData).length === 0) return
    if (isLoading) return
    if (!aggregationComplete) return // Wait for aggregation to complete

    // Check if ALL data is empty (casting, schedule, locations, permits, budget, equipment, props, marketing)
    const hasCasting = preProductionData.casting?.cast && preProductionData.casting.cast.length > 0
    const hasSchedule = preProductionData.shootingSchedule?.days && preProductionData.shootingSchedule.days.length > 0
    const hasLocations = (preProductionData as any).locations?.locationGroups?.length > 0 || (preProductionData as any).locations?.locations?.length > 0
    const hasPermits = preProductionData.permits && (preProductionData.permits as any).permits && Array.isArray((preProductionData.permits as any).permits) && (preProductionData.permits as any).permits.length > 0
    const hasBudget = (preProductionData as any).budget && Object.keys(preProductionData as any).length > 0
    const hasEquipment = (preProductionData as any).equipment && Object.keys(preProductionData as any).length > 0
    const hasProps = (preProductionData as any).propsWardrobe && Object.keys(preProductionData as any).length > 0
    const hasMarketing = (preProductionData as any).arcMarketing && Object.keys((preProductionData as any).arcMarketing || {}).length > 0

    // Only auto-generate if ALL data is empty
    if (!hasCasting && !hasSchedule && !hasLocations && !hasPermits && !hasBudget && !hasEquipment && !hasProps && !hasMarketing) {
      hasCheckedAutoGen.current = true
      console.log('🚀 Triggering auto-generation for ALL tabs (all data empty)')
      autoGenerateAllTabsOnce()
    } else {
      hasCheckedAutoGen.current = true
    }
  }, [preProductionData, storyBible, episodePreProdData, isLoading, aggregationComplete, autoGenerateAllTabsOnce])

  // Manual refresh function to force re-aggregation
  const handleRefreshData = async () => {
    if (!preProductionData || !episodePreProdData || Object.keys(episodePreProdData).length === 0) return
    
    setIsSyncing(true)
    try {
      // Reset aggregation check to allow re-aggregation
      setAggregationComplete(false)
      
      // Re-aggregate all data from episodes
      const updates: any = {}
      
      const aggregatedCasting = aggregateCastingFromEpisodes(episodePreProdData)
      if (aggregatedCasting.cast && aggregatedCasting.cast.length > 0) {
        updates.casting = aggregatedCasting
      }
      
      const aggregatedEquipment = aggregateEquipmentFromEpisodes(episodePreProdData)
      const equipmentAny = aggregatedEquipment as any
      if ((equipmentAny.items && equipmentAny.items.length > 0) || 
          (equipmentAny.camera && equipmentAny.camera.length > 0) ||
          (equipmentAny.lighting && equipmentAny.lighting.length > 0)) {
        updates.equipment = aggregatedEquipment
      }
      
              const aggregatedPermits = aggregatePermitsFromEpisodes(episodePreProdData)
      if (aggregatedPermits.permits && aggregatedPermits.permits.length > 0) {
        updates.permits = aggregatedPermits
      }
      
      // Locations are generated at arc level, not aggregated from episodes
      
      await handleTabUpdate('', updates)
      console.log('✅ Data refreshed and saved to arc document')
    } catch (error) {
      console.error('❌ Error refreshing data:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const renderTabContent = () => {
    if (!preProductionData) return null

    const commonProps = {
      preProductionData,
      onUpdate: handleTabUpdate,
      currentUserId: user?.id || '',
      currentUserName: user?.displayName || user?.email || 'User',
      userEmail: user?.email || undefined,
      userPhone: (user as any)?.phoneNumber || undefined,
      // Arc-wide props
      arcPreProdData: preProductionData,
      episodePreProdData,
      storyBible,
      arcIndex
    }

    switch (activeTab) {
      case 'casting':
        return <CastingTab {...commonProps} />
      case 'schedule':
        return <ScheduleRehearsalTab {...commonProps} />
      case 'budget':
        return <BudgetTrackerTab {...commonProps} />
      case 'equipment':
        return <EquipmentTab {...commonProps} />
      case 'locations':
        return <SeriesLocationsTab 
          arcPreProdData={preProductionData}
          episodePreProdData={episodePreProdData}
          storyBible={storyBible}
          onUpdate={handleTabUpdate}
          currentUserId={user?.id || ''}
          currentUserName={user?.displayName || user?.email || 'User'}
        />
      case 'props':
        return <SeriesPropsWardrobeTab 
          arcPreProdData={preProductionData}
          episodePreProdData={episodePreProdData}
          storyBible={storyBible}
          onUpdate={handleTabUpdate}
          currentUserId={user?.id || ''}
          currentUserName={user?.displayName || user?.email || 'User'}
          autoOpenQuestionnaire={shouldAutoOpenPropsQuestionnaire}
          onAutoOpenHandled={() => setShouldAutoOpenPropsQuestionnaire(false)}
        />
      case 'permits':
        return <PermitsTab {...commonProps} />
      case 'marketing':
        return <ArcMarketingTab 
          {...commonProps}
          arcIndex={arcIndex}
          storyBible={storyBible}
        />
      default:
        return <div>Tab not implemented</div>
    }
  }

  const handleExportPDF = () => {
    console.log('Export PDF - To be implemented')
    alert('PDF export coming soon!')
  }

  const handleExportCSV = () => {
    console.log('Export CSV - To be implemented')
    alert('CSV export coming soon!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyJSON = async () => {
    if (preProductionData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(preProductionData, null, 2))
        alert('Copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7]">Loading production assistant data...</p>
        </div>
      </div>
    )
  }

  if (!preProductionData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#e7e7e7] text-xl mb-4">Production assistant data not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-[#121212]">
      {/* Auto-generation Progress Overlay */}
      <GenerationProgressOverlay
        isVisible={isAutoGenerating}
        steps={generationSteps}
        currentStep={currentGenerationStep}
        progress={generationProgress}
      />

      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7]"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#10B981]">
                  Production Assistant
                </h1>
                <p className="text-sm text-[#e7e7e7]/70">
                  {preProductionData.arcTitle} • Episodes {preProductionData.episodeNumbers?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSyncing && (
                <div className="flex items-center gap-2 text-sm text-[#10B981]">
                  <div className="w-3 h-3 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              
              <button
                onClick={() => setShowRegenerateModal(true)}
                disabled={isSyncing || !storyBible || !preProductionData}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg"
                title="Regenerate all Production Assistant content"
              >
                🔄 Regenerate All
              </button>
              
              <button
                onClick={handleRefreshData}
                disabled={isSyncing}
                className="px-3 py-1.5 text-sm bg-[#2a2a2a] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#e7e7e7]"
                title="Refresh aggregated data from episodes"
              >
                🔄 Refresh Data
              </button>
              
              <div className="text-sm text-[#e7e7e7]/50">
                {preProductionData.collaborators?.length || 0} collaborator
                {preProductionData.collaborators?.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Timeline + Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar Navigation */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
          className="bg-[#1a1a1a] border-r border-[#36393f] flex-shrink-0 overflow-y-auto"
        >
          <div className="p-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full mb-4 p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7] flex items-center justify-center"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>

      {/* Tab Navigation */}
            <div className="space-y-1">
            {ARC_TABS.map((tab) => {
              const isActive = activeTab === tab.id
                
                // Calculate completion percentage for this tab
                const getTabCompletion = () => {
                  if (!preProductionData) return 0
                  switch (tab.id) {
                    case 'casting':
                      return (preProductionData.casting?.cast?.length ?? 0) > 0 ? 100 : 0
                    case 'schedule':
                      return (preProductionData.shootingSchedule?.days?.length ?? 0) > 0 ? 100 : 0
                    case 'budget':
                      const budget = preProductionData.budget as any
                      return (budget?.totalBudget ?? 0) > 0 ? 100 : 0
                    case 'equipment':
                      const eq = preProductionData.equipment as any
                      const eqCount = (eq?.items?.length ?? 0) + (eq?.camera?.length ?? 0) + (eq?.lighting?.length ?? 0) + (eq?.audio?.length ?? 0)
                      return eqCount > 0 ? 100 : 0
                    case 'locations':
                      return ((preProductionData.locations as any)?.locations?.length ?? 0) > 0 ? 100 : 0
                    case 'props':
                      const pw = (preProductionData as any).propsWardrobe
                      const pwCount = (pw?.props?.length ?? 0) + (pw?.wardrobe?.length ?? 0)
                      return pwCount > 0 ? 100 : 0
                    case 'permits':
                      return ((preProductionData.permits as any)?.permits?.length ?? 0) > 0 ? 100 : 0
                    case 'marketing':
                      return ((preProductionData as any).arcMarketing || preProductionData.marketing) ? 100 : 0
                    default:
                      return 0
                  }
                }
                
                const completion = getTabCompletion()
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ArcTabType)}
                  className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
                      ${isActive 
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' 
                        : 'text-[#e7e7e7]/70 hover:bg-[#2a2a2a] hover:text-[#e7e7e7]'
                      }
                  `}
                  >
                    <span className="text-xl flex-shrink-0">{tab.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs opacity-60 mt-0.5">{tab.description}</div>
                        </div>
                        {/* Progress Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full border-2 border-[#36393f] flex items-center justify-center text-xs font-bold"
                  style={{
                              borderColor: completion === 100 ? '#10B981' : '#36393f',
                              backgroundColor: completion === 100 ? '#10B981/20' : 'transparent',
                              color: completion === 100 ? '#10B981' : '#e7e7e7/50'
                            }}
                          >
                            {completion === 100 ? '✓' : completion}
                    </div>
                  </div>
                      </>
                    )}
                </button>
              )
            })}
          </div>
            
            {/* Overall Progress */}
            {!sidebarCollapsed && (() => {
              const calculateOverallProgress = () => {
                if (!preProductionData) return 0
                let total = 0
                ARC_TABS.forEach(tab => {
                  let completion = 0
                  switch (tab.id) {
                    case 'casting':
                      completion = (preProductionData.casting?.cast?.length ?? 0) > 0 ? 100 : 0
                      break
                    case 'schedule':
                      completion = (preProductionData.shootingSchedule?.days?.length ?? 0) > 0 ? 100 : 0
                      break
                    case 'budget':
                      const budgetData = preProductionData.budget as any
                      completion = (budgetData?.totalBudget ?? 0) > 0 ? 100 : 0
                      break
                    case 'equipment':
                      const eq = preProductionData.equipment as any
                      const eqCount = (eq?.items?.length ?? 0) + (eq?.camera?.length ?? 0) + (eq?.lighting?.length ?? 0) + (eq?.audio?.length ?? 0)
                      completion = eqCount > 0 ? 100 : 0
                      break
                    case 'locations':
                      completion = ((preProductionData.locations as any)?.locations?.length ?? 0) > 0 ? 100 : 0
                      break
                    case 'props':
                      const pw = (preProductionData as any).propsWardrobe
                      const pwCount = (pw?.props?.length ?? 0) + (pw?.wardrobe?.length ?? 0)
                      completion = pwCount > 0 ? 100 : 0
                      break
                    case 'permits':
                      completion = ((preProductionData.permits as any)?.permits?.length ?? 0) > 0 ? 100 : 0
                      break
                    case 'marketing':
                      completion = ((preProductionData as any).arcMarketing || preProductionData.marketing) ? 100 : 0
                      break
                  }
                  total += completion / ARC_TABS.length
                })
                return Math.round(total)
              }
              
              const overallProgress = calculateOverallProgress()
              
              return (
                <div className="mt-6 pt-6 border-t border-[#36393f]">
                  <div className="text-xs text-[#e7e7e7]/50 mb-2">Overall Progress</div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981] transition-all"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
        </div>
                  <div className="text-sm font-medium mt-2 text-[#e7e7e7]">
                    {overallProgress}% Complete
      </div>
                </div>
              )
            })()}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto px-6 py-8">
            {/* Export Toolbar */}
            <ExportToolbar
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onPrint={handlePrint}
              onCopyJSON={handleCopyJSON}
              disabled={isSyncing}
            />

            {/* Tab Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>

    {/* Regenerate All Modal */}
    {showRegenerateModal && preProductionData && storyBible && (
      <RegenerateAllModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onComplete={async (data: any) => {
          console.log('✅ Regeneration complete, updating data...', data)
          setIsSyncing(true)
          
          try {
            // Update all tabs with regenerated data
            await handleTabUpdate('', data)
            console.log('✅ All regenerated data saved')
          } catch (error) {
            console.error('❌ Error saving regenerated data:', error)
          } finally {
            setIsSyncing(false)
          }
        }}
        arcPreProductionId={preProductionId}
        storyBibleId={storyBibleId}
        arcIndex={arcIndex}
        episodeNumbers={preProductionData?.episodeNumbers || []}
        userId={user?.id}
        storyBibleData={storyBible}
        episodePreProdData={episodePreProdData}
        castingData={preProductionData?.casting}
      />
    )}
    </>
  )
}
