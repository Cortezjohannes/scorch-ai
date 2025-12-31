/**
 * 🤖 UNIFIED AI GENERATOR
 * Handles AI content generation with intelligent fallback chain:
 * Gemini 3 Pro → Gemini 2.5 Pro → Azure OpenAI (GPT-4.1)
 */

import { generateContentWithGemini } from './gemini-ai'
import { generateContent as generateWithAzure } from './azure-openai'
import { GEMINI_CONFIG } from './model-config'

export interface AIGenerationOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  preferredModel?: 'gemini' | 'azure'
}

/**
 * Generate content using AI with automatic fallback chain
 * @param prompt - The user prompt
 * @param options - Generation options
 * @returns Generated content as string
 */
export async function generateAIContent(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<string> {
  const {
    systemPrompt = 'You are a helpful AI assistant for creative writing and character development.',
    temperature = 0.8,
    maxTokens = 2000,
    preferredModel = 'gemini'
  } = options

  console.log(`🤖 [UNIFIED AI] Starting generation with preferred model: ${preferredModel}`)
  console.log(`📋 [UNIFIED AI] Prompt length: ${prompt.length} chars, Max tokens: ${maxTokens}`)

  // Try Gemini 3 Pro first (unless Azure is preferred)
  if (preferredModel === 'gemini') {
    try {
      console.log('🚀 [UNIFIED AI] Attempting Gemini 3 Pro...')
      const result = await generateContentWithGemini(
        systemPrompt,
        prompt,
        GEMINI_CONFIG.MODELS.PRO // gemini-3-pro-preview
      )
      console.log(`✅ [UNIFIED AI] Success with Gemini 3 Pro (${result.length} chars)`)
      return result
    } catch (error: any) {
      console.warn('⚠️ [UNIFIED AI] Gemini 3 Pro failed:', error.message)
      
      // Try Gemini 2.5 Pro as fallback
      try {
        console.log('🔄 [UNIFIED AI] Falling back to Gemini 2.5 Pro...')
        const result = await generateContentWithGemini(
          systemPrompt,
          prompt,
          'gemini-2.0-pro-exp-0827' // Gemini 2.5 Pro
        )
        console.log(`✅ [UNIFIED AI] Success with Gemini 2.5 Pro (${result.length} chars)`)
        return result
      } catch (gemini2Error: any) {
        console.warn('⚠️ [UNIFIED AI] Gemini 2.5 Pro also failed:', gemini2Error.message)
        // Fall through to Azure
      }
    }
  }

  // Try Azure OpenAI as final fallback (or first if preferred)
  try {
    console.log('🔄 [UNIFIED AI] Using Azure OpenAI (GPT-4.1)...')
    const result = await generateWithAzure(
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      'gpt-4.1'
    )
    console.log(`✅ [UNIFIED AI] Success with Azure OpenAI (${result.length} chars)`)
    return result
  } catch (azureError: any) {
    console.error('❌ [UNIFIED AI] All AI services failed!')
    console.error('   Gemini 3 Pro: Failed')
    console.error('   Gemini 2.5 Pro: Failed')
    console.error('   Azure OpenAI: Failed')
    throw new Error(`AI generation failed: ${azureError.message}`)
  }
}

/**
 * Generate structured JSON content using AI
 * @param prompt - The user prompt
 * @param options - Generation options
 * @returns Parsed JSON object
 */
export async function generateStructuredAIContent<T = any>(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<T> {
  const enhancedSystemPrompt = `${options.systemPrompt || 'You are a helpful AI assistant.'}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just pure JSON.`
  
  const result = await generateAIContent(prompt, {
    ...options,
    systemPrompt: enhancedSystemPrompt
  })

  // Clean up common JSON formatting issues
  let cleanedResult = result.trim()
  
  // Remove markdown code blocks if present
  if (cleanedResult.startsWith('```json')) {
    cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
  } else if (cleanedResult.startsWith('```')) {
    cleanedResult = cleanedResult.replace(/```\n?/g, '')
  }

  try {
    return JSON.parse(cleanedResult) as T
  } catch (parseError) {
    console.error('❌ [UNIFIED AI] Failed to parse JSON response:', cleanedResult.substring(0, 200))
    throw new Error('AI returned invalid JSON format')
  }
}

/**
 * Batch generate multiple AI contents in parallel
 * @param prompts - Array of prompts
 * @param options - Generation options
 * @returns Array of generated contents
 */
export async function batchGenerateAIContent(
  prompts: string[],
  options: AIGenerationOptions = {}
): Promise<string[]> {
  console.log(`🔄 [UNIFIED AI] Batch generating ${prompts.length} items...`)
  
  const results = await Promise.allSettled(
    prompts.map(prompt => generateAIContent(prompt, options))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`❌ [UNIFIED AI] Batch item ${index} failed:`, result.reason)
      return '' // Return empty string for failed items
    }
  })
}

