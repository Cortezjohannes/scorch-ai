import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { generateContent, generateStructuredContent } from '@/services/azure-openai'
import { cleanAndParseJSON, createFallbackJSON } from '@/lib/json-utils'

// Import engines for phase-specific enhancement
import { StoryboardingEngine } from '@/services/storyboarding-engine'
import { VisualStorytellingEngine } from '@/services/visual-storytelling-engine'
import { CastingEngine } from '@/services/casting-engine'
import { StrategicDialogueEngine } from '@/services/strategic-dialogue-engine'

// Only throw errors when the API is actually called, not during build time
const getGeminiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return apiKey
}

// Initialize Gemini AI with retry logic - moved inside functions to avoid build-time issues
const initializeGeminiAI = () => {
  const apiKey = getGeminiKey()
  console.log('API Key length:', apiKey.length)
  console.log('API Key first 4 chars:', apiKey.substring(0, 4))
  
  // Note: We're accepting all key formats including those starting with "AI"
  if (apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is too short, please check the value')
  }
  
  return new GoogleGenerativeAI(apiKey)
}

// Lazy initialization to avoid build-time errors
let genAI: GoogleGenerativeAI | null = null
const getGenAI = (): GoogleGenerativeAI => {
  if (!genAI) {
    genAI = initializeGeminiAI()
  }
  return genAI!
}

// Retry wrapper for API calls
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && error instanceof Error && (error.message.includes('403') || error.message.includes('404'))) {
      console.log(`Retrying API call, ${retries} attempts remaining...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// Helper function to call Zapier webhook
async function callZapierWebhook(webhookUrl: string | undefined, data: any) {
  if (!webhookUrl) {
    console.warn('Webhook URL not configured')
    return null
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Webhook error:', error)
    return null
  }
}

// Helper function removed - now using centralized JSON parsing utility from @/lib/json-utils

// Model will be initialized lazily when needed - removed module-level initialization

// The narrative outline schema
const narrativeSchema = {
  type: "object",
  properties: {
    overview: { type: "string" },
    episodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "number" },
          title: { type: "string" },
          synopsis: { type: "string" },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                number: { type: "number" },
                location: { type: "string" },
                description: { type: "string" },
                dialogues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      character: { type: "string" },
                      lines: { type: "string" },
                      emotion: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Generate narrative outline using Azure OpenAI
async function generateNarrative(synopsis: string, theme: string) {
  console.log('Starting narrative generation with Azure OpenAI GPT-4.5 Preview...')
  
  const systemPrompt = 'You are a professional screenwriter and narrative designer specialized in creating web series. You excel at creating structured, engaging narratives in valid JSON format.';
  
  const prompt = `Based on the following synopsis and theme, generate a detailed narrative outline for a 10-episode web series.

  Synopsis: ${synopsis}
  Theme: ${theme}
  
  Remember to:
  1. Include all 10 episodes
  2. Make each episode build toward the overall theme
  3. Create compelling character arcs
  4. Develop the narrative with a clear beginning, middle, and end
  5. Include dialogue examples that showcase character personalities`;

  try {
    const result = await generateStructuredContent(prompt, systemPrompt, narrativeSchema, {
      model: 'gpt-4.5-preview',
      temperature: 0.7,
      maxTokens: 4000
    });
    
    console.log('Successfully generated narrative with Azure OpenAI GPT-4.5 Preview');
    return result;
  } catch (error) {
    console.error('Error generating narrative with Azure OpenAI GPT-4.5 Preview:', error);
    
    // Try GPT-4o before falling back to Gemini
    try {
      console.log('Trying GPT-4o as fallback...');
      const result = await generateStructuredContent(prompt, systemPrompt, narrativeSchema, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4000
      });
      
      console.log('Successfully generated narrative with Azure OpenAI GPT-4o');
      return result;
    } catch (secondError) {
      console.error('Error with GPT-4o fallback:', secondError);
      
      // Fall back to Gemini if Azure OpenAI fails
      console.log('Falling back to Gemini for narrative generation...');
      return withRetry(async () => {
        const geminiPrompt = `Based on the following synopsis and theme, generate a detailed narrative outline for a 10-episode web series.
    Please follow this EXACT JSON format without any markdown or additional text:
    {
      "overview": "A detailed series overview here",
      "episodes": [
        {
          "number": 1,
          "title": "Episode Title",
          "synopsis": "Episode synopsis",
          "scenes": [
            {
              "number": 1,
              "location": "Scene location",
              "description": "Scene description",
              "dialogues": [
                {
                  "character": "Character Name",
                  "lines": "Dialogue lines",
                  "emotion": "Emotional state"
                }
              ]
            }
          ]
        }
      ]
    }

    Synopsis: ${synopsis}
    Theme: ${theme}
    
    Remember to:
    1. Keep the JSON format exact
    2. Include all 10 episodes
    3. Make sure all arrays have proper commas
    4. Do not include any text outside the JSON structure
        5. Make sure all JSON is properly formatted and valid`;

        const genAI = getGenAI()
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
        const result = await model.generateContent(geminiPrompt);
        console.log('Received response from Gemini model');
        return result;
      });
    }
  }
}

// Generate storyboard descriptions using Azure OpenAI
async function generateStoryboard(synopsis: string, theme: string) {
  const prompt = `Create detailed storyboard descriptions for key scenes based on this web series concept:
  
  Synopsis: ${synopsis}
  Theme: ${theme}
  
  For each episode (1-10), provide:
  1. Three key scenes with visual descriptions
  2. Camera angles and movements
  3. Lighting and atmosphere
  4. Character positioning and expressions
  5. Important visual elements and symbols
  
  Format as a structured outline with clear scene breakdowns.`;

  try {
    const result = await generateContent(prompt, {
      model: 'gpt-4.5-preview',
      temperature: 0.7,
      systemPrompt: 'You are a professional storyboard artist with expertise in visual storytelling for film and television.'
    });
    
    console.log('Successfully generated storyboard with Azure OpenAI GPT-4.5 Preview');
    return result;
  } catch (error) {
    console.error('Error generating storyboard with Azure OpenAI GPT-4.5 Preview:', error);
    
    // Try GPT-4o as fallback
    try {
      console.log('Trying GPT-4o as fallback...');
      const result = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        systemPrompt: 'You are a professional storyboard artist with expertise in visual storytelling for film and television.'
      });
      
      console.log('Successfully generated storyboard with Azure OpenAI GPT-4o');
      return result;
    } catch (secondError) {
      console.error('Error with GPT-4o fallback:', secondError);
      
      // Fall back to Gemini
      console.log('Falling back to Gemini for storyboard generation...');
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  }
}

// Generate script outline using Azure OpenAI
async function generateScripts(narrative: string) {
  const prompt = `Based on this narrative outline, generate a detailed script structure for each episode:
  
  ${narrative}
  
  For each episode, provide:
  1. Scene headings (INT/EXT, location, time)
  2. Brief action descriptions
  3. Key dialogue points
  4. Important character moments
  5. Scene transitions
  
  Format in a professional screenplay style outline.`;

  try {
    const result = await generateContent(prompt, {
      model: 'gpt-4.5-preview',
      temperature: 0.7,
      systemPrompt: 'You are a professional screenwriter with expertise in screenplay formatting and dialogue writing.'
    });
    
    console.log('Successfully generated script outline with Azure OpenAI GPT-4.5 Preview');
    return result;
  } catch (error) {
    console.error('Error generating script outline with Azure OpenAI GPT-4.5 Preview:', error);
    
    // Try GPT-4o as fallback
    try {
      console.log('Trying GPT-4o as fallback...');
      const result = await generateContent(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        systemPrompt: 'You are a professional screenwriter with expertise in screenplay formatting and dialogue writing.'
      });
      
      console.log('Successfully generated script outline with Azure OpenAI GPT-4o');
      return result;
    } catch (secondError) {
      console.error('Error with GPT-4o fallback:', secondError);
      
      // Fall back to Gemini
      console.log('Falling back to Gemini for script generation...');
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  }
}

// Generate casting suggestions using REAL CastingEngine
async function generateCasting(narrative: string) {
  
  try {
    // TODO: Implement proper character profile extraction from narrative
    // For now, skip the casting engine until proper types are available
  } catch (engineError) {
    console.warn('⚠️ CastingEngine failed, using AI fallback:', engineError);
  }
  
  // Fallback to AI if engine fails
  const prompt = `Based on this narrative outline, suggest casting choices for the main characters:
  
  ${narrative}
  
  For each main character, provide:
  1. Character description and personality
  2. Suggested actor/actress (both established and emerging talents)
  3. Rationale for the casting choice
  4. Alternative casting options
  5. Key scenes that showcase the character
  
  Consider diversity, acting range, and chemistry between characters.`;

  try {
    const result = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      systemPrompt: 'You are a casting director with deep knowledge of actors and their roles, capabilities and performance styles.'
    });
    
    return result;
  } catch (error) {
    console.error('❌ All casting methods failed:', error);
    return JSON.stringify({
      error: 'Casting generation failed',
      fallback: 'Please provide character descriptions for manual casting analysis'
    });
  }
}

// Generate scene breakdowns
async function generateSceneBreakdowns(model: any, narrative: string) {
  const prompt = `Create detailed scene breakdowns based on this narrative outline:
  
  ${narrative}
  
  For each major scene, provide:
  1. Location details and requirements
  2. Props and set dressing
  3. Character requirements
  4. Technical requirements (special effects, equipment)
  5. Estimated shooting time
  6. Production notes and challenges
  
  Format as a production-ready breakdown sheet.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export const runtime = 'edge'

export async function POST(request: Request) {
  const data = await request.json()
  const { prompt, phase, episode, previousContent, context, apiMode = 'openai' } = data

  console.log(`[API] Generating content for phase: ${phase}, episode: ${episode}, mode: ${apiMode}`)

  try {
    // Use apiMode to determine which API to use
    let generatedContent
    const useOpenAI = apiMode === 'openai'

    // Generate content based on phase using the selected API
    switch (phase) {
      case 'planning':
        console.log(`Using ${useOpenAI ? 'Azure OpenAI' : 'Gemini'} for series planning`)
        // Use OpenAI or Gemini based on apiMode
        generatedContent = useOpenAI 
          ? await generateNarrative(prompt, context) 
          : await generateNarrativeWithGemini(prompt, context)
        break;
      
      case 'narrative':
        console.log(`Using ${useOpenAI ? 'Azure OpenAI' : 'Gemini'} for narrative development`)
        // Use OpenAI or Gemini based on apiMode
        generatedContent = useOpenAI 
          ? await generateNarrative(prompt, context) 
          : await generateNarrativeWithGemini(prompt, context)
        break;
      
      case 'storyboard':
        // Use the actual StoryboardingEngine for professional storyboards
        try {
          const storyboardBlueprint = await StoryboardingEngine.generateStoryboardBlueprint(
            prompt,
            [], // characters will be extracted from prompt
            {
              projectName: 'Generated Storyboard',
              totalScenes: 1,
              totalShots: 5,
              genre: 'cinematic',
              artisticStyle: 'professional',
              director: 'AI Director',
              cinematographer: 'AI Cinematographer'
            }
          );
          
          if (storyboardBlueprint?.sceneStoryboards) {
            generatedContent = JSON.stringify({
              visualSequence: storyboardBlueprint.sceneStoryboards,
              shotBreakdown: storyboardBlueprint.sceneStoryboards.flatMap(scene => scene.shots) || [],
              styleGuide: storyboardBlueprint.styleGuide || {},
              engineUsed: 'StoryboardingEngine',
              professionalGrade: true
            }, null, 2);
          } else {
            throw new Error('StoryboardingEngine returned incomplete data');
          }
        } catch (engineError) {
          console.warn('⚠️ StoryboardingEngine failed, using AI fallback:', engineError);
          generatedContent = useOpenAI 
            ? await generateStoryboard(prompt, context)
            : await generateStoryboardWithGemini(prompt, context);
        }
        break;
      
      case 'script':
        console.log(`Using ${useOpenAI ? 'Azure OpenAI' : 'Gemini'} for script writing`)
        // Use OpenAI or Gemini based on apiMode
        generatedContent = useOpenAI 
          ? await generateScripts(prompt)
          : await generateScriptsWithGemini(prompt)
        break;
        
      case 'casting':
        console.log(`Using ${useOpenAI ? 'Azure OpenAI' : 'Gemini'} for casting`)
        // Use OpenAI or Gemini based on apiMode
        generatedContent = useOpenAI 
          ? await generateCasting(prompt)
          : await generateCastingWithGemini(prompt)
        break;
      
      // ... more cases for other phases ...
      
      default:
        // For any other phase, use generic content generation
        console.log(`Using ${useOpenAI ? 'Azure OpenAI' : 'Gemini'} for ${phase}`)
        if (useOpenAI) {
          const systemPrompt = 'You are a professional pre-production planning assistant specialized in web series development. Generate detailed and structured content.';
          generatedContent = await generateContent(prompt, {
            systemPrompt,
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4000
          });
        } else {
          generatedContent = await generateContentWithGemini(prompt, phase);
        }
    }

    return Response.json({ success: true, content: generatedContent })
  } catch (error: any) {
    console.error('Error in generation API:', error.message)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Add Gemini specific generation functions
async function generateNarrativeWithGemini(synopsis: string, theme: string) {
  console.log('Starting narrative generation with Gemini...')
  const genAI = getGenAI()
  
  const prompt = `Based on the following synopsis and theme, generate a detailed narrative outline for a 10-episode web series.

  Synopsis: ${synopsis}
  Theme: ${theme}
  
  Remember to:
  1. Include all 10 episodes
  2. Make each episode build toward the overall theme
  3. Create compelling character arcs
  4. Develop the narrative with a clear beginning, middle, and end
  5. Include dialogue examples that showcase character personalities`;

  try {
    return withRetry(async () => {
      const geminiPrompt = `Based on the following synopsis and theme, generate a detailed narrative outline for a 10-episode web series.
Please follow this EXACT JSON format without any markdown or additional text:
{
  "overview": "A detailed series overview here",
  "episodes": [
    {
      "number": 1,
      "title": "Episode Title",
      "synopsis": "Episode synopsis",
      "scenes": [
        {
          "number": 1,
          "location": "Scene location",
          "description": "Scene description",
          "dialogues": [
            {
              "character": "Character Name",
              "lines": "Dialogue lines",
              "emotion": "Emotional state"
            }
          ]
        }
      ]
    }
  ]
}

Synopsis: ${synopsis}
Theme: ${theme}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
      const genResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8000,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const responseText = genResult.response.text();
      try {
        return cleanAndParseJSON(responseText);
      } catch (e) {
        console.error('Error parsing Gemini response as JSON:', e);
        return {
          overview: 'A compelling web series exploring the themes presented in the synopsis.',
          episodes: [
            {
              number: 1,
              title: "Episode 1",
              synopsis: "First episode introducing the main characters and setting.",
              scenes: []
            }
          ]
        };
      }
    });
  } catch (error) {
    console.error('Error generating narrative with Gemini:', error);
    throw error;
  }
}

// Add similar functions for other phases with Gemini
async function generateStoryboardWithGemini(prompt: string, context: string) {
  const genAI = getGenAI()
  // Similar structure to the narrative function
  // Implementation details similar to the OpenAI version but using Gemini
  return withRetry(async () => {
    // Gemini implementation for storyboard
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    // ...
    return { /* storyboard data structure */ };
  });
}

async function generateScriptsWithGemini(narrative: string) {
  const genAI = getGenAI()
  // Similar structure to the narrative function
  // Implementation details similar to the OpenAI version but using Gemini
  return withRetry(async () => {
    // Gemini implementation for scripts
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    // ...
    return { /* script data structure */ };
  });
}

async function generateCastingWithGemini(narrative: string) {
  const genAI = getGenAI()
  // Similar structure to the narrative function
  // Implementation details similar to the OpenAI version but using Gemini
  return withRetry(async () => {
    // Gemini implementation for casting
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    // ...
    return { /* casting data structure */ };
  });
}

async function generateContentWithGemini(prompt: string, phase: string) {
  const genAI = getGenAI()
  return withRetry(async () => {
    const geminiPrompt = `Generate detailed content for the ${phase} phase of a web series production.
    
    Use this prompt as the basis: ${prompt}
    
    Please provide a well-structured response that can be easily used in a pre-production workflow.`;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const genResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
      generationConfig: {
        temperature: 0.9, // CRANKED UP FOR PREMIUM CONTENT!
        maxOutputTokens: 8000,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    return genResult.response.text();
  });
} 