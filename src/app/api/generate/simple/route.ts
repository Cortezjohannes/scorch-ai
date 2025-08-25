import { generateContentAction } from '@/services/azure-openai-actions';
import { NextResponse } from 'next/server';

// Simple text generation endpoint using Azure OpenAI
export async function POST(request: Request) {
  try {
    const { prompt, options = {} } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    console.log(`Generating text with Azure OpenAI (${options.model || 'gpt-4o'})...`);
    const result = await generateContentAction(prompt, options);
    
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Text generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate text' },
      { status: 500 }
    );
  }
} 