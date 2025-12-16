'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ArcPreProductionData, ArcPropsWardrobeData, BudgetLineItem, BudgetTrackerData, PropItem } from '@/types/preproduction'
import type { Questionnaire } from '@/services/ai-generators/questionnaire-generator'
import { QuestionnaireModal } from '../shared/QuestionnaireModal'

interface SeriesPropsWardrobeTabProps {
  arcPreProdData: ArcPreProductionData
  episodePreProdData: Record<number, any>
  storyBible: any
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
  autoOpenQuestionnaire?: boolean
  onAutoOpenHandled?: () => void
}

type Category = 'props' | 'wardrobe'

type SeriesPropsUsage = {
  itemId: string
  itemName: string
  category: 'prop' | 'wardrobe'
  episodesUsed: Array<{
    episodeNumber: number
    sceneNumbers: number[]
    quantity?: number
  }>
  totalUsage: number
  totalEpisodes: number
}

export function SeriesPropsWardrobeTab({
  arcPreProdData,
  episodePreProdData,
  storyBible,
  onUpdate,
  currentUserId,
  currentUserName,
  autoOpenQuestionnaire,
  onAutoOpenHandled
}: SeriesPropsWardrobeTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('props')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({})
  const hasAutoOpenedRef = useRef(false)

  const arcPropsData: ArcPropsWardrobeData =
    arcPreProdData.propsWardrobe || {
      arcTitle: arcPreProdData.arcTitle || `Arc ${(arcPreProdData.arcIndex || 0) + 1}`,
      arcIndex: arcPreProdData.arcIndex || 0,
      episodeNumbers: arcPreProdData.episodeNumbers || [],
      totalItems: 0,
      obtainedItems: 0,
      totalCost: 0,
      props: [],
      wardrobe: [],
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    }

  useEffect(() => {
    if (arcPropsData.questionnaireAnswers) {
      setQuestionnaireAnswers(arcPropsData.questionnaireAnswers)
    }
  }, [arcPropsData.questionnaireAnswers])

  // Auto-open questionnaire after auto-generation overlay completes
  useEffect(() => {
    if (autoOpenQuestionnaire && !hasAutoOpenedRef.current && !isGenerating) {
      hasAutoOpenedRef.current = true
      handleGenerateQuestionnaire()
      onAutoOpenHandled?.()
    }
  }, [autoOpenQuestionnaire, isGenerating, onAutoOpenHandled])

  const items = selectedCategory === 'props' ? arcPropsData.props : arcPropsData.wardrobe
  const filteredItems =
    selectedStatus === 'all'
      ? items
      : items.filter(item => item.procurementStatus === selectedStatus)

  const totalCost = (arcPropsData.props || []).concat(arcPropsData.wardrobe || []).reduce((sum, item) => sum + (item.estimatedCost || 0), 0)

  const aggregatedEpisodeUsage = useMemo(() => {
    const itemMap = new Map<string, SeriesPropsUsage>()
    
    Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
      const epNum = parseInt(epNumStr)
      const propsWardrobe = epPreProd.propsWardrobe
      if (!propsWardrobe) return
      
      const allItems = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
      allItems.forEach((item: any) => {
        const itemId = item.id || `${item.name}_${epNum}`
        if (!itemMap.has(itemId)) {
          itemMap.set(itemId, {
            itemId,
            itemName: item.name || item.description || 'Unnamed Item',
            category: item.type === 'wardrobe' ? 'wardrobe' : 'prop',
            episodesUsed: [],
            totalUsage: 0,
            totalEpisodes: 0
          })
        }
        const current = itemMap.get(itemId)!
        const sceneNumbers = item.scenes || []
        current.episodesUsed.push({
          episodeNumber: epNum,
          sceneNumbers: Array.isArray(sceneNumbers) ? sceneNumbers : [sceneNumbers].filter(Boolean),
          quantity: item.quantity || 1
        })
        current.totalUsage += Array.isArray(sceneNumbers) ? sceneNumbers.length : (sceneNumbers ? 1 : 0)
      })
    })
    
    const itemsArray = Array.from(itemMap.values())
    itemsArray.forEach(item => {
      item.totalEpisodes = item.episodesUsed.length
    })
    return itemsArray.sort((a, b) => b.totalEpisodes - a.totalEpisodes)
  }, [episodePreProdData])

  const hasArcGeneratedData = (arcPropsData.props?.length || 0) > 0 || (arcPropsData.wardrobe?.length || 0) > 0

  // Show missing banner only if arc has no generated data AND episodes lack breakdowns (source data)
  const missingEpisodes = useMemo(() => {
    if (hasArcGeneratedData) return []
    const status: number[] = []
    Object.entries(episodePreProdData).forEach(([epNumStr, epPreProd]) => {
      const breakdownScenes = epPreProd?.scriptBreakdown?.scenes
      const hasBreakdown = Array.isArray(breakdownScenes) && breakdownScenes.length > 0
      if (!hasBreakdown) {
        status.push(parseInt(epNumStr))
      }
    })
    return status
  }, [episodePreProdData, hasArcGeneratedData])

  const handleSave = async (data: ArcPropsWardrobeData) => {
    await onUpdate('propsWardrobe', {
      ...data,
      questionnaireAnswers
    })
  }

  const handleGenerateQuestionnaire = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      const response = await fetch('/api/generate/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: arcPreProdData.id,
          arcPreProductionId: arcPreProdData.id,
          storyBibleId: arcPreProdData.storyBibleId,
          episodeNumbers: arcPreProdData.episodeNumbers,
          episodePreProdData,
          userId: currentUserId,
          storyBibleData: storyBible,
          castingData: arcPreProdData.casting,
          questionnaireType: 'both'
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.details || err.error || 'Failed to generate questionnaire')
      }

      const result = await response.json()
      setQuestionnaire(result.questionnaire)
      setShowQuestionnaire(true)
    } catch (error: any) {
      setGenerationError(error.message || 'Failed to generate questionnaire')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePropsWardrobe = async (answers?: Record<string, any>) => {
    setIsGenerating(true)
    setGenerationError(null)
    try {
      const combinedAnswers = answers || questionnaireAnswers || {}
      const response = await fetch('/api/generate/arc-props-wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arcPreProductionId: arcPreProdData.id,
          storyBibleId: arcPreProdData.storyBibleId,
          episodeNumbers: arcPreProdData.episodeNumbers,
          episodePreProdData,
          userId: currentUserId,
          storyBibleData: storyBible,
          questionnaireAnswers: combinedAnswers,
          arcIndex: arcPreProdData.arcIndex,
          arcTitle: arcPreProdData.arcTitle
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.details || err.error || 'Failed to generate props/wardrobe')
      }

      const result = await response.json()
      const newData: ArcPropsWardrobeData = {
        ...(result.propsWardrobe as ArcPropsWardrobeData),
        questionnaireAnswers: combinedAnswers,
        lastUpdated: Date.now(),
        updatedBy: currentUserId
      }
      setQuestionnaireAnswers(combinedAnswers)
      await handleSave(newData)
      await syncBudgetFromPropsWardrobe(newData)
    } catch (error: any) {
      setGenerationError(error.message || 'Failed to generate props/wardrobe')
    } finally {
      setIsGenerating(false)
    }
  }

  const syncBudgetFromPropsWardrobe = async (data: ArcPropsWardrobeData) => {
    try {
      const existingBudget = (arcPreProdData as any).budget as BudgetTrackerData | undefined
      const now = Date.now()
      const defaultTargetBudget = existingBudget?.targetBudget ?? 0
      const defaultTotalActual = existingBudget?.totalActual ?? 0
      const defaultContingency = existingBudget?.contingencyPercentage ?? 15
      const defaultCategories = existingBudget?.categories || []

      const baseBudget: BudgetTrackerData = existingBudget
        ? { ...existingBudget }
        : {
            episodeNumber: 0,
            episodeTitle: data.arcTitle,
            targetBudget: defaultTargetBudget,
            totalEstimated: 0,
            totalActual: defaultTotalActual,
            contingencyPercentage: defaultContingency,
            categories: defaultCategories,
            lastUpdated: now,
            updatedBy: currentUserId
          }

      const categories = [...(baseBudget.categories || [])]
      const categoryIdx = categories.findIndex(c => c.category === 'props-wardrobe')
      const lineId = 'props-wardrobe-arc'
      const lineItem: BudgetLineItem = {
        id: lineId,
        category: 'props-wardrobe',
        item: 'Arc Props & Wardrobe',
        description: 'Auto-generated from arc props/wardrobe',
        estimatedCost: data.totalCost || 0,
        actualCost: undefined,
        status: 'estimated',
        vendor: '',
        notes: '',
        comments: []
      }

      if (categoryIdx >= 0) {
        const items = categories[categoryIdx].items || []
        const existingIdx = items.findIndex(i => i.id === lineId)
        const newItems = [...items]
        if (existingIdx >= 0) {
          newItems[existingIdx] = { ...newItems[existingIdx], ...lineItem }
        } else {
          newItems.push(lineItem)
        }
        const totalEstimated = newItems.reduce((sum, i) => sum + (i.estimatedCost || 0), 0)
        const totalActual = newItems.reduce((sum, i) => sum + (i.actualCost || 0), 0)
        categories[categoryIdx] = { ...categories[categoryIdx], items: newItems, totalEstimated, totalActual }
      } else {
        categories.push({
          category: 'props-wardrobe',
          totalEstimated: lineItem.estimatedCost,
          totalActual: lineItem.actualCost || 0,
          items: [lineItem]
        })
      }

      const totalEstimated = categories.reduce((sum, c) => sum + (c.totalEstimated || 0), 0)
      const totalActual = categories.reduce((sum, c) => sum + (c.totalActual || 0), 0)

      const budgetData: BudgetTrackerData = {
        ...baseBudget,
        categories,
        totalEstimated,
        totalActual,
        lastUpdated: now,
        updatedBy: currentUserId
      }

      await onUpdate('budget', budgetData)
    } catch (error) {
      console.error('Failed to sync budget from props/wardrobe:', error)
    }
  }

  const handleUpdateItem = (id: string, updates: Partial<PropItem>) => {
    const updateList = (list: PropItem[]) =>
      list.map(item => (item.id === id ? { ...item, ...updates } : item))

    const updatedData: ArcPropsWardrobeData = {
      ...arcPropsData,
      props: updateList(arcPropsData.props || []),
      wardrobe: updateList(arcPropsData.wardrobe || []),
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    }
    handleSave(updatedData)
  }

  const handleAddItem = (category: Category) => {
    const newItem: PropItem = {
      id: `${category}_${Date.now()}`,
      type: category === 'props' ? 'prop' : 'wardrobe',
      name: 'New Item',
      description: '',
      scenes: [],
      importance: 'secondary',
      source: 'buy',
      estimatedCost: 0,
      procurementStatus: 'needed',
      referencePhotos: [],
      notes: '',
      comments: []
    }

    const updatedData: ArcPropsWardrobeData = {
      ...arcPropsData,
      props: category === 'props' ? [...(arcPropsData.props || []), newItem] : arcPropsData.props || [],
      wardrobe: category === 'wardrobe' ? [...(arcPropsData.wardrobe || []), newItem] : arcPropsData.wardrobe || [],
      totalItems: (arcPropsData.totalItems || 0) + 1,
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    }
    handleSave(updatedData)
  }

  const handleDeleteItem = (id: string) => {
    const remove = (list: PropItem[]) => list.filter(item => item.id !== id)
    const updatedData: ArcPropsWardrobeData = {
      ...arcPropsData,
      props: remove(arcPropsData.props || []),
      wardrobe: remove(arcPropsData.wardrobe || []),
      totalItems: Math.max(0, (arcPropsData.totalItems || 0) - 1),
      lastUpdated: Date.now(),
      updatedBy: currentUserId
    }
    handleSave(updatedData)
  }

  return (
    <div className="space-y-6">
      <QuestionnaireModal
        questionnaire={questionnaire}
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        existingAnswers={questionnaireAnswers}
        onComplete={(answers) => {
          setQuestionnaireAnswers(answers)
          handleGeneratePropsWardrobe(answers)
        }}
      />

      {generationError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg p-3">
          {generationError}
        </div>
      )}

      {/* Banner for missing episodes */}
      {missingEpisodes.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-400 mb-1">Missing Props/Wardrobe Data</h3>
              <p className="text-sm text-[#e7e7e7]/70 mb-2">
                Some episodes have not generated props or wardrobe yet.
              </p>
              <div className="flex flex-wrap gap-2">
                {missingEpisodes.map(epNum => (
                  <span
                    key={epNum}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-medium border border-yellow-500/40"
                  >
                    Episode {epNum}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header + Actions */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#252628] border border-[#36393f] rounded-xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#e7e7e7] mb-1">Arc Props & Wardrobe</h2>
        <p className="text-[#e7e7e7]/70">
              Arc: {arcPropsData.arcTitle} • Episodes: {arcPropsData.episodeNumbers.length}
        </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateQuestionnaire}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg border border-[#36393f] hover:bg-[#34363a] transition"
            >
              {isGenerating ? 'Generating...' : 'Questionnaire'}
            </button>
            <button
              onClick={() => handleGeneratePropsWardrobe()}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#10B981] text-black rounded-lg hover:bg-[#0ea372] transition font-semibold"
            >
              {isGenerating ? 'Working...' : 'Generate Props/Wardrobe'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Items" value={arcPropsData.totalItems || 0} />
          <StatCard label="Props" value={arcPropsData.props?.length || 0} />
          <StatCard label="Wardrobe" value={arcPropsData.wardrobe?.length || 0} />
          <StatCard label="Est. Cost" value={`$${totalCost.toFixed(0)}`} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-[#1f1f23] border border-[#36393f] rounded-lg p-1 flex">
          {(['props', 'wardrobe'] as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                selectedCategory === cat ? 'bg-[#10B981] text-black' : 'text-[#e7e7e7] hover:bg-[#2a2d33]'
              }`}
            >
              {cat === 'props' ? 'Props' : 'Wardrobe'}
            </button>
          ))}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-[#1f1f23] border border-[#36393f] rounded-lg text-sm text-[#e7e7e7]"
        >
          <option value="all">All statuses</option>
          <option value="needed">Needed</option>
          <option value="sourced">Sourced</option>
          <option value="obtained">Obtained</option>
          <option value="packed">Packed</option>
        </select>

        <button
          onClick={() => handleAddItem(selectedCategory)}
          className="px-3 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg border border-[#36393f] hover:bg-[#34363a] text-sm"
        >
          + Add {selectedCategory === 'props' ? 'Prop' : 'Wardrobe'}
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filteredItems.length === 0 && (
          <div className="bg-[#1f1f23] border border-[#36393f] rounded-lg p-6 text-center text-[#e7e7e7]/70">
            No {selectedCategory} items yet. Generate or add manually.
        </div>
      )}

        {filteredItems.map(item => (
    <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
            className="bg-[#1f1f23] border border-[#36393f] rounded-lg p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-2">
                <input
                  className="w-full bg-transparent border border-[#36393f] rounded-lg px-3 py-2 text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                />
                <textarea
                  className="w-full bg-transparent border border-[#36393f] rounded-lg px-3 py-2 text-sm text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  value={item.description || ''}
                  onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                  placeholder="Description / notes"
                />
                <div className="flex flex-wrap gap-2 text-xs text-[#e7e7e7]/70">
                  <Tag label={`Scenes: ${item.scenes?.length ? item.scenes.join(', ') : 'n/a'}`} />
                  <Tag label={`Importance: ${item.importance}`} />
                  <Tag label={`Source: ${item.source}`} />
                  <Tag label={`Est. $${item.estimatedCost || 0}`} />
                </div>
          </div>
              <div className="flex flex-col gap-2 w-full md:w-56">
                <select
                  value={item.procurementStatus}
                  onChange={(e) => handleUpdateItem(item.id, { procurementStatus: e.target.value as any })}
                  className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg px-3 py-2 text-sm text-[#e7e7e7]"
                >
                  <option value="needed">Needed</option>
                  <option value="sourced">Sourced</option>
                  <option value="obtained">Obtained</option>
                  <option value="packed">Packed</option>
                </select>
                <input
                  type="number"
                  value={item.estimatedCost || 0}
                  onChange={(e) => handleUpdateItem(item.id, { estimatedCost: Number(e.target.value) })}
                  className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg px-3 py-2 text-sm text-[#e7e7e7]"
                  placeholder="Est. cost"
                />
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="w-full px-3 py-2 bg-red-500/20 text-red-200 rounded-lg border border-red-500/40 text-sm hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
          </div>
        </div>
          </motion.div>
        ))}
      </div>

      {/* Aggregated Episode Usage (reference) */}
      <div className="bg-[#1f1f23] border border-[#36393f] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span>📊</span>
          <h3 className="text-lg font-bold text-[#e7e7e7]">Episode Usage (reference)</h3>
        </div>
        {aggregatedEpisodeUsage.length === 0 && (
          <div className="text-sm text-[#e7e7e7]/70">No episode-level items found yet.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aggregatedEpisodeUsage.map(item => (
            <div key={item.itemId} className="bg-[#24272d] border border-[#36393f] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-[#e7e7e7]">{item.itemName}</span>
                <Tag label={item.category === 'prop' ? 'Prop' : 'Wardrobe'} />
              </div>
              <div className="text-xs text-[#e7e7e7]/70 mb-2">
                Used in {item.totalEpisodes} episode{item.totalEpisodes !== 1 ? 's' : ''} • {item.totalUsage} total scene uses
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#e7e7e7]/70">
                {item.episodesUsed.map((usage: { episodeNumber: number; sceneNumbers: number[]; quantity?: number }, idx: number) => (
                  <Tag key={idx} label={`Ep ${usage.episodeNumber}: scenes ${usage.sceneNumbers.join(', ') || 'n/a'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
          </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#1a1a1a]/50 rounded-lg px-4 py-3 border border-[#36393f]">
      <div className="text-xs text-[#e7e7e7]/50 mb-1">{label}</div>
      <div className="text-xl font-bold text-[#10B981]">{value}</div>
        </div>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 bg-[#2f3238] border border-[#3a3d44] rounded text-xs text-[#e7e7e7]/80">
      {label}
    </span>
  )
}

