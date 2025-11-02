/**
 * AI Script Generator
 * Generates Hollywood-grade screenplays from episode content
 */

import { generateContent } from './azure-openai-client'

interface ScriptGenerationInput {
  episodeNumber: number
  episodeTitle: string
  episodeSynopsis?: string
  scenes: Array<{
    sceneNumber: number
    location: string
    timeOfDay: string
    content: string // Raw scene content from workspace
    characters?: string[]
  }>
  storyBible: {
    title: string
    genre?: string
    characters: Array<{
      name: string
      age?: number
      description: string
      traits?: string[]
    }>
  }
}

interface SceneScript {
  sceneNumber: number
  sceneHeading: string // INT./EXT. LOCATION - TIME
  action: string[] // Action paragraphs
  dialogue: Array<{
    character: string
    parenthetical?: string
    lines: string[]
  }>
}

interface ScriptGenerationOutput {
  episodes: {
    number: number
    title: string
    scenes: SceneScript[]
  }
}

/**
 * Generate formatted screenplay from episode content
 */
export async function generateScreenplay(
  input: ScriptGenerationInput
): Promise<SceneScript[]> {
  
  // Build comprehensive prompt
  const systemPrompt = `You are a professional screenwriter specializing in short-form web series.

Your task is to transform episode outlines into properly formatted, Hollywood-grade screenplays.

FORMATTING RULES:
1. Scene Headings: "INT./EXT. LOCATION - TIME" format
2. Action Lines: Present tense, visual descriptions, short paragraphs
3. Character Names: ALL CAPS on first appearance with (age, brief trait)
4. Dialogue: Natural, character-specific, authentic voice
5. Parentheticals: Brief actor direction (physical actions, tone only)

CONTENT RULES:
- Use ONLY the narrative elements provided
- DO NOT add new characters, locations, or plot points
- DO expand dialogue naturally (make it flow conversationally)
- DO add rich visual action lines (what camera sees)
- DO add character blocking and reactions
- DO maintain character voices from story bible

5-MINUTE EPISODE SPECIFICS:
- Target: 600-800 words total
- 4-6 pages of screenplay
- Every line must count
- Tight, economical storytelling
- Fast-paced dialogue
- Quick scene transitions

OUTPUT FORMAT: Return valid JSON matching the schema.`

  const userPrompt = `Generate a formatted screenplay for this episode:

EPISODE INFO:
- Number: ${input.episodeNumber}
- Title: "${input.episodeTitle}"
- Synopsis: ${input.episodeSynopsis || 'Not provided'}
- Genre: ${input.storyBible.genre || 'Drama'}
- Series: "${input.storyBible.title}"

CHARACTERS:
${input.storyBible.characters.map(c => 
  `- ${c.name}${c.age ? ` (${c.age})` : ''}: ${c.description}${c.traits ? ' - ' + c.traits.join(', ') : ''}`
).join('\n')}

SCENES TO WRITE:
${input.scenes.map(scene => `
Scene ${scene.sceneNumber}
Location: ${scene.location}
Time: ${scene.timeOfDay}
${scene.characters ? `Characters: ${scene.characters.join(', ')}` : ''}

Content:
${scene.content}
`).join('\n---\n')}

TASK:
Transform the above into a properly formatted screenplay with:
1. Scene headings in correct format (INT./EXT. LOCATION - TIME)
2. Rich action lines describing what we SEE (present tense, visual)
3. Expanded dialogue that flows naturally
4. Character introductions on first appearance
5. Parentheticals where helpful for actor direction
6. Natural blocking and reactions

CONSTRAINTS:
- Total length: 600-800 words
- Use ONLY the characters listed
- Use ONLY the locations provided
- Keep the same plot/narrative
- Expand dialogue to be conversational
- Add visual descriptions
- Character-specific dialogue voices

OUTPUT FORMAT (JSON):
{
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneHeading": "INT. COFFEE SHOP - DAY",
      "action": [
        "The morning sun streams through large windows. SARAH (28, determined, wearing business casual) sits at a corner table, laptop open, coffee untouched.",
        "She checks her phone nervously. Her leg bounces under the table."
      ],
      "dialogue": [
        {
          "character": "SARAH",
          "parenthetical": "without looking up",
          "lines": ["You're late."]
        },
        {
          "character": "MIKE",
          "lines": ["I know. I'm sorry. Traffic was--"]
        }
      ]
    }
  ]
}

Generate the screenplay now:`

  try {
    // Call Azure OpenAI with structured output
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      responseFormat: { type: 'json_object' }
    })

    // Parse response
    const parsed = JSON.parse(response)
    
    // Validate and return
    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      return parsed.scenes as SceneScript[]
    }

    throw new Error('Invalid response format from AI')
  } catch (error) {
    console.error('Error generating screenplay:', error)
    throw error
  }
}

/**
 * Generate script for a single scene
 */
export async function generateSingleScene(
  sceneInput: {
    sceneNumber: number
    location: string
    timeOfDay: string
    content: string
    characters: string[]
  },
  characterInfo: Array<{
    name: string
    age?: number
    description: string
  }>
): Promise<SceneScript> {
  
  const systemPrompt = `You are a professional screenwriter. Transform this scene outline into a properly formatted screenplay scene.`

  const userPrompt = `Write this scene in proper screenplay format:

Scene ${sceneInput.sceneNumber}
Location: ${sceneInput.location}
Time: ${sceneInput.timeOfDay}
Characters: ${sceneInput.characters.join(', ')}

Scene Content:
${sceneInput.content}

Character Info:
${characterInfo.map(c => `${c.name}${c.age ? ` (${c.age})` : ''}: ${c.description}`).join('\n')}

Format as JSON:
{
  "sceneNumber": ${sceneInput.sceneNumber},
  "sceneHeading": "INT./EXT. LOCATION - TIME",
  "action": ["action paragraph 1", "action paragraph 2"],
  "dialogue": [
    {
      "character": "CHARACTER",
      "parenthetical": "optional direction",
      "lines": ["dialogue line 1", "dialogue line 2"]
    }
  ]
}`

  try {
    const response = await generateContent(userPrompt, {
      systemPrompt,
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: { type: 'json_object' }
    })

    return JSON.parse(response) as SceneScript
  } catch (error) {
    console.error('Error generating scene:', error)
    throw error
  }
}

/**
 * Enhance existing dialogue (make it more natural/conversational)
 */
export async function enhanceDialogue(
  dialogue: string,
  characterName: string,
  characterTraits: string[]
): Promise<string[]> {
  
  const prompt = `Enhance this dialogue to be more natural and character-specific:

Character: ${characterName}
Traits: ${characterTraits.join(', ')}

Original Dialogue:
"${dialogue}"

Make it:
- More conversational
- Character-specific (match their traits)
- Natural speech patterns
- Authentic voice

Return as array of lines (if breaking into multiple lines).
Return JSON: { "lines": ["line 1", "line 2"] }`

  try {
    const response = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.8,
      maxTokens: 500,
      responseFormat: { type: 'json_object' }
    })

    const parsed = JSON.parse(response)
    return parsed.lines || [dialogue]
  } catch (error) {
    console.error('Error enhancing dialogue:', error)
    return [dialogue]
  }
}

/**
 * Generate action line from basic description
 */
export async function generateActionLine(
  basicDescription: string,
  visualStyle: 'cinematic' | 'naturalistic' | 'fast-paced' = 'cinematic'
): Promise<string> {
  
  const stylePrompts = {
    cinematic: 'Write it cinematically with attention to visual details and composition',
    naturalistic: 'Write it simply and clearly, focusing on what actors do',
    'fast-paced': 'Write it tersely and efficiently for fast-paced storytelling'
  }

  const prompt = `Convert this basic description into a proper screenplay action line:

"${basicDescription}"

Style: ${stylePrompts[visualStyle]}

Rules:
- Present tense
- Visual only (what camera sees)
- Active voice
- Short and punchy
- No camera directions

Return just the action line as text (not JSON).`

  try {
    const response = await generateContent(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 200
    })

    return response.trim()
  } catch (error) {
    console.error('Error generating action line:', error)
    return basicDescription
  }
}


