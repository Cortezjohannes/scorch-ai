/**
 * Shared utility functions for Azure OpenAI services
 * This file can be imported by both client and server components
 */

/**
 * Estimates token count based on text length
 * Rough approximation: 1 token ≈ 4 characters
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Chunks text into smaller pieces to fit token limits
 */
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