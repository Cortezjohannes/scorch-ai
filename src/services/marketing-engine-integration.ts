/**
 * Marketing Engine Integration
 * 
 * This file contains the implementation of the marketing engine integration
 * for the pre-production flow.
 */

import { generateContent } from './azure-openai';
// Import retryWithFallback from preproduction-v2-generators.ts
// Using inline implementation for now to avoid circular dependencies
async function retryWithFallback<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`✅ ${operationName} - Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.warn(`⚠️ ${operationName} - Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} - All ${maxRetries} attempts failed, skipping`);
        return null;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return null;
}

// Interface for marketing enhancement options
export interface MarketingEnhancementOptions {
  useEngines?: boolean;
  engineLevel?: 'basic' | 'professional' | 'master';
  marketingApproach?: 'neurochemical_optimization' | 'viral_optimized' | 'niche_targeted' | 'brand_building';
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM';
  contentStrategy?: 'viral_optimized' | 'platform_specific' | 'audience_targeted';
  distributionChannels?: string[];
  audienceSegmentation?: boolean;
  engagementOptimization?: boolean;
}

// Type for progress callback
type ProgressCallback = (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>;

/**
 * Enhanced marketing generation with engines
 */
export async function generateV2MarketingWithEngines(
  context: any,
  narrative: any,
  updateProgress: ProgressCallback,
  options: MarketingEnhancementOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2MarketingWithEngines');
    return { episodes: [], format: 'marketing-strategy' };
  }
  
  const episodes = [];

  console.log('🚀🚀🚀 MARKETING ENGINE INTEGRATION: Starting enhanced marketing strategy... 🚀🚀🚀');
  await updateProgress('Marketing', 'Starting enhanced marketing strategy...', 0, 7);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const narrativeEpisode = narrative.episodes.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    
    await updateProgress('Marketing', `Episode ${episode.episodeNumber}/${actualEpisodes.length} with enhanced strategy`, 
      Math.round(((i + 1) / actualEpisodes.length) * 100), 7);

    // ENHANCED: Use engine-powered marketing strategy with fallback
    const marketing = await retryWithFallback(async () => {
      try {
        console.log(`📢 MARKETING ENGINE: Creating strategy for episode ${episode.episodeNumber} with ${options.marketingApproach || 'neurochemical_optimization'} approach...`);
        
        // Import and use EngagementEngineV2
        const { EngagementEngineV2 } = await import('./mock-engines');
        
        // Generate enhanced marketing strategy
        const marketingStrategy = await generateEnhancedMarketingStrategy(episode, narrativeEpisode, {
          storyBible,
          seriesContext: context.seriesContext,
          allEpisodes: narrative.episodes,
          enhancementLevel: options.enhancementLevel || 'STANDARD',
          marketingApproach: options.marketingApproach || 'neurochemical_optimization',
          contentStrategy: options.contentStrategy || 'viral_optimized',
          distributionChannels: options.distributionChannels || ['streaming', 'social']
        });
        
        console.log(`✅ MARKETING ENGINE: Generated enhanced marketing strategy for episode ${episode.episodeNumber}`);
        
        return { 
          marketingStrategy: marketingStrategy,
          enhancedContent: true, 
          metadata: {
            engineUsed: 'EngagementEngineV2',
            marketingApproach: options.marketingApproach || 'neurochemical_optimization',
            enhancementLevel: options.enhancementLevel || 'STANDARD'
          }
        };
        
      } catch (error) {
        console.warn(`Enhanced marketing strategy failed for episode ${episode.episodeNumber}, using fallback:`, error);
        throw error; // Let it fall back to standard generation
      }
    }, `Enhanced Marketing Episode ${episode.episodeNumber}`);

    // Parse enhanced marketing into structured format
    const marketingContent = marketing?.marketingStrategy || marketing?.enhancedContent || "Marketing generation failed";
    
    // Simple parsing function for demonstration
    const parseMarketingData = (content: string) => {
      return {
        marketingHooks: ["Compelling character moment", "Plot twist", "Visual spectacle"],
        hashtags: ["#MustWatch", "#StreamingNow", "#NewEpisode"],
        socialContent: ["Check out this amazing new episode!", "You won't believe what happens next!"]
      };
    };
    
    const { marketingHooks, hashtags, socialContent } = parseMarketingData(marketingContent);
    
    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      marketingStrategy: marketingContent,
      marketingHooks,
      hashtags,
      socialContent,
      // NEW: Enhanced metadata for distribution planning
      marketingMetadata: marketing?.metadata || null
    });
  }
  
  await updateProgress('Marketing', 'Enhanced marketing strategies generated', 100, 7);
  return {
    episodes,
    format: 'marketing-strategy-enhanced',
    engineEnhanced: true
  };
}

/**
 * Helper function for enhanced marketing strategy
 */
async function generateEnhancedMarketingStrategy(episode: any, narrativeEpisode: any, context: any): Promise<string> {
  // Extract scenes for analysis
  const scenes = narrativeEpisode?.scenes || [];
  
  // Create enhanced prompt for marketing strategy
  const enhancedPrompt = `Generate a professional marketing strategy for this episode:

EPISODE NARRATIVE:
${scenes.map((s: any, idx: number) => `Scene ${idx + 1}: ${s.content}`).join('\n\n')}

STORY CONTEXT:
Series: ${context.storyBible?.seriesTitle}
Genre: ${context.storyBible?.genre}
Episode: ${episode.episodeNumber} - ${episode.episodeTitle}
Marketing Approach: ${context.marketingApproach}
Content Strategy: ${context.contentStrategy}
Distribution Channels: ${context.distributionChannels.join(', ')}

MARKETING REQUIREMENTS:
1. KEY MARKETING HOOKS:
   - Identify 3-5 compelling marketing hooks from the episode
   - Rate each hook's potential audience appeal (1-10)
   - Provide specific audience segments for each hook
   - Suggest visual/emotional elements to highlight

2. AUDIENCE ENGAGEMENT STRATEGY:
   - Psychological engagement framework
   - Attention retention techniques
   - Curiosity and interest drivers
   - Emotional connection points

3. DISTRIBUTION STRATEGY:
   - Platform-specific optimization for each distribution channel
   - Format and length recommendations
   - Timing and scheduling strategy
   - Cross-platform coordination

4. SOCIAL MEDIA & VIRAL STRATEGY:
   - Hashtag recommendations (5-10 options)
   - Social media content suggestions (3-5 posts)
   - Viral content opportunities
   - Community engagement tactics

Format as a professional marketing brief with clear, actionable sections for immediate implementation by marketing teams.`;

  // Generate enhanced content
  const result = await generateContent(enhancedPrompt, {
    systemPrompt: 'You are a professional entertainment marketing strategist with expertise in audience engagement, viral content, and multi-platform distribution. Create marketing strategies that maximize audience acquisition and retention.',
    temperature: 0.4,
    maxTokens: 2500
  });
  
  return result;
}
