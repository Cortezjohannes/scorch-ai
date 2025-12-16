import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoryboardData, StoryboardShot } from '@/types/preproduction'
import { parseStoryboard } from '../parsers/storyboardParser'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

/**
 * Storyboard Tab Component
 * 
 * Professional shot-list layout inspired by ShotGrid and Frame.io.
 * Features:
 * - Grid layout with visual frames
 * - Shot number, type, duration badges
 * - Technical details in organized grid
 * - AI image placeholders
 * - Expandable details
 */

interface StoryboardTabProps {
  data: StoryboardData | null
}

export const StoryboardTab: React.FC<StoryboardTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  const [expandedShot, setExpandedShot] = useState<number | null>(null)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return (
      <EmptyState
        title="No storyboard data available"
        description="Generate storyboards to see visual shot planning and cinematography details for each scene."
        icon="🎬"
      />
    )
  }
  
  // Get current episode data
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  if (!currentEpisode) {
    return (
      <EmptyState
        title="Episode not found"
        description="The selected episode data could not be loaded."
        icon="⚠️"
      />
    )
  }
  
  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <ContentHeader
        title="Visual Storyboards"
        description="Shot-by-shot visual planning with cinematography details"
        icon="🎬"
        stats={[
          { label: 'Total Scenes', value: data.totalScenes, icon: '🎞️' },
          { label: 'Episodes', value: data.episodes.length, icon: '📺' },
          { label: 'Visual Style', value: data.visualStyle?.genre || 'Cinematic', icon: '🎨' }
        ]}
      />
      
      {/* Episode Navigator */}
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}>
        <EpisodeNavigator
          episodes={data.episodes.map(ep => ({
            episodeNumber: ep.episodeNumber,
            episodeTitle: ep.episodeTitle
          }))}
          activeEpisode={activeEpisode}
          onEpisodeChange={setActiveEpisode}
        />
        
        {/* Episode Content */}
        <div className="p-6 md:p-8">
          {/* Episode Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/30">
              <span className="text-2xl font-bold text-[#10B981]">{currentEpisode.episodeNumber}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {currentEpisode.episodeTitle || `Episode ${currentEpisode.episodeNumber}`}
              </h3>
              <p className="opacity-70">
                {currentEpisode.totalScenes} scenes • Storyboard breakdown
              </p>
            </div>
          </div>
          
          {/* Scenes */}
          <div className="space-y-8">
            {currentEpisode.scenes.map((scene, sceneIndex) => {
              // Parse the storyboard text if shots array doesn't exist
              const parsedStoryboard = !scene.shots && scene.storyboard 
                ? parseStoryboard(scene.storyboard)
                : { shots: scene.shots || [] }
              const shots = scene.shots || parsedStoryboard.shots
              
              return (
                <motion.div
                  key={scene.sceneNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sceneIndex * 0.1 }}
                  className="rounded-xl border overflow-hidden"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {/* Scene Header */}
                  <div className="p-4 border-b" style={{
                    backgroundColor: 'rgba(0, 255, 153, 0.05)',
                    borderColor: 'var(--border-color)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#10B981]/20 border border-[#10B981]/30">
                          <span className="text-sm font-bold text-[#10B981]">{scene.sceneNumber}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Scene {scene.sceneNumber}</h4>
                          <p className="text-sm opacity-70">{shots.length} shots planned</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full" style={{
                        backgroundColor: 'var(--card-bg)',
                        borderWidth: '1px',
                        borderColor: 'var(--border-color)'
                      }}>
                        Storyboard
                      </span>
                    </div>
                  </div>
                  
                  {/* Shot Cards Grid */}
                  <div className="p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {shots.map((shot: StoryboardShot, shotIndex: number) => (
                        <ShotCard
                          key={shotIndex}
                          shot={shot}
                          sceneNumber={scene.sceneNumber}
                          isExpanded={expandedShot === shot.number}
                          onToggleExpand={() => setExpandedShot(expandedShot === shot.number ? null : shot.number)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Shot Card Component
 */
interface ShotCardProps {
  shot: StoryboardShot
  sceneNumber: number
  isExpanded: boolean
  onToggleExpand: () => void
}

const ShotCard: React.FC<ShotCardProps> = ({ shot, sceneNumber, isExpanded, onToggleExpand }) => {
  return (
    <motion.div
      layout
      className="rounded-lg border overflow-hidden hover:border-[#10B981]/50 transition-all"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 255, 153, 0.1)' }}
    >
      {/* Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-[#10B981]/5 to-[#059669]/5 border-b border-dashed flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {shot.imageUrl ? (
          <img src={shot.imageUrl} alt={`Shot ${shot.number}`} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
            <p className="text-sm font-medium text-[#10B981]">Shot {shot.number}</p>
            <p className="text-xs opacity-60">AI Image Frame</p>
            <button className="mt-2 text-xs px-3 py-1 rounded-full bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] transition-colors">
              Generate
            </button>
          </>
        )}
        
        {/* Shot Type Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {shot.type.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {shot.duration}
          </span>
        </div>
      </div>
      
      {/* Shot Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-bold text-[#10B981]">Shot {shot.number}</h5>
          <span className="text-xs px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">
            Scene {sceneNumber}
          </span>
        </div>
        
        <p className="text-sm mb-4 leading-relaxed line-clamp-2 opacity-80">
          {shot.description}
        </p>
        
        {/* Technical Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="opacity-60 mb-1">📹 Camera</div>
            <div className="font-medium">{shot.camera.angle}</div>
          </div>
          <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="opacity-60 mb-1">🎬 Movement</div>
            <div className="font-medium">{shot.camera.movement}</div>
          </div>
          <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="opacity-60 mb-1">🖼️ Composition</div>
            <div className="font-medium">{shot.composition}</div>
          </div>
          <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="opacity-60 mb-1">💡 Lighting</div>
            <div className="font-medium">{shot.lighting}</div>
          </div>
        </div>
        
        {/* Expand Button */}
        <button
          onClick={onToggleExpand}
          className="w-full text-xs py-2 rounded-lg border transition-colors hover:border-[#10B981] hover:bg-[#10B981]/5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {isExpanded ? '▲ Less Details' : '▼ Full Description'}
        </button>
        
        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t space-y-2 text-xs"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div>
                <span className="opacity-60">Full Description:</span>
                <p className="mt-1 opacity-80">{shot.description}</p>
              </div>
              {shot.imagePrompt && (
                <div>
                  <span className="opacity-60">AI Image Prompt:</span>
                  <p className="mt-1 opacity-80 italic">{shot.imagePrompt}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default StoryboardTab

