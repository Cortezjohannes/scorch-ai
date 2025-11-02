/**
 * PRE-PRODUCTION V2 API - SEQUENTIAL GENERATION WITH COMPREHENSIVE ENGINES
 * 
 * This API generates all pre-production materials in a SEQUENTIAL order (not parallel).
 * Each tab builds on data from previous tabs for higher quality and coherence.
 * 
 * SEQUENTIAL GENERATION FLOW:
 * 1. NARRATIVE     → Copy existing episode content (passthrough)
 * 2. SCRIPTS       → Generate from Narrative with 8 engines (Dialogue, Strategic, Performance, Language, Canvas, Tension, Genre, Character)
 * 3. STORYBOARDS   → Generate from Scripts with 4 engines + AI images (Storyboard, Visual, Cinematography, VisualDesign)
 * 4. PROPS         → Generate from Storyboards with 3 engines + AI images (VisualDesign, WorldBuilding, Production)
 * 5. LOCATIONS     → Generate from Storyboards with 3 engines + AI images (Location, WorldBuilding, Production)
 * 6. CASTING       → Generate from Narrative with 3 engines + actor references (Casting, Character, PerformanceCoaching)
 * 7. MARKETING     → Generate from Narrative with 3 engines (Marketing, Genre, Audience)
 * 8. POST-PROD     → Generate from Storyboards with 2 engines (PostProduction, VisualStorytelling)
 * 
 * BENEFITS OF SEQUENTIAL GENERATION:
 * - Scripts use actual narrative content for better dialogue
 * - Storyboards use actual script dialogue for visual planning
 * - Props lists based on actual visual requirements from storyboards
 * - Locations based on actual prop and visual needs
 * - Higher coherence across all tabs
 * - Each tab can reference and improve upon previous work
 * 
 * NEW FEATURES:
 * - AI Image Generation: Storyboards, Props, and Locations get AI-generated reference images
 * - Actor References: Casting includes real-world actor inspiration (for fun/vibe)
 * - Comprehensive Engines: 14+ engines working together for maximum quality
 * - Creative Freedom: All suggestions are guides, not rigid requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateV2Scripts,
  generateV2Storyboards,
  generateV2Props, 
  generateV2Locations,
  generateV2Casting,
  generateV2Marketing,
  generateV2PostProduction
} from '@/services/preproduction-v2-generators';
import { savePreProductionV2 } from '@/services/preproduction-v2-service';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    console.log('🎬 PRE-PRODUCTION V2 - ENGINE-ENHANCED GENERATION (AZURE OPENAI + AI ENGINES)');
    
    const body = await request.json()
    const { 
      storyBible, 
      workspaceEpisodes = {}, 
      arcEpisodes = [], 
      userChoices = [], 
      arcIndex = 0,
      useEngines = false,  // DISABLED: Use standard generation (no engines)
      engineLevel = 'professional',  // Use professional level engines
      userId,  // For Firestore save
      storyBibleId,  // For Firestore save
      isSingleEpisodeMode = false,
      singleEpisodeNumber
    } = body
    
    if (!storyBible) {
      return NextResponse.json(
        { error: 'Story bible is required for pre-production planning' },
        { status: 400 }
      )
    }

    // Extract and validate episode data - prioritize arcEpisodes for current arc filtering
    const actualEpisodes = arcEpisodes && arcEpisodes.length > 0 
      ? arcEpisodes
      : Object.values(workspaceEpisodes).filter(Boolean).sort((a: any, b: any) => a.episodeNumber - b.episodeNumber);

    if (actualEpisodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No episodes found in workspace' },
        { status: 400 }
      );
    }

    console.log(`📖 Processing ${actualEpisodes.length} episodes for V2 pre-production`);
    console.log(`📋 Episodes to process:`, actualEpisodes.map((ep: any) => `${ep.episodeNumber}: ${ep.episodeTitle || ep.title}`));
    
    // V2 Generation Context - ENGINES DISABLED FOR TESTING
    const context = {
      storyBible,
      actualEpisodes,
      userChoices,
      arcIndex,
      useEngines: false,  // FORCE DISABLE
      totalEpisodes: actualEpisodes.length,
      totalScenes: actualEpisodes.reduce((total: number, ep: any) => total + (ep.scenes?.length || 3), 0)
    };

    console.log(`🎯 V2 Context: ${context.totalEpisodes} episodes, ${context.totalScenes} total scenes, ENGINES: ${context.useEngines}`);
    
    // V2 GENERATION
    const preProductionContent: any = {};
    
    const updateProgress = async (stepName: string, detail: string, stepProgress: number, stepIndex: number) => {
      console.log(`📊 ${stepName}: ${detail} (${stepProgress}%)`);
      
      // Send progress update to status API
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/preproduction-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            progress: {
              currentStep: stepIndex - 1, // Convert to 0-based index
              currentStepName: stepName,
              currentStepProgress: stepProgress,
              overallProgress: Math.round(((stepIndex - 1) * 100 + stepProgress) / 8),
              currentDetail: detail,
              isComplete: false
            }
          })
        });
      } catch (error) {
        console.warn('Failed to update progress:', error);
      }
    };

    // STEP 1: NARRATIVE - Copy existing episode content (1:1)
    console.log('📖 Step 1/8: NARRATIVE - Copying existing episode content...');
    await updateProgress('Narrative', 'Extracting episode content...', 50, 1);
    preProductionContent.narrative = extractNarrativeContent(actualEpisodes);
    await updateProgress('Narrative', 'Narrative content ready', 100, 1);
    console.log(`✅ NARRATIVE: ${actualEpisodes.length} episodes copied`);
    
    // STEP 2: SCRIPT - Generate per scene with COMPREHENSIVE ENGINE SUITE
    console.log('📝 Step 2/8: SCRIPT - Generating scene-by-scene scripts with 8 engines...');
    console.log('   Engines: DialogueV2, StrategicDialogue, PerformanceCoaching, Language, FiveMinuteCanvas, TensionEscalation, GenreMastery, CharacterV2');
    await updateProgress('Scripts', 'Starting script generation with comprehensive engines...', 0, 2);
    
    // 🎭 COMPREHENSIVE ENGINE-ENHANCED SCRIPT GENERATION
    const scriptEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      masterTechnique: 'mixed' as const,
      subtextLevel: 'moderate' as const,
      conflictIntensity: 7,
      useTensionEngine: true,
      tensionLevel: 'moderate' as const,
      usePerformanceEngine: true,
      useLanguageEngine: true,
      culturalContext: 'multicultural' as const,
      voiceDifferentiation: 'advanced' as const,
      useFormatEngine: true,
      useGenreMastery: true, // Added
      useCharacterEngine: true, // Added
      attentionStrategy: 'retention-maximized' as const,
      mode: 'beast' as const
    };
    
    const scriptResult = await generateV2Scripts(context, preProductionContent.narrative, updateProgress, scriptEngineOptions);
    preProductionContent.script = scriptResult;
    await updateProgress('Scripts', 'Scripts generated with 8-engine enhancement', 100, 2);
    console.log(`✅ SCRIPT: Generated ${scriptResult.totalScenes} scenes with comprehensive engine suite`);
    
    // STEP 3: STORYBOARD - Generate per scene with ENGINES + IMAGE GENERATION
    console.log('🎬 Step 3/8: STORYBOARD - Generating visual planning with AI images...');
    console.log('   Engines: StoryboardV2, VisualStorytelling, Cinematography, VisualDesign');
    console.log('   Images: Generating reference frames for each shot');
    await updateProgress('Storyboards', 'Starting storyboard and image generation...', 0, 3);
    
    // 🎨 ENGINE + IMAGE-ENHANCED STORYBOARD GENERATION
    const storyboardEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      cinematographerStyle: 'naturalistic' as const,
      enhancementLevel: 'STANDARD' as const,
      visualPriority: 'cinematic' as const,
      shotCompositionStyle: 'rule-of-thirds' as const,
      lightingMood: 'dramatic' as const,
      cameraMovementPreference: 'fluid' as const,
      genreConsideration: true,
      colorPsychologyFocus: true,
      generateImages: true, // NEW: Enable image generation
      imageQuality: 'standard' as const
    };
    
    const storyboardResult = await generateV2Storyboards(
      context, 
      preProductionContent.narrative, 
      preProductionContent.script, 
      updateProgress,
      storyboardEngineOptions
    );
    preProductionContent.storyboard = storyboardResult;
    await updateProgress('Storyboards', 'Storyboards with images generated', 100, 3);
    console.log(`✅ STORYBOARD: Generated ${storyboardResult.totalScenes} storyboards with AI reference images`);
    
    // STEP 4: PROPS - Generate per episode with ENGINES + IMAGE GENERATION
    console.log('👗 Step 4/8: PROPS - Generating props & wardrobe with AI images...');
    console.log('   Engines: VisualDesign, WorldBuilding, Production');
    console.log('   Images: Generating reference images for key props and costumes');
    await updateProgress('Props & Wardrobe', 'Starting props and image generation...', 0, 4);
    
    // 🎨 ENGINE + IMAGE-ENHANCED PROPS GENERATION
    const propsEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      designApproach: 'authentic_world_building' as const,
      enhancementLevel: 'STANDARD' as const,
      worldConsistency: true,
      budgetOptimization: true,
      narrativeIntegration: true,
      productionConstraints: ['budget_optimized', 'schedule_efficient'],
      visualStyle: storyBible.visualStyle || 'standard',
      generateImages: true, // NEW: Enable image generation
      imageQuality: 'standard' as const
    };
    
    const propsResult = await generateV2Props(
      context, 
      preProductionContent.narrative, 
      preProductionContent.storyboard, 
      updateProgress,
      propsEngineOptions
    );
    preProductionContent.props = propsResult;
    await updateProgress('Props & Wardrobe', 'Props with images generated', 100, 4);
    console.log(`✅ PROPS: Generated props for ${propsResult.episodes.length} episodes with AI images`);
    
    // STEP 5: LOCATIONS - Generate per episode with ENGINES + IMAGE GENERATION
    console.log('🏗️ Step 5/8: LOCATIONS - Generating location guides with AI images...');
    console.log('   Engines: Location, WorldBuilding, Production');
    console.log('   Images: Generating reference images for each location');
    await updateProgress('Locations', 'Starting location scouting and image generation...', 0, 5);
    
    // 🏗️ ENGINE + IMAGE-ENHANCED LOCATIONS GENERATION
    const locationsEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      scoutingApproach: 'narrative_driven' as const,
      enhancementLevel: 'STANDARD' as const,
      narrativeIntegration: true,
      technicalConsiderations: true,
      logisticsOptimization: true,
      budgetConstraints: true,
      visualRequirements: ['camera_friendly', 'lighting_optimized', 'production_efficient'],
      generateImages: true, // NEW: Enable image generation
      imageQuality: 'standard' as const
    };
    
    const locationResult = await generateV2Locations(
      context, 
      preProductionContent.narrative, 
      preProductionContent.storyboard, 
      updateProgress,
      locationsEngineOptions
    );
    preProductionContent.location = locationResult;
    await updateProgress('Locations', 'Locations with images generated', 100, 5);
    console.log(`✅ LOCATIONS: Generated locations for ${locationResult.episodes.length} episodes with AI images`);
    
    // STEP 6: CASTING - Generate once for entire arc with ENGINES + ACTOR REFERENCES
    console.log('🎭 Step 6/8: CASTING - Generating casting guide with actor inspiration...');
    console.log('   Engines: CastingV2, CharacterV2, PerformanceCoaching');
    console.log('   Features: Real-world actor references for vibe inspiration');
    await updateProgress('Casting', 'Starting casting analysis with actor references...', 0, 6);
    
    // 🎭 ENGINE + ACTOR REFERENCE-ENHANCED CASTING
    const castingEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      castingApproach: 'artistic_integrity' as const,
      performanceMethodology: 'practical' as const,
      enhancementLevel: 'STANDARD' as const,
      diversityOptimization: true,
      commercialConsideration: false,
      representationGoals: ['authentic', 'diverse', 'inclusive'],
      ensembleOptimization: true,
      riskAssessment: false,
      includeActorReferences: true, // NEW: Add real actor references for inspiration
      referencesPerCharacter: 2 // 2-3 actor vibes per character
    };
    
    const castingResult = await generateV2Casting(
      context, 
      preProductionContent.narrative, 
      updateProgress,
      castingEngineOptions
    );
    preProductionContent.casting = castingResult;
    await updateProgress('Casting', 'Casting guide with actor references generated', 100, 6);
    console.log(`✅ CASTING: Generated casting breakdown with fun actor inspiration`);
    
    // STEP 7: MARKETING - Generate per episode with ENGINE ENHANCEMENT
    console.log('📢 Step 7/8: MARKETING - Generating marketing per episode...');
    await updateProgress('Marketing', 'Starting marketing strategy...', 0, 7);
    
    // 📢 ENGINE-ENHANCED MARKETING GENERATION
    const marketingEngineOptions = {
      useEngines: false,  // FORCE DISABLE
      engineLevel,
      marketingApproach: 'neurochemical_optimization' as const,
      enhancementLevel: 'STANDARD' as const,
      contentStrategy: 'viral_optimized' as const,
      distributionChannels: ['streaming', 'social', 'traditional'],
      audienceSegmentation: true,
      engagementOptimization: true
    };
    
    const marketingResult = await generateV2Marketing(
      context, 
      preProductionContent.narrative, 
      updateProgress,
      marketingEngineOptions
    );
    preProductionContent.marketing = marketingResult;
    await updateProgress('Marketing', 'Marketing strategies generated for all episodes', 100, 7);
    console.log(`✅ MARKETING: Generated marketing for ${marketingResult?.episodes?.length || 0} episodes${(marketingResult as any).engineEnhanced ? ' with ENGINE ENHANCEMENT' : ''}`);
    
    // STEP 8: POST-PRODUCTION - Generate per scene based on storyboard with ENGINE ENHANCEMENT
    console.log('🎞️ Step 8/8: POST-PRODUCTION - Generating post-production per scene...');
    await updateProgress('Post-Production', 'Starting post-production planning...', 0, 8);
    
    // 🎞️ ENGINE-ENHANCED POST-PRODUCTION GENERATION
    const postProdEngineOptions = {
      useEngines,
      engineLevel,
      postApproach: 'professional_workflow' as const,
      enhancementLevel: 'STANDARD' as const,
      qualityStandards: 'broadcast_ready' as const,
      deliveryRequirements: ['streaming', 'broadcast', 'digital'],
      audioFocus: true,
      visualFocus: true
    };
    
    const postProdResult = await generateV2PostProduction(
      context, 
      preProductionContent.storyboard, 
      updateProgress,
      postProdEngineOptions
    );
    preProductionContent.postProduction = postProdResult;
    await updateProgress('Post-Production', 'Post-production guides generated for all scenes', 100, 8);
    console.log(`✅ POST-PRODUCTION: Generated guides for ${postProdResult?.totalScenes || 0} scenes${(postProdResult as any).engineEnhanced ? ' with ENGINE ENHANCEMENT' : ''}`);
    
    // Return complete V2 results
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    // Send final completion update
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/preproduction-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          progress: {
            currentStep: 7, // Last step (0-based)
            currentStepName: 'Complete',
            currentStepProgress: 100,
            overallProgress: 100,
            currentDetail: 'Pre-production complete!',
            isComplete: true
          }
        })
      });
    } catch (error) {
      console.warn('Failed to send completion update:', error);
    }
    
    console.log(`🎉 V2 PRE-PRODUCTION COMPLETE!`);
    console.log(`📊 V2 Results: ${actualEpisodes.length} episodes, ${scriptResult.totalScenes} scenes processed`);
    
    // Save to Firestore if authenticated
    let savedToFirestore = false
    if (userId && storyBibleId) {
      try {
        const arcOrEpisodeId = isSingleEpisodeMode 
          ? `episode_${singleEpisodeNumber}`
          : `arc_${arcIndex}`
        
        await savePreProductionV2(
          preProductionContent,
          storyBibleId,
          arcOrEpisodeId,
          userId
        )
        
        savedToFirestore = true
        console.log(`✅ Pre-production saved to Firestore: ${arcOrEpisodeId}`)
      } catch (error) {
        console.warn('⚠️ Failed to save to Firestore (localStorage will still work):', error)
        // Don't fail the request - localStorage backup will work
      }
    } else {
      console.log(`⚠️ Guest mode - pre-production will be saved to localStorage only`)
    }
    
    return NextResponse.json({
      success: true,
      preProduction: preProductionContent,
      episodesProcessed: actualEpisodes.length,
      scenesProcessed: scriptResult.totalScenes,
      version: 'V2',
      generationType: useEngines ? 'engine-enhanced-professional' : 'engineless-gpt-4.1-azure',
      generationTime: totalTime,
      quality: 'comprehensive-v2',
      savedToFirestore
    });

  } catch (error: any) {
    console.error('❌ V2 pre-production generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'V2 pre-production generation failed', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

// =================================================================
// V2 UTILITY FUNCTIONS
// =================================================================

// STEP 1: Extract Narrative Content (1:1 copy from episodes)
function extractNarrativeContent(episodes: any[]) {
  console.log('📖 Extracting narrative content from existing episodes...');
  
    return {
    episodes: episodes.map(ep => ({
      episodeNumber: ep.episodeNumber,
      episodeTitle: ep.episodeTitle || ep.title,
      synopsis: ep.synopsis,
      scenes: ep.scenes || [],
      rundown: ep.rundown,
      branchingOptions: ep.branchingOptions || [],
      chosenPath: ep.chosenPath
    })),
    totalEpisodes: episodes.length,
    totalScenes: episodes.reduce((total, ep) => total + (ep.scenes?.length || 3), 0),
    format: 'narrative-summary'
  };
}