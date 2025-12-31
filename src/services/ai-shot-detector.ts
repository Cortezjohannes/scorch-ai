/**
 * AI Shot Detector Service
 * Analyzes shots and storyboard frames to determine if they can be AI-generated
 */

import type { Shot, StoryboardFrame, ScriptBreakdownData } from '@/types/preproduction'

export type AIRecommendationLevel = 'high' | 'medium' | 'low'

export interface AIGenerationAnalysis {
  canBeAIGenerated: boolean
  confidence: number // 0-1
  aiGenerationPrompt?: string
  reasoning?: string
  shotCategory?: string // e.g., "establishing-shot", "product-shot", "transition"
  recommendation?: AIRecommendationLevel // Recommendation level for AI generation
}

/**
 * Client-side rule-based detection (fallback when API unavailable)
 */
export function detectAIGeneratableShotClientSide(
  shot: Shot | StoryboardFrame,
  breakdownData?: ScriptBreakdownData
): AIGenerationAnalysis {
  const description = 'description' in shot ? shot.description : ''
  const cameraAngle = shot.cameraAngle?.toLowerCase() || ''
  const cameraMovement = shot.cameraMovement?.toLowerCase() || ''
  const dialogueSnippet = 'dialogueSnippet' in shot ? shot.dialogueSnippet : ''
  const lightingNotes = 'lightingNotes' in shot ? shot.lightingNotes : ''
  const propsInFrame = 'propsInFrame' in shot ? shot.propsInFrame : []
  
  const textToAnalyze = `${description} ${cameraAngle} ${cameraMovement} ${dialogueSnippet} ${lightingNotes}`.toLowerCase()
  
  // CONTENT POLICY EXCLUSIONS: Only exclude shots with explicit problematic content
  // Be more lenient - only block if it's clearly problematic, not just mentions
  const explicitContentPolicyKeywords = [
    // Explicit violence (only if clearly violent)
    'gunshot', 'shooting', 'bloody', 'murder scene', 'killing', 'assault', 'attack',
    // Explicit sensitive content
    'nude', 'naked', 'sex', 'sexual', 'explicit', 'adult content',
    // Explicit destructive content
    'explosion', 'bomb', 'fire', 'burning', 'destruction'
  ]
  
  // Only exclude if it's explicit problematic content, not just mentions
  const hasExplicitContentPolicyRisk = explicitContentPolicyKeywords.some(keyword => {
    // Require word boundaries to avoid false positives
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(textToAnalyze)
  })
  
  if (hasExplicitContentPolicyRisk) {
    return {
      canBeAIGenerated: false,
      confidence: 0,
      reasoning: 'Shot contains explicit content that may trigger content policy filters',
      shotCategory: undefined
    }
  }
  
  // EXCLUSION: Face closeups of people should NOT be AI-generated (real extras are better)
  const faceCloseupKeywords = [
    'close-up face', 'closeup face', 'close-up of face', 'closeup of face',
    'extreme close-up face', 'extreme closeup face', 'ecu face',
    'medium close-up face', 'medium closeup face', 'mcu face',
    'face close-up', 'face closeup', 'close-up person', 'closeup person',
    'close-up character', 'closeup character', 'close-up actor', 'closeup actor',
    'portrait shot', 'headshot', 'face shot', 'facial close-up', 'facial closeup'
  ]
  
  const isFaceCloseup = faceCloseupKeywords.some(keyword => textToAnalyze.includes(keyword)) ||
    (textToAnalyze.includes('close-up') && (textToAnalyze.includes('face') || textToAnalyze.includes('person') || textToAnalyze.includes('character'))) ||
    (textToAnalyze.includes('closeup') && (textToAnalyze.includes('face') || textToAnalyze.includes('person') || textToAnalyze.includes('character')))
  
  if (isFaceCloseup) {
    return {
      canBeAIGenerated: false,
      confidence: 0,
      reasoning: 'Face closeups of people should use real extras, not AI generation',
      shotCategory: undefined
    }
  }
  
  // EXCLUSIONS: These should NEVER be AI-generated
  // 1. Shots with dialogue where characters are visible/speaking - exclude
  // BUT allow voice-over/narration if no characters are visible
  if (dialogueSnippet && dialogueSnippet.trim().length > 0) {
    // Check if it's voice-over/narration (no characters visible)
    const isVoiceOver = textToAnalyze.includes('voice-over') ||
                       textToAnalyze.includes('voiceover') ||
                       textToAnalyze.includes('narration') ||
                       textToAnalyze.includes('narrator') ||
                       textToAnalyze.includes('off-screen') ||
                       textToAnalyze.includes('offscreen') ||
                       (description.toLowerCase().includes('voice') && !textToAnalyze.includes('character') && !textToAnalyze.includes('actor') && !textToAnalyze.includes('person'))
    
    // If it's not voice-over and characters are visible, exclude
    if (!isVoiceOver) {
      return {
        canBeAIGenerated: false,
        confidence: 0,
        reasoning: 'Shot contains dialogue with visible characters - requires real actors',
        shotCategory: undefined
      }
    }
    // If it's voice-over, continue (allow it)
  }
  
  // 2. Check breakdown data for main character presence in scene
  let sceneHasMainCharacters = false
  let mainCharacterNames: string[] = []
  if (breakdownData && 'sceneNumber' in shot) {
    const scene = breakdownData.scenes?.find(s => s.sceneNumber === shot.sceneNumber)
    if (scene) {
      const mainCharacters = scene.characters?.filter(c => c.importance === 'lead' || c.importance === 'supporting')
      sceneHasMainCharacters = mainCharacters && mainCharacters.length > 0
      if (mainCharacters) {
        mainCharacterNames = mainCharacters.map(c => c.name.toLowerCase())
      }
    }
  }
  
  // 3. STRICT: Exclude ANY shot with characters performing actions OR character names mentioned
  const descriptionLower = description.toLowerCase()
  
  // Check for character actions (comprehensive list)
  const hasCharacterAction = 
    textToAnalyze.includes('reads') ||
    textToAnalyze.includes('holds') ||
    textToAnalyze.includes('steps') ||
    textToAnalyze.includes('walks') ||
    textToAnalyze.includes('moves') ||
    textToAnalyze.includes('enters') ||
    textToAnalyze.includes('leaves') ||
    textToAnalyze.includes('snaps') ||
    textToAnalyze.includes('touches') ||
    textToAnalyze.includes('looks') ||
    textToAnalyze.includes('gazes') ||
    textToAnalyze.includes('pushes') ||
    textToAnalyze.includes('clutches') ||
    textToAnalyze.includes('sits') ||
    textToAnalyze.includes('stands') ||
    textToAnalyze.includes('gestures') ||
    textToAnalyze.includes('reaches') ||
    textToAnalyze.includes('takes') ||
    textToAnalyze.includes('gives') ||
    textToAnalyze.includes('shows') ||
    textToAnalyze.includes('points') ||
    textToAnalyze.includes('seated') ||
    textToAnalyze.includes('standing')
  
  // Check if characters are mentioned by name (from breakdown or generically)
  const mentionsCharacterNames = sceneHasMainCharacters && mainCharacterNames.length > 0 && 
                                  mainCharacterNames.some(name => descriptionLower.includes(name))
  
  const mentionsGenericCharacters = 
    descriptionLower.includes('character') ||
    descriptionLower.includes('actor') ||
    descriptionLower.includes('person') ||
    descriptionLower.includes('people') ||
    descriptionLower.includes('man') ||
    descriptionLower.includes('woman') ||
    descriptionLower.includes('boy') ||
    descriptionLower.includes('girl')
  
  // STRICT RULE: If characters are mentioned by name OR performing actions, exclude (NO exceptions for wide shots)
  if (mentionsCharacterNames || (mentionsGenericCharacters && hasCharacterAction)) {
    return {
      canBeAIGenerated: false,
      confidence: 0,
      reasoning: 'Shot shows characters performing actions - requires real actors',
      shotCategory: undefined
    }
  }
  
  // Also exclude if generic characters mentioned and description is detailed (likely character-focused)
  if (mentionsGenericCharacters && description.length > 80) {
    return {
      canBeAIGenerated: false,
      confidence: 0,
      reasoning: 'Shot mentions characters with detailed description - requires real actors',
      shotCategory: undefined
    }
  }
  
  // 4. Medium shots, close-ups, or medium close-ups - STRICTLY exclude if they show characters
  const mediumShotKeywords = ['medium shot', 'medium close-up', 'medium closeup', 'mcu', 'close-up', 'closeup']
  const isMediumOrCloseShot = mediumShotKeywords.some(keyword => 
    textToAnalyze.includes(keyword)
  )
  
  // Only allow close-ups if they're explicitly of objects/products/feet/hands/details (NOT people/characters)
  const isObjectCloseup = isMediumOrCloseShot &&
                          (textToAnalyze.includes('product') ||
                           textToAnalyze.includes('object') ||
                           textToAnalyze.includes('feet') ||
                           textToAnalyze.includes('shoes') ||
                           textToAnalyze.includes('hand') ||
                           textToAnalyze.includes('detail') ||
                           textToAnalyze.includes('texture')) &&
                          !textToAnalyze.includes('character') &&
                          !textToAnalyze.includes('actor') &&
                          !textToAnalyze.includes('person') &&
                          !textToAnalyze.includes('face')
  
  // Exclude any medium/close shot that mentions characters, actors, or people
  if (isMediumOrCloseShot && !isObjectCloseup) {
    // Check if it mentions characters/actors/people
    if (textToAnalyze.includes('character') || 
        textToAnalyze.includes('actor') || 
        textToAnalyze.includes('person') ||
        textToAnalyze.includes('steps') ||
        textToAnalyze.includes('walks') ||
        textToAnalyze.includes('moves') ||
        textToAnalyze.includes('enters') ||
        textToAnalyze.includes('leaves') ||
        textToAnalyze.includes('looks') ||
        textToAnalyze.includes('gazes')) {
      return {
        canBeAIGenerated: false,
        confidence: 0,
        reasoning: 'Medium/close shot of characters - requires real actors',
        shotCategory: undefined
      }
    }
  }
  
  // STRICT REQUIREMENTS: Must meet MULTIPLE criteria to be AI-generatable
  let confidence = 0
  let category = ''
  let reasoning = ''
  let categoryMatches: string[] = []
  
  // Score based on category keywords (very broad matching)
  const strongCategoryKeywords = {
    'establishing': ['establishing shot', 'establishing', 'wide establishing', 'extreme wide shot', 'cityscape', 'landscape', 'skyline', 'panoramic view', 'gates', 'building', 'exterior', 'location', 'school', 'facility', 'entrance'],
    'product': ['product shot', 'product close-up', 'product detail', 'insert shot product', 'prop shot', 'object insert', 'object', 'item', 'thing'],
    'transition': ['transition shot', 'cutaway', 'fade transition', 'dissolve transition', 'wipe transition', 'transition'],
    'crowd': ['crowd shot', 'background crowd', 'crowd scene', 'extras only', 'audience shot', 'crowd'],
    'atmosphere': ['b-roll', 'filler scene', 'atmospheric shot', 'ambience shot', 'ambient', 'atmosphere'],
    'nature': ['landscape shot', 'nature shot', 'weather shot', 'sky shot', 'clouds', 'sunset', 'sunrise', 'ocean view', 'waterfall', 'nature', 'landscape'],
    'impossible': ['impossible shot', 'surreal shot', 'fantasy shot', 'aerial view', 'bird\'s eye view', 'worm\'s eye view', 'aerial', 'bird\'s eye', 'worm\'s eye'],
    'time-based': ['time-lapse', 'hyperlapse', 'slow motion', 'time compression', 'time-lapse', 'hyperlapse'],
    'vfx': ['visual effects', 'vfx shot', 'explosion', 'particles', 'abstract sequence', 'stylized', 'vfx', 'visual effect'],
    'macro': ['macro shot', 'extreme close-up object', 'detail shot object', 'texture shot', 'macro', 'detail shot', 'close-up object', 'closeup object'],
    'green-screen': ['background plate', 'green screen plate', 'composite background', 'virtual background', 'background plate', 'green screen'],
    'no-characters': ['no characters', 'without actors', 'empty scene', 'unmanned', 'background only', 'no people']
  }
  
  // Check for category matches (very loose matching - just check if keyword appears)
  for (const [cat, keywords] of Object.entries(strongCategoryKeywords)) {
    const matches = keywords.filter(keyword => {
      // Very loose matching - just check if keyword appears anywhere
      return textToAnalyze.includes(keyword.toLowerCase())
    })
    if (matches.length > 0) {
      categoryMatches.push(cat)
      if (!category) category = cat
      reasoning += `${cat} category: ${matches[0]}. `
    }
  }
  
  // REQUIRE: Must have a clear category match (very lenient)
  // If no strong category match, check for ANY indicators of AI-generatable shots
  if (categoryMatches.length === 0) {
    // Check for loose indicators of AI-generatable shots (very, very broad)
    const looseIndicators = [
      textToAnalyze.includes('wide'),
      textToAnalyze.includes('establishing'),
      textToAnalyze.includes('b-roll'),
      textToAnalyze.includes('background'),
      textToAnalyze.includes('landscape'),
      textToAnalyze.includes('cityscape'),
      textToAnalyze.includes('product'),
      textToAnalyze.includes('object'),
      textToAnalyze.includes('transition'),
      textToAnalyze.includes('cutaway'),
      textToAnalyze.includes('insert'),
      textToAnalyze.includes('detail'),
      textToAnalyze.includes('close-up') && !textToAnalyze.includes('face') && !textToAnalyze.includes('character'),
      textToAnalyze.includes('extreme wide'),
      textToAnalyze.includes('aerial'),
      textToAnalyze.includes('time-lapse'),
      textToAnalyze.includes('nature'),
      textToAnalyze.includes('weather'),
      textToAnalyze.includes('sky'),
      textToAnalyze.includes('gates'),
      textToAnalyze.includes('building'),
      textToAnalyze.includes('exterior'),
      textToAnalyze.includes('location'),
      textToAnalyze.includes('school'),
      textToAnalyze.includes('facility'),
      textToAnalyze.includes('entrance'),
      textToAnalyze.includes('hallway'),
      textToAnalyze.includes('corridor'),
      cameraAngle.includes('wide') || cameraAngle.includes('extreme'),
      cameraMovement.includes('crane') || cameraMovement.includes('dolly') || cameraMovement.includes('tracking'),
      cameraMovement.includes('dolly forward'),
      cameraMovement.includes('tracking')
    ]
    
    // Also check if description is about location/building/exterior (very common AI-generatable)
    const isLocationShot = textToAnalyze.includes('gates') ||
                          textToAnalyze.includes('building') ||
                          textToAnalyze.includes('exterior') ||
                          textToAnalyze.includes('school') ||
                          textToAnalyze.includes('facility') ||
                          textToAnalyze.includes('entrance') ||
                          textToAnalyze.includes('hallway') ||
                          textToAnalyze.includes('corridor') ||
                          description.toLowerCase().includes('loom') ||
                          description.toLowerCase().includes('fortress')
    
    // Also check if description is short and doesn't mention characters/actors
    const isSimpleShot = description.length < 150 && 
                         !textToAnalyze.includes('character') && 
                         !textToAnalyze.includes('actor') &&
                         !textToAnalyze.includes('person') &&
                         !textToAnalyze.includes('says') &&
                         !textToAnalyze.includes('speaks')
    
    // Default to allowing if it's a location/building shot or simple shot
    if (!looseIndicators.some(indicator => indicator) && !isSimpleShot && !isLocationShot) {
      return {
        canBeAIGenerated: false,
        confidence: 0,
        reasoning: 'No clear AI-generatable category identified',
        shotCategory: undefined
      }
    } else {
      // Assign a category based on loose indicators
      if (textToAnalyze.includes('establishing') || textToAnalyze.includes('wide') || cameraAngle.includes('wide') || isLocationShot) {
        category = 'establishing'
      } else if (textToAnalyze.includes('product') || textToAnalyze.includes('object') || textToAnalyze.includes('insert') || textToAnalyze.includes('shoes') || textToAnalyze.includes('feet')) {
        category = 'product'
      } else if (textToAnalyze.includes('transition') || textToAnalyze.includes('cutaway')) {
        category = 'transition'
      } else if (textToAnalyze.includes('b-roll') || textToAnalyze.includes('background') || textToAnalyze.includes('atmosphere')) {
        category = 'atmosphere'
      } else if (textToAnalyze.includes('nature') || textToAnalyze.includes('landscape') || textToAnalyze.includes('weather')) {
        category = 'nature'
      } else if (cameraMovement.includes('crane') || cameraMovement.includes('dolly') || cameraMovement.includes('tracking')) {
        category = 'impossible'
      } else {
        category = 'no-characters'
      }
      reasoning += `Category match: ${category}. `
    }
  }
  
  // REQUIRE: Must have NO main characters in scene OR shot is clearly background/establishing
  // Be very lenient - allow many types of shots even if scene has characters
  const hasNoMainCharacters = 
    (!sceneHasMainCharacters) ||
    textToAnalyze.includes('no characters') ||
    textToAnalyze.includes('without actors') ||
    textToAnalyze.includes('background only') ||
    textToAnalyze.includes('extras only')
  
  // Allow many types of shots even if scene has characters (they're usually background)
  const isBackgroundShot = 
    textToAnalyze.includes('wide') ||
    textToAnalyze.includes('establishing') ||
    textToAnalyze.includes('background') ||
    textToAnalyze.includes('b-roll') ||
    textToAnalyze.includes('cutaway') ||
    textToAnalyze.includes('insert') ||
    textToAnalyze.includes('product') ||
    textToAnalyze.includes('object') ||
    textToAnalyze.includes('transition') ||
    textToAnalyze.includes('landscape') ||
    textToAnalyze.includes('nature') ||
    textToAnalyze.includes('weather') ||
    cameraAngle.includes('wide') ||
    cameraAngle.includes('extreme') ||
    (cameraMovement.includes('crane') || cameraMovement.includes('dolly') || cameraMovement.includes('tracking'))
  
  // Only exclude if shot explicitly shows characters performing dialogue/action AND it's not a background shot
  const explicitlyShowsCharacterPerforming = 
    (textToAnalyze.includes('character') || textToAnalyze.includes('actor') || textToAnalyze.includes('person')) &&
    (textToAnalyze.includes('says') || textToAnalyze.includes('speaks') || textToAnalyze.includes('talks') || textToAnalyze.includes('performs') || textToAnalyze.includes('acts')) &&
    !isBackgroundShot &&
    description.length > 100 // Only exclude if it's a detailed description of character performance
  
  if (!hasNoMainCharacters && explicitlyShowsCharacterPerforming) {
    return {
      canBeAIGenerated: false,
      confidence: 0,
      reasoning: 'Shot explicitly shows characters performing dialogue/action and is not a background/establishing shot',
      shotCategory: undefined
    }
  }
  
  // Build confidence based on category strength and additional factors
  // Base confidence from category (more generous)
  if (category === 'establishing' || category === 'nature' || category === 'impossible' || category === 'product') {
    confidence = 0.75 // Strong categories
  } else if (category === 'transition' || category === 'atmosphere' || category === 'time-based' || category === 'vfx') {
    confidence = 0.7 // Medium categories
  } else if (category === 'crowd' || category === 'green-screen' || category === 'macro') {
    confidence = 0.7 // Good categories
  } else {
    confidence = 0.65 // Other categories (still allow them)
  }
  
  // Boost confidence for wide/extreme wide shots (establishing shots)
  if (cameraAngle.includes('wide') || cameraAngle.includes('extreme wide') || textToAnalyze.includes('wide')) {
    confidence += 0.15
    reasoning += 'Wide/extreme wide angle. '
  }
  
  // Boost confidence for complex camera movements
  if (cameraMovement.includes('crane') || cameraMovement.includes('dolly') || cameraMovement.includes('tracking')) {
    confidence += 0.1
    reasoning += 'Complex camera movement. '
  }
  
  // Boost confidence for product/object shots
  if (category === 'product' && (propsInFrame.length > 0 || textToAnalyze.includes('object') || textToAnalyze.includes('product'))) {
    confidence += 0.1
    reasoning += 'Product/object focus. '
  }
  
  // Boost for background/B-roll shots
  if (textToAnalyze.includes('background') || textToAnalyze.includes('b-roll') || textToAnalyze.includes('atmosphere')) {
    confidence += 0.1
    reasoning += 'Background/atmospheric shot. '
  }
  
  // Only penalize if shot explicitly mentions characters in a non-background context
  if (textToAnalyze.includes('character') && !isBackgroundShot && description.length > 50) {
    confidence -= 0.15
    reasoning += 'May involve characters. '
  }
  
  // Normalize confidence to 0-1
  confidence = Math.max(0, Math.min(1, confidence))
  
  // VERY RELAXED THRESHOLD: Lower confidence requirement significantly
  const canBeAIGenerated = confidence >= 0.5
  
  // Determine recommendation level based on confidence and shot characteristics
  let recommendation: AIRecommendationLevel | undefined
  if (canBeAIGenerated) {
    // Very lenient thresholds for recommendations
    if (confidence >= 0.7 && (category === 'establishing' || category === 'nature' || category === 'product' || category === 'impossible')) {
      recommendation = 'high' // Strongly recommend AI (clear establishing shots, landscapes, product shots, impossible shots)
    } else if (confidence >= 0.6 && (category === 'transition' || category === 'atmosphere' || category === 'time-based' || category === 'vfx' || category === 'establishing' || category === 'product')) {
      recommendation = 'medium' // Can use AI (clear transition shots, B-roll, time-lapse, VFX, establishing, product)
    } else if (confidence >= 0.5) {
      recommendation = 'low' // Actors should probably shoot, but AI can save time (borderline cases)
    } else {
      recommendation = 'low'
    }
  }
  
  // Generate prompt if AI-generatable
  let aiGenerationPrompt: string | undefined
  if (canBeAIGenerated) {
    aiGenerationPrompt = generateAIGenerationPrompt(shot, category, breakdownData)
  }
  
  return {
    canBeAIGenerated,
    confidence,
    aiGenerationPrompt,
    reasoning: reasoning.trim() || undefined,
    shotCategory: category || undefined,
    recommendation
  }
}

/**
 * Generate detailed AI generation prompt for a shot
 * Enhanced with comprehensive visual details for better video generation results
 */
function generateAIGenerationPrompt(
  shot: Shot | StoryboardFrame,
  category: string,
  breakdownData?: ScriptBreakdownData
): string {
  const description = 'description' in shot ? shot.description : ''
  const cameraAngle = shot.cameraAngle || ''
  const cameraMovement = shot.cameraMovement || ''
  const lightingNotes = 'lightingNotes' in shot ? shot.lightingNotes : ''
  const propsInFrame = 'propsInFrame' in shot ? shot.propsInFrame : []
  
  // Get comprehensive scene context
  let sceneLocation = ''
  let sceneTimeOfDay = ''
  let sceneMood = ''
  if (breakdownData && 'sceneNumber' in shot) {
    const scene = breakdownData.scenes?.find(s => s.sceneNumber === shot.sceneNumber)
    if (scene) {
      sceneLocation = scene.location || ''
      sceneTimeOfDay = scene.timeOfDay || ''
      // Note: emotionalTone is in ScriptAnalysisScene, not ScriptBreakdownScene
      // We'll infer mood from scene context if needed
    }
  }
  
  // Build comprehensive, detailed, multi-sentence prompt for video generation
  const promptSentences: string[] = []
  
  // 1. SCENE CONTEXT (Opening sentence with location, time, mood)
  if (sceneLocation || sceneTimeOfDay) {
    const contextParts: string[] = []
    if (sceneLocation) {
      // Expand location descriptions
      const locationLower = sceneLocation.toLowerCase()
      if (locationLower.includes('interior') || locationLower.includes('int.')) {
        contextParts.push(`Interior of ${sceneLocation.replace(/^(INT\.|INTERIOR)\s*/i, '')}`)
      } else if (locationLower.includes('exterior') || locationLower.includes('ext.')) {
        contextParts.push(`Exterior of ${sceneLocation.replace(/^(EXT\.|EXTERIOR)\s*/i, '')}`)
      } else {
        contextParts.push(sceneLocation)
      }
    }
    if (sceneTimeOfDay) {
      const timeLower = sceneTimeOfDay.toLowerCase()
      const timeDescriptions: Record<string, string> = {
        'day': 'during bright daylight hours',
        'night': 'at night, under artificial and natural night lighting',
        'sunset': 'during golden hour sunset, warm orange and pink hues',
        'sunrise': 'during soft sunrise, early morning light with blue and orange tones',
        'dusk': 'during dusk, twilight transition with purple and orange sky',
        'dawn': 'at dawn, soft morning light breaking through darkness',
        'magic hour': 'during magic hour, perfect cinematic lighting conditions'
      }
      const timeDesc = Object.entries(timeDescriptions).find(([key]) => timeLower.includes(key))?.[1] || timeLower
      contextParts.push(timeDesc)
    }
    if (sceneMood) {
      contextParts.push(`with ${sceneMood.toLowerCase()} atmosphere`)
    }
    promptSentences.push(`The scene takes place ${contextParts.join(', ')}.`)
  }
  
  // 2. SHOT DESCRIPTION (Main visual content - expanded)
  if (description) {
    // Expand the description with more visual detail
    let expandedDescription = description
    // Add visual context if description is short
    if (description.length < 100) {
      expandedDescription = `${description}. The composition focuses on the visual elements and environment.`
    }
    promptSentences.push(expandedDescription)
  }
  
  // 3. CAMERA SPECIFICATIONS (Detailed paragraph)
  const cameraDetails: string[] = []
  if (cameraAngle) {
    const angleMap: Record<string, string> = {
      'wide': 'wide angle lens capturing an expansive view',
      'extreme wide': 'extreme wide angle lens showing a very expansive, panoramic view',
      'medium': 'medium shot with balanced framing',
      'close-up': 'close-up shot with intimate, tight framing',
      'extreme close-up': 'extreme close-up with very intimate, detailed framing',
      'low angle': 'low angle perspective looking up, creating dramatic and powerful visual impact',
      'high angle': 'high angle perspective looking down, creating an elevated, observational view',
      'bird\'s eye': 'bird\'s eye view from directly above, top-down perspective',
      'worm\'s eye': 'worm\'s eye view from extreme low angle, dramatic upward perspective',
      'dutch angle': 'dutch angle with tilted camera, creating dynamic and disorienting perspective',
      'overhead': 'overhead shot from directly above, top-down view'
    }
    const angleLower = cameraAngle.toLowerCase()
    const angleDescription = Object.entries(angleMap).find(([key]) => angleLower.includes(key))?.[1] || `camera angle: ${cameraAngle}`
    cameraDetails.push(angleDescription)
  }
  
  if (cameraMovement) {
    const movementMap: Record<string, string> = {
      'static': 'static camera position with no movement, stable and composed',
      'pan': 'panning camera movement, smooth horizontal sweep across the scene',
      'tilt': 'tilting camera movement, smooth vertical movement up or down',
      'dolly': 'dolly shot with smooth forward or backward camera movement on tracks',
      'tracking': 'tracking shot following movement, camera moves parallel to the subject',
      'crane': 'crane shot with vertical sweeping movement, elevated camera perspective',
      'push-in': 'push-in movement, camera gradually moves closer to the subject',
      'pull-out': 'pull-out movement, camera gradually moves away from the subject',
      'zoom': 'zoom lens movement, focal length changes to bring subject closer or further',
      'handheld': 'handheld camera with natural, organic movement',
      'slow push-in': 'slow push-in movement, gradual and deliberate approach',
      'rapid push-in': 'rapid push-in movement, quick and dynamic approach',
      'dolly forward': 'dolly forward movement, smooth approach toward the subject',
      'dolly back': 'dolly back movement, smooth retreat from the subject',
      'slow dolly back': 'slow dolly back movement, gradual and smooth retreat'
    }
    const movementLower = cameraMovement.toLowerCase()
    const movementDescription = Object.entries(movementMap).find(([key]) => movementLower.includes(key))?.[1] || `camera movement: ${cameraMovement}`
    cameraDetails.push(movementDescription)
  }
  
  if (cameraDetails.length > 0) {
    promptSentences.push(`The camera uses ${cameraDetails.join(' with ')}.`)
  }
  
  // 4. LIGHTING (Detailed paragraph)
  if (lightingNotes) {
    let lightingDesc = lightingNotes.toLowerCase()
    const lightingEnhancements: Record<string, string> = {
      'overhead fluorescent': 'harsh overhead fluorescent lighting creates a clinical, sterile atmosphere with cool tones',
      'soft': 'soft, diffused lighting with gentle shadows creates a warm and inviting atmosphere',
      'dramatic': 'dramatic lighting with strong contrast and deep shadows creates cinematic, moody atmosphere',
      'natural': 'natural lighting provides realistic, authentic illumination',
      'backlit': 'backlit composition with rim lighting creates silhouette effects and depth',
      'street light': 'street light illumination provides urban night atmosphere with warm artificial light pools',
      'window light': 'window light streams in naturally, creating soft directional lighting with natural shadows',
      'warm': 'warm lighting with golden tones creates inviting, comfortable atmosphere',
      'cool': 'cool lighting with blue tones creates calm, detached atmosphere',
      'mixed': 'mixed lighting combines multiple sources for complex, layered illumination'
    }
    
    for (const [key, value] of Object.entries(lightingEnhancements)) {
      if (lightingDesc.includes(key)) {
        lightingDesc = value
        break
      }
    }
    promptSentences.push(`Lighting: ${lightingDesc}.`)
  } else if (sceneTimeOfDay) {
    const timeLighting: Record<string, string> = {
      'day': 'Bright daylight provides natural sun illumination with clear visibility and warm tones',
      'night': 'Night lighting creates dark atmosphere with artificial lights providing pools of illumination',
      'sunset': 'Warm sunset lighting during golden hour creates orange and pink hues across the scene',
      'sunrise': 'Soft sunrise lighting provides morning glow with blue and orange tones',
      'dusk': 'Dusk lighting during twilight creates purple and orange sky with transitional atmosphere',
      'dawn': 'Dawn lighting provides early morning soft light breaking through darkness'
    }
    const timeLower = sceneTimeOfDay.toLowerCase()
    const inferredLighting = Object.entries(timeLighting).find(([key]) => timeLower.includes(key))?.[1]
    if (inferredLighting) {
      promptSentences.push(inferredLighting + '.')
    }
  }
  
  // 5. PROPS AND OBJECTS (Detailed)
  if (propsInFrame.length > 0) {
    promptSentences.push(`Visible elements in frame include: ${propsInFrame.join(', ')}.`)
  }
  
  // 6. CATEGORY-SPECIFIC DETAILS (Expanded)
  const categoryDetails: Record<string, string> = {
    'establishing': 'This is an establishing shot that sets the scene and location. The composition is wide, showing the environment without characters in focus. The shot establishes spatial relationships and provides context for the scene.',
    'product': 'This is a product shot with detailed focus on the object. The composition emphasizes the product with professional product photography style, highlighting details and features.',
    'transition': 'This is a transition shot that provides smooth visual flow between scenes. The composition focuses on environmental details and atmospheric elements.',
    'crowd': 'This is a crowd scene showing background extras in a wide angle composition. No main characters are visible, focusing on the crowd as a collective element.',
    'atmosphere': 'This is an atmospheric shot that emphasizes mood and ambience. The composition uses environmental storytelling to convey emotion and setting.',
    'nature': 'This is a nature shot focusing on the natural environment. The composition emphasizes landscape elements, natural beauty, and environmental details.',
    'impossible': 'This is an impossible angle shot with unique perspective that would be difficult to achieve physically. The composition uses cinematic techniques for dramatic effect.',
    'time-based': 'This is a time-based shot that uses temporal effects. The composition emphasizes dynamic movement and the passage of time.',
    'vfx': 'This is a visual effects shot with enhanced visuals. The composition uses cinematic quality effects to create the desired visual impact.',
    'macro': 'This is a macro shot with extreme detail focus. The composition emphasizes close-up details of objects with precise focus.',
    'green-screen': 'This is a background plate shot for compositing. The composition provides a clean background element for post-production integration.'
  }
  
  if (category && categoryDetails[category]) {
    promptSentences.push(categoryDetails[category])
  }
  
  // 7. COMPOSITION AND FRAMING (Detailed)
  promptSentences.push(`The composition uses cinematic framing with professional video production quality. The shot follows rule of thirds and creates visual depth through foreground, midground, and background elements.`)
  
  // 8. ASPECT RATIO AND TECHNICAL SPECS
  promptSentences.push(`The video is shot in 9:16 portrait aspect ratio, optimized for vertical viewing.`)
  
  // 9. MOOD AND COLOR PALETTE (Detailed)
  if (sceneMood) {
    const moodColors: Record<string, string> = {
      'tense': 'The color palette uses muted colors with high contrast to create tension and unease.',
      'sad': 'The color palette uses desaturated colors with cool tones to convey melancholy and somber mood.',
      'happy': 'The color palette uses vibrant colors with warm tones to create joyful and energetic atmosphere.',
      'dark': 'The color palette uses dark atmosphere with low key lighting to create mysterious and ominous mood.',
      'mysterious': 'The color palette uses shadowy tones with high contrast to create intrigue and uncertainty.',
      'romantic': 'The color palette uses soft colors with warm lighting to create intimate and tender atmosphere.',
      'dramatic': 'The color palette uses strong contrast with cinematic lighting to create powerful and impactful mood.'
    }
    const moodLower = sceneMood.toLowerCase()
    const colorPalette = Object.entries(moodColors).find(([key]) => moodLower.includes(key))?.[1]
    if (colorPalette) {
      promptSentences.push(colorPalette)
    }
  }
  
  // 10. FINAL STYLE AND QUALITY DESCRIPTORS
  promptSentences.push(`The video maintains cinematic quality throughout with smooth motion, professional film production standards, and attention to visual detail.`)
  
  // Join all sentences into a comprehensive prompt
  return promptSentences.join(' ')
}

/**
 * Analyze multiple shots/frames using API (to be called from API endpoint)
 */
export async function analyzeShotsForAIGeneration(
  shots: (Shot | StoryboardFrame)[],
  breakdownData?: ScriptBreakdownData
): Promise<Map<string, AIGenerationAnalysis>> {
  const results = new Map<string, AIGenerationAnalysis>()
  
  for (const shot of shots) {
    const analysis = detectAIGeneratableShotClientSide(shot, breakdownData)
    results.set(shot.id, analysis)
  }
  
  return results
}

