'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { PreProductionData, ScriptAnalysisData, ScriptAnalysisScene } from '@/types/preproduction'
import { convertToCSV, downloadCSV } from '../shared/ExportToolbar'
import { getStoryBible } from '@/services/story-bible-service'

interface ScriptAnalysisTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ScriptAnalysisTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ScriptAnalysisTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const analysisData = (preProductionData as any).scriptAnalysis as ScriptAnalysisData | undefined
  const scriptsData = (preProductionData as any).scripts

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first in the Scripts tab')
        setIsGenerating(false)
        return
      }

      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      if (!storyBible) throw new Error('Story bible not found')

      const response = await fetch('/api/generate/script-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate analysis')
      }

      const result = await response.json()
      await onUpdate('scriptAnalysis', result.analysis)
    } catch (error: any) {
      console.error('❌ Error generating analysis:', error)
      setGenerationError(error.message || 'Failed to generate analysis. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportCSV = () => {
    if (!analysisData) return
    const csvData = analysisData.scenes.map((scene) => ({
      'Scene #': scene.sceneNumber,
      'Scene Title': scene.sceneTitle,
      'Location': scene.location,
      'Time of Day': scene.timeOfDay,
      'Summary': scene.summary,
      'Relevance': scene.relevanceToPlot,
      'Emotional Tone': scene.emotionalTone,
      'Pacing Role': scene.pacingRole,
      'Stakes': scene.stakesSummary,
      'Arcs': (scene.characterArcsAffected || []).map((arc) => {
        if (typeof arc === 'string') return arc
        if (arc && typeof arc === 'object') {
          const { character, beat, arc: arcText, moment, note } = arc as any
          const parts = [character, beat || arcText, moment, note].filter(Boolean)
          return parts.join(' — ')
        }
        return String(arc)
      }).join('; '),
      'Foreshadowing/Callbacks': scene.foreshadowingOrCallBacks.join('; '),
      'Open Questions': scene.openQuestions.join('; '),
      'Continuity Dependencies': scene.continuityDependencies.join('; '),
      'Key Props/Symbols': scene.keyPropsAndSymbols.join('; '),
      'Theme Tie-In': scene.themeTieIn,
      'Audience Takeaway': scene.audienceTakeaway,
      'Marketing Hook': scene.marketingHook || ''
    }))
    const csv = convertToCSV(csvData, Object.keys(csvData[0] || {}))
    downloadCSV(csv, `script-analysis-ep${analysisData.episodeNumber}.csv`)
  }

  if (!analysisData) {
    const hasScript = scriptsData?.fullScript
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">🧠</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Script Analysis Not Generated
        </h2>
        {!hasScript ? (
          <>
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Generate a script first to unlock scene-by-scene analysis with plot relevance, arcs, and hooks.
            </p>
            <button 
              disabled
              className="px-6 py-3 bg-[#36393f] text-[#e7e7e7]/50 font-medium rounded-lg cursor-not-allowed"
            >
              Generate Script First
            </button>
          </>
        ) : (
          <>
            {generationError && (
              <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-400 text-sm">{generationError}</p>
              </div>
            )}
            <button 
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#6366F1] text-black font-medium rounded-lg hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Analyzing Script...' : '✨ Generate Script Analysis'}
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e7e7e7]">Script Analysis</h2>
          <p className="text-sm text-[#e7e7e7]/60">Scene-by-scene story insights, arcs, stakes, and hooks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30 rounded-lg hover:bg-[#6366F1]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysisData.scenes.map((scene) => (
          <AnalysisCard key={scene.sceneNumber} scene={scene} />
        ))}
      </div>
    </div>
  )
}

function AnalysisCard({ scene }: { scene: ScriptAnalysisScene }) {
  const arcItems = (scene.characterArcsAffected || []).map((arc) => {
    if (typeof arc === 'string') return arc
    if (arc && typeof arc === 'object') {
      const { character, beat, arc: arcText, moment, note } = arc as any
      const parts = [character, beat || arcText, moment, note].filter(Boolean)
      return parts.join(' — ')
    }
    return String(arc)
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-[#e7e7e7]/50">Scene {scene.sceneNumber} • {scene.location} • {scene.timeOfDay}</div>
          <h3 className="text-lg font-semibold text-[#e7e7e7]">{scene.sceneTitle}</h3>
        </div>
        <span className="px-2 py-1 bg-[#2a2a2a] text-[#e7e7e7]/70 rounded text-xs">{scene.pacingRole}</span>
      </div>

      <div className="space-y-2 text-sm text-[#e7e7e7]/80">
        <p><span className="text-[#e7e7e7]">Summary:</span> {scene.summary}</p>
        <p><span className="text-[#e7e7e7]">Relevance:</span> {scene.relevanceToPlot}</p>
        <p><span className="text-[#e7e7e7]">Stakes:</span> {scene.stakesSummary}</p>
        <p><span className="text-[#e7e7e7]">Emotional Tone:</span> {scene.emotionalTone}</p>
        {scene.marketingHook && (
          <p className="text-[#10B981]"><span className="text-[#e7e7e7]">Hook:</span> {scene.marketingHook}</p>
        )}
        <FieldList label="Arcs" items={arcItems} />
        <FieldList label="Foreshadowing / Callbacks" items={scene.foreshadowingOrCallBacks} />
        <FieldList label="Open Questions" items={scene.openQuestions} />
        <FieldList label="Continuity Dependencies" items={scene.continuityDependencies} />
        <FieldList label="Key Props & Symbols" items={scene.keyPropsAndSymbols} />
        <p><span className="text-[#e7e7e7]">Theme:</span> {scene.themeTieIn}</p>
        <p><span className="text-[#e7e7e7]">Audience Takeaway:</span> {scene.audienceTakeaway}</p>
      </div>
    </motion.div>
  )
}

function FieldList({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <span className="text-[#e7e7e7]">{label}:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map((item, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-[#2a2a2a] text-[#e7e7e7]/80 rounded text-xs">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

