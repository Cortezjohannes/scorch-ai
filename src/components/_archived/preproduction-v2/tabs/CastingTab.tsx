import React from 'react'
import { motion } from 'framer-motion'
import { CastingData, CharacterCasting } from '@/types/preproduction'
import { ContentHeader } from '../shared/ContentHeader'
import { EmptyState } from '../shared/EmptyState'

interface CastingTabProps {
  data: CastingData | null
}

export const CastingTab: React.FC<CastingTabProps> = ({ data }) => {
  if (!data || !data.characters || data.characters.length === 0) {
    return <EmptyState title="No casting data available" description="Generate casting data to see character breakdowns and actor references." icon="🎭" />
  }
  
  return (
    <div className="space-y-8">
      <ContentHeader
        title="Character Casting"
        description="Character breakdowns with actor references (for vibe only)"
        icon="🎭"
        stats={[{ label: 'Characters', value: data.totalCharacters || data.characters.length, icon: '👥' }]}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        {data.characters.map((character, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/30 flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-[#10B981] mb-1">{character.name}</h4>
                <p className="text-sm opacity-70">{character.ageRange} • {character.gender}{character.ethnicity ? ` • ${character.ethnicity}` : ''}</p>
              </div>
            </div>
            
            {character.characterArc && (
              <div className="mb-4">
                <h5 className="text-sm font-medium opacity-60 mb-2">Character Arc</h5>
                <p className="text-sm opacity-80">{character.characterArc}</p>
              </div>
            )}
            
            {character.keyScenes && character.keyScenes.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium opacity-60 mb-2">Key Scenes</h5>
                <div className="flex flex-wrap gap-2">
                  {character.keyScenes.map((scene, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">Scene {scene}</span>
                  ))}
                </div>
              </div>
            )}
            
            {character.actorReferences && character.actorReferences.length > 0 && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <h5 className="text-sm font-medium opacity-60 mb-3">Actor References (for vibe only)</h5>
                <div className="space-y-2">
                  {character.actorReferences.map((ref, idx) => (
                    <div key={idx} className="text-sm p-2 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
                      <div className="font-medium text-[#10B981]">{ref.name}</div>
                      <div className="text-xs opacity-70 mt-1">{ref.quality} • {ref.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default CastingTab

