'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type {
  PreProductionData,
  ShootingScheduleData,
  ShootingDay
} from '@/types/preproduction'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { EditableField } from '../shared/EditableField'
import { ScheduleGenerationProgressOverlay } from '../shared/ScheduleGenerationProgressOverlay'
import { getStoryBible } from '@/services/story-bible-service'

interface ScheduleRehearsalTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
  // Arc-wide props (optional)
  arcPreProdData?: any
  episodePreProdData?: Record<number, any>
  storyBible?: any
  arcIndex?: number
}

export function ScheduleRehearsalTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  arcPreProdData,
  episodePreProdData,
  storyBible: storyBibleProp,
  arcIndex
}: ScheduleRehearsalTabProps) {
  const router = useRouter()
  
  // Detect arc context
  const isArcContext = preProductionData.type === 'arc' || !!arcPreProdData
  
  // Always use cross-episode scheduling
  const schedulingMode: 'cross-episode' = 'cross-episode'
  
  // Initialize selected episodes based on context
  const initialEpisodes = isArcContext && arcPreProdData 
    ? (arcPreProdData.episodeNumbers || [])
    : preProductionData.type === 'episode'
    ? [preProductionData.episodeNumber]
    : []
  
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>(initialEpisodes)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState({
    currentEpisode: 0,
    totalEpisodes: 0,
    completedEpisodes: 0,
    currentEpisodeTitle: ''
  })
  
  const scheduleData = preProductionData.shootingSchedule

  // Check if has prerequisites
  // For episode context: check preProductionData.scriptBreakdown
  // For arc context: check if any episode in episodePreProdData has breakdown
  const hasBreakdown = isArcContext 
    ? episodePreProdData && selectedEpisodes.every((epNum) => {
        const epPreProd = episodePreProdData[epNum]
        return epPreProd?.scriptBreakdown?.scenes && epPreProd.scriptBreakdown.scenes.length > 0
      })
    : preProductionData.type === 'episode' && preProductionData.scriptBreakdown && 
      preProductionData.scriptBreakdown.scenes && 
      preProductionData.scriptBreakdown.scenes.length > 0

  // Generate Schedule Handler
  const handleGenerateSchedule = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Generating schedule...')
      console.log('  Mode:', schedulingMode)
      console.log('  Episodes:', selectedEpisodes)

      // Validate prerequisites
      if (selectedEpisodes.length === 0) {
        setGenerationError('Please select at least one episode')
        setIsGenerating(false)
        return
      }

      // Check if current episode has breakdown (only for episode context)
      if (!isArcContext && preProductionData.type === 'episode' && !hasBreakdown) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        router.push(`/preproduction?storyBibleId=${preProductionData.storyBibleId}&episodeNumber=${preProductionData.episodeNumber}&episodeTitle=${encodeURIComponent(preProductionData.episodeTitle || '')}&tab=breakdown`)
        return
      }

      // Check which episodes are missing breakdowns (arc context)
      if (isArcContext && episodePreProdData) {
        const missingBreakdowns: number[] = []
        for (const epNum of selectedEpisodes) {
          const epData = episodePreProdData[epNum]
          if (!epData?.scriptBreakdown?.scenes || epData.scriptBreakdown.scenes.length === 0) {
            missingBreakdowns.push(epNum)
          }
        }

        if (missingBreakdowns.length > 0) {
          setGenerationError(`Cannot generate schedule: Episodes ${missingBreakdowns.join(', ')} are missing script breakdowns. Please generate breakdowns for these episodes first.`)
          setIsGenerating(false)
          return
        }
      }

      // Fetch story bible (use prop if available, otherwise fetch)
      const storyBible = storyBibleProp || await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // Set progress state
      setGenerationProgress({
        currentEpisode: 1,
        totalEpisodes: selectedEpisodes.length,
        completedEpisodes: 0,
        currentEpisodeTitle: `Episodes ${selectedEpisodes.join(', ')}`
      })

      // Check for Locations data (warn but allow fallback)
      const arcLocationsData = isArcContext ? arcPreProdData?.locations : undefined
      if (isArcContext && !arcLocationsData) {
        console.warn('⚠️  No Locations data found. Schedule will use generic location names.')
        console.warn('   For better accuracy with real venue names and logistics, generate Locations tab first.')
      } else if (isArcContext && arcLocationsData) {
        console.log('✅ Locations data found:', arcLocationsData.locationGroups?.length || 0, 'location groups')
      }

      // Call generation API
      console.log('🤖 Calling schedule generation API...')
      
      // Prepare episode pre-production data to pass from client (avoids server-side Firestore issues)
      const episodePreProdDataForAPI: Record<number, any> = {}
      if (isArcContext && episodePreProdData) {
        // Use the episode pre-production data passed from shell
        Object.assign(episodePreProdDataForAPI, episodePreProdData)
      }
      
      const response = await fetch('/api/generate/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyBibleId: preProductionData.storyBibleId,
          episodeNumbers: selectedEpisodes,
          schedulingMode,
          optimizationPriority: 'location',
          userId: currentUserId,
          storyBible: storyBibleProp, // Send story bible data to avoid server-side Firestore calls
          episodePreProdData: isArcContext ? episodePreProdDataForAPI : undefined,
          arcLocationsData: isArcContext ? arcLocationsData : undefined, // Pass arc-level locations
          ...(isArcContext && arcPreProdData ? { arcPreProductionId: preProductionData.id } : {})
        })
      })

      if (!response.ok) {
        let errorMessage = 'Generation failed'
        try {
          const text = await response.text()
          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.details || errorData.error || errorMessage
            } catch {
              errorMessage = text || `Server error: ${response.status} ${response.statusText}`
            }
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse JSON response:', text.substring(0, 500))
        throw new Error(`Invalid response format: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }

      console.log('✅ Schedule generated:', result.schedule.totalShootDays, 'shoot days')

      // Update progress to completion
      setGenerationProgress(prev => ({
        ...prev,
        completedEpisodes: selectedEpisodes.length
      }))

      // Simulate shoot dates 1 week out to maximize prep time
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() + 7)
      const simulatedDays = (result.schedule?.days || []).map((day: any, idx: number) => {
        const simulatedDate = new Date(baseDate)
        simulatedDate.setDate(baseDate.getDate() + idx)
        return {
          ...day,
          date: simulatedDate.toISOString().split('T')[0]
        }
      })

      // Save to Firestore
      await onUpdate('shootingSchedule', {
        ...result.schedule,
        days: simulatedDays,
        simulated: true,
        simulationNote: 'Dates set ~1 week out to allow cast/crew prep',
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

      // Show optimization summary
      if (result.optimizationSummary) {
        const { totalShootDays, locationMovesSaved, estimatedTimeSavings } = result.optimizationSummary
        let message = `Schedule created: ${totalShootDays} shoot days`
        if (schedulingMode === 'cross-episode' && locationMovesSaved > 0) {
          message += `, saved ${estimatedTimeSavings} (${locationMovesSaved} location moves avoided!)`
        }
        console.log('📊', message)
      }

      console.log('✅ Schedule saved to Firestore')
    } catch (error: any) {
      console.error('❌ Error generating schedule:', error)
      setGenerationError(error.message || 'Failed to generate schedule')
    } finally {
      setIsGenerating(false)
    }
  }

  const breakdownSceneCount = isArcContext
    ? Object.values(episodePreProdData || {}).reduce(
        (total: number, epPreProd: any) => total + (epPreProd?.scriptBreakdown?.scenes?.length || 0),
        0
      )
    : preProductionData.scriptBreakdown?.scenes?.length || 0

  const availableEpisodes = isArcContext
    ? Array.from(
        new Set([
          ...(arcPreProdData?.episodeNumbers || []),
          ...Object.keys(episodePreProdData || {}).map((n) => parseInt(n, 10))
        ])
      ).sort((a, b) => a - b)
    : preProductionData.episodeNumber
    ? [preProductionData.episodeNumber]
    : [1]

  // Empty State
  if (!scheduleData) {
    return (
      <>
        <ScheduleGenerationProgressOverlay
          isVisible={isGenerating}
          currentEpisode={generationProgress.currentEpisode}
          totalEpisodes={generationProgress.totalEpisodes}
          completedEpisodes={generationProgress.completedEpisodes}
          currentEpisodeTitle={generationProgress.currentEpisodeTitle}
        />
        
        <div className="space-y-6">
          <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#e7e7e7]">Generate your shooting schedule</h2>
                <p className="text-sm text-[#e7e7e7]/70">
                  Build a production-ready plan from your script breakdown in a single step.
                </p>
                  </div>
              <div className="text-sm text-[#e7e7e7]/60">
                {breakdownSceneCount} scene{breakdownSceneCount === 1 ? '' : 's'} detected
          </div>
        </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#e7e7e7]">Episodes to include (cross-episode)</label>
                  <div className="flex flex-wrap gap-2">
                {(availableEpisodes.length ? availableEpisodes : selectedEpisodes).map((ep) => (
                      <button
                        key={ep}
                        onClick={() => {
                          if (selectedEpisodes.includes(ep)) {
                        setSelectedEpisodes(selectedEpisodes.filter((e) => e !== ep))
                          } else {
                            setSelectedEpisodes([...selectedEpisodes, ep])
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedEpisodes.includes(ep)
                            ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]'
                        : 'border-[#36393f] text-[#e7e7e7]/70 hover:border-[#36393f]/60'
                        }`}
                      >
                        Episode {ep}
                      </button>
                    ))}
                  </div>
              {!hasBreakdown && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  Each selected episode needs a script breakdown before scheduling.
              </div>
            )}
                    </div>

            {isArcContext && !arcPreProdData?.locations && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-[#e7e7e7]">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <div>
                    <p className="font-medium text-yellow-400">Generate Locations tab first for better schedule accuracy</p>
                    <p className="text-[#e7e7e7]/70 mt-1">
                      Schedule will use generic location names. For real venue names, addresses, logistics, and cost estimates, generate the Locations tab first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generationError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-[#e7e7e7]">
                {generationError}
              </div>
            )}

            <div className="flex justify-end">
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating || !hasBreakdown}
                className="px-6 py-3 bg-[#10B981] text-black rounded-lg font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                    Generate schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </>
    )
  }

  // Has Schedule Data - Show Full Interface
  const uniqueLocations = new Set(scheduleData.days.map(d => d.location)).size
  const totalScenes = scheduleData.days.reduce((sum, day) => sum + day.scenes.length, 0)
  const completedDays = scheduleData.days.filter(d => d.status === 'shot').length
  const orderedCalendarDays = useMemo(() => {
    const byDate = [...scheduleData.days]
    return byDate.sort((a, b) => {
      const aDate = a.date ? Date.parse(a.date) : NaN
      const bDate = b.date ? Date.parse(b.date) : NaN
      const aValid = !Number.isNaN(aDate)
      const bValid = !Number.isNaN(bDate)
      if (aValid && bValid) {
        return aDate === bDate ? a.dayNumber - b.dayNumber : aDate - bDate
      }
      if (aValid) return -1
      if (bValid) return 1
      return a.dayNumber - b.dayNumber
    })
  }, [scheduleData.days])

  return (
    <>
      {/* Progress Overlay */}
      <ScheduleGenerationProgressOverlay
        isVisible={isGenerating}
        currentEpisode={generationProgress.currentEpisode}
        totalEpisodes={generationProgress.totalEpisodes}
        completedEpisodes={generationProgress.completedEpisodes}
        currentEpisodeTitle={generationProgress.currentEpisodeTitle}
      />
      
      <div className="space-y-6">
      {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Shoot days</div>
          <div className="text-2xl font-bold text-[#10B981]">{scheduleData.totalShootDays}</div>
          <div className="text-xs text-[#e7e7e7]/50">{completedDays} completed</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Locations</div>
          <div className="text-2xl font-bold text-[#10B981]">{uniqueLocations}</div>
          <div className="text-xs text-[#e7e7e7]/50">Unique places</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Scenes</div>
          <div className="text-2xl font-bold text-[#10B981]">{totalScenes}</div>
          <div className="text-xs text-[#e7e7e7]/50">Total to shoot</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Mode</div>
          <div className="text-lg font-bold text-[#10B981]">
              'Cross-episode'
          </div>
          <div className="text-xs text-[#e7e7e7]/50">
            {scheduleData.episodeNumbers ? `${scheduleData.episodeNumbers.length} eps` : '1 ep'}
          </div>
        </div>
      </div>

        {/* Overview + Actions */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#e7e7e7]">Schedule overview</h2>
            <p className="text-sm text-[#e7e7e7]/70">
          {`Episodes ${scheduleData.episodeNumbers?.join(', ') || selectedEpisodes.join(', ')}`}
            </p>
          </div>
          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg font-medium hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-start"
          >
            <span>🔄</span>
            {isGenerating ? 'Regenerating...' : 'Regenerate schedule'}
          </button>
      </div>

        {/* Hybrid layout */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
          <ListView
            scheduleData={scheduleData}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onUpdate={onUpdate}
          />

          <CalendarView days={orderedCalendarDays} />
        </div>
    </div>
    </>
  )
}

// List View Component
function ListView({
  scheduleData,
  currentUserId,
  currentUserName,
  onUpdate
}: {
  scheduleData: ShootingScheduleData
  currentUserId: string
  currentUserName: string
  onUpdate: (tabName: string, tabData: any) => Promise<void>
}) {
  return (
    <div className="space-y-4">
      {scheduleData.days.map((day, dayIndex) => (
        <ShootingDayCard
          key={day.dayNumber}
          day={day}
          dayIndex={dayIndex}
          scheduleData={scheduleData}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

// Shooting Day Card Component
function ShootingDayCard({
  day,
  dayIndex,
  scheduleData,
  currentUserId,
  currentUserName,
  onUpdate
}: {
  day: ShootingDay
  dayIndex: number
  scheduleData: ShootingScheduleData
  currentUserId: string
  currentUserName: string
  onUpdate: (tabName: string, tabData: any) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusColors = {
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    shot: 'bg-green-500/20 text-green-400 border-green-500/40',
    postponed: 'bg-red-500/20 text-red-400 border-red-500/40'
  }

  const handleDayUpdate = async (field: string, value: any) => {
    const updatedDays = [...scheduleData.days]
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      [field]: value
    }

    await onUpdate('shootingSchedule', {
      ...scheduleData,
      days: updatedDays,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleAddComment = async (content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedDays = [...scheduleData.days]
    updatedDays[dayIndex] = {
      ...day,
      comments: [...(day.comments || []), newComment]
    }

    await onUpdate('shootingSchedule', {
      ...scheduleData,
      days: updatedDays,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-[#36393f]/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Day Number */}
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
          <div className="text-xs text-[#e7e7e7]/50">Day</div>
          <div className="text-2xl font-bold text-[#10B981]">{day.dayNumber}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-[#e7e7e7]">{day.location}</h3>
            {day.date && (
              <span className="text-sm text-[#e7e7e7]/60">{day.date}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
            <span>🕐 {day.callTime} - {day.estimatedWrapTime}</span>
            <span>•</span>
            <span>🎬 {day.scenes.length} scenes</span>
            <span>•</span>
            <span>👥 {day.castRequired.length} cast</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <span
            onClick={(e) => {
              e.stopPropagation()
              const statuses = ['scheduled', 'confirmed', 'shot', 'postponed']
              const currentIndex = statuses.indexOf(day.status)
              const nextStatus = statuses[(currentIndex + 1) % statuses.length]
              handleDayUpdate('status', nextStatus)
            }}
          >
            <StatusBadge 
              status={day.status}
              editable
            />
          </span>
          
          <button className="text-[#e7e7e7] hover:text-[#10B981] transition-colors">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#36393f] p-6 space-y-6"
          >
            {/* Scenes */}
            <div>
              <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Scenes ({day.scenes.length})</h4>
              <div className="space-y-2">
                {day.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className="bg-[#1a1a1a] rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="text-[#10B981] font-bold">
                      Ep{scene.episodeNumber} Scene {scene.sceneNumber}
                    </div>
                    <div className="flex-1 text-sm text-[#e7e7e7]">{scene.sceneTitle}</div>
                    <div className="text-xs text-[#e7e7e7]/50">{scene.estimatedDuration}min</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cast */}
            {day.castRequired.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Cast Required</h4>
                <div className="flex flex-wrap gap-2">
                  {day.castRequired.map((cast, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-[#1a1a1a] rounded text-sm text-[#e7e7e7]"
                    >
                      {cast.characterName}
                      {cast.actorName && (
                        <span className="text-[#e7e7e7]/50"> ({cast.actorName})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {day.equipmentRequired.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Equipment Required</h4>
                <div className="flex flex-wrap gap-2">
                  {day.equipmentRequired.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-[#1a1a1a] rounded text-sm text-[#e7e7e7]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {day.specialNotes && (
              <div>
                <h4 className="text-sm font-bold text-[#e7e7e7] mb-2">Special Notes</h4>
                <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm text-[#e7e7e7]/80">
                  {day.specialNotes}
                </div>
              </div>
            )}

            {/* Weather Contingency */}
            {day.weatherContingency && (
              <div>
                <h4 className="text-sm font-bold text-[#e7e7e7] mb-2">Weather Contingency</h4>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-[#e7e7e7]/80">
                  {day.weatherContingency}
                </div>
              </div>
            )}

            {/* Comments */}
            <CollaborativeNotes
              comments={day.comments || []}
              onAddComment={handleAddComment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Calendar View Component
function CalendarView({ days }: { days: ShootingDay[] }) {
  const groupedByDate = useMemo(() => {
    const groups: Record<string, ShootingDay[]> = {}
    days.forEach((day) => {
      const key = day.date || `Day ${day.dayNumber}`
      if (!groups[key]) groups[key] = []
      groups[key].push(day)
    })

    return Object.entries(groups).map(([dateLabel, entries]) => ({
      dateLabel,
      entries
    }))
  }, [days])

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#e7e7e7]">Calendar</h3>
          <p className="text-sm text-[#e7e7e7]/60">Quick view by shoot date</p>
            </div>
        <div className="text-xs text-[#e7e7e7]/60">{days.length} day{days.length === 1 ? '' : 's'}</div>
        </div>

      <div className="space-y-3">
        {groupedByDate.length === 0 && (
          <div className="text-sm text-[#e7e7e7]/60">Add dates to see them here.</div>
        )}

        {groupedByDate.map(({ dateLabel, entries }) => {
          const sceneCount = entries.reduce((total, entry) => total + entry.scenes.length, 0)
  return (
            <div key={dateLabel} className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#10B981]">{dateLabel}</div>
                  <div className="text-xs text-[#e7e7e7]/60">Day {entries.map((d) => d.dayNumber).join(', ')}</div>
      </div>
                <div className="text-xs text-[#e7e7e7]/60">{sceneCount} scene{sceneCount === 1 ? '' : 's'}</div>
    </div>

              <div className="space-y-2">
                {entries.map((day) => (
                  <div
                    key={`${dateLabel}-${day.dayNumber}`}
                    className="flex items-center justify-between text-sm text-[#e7e7e7]"
                  >
                    <div className="truncate">
                      {day.location || 'Location TBD'}
                      {day.callTime && day.estimatedWrapTime && (
                        <span className="text-[#e7e7e7]/60"> • {day.callTime}-{day.estimatedWrapTime}</span>
                      )}
              </div>
                    <div className="text-xs text-[#e7e7e7]/60">
                      {day.scenes.length} scene{day.scenes.length === 1 ? '' : 's'}
              </div>
              </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
