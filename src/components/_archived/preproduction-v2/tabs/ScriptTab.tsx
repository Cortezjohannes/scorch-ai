import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ScriptData, ScriptElement } from '@/types/preproduction'
import { parseScreenplay } from '../parsers/scriptParser'
import { ContentHeader } from '../shared/ContentHeader'
import { EpisodeNavigator } from '../shared/EpisodeNavigator'
import { EmptyState } from '../shared/EmptyState'

/**
 * Script Tab Component
 * 
 * Professional screenplay format display.
 */

interface ScriptTabProps {
  data: ScriptData | null
}

export const ScriptTab: React.FC<ScriptTabProps> = ({ data }) => {
  const [activeEpisode, setActiveEpisode] = useState(1)
  
  if (!data || !data.episodes || data.episodes.length === 0) {
    return <EmptyState title="No script data available" description="Generate scripts to see professional screenplay format." icon="📝" />
  }
  
  const currentEpisode = data.episodes.find(ep => ep.episodeNumber === activeEpisode) || data.episodes[0]
  
  if (!currentEpisode) {
    return <EmptyState title="Episode not found" description="The selected episode data could not be loaded." icon="⚠️" />
  }
  
  return (
    <div className="space-y-8">
      <ContentHeader
        title="Scene Scripts"
        description="Professional screenplay format with visual dialogue separation"
        icon="📝"
        stats={[
          { label: 'Total Scenes', value: data.totalScenes, icon: '🎬' },
          { label: 'Episodes', value: data.episodes.length, icon: '📺' },
          { label: 'Format', value: data.format || 'Professional', icon: '📄' }
        ]}
      />
      
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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00FF99]/20 to-[#00CC7A]/20 border border-[#00FF99]/30">
              <span className="text-2xl font-bold text-[#00FF99]">{currentEpisode.episodeNumber}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{currentEpisode.episodeTitle || `Episode ${currentEpisode.episodeNumber}`}</h3>
              <p className="opacity-70">{currentEpisode.totalScenes} scenes • Professional screenplay format</p>
            </div>
          </div>
          
          {/* Screenplay Display */}
          <div className="bg-white text-black font-mono text-xs rounded-lg shadow-lg overflow-hidden p-8" style={{ fontSize: '12px', fontFamily: 'Courier, monospace', lineHeight: 1.6 }}>
            {currentEpisode.scenes.map((scene, sceneIndex) => {
              const parsedScript = scene.elements ? { elements: scene.elements } : parseScreenplay(scene.screenplay || '')
              
              return (
                <div key={scene.sceneNumber} className="mb-8">
                  <div className="text-center my-6">
                    <div className="inline-block bg-gray-200 text-black px-4 py-2 rounded font-bold">
                      SCENE {scene.sceneNumber}
                    </div>
                  </div>
                  
                  {parsedScript.elements.map((element: ScriptElement, elementIndex: number) => {
                    switch (element.type) {
                      case 'scene_heading':
                        return <div key={elementIndex} className="font-bold text-black mb-4 mt-8 first:mt-4">{element.content}</div>
                      case 'action':
                        return <div key={elementIndex} className="text-black mb-4 leading-relaxed max-w-none">{element.content}</div>
                      case 'character':
                        return <div key={elementIndex} className="font-bold text-black mt-6 mb-1" style={{ marginLeft: '192px' }}>{element.content}</div>
                      case 'parenthetical':
                        return <div key={elementIndex} className="text-black mb-1 italic" style={{ marginLeft: '240px' }}>{element.content}</div>
                      case 'dialogue':
                        return <div key={elementIndex} className="text-black mb-4 leading-relaxed" style={{ marginLeft: '120px', marginRight: '120px' }}>{element.content}</div>
                      case 'transition':
                        return <div key={elementIndex} className="font-bold text-black mb-4 text-right">{element.content}</div>
                      default:
                        return null
                    }
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptTab

