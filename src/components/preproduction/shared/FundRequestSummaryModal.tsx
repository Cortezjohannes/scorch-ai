'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FundRequestSummary } from '@/types/preproduction'

interface FundRequestSummaryModalProps {
  summary: FundRequestSummary
  isOpen: boolean
  onClose: () => void
  onRequestFunds: () => Promise<void>
  isSubmitting: boolean
}

export function FundRequestSummaryModal({
  summary,
  isOpen,
  onClose,
  onRequestFunds,
  isSubmitting
}: FundRequestSummaryModalProps) {
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestFunds = async () => {
    setIsRequesting(true)
    try {
      await onRequestFunds()
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-[#1a1a1a] border border-[#36393f] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#121212] border-b border-[#36393f] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#e7e7e7]">Fund Request Summary</h2>
                  <p className="text-sm text-[#e7e7e7]/70 mt-1">
                    {summary.seriesTitle} • {summary.arcTitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7]/70 hover:text-[#e7e7e7]"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Budget Highlight */}
                <div className="bg-[#10B981]/10 border-2 border-[#10B981] rounded-lg p-6 text-center">
                  <div className="text-sm text-[#10B981] mb-2">Total Arc Budget</div>
                  <div className="text-4xl font-bold text-[#e7e7e7] mb-2">
                    ${summary.totalBudget.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#e7e7e7]/70">
                    {summary.episodeCount} Episodes • {summary.arcTitle}
                  </div>
                </div>

                {/* Series Overview */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                  <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Series Overview</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#e7e7e7]/70">Series:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.seriesTitle}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Genre:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.genre}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Arc:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.arcTitle}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Episodes:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.episodeCount}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#e7e7e7]/70">Premise:</span>
                      <p className="text-[#e7e7e7] mt-1">{summary.storyBibleHighlights.premise}</p>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Theme:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.storyBibleHighlights.theme}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Tone:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.storyBibleHighlights.tone}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Setting:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.storyBibleHighlights.setting}</span>
                    </div>
                  </div>
                </div>

                {/* Episode Breakdowns */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                  <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Episode Breakdowns</h3>
                  <div className="space-y-3">
                    {summary.episodeBreakdowns.map(ep => (
                      <div key={ep.episodeNumber} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#36393f]">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-[#e7e7e7]">
                              Episode {ep.episodeNumber}: {ep.episodeTitle}
                            </div>
                            <div className="text-sm text-[#e7e7e7]/70">
                              {ep.sceneCount} scenes
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[#10B981]">
                            ${ep.totalBudget.toLocaleString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs text-[#e7e7e7]/60 mt-2">
                          <div>Base: ${ep.baseBudget.toLocaleString()}</div>
                          <div>Optional: ${ep.optionalBudget.toLocaleString()}</div>
                          <div>Locations: ${ep.locationCosts.toLocaleString()}</div>
                          <div>Equipment: ${ep.equipmentCosts.toLocaleString()}</div>
                          <div>Props/Wardrobe: ${ep.propsWardrobeCosts.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cast Summary */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                  <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Cast Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#e7e7e7]/70">Confirmed:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.castSummary.totalConfirmed}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Pending:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.castSummary.totalPending}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#e7e7e7]/70">Leads:</span>
                      <span className="text-[#e7e7e7] ml-2">
                        {summary.castSummary.leads.map(c => c.characterName).join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#e7e7e7]/70">Supporting:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.castSummary.supporting.length} characters</span>
                    </div>
                  </div>
                </div>

                {/* Locations & Equipment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                    <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Locations</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[#e7e7e7]/70">Total:</span>
                        <span className="text-[#e7e7e7] ml-2">{summary.locationSummary.totalLocations}</span>
                      </div>
                      <div>
                        <span className="text-[#e7e7e7]/70">Unique:</span>
                        <span className="text-[#e7e7e7] ml-2">{summary.locationSummary.uniqueLocations}</span>
                      </div>
                      <div>
                        <span className="text-[#e7e7e7]/70">Total Cost:</span>
                        <span className="text-[#e7e7e7] ml-2">${summary.locationSummary.totalCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#e7e7e7]/70">Reuse Savings:</span>
                        <span className="text-[#10B981] ml-2">${summary.locationSummary.reuseSavings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                    <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Equipment</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[#e7e7e7]/70">Total Items:</span>
                        <span className="text-[#e7e7e7] ml-2">{summary.equipmentSummary.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-[#e7e7e7]/70">Rental Cost:</span>
                        <span className="text-[#e7e7e7] ml-2">${summary.equipmentSummary.totalRentalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Timeline */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                  <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Production Timeline</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#e7e7e7]/70">Shoot Start:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.estimatedShootStart}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Shoot End:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.estimatedShootEnd}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Post-Production:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.estimatedPostProduction}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">Distribution:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.estimatedDistribution}</span>
                    </div>
                    <div className="col-span-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3">
                      <span className="text-[#10B981] font-semibold">Deadline:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
                  <h3 className="text-lg font-bold text-[#e7e7e7] mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#e7e7e7]/70">Name:</span>
                      <span className="text-[#e7e7e7] ml-2">{summary.userName}</span>
                    </div>
                    <div>
                      <span className="text-[#e7e7e7]/70">User ID:</span>
                      <span className="text-[#e7e7e7] ml-2 font-mono text-xs">{summary.userId}</span>
                    </div>
                    {summary.userEmail && (
                      <div>
                        <span className="text-[#e7e7e7]/70">Email:</span>
                        <span className="text-[#10B981] ml-2">{summary.userEmail}</span>
                      </div>
                    )}
                    {summary.userPhone && (
                      <div>
                        <span className="text-[#e7e7e7]/70">Phone:</span>
                        <span className="text-[#e7e7e7] ml-2">{summary.userPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                  <p className="text-xs text-[#e7e7e7]/90 leading-relaxed">
                    <strong className="text-[#10B981]">Important:</strong> Funding approval is not required to complete and distribute your series on the Greenlit platform. The Greenlit Fund is designed as a supplement to boost production quality, not as a gatekeeper for what gets made. You maintain 100% freedom to create, produce, and distribute your series regardless of funding approval status.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#121212] border-t border-[#36393f] px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isRequesting || isSubmitting}
                  className="px-6 py-2 rounded-lg border border-[#36393f] text-[#e7e7e7] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestFunds}
                  disabled={isRequesting || isSubmitting}
                  className="px-6 py-2 rounded-lg bg-[#10B981] text-black font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRequesting || isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Requesting Funds...
                    </>
                  ) : (
                    'Request Funds'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

