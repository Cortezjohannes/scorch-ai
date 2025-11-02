'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { PreProductionData, ShotListData, Shot, ShotListScene } from '@/types/preproduction'
import { StatusBadge } from '../shared/StatusBadge'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { EditableField } from '../shared/EditableField'
import { getStoryBible } from '@/services/story-bible-service'

interface ShotListTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function ShotListTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: ShotListTabProps) {
  const router = useRouter()
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set([0]))
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const shotListData = preProductionData.shotList

  const breakdownData = preProductionData.scriptBreakdown
  const scriptsData = (preProductionData as any).scripts
  const storyboardsData = preProductionData.storyboards

  const handleGenerateShotList = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('🎬 Generating shot list...')

      // 1. Check prerequisites
      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first. Go to Script Breakdown tab and generate a breakdown.')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')
      console.log('  Total scenes:', breakdownData.scenes?.length || 0)

      if (!breakdownData.scenes || breakdownData.scenes.length === 0) {
        setGenerationError('Script breakdown has no scenes. Please regenerate script breakdown.')
        setIsGenerating(false)
        return
      }

      // Script data is required
      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate script first. Go to Scripts tab and generate a script.')
        setIsGenerating(false)
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=scripts')
        return
      }
      console.log('✅ Script data found')

      // Storyboards are optional but helpful
      if (storyboardsData && storyboardsData.scenes && storyboardsData.scenes.length > 0) {
        console.log('✅ Storyboards found - will use as reference')
      } else {
        console.log('⚠️ No storyboards found - will generate directly from script')
      }

      // 2. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 3. Call generation API
      console.log('🤖 Calling shot list generation API...')
      const response = await fetch('/api/generate/shot-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preProductionId: preProductionData.id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          breakdownData,
          scriptData: scriptsData.fullScript,
          storyBibleData: storyBible,
          storyboardsData: storyboardsData || null
        })
      })

      if (!response.ok) {
        let errorMessage = 'Generation failed'
        try {
          const text = await response.text()
          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.details || errorData.error || errorMessage
            } catch {
              errorMessage = text || `Server error: ${response.status} ${response.statusText}`
            }
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Empty response from server')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.error('Failed to parse JSON response:', text.substring(0, 500))
        throw new Error(`Invalid response format: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }

      console.log('✅ Shot list generated:', result.shotList.totalShots, 'shots')

      await onUpdate('shotList', {
        ...result.shotList,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      })

      console.log('✅ Shot list saved to Firestore')
    } catch (error: any) {
      console.error('❌ Error generating shot list:', error)
      setGenerationError(error.message || 'Failed to generate shot list')
      
      if (error.message?.includes('breakdown') || error.message?.includes('Script breakdown')) {
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=breakdown')
      } else if (error.message?.includes('script') || error.message?.includes('Script')) {
        router.push('/preproduction?storyBibleId=' + preProductionData.storyBibleId + '&episodeNumber=' + preProductionData.episodeNumber + '&episodeTitle=' + encodeURIComponent(preProductionData.episodeTitle || '') + '&tab=scripts')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // If no data, show initialize prompt
  if (!shotListData) {
    const hasBreakdown = breakdownData && breakdownData.scenes && breakdownData.scenes.length > 0
    const hasScript = scriptsData?.fullScript

    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">🎬</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Shot List Not Generated
        </h2>
        <p className="text-[#e7e7e7]/70 mb-6 max-w-md mx-auto">
          Generate a shot list to plan every camera setup and maximize on-set efficiency.
        </p>
        
        {!hasBreakdown && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please generate script breakdown first
            </p>
          </div>
        )}
        
        {!hasScript && hasBreakdown && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please generate script first
            </p>
          </div>
        )}

        <button
          onClick={handleGenerateShotList}
          disabled={isGenerating || !hasBreakdown || !hasScript}
          className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🔄 Generating...' : '✨ Generate Shot List'}
        </button>

        {generationError && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg max-w-md mx-auto">
            <p className="text-red-400 text-sm">{generationError}</p>
          </div>
        )}
      </div>
    )
  }

  const toggleScene = (sceneNumber: number) => {
    const newExpanded = new Set(expandedScenes)
    if (newExpanded.has(sceneNumber)) {
      newExpanded.delete(sceneNumber)
    } else {
      newExpanded.add(sceneNumber)
    }
    setExpandedScenes(newExpanded)
  }

  const expandAll = () => {
    setExpandedScenes(new Set(shotListData.scenes.map(s => s.sceneNumber)))
  }

  const collapseAll = () => {
    setExpandedScenes(new Set())
  }

  const handleShotUpdate = async (sceneIndex: number, shotIndex: number, field: string, value: any) => {
    const updatedScenes = [...shotListData.scenes]
    const updatedShots = [...updatedScenes[sceneIndex].shots]
    updatedShots[shotIndex] = {
      ...updatedShots[shotIndex],
      [field]: value
    }
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      shots: updatedShots,
      completedShots: updatedShots.filter(s => s.status === 'got-it').length
    }

    await onUpdate('shotList', {
      ...shotListData,
      scenes: updatedScenes,
      completedShots: updatedScenes.reduce((sum, scene) => sum + scene.completedShots, 0),
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  const handleAddComment = async (sceneIndex: number, shotIndex: number, commentContent: string) => {
    const shot = shotListData.scenes[sceneIndex].shots[shotIndex]
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: commentContent,
      timestamp: Date.now()
    }

    const updatedScenes = [...shotListData.scenes]
    const updatedShots = [...updatedScenes[sceneIndex].shots]
    updatedShots[shotIndex] = {
      ...shot,
      comments: [...(shot.comments || []), newComment]
    }
    updatedScenes[sceneIndex] = {
      ...updatedScenes[sceneIndex],
      shots: updatedShots
    }

    await onUpdate('shotList', {
      ...shotListData,
      scenes: updatedScenes,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    })
  }

  // Filter shots by status
  const filteredScenes = shotListData.scenes.map(scene => ({
    ...scene,
    shots: filterStatus === 'all' 
      ? scene.shots 
      : scene.shots.filter(shot => shot.status === filterStatus)
  })).filter(scene => scene.shots.length > 0)

  const completionPercent = (shotListData.completedShots / shotListData.totalShots) * 100

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ShotListStatCard
          icon="🎬"
          label="Total Shots"
          value={shotListData.totalShots}
          subtitle={`${shotListData.scenes.length} scenes`}
        />
        <ShotListStatCard
          icon="✓"
          label="Completed"
          value={shotListData.completedShots}
          subtitle={`${completionPercent.toFixed(0)}% done`}
          color="#00FF99"
        />
        <ShotListStatCard
          icon="📋"
          label="Remaining"
          value={shotListData.totalShots - shotListData.completedShots}
          subtitle="Shots to capture"
          color="#60A5FA"
        />
        <ShotListStatCard
          icon="⏱️"
          label="Avg Duration"
          value={`${calculateAverageDuration(shotListData)}s`}
          subtitle="Per shot"
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-[#e7e7e7]">Shot Progress</h3>
          <span className="text-2xl font-bold text-[#00FF99]">
            {completionPercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-6 bg-[#2a2a2a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#00FF99] rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-[#e7e7e7]/50">
          <span>0 shots</span>
          <span>{shotListData.totalShots} shots</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#e7e7e7]">
            Production Shot List
          </h2>
          <span className="text-sm text-[#e7e7e7]/50">
            {shotListData.totalShots} shots across {shotListData.scenes.length} scenes
          </span>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm focus:outline-none focus:border-[#00FF99]"
          >
            <option value="all">All Shots</option>
            <option value="planned">Planned</option>
            <option value="got-it">Got It</option>
            <option value="need-pickup">Need Pickup</option>
            <option value="cut">Cut</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateShotList}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? '🔄 Generating...' : '🔄 Regenerate'}
          </button>
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm"
          >
            Collapse All
          </button>
        </div>
      </div>

      {generationError && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400 text-sm">{generationError}</p>
        </div>
      )}

      {/* Shot List */}
      <div className="space-y-4">
        {filteredScenes.map((scene, sceneIdx) => {
          const actualSceneIndex = shotListData.scenes.findIndex(s => s.sceneNumber === scene.sceneNumber)
          const isExpanded = expandedScenes.has(scene.sceneNumber)
          
          return (
            <SceneSection
              key={scene.sceneNumber}
              scene={scene}
              isExpanded={isExpanded}
              onToggle={() => toggleScene(scene.sceneNumber)}
              onShotUpdate={(shotIndex, field, value) => 
                handleShotUpdate(actualSceneIndex, shotIndex, field, value)
              }
              onAddComment={(shotIndex, comment) => 
                handleAddComment(actualSceneIndex, shotIndex, comment)
              }
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          )
        })}
      </div>
    </div>
  )
}

// Helper Functions
function calculateAverageDuration(data: ShotListData): number {
  const totalDuration = data.scenes.reduce(
    (sum, scene) => sum + scene.shots.reduce((s, shot) => s + shot.durationEstimate, 0),
    0
  )
  return Math.round(totalDuration / data.totalShots)
}

// Shot List Stat Card
function ShotListStatCard({ 
  icon, 
  label, 
  value, 
  subtitle,
  color = '#e7e7e7'
}: { 
  icon: string
  label: string
  value: number | string
  subtitle?: string
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm text-[#e7e7e7]/50">{label}</div>
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-[#e7e7e7]/50 mt-1">
          {subtitle}
        </div>
      )}
    </motion.div>
  )
}

// Scene Section Component
function SceneSection({
  scene,
  isExpanded,
  onToggle,
  onShotUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  scene: ShotListScene
  isExpanded: boolean
  onToggle: () => void
  onShotUpdate: (shotIndex: number, field: string, value: any) => void
  onAddComment: (shotIndex: number, comment: string) => void
  currentUserId: string
  currentUserName: string
}) {
  const completionPercent = (scene.completedShots / scene.totalShots) * 100

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg overflow-hidden">
      {/* Scene Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a2a]/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-[#00FF99]">
            Scene {scene.sceneNumber}
          </div>
          <div>
            <div className="text-left text-lg font-medium text-[#e7e7e7]">
              {scene.sceneTitle}
            </div>
            <div className="text-left text-sm text-[#e7e7e7]/50">
              {scene.location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-[#e7e7e7]">
              {scene.completedShots} / {scene.totalShots} shots
            </div>
            <div className="text-xs text-[#00FF99]">
              {completionPercent.toFixed(0)}% complete
            </div>
          </div>
          <div className="text-2xl text-[#e7e7e7]/50">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </button>

      {/* Shots List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#36393f]"
          >
            <div className="p-4 space-y-3">
              {scene.shots.map((shot, idx) => (
                <ShotItem
                  key={shot.id}
                  shot={shot}
                  onUpdate={(field, value) => onShotUpdate(idx, field, value)}
                  onAddComment={(comment) => onAddComment(idx, comment)}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Shot Item Component
function ShotItem({
  shot,
  onUpdate,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  shot: Shot
  onUpdate: (field: string, value: any) => void
  onAddComment: (comment: string) => void
  currentUserId: string
  currentUserName: string
}) {
  const [isEditing, setIsEditing] = useState(false)

  const priorityColors = {
    'must-have': '#00FF99',
    'nice-to-have': '#60A5FA',
    'optional': '#9CA3AF'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-[#2a2a2a] border-l-4 rounded-lg p-4 ${
        shot.status === 'got-it' ? 'opacity-60' : ''
      }`}
      style={{ borderLeftColor: priorityColors[shot.priority] }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Shot Number & Description */}
        <div className="lg:col-span-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="text-xl font-bold text-[#00FF99]">
                {shot.shotNumber}
              </div>
              <div className="text-xs text-[#e7e7e7]/40 mt-1">
                {shot.durationEstimate}s
              </div>
            </div>
            <div className="flex-1">
              <EditableField
                value={shot.description}
                onSave={(value) => onUpdate('description', value)}
                type="textarea"
                rows={2}
                placeholder="Shot description..."
              />
            </div>
          </div>
        </div>

        {/* Camera Setup */}
        <div className="lg:col-span-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">📷</span>
              <select
                value={shot.cameraAngle}
                onChange={(e) => onUpdate('cameraAngle', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-xs focus:outline-none focus:border-[#00FF99]"
              >
                <option value="wide">Wide</option>
                <option value="medium">Medium</option>
                <option value="close-up">Close-up</option>
                <option value="extreme-close-up">Extreme Close-up</option>
                <option value="over-shoulder">Over Shoulder</option>
                <option value="pov">POV</option>
                <option value="dutch">Dutch Angle</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#e7e7e7]/50">🎥</span>
              <select
                value={shot.cameraMovement}
                onChange={(e) => onUpdate('cameraMovement', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-xs focus:outline-none focus:border-[#00FF99]"
              >
                <option value="static">Static</option>
                <option value="pan">Pan</option>
                <option value="tilt">Tilt</option>
                <option value="dolly">Dolly</option>
                <option value="tracking">Tracking</option>
                <option value="handheld">Handheld</option>
                <option value="steadicam">Steadicam</option>
                <option value="crane">Crane</option>
              </select>
            </div>
            {shot.lensRecommendation && (
              <div className="flex items-center gap-2">
                <span className="text-[#e7e7e7]/50">🔍</span>
                <EditableField
                  value={shot.lensRecommendation}
                  onSave={(value) => onUpdate('lensRecommendation', value)}
                  type="text"
                  placeholder="Lens..."
                  className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-xs"
                />
              </div>
            )}
            {shot.fpsCameraFrameRate && (
              <div className="flex items-center gap-2">
                <span className="text-[#e7e7e7]/50">⚡</span>
                <EditableField
                  value={shot.fpsCameraFrameRate.toString()}
                  onSave={(value) => onUpdate('fpsCameraFrameRate', parseInt(value) || undefined)}
                  type="text"
                  placeholder="FPS..."
                  className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-xs"
                />
                <span className="text-[#e7e7e7]/50 text-xs">fps</span>
              </div>
            )}
          </div>
        </div>

        {/* Priority & Status */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            <div className="text-xs text-[#e7e7e7]/50">Priority:</div>
            <select
              value={shot.priority}
              onChange={(e) => onUpdate('priority', e.target.value)}
              className="w-full px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-xs font-medium"
              style={{ color: priorityColors[shot.priority] }}
            >
              <option value="must-have">Must-Have</option>
              <option value="nice-to-have">Nice-to-Have</option>
              <option value="optional">Optional</option>
            </select>
            <StatusBadge 
              status={shot.status} 
              editable 
              onClick={() => {
                const statuses = ['planned', 'got-it', 'need-pickup', 'cut']
                const currentIndex = statuses.indexOf(shot.status)
                const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                onUpdate('status', nextStatus)
              }}
            />
          </div>
        </div>

        {/* Notes & Comments */}
        <div className="lg:col-span-3 flex items-start justify-between gap-2">
          {shot.notes && (
            <div className="flex-1 text-xs text-[#e7e7e7]/70 italic">
              "{shot.notes}"
            </div>
          )}
          <CollaborativeNotes
            comments={shot.comments || []}
            onAddComment={onAddComment}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>
    </motion.div>
  )
}

