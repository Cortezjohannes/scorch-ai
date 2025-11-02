/**
 * Character Drafting Service - Stage 1 of Two-Stage Character Generation
 * 
 * This service extracts basic character information directly from the synopsis
 * before the 3D Character Engine enhances them with psychological depth.
 * 
 * Purpose: Ensure characters are RELEVANT to the story synopsis
 */

import { generateContent } from './azure-openai'

export interface CharacterDraft {
  name: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'secondary-antagonist' | 'love-interest' | 'mentor' | 'ally' | 'rival' | 'family' | 'friend' | 'authority-figure' | 'comic-relief' | 'wildcard' | 'ensemble';
  gender: string;
  description: string; // Brief description from synopsis context
  persona: string; // Basic personality traits from synopsis
  storyFunction: string; // Why this character exists in the story
  relationshipToProtagonist?: string; // How they relate to the main character
  fromSynopsis: boolean; // Whether explicitly mentioned in synopsis or inferred
}

export interface CharacterDraftCollection {
  explicitCharacters: CharacterDraft[]; // Characters directly mentioned in synopsis
  inferredCharacters: CharacterDraft[]; // Characters needed for the story to work
  totalCount: number;
  storyType: string; // e.g., "high school drama", "corporate thriller", etc.
  settingContext: string; // Age-appropriate context
}

export class CharacterDraftingService {

  /**
   * STAGE 1: Extract character information directly from synopsis
   */
  static async extractCharactersFromSynopsis(synopsis: string, theme: string): Promise<CharacterDraftCollection> {
    console.log('📝 STAGE 1: Extracting character drafts from synopsis...')
    
    const prompt = `Analyze this story synopsis and extract ALL characters that exist or are needed:

SYNOPSIS: "${synopsis}"
THEME: "${theme}"

Your job is to:
1. EXTRACT characters explicitly mentioned in the synopsis (use their exact names if given)
2. INFER additional characters needed to make this story work
3. Determine the story type/setting (high school, workplace, fantasy, etc.)
4. Create 8-12 total characters for a full story

CRITICAL RULES:
- If the synopsis mentions "high school" → characters should be teens (15-18)
- If characters have names in synopsis → USE THOSE EXACT NAMES
- If synopsis mentions relationships → preserve those relationships
- Create diverse, memorable names (avoid Maya, Mira, Elena, Soren, Alex, Jordan)
- Generate enough characters for a rich story (8-12 minimum)

Return this exact JSON structure:
{
  "storyType": "story genre/setting (e.g. 'high school drama', 'corporate thriller')",
  "settingContext": "age-appropriate setting context",
  "explicitCharacters": [
    {
      "name": "Character Name (from synopsis or memorable new name)",
      "role": "protagonist/deuteragonist/antagonist/secondary-antagonist/love-interest/mentor/ally/rival/family/friend/authority-figure/comic-relief/wildcard/ensemble",
      "gender": "character gender",
      "description": "brief description based on synopsis context",
      "persona": "basic personality from synopsis",
      "storyFunction": "why this character exists in the story",
      "relationshipToProtagonist": "how they relate to main character",
      "fromSynopsis": true
    }
  ],
  "inferredCharacters": [
    {
      "name": "Inferred Character Name",
      "role": "supporting role needed for story",
      "gender": "character gender", 
      "description": "why this character is needed",
      "persona": "basic personality type",
      "storyFunction": "story function they serve",
      "relationshipToProtagonist": "relationship to main character",
      "fromSynopsis": false
    }
  ]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a story analyst expert at extracting character information from story synopses. Always respect the synopsis context and character details. Return ONLY valid JSON, no explanations.',
        temperature: 0.3, // Lower temperature for more accurate extraction
        maxTokens: 2000
      });

      // Clean and parse the result
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const draftCollection = JSON.parse(cleanResult);
      
      // Validate and enhance the result
      if (draftCollection.explicitCharacters && draftCollection.inferredCharacters) {
        draftCollection.totalCount = draftCollection.explicitCharacters.length + draftCollection.inferredCharacters.length;
        
        console.log(`✅ Extracted ${draftCollection.explicitCharacters.length} explicit characters from synopsis`);
        console.log(`✅ Inferred ${draftCollection.inferredCharacters.length} additional characters needed`);
        console.log(`✅ Total: ${draftCollection.totalCount} characters for ${draftCollection.storyType}`);
        
        return draftCollection;
      }
      
      return this.generateFallbackDrafts(synopsis, theme);
    } catch (error) {
      console.warn('Character extraction failed, using fallback:', error);
      return this.generateFallbackDrafts(synopsis, theme);
    }
  }

  /**
   * AI-DRIVEN CHARACTER COUNT: Let AI determine optimal character count based on story needs
   */
  static async getOptimalCharacterCount(
    storyType: string, 
    synopsis: string,
    theme: string,
    totalFromSynopsis: number
  ): Promise<{ min: number, max: number, optimal: number }> {
    console.log('🤖 Asking AI to determine optimal character count...');
    
    const prompt = `Analyze this story and determine the optimal number of characters:

SYNOPSIS: ${synopsis}
THEME: ${theme}
STORY TYPE: ${storyType}
CHARACTERS ALREADY IDENTIFIED: ${totalFromSynopsis}

Based on this story's:
- Scope and complexity
- Number of plotlines that need exploration
- World-building requirements
- Theme depth
- Genre conventions
- Narrative needs

Determine the OPTIMAL character count. Consider:
- Too few characters = thin story
- Too many characters = diluted focus
- Different stories need different cast sizes

Return ONLY a JSON object:
{
  "min": <minimum characters needed>,
  "max": <maximum before it gets crowded>,
  "optimal": <ideal number for THIS specific story>,
  "reasoning": "<one sentence why>"
}`;

    try {
      const response = await generateContent(prompt, {
        systemPrompt: 'You are a master story architect. Determine optimal character counts based on specific story needs. Return valid JSON only.',
        temperature: 0.7,
        maxTokens: 300,
        model: 'gpt-4.1' as any
      });

      const parsed = JSON.parse(response);
      console.log(`✅ AI determined optimal count: ${parsed.optimal} characters (${parsed.reasoning})`);
      
      return {
        min: parsed.min || 5,
        max: parsed.max || 15,
        optimal: parsed.optimal || totalFromSynopsis || 8
      };
    } catch (error) {
      console.warn('⚠️ AI character count failed, using intelligent fallback based on synopsis length');
      
      // Intelligent fallback based on story complexity indicators
      const hasMultiplePlotlines = synopsis.includes('and') && synopsis.includes('while');
      const isEpic = synopsis.length > 300 || synopsis.includes('world') || synopsis.includes('journey');
      const isIntimate = synopsis.length < 150 || synopsis.includes('family') || synopsis.includes('couple');
      
      let optimal = totalFromSynopsis;
      if (isIntimate) optimal = Math.max(totalFromSynopsis, 6);
      else if (isEpic) optimal = Math.max(totalFromSynopsis, 12);
      else if (hasMultiplePlotlines) optimal = Math.max(totalFromSynopsis, 9);
      else optimal = Math.max(totalFromSynopsis, 8);
      
      return {
        min: Math.max(5, totalFromSynopsis),
        max: Math.min(20, optimal + 5),
        optimal: Math.min(optimal, 20)
      };
    }
  }

  /**
   * Smart character expansion based on story needs
   */
  static async expandCharacterRoles(drafts: CharacterDraft[], synopsis: string, theme: string = ''): Promise<CharacterDraft[]> {
    console.log('🎭 DYNAMIC CHARACTER EXPANSION: Analyzing story needs...')
    
    const storyType = this.detectStoryType(synopsis);
    const currentCount = drafts.length;
    const charGuidelines = await this.getOptimalCharacterCount(storyType, synopsis, theme, currentCount);
    
    console.log(`📊 Story Type: ${storyType}`);
    console.log(`📊 Current Characters: ${currentCount}`);
    console.log(`📊 Optimal Range: ${charGuidelines.min}-${charGuidelines.max} (target: ${charGuidelines.optimal})`);
    
    // If we're already at or above optimal, don't add more
    if (currentCount >= charGuidelines.optimal) {
      console.log(`✅ Character count (${currentCount}) is already optimal for ${storyType}`);
      return drafts;
    }
    
    // Calculate how many to add
    const charactersToAdd = Math.min(
      charGuidelines.optimal - currentCount, // Don't exceed optimal
      charGuidelines.max - currentCount,     // Don't exceed max
      4 // Never add more than 4 at once to avoid overwhelming
    );
    
    if (charactersToAdd <= 0) {
      console.log('✅ No additional characters needed');
      return drafts;
    }
    
    console.log(`🎯 Adding ${charactersToAdd} characters to reach optimal count`);
    
    const existingRoles = drafts.map(d => d.role);
    const existingNames = drafts.map(d => d.name);
    
    // Prioritize roles needed for this story type
    const rolesByPriority = this.getRolesByPriority(storyType, existingRoles);
    const neededRoles = rolesByPriority.slice(0, charactersToAdd);

    const prompt = `Create ${charactersToAdd} additional characters for this ${storyType}:

EXISTING CHARACTERS: ${existingNames.join(', ')}
SYNOPSIS: "${synopsis}"
TARGET ROLES: ${neededRoles.join(', ')}
STORY TYPE: ${storyType} (needs ${charGuidelines.optimal} total characters)

Create exactly ${charactersToAdd} characters that:
1. Fill the most important missing story functions for ${storyType}
2. Are essential to the story, not just filler
3. Have distinct personalities and clear purposes
4. Create meaningful relationships and conflicts

Return array of characters:
[
  {
    "name": "Memorable Character Name",
    "role": "one of: ${neededRoles.join('/')}",
    "gender": "character gender",
    "description": "essential role in ${storyType}",
    "persona": "distinct personality",
    "storyFunction": "why this character is necessary",
    "relationshipToProtagonist": "how they relate to main character",
    "fromSynopsis": false
  }
]`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: `You are a ${storyType} expert. Create only the most essential characters needed for compelling storytelling. Return ONLY valid JSON array.`,
        temperature: 0.4, // Lower temperature for more focused results
        maxTokens: 1500
      });

      const cleanResult = result?.replace(/^[^[]*/, '').replace(/[^\]]*$/, '') || '[]';
      const additionalCharacters = JSON.parse(cleanResult);
      
      if (Array.isArray(additionalCharacters) && additionalCharacters.length > 0) {
        const actualAdded = Math.min(additionalCharacters.length, charactersToAdd);
        console.log(`✅ Added ${actualAdded} essential characters for ${storyType}`);
        console.log(`🎯 Final count: ${currentCount + actualAdded} (optimal for ${storyType})`);
        return [...drafts, ...additionalCharacters.slice(0, charactersToAdd)];
      }
      
      return drafts;
    } catch (error) {
      console.warn('Smart character expansion failed:', error);
      return drafts;
    }
  }

  /**
   * Get prioritized roles for different story types
   */
  private static getRolesByPriority(storyType: string, existingRoles: string[]): string[] {
    const rolePriorities: Record<string, string[]> = {
      'high school drama': ['love-interest', 'rival', 'friend', 'authority-figure', 'family', 'comic-relief'],
      'college drama': ['love-interest', 'rival', 'mentor', 'friend', 'authority-figure', 'comic-relief'],
      'workplace drama': ['mentor', 'rival', 'authority-figure', 'ally', 'love-interest', 'comic-relief'],
      'family drama': ['family', 'love-interest', 'mentor', 'friend', 'authority-figure', 'rival'],
      'crime drama': ['authority-figure', 'rival', 'ally', 'love-interest', 'mentor', 'secondary-antagonist'],
      'medical drama': ['mentor', 'rival', 'authority-figure', 'love-interest', 'ally', 'family'],
      'fantasy drama': ['mentor', 'ally', 'rival', 'love-interest', 'secondary-antagonist', 'wildcard'],
      'sci-fi drama': ['mentor', 'ally', 'rival', 'authority-figure', 'love-interest', 'wildcard'],
      'contemporary drama': ['love-interest', 'mentor', 'rival', 'friend', 'family', 'ally']
    };

    const priorities = rolePriorities[storyType] || rolePriorities['contemporary drama'];
    return priorities.filter(role => !existingRoles.includes(role));
  }

  /**
   * Fallback character generation if AI extraction fails
   */
  private static generateFallbackDrafts(synopsis: string, theme: string): CharacterDraftCollection {
    console.log('🔄 Using fallback character drafts...');
    
    // Determine story type from synopsis
    const storyType = this.detectStoryType(synopsis);
    const settingContext = this.getSettingContext(storyType);
    
    const fallbackCharacters: CharacterDraft[] = [
      {
        name: "Alex Chen",
        role: "protagonist",
        gender: "non-binary",
        description: "Main character driving the story forward",
        persona: "determined, conflicted",
        storyFunction: "embodies the theme and drives the central conflict",
        relationshipToProtagonist: "self",
        fromSynopsis: false
      },
      {
        name: "Jordan Blake",
        role: "antagonist", 
        gender: "any",
        description: "Primary opposition to the protagonist",
        persona: "compelling, justified",
        storyFunction: "creates central conflict and tests protagonist",
        relationshipToProtagonist: "primary opposition",
        fromSynopsis: false
      },
      {
        name: "Sam Rivera",
        role: "love-interest",
        gender: "any",
        description: "Romantic interest and emotional support",
        persona: "supportive, independent",
        storyFunction: "provides emotional stakes and support",
        relationshipToProtagonist: "romantic interest",
        fromSynopsis: false
      },
      {
        name: "Dakota Morgan",
        role: "mentor",
        gender: "any",
        description: "Wise guide who helps the protagonist",
        persona: "experienced, caring",
        storyFunction: "provides guidance and wisdom",
        relationshipToProtagonist: "mentor/guide",
        fromSynopsis: false
      },
      {
        name: "Casey Kim",
        role: "ally",
        gender: "any",
        description: "Loyal friend and supporter",
        persona: "loyal, brave",
        storyFunction: "provides support and assistance",
        relationshipToProtagonist: "close friend/ally",
        fromSynopsis: false
      }
    ];

    return {
      storyType,
      settingContext,
      explicitCharacters: [],
      inferredCharacters: fallbackCharacters,
      totalCount: fallbackCharacters.length
    };
  }

  /**
   * Detect story type from synopsis
   */
  private static detectStoryType(synopsis: string): string {
    const lowercaseSynopsis = synopsis.toLowerCase();
    
    if (lowercaseSynopsis.includes('high school') || lowercaseSynopsis.includes('teenager') || lowercaseSynopsis.includes('student')) {
      return 'high school drama';
    } else if (lowercaseSynopsis.includes('college') || lowercaseSynopsis.includes('university')) {
      return 'college drama';
    } else if (lowercaseSynopsis.includes('office') || lowercaseSynopsis.includes('corporate') || lowercaseSynopsis.includes('workplace')) {
      return 'workplace drama';
    } else if (lowercaseSynopsis.includes('family') || lowercaseSynopsis.includes('parent') || lowercaseSynopsis.includes('child')) {
      return 'family drama';
    } else if (lowercaseSynopsis.includes('crime') || lowercaseSynopsis.includes('police') || lowercaseSynopsis.includes('detective')) {
      return 'crime drama';
    } else if (lowercaseSynopsis.includes('fantasy') || lowercaseSynopsis.includes('magic') || lowercaseSynopsis.includes('kingdom')) {
      return 'fantasy drama';
    } else if (lowercaseSynopsis.includes('sci-fi') || lowercaseSynopsis.includes('space') || lowercaseSynopsis.includes('future')) {
      return 'sci-fi drama';
    }
    
    return 'contemporary drama';
  }

  /**
   * Get appropriate setting context for age and environment
   */
  private static getSettingContext(storyType: string): string {
    const contexts: { [key: string]: string } = {
      'high school drama': 'teenagers (15-18) in educational setting',
      'college drama': 'young adults (18-22) in university setting',
      'workplace drama': 'adults (25-55) in professional environment',
      'family drama': 'multi-generational family members',
      'crime drama': 'adults in law enforcement/criminal justice setting',
      'fantasy drama': 'age varies based on fantasy world rules',
      'sci-fi drama': 'age varies based on futuristic setting',
      'contemporary drama': 'adults in modern setting'
    };
    
    return contexts[storyType] || 'adults in contemporary setting';
  }

  /**
   * Validate character draft collection
   */
  static validateDrafts(drafts: CharacterDraftCollection): boolean {
    // Must have at least one protagonist
    const hasProtagonist = [...drafts.explicitCharacters, ...drafts.inferredCharacters]
      .some(char => char.role === 'protagonist');
    
    // Must have at least one antagonist
    const hasAntagonist = [...drafts.explicitCharacters, ...drafts.inferredCharacters]
      .some(char => char.role === 'antagonist');
    
    // Must have reasonable character count
    const hasEnoughCharacters = drafts.totalCount >= 4;
    
    return hasProtagonist && hasAntagonist && hasEnoughCharacters;
  }
}