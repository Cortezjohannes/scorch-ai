'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { DepthSection } from '@/types/investor-materials'

interface WorldAtlasExplorerProps {
  depth: DepthSection
}

interface LocationMarker {
  location: any
  x: number
  y: number
  discovered: boolean
  visited: boolean
}

interface MuseumRoom {
  id: string
  title: string
  description: string
  exhibits: any[]
  ambientColor: string
  backgroundPattern?: string
}

export default function WorldAtlasExplorer({ depth }: WorldAtlasExplorerProps) {
  const [currentView, setCurrentView] = useState<'map' | 'museum'>('map')
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null)
  const [museumRoom, setMuseumRoom] = useState<string>('overview')
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day')
  const [showRulesOverlay, setShowRulesOverlay] = useState(false)
  const [discoveredLocations, setDiscoveredLocations] = useState<Set<string>>(new Set())
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, zoom: 1 })

  const mapRef = useRef<HTMLDivElement>(null)

  // Generate location markers
  const generateLocationMarkers = (): LocationMarker[] => {
    return depth.world.locations.map((location, idx) => ({
      location,
      x: 200 + (idx * 150) % 600, // Spread across map
      y: 150 + Math.floor(idx / 4) * 120,
      discovered: discoveredLocations.has(location.name),
      visited: false
    }))
  }

  const locationMarkers = generateLocationMarkers()

  // Museum rooms
  const museumRooms: MuseumRoom[] = [
    {
      id: 'overview',
      title: 'The World',
      description: 'An immersive exploration of the story\'s setting',
      exhibits: [depth.world.setting],
      ambientColor: '#10B981',
      backgroundPattern: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)'
    },
    {
      id: 'rules',
      title: 'The Rules',
      description: 'Ancient laws and natural forces that govern this world',
      exhibits: depth.world.rules || [],
      ambientColor: '#8B5CF6',
      backgroundPattern: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
    },
    {
      id: 'locations',
      title: 'Key Locations',
      description: 'Sacred places and pivotal settings that shape the story',
      exhibits: depth.world.locations,
      ambientColor: '#F59E0B',
      backgroundPattern: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)'
    }
  ]

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location)
    setDiscoveredLocations(prev => new Set([...prev, location.name]))
    setCameraPosition({ x: 0, y: 0, zoom: 1 }) // Reset camera when selecting location
  }

  const renderMapView = () => {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* World Map Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: timeOfDay === 'day'
              ? 'linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #F0E68C 100%)'
              : 'linear-gradient(135deg, #191970 0%, #2F2F4F 50%, #483D8B 100%)'
          }}
          transition={{ duration: 2 }}
        >
          {/* Animated clouds/stars */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: timeOfDay === 'day' ? 8 : 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${
                  timeOfDay === 'day' ? 'bg-white/60' : 'bg-white/80'
                }`}
                style={{
                  width: timeOfDay === 'day' ? '60px' : '2px',
                  height: timeOfDay === 'day' ? '40px' : '2px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -10, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: timeOfDay === 'day' ? 8 : 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>

          {/* Terrain features */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-800 to-transparent" />
          <div className="absolute bottom-20 left-10 w-20 h-16 bg-green-900 rounded-full opacity-60" />
          <div className="absolute bottom-16 right-20 w-32 h-20 bg-green-800 rounded-full opacity-50" />
        </motion.div>

        {/* Location Markers */}
        <div className="absolute inset-0">
          {locationMarkers.map((marker, idx) => (
            <motion.div
              key={marker.location.name}
              className="absolute cursor-pointer group"
              style={{
                left: marker.x,
                top: marker.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleLocationClick(marker.location)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: marker.discovered ? 1 : 0.5,
                opacity: marker.discovered ? 1 : 0.3
              }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.2 }}
            >
              {/* Location marker */}
              <div className={`relative w-8 h-8 rounded-full border-4 flex items-center justify-center text-lg transition-all ${
                selectedLocation?.name === marker.location.name
                  ? 'border-[#10B981] bg-[#10B981]/20 scale-125'
                  : 'border-white/80 bg-white/10 group-hover:border-[#10B981]'
              }`}>
                <span className="text-white font-bold drop-shadow-lg">
                  {marker.location.type === 'campus' && '🏫'}
                  {marker.location.type === 'neighborhood' && '🏘️'}
                  {marker.location.type === 'home' && '🏠'}
                  {marker.location.type === 'hangout' && '🎪'}
                  {marker.location.type === 'institution' && '🏛️'}
                  {marker.location.type === 'hidden' && '🕵️'}
                  {marker.location.type === 'event-space' && '🎭'}
                  {marker.location.type === 'authority' && '👮'}
                  {!['campus', 'neighborhood', 'home', 'hangout', 'institution', 'hidden', 'event-space', 'authority'].includes(marker.location.type) && '📍'}
                </span>

                {/* Pulse effect for discovered locations */}
                {marker.discovered && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#10B981]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>

              {/* Location tooltip */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#121212] border border-[#10B981]/20 rounded-lg p-3 text-white text-sm whitespace-nowrap z-20 max-w-xs"
                >
                  <div className="font-semibold text-[#10B981] mb-1">{marker.location.name}</div>
                  <div className="text-white/80 text-xs">{marker.location.description}</div>
                  <div className="text-white/60 text-xs mt-1">Click to explore</div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* World Rules Overlay */}
        <AnimatePresence>
          {showRulesOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30"
            >
              <div className="absolute inset-8 bg-[#1A1A1A] border border-[#10B981]/20 rounded-xl p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#10B981]">World Rules & Natural Laws</h2>
                  <button
                    onClick={() => setShowRulesOverlay(false)}
                    className="text-white/50 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {depth.world.rules?.map((rule, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#121212] border border-white/10 rounded-lg p-4"
                    >
                      <div className="text-white/80 leading-relaxed">{rule}</div>
                    </motion.div>
                  )) || (
                    <div className="col-span-full text-center text-white/60 py-8">
                      No specific world rules defined yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Detail Panel */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-[#1A1A1A] border-l border-[#10B981]/20 p-6 overflow-y-auto z-20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#10B981]">{selectedLocation.name}</h2>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Location image */}
              {selectedLocation.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={selectedLocation.imageUrl}
                    alt={selectedLocation.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Location details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/50 mb-1">TYPE</h3>
                  <p className="text-white capitalize">{selectedLocation.type || 'Location'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white/50 mb-1">DESCRIPTION</h3>
                  <p className="text-white/80 leading-relaxed">{selectedLocation.description}</p>
                </div>

                {selectedLocation.significance && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 mb-1">SIGNIFICANCE</h3>
                    <p className="text-white/80 leading-relaxed">{selectedLocation.significance}</p>
                  </div>
                )}

                {selectedLocation.recurringEvents && selectedLocation.recurringEvents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 mb-1">RECURRING EVENTS</h3>
                    <ul className="text-white/80 space-y-1">
                      {selectedLocation.recurringEvents.map((event: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[#10B981]">•</span>
                          <span>{event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
          <button
            onClick={() => setTimeOfDay(timeOfDay === 'day' ? 'night' : 'day')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm transition-colors"
          >
            {timeOfDay === 'day' ? '🌙 Night' : '☀️ Day'}
          </button>

          <button
            onClick={() => setShowRulesOverlay(!showRulesOverlay)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm transition-colors"
          >
            📜 Rules
          </button>

          <button
            onClick={() => setCurrentView('museum')}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] rounded-lg text-white text-sm transition-colors"
          >
            🏛️ Museum
          </button>
        </div>
      </div>
    )
  }

  const renderMuseumView = () => {
    const currentRoom = museumRooms.find(room => room.id === museumRoom)

    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {/* Room Background */}
        <motion.div
          className="absolute inset-0"
          animate={{ background: currentRoom?.backgroundPattern }}
          transition={{ duration: 1 }}
        />

        {/* Ambient Lighting */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${currentRoom?.ambientColor}40 0%, transparent 70%)`
          }}
        />

        {/* Room Navigation */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex space-x-4">
          {museumRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setMuseumRoom(room.id)}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                museumRoom === room.id
                  ? 'bg-[#10B981] text-black'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              {room.title}
            </button>
          ))}
        </div>

        {/* Back to Map Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setCurrentView('map')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm transition-colors"
          >
            🗺️ World Map
          </button>
        </div>

        {/* Room Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={museumRoom}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {currentRoom?.title}
              </h1>
              <p className="text-xl text-white/80 mb-12">
                {currentRoom?.description}
              </p>

              {/* Exhibits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentRoom?.exhibits.map((exhibit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="bg-[#1A1A1A] border border-white/10 rounded-lg p-6 hover:border-[#10B981]/30 transition-colors"
                  >
                    {museumRoom === 'overview' && (
                      <div className="text-white/90 leading-relaxed">{exhibit}</div>
                    )}

                    {museumRoom === 'rules' && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                          📜
                        </div>
                        <p className="text-white/90 leading-relaxed">{exhibit}</p>
                      </div>
                    )}

                    {museumRoom === 'locations' && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                          {exhibit.type === 'campus' && '🏫'}
                          {exhibit.type === 'neighborhood' && '🏘️'}
                          {exhibit.type === 'home' && '🏠'}
                          {exhibit.type === 'hangout' && '🎪'}
                          {exhibit.type === 'institution' && '🏛️'}
                          {exhibit.type === 'hidden' && '🕵️'}
                          {exhibit.type === 'event-space' && '🎭'}
                          {exhibit.type === 'authority' && '👮'}
                          {!['campus', 'neighborhood', 'home', 'hangout', 'institution', 'hidden', 'event-space', 'authority'].includes(exhibit.type) && '📍'}
                        </div>
                        <h3 className="text-lg font-bold text-[#10B981] mb-2">{exhibit.name}</h3>
                        <p className="text-white/80 text-sm leading-relaxed">{exhibit.description}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => {
              const currentIndex = museumRooms.findIndex(r => r.id === museumRoom)
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : museumRooms.length - 1
              setMuseumRoom(museumRooms[prevIndex].id)
            }}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-colors"
          >
            ←
          </button>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => {
              const currentIndex = museumRooms.findIndex(r => r.id === museumRoom)
              const nextIndex = currentIndex < museumRooms.length - 1 ? currentIndex + 1 : 0
              setMuseumRoom(museumRooms[nextIndex].id)
            }}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl transition-colors"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-sm border-b border-[#10B981]/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#10B981]">World Atlas Explorer</h1>
            <p className="text-sm text-white/70">Discover the story's world • {depth.world.locations.length} locations mapped</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/60">
              {discoveredLocations.size} / {depth.world.locations.length} locations discovered
            </div>

            <button className="px-4 py-2 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg text-sm transition-colors">
              📄 Export World Guide
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderMapView()}
          </motion.div>
        ) : (
          <motion.div
            key="museum"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderMuseumView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}