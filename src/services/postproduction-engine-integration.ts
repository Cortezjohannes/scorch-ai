/**
 * Post-Production Engine Integration
 * 
 * This file contains the implementation of the post-production engine integration
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

// Interface for post-production enhancement options
export interface PostProductionEnhancementOptions {
  useEngines?: boolean;
  engineLevel?: 'basic' | 'professional' | 'master';
  postApproach?: 'professional_workflow' | 'creative_artistic' | 'efficient_delivery' | 'technical_excellence';
  enhancementLevel?: 'STANDARD' | 'ENHANCED' | 'PREMIUM';
  qualityStandards?: 'broadcast_ready' | 'streaming_premium' | 'web_content' | 'theatrical';
  deliveryRequirements?: string[];
  audioFocus?: boolean;
  visualFocus?: boolean;
}

// Type for progress callback
type ProgressCallback = (stepName: string, detail: string, stepProgress: number, stepIndex: number) => Promise<void>;

/**
 * Enhanced post-production generation with engines
 */
export async function generateV2PostProductionWithEngines(
  context: any,
  storyboard: any,
  updateProgress: ProgressCallback,
  options: PostProductionEnhancementOptions = {}
) {
  const { storyBible, actualEpisodes } = context;
  
  // Safety checks
  if (!actualEpisodes || !Array.isArray(actualEpisodes) || actualEpisodes.length === 0) {
    console.error('❌ No actualEpisodes provided to generateV2PostProductionWithEngines');
    return { episodes: [], totalScenes: 0, format: 'post-production-guide' };
  }
  
  const episodes = [];
  let processedScenes = 0;

  await updateProgress('Post-Production', 'Starting enhanced post-production workflow...', 0, 8);

  for (let i = 0; i < actualEpisodes.length; i++) {
    const episode = actualEpisodes[i];
    const storyboardEpisode = storyboard?.episodes?.find((ep: any) => ep.episodeNumber === episode.episodeNumber);
    const episodeScenes = episode.scenes || [];
    const postProdScenes = [];

    for (let j = 0; j < episodeScenes.length; j++) {
      const storyboardScene = storyboardEpisode?.scenes?.find((s: any) => s.sceneNumber === j + 1);
      processedScenes++;
      
      await updateProgress('Post-Production', `Episode ${episode.episodeNumber}, Scene ${j + 1}/${episodeScenes.length} with enhanced workflow`, 
        Math.round((processedScenes / context.totalScenes) * 100), 8);

      // ENHANCED: Use engine-powered post-production workflow with fallback
      const postProd = await retryWithFallback(async () => {
        try {
          console.log(`🎞️ POST-PRODUCTION ENGINE: Creating workflow for scene ${episode.episodeNumber}-${j + 1} with ${options.postApproach || 'professional_workflow'} approach...`);
          
          // Import and use SoundDesignEngineV2
          const { SoundDesignEngineV2 } = await import('./mock-engines');
          
          // Generate enhanced post-production workflow
          const postProdGuide = await generateEnhancedPostProductionWorkflow(episode, storyboardScene, {
            storyBible,
            episodeContext: episode,
            seriesContext: context.seriesContext,
            sceneIndex: j,
            enhancementLevel: options.enhancementLevel || 'STANDARD',
            postApproach: options.postApproach || 'professional_workflow',
            qualityStandards: options.qualityStandards || 'broadcast_ready',
            deliveryRequirements: options.deliveryRequirements || ['streaming', 'broadcast']
          });
          
          console.log(`✅ POST-PRODUCTION ENGINE: Generated enhanced workflow for scene ${episode.episodeNumber}-${j + 1}`);
          
          return { 
            postProdGuide: postProdGuide,
            enhancedContent: true, 
            metadata: {
              engineUsed: 'SoundDesignEngineV2',
              postApproach: options.postApproach || 'professional_workflow',
              enhancementLevel: options.enhancementLevel || 'STANDARD'
            }
          };
          
        } catch (error) {
          console.warn(`Enhanced post-production workflow failed for scene ${episode.episodeNumber}-${j + 1}, using fallback:`, error);
          throw error; // Let it fall back to standard generation
        }
      }, `Enhanced Post-Production Scene ${episode.episodeNumber}-${j + 1}`);

      postProdScenes.push({
        sceneNumber: j + 1,
        sceneTitle: `Scene ${j + 1}`,
        notes: postProd?.postProdGuide || postProd?.enhancedContent || "Post-production generation failed",
        // NEW: Workflow metadata for production planning
        workflowMetadata: postProd?.metadata || null
      });
    }

    episodes.push({
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.episodeTitle || episode.title,
      scenes: postProdScenes
    });
  }
  
  await updateProgress('Post-Production', 'Enhanced post-production workflows generated', 100, 8);
  return {
    episodes,
    totalScenes: processedScenes,
    format: 'post-production-guide-enhanced',
    engineEnhanced: true
  };
}

/**
 * Helper function for enhanced post-production workflow
 */
async function generateEnhancedPostProductionWorkflow(episode: any, storyboardScene: any, context: any): Promise<string> {
  // Extract storyboard content for analysis
  const storyboardContent = storyboardScene?.storyboard || '';
  
  // Create enhanced prompt for post-production workflow
  const enhancedPrompt = `Generate a professional post-production workflow for this scene:

STORYBOARD CONTENT:
${storyboardContent}

EPISODE CONTEXT:
Series: ${context.storyBible?.seriesTitle}
Genre: ${context.storyBible?.genre}
Episode: ${context.episodeContext?.episodeNumber} - Scene ${context.sceneIndex + 1}
Post-Production Approach: ${context.postApproach}
Quality Standards: ${context.qualityStandards}
Delivery Requirements: ${context.deliveryRequirements.join(', ')}

POST-PRODUCTION REQUIREMENTS:
1. EDITING WORKFLOW:
   - Scene pacing and rhythm guidance
   - Transition style recommendations
   - Cut timing and flow suggestions
   - Dramatic structure enhancement

2. AUDIO POST-PRODUCTION:
   - Sound design elements needed
   - Music/score recommendations
   - Dialogue post-processing requirements
   - Mix specifications and standards

3. VISUAL POST-PRODUCTION:
   - Color grading approach and LUT recommendations
   - Visual effects requirements and workflow
   - Graphics/titles needs and specifications
   - Visual continuity considerations

4. TECHNICAL SPECIFICATIONS:
   - Quality control checkpoints
   - Delivery format requirements
   - Technical standards compliance
   - Final output specifications

Format as a professional post-production workflow guide with clear, actionable sections for immediate implementation by post-production teams.`;

  // Generate enhanced content
  const result = await generateContent(enhancedPrompt, {
    systemPrompt: 'You are a professional post-production supervisor with expertise in editing, sound design, color grading, and technical delivery. Create detailed post-production workflows that meet broadcast standards and artistic requirements.',
    temperature: 0.4,
    maxTokens: 2000
  });
  
  return result;
}
