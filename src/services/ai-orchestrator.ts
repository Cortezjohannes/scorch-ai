/**
 * AI Orchestrator - Centralized AI Service for All Engines
 * 
 * This service ensures all engines use the correct AI provider based on mode:
 * - BEAST MODE: Azure OpenAI (GPT-4.1, GPT-4o)
 * - STABLE MODE: Google Gemini (gemini-1.5-pro, gemini-2.0-flash)
 * 
 * All engines should use this service instead of calling AI providers directly.
 */

import { generateContent as generateWithAzure } from './azure-openai'
import { generateContentWithGemini } from './gemini-ai'
import { EngineLogger } from './engine-logger'

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  mode?: 'beast' | 'stable';
  model?: string;
}

export interface AIResponse {
  content: string;
  provider: 'azure' | 'gemini';
  model: string;
  mode: 'beast' | 'stable';
  engineUsed: string;
}

/**
 * Master AI Generation Service for All Engines
 * Automatically selects the correct provider based on mode
 */
export class AIOrchestrator {
  
  /**
   * Generate content using the appropriate AI provider based mode with comprehensive logging
   */
  static async generateContent(
    request: AIRequest,
    engineName: string = 'UnknownEngine'
  ): Promise<AIResponse> {
    const {
      prompt,
      systemPrompt = 'You are a professional AI assistant specialized in film and television production.',
      temperature = 0.7,
      maxTokens = 2000,
      mode = 'beast', // Default to beast mode for maximum quality
      model
    } = request;

    // Enhanced logging with timestamps and detailed status
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.mmm
    console.log(`\n🔥 [${timestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🤖 [${timestamp}] AI ORCHESTRATOR: ${engineName.toUpperCase()} ENGINE ACTIVATION`);
    console.log(`⚡ [${timestamp}] MODE: ${mode.toUpperCase()} (${mode === 'beast' ? 'AZURE OPENAI - MAXIMUM QUALITY' : 'GEMINI - STABLE PERFORMANCE'})`);
    console.log(`🎯 [${timestamp}] PROCESSING: ${prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt}`);
    console.log(`🧠 [${timestamp}] TEMPERATURE: ${temperature} | MAX TOKENS: ${maxTokens}`);
    console.log(`🚀 [${timestamp}] ${engineName} ENGINE: INITIALIZING...`);

    try {
      let response: AIResponse;
      if (mode === 'beast') {
        console.log(`🦁 [${timestamp}] ${engineName}: Engaging Azure OpenAI for maximum quality...`);
        EngineLogger.logEngineProcessing(engineName, 'azure', model || 'gpt-4.1', 'Maximum quality AI processing');
        response = await this.generateWithAzure(prompt, systemPrompt, temperature, maxTokens, model, engineName);
      } else {
        console.log(`🔹 [${timestamp}] ${engineName}: Engaging Gemini for stable performance...`);
        EngineLogger.logEngineProcessing(engineName, 'gemini', model || 'gemini-1.5-pro', 'Stable performance AI processing');
        response = await this.generateWithGemini(prompt, systemPrompt, temperature, maxTokens, model, engineName);
      }
      
      const endTimestamp = new Date().toISOString().substring(11, 23);
      console.log(`✅ [${endTimestamp}] ${engineName} ENGINE: COMPLETED SUCCESSFULLY`);
      console.log(`📊 [${endTimestamp}] OUTPUT: ${response.content.length} characters generated`);
      console.log(`🏆 [${endTimestamp}] PROVIDER: ${response.provider.toUpperCase()} | MODEL: ${response.model}`);
      console.log(`🔥 [${endTimestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Log completion with enhanced logger
      EngineLogger.logEngineComplete(
        engineName, 
        `Generated professional ${response.mode} mode content`, 
        response.content.length,
        response.provider
      );
      
      return response;
    } catch (error) {
      const errorTimestamp = new Date().toISOString().substring(11, 23);
      console.log(`❌ [${errorTimestamp}] ${engineName} ENGINE: FAILED`);
      console.log(`💥 [${errorTimestamp}] ERROR: ${error}`);
      console.log(`🔥 [${errorTimestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      // Log error with enhanced logger
      EngineLogger.logEngineError(engineName, `AI generation failed: ${error}`, String(error));
      
      throw error;
    }
  }

  /**
   * BEAST MODE: Use Azure OpenAI for maximum quality
   */
  private static async generateWithAzure(
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    model: string = 'gpt-4.1',
    engineName: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().substring(11, 23);
    
    try {
      console.log(`🦁 [${timestamp}] BEAST MODE: ${engineName} connecting to Azure OpenAI ${model}...`);
      console.log(`🔌 [${timestamp}] ${engineName}: Establishing secure connection to Azure endpoint...`);
      console.log(`📡 [${timestamp}] ${engineName}: Transmitting ${prompt.length} character prompt...`);
      console.log(`⚙️  [${timestamp}] ${engineName}: Azure processing with temperature ${temperature}...`);
      
      const content = await generateWithAzure(prompt, {
        systemPrompt,
        temperature,
        maxTokens,
        model: model as any
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      const endTimestamp = new Date().toISOString().substring(11, 23);
      
      console.log(`🎯 [${endTimestamp}] ${engineName}: Azure OpenAI processing complete`);
      console.log(`📈 [${endTimestamp}] ${engineName}: Generated ${content.length} characters in ${duration}s`);
      console.log(`🏆 [${endTimestamp}] BEAST MODE SUCCESS: ${engineName} delivered premium quality with Azure ${model}`);

      return {
        content,
        provider: 'azure',
        model: model,
        mode: 'beast',
        engineUsed: engineName
      };
    } catch (error) {
      const errorTime = Date.now();
      const errorDuration = ((errorTime - startTime) / 1000).toFixed(2);
      const errorTimestamp = new Date().toISOString().substring(11, 23);
      
      console.error(`❌ [${errorTimestamp}] BEAST MODE FAILED for ${engineName} after ${errorDuration}s:`, error);
      console.error(`💥 [${errorTimestamp}] ${engineName}: Azure OpenAI connection/processing error`);
      
      // In beast mode, we should NOT fall back to Gemini unless explicitly configured
      // This maintains the user's choice for premium AI quality
      throw new Error(`Beast mode Azure OpenAI failed for ${engineName}: ${error}`);
    }
  }

  /**
   * STABLE MODE: Use Google Gemini for reliable, cost-effective generation
   */
  private static async generateWithGemini(
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    model: string = 'gemini-1.5-pro',
    engineName: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().substring(11, 23);
    
    try {
      // Use environment variable for stable mode model or default
      const geminiModel = process.env.GEMINI_STABLE_MODE_MODEL || model;
      console.log(`🔹 [${timestamp}] STABLE MODE: ${engineName} connecting to Google Gemini ${geminiModel}...`);
      console.log(`🌐 [${timestamp}] ${engineName}: Establishing connection to Google AI endpoint...`);
      console.log(`📨 [${timestamp}] ${engineName}: Transmitting ${prompt.length} character prompt to Gemini...`);
      console.log(`🔧 [${timestamp}] ${engineName}: Gemini processing with optimized parameters...`);
      
      const content = await generateContentWithGemini(systemPrompt, prompt, geminiModel);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      const endTimestamp = new Date().toISOString().substring(11, 23);
      
      console.log(`🎯 [${endTimestamp}] ${engineName}: Google Gemini processing complete`);
      console.log(`📊 [${endTimestamp}] ${engineName}: Generated ${content.length} characters in ${duration}s`);
      console.log(`✅ [${endTimestamp}] STABLE MODE SUCCESS: ${engineName} delivered reliable quality with Gemini ${geminiModel}`);

      return {
        content,
        provider: 'gemini',
        model: geminiModel,
        mode: 'stable',
        engineUsed: engineName
      };
    } catch (error) {
      const errorTime = Date.now();
      const errorDuration = ((errorTime - startTime) / 1000).toFixed(2);
      const errorTimestamp = new Date().toISOString().substring(11, 23);
      
      console.error(`❌ [${errorTimestamp}] STABLE MODE FAILED for ${engineName} after ${errorDuration}s:`, error);
      console.error(`💥 [${errorTimestamp}] ${engineName}: Google Gemini connection/processing error`);
      throw new Error(`Stable mode Gemini failed for ${engineName}: ${error}`);
    }
  }

  /**
   * Structured Generation - Returns parsed JSON with proper error handling
   */
  static async generateStructuredContent<T>(
    request: AIRequest & { schema?: any },
    engineName: string = 'UnknownEngine'
  ): Promise<{ data: T; meta: AIResponse }> {
    // Enhance prompt to request JSON format
    const enhancedPrompt = `${request.prompt}\n\nIMPORTANT: Return your response as valid JSON only, without any markdown formatting or additional text.`;
    
    const response = await this.generateContent({
      ...request,
      prompt: enhancedPrompt
    }, engineName);

    try {
      // Clean and parse the JSON response
      const cleanContent = response.content.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const parsedData = JSON.parse(cleanContent) as T;
      
      return {
        data: parsedData,
        meta: response
      };
    } catch (parseError) {
      console.warn(`⚠️ ${engineName} returned invalid JSON, attempting fallback parsing...`);
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]) as T;
          return {
            data: parsedData,
            meta: response
          };
        } catch (secondParseError) {
          console.error(`❌ ${engineName} JSON parsing failed completely:`, secondParseError);
        }
      }
      
      // Return error response
      throw new Error(`${engineName} failed to generate valid JSON: ${parseError}`);
    }
  }

  /**
   * Get optimal settings for different content types
   */
  static getOptimalSettings(contentType: 'narrative' | 'technical' | 'creative' | 'analytical'): Partial<AIRequest> {
    switch (contentType) {
      case 'narrative':
        return { temperature: 0.8, maxTokens: 3000 };
      case 'technical':
        return { temperature: 0.3, maxTokens: 2000 };
      case 'creative':
        return { temperature: 0.9, maxTokens: 4000 };
      case 'analytical':
        return { temperature: 0.4, maxTokens: 2500 };
      default:
        return { temperature: 0.7, maxTokens: 2000 };
    }
  }
}

// Export for backwards compatibility
export default AIOrchestrator;