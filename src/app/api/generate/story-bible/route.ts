import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { generateContent, generateStructuredContent } from '@/services/azure-openai'
import { GEMINI_CONFIG, AZURE_CONFIG } from '@/services/model-config'
// 🚀 PRIORITIZE V2 ENGINES - Latest and Greatest!
import { PremiseEngineV2 } from '@/services/premise-engine-v2'
import { CharacterEngineV2 } from '@/services/character-engine-v2'
import type { StoryPremise } from '@/services/premise-engine'
import { FractalNarrativeEngineV2 } from '@/services/fractal-narrative-engine-v2'
import { WorldBuildingEngineV2 } from '@/services/world-building-engine-v2'
import { StrategicDialogueEngine } from '@/services/strategic-dialogue-engine'
import { TensionEscalationEngine } from '@/services/tension-escalation-engine'
import { GenreMasterySystem } from '@/services/genre-mastery-system'
import { InteractiveChoiceEngine } from '@/services/interactive-choice-engine'
import { ThemeIntegrationEngine } from '@/services/theme-integration-engine'
import { LivingWorldEngine } from '@/services/living-world-engine'
import { IntelligentTropeSystem } from '@/services/intelligent-trope-system'
// 🎭 NEW: Murphy Pillar Integration - Invisible Enhancement
import { MasterConductorInstance } from '@/services/master-conductor'
import { logger, ENGINE_CONFIGS } from '@/services/console-logger'

// Set maximum execution time to 30 minutes (1800 seconds) for story bible generation
export const maxDuration = 1800

// Real Engine Classes (static methods)
// const premiseEngine = PremiseEngineV2
// const characterEngine = CharacterEngineV2
// const narrativeEngine = FractalNarrativeEngineV2
// const worldEngine = WorldBuildingEngineV2
// const dialogueEngine = StrategicDialogueEngine
// const tensionEngine = TensionEscalationEngine
// const genreEngine = GenreMasterySystem
// const choiceEngine = InteractiveChoiceEngine
// const themeEngine = ThemeIntegrationEngine
// const livingWorldEngine = LivingWorldEngine
// const tropeEngine = IntelligentTropeSystem

// Helper to validate Gemini API key (used at runtime, not module load)
const getGeminiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  if (apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is too short, please check the value')
  }
  
  return apiKey
}

// Engine Progress Tracking
interface EngineProgress {
  engineId: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  progress: number
  message: string
  startTime: number
  endTime?: number
}

class EngineProgressTracker {
  private engines: Map<string, EngineProgress> = new Map()
  private currentEngine: string | null = null
  private overallProgress: number = 0
  private baseUrl: string = 'http://localhost:3000'

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || 'http://localhost:3000'
    this.initializeEngines()
  }
  
  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private initializeEngines() {
    const engineList = [
      { id: 'premise', name: 'Premise Engine', message: 'Analyzing story foundation and thematic structure' },
      { id: 'character', name: 'Character Engine', message: 'Creating complex 3D characters with psychology' },
      { id: 'narrative', name: 'Narrative Engine', message: 'Building fractal story structure and arcs' },
      { id: 'world', name: 'World Engine', message: 'Building immersive settings and environments' },
      { id: 'dialogue', name: 'Dialogue Engine', message: 'Crafting strategic character conversations' },
      { id: 'tension', name: 'Tension Engine', message: 'Building and releasing dramatic tension' },
      { id: 'genre', name: 'Genre Engine', message: 'Optimizing for genre-specific storytelling' },
      { id: 'choice', name: 'Choice Engine', message: 'Creating meaningful branching narratives' },
      { id: 'theme', name: 'Theme Engine', message: 'Integrating thematic elements throughout' },
      { id: 'living', name: 'Living World Engine', message: 'Making the world feel alive and reactive' },
      { id: 'trope', name: 'Trope Engine', message: 'Subverting and enhancing genre conventions' },
      { id: 'cohesion', name: 'Cohesion Engine', message: 'Ensuring story elements connect logically' },
      { id: 'marketing', name: 'Marketing Engine', message: 'Developing comprehensive UGC marketing strategy' }
    ]

    engineList.forEach(engine => {
      this.engines.set(engine.id, {
        engineId: engine.id,
        name: engine.name,
        message: engine.message,
        status: 'pending',
        progress: 0,
        startTime: 0
      })
    })
  }

  async startEngine(engineId: string) {
    const engine = this.engines.get(engineId)
    if (engine) {
      engine.status = 'active'
      engine.progress = 0
      engine.startTime = Date.now()
      this.currentEngine = engineId
      console.log(`🚀 Starting ${engine.name}`)
      
      // Notify API that engine started (always send updates)
      try {
        await fetch(`${this.baseUrl}/api/engine-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'update_engine',
            engineId: engineId,
            progress: 0,
            status: 'active',
            message: engine.message,
            name: engine.name
          })
        })
        
          // Update current engine
          await fetch(`${this.baseUrl}/api/engine-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'set_current_engine',
            engineIndex: Array.from(this.engines.keys()).indexOf(engineId)
          })
        })
      } catch (error) {
        console.log('Failed to notify engine start:', error)
      }
    }
  }

  async updateProgress(engineId: string, progress: number, message?: string) {
    const engine = this.engines.get(engineId)
    if (engine) {
      engine.progress = Math.min(progress, 100)
      if (message) engine.message = message
      this.updateOverallProgress()
      console.log(`📊 ${engine.name}: ${progress}% - ${message || engine.message}`)
      
      // Send progress update to API (always send updates)
      try {
        await fetch(`${this.baseUrl}/api/engine-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'update_engine',
            engineId: engineId,
            progress: progress,
            status: engine.status,
            message: message ?? engine.message,
            name: engine.name
          })
        })
        
        // Also update current engine
        if (this.currentEngine === engineId) {
          await fetch(`${this.baseUrl}/api/engine-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'set_current_engine',
              engineIndex: Array.from(this.engines.keys()).indexOf(engineId)
            })
          })
        }
      } catch (error) {
        console.log('Failed to send progress update:', error)
      }
    }
  }

  async completeEngine(engineId: string) {
    const engine = this.engines.get(engineId)
    if (engine) {
      engine.status = 'completed'
      engine.progress = 100
      engine.endTime = Date.now()
      this.currentEngine = null
      console.log(`✅ Completed ${engine.name}`)
      this.updateOverallProgress()
      
      // Notify API that engine completed (always send updates)
      try {
        await fetch(`${this.baseUrl}/api/engine-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'update_engine',
            engineId: engineId,
            progress: 100,
            status: 'completed',
            message: 'Completed',
            name: engine.name
          })
        })
      } catch (error) {
        console.log('Failed to notify engine completion:', error)
      }
    }
  }

  failEngine(engineId: string, error: string) {
    const engine = this.engines.get(engineId)
    if (engine) {
      engine.status = 'failed'
      engine.message = `Failed: ${error}`
      console.log(`❌ Failed ${engine.name}: ${error}`)
    }
  }

  private updateOverallProgress() {
    const totalEngines = this.engines.size
    const completedEngines = Array.from(this.engines.values()).filter(e => e.status === 'completed').length
    const activeProgress = this.currentEngine ? this.engines.get(this.currentEngine)?.progress || 0 : 0
    
    this.overallProgress = Math.round((completedEngines / totalEngines) * 100 + (activeProgress / totalEngines))
  }

  getStatus() {
    return {
      engines: Array.from(this.engines.values()),
      currentEngine: this.currentEngine,
      overallProgress: this.overallProgress
    }
  }
}

// Helper function to determine genre from theme
function determineGenreFromTheme(theme: string): string {
  const themeMap: Record<string, string> = {
    'love': 'romance',
    'redemption': 'drama',
    'power': 'thriller',
    'truth': 'mystery',
    'survival': 'action',
    'family': 'drama',
    'friendship': 'comedy',
    'justice': 'crime',
    'growth': 'coming_of_age',
    'sacrifice': 'drama'
  };
  
  const lowerTheme = theme.toLowerCase();
  for (const [key, genre] of Object.entries(themeMap)) {
    if (lowerTheme.includes(key)) {
      return genre;
    }
  }
  
  return 'drama'; // Default genre
}

// Helper function to safely parse JSON from text that might contain markdown code blocks
const safeParseJSON = (text: string) => {
  try {
    // First, try direct parsing
    return JSON.parse(text)
  } catch (e) {
    // If that fails, look for JSON inside markdown code blocks
    try {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (fenceMatch && fenceMatch[1]) {
        const inner = fenceMatch[1].trim()
        // Try object first, then array
        if (inner.startsWith('{') || inner.startsWith('[')) {
          return JSON.parse(inner)
        }
      }
    } catch (innerError) {
      console.error("Failed to parse JSON from markdown block", innerError)
    }
    
    // Try extracting the first JSON array or object anywhere in the text
    try {
      const arrMatch = text.match(/\[[\s\S]*\]/)
      const objMatch = text.match(/\{[\s\S]*\}/)
      const candidate = arrMatch?.[0] || objMatch?.[0]
      if (candidate) {
        return JSON.parse(candidate)
      }
    } catch (e2) {
      // ignore
    }
    
    // If all parsing attempts fail, return null instead of generic structure
    return null
  }
}

// Helper function to parse and validate section-specific data
const parseIfValid = <T>(raw: string, isValid: (obj: any) => boolean): { data?: T; raw?: string } => {
  try {
    const parsed = safeParseJSON(raw)
    return (parsed && isValid(parsed)) ? { data: parsed } : { raw: raw }
  } catch {
    return { raw: raw }
  }
}

// Enhanced Story Bible schema for premise-driven generation
const premiseDrivenStoryBibleSchema = {
  type: "object",
  properties: {
    // The foundational premise that drives everything
    premise: {
      type: "object",
      properties: {
        theme: { type: "string" },
        coreConflict: { type: "string" },
        centralQuestion: { type: "string" },
        emotionalCore: { type: "string" },
        genre: { type: "string" },
        targetAudience: { type: "string" },
        uniqueAngle: { type: "string" }
      },
      required: ["theme", "coreConflict", "centralQuestion", "emotionalCore", "genre", "targetAudience", "uniqueAngle"]
    },
    
    // Character-driven narrative structure
    mainCharacters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          archetype: { type: "string" },
          arc: { type: "string" },
          description: { type: "string" },
          motivation: { type: "string" },
          flaw: { type: "string" },
          growth: { type: "string" },
              relationships: { type: "array", items: { type: "string" } }
        },
        required: ["name", "archetype", "arc", "description", "motivation", "flaw", "growth", "relationships"]
      }
    },
    
    // Multi-layered narrative architecture
    narrativeArcs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          episodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                number: { type: "number" },
                title: { type: "string" },
                summary: { type: "string" },
                keyEvents: { type: "array", items: { type: "string" } },
                characterDevelopment: { type: "string" },
                thematicElements: { type: "string" }
              },
              required: ["number", "title", "summary", "keyEvents", "characterDevelopment", "thematicElements"]
            }
          }
        },
        required: ["title", "summary", "episodes"]
      }
    },
    
    // Interactive and branching elements
    potentialBranchingPaths: { type: "string" },
    
    // Rich world-building
    worldBuilding: {
      type: "object",
      properties: {
        setting: { type: "string" },
        rules: { type: "string" },
        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              significance: { type: "string" },
              atmosphere: { type: "string" }
            },
            required: ["name", "description", "significance", "atmosphere"]
          }
        },
        timePeriod: { type: "string" },
        culturalContext: { type: "string" }
      },
      required: ["setting", "rules", "locations", "timePeriod", "culturalContext"]
    },
    
    // Genre-specific enhancements
    genreElements: {
      type: "object",
      properties: {
        primaryGenre: { type: "string" },
        subgenres: { type: "array", items: { type: "string" } },
        tropes: { type: "array", items: { type: "string" } },
        conventions: { type: "array", items: { type: "string" } },
        innovations: { type: "array", items: { type: "string" } }
      },
      required: ["primaryGenre", "subgenres", "tropes", "conventions", "innovations"]
    },
    
    // Tension and pacing
    tensionSystem: {
      type: "object",
      properties: {
        escalationPattern: { type: "string" },
        releasePoints: { type: "array", items: { type: "string" } },
        climaxStructure: { type: "string" },
        resolutionStrategy: { type: "string" }
      },
      required: ["escalationPattern", "releasePoints", "climaxStructure", "resolutionStrategy"]
    },
    
    // Character relationships and dynamics
    characterDynamics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          characters: { type: "array", items: { type: "string" } },
          relationshipType: { type: "string" },
          dynamics: { type: "string" },
          evolution: { type: "string" },
          conflicts: { type: "array", items: { type: "string" } }
        },
        required: ["characters", "relationshipType", "dynamics", "evolution", "conflicts"]
      }
    }
  },
  required: ["premise", "mainCharacters", "narrativeArcs", "potentialBranchingPaths", "worldBuilding", "genreElements", "tensionSystem", "characterDynamics"]
}

// REAL ENGINE-BASED STORY BIBLE GENERATION (with actual AI calls)
async function generateStoryBibleWithEngines(synopsis: string, theme: string, progressTracker: EngineProgressTracker, characterInfo?: string[], userSetting?: string, protagonist?: string) {
  console.log('🚀 USING REAL ENGINE-BASED GENERATION - All 12 engines active!')
  
  try {
    const storyType = detectStoryType(synopsis, theme)
    console.log(`🎯 Detected story type: ${storyType} - AI will decide optimal character count dynamically`)
    
    // Log character information if provided
    if (characterInfo && characterInfo.length > 0) {
      console.log(`👥 Using character information for ${characterInfo.length} character(s) provided by user`)
    }
    
    // Log user setting if provided
    if (userSetting && userSetting.trim()) {
      console.log(`🌍 Using user-provided setting: ${userSetting.substring(0, 100)}...`)
    }
    
    // Log protagonist if provided
    if (protagonist && protagonist.trim()) {
      console.log(`⭐ Using protagonist information: ${protagonist.substring(0, 100)}...`)
    }
    
    // 🎯 PHASE 1: Foundation (Premise + Character)
    await progressTracker.startEngine('premise')
    progressTracker.updateProgress('premise', 10, 'AI analyzing story foundation...')
    
    // ACTUAL AI CALL: Generate premise analysis
    const premisePrompt = `Analyze this story premise using Egri's method:
Synopsis: ${synopsis}
Theme: ${theme}

Create a detailed premise analysis in JSON format:
{
  "premiseStatement": "A clear statement of what the story proves",
  "character": "The type of character who will prove this premise",
  "conflict": "The central conflict that tests the character",
  "resolution": "How the premise is ultimately proven",
  "theme": "${theme}",
  "premiseType": "The genre/type of story",
  "egriEquation": "Character + Conflict → Resolution",
  "thematicPurpose": "How every element serves to prove the premise"
}`
    console.log('🤖 PREMISE ENGINE: Generating premise analysis...')
    const premiseAnalysis = await generateContentWithGemini(premisePrompt)
    console.log('✅ PREMISE ENGINE: Generated premise analysis')
    
    progressTracker.updateProgress('premise', 50, 'Building premise equation...')
    await new Promise(resolve => setTimeout(resolve, 300))
    progressTracker.updateProgress('premise', 100, 'Premise foundation complete')
    await progressTracker.completeEngine('premise')
    
    // 👥 CHARACTER GENERATION
    await progressTracker.startEngine('character')
    progressTracker.updateProgress('character', 10, 'AI analyzing character requirements...')
    
    // ACTUAL AI CALL: Generate character count recommendation (INCREASED RANGE FOR RICHER STORYTELLING)
    const characterPrompt = `Based on this story:
Synopsis: ${synopsis}
Theme: ${theme}

How many main characters would be optimal for a rich, multi-layered narrative? Consider:
- Story complexity and multiple plot threads
- Character relationship dynamics and conflicts
- Potential for character development across multiple arcs  
- Need for diverse perspectives and roles
- Supporting cast that can become more prominent later

CRITICAL: Base your decision purely on story needs, NOT arbitrary ranges.
- Intimate 2-person drama? Return 2-3 characters
- Small ensemble (family, friends)? Return 5-8 characters
- Medium ensemble (workplace, school)? Return 8-12 characters
- Large scope (crime, politics, epic)? Return 15-30+ characters

Respond with just the optimal number for THIS specific story. No artificial limits.`
    console.log('🤖 CHARACTER ENGINE: AI determining optimal character count based on story complexity...')
    const characterCountResponse = await generateContentWithGemini(characterPrompt)
    let optimalCharacterCount = parseInt(characterCountResponse) || 8 // Neutral default
    
    // Check if user specified a character count in advanced settings (via synopsis parsing)
    // Advanced settings character count is embedded in synopsis context
    const characterCountMatch = synopsis.match(/Generate exactly (\d+) main characters/i)
    if (characterCountMatch) {
      optimalCharacterCount = parseInt(characterCountMatch[1])
      console.log(`✅ CHARACTER ENGINE: Using user-specified character count: ${optimalCharacterCount}`)
    } else {
    console.log(`✅ CHARACTER ENGINE: AI determined optimal character count: ${optimalCharacterCount} (fully AI-driven, no hardcoded ranges)`)
    }
    
    // Adjust character count if character information was provided
    let charactersToGenerate = optimalCharacterCount
    let characterInfoToUse: string[] = []
    
    if (characterInfo && characterInfo.length > 0) {
      characterInfoToUse = characterInfo
      charactersToGenerate = Math.max(0, optimalCharacterCount - characterInfo.length)
      console.log(`👥 CHARACTER ENGINE: Character information provided for ${characterInfo.length} character(s). Generating ${charactersToGenerate} additional character(s).`)
      
      if (charactersToGenerate === 0) {
        console.log(`✅ CHARACTER ENGINE: Character information provided for all characters. AI will use this information to create full profiles.`)
      }
    }
    
    progressTracker.updateProgress('character', 30, `Stage 1: Generating character roster...`)
    
    // Combine character information with generated roster
    let finalRoster: Array<{name: string, role: string, archetype: string, info?: string}> = []
    
    // ALWAYS add protagonist FIRST if provided
    if (protagonist && protagonist.trim()) {
      // Try to extract protagonist name from the description
      // Look for patterns like "Name, description" or "Name - description" or just "Name description"
      const namePatterns = [
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s-]/,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s/,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
      ]
      
      let protagonistName = 'The Protagonist'
      for (const pattern of namePatterns) {
        const match = protagonist.trim().match(pattern)
        if (match && match[1]) {
          protagonistName = match[1]
          break
        }
      }
      
      console.log(`⭐ Adding protagonist to roster: ${protagonistName}`)
      finalRoster.push({
        name: protagonistName,
        role: 'protagonist',
        archetype: 'Protagonist',
        info: protagonist.trim() // Store the full protagonist description
      })
      
      // Adjust character count since we're adding the protagonist
      if (charactersToGenerate > 0) {
        charactersToGenerate = Math.max(0, charactersToGenerate - 1)
      }
    }
    
    // Add characters from user-provided information (these are supporting characters)
    characterInfoToUse.forEach((info, idx) => {
      // Try to extract name from the first line of the character info
      const firstLine = info.split('\n')[0].trim()
      const nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
      const extractedName = nameMatch ? nameMatch[1] : `Character ${idx + 1}`
      
      finalRoster.push({
        name: extractedName,
        role: 'supporting', // These are supporting characters, protagonist is already added
        archetype: 'Supporting Character',
        info: info // Store the full character information
      })
    })
    
    // STAGE 1: Generate character roster for remaining characters if needed
    if (charactersToGenerate > 0) {
    console.log('🤖 CHARACTER ENGINE V2: Stage 1 - Generating character roster...')
    
    const rosterPrompt = `You are creating a character roster for a story. 

STORY: ${synopsis}
THEME: ${theme}
CHARACTERS NEEDED: ${charactersToGenerate}
${characterInfoToUse.length > 0 ? `\nEXISTING CHARACTERS (do not duplicate these names):\n${characterInfoToUse.map((info, idx) => {
  const firstLine = info.split('\n')[0].trim()
  const nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
  return `- ${nameMatch ? nameMatch[1] : `Character ${idx + 1}`}`
}).join('\n')}` : ''}

Generate ${charactersToGenerate} unique characters with realistic names that fit the story.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
[
  {"name": "Detective Sarah Martinez", "role": "protagonist", "archetype": "Determined investigator"},
  {"name": "Dr. Marcus Webb", "role": "antagonist", "archetype": "Corrupt authority figure"},
  {"name": "Emma Chen", "role": "supporting", "archetype": "Local witness"}
]

Requirements:
- Each character needs a realistic first and last name
- Names must fit the story setting and genre
- All ${charactersToGenerate} names must be completely unique
- ${(protagonist && protagonist.trim()) || characterInfoToUse.length > 0 ? 'DO NOT use any names from the existing characters list above. ' : ''}Use diverse, authentic names from different backgrounds
- ${(protagonist && protagonist.trim()) ? 'The protagonist is already included. ' : ''}${characterInfoToUse.length === 0 && !protagonist ? 'Make the first character the protagonist, second the antagonist. ' : ''}Assign appropriate roles (${(protagonist && protagonist.trim()) ? 'antagonist, ' : ''}supporting)
- Return only the JSON array, nothing else`

      console.log(`🎭 Generating roster of ${charactersToGenerate} unique characters...`)
    
    let rosterResponse
      let roster: Array<{name: string, role: string, archetype: string}> = []
    
    // Try multiple times to get character roster
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🎯 Roster generation attempt ${attempt}/3`)
        rosterResponse = await generateContentWithGemini(rosterPrompt)
        
        if (rosterResponse && rosterResponse !== 'Content generation failed') {
          console.log(`📋 Raw roster response: ${rosterResponse.substring(0, 200)}...`)
          const parsedRoster = safeParseJSON(rosterResponse)
          
          if (parsedRoster && Array.isArray(parsedRoster) && parsedRoster.length > 0) {
            roster = parsedRoster
            console.log(`✅ Successfully generated ${roster.length} characters on attempt ${attempt}`)
            break
          } else {
            console.log(`⚠️ Attempt ${attempt}: Invalid roster format or empty array`)
          }
        } else {
          console.log(`⚠️ Attempt ${attempt}: Generation failed`)
        }
      } catch (error) {
        console.error(`🚨 Roster generation attempt ${attempt} failed:`, error)
      }
      
      if (attempt < 3) {
        console.log('🔄 Retrying roster generation...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log(`📋 Final roster result: ${roster.length} characters`)
    
      // Ensure we have the right number and dedupe names
      // Include protagonist name in used names to avoid duplicates
      const usedNames = new Set<string>()
      
      // Add protagonist name if it exists
      if (protagonist && protagonist.trim()) {
        const namePatterns = [
          /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)[,\s-]/,
          /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s/,
          /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
        ]
        for (const pattern of namePatterns) {
          const match = protagonist.trim().match(pattern)
          if (match && match[1]) {
            usedNames.add(match[1].toLowerCase())
            break
          }
        }
      }
      
      // Add character info names
      characterInfoToUse.forEach((info, idx) => {
        const firstLine = info.split('\n')[0].trim()
        const nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)
        if (nameMatch && nameMatch[1]) {
          usedNames.add(nameMatch[1].toLowerCase())
        }
      })
      const validRoster: Array<{name: string, role: string, archetype: string, info?: string}> = []
    
    // Only use fallbacks if AI completely failed to generate ANY characters
      if (roster.length === 0 && charactersToGenerate > 0) {
      console.error('🚨 AI FAILED TO GENERATE CHARACTER ROSTER - Creating emergency fallbacks')
      
      // Generate story-relevant fallback names based on synopsis keywords
      const storyKeywords = synopsis.toLowerCase()
      const isDetective = storyKeywords.includes('detective') || storyKeywords.includes('investigat')
      const isDoctor = storyKeywords.includes('doctor') || storyKeywords.includes('medical')
      const isSchool = storyKeywords.includes('school') || storyKeywords.includes('teacher')
      
      const emergencyRoster = []
        for (let i = 0; i < charactersToGenerate; i++) {
        let name, archetype
          if (characterInfoToUse.length === 0 && i === 0) {
          name = isDetective ? 'Detective Sarah Chen' : isDoctor ? 'Dr. Maria Rodriguez' : isSchool ? 'Teacher Alex Johnson' : 'Sarah Martinez'
          archetype = 'Protagonist'
          } else if (characterInfoToUse.length === 0 && i === 1) {
          name = isDetective ? 'Commissioner Marcus Webb' : isDoctor ? 'Dr. Victor Kane' : isSchool ? 'Principal David Stone' : 'Marcus Thompson'
          archetype = 'Antagonist'
        } else {
          const names = ['Elena Rodriguez', 'Jake Sullivan', 'Lisa Park', 'Tom Rivera', 'Amanda Foster', 'Ryan Chen', 'Sophie Williams', 'Michael Torres', 'Rachel Green', 'James Mitchell', 'Helen Chang', 'Mark Davis', 'Diana Lopez', 'Carlos Smith', 'Nina Patel']
            name = names[i] || `Character ${i + 1}`
          archetype = 'Supporting Character'
        }
        
        emergencyRoster.push({
          name,
            role: (characterInfoToUse.length === 0 && i === 0) ? 'protagonist' : ((characterInfoToUse.length === 0 && i === 1) ? 'antagonist' : 'supporting'),
          archetype
        })
      }
      roster = emergencyRoster
      console.log('⚠️ Using emergency story-relevant character roster')
    }
    
      // Process generated roster and add to final roster
      for (let i = 0; i < charactersToGenerate; i++) {
      const character = roster[i] || {
        name: `FALLBACK_CHARACTER_${i + 1}`,
          role: 'supporting',
        archetype: 'Supporting Character'
      }
      
      // Ensure name uniqueness
      let finalName = character.name
      let counter = 1
      while (usedNames.has(finalName.toLowerCase())) {
        finalName = `${character.name} ${counter}`
        counter++
      }
      usedNames.add(finalName.toLowerCase())
      
        finalRoster.push({
        name: finalName,
        role: character.role,
        archetype: character.archetype
      })
      }
    }
    
    // Use final roster (character info + generated)
    const validRoster = finalRoster
    
    console.log(`✅ CHARACTER ROSTER: ${characterInfoToUse.length > 0 ? `Using info for ${characterInfoToUse.length} character(s) + ` : ''}Generated ${validRoster.length} total unique characters`)
    console.log(`📋 Cast: ${validRoster.map(c => c.name).join(', ')}`)
    
    progressTracker.updateProgress('character', 50, `Stage 2: Expanding to 3D profiles...`)
    
    // STAGE 2: Expand roster to full 3D profiles
    console.log('🤖 CHARACTER ENGINE V2: Stage 2 - Expanding to 3D profiles...')
    progressTracker.updateProgress('character', 50, `Starting 3D character enhancement for ${validRoster.length} characters...`)
    const characters = []
    
    // 🔥 BATCH PROCESSING: Process characters in batches to handle large rosters (28+ characters)
    // This prevents the AI from losing context and ensures consistent formatting
    const BATCH_SIZE = validRoster.length > 10 ? 6 : validRoster.length > 5 ? 5 : validRoster.length
    const totalBatches = Math.ceil(validRoster.length / BATCH_SIZE)
    
    console.log(`📦 Processing ${validRoster.length} characters in ${totalBatches} batch(es) of ${BATCH_SIZE} characters each`)
    
    // Create a concise synopsis summary for prompts (to reduce token usage)
    const synopsisSummary = synopsis.length > 300 ? synopsis.substring(0, 300) + '...' : synopsis
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE
      const batchEnd = Math.min(batchStart + BATCH_SIZE, validRoster.length)
      const batch = validRoster.slice(batchStart, batchEnd)
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches}: characters ${batchStart + 1}-${batchEnd} of ${validRoster.length}`)
      
      // Build context summary of already-generated characters (for consistency)
      const existingCharactersSummary = characters.length > 0 
        ? `\n\nALREADY GENERATED CHARACTERS (for reference and consistency):\n${characters.slice(0, 10).map((c, idx) => 
          `${idx + 1}. ${c.name} (${c.archetype || 'Character'}) - ${(c.description || '').substring(0, 100)}...`
        ).join('\n')}${characters.length > 10 ? `\n... and ${characters.length - 10} more characters` : ''}`
        : ''
      
      // Process batch: generate all characters in this batch
      for (let i = 0; i < batch.length; i++) {
        const rosterChar = batch[i]
        const globalIndex = batchStart + i
        
        // Check if this character has user-provided information
        const hasCharacterInfo = rosterChar.info && rosterChar.info.trim().length > 0
        
        try {
          console.log(`🎭 Expanding character ${globalIndex + 1}/${validRoster.length}: ${rosterChar.name} (${rosterChar.role})...`)
          
          const characterPrompt = (hasCharacterInfo
            ? `Create a full 3D character profile using Egri's method. The user has provided character information that you should use and expand upon:

USER-PROVIDED CHARACTER INFORMATION:
${rosterChar.info}

STORY CONTEXT: ${synopsisSummary}
THEME: ${theme}
CHARACTER NAME: ${rosterChar.name}
CHARACTER ROLE: ${rosterChar.role}
CHARACTER ARCHETYPE: ${rosterChar.archetype}
CHARACTER POSITION: ${globalIndex + 1} of ${validRoster.length}${existingCharactersSummary}

CRITICAL INSTRUCTIONS:
1. Use the EXACT name "${rosterChar.name}" - do not change it
2. Use the user-provided information above as the foundation, and expand it into a complete 3D profile
3. If the user provided minimal information, use your creativity to fill in the gaps while staying true to what they described
4. Ensure this character is unique and distinct from the already-generated characters listed above
5. Follow the EXACT JSON format below - do not deviate

Generate a complete character in this EXACT JSON format:`
            : `Expand this character from our story roster into a full 3D profile using Egri's method:

STORY CONTEXT: ${synopsisSummary}
THEME: ${theme}
CHARACTER NAME: ${rosterChar.name}
CHARACTER ROLE: ${rosterChar.role}
CHARACTER ARCHETYPE: ${rosterChar.archetype}
CHARACTER POSITION: ${globalIndex + 1} of ${validRoster.length}${existingCharactersSummary}

CRITICAL INSTRUCTIONS:
1. Use the EXACT name "${rosterChar.name}" - do not change it
2. Ensure this character is unique and distinct from the already-generated characters listed above
3. Follow the EXACT JSON format below - do not deviate

Generate a complete character in this EXACT JSON format:`) + `
{
  "name": "Character's full name",
  "archetype": "Character archetype/role",
  "arc": "Complete character arc spanning the entire series",
  "description": "Comprehensive character summary",
  "physiology": {
    "age": "Character's age",
    "gender": "Character's gender",
    "appearance": "Detailed physical description including height, build, distinctive features",
    "build": "Body build/physique",
    "health": "Physical health status and any conditions",
    "physicalTraits": ["Notable physical characteristics", "mannerisms", "distinctive features"]
  },
  "sociology": {
    "class": "Social class and economic background",
    "occupation": "Job/profession and skills",
    "education": "Educational background and knowledge areas",
    "homeLife": "Family structure and living situation",
    "economicStatus": "Financial situation and resources",
    "communityStanding": "Social reputation and relationships"
  },
  "psychology": {
    "coreValue": "Primary guiding principle and belief system",
    "moralStandpoint": "Ethical viewpoint and moral framework",
    "want": "External goal they're actively pursuing",
    "need": "Internal lesson they must learn (often opposite of want)",
    "primaryFlaw": "Main character weakness that creates conflict",
    "temperament": ["Key personality traits", "behavioral patterns"],
    "attitude": "General outlook on life and worldview",
    "iq": "Intelligence level and thinking style",
    "fears": ["Primary fears", "deepest anxieties"]
  }
}

CRITICAL: Create a unique, complex character that serves the theme "${theme}" and fits naturally into the story world. Make sure all three dimensions (physiology, sociology, psychology) are fully developed and interconnected. Return ONLY valid JSON - no markdown, no commentary, no additional text.`

          // Update progress before starting character generation
          const progressPercent = 50 + ((globalIndex / validRoster.length) * 20)
          progressTracker.updateProgress('character', progressPercent, 
            `Generating ${rosterChar.name} (${rosterChar.role}) - ${globalIndex + 1}/${validRoster.length} characters...`)
          
          // Use increased token limit for character generation (16384 tokens for large rosters)
          const characterResponse = await generateContentWithGemini(characterPrompt, { 
            maxOutputTokens: validRoster.length > 10 ? 16384 : 8192 
          })
          const parsedCharacter = safeParseJSON(characterResponse)
          
          if (parsedCharacter && parsedCharacter.name) {
            // Ensure the name matches our roster
            parsedCharacter.name = rosterChar.name
            characters.push(parsedCharacter)
            console.log(`✅ Expanded character: ${rosterChar.name}`)
          } else {
            throw new Error('Failed to parse character JSON')
          }
          
          // Update progress after successful character generation
          progressTracker.updateProgress('character', progressPercent, 
            `Enhanced ${rosterChar.name} (${rosterChar.role}) - ${globalIndex + 1}/${validRoster.length} characters`)
        } catch (error) {
          console.error(`Failed to generate character ${globalIndex + 1}:`, error)
          // Enhanced fallback character using roster info
          const fallbackCharacter = {
            name: rosterChar.name,
            archetype: rosterChar.archetype,
            arc: `Character development arc exploring ${theme}`,
            description: `A complex character for the story about ${synopsisSummary}`,
            physiology: {
              age: "Adult",
              gender: "To be determined",
              appearance: "Distinctive and memorable appearance",
              build: "Average build",
              health: "Good health",
              physicalTraits: ["Expressive eyes", "Confident posture"]
            },
            sociology: {
              class: "Middle class",
              occupation: "Relevant to the story world",
              education: "Well-educated",
              homeLife: "Complex family dynamics",
              economicStatus: "Stable",
              communityStanding: "Respected"
            },
            psychology: {
              coreValue: theme,
              moralStandpoint: "Principled but conflicted",
              want: "External goal related to the story",
              need: "Internal growth and understanding",
              primaryFlaw: "Pride or fear",
              temperament: ["Determined", "Complex"],
              attitude: "Cautiously optimistic",
              iq: "Above average",
              fears: ["Failure", "Loss of control"]
            }
          }
          characters.push(fallbackCharacter)
          const progressPercent = 50 + ((globalIndex / validRoster.length) * 20)
          progressTracker.updateProgress('character', progressPercent, 
            `Used fallback for ${rosterChar.name} (${rosterChar.role}) - ${globalIndex + 1}/${validRoster.length} characters`)
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log(`✅ CHARACTER ENGINE V2: Generated ${characters.length} 3D character architectures`)
    const characterDescriptions = JSON.stringify(characters, null, 2)
    
    progressTracker.updateProgress('character', 70, 'Building character relationships...')
    await new Promise(resolve => setTimeout(resolve, 200))
    progressTracker.updateProgress('character', 100, 'Character system complete')
    await progressTracker.completeEngine('character')
    
    // 🌊 NARRATIVE STRUCTURE
    await progressTracker.startEngine('narrative')
    progressTracker.updateProgress('narrative', 10, 'AI building fractal narrative structure...')
    
    // ACTUAL AI CALL: Generate narrative structure
    const narrativePrompt = `Based on this story:
Synopsis: ${synopsis}
Theme: ${theme}
Characters: ${optimalCharacterCount} main characters

How many narrative arcs would be optimal for THIS specific story? Consider:
- Story scope and complexity
- Character development needs across the series
- Thematic exploration requirements
- Natural narrative phases this story needs

Respond with just the optimal number for this story. Base your decision purely on story needs - a simple intimate story might need 1-3 arcs, while an epic saga might need 10+ arcs.`
    console.log('🤖 NARRATIVE ENGINE: Determining optimal arc count...')
    const arcCountResponse = await generateContentWithGemini(narrativePrompt)
    const optimalArcCount = parseInt(arcCountResponse) || 4
    console.log(`✅ NARRATIVE ENGINE: Determined optimal arc count: ${optimalArcCount}`)
    
    progressTracker.updateProgress('narrative', 50, 'AI determining optimal episode structure...')
    
    // ACTUAL AI CALL: Generate episode structure
    const episodePrompt = `For ${optimalArcCount} narrative arcs, how many episodes per arc would be optimal for THIS specific story? Consider:
- Each arc's complexity and what it needs to accomplish
- Character development pacing requirements
- Plot resolution needs for each arc
- Natural rhythm and pacing of the story

Respond with ${optimalArcCount} numbers representing episodes for each arc. Base decisions purely on story needs - a quick setup arc might need 2-4 episodes, while a complex climax arc might need 15-25 episodes.`
    console.log('🤖 NARRATIVE ENGINE: Determining episode structure...')
    const episodeStructure = await generateContentWithGemini(episodePrompt)
    console.log('✅ NARRATIVE ENGINE: Generated episode structure')
    
    progressTracker.updateProgress('narrative', 100, 'Narrative architecture complete')
    await progressTracker.completeEngine('narrative')
    
    // 🌍 WORLD BUILDING
    await progressTracker.startEngine('world')
    progressTracker.updateProgress('world', 10, 'AI creating immersive world...')
    
    // ACTUAL AI CALL: Generate world building
    const worldPrompt = `Create comprehensive world building for this ${storyType} series.

INPUT
Synopsis: ${synopsis}
Theme: ${theme}
${userSetting && userSetting.trim() ? `\nUser-Provided Setting: ${userSetting.trim()}\nIMPORTANT: Use the user's setting description as the foundation. Expand and detail it, but preserve the core elements they described.` : ''}

OUTPUT JSON ONLY (no markdown), exactly in this shape:
{
  "setting": "${userSetting && userSetting.trim() ? `Expand and detail the user's setting: ${userSetting.trim()}. Make it vivid and concrete while preserving their core description.` : '1-2 paragraphs describing the overall setting, concrete and vivid.'}",
  "rules": [
    "High-level world constraint or system rule tied to ${theme}",
    "Social or cultural rule",
    "Geography/physical rule",
    "Story-specific constraint"
  ],
  "locations": [
    {
      "name": "Location name",
      "type": "campus|neighborhood|home|hangout|institution|hidden|event-space|authority|other",
      "description": "Vivid description (3-5 sentences)",
      "significance": "Why this place matters for the premise/conflict",
      "recurringEvents": ["event 1", "event 2"],
      "conflicts": ["conflict 1", "conflict 2"]
    }
  ]
}

Constraints:
- ${userSetting && userSetting.trim() ? 'PRESERVE the user\'s setting description. Expand it with details, but keep their core elements (locations, time period, key features).' : ''}
- Provide 8-12 varied locations appropriate to the synopsis${userSetting && userSetting.trim() ? ' and the user\'s setting description' : ''}.
- Use authentic, specific names; no placeholders.
- Return ONLY valid JSON with no commentary or markdown.`
    console.log('🤖 WORLD ENGINE: Generating world building...')
    const worldBuilding = await generateContentWithGemini(worldPrompt)
    console.log('✅ WORLD ENGINE: Generated world building')
    
    progressTracker.updateProgress('world', 100, 'World building complete')
    await progressTracker.completeEngine('world')
    
    // 💬 DIALOGUE SYSTEM
    await progressTracker.startEngine('dialogue')
    progressTracker.updateProgress('dialogue', 10, 'AI crafting strategic dialogue...')
    
    // ACTUAL AI CALL: Generate dialogue system
    const dialoguePrompt = `Create dialogue strategy for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "characterVoice": "Guidelines for distinct character voices and speech patterns",
  "conflictDialogue": "Techniques for dialogue during confrontation and tension",
  "subtext": "Methods for layering subtext and unspoken meaning in conversations",
  "speechPatterns": "Character-specific vocabulary, rhythm, and linguistic traits"
}`
    console.log('🤖 DIALOGUE ENGINE: Generating dialogue system...')
    const dialogueSystem = await generateContentWithGemini(dialoguePrompt)
    console.log('✅ DIALOGUE ENGINE: Generated dialogue system')
    
    progressTracker.updateProgress('dialogue', 100, 'Dialogue system complete')
    await progressTracker.completeEngine('dialogue')
    
    // ⚡ TENSION SYSTEM
    await progressTracker.startEngine('tension')
    progressTracker.updateProgress('tension', 10, 'AI building dramatic tension...')
    
    // ACTUAL AI CALL: Generate tension system
    const tensionPrompt = `Create tension escalation system for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "tensionCurve": "Description of how tension builds throughout the series",
  "climaxPoints": "Key moments of maximum tension and conflict",
  "releaseMoments": "Strategic points where tension is released for pacing",
  "escalationTechniques": "Methods used to gradually increase stakes and urgency",
  "emotionalBeats": "Emotional rhythm and character-driven tension points"
}`
    console.log('🤖 TENSION ENGINE: Generating tension system...')
    const tensionSystem = await generateContentWithGemini(tensionPrompt)
    console.log('✅ TENSION ENGINE: Generated tension system')
    
    progressTracker.updateProgress('tension', 100, 'Tension system complete')
    await progressTracker.completeEngine('tension')
    
    // 🎭 GENRE MASTERY
    await progressTracker.startEngine('genre')
    progressTracker.updateProgress('genre', 10, 'AI optimizing for genre...')
    
    // ACTUAL AI CALL: Generate genre mastery
    const genrePrompt = `Create genre enhancement for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "visualStyle": "Visual aesthetic and cinematographic approach for the genre",
  "pacing": "Rhythm and tempo guidelines specific to this genre",
  "tropes": "Genre conventions to embrace, subvert, or avoid",
  "audienceExpectations": "What the target audience expects from this genre and story"
}`
    console.log('🤖 GENRE ENGINE: Generating genre mastery...')
    const genreMastery = await generateContentWithGemini(genrePrompt)
    console.log('✅ GENRE ENGINE: Generated genre mastery')
    
    progressTracker.updateProgress('genre', 100, 'Genre mastery complete')
    await progressTracker.completeEngine('genre')
    
    // 🔀 CHOICE SYSTEM
    await progressTracker.startEngine('choice')
    progressTracker.updateProgress('choice', 10, 'AI creating branching narratives...')
    
    // ACTUAL AI CALL: Generate choice system
    const choicePrompt = `Create choice architecture for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "keyDecisions": "Major decision points that shape the narrative direction",
  "moralChoices": "Ethical dilemmas and moral crossroads for characters",
  "consequenceMapping": "How choices ripple through the story and affect outcomes",
  "characterGrowth": "How choices drive character development and arcs",
  "thematicChoices": "Decisions that directly explore and challenge the story's theme"
}`
    console.log('🤖 CHOICE ENGINE: Generating choice system...')
    const choiceSystem = await generateContentWithGemini(choicePrompt)
    console.log('✅ CHOICE ENGINE: Generated choice system')
    
    progressTracker.updateProgress('choice', 100, 'Choice system complete')
    await progressTracker.completeEngine('choice')
    
    // 🎨 THEME INTEGRATION
    await progressTracker.startEngine('theme')
    progressTracker.updateProgress('theme', 10, 'AI integrating thematic elements...')
    
    // ACTUAL AI CALL: Generate theme integration
    const themePrompt = `Create theme integration strategy for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "characterIntegration": "How theme is explored through character arcs and development",
  "plotIntegration": "How thematic elements drive plot progression and conflicts",
  "symbolicElements": "Symbols, metaphors, and motifs that reinforce the theme",
  "resolutionStrategy": "How the theme reaches satisfying conclusion and meaning"
}`
    console.log('🤖 THEME ENGINE: Generating theme integration...')
    const themeIntegration = await generateContentWithGemini(themePrompt)
    console.log('✅ THEME ENGINE: Generated theme integration')
    
    progressTracker.updateProgress('theme', 100, 'Theme integration complete')
    await progressTracker.completeEngine('theme')
    
    // 🌟 LIVING WORLD
    await progressTracker.startEngine('living')
    progressTracker.updateProgress('living', 10, 'AI making world feel alive...')
    
    // ACTUAL AI CALL: Generate living world
    const livingPrompt = `Create living world dynamics for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "backgroundEvents": "Events happening in the world independent of main characters",
  "socialDynamics": "How different groups and communities interact and change",
  "economicFactors": "Economic forces and systems that affect the story world",
  "politicalUndercurrents": "Political tensions and power structures in the background",
  "culturalShifts": "Cultural movements and changes happening during the story"
}`
    console.log('🤖 LIVING WORLD ENGINE: Generating living world...')
    const livingWorld = await generateContentWithGemini(livingPrompt)
    console.log('✅ LIVING WORLD ENGINE: Generated living world')
    
    progressTracker.updateProgress('living', 100, 'Living world complete')
    await progressTracker.completeEngine('living')
    
    // 🎭 TROPE SYSTEM
    await progressTracker.startEngine('trope')
    progressTracker.updateProgress('trope', 10, 'AI subverting genre conventions...')
    
    // ACTUAL AI CALL: Generate trope system
    const tropePrompt = `Create trope analysis for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "genreTropes": "Traditional genre tropes that this story uses effectively",
  "subvertedTropes": "Common tropes that this story deliberately subverts or challenges",
  "originalElements": "Fresh narrative elements that avoid tired conventions",
  "audienceExpectations": "How the story plays with what audiences expect from the genre",
  "innovativeTwists": "Creative approaches that feel both surprising and inevitable"
}`
    console.log('🤖 TROPE ENGINE: Generating trope system...')
    const tropeSystem = await generateContentWithGemini(tropePrompt)
    console.log('✅ TROPE ENGINE: Generated trope system')
    
    progressTracker.updateProgress('trope', 100, 'Trope system complete')
    await progressTracker.completeEngine('trope')
    
    // 🔗 COHESION ENGINE
    await progressTracker.startEngine('cohesion')
    progressTracker.updateProgress('cohesion', 10, 'AI ensuring story cohesion...')
    
    // ACTUAL AI CALL: Generate cohesion analysis
    const cohesionPrompt = `Analyze story cohesion for this story:
Synopsis: ${synopsis}
Theme: ${theme}
Character Count: ${optimalCharacterCount}
Arc Count: ${optimalArcCount}

Return ONLY valid JSON with this exact structure:
{
  "narrativeCohesion": "How well all story elements work together as a unified whole",
  "thematicContinuity": "Consistency of thematic exploration throughout the narrative",
  "characterArcs": "How character development arcs interconnect and support each other",
  "plotConsistency": "Internal logic and cause-and-effect relationships in the plot",
  "emotionalJourney": "Flow and progression of emotional beats across the entire story"
}`
    console.log('🤖 COHESION ENGINE: Generating cohesion analysis...')
    const cohesionAnalysis = await generateContentWithGemini(cohesionPrompt)
    console.log('✅ COHESION ENGINE: Generated cohesion analysis')
    
    await new Promise(resolve => setTimeout(resolve, 200))
    progressTracker.updateProgress('cohesion', 100, 'Story cohesion complete')
    await progressTracker.completeEngine('cohesion')
    
    // 📢 MARKETING ENGINE
    await progressTracker.startEngine('marketing')
    progressTracker.updateProgress('marketing', 10, 'AI analyzing marketing opportunities...')
    
    // ACTUAL AI CALL: Generate comprehensive marketing strategy
    const marketingPrompt = `Create a comprehensive marketing strategy for this actor-driven, AI-assisted episodic series following industry standards for short-form UGC content.

STORY CONTEXT:
- Synopsis: ${synopsis}
- Theme: ${theme}
- Genre: ${storyType || 'drama'}
- Character Count: ${optimalCharacterCount}
- Arc Count: ${optimalArcCount}
- Target Audience: General audience (to be refined)

GREENLIT AI CONTEXT (Critical for Strategy):
- Platform: Greenlit AI - Decentralized Studio Model
- Content Type: Short-form episodic series (5-minute episodes)
- Budget: Ultra-micro-budget ($1k-$20k per series)
- Marketing Model: Actors market themselves as UGC creators (Full-Stack Creator)
- Revenue Model: 70% revenue share to creators, 30% to platform
- IP Ownership: Actors own 100% of IP
- Production: AI-assisted (30+ Narrative Engines, AI post-production)
- Growth Strategy: Organic network effects via "Peer Casting Loop" and "Fanbase Activation"
- Marketing Budget: $0 (Sweat Equity Marketing - Content Density strategy)

INDUSTRY STANDARDS TO APPLY:

1. HOOK-RETENTION-REWARD CYCLE:
   - Hook (0:00-0:03): Must start in media res with high stakes or visual intrigue
   - Retention (0:03-1:30): Micro-resolutions every 15-30 seconds
   - Reward/Cliffhanger: End on unresolved tension compelling action

2. PLATFORM-SPECIFIC STRATEGIES:
   - TikTok: Interest Graph (Discovery) - 3-5 posts/day, trending audio, text overlays
   - Instagram Reels: Social Graph (Retention) - Professional grid, broadcast channels, collab posts
   - YouTube Shorts: Archive/SEO - SEO titles, related video links, longer shelf life

3. ACTOR-DRIVEN MARKETING:
   - Radical Authenticity: "Underdog Creator" narrative
   - Container Strategy: Separate Show Profile (in-world) and Actor Profile (BTS/commentary)
   - Peer Casting Loop: Co-stars as distribution nodes with marketing deliverables

4. MICRO-BUDGET FRAMEWORK:
   - Content Density: 10 minutes derivative content per 1 minute premium footage
   - Community-Driven Growth: "1,000 True Fans" model, Velvet Rope Beta, gamified engagement
   - $0 Marketing Stack: Bloopers, table reads, reaction cams, green screen commentary

5. MARKETING TIMELINES:
   - Pre-Launch (4 weeks): Build in public, character concept art, waiting list, velvet rope beta
   - Launch (Week 0): Bulk drop (3-5 episodes), coordinated cast posts, maximum velocity
   - Post-Launch (Ongoing): Remix marketing, fan theory discussions, interactive voting

6. KPIs AND METRICS:
   - Completion Rate: >40% for 1-min clips
   - Velocity: >1,000 views in Hour 1
   - Share Ratio: >1.5%
   - Series Conversion Rate: >20% (Ep 1 to Ep 2)
   - Monetization Conversion: 2-5%

CRITICAL: Generate ready-to-use social media content:
- For each platform (TikTok, Instagram, YouTube), create 5 unique captions that are immediately usable
- Each caption should be platform-optimized (TikTok: short/hook-focused, Instagram: professional/engaging, YouTube: SEO-friendly/descriptive)
- Generate 10-15 hashtags per platform that are relevant and trending-appropriate
- Create 3 post templates per platform for different content types
- For each marketing hook, generate 3 variations that can be used in different contexts

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "marketingStrategy": {
    "primaryApproach": "Primary marketing approach description tailored to this story",
    "targetAudience": {
      "primary": ["Primary audience segment 1", "Primary audience segment 2"],
      "secondary": ["Secondary audience segment 1", "Secondary audience segment 2"],
      "demographics": {
        "age": "Target age range",
        "interests": "Key interests aligned with story",
        "platforms": "Primary platforms for this audience"
      },
      "persona": "Detailed target audience persona description"
    },
    "keySellingPoints": ["Selling point 1", "Selling point 2", "Selling point 3", "Selling point 4", "Selling point 5"],
    "uniqueValueProposition": "What makes this series unique and marketable in the UGC space"
  },
  "platformStrategies": {
    "tiktok": {
      "contentFormat": "Recommended content format for TikTok",
      "postingSchedule": "Optimal posting schedule (3-5 posts/day)",
      "hashtagStrategy": ["Hashtag 1", "Hashtag 2", "Hashtag 3", "Hashtag 4", "Hashtag 5"],
      "contentIdeas": ["Content idea 1", "Content idea 2", "Content idea 3"],
      "trendingAudioStrategy": "How to leverage trending audio while maintaining authenticity",
      "textOverlayStrategy": "Text overlay approach for algorithm categorization"
    },
    "instagram": {
      "contentFormat": "Recommended content format for Instagram Reels",
      "postingSchedule": "Optimal posting schedule",
      "gridAesthetic": "Visual grid strategy for professional press kit look",
      "broadcastChannelStrategy": "How to use broadcast channels for superfan notifications",
      "collabPostStrategy": "Peer Casting Loop collab post approach",
      "storiesStrategy": "Instagram Stories marketing tactics"
    },
    "youtube": {
      "contentFormat": "Recommended content format for YouTube Shorts",
      "seoTitleStrategy": "SEO-optimized title approach with trope keywords",
      "relatedVideoStrategy": "How to drive traffic to full episodes",
      "longevityStrategy": "Long-term discoverability approach"
    }
  },
  "marketingHooks": {
    "episodeHooks": ["Episode hook 1", "Episode hook 2", "Episode hook 3"],
    "seriesHooks": ["Series hook 1", "Series hook 2", "Series hook 3"],
    "characterHooks": ["Character hook 1", "Character hook 2", "Character hook 3"],
    "viralPotentialScenes": ["Scene description 1 with viral potential", "Scene description 2 with viral potential"]
  },
  "distribution": {
    "preLaunch": [
      "Pre-launch tactic 1 (4 weeks out)",
      "Pre-launch tactic 2",
      "Pre-launch tactic 3",
      "Pre-launch tactic 4"
    ],
    "launch": [
      "Launch tactic 1 (Week 0 - Bulk Drop)",
      "Launch tactic 2 (Coordinated cast posts)",
      "Launch tactic 3 (Maximum velocity strategy)"
    ],
    "postLaunch": [
      "Post-launch tactic 1 (Remix marketing)",
      "Post-launch tactic 2 (Fan engagement)",
      "Post-launch tactic 3 (Retention strategy)"
    ]
  },
  "ugcStrategy": {
    "actorMarketing": [
      "Actor marketing tactic 1 (Radical Authenticity)",
      "Actor marketing tactic 2 (Underdog Creator narrative)",
      "Actor marketing tactic 3 (Personal brand integration)"
    ],
    "authenticityMaintenance": [
      "Authenticity tip 1",
      "Authenticity tip 2",
      "Authenticity tip 3"
    ],
    "communityBuilding": [
      "Community tactic 1 (1,000 True Fans)",
      "Community tactic 2 (Velvet Rope Beta)",
      "Community tactic 3 (Gamified engagement)"
    ],
    "containerStrategy": {
      "showProfile": "Show profile strategy (in-world, immersive)",
      "actorProfile": "Actor profile strategy (BTS, commentary, fourth wall breaks)",
      "permeability": "How to control brand permeability between profiles"
    }
  },
  "peerCastingLoop": {
    "strategy": "How to leverage co-stars as distribution nodes",
    "marketingDeliverables": [
      "1 Main Feed Post (Trailer/Clip)",
      "3 Story Posts with Direct Links",
      "1 Collab Post (Shared ownership)"
    ],
    "multiplierEffect": "Expected reach calculation and conversion advantage"
  },
  "contentDensity": {
    "derivativeAssets": [
      "Bloopers (humanizes cast)",
      "Table Reads (shows creative process)",
      "Reaction Cams (actors watching final cut)",
      "Green Screen Commentary (easter eggs)"
    ],
    "ratio": "10 minutes derivative content per 1 minute premium footage"
  },
  "kpis": {
    "completionRate": {
      "target": ">40%",
      "measurement": "How to track completion rate"
    },
    "velocity": {
      "target": ">1,000 views in Hour 1",
      "measurement": "How to maximize first-hour velocity"
    },
    "shareRatio": {
      "target": ">1.5%",
      "measurement": "How to encourage sharing"
    },
    "seriesConversion": {
      "target": ">20%",
      "measurement": "Ep 1 to Ep 2 conversion tracking"
    },
    "monetizationConversion": {
      "target": "2-5%",
      "measurement": "Free to paid conversion strategy"
    }
  },
  "compliance": {
    "aiDisclosure": "How to label AI-generated content transparently",
    "sponsorshipDisclosure": "FTC guidelines for product placements",
    "ipOwnership": "How to communicate 70% revenue share and IP ownership in marketing",
    "unionConsiderations": "SAG-AFTRA implications if applicable"
  },
  "competitivePositioning": {
    "differentiation": "How this series differentiates from ReelShort, DramaBox, etc.",
    "humanElement": "Emphasizing real actors vs generic AI models",
    "qualityNarrative": "Studio-level storytelling vs cheap thrills",
    "communityFocus": "Social sharing and community vs walled gardens"
  },
  "readyToUseContent": {
    "tiktok": {
      "captions": ["Ready-to-use TikTok caption 1 (engaging, hook-focused, 1-2 sentences)", "Ready-to-use TikTok caption 2 (different angle)", "Ready-to-use TikTok caption 3 (question-based)", "Ready-to-use TikTok caption 4 (dramatic)", "Ready-to-use TikTok caption 5 (curiosity-driven)"],
      "hashtags": ["Hashtag1", "Hashtag2", "Hashtag3", "Hashtag4", "Hashtag5", "Hashtag6", "Hashtag7", "Hashtag8", "Hashtag9", "Hashtag10"],
      "templates": ["Template 1: Hook format for TikTok", "Template 2: Story format for TikTok", "Template 3: Question format for TikTok"]
    },
    "instagram": {
      "captions": ["Ready-to-use Instagram caption 1 (professional, engaging, 2-3 sentences)", "Ready-to-use Instagram caption 2 (BTS angle)", "Ready-to-use Instagram caption 3 (character focus)", "Ready-to-use Instagram caption 4 (behind-the-scenes)", "Ready-to-use Instagram caption 5 (community-building)"],
      "hashtags": ["Hashtag1", "Hashtag2", "Hashtag3", "Hashtag4", "Hashtag5", "Hashtag6", "Hashtag7", "Hashtag8", "Hashtag9", "Hashtag10", "Hashtag11", "Hashtag12", "Hashtag13", "Hashtag14", "Hashtag15"],
      "templates": ["Template 1: Professional announcement format", "Template 2: BTS storytelling format", "Template 3: Character spotlight format"]
    },
    "youtube": {
      "captions": ["Ready-to-use YouTube caption 1 (SEO-optimized, descriptive, 3-4 sentences)", "Ready-to-use YouTube caption 2 (episode description)", "Ready-to-use YouTube caption 3 (series introduction)", "Ready-to-use YouTube caption 4 (character introduction)", "Ready-to-use YouTube caption 5 (plot summary)"],
      "hashtags": ["Hashtag1", "Hashtag2", "Hashtag3", "Hashtag4", "Hashtag5", "Hashtag6", "Hashtag7", "Hashtag8", "Hashtag9", "Hashtag10"],
      "templates": ["Template 1: Episode description format", "Template 2: Series trailer format", "Template 3: Character introduction format"]
    }
  },
  "hookVariations": {
    "episodeHooks": {
      "Episode hook 1": ["Variation 1 of episode hook 1", "Variation 2 of episode hook 1", "Variation 3 of episode hook 1"],
      "Episode hook 2": ["Variation 1 of episode hook 2", "Variation 2 of episode hook 2", "Variation 3 of episode hook 2"],
      "Episode hook 3": ["Variation 1 of episode hook 3", "Variation 2 of episode hook 3", "Variation 3 of episode hook 3"]
    },
    "seriesHooks": {
      "Series hook 1": ["Variation 1 of series hook 1", "Variation 2 of series hook 1", "Variation 3 of series hook 1"],
      "Series hook 2": ["Variation 1 of series hook 2", "Variation 2 of series hook 2", "Variation 3 of series hook 2"],
      "Series hook 3": ["Variation 1 of series hook 3", "Variation 2 of series hook 3", "Variation 3 of series hook 3"]
    },
    "characterHooks": {
      "Character hook 1": ["Variation 1 of character hook 1", "Variation 2 of character hook 1", "Variation 3 of character hook 1"],
      "Character hook 2": ["Variation 1 of character hook 2", "Variation 2 of character hook 2", "Variation 3 of character hook 2"],
      "Character hook 3": ["Variation 1 of character hook 3", "Variation 2 of character hook 3", "Variation 3 of character hook 3"]
    }
  }
}`

    console.log('🤖 MARKETING ENGINE: Generating comprehensive marketing strategy...')
    const marketingStrategy = await generateContentWithGemini(marketingPrompt)
    console.log('✅ MARKETING ENGINE: Generated marketing strategy')
    
    progressTracker.updateProgress('marketing', 100, 'Marketing strategy complete')
    await progressTracker.completeEngine('marketing')
    
    // Now generate the final story bible with all the engine insights
    console.log('✅ ALL ENGINES COMPLETE - Now generating final story bible with Gemini!')
    console.log('📊 ENGINE INSIGHTS COLLECTED:')
    console.log(`   - Premise: ${premiseAnalysis.substring(0, 100)}...`)
    console.log(`   - Characters: ${optimalCharacterCount} (AI determined)`)
    console.log(`   - Arcs: ${optimalArcCount} (AI determined)`)
    console.log(`   - World: ${worldBuilding.substring(0, 100)}...`)
    console.log(`   - Dialogue: ${dialogueSystem.substring(0, 100)}...`)
    console.log(`   - Tension: ${tensionSystem.substring(0, 100)}...`)
    console.log(`   - Genre: ${genreMastery.substring(0, 100)}...`)
    console.log(`   - Choice: ${choiceSystem.substring(0, 100)}...`)
    console.log(`   - Theme: ${themeIntegration.substring(0, 100)}...`)
    console.log(`   - Living World: ${livingWorld.substring(0, 100)}...`)
    console.log(`   - Trope: ${tropeSystem.substring(0, 100)}...`)
    console.log(`   - Cohesion: ${cohesionAnalysis.substring(0, 100)}...`)
    console.log(`   - Marketing: ${marketingStrategy.substring(0, 100)}...`)
    
    // Skip redundant synthesis - directly assemble from engine outputs
    console.log('📦 DIRECT ASSEMBLY: Building story bible from engine outputs...')
    
    // Generate a compelling overview summary from the synopsis
    console.log('📝 Generating series overview summary...')
    const overviewPrompt = `Based on the following story synopsis, create a compelling and concise series overview (one paragraph) that summarizes the key elements, themes, and narrative promise. The overview should be engaging and capture the essence of the story without simply repeating the synopsis verbatim.

Synopsis: ${synopsis}
Theme: ${theme}
Story Type: ${storyType}

Create a one-paragraph summary that:
- Captures the core narrative and what makes it compelling
- Highlights the thematic exploration
- Suggests the emotional journey and stakes
- Is written in an engaging, professional tone

Return only the overview text as a single paragraph, no additional formatting or explanations.`
    
    let seriesOverview: string
    try {
      seriesOverview = await generateContentWithGemini(overviewPrompt)
      // Clean up any markdown formatting that might be returned
      seriesOverview = seriesOverview.trim().replace(/^["']|["']$/g, '').replace(/```[\w]*\n?/g, '').trim()
      console.log('✅ Generated series overview summary')
    } catch (error) {
      console.log('⚠️ Failed to generate overview summary, using fallback')
      // Fallback to a better template than before
      seriesOverview = `This ${storyType} series explores themes of ${theme} through a compelling narrative that challenges characters to confront their deepest beliefs and desires. The story weaves together complex character arcs, meaningful choices, and emotional depth to create an immersive viewing experience.`
    }
    
    const parsedContent: any = {
      seriesTitle: heuristicTitle(synopsis, theme), // Use heuristic first, will be overridden later
      seriesOverview: seriesOverview,
      synopsis: synopsis,
      theme: theme,
      mainCharacters: characters
    }
    
    // Add essential narrative structure
    console.log('📚 Adding narrative structure...')
    
    // Create narrative arcs structure
    parsedContent.narrativeArcs = Array.from({length: optimalArcCount}, (_, i) => ({
      title: `Arc ${i + 1}`,
      summary: `Narrative arc ${i + 1} exploring ${theme} through character development.`,
      episodes: Array.from({length: 8}, (_, j) => ({
        number: i * 8 + j + 1,
        title: `Episode ${i * 8 + j + 1}`,
        summary: `Episode summary will be generated during episode creation.`
      }))
    }))
    
    // Add world building structure
      parsedContent.worldBuilding = {
        setting: `A ${storyType} setting that supports the exploration of ${theme}`,
        rules: "The world operates according to realistic social and emotional dynamics",
        locations: [
          {
            name: "Primary Setting",
            description: `The main location where the ${storyType} unfolds`,
            significance: "Central to character interactions and plot development"
          }
        ]
    }
    
    // Add where the story could go
      parsedContent.potentialBranchingPaths = `The narrative offers multiple potential directions, exploring different aspects of ${theme} through varied character developments and story outcomes.`
    
    // Add ALL engine outputs to the final story bible - this was the missing piece!
    console.log('📊 Adding all engine outputs to story bible...')
    
    // Add premise analysis from engine
    try {
      const premiseData = safeParseJSON(premiseAnalysis)
      if (premiseData) {
        parsedContent.premise = premiseData
      } else {
        // Fallback premise structure if parsing fails
        parsedContent.premise = {
          premiseStatement: `${theme} is explored through the lens of ${synopsis}`,
          character: "The protagonist",
          conflict: "faces challenges that test their beliefs",
          resolution: "and must choose what they truly value",
          theme: theme,
          premiseType: storyType,
          rawAnalysis: premiseAnalysis
        }
      }
    } catch (error) {
      console.log('Failed to parse premise analysis, using fallback')
      parsedContent.premise = {
        premiseStatement: `${theme} is explored through the lens of ${synopsis}`,
        character: "The protagonist", 
        conflict: "faces challenges that test their beliefs",
        resolution: "and must choose what they truly value",
        theme: theme,
        premiseType: storyType,
        rawAnalysis: premiseAnalysis
      }
    }
    
    // Add world building from engine with validation
    const worldBuildingResult = parseIfValid(worldBuilding, (obj) => 
      typeof obj?.setting === 'string' ||
      Array.isArray(obj?.locations) ||
      typeof obj?.rules === 'string' ||
      Array.isArray(obj?.rules)
    )
    if (worldBuildingResult.data) {
      // Merge valid data into existing world skeleton
      parsedContent.worldBuilding = { ...parsedContent.worldBuilding, ...worldBuildingResult.data }
      console.log('✅ Added structured world building data')
    } else {
      // Keep skeleton and add raw content
      parsedContent.worldBuilding = { ...parsedContent.worldBuilding, rawContent: worldBuildingResult.raw }
      console.log('✅ Added world building raw content')
    }
    
    // Add dialogue system from engine with validation
    const dialogueResult = parseIfValid(dialogueSystem, (obj) =>
      ['characterVoice', 'conflictDialogue', 'subtext', 'speechPatterns'].some(k => obj?.[k] !== undefined)
    )
    parsedContent.dialogueStrategy = dialogueResult.data || { rawContent: dialogueResult.raw }
    console.log('✅ Added dialogue strategy data')
    
    // Add tension system from engine with validation
    const tensionResult = parseIfValid(tensionSystem, (obj) =>
      obj && (obj.tensionCurve || obj.climaxPoints || obj.releaseMoments || obj.escalationTechniques)
    )
    parsedContent.tensionStrategy = tensionResult.data || { rawContent: tensionResult.raw }
    console.log('✅ Added tension strategy data')
    
    // Add genre mastery from engine with validation (allow object tropes)
    const genreResult = parseIfValid(genreMastery, (obj) =>
      obj && (obj.visualStyle || obj.pacing || obj.tropes || obj.audienceExpectations)
    )
    parsedContent.genreEnhancement = genreResult.data || { rawContent: genreResult.raw }
    console.log('✅ Added genre enhancement data')
    
    // Add choice system from engine with validation
    const choiceResult = parseIfValid(choiceSystem, (obj) =>
      obj && (obj.keyDecisions || obj.moralChoices || obj.consequenceMapping)
    )
    parsedContent.choiceArchitecture = choiceResult.data || { rawContent: choiceResult.raw }
    console.log('✅ Added choice architecture data')
    
    // Add theme integration from engine with validation
    const themeResult = parseIfValid(themeIntegration, (obj) =>
      obj && (obj.characterIntegration || obj.plotIntegration || obj.symbolicElements)
    )
    parsedContent.themeIntegration = themeResult.data || { rawContent: themeResult.raw }
    console.log('✅ Added theme integration data')
    
    // Add living world from engine with validation
    const livingResult = parseIfValid(livingWorld, (obj) =>
      obj && (obj.backgroundEvents || obj.socialDynamics || obj.economicFactors)
    )
    parsedContent.livingWorldDynamics = livingResult.data || { rawContent: livingResult.raw }
    console.log('✅ Added living world dynamics data')
    
    // Add trope system from engine with validation
    const tropeResult = parseIfValid(tropeSystem, (obj) =>
      obj && (obj.genreTropes || obj.subvertedTropes || obj.originalElements)
    )
    parsedContent.tropeAnalysis = tropeResult.data || { rawContent: tropeResult.raw }
    console.log('✅ Added trope analysis data')
    
    // Add cohesion analysis from engine with validation
    const cohesionResult = parseIfValid(cohesionAnalysis, (obj) =>
      obj && (obj.narrativeCohesion || obj.thematicContinuity || obj.characterArcs)
    )
    parsedContent.cohesionAnalysis = cohesionResult.data || { rawContent: cohesionResult.raw }
    console.log('✅ Added cohesion analysis data')
    
    // Add marketing strategy from engine with validation
    const marketingResult = parseIfValid(marketingStrategy, (obj) =>
      obj && (obj.marketingStrategy || obj.platformStrategies || obj.ugcStrategy)
    )
    if (marketingResult.data) {
      parsedContent.marketing = marketingResult.data
      console.log('✅ Added comprehensive marketing strategy data')
    } else {
      // Fallback marketing structure
      parsedContent.marketing = {
        marketingStrategy: {
          primaryApproach: "Marketing strategy will be developed during pre-production phase",
          targetAudience: { primary: [], secondary: [], demographics: {}, persona: "" },
          keySellingPoints: [],
          uniqueValueProposition: ""
        },
        platformStrategies: {},
        marketingHooks: { episodeHooks: [], seriesHooks: [], characterHooks: [], viralPotentialScenes: [] },
        distribution: { preLaunch: [], launch: [], postLaunch: [] },
        ugcStrategy: { actorMarketing: [], authenticityMaintenance: [], communityBuilding: [], containerStrategy: {} },
        peerCastingLoop: { strategy: "", marketingDeliverables: [], multiplierEffect: "" },
        contentDensity: { derivativeAssets: [], ratio: "" },
        kpis: {},
        compliance: {},
        competitivePositioning: {},
        rawContent: marketingResult.raw || marketingStrategy
      }
      console.log('⚠️ Using fallback marketing structure (parsing failed)')
    }
    
    // Add provisions for future Living World Engine character introductions
    parsedContent.livingWorldProvisions = {
      characterExpansionEnabled: true,
      initialCharacterPool: parsedContent.mainCharacters?.length || 14,
      maxAdditionalCharacters: 8, // Allow up to 8 more characters to be introduced dynamically
      characterIntroductionTriggers: [
        'narrative_needs', // When story requires new perspectives
        'premise_exploration', // When premise needs different character types
        'conflict_escalation', // When conflict needs new participants
        'world_expansion', // When story moves to new settings/contexts
        'user_choice_consequences' // When choices create need for new characters
      ],
      plannedIntroductionArcs: [], // Will be populated by Living World Engine
      characterArchetypePool: [
        'mentor', 'rival', 'love-interest', 'ally', 'wildcart', 
        'authority-figure', 'comic-relief', 'catalyst', 'shadow', 'threshold-guardian'
      ],
      notes: "Story bible includes initial character pool. Living World Engine can introduce additional characters during episode generation based on narrative needs and user choices."
    }
    
    // Add Murphy Pillar stats showing real engine usage
    parsedContent.murphyPillarProcessed = true
    parsedContent.processingSteps = ['real-engine-generation', 'engine-insights-integration', 'living-world-provisions']
    parsedContent.murphyPillarStats = {
      enginesActivated: [
        'Premise Engine V2', 'Character Engine V2', 'Narrative Engine V2',
        'World Building Engine V2', 'Dialogue Engine V2', 'Tension Engine V2',
        'Genre Mastery Engine V2', 'Choice Engine V2', 'Theme Engine V2',
        'Living World Engine V2', 'Trope Engine V2', 'Cohesion Engine', 'Marketing Engine'
      ],
      multiModelRouting: true,
      storyTypeDetected: storyType,
      charactersGenerated: optimalCharacterCount,
      arcsGenerated: optimalArcCount,
      processingTime: Date.now(),
      engineInsightsUsed: true,
      characterExpansionReady: true // Flag indicating character expansion provisions are in place
    }
    
    console.log('✅ FINAL STORY BIBLE GENERATED USING ENGINE INSIGHTS!')
    return parsedContent
    
  } catch (error) {
    console.error('🚨 Engine-based generation failed:', error)
    throw error
  }
}

// Helper function to generate content with Gemini
async function generateContentWithGemini(prompt: string, options?: { maxOutputTokens?: number }): Promise<string> {
  try {
    // Validate API key before use
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.length < 10) {
      console.error('🚨 GEMINI_API_KEY is not configured or invalid')
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = GEMINI_CONFIG.getModel('stable')
    
    // Use custom maxOutputTokens if provided, otherwise use default from config
    const generationConfig = {
      ...GEMINI_CONFIG.GENERATION_CONFIG,
      ...(options?.maxOutputTokens && { maxOutputTokens: options.maxOutputTokens })
    }
    
    const model = genAI.getGenerativeModel({ 
      model: geminiModel,
      generationConfig
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('🚨 Gemini content generation failed:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Gemini API call failed: ${errorMessage}`)
  }
}

// Helper function to detect story type (for context only, not for rigid rules)
function detectStoryType(synopsis: string, theme: string): string {
  const text = `${synopsis} ${theme}`.toLowerCase()
  
  const patterns = {
    'high school drama': ['high school', 'teenage', 'teen', 'student', 'graduation', 'prom'],
    'college drama': ['college', 'university', 'campus', 'semester', 'dormitory'],
    'workplace drama': ['office', 'company', 'corporate', 'business', 'workplace', 'career'],
    'family drama': ['family', 'mother', 'father', 'sibling', 'parent', 'home', 'household'],
    'crime drama': ['detective', 'police', 'murder', 'investigation', 'criminal', 'crime', 'law'],
    'medical drama': ['hospital', 'doctor', 'medical', 'patient', 'surgery', 'nurse'],
    'fantasy drama': ['magic', 'fantasy', 'wizard', 'dragon', 'kingdom', 'quest', 'mythical'],
    'sci-fi drama': ['space', 'future', 'robot', 'alien', 'technology', 'sci-fi', 'quantum', 'cyber', 'ai', 'colony'],
    'contemporary drama': []
  }
  
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type
    }
  }
  
  return 'contemporary drama'
}

// --- Title Engine (concise, marketable titles) ---
const STOP_WORDS = new Set([
  'the','and','for','with','from','into','over','under','about','between','across',
  'of','to','in','on','at','by','a','an','is','are','was','were','as','that','this'
])

function simpleTitleCase(str: string) {
  return str
    .trim()
    .replace(/^["'""]+|["'""]+$/g, '')
    .split(/\s+/)
    .map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)
    .join(' ')
}

function sanitizeTitle(title: string) {
  let t = title.trim()
  t = t.replace(/^["'""]+|["'""]+$/g, '')
  t = t.replace(/\s+Series$/i, '')
  t = t.replace(/[:\-–—].*$/, '') // drop subtitles
  t = t.replace(/\b(Chronicles|Saga|Legend|Tales|Story)\b/gi, '').trim()
  t = t.replace(/\s{2,}/g, ' ')
  t = simpleTitleCase(t)
  return t.length <= 32 ? t : t.slice(0, 32).trim()
}

function heuristicTitle(synopsis: string, theme: string) {
  const words = (synopsis + ' ' + theme)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
  const uniq = Array.from(new Set(words))
  const pick = (i: number) => (uniq[i] ? simpleTitleCase(uniq[i]) : '')
  const try1 = `${pick(0)} ${pick(1)}`.trim()
  const try2 = `${pick(0)} ${pick(2)}`.trim()
  const base = sanitizeTitle(try1 || try2 || theme || 'Untitled')
  return base || 'Untitled'
}

async function generateSeriesTitle(synopsis: string, theme: string, storyType?: string) {
  const prompt = `Propose 8 evocative, marketable SERIES TITLES for a ${storyType || 'contemporary'} TV series.
Rules:
- 1–4 words only
- Title Case
- No subtitles/colons/hyphens
- No words like "Chronicles", "Saga", "Tales", "Story", or "Series"
- Avoid clichés; be specific to the synopsis and theme
- Must look good on a poster
Return ONLY a JSON array of 8 strings, best first.

Synopsis: ${synopsis}
Theme: ${theme}`
  try {
    const raw = await generateContentWithGemini(prompt)
    const parsed = safeParseJSON(raw)
    let candidate = Array.isArray(parsed) && parsed.length ? String(parsed[0]) : String(raw).split('\n')[0]
    candidate = sanitizeTitle(candidate)
    return candidate || heuristicTitle(synopsis, theme)
  } catch {
    return heuristicTitle(synopsis, theme)
  }
}

// Fallback to Gemini if engines fail
async function generateStoryBibleWithGemini(synopsis: string, theme: string) {
  console.log('🔄 FALLBACK: Using Gemini 3 Pro Preview (Advanced Mode)')
  
  // Validate API key before use
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  const geminiModel = GEMINI_CONFIG.getModel('stable')
  const model = genAI.getGenerativeModel({ 
    model: geminiModel,
    generationConfig: GEMINI_CONFIG.GENERATION_CONFIG
  })
  
  console.log(`🤖 Generating story bible with Gemini 2.5 model: ${geminiModel}`)
  
  const storyType = detectStoryType(synopsis, theme)
  console.log(`🎯 Detected story type: ${storyType} - AI will decide optimal counts dynamically`)
  
  const prompt = `Create a comprehensive Story Bible with flexible structure based on story complexity:

Synopsis: ${synopsis}
Theme: ${theme}

Please follow this EXACT JSON format without any markdown or additional text:
{
  "seriesTitle": "A catchy title for the series",
  "mainCharacters": [
    {
      "name": "Character Name",
      "archetype": "Character Archetype",
      "arc": "Brief description of character's full-series arc",
      "description": "Detailed character description"
    }
    // Generate the optimal number of main characters based on story complexity and needs
    // Consider: story scope, number of plot threads, relationship dynamics needed
    // Determine the count that serves THIS specific story best
  ],
  "narrativeArcs": [
    {
      "title": "Arc Title",
      "summary": "Summary of this narrative arc",
      "episodes": [
        {
          "number": 1,
          "title": "Episode Title",
          "summary": "Brief episode summary"
        }
        // Generate the optimal number of episodes per arc based on story pacing needs
        // Consider: arc complexity, character development time, plot resolution needs
        // Each arc should have the episode count it naturally needs
      ]
    }
    // Generate the optimal number of narrative arcs based on story complexity
    // Consider: story scope, character development needs, thematic exploration
    // Let the story determine how many narrative phases it needs
  ],
  "potentialBranchingPaths": "Description of major choices and consequences available to viewers throughout the series",
  "worldBuilding": {
    "setting": "Overall setting description",
    "rules": "Key rules or laws of this world",
    "locations": [
      {
        "name": "Location Name",
        "description": "Location description",
        "significance": "Why this location matters to the story"
      }
    ]
  }
}

IMPORTANT GUIDELINES:
- Let the story determine the optimal counts - don't force specific numbers
- Character count should reflect story complexity and the number of perspectives needed
- Episode count per arc should reflect each arc's specific pacing and development needs
- Arc count should reflect the story's natural narrative phases and scope
- Each story should feel unique and non-generic
- Focus on what serves the story best, not template adherence

CRITICAL: Analyze THIS story's specific needs and determine optimal counts dynamically. Don't anchor to typical ranges - let the story breathe and find its natural structure. An intimate 2-character drama is as valid as a sprawling 40-character epic. A 3-episode mini-series is as valid as a 100-episode saga.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('✅ Gemini generation successful')
    const parsedContent = safeParseJSON(text)
    
    // Override with better title
    const fallbackTitle = await generateSeriesTitle(synopsis, theme, storyType)
    parsedContent.seriesTitle = fallbackTitle
    
    // Add Murphy Pillar stats
    parsedContent.murphyPillarProcessed = true
    parsedContent.processingSteps = ['gemini-fallback-generation']
    parsedContent.murphyPillarStats = {
      enginesActivated: ['Gemini 3 Pro Preview (Fallback)'],
      multiModelRouting: false,
      storyTypeDetected: storyType,
      charactersGenerated: parsedContent.mainCharacters?.length || 0,
      processingTime: Date.now()
    }
    
    return parsedContent
  } catch (error) {
    console.error('🚨 Gemini generation failed:', error)
    throw error
  }
}

export async function POST(request: Request) {
  let synopsis: string = 'A story about characters facing challenges'
  let theme: string = 'Growth and discovery'
  
  try {
    const requestData = await request.json()
    const { generateImages = true, userId } = requestData
    
    // Handle new 6-question format with advanced settings
    if (requestData.logline && requestData.protagonist && requestData.stakes && requestData.vibe && requestData.setting && requestData.theme) {
      const { logline, protagonist, stakes, vibe, setting, theme: themeInput, additionalInfo, characterInfo } = requestData
      
      // Extract advanced settings if provided
      const { useAdvancedSettings, advancedSettings } = requestData
      
      // Parse character information if provided (split by "--" separator)
      if (characterInfo && typeof characterInfo === 'string' && characterInfo.trim()) {
        const characterTexts = characterInfo
          .split('--')
          .map(text => text.trim())
          .filter(text => text.length > 0)
        
        if (characterTexts.length > 0) {
          console.log(`👥 User provided information for ${characterTexts.length} character(s)`)
          ;(requestData as any)._characterInfo = characterTexts
        }
      }
      
      if (useAdvancedSettings && advancedSettings) {
        console.log('✨ Advanced Settings ENABLED:', advancedSettings)
        
        // Build enhanced synopsis with advanced settings
        let advancedContext = ''
        
        // Initial Character Count
        if (advancedSettings.initialCharacterCount && advancedSettings.initialCharacterCount > 0) {
          advancedContext += ` Generate exactly ${advancedSettings.initialCharacterCount} main characters.`
        }
        
        // Genre
        if (advancedSettings.genre && advancedSettings.genre !== 'default') {
          advancedContext += ` The genre is ${advancedSettings.genre}.`
        }
        
        // Tone (0 = Gritty, 100 = Lighthearted)
        if (advancedSettings.tone !== undefined) {
          const toneDesc = advancedSettings.tone <= 33 ? 'gritty and dark' : 
                          advancedSettings.tone >= 67 ? 'lighthearted and uplifting' : 'balanced in tone'
          advancedContext += ` The tone should be ${toneDesc}.`
        }
        
        // Dialogue Language
        if (advancedSettings.dialogueLanguage && advancedSettings.dialogueLanguage !== 'english') {
          advancedContext += ` Dialogue should incorporate ${advancedSettings.dialogueLanguage} language/expressions.`
        }
        
        // Mature Themes
        if (advancedSettings.matureThemes) {
          advancedContext += ` The story may include mature themes (R16+ content).`
        }
        
        // Series Structure
        if (advancedSettings.seriesLength) {
          const seriesLengthMap: Record<string, string> = {
            'mini': '3 narrative arcs with 24 total episodes',
            'limited': '4 narrative arcs with 32 total episodes',
            'full': '5 narrative arcs with 40 total episodes',
            'anthology': 'anthology-style standalone episodes'
          }
          const lengthDesc = seriesLengthMap[advancedSettings.seriesLength] || 'standard series length'
          advancedContext += ` Structure the series as ${lengthDesc}.`
        }
        
        if (advancedSettings.episodesPerArc && advancedSettings.episodesPerArc !== 8) {
          advancedContext += ` Target ${advancedSettings.episodesPerArc} episodes per arc.`
        }
        
        // Ending Type
        if (advancedSettings.endingType) {
          const endingTypeMap: Record<string, string> = {
            'open-ended': 'open-ended with potential for continuation',
            'conclusive': 'conclusive and satisfying',
            'ambiguous': 'ambiguous, leaving room for interpretation',
            'cyclical': 'cyclical, returning to where it began'
          }
          const endingDesc = endingTypeMap[advancedSettings.endingType] || 'naturally resolved'
          advancedContext += ` The ending should be ${endingDesc}.`
        }
        
        // POV Style
        if (advancedSettings.povStyle) {
          const povStyleMap: Record<string, string> = {
            'single': 'single protagonist focus',
            'ensemble': 'ensemble cast with multiple leads',
            'rotating': 'rotating POV between characters',
            'unreliable': 'unreliable narrator perspective'
          }
          const povDesc = povStyleMap[advancedSettings.povStyle] || 'standard narrative perspective'
          advancedContext += ` Use ${povDesc}.`
        }
        
        // Timeline Structure
        if (advancedSettings.timelineStructure && advancedSettings.timelineStructure !== 'linear') {
          const timelineMap: Record<string, string> = {
            'non-linear': 'non-linear storytelling with flashbacks',
            'multiple': 'multiple parallel timelines',
            'real-time': 'real-time narrative progression'
          }
          const timelineDesc = timelineMap[advancedSettings.timelineStructure] || 'non-linear structure'
          advancedContext += ` Employ ${timelineDesc}.`
        }
        
        // Conflict Type
        if (advancedSettings.conflictType) {
          const conflictMap: Record<string, string> = {
            'internal': 'internal/psychological conflict',
            'interpersonal': 'interpersonal relationship conflicts',
            'external': 'external forces (environment/society)',
            'cosmic': 'cosmic/existential themes'
          }
          const conflictDesc = conflictMap[advancedSettings.conflictType] || 'multi-layered conflict'
          advancedContext += ` Focus on ${conflictDesc}.`
        }
        
        // Protagonist Morality
        if (advancedSettings.protagonistMorality && advancedSettings.protagonistMorality !== 'heroic') {
          const moralityMap: Record<string, string> = {
            'anti-hero': 'anti-hero with questionable methods',
            'ambiguous': 'morally ambiguous protagonist',
            'villain': 'villain protagonist'
          }
          const moralityDesc = moralityMap[advancedSettings.protagonistMorality] || 'complex moral character'
          advancedContext += ` The protagonist should be an ${moralityDesc}.`
        }
        
        // Romance Subplot
        if (advancedSettings.romanceSubplot) {
          const romanceMap: Record<string, string> = {
            'none': 'no romance subplot',
            'light': 'light romance in the background',
            'central': 'romance as central plot element',
            'primary': 'romance as primary focus'
          }
          const romanceDesc = romanceMap[advancedSettings.romanceSubplot] || 'subtle romantic elements'
          advancedContext += ` Include ${romanceDesc}.`
        }
        
        // Character Age Range
        if (advancedSettings.characterAgeRange) {
          const ageRangeMap: Record<string, string> = {
            'children': 'child characters (under 12)',
            'teens': 'teenage characters (13-17)',
            'young-adults': 'young adult characters (18-25)',
            'adults': 'adult characters (26+)',
            'mixed': 'characters across multiple generations'
          }
          const ageDesc = ageRangeMap[advancedSettings.characterAgeRange] || 'diverse age range'
          advancedContext += ` Feature ${ageDesc}.`
        }
        
        // Setting Scope
        if (advancedSettings.settingScope) {
          const settingScopeMap: Record<string, string> = {
            'single': 'single location (bottle show style)',
            'limited': 'limited locations for budget efficiency',
            'multiple': 'multiple diverse locations',
            'epic': 'epic scope with many locations'
          }
          const scopeDesc = settingScopeMap[advancedSettings.settingScope] || 'appropriate location scope'
          advancedContext += ` Design for ${scopeDesc}.`
        }
        
        // Visual Style
        if (advancedSettings.visualStyle && advancedSettings.visualStyle !== 'realistic') {
          const visualStyleMap: Record<string, string> = {
            'stylized': 'stylized visual approach',
            'surreal': 'surreal/dreamlike visual style',
            'documentary': 'documentary-style realism'
          }
          const styleDesc = visualStyleMap[advancedSettings.visualStyle] || 'distinctive visual style'
          advancedContext += ` Aim for ${styleDesc}.`
        }
        
        // Humor Level
        if (advancedSettings.humorLevel) {
          const humorLevelMap: Record<string, string> = {
            'serious': 'serious tone with no humor',
            'occasional': 'occasional moments of levity',
            'dark-comedy': 'dark comedy elements',
            'full-comedy': 'full comedy throughout'
          }
          const humorDesc = humorLevelMap[advancedSettings.humorLevel] || 'balanced humor'
          advancedContext += ` Include ${humorDesc}.`
        }
        
        // Violence Level
        if (advancedSettings.violenceLevel) {
          const violenceLevelMap: Record<string, string> = {
            'none': 'no violence',
            'implied': 'implied/off-screen violence only',
            'moderate': 'moderate violence when necessary',
            'graphic': 'graphic violence when story demands'
          }
          const violenceDesc = violenceLevelMap[advancedSettings.violenceLevel] || 'appropriate violence levels'
          advancedContext += ` Feature ${violenceDesc}.`
        }
        
        // Build the enhanced synopsis
        let baseSynopsis = `${logline} The story follows ${protagonist}. ${stakes} The story is set in ${setting}. The overall vibe is ${vibe}, exploring themes of ${themeInput}.`
        
        // Add additional info if provided
        if (additionalInfo && additionalInfo.trim()) {
          baseSynopsis += ` Additional context: ${additionalInfo.trim()}.`
        }
        
        synopsis = `${baseSynopsis}${advancedContext}`
        
        // Override series title if provided
        if (advancedSettings.seriesTitle && advancedSettings.seriesTitle.trim()) {
          console.log(`📝 User-specified series title: "${advancedSettings.seriesTitle}"`)
        }
        
        // Store advanced settings for later use
        (requestData as any)._advancedSettings = advancedSettings
        
      } else {
        // Default synopsis without advanced settings
        let baseSynopsis = `${logline} The story follows ${protagonist}. ${stakes} The story is set in ${setting}. The overall vibe is ${vibe}, exploring themes of ${themeInput}.`
        
        // Add additional info if provided (even without advanced settings)
        if (additionalInfo && additionalInfo.trim()) {
          baseSynopsis += ` Additional context: ${additionalInfo.trim()}.`
        }
        
        synopsis = baseSynopsis
      }
      
      theme = themeInput
      
      console.log('✨ Using 6-Question Format:')
      console.log('📝 Logline:', logline)
      console.log('👤 Protagonist:', protagonist)
      console.log('⚡ Stakes:', stakes)
      console.log('🎭 Vibe:', vibe)
      console.log('🌍 Setting:', setting)
      console.log('🎯 Theme:', theme)
      console.log('📋 Additional Info:', additionalInfo ? `${additionalInfo.substring(0, 100)}...` : 'None')
      console.log('🔧 Advanced Settings:', useAdvancedSettings ? 'ENABLED' : 'Default')
    }
    // Handle legacy format
    else if (requestData.synopsis && requestData.theme) {
      synopsis = requestData.synopsis || synopsis
      theme = requestData.theme || theme
      console.log('📝 Using Legacy Format - Synopsis & Theme')
    }
    // Error if neither format is provided
    else {
      return NextResponse.json(
        { error: 'Either the 5 essential questions (logline, protagonist, stakes, vibe, theme) or legacy format (synopsis, theme) is required' },
        { status: 400 }
      )
    }
    
    // Extract generateImages and userId from requestData (may be in either format)
    const shouldGenerateImages = requestData.generateImages !== false // Default to true
    const requestUserId = requestData.userId || userId
    
    // Validate API key early to fail fast with clear error
    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim() // Trim whitespace
      console.log(`🔍 API Key Check: Length=${apiKey?.length}, Starts=${apiKey?.substring(0, 4)}, Ends=${apiKey?.slice(-4)}`)
      if (!apiKey || apiKey.length < 10) {
        return NextResponse.json(
          {
            error: 'GEMINI_API_KEY is not configured or invalid',
            details: 'Please configure GEMINI_API_KEY environment variable with a valid key.'
          },
          { status: 500 }
        )
      }
    } catch (keyError) {
      return NextResponse.json(
        {
          error: 'Failed to validate API key',
          details: keyError instanceof Error ? keyError.message : String(keyError)
        },
        { status: 500 }
      )
    }
    
    // Initialize logger with error handling
    try {
      logger.startNewSession('Story Bible Generation')
      logger.milestone(`Multi-Model AI: Intelligent Engine Routing`)
    } catch (loggerError) {
      console.warn('Logger initialization failed, continuing without logger:', loggerError)
    }
    
    // Construct base URL from request headers or use default
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const baseUrl = `${protocol}://${host}`
    
    // Initialize progress tracker with base URL
    const progressTracker = new EngineProgressTracker(baseUrl)
    
    // Start session tracking (always track progress)
    try {
      // First, set the session as active
      await fetch(`${baseUrl}/api/engine-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_session',
          session: {
            id: Date.now().toString(),
            isActive: true,
            currentPhase: 'Story Bible Generation',
            startTime: new Date().toISOString()
          }
        })
      })

      // Then seed the engine list to prevent premature completion
      const initialStatus = progressTracker.getStatus()
      
      await fetch(`${baseUrl}/api/engine-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_progress',
          progress: initialStatus
        })
      })
      
      // Start the first engine immediately to show progress
      await progressTracker.startEngine('premise')
      
      // Show initial progress
      progressTracker.updateProgress('premise', 10, 'Analyzing story foundation and thematic structure...')
      
    } catch (error) {
      console.error('❌ Failed to start session tracking:', error)
    }
    
    try {
      logger.startPhase({
        name: 'Story Bible Generation',
        totalSteps: 12,
        currentStep: 1,
        engines: ENGINE_CONFIGS.STORY_BIBLE.engines,
        overallProgress: 5
      })
    } catch (loggerError) {
      console.warn('Logger startPhase failed, continuing without logger:', loggerError)
    }
    
    console.log('🔄 USING REAL ENGINE-BASED GENERATION - All 12 engines active!')
    console.log('🎯 Real engines: Premise V2, Character V2, Narrative V2, World V2, Dialogue V2, Tension V2, Genre V2, Choice V2, Theme V2, Living World V2, Trope V2, Cohesion')
    
    let enhancedStoryBible
    
    try {
      // Get character information if provided
      const characterInfo = (requestData as any)._characterInfo || null
      
      // Extract user setting from request if available (for world building engine)
      const userSetting = requestData.setting || undefined
      
      // Extract protagonist from request (CRITICAL - must be included in characters)
      const protagonist = requestData.protagonist || undefined
      
      // Try real engine-based generation first
      enhancedStoryBible = await generateStoryBibleWithEngines(synopsis, theme, progressTracker, characterInfo, userSetting, protagonist)
      console.log('✅ REAL ENGINE GENERATION SUCCESSFUL!')
    } catch (engineError) {
      console.error('🚨 Engine-based generation failed, falling back to Gemini:', engineError)
      
      try {
        // Fallback to Gemini
        enhancedStoryBible = await generateStoryBibleWithGemini(synopsis, theme)
        console.log('✅ FALLBACK GENERATION SUCCESSFUL')
      } catch (fallbackError) {
        console.error('🆘 Using ultimate fallback - original generation system (using already parsed data)')
        console.error('Ultimate fallback also failed:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError))
        const engineMsg = engineError instanceof Error ? engineError.message : String(engineError);
        const fallbackMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        throw new Error(`All generation methods failed: ${engineMsg} | ${fallbackMsg}`)
      }
    }
    
    if (enhancedStoryBible) {
      const detectedStoryType = detectStoryType(synopsis, theme)
      
      // Check if user specified a custom series title via advanced settings
      const userSpecifiedTitle = requestData.useAdvancedSettings && 
        requestData.advancedSettings?.seriesTitle?.trim()
      
      if (userSpecifiedTitle) {
        enhancedStoryBible.seriesTitle = requestData.advancedSettings.seriesTitle.trim()
        console.log(`🎬 Using user-specified series title: "${enhancedStoryBible.seriesTitle}"`)
      } else {
        // Generate AI series title
      const finalTitle = await generateSeriesTitle(synopsis, theme, detectedStoryType)
      enhancedStoryBible.seriesTitle = finalTitle
      console.log(`🎬 Generated series title: "${finalTitle}"`)
      }
      
      enhancedStoryBible.murphyPillarProcessed = true
      enhancedStoryBible.processingSteps = enhancedStoryBible.processingSteps || ['real-ai-generation']
      enhancedStoryBible.murphyPillarStats = enhancedStoryBible.murphyPillarStats || {
        enginesActivated: ['Fallback System'],
        multiModelRouting: false,
        storyTypeDetected: detectedStoryType,
        charactersGenerated: enhancedStoryBible.mainCharacters?.length || 0,
        processingTime: Date.now()
      }
      
      // Store dialogue language setting from advanced settings
      if (requestData.useAdvancedSettings && requestData.advancedSettings?.dialogueLanguage) {
        enhancedStoryBible.dialogueLanguage = requestData.advancedSettings.dialogueLanguage
        console.log(`🗣️ Dialogue language set: "${enhancedStoryBible.dialogueLanguage}"`)
      } else {
        // Default to English if not specified
        enhancedStoryBible.dialogueLanguage = 'english'
      }
      
      // Store all generation settings for reference in episode generation
      if (requestData.useAdvancedSettings && requestData.advancedSettings) {
        enhancedStoryBible.generationSettings = {
          dialogueLanguage: requestData.advancedSettings.dialogueLanguage || 'english',
          tone: requestData.advancedSettings.tone,
          genre: requestData.advancedSettings.genre,
          matureThemes: requestData.advancedSettings.matureThemes,
          seriesLength: requestData.advancedSettings.seriesLength,
          povStyle: requestData.advancedSettings.povStyle
        }
      }
      
      console.log('✅ Story bible generation complete')

      // Mark session as complete (always update)
      try {
        const sessionId = Date.now().toString()
        await fetch(`${baseUrl}/api/engine-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'update_session',
            session: {
              id: sessionId,
              isActive: false,
              isComplete: true,
              currentPhase: 'Story Bible Generation',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Failed to mark session as complete:', error)
      }
    } else {
      console.log('⚠️ No story bible generated')
    }
    
    // Auto-generate images if requested and userId is provided
    if (enhancedStoryBible && shouldGenerateImages && requestUserId) {
      try {
        console.log('🎨 Auto-generating Story Bible images...')
        
        // Import the image generator
        const { generateStoryBibleImages } = await import('@/services/ai-generators/story-bible-image-generator')
        
        // Generate all images
        const bibleWithImages = await generateStoryBibleImages(
          enhancedStoryBible,
          requestUserId,
          {
            sections: ['hero', 'characters', 'arcs', 'world'],
            regenerate: false
          }
        )
        
        // Update the story bible with images
        enhancedStoryBible = bibleWithImages
        enhancedStoryBible.visualAssets = {
          ...enhancedStoryBible.visualAssets,
          generatedAt: new Date().toISOString()
        }
        
        console.log('✅ Story Bible images auto-generated successfully')
      } catch (imageError: any) {
        console.error('⚠️ Failed to auto-generate images:', imageError.message)
        // Don't fail the entire request if image generation fails
        // The story bible is still valid without images
      }
    }
    
    return NextResponse.json({ storyBible: enhancedStoryBible })
    
  } catch (error: any) {
    console.error('🚨 CRITICAL ERROR in story bible generation:', error.message)
    console.error('🔍 Error details:', error)
    
    return NextResponse.json(
      { 
        error: 'Story generation failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 
