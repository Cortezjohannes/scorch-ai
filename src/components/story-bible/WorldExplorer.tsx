'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Location {
  id: string
  name: string
  type: string
  description: string
  importance: 'high' | 'medium' | 'low'
  connectedTo?: string[]
  atmosphere?: string
  keyFeatures?: string[]
  significance?: string
}

export function WorldExplorer({ storyData }: { storyData: any }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'cultures'>('map')

  // Extract world data from existing story structure
  const extractWorldData = (data: any) => {
    const bible = data?.storyBible || data
    
    // Look for world data in various possible structures
    const worldData = bible?.world || bible?.worldBuilding || bible?.setting || {}
    
    let locations: Location[] = []
    
    // Extract locations from different possible formats
    if (worldData.locations && Array.isArray(worldData.locations)) {
      locations = worldData.locations.map((loc: any, index: number) => ({
        id: loc.id || loc.name || `location-${index}`,
        name: loc.name || loc.location || `Location ${index + 1}`,
        type: loc.type || loc.category || 'Location',
        description: loc.description || loc.details || 'No description available',
        importance: loc.importance || 'medium',
        atmosphere: loc.atmosphere || loc.mood || loc.tone,
        keyFeatures: Array.isArray(loc.features) ? loc.features : (loc.keyFeatures || []),
        significance: loc.significance || loc.importance_to_story,
        connectedTo: loc.connectedTo || loc.connections || []
      }))
    } else if (typeof worldData === 'string') {
      // If world data is a string, try to extract location names
      const locationMatches = worldData.match(/([A-Z][a-z]+ ?[A-Z]*[a-z]*)/g) || []
      locations = locationMatches.slice(0, 6).map((name, index) => ({
        id: `location-${index}`,
        name: name.trim(),
        type: 'Location',
        description: `A significant location in the story: ${name}`,
        importance: index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
      }))
    }
    
    return {
      locations,
      setting: worldData.setting || worldData.timePeriod || 'Modern Era',
      tone: worldData.tone || worldData.atmosphere || 'Contemporary',
      culture: worldData.culture || worldData.society || [],
      totalElements: Object.keys(worldData).length
    }
  }

  const worldData = extractWorldData(storyData)
  const { locations } = worldData

  return (
    <div className="space-y-6">
      {/* World Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-bold text-high-contrast elegant-fire">World Explorer</h2>
        <div className="flex gap-2">
          {[
            { mode: 'map', icon: '🗺️', label: 'Map View' },
            { mode: 'timeline', icon: '⏰', label: 'Timeline' },
            { mode: 'cultures', icon: '🏛️', label: 'Setting' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setViewMode(option.mode as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all touch-target
                ${viewMode === option.mode
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline text-caption">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* World Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🌍</div>
          <div className="text-body text-ember-gold font-bold">{locations.length}</div>
          <div className="text-caption text-medium-contrast">Locations</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">⭐</div>
          <div className="text-body text-ember-gold font-bold">
            {locations.filter(l => l.importance === 'high').length}
          </div>
          <div className="text-caption text-medium-contrast">Key Places</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🏛️</div>
          <div className="text-body text-ember-gold font-bold">{worldData.setting}</div>
          <div className="text-caption text-medium-contrast">Era</div>
        </Card>
        <Card variant="status" className="text-center p-3">
          <div className="text-xl mb-1">🎭</div>
          <div className="text-body text-ember-gold font-bold">{worldData.tone}</div>
          <div className="text-caption text-medium-contrast">Tone</div>
        </Card>
      </div>

      {/* World Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'map' && (
            <InteractiveWorldMap 
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          )}
          {viewMode === 'timeline' && (
            <WorldTimeline worldData={worldData} />
          )}
          {viewMode === 'cultures' && (
            <SettingExplorer worldData={worldData} />
          )}
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <LocationDetailPanel 
                key={selectedLocation.id}
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            ) : (
              <WorldOverviewPanel worldData={worldData} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function InteractiveWorldMap({ 
  locations, 
  selectedLocation, 
  onSelectLocation 
}: {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location) => void
}) {
  if (locations.length === 0) {
    return (
      <Card variant="content" className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-h3 text-medium-contrast mb-2">No Locations Found</h3>
          <p className="text-body text-medium-contrast">
            World locations and settings will appear here once your story bible contains world-building information.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="content" className="h-96 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
        {/* Location Markers */}
        {locations.map((location, index) => {
          // Distribute locations in a strategic pattern
          const gridSize = Math.ceil(Math.sqrt(locations.length))
          const row = Math.floor(index / gridSize)
          const col = index % gridSize
          const x = (col / Math.max(gridSize - 1, 1)) * 70 + 15
          const y = (row / Math.max(gridSize - 1, 1)) * 70 + 15

          const importanceSize = {
            high: 'w-14 h-14 text-lg',
            medium: 'w-12 h-12 text-base',
            low: 'w-10 h-10 text-sm'
          }

          const importanceColor = {
            high: 'border-red-400 bg-red-400/20',
            medium: 'border-yellow-400 bg-yellow-400/20',
            low: 'border-blue-400 bg-blue-400/20'
          }

          return (
            <motion.button
              key={location.id}
              className={`
                absolute ${importanceSize[location.importance]}
                rounded-full border-2 flex items-center justify-center font-bold
                transition-all duration-300 hover:scale-110 touch-target-comfortable
                ${selectedLocation?.id === location.id
                  ? 'border-ember-gold bg-ember-gold/20 shadow-lg shadow-ember-gold/30 scale-110'
                  : `${importanceColor[location.importance]} hover:border-white/50`
                }
              `}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onSelectLocation(location)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: selectedLocation?.id === location.id ? 1.1 : 1, 
                opacity: 1 
              }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
              title={location.name}
            >
              {getLocationEmoji(location.type)}
            </motion.button>
          )
        })}

        {/* Location Names */}
        {locations.map((location, index) => {
          const gridSize = Math.ceil(Math.sqrt(locations.length))
          const row = Math.floor(index / gridSize)
          const col = index % gridSize
          const nameX = (col / Math.max(gridSize - 1, 1)) * 70 + 15
          const nameY = (row / Math.max(gridSize - 1, 1)) * 70 + 25

          return (
            <div
              key={`name-${location.id}`}
              className="absolute text-caption text-center pointer-events-none max-w-20"
              style={{
                left: `${nameX}%`,
                top: `${nameY}%`,
                transform: 'translate(-50%, 0)',
                color: selectedLocation?.id === location.id ? '#e2c376' : 'rgba(255,255,255,0.8)'
              }}
            >
              {location.name}
            </div>
          )
        })}

        {/* Connection Lines (if relationships exist) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {locations.map((location, index) => {
            if (!location.connectedTo?.length) return null

            const gridSize = Math.ceil(Math.sqrt(locations.length))
            const row1 = Math.floor(index / gridSize)
            const col1 = index % gridSize
            const x1 = (col1 / Math.max(gridSize - 1, 1)) * 70 + 15
            const y1 = (row1 / Math.max(gridSize - 1, 1)) * 70 + 15

            return location.connectedTo.map((connectionId) => {
              const connectedIndex = locations.findIndex(l => l.id === connectionId)
              if (connectedIndex === -1) return null

              const row2 = Math.floor(connectedIndex / gridSize)
              const col2 = connectedIndex % gridSize
              const x2 = (col2 / Math.max(gridSize - 1, 1)) * 70 + 15
              const y2 = (row2 / Math.max(gridSize - 1, 1)) * 70 + 15

              return (
                <motion.line
                  key={`${location.id}-${connectionId}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(226, 195, 118, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                />
              )
            })
          })}
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 text-medium-contrast text-caption">
        Click locations to explore world details
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 text-caption text-medium-contrast">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-red-400 bg-red-400/20"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-yellow-400 bg-yellow-400/20"></div>
            <span>Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full border border-blue-400 bg-blue-400/20"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

function LocationDetailPanel({ 
  location, 
  onClose 
}: { 
  location: Location
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card variant="content" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-high-contrast font-bold elegant-fire">{location.name}</h3>
          <button
            onClick={onClose}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getLocationEmoji(location.type)}</span>
            <div>
              <div className="text-ember-gold text-caption font-medium">Type</div>
              <div className="text-body text-high-contrast">{location.type}</div>
            </div>
          </div>

          <div>
            <label className="text-ember-gold text-caption font-medium block mb-1">Description</label>
            <p className="text-body text-medium-contrast leading-relaxed">
              {location.description}
            </p>
          </div>

          {location.atmosphere && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Atmosphere</label>
              <p className="text-body text-medium-contrast">
                {location.atmosphere}
              </p>
            </div>
          )}

          {location.significance && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-1">Story Significance</label>
              <p className="text-body text-medium-contrast leading-relaxed">
                {location.significance}
              </p>
            </div>
          )}

          {location.keyFeatures && location.keyFeatures.length > 0 && (
            <div>
              <label className="text-ember-gold text-caption font-medium block mb-2">Key Features</label>
              <ul className="list-disc list-inside text-medium-contrast text-body space-y-1">
                {location.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-caption">
              <span className="text-medium-contrast">Importance: </span>
              <span className={`font-medium ${
                location.importance === 'high' ? 'text-red-400' :
                location.importance === 'medium' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {location.importance}
              </span>
            </div>
            <button className="burn-button px-4 py-2 text-caption touch-target">
              Edit Location
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function WorldOverviewPanel({ worldData }: { worldData: any }) {
  return (
    <Card variant="content" className="text-center p-6">
      <div className="text-4xl mb-4">🌍</div>
      <h3 className="text-h3 text-high-contrast mb-2 elegant-fire">
        World Overview
      </h3>
      <p className="text-body text-medium-contrast mb-6">
        Explore the rich universe of your story through interactive maps, settings, and environmental details.
      </p>
      
      <div className="space-y-3 text-left">
        <div className="flex justify-between">
          <span className="text-medium-contrast">Locations:</span>
          <span className="text-ember-gold">{worldData.locations?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-medium-contrast">Setting:</span>
          <span className="text-ember-gold text-caption">{worldData.setting}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-medium-contrast">Tone:</span>
          <span className="text-ember-gold text-caption">{worldData.tone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-medium-contrast">Elements:</span>
          <span className="text-ember-gold">{worldData.totalElements}</span>
        </div>
      </div>
    </Card>
  )
}

// Helper function to get location emoji
function getLocationEmoji(type: string): string {
  const typeMap: Record<string, string> = {
    'city': '🏙️',
    'town': '🏘️',
    'village': '🏡',
    'forest': '🌲',
    'mountain': '⛰️',
    'desert': '🏜️',
    'ocean': '🌊',
    'sea': '🌊',
    'building': '🏢',
    'home': '🏠',
    'house': '🏠',
    'apartment': '🏠',
    'castle': '🏰',
    'palace': '🏰',
    'cave': '🕳️',
    'space': '🚀',
    'station': '🚉',
    'school': '🏫',
    'hospital': '🏥',
    'office': '🏢',
    'shop': '🏪',
    'restaurant': '🍽️',
    'bar': '🍺',
    'club': '🎪',
    'park': '🌳',
    'beach': '🏖️',
    'laboratory': '🧪',
    'lab': '🧪',
    'warehouse': '🏭',
    'factory': '🏭',
    'farm': '🚜',
    'road': '🛣️',
    'bridge': '🌉',
    'tunnel': '🚇'
  }
  
  const lowerType = type.toLowerCase()
  for (const [key, emoji] of Object.entries(typeMap)) {
    if (lowerType.includes(key)) {
      return emoji
    }
  }
  
  return '📍'
}

// Timeline and setting components
function WorldTimeline({ worldData }: { worldData: any }) {
  return (
    <Card variant="content" className="p-6 text-center">
      <div className="text-4xl mb-4">⏰</div>
      <h3 className="text-h3 text-medium-contrast mb-2">World Timeline</h3>
      <p className="text-body text-medium-contrast mb-6">
        Historical events and timeline visualization will be displayed here to show the chronological development of your story world.
      </p>
      
      <div className="bg-black/20 rounded-lg p-4">
        <div className="text-ember-gold text-body font-medium mb-2">Current Setting</div>
        <div className="text-medium-contrast">{worldData.setting}</div>
      </div>
    </Card>
  )
}

function SettingExplorer({ worldData }: { worldData: any }) {
  return (
    <Card variant="content" className="p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🏛️</div>
        <h3 className="text-h3 text-high-contrast mb-2 elegant-fire">Setting & Culture</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-ember-gold text-caption font-medium block mb-1">Time Period</label>
          <p className="text-body text-high-contrast">{worldData.setting}</p>
        </div>
        
        <div>
          <label className="text-ember-gold text-caption font-medium block mb-1">Atmosphere</label>
          <p className="text-body text-high-contrast">{worldData.tone}</p>
        </div>
        
        <div>
          <label className="text-ember-gold text-caption font-medium block mb-1">World Elements</label>
          <p className="text-body text-medium-contrast">
            Your story world contains {worldData.locations?.length || 0} locations and {worldData.totalElements} total world-building elements.
          </p>
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <button className="w-full burn-button py-2 text-body touch-target-comfortable">
            Expand World Building
          </button>
        </div>
      </div>
    </Card>
  )
}
