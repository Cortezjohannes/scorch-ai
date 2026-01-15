'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, Location, LocationOptionsData, LocationOption, LocationsData } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { LocationGenerationProgressOverlay } from '../shared/LocationGenerationProgressOverlay'
import { getStoryBible } from '@/services/story-bible-service'
import { generateGoogleMapsUrl } from '@/services/location-url-resolver'

interface LocationsTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function LocationsTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: LocationsTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [locationOptions, setLocationOptions] = useState<LocationOptionsData | null>(null)
  const [generationProgress, setGenerationProgress] = useState<{
    currentScene: number
    totalScenes: number
    currentSceneTitle: string
    completedScenes: number
  } | null>(null)
  const [locationPreference, setLocationPreference] = useState<'story-based' | 'user-based'>('story-based')
  
  // Detect context
  const isArcContext = preProductionData.type === 'arc'
  const isEpisodeContext = preProductionData.type === 'episode'
  
  // Normalize locations data - handle both old and new structure (episode only)
  const episodeLocations = isEpisodeContext ? preProductionData.locations : undefined
  const locationsData = (episodeLocations || {}) as Partial<LocationsData> & { selectedLocations?: Location[], pendingOptions?: any }
  const locations: Location[] = (() => {
    if (!isEpisodeContext) return []
    if (Array.isArray(locationsData.locations)) return locationsData.locations
    if (Array.isArray(locationsData.selectedLocations)) return locationsData.selectedLocations
    return []
  })()
  
  // Create normalized locations data object
  const normalizedLocationsData: Partial<LocationsData> & { selectedLocations?: Location[], pendingOptions?: any } = {
    locations,
    pendingOptions: locationsData.pendingOptions,
    selectedLocations: locationsData.selectedLocations || locations,
    lastUpdated: locationsData.lastUpdated || Date.now(),
    episodeNumber: isEpisodeContext ? locationsData.episodeNumber : undefined,
    episodeTitle: isEpisodeContext ? locationsData.episodeTitle : undefined,
    totalLocations: locations.length,
    updatedBy: locationsData.updatedBy || currentUserId
  }

  const breakdownData = isEpisodeContext ? preProductionData.scriptBreakdown : undefined
  const scriptsData = (preProductionData as any).scripts

  // Rehydrate pending options from Firestore (if present)
  useEffect(() => {
    if (!isEpisodeContext) return
    const pending = (preProductionData.locations as any)?.pendingOptions
    if (pending && !locationOptions) {
      setLocationOptions(pending as LocationOptionsData)
      // Restore location preference if saved
      if (pending.locationPreference) {
        setLocationPreference(pending.locationPreference)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEpisodeContext, isEpisodeContext ? preProductionData.locations : undefined])

  const handleLocationUpdate = async (locationId: string, updates: Partial<Location>) => {
    const updatedLocations = locations.map(loc =>
      loc.id === locationId ? { ...loc, ...updates } : loc
    )
    
    await onUpdate('locations', {
      ...normalizedLocationsData,
      locations: updatedLocations,
      lastUpdated: Date.now()
    })
  }

  const handleAddLocation = async () => {
    const newLocation: Location = {
      id: `loc_${Date.now()}`,
      name: 'New Location',
      address: '',
      type: 'interior',
      scenes: [],
      requirements: [],
      contact: '',
      phone: '',
      notes: '',
      status: 'scouted',
      secured: false,
      cost: 0,
      availability: [],
      imageUrls: [],
      comments: []
    }
    
    await onUpdate('locations', {
      ...normalizedLocationsData,
      locations: [...locations, newLocation],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (locationId: string, content: string) => {
    const location = locations.find(l => l.id === locationId)
    if (!location) return Promise.resolve()

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedLocations = locations.map(loc =>
      loc.id === locationId
        ? { ...loc, comments: [...(loc.comments || []), newComment] }
        : loc
    )

    await onUpdate('locations', {
      ...normalizedLocationsData,
      locations: updatedLocations,
      lastUpdated: Date.now()
    })
  }

  // Generate location options
  const handleGenerateLocations = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('📍 Generating location options...')

      // 1. Check prerequisites
      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')

      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script data found')

      // 2. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 2b. Fetch casting data (optional but recommended for location proximity)
      const castingData = preProductionData.casting
      if (castingData?.cast) {
        const confirmedCast = castingData.cast.filter((c: any) => c.status === 'confirmed')
        const castWithLocation = confirmedCast.filter((c: any) => c.city || c.state || c.country)
        console.log('✅ Casting data found:', confirmedCast.length, 'confirmed actors')
        if (castWithLocation.length > 0) {
          console.log('  Cast with location data:', castWithLocation.length)
          console.log('  Will use cast locations for proximity-based recommendations')
        } else {
          console.log('  ⚠️ No cast location data - locations will be based on story setting only')
        }
      } else {
        console.log('⚠️ No casting data - locations will be based on story setting only')
      }

      // 2c. Fetch previous episodes' locations for reuse
      if (!isEpisodeContext) {
        setGenerationError('Location generation is only available for episode pre-production')
        setIsGenerating(false)
        return
      }
      
      const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
      const previousEpisodeLocations: Location[] = []
      const currentEpisodeNumber = preProductionData.episodeNumber
      
      if (currentEpisodeNumber > 1) {
        console.log(`📚 Fetching previous episodes (1-${currentEpisodeNumber - 1}) for location reuse...`)
        for (let epNum = 1; epNum < currentEpisodeNumber; epNum++) {
          try {
            const previousEpPreProd = await getEpisodePreProduction(
              currentUserId,
              preProductionData.storyBibleId,
              epNum
            )
            
            if (previousEpPreProd?.locations?.locations) {
              const epLocations = previousEpPreProd.locations.locations
              if (Array.isArray(epLocations) && epLocations.length > 0) {
                previousEpisodeLocations.push(...epLocations)
                console.log(`  ✅ Episode ${epNum}: Found ${epLocations.length} locations`)
              }
            }
          } catch (error) {
            console.warn(`  ⚠️ Could not fetch Episode ${epNum}:`, error)
            // Continue with other episodes
          }
        }
        
        if (previousEpisodeLocations.length > 0) {
          console.log(`✅ Found ${previousEpisodeLocations.length} previous location(s) for potential reuse`)
        } else {
          console.log('⚠️ No previous episodes with locations found')
        }
      } else {
        console.log('ℹ️  First episode - no previous locations to check')
      }

      // 2d. Extract story bible locations
      const storyBibleLocations = storyBible?.worldBuilding?.locations || []
      if (storyBibleLocations.length > 0) {
        console.log(`📖 Found ${storyBibleLocations.length} story bible location(s) for reference`)
      }

      // 3. Extract scene requirements
      const sceneRequirements = breakdownData.scenes || []
      const totalScenes = sceneRequirements.length

      if (totalScenes === 0) {
        throw new Error('No scenes found in script breakdown')
      }

      // Initialize progress
      setGenerationProgress({
        currentScene: 1,
        totalScenes,
        currentSceneTitle: sceneRequirements[0]?.sceneTitle || `Scene ${sceneRequirements[0]?.sceneNumber || 1}`,
        completedScenes: 0
      })

      // 4. Generate locations for each scene sequentially
      const allSceneRequirements = []
      let cancelled = false

      for (let i = 0; i < sceneRequirements.length; i++) {
        if (cancelled) break

        const scene = sceneRequirements[i]
        
        // Update progress
        setGenerationProgress({
          currentScene: i + 1,
          totalScenes,
          currentSceneTitle: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
          completedScenes: i
        })

        console.log(`\n🎬 Generating locations for Scene ${scene.sceneNumber}: ${scene.sceneTitle}`)

        // Generate locations for this scene
        const response = await fetch('/api/generate/locations/scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneRequirement: {
              sceneNumber: scene.sceneNumber,
              sceneTitle: scene.sceneTitle,
              locationType: scene.location?.toUpperCase().includes('INT') ? 'INT' : 'EXT',
              timeOfDay: scene.timeOfDay || 'DAY',
              sceneDescription: scene.sceneTitle || `Scene ${scene.sceneNumber}`,
              characterCount: scene.characters?.length || 0,
              specialRequirements: scene.specialRequirements || []
            },
            scriptData: scriptsData.fullScript,
            storyBibleData: storyBible,
            castingData: castingData || undefined,
            episodeNumber: isEpisodeContext ? preProductionData.episodeNumber : undefined,
            episodeTitle: isEpisodeContext ? (scriptsData.fullScript.title || `Episode ${preProductionData.episodeNumber}`) : undefined,
            locationPreference: locationPreference,
            previousEpisodeLocations: previousEpisodeLocations,
            storyBibleLocations: storyBibleLocations
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Failed to generate locations for Scene ${scene.sceneNumber}: ${errorData.details || errorData.error || 'Unknown error'}`)
        }

        const result = await response.json()
        
        allSceneRequirements.push({
          sceneNumber: scene.sceneNumber,
          sceneTitle: scene.sceneTitle,
          locationType: (scene.location?.toUpperCase().includes('INT') ? 'INT' : 'EXT') as 'INT' | 'EXT',
          timeOfDay: scene.timeOfDay || 'DAY',
          options: result.locationOptions || []
        })

        console.log(`✅ Scene ${scene.sceneNumber} completed: ${result.locationOptions?.length || 0} options generated`)
      }

      // Combine all scene requirements
      const locationOptionsData: LocationOptionsData = {
        episodeNumber: preProductionData.episodeNumber,
        episodeTitle: scriptsData.fullScript.title || `Episode ${preProductionData.episodeNumber}`,
        sceneRequirements: allSceneRequirements,
        lastUpdated: Date.now(),
        generated: true,
        locationPreference: locationPreference
      }

      console.log('✅ All scenes completed!')
      console.log('  Total scene requirements:', allSceneRequirements.length)
      console.log('  Total options:', allSceneRequirements.reduce((sum: number, req: any) => sum + (req.options?.length || 0), 0))

      // 5. Store options (user selects which to keep)
      setLocationOptions(locationOptionsData)
      setGenerationProgress(null)
      
      // Persist pending options so they survive tab switches
      await onUpdate('locations', {
        ...normalizedLocationsData,
        pendingOptions: locationOptionsData,
        lastUpdated: Date.now()
      })

    } catch (error: any) {
      console.error('❌ Error generating location options:', error)
      setGenerationError(error.message || 'Failed to generate location options. Please try again.')
      setGenerationProgress(null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle cancel generation
  const handleCancelGeneration = () => {
    setIsGenerating(false)
    setGenerationProgress(null)
    setGenerationError('Generation cancelled by user')
  }

  // Save selected locations
  const handleSaveSelectedLocations = async () => {
    if (!locationOptions) return

    // Import services
    const { normalizeLocationName } = await import('@/services/location-matcher')
    const { resolveLocationUrlSync } = await import('@/services/location-url-resolver')

    // Convert selected LocationOptions to Location[] format with resolved URLs
    const selectedLocations: Location[] = await Promise.all(
      (locationOptions?.sceneRequirements || [])
        .flatMap((req: any) => 
          (req.options || [])
            .filter((opt: LocationOption) => opt.selected)
            .map(async (opt: LocationOption) => {
              const recurringKey = normalizeLocationName(req.sceneTitle)
              const isReuse = opt.isReuse || false
              
              // Resolve URL using the location URL resolver
              // First check if there's a specificVenueUrl in scoutingReport or other fields
              const locationForResolver = {
                ...opt,
                venueName: opt.name,
                specificVenueUrl: (opt as any).specificVenueUrl || (opt.scoutingReport as any)?.specificVenueUrl
              }
              
              const resolvedUrl = resolveLocationUrlSync(locationForResolver)
              
              return {
                id: opt.id,
                name: opt.name,
                address: opt.address || '',
                type: opt.type || 'interior',
                scenes: Array.isArray(req.sceneNumber) ? req.sceneNumber : [req.sceneNumber],
                requirements: [],
                contact: '',
                phone: '',
                email: '',
                sourcing: resolvedUrl?.platform || opt.sourcing || 'other',
                sourcingUrl: resolvedUrl?.primaryUrl || (opt as any).specificVenueUrl || undefined,
                listingId: (opt as any).listingId,
                permitCost: opt.logistics.permitCost,
                insuranceRequired: false,
                status: 'scouted' as const,
                secured: false,
                cost: opt.estimatedCost || 0,
                scoutingReport: opt.scoutingReport,
                availability: [],
                imageUrls: [],
                notes: '',
                comments: [],
                // Location reuse tracking
                recurringLocationKey: recurringKey,
                originalEpisode: isReuse ? undefined : (isEpisodeContext ? preProductionData.episodeNumber : undefined), // Only set if not a reuse
                reusedFromLocationId: isReuse ? opt.reusedFromLocationId : undefined,
                // Legacy fields for backward compatibility
                contactPerson: '',
                contactPhone: '',
                contactEmail: '',
                permitInfo: {
                  required: opt.logistics.permitRequired,
                  cost: opt.logistics.permitCost || 0,
                  status: opt.logistics.permitRequired ? 'pending' : 'not-needed',
                  notes: opt.logistics.notes,
                  expirationDate: undefined
                },
                availableDays: [],
                powerAccess: opt.logistics.powerAccess,
                parkingAvailable: opt.logistics.parkingAvailable,
                restroomAccess: opt.logistics.restroomAccess
              }
            })
        )
    )

    if (selectedLocations.length === 0) {
      setGenerationError('Please select at least one location option to save')
      return
    }

    await onUpdate('locations', {
      ...normalizedLocationsData,
      locations: [...locations, ...selectedLocations],
      pendingOptions: null,
      lastUpdated: Date.now()
    })

    // Clear options after saving
    setLocationOptions(null)
  }

  // Toggle location option selection
  const handleToggleOption = (reqIndex: number, optIndex: number) => {
    if (!locationOptions) return

    const updated = { 
      ...locationOptions,
      sceneRequirements: (locationOptions?.sceneRequirements || []).map((req: any, idx: number) => 
        idx === reqIndex
          ? {
              ...req,
              options: (req.options || []).map((opt: any, optIdx: number) =>
                optIdx === optIndex
                  ? { ...opt, selected: !opt.selected }
                  : opt
              )
            }
          : req
      )
    }

    setLocationOptions(updated)
    // Save pending selection state for persistence
    onUpdate('locations', {
      ...locationsData,
      pendingOptions: updated,
      lastUpdated: Date.now()
    })

    // Auto-save: upsert selected options into finalized locations, remove deselected ones sourced from options
    try {
      const selectedOptionIds = new Set<string>()
      const selectedFromOptions = updated.sceneRequirements.flatMap((req: any) =>
        req.options.filter((o: any) => o.selected).map((o: any) => {
          selectedOptionIds.add(o.id)
          const loc: Location = {
            id: o.id,
            name: o.name,
            address: o.address || '',
            contactPerson: '',
            contactPhone: '',
            contactEmail: '',
            scenes: Array.isArray(req.sceneNumber) ? (req.sceneNumber as any) : [req.sceneNumber],
            permitInfo: {
              required: o.logistics.permitRequired,
              cost: o.logistics.permitCost || 0,
              status: o.logistics.permitRequired ? 'pending' : 'not-needed',
              notes: o.logistics.notes
            } as any,
            availableDays: [],
            availableHours: undefined,
            powerAccess: !!o.logistics.powerAccess,
            parkingAvailable: !!o.logistics.parkingAvailable,
            restroomAccess: !!o.logistics.restroomAccess,
            weatherConsiderations: '',
            backupLocation: undefined,
            photos: [],
            cost: o.estimatedCost || 0,
            status: 'scouted',
            crewNotes: `source:option:${o.id}`,
            comments: []
          }
          return loc
        })
      )

      const existing = locations
      const nonOptionLocations = existing.filter(l => !(l.crewNotes || '').startsWith('source:option:'))
      const existingOptionLocations = existing.filter(l => (l.crewNotes || '').startsWith('source:option:'))

      const filteredExistingOption = existingOptionLocations.filter(l => {
        const src = (l.crewNotes || '').replace('source:option:', '')
        return selectedOptionIds.has(src)
      })

      const merged = [...nonOptionLocations, ...filteredExistingOption]

      // Upsert new selected ones (avoid duplicates by id)
      const byId = new Map<string, Location>()
      for (const l of merged) byId.set(l.id, l)
      for (const l of selectedFromOptions) byId.set(l.id, l)

      const finalLocations = Array.from(byId.values())

      onUpdate('locations', {
        ...locationsData,
        locations: finalLocations,
        pendingOptions: updated,
        lastUpdated: Date.now()
      })
    } catch {}
  }

  // Stats - locations array is already defined at top
  const totalLocations = locations?.length || 0
  const securedCount = (locations || []).filter((l: Location) => (l as any).secured).length
  const totalCost = (locations || []).reduce((sum: number, l: Location) => sum + ((l as any).cost || 0), 0)

  const handleCancelSelection = async () => {
    setLocationOptions(null)
      await onUpdate('locations', {
        ...normalizedLocationsData,
        pendingOptions: null,
        lastUpdated: Date.now()
      })
  }

  return (
    <div className="space-y-6">
      {/* Progress Overlay */}
      <LocationGenerationProgressOverlay
        isVisible={generationProgress !== null}
        currentScene={generationProgress?.currentScene || 1}
        totalScenes={generationProgress?.totalScenes || 1}
        currentSceneTitle={generationProgress?.currentSceneTitle || ''}
        completedScenes={generationProgress?.completedScenes || 0}
        onCancel={handleCancelGeneration}
      />

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Locations</div>
          <div className="text-2xl font-bold text-[#10B981]">{totalLocations}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Secured</div>
          <div className="text-2xl font-bold text-green-400">{securedCount}/{totalLocations}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">${totalCost.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Avg per Location</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">
            ${totalLocations > 0 ? Math.round(totalCost / totalLocations).toLocaleString() : 0}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Location Preference Toggle */}
        {breakdownData && scriptsData?.fullScript && (
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-[#e7e7e7] mb-2 block">
                  Location Source
                </label>
                <p className="text-xs text-[#e7e7e7]/60 mb-3">
                  Choose whether to generate locations based on story setting or your/cast location
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLocationPreference('story-based')}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      locationPreference === 'story-based'
                        ? 'bg-[#10B981] text-black shadow-lg'
                        : 'bg-[#2a2a2a] text-[#e7e7e7]/70 hover:bg-[#36393f]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    📍 Story Setting
                    <span className="block text-xs mt-1 opacity-80">
                      {locationPreference === 'story-based' && '(Default - matches story location)'}
                    </span>
                  </button>
                  <button
                    onClick={() => setLocationPreference('user-based')}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      locationPreference === 'user-based'
                        ? 'bg-[#10B981] text-black shadow-lg'
                        : 'bg-[#2a2a2a] text-[#e7e7e7]/70 hover:bg-[#36393f]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    👤 User/Cast Location
                    <span className="block text-xs mt-1 opacity-80">
                      {locationPreference === 'user-based' && '(Practical - uses your/cast location)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-[#10B981] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-[#10B981] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
              }`}
            >
              List View
            </button>
          </div>

          <div className="flex items-center gap-3">
            {breakdownData && scriptsData?.fullScript && (
              <button
                onClick={handleGenerateLocations}
                disabled={isGenerating}
                className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-lg hover:bg-[#10B981]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🔄 Generating...' : locationOptions ? '🔄 Regenerate Options' : '✨ Generate Location Options'}
              </button>
            )}
            <button
              onClick={handleAddLocation}
              className="px-4 py-2 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors"
            >
              + Add Location
            </button>
          </div>
        </div>
      </div>

      {/* Location Options Selection UI */}
      {locationOptions && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#e7e7e7]">Select Location Options</h2>
              <p className="text-sm text-[#e7e7e7]/70 mt-1">
                Review and select your preferred location options. You can select one or multiple options per scene.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancelSelection}
                className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSelectedLocations}
                className="px-4 py-2 bg-[#10B981] text-black rounded-lg hover:bg-[#059669] transition-colors text-sm font-medium"
              >
                Save Selected ({locationOptions?.sceneRequirements?.reduce((sum: number, req: any) => sum + (req.options?.filter((o: any) => o.selected).length || 0), 0) || 0})
              </button>
            </div>
          </div>

          {generationError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {generationError}
            </div>
          )}

          {locationOptions?.sceneRequirements?.map((req: any, reqIndex: number) => (
            <div key={req.sceneNumber} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#e7e7e7]">
                  Scene {req.sceneNumber}: {req.sceneTitle}
                </h3>
                <p className="text-sm text-[#e7e7e7]/70">
                  {req.locationType} • {req.timeOfDay}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(req.options || []).map((opt: any, optIndex: number) => (
                  <LocationOptionCard
                    key={opt.id}
                    option={opt}
                    isSelected={opt.selected}
                    onToggle={() => handleToggleOption(reqIndex, optIndex)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State / Generation UI */}
      {!locationOptions && (!locations || locations.length === 0) ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Locations Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Generate location options based on your script breakdown, or add locations manually
          </p>

          {/* Check prerequisites */}
          {!breakdownData || !scriptsData?.fullScript ? (
            <div className="space-y-4">
              <p className="text-[#e7e7e7]/70 mb-2">
                Generate location options requires a script and script breakdown.
              </p>
              <p className="text-[#e7e7e7]/50 text-sm mb-6">
                Please generate a script first, then create a script breakdown, then come back here.
              </p>
              <button
                disabled
                className="px-6 py-3 bg-[#36393f] text-[#e7e7e7]/50 font-medium rounded-lg cursor-not-allowed"
              >
                Generate Script & Breakdown First
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleGenerateLocations}
                disabled={isGenerating}
                className="px-6 py-3 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🔄 Generating Options...' : '✨ Generate Location Options'}
              </button>
              <span className="text-[#e7e7e7]/50">or</span>
              <button
                onClick={handleAddLocation}
                className="px-6 py-3 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg border border-[#36393f] font-medium hover:bg-[#36393f] transition-colors"
              >
                + Add Location Manually
              </button>
            </div>
          )}

          {generationError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {generationError}
            </div>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onUpdate={(updates) => handleLocationUpdate(location.id, updates)}
                  onAddComment={(content) => handleAddComment(location.id, content)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  isSelected={selectedLocation === location.id}
                  onSelect={() => setSelectedLocation(location.id === selectedLocation ? null : location.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {locations.map((location) => (
                <LocationListItem
                  key={location.id}
                  location={location}
                  onUpdate={(updates) => handleLocationUpdate(location.id, updates)}
                  onAddComment={(content) => handleAddComment(location.id, content)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// Sourcing Section Component
function SourcingSection({ location }: { location: Location }) {
  if (!location.sourcing && !location.sourcingUrl && !location.address) return null

  // Generate Google Maps URL if we have an address
  const getGoogleMapsUrl = () => {
    if (!location.address) return null
    return generateGoogleMapsUrl(location.address, location.name)
  }

  const googleMapsUrl = getGoogleMapsUrl()
  const platformName = location.sourcing 
    ? location.sourcing
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace('Google Maps', 'Google Maps')
        .replace('Booking Com', 'Booking.com')
    : 'Location'

  const getPlatformIcon = () => {
    switch (location.sourcing) {
      case 'google-maps':
        return '🗺️'
      case 'airbnb':
        return '🏠'
      case 'agoda':
        return '🏨'
      case 'booking-com':
        return '📅'
      case 'expedia':
        return '✈️'
      case 'venue-website':
        return '🌐'
      default:
        return '📍'
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#36393f]">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        {location.sourcing && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#e7e7e7]/50">Source:</span>
            <span className="text-xs font-medium text-[#e7e7e7] flex items-center gap-1">
              {getPlatformIcon()} {platformName}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Maps link - always show if address available */}
          {googleMapsUrl && (
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#4285F4] hover:text-[#1a73e8] transition-colors flex items-center gap-1 font-medium"
            >
              🗺️ View on Maps →
            </a>
          )}
          
          {/* Primary sourcing URL (booking platform, venue, etc.) */}
          {location.sourcingUrl && location.sourcing !== 'google-maps' && (
            <a 
              href={location.sourcingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-[#10B981] hover:text-[#059669] transition-colors flex items-center gap-1 font-medium"
            >
              {getPlatformIcon()} View on {platformName} →
            </a>
          )}
        </div>
      </div>
      
      {location.listingId && (
        <div className="flex items-center gap-2 text-xs text-[#e7e7e7]/50">
          <span>Listing ID:</span>
          <code className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[#e7e7e7]/70 font-mono">
            {location.listingId}
          </code>
        </div>
      )}
    </div>
  )
}

// Scouting Report Card Component
function ScoutingReportCard({ location }: { location: Location }) {
  const [expanded, setExpanded] = React.useState(false)
  const report = location.scoutingReport

  if (!report) return null

  return (
    <div className="mt-3 pt-3 border-t border-[#36393f]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-[#e7e7e7] hover:text-[#10B981] transition-colors"
      >
        <span>Full Scouting Report</span>
        <span className="text-xs">{expanded ? '▼' : '▶'}</span>
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-4 text-sm">
          {/* Technical Section */}
          {report.technical && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#e7e7e7] mb-2">Technical Specifications</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#e7e7e7]/50">Power Access:</span>
                  <span className="ml-2 text-[#e7e7e7]">{report.technical.powerAccess ? 'Yes' : 'No'}</span>
                </div>
                {report.technical.powerOutlets > 0 && (
                  <div>
                    <span className="text-[#e7e7e7]/50">Outlets:</span>
                    <span className="ml-2 text-[#e7e7e7]">{report.technical.powerOutlets}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#e7e7e7]/50">Lighting:</span>
                  <span className="ml-2 text-[#e7e7e7] capitalize">{report.technical.lighting}</span>
                </div>
                <div>
                  <span className="text-[#e7e7e7]/50">Acoustics:</span>
                  <span className="ml-2 text-[#e7e7e7] capitalize">{report.technical.acoustics}</span>
                </div>
                {report.technical.noiseIssues && report.technical.noiseIssues.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-[#e7e7e7]/50">Noise Issues:</span>
                    <span className="ml-2 text-[#e7e7e7]">{report.technical.noiseIssues.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Logistics Section */}
          {report.logistics && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#e7e7e7] mb-2">Logistics</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#e7e7e7]/50">Parking:</span>
                  <span className="ml-2 text-[#e7e7e7]">
                    {report.logistics.parkingAvailable ? 
                      `${report.logistics.parkingSpaces || 'Yes'}${report.logistics.parkingCost ? ` ($${report.logistics.parkingCost})` : ''}` : 
                      'No'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-[#e7e7e7]/50">Loading:</span>
                  <span className="ml-2 text-[#e7e7e7] capitalize">{report.logistics.loadingAccess}</span>
                </div>
                <div>
                  <span className="text-[#e7e7e7]/50">Restrooms:</span>
                  <span className="ml-2 text-[#e7e7e7]">
                    {report.logistics.restroomAccess ? 
                      `${report.logistics.restroomCount || 'Yes'}` : 
                      'No'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-[#e7e7e7]/50">Nearby Food:</span>
                  <span className="ml-2 text-[#e7e7e7]">{report.logistics.nearbyFood ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Permits Section */}
          {report.permits && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#e7e7e7] mb-2">Permits & Regulations</h5>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-[#e7e7e7]/50">Permit Required:</span>
                  <span className="ml-2 text-[#e7e7e7]">{report.permits.permitRequired ? 'Yes' : 'No'}</span>
                </div>
                {report.permits.permitRequired && (
                  <>
                    {report.permits.permitType && (
                      <div>
                        <span className="text-[#e7e7e7]/50">Type:</span>
                        <span className="ml-2 text-[#e7e7e7]">{report.permits.permitType}</span>
                      </div>
                    )}
                    {report.permits.permitCost !== undefined && (
                      <div>
                        <span className="text-[#e7e7e7]/50">Cost:</span>
                        <span className="ml-2 text-[#e7e7e7]">${report.permits.permitCost}</span>
                      </div>
                    )}
                    {report.permits.permitProcessingDays && (
                      <div>
                        <span className="text-[#e7e7e7]/50">Processing:</span>
                        <span className="ml-2 text-[#e7e7e7]">{report.permits.permitProcessingDays} days</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Restrictions Section */}
          {report.restrictions && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#e7e7e7] mb-2">Restrictions</h5>
              <ul className="space-y-1 text-xs text-[#e7e7e7]/70 list-disc list-inside">
                {report.restrictions.timeRestrictions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {report.restrictions.equipmentRestrictions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {report.restrictions.otherRestrictions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Scout Notes */}
          {report.scoutNotes && (
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <h5 className="text-xs font-semibold text-[#e7e7e7] mb-2">Scout Notes</h5>
              <p className="text-xs text-[#e7e7e7]/70">{report.scoutNotes}</p>
              {report.scoutedBy && report.scoutedDate && (
                <p className="text-xs text-[#e7e7e7]/50 mt-2">
                  Scouted by {report.scoutedBy} on {new Date(report.scoutedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Location Card Component (Grid View)
function LocationCard({
  location,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName,
  isSelected,
  onSelect
}: {
  location: Location
  onUpdate: (updates: Partial<Location>) => void
  onAddComment: (content: string) => void
  currentUserId: string
  currentUserName: string
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      layout
      className={`bg-[#2a2a2a] rounded-lg border transition-colors ${
        isSelected ? 'border-[#10B981]' : 'border-[#36393f]'
      }`}
    >
      {/* Image/Icon */}
      <div className="aspect-video bg-[#1a1a1a] rounded-t-lg flex items-center justify-center">
        {location.imageUrls && location.imageUrls.length > 0 ? (
          <img src={location.imageUrls[0]} alt={location.name} className="w-full h-full object-cover rounded-t-lg" />
        ) : (
          <span className="text-6xl">📍</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <EditableField
            value={String(location.name ?? '') as string}
            onSave={(value) => onUpdate({ name: String(value) })}
            className="text-lg font-bold text-[#e7e7e7]"
          />
          <div className="flex items-center gap-2">
            <StatusBadge status={location.status} />
            {location.secured && (
              <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                ✓ Secured
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <EditableField
          value={String(location.address ?? '') as string}
          onSave={(value) => onUpdate({ address: String(value) })}
          placeholder="Add address..."
          className="text-sm text-[#e7e7e7]/70"
        />

        {/* Type & Cost */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-[#e7e7e7]/50">Type:</span>
            <select
              value={location.type}
              onChange={(e) => onUpdate({ type: e.target.value as 'interior' | 'exterior' | 'both' })}
              className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-xs"
            >
              <option value="interior">Interior</option>
              <option value="exterior">Exterior</option>
              <option value="both">Both</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-[#e7e7e7]/50">$</span>
            <EditableField
              value={location.cost?.toString() || '0'}
              onSave={(value) => onUpdate({ cost: typeof value === 'number' ? value : parseFloat(String(value)) || 0 })}
              type="number"
              className="text-[#10B981] font-medium"
            />
          </div>
        </div>

        {/* Scenes */}
        {location.scenes && location.scenes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {location.scenes.map((scene: number | string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70"
              >
                Scene {typeof scene === 'string' ? scene : String(scene)}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={onSelect}
          className="w-full py-2 text-sm text-[#10B981] hover:text-[#059669] transition-colors"
        >
          {isSelected ? '▲ Show Less' : '▼ Show More'}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 border-t border-[#36393f]"
            >
              {/* Sourcing Section */}
              <SourcingSection location={location} />

              {/* Scouting Report */}
              <ScoutingReportCard location={location} />

              {/* Contact */}
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50">Contact</div>
                <EditableField
                  value={String(location.contact ?? '') as string}
                  onSave={(value) => onUpdate({ contact: String(value) })}
                  placeholder="Contact name..."
                  className="text-sm text-[#e7e7e7]"
                />
                <EditableField
                  value={String(location.phone ?? '') as string}
                  onSave={(value) => onUpdate({ phone: String(value) })}
                  placeholder="Phone number..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50">Notes</div>
                <EditableField
                  value={String(location.notes ?? '') as string}
                  onSave={(value) => onUpdate({ notes: String(value) })}
                  placeholder="Add notes..."
                  multiline
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Comments */}
              <CollaborativeNotes
                comments={location.comments || []}
                onAddComment={async (content: string) => await onAddComment(content)}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Location Option Card Component (for selection UI)
function LocationOptionCard({
  option,
  isSelected,
  onToggle
}: {
  option: LocationOption
  isSelected: boolean
  onToggle: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className={`bg-[#1a1a1a] rounded-lg border transition-all cursor-pointer ${
        isSelected ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : 'border-[#36393f] hover:border-[#4a4a4a]'
      }`}
      onClick={onToggle}
    >
      <div className="p-4 space-y-3">
        {/* Header with checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 w-4 h-4 rounded border-[#36393f] bg-[#2a2a2a] text-[#10B981] focus:ring-[#10B981]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#e7e7e7] text-base">{option.name}</h4>
              {option.isReuse && option.reusedFromEpisode && (
                <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] text-xs font-medium rounded border border-[#10B981]/30">
                  ♻️ Reused from Ep {option.reusedFromEpisode}
                </span>
              )}
            </div>
            <p className="text-sm text-[#e7e7e7]/70 mt-1">{option.description}</p>
          </div>
        </div>

        {/* Cost Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${
              option.estimatedCost === 0 ? 'text-green-400' : 
              option.estimatedCost < 150 ? 'text-[#10B981]' : 
              'text-yellow-400'
            }`}>
              ${option.estimatedCost}
            </span>
            <span className="text-xs text-[#e7e7e7]/50">
              {option.estimatedCost === 0 ? 'Free' : 
               option.estimatedCost < 150 ? 'Low-cost' : 
               option.estimatedCost < 300 ? 'Moderate' : 'Higher'}
            </span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            option.sourcing === 'actor-owned' || option.sourcing === 'public-space' ? 'bg-green-500/20 text-green-400' :
            option.sourcing === 'rental' || option.sourcing === 'airbnb' || option.sourcing === 'peerspace' || option.sourcing === 'giggster' ? 'bg-blue-500/20 text-blue-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {option.sourcing}
          </span>
        </div>

        {/* Quick Logistics Summary */}
        <div className="flex items-center gap-4 text-xs text-[#e7e7e7]/60">
          {option.logistics.parkingAvailable && (
            <span className="flex items-center gap-1">
              🅿️ Parking
            </span>
          )}
          {option.logistics.powerAccess && (
            <span className="flex items-center gap-1">
              ⚡ Power
            </span>
          )}
          {option.logistics.restroomAccess && (
            <span className="flex items-center gap-1">
              🚻 Restroom
            </span>
          )}
          {option.logistics.permitRequired && (
            <span className="flex items-center gap-1 text-yellow-400">
              📄 Permit {option.logistics.permitCost ? `($${option.logistics.permitCost})` : ''}
            </span>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className="w-full py-2 text-sm text-[#10B981] hover:text-[#059669] transition-colors"
        >
          {isExpanded ? '▲ Hide Details' : '▼ Show Details'}
        </button>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-3 border-t border-[#36393f]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pros */}
              {option.pros.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-400 mb-1">Pros:</div>
                  <ul className="space-y-1">
                    {option.pros.map((pro, idx) => (
                      <li key={idx} className="text-xs text-[#e7e7e7]/80 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cons */}
              {option.cons.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-400 mb-1">Cons:</div>
                  <ul className="space-y-1">
                    {option.cons.map((con, idx) => (
                      <li key={idx} className="text-xs text-[#e7e7e7]/80 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Notes */}
              {option.logistics.notes && (
                <div className="text-xs text-[#e7e7e7]/60 bg-[#2a2a2a] rounded p-2">
                  <span className="font-medium text-[#e7e7e7]/80">Notes: </span>
                  {option.logistics.notes}
                </div>
              )}

              {/* Address */}
              {option.address && (
                <div className="text-xs text-[#e7e7e7]/60">
                  <span className="font-medium text-[#e7e7e7]/80">Address: </span>
                  {option.address}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Location List Item (List View)
function LocationListItem({
  location,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  location: Location
  onUpdate: (updates: Partial<Location>) => void
  onAddComment: (content: string) => void
  currentUserId: string
  currentUserName: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-[#1a1a1a] rounded flex items-center justify-center text-2xl flex-shrink-0">
          📍
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <EditableField
              value={String(location.name ?? '') as string}
              onSave={(value) => onUpdate({ name: String(value) })}
              className="text-lg font-bold text-[#e7e7e7]"
            />
            <StatusBadge status={location.status} />
            {location.secured && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">✓</span>
            )}
          </div>
          
          <div className="text-sm text-[#e7e7e7]/70">{location.address || 'No address'}</div>
        </div>

        {/* Cost & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#e7e7e7]/50">Cost</div>
            <div className="text-lg font-bold text-[#10B981]">${location.cost?.toLocaleString() || 0}</div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-[#1a1a1a] rounded text-sm text-[#e7e7e7] hover:bg-[#36393f] transition-colors"
          >
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
            className="mt-4 pt-4 border-t border-[#36393f] space-y-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Contact</div>
                <EditableField
                  value={String(location.contact ?? '') as string}
                  onSave={(value) => onUpdate({ contact: String(value) })}
                  placeholder="Contact name..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>
              
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Phone</div>
                <EditableField
                  value={String(location.phone ?? '') as string}
                  onSave={(value) => onUpdate({ phone: String(value) })}
                  placeholder="Phone number..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>
            </div>

            <CollaborativeNotes
              comments={location.comments || []}
              onAddComment={async (content: string) => await onAddComment(content)}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
