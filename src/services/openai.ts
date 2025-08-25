import OpenAI from 'openai';
import { monitoring } from './monitoring';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type OpenAIModel = 'gpt-4' | 'gpt-4-turbo-preview' | 'gpt-3.5-turbo';

interface GenerateContentOptions {
  model?: OpenAIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Cost per 1K tokens for different models
const MODEL_COSTS = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
};

export async function generateContent(
  prompt: string,
  options: GenerateContentOptions = {}
) {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 2000,
    systemPrompt = 'You are a helpful AI assistant specialized in film and TV pre-production planning.'
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    });

    // Calculate token usage and cost
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = (
      (inputTokens / 1000) * MODEL_COSTS[model].input +
      (outputTokens / 1000) * MODEL_COSTS[model].output
    );

    // Log usage
    monitoring.logUsage({
      model,
      inputTokens,
      outputTokens,
      cost,
      endpoint: 'chat/completions',
      success: true
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Log failed attempt
    monitoring.logUsage({
      model: options.model || 'gpt-4-turbo-preview',
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      endpoint: 'chat/completions',
      success: false
    });

    throw error;
  }
}

export async function generateImage(
  prompt: string,
  options: { size?: '1024x1024' | '1792x1024' | '1024x1792' } = {}
) {
  const { size = '1024x1024' } = options;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size,
      quality: 'standard',
      n: 1,
    });

    // DALL-E costs $0.04 per image
    monitoring.logUsage({
      model: 'dall-e-3',
      inputTokens: 0,
      outputTokens: 0,
      cost: 0.04,
      endpoint: 'images/generate',
      success: true
    });

    return response.data[0]?.url || '';
  } catch (error) {
    console.error('OpenAI Image Generation Error:', error);
    
    monitoring.logUsage({
      model: 'dall-e-3',
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      endpoint: 'images/generate',
      success: false
    });

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