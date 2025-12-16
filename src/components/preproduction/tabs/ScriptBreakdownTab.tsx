'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { PreProductionData, ScriptBreakdownData, ScriptBreakdownScene, ScriptAnalysisData, ScriptAnalysisScene } from '@/types/preproduction'
import { TableView, type TableColumn } from '../shared/TableView'
import { StatusBadge } from '../shared/StatusBadge'
import { convertToCSV, downloadCSV } from '../shared/ExportToolbar'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisode } from '@/services/episode-service'

interface ScriptBreakdownTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ScriptBreakdownTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ScriptBreakdownTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  const breakdownData = preProductionData.scriptBreakdown
  const analysisData = (preProductionData as any).scriptAnalysis as ScriptAnalysisData | undefined
  const scriptsData = (preProductionData as any).scripts

  const handleGenerateBreakdown = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('📋 Generating script breakdown...')

      // 1. Check if Scripts tab has data
      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first in the Scripts tab')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script data found')
      console.log('  Title:', scriptsData.fullScript.title)
      console.log('  Scenes:', scriptsData.fullScript.metadata?.sceneCount)

      // 2. Fetch story bible (client-side with auth)
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
      
      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 3. Call API with script data
      console.log('🤖 Calling breakdown generation API...')
      const response = await fetch('/api/generate/script-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate breakdown')
      }

      const result = await response.json()
      
      console.log('✅ Breakdown generated successfully!')
      console.log('  Scenes:', result.breakdown.scenes.length)
      console.log('  Budget:', `$${result.breakdown.totalBudgetImpact}`)

      // 4. Save to Firestore (client-side with proper auth)
      console.log('💾 Saving breakdown to Firestore...')
      await onUpdate('scriptBreakdown', result.breakdown)
      
      console.log('✅ Breakdown saved! Data will auto-update via subscription')

    } catch (error: any) {
      console.error('❌ Error generating breakdown:', error)
      setGenerationError(error.message || 'Failed to generate breakdown. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

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

  const handleGenerateBoth = async () => {
    setViewMode('breakdown')
    await handleGenerateBreakdown()
    await handleGenerateAnalysis()
  }

  // If no data, show generate prompt
  if (!breakdownData) {
    // Check if script exists
    const hasScript = scriptsData?.fullScript

    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Script Breakdown Not Generated
        </h2>
        
        {!hasScript ? (
          <>
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Script breakdown analyzes your screenplay scene-by-scene to identify all production elements.
            </p>
            <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
              Please generate a script first in the Scripts tab, then come back here to create the breakdown.
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
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Analyze your screenplay and generate a micro-budget production breakdown with cast, props, locations, and budget estimates.
            </p>
            <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
              Target budget: $1,000 - $20,000 per episode. Scene-by-scene analysis with realistic cost estimates for indie production.
            </p>
            
            {generationError && (
              <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-400 text-sm">{generationError}</p>
              </div>
            )}
            
            <button 
              onClick={handleGenerateBreakdown}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analyzing Screenplay...
                </span>
              ) : (
                '✨ Generate Script Breakdown'
              )}
            </button>
          </>
        )}
      </div>
    )
  }

  const handleSceneUpdate = async (sceneIndex: number, field: string, value: any) => {
    const updatedScenes = [...breakdownData.scenes]
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      [field]: value
    }

    await onUpdate('scriptBreakdown', {
      ...breakdownData,
      scenes: updatedScenes,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleAddComment = async (sceneIndex: number, commentContent: string) => {
    const scene = breakdownData.scenes[sceneIndex]
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: commentContent,
      timestamp: Date.now()
    }

    const updatedScenes = [...breakdownData.scenes]
    updatedScenes[sceneIndex] = {
      ...scene,
      comments: [...(scene.comments || []), newComment]
    }

    await onUpdate('scriptBreakdown', {
      ...breakdownData,
      scenes: updatedScenes,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleExportCSV = () => {
    const csvData = breakdownData.scenes.map(scene => ({
      'Scene #': scene.sceneNumber,
      'Scene Title': scene.sceneTitle,
      'Location': scene.location,
      'Time of Day': scene.timeOfDay,
      'Shoot Time (min)': scene.estimatedShootTime,
      'Characters': scene.characters.map(c => c.name).join(', '),
      'Props': scene.props.map(p => p.item).join(', '),
      'Budget Impact': `$${scene.budgetImpact}`,
      'Location Cost': scene.budgetDetails?.locationCost ?? 0,
      'Prop Cost': scene.budgetDetails?.propCost ?? 0,
      'Extras Cost': scene.budgetDetails?.extrasCost ?? 0,
      'Special Eq Cost': scene.budgetDetails?.specialEqCost ?? 0,
      'Contingency': scene.budgetDetails?.contingency ?? 0,
      'Savings Tips': (scene.budgetDetails?.savingsTips || []).join('; '),
      'Warnings': (scene.warnings || []).join('; '),
      'Status': scene.status,
      'Notes': scene.notes
    }))

    const csv = convertToCSV(csvData, Object.keys(csvData[0]))
    downloadCSV(csv, `script-breakdown-ep${breakdownData.episodeNumber}.csv`)
  }

  const handleExportAnalysisCSV = () => {
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

  // Table columns configuration - Concept 3: Simple Table View (matching design preview)
  const columns: TableColumn<ScriptBreakdownScene>[] = [
    {
      key: 'sceneNumber',
      label: 'Scene',
      width: '100px',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-[#e7e7e7]">{value}</span>
      )
    },
    {
      key: 'budgetImpact',
      label: 'Budget',
      width: '180px',
      render: (_value, scene) => {
        const details = scene.budgetDetails || {}
        return (
          <div className="text-sm text-[#e7e7e7]/80 space-y-1">
            <div className="font-semibold text-[#e7e7e7]">${scene.budgetImpact || 0}</div>
            <div className="text-[11px] text-[#e7e7e7]/60">
              L:{details.locationCost ?? 0} P:{details.propCost ?? 0} X:{details.extrasCost ?? 0} E:{details.specialEqCost ?? 0}
            </div>
            {(details.savingsTips?.length || 0) > 0 && (
              <div className="text-[11px] text-[#10B981] truncate">
                Tip: {details.savingsTips[0]}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'warnings',
      label: 'Warnings',
      width: '200px',
      render: (_value, scene) => (
        <div className="flex flex-wrap gap-1">
          {(scene.warnings || []).map((w, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-xs">
              {w}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'characters',
      label: 'Characters',
      width: 'auto',
      render: (characters: any[]) => (
        <div className="flex flex-wrap gap-1">
          {characters.map((char, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs"
            >
              {char.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'props',
      label: 'Props',
      width: '120px',
      render: (props: any[]) => (
        <span className="text-sm text-[#e7e7e7]/70">{props.length}</span>
      )
    },
    {
      key: 'location',
      label: 'Locations',
      width: '200px',
      render: (location) => (
        <span className="text-sm text-[#e7e7e7]/70">{location}</span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="🎬"
          label="Total Scenes"
          value={breakdownData.totalScenes}
        />
        <StatCard
          icon="⏱️"
          label="Est. Shoot Time"
          value={`${Math.round(breakdownData.totalEstimatedTime / 60)}h ${breakdownData.totalEstimatedTime % 60}m`}
        />
        <StatCard
          icon="💰"
          label="Total Budget Impact"
          value={`$${breakdownData.totalBudgetImpact}`}
          valueColor={breakdownData.totalBudgetImpact > 625 ? '#F59E0B' : '#10B981'}
        />
        <StatCard
          icon="⚠️"
          label="Warnings"
          value={`${(breakdownData.warnings || []).length + breakdownData.scenes.reduce((sum, s) => sum + (s.warnings?.length || 0), 0)}`}
          valueColor="#F59E0B"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-[#e7e7e7]">Script</h2>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerateBoth}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#10B981] text-black rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Both'}
          </button>
          <button
            onClick={handleGenerateBreakdown}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-lg hover:bg-[#10B981]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate Breakdown'}
          </button>
          <button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/30 rounded-lg hover:bg-[#6366F1]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate Analysis'}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            📊 Export Breakdown CSV
          </button>
          <button
            onClick={handleExportAnalysisCSV}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            📊 Export Analysis CSV
          </button>
        </div>
      </div>

      {(breakdownData.warnings && breakdownData.warnings.length > 0) && (
        <div className="px-4 py-3 bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] rounded-lg">
          <div className="font-semibold mb-1">Episode Warnings</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {breakdownData.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {analysisData?.synopsis && (
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#e7e7e7] mb-2">Episode Synopsis</h3>
            <p className="text-sm text-[#e7e7e7]/80 whitespace-pre-line">{analysisData.synopsis}</p>
          </div>
        )}
        {analysisData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.scenes.map((scene) => (
              <AnalysisCard key={scene.sceneNumber} scene={scene} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1a1a] border border-[#36393f] rounded-lg">
            <h3 className="text-xl font-semibold text-[#e7e7e7] mb-2">Script Analysis Not Generated</h3>
            <p className="text-[#e7e7e7]/70 mb-4">Generate analysis to see scene-by-scene insights.</p>
            <button
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#6366F1] text-black font-medium rounded-lg hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Analyzing...' : '✨ Generate Analysis'}
            </button>
          </div>
        )}
      </div>

      {/* Breakdown Table */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2a2a2a]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left p-3 text-sm font-bold text-[#e7e7e7]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {breakdownData.scenes.map((scene, idx) => (
              <tr
              key={scene.id}
                className="border-t border-[#36393f] hover:bg-[#2a2a2a]/50 transition-colors"
              >
                {columns.map((col) => {
                  const value = (scene as any)[col.key]
                  return (
                    <td key={col.key} className="p-3">
                      {col.render ? col.render(value, scene as any, idx) : String(value || '')}
                    </td>
                  )
                })}
              </tr>
          ))}
          </tbody>
        </table>
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

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  valueColor = '#10B981' 
}: { 
  icon: string
  label: string
  value: string | number
  valueColor?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="text-sm text-[#e7e7e7]/50">{label}</div>
          <div className="text-xl font-bold" style={{ color: valueColor }}>
            {value}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Scene Card Component (for card view)
function SceneCard({
  scene,
  onUpdate
}: {
  scene: ScriptBreakdownScene
  onUpdate: (field: string, value: any) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4 hover:border-[#10B981]/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl font-bold text-[#10B981]">#{scene.sceneNumber}</span>
          <h3 className="text-lg font-bold text-[#e7e7e7] mt-1">{scene.sceneTitle}</h3>
        </div>
        <StatusBadge status={scene.status} size="sm" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[#e7e7e7]/70">
          <span>📍</span>
          <span>{scene.location}</span>
          <span className="text-[#e7e7e7]/40">•</span>
          <span>{scene.timeOfDay}</span>
        </div>

        <div className="flex items-center gap-2 text-[#e7e7e7]/70">
          <span>⏱️</span>
          <span>{scene.estimatedShootTime} min</span>
          <span className="text-[#e7e7e7]/40">•</span>
          <span>${scene.budgetImpact}</span>
        </div>

        {scene.characters.length > 0 && (
          <div className="pt-2 border-t border-[#36393f]">
            <div className="text-[#e7e7e7]/50 mb-1">Characters:</div>
            <div className="flex flex-wrap gap-1">
              {scene.characters.map((char, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-[#2a2a2a] text-[#e7e7e7] text-xs rounded"
                >
                  {char.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {scene.props.length > 0 && (
          <div className="pt-2 border-t border-[#36393f]">
            <div className="text-[#e7e7e7]/50 mb-1">Props: {scene.props.length}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

