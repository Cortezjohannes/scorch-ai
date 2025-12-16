/**
 * Fund Request Summary Generator
 * 
 * Aggregates arc-level data to generate comprehensive funding request summaries
 */

import type { 
  ArcPreProductionData, 
  EpisodePreProductionData,
  FundRequestSummary,
  EpisodeBudgetBreakdown,
  CastSummary,
  LocationSummary,
  EquipmentSummary,
  StoryBibleHighlights,
  CharacterArc,
  ProductionTimeline
} from '@/types/preproduction'

export async function generateFundRequestSummary(
  arcData: ArcPreProductionData,
  episodePreProdData: Record<number, EpisodePreProductionData>,
  storyBible: any,
  userId: string,
  userName: string,
  userEmail?: string,
  userPhone?: string
): Promise<FundRequestSummary> {
  const arc = storyBible?.narrativeArcs?.[arcData.arcIndex]
  const arcTitle = arc?.title || `Arc ${arcData.arcIndex + 1}`
  const episodeNumbers = Object.keys(episodePreProdData).map(Number).sort((a, b) => a - b)
  
  // Generate episode breakdowns
  const episodeBreakdowns: EpisodeBudgetBreakdown[] = episodeNumbers.map(epNum => {
    const epData = episodePreProdData[epNum]
    const budget = epData.budget || {}
    const baseBudget = budget.baseBudget?.total || 0
    const optionalBudget = budget.optionalBudget?.total || 0
    const locations = epData.locations?.locations || []
    // Equipment is managed at arc level, not episode level
    const propsWardrobe = epData.propsWardrobe || { props: [], wardrobe: [] }
    
    // Calculate location costs
    const locationCosts = locations
      .filter((loc: any) => loc.secured || loc.status === 'booked' || loc.status === 'confirmed')
      .reduce((sum: number, loc: any) => sum + (loc.cost || 0) + (loc.permitCost || 0), 0)
    
    // Equipment costs come from arc-level equipment data only
    const equipmentCosts = 0
    
    // Calculate props/wardrobe costs
    const allItems = [...(propsWardrobe.props || []), ...(propsWardrobe.wardrobe || [])]
    const propsWardrobeCosts = allItems
      .filter((item: any) => {
        const isBuy = item.source === 'buy' || item.source === 'purchase'
        const isRent = item.source === 'rent' || item.source === 'rental'
        return (isBuy || isRent) && typeof item.estimatedCost === 'number'
      })
      .reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0)
    
    const breakdown = epData.scriptBreakdown
    const sceneCount = breakdown?.scenes?.length || 0
    
    return {
      episodeNumber: epNum,
      episodeTitle: epData.episodeTitle || `Episode ${epNum}`,
      sceneCount,
      totalBudget: baseBudget + optionalBudget + locationCosts + equipmentCosts + propsWardrobeCosts,
      baseBudget,
      optionalBudget,
      locationCosts,
      equipmentCosts,
      propsWardrobeCosts
    }
  })
  
  // Calculate total arc budget
  const totalBudget = episodeBreakdowns.reduce((sum, ep) => sum + ep.totalBudget, 0)
  
  // Generate cast summary
  const castSummary: CastSummary = {
    totalConfirmed: 0,
    totalPending: 0,
    leads: [],
    supporting: []
  }
  
  const castMap = new Map<string, any>()
  
  episodeNumbers.forEach(epNum => {
    const epData = episodePreProdData[epNum]
    const casting = epData.casting?.cast || []
    
    casting.forEach((member: any) => {
      const key = member.characterName
      if (!castMap.has(key)) {
        castMap.set(key, member)
        
        if (member.status === 'confirmed') {
          castSummary.totalConfirmed++
        } else {
          castSummary.totalPending++
        }
        
        const priority = member.priority || 'supporting'
        const castInfo = {
          characterName: member.characterName,
          actorName: member.actorName,
          status: member.status
        }
        
        if (priority === 'lead') {
          castSummary.leads.push(castInfo)
        } else {
          castSummary.supporting.push(castInfo)
        }
      }
    })
  })
  
  // Generate location summary
  const locationMap = new Map<string, any>()
  let totalLocationCost = 0
  let reuseSavings = 0
  
  episodeNumbers.forEach(epNum => {
    const epData = episodePreProdData[epNum]
    const locations = epData.locations?.locations || []
    
    locations.forEach((loc: any) => {
      const key = loc.recurringLocationKey || loc.id || loc.name
      
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          name: loc.name,
          address: loc.address || '',
          episodesUsed: [epNum],
          cost: loc.cost || 0
        })
        totalLocationCost += (loc.cost || 0) + (loc.permitCost || 0)
      } else {
        const existing = locationMap.get(key)!
        if (!existing.episodesUsed.includes(epNum)) {
          existing.episodesUsed.push(epNum)
          // Calculate reuse savings (first use pays full cost, subsequent uses save)
          reuseSavings += (loc.cost || 0) + (loc.permitCost || 0)
        }
      }
    })
  })
  
  const locationSummary: LocationSummary = {
    totalLocations: Array.from(locationMap.values()).length,
    uniqueLocations: Array.from(locationMap.values()).filter(loc => loc.episodesUsed.length === 1).length,
    totalCost: totalLocationCost,
    reuseSavings,
    keyLocations: Array.from(locationMap.values())
      .filter(loc => loc.episodesUsed.length > 1 || (loc.cost || 0) > 100)
      .slice(0, 10) // Top 10 key locations
  }
  
  // Generate equipment summary
  const equipmentMap = new Map<string, number>()
  let totalRentalCost = 0
  
  episodeNumbers.forEach(epNum => {
    const epData = episodePreProdData[epNum]
    const equipment = epData.equipment?.items || []
    
    equipment.forEach((item: any) => {
      const category = item.category || 'other'
      equipmentMap.set(category, (equipmentMap.get(category) || 0) + 1)
      
      if (item.ownership === 'rent' || item.ownership === 'renting') {
        totalRentalCost += item.cost || 0
      }
    })
  })
  
  const equipmentSummary: EquipmentSummary = {
    totalItems: Array.from(equipmentMap.values()).reduce((sum, count) => sum + count, 0),
    totalRentalCost,
    categories: {
      camera: equipmentMap.get('camera') || 0,
      lens: equipmentMap.get('lens') || 0,
      lighting: equipmentMap.get('lighting') || 0,
      audio: equipmentMap.get('audio') || 0,
      grip: equipmentMap.get('grip') || 0,
      other: equipmentMap.get('other') || 0
    }
  }
  
  // Generate story bible highlights
  const storyBibleHighlights: StoryBibleHighlights = {
    premise: storyBible?.premise || storyBible?.summary || 'No premise available',
    theme: storyBible?.theme || storyBible?.themes?.[0] || 'Not specified',
    genre: storyBible?.genre || 'Not specified',
    tone: storyBible?.tone || 'Not specified',
    setting: storyBible?.setting || storyBible?.location || 'Not specified',
    targetAudience: storyBible?.targetAudience || storyBible?.audience || 'Not specified'
  }
  
  // Generate character arcs
  const characterArcs: CharacterArc[] = []
  const mainCharacters = storyBible?.characters || []
  
  mainCharacters.slice(0, 5).forEach((char: any) => {
    const arc = arc?.episodes?.find((ep: any) => 
      ep.characters?.includes(char.name) || ep.characters?.some((c: any) => c.name === char.name)
    )
    
    characterArcs.push({
      characterName: char.name || 'Unnamed Character',
      arcDescription: char.arc || char.description || 'No arc description available',
      keyMoments: arc?.keyMoments || []
    })
  })
  
  // Generate production timeline
  const estimatedShootStart = new Date()
  estimatedShootStart.setDate(estimatedShootStart.getDate() + 7) // 1 week from now
  
  const estimatedShootEnd = new Date(estimatedShootStart)
  estimatedShootEnd.setDate(estimatedShootEnd.getDate() + 14) // 2 weeks shooting
  
  const estimatedPostProduction = new Date(estimatedShootEnd)
  estimatedPostProduction.setDate(estimatedPostProduction.getDate() + 3) // 3 days post
  
  const estimatedDistribution = new Date(estimatedPostProduction)
  estimatedDistribution.setDate(estimatedDistribution.getDate() + 1) // 1 day distribution
  
  const productionTimeline: ProductionTimeline = {
    estimatedShootStart: estimatedShootStart.toISOString().split('T')[0],
    estimatedShootEnd: estimatedShootEnd.toISOString().split('T')[0],
    estimatedPostProduction: estimatedPostProduction.toISOString().split('T')[0],
    estimatedDistribution: estimatedDistribution.toISOString().split('T')[0],
    deadline: '2-3 weeks from funding approval',
    totalShootDays: 14
  }
  
  return {
    seriesTitle: storyBible?.seriesTitle || storyBible?.title || 'Untitled Series',
    genre: storyBibleHighlights.genre,
    arcIndex: arcData.arcIndex,
    arcTitle,
    episodeCount: episodeNumbers.length,
    totalBudget,
    episodeBreakdowns,
    castSummary,
    locationSummary,
    equipmentSummary,
    storyBibleHighlights,
    characterArcs,
    productionTimeline,
    createdAt: Date.now(),
    userId,
    userName,
    userEmail,
    userPhone
  }
}

