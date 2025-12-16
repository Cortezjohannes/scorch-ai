'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { ArcPreProductionData } from '@/types/preproduction'
import { getStoryBible } from '@/services/story-bible-service'

interface ArcMarketingTabProps {
  preProductionData: ArcPreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
  arcIndex: number
  storyBible?: any
  arcPreProdData?: any
  episodePreProdData?: Record<number, any>
}

export function ArcMarketingTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  arcIndex,
  storyBible: storyBibleProp,
  arcPreProdData,
  episodePreProdData
}: ArcMarketingTabProps) {
  const [storyBible, setStoryBible] = useState<any>(storyBibleProp || null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!storyBibleProp)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const loadStoryBible = async () => {
      if (!storyBibleProp && preProductionData.storyBibleId && currentUserId) {
        try {
          const bible = await getStoryBible(preProductionData.storyBibleId, currentUserId)
          setStoryBible(bible)
        } catch (error) {
          console.error('Error loading story bible:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    loadStoryBible()
  }, [preProductionData.storyBibleId, currentUserId, storyBibleProp])

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const CopyButton = ({ text, itemId, label }: { text: string; itemId: string; label?: string }) => (
    <button
      onClick={() => copyToClipboard(text, itemId)}
      className="ml-2 px-2 py-1 text-xs rounded bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#10B981]/20 hover:text-[#10B981] transition-colors"
      title="Copy to clipboard"
    >
      {copiedItem === itemId ? '✓ Copied' : '📋 Copy'}
    </button>
  )

  const arcMarketing = preProductionData.marketing
  const storyBibleMarketing = storyBible?.marketing

  const handleGenerateMarketing = async () => {
    if (!storyBible || !arcPreProdData) {
      alert('Story bible and production assistant data are required to generate marketing')
      return
    }

    setIsGenerating(true)
    try {
      console.log('📢 Generating arc marketing...')
      console.log('  Arc Index:', arcIndex)
      console.log('  Has Story Bible:', !!storyBible)
      console.log('  Has Production Assistant Data:', !!arcPreProdData)
      console.log('  Has Episode Pre-Production Data:', !!episodePreProdData)
      
      const episodeData = episodePreProdData || {}
      const episodeNumbers = Object.keys(episodeData).map(k => parseInt(k)).sort((a, b) => a - b)
      console.log('  Episode Count:', episodeNumbers.length)
      console.log('  Episodes with data:', episodeNumbers.join(', '))
      
      // Log what content is available for each episode
      episodeNumbers.forEach(epNum => {
        const epData = episodeData[epNum]
        const hasScript = !!(epData?.scripts?.formattedScript || epData?.scripts?.rawScript || epData?.scripts?.fullScript)
        const hasBreakdown = !!(epData?.scriptBreakdown?.scenes?.length > 0)
        const hasStoryboards = !!(epData?.storyboards?.scenes?.length > 0)
        const hasNarrative = !!(epData?.narrative?.scenes?.length > 0)
        console.log(`    Episode ${epNum}: script=${hasScript}, breakdown=${hasBreakdown}, storyboards=${hasStoryboards}, narrative=${hasNarrative}`)
      })

      const requestBody = {
        storyBible,
        arcPreProductionData: arcPreProdData || preProductionData,
        episodePreProdData: episodeData,
        arcIndex
      }
      
      console.log('📤 Sending request to /api/generate/arc-marketing')
      console.log('  Request body size:', JSON.stringify(requestBody).length, 'bytes')

      const response = await fetch('/api/generate/arc-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { error: response.statusText, details: text.substring(0, 500) }
        }
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || errorData.details || `Failed to generate marketing: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Marketing API response:', data)
      console.log('  Success:', data.success)
      console.log('  Has Marketing:', !!data.marketing)
      console.log('  Marketing keys:', data.marketing ? Object.keys(data.marketing) : 'none')
      
      if (data.success && data.marketing) {
        console.log('✅ Marketing data received, updating pre-production...')
        console.log('  Marketing strategy:', !!data.marketing.marketingStrategy)
        console.log('  Cross-episode themes:', data.marketing.crossEpisodeThemes?.length || 0)
        console.log('  Arc launch strategy:', !!data.marketing.arcLaunchStrategy)
        
        const updatedMarketing = {
          arcIndex: arcIndex,
          ...data.marketing
        }
        
        console.log('  Updating with:', Object.keys(updatedMarketing))
        console.log('  Full marketing data:', JSON.stringify(updatedMarketing).substring(0, 500))
        
        // Update using the onUpdate callback - it expects (tabName, tabData)
        await onUpdate('marketing', updatedMarketing)
        console.log('✅ Marketing data saved successfully')
      } else {
        console.error('❌ Invalid response:', data)
        throw new Error(data.error || 'Invalid response from API')
      }
    } catch (error: any) {
      console.error('❌ Error generating arc marketing:', error)
      alert(`Failed to generate marketing: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#10B981] border-r-[#10B98150] border-b-[#10B98130] border-l-[#10B98120] rounded-full mb-4 animate-spin mx-auto"></div>
          <p className="text-[#e7e7e7]/70">Loading marketing data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      key={JSON.stringify(arcMarketing)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-2">Arc {arcIndex + 1} Marketing Strategy</h2>
          <p className="text-base text-[#e7e7e7]/70 mb-6">
            Arc-level marketing strategy, cross-episode themes, and launch approach for this story arc.
          </p>
        </div>
        {!arcMarketing && (
          <button
            onClick={handleGenerateMarketing}
            disabled={isGenerating || !storyBible}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#10B981]/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <span>📢</span>
                Generate Marketing Strategy
              </>
            )}
          </button>
        )}
        {arcMarketing && (
          <button
            onClick={handleGenerateMarketing}
            disabled={isGenerating || !storyBible}
            className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#36393f] text-[#e7e7e7] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#e7e7e7] border-t-transparent rounded-full animate-spin"></div>
                Regenerating...
              </>
            ) : (
              <>
                <span>🔄</span>
                Regenerate
              </>
            )}
          </button>
        )}
      </div>

      {/* Arc Marketing Strategy */}
      {arcMarketing?.marketingStrategy && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Marketing Strategy</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Primary Approach</h4>
              <p className="text-[#e7e7e7]/80">{arcMarketing.marketingStrategy.primaryApproach}</p>
            </div>

            {arcMarketing.marketingStrategy.targetAudience && (
              <div>
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Target Audience</h4>
                <div className="space-y-2">
                  {arcMarketing.marketingStrategy.targetAudience.primary && arcMarketing.marketingStrategy.targetAudience.primary.length > 0 && (
                    <div>
                      <p className="text-sm text-[#e7e7e7]/70 mb-1">Primary:</p>
                      <div className="flex flex-wrap gap-2">
                        {arcMarketing.marketingStrategy.targetAudience.primary.map((audience: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 rounded-full text-sm bg-[#10B981]/20 text-[#10B981]">
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {arcMarketing.marketingStrategy.targetAudience.secondary && arcMarketing.marketingStrategy.targetAudience.secondary.length > 0 && (
                    <div>
                      <p className="text-sm text-[#e7e7e7]/70 mb-1">Secondary:</p>
                      <div className="flex flex-wrap gap-2">
                        {arcMarketing.marketingStrategy.targetAudience.secondary.map((audience: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 rounded-full text-sm bg-[#2a2a2a] text-[#e7e7e7]/70">
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {arcMarketing.marketingStrategy.keySellingPoints && arcMarketing.marketingStrategy.keySellingPoints.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Key Selling Points</h4>
                <ul className="space-y-2">
                  {arcMarketing.marketingStrategy.keySellingPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start text-[#e7e7e7]/80">
                      <span className="mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {arcMarketing.marketingStrategy.uniqueValueProposition && (
              <div>
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Unique Value Proposition</h4>
                <p className="text-[#e7e7e7]/80">{arcMarketing.marketingStrategy.uniqueValueProposition}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cross-Episode Themes */}
      {arcMarketing?.crossEpisodeThemes && arcMarketing.crossEpisodeThemes.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Cross-Episode Marketing Themes</h3>
          <ul className="space-y-3">
            {arcMarketing.crossEpisodeThemes.map((theme: string, idx: number) => (
              <li key={idx} className="flex items-start justify-between text-[#e7e7e7]/80">
                <div className="flex-1">
                  <span className="mr-2">•</span>
                  <span>{theme}</span>
                </div>
                <CopyButton text={theme} itemId={`theme-${idx}`} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Arc Launch Strategy */}
      {arcMarketing?.arcLaunchStrategy && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Arc Launch Strategy</h3>
          <div className="space-y-4">
            {arcMarketing.arcLaunchStrategy.preLaunch && arcMarketing.arcLaunchStrategy.preLaunch.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-[#10B981]">
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Pre-Launch (4 Weeks Out)</h4>
                <ul className="space-y-2">
                  {arcMarketing.arcLaunchStrategy.preLaunch.map((tactic: string, idx: number) => (
                    <li key={idx} className="flex items-start text-[#e7e7e7]/80">
                      <span className="mr-2">•</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {arcMarketing.arcLaunchStrategy.launch && arcMarketing.arcLaunchStrategy.launch.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-[#10B981]">
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Launch (Week 0)</h4>
                <ul className="space-y-2">
                  {arcMarketing.arcLaunchStrategy.launch.map((tactic: string, idx: number) => (
                    <li key={idx} className="flex items-start text-[#e7e7e7]/80">
                      <span className="mr-2">•</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {arcMarketing.arcLaunchStrategy.postLaunch && arcMarketing.arcLaunchStrategy.postLaunch.length > 0 && (
              <div className="bg-[#2a2a2a] rounded-lg p-4 border-l-4 border-[#10B981]">
                <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Post-Launch (Ongoing)</h4>
                <ul className="space-y-2">
                  {arcMarketing.arcLaunchStrategy.postLaunch.map((tactic: string, idx: number) => (
                    <li key={idx} className="flex items-start text-[#e7e7e7]/80">
                      <span className="mr-2">•</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform Strategies */}
      {arcMarketing?.platformStrategies && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Platform-Specific Strategies</h3>
          <div className="space-y-4">
            {['tiktok', 'instagram', 'youtube'].map((platform) => {
              const platformData = arcMarketing.platformStrategies[platform]
              if (!platformData) return null

              return (
                <div key={platform} className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-md font-semibold text-[#e7e7e7] mb-3 capitalize">{platform}</h4>
                  
                  {platformData.contentFormat && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[#e7e7e7]/70 mb-1">Content Format:</p>
                      <p className="text-sm text-[#e7e7e7]/80">{platformData.contentFormat}</p>
                    </div>
                  )}

                  {platformData.postingSchedule && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[#e7e7e7]/70 mb-1">Posting Schedule:</p>
                      <p className="text-sm text-[#e7e7e7]/80">{platformData.postingSchedule}</p>
                    </div>
                  )}

                  {platformData.hashtagStrategy && platformData.hashtagStrategy.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#e7e7e7]/70 mb-2">Hashtag Strategy:</p>
                      <div className="flex flex-wrap gap-2">
                        {platformData.hashtagStrategy.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded-full text-xs bg-[#1a1a1a] text-[#e7e7e7]/70">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2">
                        <CopyButton
                          text={platformData.hashtagStrategy.map((t: string) => `#${t}`).join(' ')}
                          itemId={`${platform}-hashtags`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Story Bible Marketing Integration */}
      {storyBibleMarketing && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">From Story Bible Marketing Strategy</h3>
          <p className="text-sm text-[#e7e7e7]/70 mb-4">
            These are general marketing strategies from your story bible that apply to the entire series.
          </p>

          {storyBibleMarketing.marketingStrategy?.primaryApproach && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Primary Approach</h4>
              <p className="text-sm text-[#e7e7e7]/80">{storyBibleMarketing.marketingStrategy.primaryApproach}</p>
            </div>
          )}

          {storyBibleMarketing.marketingHooks?.seriesHooks && storyBibleMarketing.marketingHooks.seriesHooks.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Series Hooks</h4>
              <ul className="space-y-2">
                {storyBibleMarketing.marketingHooks.seriesHooks.slice(0, 3).map((hook: string, idx: number) => (
                  <li key={idx} className="text-sm text-[#e7e7e7]/80 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{hook}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!arcMarketing && !isGenerating && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📢</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Arc Marketing Data Yet</h3>
          <p className="text-[#e7e7e7]/70 mb-4">
            Click "Generate Marketing Strategy" to create arc-level marketing based on your episode content.
          </p>
          {storyBibleMarketing && (
            <p className="text-sm text-[#e7e7e7]/50">
              Check the Story Bible Marketing section for general marketing strategies.
            </p>
          )}
        </div>
      )}
      
      {isGenerating && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
          <div className="w-16 h-16 border-4 border-t-[#10B981] border-r-[#10B98150] border-b-[#10B98130] border-l-[#10B98120] rounded-full mb-4 animate-spin mx-auto"></div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">Generating Arc Marketing Strategy...</h3>
          <p className="text-[#e7e7e7]/70">
            Analyzing episode content and creating arc-level marketing strategy.
          </p>
        </div>
      )}
    </motion.div>
  )
}

