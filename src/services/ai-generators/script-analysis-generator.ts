import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptAnalysisData, ScriptAnalysisScene } from '@/types/preproduction'

const ANALYSIS_SCHEMA_VERSION = 'v1'

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: ScriptPage[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
    generatedAt: number
  }
}

interface ScriptPage {
  pageNumber: number
  elements: ScriptElement[]
}

interface ScriptElement {
  type: 'slug' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'page-break'
  content: string
  metadata?: {
    sceneNumber?: number
    characterName?: string
  }
}

interface AnalysisParams {
  script: GeneratedScript
  storyBible: any
  episodeNumber: number
  episodeTitle: string
}

export async function generateScriptAnalysis(params: AnalysisParams): Promise<ScriptAnalysisData> {
  const { script, storyBible, episodeNumber, episodeTitle } = params

  const scriptScenes = parseScriptToScenes(script)
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(script, storyBible, scriptScenes)

  const response = await EngineAIRouter.generateContent({
    prompt: userPrompt,
    systemPrompt,
    temperature: 0.4,
    maxTokens: 7000,
    engineId: 'script-analysis-generator',
    forceProvider: 'gemini'
  })

  const structured = structureAnalysisData(response.content, episodeNumber, episodeTitle)
  return structured
}

function parseScriptToScenes(script: GeneratedScript): Array<{
  sceneNumber: number
  heading: string
  content: string
}> {
  const scenes: Array<{
    sceneNumber: number
    heading: string
    content: string
  }> = []

  let currentScene: any = null
  let sceneContent: string[] = []

  for (const page of script.pages) {
    for (const element of page.elements) {
      if (element.type === 'slug' && element.metadata?.sceneNumber) {
        if (currentScene) {
          currentScene.content = sceneContent.join('\n')
          scenes.push(currentScene)
        }

        currentScene = {
          sceneNumber: element.metadata.sceneNumber,
          heading: element.content,
          content: ''
        }
        sceneContent = [element.content]
      } else if (currentScene) {
        if (element.content.trim()) {
          sceneContent.push(element.content)
        }
      }
    }
  }

  if (currentScene) {
    currentScene.content = sceneContent.join('\n')
    scenes.push(currentScene)
  }

  return scenes
}

function buildSystemPrompt(): string {
  return `You are a professional story analyst for short-form, ultra-micro-budget web series.

GOALS:
- Analyze each scene for plot relevance, character arcs, stakes, pacing, themes, and hooks.
- Extract ONLY from the provided script text; do not invent events or characters.
- Keep answers concise and immediately usable for writers, marketing, and production.

OUTPUT:
- Valid JSON matching the user schema.
- Keep marketing hooks succinct (<=120 chars) when present.
- Use arrays for arcs, themes, foreshadowing, questions.`
}

function buildUserPrompt(
  script: GeneratedScript,
  storyBible: any,
  scriptScenes: Array<{ sceneNumber: number; heading: string; content: string }>
): string {
  let prompt = `Analyze this screenplay scene-by-scene. Return JSON only.\n\n`
  prompt += `**SERIES CONTEXT (CORE):**\n`
  prompt += `Series: ${storyBible.seriesTitle || storyBible.title || 'Untitled'}\n`
  if (storyBible.seriesOverview) {
    prompt += `Series Overview: ${storyBible.seriesOverview}\n`
  }
  prompt += `Genre: ${storyBible.genre || 'Drama'}\n`
  if (storyBible.worldBuilding?.setting) {
    prompt += `World Setting: ${storyBible.worldBuilding.setting}\n`
  }
  if (storyBible.themes) {
    const themesList = Array.isArray(storyBible.themes) ? storyBible.themes.join(', ') : storyBible.themes
    prompt += `Core Themes: ${themesList}\n`
  }
  prompt += `\n**EPISODE:**\n`
  prompt += `Episode: ${script.episodeNumber} - ${script.title}\n`
  prompt += `Length: ${script.metadata.pageCount} pages, ${script.metadata.sceneCount} scenes\n\n`

  prompt += `SCENES:\n`
  scriptScenes.forEach((scene) => {
    prompt += `Scene ${scene.sceneNumber}: ${scene.heading}\n`
    prompt += `Content:\n${scene.content.substring(0, 900)}${scene.content.length > 900 ? '...' : ''}\n\n`
  })

  prompt += `TASKS:\n`
  prompt += `For each scene, provide:\n`
  prompt += `- sceneNumber, sceneTitle, location (from slug), timeOfDay (DAY/NIGHT/SUNRISE/SUNSET/MAGIC_HOUR)\n`
  prompt += `- summary (2 sentences), relevanceToPlot (1-2 sentences)\n`
  prompt += `- characterArcsAffected (array of character names and arc beats)\n`
  prompt += `- emotionalTone (single word or short phrase)\n`
  prompt += `- pacingRole: one of setup | complication | climax | denouement | bridge\n`
  prompt += `- stakesSummary (1 sentence)\n`
  prompt += `- foreshadowingOrCallBacks (array)\n`
  prompt += `- openQuestions (array)\n`
  prompt += `- continuityDependencies (array: what must be consistent before/after)\n`
  prompt += `- keyPropsAndSymbols (array)\n`
  prompt += `- themeTieIn (short phrase)\n`
  prompt += `- audienceTakeaway (1 sentence)\n`
  prompt += `- marketingHook (<=120 chars, optional)\n\n`

  prompt += `GLOBAL: Also provide beatSheet (ordered scene beats), arcProgressions (per main character), and themesHeatmap (theme -> scenes).\n\n`

  prompt += `OUTPUT FORMAT (JSON):\n`
  prompt += `{\n`
  prompt += `  "scenes": [ { ...sceneObject } ],\n`
  prompt += `  "synopsis": "Episode summary (3-5 sentences)",\n`
  prompt += `  "beatSheet": ["Beat 1", "Beat 2"],\n`
  prompt += `  "arcProgressions": [{"character": "Name", "arc": "short description", "keyMoments": ["Beat"]}],\n`
  prompt += `  "themesHeatmap": [{"theme": "Trust", "scenes": [1,2]}]\n`
  prompt += `}\n`

  prompt += `CRITICAL:\n`
  prompt += `- Extract only from script content provided.\n`
  prompt += `- Keep it concise and specific.\n`
  prompt += `- Valid JSON only, no markdown, no comments.`

  return prompt
}

function structureAnalysisData(aiResponse: string, episodeNumber: number, episodeTitle: string): ScriptAnalysisData {
  let cleaned = aiResponse.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')

  const parsed = JSON.parse(cleaned)
  const scenes: ScriptAnalysisScene[] = (parsed.scenes || []).map((scene: any) => ({
    sceneNumber: scene.sceneNumber || 0,
    sceneTitle: scene.sceneTitle || 'Untitled Scene',
    location: scene.location || '',
    timeOfDay: validateTimeOfDay(scene.timeOfDay),
    summary: scene.summary || '',
    relevanceToPlot: scene.relevanceToPlot || '',
    characterArcsAffected: scene.characterArcsAffected || [],
    emotionalTone: scene.emotionalTone || '',
    pacingRole: validatePacingRole(scene.pacingRole),
    stakesSummary: scene.stakesSummary || '',
    foreshadowingOrCallBacks: scene.foreshadowingOrCallBacks || [],
    openQuestions: scene.openQuestions || [],
    continuityDependencies: scene.continuityDependencies || [],
    keyPropsAndSymbols: scene.keyPropsAndSymbols || [],
    themeTieIn: scene.themeTieIn || '',
    audienceTakeaway: scene.audienceTakeaway || '',
    marketingHook: scene.marketingHook || ''
  }))

  return {
    episodeNumber,
    episodeTitle,
    synopsis: parsed.synopsis || '',
    scenes,
    beatSheet: parsed.beatSheet || [],
    arcProgressions: parsed.arcProgressions || [],
    themesHeatmap: parsed.themesHeatmap || [],
    lastUpdated: Date.now(),
    updatedBy: 'ai-generator',
    schemaVersion: ANALYSIS_SCHEMA_VERSION
  }
}

function validateTimeOfDay(value: any): 'DAY' | 'NIGHT' | 'SUNRISE' | 'SUNSET' | 'MAGIC_HOUR' {
  const valid = ['DAY', 'NIGHT', 'SUNRISE', 'SUNSET', 'MAGIC_HOUR']
  const upper = String(value || '').toUpperCase()
  return valid.includes(upper) ? (upper as any) : 'DAY'
}

function validatePacingRole(value: any): 'setup' | 'complication' | 'climax' | 'denouement' | 'bridge' {
  const valid = ['setup', 'complication', 'climax', 'denouement', 'bridge']
  const lower = String(value || '').toLowerCase()
  return valid.includes(lower) ? (lower as any) : 'setup'
}

