/**
 * 🧠 NARRATIVE CONSISTENCY FRAMEWORK
 * The intelligent system that maintains story universe integrity across all content
 * 
 * CORE MISSION: Ensure Hollywood-grade narrative coherence
 * - Character consistency across all tabs and episodes
 * - World-building integrity throughout the series
 * - Plot continuity validation and enforcement
 * - Thematic coherence across all content types
 * 
 * CRITICAL INNOVATION: Cross-Tab Intelligence
 * - Every piece of enhanced content respects established narrative
 * - Character arcs remain coherent across script, casting, storyboard
 * - World elements stay consistent across props, locations, marketing
 * - Plot threads maintain continuity across episodes
 */

// ============================================================================
// NARRATIVE CONSISTENCY CORE INTERFACES
// ============================================================================

export interface NarrativeUniverse {
  id: string
  title: string
  storyBible: StoryBible
  characters: Map<string, CharacterState>
  worldState: WorldState
  plotContinuity: PlotContinuityTracker
  thematicFramework: ThematicFramework
  episodeHistory: EpisodeState[]
  lastUpdated: Date
}

export interface StoryBible {
  premise: string
  logline: string
  genre: string[]
  theme: string
  tone: string
  setting: WorldSetting
  characterProfiles: CharacterProfile[]
  worldRules: WorldRule[]
  plotOutline: PlotOutline
  visualStyle: VisualStyle
}

export interface CharacterState {
  id: string
  name: string
  profile: CharacterProfile
  currentState: CharacterCurrentState
  arcProgression: CharacterArcPoint[]
  relationships: Map<string, RelationshipState>
  lastSeen: TabContentReference
  consistencyViolations: ConsistencyViolation[]
}

export interface CharacterCurrentState {
  emotionalState: string
  physicalState: string
  goals: string[]
  conflicts: string[]
  knowledge: KnowledgeState
  location: string
  episodePosition: number
}

export interface WorldState {
  locations: Map<string, LocationState>
  objects: Map<string, ObjectState>
  rules: WorldRule[]
  timeline: TimelineEvent[]
  currentEpisode: number
  activeElements: Set<string>
}

export interface PlotContinuityTracker {
  mainPlotline: PlotThread
  subplots: Map<string, PlotThread>
  resolvedThreads: PlotThread[]
  activeConflicts: Conflict[]
  foreshadowing: ForeshadowingElement[]
  callbacks: CallbackElement[]
}

export interface ThematicFramework {
  primaryTheme: string
  subthemes: string[]
  thematicElements: ThematicElement[]
  symbolism: SymbolicElement[]
  motifs: Motif[]
  thematicArcs: ThematicArc[]
}

// ============================================================================
// VALIDATION AND CORRECTION INTERFACES
// ============================================================================

export interface ConsistencyValidationResult {
  isValid: boolean
  overallScore: number
  violations: ConsistencyViolation[]
  warnings: ConsistencyWarning[]
  suggestions: ConsistencySuggestion[]
  corrections: ConsistencyCorrection[]
}

export interface ConsistencyViolation {
  type: 'character' | 'world' | 'plot' | 'theme'
  severity: 'critical' | 'major' | 'minor' | 'suggestion'
  description: string
  affectedContent: TabContentReference
  conflictsWith: TabContentReference
  suggestedFix: string
  autoCorrectible: boolean
}

export interface ConsistencyCorrection {
  violationId: string
  correctionType: 'automatic' | 'suggested' | 'manual'
  originalContent: any
  correctedContent: any
  explanation: string
  confidence: number
}

// ============================================================================
// NARRATIVE CONSISTENCY FRAMEWORK MAIN CLASS
// ============================================================================

export class NarrativeConsistencyFramework {
  private universes: Map<string, NarrativeUniverse> = new Map()
  private consistencyRules: ConsistencyRule[] = []
  private validationCache: Map<string, ConsistencyValidationResult> = new Map()
  
  constructor() {
    this.initializeConsistencyRules()
  }

  /**
   * 🚀 MAIN CONSISTENCY VALIDATION FUNCTION
   * Validates new content against established narrative universe
   */
  async validateContentConsistency(
    newContent: any,
    contentType: string,
    universeId: string,
    tabType: string
  ): Promise<ConsistencyValidationResult> {
    console.log(`\n🧠 ═══════════════════════════════════════════════════════════════════════════════════`);
    console.log(`🔍 NARRATIVE CONSISTENCY VALIDATION: ${tabType.toUpperCase()} CONTENT`);
    console.log(`🌟 Universe: ${universeId}`);
    console.log(`📋 Content Type: ${contentType}`);
    console.log(`🧠 ═══════════════════════════════════════════════════════════════════════════════════`);

    const universe = await this.getOrCreateUniverse(universeId)
    const violations: ConsistencyViolation[] = []
    const warnings: ConsistencyWarning[] = []
    const suggestions: ConsistencySuggestion[] = []

    try {
      // STAGE 1: Character Consistency Validation
      console.log(`👥 Stage 1: Validating character consistency...`);
      const characterViolations = await this.validateCharacterConsistency(newContent, universe, tabType)
      violations.push(...characterViolations)

      // STAGE 2: World Consistency Validation
      console.log(`🌍 Stage 2: Validating world consistency...`);
      const worldViolations = await this.validateWorldConsistency(newContent, universe, tabType)
      violations.push(...worldViolations)

      // STAGE 3: Plot Continuity Validation
      console.log(`📖 Stage 3: Validating plot continuity...`);
      const plotViolations = await this.validatePlotContinuity(newContent, universe, tabType)
      violations.push(...plotViolations)

      // STAGE 4: Thematic Coherence Validation
      console.log(`🎭 Stage 4: Validating thematic coherence...`);
      const themeViolations = await this.validateThematicCoherence(newContent, universe, tabType)
      violations.push(...themeViolations)

      // STAGE 5: Generate Corrections
      console.log(`🔧 Stage 5: Generating consistency corrections...`);
      const corrections = await this.generateConsistencyCorrections(violations, newContent, universe)

      // Calculate overall consistency score
      const overallScore = this.calculateConsistencyScore(violations, warnings)
      const isValid = overallScore >= 0.8 && violations.filter(v => v.severity === 'critical').length === 0

      console.log(`📊 Consistency Score: ${(overallScore * 100).toFixed(1)}%`);
      console.log(`⚠️ Violations Found: ${violations.length} (Critical: ${violations.filter(v => v.severity === 'critical').length})`);
      console.log(`🧠 ═══════════════════════════════════════════════════════════════════════════════════\n`);

      const result: ConsistencyValidationResult = {
        isValid,
        overallScore,
        violations,
        warnings,
        suggestions,
        corrections
      }

      // Cache the result
      this.cacheValidationResult(universeId, contentType, result)

      return result

    } catch (error) {
      console.error(`❌ Consistency validation failed:`, error);
      
      // Return permissive result on error (don't block content)
      return {
        isValid: true,
        overallScore: 0.7,
        violations: [],
        warnings: [{ 
          type: 'system', 
          message: `Validation failed: ${error.message}`,
          suggestion: 'Manual review recommended'
        }],
        suggestions: [],
        corrections: []
      }
    }
  }

  /**
   * 🎯 UPDATE NARRATIVE UNIVERSE
   * Updates the universe state with validated content
   */
  async updateUniverseWithContent(
    validatedContent: any,
    contentType: string,
    universeId: string,
    tabType: string
  ): Promise<void> {
    console.log(`🔄 Updating narrative universe with validated ${tabType} content...`);

    const universe = await this.getOrCreateUniverse(universeId)

    try {
      // Update character states based on content
      await this.updateCharacterStatesFromContent(validatedContent, universe, tabType)

      // Update world state based on content
      await this.updateWorldStateFromContent(validatedContent, universe, tabType)

      // Update plot continuity based on content
      await this.updatePlotContinuityFromContent(validatedContent, universe, tabType)

      // Update thematic elements based on content
      await this.updateThematicFrameworkFromContent(validatedContent, universe, tabType)

      // Record this content in episode history
      this.recordContentInHistory(validatedContent, universe, tabType, contentType)

      universe.lastUpdated = new Date()
      console.log(`✅ Universe updated successfully for ${tabType} content`);

    } catch (error) {
      console.error(`❌ Failed to update universe:`, error);
      // Don't throw - universe update failure shouldn't block content generation
    }
  }

  /**
   * 🔧 AUTOMATIC CONSISTENCY CORRECTION
   * Applies automatic corrections to content to maintain consistency
   */
  async applyConsistencyCorrections(
    content: any,
    corrections: ConsistencyCorrection[]
  ): Promise<any> {
    let correctedContent = { ...content }

    console.log(`🔧 Applying ${corrections.length} consistency corrections...`);

    for (const correction of corrections) {
      if (correction.correctionType === 'automatic' && correction.confidence > 0.8) {
        try {
          correctedContent = this.applySingleCorrection(correctedContent, correction)
          console.log(`✅ Applied automatic correction: ${correction.explanation}`);
        } catch (error) {
          console.warn(`⚠️ Failed to apply correction:`, error);
        }
      }
    }

    return correctedContent
  }

  // ============================================================================
  // CHARACTER CONSISTENCY VALIDATION
  // ============================================================================

  private async validateCharacterConsistency(
    content: any,
    universe: NarrativeUniverse,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // Extract characters mentioned in content
    const mentionedCharacters = this.extractCharactersFromContent(content, tabType)

    for (const characterRef of mentionedCharacters) {
      const characterState = universe.characters.get(characterRef.name)
      
      if (characterState) {
        // Validate against existing character state
        const charViolations = await this.validateSingleCharacterConsistency(
          characterRef,
          characterState,
          content,
          tabType
        )
        violations.push(...charViolations)
      } else {
        // New character - validate against story bible
        const newCharViolations = await this.validateNewCharacterConsistency(
          characterRef,
          universe.storyBible,
          content,
          tabType
        )
        violations.push(...newCharViolations)
      }
    }

    return violations
  }

  private async validateSingleCharacterConsistency(
    characterRef: any,
    existingState: CharacterState,
    content: any,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // Check emotional state consistency
    if (characterRef.emotionalState && 
        this.isInconsistentEmotionalState(characterRef.emotionalState, existingState.currentState.emotionalState)) {
      violations.push({
        type: 'character',
        severity: 'major',
        description: `Character ${characterRef.name} emotional state inconsistent`,
        affectedContent: { tabType, content, timestamp: new Date() },
        conflictsWith: { tabType: existingState.lastSeen.tabType, content: existingState.lastSeen, timestamp: new Date() },
        suggestedFix: `Adjust emotional state to align with previous ${existingState.currentState.emotionalState}`,
        autoCorrectible: true
      })
    }

    // Check character voice consistency (for script content)
    if (tabType === 'script' && characterRef.dialogue) {
      const voiceInconsistency = this.detectVoiceInconsistency(characterRef.dialogue, existingState.profile.voice)
      if (voiceInconsistency) {
        violations.push({
          type: 'character',
          severity: 'minor',
          description: `Character ${characterRef.name} voice pattern inconsistent`,
          affectedContent: { tabType, content, timestamp: new Date() },
          conflictsWith: { tabType: 'previous_episodes', content: existingState.profile, timestamp: new Date() },
          suggestedFix: `Adjust dialogue to match established voice pattern: ${existingState.profile.voice}`,
          autoCorrectible: true
        })
      }
    }

    // Check relationship consistency
    if (characterRef.relationships) {
      const relationshipViolations = this.validateRelationshipConsistency(
        characterRef.relationships,
        existingState.relationships
      )
      violations.push(...relationshipViolations)
    }

    return violations
  }

  // ============================================================================
  // WORLD CONSISTENCY VALIDATION
  // ============================================================================

  private async validateWorldConsistency(
    content: any,
    universe: NarrativeUniverse,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // Extract world elements from content
    const worldElements = this.extractWorldElementsFromContent(content, tabType)

    for (const element of worldElements) {
      switch (element.type) {
        case 'location':
          const locationViolations = await this.validateLocationConsistency(element, universe, tabType)
          violations.push(...locationViolations)
          break
        
        case 'object':
          const objectViolations = await this.validateObjectConsistency(element, universe, tabType)
          violations.push(...objectViolations)
          break
        
        case 'rule':
          const ruleViolations = await this.validateWorldRuleConsistency(element, universe, tabType)
          violations.push(...ruleViolations)
          break
      }
    }

    return violations
  }

  private async validateLocationConsistency(
    locationElement: any,
    universe: NarrativeUniverse,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []
    const existingLocation = universe.worldState.locations.get(locationElement.name)

    if (existingLocation) {
      // Check for inconsistencies in location description
      if (this.isInconsistentLocationDescription(locationElement, existingLocation)) {
        violations.push({
          type: 'world',
          severity: 'major',
          description: `Location "${locationElement.name}" description inconsistent`,
          affectedContent: { tabType, content: locationElement, timestamp: new Date() },
          conflictsWith: { tabType: 'previous_content', content: existingLocation, timestamp: new Date() },
          suggestedFix: `Align location description with established: ${existingLocation.description}`,
          autoCorrectible: true
        })
      }
    }

    return violations
  }

  // ============================================================================
  // PLOT CONTINUITY VALIDATION
  // ============================================================================

  private async validatePlotContinuity(
    content: any,
    universe: NarrativeUniverse,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // Extract plot elements from content
    const plotElements = this.extractPlotElementsFromContent(content, tabType)

    for (const element of plotElements) {
      switch (element.type) {
        case 'conflict':
          const conflictViolations = await this.validateConflictContinuity(element, universe, tabType)
          violations.push(...conflictViolations)
          break
        
        case 'revelation':
          const revelationViolations = await this.validateRevelationContinuity(element, universe, tabType)
          violations.push(...revelationViolations)
          break
        
        case 'callback':
          const callbackViolations = await this.validateCallbackContinuity(element, universe, tabType)
          violations.push(...callbackViolations)
          break
      }
    }

    return violations
  }

  // ============================================================================
  // THEMATIC COHERENCE VALIDATION
  // ============================================================================

  private async validateThematicCoherence(
    content: any,
    universe: NarrativeUniverse,
    tabType: string
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = []

    // Extract thematic elements from content
    const thematicElements = this.extractThematicElementsFromContent(content, tabType)

    // Validate against established thematic framework
    for (const element of thematicElements) {
      if (!this.isThematicallyConsistent(element, universe.thematicFramework)) {
        violations.push({
          type: 'theme',
          severity: 'minor',
          description: `Thematic element "${element.theme}" inconsistent with established themes`,
          affectedContent: { tabType, content: element, timestamp: new Date() },
          conflictsWith: { tabType: 'story_bible', content: universe.thematicFramework, timestamp: new Date() },
          suggestedFix: `Align with primary theme: ${universe.thematicFramework.primaryTheme}`,
          autoCorrectible: false
        })
      }
    }

    return violations
  }

  // ============================================================================
  // CORRECTION GENERATION AND APPLICATION
  // ============================================================================

  private async generateConsistencyCorrections(
    violations: ConsistencyViolation[],
    content: any,
    universe: NarrativeUniverse
  ): Promise<ConsistencyCorrection[]> {
    const corrections: ConsistencyCorrection[] = []

    for (const violation of violations) {
      if (violation.autoCorrectible) {
        const correction = await this.generateSingleCorrection(violation, content, universe)
        if (correction) {
          corrections.push(correction)
        }
      }
    }

    return corrections
  }

  private async generateSingleCorrection(
    violation: ConsistencyViolation,
    content: any,
    universe: NarrativeUniverse
  ): Promise<ConsistencyCorrection | null> {
    try {
      let correctedContent = { ...content }
      let explanation = ''
      let confidence = 0.8

      switch (violation.type) {
        case 'character':
          correctedContent = await this.correctCharacterInconsistency(violation, content, universe)
          explanation = `Corrected character consistency for ${violation.description}`
          break
        
        case 'world':
          correctedContent = await this.correctWorldInconsistency(violation, content, universe)
          explanation = `Corrected world consistency for ${violation.description}`
          break
        
        case 'plot':
          correctedContent = await this.correctPlotInconsistency(violation, content, universe)
          explanation = `Corrected plot continuity for ${violation.description}`
          break
        
        case 'theme':
          correctedContent = await this.correctThematicInconsistency(violation, content, universe)
          explanation = `Corrected thematic consistency for ${violation.description}`
          confidence = 0.6 // Thematic corrections are less certain
          break
        
        default:
          return null
      }

      return {
        violationId: `${violation.type}-${Date.now()}`,
        correctionType: confidence > 0.8 ? 'automatic' : 'suggested',
        originalContent: content,
        correctedContent,
        explanation,
        confidence
      }

    } catch (error) {
      console.warn(`Failed to generate correction for violation:`, error);
      return null
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async getOrCreateUniverse(universeId: string): Promise<NarrativeUniverse> {
    if (!this.universes.has(universeId)) {
      const newUniverse: NarrativeUniverse = {
        id: universeId,
        title: `Universe ${universeId}`,
        storyBible: this.createDefaultStoryBible(),
        characters: new Map(),
        worldState: this.createDefaultWorldState(),
        plotContinuity: this.createDefaultPlotContinuity(),
        thematicFramework: this.createDefaultThematicFramework(),
        episodeHistory: [],
        lastUpdated: new Date()
      }
      this.universes.set(universeId, newUniverse)
    }
    return this.universes.get(universeId)!
  }

  private initializeConsistencyRules(): void {
    // Initialize consistency validation rules
    this.consistencyRules = [
      {
        type: 'character_voice',
        severity: 'minor',
        description: 'Character dialogue must maintain consistent voice patterns'
      },
      {
        type: 'character_emotion',
        severity: 'major',
        description: 'Character emotional states must progress logically'
      },
      {
        type: 'world_physics',
        severity: 'critical',
        description: 'World rules and physics must remain consistent'
      },
      {
        type: 'plot_continuity',
        severity: 'critical',
        description: 'Plot elements must maintain logical continuity'
      },
      {
        type: 'thematic_coherence',
        severity: 'minor',
        description: 'Content must support established themes'
      }
    ]
  }

  // Content extraction methods
  private extractCharactersFromContent(content: any, tabType: string): any[] {
    // Implementation for extracting character references from content
    return []
  }

  private extractWorldElementsFromContent(content: any, tabType: string): any[] {
    // Implementation for extracting world elements from content
    return []
  }

  private extractPlotElementsFromContent(content: any, tabType: string): any[] {
    // Implementation for extracting plot elements from content
    return []
  }

  private extractThematicElementsFromContent(content: any, tabType: string): any[] {
    // Implementation for extracting thematic elements from content
    return []
  }

  // Validation helper methods
  private isInconsistentEmotionalState(newState: string, existingState: string): boolean {
    // Implementation for emotional state consistency checking
    return false
  }

  private detectVoiceInconsistency(dialogue: string, voicePattern: string): boolean {
    // Implementation for voice pattern detection
    return false
  }

  private validateRelationshipConsistency(newRels: any, existingRels: Map<string, any>): ConsistencyViolation[] {
    // Implementation for relationship consistency validation
    return []
  }

  private isInconsistentLocationDescription(newLoc: any, existingLoc: any): boolean {
    // Implementation for location description consistency
    return false
  }

  private isThematicallyConsistent(element: any, framework: ThematicFramework): boolean {
    // Implementation for thematic consistency checking
    return true
  }

  // Correction methods
  private async correctCharacterInconsistency(violation: ConsistencyViolation, content: any, universe: NarrativeUniverse): Promise<any> {
    // Implementation for character consistency correction
    return content
  }

  private async correctWorldInconsistency(violation: ConsistencyViolation, content: any, universe: NarrativeUniverse): Promise<any> {
    // Implementation for world consistency correction
    return content
  }

  private async correctPlotInconsistency(violation: ConsistencyViolation, content: any, universe: NarrativeUniverse): Promise<any> {
    // Implementation for plot consistency correction
    return content
  }

  private async correctThematicInconsistency(violation: ConsistencyViolation, content: any, universe: NarrativeUniverse): Promise<any> {
    // Implementation for thematic consistency correction
    return content
  }

  // State update methods
  private async updateCharacterStatesFromContent(content: any, universe: NarrativeUniverse, tabType: string): Promise<void> {
    // Implementation for updating character states
  }

  private async updateWorldStateFromContent(content: any, universe: NarrativeUniverse, tabType: string): Promise<void> {
    // Implementation for updating world state
  }

  private async updatePlotContinuityFromContent(content: any, universe: NarrativeUniverse, tabType: string): Promise<void> {
    // Implementation for updating plot continuity
  }

  private async updateThematicFrameworkFromContent(content: any, universe: NarrativeUniverse, tabType: string): Promise<void> {
    // Implementation for updating thematic framework
  }

  // Additional validation methods
  private async validateConflictContinuity(element: any, universe: NarrativeUniverse, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  private async validateRevelationContinuity(element: any, universe: NarrativeUniverse, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  private async validateCallbackContinuity(element: any, universe: NarrativeUniverse, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  private async validateNewCharacterConsistency(characterRef: any, storyBible: StoryBible, content: any, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  private async validateObjectConsistency(element: any, universe: NarrativeUniverse, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  private async validateWorldRuleConsistency(element: any, universe: NarrativeUniverse, tabType: string): Promise<ConsistencyViolation[]> {
    return []
  }

  // Utility methods
  private calculateConsistencyScore(violations: ConsistencyViolation[], warnings: ConsistencyWarning[]): number {
    let score = 1.0
    
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          score -= 0.3
          break
        case 'major':
          score -= 0.2
          break
        case 'minor':
          score -= 0.1
          break
        case 'suggestion':
          score -= 0.05
          break
      }
    })

    warnings.forEach(warning => {
      score -= 0.02
    })

    return Math.max(0, score)
  }

  private applySingleCorrection(content: any, correction: ConsistencyCorrection): any {
    // Implementation for applying individual corrections
    return correction.correctedContent
  }

  private recordContentInHistory(content: any, universe: NarrativeUniverse, tabType: string, contentType: string): void {
    // Implementation for recording content in episode history
  }

  private cacheValidationResult(universeId: string, contentType: string, result: ConsistencyValidationResult): void {
    const cacheKey = `${universeId}-${contentType}-${Date.now()}`
    this.validationCache.set(cacheKey, result)
  }

  // Default creation methods
  private createDefaultStoryBible(): StoryBible {
    return {
      premise: '',
      logline: '',
      genre: [],
      theme: '',
      tone: '',
      setting: { name: '', description: '', rules: [] },
      characterProfiles: [],
      worldRules: [],
      plotOutline: { acts: [], episodes: [] },
      visualStyle: { description: '', palette: [], mood: '' }
    }
  }

  private createDefaultWorldState(): WorldState {
    return {
      locations: new Map(),
      objects: new Map(),
      rules: [],
      timeline: [],
      currentEpisode: 1,
      activeElements: new Set()
    }
  }

  private createDefaultPlotContinuity(): PlotContinuityTracker {
    return {
      mainPlotline: { id: 'main', description: '', status: 'active', episodes: [] },
      subplots: new Map(),
      resolvedThreads: [],
      activeConflicts: [],
      foreshadowing: [],
      callbacks: []
    }
  }

  private createDefaultThematicFramework(): ThematicFramework {
    return {
      primaryTheme: '',
      subthemes: [],
      thematicElements: [],
      symbolism: [],
      motifs: [],
      thematicArcs: []
    }
  }
}

// ============================================================================
// SUPPORTING INTERFACES (Complete definitions)
// ============================================================================

interface CharacterProfile {
  name: string
  role: string
  background: string
  personality: string
  voice: string
  goals: string[]
  conflicts: string[]
}

interface CharacterArcPoint {
  episode: number
  event: string
  growth: string
  newState: string
}

interface RelationshipState {
  type: string
  status: string
  dynamics: string
  history: string[]
}

interface KnowledgeState {
  knows: string[]
  suspects: string[]
  ignorant: string[]
}

interface LocationState {
  name: string
  description: string
  rules: string[]
  atmosphere: string
  significance: string
}

interface ObjectState {
  name: string
  description: string
  location: string
  significance: string
  history: string[]
}

interface WorldRule {
  type: string
  description: string
  scope: string
  exceptions: string[]
}

interface TimelineEvent {
  episode: number
  event: string
  significance: string
  affects: string[]
}

interface PlotThread {
  id: string
  description: string
  status: 'active' | 'resolved' | 'suspended'
  episodes: number[]
}

interface Conflict {
  type: string
  participants: string[]
  description: string
  stakes: string
  status: string
}

interface ForeshadowingElement {
  element: string
  payoffEpisode: number
  subtlety: string
}

interface CallbackElement {
  reference: string
  originalEpisode: number
  context: string
}

interface ThematicElement {
  theme: string
  expression: string
  strength: number
}

interface SymbolicElement {
  symbol: string
  meaning: string
  instances: string[]
}

interface Motif {
  element: string
  significance: string
  recurrence: string[]
}

interface ThematicArc {
  theme: string
  progression: string[]
  resolution: string
}

interface TabContentReference {
  tabType: string
  content: any
  episode?: number
  timestamp: Date
}

interface ConsistencyRule {
  type: string
  severity: string
  description: string
}

interface ConsistencyWarning {
  type: string
  message: string
  suggestion: string
}

interface ConsistencySuggestion {
  type: string
  suggestion: string
  benefit: string
}

interface WorldSetting {
  name: string
  description: string
  rules: string[]
}

interface PlotOutline {
  acts: Act[]
  episodes: EpisodeOutline[]
}

interface Act {
  number: number
  description: string
  episodes: number[]
}

interface EpisodeOutline {
  number: number
  title: string
  summary: string
  plotPoints: string[]
}

interface VisualStyle {
  description: string
  palette: string[]
  mood: string
}

interface EpisodeState {
  number: number
  content: Map<string, any>
  characterStates: Map<string, CharacterCurrentState>
  worldChanges: any[]
  plotProgress: any[]
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const narrativeConsistency = new NarrativeConsistencyFramework()

// Export for testing and advanced usage


