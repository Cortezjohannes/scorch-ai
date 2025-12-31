/**
 * Model Fallback Utilities
 * 
 * This file provides utilities for handling model fallbacks when primary models fail.
 * It implements a cascading fallback strategy to try different models in sequence.
 * 
 * 🔄 FALLBACK MECHANISM for 429 rate limit errors:
 * - Primary: gemini-3-pro-preview → Fallback: gemini-2.5-pro
 */

import { generateContent } from '@/services/azure-openai';
import { generateGeminiContent } from '@/services/gemini-api';

/**
 * Supported model types
 */
export type ModelType = 'gemini' | 'gpt-4.1' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | string;

/**
 * Configuration for different model fallback options
 */
export interface ModelFallbackOptions {
  // Primary model is now Gemini 3 Pro Preview
  primaryModel?: ModelType;  // Override primary model (default: 'gemini')
  
  // Fallback options when the primary model fails
  useGPT41?: boolean;       // Use GPT-4.1 as fallback (default: false)
  useGPT4?: boolean;        // Use GPT-4 as fallback (default: false)
  useGPT35Turbo?: boolean;  // Use GPT-3.5 Turbo as fallback (default: false)
  useClaude?: boolean;      // Use Claude model as fallback (default: false)
  customFallbacks?: ModelType[]; // Custom model names to try in order
  useGeminiOnly?: boolean;  // Only use Gemini, no fallbacks (default: false)
}

/**
 * Content generation options with model fallback configuration
 */
export interface ContentGenerationWithFallbackOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  fallbackOptions?: ModelFallbackOptions;
}

/**
 * Generate content with a specific model
 */
async function generateWithModel(
  model: ModelType,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  const { temperature = 0.4, maxTokens = 2000, systemPrompt } = options;
  
  if (model === 'gemini') {
    return generateGeminiContent(prompt, { temperature, maxTokens, systemPrompt });
  } else {
    // For OpenAI models
    return generateContent(prompt, { 
      temperature, 
      maxTokens,
      systemPrompt,
      model // Pass the model name to generateContent
    });
  }
}

/**
 * Generate content with model fallback capabilities
 * Tries different models in sequence if the primary model fails
 */
export async function generateContentWithFallback(
  prompt: string,
  options: ContentGenerationWithFallbackOptions = {}
): Promise<string> {
  const { 
    temperature = 0.4, 
    maxTokens = 2000, 
    systemPrompt,
    fallbackOptions = {
      primaryModel: 'gemini',
      useGPT41: false,
      useGPT4: false,
      useGPT35Turbo: false,
      useGeminiOnly: true
    }
  } = options;

  // Determine primary model
  const primaryModel = fallbackOptions.primaryModel || 'gemini';

  // Define fallback models to try in sequence
  const fallbackModels: ModelType[] = [];
  
  // Add custom fallbacks first if specified
  if (fallbackOptions.customFallbacks && fallbackOptions.customFallbacks.length > 0) {
    fallbackModels.push(...fallbackOptions.customFallbacks);
  }
  
  // Add standard fallbacks (skip if primary model is the same)
  if (fallbackOptions.useGPT41 && primaryModel !== 'gpt-4.1') {
    fallbackModels.push('gpt-4.1');
  }
  if (fallbackOptions.useGPT4 && primaryModel !== 'gpt-4') {
    fallbackModels.push('gpt-4');
  }
  if (fallbackOptions.useGPT35Turbo && primaryModel !== 'gpt-3.5-turbo') {
    fallbackModels.push('gpt-3.5-turbo');
  }
  if (fallbackOptions.useClaude && primaryModel !== 'claude') {
    fallbackModels.push('claude-3-opus-20240229');
  }

  // First try with primary model
  try {
    console.log(`🚀 Attempting content generation with primary model (${primaryModel})...`);
    const result = await generateWithModel(primaryModel, prompt, { 
      temperature, 
      maxTokens,
      systemPrompt
    });
    console.log(`✅ Primary model (${primaryModel}) generation successful`);
    return result;
  } catch (primaryError) {
    console.warn(`⚠️ Primary model (${primaryModel}) generation failed:`, primaryError);
    
  // Check if we should only use Gemini
  if (fallbackOptions.useGeminiOnly) {
      // If primary Gemini model fails, just throw the error (no fallback)
      console.error('❌ Gemini model failed and useGeminiOnly is true, no fallback available');
      throw primaryError;
  }
    
    // Try each fallback model in sequence
    for (const model of fallbackModels) {
      try {
        console.log(`🔄 Attempting fallback with ${model}...`);
        
        const result = await generateWithModel(model, prompt, { 
          temperature, 
          maxTokens,
          systemPrompt
        });
        
        console.log(`✅ Fallback to ${model} successful`);
        return result;
      } catch (fallbackError) {
        console.warn(`⚠️ Fallback to ${model} failed:`, fallbackError);
        // Continue to next fallback model
      }
    }
    
    // If all fallbacks fail, throw the original error
    console.error('❌ All model fallbacks failed');
    throw primaryError;
  }
}

/**
 * Enhanced retry utility with model fallback capabilities
 * Attempts the operation multiple times with exponential backoff
 * If all retries fail with the primary model, tries fallback models
 */
export async function retryWithModelFallback<T>(
  operation: (useFallbackModel?: boolean, modelType?: ModelType) => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  fallbackOptions: ModelFallbackOptions = { 
    primaryModel: 'gemini',
    useGPT41: false,
    useGPT4: false, 
    useGPT35Turbo: false,
    useGeminiOnly: true 
  }
): Promise<T | null> {
  // Determine primary model
  const primaryModel = fallbackOptions.primaryModel || 'gemini';
  
  // First try with primary model and retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries} with primary model (${primaryModel})`);
      const result = await operation(false, primaryModel); // false = don't use fallback yet
      console.log(`✅ ${operationName} - Success on attempt ${attempt} with primary model (${primaryModel})`);
      return result;
    } catch (error) {
      console.warn(`⚠️ ${operationName} - Attempt ${attempt} failed with primary model (${primaryModel}):`, error);
      
      if (attempt === maxRetries) {
        console.warn(`⚠️ ${operationName} - All ${maxRetries} attempts with primary model failed, trying fallbacks...`);
        break; // Break out to try fallback models
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // Check if we should only use Gemini - try gemini-2.5-pro as fallback for 429 errors
  if (fallbackOptions.useGeminiOnly) {
    // If primary Gemini model fails and useGeminiOnly is true, no fallback available
    console.error(`❌ ${operationName} - Primary Gemini model failed and useGeminiOnly is set to true, no fallback available`);
      return null;
  }

  // If all primary model attempts failed, try fallback models
  // Define fallback models to try in sequence
  const fallbackModels: Array<{name: ModelType, type: string}> = [];
  
  // Add custom fallbacks first if specified
  if (fallbackOptions.customFallbacks && fallbackOptions.customFallbacks.length > 0) {
    fallbackModels.push(...fallbackOptions.customFallbacks.map(model => ({ name: model, type: 'custom' })));
  }
  
  // Add standard fallbacks (skip if primary model is the same)
  if (fallbackOptions.useGPT41 && primaryModel !== 'gpt-4.1') {
    fallbackModels.push({ name: 'gpt-4.1', type: 'standard' });
  }
  if (fallbackOptions.useGPT4 && primaryModel !== 'gpt-4') {
    fallbackModels.push({ name: 'gpt-4', type: 'standard' });
  }
  if (fallbackOptions.useGPT35Turbo && primaryModel !== 'gpt-3.5-turbo') {
    fallbackModels.push({ name: 'gpt-3.5-turbo', type: 'standard' });
  }
  if (fallbackOptions.useClaude && primaryModel !== 'claude') {
    fallbackModels.push({ name: 'claude-3-opus-20240229', type: 'standard' });
  }
  
  // Try each fallback model
  for (const model of fallbackModels) {
    try {
      console.log(`🔄 ${operationName} - Attempting with fallback model ${model.name}...`);
      // Pass true to indicate we're using a fallback model
      // The operation function should handle this appropriately
      const result = await operation(true, model.name); 
      console.log(`✅ ${operationName} - Success with fallback model ${model.name}`);
      return result;
    } catch (fallbackError) {
      console.warn(`⚠️ ${operationName} - Fallback with ${model.name} failed:`, fallbackError);
      // Continue to next fallback model
    }
  }
  
  // If all models fail, return null
  console.error(`❌ ${operationName} - All models failed, skipping`);
  return null;
}
