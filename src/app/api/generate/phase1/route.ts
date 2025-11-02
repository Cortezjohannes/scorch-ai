import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Initialize Gemini AI with retry logic
const initializeGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  // Note: We're accepting all key formats including those starting with "AI"
  if (apiKey.length < 10) {
    throw new Error('GEMINI_API_KEY is too short, please check the value')
  }
  
  return new GoogleGenerativeAI(apiKey)
}

const genAI = initializeGeminiAI()
const imageCache = new Map<string, string>()

// Retry wrapper for API calls
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('403')) {
      console.log(`Retrying API call, ${retries} attempts remaining...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

async function findStockImage(prompt: string, type: string): Promise<string> {
  const cacheKey = `${type}-${prompt}`
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!
  }

  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return `/placeholders/${type}.jpg`
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        prompt
      )}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const data = await response.json()
    const imageUrl = data.results[0]?.urls?.regular

    if (!imageUrl) {
      const randomResponse = await fetch(
        'https://api.unsplash.com/photos/random',
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        }
      )

      if (!randomResponse.ok) {
        throw new Error('Failed to fetch random image')
      }

      const randomData = await randomResponse.json()
      const randomImageUrl = randomData?.urls?.regular

      if (!randomImageUrl) {
        throw new Error('No random image found')
      }

      imageCache.set(cacheKey, randomImageUrl)
      return randomImageUrl
    }

    imageCache.set(cacheKey, imageUrl)
    return imageUrl
  } catch (error) {
    console.error('Error fetching image:', error)
    return `/placeholders/${type}.jpg`
  }
}

async function processNarrativeContent(content: any) {
  const { overview, plotPoints, characters, themes } = content

  // Add images to overview
  overview.imageUrl = await findStockImage(overview.summary, 'concept')

  // Add images to plot points
  for (const point of plotPoints) {
    point.imageUrl = await findStockImage(point.title, 'concept')
  }

  // Add images to characters
  for (const character of characters) {
    character.imageUrl = await findStockImage(character.name, 'concept')
  }

  // Add images to themes
  for (const theme of themes) {
    theme.imageUrl = await findStockImage(theme.name, 'mood')
  }

  return { overview, plotPoints, characters, themes }
}

async function processStoryboardContent(content: any) {
  const { scenes, visualStyle, transitions } = content

  // Add images to scenes
  for (const scene of scenes) {
    for (const shot of scene.shots) {
      shot.imageUrl = await findStockImage(shot.description, 'concept')
    }
  }

  // Add images to visual style moodboard
  for (const item of visualStyle.moodboard) {
    item.imageUrl = await findStockImage(item.description, 'mood')
  }

  // Add images to transitions
  for (const transition of transitions) {
    transition.imageUrl = await findStockImage(transition.description, 'concept')
  }

  return { scenes, visualStyle, transitions }
}

async function processScriptContent(content: any) {
  const { scenes, dialogues, directions } = content

  // Add images to scenes
  for (const scene of scenes) {
    scene.imageUrl = await findStockImage(scene.title, 'location')
  }

  // Add images to dialogues
  for (const dialogue of dialogues) {
    dialogue.imageUrl = await findStockImage(dialogue.character, 'concept')
  }

  // Add images to directions
  for (const direction of directions) {
    direction.imageUrl = await findStockImage(direction.type, 'concept')
  }

  return { scenes, dialogues, directions }
}

async function processCastingContent(content: any) {
  const { roles, requirements, notes } = content

  // Add images to roles
  for (const role of roles) {
    role.imageUrl = await findStockImage(role.character, 'concept')
  }

  // Add images to requirements skills
  for (const skill of requirements.skills) {
    skill.imageUrl = await findStockImage(skill.name, 'concept')
  }

  // Add images to notes
  for (const note of notes) {
    note.imageUrl = await findStockImage(note.title, 'concept')
  }

  return { roles, requirements, notes }
}

// Only throw errors when the API is actually called, not during build time
const getGeminiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return apiKey
}

export async function POST(request: Request) {
  try {
    // Get API key only when the function is called
    const apiKey = getGeminiKey()
    
    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

    // Get the request body
    const { theme, concept, characters } = await request.json()

    if (!theme || !concept || !characters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate the script
    const prompt = `Create a 10-episode TV series outline based on the following theme and concept:

Theme: ${theme}
Concept: ${concept}
Characters: ${characters}

Format your response as a JSON object with the following structure:
{
  "series_title": "Title of the series",
  "episodes": [
    {
      "number": 1,
      "title": "Episode title",
      "synopsis": "Brief description of the episode"
    },
    // More episodes...
  ]
}

Keep each episode synopsis concise, around 2-3 sentences. Generate exactly 10 episodes.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Attempt to parse the JSON
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : text
      const data = JSON.parse(jsonStr)
      return NextResponse.json(data)
    } catch (error) {
      console.error('Failed to parse JSON from AI response:', error)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
} 