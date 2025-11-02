'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { PreProductionData, ScriptBreakdownData, ScriptBreakdownScene } from '@/types/preproduction'
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  
  const breakdownData = preProductionData.scriptBreakdown
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
              className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      'Status': scene.status,
      'Notes': scene.notes
    }))

    const csv = convertToCSV(csvData, Object.keys(csvData[0]))
    downloadCSV(csv, `script-breakdown-ep${breakdownData.episodeNumber}.csv`)
  }

  // Table columns configuration
  const columns: TableColumn<ScriptBreakdownScene>[] = [
    {
      key: 'sceneNumber',
      label: 'Scene #',
      width: '80px',
      sortable: true,
      render: (value) => (
        <span className="font-bold text-[#00FF99]">#{value}</span>
      )
    },
    {
      key: 'sceneTitle',
      label: 'Scene Title',
      width: '200px',
      editable: true,
      type: 'text',
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'sceneTitle', newValue)
      }
    },
    {
      key: 'location',
      label: 'Location',
      width: '150px',
      sortable: true,
      filterable: true,
      editable: true,
      type: 'text',
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'location', newValue)
      }
    },
    {
      key: 'timeOfDay',
      label: 'Time',
      width: '120px',
      editable: true,
      type: 'select',
      options: [
        { value: 'DAY', label: '☀️ Day' },
        { value: 'NIGHT', label: '🌙 Night' },
        { value: 'SUNRISE', label: '🌅 Sunrise' },
        { value: 'SUNSET', label: '🌇 Sunset' },
        { value: 'MAGIC_HOUR', label: '✨ Magic Hour' }
      ],
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'timeOfDay', newValue)
      }
    },
    {
      key: 'estimatedShootTime',
      label: 'Shoot Time',
      width: '120px',
      sortable: true,
      editable: true,
      type: 'number',
      render: (value) => `${value} min`,
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'estimatedShootTime', newValue)
      }
    },
    {
      key: 'characters',
      label: 'Characters',
      width: '180px',
      render: (characters: any[]) => (
        <div className="space-y-1">
          {characters.slice(0, 3).map((char, idx) => (
            <div key={idx} className="text-xs">
              <span className="font-medium">{char.name}</span>
              <span className="text-[#e7e7e7]/50"> ({char.lineCount} lines)</span>
            </div>
          ))}
          {characters.length > 3 && (
            <div className="text-xs text-[#00FF99]">
              +{characters.length - 3} more
            </div>
          )}
        </div>
      )
    },
    {
      key: 'props',
      label: 'Props',
      width: '150px',
      render: (props: any[]) => (
        <div className="text-xs text-[#e7e7e7]/70">
          {props.length > 0 ? (
            <>
              {props.slice(0, 2).map((prop, idx) => (
                <div key={idx}>{prop.item}</div>
              ))}
              {props.length > 2 && (
                <div className="text-[#00FF99]">+{props.length - 2} more</div>
              )}
            </>
          ) : (
            <span className="text-[#e7e7e7]/40">None</span>
          )}
        </div>
      )
    },
    {
      key: 'budgetImpact',
      label: 'Budget',
      width: '100px',
      sortable: true,
      editable: true,
      type: 'number',
      render: (value) => (
        <span className={value > 500 ? 'text-[#F59E0B]' : 'text-[#00FF99]'}>
          ${value}
        </span>
      ),
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'budgetImpact', newValue)
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      type: 'status',
      editable: true,
      statusOptions: ['not-started', 'in-progress', 'completed', 'blocked'],
      onEdit: async (rowIndex, newValue) => {
        await handleSceneUpdate(rowIndex, 'status', newValue)
      }
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
          valueColor={breakdownData.totalBudgetImpact > 5000 ? '#F59E0B' : '#00FF99'}
        />
        <StatCard
          icon="✓"
          label="Completed Scenes"
          value={`${breakdownData.scenes.filter(s => s.status === 'completed').length}/${breakdownData.totalScenes}`}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#e7e7e7]">Scene Breakdown</h2>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerateBreakdown}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30 rounded-lg hover:bg-[#00FF99]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
          >
            📊 Export CSV
          </button>
          
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-[#00FF99] text-black' 
                  : 'text-[#e7e7e7] hover:bg-[#36393f]'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-[#00FF99] text-black' 
                  : 'text-[#e7e7e7] hover:bg-[#36393f]'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <TableView
          columns={columns}
          data={breakdownData.scenes}
          keyField="id"
          showSearch={true}
          showPagination={true}
          pageSize={20}
          striped={true}
          hoverable={true}
          enableComments={true}
          onAddComment={handleAddComment}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdownData.scenes.map((scene, idx) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onUpdate={(field, value) => handleSceneUpdate(idx, field, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  valueColor = '#00FF99' 
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
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4 hover:border-[#00FF99]/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl font-bold text-[#00FF99]">#{scene.sceneNumber}</span>
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

