'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { PreProductionData } from '@/types/preproduction'
import { getStoryBible } from '@/services/story-bible-service'
import type { BaseBudget, OptionalBudget, BudgetLineItem, BudgetAnalysis } from '@/services/ai-generators/budget-generator'

interface BudgetTrackerTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function BudgetTrackerTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: BudgetTrackerTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const budgetData = (preProductionData as any).budget
  const scriptsData = (preProductionData as any).scripts
  const breakdownData = preProductionData.scriptBreakdown

  const handleGenerateBudget = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('💰 Generating budget...')

      // 1. Check if Script Breakdown exists
      if (!breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')

      // 2. Check if Scripts exist
      if (!scriptsData?.fullScript) {
        setGenerationError('Please generate a script first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script data found')

      // 3. Fetch story bible
      console.log('📖 Fetching story bible...')
      const storyBible = await getStoryBible(preProductionData.storyBibleId, currentUserId)

      if (!storyBible) {
        throw new Error('Story bible not found')
      }

      console.log('✅ Story bible loaded:', storyBible.seriesTitle || storyBible.title)

      // 4. Call API
      console.log('🤖 Calling budget generation API...')
      const response = await fetch('/api/generate/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preProductionId: (preProductionData as any).id,
          storyBibleId: preProductionData.storyBibleId,
          episodeNumber: preProductionData.episodeNumber,
          userId: currentUserId,
          scriptData: scriptsData.fullScript,
          breakdownData: breakdownData,
          storyBibleData: storyBible
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate budget')
      }

      const result = await response.json()

      console.log('✅ Budget generated successfully!')
      console.log('  BASE:', `$${result.budget.baseBudget.total}`)
      console.log('  OPTIONAL total:', `$${result.budget.optionalBudget.total}`)

      // 5. Save to Firestore
      console.log('💾 Saving budget to Firestore...')
      await onUpdate('budget', result.budget)

      console.log('✅ Budget saved! Data will auto-update via subscription')

    } catch (error: any) {
      console.error('❌ Error generating budget:', error)
      setGenerationError(error.message || 'Failed to generate budget. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // No budget generated yet
  if (!budgetData || !budgetData.generated) {
    // Check prerequisites
    const hasBreakdown = !!breakdownData
    const hasScript = scriptsData?.fullScript

    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <span className="text-6xl">💰</span>
        </div>
        <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4">
          Budget Not Generated
        </h2>

        {!hasScript ? (
          <>
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Budget generation requires a screenplay and script breakdown.
            </p>
            <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
              Please generate a script first, then create a script breakdown, then come back here.
            </p>
            <button
              disabled
              className="px-6 py-3 bg-[#36393f] text-[#e7e7e7]/50 font-medium rounded-lg cursor-not-allowed"
            >
              Generate Script First
            </button>
          </>
        ) : !hasBreakdown ? (
          <>
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Budget generation requires a script breakdown.
            </p>
            <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
              Please generate a script breakdown first, then come back here to create the budget.
            </p>
            <button
              disabled
              className="px-6 py-3 bg-[#36393f] text-[#e7e7e7]/50 font-medium rounded-lg cursor-not-allowed"
            >
              Generate Script Breakdown First
            </button>
          </>
        ) : (
          <>
            <p className="text-[#e7e7e7]/70 mb-2 max-w-2xl mx-auto">
              Generate a comprehensive budget with BASE costs (from breakdown) and OPTIONAL items (AI-suggested).
            </p>
            <p className="text-[#e7e7e7]/50 text-sm mb-6 max-w-2xl mx-auto">
              Target: $30-$625/episode. AI will suggest crew, equipment, and post-production costs based on your script complexity.
            </p>

            {generationError && (
              <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-400 text-sm">{generationError}</p>
              </div>
            )}

            <button
              onClick={handleGenerateBudget}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Generating Budget...
                </span>
              ) : (
                '✨ Generate Budget'
              )}
            </button>
          </>
        )}
      </div>
    )
  }

  // Calculate current total (base + selected optional items) - must be BEFORE early returns
  const baseBudget: BaseBudget | undefined = budgetData?.baseBudget
  const optionalBudget: OptionalBudget | undefined = budgetData?.optionalBudget
  const budgetAnalysis: BudgetAnalysis | undefined = budgetData?.budgetAnalysis

  const selectedOptionalTotal = useMemo(() => {
    if (!optionalBudget) return 0
    const allItems = [
      ...optionalBudget.crew,
      ...optionalBudget.equipment,
      ...optionalBudget.miscellaneous
    ]
    return allItems
      .filter(item => item.included)
      .reduce((sum, item) => sum + item.suggestedCost, 0)
  }, [optionalBudget])

  // Procurement Delta (Props/Wardrobe buy/rent + Equipment rentals)
  const procurementDelta = useMemo(() => {
    let total = 0
    const propsWardrobe = (preProductionData as any).propsWardrobe
    if (propsWardrobe) {
      const items = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
      for (const it of items) {
        // Only count if this episode and requires purchase/rent
        const isBuy = it.source === 'buy' || it.source === 'purchase'
        const isRent = it.source === 'rent' || it.source === 'rental'
        if ((isBuy || isRent) && typeof it.estimatedCost === 'number') {
          total += it.estimatedCost
        }
      }
    }
    const equipment = (preProductionData as any).equipment
    if (equipment && Array.isArray(equipment.items)) {
      for (const it of equipment.items) {
        const isRent = it.ownership === 'rent' || it.ownership === 'renting'
        if (isRent && typeof it.cost === 'number') {
          total += it.cost
        }
      }
    }
    return total
  }, [preProductionData])

  const currentTotal = baseBudget ? baseBudget.total + selectedOptionalTotal + procurementDelta : 0

  // Budget status
  const getBudgetStatus = (total: number) => {
    if (total <= 300) return { color: '#00FF99', label: '🟢 Ultra-low budget', status: 'excellent' }
    if (total <= 500) return { color: '#FCD34D', label: '🟡 Moderate micro-budget', status: 'good' }
    if (total <= 625) return { color: '#FB923C', label: '🟠 Approaching max', status: 'warning' }
    return { color: '#EF4444', label: '🔴 Exceeds target ($625/ep)', status: 'over' }
  }

  const budgetStatus = getBudgetStatus(currentTotal)

  const handleToggleItem = async (itemId: string) => {
    // Find and toggle the item
    const updatedOptional = {
      ...optionalBudget,
      crew: optionalBudget.crew.map(item =>
        item.id === itemId ? { ...item, included: !item.included } : item
      ),
      equipment: optionalBudget.equipment.map(item =>
        item.id === itemId ? { ...item, included: !item.included } : item
      ),
      miscellaneous: optionalBudget.miscellaneous.map(item =>
        item.id === itemId ? { ...item, included: !item.included } : item
      )
    }

    // Recalculate total
    const allItems = [
      ...updatedOptional.crew,
      ...updatedOptional.equipment,
      ...updatedOptional.miscellaneous
    ]
    updatedOptional.total = allItems
      .filter(item => item.included)
      .reduce((sum, item) => sum + item.suggestedCost, 0)

    await onUpdate('budget', {
      ...budgetData,
      optionalBudget: updatedOptional,
      totalBudget: baseBudget.total + updatedOptional.total
    })
  }

  const handleEditCost = async (itemId: string, newCost: number) => {
    // Find and update the item
    const updatedOptional = {
      ...optionalBudget,
      crew: optionalBudget.crew.map(item =>
        item.id === itemId ? { ...item, suggestedCost: newCost } : item
      ),
      equipment: optionalBudget.equipment.map(item =>
        item.id === itemId ? { ...item, suggestedCost: newCost } : item
      ),
      miscellaneous: optionalBudget.miscellaneous.map(item =>
        item.id === itemId ? { ...item, suggestedCost: newCost } : item
      )
    }

    // Recalculate total
    const allItems = [
      ...updatedOptional.crew,
      ...updatedOptional.equipment,
      ...updatedOptional.miscellaneous
    ]
    updatedOptional.total = allItems
      .filter(item => item.included)
      .reduce((sum, item) => sum + item.suggestedCost, 0)

    await onUpdate('budget', {
      ...budgetData,
      optionalBudget: updatedOptional,
      totalBudget: baseBudget.total + updatedOptional.total
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Regenerate */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#e7e7e7]">Budget Tracker</h2>
        <button
          onClick={handleGenerateBudget}
          disabled={isGenerating}
          className="px-4 py-2 bg-[#00FF99]/10 text-[#00FF99] border border-[#00FF99]/30 rounded-lg hover:bg-[#00FF99]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate Budget'}
        </button>
      </div>

      {/* Total Budget Card */}
      <div
        className="bg-[#1a1a1a] border-2 rounded-lg p-6"
        style={{ borderColor: budgetStatus.color }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#e7e7e7]">TOTAL EPISODE BUDGET</h2>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: budgetStatus.color }}>
              ${currentTotal.toLocaleString()}
            </div>
            <div className="text-sm mt-1" style={{ color: budgetStatus.color }}>
              {budgetStatus.label}
            </div>
          </div>
        </div>
        <div className="text-sm text-[#e7e7e7]/50">
          Target: $30-$625/episode (series budget: $1k-$20k ÷ 32 episodes)
        </div>
        {procurementDelta > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-[#36393f] bg-[#121212] flex items-center justify-between">
            <div className="text-sm text-[#e7e7e7]/70">
              Procurement (Props/Wardrobe buys & rents + Equipment rentals)
            </div>
            <div className="text-lg font-semibold text-[#e7e7e7]">
              +${procurementDelta.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* BASE Budget Section */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#e7e7e7]">BASE Budget (from Script Breakdown)</h3>
          <div className="text-2xl font-bold text-[#00FF99]">
            ${baseBudget.total.toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <BudgetLineDisplay label="Extras" amount={baseBudget.extras} />
          <BudgetLineDisplay label="Props" amount={baseBudget.props} />
          <BudgetLineDisplay label="Locations" amount={baseBudget.locations} />
        </div>
        <div className="mt-4 pt-4 border-t border-[#36393f] text-sm text-[#e7e7e7]/70">
          <span className="text-[#e7e7e7]/50">Source:</span> Script Breakdown (read-only)
        </div>
      </div>

      {/* OPTIONAL Budget Sections */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e7e7e7]">OPTIONAL Costs (AI-Suggested, Editable)</h3>
          <div className="text-2xl font-bold text-[#60A5FA]">
            ${selectedOptionalTotal.toLocaleString()}
          </div>
        </div>

        {/* Crew */}
        {optionalBudget.crew.length > 0 && (
          <BudgetCategory
            title="Crew"
            items={optionalBudget.crew}
            onToggle={handleToggleItem}
            onEditCost={handleEditCost}
          />
        )}

        {/* Equipment */}
        {optionalBudget.equipment.length > 0 && (
          <BudgetCategory
            title="Equipment Rental"
            items={optionalBudget.equipment}
            onToggle={handleToggleItem}
            onEditCost={handleEditCost}
          />
        )}

        {/* Miscellaneous */}
        {optionalBudget.miscellaneous.length > 0 && (
          <BudgetCategory
            title="Miscellaneous"
            items={optionalBudget.miscellaneous}
            onToggle={handleToggleItem}
            onEditCost={handleEditCost}
          />
        )}
      </div>

      {/* Budget Analysis */}
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Budget Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <AnalysisStat label="BASE only" value={budgetAnalysis.baseOnly} />
          <AnalysisStat label="+ Highly Recommended" value={budgetAnalysis.withHighlyRecommended} />
          <AnalysisStat label="+ All Recommended" value={budgetAnalysis.withRecommended} />
          <AnalysisStat label="+ All Suggestions" value={budgetAnalysis.withAll} />
        </div>
        <div className="p-4 bg-[#2a2a2a] rounded-lg">
          <div className="text-sm text-[#e7e7e7]">
            {budgetAnalysis.recommendation}
          </div>
        </div>
      </div>
    </div>
  )
}

// Budget Line Display (read-only)
function BudgetLineDisplay({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-[#2a2a2a] rounded-lg">
      <span className="text-[#e7e7e7]">{label}</span>
      <span className="font-mono text-[#e7e7e7]">${amount.toLocaleString()}</span>
    </div>
  )
}

// Budget Category (optional items)
function BudgetCategory({
  title,
  items,
  onToggle,
  onEditCost
}: {
  title: string
  items: BudgetLineItem[]
  onToggle: (itemId: string) => void
  onEditCost: (itemId: string, newCost: number) => void
}) {
  const categoryTotal = items.filter(i => i.included).reduce((sum, i) => sum + i.suggestedCost, 0)

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-[#e7e7e7]">{title}</h4>
        <span className="text-sm text-[#e7e7e7]/70">
          ${categoryTotal.toLocaleString()}
        </span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <BudgetLineItem
            key={item.id}
            item={item}
            onToggle={() => onToggle(item.id)}
            onEditCost={(newCost) => onEditCost(item.id, newCost)}
          />
        ))}
      </div>
    </div>
  )
}

// Budget Line Item (optional, editable)
function BudgetLineItem({
  item,
  onToggle,
  onEditCost
}: {
  item: BudgetLineItem
  onToggle: () => void
  onEditCost: (newCost: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(item.suggestedCost.toString())

  const necessityColor = {
    'highly-recommended': '#00FF99',
    'recommended': '#60A5FA',
    'optional': '#9CA3AF'
  }

  const handleSave = () => {
    const newCost = Number(editValue)
    if (!isNaN(newCost) && newCost >= 0) {
      onEditCost(newCost)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        item.included
          ? 'bg-[#2a2a2a] border-[#00FF99]/30'
          : 'bg-[#1a1a1a] border-[#36393f] opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.included}
          onChange={onToggle}
          className="mt-1 w-5 h-5 rounded accent-[#00FF99]"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#e7e7e7]">
                {item.role || item.item}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${necessityColor[item.necessity]}20`,
                  color: necessityColor[item.necessity]
                }}
              >
                {item.necessity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-right"
                    disabled={!item.included}
                  />
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 bg-[#00FF99] text-black rounded text-xs font-medium"
                  >
                    ✓
                  </button>
                </>
              ) : (
                <>
                  <span className="font-mono text-[#e7e7e7]">
                    ${item.suggestedCost.toLocaleString()}
                  </span>
                  {item.included && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#e7e7e7]/50 hover:text-[#00FF99] text-xs"
                    >
                      ✎
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-[#e7e7e7]/70 mb-2">
            {item.reason}
          </div>
          <div className="text-xs text-[#e7e7e7]/50">
            Range: ${item.costRange[0]}-${item.costRange[1]}
          </div>
        </div>
      </div>
    </div>
  )
}

// Analysis Stat
function AnalysisStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[#e7e7e7]/50 mb-1">{label}</div>
      <div className="text-lg font-bold text-[#e7e7e7]">${value.toLocaleString()}</div>
    </div>
  )
}
