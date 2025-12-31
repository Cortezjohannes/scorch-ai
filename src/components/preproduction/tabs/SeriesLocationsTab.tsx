'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { 
  ArcPreProductionData, 
  SeriesLocationUsage, 
  Location,
  ArcLocationsData,
  ArcLocationGroup,
  ShootingLocationSuggestion
} from '@/types/preproduction'
import { LocationGenerationProgressOverlay } from '../shared/LocationGenerationProgressOverlay'

type LocationStatus = 'scouted' | 'contacted' | 'quoted' | 'booked' | 'confirmed'

type ExtendedSuggestion = ShootingLocationSuggestion & {
  costBreakdown?: {
    dayRate: number
    permitCost?: number
    insuranceRequired?: boolean
    depositAmount?: number
  }
  permitCost?: number
  depositAmount?: number
  insuranceRequired?: boolean
}

type ExtendedGroup = ArcLocationGroup & {
  selectedSuggestionId?: string
  costEstimate?: {
    dayRate: number
    permitCost?: number
    insuranceRequired?: boolean
    depositAmount?: number
  }
  confidence?: number
  timeOfDay?: string[]
  status?: LocationStatus
}

type ExtendedArcLocationsData = ArcLocationsData & {
  locationGroups: ExtendedGroup[]
  costRollup?: {
    perLocation: Array<{
      locationId: string
      parentLocationName: string
      selectedSuggestionId?: string
      dayRate: number
      permitCost?: number
      insuranceRequired?: boolean
      depositAmount?: number
      total: number
    }>
    arcTotal: number
  }
}


interface SeriesLocationsTabProps {
  arcPreProdData: ArcPreProductionData
  episodePreProdData: Record<number, any>
  storyBible: any
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function SeriesLocationsTab({
  arcPreProdData,
  episodePreProdData,
  storyBible,
  onUpdate,
  currentUserId,
  currentUserName
}: SeriesLocationsTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState<{
    step: string
    message: string
    progress: number
    currentLocation?: number
    totalLocations?: number
    currentLocationName?: string
  } | null>(null)
  // Check if locations data exists and is in new format
  const isArcLocationsData = (data: any): data is ArcLocationsData => {
    return data && 
      typeof data === 'object' &&
      'locationGroups' in data &&
      'generated' in data &&
      Array.isArray(data.locationGroups)
  }

  const initialLocationsData = arcPreProdData.locations && isArcLocationsData(arcPreProdData.locations)
    ? (arcPreProdData.locations as unknown as ExtendedArcLocationsData)
    : null

  const [arcLocationsData, setArcLocationsData] = useState<ExtendedArcLocationsData | null>(initialLocationsData)
  const failedGroups = useMemo(
    () =>
      (arcLocationsData?.locationGroups || []).filter(
        (g) => g.generationError || (g.shootingLocationSuggestions?.length || 0) === 0
      ),
    [arcLocationsData]
  )
  const computeSuggestionCost = (suggestion: ExtendedSuggestion | undefined, group?: ExtendedGroup) => {
    if (!suggestion) return Number.MAX_SAFE_INTEGER
    const dayRate = suggestion.costBreakdown?.dayRate ?? suggestion.estimatedCost ?? group?.costEstimate?.dayRate ?? 0
    const permitCost = suggestion.costBreakdown?.permitCost ?? suggestion.permitCost ?? suggestion.logistics?.permitCost ?? group?.costEstimate?.permitCost ?? 0
    const depositAmount = suggestion.costBreakdown?.depositAmount ?? suggestion.depositAmount ?? group?.costEstimate?.depositAmount ?? 0
    return Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount)
  }

  const computeCostRollup = (locationGroups: ExtendedGroup[]) => {
    const perLocation = locationGroups.map(group => {
      const suggestions = (group.shootingLocationSuggestions || []) as ExtendedSuggestion[]
      const selected = suggestions.find(s => s.id === group.selectedSuggestionId) ||
        suggestions
          .map(s => ({ s, cost: computeSuggestionCost(s, group) }))
          .sort((a, b) => a.cost - b.cost)[0]?.s

      const dayRate = selected?.costBreakdown?.dayRate ?? selected?.estimatedCost ?? group.costEstimate?.dayRate ?? 0
      const permitCost = selected?.costBreakdown?.permitCost ?? selected?.permitCost ?? selected?.logistics?.permitCost ?? group.costEstimate?.permitCost ?? 0
      const depositAmount = selected?.costBreakdown?.depositAmount ?? selected?.depositAmount ?? group.costEstimate?.depositAmount ?? 0
      const insuranceRequired = selected?.costBreakdown?.insuranceRequired ?? selected?.insuranceRequired ?? group.costEstimate?.insuranceRequired ?? false
      const total = Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount)

      return {
        locationId: group.id,
        parentLocationName: group.parentLocationName,
        selectedSuggestionId: selected?.id,
        dayRate,
        permitCost,
        insuranceRequired,
        depositAmount,
        total
      }
    })
    const arcTotal = perLocation.reduce((sum, loc) => sum + (loc.total || 0), 0)
    return { perLocation, arcTotal }
  }

  const handlePersistArcLocations = async (updated: ExtendedArcLocationsData) => {
    setArcLocationsData(updated)
    await onUpdate('locations', updated)
  }

  const handleSelectSuggestion = async (groupId: string, suggestionId: string) => {
    if (!arcLocationsData) return
    const updatedGroups = arcLocationsData.locationGroups.map(group =>
      group.id === groupId ? { ...group, selectedSuggestionId: suggestionId } : group
    )
    const updated: ExtendedArcLocationsData = {
      ...arcLocationsData,
      locationGroups: updatedGroups,
      costRollup: computeCostRollup(updatedGroups),
      lastUpdated: Date.now()
    }
    await handlePersistArcLocations(updated)
  }

  const handleUpdateStatus = async (groupId: string, status: ExtendedGroup['status']) => {
    if (!arcLocationsData) return
    const updatedGroups = arcLocationsData.locationGroups.map(group =>
      group.id === groupId ? { ...group, status } : group
    )
    const updated: ExtendedArcLocationsData = {
      ...arcLocationsData,
      locationGroups: updatedGroups,
      costRollup: computeCostRollup(updatedGroups),
      lastUpdated: Date.now()
    }
    await handlePersistArcLocations(updated)
  }
  
  // Auto-generate on first load if no locations exist
  useEffect(() => {
    const hasLocations = (arcLocationsData?.locationGroups?.length ?? 0) > 0 || 
      Object.values(episodePreProdData).some((ep: any) => 
        ep.locations?.locations?.length > 0 || ep.locations?.selectedLocations?.length > 0
      )
    
    if (!hasLocations && !isGenerating && !arcLocationsData) {
      console.log('📍 Auto-generating locations on first load...')
      // Use setTimeout to avoid calling during render
      setTimeout(() => {
        handleGenerateLocations()
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Handle location generation
  const handleGenerateLocations = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    setGenerationProgress({
      step: 'initializing',
      message: 'Initializing location generation...',
      progress: 0
    })

    try {
      // Aggregate breakdown and script data
      const aggregatedBreakdown: any = {
        scenes: [],
        totalScenes: 0
      }
      const episodeNumbers = arcPreProdData.episodeNumbers || []

      Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]: [string, any]) => {
        const epNum = parseInt(epNumStr)
        const breakdown = epPreProd.scriptBreakdown
        if (breakdown?.scenes && Array.isArray(breakdown.scenes)) {
          const scenesWithEpisode = breakdown.scenes.map((scene: any) => ({
            ...scene,
            linkedEpisode: epNum,
            episodeNumber: epNum
          }))
          aggregatedBreakdown.scenes.push(...scenesWithEpisode)
          aggregatedBreakdown.totalScenes += breakdown.scenes.length
        }
      })

      // Get casting data if available
      const castingData = arcPreProdData.casting || null

      const response = await fetch('/api/generate/arc-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arcPreProductionId: arcPreProdData.id,
          storyBibleId: arcPreProdData.storyBibleId,
          arcIndex: arcPreProdData.arcIndex,
          episodeNumbers,
          userId: currentUserId,
          storyBibleData: storyBible,
          episodePreProdData,
          castingData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.details || 'Location generation failed')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))

              if (data.type === 'progress') {
                setGenerationProgress({
                  step: data.step || 'processing',
                  message: data.message || 'Processing...',
                  progress: data.progress || 0,
                  currentLocation: data.currentLocation,
                  totalLocations: data.totalLocations,
                  currentLocationName: data.currentLocationName
                })
              } else if (data.type === 'complete') {
                const locationsData = data.locations as ExtendedArcLocationsData
                const hydrated = {
                  ...locationsData,
                  costRollup: locationsData.costRollup || computeCostRollup((locationsData.locationGroups || []) as ExtendedGroup[])
                }
                setArcLocationsData(hydrated)
                
                // Save to production assistant
                await onUpdate('locations', hydrated)
                
                setIsGenerating(false)
                setGenerationProgress(null)
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Unknown error')
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Location generation error:', error)
      setGenerationError(error.message || 'Failed to generate locations')
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  // Aggregate locations from all episodes in arc (legacy support)
  const seriesLocations = useMemo(() => {
    const locationMap = new Map<string, SeriesLocationUsage>()
    
    Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
      const epNum = parseInt(epNumStr)
      const locationsData = epPreProd.locations
      
      if (!locationsData) return
      
      // Handle both old and new location structures
      const locations: Location[] = (() => {
        if (Array.isArray(locationsData.locations)) return locationsData.locations
        if (Array.isArray(locationsData.selectedLocations)) return locationsData.selectedLocations
        return []
      })()
      
      const episodeTitle = epPreProd.episodeTitle || `Episode ${epNum}`
      
      locations.forEach((location: Location) => {
        const locationId = location.id || location.name || `loc_${epNum}_${Math.random()}`
        
        if (!locationMap.has(locationId)) {
          locationMap.set(locationId, {
            locationId,
            locationName: location.name || 'Unnamed Location',
            locationAddress: location.address || '',
            baseLocation: location,
            episodesUsed: [],
            totalRentalCost: 0,
            costPerEpisode: 0,
            savingsFromReuse: 0,
            totalScenes: 0,
            totalEpisodes: 0,
            totalShootDays: 0,
            firstUsedEpisode: epNum,
            lastUsedEpisode: epNum
          })
        }
        
        const seriesLocation = locationMap.get(locationId)!
        
        // Extract scene numbers from location
        const sceneNumbers: number[] = (() => {
          if (location.scenes && Array.isArray(location.scenes)) {
            // New format: LocationSceneReference[]
            return location.scenes
              .filter((ref: any) => ref.episodeNumber === epNum)
              .map((ref: any) => ref.sceneNumber)
          }
          if (location.scenesLegacy && Array.isArray(location.scenesLegacy)) {
            // Legacy format: number[]
            return location.scenesLegacy
          }
          return []
        })()
        
        // Check if this episode is already in episodesUsed
        const existingEpisodeUsage = seriesLocation.episodesUsed.find(
          usage => usage.episodeNumber === epNum
        )
        
        if (!existingEpisodeUsage) {
          seriesLocation.episodesUsed.push({
            episodeNumber: epNum,
            episodeTitle,
            sceneNumbers,
            sceneCount: sceneNumbers.length,
            shootDays: [] // Could be populated from schedule data if available
          })
        } else {
          // Merge scene numbers if episode already exists
          const mergedScenes = Array.from(new Set([
            ...existingEpisodeUsage.sceneNumbers,
            ...sceneNumbers
          ]))
          existingEpisodeUsage.sceneNumbers = mergedScenes
          existingEpisodeUsage.sceneCount = mergedScenes.length
        }
      })
    })
    
    // Calculate aggregate stats
    const locations = Array.from(locationMap.values())
    locations.forEach(loc => {
      loc.totalEpisodes = loc.episodesUsed.length
      loc.totalScenes = loc.episodesUsed.reduce((sum, usage) => sum + usage.sceneCount, 0)
      loc.firstUsedEpisode = Math.min(...loc.episodesUsed.map(u => u.episodeNumber))
      loc.lastUsedEpisode = Math.max(...loc.episodesUsed.map(u => u.episodeNumber))
      
      // Calculate reuse savings (simplified - could be enhanced with actual cost data)
      if (loc.totalEpisodes > 1) {
        loc.savingsFromReuse = loc.totalEpisodes * 100 // Placeholder calculation
      }
    })
    
    return locations.sort((a, b) => b.totalEpisodes - a.totalEpisodes)
  }, [episodePreProdData])

  // Use new arc locations data if available, otherwise fall back to legacy aggregation
  const locationGroups = (arcLocationsData?.locationGroups || []) as ExtendedGroup[]
  const hasNewLocationData = locationGroups.length > 0
  const storyBibleLocationsCount = Array.isArray(storyBible?.worldBuilding?.locations)
    ? storyBible.worldBuilding.locations.length
    : 0

  // Calculate stats from location groups
  const totalLocations = hasNewLocationData ? locationGroups.length : seriesLocations.length
  const totalLocationsDisplay = storyBibleLocationsCount > 0 ? storyBibleLocationsCount : totalLocations
  const interiorLocations = hasNewLocationData
    ? locationGroups.filter(loc => loc.type === 'interior')
    : seriesLocations.filter(loc => 
        loc.baseLocation.type === 'interior' || (!loc.baseLocation.type && loc.baseLocation.name.toLowerCase().includes('interior'))
      )
  const exteriorLocations = hasNewLocationData
    ? locationGroups.filter(loc => loc.type === 'exterior')
    : seriesLocations.filter(loc => 
        loc.baseLocation.type === 'exterior' || (!loc.baseLocation.type && loc.baseLocation.name.toLowerCase().includes('exterior'))
      )
  const bothLocations = hasNewLocationData
    ? locationGroups.filter(loc => loc.type === 'both')
    : seriesLocations.filter(loc => loc.baseLocation.type === 'both')
  const costRollup = arcLocationsData?.costRollup || (hasNewLocationData ? computeCostRollup(locationGroups) : undefined)

  const handleResetLocations = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      // Clear local state
      setArcLocationsData(null)
      // Persist cleared locations
      await onUpdate('locations', {
        locationGroups: [],
        totalLocations: 0,
        lastUpdated: Date.now(),
        generated: false
      })
    } catch (err: any) {
      setGenerationError(err?.message || 'Failed to reset locations')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generation Progress Overlay */}
      {isGenerating && (
        <LocationGenerationProgressOverlay
          isVisible={isGenerating}
          currentLocation={generationProgress?.currentLocation || 1}
          totalLocations={generationProgress?.totalLocations || 1}
          currentLocationName={generationProgress?.currentLocationName || 'Processing...'}
          currentLocationScenes={0}
          completedLocations={generationProgress?.currentLocation ? generationProgress.currentLocation - 1 : 0}
          onCancel={() => {
            setIsGenerating(false)
            setGenerationProgress(null)
          }}
        />
      )}

      {/* Generation Error */}
      {generationError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-1">Generation Error</h3>
              <p className="text-sm text-[#e7e7e7]/70">{generationError}</p>
              <button
                onClick={() => setGenerationError(null)}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial failures notice */}
      {failedGroups.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <div className="text-sm text-yellow-200 font-semibold">
              {failedGroups.length} location{failedGroups.length !== 1 ? 's' : ''} need a retry
            </div>
            <div className="text-xs text-[#e7e7e7]/70">
              Regenerate to fetch new suggestions for the failed locations.
            </div>
          </div>
          <button
            onClick={handleGenerateLocations}
            disabled={isGenerating}
            className="px-3 py-2 bg-yellow-500/20 border border-yellow-500/60 text-yellow-100 rounded hover:bg-yellow-500/30 disabled:opacity-60"
          >
            Retry failed
          </button>
        </div>
      )}

      {/* Generate / Reset */}
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-2">Series Locations</h2>
          <p className="text-[#e7e7e7]/70">
            {hasNewLocationData 
              ? `Locations with real-world shooting suggestions for ${arcPreProdData.arcTitle || `Arc ${(arcPreProdData.arcIndex || 0) + 1}`}`
              : `Locations used across all episodes in ${arcPreProdData.arcTitle || `Arc ${(arcPreProdData.arcIndex || 0) + 1}`}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetLocations}
            disabled={isGenerating}
            className="px-4 py-3 bg-[#1f2937] hover:bg-[#111827] disabled:bg-[#1f2937]/60 text-white font-medium rounded-lg border border-[#36393f] transition-colors"
          >
            Reset Locations
          </button>
        <button
          onClick={handleGenerateLocations}
          disabled={isGenerating}
          className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span>📍</span>
              {hasNewLocationData ? 'Regenerate Locations' : 'Generate Locations'}
            </>
          )}
        </button>
      </div>
              </div>

      {/* Stats Cards */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252628] border border-[#36393f] rounded-xl p-6">
        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Total Locations</div>
            <div className="text-2xl font-bold text-[#10B981]">{totalLocationsDisplay}</div>
            {storyBibleLocationsCount > 0 && (
              <div className="text-[11px] text-[#e7e7e7]/50">Story Bible count</div>
            )}
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Interior</div>
            <div className="text-2xl font-bold text-[#10B981]">{interiorLocations.length}</div>
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Exterior</div>
            <div className="text-2xl font-bold text-[#10B981]">{exteriorLocations.length}</div>
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Both</div>
            <div className="text-2xl font-bold text-[#10B981]">{bothLocations.length}</div>
          </div>
          <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-2 border border-[#36393f]">
            <div className="text-xs text-[#e7e7e7]/50 mb-1">Est. Total (fees)</div>
            <div className="text-lg font-bold text-[#10B981]">
              {costRollup ? `$${Math.round(costRollup.arcTotal)}` : 'TBD'}
            </div>
          </div>
        </div>
      </div>

      {/* Location Groups (New Format) */}
      {hasNewLocationData && locationGroups.length > 0 && (
        <div className="space-y-4">
          {locationGroups.map((group) => (
            <LocationGroupCard
              key={group.id}
              group={group}
              episodeNumbers={arcPreProdData.episodeNumbers || []}
              onSelectSuggestion={handleSelectSuggestion}
              onUpdateStatus={handleUpdateStatus}
              computeSuggestionCost={computeSuggestionCost}
            />
          ))}
        </div>
      )}

      {/* Legacy Locations List */}
      {!hasNewLocationData && seriesLocations.length > 0 && (
        <div className="space-y-4">
          {seriesLocations.map((location) => (
            <LocationCard
              key={location.locationId}
              location={location}
              episodeNumbers={arcPreProdData.episodeNumbers || []}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!hasNewLocationData && seriesLocations.length === 0 && (
        <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-12 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Locations Found</h3>
          <p className="text-[#e7e7e7]/70 mb-4">
            Locations will appear here once they've been added in individual episode pre-production.
          </p>
          <p className="text-sm text-[#e7e7e7]/50">
            Go to Episode Pre-Production for each episode and add locations there.
          </p>
        </div>
      )}
    </div>
  )
}

function LocationCard({
  location,
  episodeNumbers
}: {
  location: SeriesLocationUsage
  episodeNumbers: number[]
}) {
  const typeColor = location.baseLocation.type === 'interior' 
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    : location.baseLocation.type === 'exterior'
    ? 'bg-green-500/20 text-green-400 border-green-500/40'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/40'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[#e7e7e7]">{location.locationName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColor}`}>
              {location.baseLocation.type || 'Location'}
            </span>
            {location.totalEpisodes > 1 && (
              <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-medium border border-[#10B981]/40">
                Reused {location.totalEpisodes}x
              </span>
            )}
          </div>
          {location.locationAddress && (
            <p className="text-sm text-[#e7e7e7]/70 mb-2">{location.locationAddress}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
            <span>{location.totalScenes} scene{location.totalScenes !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{location.totalEpisodes} episode{location.totalEpisodes !== 1 ? 's' : ''}</span>
            {location.savingsFromReuse > 0 && (
              <>
                <span>•</span>
                <span className="text-[#10B981]">${location.savingsFromReuse} saved from reuse</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Episode Usage Matrix */}
      <div className="mt-4">
        <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Used In:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {location.episodesUsed.map((usage, idx) => (
            <div
              key={idx}
              className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-bold">
                  Episode {usage.episodeNumber}
                </span>
              </div>
              <div className="text-xs text-[#e7e7e7]/70 mb-1">
                {usage.episodeTitle || `Episode ${usage.episodeNumber}`}
              </div>
              <div className="text-xs text-[#e7e7e7]/70">
                {usage.sceneNumbers.length > 0 ? (
                  <>
                    Scenes: {usage.sceneNumbers.join(', ')} ({usage.sceneCount} total)
                  </>
                ) : (
                  <span className="italic">No specific scenes</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Location Info */}
      {location.baseLocation.requirements && location.baseLocation.requirements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#36393f]">
          <h4 className="text-sm font-bold text-[#e7e7e7] mb-2">Requirements:</h4>
          <div className="flex flex-wrap gap-2">
            {location.baseLocation.requirements.map((req, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-[#1a1a1a] text-[#e7e7e7]/70 rounded text-xs border border-[#36393f]"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All Episodes Indicator */}
      {episodeNumbers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#36393f]">
          <div className="text-xs text-[#e7e7e7]/50">
            Used in {location.totalEpisodes} of {episodeNumbers.length} episodes in this arc
            {location.firstUsedEpisode !== location.lastUsedEpisode && (
              <> (Episodes {location.firstUsedEpisode} - {location.lastUsedEpisode})</>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// New Location Group Card Component
function LocationGroupCard({
  group,
  episodeNumbers,
  onSelectSuggestion,
  onUpdateStatus,
  computeSuggestionCost
}: {
  group: ExtendedGroup
  episodeNumbers: number[]
  onSelectSuggestion: (groupId: string, suggestionId: string) => Promise<void> | void
  onUpdateStatus: (groupId: string, status: ExtendedGroup['status']) => Promise<void> | void
  computeSuggestionCost: (suggestion: ExtendedSuggestion | undefined, group?: ExtendedGroup) => number
}) {
  const [expandedSubLocations, setExpandedSubLocations] = useState(false)
  const [expandedSuggestions, setExpandedSuggestions] = useState(true) // Expanded by default to show suggestions
  const suggestionList = (group.shootingLocationSuggestions as ExtendedSuggestion[] | undefined) || []
  const selectedSuggestion = suggestionList.find(s => s.id === group.selectedSuggestionId) || suggestionList[0]
  const dayRate = selectedSuggestion?.costBreakdown?.dayRate ?? selectedSuggestion?.estimatedCost ?? group.costEstimate?.dayRate ?? 0
  const permitCost = selectedSuggestion?.costBreakdown?.permitCost ?? selectedSuggestion?.permitCost ?? selectedSuggestion?.logistics?.permitCost ?? group.costEstimate?.permitCost ?? 0
  const depositAmount = selectedSuggestion?.costBreakdown?.depositAmount ?? selectedSuggestion?.depositAmount ?? group.costEstimate?.depositAmount ?? 0
  const insuranceRequired = selectedSuggestion?.costBreakdown?.insuranceRequired ?? selectedSuggestion?.insuranceRequired ?? group.costEstimate?.insuranceRequired
  const totalCost = Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount)

  const typeColor = group.type === 'interior' 
    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    : group.type === 'exterior'
    ? 'bg-green-500/20 text-green-400 border-green-500/40'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/40'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[#e7e7e7]">{group.parentLocationName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColor}`}>
              {group.type}
            </span>
            {group.totalEpisodes > 1 && (
              <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-medium border border-[#10B981]/40">
                Reused {group.totalEpisodes}x
              </span>
            )}
            {group.storyBibleReference && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/40">
                Story Bible
              </span>
            )}
            {typeof group.confidence === 'number' && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/40">
                Match {Math.round(group.confidence * 100)}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
            {/* Only show scenes/episodes if we have that data */}
            {group.totalScenes > 0 && (
              <>
            <span>{group.totalScenes} scene{group.totalScenes !== 1 ? 's' : ''}</span>
            <span>•</span>
              </>
            )}
            {group.totalEpisodes > 0 && (
              <>
            <span>{group.totalEpisodes} episode{group.totalEpisodes !== 1 ? 's' : ''}</span>
              </>
            )}
            {/* If Story Bible location with no scene data, show that */}
            {group.totalScenes === 0 && group.totalEpisodes === 0 && group.storyBibleReference && (
              <span className="text-blue-400">From Story Bible</span>
            )}
            {group.subLocations.length > 0 && (
              <>
                <span>•</span>
                <span>{group.subLocations.length} sub-location{group.subLocations.length !== 1 ? 's' : ''}</span>
              </>
            )}
            {group.timeOfDay && group.timeOfDay.length > 0 && (
              <>
                <span>•</span>
                <span>{group.timeOfDay.join(', ')}</span>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-[#e7e7e7]/70">
            <span className="text-[#e7e7e7]/50">Status:</span>
            <select
              value={group.status || 'scouted'}
              onChange={(e) => onUpdateStatus(group.id, e.target.value as LocationStatus)}
              className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-xs"
            >
              <option value="scouted">Scouted</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="booked">Booked</option>
              <option value="confirmed">Confirmed</option>
            </select>
            {(group.aiProvider || group.aiModel) && (
              <span className="ml-2 px-2 py-0.5 bg-[#111827] border border-[#36393f] rounded text-[10px] text-[#e7e7e7]/70">
                AI: {group.aiProvider || 'unknown'} {group.aiModel ? `(${group.aiModel})` : ''}
              </span>
            )}
            {group.generationError && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/10 border border-red-500/40 rounded text-[10px] text-red-300">
                Error: {group.generationError}
              </span>
            )}
        </div>
        </div>
        {selectedSuggestion && (
          <div className="text-right text-sm text-[#e7e7e7]/70">
            <div className="text-xs text-[#e7e7e7]/50">Selected:</div>
            <div className="font-semibold text-[#e7e7e7]">{selectedSuggestion.venueName}</div>
            <div className="text-xs text-[#e7e7e7]/50 capitalize">{selectedSuggestion.sourcing}</div>
            <div className="font-bold text-[#10B981]">${Math.round(totalCost)} est.</div>
            <div className="text-xs text-[#e7e7e7]/50">
              Day ${Math.round(dayRate)} | Permit ${Math.round(permitCost)} | Deposit ${Math.round(depositAmount)}
              {insuranceRequired ? ' | Insurance' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Shooting Location Suggestions */}
      {group.shootingLocationSuggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#36393f]">
          <button
            onClick={() => setExpandedSuggestions(!expandedSuggestions)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-bold text-[#e7e7e7]">
              Real-World Shooting Suggestions ({group.shootingLocationSuggestions.length})
            </h4>
            <div className="flex items-center gap-3 text-xs text-[#e7e7e7]/60">
              <button
                className="px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded hover:border-[#10B981]/60 hover:text-[#10B981]"
                onClick={() => {
                  if (group.shootingLocationSuggestions.length === 0) return
                  const cheapest = suggestionList
                    .map(s => ({ s, cost: computeSuggestionCost(s, group) }))
                    .sort((a, b) => a.cost - b.cost)[0]?.s
                  if (cheapest) onSelectSuggestion(group.id, cheapest.id)
                }}
              >
                Auto-select cheapest
              </button>
            <span className="text-[#e7e7e7]/50">{expandedSuggestions ? '▼' : '▶'}</span>
            </div>
          </button>
          {expandedSuggestions && (
            <div className="space-y-3">
              {(group.shootingLocationSuggestions as ExtendedSuggestion[]).map((suggestion) => (
                <ShootingSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isSelected={group.selectedSuggestionId === suggestion.id}
                  onSelect={() => onSelectSuggestion(group.id, suggestion.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Locations */}
      {group.subLocations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#36393f]">
          <button
            onClick={() => setExpandedSubLocations(!expandedSubLocations)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-bold text-[#e7e7e7]">
              Sub-Locations ({group.subLocations.length})
            </h4>
            <span className="text-[#e7e7e7]/50">{expandedSubLocations ? '▼' : '▶'}</span>
          </button>
          {expandedSubLocations && (
            <div className="space-y-2">
              {group.subLocations.map((subLoc) => (
                <div
                  key={subLoc.id}
                  className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[#e7e7e7]">{subLoc.name}</span>
                    <span className="text-xs text-[#e7e7e7]/50">
                      {subLoc.totalScenes} scene{subLoc.totalScenes !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-[#e7e7e7]/70">
                    Episodes: {Array.from(new Set(subLoc.sceneReferences.map(r => r.episodeNumber))).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Episode Usage Matrix */}
      <div className="mt-4 pt-4 border-t border-[#36393f]">
        <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Used In:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {group.episodeUsage.map((usage, idx) => (
            <div
              key={idx}
              className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-bold">
                  Episode {usage.episodeNumber}
                </span>
              </div>
              <div className="text-xs text-[#e7e7e7]/70 mb-1">
                {usage.episodeTitle || `Episode ${usage.episodeNumber}`}
              </div>
              <div className="text-xs text-[#e7e7e7]/70">
                Scenes: {usage.sceneNumbers.join(', ')} ({usage.sceneCount} total)
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Shooting Suggestion Card Component
function ShootingSuggestionCard({ suggestion, isSelected, onSelect }: { suggestion: ExtendedSuggestion; isSelected: boolean; onSelect: () => void }) {
  // Use costBreakdown.dayRate first, then estimatedCost, then 0
  const dayRate = suggestion.costBreakdown?.dayRate ?? suggestion.estimatedCost ?? 0
  const permitCost = suggestion.costBreakdown?.permitCost ?? suggestion.permitCost ?? suggestion.logistics?.permitCost ?? 0
  const depositAmount = suggestion.costBreakdown?.depositAmount ?? suggestion.depositAmount ?? 0
  const insuranceRequired = suggestion.costBreakdown?.insuranceRequired ?? suggestion.insuranceRequired ?? false
  const totalCost = dayRate + permitCost + depositAmount

  const costColor = dayRate === 0 
    ? 'text-green-400'
    : dayRate <= 150
    ? 'text-yellow-400'
    : 'text-orange-400'

  return (
    <div className={`bg-[#1a1a1a] rounded-lg p-4 border ${isSelected ? 'border-[#10B981] ring-1 ring-[#10B981]/50' : 'border-[#36393f]'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-bold text-[#e7e7e7]">{suggestion.venueName}</h5>
            {isSelected && (
              <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-bold border border-[#10B981]/40">
                ✓ Selected
              </span>
            )}
            <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#e7e7e7]/70 rounded text-xs border border-[#36393f] capitalize">
              {suggestion.sourcing}
            </span>
          </div>
          <p className="text-sm text-[#e7e7e7]/70 mt-1">{suggestion.venueType}</p>
          {suggestion.address && (
            <p className="text-xs text-[#e7e7e7]/50 mt-1">📍 {suggestion.address}</p>
          )}
        </div>
        <div className="text-right min-w-[120px]">
          <div className={`text-xl font-bold ${costColor}`}>
            ${Math.round(dayRate)}<span className="text-sm font-normal">/day</span>
            {suggestion.isEstimated && (
              <span className="ml-2 text-xs text-yellow-400/70 font-normal">(Estimated)</span>
            )}
          </div>
          {(permitCost > 0 || depositAmount > 0) && (
            <div className="text-xs text-[#e7e7e7]/50 mt-1">
              {permitCost > 0 && <span>Permit: ${Math.round(permitCost)}</span>}
              {permitCost > 0 && depositAmount > 0 && <span> • </span>}
              {depositAmount > 0 && <span>Deposit: ${Math.round(depositAmount)}</span>}
            </div>
          )}
          {insuranceRequired && (
            <div className="text-xs text-yellow-400/70 mt-0.5">⚠️ Insurance required</div>
          )}
          <div className="text-xs text-[#e7e7e7]/40 mt-1">
            Total: <span className="font-semibold text-[#e7e7e7]/70">${Math.round(totalCost)}</span>
          </div>
          <button
            className={`mt-2 px-4 py-1.5 text-xs font-medium rounded border transition-all ${
              isSelected
                ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/60 cursor-default'
                : 'bg-[#252628] text-[#e7e7e7] border-[#36393f] hover:border-[#10B981]/60 hover:text-[#10B981] hover:bg-[#10B981]/10'
            }`}
            onClick={onSelect}
            disabled={isSelected}
          >
            {isSelected ? '✓ Selected' : 'Select This'}
          </button>
        </div>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#36393f]">
      {/* Pros */}
      {suggestion.pros.length > 0 && (
          <div>
            <div className="text-xs text-green-400 font-semibold mb-2">✓ Pros</div>
            <ul className="text-xs text-[#e7e7e7]/80 space-y-1">
              {suggestion.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {suggestion.cons.length > 0 && (
          <div>
            <div className="text-xs text-orange-400 font-semibold mb-2">✗ Cons</div>
            <ul className="text-xs text-[#e7e7e7]/80 space-y-1">
              {suggestion.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
            ))}
          </ul>
        </div>
      )}
      </div>

      {/* Logistics */}
      <div className="mt-3 pt-3 border-t border-[#36393f]">
        <div className="text-xs text-[#e7e7e7]/50 font-semibold mb-2">Logistics</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-2 py-1 rounded border ${suggestion.logistics.parking ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
            {suggestion.logistics.parking ? '✓' : '✗'} Parking
          </span>
          <span className={`px-2 py-1 rounded border ${suggestion.logistics.power ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
            {suggestion.logistics.power ? '✓' : '✗'} Power
          </span>
          <span className={`px-2 py-1 rounded border ${suggestion.logistics.restrooms ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
            {suggestion.logistics.restrooms ? '✓' : '✗'} Restrooms
          </span>
          <span className={`px-2 py-1 rounded border ${suggestion.logistics.permitRequired ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
            {suggestion.logistics.permitRequired ? `⚠️ Permit Required ($${suggestion.logistics.permitCost || 0})` : '✓ No Permit'}
          </span>
        </div>
        {suggestion.logistics.notes && (
          <p className="mt-2 text-xs text-[#e7e7e7]/60 italic">📝 {suggestion.logistics.notes}</p>
        )}
      </div>

      {/* Search Guidance & Venue Link */}
      {(suggestion.searchGuidance || suggestion.specificVenueUrl) && (
        <div className="mt-3 pt-3 border-t border-[#36393f] flex flex-wrap items-center gap-3 text-xs">
      {suggestion.searchGuidance && (
            <span className="text-[#e7e7e7]/60">
              🔍 {suggestion.searchGuidance}
            </span>
      )}
      {suggestion.specificVenueUrl && (
        <a
          href={suggestion.specificVenueUrl}
          target="_blank"
          rel="noopener noreferrer"
              className="px-3 py-2 bg-[#10B981] text-[#0b1c14] font-semibold rounded-md border border-[#0ea56a] shadow-md shadow-[#10B981]/30 hover:bg-[#0ea56a] hover:text-black transition-colors"
        >
              🔗 Open Venue
        </a>
          )}
        </div>
      )}
    </div>
  )
}
