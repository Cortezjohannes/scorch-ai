import React, { useState } from 'react'
import { PostProductionData } from '@/types/preproduction'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

interface PostProductionTabProps {
  data: PostProductionData | null
}

export const PostProductionTab: React.FC<PostProductionTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return <EmptyState title="No post-production data available" description="Generate post-production guide to see editing, VFX, and sound design notes." icon="🎞️" />
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  return (
    <div className="space-y-8">
      <ContentHeader title="Post-Production Guide" description="Editing, VFX, color grading, and sound design notes" icon="🎞️" stats={[{ label: 'Episodes', value: data.episodes.length, icon: '📺' }]} />
      
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <EpisodeNavigator episodes={data.episodes.map(ep => ({ episodeNumber: ep.episodeNumber, episodeTitle: ep.episodeTitle }))} activeEpisode={activeEpisode} onEpisodeChange={setActiveEpisode} />
        
        {currentEpisode && currentEpisode.guide && (
          <div className="p-6 md:p-8 space-y-6">
            {currentEpisode.guide.colorGrading && currentEpisode.guide.colorGrading.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#10B981] mb-3">Color Grading Notes</h4>
                <div className="space-y-2">
                  {currentEpisode.guide.colorGrading.map((note, idx) => (
                    <div key={idx} className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}>
                      <span className="font-medium">Scene {note.sceneNumber}:</span> {note.mood} • {note.palette}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentEpisode.guide.vfx && currentEpisode.guide.vfx.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#10B981] mb-3">VFX Requirements</h4>
                <div className="space-y-2">
                  {currentEpisode.guide.vfx.map((vfx, idx) => (
                    <div key={idx} className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'var(--background-secondary)', borderColor: 'var(--border-color)' }}>
                      <span className="font-medium">Scene {vfx.sceneNumber}:</span> {vfx.description} <span className="text-xs px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{vfx.complexity}</span>
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

export default PostProductionTab

