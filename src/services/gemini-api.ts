/**
 * Gemini 3 Pro API Integration
 * 
 * This file provides utilities for generating content using Google's Gemini 3 Pro model.
 * Includes automatic fallback to gemini-2.5-pro when hitting 429 rate limits.
 */

// Import necessary dependencies
import { GoogleGenerativeAI } from '@google/generative-ai';

// Content generation options
export interface GeminiContentOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Generate content using Gemini with automatic 429 rate limit fallback
 * Primary: gemini-3-pro-preview → Fallback: gemini-2.5-pro
 */
export async function generateGeminiContent(
  prompt: string,
  options: GeminiContentOptions = {}
): Promise<string> {
  const { 
    temperature = 0.4, 
    maxTokens = 2000,
    systemPrompt
  } = options;
  
    // Initialize the Gemini API with the API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ Gemini API key not found in environment variables');
      throw new Error('Gemini API key not found in environment variables');
    }
    
    // Log API key length for debugging (don't log the actual key)
    console.log(`Gemini API Key length: ${apiKey.length} characters`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
  // Get the primary model
  const primaryModel = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-3-pro-preview';
      
      // Prepare generation config
      const generationConfig = {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topK: 40,
        topP: 0.95,
      };
      
  // Helper function to generate with a specific model
  async function generateWithModel(modelName: string): Promise<string> {
    console.log(`🚀 Using Gemini model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
      // Create chat without system instruction to avoid Bad Request errors
    let chat = model.startChat({ generationConfig });
      
      // If system prompt was provided, send it as a separate message
      if (systemPrompt) {
        try {
          console.log('Sending system prompt as regular message');
          await chat.sendMessage(`SYSTEM INSTRUCTION: ${systemPrompt}`);
        } catch (systemPromptError) {
          console.warn('⚠️ Error sending system prompt as message:', systemPromptError);
        }
      }
      
      // Generate content
      console.log(`🚀 Making Gemini API call to ${modelName}...`);
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const text = response.text();
      
    console.log(`✅ Gemini content generation successful with ${modelName}`);
      return text;
  }
  
  // Generate with primary model
  try {
    return await generateWithModel(primaryModel);
  } catch (error: any) {
    console.error(`❌ Error with Gemini model ${primaryModel}:`, error);
    logDetailedError(error);
    throw error;
  }
}

/**
 * Log detailed error information for debugging
 */
function logDetailedError(error: any): void {
    console.error('❌ Gemini content generation failed with details:');
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    if (error.status) {
      console.error('Status code:', error.status);
    }
    
    if (error.errorDetails) {
      console.error('Error details:', JSON.stringify(error.errorDetails, null, 2));
    }
    
    // Check for common errors
    if (error.message?.includes('API key')) {
      console.error('❌ API KEY ERROR: The Gemini API key appears to be invalid or missing');
    } else if (error.status === 400) {
      console.error('❌ BAD REQUEST: The request to Gemini API was malformed');
    } else if (error.status === 429) {
      console.error('❌ RATE LIMIT: You have exceeded your Gemini API quota or rate limit');
    } else if (error.status === 403) {
      console.error('❌ FORBIDDEN: Your API key does not have permission to use this model');
  }
}
