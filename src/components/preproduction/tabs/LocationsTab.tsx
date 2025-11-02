'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, Location, LocationOptionsData, LocationOption } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { getStoryBible } from '@/services/story-bible-service'

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
  
  const locationsData = preProductionData.locations || {
    locations: [],
    lastUpdated: Date.now()
  }

  const breakdownData = preProductionData.scriptBreakdown
  const scriptsData = (preProductionData as any).scripts

  // Rehydrate pending options from Firestore (if present)
  useEffect(() => {
    const pending = (preProductionData.locations as any)?.pendingOptions
    if (pending && !locationOptions) {
      setLocationOptions(pending as LocationOptionsData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preProductionData.locations])

  const handleLocationUpdate = async (locationId: string, updates: Partial<Location>) => {
    const updatedLocations = locationsData.locations.map(loc =>
      loc.id === locationId ? { ...loc, ...updates } : loc
    )
    
    await onUpdate('locations', {
      ...locationsData,
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
      status: 'scouting',
      secured: false,
      cost: 0,
      availability: [],
      imageUrls: [],
      comments: []
    }
    
    await onUpdate('locations', {
      ...locationsData,
      locations: [...locationsData.locations, newLocation],
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (locationId: string, content: string) => {
    const location = locationsData.locations.find(l => l.id === locationId)
    if (!location) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedLocations = locationsData.locations.map(loc =>
      loc.id === locationId
        ? { ...loc, comments: [...(loc.comments || []), newComment] }
        : loc
    )

    await onUpdate('locations', {
      ...locationsData,
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

      // 3. Call API
      console.log('🤖 Calling location generation API...')
      const response = await fetch('/api/generate/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          breakdownData: breakdownData,
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible,
          castingData: castingData || undefined // Pass casting data if available
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate location options')
      }

      const result = await response.json()

      console.log('✅ Location options generated successfully!')
      console.log('  Options:', result.locations.sceneRequirements.reduce((sum: number, req: any) => sum + req.options.length, 0))

      // 4. Store options (user selects which to keep)
      setLocationOptions(result.locations)
      // Persist pending options so they survive tab switches
      await onUpdate('locations', {
        ...locationsData,
        pendingOptions: result.locations,
        lastUpdated: Date.now()
      })

    } catch (error: any) {
      console.error('❌ Error generating location options:', error)
      setGenerationError(error.message || 'Failed to generate location options. Please try again.')
      // Attempt redirect to Scripts tab on failure
      try {
        const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[]
        const scriptsBtn = buttons.find(b => b.textContent?.toLowerCase().includes('scripts'))
        scriptsBtn?.click()
      } catch {}
    } finally {
      setIsGenerating(false)
    }
  }

  // Save selected locations
  const handleSaveSelectedLocations = async () => {
    if (!locationOptions) return

    // Convert selected LocationOptions to Location[] format
    const selectedLocations: Location[] = locationOptions.sceneRequirements
      .flatMap(req => 
        req.options
          .filter(opt => opt.selected)
          .map(opt => ({
            id: opt.id,
            name: opt.name,
            address: opt.address || '',
            contactPerson: '',
            contactPhone: '',
            contactEmail: '',
            scenes: req.sceneNumber,
            permitInfo: {
              required: opt.logistics.permitRequired,
              cost: opt.logistics.permitCost || 0,
              status: opt.logistics.permitRequired ? 'pending' : 'not-needed',
              notes: opt.logistics.notes
            },
            status: 'scouted' as const,
            secured: false,
            cost: opt.estimatedCost || 0,
            availability: [],
            imageUrls: [],
            comments: []
          }))
      )

    if (selectedLocations.length === 0) {
      setGenerationError('Please select at least one location option to save')
      return
    }

    await onUpdate('locations', {
      ...locationsData,
      locations: [...locationsData.locations, ...selectedLocations],
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
      sceneRequirements: locationOptions.sceneRequirements.map((req, idx) => 
        idx === reqIndex
          ? {
              ...req,
              options: req.options.map((opt, optIdx) =>
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
      const selectedFromOptions = updated.sceneRequirements.flatMap(req =>
        req.options.filter(o => o.selected).map(o => {
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

      const existing = locationsData.locations || []
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

  // Stats
  const totalLocations = locationsData.locations.length
  const securedCount = locationsData.locations.filter(l => l.secured).length
  const totalCost = locationsData.locations.reduce((sum, l) => sum + (l.cost || 0), 0)

  const handleCancelSelection = async () => {
    setLocationOptions(null)
    await onUpdate('locations', {
      ...locationsData,
      pendingOptions: null,
      lastUpdated: Date.now()
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Locations</div>
          <div className="text-2xl font-bold text-[#00FF99]">{totalLocations}</div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-[#00FF99] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-[#00FF99] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/70'
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
              className="px-4 py-2 bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30 rounded-lg hover:bg-[#00FF99]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '🔄 Generating...' : '🔄 Regenerate Options'}
            </button>
          )}
          <button
            onClick={handleAddLocation}
            className="px-4 py-2 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
          >
            + Add Location
          </button>
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
                className="px-4 py-2 bg-[#00FF99] text-black rounded-lg hover:bg-[#00CC7A] transition-colors text-sm font-medium"
              >
                Save Selected ({locationOptions.sceneRequirements.reduce((sum, req) => sum + req.options.filter(o => o.selected).length, 0)})
              </button>
            </div>
          </div>

          {generationError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {generationError}
            </div>
          )}

          {locationOptions.sceneRequirements.map((req, reqIndex) => (
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
                {req.options.map((opt, optIndex) => (
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
      {!locationOptions && locationsData.locations.length === 0 ? (
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
                className="px-6 py-3 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {locationsData.locations.map((location) => (
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
              {locationsData.locations.map((location) => (
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
        isSelected ? 'border-[#00FF99]' : 'border-[#36393f]'
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
            value={location.name}
            onSave={(value) => onUpdate({ name: value })}
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
          value={location.address}
          onSave={(value) => onUpdate({ address: value })}
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
              onSave={(value) => onUpdate({ cost: parseFloat(value) || 0 })}
              type="number"
              className="text-[#00FF99] font-medium"
            />
          </div>
        </div>

        {/* Scenes */}
        {location.scenes && location.scenes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {location.scenes.map((scene, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#e7e7e7]/70"
              >
                Scene {scene}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        <button
          onClick={onSelect}
          className="w-full py-2 text-sm text-[#00FF99] hover:text-[#00CC7A] transition-colors"
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
              {/* Contact */}
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50">Contact</div>
                <EditableField
                  value={location.contact}
                  onSave={(value) => onUpdate({ contact: value })}
                  placeholder="Contact name..."
                  className="text-sm text-[#e7e7e7]"
                />
                <EditableField
                  value={location.phone}
                  onSave={(value) => onUpdate({ phone: value })}
                  placeholder="Phone number..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <div className="text-xs text-[#e7e7e7]/50">Notes</div>
                <EditableField
                  value={location.notes}
                  onSave={(value) => onUpdate({ notes: value })}
                  placeholder="Add notes..."
                  multiline
                  className="text-sm text-[#e7e7e7]"
                />
              </div>

              {/* Comments */}
              <CollaborativeNotes
                comments={location.comments || []}
                onAddComment={onAddComment}
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
        isSelected ? 'border-[#00FF99] ring-2 ring-[#00FF99]/20' : 'border-[#36393f] hover:border-[#4a4a4a]'
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
            className="mt-1 w-4 h-4 rounded border-[#36393f] bg-[#2a2a2a] text-[#00FF99] focus:ring-[#00FF99]"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#e7e7e7] text-base">{option.name}</h4>
            <p className="text-sm text-[#e7e7e7]/70 mt-1">{option.description}</p>
          </div>
        </div>

        {/* Cost Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${
              option.estimatedCost === 0 ? 'text-green-400' : 
              option.estimatedCost < 150 ? 'text-[#00FF99]' : 
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
            option.sourcing === 'free' ? 'bg-green-500/20 text-green-400' :
            option.sourcing === 'borrow' ? 'bg-blue-500/20 text-blue-400' :
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
          className="w-full py-2 text-sm text-[#00FF99] hover:text-[#00CC7A] transition-colors"
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
              value={location.name}
              onSave={(value) => onUpdate({ name: value })}
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
            <div className="text-lg font-bold text-[#00FF99]">${location.cost?.toLocaleString() || 0}</div>
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
                  value={location.contact}
                  onSave={(value) => onUpdate({ contact: value })}
                  placeholder="Contact name..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>
              
              <div>
                <div className="text-xs text-[#e7e7e7]/50 mb-1">Phone</div>
                <EditableField
                  value={location.phone}
                  onSave={(value) => onUpdate({ phone: value })}
                  placeholder="Phone number..."
                  className="text-sm text-[#e7e7e7]"
                />
              </div>
            </div>

            <CollaborativeNotes
              comments={location.comments || []}
              onAddComment={onAddComment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
