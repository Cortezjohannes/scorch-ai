'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { EpisodePreProductionData } from '@/types/preproduction'
import { getStoryBible } from '@/services/story-bible-service'
import { scanViralPotential, type ViralPotentialResult } from '@/services/viral-potential-scanner'

interface EpisodeMarketingTabProps {
  preProductionData: EpisodePreProductionData
  onUpdate: (updates: Partial<EpisodePreProductionData>) => Promise<void>
  currentUserId: string
  currentUserName: string
  episodeData?: any
  narrativeEpisode?: any
}

export function EpisodeMarketingTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName,
  episodeData: episodeDataProp,
  narrativeEpisode: narrativeEpisodeProp
}: EpisodeMarketingTabProps) {
  const [storyBible, setStoryBible] = useState<any>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ViralPotentialResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const loadStoryBible = async () => {
      if (preProductionData.storyBibleId && currentUserId) {
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
  }, [preProductionData.storyBibleId, currentUserId])

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

  const episodeMarketing = preProductionData.marketing
  const storyBibleMarketing = storyBible?.marketing
  const episodeNumber = preProductionData.episodeNumber
  const episodeScript = preProductionData.scripts?.formattedScript || preProductionData.scripts?.rawScript || ''
  const episodeData = episodeDataProp || preProductionData
  const narrativeEpisode = narrativeEpisodeProp || preProductionData.narrative

  const handleGenerateMarketing = async () => {
    if (!storyBible || !episodeData) {
      alert('Story bible and episode data are required to generate marketing')
      return
    }

    setIsGenerating(true)
    try {
      console.log('📢 Generating episode marketing...')
      console.log('  Episode Number:', episodeNumber)
      console.log('  Has Story Bible:', !!storyBible)
      console.log('  Has Episode Data:', !!episodeData)
      console.log('  Has Narrative Episode:', !!narrativeEpisode)
      console.log('  Narrative Episode keys:', narrativeEpisode ? Object.keys(narrativeEpisode) : 'null')
      console.log('  Story Bible keys:', storyBible ? Object.keys(storyBible).slice(0, 10) : 'null')
      console.log('  Episode Data keys:', episodeData ? Object.keys(episodeData).slice(0, 10) : 'null')

      const requestBody = {
        storyBible,
        episode: episodeData,
        narrativeEpisode: narrativeEpisode || preProductionData.narrative || { scenes: [] },
        episodeNumber,
        preProductionData // Include full pre-production data so API can access scripts, breakdown, storyboards
      }
      
      console.log('📤 Sending request to /api/generate/episode-marketing')
      console.log('  Request body size:', JSON.stringify(requestBody).length, 'bytes')

      const response = await fetch('/api/generate/episode-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
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
        console.log('  Marketing hooks:', data.marketing.marketingHooks?.length || 0)
        console.log('  Viral scenes:', data.marketing.viralPotentialScenes?.length || 0)
        console.log('  Platform content:', Object.keys(data.marketing.platformContent || {}))
        
        const updatedMarketing = {
          episodeNumber: episodeNumber,
          ...data.marketing
        }
        
        console.log('  Updating with:', Object.keys(updatedMarketing))
        console.log('  Full marketing data:', JSON.stringify(updatedMarketing).substring(0, 500))
        
        // Update using the onUpdate callback - it expects Partial<EpisodePreProductionData>
        await onUpdate({ marketing: updatedMarketing })
        console.log('✅ Marketing data saved successfully')
        
        // Force component to re-read from preProductionData by triggering a state update
        // The parent component should handle this, but we'll add a small delay to ensure Firestore updates
        setTimeout(() => {
          console.log('🔄 Checking if data was saved...')
          console.log('  Current preProductionData.marketing:', preProductionData.marketing ? 'exists' : 'missing')
        }, 1000)
      } else {
        console.error('❌ Invalid response:', data)
        throw new Error(data.error || 'Invalid response from API')
      }
    } catch (error: any) {
      console.error('❌ Error generating episode marketing:', error)
      alert(`Failed to generate marketing: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScanViralPotential = async () => {
    if (!episodeScript || !storyBible) {
      alert('Script and story bible are required to scan for viral moments')
      return
    }

    setIsScanning(true)
    try {
      const result = await scanViralPotential(episodeScript, episodeNumber, storyBible)
      setScanResult(result)
      
      // Update pre-production data with viral moments
      if (result.viralMoments.length > 0) {
        const updatedMarketing = {
          ...episodeMarketing,
          viralPotentialScenes: result.viralMoments.map(moment => ({
            sceneNumber: moment.sceneNumber,
            timestamp: moment.timestamp,
            hook: moment.description,
            platform: moment.recommendedPlatform,
            suggestedCaption: moment.suggestedCaption,
            suggestedHashtags: moment.suggestedHashtags
          }))
        }
        await onUpdate({ marketing: updatedMarketing })
      }
    } catch (error) {
      console.error('Error scanning viral potential:', error)
      alert('Failed to scan for viral moments. Please try again.')
    } finally {
      setIsScanning(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#e7e7e7] mb-2">Episode {episodeNumber} Marketing</h2>
          <p className="text-base text-[#e7e7e7]/70">
            Episode-specific marketing strategy, hooks, and ready-to-use content for this episode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateMarketing}
            disabled={isGenerating || !storyBible || !episodeData}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isGenerating || !storyBible || !episodeData
                ? 'bg-[#2a2a2a] text-[#e7e7e7]/50 cursor-not-allowed'
                : 'bg-[#10B981] text-black hover:bg-[#059669]'
            }`}
            title={!storyBible || !episodeData ? 'Story bible and episode data required' : 'Generate marketing strategy'}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>{episodeMarketing ? 'Regenerate' : 'Generate'} Marketing</span>
              </>
            )}
          </button>
          {episodeScript && (
            <button
              onClick={handleScanViralPotential}
              disabled={isScanning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isScanning
                  ? 'bg-[#2a2a2a] text-[#e7e7e7]/50 cursor-not-allowed'
                  : 'bg-[#10B981] text-black hover:bg-[#059669]'
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Scan for Viral Moments</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Episode Thumbnail */}
      {episodeMarketing?.thumbnail && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#e7e7e7]">Episode Thumbnail</h3>
            <button
              onClick={async () => {
                if (!preProductionData || !storyBible) return
                try {
                  const response = await fetch('/api/generate/episode-thumbnail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      preProductionData,
                      episodeMarketing,
                      episodeNumber
                    })
                  })
                  if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.thumbnail) {
                      const updatedMarketing = {
                        ...episodeMarketing,
                        thumbnail: data.thumbnail
                      }
                      await onUpdate({ marketing: updatedMarketing })
                    } else if (!data.success) {
                      // Show helpful message when no frames with images are available
                      alert(data.error || 'No thumbnail could be generated. Make sure storyboard frames have images first.')
                    }
                  }
                } catch (error: any) {
                  console.error('Error regenerating thumbnail:', error)
                  alert(`Failed to regenerate thumbnail: ${error.message}`)
                }
              }}
              className="px-3 py-1 text-sm rounded bg-[#2a2a2a] text-[#e7e7e7] hover:bg-[#10B981]/20 hover:text-[#10B981] transition-colors"
            >
              🔄 Regenerate
            </button>
          </div>
          <div className="relative w-full max-w-md mx-auto">
            <img
              src={episodeMarketing.thumbnail.imageUrl}
              alt={`Episode ${episodeNumber} Thumbnail`}
              className="w-full h-auto rounded-lg"
            />
            {episodeMarketing.thumbnail.sceneNumber && (
              <p className="text-sm text-[#e7e7e7]/70 mt-2 text-center">
                Selected from Scene {episodeMarketing.thumbnail.sceneNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {!episodeMarketing?.thumbnail && preProductionData?.storyboards && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-semibold text-[#e7e7e7] mb-1">Episode Thumbnail</h3>
              <p className="text-sm text-[#e7e7e7]/70">Generate thumbnail from best storyboard frame</p>
            </div>
            <button
              onClick={async () => {
                if (!preProductionData || !storyBible) return
                try {
                  const response = await fetch('/api/generate/episode-thumbnail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      preProductionData,
                      episodeMarketing: episodeMarketing || {},
                      episodeNumber
                    })
                  })
                  if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.thumbnail) {
                      const updatedMarketing = {
                        ...(episodeMarketing || {}),
                        thumbnail: data.thumbnail
                      }
                      await onUpdate({ marketing: updatedMarketing })
                    } else if (!data.success) {
                      // Show helpful message when no frames with images are available
                      alert(data.error || 'No thumbnail could be generated. Make sure storyboard frames have images first.')
                    }
                  }
                } catch (error: any) {
                  console.error('Error generating thumbnail:', error)
                  alert(`Failed to generate thumbnail: ${error.message}`)
                }
              }}
              className="px-4 py-2 rounded-lg font-medium bg-[#10B981] text-black hover:bg-[#059669] transition-colors"
            >
              🎨 Generate Thumbnail
            </button>
          </div>
        </div>
      )}

      {/* Episode Marketing Hooks */}
      {episodeMarketing?.marketingHooks && episodeMarketing.marketingHooks.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Marketing Hooks</h3>
          <ul className="space-y-3">
            {episodeMarketing.marketingHooks.map((hook: string, idx: number) => (
              <li key={idx} className="flex items-start justify-between text-[#e7e7e7]/80">
                <div className="flex-1">
                  <span className="mr-2">•</span>
                  <span>{hook}</span>
                </div>
                <CopyButton text={hook} itemId={`episode-hook-${idx}`} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && scanResult.topMoments.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#10B981]/40 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#10B981] mb-4">✨ Top Viral Moments (Scan Results)</h3>
          <div className="space-y-4">
            {scanResult.topMoments.map((moment, idx) => (
              <div key={idx} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#10B981]/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-[#10B981]">Scene {moment.sceneNumber}</span>
                    <span className="ml-2 text-xs text-[#e7e7e7]/50">({moment.timestamp})</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-[#10B981]/20 text-[#10B981]">
                      Score: {moment.viralScore}/10
                    </span>
                  </div>
                  <span className="px-2 py-1 text-xs rounded bg-[#10B981]/20 text-[#10B981] capitalize">
                    {moment.recommendedPlatform}
                  </span>
                </div>
                <p className="text-[#e7e7e7]/80 mb-2">{moment.description}</p>
                <p className="text-xs text-[#e7e7e7]/60 mb-2 italic">{moment.platformReason}</p>
                {moment.hookVariations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                    <p className="text-sm font-medium text-[#e7e7e7]/70 mb-1">Hook Variations:</p>
                    <ul className="space-y-1">
                      {moment.hookVariations.map((hook, hIdx) => (
                        <li key={hIdx} className="text-xs text-[#e7e7e7]/70">• {hook}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {moment.suggestedCaption && (
                  <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                    <p className="text-sm font-medium text-[#e7e7e7]/70 mb-1">Suggested Caption:</p>
                    <p className="text-sm text-[#e7e7e7]/90 italic mb-2">{moment.suggestedCaption}</p>
                    <CopyButton text={moment.suggestedCaption} itemId={`scan-caption-${idx}`} />
                  </div>
                )}
                {moment.suggestedHashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {moment.suggestedHashtags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-1 rounded-full text-xs bg-[#1a1a1a] text-[#e7e7e7]/70">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viral Potential Scenes */}
      {episodeMarketing?.viralPotentialScenes && episodeMarketing.viralPotentialScenes.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Viral Potential Scenes</h3>
          <div className="space-y-4">
            {episodeMarketing.viralPotentialScenes.map((scene: any, idx: number) => (
              <div key={idx} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#10B981]/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-[#10B981]">Scene {scene.sceneNumber}</span>
                    {scene.timestamp && (
                      <span className="ml-2 text-xs text-[#e7e7e7]/50">({scene.timestamp})</span>
                    )}
                  </div>
                  {scene.platform && (
                    <span className="px-2 py-1 text-xs rounded bg-[#10B981]/20 text-[#10B981]">
                      {scene.platform}
                    </span>
                  )}
                </div>
                <p className="text-[#e7e7e7]/80 mb-2">{scene.hook || scene.description}</p>
                {scene.suggestedCaption && (
                  <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                    <p className="text-sm text-[#e7e7e7]/70 mb-1">Suggested Caption:</p>
                    <p className="text-sm text-[#e7e7e7]/90 italic">{scene.suggestedCaption}</p>
                    <CopyButton text={scene.suggestedCaption} itemId={`viral-caption-${idx}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform-Specific Content */}
      {episodeMarketing?.platformContent && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Platform-Specific Content</h3>
          <div className="space-y-4">
            {['tiktok', 'instagram', 'youtube'].map((platform) => {
              const platformData = episodeMarketing.platformContent[platform]
              if (!platformData || (!platformData.captions?.length && !platformData.hashtags?.length)) return null

              return (
                <div key={platform} className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-md font-semibold text-[#e7e7e7] mb-3 capitalize">{platform}</h4>
                  
                  {platformData.captions && platformData.captions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[#e7e7e7]/70 mb-2">Captions:</p>
                      <div className="space-y-2">
                        {platformData.captions.map((caption: string, idx: number) => (
                          <div key={idx} className="bg-[#1a1a1a] rounded p-2 flex items-start justify-between">
                            <p className="text-sm text-[#e7e7e7]/80 flex-1">{caption}</p>
                            <CopyButton text={caption} itemId={`${platform}-caption-${idx}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {platformData.hashtags && platformData.hashtags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#e7e7e7]/70 mb-2">Hashtags:</p>
                      <div className="flex flex-wrap gap-2">
                        {platformData.hashtags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded-full text-xs bg-[#1a1a1a] text-[#e7e7e7]/70">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2">
                        <CopyButton
                          text={platformData.hashtags.map((t: string) => `#${t}`).join(' ')}
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

      {/* Ready-to-Use Posts */}
      {episodeMarketing?.readyToUsePosts && episodeMarketing.readyToUsePosts.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">Ready-to-Use Posts</h3>
          <div className="space-y-4">
            {episodeMarketing.readyToUsePosts.map((post: any, idx: number) => (
              <div key={idx} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#10B981]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-xs rounded bg-[#10B981]/20 text-[#10B981] capitalize">
                    {post.platform}
                  </span>
                  <CopyButton text={`${post.caption}\n\n${post.hashtags?.map((t: string) => `#${t}`).join(' ') || ''}`} itemId={`ready-post-${idx}`} />
                </div>
                <p className="text-[#e7e7e7]/90 mb-2">{post.caption}</p>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-2 py-1 rounded-full text-xs bg-[#1a1a1a] text-[#e7e7e7]/70">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story Bible Marketing Integration */}
      {storyBibleMarketing && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#e7e7e7] mb-4">From Story Bible Marketing Strategy</h3>
          <p className="text-sm text-[#e7e7e7]/70 mb-4">
            These are general marketing strategies from your story bible that apply to all episodes.
          </p>

          {/* Episode Hooks from Story Bible */}
          {storyBibleMarketing.marketingHooks?.episodeHooks && storyBibleMarketing.marketingHooks.episodeHooks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-[#e7e7e7] mb-2">General Episode Hooks</h4>
              <ul className="space-y-2">
                {storyBibleMarketing.marketingHooks.episodeHooks.slice(0, 3).map((hook: string, idx: number) => (
                  <li key={idx} className="text-sm text-[#e7e7e7]/80 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{hook}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ready-to-Use Content Templates */}
          {storyBibleMarketing.readyToUseContent && (
            <div>
              <h4 className="text-md font-medium text-[#e7e7e7] mb-2">Content Templates</h4>
              <p className="text-sm text-[#e7e7e7]/70">
                Use the ready-to-use content templates from your story bible marketing section for platform-specific posts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!episodeMarketing && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📢</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Marketing Data Yet</h3>
          <p className="text-[#e7e7e7]/70 mb-4">
            Marketing strategy for this episode will be generated during pre-production generation.
          </p>
          {storyBibleMarketing && (
            <p className="text-sm text-[#e7e7e7]/50 mb-4">
              Check the Story Bible Marketing section for general marketing strategies.
            </p>
          )}
          {storyBible && episodeData && (
            <p className="text-sm text-[#e7e7e7]/50">
              Click the "Generate Marketing" button above to generate it now.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

