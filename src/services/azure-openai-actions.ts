'use server'

import { generateContent, generateImage, generateStructuredContent } from './azure-openai';

/**
 * Server action to generate content using Azure OpenAI
 */
export async function generateContentAction(
  prompt: string, 
  options = {}
) {
  return generateContent(prompt, options);
}

/**
 * Server action to generate an image using Azure DALL-E
 */
export async function generateImageAction(
  prompt: string,
  options = {}
) {
  return generateImage(prompt, options);
}

/**
 * Server action to generate structured content using Azure OpenAI
 */
export async function generateStructuredContentAction(
  prompt: string,
  systemPrompt: string,
  outputSchema: any,
  options = {}
) {
  return generateStructuredContent(prompt, systemPrompt, outputSchema, options);
} 