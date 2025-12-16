import { generateContent } from '@/services/azure-openai'

export interface ViralPotentialResult {
  viralMoments: Array<{
    sceneNumber: number
    timestamp: string // e.g., "00:15-00:30"
    description: string
    viralScore: number // 1-10
    hookVariations: string[] // 3-5 variations
    recommendedPlatform: 'tiktok' | 'instagram' | 'youtube'
    platformReason: string
    suggestedCaption: string
    suggestedHashtags: string[]
  }>
  topMoments: Array<{
    sceneNumber: number
    timestamp: string
    description: string
    viralScore: number
    hookVariations: string[]
    recommendedPlatform: 'tiktok' | 'instagram' | 'youtube'
    platformReason: string
    suggestedCaption: string
    suggestedHashtags: string[]
  }>
}

/**
 * Scan a script for viral moments using AI analysis
 * Identifies scenes with high viral potential and generates marketing content
 */
export async function scanViralPotential(
  script: string,
  episodeNumber: number,
  storyBible: any
): Promise<ViralPotentialResult> {
  const storyBibleMarketing = storyBible?.marketing || {}
  
  const prompt = `Analyze this episode script and identify scenes with high viral potential for social media marketing.

EPISODE SCRIPT:
${script}

EPISODE CONTEXT:
Episode Number: ${episodeNumber}
Series: ${storyBible?.seriesTitle || 'Unknown'}
Genre: ${storyBible?.genre || 'Drama'}

STORY BIBLE MARKETING CONTEXT:
Primary Approach: ${storyBibleMarketing.marketingStrategy?.primaryApproach || 'UGC actor-driven marketing'}
Target Audience: ${storyBibleMarketing.marketingStrategy?.targetAudience?.primary?.join(', ') || 'General audience'}

VIRAL POTENTIAL CRITERIA:
1. High Emotional Impact: Slaps, kisses, shocking reveals, dramatic confrontations, emotional breakdowns
2. Visual Appeal: Visually striking moments, dramatic gestures, expressive faces
3. Relatability: Moments that audiences can relate to or react to
4. Shareability: Moments that make people want to share or comment
5. Hook Potential: Moments that can be used as hooks to draw viewers in

PLATFORM RECOMMENDATIONS:
- TikTok: Quick, dramatic moments (0-60 seconds), trending audio potential, visual hooks
- Instagram: Professional clips (15-90 seconds), aesthetic appeal, story-driven
- YouTube: Longer clips (30-180 seconds), context-rich moments, SEO-friendly

For each viral moment, provide:
- Scene number and estimated timestamp (based on typical pacing: ~1 minute per scene)
- Viral score (1-10, where 10 is most viral)
- 3-5 hook variations for marketing
- Recommended platform with reasoning
- Ready-to-use caption
- Relevant hashtags (5-10)

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "viralMoments": [
    {
      "sceneNumber": 1,
      "timestamp": "00:15-00:30",
      "description": "Detailed description of why this moment is viral-worthy",
      "viralScore": 9,
      "hookVariations": [
        "Hook variation 1 (dramatic)",
        "Hook variation 2 (curiosity-driven)",
        "Hook variation 3 (emotional)",
        "Hook variation 4 (shocking)",
        "Hook variation 5 (relatable)"
      ],
      "recommendedPlatform": "tiktok",
      "platformReason": "Why this platform is best for this moment",
      "suggestedCaption": "Ready-to-use caption optimized for the recommended platform",
      "suggestedHashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
    }
  ],
  "topMoments": [
    {
      "sceneNumber": 1,
      "timestamp": "00:15-00:30",
      "description": "Top moment description",
      "viralScore": 9,
      "hookVariations": ["Hook 1", "Hook 2", "Hook 3"],
      "recommendedPlatform": "tiktok",
      "platformReason": "Reason",
      "suggestedCaption": "Caption",
      "suggestedHashtags": ["tag1", "tag2", "tag3"]
    }
  ]
}

IMPORTANT:
- Identify 5-10 viral moments per episode
- Top moments should be the top 3 highest-scoring moments
- Timestamps should be realistic based on script length (estimate ~1 minute per scene)
- Focus on moments that would perform well on social media
- Make captions platform-optimized (TikTok: short/hook-focused, Instagram: professional, YouTube: descriptive)`

  try {
    const result = await generateContent(prompt, {
      temperature: 0.7,
      maxTokens: 3000,
      systemPrompt: "You are a social media marketing expert specializing in identifying viral moments in episodic content. Analyze scripts for moments with high shareability and engagement potential."
    })

    // Parse JSON response
    const cleanedResult = result.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
    const parsed = JSON.parse(cleanedResult)

    // Validate and structure the response
    const viralMoments = Array.isArray(parsed.viralMoments) ? parsed.viralMoments : []
    const topMoments = Array.isArray(parsed.topMoments) 
      ? parsed.topMoments 
      : viralMoments
          .sort((a: any, b: any) => (b.viralScore || 0) - (a.viralScore || 0))
          .slice(0, 3)

    return {
      viralMoments: viralMoments.map((moment: any) => ({
        sceneNumber: moment.sceneNumber || 0,
        timestamp: moment.timestamp || '00:00-00:00',
        description: moment.description || '',
        viralScore: moment.viralScore || 0,
        hookVariations: Array.isArray(moment.hookVariations) ? moment.hookVariations : [],
        recommendedPlatform: ['tiktok', 'instagram', 'youtube'].includes(moment.recommendedPlatform)
          ? moment.recommendedPlatform
          : 'tiktok',
        platformReason: moment.platformReason || '',
        suggestedCaption: moment.suggestedCaption || '',
        suggestedHashtags: Array.isArray(moment.suggestedHashtags) ? moment.suggestedHashtags : []
      })),
      topMoments: topMoments.map((moment: any) => ({
        sceneNumber: moment.sceneNumber || 0,
        timestamp: moment.timestamp || '00:00-00:00',
        description: moment.description || '',
        viralScore: moment.viralScore || 0,
        hookVariations: Array.isArray(moment.hookVariations) ? moment.hookVariations : [],
        recommendedPlatform: ['tiktok', 'instagram', 'youtube'].includes(moment.recommendedPlatform)
          ? moment.recommendedPlatform
          : 'tiktok',
        platformReason: moment.platformReason || '',
        suggestedCaption: moment.suggestedCaption || '',
        suggestedHashtags: Array.isArray(moment.suggestedHashtags) ? moment.suggestedHashtags : []
      }))
    }
  } catch (error) {
    console.error('Error scanning viral potential:', error)
    // Return empty result on error
    return {
      viralMoments: [],
      topMoments: []
    }
  }
}

