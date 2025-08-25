'use client';

// This file is safe to import in client components
// It only re-exports types and provides client-safe functions

export type AzureOpenAIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4.5-preview' | 'gpt-4o';

export interface GenerateContentOptions {
  model?: AzureOpenAIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Client-safe helper to call API endpoints
export async function generateContentViaAPI(prompt: string, options: Partial<GenerateContentOptions> = {}) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, options })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling generate API:', error);
    throw error;
  }
}

// Client-safe wrapper for image generation
export async function generateImageViaAPI(prompt: string, options: { size?: string; style?: string } = {}) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, size: options.size, style: options.style })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.url || data.imageUrl;
  } catch (error) {
    console.error('Error calling generate-image API:', error);
    throw error;
  }
}

// Client-safe wrapper for structured content generation
export async function generateStructuredContentViaAPI(
  prompt: string,
  systemPrompt: string,
  outputSchema: any,
  options: Partial<GenerateContentOptions> = {}
) {
  try {
    const response = await fetch('/api/generate/structured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        systemPrompt, 
        outputSchema,
        options 
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling structured content API:', error);
    throw error;
  }
}

// Client-safe helper to generate pre-production content
export async function generatePreProductionContent(
  prompt: string, 
  phase: 'planning' | 'narrative' | 'storyboard' | 'script',
  episode: number = 1
) {
  try {
    const response = await fetch('/api/generate/preproduction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, phase, episode })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error generating ${phase} content:`, error);
    throw error;
  }
}

// Helper function to estimate token count (safe for client usage)
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Helper function to chunk text for large prompts (safe for client usage)
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