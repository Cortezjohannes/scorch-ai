import { Prop, WardrobeItem, PropCategory, PropImportance } from '@/types/preproduction'
import { cleanAIContent, detectContentStructure } from './scriptParser'

/**
 * Props & Wardrobe Parser
 * 
 * Parses props and wardrobe content into structured inventory items.
 * Handles both JSON and text formats.
 */

export interface ParsedPropsData {
  props: Prop[]
  wardrobe: WardrobeItem[]
}

/**
 * Parse props and wardrobe text into structured inventory
 */
export const parsePropsAndWardrobe = (propsText: string): ParsedPropsData => {
  if (!propsText) return { props: [], wardrobe: [] }
  
  const cleanText = cleanAIContent(propsText)
  const structure = detectContentStructure(cleanText)
  
  // Try JSON parsing first if it looks like structured data
  if (structure.hasJSON) {
    try {
      const parsed = JSON.parse(cleanText)
      return {
        props: parsed.props || [],
        wardrobe: parsed.wardrobe || parsed.costumes || []
      }
    } catch (e) {
      console.log('👗 JSON parsing failed, falling back to text parsing')
    }
  }
  
  const lines = cleanText.split('\n').filter(line => line.trim())
  const props: Prop[] = []
  const wardrobe: WardrobeItem[] = []
  
  let currentSection = ''
  let currentCharacter = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue
    
    // Section headers
    if (trimmedLine.toLowerCase().includes('props:') || trimmedLine.toLowerCase().includes('property')) {
      currentSection = 'props'
      continue
    }
    if (trimmedLine.toLowerCase().includes('wardrobe:') || trimmedLine.toLowerCase().includes('costume')) {
      currentSection = 'wardrobe'
      continue
    }
    if (trimmedLine.toLowerCase().includes('character:') || trimmedLine.match(/^[A-Z][a-z]+:/)) {
      currentCharacter = trimmedLine.replace(':', '').replace(/character/i, '').trim()
      currentSection = 'character'
      continue
    }
    
    // Parse individual items
    if (trimmedLine.match(/^[-•*]\s*/) || trimmedLine.match(/^\d+\.\s*/)) {
      let itemText = trimmedLine
        .replace(/^[-•*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
      
      // Parse props
      if (currentSection === 'props' || itemText.toLowerCase().includes('prop')) {
        const propItem: Prop = {
          name: itemText.split('-')[0].split(':')[0].trim(),
          category: determinePropCategory(itemText),
          description: itemText,
          quantity: extractQuantity(itemText),
          importance: determineImportance(itemText),
          scenes: extractScenes(itemText),
          procurement: {
            source: 'purchase',
            estimatedCost: extractCost(itemText)
          }
        }
        props.push(propItem)
      }
      // Parse wardrobe
      else if (currentSection === 'wardrobe' || currentSection === 'character' || isWardrobeItem(itemText)) {
        const wardrobeItem: WardrobeItem = {
          character: currentCharacter || 'Unknown',
          outfit: itemText.split('-')[0].trim(),
          pieces: extractPieces(itemText),
          color: extractColor(itemText) || 'unspecified',
          style: extractStyle(itemText) || 'casual',
          scenes: extractScenes(itemText)
        }
        wardrobe.push(wardrobeItem)
      }
      // Default categorization
      else {
        if (isWardrobeItem(itemText)) {
          const wardrobeItem: WardrobeItem = {
            character: currentCharacter || 'Unknown',
            outfit: itemText.split('-')[0].trim(),
            pieces: extractPieces(itemText),
            color: extractColor(itemText) || 'unspecified',
            style: extractStyle(itemText) || 'casual',
            scenes: extractScenes(itemText)
          }
          wardrobe.push(wardrobeItem)
        } else {
          const propItem: Prop = {
            name: itemText.split('-')[0].split(':')[0].trim(),
            category: determinePropCategory(itemText),
            description: itemText,
            quantity: extractQuantity(itemText),
            importance: determineImportance(itemText),
            scenes: extractScenes(itemText),
            procurement: {
              source: 'purchase',
              estimatedCost: extractCost(itemText)
            }
          }
          props.push(propItem)
        }
      }
    }
  }
  
  return { props, wardrobe }
}

// Helper functions

const determinePropCategory = (text: string): PropCategory => {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('furniture') || lowerText.includes('table') || lowerText.includes('chair')) return 'furniture'
  if (lowerText.includes('car') || lowerText.includes('vehicle') || lowerText.includes('bike')) return 'vehicle'
  if (lowerText.includes('weapon') || lowerText.includes('gun') || lowerText.includes('knife')) return 'weapon'
  if (lowerText.includes('phone') || lowerText.includes('computer') || lowerText.includes('tech')) return 'technology'
  if (lowerText.includes('food') || lowerText.includes('drink') || lowerText.includes('consumable')) return 'consumable'
  if (lowerText.includes('decoration') || lowerText.includes('set')) return 'set-decoration'
  return 'hand-prop'
}

const determineImportance = (text: string): PropImportance => {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('important') || lowerText.includes('key') || lowerText.includes('main') || lowerText.includes('essential') || lowerText.includes('hero')) {
    return 'hero'
  } else if (lowerText.includes('minor') || lowerText.includes('background') || lowerText.includes('optional')) {
    return 'background'
  }
  return 'supporting'
}

const extractQuantity = (text: string): number => {
  const match = text.match(/(\d+)\s*(pcs?|pieces?|items?|qty|quantity)/i)
  return match ? parseInt(match[1]) : 1
}

const extractScenes = (text: string): number[] => {
  const match = text.match(/scenes?[\s:]*([0-9,\s-]+)/i)
  if (!match) return []
  
  const sceneText = match[1].trim()
  const scenes: number[] = []
  
  // Handle ranges like "1-3"
  const rangeMatch = sceneText.match(/(\d+)-(\d+)/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])
    for (let i = start; i <= end; i++) {
      scenes.push(i)
    }
  } else {
    // Handle comma-separated like "1, 2, 3"
    const numbers = sceneText.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
    scenes.push(...numbers)
  }
  
  return scenes
}

const extractCost = (text: string): string | undefined => {
  const match = text.match(/\$\s*\d+(-\d+)?|\d+(-\d+)?\s*dollars?/i)
  return match ? match[0] : undefined
}

const isWardrobeItem = (text: string): boolean => {
  const wardrobeKeywords = ['shirt', 'dress', 'pants', 'jacket', 'shoes', 'hat', 'outfit', 'costume', 'clothing', 'suit', 'jeans', 'blouse', 'skirt', 'sweater', 'coat']
  return wardrobeKeywords.some(keyword => text.toLowerCase().includes(keyword))
}

const extractPieces = (text: string): string[] => {
  const pieces: string[] = []
  const keywords = ['shirt', 'dress', 'pants', 'jacket', 'shoes', 'hat', 'suit', 'jeans', 'blouse', 'skirt', 'sweater', 'coat', 'tie', 'belt', 'scarf']
  
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      pieces.push(keyword)
    }
  }
  
  return pieces.length > 0 ? pieces : ['outfit']
}

const extractColor = (text: string): string | null => {
  const colorMatch = text.match(/(black|white|red|blue|green|yellow|brown|gray|grey|silver|gold|dark|light|bright|navy|beige|tan|pink|purple|orange)/i)
  return colorMatch ? colorMatch[1] : null
}

const extractStyle = (text: string): string | null => {
  if (text.toLowerCase().includes('vintage')) return 'vintage'
  if (text.toLowerCase().includes('modern')) return 'modern'
  if (text.toLowerCase().includes('casual')) return 'casual'
  if (text.toLowerCase().includes('formal')) return 'formal'
  if (text.toLowerCase().includes('elegant')) return 'elegant'
  if (text.toLowerCase().includes('rustic')) return 'rustic'
  if (text.toLowerCase().includes('professional')) return 'professional'
  if (text.toLowerCase().includes('sporty')) return 'sporty'
  return null
}

/**
 * Validate prop data
 */
export const validateProp = (prop: any): prop is Prop => {
  return (
    typeof prop.name === 'string' &&
    typeof prop.category === 'string' &&
    typeof prop.description === 'string' &&
    typeof prop.quantity === 'number' &&
    typeof prop.importance === 'string' &&
    Array.isArray(prop.scenes)
  )
}

/**
 * Validate wardrobe item data
 */
export const validateWardrobeItem = (item: any): item is WardrobeItem => {
  return (
    typeof item.character === 'string' &&
    typeof item.outfit === 'string' &&
    Array.isArray(item.pieces) &&
    typeof item.color === 'string' &&
    typeof item.style === 'string' &&
    Array.isArray(item.scenes)
  )
}

