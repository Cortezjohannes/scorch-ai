/**
 * 🎯 ENGINE AI ROUTER - INTELLIGENT API SELECTION
 * Routes engines to the optimal AI provider based on their purpose and strengths
 */

import { generateContent as generateWithAzure } from './azure-openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ENGINE_MODELS, GEMINI_CONFIG, AZURE_CONFIG, FALLBACK_CONFIG } from './model-config'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface EngineRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  engineId?: string
  forceProvider?: 'azure' | 'gemini'
}

export interface EngineResponse {
  content: string
  provider: 'azure' | 'gemini'
  model: string
  metadata: {
    contentLength: number
    thinkingTokens?: number
    completionTime: number
  }
}

/**
 * 🚀 SMART ENGINE AI ROUTER
 * Automatically routes engines to their optimal AI provider
 */
export class EngineAIRouter {
  
  /**
   * Route engine request to optimal AI provider
   */
  static async generateContent(request: EngineRequest): Promise<EngineResponse> {
    const startTime = Date.now()
    const {
      prompt,
      systemPrompt = 'You are a professional storytelling assistant.',
      temperature = 0.85, // HIGHER FOR CREATIVE EXCELLENCE!
      maxTokens = 2000,
      engineId,
      forceProvider
    } = request

    // Determine optimal provider
    let provider: 'azure' | 'gemini'
    
    if (forceProvider) {
      provider = forceProvider
    } else if (engineId) {
      provider = this.getOptimalProvider(engineId)
    } else {
      // Default logic: creative tasks → Gemini, technical tasks → Azure
      provider = this.isCreativeTask(prompt) ? 'gemini' : 'azure'
    }

    console.log(`🎯 ENGINE ROUTER: ${engineId || 'Unknown'} → ${provider.toUpperCase()}`)

    try {
      let response: EngineResponse

      if (provider === 'gemini') {
        response = await this.generateWithGemini(prompt, systemPrompt, temperature, maxTokens)
      } else {
        response = await this.generateWithAzure(prompt, systemPrompt, temperature, maxTokens)
      }

      response.metadata.completionTime = Date.now() - startTime
      console.log(`✅ ENGINE ROUTER: Generated ${response.metadata.contentLength} chars in ${response.metadata.completionTime}ms`)

      return response

    } catch (error) {
      console.error(`❌ ENGINE ROUTER: ${provider} failed, trying fallback...`)
      
      // Try fallback provider
      const fallbackProvider = provider === 'azure' ? 'gemini' : 'azure'
      
      try {
        const fallbackResponse = fallbackProvider === 'gemini' 
          ? await this.generateWithGemini(prompt, systemPrompt, temperature, maxTokens)
          : await this.generateWithAzure(prompt, systemPrompt, temperature, maxTokens)
        
        fallbackResponse.metadata.completionTime = Date.now() - startTime
        console.log(`✅ ENGINE ROUTER: Fallback ${fallbackProvider} succeeded`)
        
        return fallbackResponse
      } catch (fallbackError) {
        throw new Error(`Both providers failed: ${error instanceof Error ? error.message : String(error)} | ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`)
      }
    }
  }

  /**
   * Generate with Gemini 2.5 Pro (optimized for creativity)
   */
  private static async generateWithGemini(
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<EngineResponse> {
    
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_CONFIG.getModel('stable'),
      generationConfig: {
        temperature: Math.min(temperature, 1), // Gemini max temp is 1
        maxOutputTokens: Math.min(maxTokens, 8192),
        topP: 0.95,
      }
    })

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    return {
      content: text,
      provider: 'gemini',
      model: GEMINI_CONFIG.getModel('stable'),
      metadata: {
        contentLength: text.length,
        thinkingTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTime: 0 // Will be set by caller
      }
    }
  }

  /**
   * Generate with Azure OpenAI (GPT-4.1 primary, GPT-5-mini fallback)
   */
  private static async generateWithAzure(
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<EngineResponse> {
    
    const fallbackChain = FALLBACK_CONFIG.AZURE_FALLBACKS
    let lastError = null
    
    for (const model of fallbackChain) {
      try {
        console.log(`🔵 Trying Azure model: ${model}`)
        
        const content = await generateWithAzure(prompt, {
          systemPrompt,
          temperature: model === 'gpt-5-mini' ? 1 : Math.min(temperature, 2),
          maxTokens: Math.min(maxTokens, model === 'gpt-5-mini' ? 4096 : 8192),
          model // Pass specific model
        })

        if (content && content.trim().length > 0) {
          return {
            content: content.trim(),
            provider: 'azure',
            model: model,
            metadata: {
              contentLength: content.trim().length,
              completionTime: 0 // Will be set by caller
            }
          }
        }
      } catch (error) {
        console.log(`❌ Azure ${model} failed: ${error instanceof Error ? error.message : String(error)}`)
        lastError = error
        continue // Try next model in chain
      }
    }
    
    throw new Error(`All Azure models failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`)
  }

  /**
   * Determine optimal provider for engine using comprehensive mapping
   */
  private static getOptimalProvider(engineId: string): 'azure' | 'gemini' {
    // Use the comprehensive ENGINE_MODELS mapping
    const model = ENGINE_MODELS[engineId as keyof typeof ENGINE_MODELS]
    
    if (model) {
      // Check if it's a Gemini model
      if (model.includes('gemini')) {
        return 'gemini'
      }
      // Check if it's an Azure model (GPT-4.1, GPT-5-mini, etc.)
      if (model.includes('gpt-')) {
        return 'azure'
      }
    }

    // Fallback logic based on engine type patterns
    const creativePatterns = [
      'character', 'dialogue', 'world-building', 'creative', 'genre',
      'comedy', 'horror', 'romance', 'mystery', 'choice', 'interactive',
      'living-world', 'language', 'trope'
    ]

    const analyticalPatterns = [
      'premise', 'fractal', 'narrative', 'theme', 'pacing', 'tension',
      'structure', 'technical', 'casting', 'storyboard', 'production',
      'continuity', 'cohesion', 'conflict', 'canvas'
    ]

    const engineLower = engineId.toLowerCase()
    
    // Check creative patterns
    if (creativePatterns.some(pattern => engineLower.includes(pattern))) {
      return 'gemini'
    }
    
    // Check analytical patterns  
    if (analyticalPatterns.some(pattern => engineLower.includes(pattern))) {
      return 'azure'
    }

    // Default: Creative tasks work better with Gemini based on our testing
    console.log(`⚠️  Unknown engine pattern: ${engineId}, defaulting to Gemini`)
    return 'gemini'
  }

  /**
   * Analyze if task is creative or technical
   */
  private static isCreativeTask(prompt: string): boolean {
    const creativeKeywords = [
      'character', 'dialogue', 'story', 'scene', 'atmosphere', 'emotion',
      'creative', 'imaginative', 'vivid', 'compelling', 'dramatic',
      'personality', 'voice', 'style', 'tone', 'mood', 'feeling'
    ]

    const technicalKeywords = [
      'structure', 'format', 'analysis', 'framework', 'system',
      'organize', 'categorize', 'validate', 'assess', 'evaluate'
    ]

    const lowerPrompt = prompt.toLowerCase()
    
    const creativeScore = creativeKeywords.reduce((score, word) => 
      score + (lowerPrompt.includes(word) ? 1 : 0), 0
    )
    
    const technicalScore = technicalKeywords.reduce((score, word) => 
      score + (lowerPrompt.includes(word) ? 1 : 0), 0
    )

    return creativeScore >= technicalScore
  }
}

// Convenience function for engines to use
export async function generateEngineContent(request: EngineRequest): Promise<string> {
  const response = await EngineAIRouter.generateContent(request)
  return response.content
}