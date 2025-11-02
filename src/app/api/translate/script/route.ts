import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  try {
    const { script } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const translatedScript = response.text()

    return NextResponse.json({ translatedScript })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to translate script to Taglish' },
      { status: 500 }
    )
  }
} 