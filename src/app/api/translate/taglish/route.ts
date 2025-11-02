import { NextRequest, NextResponse } from 'next/server'
import { LanguageEngine } from '@/services/language-engine'
import type { TaglishTranslationRequest, TaglishSettings } from '@/services/language-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      script, 
      characters = [], 
      settings = {},
      quickTranslation = false 
    } = body

    // Validate required fields
    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Script content is required' },
        { status: 400 }
      )
    }

    console.log('🌏 Starting Taglish translation...')

    // Quick translation mode for simple use cases
    if (quickTranslation) {
      const intensity = settings.mixingIntensity || 'Moderate'
      const translatedScript = await LanguageEngine.quickTaglishTranslation(script, intensity)
      
      return NextResponse.json({
        success: true,
        translatedScript,
        mode: 'quick',
        message: 'Quick Taglish translation completed'
      })
    }

    // Full translation mode with character analysis
    const defaultSettings: TaglishSettings = {
      mixingIntensity: 'Moderate',
      regionalVariation: 'Manila',
      generationPreference: 'Mixed',
      formalityLevel: 'Conversational',
      culturalReferences: true,
      preserveEmotionalBeats: true,
      ...settings
    }

    const defaultContext = {
      genre: 'Drama',
      setting: 'Urban Manila',
      timeframe: 'Modern',
      audience: 'General' as const,
      tone: 'Casual' as const,
      ...body.context
    }

    const translationRequest: TaglishTranslationRequest = {
      originalScript: script,
      characters: characters,
      context: defaultContext,
      translationSettings: defaultSettings
    }

    // Perform full translation with character analysis
    const result = await LanguageEngine.translateToTaglish(translationRequest)

    console.log('✅ Taglish translation completed successfully')

    return NextResponse.json({
      success: true,
      ...result,
      mode: 'full',
      message: 'Full Taglish translation with character analysis completed'
    })

  } catch (error: any) {
    console.error('❌ Taglish translation API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Translation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 

// GET endpoint for translation settings and options
export async function GET() {
  return NextResponse.json({
    success: true,
    availableSettings: {
      mixingIntensity: ['Light', 'Moderate', 'Heavy'],
      regionalVariation: ['Manila', 'Cebu', 'Davao', 'General'],
      generationPreference: ['Gen Z', 'Millennial', 'Gen X', 'Mixed'],
      formalityLevel: ['Street', 'Conversational', 'Semi-Formal', 'Professional'],
      audience: ['General', 'Youth', 'Adult', 'Family'],
      tone: ['Casual', 'Formal', 'Dramatic', 'Comedy', 'Professional']
    },
    usage: {
      quickTranslation: {
        method: 'POST',
        body: {
          script: 'string (required)',
          quickTranslation: true,
          settings: {
            mixingIntensity: 'Light | Moderate | Heavy (optional, default: Moderate)'
          }
        }
      },
      fullTranslation: {
        method: 'POST',
        body: {
          script: 'string (required)',
          characters: 'array (optional)',
          context: 'object (optional)',
          settings: 'TaglishSettings object (optional)'
        }
      }
    }
  })
}
