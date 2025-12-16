/**
 * Equipment Generator - AI Service
 * Generates equipment suggestions based on script, breakdown, and questionnaire answers
 * Prioritizes owned/borrowed gear; aligns with micro-budget constraints
 */

import { EngineAIRouter } from '@/services/engine-ai-router'
import type { ScriptBreakdownData, EquipmentData, EquipmentItem } from '@/types/preproduction'

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: any[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
  }
}

interface EquipmentGenerationParams {
  scriptData: GeneratedScript
  breakdownData: ScriptBreakdownData
  storyBible: any
  episodeNumber: number
  episodeTitle: string
  questionnaireAnswers?: Record<string, any>
}

export async function generateEquipment(params: EquipmentGenerationParams): Promise<EquipmentData> {
  const { scriptData, breakdownData, storyBible, episodeNumber, episodeTitle, questionnaireAnswers } = params

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(scriptData, breakdownData, storyBible, episodeTitle, questionnaireAnswers)

  const response = await EngineAIRouter.generateContent({
    prompt: userPrompt,
    systemPrompt,
    temperature: 0.35,
    maxTokens: 4000,
    engineId: 'equipment-generator',
    forceProvider: 'gemini'
  })

  return parseEquipment(response.content, episodeNumber, episodeTitle)
}

function buildSystemPrompt(): string {
  return `You are a cinematography advisor assembling a bare-minimum equipment package for a 5-minute, ultra-micro-budget web series episode ($1k-$20k total series budget).

STRICT RULES:
1) Extract needs from the script context only (dialogue scenes, day/night, INT/EXT). No invention.
2) Prioritize: owned > borrow > rent. Avoid unnecessary gear.
3) Keep per-episode rentals under $30-$200 total unless clearly required.
4) Audio is critical: lav or shotgun for dialogue, wind protection for EXT.
5) Lighting: only if needed (night/INT dark). Prefer practicals and small LED kits.
6) Camera: assume 1 body; phone camera acceptable. List support only if required.

CATEGORIES: camera, lens, lighting, audio, grip, other.
Each item: { name, description, ownership: owned|renting|borrowing, costPerDay?, totalCost, quantity, status, notes }.`
}

function buildUserPrompt(
  scriptData: GeneratedScript,
  breakdownData: ScriptBreakdownData,
  storyBible: any,
  episodeTitle: string,
  questionnaireAnswers?: Record<string, any>
): string {
  let prompt = `Generate a minimal equipment package for episode ${episodeTitle}.\n\n`
  
  // CORE story context
  if (storyBible?.seriesOverview) {
    prompt += `Series Overview: ${storyBible.seriesOverview}\n`
  }
  prompt += `Genre: ${storyBible?.genre || 'Drama'}\n`
  if (storyBible?.worldBuilding?.setting) {
    prompt += `World Setting: ${storyBible.worldBuilding.setting}\n`
  }
  prompt += `\nScenes: ${breakdownData.scenes.length}\n`
  const ints = breakdownData.scenes.filter(s => (s.location||'').includes('INT')).length
  const exts = breakdownData.scenes.length - ints
  const nights = breakdownData.scenes.filter(s => (s.timeOfDay||'').toUpperCase().includes('NIGHT')).length
  prompt += `INT: ${ints}, EXT: ${exts}, NIGHT: ${nights}\n\n`

  if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
    prompt += `QUESTIONNAIRE HIGHLIGHTS:\n`
    Object.entries(questionnaireAnswers).slice(0,8).forEach(([k,v]) => {
      prompt += `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}\n`
    })
    prompt += `\n`
  }

  prompt += `OUTPUT JSON:\n{
  "camera": [ { "name":"", "description":"", "ownership":"owned|renting|borrowing", "quantity":1, "costPerDay":0, "totalCost":0, "status":"needed", "notes":"" } ],
  "lens": [],
  "lighting": [],
  "audio": [],
  "grip": [],
  "other": []
}\n\n`
  prompt += `CONSTRAINTS:\n- Keep totalCost minimal; prefer owned/borrowed.\n- Include audio for dialogue, wind protection for EXT.\n- Include lighting only if INT/NIGHT or dark.\n- One camera body is enough.\n- Avoid cinema rentals unless essential.`
  return prompt
}

function parseEquipment(content: string, episodeNumber: number, episodeTitle: string): EquipmentData {
  let cleaned = content.trim()
  if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\w*\n?/, '').replace(/```\s*$/, '')
  const parsed = JSON.parse(cleaned)

  const normalize = (arr: any[] | undefined, category: EquipmentItem['category']): EquipmentItem[] => {
    if (!Array.isArray(arr)) return []
    return arr.map((it: any, idx: number) => ({
      id: `${category}_${Date.now()}_${idx}`,
      category,
      name: it.name || `Item ${idx+1}`,
      description: it.description || '',
      ownership: it.ownership === 'owned' || it.ownership === 'borrowing' || it.ownership === 'renting' ? it.ownership : 'borrowing',
      costPerDay: typeof it.costPerDay === 'number' ? it.costPerDay : undefined,
      totalCost: typeof it.totalCost === 'number' ? it.totalCost : 0,
      vendor: it.vendor,
      pickupDate: it.pickupDate,
      returnDate: it.returnDate,
      responsiblePerson: it.responsiblePerson,
      status: it.status || 'needed',
      quantity: typeof it.quantity === 'number' ? it.quantity : 1,
      notes: it.notes || '',
      comments: []
    }))
  }

  const camera = normalize(parsed.camera, 'camera')
  const lens = normalize(parsed.lens, 'lens')
  const lighting = normalize(parsed.lighting, 'lighting')
  const audio = normalize(parsed.audio, 'audio')
  const grip = normalize(parsed.grip, 'grip')
  const other = normalize(parsed.other, 'other')

  const all = [...camera, ...lens, ...lighting, ...audio, ...grip, ...other]
  const totalCost = all.reduce((s,i)=> s + (i.totalCost||0), 0)
  const obtainedItems = all.filter(i => i.status === 'obtained' || i.status === 'returned').length

  return {
    episodeNumber,
    episodeTitle,
    totalItems: all.length,
    obtainedItems,
    totalCost,
    camera,
    lens,
    lighting,
    audio,
    grip,
    other,
    lastUpdated: Date.now(),
    updatedBy: 'system'
  }
}

