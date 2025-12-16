'use client'

import React from 'react'
import type { BudgetSummary } from '@/types/investor-materials'

interface BudgetVisualizationProps {
  budget: BudgetSummary
}

export default function BudgetVisualization({ budget }: BudgetVisualizationProps) {
  const totalBase = budget.breakdown.base.extras + budget.breakdown.base.props + budget.breakdown.base.locations
  const totalOptional = budget.breakdown.optional.crew + budget.breakdown.optional.equipment + 
                        budget.breakdown.optional.postProduction + budget.breakdown.optional.miscellaneous

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-2">Per Episode</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Base:</span>
              <span className="text-white font-semibold">${budget.perEpisode.base}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Optional:</span>
              <span className="text-white font-semibold">${budget.perEpisode.optional}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-white font-bold">Total:</span>
              <span className="text-[#10B981] font-bold text-xl">${budget.perEpisode.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-2">Arc Total</h3>
          <p className="text-[#10B981] font-bold text-3xl">${budget.arcTotal.toLocaleString()}</p>
        </div>

        <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-2">Budget Status</h3>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            budget.perEpisode.total < 500 
              ? 'bg-green-500/20 text-green-400' 
              : budget.perEpisode.total < 625
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {budget.perEpisode.total < 500 ? 'Ultra-Low Budget' : 
             budget.perEpisode.total < 625 ? 'Moderate Budget' : 
             'Approaching Max'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-4">Base Budget</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Extras</span>
                <span className="text-white">${budget.breakdown.base.extras}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Props</span>
                <span className="text-white">${budget.breakdown.base.props}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Locations</span>
                <span className="text-white">${budget.breakdown.base.locations}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total Base</span>
                <span className="text-[#10B981] font-bold">${totalBase}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-4">Optional Costs</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Crew</span>
                <span className="text-white">${budget.breakdown.optional.crew}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Equipment</span>
                <span className="text-white">${budget.breakdown.optional.equipment}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Post-Production</span>
                <span className="text-white">${budget.breakdown.optional.postProduction}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70 text-sm">Miscellaneous</span>
                <span className="text-white">${budget.breakdown.optional.miscellaneous}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total Optional</span>
                <span className="text-[#10B981] font-bold">${totalOptional}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {budget.analysis && (
        <div className="bg-[#121212] rounded-xl p-6 border border-[#10B981]/20">
          <h3 className="text-lg font-bold mb-2">Budget Analysis</h3>
          <p className="text-white/80">{budget.analysis}</p>
        </div>
      )}
    </div>
  )
}

