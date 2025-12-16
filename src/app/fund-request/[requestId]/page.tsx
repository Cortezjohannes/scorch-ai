'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import type { FundRequestRecord } from '@/types/preproduction'

export default function FundRequestReadOnlyPage() {
  const params = useParams()
  const requestId = params.requestId as string
  const [fundRequest, setFundRequest] = useState<FundRequestRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFundRequest = async () => {
      if (!requestId) {
        setError('Invalid request ID')
        setIsLoading(false)
        return
      }

      try {
        const fundRequestsCollection = collection(db, 'fundRequests')
        const q = query(fundRequestsCollection, where('requestId', '==', requestId))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError('Fund request not found')
          setIsLoading(false)
          return
        }

        const doc = querySnapshot.docs[0]
        const data = doc.data() as FundRequestRecord
        setFundRequest({ ...data, id: doc.id })
      } catch (err: any) {
        console.error('Error loading fund request:', err)
        setError(err.message || 'Failed to load fund request')
      } finally {
        setIsLoading(false)
      }
    }

    loadFundRequest()
  }, [requestId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7] text-lg">Loading fund request...</p>
        </div>
      </div>
    )
  }

  if (error || !fundRequest) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] mb-4">Error</h1>
          <p className="text-[#e7e7e7]/70 mb-6">{error || 'Fund request not found'}</p>
        </div>
      </div>
    )
  }

  const summary = fundRequest.summary

  return (
    <div className="min-h-screen bg-[#121212] text-[#e7e7e7]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#e7e7e7] mb-2">
                {summary.seriesTitle}
              </h1>
              <p className="text-[#e7e7e7]/70">
                {summary.arcTitle} • {summary.episodeCount} Episodes • Fund Request
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#10B981] mb-1">
                ${summary.totalBudget.toLocaleString()}
              </div>
              <div className="text-sm text-[#e7e7e7]/70">Total Arc Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Series Overview */}
        <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
            Series Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
        </section>

        {/* Episode Breakdowns */}
        <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
            Episode Breakdowns
          </h2>
          <div className="space-y-4">
            {summary.episodeBreakdowns.map(ep => (
              <div key={ep.episodeNumber} className="bg-[#121212] rounded-lg p-4 border border-[#36393f]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e7e7e7]">
                      Episode {ep.episodeNumber}: {ep.episodeTitle}
                    </h3>
                    <p className="text-sm text-[#e7e7e7]/70 mt-1">{ep.sceneCount} scenes</p>
                  </div>
                  <div className="text-2xl font-bold text-[#10B981]">
                    ${ep.totalBudget.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-3 text-xs text-[#e7e7e7]/60">
                  <div>Base: ${ep.baseBudget.toLocaleString()}</div>
                  <div>Optional: ${ep.optionalBudget.toLocaleString()}</div>
                  <div>Locations: ${ep.locationCosts.toLocaleString()}</div>
                  <div>Equipment: ${ep.equipmentCosts.toLocaleString()}</div>
                  <div>Props/Wardrobe: ${ep.propsWardrobeCosts.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cast Summary */}
        <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
            Cast Summary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
        </section>

        {/* Locations & Equipment */}
        <div className="grid grid-cols-2 gap-6">
          <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
              Locations
            </h2>
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
          </section>

          <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
              Equipment
            </h2>
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
          </section>
        </div>

        {/* Production Timeline */}
        <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
            Production Timeline
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
            <div className="col-span-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 mt-4">
              <span className="text-[#10B981] font-semibold">Deadline:</span>
              <span className="text-[#e7e7e7] ml-2">{summary.productionTimeline.deadline}</span>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-4 border-b border-[#36393f] pb-3">
            Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
                <a href={`mailto:${summary.userEmail}`} className="text-[#10B981] ml-2 hover:underline">
                  {summary.userEmail}
                </a>
              </div>
            )}
            {summary.userPhone && (
              <div>
                <span className="text-[#e7e7e7]/70">Phone:</span>
                <span className="text-[#e7e7e7] ml-2">{summary.userPhone}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-[#e7e7e7]/70">Request Submitted:</span>
              <span className="text-[#e7e7e7] ml-2">{new Date(summary.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

