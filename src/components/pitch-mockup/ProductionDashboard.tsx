'use client'

import React, { useState } from 'react'
import { motion } from '@/components/ui/ClientMotion'
import type { ProductionSection, CharacterProfile } from '@/types/investor-materials'

interface ProductionDashboardProps {
  production: ProductionSection
  characters: CharacterProfile[]
}

export default function ProductionDashboard({ production, characters }: ProductionDashboardProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'locations' | 'props' | 'casting'>('budget')

  const tabs = [
    { id: 'budget' as const, label: 'Budget', icon: '💰' },
    { id: 'locations' as const, label: 'Locations', icon: '📍' },
    { id: 'props' as const, label: 'Props', icon: '🎭' },
    { id: 'casting' as const, label: 'Casting', icon: '🎬' }
  ]

  // Calculate budget percentages
  const budget = production.budget
  const totalBudget = budget.perEpisode.total
  const baseBreakdown = budget.breakdown.base
  const optionalBreakdown = budget.breakdown.optional

  const baseTotal = baseBreakdown.extras + baseBreakdown.props + baseBreakdown.locations
  const optionalTotal =
    optionalBreakdown.crew +
    optionalBreakdown.equipment +
    optionalBreakdown.postProduction +
    optionalBreakdown.miscellaneous

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-[#e2c376] mb-4">Production Dashboard</h2>
        <p className="text-white/70 text-lg leading-relaxed">
          Executive overview of production costs, locations, props, and casting.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 border-b border-[#36393f] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#e2c376] text-[#e2c376]'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6"
              >
                <div className="text-sm text-white/60 mb-2">Per Episode</div>
                <div className="text-3xl font-bold text-[#e2c376]">
                  ${budget.perEpisode.total.toLocaleString()}
                </div>
                <div className="text-sm text-white/60 mt-2">
                  Base: ${budget.perEpisode.base.toLocaleString()}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6"
              >
                <div className="text-sm text-white/60 mb-2">Arc Total</div>
                <div className="text-3xl font-bold text-[#e2c376]">
                  ${budget.arcTotal.toLocaleString()}
                </div>
                <div className="text-sm text-white/60 mt-2">8 Episodes</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6"
              >
                <div className="text-sm text-white/60 mb-2">Status</div>
                <div className="text-2xl font-bold text-green-400">On Budget</div>
                <div className="text-sm text-white/60 mt-2">Within target range</div>
              </motion.div>
            </div>

            {/* Budget Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Base Budget */}
              <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#e2c376] mb-4">Base Budget</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Extras', amount: baseBreakdown.extras, color: '#e2c376' },
                    { label: 'Props', amount: baseBreakdown.props, color: '#10B981' },
                    { label: 'Locations', amount: baseBreakdown.locations, color: '#3B82F6' }
                  ].map((item, idx) => {
                    const percentage = (item.amount / baseTotal) * 100
                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/80">{item.label}</span>
                          <span className="text-white font-semibold">
                            ${item.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Optional Budget */}
              <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#e2c376] mb-4">Optional Budget</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Crew', amount: optionalBreakdown.crew, color: '#e2c376' },
                    { label: 'Equipment', amount: optionalBreakdown.equipment, color: '#10B981' },
                    { label: 'Post-Production', amount: optionalBreakdown.postProduction, color: '#3B82F6' },
                    { label: 'Miscellaneous', amount: optionalBreakdown.miscellaneous, color: '#8B5CF6' }
                  ].map((item, idx) => {
                    const percentage = (item.amount / optionalTotal) * 100
                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/80">{item.label}</span>
                          <span className="text-white font-semibold">
                            ${item.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Budget Analysis */}
            {budget.analysis && (
              <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#e2c376] mb-4">Analysis</h3>
                <p className="text-white/80 leading-relaxed">{budget.analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {production.locations.map((location, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#121212] border border-[#e2c376]/20 rounded-lg overflow-hidden"
              >
                {location.imageUrl && (
                  <div className="aspect-video bg-gray-800">
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#e2c376] mb-2">{location.name}</h3>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {location.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">
                      Used in {location.usedIn.length} scenes
                    </div>
                    <div className="text-lg font-bold text-[#e2c376]">
                      ${location.cost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Props Tab */}
        {activeTab === 'props' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {production.props.map((prop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#121212] border border-[#e2c376]/20 rounded-lg overflow-hidden"
              >
                {prop.imageUrl && (
                  <div className="aspect-square bg-gray-800">
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-[#e2c376] mb-1">{prop.name}</h3>
                  <p className="text-white/70 text-xs mb-2 leading-relaxed">
                    {prop.description}
                  </p>
                  {prop.significance && (
                    <p className="text-white/60 text-xs mb-2 italic">{prop.significance}</p>
                  )}
                  <div className="text-sm font-semibold text-white">
                    ${prop.cost.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Casting Tab */}
        {activeTab === 'casting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {production.casting.characters.map((character, idx) => {
              const charProfile = characters.find((c) => c.name === character.name)
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {charProfile?.imageUrl && (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={charProfile.imageUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#e2c376] mb-1">
                        {character.name}
                      </h3>
                      <div className="text-sm text-white/60">{character.ageRange}</div>
                      <div className="text-xs text-[#e2c376] mt-1 font-semibold">
                        {character.actorType}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    {character.description}
                  </p>
                  {character.references && character.references.length > 0 && (
                    <div>
                      <div className="text-xs text-white/60 mb-2">Reference Actors:</div>
                      <div className="flex flex-wrap gap-2">
                        {character.references.map((ref, refIdx) => (
                          <span
                            key={refIdx}
                            className="px-2 py-1 bg-[#2a2a2a] text-white/80 rounded text-xs"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}





