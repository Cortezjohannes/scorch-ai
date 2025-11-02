import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Generate content using Google's Gemini models
 * @param systemPrompt - System prompt for the generation
 * @param userPrompt - User prompt for the generation
 * @param model - Gemini model to use (defaults to gemini-2.5-pro)
 * @returns - Generated content as string
 */
export async function generateContentWithGemini(
  systemPrompt: string, 
  userPrompt: string, 
  model: string = 'gemini-2.5-pro'  // Using correct model name
): Promise<string> {
  try {
    // Initialize Gemini with API key
    const genAI = new GoogleGenerativeAI(getGeminiKey());
    
    // Get the specified model
    const geminiModel = genAI.getGenerativeModel({ model });
    
    // Combine system and user prompts for Gemini
    // Gemini doesn't have separate system and user messages like OpenAI,
    // so we format them together
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Generate content
    console.log(`Starting Gemini generation with model: ${model}...`);
    const result = await geminiModel.generateContent(combinedPrompt);
    const response = result.response.text();
    console.log(`Received response from Gemini (length: ${response.length})`);
    
    return response;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(`Gemini generation failed: ${(error as Error).message}`);
  }
}
