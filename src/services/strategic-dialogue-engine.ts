/**
 * The Strategic Dialogue Engine - AI-Enhanced Dialogue as Character Warfare
 * 
 * Every line of dialogue serves three functions:
 * 1. Advance the plot
 * 2. Reveal character  
 * 3. Create conflict
 * 
 * Dialogue is modeled as a strategic game where characters use
 * words as tactics to achieve their scene objectives.
 * 
 * ENHANCEMENT V2.0: Now integrates with comprehensive dialogue architecture framework
 * - Master techniques (Sorkin, Mamet, Tarantino)
 * - Subtext and layered meaning systems
 * - Professional voice differentiation
 * - Genre-specific vernaculars
 * - Technical performance considerations
 * - Advanced editing and revision systems
 */

import { Character3D } from './character-engine'
import { NarrativeScene } from './fractal-narrative-engine'
import { generateEngineContent as generateContent } from './engine-ai-router'
import { DialogueEngineV2, type DialogueRecommendation } from './dialogue-engine-v2'

// Dialogue tactical approaches
export type DialogueTactic = 
  | 'direct-approach'      // Say exactly what you want
  | 'feigned-innocence'    // Pretend not to know something
  | 'emotional-appeal'     // Use feelings to persuade
  | 'logical-argument'     // Use reason and facts
  | 'intimidation'         // Use fear or power
  | 'misdirection'         // Change the subject
  | 'vulnerability'        // Show weakness to gain sympathy
  | 'humor'               // Use comedy to defuse or distract
  | 'reverse-psychology'   // Get them to want the opposite
  | 'alliance-building'    // Find common ground
  | 'information-fishing'  // Try to learn something hidden
  | 'evasion'             // Avoid giving information

// Speech pattern characteristics
export interface SpeechPattern {
  vocabulary: 'simple' | 'educated' | 'street' | 'technical' | 'poetic' | 'formal';
  rhythm: 'fast' | 'measured' | 'slow' | 'staccato' | 'flowing';
  sentenceLength: 'short' | 'mixed' | 'long';
  formality: 'casual' | 'professional' | 'intimate' | 'formal';
  regionalAccent?: string;
  uniqueExpressions: string[];
  catchphrases: string[];
  speechHabits: string[]; // "um", "you know", "like", etc.
}

// Subtext layers - what's really being communicated
export interface DialogueSubtext {
  surfaceLevel: string;     // What they literally say
  emotionalLevel: string;   // What they feel
  intentionalLevel: string; // What they want to achieve
  fearLevel?: string;       // What they're afraid of revealing
  powerLevel?: string;      // Status/dominance implications
}

// Individual dialogue line with strategic purpose
export interface DialogueLine {
  character: string;
  text: string;
  
  // Strategic purpose
  tactic: DialogueTactic;
  objective: string;        // What they're trying to achieve
  target: string;          // Who they're trying to affect
  
  // Subtext layers
  subtext: DialogueSubtext;
  
  // Speech characteristics
  delivery: {
    tone: string;           // angry, playful, serious, etc.
    volume: 'whisper' | 'normal' | 'loud' | 'shout';
    pace: 'rushed' | 'normal' | 'deliberate' | 'hesitant';
    emphasis?: string;      // Which words to stress
  };
  
  // Story function
  purpose: {
    plot: string;           // How this advances the story
    character: string;      // What this reveals about the speaker
    conflict: string;       // How this creates/resolves tension
  };
  
  // Natural speech elements
  naturalElements: {
    contractions: boolean;   // "don't" vs "do not"
    interruptions?: string;  // "I was just—"
    pauses?: string[];      // [beat], [long pause]
    gestures?: string[];    // [laughs], [sighs]
  };
}

// Complete dialogue exchange
export interface DialogueExchange {
  sceneContext: string;
  participants: Character3D[];
  conflictType: 'information' | 'persuasion' | 'confrontation' | 'negotiation' | 'revelation';
  
  // The strategic game
  objectives: {
    character: string;
    wants: string;          // What they want from this conversation
    fears: string;          // What they're afraid will happen
    strategy: string;       // Their overall approach
  }[];
  
  // The actual dialogue
  lines: DialogueLine[];
  
  // Escalation pattern
  escalation: {
    startingTension: number;    // 1-10 scale
    peakTension: number;        // Highest point reached
    endingTension: number;      // Where it settles
    turningPoint: number;       // Which line number changes everything
  };
  
  // Outcome
  resolution: {
    winner?: string;            // Who achieved their objective (if any)
    reveals: string[];          // What was revealed
    consequences: string[];     // What happens next
    relationshipChange: string; // How this affects character dynamics
  };
}

// Dialogue generation templates
export interface DialogueTemplate {
  name: string;
  description: string;
  structure: {
    phase: 'opening' | 'development' | 'escalation' | 'climax' | 'resolution';
    turns: number;              // How many back-and-forth exchanges
    tacticsUsed: DialogueTactic[];
    intensityPattern: number[]; // Tension level for each exchange
  }[];
  
  // When to use this template
  applicableWhen: {
    conflictType: string[];
    characterRelationship: string[];
    sceneFunction: string[];
  };
}

export class StrategicDialogueEngine {
  
  /**
   * V2.0 ENHANCED: Generate professional dialogue using master techniques framework
   */
  static async generateProfessionalDialogue(
    scene: NarrativeScene,
    participants: Character3D[],
    options: {
      masterTechnique?: 'sorkin' | 'mamet' | 'tarantino' | 'mixed';
      genre: 'comedy' | 'drama' | 'thriller' | 'action' | 'romance' | 'horror';
      subtextLevel?: 'minimal' | 'moderate' | 'heavy';
      conflictIntensity?: number; // 1-10
      lengthTarget?: 'short' | 'medium' | 'long';
      voiceDifferentiation?: boolean;
      periodSetting?: string;
      performanceNotes?: boolean;
    }
  ): Promise<DialogueRecommendation> {
    
    console.log(`🎭 STRATEGIC DIALOGUE V2.0: Generating ${options.genre} dialogue with ${options.masterTechnique || 'mixed'} technique...`);
    
    try {
      // Map scene and characters to V2 context
      const dialogueContext = {
        characters: participants.map(char => ({
          name: char.name,
          personality: char.psychology.coreValue,
          background: `${char.sociology.class} ${char.sociology.occupation}`,
          objective: this.extractCharacterObjective(char, scene),
          emotionalState: char.psychology.temperament.join(', ')
        })),
        sceneObjective: scene.goal.objective,
        conflictType: this.determineConflictType(scene),
        genre: options.genre,
        setting: scene.location,
        stakes: scene.goal.stakes
      };
      
      const requirements = {
        masterTechnique: options.masterTechnique || 'mixed',
        subtextLevel: options.subtextLevel || 'moderate',
        conflictIntensity: options.conflictIntensity || 7,
        lengthTarget: options.lengthTarget || 'medium',
        emotionalArc: 'escalation' // Default emotional arc
      };
      
      const v2Options = {
        voiceDifferentiation: options.voiceDifferentiation ?? true,
        periodSetting: options.periodSetting,
        performanceNotes: options.performanceNotes ?? true,
        revisionLevel: 'professional' as const
      };
      
      // Use the advanced V2.0 engine for comprehensive dialogue generation
      const dialogueRecommendation = await DialogueEngineV2.generateDialogueSequence(
        dialogueContext,
        requirements,
        v2Options
      );
      
      console.log(`✅ STRATEGIC DIALOGUE V2.0: Generated professional dialogue with ${dialogueRecommendation.primaryRecommendation.confidence}/10 confidence`);
      
      return dialogueRecommendation;
      
    } catch (error) {
      console.error('❌ Strategic Dialogue V2.0 failed:', error);
      throw new Error(`Professional dialogue generation failed: ${error}`);
    }
  }
  
  /**
   * LEGACY SUPPORT: Generates a complete dialogue exchange based on scene objectives
   */
  static async generateDialogueExchange(
    scene: NarrativeScene,
    participants: Character3D[],
    conflictType: 'information' | 'persuasion' | 'confrontation' | 'negotiation' | 'revelation' = 'persuasion'
  ): Promise<DialogueExchange> {
    
    // AI-Enhanced: Define character objectives for this conversation
    const objectives = await this.generateCharacterObjectivesAI(scene, participants, conflictType);
    
    // AI-Enhanced: Select appropriate dialogue template
    const template = await this.selectDialogueTemplateAI(conflictType, participants, scene);
    
    // AI-Enhanced: Generate the actual dialogue lines
    const lines = await this.generateDialogueLinesAI(objectives, template, participants, scene);
    
    // Calculate escalation pattern
    const escalation = this.calculateEscalationPattern(lines, template);
    
    // AI-Enhanced: Determine outcome
    const resolution = await this.determineDialogueOutcomeAI(lines, objectives, scene);
    
    return {
      sceneContext: `${scene.location} - ${scene.goal.objective}`,
      participants,
      conflictType,
      objectives,
      lines,
      escalation,
      resolution
    };
  }
  
  /**
   * AI-ENHANCED: Generates natural, character-specific speech patterns
   */
  static async generateSpeechPattern(character: Character3D): Promise<SpeechPattern> {
    const prompt = `Generate a speech pattern for this character:

CHARACTER: ${character.name}
PSYCHOLOGY: ${character.psychology.coreValue}, IQ: ${character.psychology.iq}, Temperament: ${character.psychology.temperament.join(', ')}
SOCIOLOGY: Class: ${character.sociology.class}, Occupation: ${character.sociology.occupation}, Nationality: ${character.sociology.nationality}

Create speech pattern considering:
1. Vocabulary level based on education and class
2. Speaking rhythm based on temperament
3. Formality based on social status
4. Regional characteristics
5. Unique expressions that reflect their values

Return JSON:
{
  "vocabulary": "simple/educated/street/technical/poetic/formal",
  "rhythm": "fast/measured/slow/staccato/flowing", 
  "sentenceLength": "short/mixed/long",
  "formality": "casual/professional/intimate/formal",
  "regionalAccent": "accent or null",
  "uniqueExpressions": ["character-specific expressions"],
  "catchphrases": ["memorable phrases they use"],
  "speechHabits": ["verbal tics like 'um', 'you know'"]
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in character voice and speech patterns. Create distinctive, realistic speech characteristics.',
        temperature: 0.6,
        maxTokens: 400
      });

      const pattern = JSON.parse(result || '{}');
      if (pattern.vocabulary && pattern.rhythm && pattern.formality) {
        return pattern as SpeechPattern;
      }
      
      return this.generateSpeechPatternFallback(character);
    } catch (error) {
      console.warn('AI speech pattern generation failed, using fallback:', error);
      return this.generateSpeechPatternFallback(character);
    }
  }
  
  /**
   * AI-ENHANCED: Creates subtext layers for dialogue depth
   */
  static async generateSubtext(
    character: Character3D,
    objective: string,
    tactic: DialogueTactic,
    target: Character3D,
    sceneContext: string
  ): Promise<DialogueSubtext> {
    const prompt = `Generate dialogue subtext layers:

SPEAKER: ${character.name} (${character.psychology.coreValue}, fears: ${character.psychology.fears.join(', ')})
TARGET: ${target.name} (${target.psychology.coreValue})
OBJECTIVE: ${objective}
TACTIC: ${tactic}
CONTEXT: ${sceneContext}

Create subtext that reveals:
1. What they literally say vs what they mean
2. Their emotional state beneath the words
3. Their true intention
4. What they're afraid of revealing
5. Power dynamics at play

Return JSON:
{
  "surfaceLevel": "what they appear to be discussing",
  "emotionalLevel": "what they're really feeling",
  "intentionalLevel": "what they actually want to achieve",
  "fearLevel": "what they're afraid will be exposed",
  "powerLevel": "status/dominance implications"
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in dialogue subtext and character psychology. Create layered, meaningful subtext.',
        temperature: 0.6,
        maxTokens: 300
      });

      const subtext = JSON.parse(result || '{}');
      if (subtext.surfaceLevel && subtext.emotionalLevel && subtext.intentionalLevel) {
        return subtext as DialogueSubtext;
      }
      
      return this.generateSubtextFallback(character, objective, tactic, target, sceneContext);
    } catch (error) {
      return this.generateSubtextFallback(character, objective, tactic, target, sceneContext);
    }
  }

  /**
   * AI-ENHANCED: Applies natural speech elements to make dialogue believable
   */
  static async naturalizeDialogue(
    text: string,
    character: Character3D,
    tactic: DialogueTactic,
    tension: number
  ): Promise<{ text: string; naturalElements: any }> {
    const prompt = `Naturalize this dialogue to make it sound authentic:

ORIGINAL TEXT: "${text}"
CHARACTER: ${character.name} (${character.psychology.coreValue}, temperament: ${character.psychology.temperament.join(', ')})
TACTIC: ${tactic}
TENSION LEVEL: ${tension}/10

Apply natural speech elements:
1. Contractions if appropriate for character
2. Interruptions if tension is high
3. Pauses for emphasis or hesitation
4. Gestures/actions that support the dialogue
5. Character-specific speech patterns

Return JSON:
{
  "naturalizedText": "improved dialogue with natural elements",
  "naturalElements": {
    "contractions": true/false,
    "interruptions": "text if any",
    "pauses": ["pause indicators"],
    "gestures": ["gesture descriptions"]
  }
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in natural dialogue and speech patterns. Make dialogue sound authentic and character-specific.',
        temperature: 0.6,
        maxTokens: 300
      });

      const naturalized = JSON.parse(result || '{}');
      if (naturalized.naturalizedText && naturalized.naturalElements) {
        return {
          text: naturalized.naturalizedText,
          naturalElements: naturalized.naturalElements
        };
      }
      
      return this.naturalizeDialogueFallback(text, character, tactic, tension);
    } catch (error) {
      return this.naturalizeDialogueFallback(text, character, tactic, tension);
    }
  }
  
  /**
   * Validates dialogue against the three functions rule
   */
  static validateDialogue(line: DialogueLine, scene: NarrativeScene): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check if it advances plot
    if (!line.purpose.plot || line.purpose.plot === 'none') {
      issues.push('Does not advance plot');
      recommendations.push('Add plot information or consequence');
    }
    
    // Check if it reveals character
    if (!line.purpose.character || line.purpose.character === 'generic') {
      issues.push('Does not reveal character');
      recommendations.push('Add character-specific language or motivation');
    }
    
    // Check if it creates conflict
    if (!line.purpose.conflict || line.purpose.conflict === 'none') {
      issues.push('Does not create conflict');
      recommendations.push('Add opposing objectives or tension');
    }
    
    // Check for exposition dump
    if (line.text.length > 200 && !line.text.includes('?')) {
      issues.push('Potential exposition dump');
      recommendations.push('Break into smaller exchanges or add questions');
    }
    
    // Check for natural speech
    if (!line.naturalElements.contractions && line.character !== 'formal speaker') {
      issues.push('Sounds too formal');
      recommendations.push('Add contractions and casual language');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
  
  // ============================================================
  // AI-ENHANCED DIALOGUE GENERATION METHODS
  // ============================================================

  /**
   * AI-ENHANCED: Generate character objectives for conversation
   */
  private static async generateCharacterObjectivesAI(
    scene: NarrativeScene,
    participants: Character3D[],
    conflictType: string
  ): Promise<any[]> {
    const prompt = `Generate conversation objectives for each character:

SCENE GOAL: ${scene.goal.objective}
SCENE OBSTACLE: ${scene.obstacle.description}
CONFLICT TYPE: ${conflictType}
CHARACTERS: ${participants.map(c => `${c.name} (wants: ${c.psychology.want}, fears: ${c.psychology.fears.join(', ')}, values: ${c.psychology.coreValue})`).join(', ')}

For each character, define:
1. What they want from this conversation
2. What they're afraid will happen
3. Their strategic approach

Return JSON array:
[
  {
    "character": "character name",
    "wants": "specific conversation goal",
    "fears": "what they're afraid of in this exchange",
    "strategy": "their overall approach to the conversation"
  }
]`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in character motivation and dialogue strategy.',
        temperature: 0.5,
        maxTokens: 400
      });

      const objectives = JSON.parse(result || '[]');
      if (Array.isArray(objectives) && objectives.length > 0) {
        return objectives;
      }
      
      return this.generateCharacterObjectivesFallback(scene, participants, conflictType);
    } catch (error) {
      return this.generateCharacterObjectivesFallback(scene, participants, conflictType);
    }
  }

  /**
   * AI-ENHANCED: Select appropriate dialogue template
   */
  private static async selectDialogueTemplateAI(
    conflictType: string,
    participants: Character3D[],
    scene: NarrativeScene
  ): Promise<DialogueTemplate> {
    const prompt = `Design a dialogue template for this conversation:

CONFLICT TYPE: ${conflictType}
PARTICIPANTS: ${participants.map(c => `${c.name} (${c.psychology.coreValue})`).join(' vs ')}
SCENE FUNCTION: ${scene.goal.objective}
RELATIONSHIP: ${participants.length > 1 ? this.analyzeRelationship(participants[0], participants[1]) : 'solo'}

Create dialogue structure with:
1. Opening: How they start the conversation
2. Development: How conflict builds
3. Escalation: Rising tension points
4. Climax: Peak moment of conflict
5. Resolution: How it concludes

Return JSON template with phases, turns, tactics, and intensity patterns.`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in dialogue structure and dramatic conversation patterns.',
        temperature: 0.4,
        maxTokens: 500
      });

      const template = JSON.parse(result || '{}');
      if (template.structure && Array.isArray(template.structure)) {
        return template as DialogueTemplate;
      }
      
      return this.selectDialogueTemplateFallback(conflictType, participants, scene);
    } catch (error) {
      return this.selectDialogueTemplateFallback(conflictType, participants, scene);
    }
  }

  /**
   * AI-ENHANCED: Generate the actual dialogue lines
   */
  private static async generateDialogueLinesAI(
    objectives: any[],
    template: DialogueTemplate,
    participants: Character3D[],
    scene: NarrativeScene
  ): Promise<DialogueLine[]> {
    const lines: DialogueLine[] = [];
    let currentSpeaker = 0;
    
    for (const phase of template.structure) {
      for (let turn = 0; turn < phase.turns; turn++) {
        const speaker = participants[currentSpeaker % participants.length];
        const speakerObjective = objectives.find(obj => obj.character === speaker.name);
        const tactic = phase.tacticsUsed[turn % phase.tacticsUsed.length];
        const tension = phase.intensityPattern[turn % phase.intensityPattern.length];
        
        const line = await this.generateSingleLineAI(
          speaker,
          speakerObjective,
          tactic,
          tension,
          scene,
          participants,
          lines // Previous lines for context
        );
        
        lines.push(line);
        currentSpeaker++;
      }
    }
    
    return lines;
  }

  /**
   * AI-ENHANCED: Generate a single dialogue line
   */
  private static async generateSingleLineAI(
    speaker: Character3D,
    objective: any,
    tactic: DialogueTactic,
    tension: number,
    scene: NarrativeScene,
    allParticipants: Character3D[],
    previousLines: DialogueLine[]
  ): Promise<DialogueLine> {
    const target = allParticipants.find(p => p.name !== speaker.name) || allParticipants[0];
    
    const prompt = `Generate a strategic dialogue line:

SPEAKER: ${speaker.name} (${speaker.psychology.coreValue}, ${speaker.psychology.temperament.join(', ')})
OBJECTIVE: ${objective.wants}
TACTIC: ${tactic}
TENSION: ${tension}/10
TARGET: ${target.name}
SCENE: ${scene.location} - ${scene.goal.objective}
PREVIOUS CONTEXT: ${previousLines.slice(-2).map(l => `${l.character}: "${l.text}"`).join(' / ') || 'Start of conversation'}

Create dialogue that:
1. Uses the ${tactic} tactic to achieve their objective
2. Sounds natural for this character's voice
3. Advances plot, reveals character, creates conflict
4. Responds appropriately to previous lines
5. Maintains the ${tension}/10 tension level

Generate a single line of dialogue that serves the scene and character.`;

    try {
      const baseText = await generateContent({
        prompt,
        systemPrompt: 'You are an expert dialogue writer. Create strategic, character-specific dialogue that serves multiple story functions.',
        temperature: 0.7,
        maxTokens: 150,
        engineId: 'strategic-dialogue-engine'
      });

      if (!baseText?.trim()) {
        return this.generateSingleLineFallback(speaker, objective, tactic, tension, scene, allParticipants);
      }

      // Generate subtext
      const subtext = await this.generateSubtext(speaker, objective.wants, tactic, target, scene.location);
      
      // Naturalize the text
      const { text, naturalElements } = await this.naturalizeDialogue(baseText.trim(), speaker, tactic, tension);
      
      return {
        character: speaker.name,
        text,
        tactic,
        objective: objective.wants,
        target: target.name,
        subtext,
        delivery: await this.generateDeliveryAI(speaker, tactic, tension, text),
        purpose: await this.generatePurposeAI(text, speaker, scene, tactic, tension),
        naturalElements
      };
    } catch (error) {
      console.warn('AI dialogue generation failed, using fallback:', error);
      return this.generateSingleLineFallback(speaker, objective, tactic, tension, scene, allParticipants);
    }
  }

  /**
   * AI-ENHANCED: Generate dialogue delivery instructions
   */
  private static async generateDeliveryAI(
    speaker: Character3D,
    tactic: DialogueTactic,
    tension: number,
    text: string
  ): Promise<any> {
    const prompt = `Generate delivery instructions for this dialogue:

SPEAKER: ${speaker.name} (${speaker.psychology.temperament.join(', ')})
TACTIC: ${tactic}
TENSION: ${tension}/10
TEXT: "${text}"

Determine:
1. Tone that matches character and tactic
2. Volume appropriate for tension
3. Pace that serves the moment
4. Which words to emphasize

Return JSON:
{
  "tone": "emotional tone",
  "volume": "whisper/normal/loud/shout",
  "pace": "rushed/normal/deliberate/hesitant", 
  "emphasis": "key word or phrase to stress"
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in dialogue delivery and acting direction.',
        temperature: 0.5,
        maxTokens: 150
      });

      const delivery = JSON.parse(result || '{}');
      if (delivery.tone && delivery.volume && delivery.pace) {
        return delivery;
      }
      
      return this.generateDeliveryFallback(speaker, tactic, tension);
    } catch (error) {
      return this.generateDeliveryFallback(speaker, tactic, tension);
    }
  }

  /**
   * AI-ENHANCED: Generate dialogue purpose analysis
   */
  private static async generatePurposeAI(
    text: string,
    speaker: Character3D,
    scene: NarrativeScene,
    tactic: DialogueTactic,
    tension: number
  ): Promise<any> {
    const prompt = `Analyze how this dialogue serves the three functions:

TEXT: "${text}"
SPEAKER: ${speaker.name} (${speaker.psychology.coreValue})
SCENE GOAL: ${scene.goal.objective}
TACTIC: ${tactic}
TENSION: ${tension}/10

Explain how this line:
1. Advances the plot
2. Reveals character
3. Creates conflict

Return JSON:
{
  "plot": "how this advances the story",
  "character": "what this reveals about the speaker",
  "conflict": "how this creates or escalates tension"
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in dialogue analysis and story function.',
        temperature: 0.4,
        maxTokens: 200
      });

      const purpose = JSON.parse(result || '{}');
      if (purpose.plot && purpose.character && purpose.conflict) {
        return purpose;
      }
      
      return this.generatePurposeFallback(text, speaker, scene, tactic);
    } catch (error) {
      return this.generatePurposeFallback(text, speaker, scene, tactic);
    }
  }

  /**
   * AI-ENHANCED: Determine dialogue outcome
   */
  private static async determineDialogueOutcomeAI(
    lines: DialogueLine[],
    objectives: any[],
    scene: NarrativeScene
  ): Promise<any> {
    const prompt = `Analyze the outcome of this dialogue exchange:

DIALOGUE SUMMARY: ${lines.map(l => `${l.character}: ${l.tactic} - "${l.text}"`).join(' / ')}
OBJECTIVES: ${objectives.map(obj => `${obj.character} wanted: ${obj.wants}`).join(', ')}
SCENE GOAL: ${scene.goal.objective}

Determine:
1. Who achieved their objective (if anyone)
2. What was revealed in the conversation
3. What consequences this creates
4. How relationships changed

Return JSON:
{
  "winner": "character name or null",
  "reveals": ["what was revealed"],
  "consequences": ["what happens next"],
  "relationshipChange": "how dynamics shifted"
}`;

    try {
      const result = await generateContent({
        prompt,
        systemPrompt: 'You are an expert in dialogue analysis and story consequences.',
        temperature: 0.5,
        maxTokens: 300
      });

      const outcome = JSON.parse(result || '{}');
      if (outcome.reveals && outcome.consequences && outcome.relationshipChange) {
        return outcome;
      }
      
      return this.determineDialogueOutcomeFallback(lines, objectives, scene);
    } catch (error) {
      return this.determineDialogueOutcomeFallback(lines, objectives, scene);
    }
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================
  
  private static generateCharacterObjectivesFallback(
    scene: NarrativeScene,
    participants: Character3D[],
    conflictType: string
  ) {
    return participants.map(character => ({
      character: character.name,
      wants: this.deriveConversationGoal(character, scene, conflictType),
      fears: this.deriveConversationFear(character, scene),
      strategy: this.deriveConversationStrategy(character, conflictType)
    }));
  }
  
  private static selectDialogueTemplateFallback(
    conflictType: string,
    participants: Character3D[],
    scene: NarrativeScene
  ): DialogueTemplate {
    // Return appropriate template based on context
    return {
      name: `${conflictType}-template`,
      description: `Template for ${conflictType} dialogue`,
      structure: [
        {
          phase: 'opening',
          turns: 2,
          tacticsUsed: ['direct-approach', 'information-fishing'],
          intensityPattern: [3, 4]
        },
        {
          phase: 'development', 
          turns: 3,
          tacticsUsed: ['logical-argument', 'emotional-appeal', 'misdirection'],
          intensityPattern: [5, 6, 7]
        },
        {
          phase: 'climax',
          turns: 2,
          tacticsUsed: ['intimidation', 'vulnerability'],
          intensityPattern: [8, 9]
        },
        {
          phase: 'resolution',
          turns: 1,
          tacticsUsed: ['direct-approach'],
          intensityPattern: [6]
        }
      ],
      applicableWhen: {
        conflictType: [conflictType],
        characterRelationship: ['any'],
        sceneFunction: ['any']
      }
    };
  }
  
  private static generateDialogueLines(
    objectives: any[],
    template: DialogueTemplate,
    participants: Character3D[],
    scene: NarrativeScene
  ): DialogueLine[] {
    const lines: DialogueLine[] = [];
    let currentSpeaker = 0;
    
    for (const phase of template.structure) {
      for (let turn = 0; turn < phase.turns; turn++) {
        const speaker = participants[currentSpeaker % participants.length];
        const speakerObjective = objectives.find(obj => obj.character === speaker.name);
        const tactic = phase.tacticsUsed[turn % phase.tacticsUsed.length];
        const tension = phase.intensityPattern[turn % phase.intensityPattern.length];
        
        const line = this.generateSingleLine(
          speaker,
          speakerObjective,
          tactic,
          tension,
          scene,
          participants
        );
        
        lines.push(line);
        currentSpeaker++;
      }
    }
    
    return lines;
  }
  
  private static generateSingleLine(
    speaker: Character3D,
    objective: any,
    tactic: DialogueTactic,
    tension: number,
    scene: NarrativeScene,
    allParticipants: Character3D[]
  ): DialogueLine {
    
    // Generate base text based on tactic and objective
    const baseText = this.generateTacticalText(speaker, objective, tactic, tension);
    
    // Generate subtext
    const target = allParticipants.find(p => p.name !== speaker.name) || allParticipants[0];
    const subtext = this.generateSubtextFallback(speaker, objective.wants, tactic, target, scene.location);
    
    // Naturalize the text
    const { text, naturalElements } = this.naturalizeDialogueFallback(baseText, speaker, tactic, tension);
    
    return {
      character: speaker.name,
      text,
      tactic,
      objective: objective.wants,
      target: target.name,
      subtext,
      delivery: {
        tone: this.determineTone(speaker, tactic, tension),
        volume: this.determineVolume(tactic, tension),
        pace: this.determinePace(speaker, tactic, tension),
        emphasis: this.determineEmphasis(text, tactic)
      },
      purpose: {
        plot: this.determinePlotFunction(text, scene),
        character: this.determineCharacterFunction(text, speaker),
        conflict: this.determineConflictFunction(text, tactic, tension)
      },
      naturalElements
    };
  }

  private static generateSingleLineFallback(
    speaker: Character3D,
    objective: any,
    tactic: DialogueTactic,
    tension: number,
    scene: NarrativeScene,
    allParticipants: Character3D[]
  ): DialogueLine {
    
    // Generate base text based on tactic and objective
    const baseText = this.generateTacticalText(speaker, objective, tactic, tension);
    
    // Generate subtext
    const target = allParticipants.find(p => p.name !== speaker.name) || allParticipants[0];
    const subtext = this.generateSubtextFallback(speaker, objective.wants, tactic, target, scene.location);
    
    // Naturalize the text
    const { text, naturalElements } = this.naturalizeDialogueFallback(baseText, speaker, tactic, tension);
    
    return {
      character: speaker.name,
      text,
      tactic,
      objective: objective.wants,
      target: target.name,
      subtext,
      delivery: {
        tone: this.determineTone(speaker, tactic, tension),
        volume: this.determineVolume(tactic, tension),
        pace: this.determinePace(speaker, tactic, tension),
        emphasis: this.determineEmphasis(text, tactic)
      },
      purpose: {
        plot: this.determinePlotFunction(text, scene),
        character: this.determineCharacterFunction(text, speaker),
        conflict: this.determineConflictFunction(text, tactic, tension)
      },
      naturalElements
    };
  }

  // ============================================================
  // FALLBACK METHODS (Original Logic for Reliability)
  // ============================================================
  
  private static generateSpeechPatternFallback(character: Character3D): SpeechPattern {
    const vocabulary = this.determineVocabulary(character);
    const rhythm = this.determineRhythm(character);
    const formality = this.determineFormality(character);
    
    return {
      vocabulary,
      rhythm,
      sentenceLength: this.determineSentenceLength(character, rhythm),
      formality,
      regionalAccent: this.determineAccent(character),
      uniqueExpressions: this.generateUniqueExpressions(character),
      catchphrases: this.generateCatchphrases(character),
      speechHabits: this.generateSpeechHabits(character, vocabulary)
    };
  }

  private static generateSubtextFallback(
    character: Character3D,
    objective: string,
    tactic: DialogueTactic,
    target: Character3D,
    sceneContext: string
  ): DialogueSubtext {
    
    const surfaceLevel = this.generateSurfaceDialogue(tactic, objective);
    const emotionalLevel = this.extractEmotionalSubtext(character, objective, target);
    const intentionalLevel = this.extractIntentionalSubtext(objective, tactic);
    const fearLevel = this.extractFearSubtext(character, target, sceneContext);
    const powerLevel = this.extractPowerSubtext(character, target, tactic);
    
    return {
      surfaceLevel,
      emotionalLevel,
      intentionalLevel,
      fearLevel,
      powerLevel
    };
  }

  private static naturalizeDialogueFallback(
    text: string,
    character: Character3D,
    tactic: DialogueTactic,
    tension: number
  ): { text: string; naturalElements: any } {
    
    let naturalizedText = text;
    const naturalElements: any = {
      contractions: false,
      interruptions: undefined,
      pauses: [],
      gestures: []
    };
    
    // Apply contractions based on character formality  
    const speechPattern = character.speechPattern || this.generateSpeechPatternFallback(character);
    const formality = (speechPattern as any).formality || this.determineFormality(character);
    if (formality !== 'formal') {
      naturalizedText = this.applyContractions(naturalizedText);
      naturalElements.contractions = true;
    }
    
    // Add interruptions if tension is high
    if (tension > 7) {
      const interruption = this.generateInterruption(character, tactic);
      if (interruption) {
        naturalElements.interruptions = interruption;
        naturalizedText = this.insertInterruption(naturalizedText, interruption);
      }
    }
    
    // Add pauses for emphasis or hesitation
    const pauses = this.generatePauses(character, tactic, tension);
    if (pauses.length > 0) {
      naturalElements.pauses = pauses;
      naturalizedText = this.insertPauses(naturalizedText, pauses);
    }
    
    // Add gestures for emotional expression
    const gestures = this.generateGestures(character, tactic, tension);
    if (gestures.length > 0) {
      naturalElements.gestures = gestures;
      naturalizedText = this.insertGestures(naturalizedText, gestures);
    }
    
    return { text: naturalizedText, naturalElements };
  }

  private static generateDeliveryFallback(speaker: Character3D, tactic: DialogueTactic, tension: number): any {
    return {
      tone: this.determineTone(speaker, tactic, tension),
      volume: this.determineVolume(tactic, tension),
      pace: this.determinePace(speaker, tactic, tension),
      emphasis: this.determineEmphasis('', tactic)
    };
  }

  private static generatePurposeFallback(text: string, speaker: Character3D, scene: NarrativeScene, tactic: DialogueTactic): any {
    return {
      plot: this.determinePlotFunction(text, scene),
      character: this.determineCharacterFunction(text, speaker),
      conflict: this.determineConflictFunction(text, tactic, 6)
    };
  }

  private static determineDialogueOutcomeFallback(lines: DialogueLine[], objectives: any[], scene: NarrativeScene): any {
    return {
      winner: objectives[0]?.character,
      reveals: ['Character motivation', 'Plot information'],
      consequences: ['Relationship tension', 'Plot advancement'],
      relationshipChange: 'Increased understanding'
    };
  }

  private static analyzeRelationship(char1: Character3D, char2: Character3D): string {
    if (char1.psychology.coreValue === char2.psychology.coreValue) return 'ally';
    if (char1.psychology.want === char2.psychology.want) return 'rivalry';
    return 'neutral';
  }
  
  // Additional helper methods (would be fully implemented)
  
  private static determineVocabulary(character: Character3D): 'simple' | 'educated' | 'street' | 'technical' | 'poetic' | 'formal' {
    if (character.psychology.iq > 120) return 'educated';
    if (character.sociology.class === 'working') return 'simple';
    if (character.sociology.occupation.includes('technical')) return 'technical';
    return 'educated';
  }
  
  private static determineRhythm(character: Character3D): 'fast' | 'measured' | 'slow' | 'staccato' | 'flowing' {
    if (character.psychology.temperament.includes('anxious')) return 'fast';
    if (character.psychology.temperament.includes('patient')) return 'measured';
    return 'measured';
  }
  
  private static determineFormality(character: Character3D): 'casual' | 'professional' | 'intimate' | 'formal' {
    if (character.sociology.class === 'upper') return 'formal';
    if (character.sociology.occupation.includes('professional')) return 'professional';
    return 'casual';
  }
  
  // More helper methods would continue...
  private static determineSentenceLength(character: Character3D, rhythm: string): 'short' | 'mixed' | 'long' {
    return rhythm === 'fast' ? 'short' : 'mixed';
  }
  
  private static determineAccent(character: Character3D): string | undefined {
    return character.sociology.nationality !== 'American' ? character.sociology.nationality : undefined;
  }
  
  private static generateUniqueExpressions(character: Character3D): string[] {
    return [`"${character.psychology.coreValue} is everything"`, `"You know what I always say..."`];
  }
  
  private static generateCatchphrases(character: Character3D): string[] {
    return character.psychology.likes.slice(0, 2).map(like => `Related to ${like}`);
  }
  
  private static generateSpeechHabits(character: Character3D, vocabulary: string): string[] {
    if (vocabulary === 'simple') return ['um', 'you know'];
    if (vocabulary === 'educated') return ['actually', 'essentially'];
    return [];
  }
  
  // Continue with all remaining helper method implementations...
  // (All the remaining methods would be fully implemented following this pattern)
  
  private static deriveConversationGoal(character: Character3D, scene: NarrativeScene, conflictType: string): string {
    return `Achieve ${character.psychology.want} through ${conflictType}`;
  }
  
  private static deriveConversationFear(character: Character3D, scene: NarrativeScene): string {
    return character.psychology.fears[0] || 'Being exposed';
  }
  
  private static deriveConversationStrategy(character: Character3D, conflictType: string): string {
    return `Use ${character.psychology.coreValue} to ${conflictType === 'persuasion' ? 'convince' : 'confront'}`;
  }
  
  private static generateTacticalText(speaker: Character3D, objective: any, tactic: DialogueTactic, tension: number): string {
    // Generate text based on tactic
    switch (tactic) {
      case 'direct-approach':
        return `I need you to understand something important about ${objective.wants}.`;
      case 'feigned-innocence':
        return `I'm not sure I understand what you mean by that...`;
      case 'emotional-appeal':
        return `Think about how this affects everyone we care about.`;
      case 'logical-argument':
        return `If we look at this rationally, the facts clearly show...`;
      case 'intimidation':
        return `You might want to reconsider that position.`;
      case 'vulnerability':
        return `I have to admit, I'm scared about what happens next.`;
      default:
        return `We need to talk about ${objective.wants}.`;
    }
  }
  
  private static generateSurfaceDialogue(tactic: DialogueTactic, objective: string): string {
    return `Using ${tactic} to achieve ${objective}`;
  }
  
  private static extractEmotionalSubtext(character: Character3D, objective: string, target: Character3D): string {
    return `Feeling ${character.psychology.temperament[0]} about ${objective}`;
  }
  
  private static extractIntentionalSubtext(objective: string, tactic: DialogueTactic): string {
    return `Really trying to ${objective} through ${tactic}`;
  }
  
  private static extractFearSubtext(character: Character3D, target: Character3D, context: string): string {
    return `Afraid that ${character.psychology.fears[0]} will happen`;
  }
  
  private static extractPowerSubtext(character: Character3D, target: Character3D, tactic: DialogueTactic): string {
    return `Asserting ${character.sociology.class} status through ${tactic}`;
  }
  
  // Naturalization methods
  private static applyContractions(text: string): string {
    return text
      .replace(/do not/g, "don't")
      .replace(/will not/g, "won't")
      .replace(/cannot/g, "can't")
      .replace(/it is/g, "it's")
      .replace(/you are/g, "you're")
      .replace(/I am/g, "I'm");
  }
  
  private static generateInterruption(character: Character3D, tactic: DialogueTactic): string | undefined {
    if (tactic === 'intimidation') return "I was just—";
    return undefined;
  }
  
  private static insertInterruption(text: string, interruption: string): string {
    return text + " " + interruption;
  }
  
  private static generatePauses(character: Character3D, tactic: DialogueTactic, tension: number): string[] {
    if (tension > 7) return ['[beat]'];
    return [];
  }
  
  private static insertPauses(text: string, pauses: string[]): string {
    return pauses.length > 0 ? `${pauses[0]} ${text}` : text;
  }
  
  private static generateGestures(character: Character3D, tactic: DialogueTactic, tension: number): string[] {
    if (tactic === 'vulnerability') return ['[sighs]'];
    if (tension > 8) return ['[intense stare]'];
    return [];
  }
  
  private static insertGestures(text: string, gestures: string[]): string {
    return gestures.length > 0 ? `${text} ${gestures[0]}` : text;
  }
  
  // Delivery and purpose methods
  private static determineTone(character: Character3D, tactic: DialogueTactic, tension: number): string {
    if (tension > 8) return 'intense';
    if (tactic === 'vulnerability') return 'gentle';
    if (tactic === 'intimidation') return 'threatening';
    return 'earnest';
  }
  
  private static determineVolume(tactic: DialogueTactic, tension: number): 'whisper' | 'normal' | 'loud' | 'shout' {
    if (tactic === 'vulnerability') return 'whisper';
    if (tension > 9) return 'loud';
    return 'normal';
  }
  
  private static determinePace(character: Character3D, tactic: DialogueTactic, tension: number): 'rushed' | 'normal' | 'deliberate' | 'hesitant' {
    if (character.psychology.temperament.includes('anxious')) return 'rushed';
    if (tactic === 'intimidation') return 'deliberate';
    if (tactic === 'vulnerability') return 'hesitant';
    return 'normal';
  }
  
  private static determineEmphasis(text: string, tactic: DialogueTactic): string | undefined {
    if (tactic === 'direct-approach') return 'important';
    return undefined;
  }
  
  private static determinePlotFunction(text: string, scene: NarrativeScene): string {
    return `Advances ${scene.goal.objective}`;
  }
  
  private static determineCharacterFunction(text: string, character: Character3D): string {
    return `Reveals ${character.psychology.coreValue}`;
  }
  
  private static determineConflictFunction(text: string, tactic: DialogueTactic, tension: number): string {
    return `Creates ${tension > 7 ? 'high' : 'moderate'} tension through ${tactic}`;
  }
  
  private static calculateEscalationPattern(lines: DialogueLine[], template: DialogueTemplate): any {
    const tensions = template.structure.flatMap(phase => phase.intensityPattern);
    return {
      startingTension: tensions[0] || 3,
      peakTension: Math.max(...tensions),
      endingTension: tensions[tensions.length - 1] || 5,
      turningPoint: Math.floor(lines.length * 0.75)
    };
  }
  
  /**
   * Helper method to extract character objective from scene context
   */
  private static extractCharacterObjective(character: Character3D, scene: NarrativeScene): string {
    // Try to extract from character's relationship to scene goal
    if (scene.goal.objective.includes('convince') || scene.goal.objective.includes('persuade')) {
      return `Achieve ${scene.goal.objective} through ${character.psychology.coreValue}-based approach`;
    }
    
    // Default objective based on character psychology
    switch (character.psychology.coreValue) {
      case 'power':
        return 'Gain control of the situation';
      case 'truth':
        return 'Reveal or discover the truth';
      case 'loyalty':
        return 'Protect allies and relationships';
      case 'freedom':
        return 'Maintain independence and options';
      case 'justice':
        return 'Ensure fair outcome';
      default:
        return `Advance personal goals aligned with ${character.psychology.coreValue}`;
    }
  }
  
  /**
   * Helper method to determine conflict type from scene context
   */
  private static determineConflictType(scene: NarrativeScene): 'interpersonal' | 'ideological' | 'emotional' | 'practical' {
    const objective = scene.goal.objective.toLowerCase();
    
    if (objective.includes('convince') || objective.includes('persuade') || objective.includes('argue')) {
      return 'ideological';
    } else if (objective.includes('feel') || objective.includes('emotion') || objective.includes('love') || objective.includes('fear')) {
      return 'emotional';
    } else if (objective.includes('plan') || objective.includes('solve') || objective.includes('accomplish')) {
      return 'practical';
    } else {
      return 'interpersonal';
    }
  }
} 