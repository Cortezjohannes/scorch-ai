import { GoogleGenerativeAI } from '@google/generative-ai';
import { isRateLimitError, getTextFallbackModel } from './model-config';

// Helper function to get API key
const getGeminiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  if (apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is too short, please check the value');
  }
  
  return apiKey;
};

/**
 * Generate content using Google's Gemini models with automatic 429 fallback
 * @param systemPrompt - System prompt for the generation
 * @param userPrompt - User prompt for the generation
 * @param model - Gemini model to use (defaults to gemini-3-pro-preview)
 * @returns - Generated content as string
 */
export async function generateContentWithGemini(
  systemPrompt: string, 
  userPrompt: string, 
  model: string = 'gemini-3-pro-preview'  // Using Gemini 3 Pro Preview
): Promise<string> {
    // Initialize Gemini with API key
    const genAI = new GoogleGenerativeAI(getGeminiKey());
    
  // Combine system and user prompts for Gemini
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
  // Try primary model first
  try {
    const geminiModel = genAI.getGenerativeModel({ model });
    
    console.log(`🚀 [GEMINI] Starting generation with model: ${model}`);
    console.log(`📋 [GEMINI] Model verification: ${model === 'gemini-3-pro-preview' ? '✅ GEMINI 3 PRO PREVIEW' : '⚠️ ' + model}`);
    
    const result = await geminiModel.generateContent(combinedPrompt);
    const response = result.response.text();
    console.log(`✅ [GEMINI] Received response from ${model} (length: ${response.length} chars)`);
    
    return response;
  } catch (error: any) {
    console.error(`❌ [GEMINI] Error with ${model}:`, error);
    
    // Check if this is a 429 rate limit error
    if (isRateLimitError(error)) {
      const fallbackModel = getTextFallbackModel(model);
      
      if (fallbackModel) {
        console.log(`🔄 [GEMINI] Rate limit (429) hit on ${model}, falling back to ${fallbackModel}...`);
        
        try {
          const fallbackGeminiModel = genAI.getGenerativeModel({ model: fallbackModel });
          
          console.log(`🚀 [GEMINI FALLBACK] Starting generation with fallback model: ${fallbackModel}`);
          const fallbackResult = await fallbackGeminiModel.generateContent(combinedPrompt);
          const fallbackResponse = fallbackResult.response.text();
          console.log(`✅ [GEMINI FALLBACK] Received response from ${fallbackModel} (length: ${fallbackResponse.length} chars)`);
          
          return fallbackResponse;
        } catch (fallbackError: any) {
          console.error(`❌ [GEMINI FALLBACK] Fallback model ${fallbackModel} also failed:`, fallbackError);
          throw new Error(`Gemini generation failed: Primary (${model}) hit rate limit, fallback (${fallbackModel}) also failed: ${fallbackError.message}`);
        }
      } else {
        console.error(`❌ [GEMINI] Rate limit hit and no fallback available for ${model}`);
      }
    }
    
    throw new Error(`Gemini generation failed: ${(error as Error).message}`);
  }
}
