import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MarketingData } from '@/types/preproduction'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

interface MarketingTabProps {
  data: MarketingData | null
}

export const MarketingTab: React.FC<MarketingTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return <EmptyState title="No marketing data available" description="Generate marketing strategy to see promotion plans and social media content." icon="📢" />
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  return (
    <div className="space-y-8">
      <ContentHeader title="Marketing Strategy" description="Promotion plans and social media content per episode" icon="📢" stats={[{ label: 'Episodes', value: data.episodes.length, icon: '📺' }]} />
      
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <EpisodeNavigator episodes={data.episodes.map(ep => ({ episodeNumber: ep.episodeNumber, episodeTitle: ep.episodeTitle }))} activeEpisode={activeEpisode} onEpisodeChange={setActiveEpisode} />
        
        {currentEpisode && currentEpisode.strategy && (
          <div className="p-6 md:p-8 space-y-6">
            {currentEpisode.strategy.taglines && currentEpisode.strategy.taglines.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#00FF99] mb-3">Taglines</h4>
                <div className="space-y-2">
                  {currentEpisode.strategy.taglines.map((tagline, idx) => (
                    <div key={idx} className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}>
                      <p className="italic">&ldquo;{tagline}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentEpisode.strategy.platforms && currentEpisode.strategy.platforms.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#00FF99] mb-3">Social Media Posts</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentEpisode.strategy.platforms.map((platform, idx) => (
                    <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}>
                      <div className="font-medium text-[#00FF99] mb-2 capitalize">{platform.platform}</div>
                      <p className="text-sm opacity-80 mb-2">{platform.content}</p>
                      {platform.hashtags && platform.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {platform.hashtags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="text-xs px-2 py-1 rounded-full bg-[#00FF99]/10 text-[#00FF99]">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingTab

