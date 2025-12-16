'use client'

import React, { useState } from 'react'
import type { MarketingSection, EpisodeMarketingData } from '@/types/investor-materials'

interface CampaignPreviewProps {
  marketing: MarketingSection
}

// Helper component to render episode-specific marketing content
function EpisodeMarketingContent({ episodeData }: { episodeData: EpisodeMarketingData }) {
  return (
    <div className="space-y-6 pt-4">
      {/* Thumbnail Image/Video */}
      {episodeData.thumbnail?.imageUrl && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Thumbnail</h4>
          <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
            <img
              src={episodeData.thumbnail.imageUrl}
              alt="Episode thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Marketing Hooks */}
      {episodeData.marketingHooks && episodeData.marketingHooks.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Marketing Hooks</h4>
          <ul className="space-y-2">
            {episodeData.marketingHooks.map((hook, idx) => (
              <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                <span className="text-[#10B981] mt-1">•</span>
                <span>{hook}</span>
              </li>
            ))}
          </ul>
            </div>
      )}

      {/* Viral Potential Scenes */}
      {episodeData.viralPotentialScenes && episodeData.viralPotentialScenes.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Viral Potential Scenes</h4>
          <div className="space-y-3">
            {episodeData.viralPotentialScenes.map((scene, idx) => (
              <div key={idx} className="bg-[#0A0A0A] rounded-lg p-3 border border-white/10">
                <div className="flex items-start justify-between mb-2">
            <div>
                    <p className="text-white font-medium text-sm">Scene {scene.sceneNumber}</p>
                    <p className="text-white/60 text-xs">{scene.timestamp}</p>
                  </div>
                  <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] text-xs rounded">
                    {scene.platform}
                  </span>
            </div>
                <p className="text-white/80 text-sm mb-2">{scene.hook}</p>
                {scene.suggestedCaption && (
                  <p className="text-white/70 text-xs italic mb-1">"{scene.suggestedCaption}"</p>
                )}
                {scene.suggestedHashtags && scene.suggestedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scene.suggestedHashtags.map((tag, tagIdx) => (
                      <span key={tagIdx} className="text-[#10B981] text-xs">#{tag}</span>
                    ))}
          </div>
                )}
          </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Content */}
      {episodeData.platformContent && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Platform Content</h4>
          <div className="space-y-4">
            {episodeData.platformContent.tiktok && (
              <div>
                <p className="text-xs text-white/50 mb-2 uppercase">TikTok</p>
                <div className="space-y-2">
                  {episodeData.platformContent.tiktok.captions.map((caption, idx) => (
                    <p key={idx} className="text-white/80 text-sm">{caption}</p>
                  ))}
                  <div className="flex flex-wrap gap-1">
                    {episodeData.platformContent.tiktok.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-[#10B981] text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {episodeData.platformContent.instagram && (
              <div>
                <p className="text-xs text-white/50 mb-2 uppercase">Instagram</p>
                <div className="space-y-2">
                  {episodeData.platformContent.instagram.captions.map((caption, idx) => (
                    <p key={idx} className="text-white/80 text-sm">{caption}</p>
                  ))}
                  <div className="flex flex-wrap gap-1">
                    {episodeData.platformContent.instagram.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-[#10B981] text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {episodeData.platformContent.youtube && (
              <div>
                <p className="text-xs text-white/50 mb-2 uppercase">YouTube</p>
                <div className="space-y-2">
                  {episodeData.platformContent.youtube.captions.map((caption, idx) => (
                    <p key={idx} className="text-white/80 text-sm">{caption}</p>
                  ))}
                  <div className="flex flex-wrap gap-1">
                    {episodeData.platformContent.youtube.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-[#10B981] text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ready-to-Use Posts */}
      {episodeData.readyToUsePosts && episodeData.readyToUsePosts.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Ready-to-Use Posts</h4>
          <div className="space-y-3">
            {episodeData.readyToUsePosts.map((post, idx) => (
              <div key={idx} className="bg-[#0A0A0A] rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] text-xs rounded uppercase">
                    {post.platform}
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-2">{post.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="text-[#10B981] text-xs">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Also show standard marketing fields if present */}
      {(episodeData.targetAudience || episodeData.keySellingPoints || episodeData.loglines || episodeData.taglines || episodeData.socialMediaStrategy) && (
        <MarketingContent marketingData={episodeData as MarketingSection} />
      )}
    </div>
  )
}

// Helper component to render marketing content
type MarketingMode = 'overall' | 'arc' | 'episode'

function MarketingContent({
  marketingData,
  mode = 'episode'
}: {
  marketingData: MarketingSection | Partial<MarketingSection>
  mode?: MarketingMode
}) {
  const isOverall = mode === 'overall'
  const isArc = mode === 'arc'

  // Media helpers
  const pickUrl = (val?: string) => {
    if (typeof val !== 'string') return undefined
    if (val.startsWith('http') || val.startsWith('/')) return val
    return undefined
  }
  const extractMedia = (raw: any) => {
    if (!raw) return {}
    if (typeof raw === 'object') {
      const rawVideo = raw.videoUrl || raw.url
      const videoUrl =
        typeof rawVideo === 'string' && (rawVideo.startsWith('/api/veo3-video-proxy') || /\.(mp4|mov|m4v|webm)$/i.test(rawVideo) || rawVideo.includes(':download'))
          ? pickUrl(rawVideo)
          : undefined
      const imageUrl = pickUrl(raw.imageUrl || raw.posterImage || raw.src)
      const text =
        raw.text ||
        raw.prompt ||
        raw.description ||
        raw.title ||
        (typeof raw === 'object' && !videoUrl && !imageUrl ? JSON.stringify(raw) : undefined)
      return { videoUrl, imageUrl, text }
    }
    const str = String(raw)
    const isVideo =
      str.includes('/veo3-video-proxy') ||
      str.includes(':download') ||
      str.endsWith('.mp4') ||
      str.endsWith('.mov') ||
      str.endsWith('.webm')
    const isHttp = str.startsWith('http')
    return {
      videoUrl: isVideo ? str : undefined,
      imageUrl: !isVideo && isHttp ? str : undefined,
      text: !isHttp ? str : undefined
    }
  }

  const renderMedia = (raw: any, alt: string) => {
    const media = extractMedia(raw)
    if (media.videoUrl) {
      return (
        <div className="rounded-lg overflow-hidden border border-white/10">
          <video src={media.videoUrl} controls className="w-full h-auto" />
        </div>
      )
    }
    if (media.imageUrl) {
      return (
        <div className="rounded-lg overflow-hidden border border-white/10">
          <img src={media.imageUrl} alt={alt} className="w-full h-auto" />
        </div>
      )
    }
    if (media.text) {
      return <p className="text-white/80 text-sm">{media.text}</p>
    }
    return null
  }

  return (
    <div className="space-y-6 pt-4">
      {/* OVERALL MARKETING: Only show 6 specific fields */}
      {isOverall && (
        <>
          {/* Marketing Strategy Overview */}
          {marketingData.marketingStrategyOverview && (
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
              <h4 className="text-sm font-semibold text-white mb-3">Marketing Strategy Overview</h4>
              <p className="text-white/80 text-sm">{marketingData.marketingStrategyOverview}</p>
            </div>
          )}

          {/* Target Audience */}
          {marketingData.targetAudience && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h4 className="text-sm font-semibold text-white">Primary Audience</h4>
                </div>
                <p className="text-white/80 text-sm">{marketingData.targetAudience.primary}</p>
                </div>
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👥</span>
                  <h4 className="text-sm font-semibold text-white">Secondary Audience</h4>
            </div>
                <p className="text-white/80 text-sm">{marketingData.targetAudience.secondary}</p>
                </div>
                </div>
              )}

          {/* Key Selling Points */}
          {marketingData.keySellingPoints && marketingData.keySellingPoints.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
              <h4 className="text-sm font-semibold text-white mb-3">Key Selling Points</h4>
              <ul className="space-y-2">
                {marketingData.keySellingPoints.map((point, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-[#10B981] mt-1">•</span>
                    <span>{point}</span>
                      </li>
                    ))}
                  </ul>
            </div>
          )}


        </>
      )}

      {/* ARC MARKETING: Only show 3 specific fields */}
      {isArc && (
        <>
          {/* Marketing Strategy Overview */}
          {marketingData.marketingStrategyOverview && (
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
              <h4 className="text-sm font-semibold text-white mb-3">Marketing Strategy</h4>
              <p className="text-white/80 text-sm">{marketingData.marketingStrategyOverview}</p>
            </div>
          )}

          {/* Cross-Episode Marketing Themes */}
          {marketingData.crossEpisodeThemes && marketingData.crossEpisodeThemes.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
              <h4 className="text-sm font-semibold text-white mb-3">Cross-Episode Marketing Themes</h4>
              <ul className="space-y-2">
                {marketingData.crossEpisodeThemes.map((theme, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-[#10B981] mt-1">•</span>
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform Strategies */}
          {marketingData.platformStrategies && (
            <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20 space-y-4">
              <h4 className="text-sm font-semibold text-white mb-1">Platform-Specific Strategies</h4>
              {marketingData.platformStrategies.tiktok && (
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎵</span>
                    <p className="text-white font-semibold text-sm">TikTok</p>
                  </div>
                  {marketingData.platformStrategies.tiktok.contentFormat && (
                    <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.tiktok.contentFormat}</p>
                  )}
                  {(marketingData.platformStrategies.tiktok as any)?.postingSchedule && (
                    <p className="text-white/80 text-sm">Schedule: {(marketingData.platformStrategies.tiktok as any).postingSchedule}</p>
                  )}
                  {(marketingData.platformStrategies.tiktok as any)?.trends && (
                    <p className="text-white/80 text-sm">Trends: {(marketingData.platformStrategies.tiktok as any).trends}</p>
                  )}
                </div>
              )}
              {marketingData.platformStrategies.instagram && (
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📷</span>
                    <p className="text-white font-semibold text-sm">Instagram</p>
                  </div>
                  {marketingData.platformStrategies.instagram.contentFormat && (
                    <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.instagram.contentFormat}</p>
                  )}
                  {(marketingData.platformStrategies.instagram as any)?.postingSchedule && (
                    <p className="text-white/80 text-sm">Schedule: {(marketingData.platformStrategies.instagram as any).postingSchedule}</p>
                  )}
                  {(marketingData.platformStrategies.instagram as any)?.storytelling && (
                    <p className="text-white/80 text-sm">Storytelling: {(marketingData.platformStrategies.instagram as any).storytelling}</p>
                  )}
                </div>
              )}
              {marketingData.platformStrategies.youtube && (
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📺</span>
                    <p className="text-white font-semibold text-sm">YouTube</p>
                  </div>
                  {marketingData.platformStrategies.youtube.contentFormat && (
                    <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.youtube.contentFormat}</p>
                  )}
                  {(marketingData.platformStrategies.youtube as any)?.postingSchedule && (
                    <p className="text-white/80 text-sm">Schedule: {(marketingData.platformStrategies.youtube as any).postingSchedule}</p>
                  )}
                  {(marketingData.platformStrategies.youtube as any)?.seoStrategy && (
                    <p className="text-white/80 text-sm">SEO: {(marketingData.platformStrategies.youtube as any).seoStrategy}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* EPISODE MARKETING: Show all standard fields */}
      {!isOverall && !isArc && (
        <>
          {/* Audience Personas */}
          {marketingData.targetAudience && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <h4 className="text-sm font-semibold text-white">Primary Audience</h4>
            </div>
            <p className="text-white/80 text-sm">{marketingData.targetAudience.primary}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👥</span>
              <h4 className="text-sm font-semibold text-white">Secondary Audience</h4>
        </div>
            <p className="text-white/80 text-sm">{marketingData.targetAudience.secondary}</p>
          </div>
        </div>
      )}

      {/* Key Selling Points */}
      {marketingData.keySellingPoints && marketingData.keySellingPoints.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Key Selling Points</h4>
          <ul className="space-y-2">
            {marketingData.keySellingPoints.map((point, idx) => (
              <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                <span className="text-[#10B981] mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Loglines */}
      {marketingData.loglines && marketingData.loglines.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Loglines</h4>
          <div className="space-y-2">
            {marketingData.loglines.map((logline, idx) => (
              <p key={idx} className="text-white/80 text-sm">{logline}</p>
            ))}
          </div>
        </div>
      )}

      {/* Taglines */}
      {marketingData.taglines && marketingData.taglines.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Taglines</h4>
          <div className="space-y-2">
            {marketingData.taglines.map((tagline, idx) => (
              <p key={idx} className="text-white/80 text-sm italic">"{tagline}"</p>
            ))}
          </div>
        </div>
      )}

      {/* Social Media Strategy */}
      {marketingData.socialMediaStrategy && marketingData.socialMediaStrategy.platforms && marketingData.socialMediaStrategy.platforms.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Social Media Strategy</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/50 mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {marketingData.socialMediaStrategy.platforms.map((platform, idx) => (
                  <span
                key={idx}
                    className="px-3 py-1 bg-[#0A0A0A] rounded-lg border border-white/10 text-white/80 text-xs"
              >
                {platform}
                  </span>
                ))}
              </div>
            </div>
            {marketingData.socialMediaStrategy.contentApproach && (
              <div>
                <p className="text-xs text-white/50 mb-1">Content Approach</p>
                <p className="text-white/80 text-sm">{marketingData.socialMediaStrategy.contentApproach}</p>
              </div>
            )}
            {marketingData.socialMediaStrategy.engagementIdeas && marketingData.socialMediaStrategy.engagementIdeas.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Engagement Ideas</p>
                <ul className="space-y-1">
                  {marketingData.socialMediaStrategy.engagementIdeas.map((idea, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketing Strategy Overview */}
      {marketingData.marketingStrategyOverview && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Marketing Strategy Overview</h4>
          <p className="text-white/80 text-sm">{marketingData.marketingStrategyOverview}</p>
        </div>
      )}

      {/* Platform Strategies (Arc only) */}
      {isArc && marketingData.platformStrategies && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20 space-y-4">
          <h4 className="text-sm font-semibold text-white mb-1">Platform-Specific Strategies</h4>
          {marketingData.platformStrategies.tiktok && (
            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎵</span>
                <p className="text-white font-semibold text-sm">TikTok</p>
              </div>
              {marketingData.platformStrategies.tiktok.contentFormat && (
                <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.tiktok.contentFormat}</p>
              )}
              {marketingData.platformStrategies.tiktok.postingSchedule && (
                <p className="text-white/80 text-sm">Schedule: {marketingData.platformStrategies.tiktok.postingSchedule}</p>
              )}
              {marketingData.platformStrategies.tiktok.hashtagStrategy && marketingData.platformStrategies.tiktok.hashtagStrategy.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {marketingData.platformStrategies.tiktok.hashtagStrategy.map((tag, idx) => (
                    <span key={idx} className="text-[#10B981] text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {marketingData.platformStrategies.instagram && (
            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📸</span>
                <p className="text-white font-semibold text-sm">Instagram</p>
              </div>
              {marketingData.platformStrategies.instagram.contentFormat && (
                <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.instagram.contentFormat}</p>
              )}
              {marketingData.platformStrategies.instagram.postingSchedule && (
                <p className="text-white/80 text-sm">Schedule: {marketingData.platformStrategies.instagram.postingSchedule}</p>
              )}
              {marketingData.platformStrategies.instagram.gridAesthetic && (
                <p className="text-white/80 text-sm">Grid: {marketingData.platformStrategies.instagram.gridAesthetic}</p>
              )}
              {marketingData.platformStrategies.instagram.broadcastChannelStrategy && (
                <p className="text-white/80 text-sm">Broadcast: {marketingData.platformStrategies.instagram.broadcastChannelStrategy}</p>
              )}
              {marketingData.platformStrategies.instagram.hashtagStrategy && marketingData.platformStrategies.instagram.hashtagStrategy.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {marketingData.platformStrategies.instagram.hashtagStrategy.map((tag, idx) => (
                    <span key={idx} className="text-[#10B981] text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {marketingData.platformStrategies.youtube && (
            <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">▶️</span>
                <p className="text-white font-semibold text-sm">YouTube</p>
              </div>
              {marketingData.platformStrategies.youtube.contentFormat && (
                <p className="text-white/80 text-sm">Format: {marketingData.platformStrategies.youtube.contentFormat}</p>
              )}
              {marketingData.platformStrategies.youtube.seoTitleStrategy && (
                <p className="text-white/80 text-sm">SEO: {marketingData.platformStrategies.youtube.seoTitleStrategy}</p>
              )}
              {marketingData.platformStrategies.youtube.relatedVideoStrategy && (
                <p className="text-white/80 text-sm">Related: {marketingData.platformStrategies.youtube.relatedVideoStrategy}</p>
              )}
              {marketingData.platformStrategies.youtube.longevityStrategy && (
                <p className="text-white/80 text-sm">Longevity: {marketingData.platformStrategies.youtube.longevityStrategy}</p>
              )}
            </div>
          )}
        </div>
      )}
        </>
      )}

      {/* Visual Style */}
      {marketingData.visualStyle && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketingData.seriesPosterConcept && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Series Poster Concept</h4>
              {renderMedia(marketingData.seriesPosterConcept, 'Series poster')}
            </div>
          )}
          {marketingData.seriesTeaserTrailerConcept && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Series Teaser Trailer Concept</h4>
              {renderMedia(marketingData.seriesTeaserTrailerConcept, 'Series teaser')}
            </div>
          )}
        </div>
      )}

          {/* Visual Templates (only shown in episode-level / visual concepts) */}
          {!isOverall && !isArc && marketingData.visualTemplates && marketingData.visualTemplates.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Visual Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {marketingData.visualTemplates.map((tpl, idx) => (
                  <div key={idx} className="bg-[#0A0A0A] rounded-lg border border-white/10 p-3">
                    {renderMedia(tpl, 'Visual template')}
                  </div>
                ))}
              </div>
        </div>
      )}

      {/* Marketing Hooks */}
      {marketingData.marketingHooks && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Marketing Hooks</h4>
          <div className="space-y-3">
            {marketingData.marketingHooks.seriesHooks && marketingData.marketingHooks.seriesHooks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Series Hooks</p>
                <ul className="space-y-1">
                  {marketingData.marketingHooks.seriesHooks.map((hook, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {marketingData.marketingHooks.characterHooks && marketingData.marketingHooks.characterHooks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Character Hooks</p>
                <ul className="space-y-1">
                  {marketingData.marketingHooks.characterHooks.map((hook, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {marketingData.marketingHooks.episodeHooks && marketingData.marketingHooks.episodeHooks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Episode Hooks</p>
                <ul className="space-y-1">
                  {marketingData.marketingHooks.episodeHooks.map((hook, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UGC Strategy */}
      {marketingData.ugcStrategy && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20 space-y-3">
          <h4 className="text-sm font-semibold text-white mb-1">UGC Strategy</h4>
          {marketingData.ugcStrategy.actorMarketing && marketingData.ugcStrategy.actorMarketing.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Actor Marketing</p>
              <ul className="space-y-1">
                {marketingData.ugcStrategy.actorMarketing.map((item, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-[#10B981] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {marketingData.ugcStrategy.authenticityMaintenance && marketingData.ugcStrategy.authenticityMaintenance.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Authenticity</p>
              <ul className="space-y-1">
                {marketingData.ugcStrategy.authenticityMaintenance.map((item, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-[#10B981] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {marketingData.ugcStrategy.communityBuilding && marketingData.ugcStrategy.communityBuilding.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Community Building</p>
              <ul className="space-y-1">
                {marketingData.ugcStrategy.communityBuilding.map((item, idx) => (
                  <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                    <span className="text-[#10B981] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {marketingData.ugcStrategy.containerStrategy && (
            <div className="space-y-1">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Container Strategy</p>
              {marketingData.ugcStrategy.containerStrategy.showProfile && (
                <p className="text-white/80 text-sm">Show Profile: {marketingData.ugcStrategy.containerStrategy.showProfile}</p>
              )}
              {marketingData.ugcStrategy.containerStrategy.actorProfile && (
                <p className="text-white/80 text-sm">Actor Profile: {marketingData.ugcStrategy.containerStrategy.actorProfile}</p>
              )}
              {marketingData.ugcStrategy.containerStrategy.permeability && (
                <p className="text-white/80 text-sm">Permeability: {marketingData.ugcStrategy.containerStrategy.permeability}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Peer Casting Loop */}
      {marketingData.peerCastingLoop && (marketingData.peerCastingLoop.strategy || marketingData.peerCastingLoop.marketingDeliverables || marketingData.peerCastingLoop.multiplierEffect) && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20 space-y-2">
          <h4 className="text-sm font-semibold text-white mb-1">Peer Casting Loop</h4>
          {marketingData.peerCastingLoop.strategy && (
            <p className="text-white/80 text-sm">{marketingData.peerCastingLoop.strategy}</p>
          )}
          {marketingData.peerCastingLoop.marketingDeliverables && marketingData.peerCastingLoop.marketingDeliverables.length > 0 && (
            <ul className="space-y-1">
              {marketingData.peerCastingLoop.marketingDeliverables.map((item, idx) => (
                <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                  <span className="text-[#10B981] mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {marketingData.peerCastingLoop.multiplierEffect && (
            <p className="text-white/80 text-sm">Multiplier Effect: {marketingData.peerCastingLoop.multiplierEffect}</p>
          )}
        </div>
      )}

      {/* Cross-Episode Marketing Themes (Arc only) */}
      {isArc && marketingData.crossEpisodeThemes && marketingData.crossEpisodeThemes.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Cross-Episode Marketing Themes</h4>
          <ul className="space-y-1">
            {marketingData.crossEpisodeThemes.map((theme, idx) => (
              <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                <span className="text-[#10B981] mt-1">•</span>
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visual Style (hide for overall/arc) */}
      {!isOverall && !isArc && marketingData.visualStyle && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Visual Style</h4>
          <div className="space-y-2">
            {marketingData.visualStyle.colorPalette && (
              <div>
                <p className="text-xs text-white/50 mb-1">Color Palette</p>
                <p className="text-white/80 text-sm">{marketingData.visualStyle.colorPalette}</p>
              </div>
            )}
            {marketingData.visualStyle.imageryThemes && (
              <div>
                <p className="text-xs text-white/50 mb-1">Imagery Themes</p>
                <p className="text-white/80 text-sm">{marketingData.visualStyle.imageryThemes}</p>
              </div>
            )}
            {marketingData.visualStyle.posterConcepts && marketingData.visualStyle.posterConcepts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {marketingData.visualStyle.posterConcepts.map((concept, idx) => (
                      <div key={idx} className="bg-[#0A0A0A] rounded-lg border border-white/10 p-3">
                        {renderMedia(concept, 'Poster concept')}
                      </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Strategy (hide for overall/arc) */}
      {!isOverall && !isArc && marketingData.audioStrategy && (
        <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#10B981]/20">
          <h4 className="text-sm font-semibold text-white mb-3">Audio Strategy</h4>
          <div className="space-y-2">
            {marketingData.audioStrategy.musicGenre && (
              <div>
                <p className="text-xs text-white/50 mb-1">Music Genre</p>
                <p className="text-white/80 text-sm">{marketingData.audioStrategy.musicGenre}</p>
              </div>
            )}
            {marketingData.audioStrategy.soundDesign && (
              <div>
                <p className="text-xs text-white/50 mb-1">Sound Design</p>
                <p className="text-white/80 text-sm">{marketingData.audioStrategy.soundDesign}</p>
              </div>
            )}
            {marketingData.audioStrategy.voiceoverTone && (
              <div>
                <p className="text-xs text-white/50 mb-1">Voiceover Tone</p>
                <p className="text-white/80 text-sm">{marketingData.audioStrategy.voiceoverTone}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignPreview({ marketing }: CampaignPreviewProps) {
  if (!marketing) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-50">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Marketing Strategy Available</h3>
        <p className="text-white/70">Marketing strategy will appear here once it is generated.</p>
      </div>
    )
  }

  const hasAnyMarketing = marketing.seriesLevel || marketing.arcLevel || marketing.episodeLevel
  const episodeNumbers = marketing.episodeLevel ? Object.keys(marketing.episodeLevel).map(Number).sort((a, b) => a - b) : []

  const hasSeriesTab = !!marketing.seriesLevel
  const hasArcTab = !!marketing.arcLevel
  const hasEpisodeTab = episodeNumbers.length > 0

  const defaultTab =
    (hasSeriesTab && 'overall') ||
    (hasArcTab && 'arc') ||
    (hasEpisodeTab && 'episodes') ||
    'visual'
  const [activeTab, setActiveTab] = useState<'overall' | 'arc' | 'episodes' | 'visual'>(defaultTab as any)

  const defaultEpisodeTab = hasEpisodeTab ? `ep-${episodeNumbers[0]}` : ''
  const [activeEpisodeTab, setActiveEpisodeTab] = useState(defaultEpisodeTab)

  if (!hasAnyMarketing) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-50">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">No Marketing Strategy Available</h3>
        <p className="text-white/70">Marketing strategy will appear here once it is generated in Story Bible, Production Assistant, or Episode Pre-Production.</p>
      </div>
    )
  }

  // Visual concepts derivation (shared for tab presence and rendering)
  const deriveVisualData = () => {
    const firstEpisode = episodeNumbers.length > 0 && marketing.episodeLevel ? marketing.episodeLevel[episodeNumbers[0]] : undefined
        const visualSource: any =
          marketing.seriesLevel ||
          marketing.arcLevel ||
          firstEpisode ||
          marketing
        const visualAssets = visualSource?.visualAssets || (marketing as any)?.visualAssets

    if (!visualSource) return { hasContent: false }

    const normalizeVisualItem = (item: any) => {
      if (!item) return undefined
      if (Array.isArray(item)) return undefined
      const asString = typeof item === 'string' ? item : ''
      const urlLike = (val: string | undefined) =>
        val && (val.startsWith('http') || val.startsWith('/')) ? val : undefined
      const fileUrl =
        urlLike(asString) ||
        urlLike(item?.imageUrl) ||
        urlLike(item?.videoUrl) ||
        urlLike(item?.url) ||
        urlLike(item?.src)
      const isVideo = fileUrl
        ? /\.(mp4|mov|m4v|webm)$/i.test(fileUrl) ||
          fileUrl.includes('/api/veo3-video-proxy') ||
          fileUrl.includes(':download') ||
          item?.type === 'video'
        : item?.type === 'video'
      return {
        imageUrl: !isVideo ? fileUrl || item?.imageUrl : undefined,
        videoUrl: isVideo ? fileUrl : undefined,
        text: item?.caption || item?.title || item?.description || item?.prompt || item?.name || item?.text || (!isVideo ? asString : undefined),
        raw: item
      }
    }

    const pickBest = (items: any[]) => {
      let chosen: any = undefined
      for (const itm of items) {
        const n = normalizeVisualItem(itm)
        if (!n) continue
        if (!chosen) {
          chosen = n
          continue
        }
        const chosenScore = chosen.videoUrl ? 3 : chosen.imageUrl ? 2 : 1
        const nScore = n.videoUrl ? 3 : n.imageUrl ? 2 : 1
        if (nScore > chosenScore) chosen = n
      }
      return chosen
    }

    const derivedPosterConcept: any = pickBest([
      visualAssets?.seriesPoster,
      visualSource?.seriesPoster,
      visualSource?.seriesPosterConcept,
      visualSource?.poster,
      visualSource?.visualStyle?.posterConcepts?.[0]
    ])

    const derivedTeaserConcept: any = pickBest([
      visualAssets?.seriesTeaser,
      visualSource?.seriesTeaser,
      visualSource?.seriesTeaserTrailerConcept,
      visualSource?.teaserTrailer,
      visualSource?.trailerConcept
    ])

    const derivedTemplatesRaw =
      (visualSource?.visualTemplates && visualSource.visualTemplates.length > 0
        ? visualSource.visualTemplates
        : visualSource?.visualStyle?.posterConcepts) || []

    if (visualAssets?.platformTemplates) {
      const pt = visualAssets.platformTemplates
      if (Array.isArray(pt.characterSpotlights)) derivedTemplatesRaw.push(...pt.characterSpotlights)
      if (pt.campaignGraphics) {
        const cg = pt.campaignGraphics
        ;['launch', 'milestones', 'arcTransitions'].forEach((key) => {
          const arr = cg[key]
          if (Array.isArray(arr)) derivedTemplatesRaw.push(...arr)
        })
      }
    }

    const derivedTemplates = Array.isArray(derivedTemplatesRaw)
      ? Array.from(
          new Map(
            derivedTemplatesRaw
              .map(normalizeVisualItem)
              .filter(Boolean)
              .map((item: any) => {
                const key = item.imageUrl || item.videoUrl || item.text || JSON.stringify(item.raw || item)
                return [key, item]
              })
          ).values()
        )
      : []

    const hasContent =
      (derivedPosterConcept && (derivedPosterConcept.imageUrl || derivedPosterConcept.text)) ||
      (derivedTeaserConcept && (derivedTeaserConcept.imageUrl || derivedTeaserConcept.text)) ||
      (derivedTemplates && derivedTemplates.length > 0)

    return {
      hasContent,
      derivedPosterConcept,
      derivedTeaserConcept,
      derivedTemplates
    }
  }

  const visualData = deriveVisualData()
  const hasVisualTab = visualData?.hasContent !== false // Show tab even if empty, so user can see the section

  // Define navigation sections
  const sections = [
    ...(hasSeriesTab ? [{ id: 'overall', icon: '🎬', label: 'Overall Marketing' }] : []),
    ...(hasArcTab ? [{ id: 'arc', icon: '📖', label: 'Arc Marketing' }] : []),
    ...(hasEpisodeTab ? [{ id: 'episodes', icon: '🎥', label: 'Episode Marketing' }] : []),
    ...(hasVisualTab ? [{ id: 'visual', icon: '🖼️', label: 'Visual Concepts' }] : []),
  ]

  // Ensure activeTab is valid
  if (!sections.find(s => s.id === activeTab)) {
    if (sections.length > 0) {
      setActiveTab(sections[0].id as any)
    }
  }

  return (
    <div className="flex h-full min-h-[600px] bg-[#0A0A0A]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#121212] border-r border-[#10B981]/20 flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold text-white mb-4">Marketing Strategy</h2>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveTab(section.id as any)
                  if (section.id === 'episodes' && episodeNumbers.length > 0) {
                    setActiveEpisodeTab(`ep-${episodeNumbers[0]}`)
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === section.id
                    ? 'bg-[#10B981] text-black'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Episode sub-navigation (shown when episodes tab is active) */}
          {activeTab === 'episodes' && hasEpisodeTab && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3 px-3">Episodes</p>
              <nav className="space-y-1">
                {episodeNumbers.map((epNum) => {
                  const episodeMarketing = marketing.episodeLevel![epNum]
                  const label = `Episode ${epNum}${episodeMarketing.episodeTitle ? `: ${episodeMarketing.episodeTitle}` : ''}`
                  const value = `ep-${epNum}`
                  return (
                    <button
                      key={value}
                      onClick={() => setActiveEpisodeTab(value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        activeEpisodeTab === value
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                      <span className="truncate">{label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6 text-white/70">
            <span>📊 Marketing Strategy</span>
            <span>/</span>
            <span className="text-white">
              {sections.find(s => s.id === activeTab)?.label || 'Marketing'}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Overall Marketing */}
            {activeTab === 'overall' && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Overall Marketing</h2>
                  <p className="text-base text-white/70 mb-8">
                    Series-level marketing strategy and positioning.
                  </p>
                </div>
                {marketing.seriesLevel ? (
                  <MarketingContent marketingData={marketing.seriesLevel} mode="overall" />
                ) : (
                  <div className="text-white/70 text-sm bg-[#121212] border border-[#10B981]/20 rounded-lg p-6">
                    No overall marketing strategy available.
                  </div>
                )}
              </>
            )}

            {/* Arc Marketing */}
            {activeTab === 'arc' && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Arc Marketing</h2>
                  <p className="text-base text-white/70 mb-8">
                    Arc-level marketing themes and platform strategies.
                  </p>
                </div>
                {marketing.arcLevel ? (
                  <MarketingContent marketingData={marketing.arcLevel} mode="arc" />
                ) : (
                  <div className="text-white/70 text-sm bg-[#121212] border border-[#10B981]/20 rounded-lg p-6">
                    No arc marketing strategy available.
                  </div>
                )}
              </>
            )}

            {/* Episode Marketing */}
            {activeTab === 'episodes' && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Episode Marketing</h2>
                  <p className="text-base text-white/70 mb-8">
                    Episode-specific marketing content and strategies.
                  </p>
                </div>
                {hasEpisodeTab ? (
                  <div className="space-y-6">
                    {episodeNumbers.map((epNum) => {
                      const episodeMarketing = marketing.episodeLevel![epNum]
                      const value = `ep-${epNum}`
                      if (activeEpisodeTab !== value) return null
                      return (
                        <div key={value}>
                          <h3 className="text-xl font-bold text-white mb-4">
                            Episode {epNum}: {episodeMarketing.episodeTitle || `Episode ${epNum}`}
                          </h3>
                          <EpisodeMarketingContent episodeData={episodeMarketing} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-white/70 text-sm bg-[#121212] border border-[#10B981]/20 rounded-lg p-6">
                    No episode marketing available.
                  </div>
                )}
              </>
            )}

            {/* Visual Concepts */}
            {activeTab === 'visual' && (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Marketing Visual Concepts</h2>
                  <p className="text-base text-white/70 mb-8">
                    Series poster, teaser trailer, and visual templates.
                  </p>
                </div>
          <div className="bg-[#1A1A1A] rounded-lg border border-[#10B981]/30 p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🖼️</span>
              <span>Marketing Visual Concepts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Series Poster Concept</p>
                {visualData.derivedPosterConcept?.imageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <img src={visualData.derivedPosterConcept.imageUrl} alt="Series poster concept" className="w-full h-auto" />
                  </div>
                ) : (
                  <p className="text-white/80 text-sm">{visualData.derivedPosterConcept?.text || 'Not provided'}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">Series Teaser Trailer Concept</p>
                {visualData.derivedTeaserConcept?.videoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <video src={visualData.derivedTeaserConcept.videoUrl} controls className="w-full h-auto" />
                  </div>
                ) : visualData.derivedTeaserConcept?.imageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-white/10">
                    <img src={visualData.derivedTeaserConcept.imageUrl} alt="Series teaser trailer concept" className="w-full h-auto" />
                  </div>
                ) : (
                  <p className="text-white/80 text-sm">{visualData.derivedTeaserConcept?.text || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Visual Templates</p>
              {visualData.derivedTemplates && visualData.derivedTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {visualData.derivedTemplates.map((tpl: any, idx: number) => (
                    <div key={idx} className="bg-[#0A0A0A] rounded-lg border border-white/10 p-3">
                      {tpl.imageUrl && (
                        <div className="rounded-md overflow-hidden border border-white/10">
                          <img src={tpl.imageUrl} alt="Visual template" className="w-full h-auto" />
                        </div>
                      )}
                      {tpl.videoUrl && (
                        <div className="rounded-md overflow-hidden border border-white/10">
                          <video src={tpl.videoUrl} controls className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">Not provided</p>
              )}
            </div>

            {!visualData.hasContent && (
              <p className="text-white/50 text-xs">
                No visual concepts provided yet. Add poster, teaser, or templates to populate this section.
              </p>
            )}
          </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

