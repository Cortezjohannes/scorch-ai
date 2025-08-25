import { generateContent } from './azure-openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
  }[];
}

/**
 * Creates a chat completion using Azure OpenAI
 */
export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  try {
    // Construct the prompt from messages
    const userMessage = request.messages.find(msg => msg.role === 'user')?.content || '';
    const systemMessage = request.messages.find(msg => msg.role === 'system')?.content || '';
    
    // Use our existing generateContent function
    const content = await generateContent(userMessage, {
      model: request.model === 'gpt-4' ? 'gpt-4' : 'gpt-4.5-preview',
      temperature: request.temperature || 0.7,
      maxTokens: request.max_tokens || 2000,
      systemPrompt: systemMessage
    });
    
    // Format response to match OpenAI API structure
    return {
      choices: [
        {
          message: {
            content
          },
          index: 0
        }
      ]
    };
  } catch (error) {
    console.error('Error in createChatCompletion:', error);
    throw error;
  }
} 