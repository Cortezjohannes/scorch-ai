'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PreProductionData, FundDeploymentRequest } from '@/types/preproduction'
import { getStoryBible } from '@/services/story-bible-service'
import type { BaseBudget, OptionalBudget, BudgetLineItem, BudgetAnalysis } from '@/services/ai-generators/budget-generator'
import { CollaborativeNotes } from '../shared/CollaborativeNotes'
import { FundRequestSummaryModal } from '../shared/FundRequestSummaryModal'

interface BudgetTrackerTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
  // Arc-level props (optional)
  arcPreProdData?: any
  episodePreProdData?: Record<number, any>
  storyBible?: any
  arcIndex?: number
  userEmail?: string
  userPhone?: string
}

export function BudgetTrackerTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  arcPreProdData,
  episodePreProdData,
  storyBible,
  arcIndex,
  userEmail,
  userPhone
}: BudgetTrackerTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Detect context
  const isArcContext = preProductionData.type === 'arc'
  const isEpisodeContext = preProductionData.type === 'episode'
  
  const budgetData = (preProductionData as any).budget
  const scriptsData = (preProductionData as any).scripts
  
  // For episode context: use preProductionData.scriptBreakdown
  // For arc context: check if any episode has breakdown
  const breakdownData = isEpisodeContext 
    ? preProductionData.scriptBreakdown 
    : undefined
  
  // Check if any episode has breakdown in arc context
  const hasAnyBreakdown = isArcContext && episodePreProdData
    ? Object.values(episodePreProdData).some((epPreProd: any) => 
        epPreProd?.scriptBreakdown?.scenes && epPreProd.scriptBreakdown.scenes.length > 0
      )
    : false

  const handleGenerateBudget = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log('💰 Generating budget...')

      // 1. Check if Script Breakdown exists (only for episode context)
      if (!isArcContext && !breakdownData) {
        setGenerationError('Please generate script breakdown first')
        setIsGenerating(false)
        return
      }
      
      // For arc context, check if any episode has breakdown
      if (isArcContext && !hasAnyBreakdown) {
        setGenerationError('Please generate script breakdown for at least one episode first')
        setIsGenerating(false)
        return
      }

      console.log('✅ Script breakdown found')

      // 2. Check if Scripts exist (only for episode context)
      if (!isArcContext && !scriptsData?.fullScript) {
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
      const requestBody: any = {
        preProductionId: (preProductionData as any).id,
        storyBibleId: preProductionData.storyBibleId,
        userId: currentUserId,
        storyBibleData: storyBible
      }
      
      if (isArcContext) {
        // For arc context, aggregate breakdown and scripts from episodes
        const aggregatedBreakdown: any = {
          scenes: [],
          totalScenes: 0,
          totalBudgetImpact: 0
        }
        const aggregatedScripts: any[] = []
        
        console.log('📊 Aggregating breakdown and script data from episodes for budget...')
        Object.entries(episodePreProdData || {}).forEach(([epNumStr, epPreProd]: [string, any]) => {
          const epNum = parseInt(epNumStr)
          
          // Check for script breakdown
          const breakdown = epPreProd.scriptBreakdown
          if (breakdown?.scenes && Array.isArray(breakdown.scenes) && breakdown.scenes.length > 0) {
            console.log(`  ✅ Episode ${epNum}: Found ${breakdown.scenes.length} scenes in breakdown`)
            aggregatedBreakdown.scenes.push(...breakdown.scenes)
            aggregatedBreakdown.totalScenes += breakdown.scenes.length
            aggregatedBreakdown.totalBudgetImpact += breakdown.totalBudgetImpact || 0
          }
          
          // Check for scripts
          const scripts = epPreProd.scripts
          if (scripts?.fullScript) {
            console.log(`  ✅ Episode ${epNum}: Found script`)
            aggregatedScripts.push(scripts.fullScript)
          }
        })
        
        console.log(`📊 Aggregation results:`, {
          totalScenes: aggregatedBreakdown.scenes.length,
          totalScripts: aggregatedScripts.length,
          totalBudgetImpact: aggregatedBreakdown.totalBudgetImpact
        })
        
        requestBody.arcPreProductionId = preProductionData.id
        requestBody.episodeNumbers = arcPreProdData?.episodeNumbers || []
        requestBody.breakdownData = aggregatedBreakdown.scenes.length > 0 ? aggregatedBreakdown : null
        requestBody.scriptData = aggregatedScripts.length > 0 ? aggregatedScripts[0] : null
        requestBody.episodePreProdData = episodePreProdData // Pass full episode data for server-side fallback
      } else {
        // For episode context, pass episode-specific data
        requestBody.episodeNumber = preProductionData.episodeNumber
        requestBody.scriptData = scriptsData?.fullScript
        requestBody.breakdownData = breakdownData
      }
      
      const response = await fetch('/api/generate/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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

  // Calculate arc budget targets early (before early returns)
  const arcEpisodeCount = isArcContext && arcPreProdData?.episodeNumbers 
    ? arcPreProdData.episodeNumbers.length 
    : 1
  
  // Arc budget targets: ($30-$625 per episode) × number of episodes in arc
  const arcBudgetMin = 30 * arcEpisodeCount
  const arcBudgetMax = 625 * arcEpisodeCount

  // Extract budget data early (before any early returns)
  const baseBudget: BaseBudget | undefined = budgetData?.baseBudget
  const optionalBudget: OptionalBudget | undefined = budgetData?.optionalBudget
  const budgetAnalysis: BudgetAnalysis | undefined = budgetData?.budgetAnalysis

  // Calculate hooks BEFORE early returns (Rules of Hooks)
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

  // Comprehensive cost aggregation from all tabs (Equipment, Props/Wardrobe, Locations, Casting)
  const tabCosts = useMemo(() => {
    const breakdown: Array<{ label: string; amount: number }> = []
    
    // Helper to collect all equipment items regardless of structure
    const collectEquipmentItems = (equipmentData: any) => {
      if (!equipmentData) return [] as any[]
      if (Array.isArray(equipmentData.items)) return equipmentData.items
      const categories: Array<'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'other'> = [
        'camera',
        'lens',
        'lighting',
        'audio',
        'grip',
        'other'
      ]
      return categories.flatMap(category => (Array.isArray(equipmentData[category]) ? equipmentData[category] : []))
    }

    // Helper to sum cast payments
    const sumCastPayments = (castingData: any) => {
      const cast = castingData?.cast || []
      return cast.reduce((sum: number, member: any) => {
        const isPaid = member.payment === 'paid'
        const amount = Number(member.paymentAmount ?? member.payRate ?? 0) || 0
        return sum + (isPaid ? amount : 0)
      }, 0)
    }

    if (isEpisodeContext) {
      // Episode context: aggregate from episode data
      
      // 1. Equipment costs (rentals only)
      const equipment = (preProductionData as any).equipment
      const equipmentItems = collectEquipmentItems(equipment)
      const equipmentTotal = equipmentItems.reduce((sum: number, item: any) => {
        const isRent = item.ownership === 'rent' || item.ownership === 'renting'
        if (isRent) {
          const cost = Number(item.totalCost ?? item.costPerDay ?? item.cost ?? 0)
          const quantity = Number(item.quantity ?? 1)
          return sum + cost * quantity
        }
        return sum
      }, 0)
      if (equipmentTotal > 0) {
        breakdown.push({ label: 'Equipment (Rentals)', amount: equipmentTotal })
      }

      // 2. Props/Wardrobe costs (buy/rent only)
      const propsWardrobe = (preProductionData as any).propsWardrobe
      if (propsWardrobe) {
        const items = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
        const propsTotal = items.reduce((sum: number, it: any) => {
          const isBuy = it.source === 'buy' || it.source === 'purchase'
          const isRent = it.source === 'rent' || it.source === 'rental'
          if ((isBuy || isRent) && typeof it.estimatedCost === 'number') {
            return sum + it.estimatedCost
          }
          return sum
        }, 0)
        if (propsTotal > 0) {
          breakdown.push({ label: 'Props & Wardrobe', amount: propsTotal })
        }
      }

      // 3. Cast payments (paid only)
      const castTotal = sumCastPayments((preProductionData as any).casting)
      if (castTotal > 0) {
        breakdown.push({ label: 'Cast Payments', amount: castTotal })
      }

      // 4. Locations are handled separately in locationCosts
      
    } else if (isArcContext) {
      // Arc context: aggregate from arc-level data with episode fallbacks
      
      // 1. Equipment costs (arc-level, all costs)
      const equipmentItems = collectEquipmentItems((preProductionData as any).equipment)
      const equipmentTotal = equipmentItems.reduce((sum: number, item: any) => {
        const cost = Number(item.totalCost ?? item.costPerDay ?? item.cost ?? 0)
        const quantity = Number(item.quantity ?? 1)
        return sum + cost * quantity
      }, 0)
      if (equipmentTotal > 0) {
        breakdown.push({ label: 'Equipment', amount: equipmentTotal })
      }

      // 2. Props & Wardrobe (arc-level, fallback to episode aggregation)
      const arcPropsWardrobe = (preProductionData as any).propsWardrobe
      const arcPropsTotal = arcPropsWardrobe
        ? [...(arcPropsWardrobe.props || []), ...(arcPropsWardrobe.wardrobe || [])].reduce(
            (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
            0
          )
        : 0

      let episodePropsTotal = 0
      if (episodePreProdData) {
        Object.values(episodePreProdData).forEach((epPreProd: any) => {
          const propsWardrobe = epPreProd?.propsWardrobe
          if (!propsWardrobe) return
          const items = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
          episodePropsTotal += items.reduce(
            (sum: number, item: any) => sum + (Number(item.estimatedCost) || 0),
            0
          )
        })
      }

      const propsTotal = arcPropsTotal || episodePropsTotal
      if (propsTotal > 0) {
        breakdown.push({ label: 'Props & Wardrobe', amount: propsTotal })
      }

      // 3. Cast payments (paid only)
      const arcCastTotal = sumCastPayments((preProductionData as any).casting)
      let castTotal = arcCastTotal
      if (!castTotal && episodePreProdData) {
        castTotal = Object.values(episodePreProdData).reduce((sum: number, epPreProd: any) => {
          return sum + sumCastPayments(epPreProd?.casting)
        }, 0)
      }
      if (castTotal > 0) {
        breakdown.push({ label: 'Cast Payments', amount: castTotal })
      }

      // 4. Permits
      const permitsTotal = ((preProductionData as any).permits?.permits || []).reduce(
        (sum: number, permit: any) => sum + (Number(permit.cost) || 0),
        0
      )
      if (permitsTotal > 0) {
        breakdown.push({ label: 'Permits', amount: permitsTotal })
      }

      // 5. Locations are handled separately in locationCosts
    }
    
    const total = breakdown.reduce((sum, item) => sum + item.amount, 0)
    return { total, breakdown }
  }, [preProductionData, isEpisodeContext, isArcContext, episodePreProdData])

  // Location Costs - Episode or Arc aggregated
  const locationCosts = useMemo(() => {
    if (isEpisodeContext) {
      // Episode context: use episode locations
      const locations = preProductionData.locations?.locations || []
      
      const breakdown = locations
        .filter((loc: any) => loc.secured || loc.status === 'booked' || loc.status === 'confirmed')
        .map((loc: any) => ({
          locationName: loc.name,
          cost: loc.cost + (loc.permitCost || 0),
          scenes: loc.scenes || []
        }))
      
      const totalLocationCosts = breakdown.reduce((sum: number, item: any) => sum + item.cost, 0)
      
      return { totalLocationCosts, breakdown }
    } else if (isArcContext) {
      // Arc context: use arc-level locations
      const arcLocationsData = preProductionData.locations as any
      
      // Check if we have the new format with costRollup
      if (arcLocationsData?.costRollup) {
        const costRollup = arcLocationsData.costRollup
        const breakdown = costRollup.perLocation.map((loc: any) => ({
          locationName: loc.parentLocationName,
          cost: loc.total,
          scenes: [], // Scene data not in costRollup format
          episodes: [] // Will be populated if available
        }))
        
        return {
          totalLocationCosts: costRollup.arcTotal || 0,
          breakdown
        }
      }
      
      // Fallback: use legacy format or locationGroups
      const locationGroups = arcLocationsData?.locationGroups || []
      if (locationGroups.length > 0) {
        // Calculate costs from location groups
        const breakdown = locationGroups
          .filter((group: any) => group.status === 'booked' || group.status === 'confirmed')
          .map((group: any) => {
            // Try to get cost from selected suggestion or costEstimate
            const selectedSuggestion = group.shootingLocationSuggestions?.find(
              (s: any) => s.id === group.selectedSuggestionId
            ) || group.shootingLocationSuggestions?.[0]
            
            const dayRate = selectedSuggestion?.costBreakdown?.dayRate ?? 
                           selectedSuggestion?.estimatedCost ?? 
                           group.costEstimate?.dayRate ?? 0
            const permitCost = selectedSuggestion?.costBreakdown?.permitCost ?? 
                              selectedSuggestion?.permitCost ?? 
                              selectedSuggestion?.logistics?.permitCost ?? 
                              group.costEstimate?.permitCost ?? 0
            const depositAmount = selectedSuggestion?.costBreakdown?.depositAmount ?? 
                                  selectedSuggestion?.depositAmount ?? 
                                  group.costEstimate?.depositAmount ?? 0
            
            const total = Math.max(0, dayRate) + Math.max(0, permitCost) + Math.max(0, depositAmount)
            
            return {
              locationName: group.parentLocationName,
              cost: total,
              scenes: [],
              episodes: group.episodeUsage?.map((u: any) => u.episodeNumber) || []
            }
          })
        
        const totalLocationCosts = breakdown.reduce((sum: number, item: any) => sum + item.cost, 0)
        
        return { totalLocationCosts, breakdown }
      }
      
      // Legacy format: locations array
      const locations = arcLocationsData?.locations || []
      const locationMap = new Map<string, { locationName: string; cost: number; scenes: Array<{ episodeNumber: number; sceneNumber: number }> }>()
      
      locations
        .filter((loc: any) => loc.secured || loc.status === 'booked' || loc.status === 'confirmed')
        .forEach((loc: any) => {
          const key = loc.recurringLocationKey || loc.name || loc.id
          const cost = (loc.cost || 0) + (loc.permitCost || 0)
          
          if (locationMap.has(key)) {
            const existing = locationMap.get(key)!
            locationMap.set(key, {
              ...existing,
              cost: Math.max(existing.cost, cost),
              scenes: [...existing.scenes, ...(loc.scenes || [])]
            })
          } else {
            locationMap.set(key, {
              locationName: loc.name,
              cost,
              scenes: loc.scenes || []
            })
          }
        })
      
      const breakdown = Array.from(locationMap.values()).map(loc => ({
        locationName: loc.locationName,
        cost: loc.cost,
        scenes: loc.scenes.map((s: any) => typeof s === 'number' ? s : s.sceneNumber),
        episodes: [...new Set(loc.scenes.map((s: any) => typeof s === 'object' ? s.episodeNumber : undefined).filter(Boolean))]
      }))
      
      const totalLocationCosts = breakdown.reduce((sum, item) => sum + item.cost, 0)
      
      return { totalLocationCosts, breakdown }
    }
    
    return { totalLocationCosts: 0, breakdown: [] }
  }, [isEpisodeContext, isArcContext, preProductionData.locations])


  // Check if budget data exists but might not have generated flag
  const hasBudgetData = budgetData && (
    budgetData.baseBudget || 
    budgetData.optionalBudget || 
    budgetData.budgetAnalysis ||
    budgetData.generated
  )

  // No budget generated yet
  if (!hasBudgetData) {
    // Check prerequisites
    // For episode context: check breakdownData and scriptsData
    // For arc context: check if any episode has breakdown
    const hasBreakdown = isArcContext ? hasAnyBreakdown : !!breakdownData
    const hasScript = isArcContext ? true : !!scriptsData?.fullScript // For arc context, we can generate without scripts at arc level

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
              {isArcContext ? (
                <>
                  Target: ${arcBudgetMin}-${arcBudgetMax}/arc ({arcEpisodeCount} episode{arcEpisodeCount !== 1 ? 's' : ''}). AI will suggest crew, equipment, and post-production costs based on your script complexity.
                </>
              ) : (
                <>
                  Target: $30-$625/episode. AI will suggest crew, equipment, and post-production costs based on your script complexity.
                </>
              )}
            </p>

            {generationError && (
              <div className="mb-4 px-4 py-3 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-400 text-sm">{generationError}</p>
              </div>
            )}

            <button
              onClick={handleGenerateBudget}
              disabled={isGenerating}
              className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  // Calculate current total
  // BASE budget: only Extras and Props (locations excluded, they come from Locations tab)
  const baseBudgetTotal = (baseBudget?.extras || 0) + (baseBudget?.props || 0)
  const aiSubtotal = baseBudgetTotal + selectedOptionalTotal
  
  // Tab costs: Equipment, Props/Wardrobe, Casting (and Permits for arc)
  const tabCostsTotal = tabCosts.total
  
  // Location costs (from Locations tab)
  const locationsTotal = locationCosts.totalLocationCosts
  
  // Total = BASE (extras + props) + Optional + Tab Costs + Locations
  const currentTotal = aiSubtotal + tabCostsTotal + locationsTotal

  // Budget status - use arc targets for arc context, episode targets for episode context
  const getBudgetStatus = (total: number) => {
    if (isArcContext) {
      // Arc-level targets
      if (total <= arcBudgetMin * 0.5) return { color: '#10B981', label: '🟢 Ultra-low budget', status: 'excellent' }
      if (total <= arcBudgetMax * 0.7) return { color: '#FCD34D', label: '🟡 Moderate micro-budget', status: 'good' }
      if (total <= arcBudgetMax) return { color: '#FB923C', label: '🟠 Approaching max', status: 'warning' }
      return { color: '#EF4444', label: `🔴 Exceeds target ($${arcBudgetMax}/arc)`, status: 'over' }
    } else {
      // Episode-level targets (original logic)
      if (total <= 300) return { color: '#10B981', label: '🟢 Ultra-low budget', status: 'excellent' }
      if (total <= 500) return { color: '#FCD34D', label: '🟡 Moderate micro-budget', status: 'good' }
      if (total <= 625) return { color: '#FB923C', label: '🟠 Approaching max', status: 'warning' }
      return { color: '#EF4444', label: '🔴 Exceeds target ($625/ep)', status: 'over' }
    }
  }

  const budgetStatus = getBudgetStatus(currentTotal)

  const handleToggleItem = async (itemId: string) => {
    if (!optionalBudget || !baseBudget) return
    
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
    if (!optionalBudget || !baseBudget) return
    
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
          className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-lg hover:bg-[#10B981]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h2 className="text-2xl font-bold text-[#e7e7e7]">
            {isArcContext ? 'TOTAL ARC BUDGET' : 'TOTAL EPISODE BUDGET'}
          </h2>
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
          {isArcContext ? (
            <>
              Target: ${arcBudgetMin}-${arcBudgetMax}/arc ({arcEpisodeCount} episode{arcEpisodeCount !== 1 ? 's' : ''} × $30-$625/episode)
            </>
          ) : (
            <>
              Target: $30-$625/episode (series budget: $1k-$20k ÷ 32 episodes)
            </>
          )}
        </div>
        {/* Tab Costs (Equipment, Props/Wardrobe, Casting, Permits) */}
        {tabCosts.total > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-[#36393f] bg-[#121212]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#e7e7e7]/70">
                Costs from Production Tabs (auto-updating)
              </div>
              <div className="text-lg font-semibold text-[#e7e7e7]">
                +${tabCosts.total.toLocaleString()}
              </div>
            </div>
            {tabCosts.breakdown.length > 0 && (
              <div className="space-y-1">
                {tabCosts.breakdown.map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="flex items-center justify-between text-xs text-[#e7e7e7]/60"
                  >
                    <span>{item.label}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Location Costs (from Locations tab) */}
        {locationCosts.totalLocationCosts > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-[#36393f] bg-[#121212]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-[#e7e7e7]/70">
                Location Costs{isArcContext ? ' (Aggregated)' : ''}
              </div>
              <div className="text-lg font-semibold text-[#e7e7e7]">
                +${locationCosts.totalLocationCosts.toLocaleString()}
              </div>
            </div>
            {locationCosts.breakdown.length > 0 && (
              <div className="mt-2 space-y-1">
                {locationCosts.breakdown.map((item: { locationName: string; cost: number; scenes: number[]; episodeNumber?: number; episodes?: number[] }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-[#e7e7e7]/60">
                    <span>
                      {item.locationName}
                      {isArcContext && item.episodes && item.episodes.length > 0 && ` (Eps ${item.episodes.join(', ')})`}
                      {!isArcContext && item.episodeNumber && ` (Ep ${item.episodeNumber})`}
                      {` (${item.scenes.length} scene${item.scenes.length !== 1 ? 's' : ''})`}
                    </span>
                    <span>${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BASE Budget Section */}
      {baseBudget && (
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#e7e7e7]">BASE Budget (from Script Breakdown)</h3>
            <div className="text-2xl font-bold text-[#10B981]">
              ${((baseBudget.extras || 0) + (baseBudget.props || 0)).toLocaleString()}
            </div>
          </div>
          <div className="space-y-2">
            <BudgetLineDisplay label="Extras" amount={baseBudget.extras} />
            <BudgetLineDisplay label="Props" amount={baseBudget.props} />
          </div>
          <div className="mt-4 pt-4 border-t border-[#36393f] text-sm text-[#e7e7e7]/70">
            <span className="text-[#e7e7e7]/50">Source:</span> Script Breakdown (read-only)
            <br />
            <span className="text-[#e7e7e7]/50 text-xs mt-1 block">
              Note: Location costs are tracked separately in the Locations tab
            </span>
          </div>
        </div>
      )}

      {/* OPTIONAL Budget Sections */}
      {optionalBudget && (
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
      )}

      {/* Budget Analysis */}
      {budgetAnalysis && (
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
      )}

      {/* Fund Deployment Requests (Production Assistant Only) */}
      {preProductionData.type === 'arc' && (
        <FundDeploymentSection
          budgetData={budgetData}
          onUpdate={onUpdate}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}

      {/* Greenlit Fund Request (Production Assistant Only) */}
      {arcPreProdData && episodePreProdData && storyBible && arcIndex !== undefined && (
        <GreenlitFundSection
          arcPreProdData={arcPreProdData}
          episodePreProdData={episodePreProdData}
          storyBible={storyBible}
          arcIndex={arcIndex}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          userEmail={userEmail}
          userPhone={userPhone}
        />
      )}
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
    'highly-recommended': '#10B981',
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
          ? 'bg-[#2a2a2a] border-[#10B981]/30'
          : 'bg-[#1a1a1a] border-[#36393f] opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.included}
          onChange={onToggle}
          className="mt-1 w-5 h-5 rounded accent-[#10B981]"
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
                    className="px-2 py-1 bg-[#10B981] text-black rounded text-xs font-medium"
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
                      className="text-[#e7e7e7]/50 hover:text-[#10B981] text-xs"
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

// Fund Deployment Section (Production Assistant Only)
function FundDeploymentSection({
  budgetData,
  onUpdate,
  currentUserId,
  currentUserName
}: {
  budgetData: any
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const requests = budgetData?.fundDeploymentRequests || []
  
  const totalRequested = useMemo(() => {
    return requests.reduce((sum: number, req: FundDeploymentRequest) => 
      req.status === 'submitted' || req.status === 'approved' ? sum + req.requestedAmount : sum, 0
    )
  }, [requests])
  
  const totalApproved = useMemo(() => {
    return requests
      .filter((req: FundDeploymentRequest) => req.status === 'approved')
      .reduce((sum: number, req: FundDeploymentRequest) => sum + req.requestedAmount, 0)
  }, [requests])
  
  const totalPending = totalRequested - totalApproved

  const handleAddRequest = async () => {
    const newRequest: FundDeploymentRequest = {
      id: `request_${Date.now()}`,
      requestedAmount: 0,
      requestedDate: new Date().toISOString().split('T')[0],
      purpose: '',
      breakdown: [],
      status: 'draft',
      comments: []
    }

    await onUpdate('budget', {
      ...budgetData,
      fundDeploymentRequests: [...requests, newRequest],
      totalRequested,
      totalApproved
    })

    setShowAddModal(true)
  }

  const handleUpdateRequest = async (requestId: string, updates: Partial<FundDeploymentRequest>) => {
    const updatedRequests = requests.map((req: FundDeploymentRequest) =>
      req.id === requestId ? { ...req, ...updates } : req
    )

    await onUpdate('budget', {
      ...budgetData,
      fundDeploymentRequests: updatedRequests,
      totalRequested: updatedRequests
        .filter((r: FundDeploymentRequest) => r.status === 'submitted' || r.status === 'approved')
        .reduce((sum: number, r: FundDeploymentRequest) => sum + r.requestedAmount, 0),
      totalApproved: updatedRequests
        .filter((r: FundDeploymentRequest) => r.status === 'approved')
        .reduce((sum: number, r: FundDeploymentRequest) => sum + r.requestedAmount, 0)
    })
  }

  const handleSubmitRequest = async (requestId: string) => {
    await handleUpdateRequest(requestId, {
      status: 'submitted',
      submittedAt: Date.now()
    })
  }

  const handleAddComment = async (requestId: string, comment: string) => {
    const request = requests.find((r: FundDeploymentRequest) => r.id === requestId)
    if (!request) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content: comment,
      timestamp: Date.now()
    }

    await handleUpdateRequest(requestId, {
      comments: [...(request.comments || []), newComment]
    })
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">Fund Deployment Requests</h3>
          <p className="text-sm text-[#e7e7e7]/70">
            Request funding for production costs
          </p>
        </div>
        <button
          onClick={handleAddRequest}
          className="px-4 py-2 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors"
        >
          + New Request
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-xs text-[#e7e7e7]/50 mb-1">Total Requested</div>
          <div className="text-2xl font-bold text-[#60A5FA]">${totalRequested.toLocaleString()}</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-xs text-[#e7e7e7]/50 mb-1">Total Approved</div>
          <div className="text-2xl font-bold text-[#10B981]">${totalApproved.toLocaleString()}</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-xs text-[#e7e7e7]/50 mb-1">Pending</div>
          <div className="text-2xl font-bold text-[#FCD34D]">${totalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-4xl mb-4">💵</div>
          <p className="text-[#e7e7e7]/70 mb-2">No fund deployment requests yet</p>
          <p className="text-sm text-[#e7e7e7]/50">
            Click "New Request" to create your first funding request
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: FundDeploymentRequest) => (
            <FundDeploymentRequestCard
              key={request.id}
              request={request}
              onUpdate={(updates) => handleUpdateRequest(request.id, updates)}
              onSubmit={() => handleSubmitRequest(request.id)}
              onAddComment={(comment) => handleAddComment(request.id, comment)}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Fund Deployment Request Card
function FundDeploymentRequestCard({
  request,
  onUpdate,
  onSubmit,
  onAddComment,
  currentUserId,
  currentUserName
}: {
  request: FundDeploymentRequest
  onUpdate: (updates: Partial<FundDeploymentRequest>) => Promise<void>
  onSubmit: () => Promise<void>
  onAddComment: (comment: string) => Promise<void>
  currentUserId: string
  currentUserName: string
}) {
  const [isExpanded, setIsExpanded] = useState(request.status === 'draft')
  const [isEditing, setIsEditing] = useState(false)

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    approved: 'bg-green-500/20 text-green-400 border-green-500/40',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/40'
  }

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#2a2a2a] rounded-lg border-2 overflow-hidden ${
        statusColors[request.status] || statusColors.draft
      }`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#36393f]/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center font-bold text-[#10B981]">
            #{request.id.slice(-6).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-lg font-bold text-[#e7e7e7]">
                {request.purpose || 'New Fund Request'}
              </h4>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${
                statusColors[request.status]
              }`}>
                {statusLabels[request.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
              <span>${request.requestedAmount.toLocaleString()}</span>
              <span>•</span>
              <span>Requested: {request.requestedDate}</span>
              {request.submittedAt && (
                <>
                  <span>•</span>
                  <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="text-[#e7e7e7] hover:text-[#10B981] transition-colors">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#36393f] p-6 space-y-4"
          >
            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-[#e7e7e7] mb-2">Purpose</label>
              <textarea
                value={request.purpose}
                onChange={(e) => onUpdate({ purpose: e.target.value })}
                placeholder="Describe the purpose of this funding request..."
                className="w-full bg-[#1a1a1a] border border-[#36393f] rounded-lg px-4 py-2 text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981] resize-none"
                rows={2}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-[#e7e7e7] mb-2">Requested Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-[#e7e7e7]">$</span>
                <input
                  type="number"
                  value={request.requestedAmount}
                  onChange={(e) => onUpdate({ requestedAmount: parseFloat(e.target.value) || 0 })}
                  className="flex-1 bg-[#1a1a1a] border border-[#36393f] rounded-lg px-4 py-2 text-[#e7e7e7] text-lg font-bold focus:outline-none focus:border-[#10B981]"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#e7e7e7]">Cost Breakdown</label>
                <button
                  onClick={() => onUpdate({
                    breakdown: [...request.breakdown, { category: '', amount: 0, justification: '' }]
                  })}
                  className="text-xs text-[#10B981] hover:text-[#059669] transition-colors"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2">
                {request.breakdown.map((item: { category: string; amount: number; description?: string; justification?: string }, idx: number) => (
                  <div key={idx} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f] flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...request.breakdown]
                          updated[idx] = { ...item, category: e.target.value }
                          onUpdate({ breakdown: updated })
                        }}
                        placeholder="Category"
                        className="w-full bg-[#2a2a2a] border border-[#36393f] rounded px-3 py-1.5 text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981] mb-2"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#e7e7e7]/70 text-sm">$</span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...request.breakdown]
                            updated[idx] = { ...item, amount: parseFloat(e.target.value) || 0 }
                            onUpdate({ breakdown: updated })
                          }}
                          className="flex-1 bg-[#2a2a2a] border border-[#36393f] rounded px-3 py-1.5 text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981]"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <textarea
                        value={item.justification}
                        onChange={(e) => {
                          const updated = [...request.breakdown]
                          updated[idx] = { ...item, justification: e.target.value }
                          onUpdate({ breakdown: updated })
                        }}
                        placeholder="Justification..."
                        className="w-full bg-[#2a2a2a] border border-[#36393f] rounded px-3 py-1.5 text-[#e7e7e7] text-sm focus:outline-none focus:border-[#10B981] resize-none"
                        rows={1}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updated = request.breakdown.filter((_, i) => i !== idx)
                        onUpdate({ breakdown: updated })
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {request.breakdown.length === 0 && (
                  <div className="text-center py-8 text-sm text-[#e7e7e7]/50">
                    No breakdown items yet. Click "Add Item" to create one.
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button (only for drafts) */}
            {request.status === 'draft' && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onSubmit()
                    setIsExpanded(false)
                  }}
                  disabled={!request.purpose || request.requestedAmount === 0}
                  className="px-6 py-2 bg-[#10B981] text-black rounded-lg font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            )}

            {/* Notes */}
            {request.notes && (
              <div>
                <label className="block text-sm font-medium text-[#e7e7e7] mb-2">Notes</label>
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f] text-sm text-[#e7e7e7]/70">
                  {request.notes}
                </div>
              </div>
            )}

            {/* Comments */}
            <CollaborativeNotes
              comments={request.comments || []}
              onAddComment={onAddComment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Greenlit Fund Section (Production Assistant Only)
function GreenlitFundSection({
  arcPreProdData,
  episodePreProdData,
  storyBible,
  arcIndex,
  currentUserId,
  currentUserName,
  userEmail,
  userPhone
}: {
  arcPreProdData: any
  episodePreProdData: Record<number, any>
  storyBible: any
  arcIndex: number
  currentUserId: string
  currentUserName: string
  userEmail?: string
  userPhone?: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestFunds = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log('💰 Generating fund request summary...')

      // Use user email and phone from props

      // Generate summary
      const response = await fetch('/api/fund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arcPreProductionId: arcPreProdData.id,
          userId: currentUserId,
          storyBibleId: storyBible.id || storyBible.storyBibleId,
          arcIndex,
          userName: currentUserName,
          userEmail,
          userPhone
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Failed to generate fund request')
      }

      const result = await response.json()
      setSummary(result.summary)
      setShowModal(true)
      console.log('✅ Fund request summary generated')

    } catch (err: any) {
      console.error('❌ Error generating fund request:', err)
      setError(err.message || 'Failed to generate fund request summary')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmitRequest = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('📧 Submitting fund request...')

      // The API route already sends the email, so we just need to close the modal
      // The summary was already generated and saved in handleRequestFunds
      setShowModal(false)
      
      // Show success message
      alert('Fund request submitted successfully! Email sent to johannes@thegreenlitstudios.com')

      console.log('✅ Fund request submitted')

    } catch (err: any) {
      console.error('❌ Error submitting fund request:', err)
      setError(err.message || 'Failed to submit fund request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="bg-[#1a1a1a] border-2 border-[#10B981] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#e7e7e7] mb-2 flex items-center gap-2">
              <span className="text-2xl">💚</span>
              The Greenlit Fund
            </h3>
            <p className="text-sm text-[#e7e7e7]/70">
              Request funding for your arc production (up to $20k Pilot Grants)
            </p>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#36393f] rounded-lg p-4 mb-4 space-y-4">
          <div>
            <p className="text-sm text-[#e7e7e7]/80 mb-3">
              We don't just provide the tools; we invest in the talent. Successful applicants from the Producer Program are eligible for Pilot Grants (up to $20k) to level up production.
            </p>
            <ul className="list-disc list-inside text-sm text-[#e7e7e7]/70 space-y-1">
              <li>Up to $20,000 in Pilot Grants</li>
              <li>2-3 week production timeline</li>
              <li>Creator-first terms (no extra equity, no creative control)</li>
            </ul>
          </div>
          
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 mt-4">
            <p className="text-xs text-[#e7e7e7]/90 leading-relaxed">
              <strong className="text-[#10B981]">Important:</strong> Funding approval is not required to complete and distribute your series on the Greenlit platform. The Greenlit Fund is designed as a supplement to boost production quality, not as a gatekeeper for what gets made. You maintain 100% freedom to create, produce, and distribute your series regardless of funding approval status.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleRequestFunds}
          disabled={isGenerating || isSubmitting}
          className="w-full px-6 py-3 bg-[#10B981] text-black font-bold rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <span className="text-xl">💚</span>
              Request Fund Deployment
            </>
          )}
        </button>
      </div>

      {summary && (
        <FundRequestSummaryModal
          summary={summary}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onRequestFunds={handleSubmitRequest}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}
