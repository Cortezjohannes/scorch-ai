import { StoryboardShot } from '@/types/preproduction'
import { cleanAIContent, detectContentStructure } from './scriptParser'

/**
 * Storyboard Parser
 * 
 * Parses storyboard content into structured shots.
 * Handles both JSON and text formats.
 */

/**
 * Parse storyboard text into individual shots with descriptions
 */
export const parseStoryboard = (storyboardText: string): { shots: StoryboardShot[] } => {
  if (!storyboardText) return { shots: [] }
  
  // Use unified content cleaner
  const cleanText = cleanAIContent(storyboardText)
  const structure = detectContentStructure(cleanText)
  
  // Try JSON parsing first if it looks like structured data
  if (structure.hasJSON) {
    try {
      const parsed = JSON.parse(cleanText)
      if (parsed.shots || parsed.storyboard || parsed.scenes) {
        return {
          shots: parsed.shots || parsed.storyboard || parsed.scenes || []
        }
      }
    } catch (e) {
      console.log('🎬 JSON parsing failed, falling back to text parsing')
    }
  }
  
  const shots: StoryboardShot[] = []
  
  // Method 1: Try to find structured shot patterns
  const shotPatterns = [
    /^(?:Shot\s*\d+|SHOT\s*\d+|\d+\.)([^]*?)(?=^(?:Shot\s*\d+|SHOT\s*\d+|\d+\.)|$)/gim,
    /^(?:ESTABLISHING|WIDE|CLOSE|MEDIUM|ECU|CU|MS|WS|LS)([^]*?)(?=^(?:ESTABLISHING|WIDE|CLOSE|MEDIUM|ECU|CU|MS|WS|LS)|$)/gim,
    /\*\*SHOT\s*\d+([^]*?)(?=\*\*SHOT\s*\d+|$)/gi
  ]
  
  let found = false
  for (const pattern of shotPatterns) {
    const matches = [...cleanText.matchAll(pattern)]
    if (matches.length > 0) {
      matches.forEach((match, index) => {
        const fullMatch = match[0].trim()
        const content = match[1] ? match[1].trim() : fullMatch
        
        shots.push({
          number: index + 1,
          type: 'medium',
          description: content || fullMatch,
          camera: {
            angle: 'eye-level',
            movement: 'static'
          },
          composition: 'rule-of-thirds',
          lighting: 'natural',
          duration: '5-10s'
        })
      })
      found = true
      break
    }
  }
  
  // Method 2: If no structured shots found, split by logical breaks
  if (!found) {
    // Split by various separators
    let chunks = cleanText.split(/\n\s*\n+/).filter(chunk => chunk.trim().length > 30)
    
    if (chunks.length < 2) {
      // Try splitting by sentences
      chunks = cleanText.split(/(?<=[.!?])\s+/).filter(chunk => chunk.trim().length > 30)
    }
    
    if (chunks.length < 2) {
      // Try splitting by dash separators
      chunks = cleanText.split(/\s*[-—–]+\s*/).filter(chunk => chunk.trim().length > 30)
    }
    
    if (chunks.length > 0) {
      chunks.forEach((chunk, index) => {
        shots.push({
          number: index + 1,
          type: 'medium',
          description: chunk.trim(),
          camera: {
            angle: 'eye-level',
            movement: 'static'
          },
          composition: 'rule-of-thirds',
          lighting: 'natural',
          duration: '5-10s'
        })
      })
    } else {
      // Last resort: single shot
      shots.push({
        number: 1,
        type: 'wide',
        description: cleanText,
        camera: {
          angle: 'eye-level',
          movement: 'static'
        },
        composition: 'rule-of-thirds',
        lighting: 'natural',
        duration: '5-10s'
      })
    }
  }
  
  return { shots }
}

/**
 * Validate storyboard shot data
 */
export const validateStoryboardShot = (shot: any): shot is StoryboardShot => {
  return (
    typeof shot.number === 'number' &&
    typeof shot.description === 'string' &&
    shot.camera &&
    typeof shot.camera.angle === 'string' &&
    typeof shot.camera.movement === 'string'
  )
}

