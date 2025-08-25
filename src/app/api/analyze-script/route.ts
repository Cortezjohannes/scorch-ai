import { NextResponse } from 'next/server';
import { generateContent } from '@/services/azure-openai';

// Initialize Gemini AI with API key - Using dynamic import to avoid webpack issues
const getGeminiClient = async () => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    if (apiKey.length < 10) {
      throw new Error('GEMINI_API_KEY is too short, please check the value');
    }
    
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    throw new Error('Failed to initialize AI client');
  }
};

// Using centralized JSON parsing from @/lib/json-utils instead of local safeParseJSON

// Generate props and wardrobe list from script
async function generatePropsAndWardrobe(scriptText: string) {
  try {
    // Try with Azure OpenAI
    const systemPrompt = `You are an experienced Production Designer for film and television productions. Your task is to analyze a screenplay and identify all props and wardrobe items needed for production. 

For PROPS, identify:
1. All physical objects that characters interact with or that are prominent in scenes
2. Set decoration elements that help establish the setting
3. Special items with narrative significance
4. Technology, vehicles, and other important objects

For WARDROBE, identify:
1. Specific clothing items for each character
2. Any costume changes between scenes
3. Accessories, makeup, and hair styling notes
4. Special wardrobe requirements (period pieces, special effects)

Organize your analysis by scene and character. Return your response as a structured JSON object with the format shown below. Be thorough but concise.`;

    const prompt = `Please analyze the following screenplay and create a comprehensive props and wardrobe list:

${scriptText.substring(0, 40000)}  # Limiting script length for token constraints

I need the analysis returned as a JSON object with the following structure:
{
  "props": [
    {
      "sceneName": "INT. LOCATION - TIME",
      "items": [
        {
          "name": "Item name",
          "description": "Brief description",
          "character": "Character who uses it (if applicable)",
          "significance": "Narrative significance (if any)"
        }
      ]
    }
  ],
  "wardrobe": [
    {
      "character": "Character name",
      "items": [
        {
          "sceneName": "INT. LOCATION - TIME",
          "description": "Detailed outfit description",
          "notes": "Any special requirements or significance"
        }
      ]
    }
  ]
}

Focus on items that are explicitly mentioned or strongly implied in the script.`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4.1',
        systemPrompt,
        temperature: 0.2,
        maxTokens: 4000
      });
      
      try {
        return cleanAndParseJSON(result);
      } catch (parseError) {
        console.error('JSON parsing failed for props/wardrobe (Azure), using fallback:', parseError instanceof Error ? parseError.message : 'Unknown error');
        return createFallbackJSON('props', result);
      }
    } catch (error) {
      console.log('Error with Azure OpenAI, falling back to Gemini:', error);
      
      // Fall back to Gemini
      return generatePropsAndWardrobeWithGemini(scriptText);
    }
  } catch (error) {
    console.error('Error generating props and wardrobe:', error);
    throw error;
  }
}

// Fallback to Gemini for props and wardrobe
async function generatePropsAndWardrobeWithGemini(scriptText: string) {
  console.log('Generating props and wardrobe with Gemini');
  
  try {
    // Use the stable mode model from environment variables or default
    const geminiModel = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-2.5-pro';
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: geminiModel });
    
    const prompt = `You are an experienced Production Designer. Please analyze this screenplay and create a detailed props and wardrobe list.

SCREENPLAY:
${scriptText.substring(0, 30000)}  # Limiting script length for token constraints

Return your analysis as a JSON object with this exact structure:
{
  "props": [
    {
      "sceneName": "Scene identifier (e.g., INT. BEDROOM - NIGHT)",
      "items": [
        {
          "name": "Item name",
          "description": "Brief description",
          "character": "Character who uses it (if applicable)",
          "significance": "Narrative significance (if any)"
        }
      ]
    }
  ],
  "wardrobe": [
    {
      "character": "Character name",
      "items": [
        {
          "sceneName": "Scene identifier",
          "description": "Detailed outfit description",
          "notes": "Any special requirements or significance"
        }
      ]
    }
  ]
}

Focus on items that are explicitly mentioned or strongly implied in the script. Be thorough and precise.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    try {
      return cleanAndParseJSON(responseText);
    } catch (error) {
      console.error('JSON parsing failed for props/wardrobe, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      return createFallbackJSON('props', responseText);
    }
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    throw error;
  }
}

// Generate marketing guide from script
async function generateMarketingGuide(scriptText: string) {
  try {
    // Try with Azure OpenAI
    const systemPrompt = `You are a senior Marketing Executive for a film production company. Your task is to analyze a screenplay and develop a comprehensive marketing strategy that aligns with the content, tone, and target audience of the film.

Your analysis should include:
1. Target Audience identification - primary and secondary demographics
2. Logline options - 1-2 sentence hooks that capture the essence of the story
3. Key selling points - unique aspects that make this project marketable
4. Visual style recommendations for marketing materials
5. Music and sound recommendations for trailers and promotion
6. Suggested taglines for posters and promotional material
7. Social media strategy approaches

Your expertise in film marketing allows you to identify the commercially appealing elements of the script and position them for maximum audience engagement. Return your response as a structured JSON object with clearly defined sections.`;

    const prompt = `Please analyze this screenplay and create a comprehensive marketing guide:

${scriptText.substring(0, 40000)}  # Limiting script length for token constraints

I need the analysis returned as a JSON object with the following structure:
{
  "targetAudience": {
    "primary": "Description of primary audience demographic",
    "secondary": "Description of secondary audience demographic"
  },
  "loglines": [
    "Compelling logline option 1",
    "Compelling logline option 2",
    "Compelling logline option 3"
  ],
  "taglines": [
    "Catchy tagline 1",
    "Catchy tagline 2",
    "Catchy tagline 3"
  ],
  "keySellingPoints": [
    "Unique selling point 1",
    "Unique selling point 2",
    "Unique selling point 3"
  ],
  "visualStyle": {
    "colorPalette": "Description of color scheme for marketing materials",
    "imageryThemes": "Description of visual motifs and themes to emphasize",
    "posterConcepts": ["Poster concept 1", "Poster concept 2"]
  },
  "audioStrategy": {
    "musicGenre": "Recommended music genre for trailers",
    "soundDesign": "Sound design elements to emphasize",
    "voiceoverTone": "Tone and style for any voiceover work"
  },
  "socialMediaStrategy": {
    "platforms": ["Platform 1", "Platform 2"],
    "contentApproach": "Overall approach for social content",
    "engagementIdeas": ["Engagement idea 1", "Engagement idea 2"]
  }
}`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4.1',
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4000
      });
      
      try {
        return cleanAndParseJSON(result);
      } catch (parseError) {
        console.error('JSON parsing failed for marketing (Azure), using fallback:', parseError instanceof Error ? parseError.message : 'Unknown error');
        return createFallbackJSON('marketing', result);
      }
    } catch (error) {
      console.log('Error with Azure OpenAI, falling back to Gemini:', error);
      
      // Fall back to Gemini
      return generateMarketingGuideWithGemini(scriptText);
    }
  } catch (error) {
    console.error('Error generating marketing guide:', error);
    throw error;
  }
}

// Fallback to Gemini for marketing guide
async function generateMarketingGuideWithGemini(scriptText: string) {
  console.log('Generating marketing guide with Gemini');
  
  try {
    // Use the stable mode model from environment variables or default
    const geminiModel = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-2.5-pro';
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: geminiModel });
    
    const prompt = `As a marketing executive, analyze this screenplay and create a detailed marketing guide:

SCREENPLAY:
${scriptText.substring(0, 30000)}  # Limiting script length for token constraints

Return your analysis as a JSON object with this exact structure:
{
  "targetAudience": {
    "primary": "Description of primary audience demographic",
    "secondary": "Description of secondary audience demographic"
  },
  "loglines": [
    "Compelling logline option 1",
    "Compelling logline option 2",
    "Compelling logline option 3"
  ],
  "taglines": [
    "Catchy tagline 1",
    "Catchy tagline 2",
    "Catchy tagline 3"
  ],
  "keySellingPoints": [
    "Unique selling point 1",
    "Unique selling point 2",
    "Unique selling point 3"
  ],
  "visualStyle": {
    "colorPalette": "Description of color scheme for marketing materials",
    "imageryThemes": "Description of visual motifs and themes to emphasize",
    "posterConcepts": ["Poster concept 1", "Poster concept 2"]
  },
  "audioStrategy": {
    "musicGenre": "Recommended music genre for trailers",
    "soundDesign": "Sound design elements to emphasize",
    "voiceoverTone": "Tone and style for any voiceover work"
  },
  "socialMediaStrategy": {
    "platforms": ["Platform 1", "Platform 2"],
    "contentApproach": "Overall approach for social content",
    "engagementIdeas": ["Engagement idea 1", "Engagement idea 2"]
  }
}

Be creative but strategic, focusing on marketable elements that would appeal to the appropriate audience for this project.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    try {
      return cleanAndParseJSON(responseText);
    } catch (parseError) {
      console.error('JSON parsing failed for marketing (Gemini), using fallback:', parseError instanceof Error ? parseError.message : 'Unknown error');
      return createFallbackJSON('marketing', responseText);
    }
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    throw error;
  }
}

// Generate post-production brief from script
async function generatePostProductionBrief(scriptText: string) {
  try {
    // Try with Azure OpenAI
    const systemPrompt = `You are a highly experienced Film Editor and Post-Production Supervisor. Your task is to analyze a screenplay and create a comprehensive post-production brief that will guide the editing process. 

Your brief should include:
1. Overall editing style and pacing recommendations that match the genre and tone
2. Scene-by-scene editing guidance with specific notes on pacing, transitions, and emotional tone
3. Color grading recommendations that enhance the visual storytelling
4. Sound design elements that should be emphasized for each major scene
5. Music cues and style recommendations for the soundtrack
6. Special effects or visual effects requirements
7. Key moments that should receive special attention during the editing process

Your expertise allows you to translate the written script into a technical roadmap for the post-production team. Return your response as a structured JSON object with clearly defined sections.`;

    const prompt = `Please analyze this screenplay and create a detailed post-production brief:

${scriptText.substring(0, 40000)}  # Limiting script length for token constraints

I need the analysis returned as a JSON object with the following structure:
{
  "overallStyle": {
    "editingStyle": "Description of overall editing approach",
    "colorGradingPalette": "Color grading recommendations",
    "musicGenre": "Overall music style for soundtrack",
    "pacingNotes": "Notes on overall pacing"
  },
  "sceneBySceneGuide": [
    {
      "sceneName": "INT. LOCATION - TIME",
      "pacing": "Fast/medium/slow with specific suggestions",
      "transitions": "Recommended transitions into and out of scene",
      "emotionalKeywords": ["keyword1", "keyword2"],
      "colorGrading": "Specific color notes for this scene",
      "soundDesign": "Sound design elements to emphasize",
      "musicCues": "Music suggestions for this scene",
      "specialNotes": "Any additional post-production notes"
    }
  ],
  "keyMoments": [
    {
      "description": "Description of a key moment",
      "timestamp": "Scene identifier",
      "editingNotes": "Specific editing techniques to use",
      "importance": "Why this moment matters narratively"
    }
  ],
  "technicalRequirements": {
    "visualEffects": ["VFX requirement 1", "VFX requirement 2"],
    "soundEffects": ["SFX requirement 1", "SFX requirement 2"],
    "specialTechniques": ["Technique 1", "Technique 2"]
  }
}`;

    try {
      const result = await generateContent(prompt, {
        model: 'gpt-4.1',
        systemPrompt,
        temperature: 0.3,
        maxTokens: 4000
      });
      
      try {
        return cleanAndParseJSON(result);
      } catch (parseError) {
        console.error('JSON parsing failed for post-production (Azure), using fallback:', parseError instanceof Error ? parseError.message : 'Unknown error');
        return createFallbackJSON('postProduction', result);
      }
    } catch (error) {
      console.log('Error with Azure OpenAI, falling back to Gemini:', error);
      
      // Fall back to Gemini
      return generatePostProductionBriefWithGemini(scriptText);
    }
  } catch (error) {
    console.error('Error generating post-production brief:', error);
    throw error;
  }
}

// Fallback to Gemini for post-production brief
async function generatePostProductionBriefWithGemini(scriptText: string) {
  console.log('Generating post-production brief with Gemini');
  
  try {
    // Use the stable mode model from environment variables or default
    const geminiModel = process.env.GEMINI_STABLE_MODE_MODEL || 'gemini-2.5-pro';
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: geminiModel });
    
    const prompt = `As a Film Editor and Post-Production Supervisor, analyze this screenplay and create a detailed post-production brief:

SCREENPLAY:
${scriptText.substring(0, 30000)}  # Limiting script length for token constraints

Return your analysis as a JSON object with this exact structure:
{
  "overallStyle": {
    "editingStyle": "Description of overall editing approach",
    "colorGradingPalette": "Color grading recommendations",
    "musicGenre": "Overall music style for soundtrack",
    "pacingNotes": "Notes on overall pacing"
  },
  "sceneBySceneGuide": [
    {
      "sceneName": "INT. LOCATION - TIME",
      "pacing": "Fast/medium/slow with specific suggestions",
      "transitions": "Recommended transitions into and out of scene",
      "emotionalKeywords": ["keyword1", "keyword2"],
      "colorGrading": "Specific color notes for this scene",
      "soundDesign": "Sound design elements to emphasize",
      "musicCues": "Music suggestions for this scene",
      "specialNotes": "Any additional post-production notes"
    }
  ],
  "keyMoments": [
    {
      "description": "Description of a key moment",
      "timestamp": "Scene identifier",
      "editingNotes": "Specific editing techniques to use",
      "importance": "Why this moment matters narratively"
    }
  ],
  "technicalRequirements": {
    "visualEffects": ["VFX requirement 1", "VFX requirement 2"],
    "soundEffects": ["SFX requirement 1", "SFX requirement 2"],
    "specialTechniques": ["Technique 1", "Technique 2"]
  }
}

Be detailed and technical, focusing on creating a practical guide for the post-production team.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    try {
      return cleanAndParseJSON(responseText);
    } catch (parseError) {
      console.error('JSON parsing failed for post-production (Gemini), using fallback:', parseError instanceof Error ? parseError.message : 'Unknown error');
      return createFallbackJSON('postProduction', responseText);
    }
  } catch (error) {
    console.error('Error generating with Gemini:', error);
    throw error;
  }
}

// Main API handler
export async function POST(request: Request) {
  try {
    const { scriptText, task } = await request.json();
    
    if (!scriptText) {
      return NextResponse.json(
        { error: 'Script text is required' },
        { status: 400 }
      );
    }
    
    if (!task) {
      return NextResponse.json(
        { error: 'Analysis task is required' },
        { status: 400 }
      );
    }
    
    console.log(`Analyzing script for task: ${task}`);
    
    let result;
    
    switch (task) {
      case 'props_wardrobe':
        result = await generatePropsAndWardrobe(scriptText);
        break;
      case 'marketing':
        result = await generateMarketingGuide(scriptText);
        break;
      case 'post_production_brief':
        result = await generatePostProductionBrief(scriptText);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid task. Supported tasks: props_wardrobe, marketing, post_production_brief' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Script analysis API error:', error.message);
    
    return NextResponse.json(
      { error: error.message || 'Script analysis failed' },
      { status: 500 }
    );
  }
} 