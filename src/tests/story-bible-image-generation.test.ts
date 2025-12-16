/**
 * Story Bible Image Generation Test Suite
 * 
 * Comprehensive automated tests for Story Bible image generation functionality
 * Tests cover: art style generation, prompt construction, API integration, caching, and error handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  generateStoryBibleStyle,
  applyStoryBibleStyleToPrompt,
  extractGenreAndTone,
  buildSemiRealisticPromptModifier,
  type StoryBibleImageType,
  type StoryBibleImageStyle
} from '@/services/story-bible-art-style'
import {
  generateHeroImage,
  generateCharacterImage,
  generateArcKeyArt,
  generateLocationConcept,
  generateStoryBibleImages,
  type GenerationProgress
} from '@/services/ai-generators/story-bible-image-generator'
import type { StoryBible } from '@/services/story-bible-service'

// Mock Gemini image generator
jest.mock('@/services/gemini-image-generator', () => ({
  generateImageWithGemini: jest.fn()
}))

// Mock image storage service
jest.mock('@/services/image-storage-service', () => ({
  uploadBase64ToStorage: jest.fn()
}))

// Mock image cache service
jest.mock('@/services/image-cache-service', () => ({
  getCachedImage: jest.fn(),
  saveCachedImage: jest.fn()
}))

describe('Story Bible Image Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Art Style Generation', () => {
    it('should generate default style for drama genre', () => {
      const style = generateStoryBibleStyle('drama', 'realistic', 'character-portrait')
      
      expect(style.name).toBe('Semi-Realistic Concept Art')
      expect(style.renderingStyle).toBe('semi-realistic concept art')
      expect(style.colorTreatment).toContain('cinematic')
    })

    it('should adjust style for comedy genre', () => {
      const style = generateStoryBibleStyle('comedy', 'light', 'character-portrait')
      
      expect(style.colorTreatment).toContain('bright')
      expect(style.colorTreatment).toContain('vibrant')
      expect(style.lighting).toContain('soft')
      expect(style.genreAdaptation).toContain('lighthearted')
    })

    it('should adjust style for horror genre', () => {
      const style = generateStoryBibleStyle('horror', 'dark', 'location-concept')
      
      expect(style.colorTreatment).toContain('muted')
      expect(style.colorTreatment).toContain('desaturated')
      expect(style.lighting).toContain('moody')
      expect(style.genreAdaptation).toContain('dark')
    })

    it('should adjust style for sci-fi genre', () => {
      const style = generateStoryBibleStyle('sci-fi', 'realistic', 'arc-keyart')
      
      expect(style.colorTreatment).toContain('cool tones')
      expect(style.lighting).toContain('futuristic')
      expect(style.genreAdaptation).toContain('technological')
    })

    it('should adjust composition based on image type', () => {
      const characterStyle = generateStoryBibleStyle('drama', 'realistic', 'character-portrait')
      const locationStyle = generateStoryBibleStyle('drama', 'realistic', 'location-concept')
      const arcStyle = generateStoryBibleStyle('drama', 'realistic', 'arc-keyart')
      const heroStyle = generateStoryBibleStyle('drama', 'realistic', 'series-hero')
      
      expect(characterStyle.composition).toContain('portrait')
      expect(locationStyle.composition).toContain('establishing shot')
      expect(arcStyle.composition).toContain('poster')
      expect(heroStyle.composition).toContain('banner')
    })

    it('should handle missing genre with default', () => {
      const style = generateStoryBibleStyle(undefined as any, undefined as any, 'character-portrait')
      
      expect(style).toBeDefined()
      expect(style.renderingStyle).toBe('semi-realistic concept art')
    })
  })

  describe('Prompt Construction', () => {
    it('should apply style modifiers to prompts', () => {
      const originalPrompt = 'Portrait of Sarah Chen, detective'
      const finalPrompt = applyStoryBibleStyleToPrompt(originalPrompt, 'mystery', 'realistic', 'character-portrait')
      
      expect(finalPrompt).toContain(originalPrompt)
      expect(finalPrompt).toContain('semi-realistic')
      expect(finalPrompt).toContain('concept art')
      expect(finalPrompt).not.toContain('photorealistic')
    })

    it('should remove conflicting style terms', () => {
      const originalPrompt = 'Photorealistic portrait, sketch style'
      const finalPrompt = applyStoryBibleStyleToPrompt(originalPrompt, 'drama', 'realistic', 'character-portrait')
      
      expect(finalPrompt).not.toContain('photorealistic')
      expect(finalPrompt).not.toContain('sketch')
      expect(finalPrompt).toContain('semi-realistic')
    })

    it('should build style modifier string', () => {
      const style = generateStoryBibleStyle('action', 'realistic', 'character-portrait')
      const modifier = buildSemiRealisticPromptModifier(style, 'character-portrait')
      
      expect(modifier).toContain('semi-realistic concept art')
      expect(modifier).toContain('professional production design quality')
      expect(modifier).toContain('not photorealistic')
      expect(modifier).toContain('not sketch')
    })
  })

  describe('Genre and Tone Extraction', () => {
    it('should extract genre from story bible', () => {
      const storyBible: any = {
        genre: 'comedy',
        tone: 'light'
      }
      
      const { genre, tone } = extractGenreAndTone(storyBible)
      
      expect(genre).toBe('comedy')
      expect(tone).toBe('light')
    })

    it('should extract genre from genreEnhancement', () => {
      const storyBible: any = {
        genreEnhancement: { genre: 'horror' },
        premise: { tone: 'dark' }
      }
      
      const { genre, tone } = extractGenreAndTone(storyBible)
      
      expect(genre).toBe('horror')
      expect(tone).toBe('dark')
    })

    it('should use defaults when genre/tone missing', () => {
      const storyBible: any = {}
      
      const { genre, tone } = extractGenreAndTone(storyBible)
      
      expect(genre).toBe('drama')
      expect(tone).toBe('realistic')
    })
  })

  describe('Image Generation Functions', () => {
    const mockStoryBible: StoryBible = {
      id: 'test-id',
      seriesTitle: 'Test Series',
      seriesOverview: 'A test series',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      genre: 'drama',
      mainCharacters: [
        {
          name: 'Sarah Chen',
          archetype: 'detective',
          physicalDescription: 'Sharp features, determined expression'
        }
      ],
      narrativeArcs: [
        {
          title: 'Arc 1',
          summary: 'The beginning'
        }
      ],
      worldBuilding: {
        locations: [
          {
            name: 'Coffee Shop',
            description: 'A cozy coffee shop',
            type: 'interior'
          }
        ]
      }
    }

    it('should generate hero image prompt correctly', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const result = await generateHeroImage(mockStoryBible, 'user-id')
      
      expect(generateImageWithGemini).toHaveBeenCalled()
      const callArgs = generateImageWithGemini.mock.calls[0]
      expect(callArgs[0]).toContain('Test Series')
      expect(callArgs[1]).toEqual(expect.objectContaining({
        aspectRatio: '16:9'
      }))
      expect(result.imageUrl).toBeDefined()
      expect(result.prompt).toBeDefined()
    })

    it('should generate character image prompt correctly', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const character = mockStoryBible.mainCharacters![0]
      const result = await generateCharacterImage(character, mockStoryBible, 'user-id')
      
      expect(generateImageWithGemini).toHaveBeenCalled()
      const callArgs = generateImageWithGemini.mock.calls[0]
      expect(callArgs[0]).toContain('Sarah Chen')
      expect(callArgs[0]).toContain('detective')
      expect(callArgs[1]).toEqual(expect.objectContaining({
        aspectRatio: '1:1'
      }))
      expect(result.imageUrl).toBeDefined()
    })

    it('should generate arc key art prompt correctly', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const arc = mockStoryBible.narrativeArcs![0]
      const result = await generateArcKeyArt(arc, mockStoryBible, 'user-id')
      
      expect(generateImageWithGemini).toHaveBeenCalled()
      const callArgs = generateImageWithGemini.mock.calls[0]
      expect(callArgs[0]).toContain('Arc 1')
      expect(callArgs[1]).toEqual(expect.objectContaining({
        aspectRatio: '16:9'
      }))
      expect(result.imageUrl).toBeDefined()
    })

    it('should generate location concept prompt correctly', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const location = mockStoryBible.worldBuilding!.locations![0]
      const result = await generateLocationConcept(location, mockStoryBible, 'user-id')
      
      expect(generateImageWithGemini).toHaveBeenCalled()
      const callArgs = generateImageWithGemini.mock.calls[0]
      expect(callArgs[0]).toContain('Coffee Shop')
      expect(callArgs[1]).toEqual(expect.objectContaining({
        aspectRatio: '16:9'
      }))
      expect(result.imageUrl).toBeDefined()
    })
  })

  describe('Batch Generation', () => {
    const mockStoryBible: StoryBible = {
      id: 'test-id',
      seriesTitle: 'Test Series',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mainCharacters: [
        { name: 'Character 1' },
        { name: 'Character 2' }
      ],
      narrativeArcs: [
        { title: 'Arc 1', summary: 'Summary' }
      ],
      worldBuilding: {
        locations: [
          { name: 'Location 1', description: 'Description' }
        ]
      }
    }

    it('should generate all sections with progress callbacks', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const progressUpdates: GenerationProgress[] = []
      
      const result = await generateStoryBibleImages(
        mockStoryBible,
        'user-id',
        {
          sections: ['hero', 'characters', 'arcs', 'world'],
          regenerate: false,
          onProgress: (progress) => {
            progressUpdates.push(progress)
          }
        }
      )

      expect(result.visualAssets?.heroImage).toBeDefined()
      expect(result.mainCharacters?.[0].visualReference).toBeDefined()
      expect(result.narrativeArcs?.[0].keyArt).toBeDefined()
      expect(result.worldBuilding?.locations?.[0].conceptArt).toBeDefined()
      expect(progressUpdates.length).toBeGreaterThan(0)
    })

    it('should respect regenerate flag', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const storyBibleWithImages = {
        ...mockStoryBible,
        visualAssets: {
          heroImage: {
            imageUrl: 'existing-url',
            prompt: 'existing prompt',
            generatedAt: new Date().toISOString(),
            source: 'gemini' as const
          }
        }
      }

      const result = await generateStoryBibleImages(
        storyBibleWithImages,
        'user-id',
        {
          sections: ['hero'],
          regenerate: false
        }
      )

      // Should not regenerate if regenerate is false and image exists
      expect(generateImageWithGemini).not.toHaveBeenCalled()
    })

    it('should handle generation errors gracefully', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockRejectedValue(new Error('API Error'))

      const result = await generateStoryBibleImages(
        mockStoryBible,
        'user-id',
        {
          sections: ['hero'],
          regenerate: true
        }
      )

      // Should continue even if one section fails
      expect(result).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing character data', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const character = { name: 'Test' } // Missing other fields
      const storyBible: StoryBible = {
        id: 'test',
        seriesTitle: 'Test',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await generateCharacterImage(character, storyBible, 'user-id')
      
      expect(result).toBeDefined()
      expect(result.imageUrl).toBeDefined()
    })

    it('should handle API failures', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: false,
        error: 'Generation failed'
      })

      const storyBible: StoryBible = {
        id: 'test',
        seriesTitle: 'Test',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await expect(generateHeroImage(storyBible, 'user-id')).rejects.toThrow()
    })
  })

  describe('Parallel Generation', () => {
    it('should generate characters in batches of 3', async () => {
      const { generateImageWithGemini } = require('@/services/gemini-image-generator')
      generateImageWithGemini.mockResolvedValue({
        success: true,
        imageUrl: 'data:image/png;base64,test',
        metadata: { model: 'gemini-3-pro-image-preview' }
      })

      const storyBible: StoryBible = {
        id: 'test',
        seriesTitle: 'Test',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mainCharacters: Array.from({ length: 5 }, (_, i) => ({
          name: `Character ${i + 1}`
        }))
      }

      await generateStoryBibleImages(
        storyBible,
        'user-id',
        {
          sections: ['characters'],
          regenerate: true
        }
      )

      // Should have been called 5 times (one per character)
      expect(generateImageWithGemini).toHaveBeenCalledTimes(5)
    })
  })
})




























