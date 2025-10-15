/**
 * Gemini 2.5 Pro API Integration
 * 
 * This file provides utilities for generating content using Google's Gemini 2.5 Pro model.
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
 * Generate content using Gemini 2.5 Pro
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
  
  try {
    // Initialize the Gemini API with the API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ Gemini API key not found in environment variables');
      throw new Error('Gemini API key not found in environment variables');
    }
    
    // Log API key length for debugging (don't log the actual key)
    console.log(`Gemini API Key length: ${apiKey.length} characters`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model
    const modelName = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-2.5-pro';
    console.log(`Using Gemini model: ${modelName}`);
    
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Prepare generation config
      const generationConfig = {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topK: 40,
        topP: 0.95,
      };
      
      // Gemini 2.5 Pro has issues with system instructions in some cases
      // Create chat without system instruction to avoid Bad Request errors
      let chat = model.startChat({
        generationConfig
      });
      
      // If system prompt was provided, send it as a separate message
      if (systemPrompt) {
        try {
          // Prepend SYSTEM: to make it clear this is a system instruction
          console.log('Sending system prompt as regular message');
          await chat.sendMessage(`SYSTEM INSTRUCTION: ${systemPrompt}`);
        } catch (systemPromptError) {
          console.warn('⚠️ Error sending system prompt as message:', systemPromptError);
          // Continue without system prompt if it fails
        }
      }
      
      // Generate content
      console.log(`🚀 Making Gemini API call to ${modelName}...`);
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log(`✅ Gemini content generation successful`);
      return text;
    } catch (modelError) {
      console.error(`❌ Error with Gemini model ${modelName}:`, modelError);
      
      // Try with a fallback Gemini model if the primary model fails
      // We're already using gemini-1.5-pro as our primary model
      // This block is kept for future use if we want to try different models
      
      throw modelError;
    }
  } catch (error: any) {
    // Provide more detailed error information
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
    
    throw error;
  }
}
