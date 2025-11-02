/**
 * 🧪 COMPREHENSIVE QUALITY ASSESSMENT SYSTEM
 * 
 * Advanced testing and validation framework for cinematic episode generation.
 * Phase 4: Testing & Validation Implementation
 */

// 📊 QUALITY ASSESSMENT INTERFACES

export interface QualityMetrics {
  characterDepth: CharacterDepthScore
  dialogueQuality: DialogueQualityScore
  narrativeStructure: NarrativeStructureScore
  worldBuilding: WorldBuildingScore
  genreExecution: GenreExecutionScore
  choiceQuality: ChoiceQualityScore
  cinematicElements: CinematicElementsScore
  overallScore: number
  qualityClassification: 'Basic' | 'Good' | 'Excellent' | 'Cinematic' | 'Masterpiece'
}

export interface CharacterDepthScore {
  score: number // 0-10
  metrics: {
    psychologicalComplexity: number
    motivationClarity: number
    characterConsistency: number
    developmentArc: number
    relationshipDynamics: number
  }
  evidence: string[]
}

export interface DialogueQualityScore {
  score: number // 0-10
  metrics: {
    characterVoiceDistinction: number
    subtextLayers: number
    naturalFlow: number
    conflictRevelation: number
    culturalAuthenticity: number
  }
  evidence: string[]
}

export interface NarrativeStructureScore {
  score: number // 0-10
  metrics: {
    pacingEffectiveness: number
    tensionEscalation: number
    structuralCoherence: number
    thematicIntegration: number
    episodeProgression: number
  }
  evidence: string[]
}

export interface WorldBuildingScore {
  score: number // 0-10
  metrics: {
    environmentalConsistency: number
    atmosphericImmersion: number
    culturalDetail: number
    livingWorldElements: number
    sensoryRichness: number
  }
  evidence: string[]
}

export interface GenreExecutionScore {
  score: number // 0-10
  metrics: {
    genreConventionMastery: number
    toneConsistency: number
    genreSpecificElements: number
    audienceExpectations: number
    innovativeExecution: number
  }
  evidence: string[]
}

export interface ChoiceQualityScore {
  score: number // 0-10
  metrics: {
    consequenceMeaningfulness: number
    episodeGrounding: number
    characterAgency: number
    narrativeImpact: number
    balancedDifficulty: number
  }
  evidence: string[]
}

export interface CinematicElementsScore {
  score: number // 0-10
  metrics: {
    visualStorytelling: number
    cinematicFlow: number
    emotionalResonance: number
    productionValue: number
    professionalPolish: number
  }
  evidence: string[]
}

// 🎯 COMPREHENSIVE QUALITY ASSESSMENT FUNCTION

export function assessComprehensiveEpisodeQuality(
  episode: any,
  storyBible: any,
  expectedGenres: string[] = []
): QualityMetrics {
  console.log('🧪 COMPREHENSIVE QUALITY ASSESSMENT: Starting detailed analysis...')
  
  const episodeText = JSON.stringify(episode)
  const textLower = episodeText.toLowerCase()
  
  // Character Depth Assessment
  const characterDepth = assessCharacterDepth(episode, episodeText, textLower, storyBible)
  console.log(`📊 Character Depth: ${characterDepth.score}/10`)
  
  // Dialogue Quality Assessment
  const dialogueQuality = assessDialogueQuality(episode, episodeText, textLower)
  console.log(`💬 Dialogue Quality: ${dialogueQuality.score}/10`)
  
  // Narrative Structure Assessment
  const narrativeStructure = assessNarrativeStructure(episode, episodeText, textLower)
  console.log(`📖 Narrative Structure: ${narrativeStructure.score}/10`)
  
  // World Building Assessment
  const worldBuilding = assessWorldBuilding(episode, episodeText, textLower, storyBible)
  console.log(`🌍 World Building: ${worldBuilding.score}/10`)
  
  // Genre Execution Assessment
  const genreExecution = assessGenreExecution(episode, episodeText, textLower, expectedGenres)
  console.log(`🎭 Genre Execution: ${genreExecution.score}/10`)
  
  // Choice Quality Assessment
  const choiceQuality = assessChoiceQuality(episode, episodeText, textLower)
  console.log(`🎯 Choice Quality: ${choiceQuality.score}/10`)
  
  // Cinematic Elements Assessment
  const cinematicElements = assessCinematicElements(episode, episodeText, textLower)
  console.log(`🎬 Cinematic Elements: ${cinematicElements.score}/10`)
  
  // Calculate Overall Score (weighted average)
  const overallScore = calculateOverallScore({
    characterDepth: characterDepth.score,
    dialogueQuality: dialogueQuality.score,
    narrativeStructure: narrativeStructure.score,
    worldBuilding: worldBuilding.score,
    genreExecution: genreExecution.score,
    choiceQuality: choiceQuality.score,
    cinematicElements: cinematicElements.score
  })
  
  // Determine Quality Classification
  const qualityClassification = classifyQuality(overallScore)
  
  console.log(`🏆 Overall Quality Score: ${overallScore}/10 (${qualityClassification})`)
  
  return {
    characterDepth,
    dialogueQuality,
    narrativeStructure,
    worldBuilding,
    genreExecution,
    choiceQuality,
    cinematicElements,
    overallScore,
    qualityClassification
  }
}

// 🎭 CHARACTER DEPTH ASSESSMENT

function assessCharacterDepth(episode: any, episodeText: string, textLower: string, storyBible: any): CharacterDepthScore {
  const metrics = {
    psychologicalComplexity: 0,
    motivationClarity: 0,
    characterConsistency: 0,
    developmentArc: 0,
    relationshipDynamics: 0
  }
  
  const evidence: string[] = []
  
  // Psychological Complexity (0-2)
  const psychTerms = ['motivation', 'psychology', 'internal', 'emotion', 'feeling', 'thought', 'mind', 'soul']
  const psychMatches = psychTerms.filter(term => textLower.includes(term)).length
  metrics.psychologicalComplexity = Math.min(psychMatches * 0.3, 2)
  if (metrics.psychologicalComplexity > 1) evidence.push('Rich psychological terminology detected')
  
  // Motivation Clarity (0-2)
  const motivationTerms = ['goal', 'want', 'need', 'desire', 'purpose', 'drive', 'ambition', 'quest']
  const motivationMatches = motivationTerms.filter(term => textLower.includes(term)).length
  metrics.motivationClarity = Math.min(motivationMatches * 0.3, 2)
  if (metrics.motivationClarity > 1) evidence.push('Clear character motivations expressed')
  
  // Character Consistency (0-2)
  const characterCount = storyBible?.mainCharacters?.length || 0
  const characterNames = storyBible?.mainCharacters?.map((c: any) => c.name.toLowerCase()) || []
  const nameReferences = characterNames.filter(name => textLower.includes(name)).length
  metrics.characterConsistency = Math.min((nameReferences / Math.max(characterCount, 1)) * 2, 2)
  if (metrics.characterConsistency > 1) evidence.push('Multiple characters referenced consistently')
  
  // Development Arc (0-2)
  const developmentTerms = ['change', 'grow', 'learn', 'realize', 'discover', 'transform', 'evolve', 'develop']
  const developmentMatches = developmentTerms.filter(term => textLower.includes(term)).length
  metrics.developmentArc = Math.min(developmentMatches * 0.25, 2)
  if (metrics.developmentArc > 1) evidence.push('Character development and growth indicated')
  
  // Relationship Dynamics (0-2)
  const relationshipTerms = ['relationship', 'connection', 'bond', 'tension', 'conflict', 'love', 'trust', 'betray']
  const relationshipMatches = relationshipTerms.filter(term => textLower.includes(term)).length
  metrics.relationshipDynamics = Math.min(relationshipMatches * 0.25, 2)
  if (metrics.relationshipDynamics > 1) evidence.push('Rich relationship dynamics explored')
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 💬 DIALOGUE QUALITY ASSESSMENT

function assessDialogueQuality(episode: any, episodeText: string, textLower: string): DialogueQualityScore {
  const metrics = {
    characterVoiceDistinction: 0,
    subtextLayers: 0,
    naturalFlow: 0,
    conflictRevelation: 0,
    culturalAuthenticity: 0
  }
  
  const evidence: string[] = []
  
  // Character Voice Distinction (0-2)
  const dialogueCount = (episodeText.match(/"/g) || []).length / 2
  if (dialogueCount >= 10) {
    metrics.characterVoiceDistinction += 1
    evidence.push('Substantial dialogue present')
  }
  if (textLower.includes('voice') || textLower.includes('spoke') || textLower.includes('said')) {
    metrics.characterVoiceDistinction += 0.5
    evidence.push('Character voice indicators present')
  }
  
  // Subtext Layers (0-2)
  const subtextTerms = ['subtext', 'underlying', 'beneath', 'hidden meaning', 'really meant', 'implied']
  const subtextMatches = subtextTerms.filter(term => textLower.includes(term)).length
  metrics.subtextLayers = Math.min(subtextMatches * 0.4, 2)
  if (metrics.subtextLayers > 0.5) evidence.push('Dialogue subtext and layers detected')
  
  // Natural Flow (0-2)
  if (dialogueCount >= 5) metrics.naturalFlow += 0.5
  if (textLower.includes('natural') || textLower.includes('conversation')) {
    metrics.naturalFlow += 0.5
    evidence.push('Natural conversation flow indicated')
  }
  if (episodeText.includes('...') || episodeText.includes('—')) {
    metrics.naturalFlow += 0.5
    evidence.push('Natural speech patterns with pauses/interruptions')
  }
  
  // Conflict Revelation (0-2)
  const conflictTerms = ['conflict', 'argue', 'disagree', 'tension', 'confrontation', 'challenge']
  const conflictMatches = conflictTerms.filter(term => textLower.includes(term)).length
  metrics.conflictRevelation = Math.min(conflictMatches * 0.4, 2)
  if (metrics.conflictRevelation > 0.5) evidence.push('Dialogue reveals character conflicts')
  
  // Cultural Authenticity (0-2)
  const culturalTerms = ['culture', 'tradition', 'heritage', 'authentic', 'local', 'community']
  const culturalMatches = culturalTerms.filter(term => textLower.includes(term)).length
  metrics.culturalAuthenticity = Math.min(culturalMatches * 0.4, 2)
  if (metrics.culturalAuthenticity > 0.5) evidence.push('Cultural authenticity in dialogue')
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 📖 NARRATIVE STRUCTURE ASSESSMENT

function assessNarrativeStructure(episode: any, episodeText: string, textLower: string): NarrativeStructureScore {
  const metrics = {
    pacingEffectiveness: 0,
    tensionEscalation: 0,
    structuralCoherence: 0,
    thematicIntegration: 0,
    episodeProgression: 0
  }
  
  const evidence: string[] = []
  
  // Pacing Effectiveness (0-2)
  const sceneCount = episode.scenes?.length || 0
  if (sceneCount >= 2 && sceneCount <= 5) {
    metrics.pacingEffectiveness += 1
    evidence.push(`Optimal scene count: ${sceneCount}`)
  }
  if (textLower.includes('pacing') || textLower.includes('rhythm')) {
    metrics.pacingEffectiveness += 0.5
    evidence.push('Pacing considerations evident')
  }
  
  // Tension Escalation (0-2)
  const tensionTerms = ['tension', 'escalat', 'build', 'intensif', 'heighten', 'climax']
  const tensionMatches = tensionTerms.filter(term => textLower.includes(term)).length
  metrics.tensionEscalation = Math.min(tensionMatches * 0.4, 2)
  if (metrics.tensionEscalation > 0.5) evidence.push('Tension escalation techniques present')
  
  // Structural Coherence (0-2)
  if (episode.title && episode.synopsis) metrics.structuralCoherence += 0.5
  if (episode.scenes && episode.scenes.length > 0) metrics.structuralCoherence += 0.5
  if (episode.branchingOptions && episode.branchingOptions.length === 3) {
    metrics.structuralCoherence += 1
    evidence.push('Complete episode structure with proper choices')
  }
  
  // Thematic Integration (0-2)
  const themeTerms = ['theme', 'meaning', 'symbol', 'represent', 'significance', 'metaphor']
  const themeMatches = themeTerms.filter(term => textLower.includes(term)).length
  metrics.thematicIntegration = Math.min(themeMatches * 0.4, 2)
  if (metrics.thematicIntegration > 0.5) evidence.push('Thematic elements integrated')
  
  // Episode Progression (0-2)
  if (episodeText.length > 1000) metrics.episodeProgression += 0.5
  if (textLower.includes('progress') || textLower.includes('advance') || textLower.includes('develop')) {
    metrics.episodeProgression += 0.5
    evidence.push('Story progression indicators present')
  }
  if (episode.episodeRundown && episode.episodeRundown.length > 100) {
    metrics.episodeProgression += 1
    evidence.push('Comprehensive episode analysis provided')
  }
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 🌍 WORLD BUILDING ASSESSMENT

function assessWorldBuilding(episode: any, episodeText: string, textLower: string, storyBible: any): WorldBuildingScore {
  const metrics = {
    environmentalConsistency: 0,
    atmosphericImmersion: 0,
    culturalDetail: 0,
    livingWorldElements: 0,
    sensoryRichness: 0
  }
  
  const evidence: string[] = []
  
  // Environmental Consistency (0-2)
  const worldTerms = ['world', 'environment', 'setting', 'location', 'place', 'space']
  const worldMatches = worldTerms.filter(term => textLower.includes(term)).length
  metrics.environmentalConsistency = Math.min(worldMatches * 0.3, 2)
  if (storyBible?.setting) {
    metrics.environmentalConsistency += 0.5
    evidence.push('Story bible setting referenced')
  }
  
  // Atmospheric Immersion (0-2)
  const atmosphereTerms = ['atmosphere', 'mood', 'ambiance', 'feel', 'air', 'surroundings']
  const atmosphereMatches = atmosphereTerms.filter(term => textLower.includes(term)).length
  metrics.atmosphericImmersion = Math.min(atmosphereMatches * 0.4, 2)
  if (metrics.atmosphericImmersion > 0.5) evidence.push('Rich atmospheric details')
  
  // Cultural Detail (0-2)
  const cultureTerms = ['culture', 'tradition', 'custom', 'heritage', 'ritual', 'community']
  const cultureMatches = cultureTerms.filter(term => textLower.includes(term)).length
  metrics.culturalDetail = Math.min(cultureMatches * 0.4, 2)
  if (metrics.culturalDetail > 0.5) evidence.push('Cultural elements incorporated')
  
  // Living World Elements (0-2)
  const livingTerms = ['life', 'living', 'dynamic', 'active', 'movement', 'breathing']
  const livingMatches = livingTerms.filter(term => textLower.includes(term)).length
  metrics.livingWorldElements = Math.min(livingMatches * 0.3, 2)
  if (metrics.livingWorldElements > 0.5) evidence.push('Dynamic world elements present')
  
  // Sensory Richness (0-2)
  const sensoryTerms = ['see', 'hear', 'smell', 'taste', 'touch', 'sound', 'sight', 'scent']
  const sensoryMatches = sensoryTerms.filter(term => textLower.includes(term)).length
  metrics.sensoryRichness = Math.min(sensoryMatches * 0.2, 2)
  if (metrics.sensoryRichness > 0.5) evidence.push('Multi-sensory descriptions included')
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 🎭 GENRE EXECUTION ASSESSMENT

function assessGenreExecution(episode: any, episodeText: string, textLower: string, expectedGenres: string[]): GenreExecutionScore {
  const metrics = {
    genreConventionMastery: 0,
    toneConsistency: 0,
    genreSpecificElements: 0,
    audienceExpectations: 0,
    innovativeExecution: 0
  }
  
  const evidence: string[] = []
  
  expectedGenres.forEach(genre => {
    const genreLower = genre.toLowerCase()
    
    // Genre-specific element detection
    if (genreLower.includes('comedy')) {
      const comedyElements = ['humor', 'funny', 'laugh', 'joke', 'amusing', 'wit'].filter(term => textLower.includes(term)).length
      if (comedyElements > 0) {
        metrics.genreSpecificElements += 0.5
        evidence.push('Comedy elements detected')
      }
    }
    
    if (genreLower.includes('horror') || genreLower.includes('thriller')) {
      const horrorElements = ['fear', 'dread', 'terror', 'suspense', 'dark', 'ominous'].filter(term => textLower.includes(term)).length
      if (horrorElements > 0) {
        metrics.genreSpecificElements += 0.5
        evidence.push('Horror/thriller elements detected')
      }
    }
    
    if (genreLower.includes('romance')) {
      const romanceElements = ['love', 'heart', 'romantic', 'chemistry', 'attraction', 'connection'].filter(term => textLower.includes(term)).length
      if (romanceElements > 0) {
        metrics.genreSpecificElements += 0.5
        evidence.push('Romance elements detected')
      }
    }
    
    if (genreLower.includes('mystery')) {
      const mysteryElements = ['mystery', 'clue', 'investigate', 'secret', 'hidden', 'solve'].filter(term => textLower.includes(term)).length
      if (mysteryElements > 0) {
        metrics.genreSpecificElements += 0.5
        evidence.push('Mystery elements detected')
      }
    }
  })
  
  // Genre Convention Mastery (0-2)
  metrics.genreConventionMastery = Math.min(metrics.genreSpecificElements, 2)
  
  // Tone Consistency (0-2)
  if (textLower.includes('tone') || textLower.includes('mood')) {
    metrics.toneConsistency += 0.5
    evidence.push('Tone consistency maintained')
  }
  metrics.toneConsistency += Math.min(metrics.genreSpecificElements * 0.3, 1.5)
  
  // Audience Expectations (0-2)
  if (expectedGenres.length > 0 && metrics.genreSpecificElements > 0) {
    metrics.audienceExpectations = Math.min(metrics.genreSpecificElements * 0.5, 2)
    evidence.push('Genre expectations addressed')
  }
  
  // Innovative Execution (0-2)
  const innovationTerms = ['unique', 'original', 'creative', 'innovative', 'fresh', 'new']
  const innovationMatches = innovationTerms.filter(term => textLower.includes(term)).length
  metrics.innovativeExecution = Math.min(innovationMatches * 0.4, 2)
  if (metrics.innovativeExecution > 0.5) evidence.push('Creative innovation in genre execution')
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 🎯 CHOICE QUALITY ASSESSMENT

function assessChoiceQuality(episode: any, episodeText: string, textLower: string): ChoiceQualityScore {
  const metrics = {
    consequenceMeaningfulness: 0,
    episodeGrounding: 0,
    characterAgency: 0,
    narrativeImpact: 0,
    balancedDifficulty: 0
  }
  
  const evidence: string[] = []
  
  const choices = episode.branchingOptions || []
  
  if (choices.length === 3) {
    metrics.episodeGrounding += 1
    evidence.push('Proper choice count (3 options)')
  }
  
  // Analyze choice quality
  choices.forEach((choice: any, index: number) => {
    if (choice.text && choice.text.length > 20) {
      metrics.consequenceMeaningfulness += 0.2
    }
    
    if (choice.description && choice.description.length > 10) {
      metrics.narrativeImpact += 0.2
    }
    
    if (choice.text && choice.text.toLowerCase().includes('character')) {
      metrics.characterAgency += 0.3
    }
  })
  
  // Episode Grounding (0-2)
  if (choices.some((c: any) => c.text && textLower.includes(c.text.toLowerCase().slice(0, 10)))) {
    metrics.episodeGrounding += 0.5
    evidence.push('Choices reference episode content')
  }
  
  // Balanced Difficulty (0-2)
  if (choices.length > 0) {
    const hasCanonical = choices.some((c: any) => c.isCanonical === true)
    if (hasCanonical) {
      metrics.balancedDifficulty += 1
      evidence.push('Canonical choice designated')
    }
  }
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 🎬 CINEMATIC ELEMENTS ASSESSMENT

function assessCinematicElements(episode: any, episodeText: string, textLower: string): CinematicElementsScore {
  const metrics = {
    visualStorytelling: 0,
    cinematicFlow: 0,
    emotionalResonance: 0,
    productionValue: 0,
    professionalPolish: 0
  }
  
  const evidence: string[] = []
  
  // Visual Storytelling (0-2)
  const visualTerms = ['visual', 'see', 'watch', 'look', 'gaze', 'view', 'sight', 'image']
  const visualMatches = visualTerms.filter(term => textLower.includes(term)).length
  metrics.visualStorytelling = Math.min(visualMatches * 0.2, 2)
  if (metrics.visualStorytelling > 0.5) evidence.push('Strong visual storytelling elements')
  
  // Cinematic Flow (0-2)
  const cinematicTerms = ['cinematic', 'flow', 'transition', 'cut', 'scene', 'sequence']
  const cinematicMatches = cinematicTerms.filter(term => textLower.includes(term)).length
  metrics.cinematicFlow = Math.min(cinematicMatches * 0.3, 2)
  if (metrics.cinematicFlow > 0.5) evidence.push('Cinematic flow and transitions')
  
  // Emotional Resonance (0-2)
  const emotionTerms = ['emotion', 'feel', 'heart', 'soul', 'moved', 'touched', 'resonance']
  const emotionMatches = emotionTerms.filter(term => textLower.includes(term)).length
  metrics.emotionalResonance = Math.min(emotionMatches * 0.3, 2)
  if (metrics.emotionalResonance > 0.5) evidence.push('Emotional resonance and depth')
  
  // Production Value (0-2)
  if (episodeText.length > 2000) {
    metrics.productionValue += 1
    evidence.push('High content volume indicates production value')
  }
  if (episode.scenes && episode.scenes.length >= 2) {
    metrics.productionValue += 0.5
    evidence.push('Multi-scene structure enhances production value')
  }
  
  // Professional Polish (0-2)
  const professionalTerms = ['professional', 'quality', 'polish', 'refined', 'sophisticated', 'premium']
  const professionalMatches = professionalTerms.filter(term => textLower.includes(term)).length
  metrics.professionalPolish = Math.min(professionalMatches * 0.4, 2)
  if (episode.episodeRundown && episode.episodeRundown.length > 50) {
    metrics.professionalPolish += 0.5
    evidence.push('Professional episode analysis provided')
  }
  
  const score = Object.values(metrics).reduce((sum, val) => sum + val, 0)
  
  return { score, metrics, evidence }
}

// 🏆 OVERALL SCORE CALCULATION

function calculateOverallScore(scores: {
  characterDepth: number
  dialogueQuality: number
  narrativeStructure: number
  worldBuilding: number
  genreExecution: number
  choiceQuality: number
  cinematicElements: number
}): number {
  // Weighted average based on importance for cinematic quality
  const weights = {
    characterDepth: 0.18,      // 18% - Character is king
    dialogueQuality: 0.16,     // 16% - Dialogue drives story
    narrativeStructure: 0.18,  // 18% - Structure is foundation
    worldBuilding: 0.14,       // 14% - World creates immersion
    genreExecution: 0.12,      // 12% - Genre creates expectation
    choiceQuality: 0.10,       // 10% - Choices drive interactivity
    cinematicElements: 0.12    // 12% - Cinematic polish
  }
  
  const weightedSum = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + (score * weights[key as keyof typeof weights])
  }, 0)
  
  return Math.round(weightedSum * 100) / 100 // Round to 2 decimal places
}

// 🏅 QUALITY CLASSIFICATION

function classifyQuality(score: number): 'Basic' | 'Good' | 'Excellent' | 'Cinematic' | 'Masterpiece' {
  if (score >= 9.0) return 'Masterpiece'
  if (score >= 8.0) return 'Cinematic'
  if (score >= 7.0) return 'Excellent'
  if (score >= 5.0) return 'Good'
  return 'Basic'
}

// Export for use in testing frameworks
export default assessComprehensiveEpisodeQuality
