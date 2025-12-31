import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Primary model
const PRIMARY_MODEL = 'gemini-3-pro-preview';

/**
 * Generate content with Gemini
 */
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const genAI = new GoogleGenerativeAI(apiKey)
  console.log(`🚀 [TRANSLATE] Using model: ${PRIMARY_MODEL}`)
  const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function POST(request: Request) {
  try {
    const { script } = await request.json()

    const prompt = `Translate this script into Taglish (a combination of Tagalog and English). Follow these guidelines:

1. Keep character names, scene headings, and technical directions in English
2. Translate dialogue into natural, conversational Taglish
3. Keep English words that are commonly used in Filipino conversations
4. Maintain the script's original formatting and structure
5. Keep emotion indicators and action descriptions clear and understandable
6. Preserve any cultural references or idioms, adapting them to Filipino context when appropriate

Original script:
${script}

Please translate the dialogue while maintaining the script format.`

    // Use generateWithGemini
    const translatedScript = await generateWithGemini(prompt)

    return NextResponse.json({ translatedScript })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to translate script to Taglish' },
      { status: 500 }
    )
  }
} 