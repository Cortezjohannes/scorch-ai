import { NextResponse } from 'next/server'

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ''
const UNSPLASH_API_URL = 'https://api.unsplash.com'

// Fallback images for different types
const FALLBACK_IMAGES: { [key: string]: string } = {
  concept: '/placeholders/concept.jpg',
  mood: '/placeholders/mood.jpg',
  location: '/placeholders/location.jpg',
  costume: '/placeholders/costume.jpg',
  default: '/placeholders/default.jpg',
}

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json()

    // Input validation
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // If no Unsplash API key is configured, return an error
    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Image generation is not properly configured',
      }, { status: 500 })
    }

    try {
      // Search Unsplash for relevant images
      const searchResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(
          prompt
        )}&per_page=1`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      )

      if (!searchResponse.ok) {
        throw new Error('Failed to fetch from Unsplash')
      }

      const searchData = await searchResponse.json()

      // If no images found, try a random image based on the type
      if (!searchData.results?.length) {
        const randomResponse = await fetch(
          `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(type)}`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        )

        if (!randomResponse.ok) {
          throw new Error('Failed to fetch random image from Unsplash')
        }

        const randomData = await randomResponse.json()
        return NextResponse.json({
          success: true,
          imageUrl: randomData.urls.regular,
          source: 'unsplash'
        })
      }

      // Return the first search result
      return NextResponse.json({
        success: true,
        imageUrl: searchData.results[0].urls.regular,
        source: 'unsplash'
      })
    } catch (error) {
      console.error('Unsplash API error:', error)
      // Return an error instead of a fallback image
      return NextResponse.json({
        success: false,
        error: 'Failed to generate image. Please try again with a different prompt.',
        prompt,
        type,
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request' 
      },
      { status: 500 }
    )
  }
} 