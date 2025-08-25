'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useProject } from '@/context/ProjectContext'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function NarrativePage() {
  const { projectTitle, projectTheme, storyBible, loading, error } = useProject()
  const router = useRouter()
  const params = useParams()
  const projectId = params?.projectId as string

  // Handle loading state
  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <motion.div 
          className="w-10 h-10 border-3 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // Handle error state
  if (error || !storyBible) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-[#e2c376] mb-2">Error</h2>
          <p className="text-[#e7e7e7]/80">{error || "Couldn't load project data"}</p>
        </div>
      </div>
    )
  }

  // Extract project data
  const arcs = storyBible.narrativeArcs || []
  const mainCharacters = storyBible.mainCharacters || []
  const worldBuilding = storyBible.worldBuilding || { setting: '', rules: '', locations: [] }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-[#e2c376] mb-4">Series Overview</h2>
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
            <p className="text-[#e7e7e7]/90">{projectTitle || 'No synopsis available'}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Theme</h3>
            <p className="text-[#e7e7e7]/90">{projectTheme || 'No theme specified'}</p>
          </div>
          {worldBuilding?.setting && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Setting</h3>
              <p className="text-[#e7e7e7]/90">{worldBuilding.setting}</p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#e2c376]">Narrative Structure</h2>
          <span className="text-sm text-[#e7e7e7]/50">
            {arcs.length} Arcs • {arcs.length * 10} Episodes
          </span>
        </div>
        
        <div className="space-y-6">
          {arcs.length > 0 ? (
            arcs.map((arc: any, index: number) => (
              <div 
                key={index}
                className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#e2c37620] border border-[#e2c37660] flex items-center justify-center text-[#e2c376] font-medium">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{arc.title}</h3>
                </div>
                <p className="text-[#e7e7e7]/90 mb-4">{arc.summary}</p>
                
                {/* Episodes list preview */}
                {arc.episodes && arc.episodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#36393f]">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Episodes</h4>
                      <span className="text-xs text-[#e7e7e7]/50">
                        Episodes {index * 10 + 1}-{index * 10 + 10}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {arc.episodes.slice(0, 4).map((episode: any, epIdx: number) => (
                        <div 
                          key={epIdx}
                          className="bg-[#2a2a2a] rounded-lg p-3 text-sm"
                        >
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">Episode {episode.number}</div>
                            <div className="text-xs text-[#e7e7e7]/50">
                              {index * 10 + parseInt(episode.number)}/60
                            </div>
                          </div>
                          <div className="text-[#e7e7e7]/80">{episode.title}</div>
                        </div>
                      ))}
                    </div>
                    {arc.episodes.length > 4 && (
                      <div className="text-center text-sm text-[#e2c376] mt-2">
                        +{arc.episodes.length - 4} more episodes
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 text-center">
              <p className="text-[#e7e7e7]/50">No narrative arcs available</p>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-[#e2c376] mb-4">Main Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainCharacters.length > 0 ? (
            mainCharacters.map((character: any, index: number) => (
              <div 
                key={index}
                className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-5"
              >
                <h3 className="font-bold text-lg text-[#e2c376] mb-1">
                  {character.name}
                </h3>
                <div className="text-xs text-[#e7e7e7]/50 mb-3">
                  {character.archetype}
                </div>
                <p className="text-sm text-[#e7e7e7]/80 mb-3">
                  {character.description || character.arc || 'No description available'}
                </p>
                {character.arc && character.arc !== character.description && (
                  <div className="pt-2 border-t border-[#36393f]">
                    <div className="text-xs font-medium text-[#e2c376] mb-1">Character Arc</div>
                    <p className="text-xs text-[#e7e7e7]/70">{character.arc}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 text-center">
              <p className="text-[#e7e7e7]/50">No character information available</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* V2 Pre-Production Action */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 pt-8 border-t border-[#36393f]"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#e2c376]">Ready for Pre-Production?</h2>
          <p className="text-[#e7e7e7]/80 max-w-2xl mx-auto">
            Generate comprehensive pre-production materials using our new V2 system. 
            This includes scripts, storyboards, props, locations, casting, marketing, and post-production guides.
          </p>
          <Button
            onClick={() => {
              // Set auto-generation flag and navigate to V2
              if (typeof window !== 'undefined') {
                localStorage.setItem('reeled-auto-generate', 'true')
              }
              router.push(`/preproduction/v2?projectId=${projectId}&arc=1`)
            }}
            disabled={!storyBible || loading}
            className="bg-[#e2c376] text-black hover:bg-[#f0d995] px-8 py-3 text-lg font-medium"
          >
            Start Pre-Production V2
          </Button>
          {!storyBible && !loading && (
            <p className="text-sm text-[#e7e7e7]/50">
              Complete the story bible first to enable pre-production
            </p>
          )}
        </div>
      </motion.section>
    </div>
  )
} 