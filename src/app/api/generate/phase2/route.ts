import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Primary model
const PRIMARY_MODEL = 'gemini-3-pro-preview';

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY || '')

/**
 * Generate content with Gemini
 */
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  console.log(`🚀 [PHASE2] Using model: ${PRIMARY_MODEL}`)
  const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

// Cache for storing image URLs to prevent duplicate searches
const imageCache: { [key: string]: string } = {}

async function findStockImage(prompt: string, type: string): Promise<string> {
  const cacheKey = `${type}:${prompt}`
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey]
  }

  try {
    const response = await fetch('/api/generate/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.slice(0, 150), // Limit prompt length for performance
        type,
      }),
    })

    if (!response.ok) {
      console.error('Failed to fetch image:', await response.text())
      return '/placeholder.jpg'
    }

    const data = await response.json()
    imageCache[cacheKey] = data.imageUrl
    return data.imageUrl
  } catch (error) {
    console.error('Error finding stock image:', error)
    return '/placeholder.jpg'
  }
}

async function processVisualContent(content: any) {
  const imagePromises = [
    // Concept Art
    findStockImage(content.visual.conceptArt.description, 'concept'),
    // Style Guide
    findStockImage(content.visual.styleGuide.moodDescription, 'mood'),
    // Locations
    ...content.visual.locations.map((loc: any) =>
      findStockImage(loc.description, 'location')
    ),
    // Costumes
    ...content.visual.costumes.map((costume: any) =>
      findStockImage(costume.description, 'costume')
    ),
  ]

  const imageUrls = await Promise.all(imagePromises)

  // Update content with image URLs
  content.visual.conceptArt.imageUrl = imageUrls[0]
  content.visual.styleGuide.imageUrl = imageUrls[1]

  let urlIndex = 2
  for (const location of content.visual.locations) {
    location.imageUrl = imageUrls[urlIndex++]
  }
  for (const costume of content.visual.costumes) {
    costume.imageUrl = imageUrls[urlIndex++]
  }

  return content
}

export async function POST(request: Request) {
  try {
    const { synopsis, theme } = await request.json()

    // Input validation
    if (!synopsis || !theme) {
      return NextResponse.json(
        { error: 'Synopsis and theme are required' },
        { status: 400 }
      )
    }

    // Create a detailed prompt for Phase 2 pre-production content
    const prompt = `As a film pre-production expert, create a detailed Phase 2 pre-production plan for a film with the following synopsis: "${synopsis}" and theme: "${theme}".

The response should be a JSON object with the following structure:

{
  "visual": {
    "conceptArt": {
      "description": "Detailed visual description for finding reference images"
    },
    "styleGuide": {
      "colorPalette": ["#hex1", "#hex2", ...],
      "moodDescription": "Detailed mood description for finding reference images"
    },
    "locations": [
      {
        "name": "Location name",
        "description": "Detailed visual description for finding reference images"
      }
    ],
    "costumes": [
      {
        "character": "Character name",
        "description": "Detailed costume description for finding reference images"
      }
    ]
  },
  "production": {
    "budget": {
      "total": number,
      "breakdown": [
        {
          "category": "Category name",
          "amount": number,
          "details": "Detailed breakdown"
        }
      ]
    },
    "schedule": {
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "phases": [
        {
          "name": "Phase name",
          "duration": "Duration in weeks",
          "tasks": ["Task 1", "Task 2"]
        }
      ]
    },
    "resources": {
      "crew": [
        {
          "role": "Role name",
          "count": number,
          "responsibilities": ["Responsibility 1", "Responsibility 2"]
        }
      ],
      "equipment": [
        {
          "category": "Category name",
          "items": ["Item 1", "Item 2"]
        }
      ]
    },
    "riskAssessment": [
      {
        "risk": "Risk description",
        "impact": "Low|Medium|High",
        "mitigation": "Mitigation strategy"
      }
    ]
  },
  "technical": {
    "shotList": [
      {
        "scene": "Scene description",
        "shots": [
          {
            "number": "Shot number",
            "description": "Shot description",
            "duration": "Duration",
            "camera": "Camera details",
            "notes": "Optional notes"
          }
        ]
      }
    ],
    "equipment": [
      {
        "category": "Category name",
        "items": [
          {
            "name": "Equipment name",
            "specs": "Technical specifications",
            "quantity": number
          }
        ]
      }
    ],
    "technical": {
      "lighting": ["Lighting requirement 1", "Lighting requirement 2"],
      "sound": ["Sound requirement 1", "Sound requirement 2"],
      "setup": ["Setup requirement 1", "Setup requirement 2"]
    },
    "vfx": [
      {
        "scene": "Scene description",
        "description": "VFX description",
        "requirements": ["Requirement 1", "Requirement 2"],
        "complexity": "Low|Medium|High"
      }
    ]
  }
}

Focus on providing detailed visual descriptions that can be used to find reference images. Make the content realistic and professional.`

    // Generate the content with fallback for 429 rate limits
    const text = await generateWithGemini(prompt)

    // Parse the response as JSON
    let content
    try {
      content = JSON.parse(text)
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return NextResponse.json(
        { error: 'Failed to generate valid content' },
        { status: 500 }
      )
    }

    // Process visual content to add image URLs
    content = await processVisualContent(content)

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
} 