'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductionSection, CharacterProfile } from '@/types/investor-materials'

interface ProductionDashboardProps {
  production: ProductionSection
  characters?: CharacterProfile[]
}

type TabType = 'budget' | 'locations' | 'equipment' | 'wardrobe' | 'casting' | 'schedule'

const TABS = [
  { id: 'budget' as TabType, label: 'Budget', icon: '💰', description: 'Cost tracking' },
  { id: 'locations' as TabType, label: 'Locations', icon: '📍', description: 'Series locations' },
  { id: 'equipment' as TabType, label: 'Equipment', icon: '🎥', description: 'Gear checklist' },
  { id: 'wardrobe' as TabType, label: 'Wardrobe/Props', icon: '👗', description: 'Series items' },
  { id: 'casting' as TabType, label: 'Casting', icon: '🎭', description: 'Actor info' },
  { id: 'schedule' as TabType, label: 'Schedule', icon: '📅', description: 'Shoot timeline' }
] as const

export default function ProductionDashboard({ production, characters = [] }: ProductionDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('budget')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderTabContent = () => {
    switch (activeTab) {
      case 'budget':
        return <BudgetTab budget={production.budget} />
      case 'locations':
        return <LocationsTab locations={production.locations || []} />
      case 'equipment':
        return <EquipmentTab equipment={production.equipment} />
      case 'wardrobe':
        return <WardrobePropsTab wardrobe={production.wardrobe} props={production.props || []} />
      case 'casting':
        return <CastingTab casting={production.casting} characters={characters} />
      case 'schedule':
        return <ScheduleTab schedule={production.schedule} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#10B981]">
                Production Ready
              </h1>
              <p className="text-sm text-[#e7e7e7]/70">
                Real-time data from Production Assistant
              </p>
            </div>
          </div>
          </div>
        </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar Navigation */}
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
          className="bg-[#1a1a1a] border-r border-[#36393f] flex-shrink-0 overflow-y-auto"
        >
          <div className="p-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full mb-4 p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7] flex items-center justify-center"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>

            {/* Tab Navigation */}
            <div className="space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                
                // Calculate completion for this tab
                const getTabCompletion = () => {
                  switch (tab.id) {
                    case 'budget':
                      return (production.budget?.totalArcBudget?.total ?? 0) > 0 ? 100 : 0
                    case 'locations':
                      return (production.locations?.length ?? 0) > 0 ? 100 : 0
                    case 'equipment':
                      return (production.equipment?.totalItems ?? 0) > 0 ? 100 : 0
                    case 'wardrobe':
                      const wTotal = (production.wardrobe?.totalItems ?? 0) + (production.props?.length ?? 0)
                      return wTotal > 0 ? 100 : 0
                    case 'casting':
                      return (production.casting?.characters?.length ?? 0) > 0 ? 100 : 0
                    case 'schedule':
                      return (production.schedule?.days?.length ?? 0) > 0 ? 100 : 0
                    default:
                      return 0
                  }
                }
                
                const completion = getTabCompletion()
              
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative
                      ${isActive 
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' 
                        : 'text-[#e7e7e7]/70 hover:bg-[#2a2a2a] hover:text-[#e7e7e7]'
                      }
                    `}
                  >
                    <span className="text-xl flex-shrink-0">{tab.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className="text-xs opacity-60 mt-0.5">{tab.description}</div>
                </div>
                        {/* Progress Indicator */}
                        <div className="flex-shrink-0">
                          <div 
                            className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                            style={{
                              borderColor: completion === 100 ? '#10B981' : '#36393f',
                              backgroundColor: completion === 100 ? '#10B981/20' : 'transparent',
                              color: completion === 100 ? '#10B981' : '#e7e7e7/50'
                            }}
                          >
                            {completion === 100 ? '✓' : completion}
          </div>
        </div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1800px] mx-auto px-6 py-8">
            {/* Tab Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// Budget Tab - EXACT 1:1 REPLICA OF PRODUCTION ASSISTANT (excluding fund sections)
function BudgetTab({ budget }: { budget: any }) {
  // Calculate totals exactly as in BudgetTrackerTab
  const baseBudget = budget?.baseBudget
  const budgetAnalysis = budget?.budgetAnalysis
  
  // Tab costs and location costs from the budget data
  const tabCosts = budget?.tabCosts || { total: 0, breakdown: [] }
  const locationCosts = budget?.locationCosts || { totalLocationCosts: 0, breakdown: [] }
  
  // Calculate current total exactly as production assistant
  const baseBudgetTotal = (baseBudget?.extras || 0) + (baseBudget?.props || 0)
  const tabCostsTotal = tabCosts.total
  const locationsTotal = locationCosts.totalLocationCosts
  const currentTotal = baseBudgetTotal + tabCostsTotal + locationsTotal
  
  // Budget status calculation (same logic as production assistant)
  const getBudgetStatus = (total: number) => {
    // Assuming arc context for pitch materials
    const arcEpisodeCount = budget?.episodeCount || 1
    const arcBudgetMin = 30 * arcEpisodeCount
    const arcBudgetMax = 625 * arcEpisodeCount
    
    if (total <= arcBudgetMin * 0.5) return { color: '#10B981', label: '🟢 Ultra-low budget' }
    if (total <= arcBudgetMax * 0.7) return { color: '#FCD34D', label: '🟡 Moderate micro-budget' }
    if (total <= arcBudgetMax) return { color: '#FB923C', label: '🟠 Approaching max' }
    return { color: '#EF4444', label: `🔴 Exceeds target ($${arcBudgetMax}/arc)` }
  }
  
  const budgetStatus = getBudgetStatus(currentTotal)
  const arcEpisodeCount = budget?.episodeCount || 1
  const arcBudgetMin = 30 * arcEpisodeCount
  const arcBudgetMax = 625 * arcEpisodeCount
  
  return (
    <div className="space-y-6">
      {/* Total Budget Card - EXACT MATCH */}
      <div
        className="bg-[#1a1a1a] border-2 rounded-lg p-6"
        style={{ borderColor: budgetStatus.color }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#e7e7e7]">TOTAL ARC BUDGET</h2>
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
          Target: ${arcBudgetMin}-${arcBudgetMax}/arc ({arcEpisodeCount} episode{arcEpisodeCount !== 1 ? 's' : ''} × $30-$625/episode)
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
                {tabCosts.breakdown.map((item: any, idx: number) => (
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
                Location Costs (Aggregated)
              </div>
              <div className="text-lg font-semibold text-[#e7e7e7]">
                +${locationCosts.totalLocationCosts.toLocaleString()}
              </div>
            </div>
            {locationCosts.breakdown.length > 0 && (
              <div className="mt-2 space-y-1">
                {locationCosts.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-[#e7e7e7]/60">
                    <span>
                      {item.locationName}
                      {item.episodes && item.episodes.length > 0 && ` (Eps ${item.episodes.join(', ')})`}
                      {item.scenes && item.scenes.length > 0 && ` (${item.scenes.length} scene${item.scenes.length !== 1 ? 's' : ''})`}
                    </span>
                    <span>${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BASE Budget Section - EXACT MATCH */}
      {baseBudget && (
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#e7e7e7]">BASE Budget (from Script Breakdown)</h3>
            <div className="text-2xl font-bold text-[#10B981]">
              ${baseBudgetTotal.toLocaleString()}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-4 bg-[#2a2a2a] rounded-lg">
              <span className="text-[#e7e7e7]">Extras</span>
              <span className="font-mono text-[#e7e7e7]">${(baseBudget.extras || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-4 bg-[#2a2a2a] rounded-lg">
              <span className="text-[#e7e7e7]">Props</span>
              <span className="font-mono text-[#e7e7e7]">${(baseBudget.props || 0).toLocaleString()}</span>
            </div>
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

      {/* Budget Analysis - EXACT MATCH */}
      {budgetAnalysis && (
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Budget Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">BASE only</div>
              <div className="text-lg font-bold text-[#e7e7e7]">${budgetAnalysis.baseOnly.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">+ Highly Recommended</div>
              <div className="text-lg font-bold text-[#e7e7e7]">${budgetAnalysis.withHighlyRecommended.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">+ All Recommended</div>
              <div className="text-lg font-bold text-[#e7e7e7]">${budgetAnalysis.withRecommended.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#e7e7e7]/50 mb-1">+ All Suggestions</div>
              <div className="text-lg font-bold text-[#e7e7e7]">${budgetAnalysis.withAll.toLocaleString()}</div>
            </div>
          </div>
          <div className="p-4 bg-[#2a2a2a] rounded-lg">
            <div className="text-sm text-[#e7e7e7]">
              {budgetAnalysis.recommendation}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Locations Tab - EXACT 1:1 REPLICA OF PRODUCTION ASSISTANT
function LocationsTab({ locations }: { locations: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Locations</h3>
        {locations.length > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40">
            {locations.length} selected
          </span>
        )}
      </div>
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {locations.length > 0 ? (
          locations.map((location, idx) => {
            const typeColor = location.storyLocationType === 'interior' 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
              : location.storyLocationType === 'exterior'
              ? 'bg-green-500/20 text-green-400 border-green-500/40'
              : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
            
            const costColor = (location.dayRate || 0) === 0 
              ? 'text-green-400'
              : (location.dayRate || 0) <= 150
              ? 'text-yellow-400'
              : 'text-orange-400'

            return (
              <div key={idx} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-6">
                {/* Story Location Header - EXACT MATCH */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-lg font-bold text-[#e7e7e7]">
                        {location.storyLocationName || location.name}
                      </h4>
                      {location.storyLocationType && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColor}`}>
                          {location.storyLocationType}
                        </span>
                      )}
                      {location.totalEpisodes && location.totalEpisodes > 1 && (
                        <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-medium border border-[#10B981]/40">
                          Reused {location.totalEpisodes}x
                        </span>
                      )}
                      {location.storyBibleReference && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium border border-blue-500/40">
                          Story Bible
                        </span>
                      )}
                      {location.confidence !== undefined && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/40">
                          Match {Math.round(location.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
                      {location.totalScenes !== undefined && location.totalScenes > 0 && (
                        <>
                          <span>{location.totalScenes} scene{location.totalScenes !== 1 ? 's' : ''}</span>
                          <span>•</span>
                        </>
                      )}
                      {location.totalEpisodes !== undefined && location.totalEpisodes > 0 && (
                        <>
                          <span>{location.totalEpisodes} episode{location.totalEpisodes !== 1 ? 's' : ''}</span>
                        </>
                      )}
                      {location.subLocationsCount !== undefined && location.subLocationsCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{location.subLocationsCount} sub-location{location.subLocationsCount !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#e7e7e7]/70">
                      <span className="text-[#e7e7e7]/50">Status:</span>
                      <span className="px-2 py-0.5 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7] text-xs capitalize">
                        {location.status || 'scouted'}
                      </span>
                      {(location.aiProvider || location.aiModel) && (
                        <span className="ml-2 px-2 py-0.5 bg-[#111827] border border-[#36393f] rounded text-[10px] text-[#e7e7e7]/70">
                          AI: {location.aiProvider || 'unknown'} {location.aiModel ? `(${location.aiModel})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Selected Venue Summary */}
                  {location.venueName && (
                    <div className="text-right text-sm text-[#e7e7e7]/70">
                      <div className="text-xs text-[#e7e7e7]/50">Selected:</div>
                      <div className="font-semibold text-[#e7e7e7]">{location.venueName}</div>
                      {location.sourcing && (
                        <div className="text-xs text-[#e7e7e7]/50 capitalize">{location.sourcing}</div>
                      )}
                      <div className="font-bold text-[#10B981]">${Math.round(location.totalCost || location.cost || 0)} est.</div>
                      <div className="text-xs text-[#e7e7e7]/50">
                        Day ${Math.round(location.dayRate || 0)} | Permit ${Math.round(location.permitCost || 0)} | Deposit ${Math.round(location.depositAmount || 0)}
                        {location.insuranceRequired ? ' | Insurance' : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-World Shooting Suggestion Card - EXACT MATCH */}
                {location.venueName && (
                  <div className="mt-4 pt-4 border-t border-[#36393f]">
                    <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Real-World Shooting Suggestions</h4>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#10B981] ring-1 ring-[#10B981]/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h5 className="font-bold text-[#e7e7e7]">{location.venueName}</h5>
                            <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-bold border border-[#10B981]/40">
                              ✓ Selected
                            </span>
                            {location.sourcing && (
                              <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#e7e7e7]/70 rounded text-xs border border-[#36393f] capitalize">
                                {location.sourcing}
                              </span>
                            )}
                          </div>
                          {location.venueType && (
                            <p className="text-sm text-[#e7e7e7]/70 mt-1">{location.venueType}</p>
                          )}
                          {location.address && (
                            <p className="text-xs text-[#e7e7e7]/50 mt-1">📍 {location.address}</p>
                          )}
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className={`text-xl font-bold ${costColor}`}>
                            ${Math.round(location.dayRate || 0)}<span className="text-sm font-normal">/day</span>
                          </div>
                          {((location.permitCost || 0) > 0 || (location.depositAmount || 0) > 0) && (
                            <div className="text-xs text-[#e7e7e7]/50 mt-1">
                              {(location.permitCost || 0) > 0 && <span>Permit: ${Math.round(location.permitCost || 0)}</span>}
                              {(location.permitCost || 0) > 0 && (location.depositAmount || 0) > 0 && <span> • </span>}
                              {(location.depositAmount || 0) > 0 && <span>Deposit: ${Math.round(location.depositAmount || 0)}</span>}
                            </div>
                          )}
                          {location.insuranceRequired && (
                            <div className="text-xs text-yellow-400/70 mt-0.5">⚠️ Insurance required</div>
                          )}
                          <div className="text-xs text-[#e7e7e7]/40 mt-1">
                            Total: <span className="font-semibold text-[#e7e7e7]/70">${Math.round(location.totalCost || location.cost || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pros & Cons Grid - EXACT MATCH */}
                      {(location.pros?.length || location.cons?.length) && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#36393f]">
                          {location.pros?.length > 0 && (
                            <div>
                              <div className="text-xs text-green-400 font-semibold mb-2">✓ Pros</div>
                              <ul className="text-xs text-[#e7e7e7]/80 space-y-1">
                                {location.pros.map((pro: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5">•</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {location.cons?.length > 0 && (
                            <div>
                              <div className="text-xs text-orange-400 font-semibold mb-2">✗ Cons</div>
                              <ul className="text-xs text-[#e7e7e7]/80 space-y-1">
                                {location.cons.map((con: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-orange-400 mt-0.5">•</span>
                                    <span>{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Logistics - EXACT MATCH */}
                      {location.logistics && (
                        <div className="mt-3 pt-3 border-t border-[#36393f]">
                          <div className="text-xs text-[#e7e7e7]/50 font-semibold mb-2">Logistics</div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className={`px-2 py-1 rounded border ${location.logistics.parking ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
                              {location.logistics.parking ? '✓' : '✗'} Parking
                            </span>
                            <span className={`px-2 py-1 rounded border ${location.logistics.power ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
                              {location.logistics.power ? '✓' : '✗'} Power
                            </span>
                            <span className={`px-2 py-1 rounded border ${location.logistics.restrooms ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-[#1a1a1a] text-[#e7e7e7]/50 border-[#36393f]'}`}>
                              {location.logistics.restrooms ? '✓' : '✗'} Restrooms
                            </span>
                            <span className={`px-2 py-1 rounded border ${location.logistics.permitRequired ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                              {location.logistics.permitRequired ? `⚠️ Permit Required ($${location.logistics.permitCost || 0})` : '✓ No Permit'}
                            </span>
                          </div>
                          {location.logistics.notes && (
                            <p className="mt-2 text-xs text-[#e7e7e7]/60 italic">📝 {location.logistics.notes}</p>
                          )}
                        </div>
                      )}

                      {/* Search Guidance & Open Venue Button - EXACT MATCH */}
                      {(location.searchGuidance || location.specificVenueUrl) && (
                        <div className="mt-3 pt-3 border-t border-[#36393f] flex flex-wrap items-center gap-3 text-xs">
                          {location.searchGuidance && (
                            <span className="text-[#e7e7e7]/60">
                              🔍 {location.searchGuidance}
                            </span>
                          )}
                          {location.specificVenueUrl ? (
                            <a
                              href={location.specificVenueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-[#10B981] text-[#0b1c14] font-semibold rounded-md border border-[#0ea56a] shadow-md shadow-[#10B981]/30 hover:bg-[#0ea56a] hover:text-black transition-colors"
                            >
                              🔗 Open Venue
                            </a>
                          ) : (
                            <span className="px-3 py-2 bg-[#1a1a1a] text-[#e7e7e7]/50 font-semibold rounded-md border border-[#36393f]">
                              🔗 Open Venue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Episode Usage Matrix - EXACT MATCH */}
                {location.episodeUsage && location.episodeUsage.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#36393f]">
                    <h4 className="text-sm font-bold text-[#e7e7e7] mb-3">Used In:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {location.episodeUsage.map((usage: any, uIdx: number) => (
                        <div
                          key={uIdx}
                          className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] rounded text-xs font-bold">
                              Episode {usage.episodeNumber}
                            </span>
                          </div>
                          <div className="text-xs text-[#e7e7e7]/70 mb-1">
                            {usage.episodeTitle || `Episode ${usage.episodeNumber}`}
                          </div>
                          <div className="text-xs text-[#e7e7e7]/70">
                            Scenes: {usage.sceneNumbers.length > 0 ? usage.sceneNumbers.join(', ') : 'N/A'} ({usage.sceneCount} total)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-white/50 text-sm">No locations selected yet</p>
        )}
      </div>
    </div>
  )
}

// Equipment Tab
function EquipmentTab({ equipment }: { equipment: any }) {
  if (!equipment) {
    return (
      <div className="text-white/50 text-sm">No equipment plan captured yet</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Equipment</h3>
        <span className={`text-xs px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981]`}>
          {equipment.status || 'Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-[#10B981]">{equipment.totalItems}</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Obtained</div>
          <div className="text-2xl font-bold text-green-400">{equipment.obtainedItems}</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Est. Cost</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">${equipment.totalCost.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {equipment.categories && equipment.categories.length > 0 ? (
          equipment.categories.map((cat: any) => (
            <div key={cat.category} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-[#e7e7e7] capitalize">{cat.category}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#e7e7e7]/70">
                    {cat.obtainedItems}/{cat.totalItems} obtained
                  </span>
                  <span className="text-[#10B981] font-semibold">
                    ${cat.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
              {cat.items && cat.items.length > 0 && (
                <div className="space-y-2">
                  {cat.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-[#1a1a1a] rounded p-3 border border-[#36393f]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[#e7e7e7]">{item.name}</span>
                            {item.status && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                item.status === 'obtained' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                item.status === 'rented' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                              }`}>
                                {item.status}
                              </span>
                            )}
                            {item.quantity && item.quantity > 1 && (
                              <span className="text-xs text-[#e7e7e7]/50">x{item.quantity}</span>
                            )}
                          </div>
                          {item.vendor && (
                            <p className="text-xs text-[#e7e7e7]/60">Vendor: {item.vendor}</p>
                          )}
                          {item.episodeUsage && item.episodeUsage.length > 0 && (
                            <p className="text-xs text-[#e7e7e7]/50 mt-1">
                              Used in: {item.episodeUsage.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {item.totalCost > 0 && (
                            <div className="text-sm font-semibold text-[#e7e7e7]">
                              ${item.totalCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-white/50 text-sm">No equipment items listed</p>
        )}
      </div>
    </div>
  )
}

// Wardrobe/Props Tab
function WardrobePropsTab({ wardrobe, props }: { wardrobe: any, props: any[] }) {
  const wardrobeItems = wardrobe?.wardrobe || []
  const propsItems = wardrobe?.props || props || []
  const totalItems = wardrobeItems.length + propsItems.length
  const totalCost = (wardrobe?.totalCost || 0) + (propsItems.reduce((sum: number, p: any) => sum + (p.cost || 0), 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Wardrobe & Props</h3>
        <span className={`text-xs px-2 py-1 rounded ${wardrobe ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-white/5 text-white/60'}`}>
          {wardrobe ? wardrobe.status || 'Active' : 'Missing'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-[#10B981]">{totalItems}</div>
        </div>
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Est. Cost</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">${totalCost.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* Wardrobe Section */}
        <div>
          <h4 className="text-lg font-bold text-[#e7e7e7] mb-4">Wardrobe</h4>
          {wardrobeItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wardrobeItems.map((item: any, idx: number) => (
                <div key={idx} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#e7e7e7]">{item.name}</span>
                    {item.cost > 0 && (
                      <span className="text-sm font-semibold text-[#10B981]">${item.cost}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-[#e7e7e7]/70">{item.description}</p>
                  )}
                  {item.status && (
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                      item.status === 'obtained' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">No wardrobe items yet</p>
          )}
        </div>

        {/* Props Section */}
        <div>
          <h4 className="text-lg font-bold text-[#e7e7e7] mb-4">Props</h4>
          {propsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propsItems.map((prop: any, idx: number) => (
                <div key={idx} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#e7e7e7]">{prop.name}</span>
                    {prop.cost > 0 && (
                      <span className="text-sm font-semibold text-[#10B981]">${prop.cost}</span>
                    )}
                  </div>
                  {prop.description && (
                    <p className="text-xs text-[#e7e7e7]/70 mb-2">{prop.description}</p>
                  )}
                  {prop.significance && (
                    <p className="text-xs text-[#e7e7e7]/60 italic mb-2">{prop.significance}</p>
                  )}
                  {prop.usedIn && prop.usedIn.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prop.usedIn.map((ep: string, eIdx: number) => (
                        <span key={eIdx} className="text-xs px-2 py-0.5 bg-[#1a1a1a] border border-[#36393f] rounded text-[#10B981]">
                          {ep}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">No props listed</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Casting Tab - EXACT 1:1 REPLICA OF PRODUCTION ASSISTANT
function CastingTab({ casting, characters }: { casting: any, characters: CharacterProfile[] }) {
  if (!casting || !casting.characters || casting.characters.length === 0) {
    return <div className="text-white/50 text-sm">No casting data yet</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {casting.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cast</div>
            <div className="text-2xl font-bold text-[#10B981]">{casting.stats.totalCast}</div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Confirmed</div>
            <div className="text-2xl font-bold text-green-400">{casting.stats.confirmedCount}/{casting.stats.totalCast}</div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Lead Roles</div>
            <div className="text-2xl font-bold text-[#e7e7e7]">{casting.stats.leadCount}</div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Supporting</div>
            <div className="text-2xl font-bold text-[#e7e7e7]">{casting.stats.supportingCount}</div>
          </div>
        </div>
      )}

      {/* Main Cast Section */}
      <div>
        <h3 className="text-xl font-bold text-[#e7e7e7] mb-4 flex items-center gap-2">
          <span>⭐</span>
          Main Cast ({casting.characters.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {casting.characters.map((char: any, idx: number) => {
            const displayImage = char.storyBibleImage || (char.headshot ? { imageUrl: char.headshot } : undefined)
            const actorTemplates = char.characterProfile?.actorTemplates || []
            
            return (
              <div
                key={idx}
                className="bg-[#2a2a2a] rounded-lg border border-[#36393f] transition-colors p-6"
              >
                {/* Visual reference from Story Bible (or fallback to headshot) */}
                <div className="mb-4">
                  {displayImage?.imageUrl ? (
                    <div className="aspect-[3/4] bg-[#1a1a1a] rounded-lg flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={displayImage.imageUrl} 
                        alt={char.characterName || char.name} 
                        className="w-full h-full object-cover"
                      />
                      {char.confirmed && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                          ✓ CONFIRMED
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-[#1a1a1a] rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="text-6xl">🎭</span>
                      {char.confirmed && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                          ✓ CONFIRMED
                        </div>
                      )}
                    </div>
                  )}
                  {char.storyBibleImage && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-xs text-[#e7e7e7]/70">
                      <span className="text-[#10B981] font-semibold">Story Bible</span>
                      <span>Auto-synced visual reference</span>
                    </div>
                  )}
                </div>

                {/* Actor inspirations directly under the portrait */}
                {actorTemplates.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-[#e7e7e7]/50 font-medium mb-2">Actor inspirations</div>
                    <div className="space-y-1.5">
                      {actorTemplates.map((template: any, tIdx: number) => (
                        <div key={tIdx} className="bg-[#1a1a1a] rounded p-2 border border-[#36393f]">
                          <div className="text-xs font-semibold text-[#10B981] mb-0.5">{template.name}</div>
                          <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">{template.whyMatch}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-[#e7e7e7] mb-1">
                      {char.characterName || char.name}
                    </h4>
                    <div className="text-sm text-[#e7e7e7]/70">
                      {char.actorName && char.actorName.trim() ? (
                        <span>{char.actorName}</span>
                      ) : (
                        <span className="text-sm text-[#e7e7e7]/50 italic">Needs Casting</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {char.status && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        char.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                        char.status === 'casting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        'bg-[#1a1a1a] text-[#e7e7e7]/70 border border-[#36393f]'
                      }`}>
                        {char.status}
                      </span>
                    )}
                    {char.characterProfile?.castingPriority?.level && (
                      <span className="text-[11px] px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-[#e7e7e7]/80">
                        Priority: {char.characterProfile.castingPriority.level}
                        {char.characterProfile.castingPriority.deadline ? ` • Due ${char.characterProfile.castingPriority.deadline}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-2 text-sm text-[#e7e7e7]/70 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#e7e7e7]">Role Type:</span>
                    <span className="text-xs px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-[#e7e7e7] capitalize">
                      {char.role || 'lead'}
                    </span>
                  </div>
                  
                  {char.episodes && char.episodes.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#e7e7e7]">Episodes:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {char.episodes.slice(0, 5).map((epNum: number) => (
                          <span
                            key={epNum}
                            className="px-2 py-0.5 bg-[#1a1a1a] rounded text-xs text-[#10B981] border border-[#10B981]/30"
                          >
                            Ep {epNum}
                          </span>
                        ))}
                        {char.episodes.length > 5 && (
                          <span className="text-xs text-[#e7e7e7]/50">+{char.episodes.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Character Profile Details */}
                {char.characterProfile && (
                  <div className="space-y-4 pt-4 border-t border-[#36393f] max-h-[400px] overflow-y-auto">
                    {/* Archetype and Age Range */}
                    <div className="space-y-2 text-xs text-[#e7e7e7]/70">
                      {char.characterProfile.archetype && (
                        <div>
                          <span className="font-medium text-[#e7e7e7]">Archetype:</span> {char.characterProfile.archetype}
                        </div>
                      )}
                      {char.characterProfile.ageRange && (
                        <div>
                          <span className="font-medium text-[#e7e7e7]">Age Range:</span> {char.characterProfile.ageRange.min}-{char.characterProfile.ageRange.max}
                        </div>
                      )}
                    </div>
                    
                    {/* Screen time metrics */}
                    {char.characterProfile.screenTimeMetrics && (
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#e7e7e7] bg-[#111] border border-[#36393f] rounded-lg p-2">
                        <div>
                          <div className="text-[#e7e7e7]/60">Scenes</div>
                          <div className="font-semibold">{char.characterProfile.screenTimeMetrics.totalScenes ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-[#e7e7e7]/60">Lines</div>
                          <div className="font-semibold">{char.characterProfile.screenTimeMetrics.totalLines ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-[#e7e7e7]/60">Est. Minutes</div>
                          <div className="font-semibold">{char.characterProfile.screenTimeMetrics.estimatedMinutes ?? 0}</div>
                        </div>
                      </div>
                    )}

                    {/* Character Arc */}
                    {char.characterProfile.characterArc && (
                      <div className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] space-y-3">
                        <div className="flex items-center gap-2 text-sm text-[#e7e7e7]">
                          <span>⭐</span>
                          <span>Character Arc</span>
                        </div>
                        {char.characterProfile.characterArc.emotionalJourney && (
                          <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
                            {char.characterProfile.characterArc.emotionalJourney}
                          </div>
                        )}
                        {char.characterProfile.characterArc.keyBeats && Array.isArray(char.characterProfile.characterArc.keyBeats) && char.characterProfile.characterArc.keyBeats.length > 0 && (
                          <div className="relative">
                            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#36393f]" />
                            <div className="space-y-3 pl-6">
                              {char.characterProfile.characterArc.keyBeats.map((beat: string, bIdx: number) => (
                                <div key={bIdx} className="relative">
                                  <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-[#10B981]" />
                                  <div className="text-xs text-[#e7e7e7]/80 leading-relaxed">{beat}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audition Sides */}
                    {char.characterProfile.keyScenes && Array.isArray(char.characterProfile.keyScenes) && char.characterProfile.keyScenes.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs text-[#e7e7e7]/50 font-medium">Audition Sides</h5>
                        <div className="space-y-3">
                          {char.characterProfile.keyScenes.map((scene: any, sIdx: number) => {
                            const dialogue = scene.dialogue || ''
                            return (
                              <div key={`${scene.episodeNumber}-${scene.sceneNumber}-${sIdx}`} className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] space-y-2">
                                <div className="flex items-center justify-between text-xs text-[#e7e7e7]/70">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#10B981]">📄</span>
                                    <span>
                                      Ep {scene.episodeNumber || '?'} • Scene {scene.sceneNumber || sIdx + 1}
                                    </span>
                                  </div>
                                  {dialogue && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard?.writeText(dialogue).catch(() => {})
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7]/70 hover:border-[#10B981]/50 hover:text-[#10B981] transition-colors text-[11px]"
                                      title="Copy dialogue"
                                    >
                                      <span>📋</span>
                                      Copy
                                    </button>
                                  )}
                                </div>
                                {scene.context && (
                                  <div className="text-xs text-[#e7e7e7]/60">
                                    <span className="font-semibold text-[#e7e7e7]/80">Context: </span>
                                    {scene.context}
                                  </div>
                                )}
                                {dialogue && (
                                  <pre className="whitespace-pre-wrap text-xs text-[#e7e7e7] bg-[#111] border border-[#36393f] rounded p-2 overflow-x-auto">
                                    {dialogue}
                                  </pre>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Relationships */}
                    {char.characterProfile.relationships && Array.isArray(char.characterProfile.relationships) && char.characterProfile.relationships.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs text-[#e7e7e7]/50 font-medium">Relationships</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {char.characterProfile.relationships.map((rel: any, rIdx: number) => (
                            <span
                              key={rIdx}
                              className="px-2 py-1 rounded bg-[#1a1a1a] border border-[#36393f] text-[11px] text-[#e7e7e7]/80"
                            >
                              {rel.relationshipType}: {rel.characterName}
                              {rel.chemistryRequired ? ' • chemistry' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Backstory */}
                    {char.characterProfile.backstory && (
                      <div className="space-y-1">
                        <h5 className="text-xs text-[#e7e7e7]/50 font-medium">Backstory</h5>
                        <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
                          {char.characterProfile.backstory}
                        </div>
                      </div>
                    )}

                    {/* Objectives */}
                    {char.characterProfile.objectives && (
                      <div className="space-y-1">
                        <h5 className="text-xs text-[#e7e7e7]/50 font-medium">Objectives</h5>
                        {char.characterProfile.objectives.superObjective && (
                          <div className="text-xs text-[#e7e7e7]/80 mb-1">
                            <span className="font-semibold text-[#e7e7e7]">Super-objective:</span> {char.characterProfile.objectives.superObjective}
                          </div>
                        )}
                        {char.characterProfile.objectives.sceneObjectives && Array.isArray(char.characterProfile.objectives.sceneObjectives) && char.characterProfile.objectives.sceneObjectives.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-[#e7e7e7]/70 space-y-0.5">
                            {char.characterProfile.objectives.sceneObjectives.map((obj: string, oIdx: number) => (
                              <li key={oIdx}>{obj}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Voice Requirements */}
                    {char.characterProfile.voiceRequirements && (
                      <div className="space-y-1">
                        <h5 className="text-xs text-[#e7e7e7]/50 font-medium">Voice & Tone</h5>
                        <div className="text-xs text-[#e7e7e7]/70 leading-relaxed">
                          {char.characterProfile.voiceRequirements.style}
                          {char.characterProfile.voiceRequirements.accent ? ` • Accent: ${char.characterProfile.voiceRequirements.accent}` : ''}
                          {char.characterProfile.voiceRequirements.vocalQuality ? ` • Quality: ${char.characterProfile.voiceRequirements.vocalQuality}` : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Schedule Tab - EXACT 1:1 REPLICA OF PRODUCTION ASSISTANT
function ScheduleTab({ schedule }: { schedule: any }) {
  if (!schedule) {
    return <div className="text-white/50 text-sm">No schedule loaded from Production Assistant</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {schedule.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Shoot days</div>
            <div className="text-2xl font-bold text-[#10B981]">{schedule.stats.totalShootDays}</div>
            <div className="text-xs text-[#e7e7e7]/50">
              {schedule.stats.uniqueLocations} location{schedule.stats.uniqueLocations !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-400">{schedule.stats.completedDays}</div>
            <div className="text-xs text-[#e7e7e7]/50">
              {schedule.stats.totalShootDays > 0 ? `${Math.round((schedule.stats.completedDays / schedule.stats.totalShootDays) * 100)}% done` : '0% done'}
            </div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-[#60A5FA]">{schedule.stats.upcomingDays}</div>
            <div className="text-xs text-[#e7e7e7]/50">Days scheduled</div>
          </div>
          
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
            <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Scenes</div>
            <div className="text-2xl font-bold text-[#e7e7e7]">{schedule.stats.totalScenes}</div>
            <div className="text-xs text-[#e7e7e7]/50">Across all days</div>
          </div>
        </div>
      )}

      {/* Proposed Shoot Schedule */}
      <div>
        <h3 className="text-xl font-bold text-[#e7e7e7] mb-4">Proposed shoot schedule</h3>
        {schedule.episodesCovered && schedule.episodesCovered.length > 0 && (
          <p className="text-sm text-[#e7e7e7]/70 mb-4">
            Episodes {schedule.episodesCovered.join(', ')}
          </p>
        )}
        
        {schedule.days && schedule.days.length > 0 ? (
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {schedule.days.map((day: any) => {
              const statusColors: Record<string, string> = {
                scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
                confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
                shot: 'bg-green-500/20 text-green-400 border-green-500/40',
                postponed: 'bg-red-500/20 text-red-400 border-red-500/40'
              }
              const statusColor = statusColors[day.status as string] || 'bg-[#1a1a1a] text-[#e7e7e7]/70 border-[#36393f]'
              
              return (
                <div key={day.dayNumber} className="bg-[#2a2a2a] rounded-lg border border-[#36393f] overflow-hidden">
                  {/* Header - EXACT MATCH */}
                  <div className="p-4 flex items-center gap-4">
                    {/* Day Number - Large green number */}
                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-xs text-[#e7e7e7]/50">Day</div>
                      <div className="text-2xl font-bold text-[#10B981]">{day.dayNumber}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-[#e7e7e7]">{day.location || 'Location TBD'}</h4>
                        {day.date && (
                          <span className="text-sm text-[#e7e7e7]/60">{day.date}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#e7e7e7]/70">
                        {day.callTime && day.estimatedWrapTime && (
                          <>
                            <span>🕐 {day.callTime} - {day.estimatedWrapTime}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>🎬 {day.scenes || 0} scene{(day.scenes || 0) !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>👥 {day.castCount || 0} cast</span>
                      </div>
                    </div>

                    {/* Status Button - EXACT MATCH */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded text-xs font-medium border ${statusColor} flex items-center gap-1.5`}>
                        <span>📅</span>
                        {day.status || 'scheduled'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {(day.scenesList || day.castRequired || day.equipmentRequired || day.specialNotes) && (
                    <div className="px-4 pb-4 border-t border-[#36393f] pt-4 space-y-3">
                      {day.scenesList && day.scenesList.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-[#e7e7e7]/70 mb-2">Scenes</h5>
                          <div className="space-y-1">
                            {day.scenesList.map((scene: any, sIdx: number) => (
                              <div key={sIdx} className="text-xs text-[#e7e7e7]/70">
                                Ep {scene.episodeNumber} • Scene {scene.sceneNumber}
                                {scene.sceneTitle && `: ${scene.sceneTitle}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {day.castRequired && day.castRequired.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-[#e7e7e7]/70 mb-2">Cast Required</h5>
                          <div className="flex flex-wrap gap-2">
                            {day.castRequired.map((cast: any, cIdx: number) => (
                              <span key={cIdx} className="text-xs px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7]/80">
                                {cast.characterName || cast}
                                {cast.actorName && ` (${cast.actorName})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {day.equipmentRequired && day.equipmentRequired.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-[#e7e7e7]/70 mb-2">Equipment Required</h5>
                          <div className="flex flex-wrap gap-2">
                            {day.equipmentRequired.map((eq: string, eIdx: number) => (
                              <span key={eIdx} className="text-xs px-2 py-1 bg-[#1a1a1a] border border-[#36393f] rounded text-[#e7e7e7]/80">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {day.specialNotes && (
                        <div>
                          <h5 className="text-xs font-semibold text-[#e7e7e7]/70 mb-2">Special Notes</h5>
                          <p className="text-xs text-[#e7e7e7]/70">{day.specialNotes}</p>
                        </div>
                      )}
                      
                      {day.weatherContingency && (
                        <div>
                          <h5 className="text-xs font-semibold text-[#e7e7e7]/70 mb-2">Weather Contingency</h5>
                          <p className="text-xs text-[#e7e7e7]/70">{day.weatherContingency}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-white/50 text-sm">No shoot days scheduled yet</p>
        )}
      </div>
    </div>
  )
}

