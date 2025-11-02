import { ScriptElement, ScriptScene } from '@/types/preproduction'

/**
 * Script Parser
 * 
 * Parses screenplay content into structured script elements.
 * Handles both JSON and text formats.
 */

// Universal content cleaner - removes all AI artifacts consistently
export const cleanAIContent = (content: string): string => {
  if (!content) return ''
  
  return content
    // Remove AI response artifacts
    .replace(/^.*?Certainly!?.*?Here.*?:/gi, '')
    .replace(/^.*?I'll.*?create.*?:/gi, '')
    .replace(/^.*?Below.*?is.*?:/gi, '')
    .replace(/^.*?Let me.*?create.*?:/gi, '')
    .replace(/^.*?I can.*?help.*?:/gi, '')
    // Remove code block markers
    .replace(/```[\w]*\n?/g, '')
    .replace(/```/g, '')
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_{2,}(.*?)_{2,}/g, '$1')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Enhanced content structure detector
export const detectContentStructure = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim())
  return {
    hasJSON: content.includes('{') && content.includes('}'),
    hasMarkdown: content.includes('**') || content.includes('##'),
    hasNumberedItems: lines.some(line => /^\d+\./.test(line.trim())),
    hasBulletItems: lines.some(line => /^[-*]/.test(line.trim())),
    hasHeaders: lines.some(line => /^(#+|[A-Z\s]{3,}:)/.test(line.trim())),
    hasSceneFormat: lines.some(line => /^(INT\.|EXT\.)/.test(line.trim())),
    hasCharacterNames: lines.some(line => /^[A-Z][A-Z\s]+$/.test(line.trim()) && line.length < 50)
  }
}

/**
 * Parse screenplay text into structured script elements
 */
export const parseScreenplay = (screenplay: string): { elements: ScriptElement[] } => {
  if (!screenplay) return { elements: [] }
  
  const cleanScreenplay = cleanAIContent(screenplay)
  const structure = detectContentStructure(cleanScreenplay)
  
  // Try JSON parsing first if it looks like structured data
  if (structure.hasJSON) {
    try {
      const parsed = JSON.parse(cleanScreenplay)
      if (parsed.elements || parsed.scenes || parsed.screenplay) {
        return {
          elements: parsed.elements || parsed.scenes || parsed.screenplay || []
        }
      }
    } catch (e) {
      console.log('📝 JSON parsing failed, falling back to text parsing')
    }
  }
  
  const lines = cleanScreenplay.split('\n').filter(line => line.trim())
  const elements: ScriptElement[] = []
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    if (!line) continue
    
    // Skip narrative prose indicators
    if (line.includes('Enhanced screenplay with') || 
        line.includes('Scene content:') || 
        line.includes('Engine guidance:') ||
        line.includes('[SCENE START]') ||
        line.includes('[SCENE END]')) {
      continue
    }
    
    // Clean HTML tags from character names
    if (line.includes('<center>') && line.includes('</center>')) {
      line = line.replace(/<center>|<\/center>/g, '').trim()
    }
    
    // Scene heading (INT./EXT.)
    if (line.match(/^(INT\.|EXT\.)/)) {
      elements.push({
        type: 'scene_heading',
        content: line
      })
    }
    // Transition (FADE IN:, CUT TO:, etc.)
    else if (line.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO):/i)) {
      elements.push({
        type: 'transition',
        content: line
      })
    }
    // Character name (ALL CAPS, may include age in parentheses)
    else if (line.match(/^[A-Z][A-Z\s]+(\([0-9]+\))?$/) && line.length < 50 && !line.includes('.') && !line.includes('>')) {
      elements.push({
        type: 'character',
        content: line,
        character: line
      })
    }
    // Parenthetical (in parentheses)
    else if (line.match(/^\(.*\)$/)) {
      elements.push({
        type: 'parenthetical',
        content: line
      })
    }
    // Dialogue (everything else that's not action)
    else if (line.length > 0 && !line.match(/^(INT\.|EXT\.)/)) {
      // Check if this is dialogue by looking at context
      const isDialogue = elements.length > 0 && 
        (elements[elements.length - 1].type === 'character' || 
         elements[elements.length - 1].type === 'parenthetical' ||
         elements[elements.length - 1].type === 'dialogue')
      
      if (isDialogue) {
        elements.push({
          type: 'dialogue',
          content: line,
          character: elements.find(e => e.type === 'character')?.character
        })
      } else {
        elements.push({
          type: 'action',
          content: line
        })
      }
    }
  }
  
  return { elements }
}

/**
 * Validate script scene data
 */
export const validateScriptScene = (scene: any): scene is ScriptScene => {
  return (
    typeof scene.sceneNumber === 'number' &&
    (Array.isArray(scene.elements) || typeof scene.screenplay === 'string')
  )
}

