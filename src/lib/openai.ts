import OpenAI from 'openai';

// Initialize the OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for client-side usage - consider using server actions instead
});

export type ChatCompletionOptions = {
  messages: { role: 'system' | 'user' | 'assistant' | 'function'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
};

/**
 * Sends a completion request to OpenAI's chat completion API
 */
export async function createChatCompletion({
  messages,
  temperature = 0.7,
  max_tokens = 1000,
  model = 'gpt-4-turbo-preview',
}: ChatCompletionOptions): Promise<string> {
  try {
    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });

    return response.choices[0]?.message.content || '';
  } catch (error: any) {
    console.error('Error creating chat completion:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generates a structured response based on a prompt and output schema
 */
export async function generateStructuredContent<T>(
  prompt: string, 
  systemPrompt: string,
  outputSchema: any,
  options: Partial<ChatCompletionOptions> = {}
): Promise<T> {
  try {
    const messages = [
      { 
        role: 'system' as const, 
        content: `${systemPrompt}\n\nYou must respond with valid JSON that follows this schema: ${JSON.stringify(outputSchema)}`
      },
      { role: 'user' as const, content: prompt }
    ];

    const rawResponse = await createChatCompletion({
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      model: options.model || 'gpt-4-turbo-preview',
    });

    // Extract JSON from response (handles cases where model might add explanation text)
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                      rawResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, rawResponse];
    
    const jsonContent = jsonMatch[1]?.trim() || rawResponse;
    
    try {
      return JSON.parse(jsonContent) as T;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw content:', jsonContent);
      throw new Error('Failed to parse the AI response as JSON');
    }
  } catch (error: any) {
    console.error('Error generating structured content:', error);
    throw error;
  }
}

export default openai; 