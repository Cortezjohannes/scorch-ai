import { generateStructuredContentAction } from '@/services/azure-openai-actions';
import { NextResponse } from 'next/server';

// Structured content generation endpoint using Azure OpenAI
export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, outputSchema, options = {} } = await request.json();
    
    // Validate required parameters
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    if (!systemPrompt) {
      return NextResponse.json({ error: 'System prompt is required' }, { status: 400 });
    }
    
    if (!outputSchema) {
      return NextResponse.json({ error: 'Output schema is required' }, { status: 400 });
    }
    
    console.log(`Generating structured content with Azure OpenAI (${options.model || 'gpt-4o'})...`);
    const result = await generateStructuredContentAction(prompt, systemPrompt, outputSchema, options);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Structured content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate structured content' },
      { status: 500 }
    );
  }
} 