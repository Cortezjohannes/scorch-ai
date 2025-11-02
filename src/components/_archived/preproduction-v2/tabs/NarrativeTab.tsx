import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { NarrativeData } from '@/types/preproduction'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

interface NarrativeTabProps {
  data: NarrativeData | null
}

export const NarrativeTab: React.FC<NarrativeTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return <EmptyState title="No narrative data available" description="Generate narrative overview to see episode content and scene breakdowns." icon="📖" />
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  return (
    <div className="space-y-8">
      <ContentHeader title="Narrative Overview" description="Episode content overview with scene breakdowns" icon="📖"
        stats={[
          { label: 'Episodes', value: data.totalEpisodes, icon: '📺' },
          { label: 'Scenes', value: data.totalScenes, icon: '🎬' },
          { label: 'Format', value: data.format || 'V2', icon: '📄' }
        ]}
      />
      
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <EpisodeNavigator episodes={data.episodes.map(ep => ({ episodeNumber: ep.episodeNumber, episodeTitle: ep.episodeTitle }))} activeEpisode={activeEpisode} onEpisodeChange={setActiveEpisode} />
        
        {currentEpisode && (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30">
                <span className="text-2xl font-bold text-[#00FF99]">{currentEpisode.episodeNumber}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{currentEpisode.episodeTitle || `Episode ${currentEpisode.episodeNumber}`}</h3>
                <p className="opacity-70">{currentEpisode.scenes?.length || 0} scenes</p>
              </div>
            </div>
            
            {currentEpisode.synopsis && (
              <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
                <h4 className="font-semibold mb-3 text-[#00FF99]">Synopsis</h4>
                <p className="opacity-80 leading-relaxed">{currentEpisode.synopsis}</p>
              </div>
            )}
            
            {currentEpisode.scenes && currentEpisode.scenes.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-[#00FF99]">Scenes</h4>
                {currentEpisode.scenes.map((scene, idx) => (
                  <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#00FF99]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#00FF99]">{scene.sceneNumber}</span>
                      </div>
                      <h5 className="font-semibold">Scene {scene.sceneNumber}</h5>
                    </div>
                    <p className="text-sm opacity-80">{scene.content || scene.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NarrativeTab

