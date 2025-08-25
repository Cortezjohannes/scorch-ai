import OpenAI from 'openai';

// Initialize the Azure OpenAI client with API key and endpoint from environment variables
const azureOpenAI = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
  baseURL: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
  defaultQuery: { 'api-version': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2023-12-01-preview' },
  defaultHeaders: { 'api-key': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '' },
  dangerouslyAllowBrowser: true // Only for client-side usage - consider using server actions instead
});

// Initialize a separate Azure OpenAI client for DALL-E with its own endpoint if provided
const azureDalleClient = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
  baseURL: process.env.NEXT_PUBLIC_AZURE_DALLE_ENDPOINT || process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
  defaultQuery: { 'api-version': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2023-12-01-preview' },
  defaultHeaders: { 'api-key': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '' },
  dangerouslyAllowBrowser: true // Only for client-side usage - consider using server actions instead
});

// Model deployment mapping - maps generic model names to Azure deployment names
const MODEL_DEPLOYMENT_MAP: Record<string, string> = {
  'gpt-4.1': process.env.NEXT_PUBLIC_AZURE_GPT41_DEPLOYMENT || 'gpt-4.1',
  'gpt-4-turbo-preview': process.env.NEXT_PUBLIC_AZURE_GPT4_TURBO_DEPLOYMENT || 'gpt-4.1',
  'gpt-4': process.env.NEXT_PUBLIC_AZURE_GPT4_DEPLOYMENT || 'gpt-4',
  'gpt-3.5-turbo': process.env.NEXT_PUBLIC_AZURE_GPT35_TURBO_DEPLOYMENT || 'gpt-35-turbo',
  'gpt-4o': process.env.NEXT_PUBLIC_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o'
};

export type ChatCompletionOptions = {
  messages: { role: 'system' | 'user' | 'assistant' | 'function'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
};

/**
 * Sends a completion request to Azure OpenAI's chat completion API
 */
export async function createChatCompletion({
  messages,
  temperature = 0.7,
  max_tokens = 1000,
  model = 'gpt-4-turbo-preview',
}: ChatCompletionOptions): Promise<string> {
  try {
    if (!azureOpenAI.apiKey) {
      throw new Error('Azure OpenAI API key is not configured');
    }

    // Map the model name to the Azure deployment name
    const deploymentId = MODEL_DEPLOYMENT_MAP[model] || model;

    const response = await azureOpenAI.chat.completions.create({
      model: deploymentId,
      messages,
      temperature,
      max_tokens,
    });

    return response.choices[0]?.message.content || '';
  } catch (error: any) {
    console.error('Error creating chat completion with Azure OpenAI:', error);
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
    console.error('Error generating structured content with Azure OpenAI:', error);
    throw error;
  }
}

/**
 * Generates an image using DALL-E through Azure OpenAI
 */
export async function generateImage(
  prompt: string,
  options: { size?: '1024x1024' | '1792x1024' | '1024x1792' } = {}
) {
  const { size = '1024x1024' } = options;
  const deploymentId = process.env.NEXT_PUBLIC_AZURE_DALLE_DEPLOYMENT || 'dall-e-3';

  try {
    // Use the DALL-E specific client
    const response = await azureDalleClient.images.generate({
      model: deploymentId,
      prompt,
      size,
      quality: 'standard',
      n: 1,
    });

    return response.data[0]?.url || '';
  } catch (error) {
    console.error('Azure OpenAI Image Generation Error:', error);
    throw error;
  }
}

// Helper function to estimate token count
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Helper function to chunk text for large prompts
export function chunkText(text: string, maxTokens: number = 2000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const words = text.split(' ');

  for (const word of words) {
    if (estimateTokenCount(currentChunk + ' ' + word) > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export default azureOpenAI; 