'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData } from '@/types/preproduction'
import { ScriptRenderer, ScriptBreakdownView } from './ScriptRenderer'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisode } from '@/services/episode-service'

interface ScriptsTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ScriptsTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ScriptsTabProps) {
  const [viewMode, setViewMode] = useState<'script' | 'breakdown'>('script')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  // Check if we have script data
  const scriptData = (preProductionData as any).scripts
  const hasScriptData = scriptData && scriptData.fullScript

  const handleGenerateScript = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Generating screenplay...')
      console.log('  Episode:', preProductionData.episodeNumber, '-', preProductionData.episodeTitle)
      
      // Fetch episode and story bible data client-side (has auth context)
      console.log('📖 Fetching episode and story bible data...')
      const [episode, storyBible] = await Promise.all([
        getEpisode(preProductionData.storyBibleId, preProductionData.episodeNumber, currentUserId),
        getStoryBible(preProductionData.storyBibleId, currentUserId)
      ])
      
      // Fetch all previous episodes for context
      let previousEpisode: any = null
      let allPreviousEpisodes: any[] = []
      try {
        const { getEpisodesForStoryBible } = await import('@/services/episode-service')
        const allEpisodes = await getEpisodesForStoryBible(preProductionData.storyBibleId, currentUserId)
        
        // Sort by episode number
        const sortedEpisodes = Object.values(allEpisodes)
          .filter((ep: any) => ep.episodeNumber < preProductionData.episodeNumber)
          .sort((a: any, b: any) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
        
        allPreviousEpisodes = sortedEpisodes
        
        // Get immediate previous episode
        if (sortedEpisodes.length > 0) {
          previousEpisode = sortedEpisodes[sortedEpisodes.length - 1]
        }
        
        console.log(`✅ Loaded ${allPreviousEpisodes.length} previous episodes for context`)
      } catch (error) {
        console.warn('⚠️  Could not load previous episodes:', error)
      }

      if (!episode) {
        throw new Error(`Episode ${preProductionData.episodeNumber} not found`)
      }

      if (!storyBible) {
        throw new Error(`Story bible not found`)
      }

      console.log('✅ Episode and story bible loaded')
      
      const response = await fetch('/api/generate/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          // Pass the data directly to avoid server-side Firestore auth issues
          episodeData: episode, // This is the CURRENT/REWRITTEN episode data
          storyBibleData: storyBible,
          previousEpisode, // Immediate previous episode
          allPreviousEpisodes // All previous episodes for full context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate script')
      }

      const result = await response.json()
      
      console.log('✅ Screenplay generated successfully!')
      console.log('  Pages:', result.script?.metadata?.pageCount)
      console.log('  Scenes:', result.script?.metadata?.sceneCount)
      
      // Save to Firestore (client-side with proper auth)
      console.log('💾 Saving script to Firestore...')
      await onUpdate('scripts', {
        generated: true,
        fullScript: result.script,
        lastGenerated: Date.now(),
        status: 'generated',
        metadata: result.script.metadata
      })
      
      console.log('✅ Script saved! Data will auto-update via subscription')
      
    } catch (error: any) {
      console.error('❌ Error generating script:', error)
      setGenerationError(error.message || 'Failed to generate script. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // No script generated yet - show generation UI
  if (!hasScriptData) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Screenplay Not Generated
        </h2>
        <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
          Generate a professional, Hollywood-grade screenplay from your episode content. 
        </p>
        <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
          The script will follow industry-standard formatting, with proper slug lines, action,
          dialogue, and transitions. Target: 5 pages (~5 minutes screen time).
        </p>
        
        {generationError && (
          <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
            <p className="text-red-400 text-sm">{generationError}</p>
          </div>
        )}
        
        <button 
          onClick={handleGenerateScript}
          disabled={isGenerating}
          className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Generating Screenplay...
            </span>
          ) : (
            '✨ Generate Hollywood-Grade Script'
          )}
        </button>
      </div>
    )
  }

  const fullScript = scriptData.fullScript

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e7e7e7]">
            {fullScript.title}
          </h2>
          <p className="text-sm text-[#e7e7e7]/70">
            Episode {preProductionData.episodeNumber} • {fullScript.metadata.pageCount} pages • {fullScript.metadata.sceneCount} scenes • {fullScript.metadata.characterCount} characters
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-1">
            <button
              onClick={() => setViewMode('script')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'script' 
                  ? 'bg-[#10B981] text-black' 
                  : 'text-[#e7e7e7] hover:bg-[#36393f]'
              }`}
            >
              📝 Script
            </button>
            <button
              onClick={() => setViewMode('breakdown')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'breakdown' 
                  ? 'bg-[#10B981] text-black' 
                  : 'text-[#e7e7e7] hover:bg-[#36393f]'
              }`}
            >
              📋 Breakdown
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium disabled:opacity-50"
            title="Regenerate screenplay"
          >
            {isGenerating ? '⏳ Regenerating...' : '🔄 Regenerate'}
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'script' ? (
          <motion.div
            key="script"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScriptRenderer 
              script={fullScript} 
              onUpdate={async (updatedScript) => {
                console.log('💾 Script edit detected, saving to Firestore...', {
                  title: updatedScript.title,
                  pageCount: updatedScript.pages.length,
                  elementCount: updatedScript.pages.reduce((sum, p) => sum + p.elements.length, 0)
                })
                try {
                  await onUpdate('scripts', {
                    ...scriptData,
                    fullScript: updatedScript
                  })
                  console.log('✅ Script edit saved to Firestore successfully')
                } catch (error) {
                  console.error('❌ Error saving script edit:', error)
                  throw error
                }
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScriptBreakdownView script={fullScript} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
