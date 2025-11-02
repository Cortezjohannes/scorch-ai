/**
 * The Premise Engine - The Foundation of All Narrative
 * 
 * Based on Lajos Egri's premise equation: Character + Conflict → Resolution
 * This system ensures every story element serves to prove a central argument.
 * 
 * ENHANCEMENT V2.0: Now integrates with comprehensive premise development framework
 * - Foundational theories (McKee, Egri, Truby, Snyder, Vogler)
 * - Commercial viability assessment
 * - Thematic depth analysis
 * - Transmedia scalability
 * - Market positioning strategy
 */

import { generateContent } from './azure-openai'
import { PremiseEngineV2, type PremiseRecommendation } from './premise-engine-v2'

// Re-export V2 types for easier importing
export type { PremiseRecommendation } from './premise-engine-v2'

export interface StoryPremise {
  // The abstract, universal concept being explored
  theme: string; // e.g., "love", "redemption", "power", "truth"
  
  // The specific, testable argument the story will prove
  premiseStatement: string; // e.g., "Honesty defeats duplicity"
  
  // The logical structure of the premise
  premiseType: 'cause-effect' | 'opposing-values';
  
  // The three components of Egri's equation
  character: string; // The character trait/value that drives the story
  conflict: string; // The force that creates tension and tests the character
  resolution: string; // The predicted outcome that must be proven
  
  // Validation metrics
  isTestable: boolean; // Can this premise be proven through action?
  isSpecific: boolean; // Is it concrete enough to guide decisions?
  isArgued: boolean; // Does it make a clear statement?
  logline?: string;
}

export interface PremiseEquation {
  // The protagonist embodies the "winning" value
  protagonist: {
    coreValue: string; // e.g., "Honesty"
    relatedFlaw: string; // e.g., "Naivety" (makes them vulnerable)
    motivation: string; // Why they hold this value
  };
  
  // The antagonist embodies the "losing" value
  antagonist: {
    coreValue: string; // e.g., "Duplicity" 
    method: string; // How they use this value as a weapon
    motivation: string; // Why they embrace this value
  };
  
  // The testing ground where values clash
  conflictArena: {
    setting: string; // Where the conflict plays out
    stakes: string; // What happens if protagonist fails
    testScenarios: string[]; // Specific situations that test the premise
  };
  
  // The resolution that proves the premise
  expectedOutcome: {
    protagonistFate: string; // How they succeed/fail
    antagonistFate: string; // How they succeed/fail  
    worldChange: string; // How the world is different
    premiseProof: string; // How this proves the premise statement
  };
}

export interface PremiseValidation {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  strength: 'weak' | 'moderate' | 'strong';
}

export class PremiseEngine {
  
  /**
   * V2.0 ENHANCED: Generate comprehensive premise using advanced framework
   */
  static async generateComprehensivePremise(
    basicIdea: string,
    genre: string,
    format: 'feature' | 'limited_series' | 'ongoing_series' | 'franchise',
    targetAudience: string[],
    options: {
      thematicGoals?: string[];
      commercialObjectives?: string[];
      culturalContext?: string;
      platformTargets?: string[];
      analysisDepth?: 'basic' | 'comprehensive' | 'exhaustive';
    } = {}
  ): Promise<PremiseRecommendation> {
    
    console.log(`📖 PREMISE ENGINE V2.0: Generating comprehensive premise for ${format} ${genre}...`);
    
    try {
      // Use the advanced V2.0 engine for comprehensive analysis
      const premiseRecommendation = await PremiseEngineV2.generatePremiseRecommendations(
        {
          basicIdea,
          genre,
          format,
          targetAudience,
          inspirations: [] // Could be expanded in future
        },
        {
          thematicGoals: options.thematicGoals || ['universal_resonance', 'emotional_depth'],
          commercialObjectives: options.commercialObjectives || ['audience_engagement', 'market_viability'],
          culturalContext: options.culturalContext,
          platformTargets: options.platformTargets
        },
        {
          analysisDepth: options.analysisDepth || 'comprehensive',
          includeAlternatives: true,
          focusOnOriginality: true,
          emphasizeCommercialViability: true
        }
      );
      
      console.log(`✅ PREMISE ENGINE V2.0: Generated comprehensive framework with ${premiseRecommendation.primaryRecommendation.validation.overallValidation.totalScore}/10 validation score`);
      
      return premiseRecommendation;
      
    } catch (error) {
      console.error('❌ Premise Engine V2.0 failed:', error);
      throw new Error(`Comprehensive premise generation failed: ${error}`);
    }
  }
  
  /**
   * LEGACY SUPPORT: Generates a basic premise from user-provided theme and synopsis
   */
  static async generatePremise(theme: string, synopsis: string): Promise<StoryPremise> {
    try {
      // Use AI to generate the premise
      const aiResult = await this.generatePremiseWithAI(theme, synopsis);
      if (aiResult) {
        return aiResult;
      }
    } catch (error) {
      console.warn('AI premise generation failed, using fallback:', error);
    }
    
    // Fallback to original logic if AI fails
    return this.generatePremiseFallback(theme, synopsis);
  }

  /**
   * AI-POWERED: Generate premise using Azure OpenAI
   */
  private static async generatePremiseWithAI(theme: string, synopsis: string): Promise<StoryPremise | null> {
    const prompt = `Create a powerful, testable story premise based on Lajos Egri's premise theory.

THEME: "${theme}"
SYNOPSIS: "${synopsis}"

Generate a premise that follows Egri's equation: Character + Conflict → Resolution

Requirements:
1. The premise must be TESTABLE through dramatic action
2. It must be SPECIFIC and concrete, not vague
3. It must ARGUE for or against something
4. It should connect to the theme and story provided

Return ONLY a JSON object with this exact structure:

{
  "theme": "${theme}",
  "premiseStatement": "A clear, testable statement like 'Honesty defeats deception' or 'Greed leads to destruction'",
  "premiseType": "cause-effect" or "opposing-values",
  "character": "The character trait or value that drives the story",
  "conflict": "The force that creates tension and tests the character",
  "resolution": "The predicted outcome that will be proven",
  "isTestable": true,
  "isSpecific": true,
  "isArgued": true
}`;

    const systemPrompt = `You are a master story theorist specializing in Lajos Egri's premise theory. Create compelling, testable premises that serve as the foundation for great stories.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.6, // Balanced creativity and structure
        maxTokens: 400
      });

      // Clean and parse the JSON
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const premise = JSON.parse(cleanResult);
      
      // Validate the premise has required fields
      if (premise.premiseStatement && premise.character && premise.conflict && premise.resolution) {
        return premise as StoryPremise;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to parse AI premise generation:', error);
      return null;
    }
  }

  /**
   * FALLBACK: Original template-based premise generation
   */
  private static generatePremiseFallback(theme: string, synopsis: string): StoryPremise {
    // Extract the core conflict from the synopsis
    const coreConflict = this.extractCoreConflict(synopsis);
    
    // Determine premise type based on theme and conflict
    const premiseType = this.determinePremiseType(theme, coreConflict);
    
    // Generate the testable premise statement
    const premiseStatement = this.generatePremiseStatement(theme, coreConflict, premiseType);
    
    // Break down into Egri's equation components
    const { character, conflict, resolution } = this.parseEquationComponents(premiseStatement);
    
    return {
      theme,
      premiseStatement,
      premiseType,
      character,
      conflict,
      resolution,
      isTestable: this.isTestable(premiseStatement),
      isSpecific: this.isSpecific(premiseStatement),
      isArgued: this.isArgued(premiseStatement)
    };
  }
  
  /**
   * Expands premise into full equation for character/plot generation
   */
  static expandToEquation(premise: StoryPremise, synopsis: string): PremiseEquation {
    const protagonistValue = premise.character;
    const antagonistValue = this.deriveOpposingValue(protagonistValue);
    
    return {
      protagonist: {
        coreValue: protagonistValue,
        relatedFlaw: this.deriveRelatedFlaw(protagonistValue),
        motivation: this.deriveMotivation(protagonistValue, synopsis)
      },
      antagonist: {
        coreValue: antagonistValue,
        method: this.deriveAntagonistMethod(antagonistValue),
        motivation: this.deriveMotivation(antagonistValue, synopsis)
      },
      conflictArena: {
        setting: this.deriveConflictSetting(synopsis),
        stakes: this.deriveStakes(premise, synopsis),
        testScenarios: this.generateTestScenarios(premise, synopsis)
      },
      expectedOutcome: {
        protagonistFate: this.deriveProtagonistFate(premise),
        antagonistFate: this.deriveAntagonistFate(premise),
        worldChange: this.deriveWorldChange(premise, synopsis),
        premiseProof: this.derivePremiseProof(premise)
      }
    };
  }
  
  /**
   * Validates premise strength and coherence
   */
  static validatePremise(premise: StoryPremise): PremiseValidation {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check if premise is testable through action
    if (!premise.isTestable) {
      issues.push("Premise cannot be proven through dramatic action");
      recommendations.push("Rephrase premise to focus on actionable character traits");
    }
    
    // Check if premise is specific enough
    if (!premise.isSpecific) {
      issues.push("Premise is too vague to guide story decisions");
      recommendations.push("Make premise more specific and concrete");
    }
    
    // Check if premise makes a clear argument
    if (!premise.isArgued) {
      issues.push("Premise doesn't take a clear position");
      recommendations.push("Premise should argue for or against something");
    }
    
    // Determine strength
    let strength: 'weak' | 'moderate' | 'strong';
    if (issues.length === 0) {
      strength = 'strong';
    } else if (issues.length <= 2) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
      strength
    };
  }
  
  // Private helper methods
  
  private static extractCoreConflict(synopsis: string): string {
    // Simple extraction - in real implementation, this would use NLP
    const conflictKeywords = ['conflict', 'struggle', 'battle', 'fight', 'against', 'versus', 'challenge'];
    const sentences = synopsis.split(/[.!?]/);
    
    for (const sentence of sentences) {
      for (const keyword of conflictKeywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          return sentence.trim();
        }
      }
    }
    
    return "Characters face internal and external challenges";
  }
  
  private static determinePremiseType(theme: string, conflict: string): 'cause-effect' | 'opposing-values' {
    // If conflict mentions opposing forces, use opposing-values
    const oppositionWords = ['versus', 'against', 'battle', 'fight', 'conflict between'];
    const hasOpposition = oppositionWords.some(word => conflict.toLowerCase().includes(word));
    
    return hasOpposition ? 'opposing-values' : 'cause-effect';
  }
  
  private static generatePremiseStatement(theme: string, conflict: string, type: 'cause-effect' | 'opposing-values'): string {
    // This would be enhanced with AI generation in production
    const themeToValues: Record<string, {positive: string, negative: string}> = {
      'love': { positive: 'true love', negative: 'selfish desire' },
      'truth': { positive: 'honesty', negative: 'deception' },
      'power': { positive: 'responsible leadership', negative: 'corruption' },
      'redemption': { positive: 'forgiveness', negative: 'vengeance' },
      'courage': { positive: 'bravery', negative: 'cowardice' },
      'justice': { positive: 'fairness', negative: 'injustice' }
    };
    
    const values = themeToValues[theme.toLowerCase()] || { positive: 'virtue', negative: 'vice' };
    
    if (type === 'opposing-values') {
      return `${values.positive} defeats ${values.negative}`;
    } else {
      return `${values.positive} leads to redemption`;
    }
  }
  
  private static parseEquationComponents(premiseStatement: string): {character: string, conflict: string, resolution: string} {
    // Parse "X defeats Y" or "X leads to Y" format
    if (premiseStatement.includes(' defeats ')) {
      const [character, opponent] = premiseStatement.split(' defeats ');
      return {
        character: character.trim(),
        conflict: `Opposition from forces of ${opponent.trim()}`,
        resolution: `${character.trim()} prevails`
      };
    } else if (premiseStatement.includes(' leads to ')) {
      const [character, outcome] = premiseStatement.split(' leads to ');
      return {
        character: character.trim(),
        conflict: `Testing of ${character.trim()}`,
        resolution: outcome.trim()
      };
    }
    
    // Fallback parsing
    return {
      character: premiseStatement.split(' ')[0],
      conflict: "Character faces challenges",
      resolution: "Character grows"
    };
  }
  
  private static deriveOpposingValue(value: string): string {
    const oppositions: Record<string, string> = {
      'honesty': 'duplicity',
      'love': 'hate',
      'courage': 'cowardice',
      'justice': 'corruption',
      'forgiveness': 'vengeance',
      'humility': 'pride',
      'loyalty': 'betrayal',
      'wisdom': 'ignorance'
    };
    
    return oppositions[value.toLowerCase()] || 'opposition';
  }
  
  private static deriveRelatedFlaw(value: string): string {
    const flaws: Record<string, string> = {
      'honesty': 'naivety',
      'love': 'possessiveness', 
      'courage': 'recklessness',
      'justice': 'rigidity',
      'forgiveness': 'enabling',
      'humility': 'self-doubt',
      'loyalty': 'blindness',
      'wisdom': 'paralysis'
    };
    
    return flaws[value.toLowerCase()] || 'vulnerability';
  }
  
  private static deriveMotivation(value: string, synopsis: string): string {
    // Extract motivation context from synopsis
    return `Driven by deep belief in ${value} based on past experiences`;
  }
  
  private static deriveAntagonistMethod(value: string): string {
    const methods: Record<string, string> = {
      'duplicity': 'manipulation and lies',
      'hate': 'destruction and cruelty',
      'cowardice': 'avoidance and sabotage',
      'corruption': 'abuse of power',
      'vengeance': 'calculated revenge',
      'pride': 'arrogance and domination',
      'betrayal': 'breaking trust',
      'ignorance': 'willful blindness'
    };
    
    return methods[value.toLowerCase()] || 'opposition through conflict';
  }
  
  private static deriveConflictSetting(synopsis: string): string {
    // Extract setting from synopsis
    return "A world where the premise values will be tested";
  }
  
  private static deriveStakes(premise: StoryPremise, synopsis: string): string {
    return `If ${premise.character} fails, ${premise.resolution} cannot be achieved`;
  }
  
  private static generateTestScenarios(premise: StoryPremise, synopsis: string): string[] {
    return [
      `${premise.character} faces temptation to abandon their values`,
      `${premise.character} must choose between personal gain and principle`,
      `${premise.character} confronts the embodiment of opposing values`
    ];
  }
  
  private static deriveProtagonistFate(premise: StoryPremise): string {
    return `Succeeds by proving ${premise.premiseStatement}`;
  }
  
  private static deriveAntagonistFate(premise: StoryPremise): string {
    return `Fails because they embody the opposing values`;
  }
  
  private static deriveWorldChange(premise: StoryPremise, synopsis: string): string {
    return `World is restored/improved through the triumph of ${premise.character}`;
  }
  
  private static derivePremiseProof(premise: StoryPremise): string {
    return `The events demonstrate that ${premise.premiseStatement} is true`;
  }
  
  private static isTestable(statement: string): boolean {
    // Check if premise can be proven through dramatic action
    const actionWords = ['defeats', 'leads to', 'conquers', 'overcomes', 'achieves'];
    return actionWords.some(word => statement.includes(word));
  }
  
  private static isSpecific(statement: string): boolean {
    // Check if premise is concrete enough
    const vague = ['good', 'bad', 'things', 'stuff', 'somehow'];
    return !vague.some(word => statement.toLowerCase().includes(word));
  }
  
  private static isArgued(statement: string): boolean {
    // Check if premise takes a clear position
    return statement.includes('defeats') || statement.includes('leads to') || 
           statement.includes('conquers') || statement.includes('overcomes');
  }
} 