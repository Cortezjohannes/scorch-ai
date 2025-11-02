/**
 * The 3D Character Engine - AI-Enhanced Psychologically Complex Characters
 * 
 * Based on Lajos Egri's three-dimensional character model:
 * - Physiology: The physical dimension
 * - Sociology: The social dimension  
 * - Psychology: The mental/emotional dimension
 * 
 * Plus Want vs Need psychology for character arc generation
 * 
 * ENHANCEMENT: Template-based generation → AI-powered psychological modeling
 */

import { StoryPremise, PremiseEquation } from './premise-engine'
import { generateContent } from './azure-openai'
import { CharacterDraft, CharacterDraftCollection, CharacterDraftingService } from './character-drafting-service'
import { CharacterEngineV2, type ArchitectedCharacter } from './character-engine-v2'

// Egri's Three-Dimensional Character Model
export interface Character3D {
  name: string;
  
  // PHYSIOLOGY - The Physical Dimension
  physiology: {
    // age removed temporarily due to context issues
    gender: string;
    appearance: string;
    height: string;
    build: string;
    physicalTraits: string[]; // distinctive features
    health: string;
    defects: string[]; // physical limitations or scars
    heredity: string; // family traits that influence them
  };
  
  // SOCIOLOGY - The Social Dimension
  sociology: {
    class: 'working' | 'middle' | 'upper' | 'underclass';
    occupation: string;
    education: string;
    homeLife: string;
    religion: string;
    race: string;
    nationality: string;
    politicalAffiliation: string;
    hobbies: string[];
    communityStanding: string;
    economicStatus: string;
    familyRelationships: string[];
  };
  
  // PSYCHOLOGY - The Mental/Emotional Dimension
  psychology: {
    // Core premise-related psychology
    coreValue: string; // Their fundamental belief (from premise)
    opposingValue: string; // What they reject/fear
    moralStandpoint: string;
    
    // Want vs Need (The Character Arc Engine)
    want: string; // External, conscious goal they pursue
    need: string; // Internal, unconscious lesson they must learn
    
    // Character flaw system
    primaryFlaw: string; // Main weakness that creates obstacles
    secondaryFlaws: string[]; // Supporting character flaws
    
    // Psychological depth
    temperament: string[]; // hot-tempered, patient, anxious, etc.
    attitude: string; // optimistic, cynical, romantic, realistic
    complexes: string[]; // psychological complexes or hang-ups
    ambitions: string[];
    frustrations: string[];
    fears: string[];
    superstitions: string[];
    likes: string[];
    dislikes: string[];
    
    // Intelligence and skills
    iq: number;
    abilities: string[];
    talents: string[];
    
    // Background psychology
    childhood: string; // formative experiences
    trauma: string[]; // significant negative experiences
    successes: string[]; // significant positive experiences
  };
  
  // PREMISE CONNECTION
  premiseRole: 'protagonist' | 'deuteragonist' | 'antagonist' | 'secondary-antagonist' | 'love-interest' | 'mentor' | 'ally' | 'rival' | 'family' | 'friend' | 'authority-figure' | 'comic-relief' | 'wildcard' | 'ensemble' | 'catalyst' | 'mirror' | 'threshold';
  premiseFunction: string; // How this character serves to test the premise
  role?: 'protagonist' | 'antagonist' | 'supporting';
  
  // LIVING NARRATIVE
  arcIntroduction: number; // Which arc they enter the story
  arcDeparture?: number; // Which arc they leave (if any)
  departureReason?: string; // Why they leave
  
  // CHARACTER EVOLUTION
  characterEvolution: {
    arc: number;
    episode: number;
    development: string; // What changes about them
    triggerEvent: string; // What causes the change
    newTraits?: string[]; // Traits they gain
    lostTraits?: string[]; // Traits they lose/overcome
    relationshipChanges?: string[]; // How relationships shift
  }[];
  
  // DIALOGUE AND VOICE
  speechPattern: {
    vocabulary: 'simple' | 'educated' | 'street' | 'technical' | 'poetic';
    rhythm: 'fast' | 'measured' | 'slow' | 'staccato';
    catchphrases: string[];
    uniqueExpressions: string[];
    accent: string;
    voiceNotes: string; // How they speak distinctively
  };
}

// Character relationship mapping
export interface CharacterRelationship {
  character1: string;
  character2: string;
  relationshipType: 'ally' | 'enemy' | 'mentor' | 'love-interest' | 'family' | 'rival' | 'neutral';
  dynamic: string; // How they interact
  conflictSource?: string; // What creates tension between them
  sharedHistory?: string; // Their past connection
  premiseRelevance: string; // How this relationship tests the premise
}

// Character arc progression
export interface CharacterArc {
  character: string;
  want: string; // What they think they need
  need: string; // What they actually need
  flaw: string; // What prevents them from getting what they need
  
  // The arc progression
  stages: {
    stage: 'setup' | 'inciting' | 'plot-point-1' | 'midpoint' | 'plot-point-2' | 'climax' | 'resolution';
    characterState: string; // Their psychological state at this point
    flawManifestation: string; // How their flaw appears
    wantPursuit: string; // How they pursue their want
    needIgnorance: string; // How they ignore their real need
    turningPoint?: string; // Moment of change
  }[];
  
  transformation: string; // How they change by the end
  premiseProof: string; // How their arc proves the premise
}

export class Character3DEngine {
  
  /**
   * TWO-STAGE CHARACTER GENERATION: Enhance character drafts with 3D psychology
   * This is the new main entry point that respects synopsis context
   */
  static async enhanceCharacterDrafts(
    drafts: CharacterDraftCollection,
    premise: StoryPremise,
    synopsis: string
  ): Promise<Character3D[]> {
    console.log(`🎭 STAGE 2: Enhancing ${drafts.totalCount} character drafts with 3D psychology...`);
    
    const allDrafts = [...drafts.explicitCharacters, ...drafts.inferredCharacters];
    const enhanced3DCharacters: Character3D[] = [];
    
    // Process characters in order of importance
    const sortedDrafts = this.sortDraftsByImportance(allDrafts);
    
    for (const draft of sortedDrafts) {
      console.log(`🔄 Enhancing ${draft.name} (${draft.role})...`);
      
      try {
        const enhanced3D = await this.enhanceSingleDraft(draft, premise, synopsis, enhanced3DCharacters);
        enhanced3DCharacters.push(enhanced3D);
        console.log(`✅ Enhanced ${draft.name} with 3D psychology`);
      } catch (error) {
        console.warn(`⚠️ Failed to enhance ${draft.name}, using fallback:`, error);
        const fallback3D = this.createFallback3DFromDraft(draft, premise);
        enhanced3DCharacters.push(fallback3D);
      }
    }
    
    // Generate relationships
    const relationships = this.generateRelationships(enhanced3DCharacters, premise);
    console.log(`✅ Generated ${relationships.length} character relationships`);
    
    console.log(`🎉 TWO-STAGE COMPLETE: ${enhanced3DCharacters.length} synopsis-accurate characters with 3D psychology`);
    return enhanced3DCharacters;
  }

  /**
   * Enhance a single character draft with 3D psychology
   */
  private static async enhanceSingleDraft(
    draft: CharacterDraft,
    premise: StoryPremise,
    synopsis: string,
    existingCharacters: Character3D[]
  ): Promise<Character3D> {
    // Generate psychology based on the draft's established persona and story function
    const psychology = await this.generatePsychologyFromDraft(draft, premise, synopsis);
    
    // Generate physiology that fits the draft's description (no age!)
    const physiology = await this.generatePhysiologyFromDraft(draft, psychology, synopsis);
    
    // Generate sociology that serves the story
    const sociology = await this.generateSociologyFromDraft(draft, psychology, physiology, premise, synopsis);
    
    // Generate speech pattern
    const speechPattern = await this.generateSpeechPatternAI(psychology, sociology);
    
    return {
      name: draft.name, // Keep the name from the draft!
      physiology,
      sociology,
      psychology,
      premiseRole: draft.role as any,
      premiseFunction: draft.storyFunction,
      arcIntroduction: 1,
      characterEvolution: [],
      speechPattern
    };
  }
  
  /**
   * AI-ENHANCED: Generates a protagonist designed specifically to test the premise
   */
  static async generateProtagonist(
    premise: StoryPremise, 
    synopsis: string
  ): Promise<Character3D> {
    // AI-Enhanced: Generate premise-driven psychology
    const psychology = await this.generateProtagonistPsychologyAI(premise, synopsis);
    
    // AI-Enhanced: Generate physiology that serves the character
    const physiology = await this.generatePhysiologyAI(psychology, 'protagonist', synopsis);
    
    // AI-Enhanced: Generate sociology that creates conflict opportunities
    const sociology = await this.generateSociologyAI(psychology, physiology, premise, synopsis);
    
    // AI-Enhanced: Generate authentic speech pattern
    const speechPattern = await this.generateSpeechPatternAI(psychology, sociology);
    
    // AI-Enhanced: Generate character name that fits
    const name = await this.generateCharacterNameAI(psychology, sociology, physiology);
    
    return {
      name,
      physiology,
      sociology,
      psychology,
      premiseRole: 'protagonist',
      premiseFunction: await this.generatePremiseFunctionAI(premise, psychology, 'protagonist'),
      arcIntroduction: 1,
      characterEvolution: [],
      speechPattern
    };
  }
  
  /**
   * AI-ENHANCED: Generates an antagonist that opposes the protagonist's values
   */
  static async generateAntagonist(
    premise: StoryPremise,
    protagonist: Character3D, 
    synopsis: string
  ): Promise<Character3D> {
    // AI-Enhanced: Generate contrasting psychology
    const psychology = await this.generateAntagonistPsychologyAI(premise, protagonist, synopsis);
    
    // AI-Enhanced: Generate contrasting physiology
    const physiology = await this.generateContrastingPhysiologyAI(protagonist.physiology, psychology);
    
    // AI-Enhanced: Generate sociology that enables their method
    const sociology = await this.generateAntagonistSociologyAI(psychology, physiology, premise, synopsis);
    
    // AI-Enhanced: Generate contrasting speech pattern
    const speechPattern = await this.generateContrastingSpeechPatternAI(protagonist.speechPattern, psychology);
    
    // AI-Enhanced: Generate antagonist name
    const name = await this.generateCharacterNameAI(psychology, sociology, physiology);
    
    return {
      name,
      physiology,
      sociology,
      psychology,
      premiseRole: 'antagonist',
      premiseFunction: await this.generatePremiseFunctionAI(premise, psychology, 'antagonist'),
      arcIntroduction: 1,
      characterEvolution: [],
      speechPattern
    };
  }

  /**
   * AI-ENHANCED: Generates supporting characters with specific story functions
   */
  public static async generateSupportingCharacter(
    role: 'catalyst' | 'mirror' | 'threshold', 
    premise: StoryPremise, 
    existingCharacters: Character3D[],
    synopsis: string
  ): Promise<Character3D> {
    // AI-Enhanced: Generate role-specific psychology
    const psychology = await this.generateSupportingPsychologyAI(role, premise, existingCharacters, synopsis);
    
    // AI-Enhanced: Generate physiology that supports their function
    const physiology = await this.generatePhysiologyAI(psychology, role, synopsis);
    
    // AI-Enhanced: Generate sociology that creates story opportunities
    const sociology = await this.generateSociologyAI(psychology, physiology, premise, synopsis);
    
    // AI-Enhanced: Generate speech pattern that fits their role
    const speechPattern = await this.generateSpeechPatternAI(psychology, sociology);
    
    // AI-Enhanced: Generate character name
    const name = await this.generateCharacterNameAI(psychology, sociology, physiology);
    
    return {
      name,
      physiology,
      sociology,
      psychology,
      premiseRole: role,
      premiseFunction: await this.generatePremiseFunctionAI(premise, psychology, role),
      arcIntroduction: await this.determineIntroductionArcAI(role, existingCharacters, synopsis),
      characterEvolution: [],
      speechPattern
    };
  }
  
  /**
   * Generates character relationships that test the premise
   */
  static generateRelationships(characters: Character3D[], premise: StoryPremise): CharacterRelationship[] {
    const relationships: CharacterRelationship[] = [];
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const char1 = characters[i];
        const char2 = characters[j];
        
        const relationship = this.createPremiseTestingRelationship(char1, char2, premise);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }

  /**
   * Creates a relationship between two characters that tests the premise
   */
  private static createPremiseTestingRelationship(
    char1: Character3D, 
    char2: Character3D, 
    premise: StoryPremise
  ): CharacterRelationship | null {
    // Determine relationship type based on their roles and values
    let type: CharacterRelationship['relationshipType'];
    let dynamic: string;
    let conflict: string;
    
    if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'antagonist') {
      type = 'enemy';
      dynamic = `${char1.psychology.coreValue} vs ${char2.psychology.coreValue}`;
      conflict = `Fundamental disagreement about ${premise.theme}`;
    } else if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'catalyst') {
      type = 'mentor';
      dynamic = 'Catalyst challenges protagonist growth';
      conflict = `Forces ${char1.name} to confront their ${char1.psychology.primaryFlaw}`;
    } else if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'mirror') {
      type = 'ally';
      dynamic = 'Mirror shows protagonist potential paths';
      conflict = `${char2.name} represents what ${char1.name} could become`;
    } else if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'threshold') {
      type = 'rival';
      dynamic = 'Threshold tests protagonist readiness';
      conflict = `${char2.name} guards important transitions for ${char1.name}`;
    } else {
      // Create supportive relationships between supporting characters
      type = 'ally';
      dynamic = 'Supporting characters work together';
      conflict = 'Minor disagreements about approach';
    }

    return {
      character1: char1.name,
      character2: char2.name,
      relationshipType: type,
      dynamic,
      conflictSource: conflict,
      premiseRelevance: `Tests ${premise.character} through ${type} relationship`
    };
  }

  private static calculateEmotionalDistance(char1: Character3D, char2: Character3D): 'intimate' | 'close' | 'distant' | 'hostile' {
    if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'antagonist') {
      return 'hostile';
    } else if (char1.premiseRole === 'protagonist' && char2.premiseRole === 'mirror') {
      return 'close';
    } else {
      return 'distant';
    }
  }

  private static calculatePowerBalance(char1: Character3D, char2: Character3D): 'equal' | 'char1_dominant' | 'char2_dominant' {
    // Simple logic based on roles
    if (char1.premiseRole === 'protagonist') {
      return char2.premiseRole === 'antagonist' ? 'equal' : 'char1_dominant';
    }
    return 'equal';
  }

  private static calculateTrustLevel(char1: Character3D, char2: Character3D, type: CharacterRelationship['relationshipType']): 'complete' | 'high' | 'moderate' | 'low' | 'none' {
    switch (type) {
      case 'enemy': return 'none';
      case 'mentor': return 'high';
      case 'ally': return 'high';
      case 'rival': return 'low';
      case 'love-interest': return 'complete';
      case 'family': return 'high';
      case 'neutral': return 'moderate';
      default: return 'moderate';
    }
  }

  /**
   * Generate complete character evolution arc based on the premise
   */
  static generateCharacterArc(character: Character3D, premise: StoryPremise): CharacterArc {
    return {
      character: character.name,
      want: character.psychology.want,
      need: character.psychology.need,
      flaw: character.psychology.primaryFlaw,
      
      stages: [], // Arc stages to be implemented
      transformation: `${character.name} evolves from ${character.psychology.want} to ${character.psychology.need}`,
      premiseProof: `${character.name}'s arc demonstrates ${premise.premiseStatement}`
    };
  }
  
  // ============================================================
  // AI-ENHANCED PSYCHOLOGY GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Generate protagonist psychology that serves the premise
   */
  private static async generateProtagonistPsychologyAI(premise: StoryPremise, synopsis: string): Promise<Character3D['psychology']> {
    const prompt = `Create a psychologically complex protagonist for this story:

PREMISE: "${premise.premiseStatement}"
CORE VALUE: "${premise.character}"
STORY: "${synopsis}"

Generate a protagonist psychology using Egri's 3D character model:

REQUIREMENTS:
1. Core value should be "${premise.character}" 
2. Want vs Need psychology (external goal vs internal lesson)
3. Character flaw that makes them vulnerable but relatable
4. Rich psychological depth with specific traits, fears, ambitions
5. Backstory that explains why they hold this value
6. Character arc potential built into their psychology

Return detailed psychology in JSON format:
{
  "coreValue": "${premise.character}",
  "opposingValue": "what they reject/fear",
  "moralStandpoint": "their ethical position",
  "want": "external conscious goal they pursue",
  "need": "internal unconscious lesson they must learn", 
  "primaryFlaw": "main weakness that creates obstacles",
  "secondaryFlaws": ["2-3 supporting flaws"],
  "temperament": ["3-4 personality traits"],
  "attitude": "their general outlook on life",
  "complexes": ["psychological hang-ups"],
  "ambitions": ["what they strive for"],
  "frustrations": ["what drives them crazy"],
  "fears": ["what they're afraid of"],
  "superstitions": ["beliefs or habits"],
  "likes": ["what they enjoy"],
  "dislikes": ["what they avoid"],
  "iq": 95-125,
  "abilities": ["natural talents"],
  "talents": ["developed skills"],
  "childhood": "formative experience that shaped their core value",
  "trauma": ["significant negative experiences"],
  "successes": ["significant positive experiences"]
}`;

    const systemPrompt = `You are a master character psychologist specializing in Egri's 3D character method and Want vs Need psychology. Create psychologically authentic, complex protagonists.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.7, // Higher creativity for character generation
        maxTokens: 800
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const psychology = JSON.parse(cleanResult);
      
      // Validate required fields
      if (psychology.coreValue && psychology.want && psychology.need && psychology.primaryFlaw) {
        return psychology;
      }
      
      return this.generateProtagonistPsychologyFallback(premise, synopsis);
    } catch (error) {
      console.warn('AI protagonist psychology generation failed, using fallback:', error);
      return this.generateProtagonistPsychologyFallback(premise, synopsis);
    }
  }

  /**
   * AI-ENHANCED: Generate antagonist psychology that opposes the protagonist
   */
  private static async generateAntagonistPsychologyAI(premise: StoryPremise, protagonist: Character3D, synopsis: string): Promise<Character3D['psychology']> {
    const prompt = `Create a psychologically complex antagonist who opposes this protagonist:

PREMISE: "${premise.premiseStatement}"
PROTAGONIST VALUE: "${protagonist.psychology.coreValue}"
PROTAGONIST FLAW: "${protagonist.psychology.primaryFlaw}"
STORY: "${synopsis}"

The antagonist should:
1. Embody the opposing value to "${protagonist.psychology.coreValue}"
2. Use the protagonist's "${protagonist.psychology.primaryFlaw}" against them
3. Be convinced they're right (not evil for evil's sake)
4. Have psychological depth and relatable motivations
5. Challenge the protagonist in meaningful ways

Create a worthy opponent with psychological complexity:

{
  "coreValue": "opposing value to protagonist",
  "opposingValue": "${protagonist.psychology.coreValue}",
  "moralStandpoint": "their ethical justification",
  "want": "goal that conflicts with protagonist",
  "need": "what they refuse to acknowledge they need",
  "primaryFlaw": "strength taken too far",
  "secondaryFlaws": ["supporting character flaws"],
  "temperament": ["personality traits"],
  "attitude": "worldview that justifies their actions",
  "complexes": ["psychological drivers"],
  "ambitions": ["what they're building toward"],
  "frustrations": ["what the protagonist represents to them"],
  "fears": ["what losing would mean"],
  "superstitions": ["beliefs that drive them"],
  "likes": ["what they value"],
  "dislikes": ["what they despise"],
  "iq": 100-130,
  "abilities": ["natural talents"],
  "talents": ["skills they use as weapons"],
  "childhood": "formative experience that created their worldview",
  "trauma": ["experiences that hardened them"],
  "successes": ["victories that proved their methods work"]
}`;

    const systemPrompt = `You are an expert in antagonist psychology. Create complex villains who are heroes of their own stories.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 800
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const psychology = JSON.parse(cleanResult);
      
      if (psychology.coreValue && psychology.want && psychology.primaryFlaw) {
        return psychology;
      }
      
      return this.generateAntagonistPsychologyFallback(premise, protagonist);
    } catch (error) {
      console.warn('AI antagonist psychology generation failed, using fallback:', error);
      return this.generateAntagonistPsychologyFallback(premise, protagonist);
    }
  }

  /**
   * AI-ENHANCED: Generate supporting character psychology for specific story functions
   */
  private static async generateSupportingPsychologyAI(
    role: 'catalyst' | 'mirror' | 'threshold',
    premise: StoryPremise,
    existingCharacters: Character3D[],
    synopsis: string
  ): Promise<Character3D['psychology']> {
    const roleDescriptions = {
      catalyst: "sparks change in other characters, forces decisions, creates turning points",
      mirror: "reflects the protagonist's journey, shows what they could become",
      threshold: "guards important transitions, tests character growth"
    };

    const prompt = `Create a supporting character psychology for the "${role}" role:

ROLE FUNCTION: ${roleDescriptions[role]}
PREMISE: "${premise.premiseStatement}"
STORY: "${synopsis}"
EXISTING CHARACTERS: ${existingCharacters.map(c => `${c.name} (${c.psychology.coreValue})`).join(', ')}

The ${role} character should:
1. Serve the premise by ${roleDescriptions[role]}
2. Have distinct psychology from existing characters
3. Create meaningful story dynamics
4. Feel like a real person with their own goals

Generate psychology:
{
  "coreValue": "unique value that serves their role",
  "opposingValue": "what they stand against", 
  "moralStandpoint": "their ethical position",
  "want": "personal goal that intersects with main story",
  "need": "what they must learn/face",
  "primaryFlaw": "weakness that creates story opportunities",
  "secondaryFlaws": ["supporting flaws"],
  "temperament": ["personality traits that serve their function"],
  "attitude": "outlook that drives their role",
  "complexes": ["psychological drivers"],
  "ambitions": ["personal goals"],
  "frustrations": ["what bothers them"],
  "fears": ["what they avoid"],
  "superstitions": ["beliefs or habits"],
  "likes": ["preferences"],
  "dislikes": ["aversions"],
  "iq": 90-120,
  "abilities": ["natural talents"],
  "talents": ["developed skills"],
  "childhood": "background that shaped their role function",
  "trauma": ["formative difficulties"],
  "successes": ["achievements that define them"]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: `You are an expert in character function and story dynamics. Create supporting characters that serve specific narrative purposes.`,
        temperature: 0.7,
        maxTokens: 600
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const psychology = JSON.parse(cleanResult);
      
      if (psychology.coreValue && psychology.want && psychology.primaryFlaw) {
        return psychology;
      }
      
      return this.generateSupportingPsychologyFallback(role, premise, existingCharacters);
    } catch (error) {
      console.warn(`AI ${role} psychology generation failed, using fallback:`, error);
      return this.generateSupportingPsychologyFallback(role, premise, existingCharacters);
    }
  }

  // ============================================================
  // AI-ENHANCED PHYSIOLOGY GENERATION 
  // ============================================================

  /**
   * AI-ENHANCED: Generate physiology that serves the character and story
   */
  private static async generatePhysiologyAI(
    psychology: Character3D['psychology'],
    role: string,
    synopsis: string
  ): Promise<Character3D['physiology']> {
    const prompt = `Generate character physiology that supports this psychology and role:

PSYCHOLOGY: Core value="${psychology.coreValue}", Primary flaw="${psychology.primaryFlaw}"
ROLE: ${role}
STORY CONTEXT: "${synopsis}"

Create physiology that:
1. Reflects their inner psychology
2. Serves their story function
3. Creates visual storytelling opportunities
4. Feels authentic and specific

Generate realistic physiology:
{
        // age field removed temporarily
  "gender": "character gender",
  "appearance": "distinctive visual description",
  "height": "specific height",
  "build": "body type that fits character",
  "physicalTraits": ["2-3 memorable features"],
  "health": "health status",
  "defects": ["physical limitations or scars if relevant"],
  "heredity": "family traits that influenced them"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in character design and visual storytelling. Create physiology that serves both character and story.',
        temperature: 0.6,
        maxTokens: 300
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const physiology = JSON.parse(cleanResult);
      
      if (physiology.appearance && physiology.height) {
        return physiology;
      }
      
      return this.generatePhysiologyFallback(psychology, role);
    } catch (error) {
      console.warn('AI physiology generation failed, using fallback:', error);
      return this.generatePhysiologyFallback(psychology, role);
    }
  }

  /**
   * AI-ENHANCED: Generate contrasting physiology for antagonist
   */
  private static async generateContrastingPhysiologyAI(
    protagonistPhysiology: Character3D['physiology'],
    psychology: Character3D['psychology']
  ): Promise<Character3D['physiology']> {
    const prompt = `Generate antagonist physiology that contrasts with the protagonist:

PROTAGONIST: ${protagonistPhysiology.appearance}, ${protagonistPhysiology.build} build
ANTAGONIST PSYCHOLOGY: ${psychology.coreValue} core value, ${psychology.attitude} attitude

Create contrasting physiology that:
1. Visually opposes the protagonist
2. Reflects antagonist psychology
3. Creates visual storytelling contrast
4. Feels authentic and intimidating

Generate contrasting physiology:
{
  "age": "age that contrasts protagonist",
  "gender": "character gender",
  "appearance": "appearance that contrasts protagonist",
  "height": "height that creates contrast",
  "build": "build that opposes protagonist",
  "physicalTraits": ["memorable contrasting features"],
  "health": "health status",
  "defects": ["physical traits that reveal character"],
  "heredity": "family traits that shaped them"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in visual contrast and antagonist design.',
        temperature: 0.6,
        maxTokens: 300
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const physiology = JSON.parse(cleanResult);
      
      if (physiology.appearance && physiology.height) {
        return physiology;
      }
      
      return this.generateContrastingPhysiologyFallback(protagonistPhysiology, psychology);
    } catch (error) {
      console.warn('AI contrasting physiology generation failed, using fallback:', error);
      return this.generateContrastingPhysiologyFallback(protagonistPhysiology, psychology);
    }
  }

  // ============================================================
  // AI-ENHANCED SOCIOLOGY GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Generate sociology that creates story opportunities
   */
  private static async generateSociologyAI(
    psychology: Character3D['psychology'],
    physiology: Character3D['physiology'],
    premise: StoryPremise,
    synopsis: string
  ): Promise<Character3D['sociology']> {
    const prompt = `Generate character sociology that creates story conflict and opportunities:

CHARACTER: ${psychology.coreValue} core value, ${psychology.primaryFlaw} flaw
PREMISE: "${premise.premiseStatement}"
STORY: "${synopsis}"

Create sociology that:
1. Puts them in situations where premise is tested
2. Creates natural conflict opportunities
3. Feels authentic to their psychology
4. Serves the story's needs

Generate detailed sociology:
{
  "class": "working/middle/upper/underclass",
  "occupation": "job that serves story function",
  "education": "educational background",
  "homeLife": "family/living situation",
  "religion": "spiritual beliefs",
  "race": "ethnic background",
  "nationality": "cultural background", 
  "politicalAffiliation": "political leanings",
  "hobbies": ["interests that reveal character"],
  "communityStanding": "reputation and social position",
  "economicStatus": "financial situation",
  "familyRelationships": ["family dynamics"]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in social dynamics and character background. Create sociology that serves story needs. Return ONLY valid JSON, no explanations or formatting.',
        temperature: 0.6,
        maxTokens: 400
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const sociology = JSON.parse(cleanResult);
      
      if (sociology.class && sociology.occupation && sociology.education) {
        return sociology;
      }
      
      return this.generateSociologyFallback(psychology, premise);
    } catch (error) {
      console.warn('AI sociology generation failed, using fallback:', error);
      return this.generateSociologyFallback(psychology, premise);
    }
  }

  /**
   * AI-ENHANCED: Generate antagonist sociology that enables their methods
   */
  private static async generateAntagonistSociologyAI(
    psychology: Character3D['psychology'],
    physiology: Character3D['physiology'],
    premise: StoryPremise,
    synopsis: string
  ): Promise<Character3D['sociology']> {
    const prompt = `Generate antagonist sociology that enables their opposition methods:

ANTAGONIST: ${psychology.coreValue} core value, ${psychology.primaryFlaw} flaw
PREMISE: "${premise.premiseStatement}"
STORY: "${synopsis}"

Create sociology that:
1. Gives them power to oppose the protagonist
2. Justifies their worldview and methods
3. Creates natural conflict with protagonist's world
4. Feels authentic to their psychology

Generate antagonist sociology:
{
  "class": "social class that gives them power",
  "occupation": "position that enables opposition",
  "education": "background that shaped their methods",
  "homeLife": "personal life that drives them",
  "religion": "beliefs that justify their actions",
  "race": "ethnic background",
  "nationality": "cultural background",
  "politicalAffiliation": "political position",
  "hobbies": ["interests that reveal their nature"],
  "communityStanding": "reputation and influence",
  "economicStatus": "wealth that enables their power",
  "familyRelationships": ["relationships that shaped them"]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in antagonist design and power structures.',
        temperature: 0.6,
        maxTokens: 400
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const sociology = JSON.parse(cleanResult);
      
      if (sociology.class && sociology.occupation && sociology.education) {
        return sociology;
      }
      
      return this.generateAntagonistSociologyFallback(psychology, physiology, premise);
    } catch (error) {
      console.warn('AI antagonist sociology generation failed, using fallback:', error);
      return this.generateAntagonistSociologyFallback(psychology, physiology, premise);
    }
  }

  // ============================================================
  // AI-ENHANCED SPEECH PATTERN GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Generate authentic speech patterns
   */
  private static async generateSpeechPatternAI(
    psychology: Character3D['psychology'],
    sociology: Character3D['sociology']
  ): Promise<Character3D['speechPattern']> {
    const prompt = `Generate authentic speech pattern for this character:

PSYCHOLOGY: ${psychology.coreValue} core value, ${psychology.attitude} attitude, IQ ${psychology.iq}
SOCIOLOGY: ${sociology.class} class, ${sociology.education} education, ${sociology.occupation} occupation

Create speech pattern that reflects:
1. Their education and social class
2. Their personality and psychology
3. Their professional background
4. Their core values and attitude

Generate speech pattern:
{
  "vocabulary": "simple/educated/street/technical/poetic",
  "rhythm": "fast/measured/slow/staccato", 
  "catchphrases": ["1-2 phrases they might repeat"],
  "uniqueExpressions": ["distinctive ways they speak"],
  "accent": "accent or dialect",
  "voiceNotes": "how they speak distinctively"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dialogue and character voice. Create authentic speech patterns. Return ONLY valid JSON, no explanations or formatting.',
        temperature: 0.6,
        maxTokens: 200
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const speechPattern = JSON.parse(cleanResult);
      
      if (speechPattern.vocabulary && speechPattern.rhythm) {
        return speechPattern;
      }
      
      return this.generateSpeechPatternFallback(psychology, sociology);
    } catch (error) {
      console.warn('AI speech pattern generation failed, using fallback:', error);
      return this.generateSpeechPatternFallback(psychology, sociology);
    }
  }

  /**
   * AI-ENHANCED: Generate contrasting speech pattern for antagonist
   */
  private static async generateContrastingSpeechPatternAI(
    protagonistSpeech: Character3D['speechPattern'],
    psychology: Character3D['psychology']
  ): Promise<Character3D['speechPattern']> {
    const prompt = `Generate antagonist speech pattern that contrasts with protagonist:

PROTAGONIST SPEECH: ${protagonistSpeech.vocabulary} vocabulary, ${protagonistSpeech.rhythm} rhythm, ${protagonistSpeech.voiceNotes}
ANTAGONIST PSYCHOLOGY: ${psychology.coreValue} core value, ${psychology.attitude} attitude

Create contrasting speech that:
1. Opposes protagonist's speaking style
2. Reflects antagonist's psychology and power
3. Creates dramatic contrast in dialogue
4. Feels authentic to their character

Generate contrasting speech:
{
  "vocabulary": "vocabulary level that contrasts protagonist",
  "rhythm": "rhythm that opposes protagonist", 
  "catchphrases": ["phrases that reveal their nature"],
  "uniqueExpressions": ["distinctive antagonist expressions"],
  "accent": "accent that creates contrast",
  "voiceNotes": "how they speak to intimidate/oppose"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in dialogue contrast and antagonist voice design.',
        temperature: 0.6,
        maxTokens: 200
      });

      // Clean the result - remove any non-JSON content
      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const speechPattern = JSON.parse(cleanResult);
      
      if (speechPattern.vocabulary && speechPattern.rhythm) {
        return speechPattern;
      }
      
      return this.generateContrastingSpeechPatternFallback(protagonistSpeech, psychology);
    } catch (error) {
      console.warn('AI contrasting speech pattern generation failed, using fallback:', error);
      return this.generateContrastingSpeechPatternFallback(protagonistSpeech, psychology);
    }
  }

  // ============================================================
  // AI-ENHANCED NAME GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Generate character names that fit psychology and sociology
   */
  private static async generateCharacterNameAI(
    psychology: Character3D['psychology'],
    sociology: Character3D['sociology'],
    physiology: Character3D['physiology']
  ): Promise<string> {
    // Generate a random cultural seed to avoid template names
    const culturalSeeds = ['Celtic', 'Nordic', 'Mediterranean', 'East Asian', 'South Asian', 'African', 'Latin American', 'Slavic', 'Middle Eastern', 'Indigenous', 'Polynesian', 'Germanic'];
    const randomCulture = culturalSeeds[Math.floor(Math.random() * culturalSeeds.length)];
    
    const uniquenessSeed = Math.random().toString(36).substring(2, 8);
    
    const prompt = `Create a UNIQUE character name for this profile. CRITICAL: Avoid common/template names like Maya, Mira, Elena, Soren, Alex, Jordan, etc.

CHARACTER: Person with ${psychology.coreValue} core values
BACKGROUND: ${sociology.class} class, ${sociology.nationality}/${randomCulture} heritage
PERSONALITY: ${psychology.attitude}, ${psychology.temperament.join('/')} temperament
UNIQUENESS SEED: ${uniquenessSeed}

STRICT REQUIREMENTS:
1. Create a completely ORIGINAL name - no common names
2. Draw from ${randomCulture} or ${sociology.nationality} naming traditions  
3. Make it distinctive and memorable
4. Ensure it matches their ${sociology.class} social background
5. NEVER use: Maya, Mira, Elena, Soren, Alex, Jordan, Casey, Blake, Riley

Generate ONE unique name (first name only unless culturally appropriate).
Be creative - think of names like Kieran, Zara, Kai, Lysander, Freya, Amara, but not these exact ones.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a master of global naming traditions. Create original, authentic names that avoid common templates. Be creative and diverse.',
        temperature: 0.9, // Higher temperature for more creativity
        maxTokens: 50
      });

      const name = result?.trim();
      if (name && name.length > 1 && name.length < 50) {
        return name;
      }
      
      return this.generateCharacterNameFallback(psychology, sociology);
    } catch (error) {
      console.warn('AI name generation failed, using fallback:', error);
      return this.generateCharacterNameFallback(psychology, sociology);
    }
  }

  // ============================================================
  // AI-ENHANCED PREMISE FUNCTION GENERATION
  // ============================================================

  /**
   * AI-ENHANCED: Generate premise function description
   */
  private static async generatePremiseFunctionAI(
    premise: StoryPremise,
    psychology: Character3D['psychology'],
    role: string
  ): Promise<string> {
    const prompt = `Describe how this character serves to test the premise: "${premise.premiseStatement}"

CHARACTER: ${role} with ${psychology.coreValue} core value and ${psychology.primaryFlaw} flaw
PREMISE: "${premise.premiseStatement}"

Explain in 1-2 sentences how this character's psychology and role function to test, challenge, or prove the premise.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in premise-driven storytelling.',
        temperature: 0.4,
        maxTokens: 100
      });

      return result?.trim() || `Serves as ${role} to test the premise through their ${psychology.coreValue} values`;
    } catch (error) {
      return `Serves as ${role} to test the premise through their ${psychology.coreValue} values`;
    }
  }

  /**
   * AI-ENHANCED: Determine when character should be introduced
   */
  private static async determineIntroductionArcAI(
    role: string,
    existingCharacters: Character3D[],
    synopsis: string
  ): Promise<number> {
    const prompt = `When should a "${role}" character be introduced in this story?

STORY: "${synopsis}"
EXISTING CHARACTERS: ${existingCharacters.length} already established
ROLE: ${role} (catalyst/mirror/threshold guardian)

Consider:
- Story pacing and character load
- When their function is most needed
- Optimal dramatic timing

Return just a number 1-3 for which story arc they should enter.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in story pacing and character introduction timing.',
        temperature: 0.3,
        maxTokens: 20
      });

      const arcNumber = parseInt(result?.trim() || '1');
      return Math.max(1, Math.min(3, arcNumber));
    } catch (error) {
      return Math.min(existingCharacters.length + 1, 3);
    }
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================
  
  private static generateProtagonistPsychologyFallback(premise: StoryPremise, synopsis: string): Character3D['psychology'] {
    const coreValue = premise.character;
    const relatedFlaw = 'stubbornness'; // Placeholder for related flaw
    
    // Generate want vs need based on premise
    const want = Character3DEngine.generateWantFromSynopsis(synopsis, coreValue);
    const need = Character3DEngine.generateNeedFromPremise(premise, coreValue);
    const primaryFlaw = relatedFlaw;
    const secondaryFlaws: string[] = Character3DEngine.generateSecondaryFlaws(primaryFlaw);
    const temperament: string[] = Character3DEngine.generateTemperament(coreValue, primaryFlaw);
    const attitude = Character3DEngine.generateAttitude(coreValue);
    const complexes: string[] = Character3DEngine.generateComplexes(primaryFlaw);
    const fears: string[] = [Character3DEngine.generateCoreFear(primaryFlaw)];
    const superstitions: string[] = Character3DEngine.generateSuperstitions();
    const likes: string[] = Character3DEngine.generateLikes(coreValue);
    const dislikes: string[] = Character3DEngine.generateDislikes(coreValue);
    const iq = Character3DEngine.generateIQ();
    const abilities: string[] = Character3DEngine.generateAbilities(coreValue);
    const talents: string[] = Character3DEngine.generateTalents();
    const childhood = Character3DEngine.generateFormativeExperience(coreValue);
    const trauma: string[] = Character3DEngine.generateTrauma(primaryFlaw);
    const successes: string[] = Character3DEngine.generateSuccesses(coreValue);

    return {
      coreValue,
      opposingValue: Character3DEngine.getOpposingValue(coreValue),
      moralStandpoint: `Believes strongly in ${coreValue}`,
      want,
      need,
      primaryFlaw,
      secondaryFlaws,
      temperament,
      attitude,
      complexes,
      ambitions: [`Achieve ${want}`],
      frustrations: [`When ${coreValue} is challenged`],
      fears,
      superstitions,
      likes,
      dislikes,
      iq,
      abilities,
      talents,
      childhood,
      trauma,
      successes
    };
  }

  private static generateAntagonistPsychologyFallback(premise: StoryPremise, protagonist: Character3D): Character3D['psychology'] {
    const coreValue = Character3DEngine.getOpposingValue(protagonist.psychology.coreValue);
    const method = 'strategic thinking'; // Placeholder for antagonist method
    
    // Antagonist psychology opposes protagonist
    const want = Character3DEngine.generateAntagonistWant(method, protagonist.psychology.want);
    const need = 'To acknowledge their blind spots';
    const primaryFlaw = Character3DEngine.generateAntagonistFlaw(coreValue);
    const secondaryFlaws: string[] = Character3DEngine.generateAntagonistSecondaryFlaws(coreValue);
    const temperament: string[] = Character3DEngine.generateAntagonistTemperament(coreValue);
    const attitude = Character3DEngine.generateAntagonistAttitude(coreValue);
    const complexes: string[] = Character3DEngine.generateAntagonistComplexes(coreValue);
    const likes: string[] = Character3DEngine.generateAntagonistLikes(coreValue);
    const dislikes: string[] = Character3DEngine.generateAntagonistDislikes(coreValue);
    const abilities: string[] = Character3DEngine.generateAntagonistAbilities(coreValue, method);
    const talents: string[] = Character3DEngine.generateAntagonistTalents(method);
    const childhood = Character3DEngine.generateAntagonistFormativeExperience(coreValue);
    const trauma: string[] = Character3DEngine.generateAntagonistTrauma(coreValue);
    const successes: string[] = Character3DEngine.generateAntagonistSuccesses(coreValue, method);

    return {
      coreValue,
      opposingValue: protagonist.psychology.coreValue,
      moralStandpoint: `Believes ${coreValue} is necessary`,
      want,
      need,
      primaryFlaw,
      secondaryFlaws,
      temperament,
      attitude,
      complexes,
      ambitions: [`Prove ${coreValue} superiority`],
      frustrations: [`Protagonist's ${protagonist.psychology.coreValue}`],
      fears: ['Losing control'],
      superstitions: ['That power requires sacrifice'],
      likes,
      dislikes,
      iq: 115,
      abilities,
      talents,
      childhood,
      trauma,
      successes
    };
  }

  private static generateSupportingPsychologyFallback(role: string, premise: StoryPremise, existingCharacters: Character3D[]): Character3D['psychology'] {
    const coreValue = 'varies';
    const opposingValue = 'varies';
    const moralStandpoint = 'flexible';
    const want = 'role-specific want';
    const need = 'role-specific need';
    const primaryFlaw = 'role-specific flaw';
    const secondaryFlaws: string[] = [];
    const temperament: string[] = ['role-appropriate'];
    const attitude = 'role-appropriate';
    const complexes: string[] = [];
    const ambitions: string[] = ['role goal'];
    const frustrations: string[] = ['role frustration'];
    const fears: string[] = ['role fear'];
    const superstitions: string[] = [];
    const likes: string[] = ['role likes'];
    const dislikes: string[] = ['role dislikes'];
    const iq = 100;
    const abilities: string[] = ['role abilities'];
    const talents: string[] = ['role talents'];
    const childhood = 'role-relevant background';
    const trauma: string[] = [];
    const successes: string[] = ['role successes'];

    return {
      coreValue,
      opposingValue,
      moralStandpoint,
      want,
      need,
      primaryFlaw,
      secondaryFlaws,
      temperament,
      attitude,
      complexes,
      ambitions,
      frustrations,
      fears,
      superstitions,
      likes,
      dislikes,
      iq,
      abilities,
      talents,
      childhood,
      trauma,
      successes
    };
  }
  
  private static generatePhysiologyFallback(psychology: Character3D['psychology'], role: string): Character3D['physiology'] {
    return {
      // age field removed temporarily
      gender: 'varies',
      appearance: 'distinctive',
      height: 'average',
      build: 'average',
      physicalTraits: ['memorable feature'],
      health: 'good',
      defects: [],
      heredity: 'relevant family traits'
    };
  }
  
  private static generateContrastingPhysiologyFallback(protagonistPhysiology: Character3D['physiology'], psychology: Character3D['psychology']): Character3D['physiology'] {
    return {
      // age field removed temporarily
      gender: 'varies',
      appearance: 'contrasting to protagonist',
      height: protagonistPhysiology.height === 'tall' ? 'short' : 'tall',
      build: protagonistPhysiology.build === 'lean' ? 'stocky' : 'lean',
      physicalTraits: ['intimidating feature'],
      health: 'good',
      defects: [],
      heredity: 'powerful family traits'
    };
  }
  
  private static generateSociologyFallback(psychology: Character3D['psychology'], premise: StoryPremise): Character3D['sociology'] {
    return {
      class: 'middle' as const,
      occupation: 'relevant to story',
      education: 'college',
      homeLife: 'stable',
      religion: 'varies',
      race: 'diverse',
      nationality: 'varies',
      politicalAffiliation: 'moderate',
      hobbies: ['relevant hobby'],
      communityStanding: 'respected',
      economicStatus: 'stable',
      familyRelationships: ['supportive family']
    };
  }
  
  private static generateAntagonistSociologyFallback(psychology: Character3D['psychology'], physiology: Character3D['physiology'], premise: StoryPremise): Character3D['sociology'] {
    return {
      class: 'upper' as const,
      occupation: 'position of power',
      education: 'advanced',
      homeLife: 'complex',
      religion: 'pragmatic',
      race: 'varies',
      nationality: 'varies',
      politicalAffiliation: 'conservative',
      hobbies: ['chess', 'manipulation'],
      communityStanding: 'influential',
      economicStatus: 'wealthy',
      familyRelationships: ['strategic alliances']
    };
  }
  
  private static generateSpeechPatternFallback(psychology: Character3D['psychology'], sociology: Character3D['sociology']): Character3D['speechPattern'] {
    return {
      vocabulary: 'educated' as const,
      rhythm: 'measured' as const,
      catchphrases: [],
      uniqueExpressions: [],
      accent: 'neutral',
      voiceNotes: 'speaks with conviction'
    };
  }

  private static generateContrastingSpeechPatternFallback(protagonistSpeech: Character3D['speechPattern'], psychology: Character3D['psychology']): Character3D['speechPattern'] {
    return {
      vocabulary: 'educated' as const,
      rhythm: 'measured' as const,
      catchphrases: [],
      uniqueExpressions: ['power phrases'],
      accent: 'refined',
      voiceNotes: 'speaks with calculated precision'
    };
  }
  
  private static generateCharacterNameFallback(psychology: Character3D['psychology'], sociology: Character3D['sociology']): string {
    // Diverse name pools avoiding common templates
    const uniqueNamePools = [
      // Strong leadership names
      ['Kieran', 'Zara', 'Theron', 'Lydia', 'Darius', 'Iris', 'Orion', 'Vera'],
      // Creative/artistic names  
      ['Beatrix', 'Caspian', 'Delphine', 'Felix', 'Isadora', 'Jasper', 'Ophelia', 'Celeste'],
      // Tech/modern names
      ['Zeno', 'Nova', 'Cyrus', 'Luna', 'Axel', 'Vega', 'Onyx', 'Echo'],
      // Classic but uncommon
      ['Lysander', 'Cordelia', 'Leander', 'Seraphina', 'Evander', 'Persephone', 'Thaddeus', 'Isolde'],
      // Nature-inspired unique
      ['Briar', 'Sage', 'Phoenix', 'Wren', 'Atlas', 'Juniper', 'Storm', 'Raven'],
      // International diverse
      ['Amara', 'Davi', 'Kaia', 'Enzo', 'Zuri', 'Kai', 'Nia', 'Rio'],
      // Strong character names
      ['Maxon', 'Vera', 'Knox', 'Indie', 'Jett', 'Willa', 'Cruz', 'Esme'],
      // Mysterious/complex
      ['Dante', 'Nyx', 'Orion', 'Cleo', 'Zane', 'Ivy', 'Lux', 'Rain']
    ];

    // Select a random pool to ensure variety
    const selectedPool = uniqueNamePools[Math.floor(Math.random() * uniqueNamePools.length)];
    
    // Add randomness based on character traits
    const index = Math.floor(Math.random() * selectedPool.length);
    
    // Add a timestamp-based modifier to ensure uniqueness in the same session
    const timeModifier = Date.now() % selectedPool.length;
    const finalIndex = (index + timeModifier) % selectedPool.length;
    
    return selectedPool[finalIndex];
  }

  // Helper method for getting opposing values
  private static getOpposingValue(value: string): string {
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
  
  private static generateSecondaryFlaws(primaryFlaw: string): string[] {
    return ['impatience', 'stubbornness']; // Would be more sophisticated
  }
  
  private static generateTemperament(coreValue: string, flaw: string): string[] {
    return ['determined', 'passionate']; // Would be more sophisticated
  }
  
  private static generateAttitude(coreValue: string): string {
    return 'optimistic but wary';
  }
  
  private static generateComplexes(flaw: string): string[] {
    return [`${flaw} complex`];
  }
  
  private static generateCoreFear(flaw: string): string {
    return `Being consumed by their ${flaw}`;
  }
  
  private static generateSuperstitions(): string[] {
    return ['believes in karma'];
  }
  
  private static generateLikes(coreValue: string): string[] {
    return [`People who share ${coreValue}`, 'clear communication'];
  }
  
  private static generateDislikes(coreValue: string): string[] {
    return [`People who oppose ${coreValue}`, 'ambiguity'];
  }
  
  private static generateIQ(): number {
    return 95 + Math.floor(Math.random() * 30); // 95-125 range
  }
  
  private static generateAbilities(coreValue: string): string[] {
    return ['problem solving', 'empathy'];
  }
  
  private static generateTalents(): string[] {
    return ['quick learning', 'pattern recognition'];
  }
  
  private static generateFormativeExperience(coreValue: string): string {
    return `Early experience that taught them the value of ${coreValue}`;
  }
  
  private static generateTrauma(flaw: string): string[] {
    return [`Experience that led to ${flaw}`];
  }
  
  private static generateSuccesses(coreValue: string): string[] {
    return [`Success when following ${coreValue}`];
  }
  
  // Additional helper methods would be implemented similarly...
  
  private static generateWantFromSynopsis(synopsis: string, coreValue: string): string {
    // Generate want based on synopsis and core value
    const synopsisLower = synopsis.toLowerCase();
    if (synopsisLower.includes('power') || synopsisLower.includes('control')) {
      return `${coreValue} through gaining power and control`;
    } else if (synopsisLower.includes('love') || synopsisLower.includes('relationship')) {
      return `${coreValue} through finding meaningful relationships`;
    } else if (synopsisLower.includes('freedom') || synopsisLower.includes('escape')) {
      return `${coreValue} through gaining freedom and independence`;
    } else if (synopsisLower.includes('truth') || synopsisLower.includes('discover')) {
      return `${coreValue} through uncovering the truth`;
    } else {
      return `${coreValue} through achieving their goals`;
    }
  }

  private static generateNeedFromPremise(premise: StoryPremise, coreValue: string): string {
    // Generate need based on premise (what they actually need to learn)
    return `To learn that ${coreValue} requires ${premise.resolution || 'sacrifice and growth'}`;
  }

  private static generateAntagonistWant(method: string, protWant: string): string {
    return `Oppose protagonist's goal using ${method}`;
  }
  
  private static generateAntagonistFlaw(coreValue: string): string {
    return `Excessive ${coreValue}`;
  }
  
  private static generateAntagonistSecondaryFlaws(coreValue: string): string[] {
    return ['arrogance', 'blind spot'];
  }
  
  private static generateAntagonistTemperament(coreValue: string): string[] {
    return ['calculating', 'ruthless'];
  }
  
  private static generateAntagonistAttitude(coreValue: string): string {
    return 'cynically realistic';
  }
  
  private static generateAntagonistComplexes(coreValue: string): string[] {
    return ['superiority complex'];
  }
  
  private static generateAntagonistLikes(coreValue: string): string[] {
    return ['control', 'winning'];
  }
  
  private static generateAntagonistDislikes(coreValue: string): string[] {
    return ['idealism', 'losing control'];
  }
  
  private static generateAntagonistAbilities(coreValue: string, method: string): string[] {
    return ['strategic thinking', method];
  }
  
  private static generateAntagonistTalents(method: string): string[] {
    return [method, 'leadership'];
  }
  
  private static generateAntagonistFormativeExperience(coreValue: string): string {
    return `Experience that taught them ${coreValue} is necessary`;
  }
  
  private static generateAntagonistTrauma(coreValue: string): string[] {
    return [`Being betrayed when showing vulnerability`];
  }
  
  private static generateAntagonistSuccesses(coreValue: string, method: string): string[] {
    return [`Success through ${method}`];
  }

  // ============================================================
  // TWO-STAGE ENHANCEMENT HELPER METHODS
  // ============================================================

  /**
   * Sort character drafts by story importance
   */
  private static sortDraftsByImportance(drafts: CharacterDraft[]): CharacterDraft[] {
    const roleImportance = {
      'protagonist': 1,
      'deuteragonist': 2,
      'antagonist': 3,
      'secondary-antagonist': 4,
      'love-interest': 5,
      'mentor': 6,
      'ally': 7,
      'rival': 8,
      'family': 9,
      'friend': 10,
      'authority-figure': 11,
      'comic-relief': 12,
      'wildcard': 13,
      'ensemble': 14,
      'catalyst': 15,
      'mirror': 16,
      'threshold': 17
    };

    return [...drafts].sort((a, b) => {
      const aImportance = roleImportance[a.role] || 99;
      const bImportance = roleImportance[b.role] || 99;
      return aImportance - bImportance;
    });
  }

  /**
   * Generate psychology that respects the character draft's established traits
   */
  private static async generatePsychologyFromDraft(
    draft: CharacterDraft,
    premise: StoryPremise,
    synopsis: string
  ): Promise<Character3D['psychology']> {
    const prompt = `Create psychology for this character based on their established traits:

CHARACTER DRAFT:
- Name: ${draft.name}
- Role: ${draft.role}
- Description: ${draft.description}
- Persona: ${draft.persona}
- Story Function: ${draft.storyFunction}

PREMISE: "${premise.premiseStatement}"
SYNOPSIS: "${synopsis}"

Build psychology that:
1. Respects their established persona: "${draft.persona}"
2. Serves their story function: "${draft.storyFunction}"
3. Connects to the premise theme
4. Feels authentic and complex

Generate psychology:
{
  "coreValue": "value that aligns with their established persona",
  "opposingValue": "what they reject based on their role",
  "moralStandpoint": "ethical position from their description",
  "want": "external goal that fits their story function",
  "need": "internal lesson they must learn",
  "primaryFlaw": "weakness that serves the story",
  "secondaryFlaws": ["supporting character flaws"],
  "temperament": ["traits from their persona"],
  "attitude": "outlook that matches their description",
  "complexes": ["psychological drivers"],
  "ambitions": ["goals that serve story function"],
  "frustrations": ["what bothers them"],
  "fears": ["what they avoid"],
  "superstitions": ["beliefs or habits"],
  "likes": ["preferences"],
  "dislikes": ["aversions"],
  "iq": 95-125,
  "abilities": ["natural talents"],
  "talents": ["developed skills"],
  "childhood": "background that shaped their persona",
  "trauma": ["experiences that created their traits"],
  "successes": ["achievements that define them"]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a character psychologist. Build psychology that respects established character traits while adding depth. Return ONLY valid JSON.',
        temperature: 0.6,
        maxTokens: 800
      });

      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const psychology = JSON.parse(cleanResult);
      
      if (psychology.coreValue && psychology.want && psychology.need) {
        return psychology;
      }
      
      return this.generatePsychologyFallbackFromDraft(draft, premise);
    } catch (error) {
      console.warn(`Psychology generation failed for ${draft.name}:`, error);
      return this.generatePsychologyFallbackFromDraft(draft, premise);
    }
  }

  /**
   * Generate physiology from draft (NO AGE!)
   */
  private static async generatePhysiologyFromDraft(
    draft: CharacterDraft,
    psychology: Character3D['psychology'],
    synopsis: string
  ): Promise<Character3D['physiology']> {
    const prompt = `Generate physiology for this character:

CHARACTER: ${draft.name} (${draft.role})
DESCRIPTION: ${draft.description}
PSYCHOLOGY: ${psychology.coreValue} core value, ${psychology.primaryFlaw} flaw
SYNOPSIS CONTEXT: "${synopsis}"

Create physiology that:
1. Fits their description: "${draft.description}"
2. Reflects their psychology
3. Serves their story role
4. Feels authentic

Generate physiology (NO AGE):
{
  "gender": "${draft.gender}",
  "appearance": "description that fits their established traits",
  "height": "specific height",
  "build": "body type that matches their role",
  "physicalTraits": ["2-3 distinctive features"],
  "health": "health status", 
  "defects": ["physical traits that add character"],
  "heredity": "family traits"
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert character designer. Create physiology that serves character and story. Return ONLY valid JSON, no age field.',
        temperature: 0.5,
        maxTokens: 300
      });

      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const physiology = JSON.parse(cleanResult);
      
      if (physiology.appearance && physiology.height) {
        return physiology;
      }
      
      return this.generatePhysiologyFallbackFromDraft(draft);
    } catch (error) {
      console.warn(`Physiology generation failed for ${draft.name}:`, error);
      return this.generatePhysiologyFallbackFromDraft(draft);
    }
  }

  /**
   * Generate sociology from draft
   */
  private static async generateSociologyFromDraft(
    draft: CharacterDraft,
    psychology: Character3D['psychology'],
    physiology: Character3D['physiology'],
    premise: StoryPremise,
    synopsis: string
  ): Promise<Character3D['sociology']> {
    const prompt = `Generate sociology for this character:

CHARACTER: ${draft.name} (${draft.role})
DESCRIPTION: ${draft.description}
STORY FUNCTION: ${draft.storyFunction}
PSYCHOLOGY: ${psychology.coreValue}
PREMISE: "${premise.premiseStatement}"
SYNOPSIS: "${synopsis}"

Create sociology that:
1. Supports their story function
2. Creates appropriate conflict opportunities
3. Fits the story setting
4. Serves the premise

Generate sociology:
{
  "class": "working/middle/upper/underclass",
  "occupation": "job that serves their story function",
  "education": "appropriate educational background",
  "homeLife": "family situation",
  "religion": "spiritual beliefs",
  "race": "ethnic background",
  "nationality": "cultural background",
  "politicalAffiliation": "political views",
  "hobbies": ["interests that reveal character"],
  "communityStanding": "social reputation",
  "economicStatus": "financial situation",
  "familyRelationships": ["family connections"]
}`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are an expert in social background design. Create sociology that serves story needs. Return ONLY valid JSON.',
        temperature: 0.5,
        maxTokens: 500
      });

      const cleanResult = result?.replace(/^[^{]*/, '').replace(/[^}]*$/, '') || '{}';
      const sociology = JSON.parse(cleanResult);
      
      if (sociology.class && sociology.occupation) {
        return sociology;
      }
      
      return this.generateSociologyFallbackFromDraft(draft);
    } catch (error) {
      console.warn(`Sociology generation failed for ${draft.name}:`, error);
      return this.generateSociologyFallbackFromDraft(draft);
    }
  }

  /**
   * Create fallback 3D character from draft
   */
  private static createFallback3DFromDraft(draft: CharacterDraft, premise: StoryPremise): Character3D {
    return {
      name: draft.name,
      physiology: this.generatePhysiologyFallbackFromDraft(draft),
      sociology: this.generateSociologyFallbackFromDraft(draft),
      psychology: this.generatePsychologyFallbackFromDraft(draft, premise),
      premiseRole: draft.role as any,
      premiseFunction: draft.storyFunction,
      arcIntroduction: 1,
      characterEvolution: [],
      speechPattern: {
        vocabulary: 'educated',
        rhythm: 'measured',
        catchphrases: [],
        uniqueExpressions: [],
        accent: 'neutral',
        voiceNotes: `Speaks in a way that reflects their ${draft.role} role`
      }
    };
  }

  /**
   * Fallback psychology generation from draft
   */
  private static generatePsychologyFallbackFromDraft(draft: CharacterDraft, premise: StoryPremise): Character3D['psychology'] {
    const roleValues = {
      'protagonist': premise.character,
      'deuteragonist': premise.character,
      'antagonist': `Opposition to ${premise.character}`,
      'secondary-antagonist': 'Secondary opposition',
      'love-interest': 'Love and support',
      'mentor': 'Wisdom and guidance',
      'ally': 'Loyalty and friendship',
      'rival': 'Competition and challenge',
      'family': 'Family bonds',
      'friend': 'Friendship and support',
      'authority-figure': 'Order and control',
      'comic-relief': 'Humor and lightness',
      'wildcard': 'Unpredictability',
      'ensemble': 'Group dynamics'
    };

    return {
      coreValue: roleValues[draft.role] || 'Personal growth',
      opposingValue: 'What opposes their core value',
      moralStandpoint: `Ethics based on ${draft.persona}`,
      want: `External goal fitting ${draft.role}`,
      need: 'Internal growth needed',
      primaryFlaw: `Weakness serving ${draft.role}`,
      secondaryFlaws: ['Supporting flaw'],
      temperament: draft.persona.split(', '),
      attitude: 'Outlook based on persona',
      complexes: ['Character complexity'],
      ambitions: [draft.storyFunction],
      frustrations: ['Character frustration'],
      fears: ['Character fear'],
      superstitions: [],
      likes: ['Character preference'],
      dislikes: ['Character aversion'],
      iq: 105,
      abilities: ['Natural talent'],
      talents: ['Developed skill'],
      childhood: `Background that shaped their ${draft.persona}`,
      trauma: ['Formative difficulty'],
      successes: ['Personal achievement']
    };
  }

  /**
   * Fallback physiology from draft
   */
  private static generatePhysiologyFallbackFromDraft(draft: CharacterDraft): Character3D['physiology'] {
    return {
      gender: draft.gender,
      appearance: draft.description,
      height: "5'8\"",
      build: 'average',
      physicalTraits: ['distinctive feature'],
      health: 'good',
      defects: [],
      heredity: 'family traits'
    };
  }

  /**
   * Fallback sociology from draft
   */
  private static generateSociologyFallbackFromDraft(draft: CharacterDraft): Character3D['sociology'] {
    return {
      class: 'middle',
      occupation: `Role fitting ${draft.role}`,
      education: 'appropriate education',
      homeLife: 'family situation',
      religion: 'personal beliefs',
      race: 'ethnic background',
      nationality: 'cultural background',
      politicalAffiliation: 'political views',
      hobbies: ['hobby that fits character'],
      communityStanding: 'good standing',
      economicStatus: 'stable',
      familyRelationships: ['family connection']
    };
  }

  /**
   * ENHANCED V2.0: Generate character using advanced psychological modeling
   */
  static async generateEnhancedCharacter(
    premise: StoryPremise,
    characterRole: string,
    characterConcept: string,
    options: {
      complexityLevel?: 'lean-forward' | 'lean-back';
      narrativeFormat?: 'feature' | 'series' | 'limited-series';
      culturalBackground?: string;
      targetAudience?: string;
      enneagramHint?: number;
    } = {}
  ): Promise<{ character: Character3D; characterFramework: ArchitectedCharacter }> {
    
    try {
      console.log('🎭 CHARACTER ENGINE: Generating enhanced character with V2.0 framework...');
      
      // Generate using V2.0 framework
      const characterFramework = await CharacterEngineV2.architectCharacter(
        premise,
        characterRole, 
        characterConcept,
        options
      );

      // Convert to legacy format
      const character = this.convertToLegacyCharacter(characterFramework);

      // Apply V2.0 enhancements to legacy blueprint
      this.applyCharacterFrameworkToBlueprint(character, characterFramework);

      return {
        character,
        characterFramework
      };
      
    } catch (error) {
      console.error('Error generating enhanced character:', error);
      
      // Fallback to original method based on role
      let fallbackCharacter: Character3D;
      if (characterRole.toLowerCase().includes('protagonist')) {
        fallbackCharacter = await this.generateProtagonist(premise, characterConcept);
      } else if (characterRole.toLowerCase().includes('antagonist')) {
        const tempProtagonist = await this.generateProtagonist(premise, 'temp hero');
        fallbackCharacter = await this.generateAntagonist(premise, tempProtagonist, characterConcept);
      } else {
        fallbackCharacter = await this.generateSupportingCharacter('catalyst', premise, [], characterConcept);
      }
      
      return {
        character: fallbackCharacter,
        characterFramework: {} as ArchitectedCharacter
      };
    }
  }

  /**
   * Convert V2.0 ArchitectedCharacter to legacy Character3D format
   */
  private static convertToLegacyCharacter(architected: ArchitectedCharacter): Character3D {
    return {
      name: architected.name,
      
      physiology: {
        gender: 'unspecified',
        appearance: 'Enhanced character appearance',
        height: "5'8\"",
        build: 'average',
        physicalTraits: ['Enhanced distinctive features'],
        health: 'good',
        defects: [],
        heredity: 'Enhanced family traits'
      },
      
      sociology: {
        class: 'middle',
        occupation: architected.role || 'Enhanced profession',
        education: 'Enhanced education',
        homeLife: 'Enhanced family situation',
        religion: 'Enhanced beliefs',
        race: 'Enhanced ethnicity',
        nationality: 'Enhanced cultural background',
        politicalAffiliation: 'Enhanced political views',
        hobbies: ['Enhanced hobby'],
        communityStanding: 'Enhanced standing',
        economicStatus: 'Enhanced economic status',
        familyRelationships: ['Enhanced relationships']
      },
      
      psychology: {
        coreValue: architected.enneagramType.basicDesire,
        opposingValue: architected.enneagramType.basicFear,
        moralStandpoint: 'Enhanced moral code',
        want: 'Enhanced character want',
        need: 'Enhanced character need',
        primaryFlaw: 'Enhanced character flaw',
        secondaryFlaws: ['Enhanced secondary flaw'],
        temperament: ['Enhanced temperament'],
        attitude: 'Enhanced attitude',
        complexes: [architected.enneagramType.motivationCore],
        ambitions: ['Enhanced ambition'],
        frustrations: [architected.enneagramType.basicFear],
        fears: [architected.enneagramType.basicFear],
        superstitions: [],
        likes: [],
        dislikes: [],
        iq: 105,
        abilities: [],
        talents: [],
        childhood: 'Enhanced formative childhood',
        trauma: ['Enhanced character trauma'],
        successes: []
      },
      
      // Required Character3D properties
      premiseRole: 'catalyst',
      premiseFunction: 'Enhanced to test the premise with V2.0 framework',
      arcIntroduction: 1,
      characterEvolution: [],
      
      speechPattern: {
        vocabulary: 'educated',
        rhythm: 'measured',
        catchphrases: ['Enhanced catchphrase'],
        uniqueExpressions: ['Enhanced expression'],
        accent: 'enhanced accent',
        voiceNotes: 'Enhanced voice powered by V2.0 framework'
      }
    };
  }

  /**
   * Apply V2.0 framework enhancements to legacy blueprint
   */
  private static applyCharacterFrameworkToBlueprint(
    character: Character3D, 
    framework: ArchitectedCharacter
  ): void {
    // Enhance psychological depth with Enneagram insights
    character.psychology.complexes = [
      framework.enneagramType.motivationCore,
      framework.enneagramType.defenseMechanism,
      framework.enneagramType.avoidancePattern
    ];

    // Enhance speech patterns with V2.0 insights
    character.speechPattern.voiceNotes = `Enhanced with V2.0 Framework: ${framework.enneagramType.name}`;

    // Add Big Five personality insights to temperament
    if (framework.bigFiveProfile) {
      character.psychology.temperament = [
        `Enhanced with Big Five insights from V2.0 framework`,
        framework.enneagramType.name + ' personality type'
      ];
    }

    console.log('✨ Applied V2.0 character framework enhancements to legacy blueprint');
  }
} 