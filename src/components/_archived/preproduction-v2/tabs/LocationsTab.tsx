import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LocationsData, Location } from '@/types/preproduction'
import { parseLocations } from '../parsers/locationParser'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

/**
 * Locations Tab Component
 * 
 * Professional location scout card layout inspired by location scouting software.
 * Features:
 * - Large visual reference areas
 * - Requirements checklist (permits, parking, accessibility)
 * - Scene assignments
 * - Time of day badges
 * - Logistics information
 */

interface LocationsTabProps {
  data: LocationsData | null
}

export const LocationsTab: React.FC<LocationsTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return (
      <EmptyState
        title="No location data available"
        description="Generate location scouting data to see filming location requirements and logistics."
        icon="📍"
      />
    )
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  if (!currentEpisode) {
    return <EmptyState title="Episode not found" description="The selected episode data could not be loaded." icon="⚠️" />
  }
  
  // Parse the content if it's still in text format
  let locations: Location[] = currentEpisode.locations || []
  
  if (typeof (currentEpisode as any).locations === 'string') {
    const parsed = parseLocations((currentEpisode as any).locations)
    locations = parsed.locations
  }
  
  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <ContentHeader
        title="Filming Locations"
        description="Location scouting with detailed requirements and logistics information"
        icon="📍"
        stats={[
          { label: 'Episodes', value: data.episodes.length, icon: '📺' },
          { label: 'Locations', value: locations.length, icon: '🏢' },
          { label: 'Status', value: 'Scouted', icon: '✓' }
        ]}
      />
      
      {/* Episode Navigator */}
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}>
        <EpisodeNavigator
          episodes={data.episodes.map(ep => ({ episodeNumber: ep.episodeNumber, episodeTitle: ep.episodeTitle }))}
          activeEpisode={activeEpisode}
          onEpisodeChange={setActiveEpisode}
        />
        
        <div className="p-6 md:p-8">
          {/* Episode Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30">
              <span className="text-2xl">📍</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {currentEpisode.episodeTitle || `Episode ${currentEpisode.episodeNumber}`}
              </h3>
              <p className="opacity-70">{locations.length} locations • Filming requirements</p>
            </div>
          </div>
          
          {/* Location Cards */}
          {locations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {locations.map((location, index) => (
                <LocationCard key={index} location={location} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No locations found"
              description="This episode has no filming locations listed."
              icon="📍"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Location Card
 */
const LocationCard: React.FC<{ location: Location }> = ({ location }) => {
  const typeColors = {
    interior: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    exterior: 'bg-green-500/20 text-green-600 border-green-500/30',
    'interior-exterior': 'bg-purple-500/20 text-purple-600 border-purple-500/30'
  }
  
  const permitColors = {
    required: 'bg-red-500/20 text-red-600 border-red-500/30',
    'not-required': 'bg-green-500/20 text-green-600 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    obtained: 'bg-blue-500/20 text-blue-600 border-blue-500/30'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 255, 153, 0.1)' }}
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      {/* Large Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-[#00FF99]/5 to-[#00CC7A]/5 border-b border-dashed flex flex-col items-center justify-center group cursor-pointer relative"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {location.imageUrl ? (
          <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
            <p className="text-sm font-medium text-[#00FF99] text-center px-4">{location.name}</p>
            <p className="text-xs opacity-60">Location Reference</p>
            <button className="mt-2 text-xs px-3 py-1 rounded-full bg-[#00FF99]/10 hover:bg-[#00FF99]/20 text-[#00FF99] transition-colors">
              Scout
            </button>
          </>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-3 py-1 rounded-full border ${typeColors[location.type]}`}>
            {location.type.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Location Details */}
      <div className="p-5">
        <h5 className="text-lg font-semibold text-[#00FF99] mb-2">{location.name}</h5>
        <p className="text-sm mb-4 leading-relaxed opacity-80 line-clamp-2">{location.description}</p>
        
        {/* Address */}
        {location.address && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="opacity-60">📍</span>
            <span className="opacity-70">{location.address}</span>
          </div>
        )}
        
        {/* Time of Day Badges */}
        {location.timeOfDay.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {location.timeOfDay.map((time, idx) => (
              <span 
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30"
              >
                ⏰ {time}
              </span>
            ))}
          </div>
        )}
        
        {/* Scene Assignment */}
        {location.scenes.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="opacity-60">🎬</span>
            <span className="opacity-70">Scenes: {location.scenes.join(', ')}</span>
          </div>
        )}
        
        {/* Requirements Checklist */}
        <div className="space-y-2 mb-4">
          <h6 className="text-sm font-medium opacity-60">Requirements</h6>
          <div className="space-y-1.5">
            {/* Permits */}
            <div className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>Permits</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-xs ${permitColors[location.logistics.permits]}`}>
                {location.logistics.permits}
              </span>
            </div>
            
            {/* Parking */}
            {location.logistics.parkingSpaces !== undefined && (
              <div className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <span className="flex items-center gap-2">
                  <span>🚗</span>
                  <span>Parking</span>
                </span>
                <span className="opacity-70">{location.logistics.parkingSpaces} spaces</span>
              </div>
            )}
            
            {/* Accessibility */}
            {location.requirements.accessibility && (
              <div className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <span className="flex items-center gap-2">
                  <span>♿</span>
                  <span>Accessibility</span>
                </span>
                <span className="text-green-600">✓</span>
              </div>
            )}
            
            {/* Features */}
            {location.requirements.features.length > 0 && (
              <div className="text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <span className="flex items-center gap-2 mb-1.5">
                  <span>✨</span>
                  <span className="font-medium">Features</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {location.requirements.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-[#00FF99]/10 text-[#00FF99]">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Logistics Info */}
        <div className="space-y-2 mb-4">
          {location.logistics.nearestCity && (
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60">🌆</span>
              <span className="opacity-70">Near: {location.logistics.nearestCity}</span>
            </div>
          )}
          {location.logistics.estimatedCost && (
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60">💰</span>
              <span className="opacity-70">Est. Cost: {location.logistics.estimatedCost}</span>
            </div>
          )}
          {location.weather && (
            <div className="flex items-center gap-2 text-xs">
              <span className="opacity-60">🌤️</span>
              <span className="opacity-70">Weather: {location.weather}</span>
            </div>
          )}
        </div>
        
        {/* Production Status */}
        <div className="pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs opacity-60">Production Status</span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30">
            Ready to Film
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default LocationsTab

