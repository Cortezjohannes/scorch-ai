/**
 * 🧪 MODEL COMPARISON TEST
 * 
 * Tests GPT-4.1 vs Gemini 2.5 Pro for narrative prose generation
 * Helps determine which model produces better, more cohesive content
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateContent as generateWithGPT } from '@/services/azure-openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface TestScenario {
  title: string
  storyContext: string
  episodePrompt: string
  previousChoice?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario } = body
    
    console.log('🧪 MODEL COMPARISON TEST: Starting head-to-head comparison...')
    
    // Use provided scenario or default test scenario
    const testScenario: TestScenario = scenario || {
      title: "The Last Haven",
      storyContext: `
Series: "The Last Haven" - A post-apocalyptic drama about survivors in a walled city
Genre: Drama/Thriller
Tone: Dark but hopeful, character-driven
Main Character: Elena (30s), former engineer, pragmatic leader
Setting: New Seattle - a fortified city 20 years after societal collapse
Premise: In a world where trust is currency, survivors must decide between security and freedom.
      `,
      episodePrompt: `
Create Episode 3 of "The Last Haven" in narrative prose format.

SCENARIO:
Elena has just discovered that the water filtration system is failing - a crisis that could doom the city. She suspects sabotage but doesn't know who to trust. Her former partner Marcus offers help, but their past betrayal still haunts her. Meanwhile, the Council votes today on whether to exile "non-productive" citizens to conserve resources.

REQUIREMENTS:
- Write in engaging narrative prose (like reading a book, not a script)
- 2-3 scenes that flow naturally
- Rich character interiority showing Elena's thoughts and emotions
- Natural dialogue woven into the narrative
- Atmospheric descriptions that bring the world alive
- Build tension toward a difficult choice
- End with 3 branching options for viewer choice

CRITICAL: This should read like a compelling chapter from a novel, not a screenplay.
      `,
      previousChoice: "Elena chose to inspect the water system herself rather than send a team"
    }
    
    const startTime = Date.now()
    
    // Test both models in parallel
    console.log('🤖 Testing GPT-4.1...')
    const gptPromise = testGPT41(testScenario)
    
    console.log('🤖 Testing Gemini 2.5 Pro...')
    const geminiPromise = testGemini25(testScenario)
    
    const [gptResult, geminiResult] = await Promise.all([gptPromise, geminiPromise])
    
    const totalTime = Date.now() - startTime
    
    // Calculate comparison metrics
    const comparison = compareResults(gptResult, geminiResult)
    
    console.log('✅ MODEL COMPARISON TEST COMPLETE')
    console.log(`📊 Total test time: ${(totalTime / 1000).toFixed(1)}s`)
    
    return NextResponse.json({
      success: true,
      testScenario: {
        title: testScenario.title,
        context: testScenario.storyContext,
        prompt: testScenario.episodePrompt
      },
      results: {
        gpt41: gptResult,
        gemini25: geminiResult,
        comparison,
        totalTestTime: totalTime
      }
    })
    
  } catch (error) {
    console.error('❌ Model comparison test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function testGPT41(scenario: TestScenario) {
  const startTime = Date.now()
  
  const systemPrompt = `You are a master storyteller creating engaging narrative prose. You write like a novelist, not a screenwriter. Your prose is:
- Rich with sensory details and atmosphere
- Deep with character interiority and emotion
- Natural with dialogue woven into the narrative
- Compelling with tension and pacing
- Immersive, making readers feel present in the scene

You create episodes that are enjoyable to read and review, like chapters in a great book.`

  const prompt = `${scenario.storyContext}

${scenario.episodePrompt}

${scenario.previousChoice ? `PREVIOUS CHOICE: ${scenario.previousChoice}\n` : ''}

Return valid JSON in this exact format:
{
  "episodeNumber": 3,
  "title": "Episode Title",
  "synopsis": "Brief synopsis",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "content": "Full narrative prose content here. Multiple paragraphs of rich, novel-like storytelling..."
    }
  ],
  "episodeRundown": "Analysis of this episode",
  "branchingOptions": [
    {
      "id": 1,
      "text": "Choice 1 based on episode events",
      "description": "Consequences",
      "isCanonical": false
    },
    {
      "id": 2,
      "text": "Choice 2 based on episode events",
      "description": "Consequences",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "Choice 3 based on episode events",
      "description": "Consequences",
      "isCanonical": false
    }
  ]
}`

  try {
    const content = await generateWithGPT(prompt, {
      systemPrompt,
      temperature: 0.9,
      maxTokens: 6000,
      model: 'gpt-4.1' as any
    })
    
    const generationTime = Date.now() - startTime
    
    // Parse and analyze
    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        throw new Error('Failed to parse JSON response')
      }
    }
    
    // Calculate metrics
    const metrics = calculateMetrics(parsed, content)
    
    return {
      modelName: 'GPT-4.1 (Azure OpenAI)',
      generationTime,
      success: true,
      content: parsed,
      rawOutput: content,
      metrics,
      error: null
    }
    
  } catch (error) {
    const generationTime = Date.now() - startTime
    return {
      modelName: 'GPT-4.1 (Azure OpenAI)',
      generationTime,
      success: false,
      content: null,
      rawOutput: null,
      metrics: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testGemini25(scenario: TestScenario) {
  const startTime = Date.now()
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 8000,
      responseMimeType: 'application/json'
    }
  })
  
  const systemPrompt = `You are a master storyteller creating engaging narrative prose. You write like a novelist, not a screenwriter. Your prose is:
- Rich with sensory details and atmosphere
- Deep with character interiority and emotion
- Natural with dialogue woven into the narrative
- Compelling with tension and pacing
- Immersive, making readers feel present in the scene

You create episodes that are enjoyable to read and review, like chapters in a great book.`

  const prompt = `${systemPrompt}

${scenario.storyContext}

${scenario.episodePrompt}

${scenario.previousChoice ? `PREVIOUS CHOICE: ${scenario.previousChoice}\n` : ''}

Return valid JSON in this exact format:
{
  "episodeNumber": 3,
  "title": "Episode Title",
  "synopsis": "Brief synopsis",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "content": "Full narrative prose content here. Multiple paragraphs of rich, novel-like storytelling..."
    }
  ],
  "episodeRundown": "Analysis of this episode",
  "branchingOptions": [
    {
      "id": 1,
      "text": "Choice 1 based on episode events",
      "description": "Consequences",
      "isCanonical": false
    },
    {
      "id": 2,
      "text": "Choice 2 based on episode events",
      "description": "Consequences",
      "isCanonical": true
    },
    {
      "id": 3,
      "text": "Choice 3 based on episode events",
      "description": "Consequences",
      "isCanonical": false
    }
  ]
}`

  try {
    const result = await model.generateContent(prompt)
    const content = result.response.text()
    
    const generationTime = Date.now() - startTime
    
    // Parse and analyze
    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        throw new Error('Failed to parse JSON response')
      }
    }
    
    // Calculate metrics
    const metrics = calculateMetrics(parsed, content)
    
    return {
      modelName: 'Gemini 2.5 Pro (Google)',
      generationTime,
      success: true,
      content: parsed,
      rawOutput: content,
      metrics,
      error: null
    }
    
  } catch (error) {
    const generationTime = Date.now() - startTime
    return {
      modelName: 'Gemini 2.5 Pro (Google)',
      generationTime,
      success: false,
      content: null,
      rawOutput: null,
      metrics: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function calculateMetrics(parsed: any, rawOutput: string) {
  const sceneCount = parsed.scenes?.length || 0
  const totalWords = parsed.scenes?.reduce((acc: number, scene: any) => {
    return acc + (scene.content?.split(/\s+/).length || 0)
  }, 0) || 0
  
  const avgWordsPerScene = sceneCount > 0 ? Math.round(totalWords / sceneCount) : 0
  
  // Analyze prose quality indicators
  const allSceneContent = parsed.scenes?.map((s: any) => s.content).join(' ') || ''
  
  const dialogueCount = (allSceneContent.match(/[""].*?[""]|".*?"/g) || []).length
  const paragraphCount = (allSceneContent.match(/\n\n/g) || []).length + 1
  
  // Check for narrative prose vs script format
  const hasScriptFormatting = /INT\.|EXT\.|FADE IN|FADE OUT|CUT TO/i.test(allSceneContent)
  const hasActionLines = /\n[A-Z\s]+\n/g.test(allSceneContent)
  
  return {
    sceneCount,
    totalWords,
    avgWordsPerScene,
    dialogueCount,
    paragraphCount,
    avgWordsPerParagraph: Math.round(totalWords / paragraphCount),
    hasScriptFormatting,
    hasActionLines,
    branchingOptionsCount: parsed.branchingOptions?.length || 0,
    characterLength: rawOutput.length
  }
}

function compareResults(gpt: any, gemini: any) {
  if (!gpt.success || !gemini.success) {
    return {
      winner: null,
      reason: 'One or both models failed to generate content',
      gptSuccess: gpt.success,
      geminiSuccess: gemini.success
    }
  }
  
  const comparison = {
    speed: {
      gpt41Time: gpt.generationTime,
      gemini25Time: gemini.generationTime,
      faster: gpt.generationTime < gemini.generationTime ? 'GPT-4.1' : 'Gemini 2.5',
      speedDifference: Math.abs(gpt.generationTime - gemini.generationTime),
      speedDifferencePercent: Math.round(
        (Math.abs(gpt.generationTime - gemini.generationTime) / 
        Math.max(gpt.generationTime, gemini.generationTime)) * 100
      )
    },
    
    contentLength: {
      gpt41Words: gpt.metrics.totalWords,
      gemini25Words: gemini.metrics.totalWords,
      longer: gpt.metrics.totalWords > gemini.metrics.totalWords ? 'GPT-4.1' : 'Gemini 2.5',
      lengthDifference: Math.abs(gpt.metrics.totalWords - gemini.metrics.totalWords)
    },
    
    structure: {
      gpt41Scenes: gpt.metrics.sceneCount,
      gemini25Scenes: gemini.metrics.sceneCount,
      gpt41AvgWordsPerScene: gpt.metrics.avgWordsPerScene,
      gemini25AvgWordsPerScene: gemini.metrics.avgWordsPerScene
    },
    
    proseQuality: {
      gpt41DialogueCount: gpt.metrics.dialogueCount,
      gemini25DialogueCount: gemini.metrics.dialogueCount,
      gpt41ParagraphCount: gpt.metrics.paragraphCount,
      gemini25ParagraphCount: gemini.metrics.paragraphCount,
      gpt41AvgWordsPerParagraph: gpt.metrics.avgWordsPerParagraph,
      gemini25AvgWordsPerParagraph: gemini.metrics.avgWordsPerParagraph,
      gpt41HasScriptFormat: gpt.metrics.hasScriptFormatting,
      gemini25HasScriptFormat: gemini.metrics.hasScriptFormatting
    },
    
    qualityScore: {
      gpt41: calculateQualityScore(gpt.metrics),
      gemini25: calculateQualityScore(gemini.metrics),
      winner: null as string | null
    }
  }
  
  // Determine overall winner
  comparison.qualityScore.winner = 
    comparison.qualityScore.gpt41 > comparison.qualityScore.gemini25 
      ? 'GPT-4.1' 
      : comparison.qualityScore.gemini25 > comparison.qualityScore.gpt41
        ? 'Gemini 2.5'
        : 'Tie'
  
  return comparison
}

function calculateQualityScore(metrics: any): number {
  let score = 0
  
  // Word count (prefer 800-1500 words per episode)
  if (metrics.totalWords >= 800 && metrics.totalWords <= 1500) score += 30
  else if (metrics.totalWords >= 600) score += 20
  else score += 10
  
  // Scene count (prefer 2-3 scenes)
  if (metrics.sceneCount >= 2 && metrics.sceneCount <= 3) score += 20
  else if (metrics.sceneCount > 0) score += 10
  
  // Paragraph structure (prefer 150-300 words per paragraph)
  if (metrics.avgWordsPerParagraph >= 150 && metrics.avgWordsPerParagraph <= 300) score += 20
  else if (metrics.avgWordsPerParagraph >= 100) score += 15
  else score += 5
  
  // Dialogue balance (prefer 5-15 dialogue instances)
  if (metrics.dialogueCount >= 5 && metrics.dialogueCount <= 15) score += 15
  else if (metrics.dialogueCount > 0) score += 10
  
  // Penalize script formatting (we want prose!)
  if (metrics.hasScriptFormatting) score -= 20
  if (metrics.hasActionLines) score -= 10
  
  // Valid branching options
  if (metrics.branchingOptionsCount === 3) score += 15
  
  return score
}








