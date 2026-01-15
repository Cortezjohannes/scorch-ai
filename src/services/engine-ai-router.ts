/**
 * 🎯 ENGINE AI ROUTER - INTELLIGENT API SELECTION
 * Routes engines to the optimal AI provider based on their purpose and strengths
 * 
 * 🔄 FALLBACK MECHANISM:
 * - Primary: gemini-3-pro-preview → Fallback: gemini-2.5-pro → Final Fallback: Azure GPT 4.1
 */

import { generateContent as generateContentWithAzure } from './azure-openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ENGINE_MODELS, GEMINI_CONFIG, AZURE_CONFIG, FALLBACK_CONFIG } from './model-config'

// Initialize Gemini - get API key at runtime
const getGeminiInstance = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return new GoogleGenerativeAI(apiKey)
}

export interface EngineRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  engineId?: string
  forceProvider?: 'azure' | 'gemini'
  allowFallback?: boolean // when false, do not auto-fallback to the other provider
}

export interface EngineResponse {
  content: string
  provider: 'azure' | 'gemini'
  model: string
  metadata: {
    contentLength: number
    thinkingTokens?: number
    completionTime: number
    truncated?: boolean
    finishReason?: string
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
    const {
      prompt,
      systemPrompt = 'You are a professional storytelling assistant.',
      temperature = 0.85, // HIGHER FOR CREATIVE EXCELLENCE!
      maxTokens = 2000,
      engineId,
      forceProvider,
      allowFallback = true
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

      const startTime = Date.now()
      console.log(`🎯 ENGINE ROUTER: ${engineId || 'Unknown'} → ${provider.toUpperCase()}`)

      try {
        let response: EngineResponse

        if (provider === 'gemini') {
          response = await this.generateWithGemini(prompt, systemPrompt, temperature, maxTokens, engineId)
        } else {
          response = await this.generateWithAzure(prompt, systemPrompt, temperature, maxTokens)
        }

        response.metadata.completionTime = Date.now() - startTime
        console.log(`✅ ENGINE ROUTER: Generated ${response.metadata.contentLength} chars in ${response.metadata.completionTime}ms`)

        return response

      } catch (error) {
        console.error(`❌ ENGINE ROUTER: ${provider} failed, trying fallback...`)
        if (!allowFallback) {
          throw error instanceof Error ? error : new Error(String(error))
        }
        
        // Try fallback provider
        const fallbackProvider = provider === 'azure' ? 'gemini' : 'azure'
        
        try {
          const fallbackResponse = fallbackProvider === 'gemini' 
            ? await this.generateWithGemini(prompt, systemPrompt, temperature, maxTokens, engineId)
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
   * Generate with Gemini with automatic fallback chain
   * Primary: gemini-3-pro-preview → Fallback: gemini-2.5-pro → Final Fallback: Azure GPT 4.1 (handled by outer catch)
   * For ai-shot-detector: Uses gemini-2.5-pro directly
   */
  private static async generateWithGemini(
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    engineId?: string
  ): Promise<EngineResponse> {
    
    // Use Gemini 2.5 for AI shot detector, otherwise use Gemini 3.0 preview
    const primaryModel = engineId === 'ai-shot-detector' ? 'gemini-2.5-pro' : 'gemini-3-pro-preview'
    const fallbackModel = 'gemini-2.5-pro'
    
    // Gemini models have 8192 max output tokens, but we'll use a safe limit
    const geminiMaxTokens = 8192
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    
    // Helper to generate with a specific model
    const generateWithModel = async (modelName: string): Promise<EngineResponse> => {
      const genAI = getGeminiInstance()
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: Math.min(temperature, 1), // Gemini max temp is 1
          maxOutputTokens: Math.min(maxTokens, geminiMaxTokens),
          topP: 0.95,
        }
      })
      
      // Log if we're hitting token limits
      if (maxTokens > geminiMaxTokens) {
        console.warn(`⚠️  Requested ${maxTokens} tokens but Gemini max is ${geminiMaxTokens}. Response may be truncated.`)
      }
      
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      let text = ''
      
      try {
        text = response.text()
      } catch (error: any) {
        console.error(`❌ Error getting text from Gemini response:`, error)
        // Check if response was blocked or filtered
        const finishReason = (response as any).candidates?.[0]?.finishReason
        const safetyRatings = (response as any).candidates?.[0]?.safetyRatings
        if (finishReason === 'SAFETY' || safetyRatings) {
          throw new Error(`Gemini response blocked by safety filters. Finish reason: ${finishReason}`)
        }
        throw new Error(`Failed to extract text from Gemini response: ${error.message}`)
      }
      
      // Check if response was truncated
      const finishReason = (response as any).candidates?.[0]?.finishReason
      const isTruncated = finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH'
      
      if (isTruncated) {
        console.warn(`⚠️  Gemini response truncated (finishReason: ${finishReason})`)
        console.warn(`  Response length: ${text.length} characters`)
        if (text.length === 0) {
          console.error(`❌ Response is empty after truncation. This may indicate the prompt is too long or the model hit a limit.`)
          throw new Error('Gemini response was truncated and is empty. Try reducing prompt length or increasing maxTokens.')
        }
      }
      
      return {
        content: text,
        provider: 'gemini',
        model: modelName,
        metadata: {
          contentLength: text.length,
          thinkingTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTime: 0, // Will be set by caller
          truncated: isTruncated,
          finishReason: finishReason
        }
      }
    }
    
    // Try primary model (Gemini 3.0 preview)
    try {
      console.log(`🚀 [ENGINE ROUTER] Trying primary Gemini model: ${primaryModel}`)
      return await generateWithModel(primaryModel)
    } catch (primaryError) {
      console.error(`❌ [ENGINE ROUTER] Primary Gemini model ${primaryModel} failed:`, primaryError instanceof Error ? primaryError.message : String(primaryError))
      
      // Skip fallback for ai-shot-detector (it already uses 2.5)
      if (engineId === 'ai-shot-detector') {
        throw primaryError
      }
      
      // Try fallback model (Gemini 2.5 pro)
      try {
        console.log(`🔄 [ENGINE ROUTER] Falling back to Gemini 2.5 Pro: ${fallbackModel}`)
        return await generateWithModel(fallbackModel)
      } catch (fallbackError) {
        console.error(`❌ [ENGINE ROUTER] Fallback Gemini model ${fallbackModel} also failed:`, fallbackError instanceof Error ? fallbackError.message : String(fallbackError))
        // Re-throw to trigger outer catch which will try Azure GPT 4.1
        throw new Error(`Both Gemini models failed. Primary (${primaryModel}): ${primaryError instanceof Error ? primaryError.message : String(primaryError)}. Fallback (${fallbackModel}): ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`)
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
        
        const content = await generateContentWithAzure(prompt, {
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