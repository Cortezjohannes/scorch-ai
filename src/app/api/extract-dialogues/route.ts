import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/services/azure-openai';

// System prompt for dialogue extraction
const SYSTEM_PROMPT = `You are an expert script analyst specializing in dialogue extraction. 
Your task is to extract all dialogue exchanges from screenplay text, maintaining the character names, 
their lines, and any emotional context or parenthetical direction.`;

export async function POST(request: NextRequest) {
  try {
    const { scriptText, episodeData } = await request.json();
    
    if (!scriptText && !episodeData) {
      return NextResponse.json(
        { error: 'No script content provided' },
        { status: 400 }
      );
    }
    
    // Determine what content to process
    const contentToProcess = scriptText || (
      episodeData?.script || 
      (episodeData?.scenes ? JSON.stringify(episodeData.scenes) : null)
    );
    
    if (!contentToProcess) {
      return NextResponse.json(
        { error: 'No valid script content found in the provided data' },
        { status: 400 }
      );
    }
    
    // Create user prompt based on the content
    const userPrompt = `
    Extract all dialogues from the following screenplay text. 
    For each dialogue, include:
    1. The character's name (exactly as written)
    2. The dialogue line(s)
    3. Any emotional direction or parenthetical notes
    
    Format the output as JSON:
    
    {
      "dialogues": [
        {
          "character": "CHARACTER_NAME",
          "line": "What the character says",
          "emotion": "angry" // or any other emotional context, if present
        },
        // ... more dialogues
      ]
    }
    
    If no dialogues are found, return an empty array.
    
    SCREENPLAY TEXT:
    ${contentToProcess}
    `;
    
    // Use GPT-4.1 (beast mode) for best dialogue extraction
    console.log('Extracting dialogues from script text...');
    const extractedContent = await generateContent(userPrompt, {
      systemPrompt: SYSTEM_PROMPT,
      model: 'gpt-4.1',
      temperature: 0.3, // Lower temperature for more consistent extraction
      maxTokens: 8000
    });
    
    // Parse the response
    let dialogues = [];
    try {
      // Extract JSON content from the response
      const jsonMatch = extractedContent.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                       extractedContent.match(/(\{[\s\S]*\})/);
                       
      if (jsonMatch && jsonMatch[1]) {
        const parsedData = JSON.parse(jsonMatch[1].trim());
        dialogues = parsedData.dialogues || [];
      } else {
        // Try direct parsing
        const parsedData = JSON.parse(extractedContent);
        dialogues = parsedData.dialogues || [];
      }
    } catch (error) {
      console.error('Error parsing dialogue extraction response:', error);
      // Return the raw AI response if parsing fails
      return NextResponse.json({
        success: true,
        dialogues: [],
        rawResponse: extractedContent
      });
    }
    
    return NextResponse.json({
      success: true,
      dialogues
    });
    
  } catch (error) {
    console.error('Error extracting dialogues:', error);
    return NextResponse.json(
      { error: 'Failed to extract dialogues', details: (error as Error).message },
      { status: 500 }
    );
  }
} 