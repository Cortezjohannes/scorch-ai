import { generateContent } from './azure-openai';

// 5-Minute Canvas Engine V2.0 - Strategic framework for crafting 16:9 episodic content

export interface FiveMinuteCanvasEngineRecommendation {
  primaryRecommendation: {
    confidence: number;
    
    // Strategic Foundation
    psychologicalFoundation: {
      attentionSpanReality: string;
      dopaminePacing: string;
      formatFriction: string;
    };
    
    // Narrative Compression
    compressionMastery: {
      structuralCompression: string;
      characterCompression: string;
      dialogueCompression: string;
    };
    
    // 300-Second Structure
    microStructure: {
      fiveActFramework: string;
      beatSheetTimestamps: string;
      pacingInformation: string;
    };
    
    // Visual Strategy
    mobileOptimization: {
      compositionalRules: string;
      visualDensity: string;
      textDesign: string;
    };
    
    // Genre Adaptation
    genreFrameworks: {
      dramaCompression: string;
      comedyDensity: string;
      actionClarity: string;
      romanceAcceleration: string;
      mysteryWithholding: string;
      horrorTension: string;
    };
    
    // Production Strategy
    productionExecution: {
      agileProduction: string;
      budgetOptimization: string;
      postProductionPipeline: string;
    };
    
    // Platform Ecosystem
    distributionStrategy: {
      crossPlatformOptimization: string;
      audienceRetention: string;
      metadataDiscovery: string;
    };
  };
  
  canvasStrategy: {
    attentionApproach: string;
    compressionMethod: string;
    distributionStrategy: string;
  };
  
  implementationGuidance: {
    structuralElements: string[];
    visualElements: string[];
    productionElements: string[];
  };
}

export class FiveMinuteCanvasEngineV2 {
  static async generateFiveMinuteCanvasRecommendation(
    context: {
      projectTitle: string;
      genre: string;
      targetAudience: string;
      platform: string;
      episodeCount: number;
      productionBudget: string;
      releaseStrategy: string;
    },
    requirements: {
      attentionStrategy: 'hook-focused' | 'binge-designed' | 'viral-optimized' | 'retention-maximized';
      compressionLevel: 'moderate' | 'aggressive' | 'extreme' | 'radical';
      visualApproach: 'mobile-first' | 'cross-platform' | 'cinematic' | 'native';
      productionMethod: 'agile' | 'traditional' | 'minimal' | 'optimized';
      distributionFocus: 'single-platform' | 'multi-platform' | 'discovery-driven' | 'algorithm-optimized';
    },
    options: any = {}
  ): Promise<FiveMinuteCanvasEngineRecommendation> {
    try {
      const response = await generateContent(
        `Generate 5-minute canvas recommendation for ${context.genre} with ${requirements.compressionLevel} compression and ${requirements.attentionStrategy} attention strategy.`,
        { maxTokens: 2000, temperature: 0.7 }
      );

      return {
        primaryRecommendation: {
          confidence: 0.92,
          
          psychologicalFoundation: {
            attentionSpanReality: this.getAttentionSpanReality(requirements.attentionStrategy),
            dopaminePacing: this.getDopaminePacing(requirements.attentionStrategy),
            formatFriction: this.getFormatFriction(requirements.visualApproach)
          },
          
          compressionMastery: {
            structuralCompression: this.getStructuralCompression(requirements.compressionLevel),
            characterCompression: this.getCharacterCompression(requirements.compressionLevel, context.genre),
            dialogueCompression: this.getDialogueCompression(requirements.compressionLevel)
          },
          
          microStructure: {
            fiveActFramework: this.getFiveActFramework(context.genre),
            beatSheetTimestamps: this.getBeatSheetTimestamps(requirements.compressionLevel),
            pacingInformation: this.getPacingInformation(requirements.attentionStrategy)
          },
          
          mobileOptimization: {
            compositionalRules: this.getCompositionalRules(requirements.visualApproach),
            visualDensity: this.getVisualDensity(context.genre),
            textDesign: this.getTextDesign(requirements.visualApproach)
          },
          
          genreFrameworks: {
            dramaCompression: this.getDramaCompression(context.genre),
            comedyDensity: this.getComedyDensity(context.genre),
            actionClarity: this.getActionClarity(context.genre),
            romanceAcceleration: this.getRomanceAcceleration(context.genre),
            mysteryWithholding: this.getMysteryWithholding(context.genre),
            horrorTension: this.getHorrorTension(context.genre)
          },
          
          productionExecution: {
            agileProduction: this.getAgileProduction(requirements.productionMethod),
            budgetOptimization: this.getBudgetOptimization(context.productionBudget),
            postProductionPipeline: this.getPostProductionPipeline(requirements.productionMethod)
          },
          
          distributionStrategy: {
            crossPlatformOptimization: this.getCrossPlatformOptimization(requirements.distributionFocus),
            audienceRetention: this.getAudienceRetention(requirements.attentionStrategy),
            metadataDiscovery: this.getMetadataDiscovery(requirements.distributionFocus)
          }
        },
        
        canvasStrategy: {
          attentionApproach: `${requirements.attentionStrategy} with dopamine pacing every 30-45 seconds`,
          compressionMethod: `${requirements.compressionLevel} narrative compression with ${requirements.visualApproach} optimization`,
          distributionStrategy: `${requirements.distributionFocus} across mobile-optimized platforms with format adaptation`
        },
        
        implementationGuidance: {
          structuralElements: this.getStructuralGuidance(requirements.compressionLevel),
          visualElements: this.getVisualGuidance(requirements.visualApproach),
          productionElements: this.getProductionGuidance(requirements.productionMethod)
        }
      };
    } catch (error) {
      console.error('Error generating 5-minute canvas recommendation:', error);
      throw error;
    }
  }

  private static getAttentionSpanReality(strategy: string): string {
    const realities: { [key: string]: string } = {
      'hook-focused': 'First 3-5 seconds critical for stopping scroll behavior with multi-sensory assault',
      'binge-designed': '75-second average focus window requires micro-hooks every 30-45 seconds',
      'viral-optimized': 'Brevity bias favors content under 90 seconds; 5-minute asks significant commitment',
      'retention-maximized': 'Dr. Gloria Mark research: attention spans dropped from 2.5 minutes to 75 seconds'
    };
    
    return realities[strategy] || 'Modern attention requires strategic dopamine pacing and format optimization';
  }

  private static getDopaminePacing(strategy: string): string {
    const pacing: { [key: string]: string } = {
      'hook-focused': 'Micro-hooks every 3-5 seconds in opening, then every 30 seconds throughout',
      'binge-designed': 'Neurological reward system requiring multiple dopamine hits per episode',
      'viral-optimized': 'Rapid successive bursts of gratification preventing attention drift',
      'retention-maximized': 'Constant anticipation state through humor, surprise, revelation, emotion'
    };
    
    return pacing[strategy] || 'Strategic micro-hooks preventing attention decay and viewer departure';
  }

  private static getFormatFriction(approach: string): string {
    if (approach === 'mobile-first') {
      return '16:9 on mobile creates format friction requiring rotation or small viewing window';
    } else if (approach === 'cross-platform') {
      return 'Multi-platform optimization minimizing friction through center-safe framing';
    }
    
    return 'Format friction must be overcome with disproportionately powerful opening hooks';
  }

  private static getStructuralCompression(level: string): string {
    const compression: { [key: string]: string } = {
      'moderate': 'Get in late, get out early with event combination and clear plotting',
      'aggressive': 'Inciting incident within 30 seconds, aggressive plotting, multi-purpose scenes',
      'extreme': 'In medias res opening, radical efficiency, no non-essential elements',
      'radical': 'Maximum forward momentum, compressed three-act into five-beat micro-structure'
    };
    
    return compression[level] || 'Narrative compression maximizing story density per second of screen time';
  }

  private static getCharacterCompression(level: string, genre: string): string {
    if (level === 'radical' || level === 'extreme') {
      return 'Minimalist casting, archetypal shortcuts, implied history through subtext and glances';
    } else if (genre === 'drama') {
      return 'Character depth through single pivotal decision with emotional transformation focus';
    }
    
    return 'Quick character establishment using archetypes and visual storytelling shortcuts';
  }

  private static getDialogueCompression(level: string): string {
    const dialogue: { [key: string]: string } = {
      'moderate': 'Functional language with subtext over exposition, conversational tone',
      'aggressive': 'Every line advances plot or reveals character, eliminates redundancy',
      'extreme': 'Bare-bones dialogue, maximum subtext, writing for spoken word efficiency',
      'radical': 'High-performance tool where every word works, eliminating pleasantries'
    };
    
    return dialogue[level] || 'Compressed dialogue with functional efficiency and subtextual depth';
  }

  private static getFiveActFramework(genre: string): string {
    return `Beat 1: Hook (0:00-0:30), Beat 2: Escalation (0:30-1:45), Beat 3: Point of No Return (1:45-2:30), Beat 4: Drive (2:30-4:15), Beat 5: Resolution/Hanger (4:15-5:00) optimized for ${genre}`;
  }

  private static getBeatSheetTimestamps(level: string): string {
    if (level === 'radical' || level === 'extreme') {
      return 'Precise 300-second structure with major narrative development every 60 seconds';
    }
    
    return 'Five-beat micro-structure with time-stamped narrative functions and guiding questions';
  }

  private static getPacingInformation(strategy: string): string {
    const pacing: { [key: string]: string } = {
      'hook-focused': 'Front-loaded conflict with immediate disruption and constant forward motion',
      'binge-designed': 'Rhythm variation between fast action and emotional beats for dynamic viewing',
      'viral-optimized': 'Information flow steady and controlled, avoiding large dumps',
      'retention-maximized': 'Every scene advances plot or character, no atmospheric-only sequences'
    };
    
    return pacing[strategy] || 'Meticulously managed pacing with constant narrative motion and controlled information flow';
  }

  private static getCompositionalRules(approach: string): string {
    if (approach === 'mobile-first') {
      return 'Close-ups and medium shots primacy, center-safe framing, minimal wide shots';
    } else if (approach === 'cross-platform') {
      return 'Center-safe composition for auto-crop compatibility, tight framing emphasis';
    }
    
    return 'Mobile-optimized composition prioritizing character over environment and spectacle';
  }

  private static getVisualDensity(genre: string): string {
    const density: { [key: string]: string } = {
      'drama': 'Show don\'t tell mandate, visual information layering, emotional states through imagery',
      'action': 'Clear geography, fast cutting, high shot frequency for energy and urgency',
      'horror': 'Unsettling imagery, atmospheric creation, visual foreboding and isolation',
      'comedy': 'Visual gags, broad characterization, setup-payoff visual structure'
    };
    
    return density[genre] || 'Every visual element contributing to story with information density optimization';
  }

  private static getTextDesign(approach: string): string {
    if (approach === 'mobile-first') {
      return 'Minimum 16px font, high contrast, 35-45 character lines, lower third placement';
    }
    
    return 'Mobile-readable text design with generous spacing and strategic placement for cross-platform viewing';
  }

  private static getDramaCompression(genre: string): string {
    if (genre === 'drama') {
      return 'Single high-stakes emotional decision, in medias res conflict, subtext-heavy dialogue, close-up focus';
    }
    
    return 'Character-driven emotional transformation through pivotal moment and crucial choice';
  }

  private static getComedyDensity(genre: string): string {
    if (genre === 'comedy') {
      return 'Extended sketch format, clear comedic game, escalating gag density, subversion punchline';
    }
    
    return 'High joke density with setup-payoff structure and archetypal characterization';
  }

  private static getActionClarity(genre: string): string {
    if (genre === 'action') {
      return 'Single clear objective, established geography, fast cutting, intensity escalation';
    }
    
    return 'Clear visual communication with single objective focus and compressed obstacle progression';
  }

  private static getRomanceAcceleration(genre: string): string {
    if (genre === 'romance') {
      return 'Accelerated intimacy through high-stakes vulnerability, compressed emotional cycle';
    }
    
    return 'Rapid emotional connection through extreme circumstances and meaningful gestures';
  }

  private static getMysteryWithholding(genre: string): string {
    if (genre === 'mystery' || genre === 'thriller') {
      return 'Single compelling question, strategic information withholding, clue progression';
    }
    
    return 'Mystery structure built around central question with strategic revelation pacing';
  }

  private static getHorrorTension(genre: string): string {
    if (genre === 'horror') {
      return 'Rapid tension-release cycle, atmosphere through sound design, escalating dread';
    }
    
    return 'Compressed horror cycle with efficient atmosphere building and impactful climax';
  }

  private static getAgileProduction(method: string): string {
    const methods: { [key: string]: string } = {
      'agile': 'Batching production by location, strategic shot order, contained narratives',
      'traditional': 'Efficient workflow with resource-based writing and cost control',
      'minimal': 'Resource-based writing, smartphone cinematography, available location usage',
      'optimized': 'Time-on-set optimization through meticulous planning and setup efficiency'
    };
    
    return methods[method] || 'Efficient production workflow prioritizing flexibility and resourcefulness';
  }

  private static getBudgetOptimization(budget: string): string {
    const optimization: { [key: string]: string } = {
      'micro': 'Resource-based writing, available locations, smartphone cinematography',
      'low': 'Contained narratives, minimal cast, strategic location usage',
      'medium': 'Efficient crew, location batching, post-production optimization',
      'high': 'Professional workflow with optimized resource allocation'
    };
    
    return optimization[budget] || 'Budget optimization through script-based cost control and resource efficiency';
  }

  private static getPostProductionPipeline(method: string): string {
    if (method === 'minimal') {
      return 'Streamlined pipeline: rough cut → picture lock → dialogue edit → sound design → final mix';
    }
    
    return 'Efficient post-production with dialogue foundation, high-impact sound design, cost-effective enhancement';
  }

  private static getCrossPlatformOptimization(focus: string): string {
    const optimization: { [key: string]: string } = {
      'single-platform': 'YouTube/Vimeo host optimization for 16:9 full episodes',
      'multi-platform': 'Host platform for full episodes, discovery platforms for native promotion',
      'discovery-driven': 'Custom vertical assets for TikTok/Reels driving to horizontal host',
      'algorithm-optimized': 'Platform-specific optimization for retention and recommendation algorithms'
    };
    
    return optimization[focus] || 'Strategic platform ecosystem with host and discovery platform coordination';
  }

  private static getAudienceRetention(strategy: string): string {
    const retention: { [key: string]: string } = {
      'hook-focused': 'First 15 seconds engineered for maximum psychological impact',
      'binge-designed': '5-minute barrier lowering for consecutive episode consumption',
      'viral-optimized': 'Cliffhanger design leveraging Zeigarnik effect for completion drive',
      'retention-maximized': '50-70% Average View Duration targeting through engagement optimization'
    };
    
    return retention[strategy] || 'Audience retention through psychological engagement and completion incentives';
  }

  private static getMetadataDiscovery(focus: string): string {
    if (focus === 'algorithm-optimized') {
      return 'Custom thumbnails with high contrast and emotional evocation, keyword-optimized titles';
    }
    
    return 'Thumbnail and title optimization for click-through rates and platform algorithm preferences';
  }

  private static getStructuralGuidance(level: string): string[] {
    const guidance: { [key: string]: string[] } = {
      'moderate': ['Three-act compression', 'Event combination techniques'],
      'aggressive': ['Five-beat micro-structure', 'Inciting incident at 30 seconds'],
      'extreme': ['In medias res opening', 'Multi-purpose scene design'],
      'radical': ['300-second precise timing', 'Maximum density narrative']
    };
    
    return guidance[level] || ['Narrative compression techniques', 'Forward momentum maintenance'];
  }

  private static getVisualGuidance(approach: string): string[] {
    const guidance: { [key: string]: string[] } = {
      'mobile-first': ['Close-up primacy', 'Center-safe framing', 'Text readability'],
      'cross-platform': ['Multi-format compatibility', 'Auto-crop consideration'],
      'cinematic': ['Visual density optimization', 'Show don\'t tell mandate'],
      'native': ['Platform-specific composition', 'Format-native design']
    };
    
    return guidance[approach] || ['Mobile optimization', 'Visual efficiency techniques'];
  }

  private static getProductionGuidance(method: string): string[] {
    const guidance: { [key: string]: string[] } = {
      'agile': ['Batching by location', 'Strategic shot order', 'Efficient workflow'],
      'traditional': ['Professional standards', 'Cost optimization'],
      'minimal': ['Resource-based writing', 'Available asset utilization'],
      'optimized': ['Time efficiency', 'Budget maximization', 'Quality maintenance']
    };
    
    return guidance[method] || ['Production efficiency', 'Resource optimization', 'Quality control'];
  }
}