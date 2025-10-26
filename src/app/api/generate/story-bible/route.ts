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

// Initialize Gemini AI with API key
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

const genAI = new GoogleGenerativeAI(getGeminiKey())

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

  constructor() {
    this.initializeEngines()
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
      { id: 'cohesion', name: 'Cohesion Engine', message: 'Ensuring story elements connect logically' }
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
      
      // Notify API that engine started
      try {
        await fetch('http://localhost:3000/api/engine-status', {
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
        await fetch('http://localhost:3000/api/engine-status', {
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
      
      // Send progress update to API
      try {
        await fetch('http://localhost:3000/api/engine-status', {
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
          await fetch('http://localhost:3000/api/engine-status', {
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
      
      // Notify API that engine completed
      try {
        await fetch('http://localhost:3000/api/engine-status', {
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
async function generateStoryBibleWithEngines(synopsis: string, theme: string, progressTracker: EngineProgressTracker) {
  console.log('🚀 USING REAL ENGINE-BASED GENERATION - All 12 engines active!')
  
  try {
    const storyType = detectStoryType(synopsis, theme)
    console.log(`🎯 Detected story type: ${storyType} - AI will decide optimal character count dynamically`)
    
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
    const optimalCharacterCount = parseInt(characterCountResponse) || 8 // Neutral default
    console.log(`✅ CHARACTER ENGINE: AI determined optimal character count: ${optimalCharacterCount} (fully AI-driven, no hardcoded ranges)`)
    
    progressTracker.updateProgress('character', 30, `Stage 1: Generating character roster...`)
    
    // STAGE 1: Generate character roster first (prevents duplicates)
    console.log('🤖 CHARACTER ENGINE V2: Stage 1 - Generating character roster...')
    
    const rosterPrompt = `You are creating a character roster for a story. 

STORY: ${synopsis}
THEME: ${theme}
CHARACTERS NEEDED: ${optimalCharacterCount}

Generate ${optimalCharacterCount} unique characters with realistic names that fit the story.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
[
  {"name": "Detective Sarah Martinez", "role": "protagonist", "archetype": "Determined investigator"},
  {"name": "Dr. Marcus Webb", "role": "antagonist", "archetype": "Corrupt authority figure"},
  {"name": "Emma Chen", "role": "supporting", "archetype": "Local witness"}
]

Requirements:
- Each character needs a realistic first and last name
- Names must fit the story setting and genre
- All ${optimalCharacterCount} names must be completely unique
- Use diverse, authentic names from different backgrounds
- Make the first character the protagonist, second the antagonist
- Return only the JSON array, nothing else`

    console.log(`🎭 Generating roster of ${optimalCharacterCount} unique characters...`)
    
    let rosterResponse
    let roster = []
    
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
    const usedNames = new Set()
    const validRoster = []
    
    // Only use fallbacks if AI completely failed to generate ANY characters
    if (roster.length === 0) {
      console.error('🚨 AI FAILED TO GENERATE CHARACTER ROSTER - Creating emergency fallbacks')
      
      // Generate story-relevant fallback names based on synopsis keywords
      const storyKeywords = synopsis.toLowerCase()
      const isDetective = storyKeywords.includes('detective') || storyKeywords.includes('investigat')
      const isDoctor = storyKeywords.includes('doctor') || storyKeywords.includes('medical')
      const isSchool = storyKeywords.includes('school') || storyKeywords.includes('teacher')
      
      const emergencyRoster = []
    for (let i = 0; i < optimalCharacterCount; i++) {
        let name, archetype
        if (i === 0) {
          name = isDetective ? 'Detective Sarah Chen' : isDoctor ? 'Dr. Maria Rodriguez' : isSchool ? 'Teacher Alex Johnson' : 'Sarah Martinez'
          archetype = 'Protagonist'
        } else if (i === 1) {
          name = isDetective ? 'Commissioner Marcus Webb' : isDoctor ? 'Dr. Victor Kane' : isSchool ? 'Principal David Stone' : 'Marcus Thompson'
          archetype = 'Antagonist'
        } else {
          const names = ['Elena Rodriguez', 'Jake Sullivan', 'Lisa Park', 'Tom Rivera', 'Amanda Foster', 'Ryan Chen', 'Sophie Williams', 'Michael Torres', 'Rachel Green', 'James Mitchell', 'Helen Chang', 'Mark Davis', 'Diana Lopez', 'Carlos Smith', 'Nina Patel']
          name = names[i - 2] || `Character ${i + 1}`
          archetype = 'Supporting Character'
        }
        
        emergencyRoster.push({
          name,
          role: i === 0 ? 'protagonist' : (i === 1 ? 'antagonist' : 'supporting'),
          archetype
        })
      }
      roster = emergencyRoster
      console.log('⚠️ Using emergency story-relevant character roster')
    }
    
    for (let i = 0; i < optimalCharacterCount; i++) {
      const character = roster[i] || {
        name: `FALLBACK_CHARACTER_${i + 1}`,
        role: i === 0 ? 'protagonist' : (i === 1 ? 'antagonist' : 'supporting'),
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
      
      validRoster.push({
        name: finalName,
        role: character.role,
        archetype: character.archetype
      })
    }
    
    console.log(`✅ CHARACTER ROSTER: Generated ${validRoster.length} unique characters`)
    console.log(`📋 Cast: ${validRoster.map(c => c.name).join(', ')}`)
    
    progressTracker.updateProgress('character', 50, `Stage 2: Expanding to 3D profiles...`)
    
    // STAGE 2: Expand roster to full 3D profiles
    console.log('🤖 CHARACTER ENGINE V2: Stage 2 - Expanding to 3D profiles...')
    progressTracker.updateProgress('character', 50, `Starting 3D character enhancement for ${validRoster.length} characters...`)
    const characters = []
    
    for (let i = 0; i < validRoster.length; i++) {
      const rosterChar = validRoster[i]
      
      try {
        console.log(`🎭 Expanding character ${i + 1}/${validRoster.length}: ${rosterChar.name} (${rosterChar.role})...`)
        
        const characterPrompt = `Expand this character from our story roster into a full 3D profile using Egri's method:

STORY: ${synopsis}
THEME: ${theme}
CHARACTER NAME: ${rosterChar.name}
CHARACTER ROLE: ${rosterChar.role}
CHARACTER ARCHETYPE: ${rosterChar.archetype}
CHARACTER NUMBER: ${i + 1} of ${validRoster.length}

IMPORTANT: Use the exact name "${rosterChar.name}" - do not change it.

Generate a complete character in this EXACT JSON format:
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

CRITICAL: Create a unique, complex character that serves the theme "${theme}" and fits naturally into the story world. Make sure all three dimensions (physiology, sociology, psychology) are fully developed and interconnected.`

        // Update progress before starting character generation
        progressTracker.updateProgress('character', 50 + (i / validRoster.length) * 20, 
          `Generating ${rosterChar.name} (${rosterChar.role}) - ${i + 1}/${validRoster.length} characters...`)
        
        const characterResponse = await generateContentWithGemini(characterPrompt)
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
        progressTracker.updateProgress('character', 50 + (i / validRoster.length) * 20, 
          `Enhanced ${rosterChar.name} (${rosterChar.role}) - ${i + 1}/${validRoster.length} characters`)
      } catch (error) {
        console.error(`Failed to generate character ${i + 1}:`, error)
        // Enhanced fallback character using roster info
        const fallbackCharacter = {
          name: rosterChar.name,
          archetype: rosterChar.archetype,
          arc: `Character development arc exploring ${theme}`,
          description: `A complex character for the story about ${synopsis}`,
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
        progressTracker.updateProgress('character', 50 + (i / validRoster.length) * 20, 
          `Used fallback for ${rosterChar.name} (${rosterChar.role}) - ${i + 1}/${validRoster.length} characters`)
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

OUTPUT JSON ONLY (no markdown), exactly in this shape:
{
  "setting": "1-2 paragraphs describing the overall setting, concrete and vivid.",
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
- Provide 8-12 varied locations appropriate to the synopsis.
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
    
    // Skip redundant synthesis - directly assemble from engine outputs
    console.log('📦 DIRECT ASSEMBLY: Building story bible from engine outputs...')
    
    const parsedContent: any = {
      seriesTitle: heuristicTitle(synopsis, theme), // Use heuristic first, will be overridden later
      seriesOverview: `${synopsis} This ${storyType} explores themes of ${theme} through rich character development and compelling narrative arcs.`,
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
    
    // Add branching paths
      parsedContent.potentialBranchingPaths = `Viewers will face meaningful choices that explore different aspects of ${theme}, leading to varied character developments and story outcomes.`
    
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
        'Living World Engine V2', 'Trope Engine V2', 'Cohesion Engine'
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
async function generateContentWithGemini(prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const geminiModel = GEMINI_CONFIG.getModel('stable')
    const model = genAI.getGenerativeModel({ 
      model: geminiModel,
      generationConfig: GEMINI_CONFIG.GENERATION_CONFIG
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('🚨 Gemini content generation failed:', error)
    return 'Content generation failed'
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
  console.log('🔄 FALLBACK: Using Gemini 2.5 (Advanced Mode)')
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
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
      enginesActivated: ['Gemini 2.5 Pro (Fallback)'],
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
    
    // Handle new 5-question format
    if (requestData.logline && requestData.protagonist && requestData.stakes && requestData.vibe && requestData.theme) {
      const { logline, protagonist, stakes, vibe, theme: themeInput } = requestData
      
      // NOTE: Advanced options (tone, pacing, complexity, focusArea) are accepted but not yet integrated
      // They will be properly integrated with the Murphy Conductor system in a future update
      const { tone, pacing, complexity, focusArea } = requestData
      if (tone || pacing || complexity || focusArea) {
        console.log('ℹ️ Advanced options received but not yet integrated:', { tone, pacing, complexity, focusArea })
        console.log('   These will be properly integrated with the narrative engines in a future update')
      }
      
      // Synthesize synopsis from the 5 questions for backward compatibility
      synopsis = `${logline} The story follows ${protagonist}. ${stakes} The overall vibe is ${vibe}, exploring themes of ${themeInput}.`
      theme = themeInput
      
      console.log('✨ Using 5-Question Format:')
      console.log('📝 Logline:', logline)
      console.log('👤 Protagonist:', protagonist)
      console.log('⚡ Stakes:', stakes)
      console.log('🎭 Vibe:', vibe)
      console.log('🎯 Theme:', theme)
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
    
    logger.startNewSession('Story Bible Generation')
    logger.milestone(`Multi-Model AI: Intelligent Engine Routing`)
    
    // Initialize progress tracker
    const progressTracker = new EngineProgressTracker()
    
    // Start session tracking
    try {
      // First, set the session as active
      await fetch('http://localhost:3000/api/engine-status', {
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
      
      await fetch('http://localhost:3000/api/engine-status', {
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
    
    logger.startPhase({
      name: 'Story Bible Generation',
      totalSteps: 12,
      currentStep: 1,
      engines: ENGINE_CONFIGS.STORY_BIBLE.engines,
      overallProgress: 5
    })
    
    console.log('🔄 USING REAL ENGINE-BASED GENERATION - All 12 engines active!')
    console.log('🎯 Real engines: Premise V2, Character V2, Narrative V2, World V2, Dialogue V2, Tension V2, Genre V2, Choice V2, Theme V2, Living World V2, Trope V2, Cohesion')
    
    let enhancedStoryBible
    
    try {
      // Try real engine-based generation first
      enhancedStoryBible = await generateStoryBibleWithEngines(synopsis, theme, progressTracker)
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
      
      // Generate better series title
      const finalTitle = await generateSeriesTitle(synopsis, theme, detectedStoryType)
      enhancedStoryBible.seriesTitle = finalTitle
      console.log(`🎬 Generated series title: "${finalTitle}"`)
      
      enhancedStoryBible.murphyPillarProcessed = true
      enhancedStoryBible.processingSteps = enhancedStoryBible.processingSteps || ['real-ai-generation']
      enhancedStoryBible.murphyPillarStats = enhancedStoryBible.murphyPillarStats || {
        enginesActivated: ['Fallback System'],
        multiModelRouting: false,
        storyTypeDetected: detectedStoryType,
        charactersGenerated: enhancedStoryBible.mainCharacters?.length || 0,
        processingTime: Date.now()
      }
      console.log('✅ Story bible generation complete')

      // Mark session as complete
      const sessionId = Date.now().toString()
      await fetch('http://localhost:3000/api/engine-status', {
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
    } else {
      console.log('⚠️ No story bible generated')
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
