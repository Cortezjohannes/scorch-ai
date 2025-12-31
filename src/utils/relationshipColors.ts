/**
 * Relationship Color Mapping Utility
 * Maps relationship types to colors and styles for visual differentiation
 */

export interface RelationshipStyle {
  color: string
  strokeWidth: number
  strokeDasharray?: string
  opacity: number
  gradientId?: string
}

/**
 * Parse relationship type string and return appropriate color/style
 */
export function getRelationshipStyle(relationshipType: string): RelationshipStyle {
  const type = relationshipType.toLowerCase().trim()

  // Allies/Friends
  if (type.includes('ally') || type.includes('friend') || type.includes('friend')) {
    return {
      color: '#10B981', // Green
      strokeWidth: 3,
      opacity: 0.6,
    }
  }

  // Rivals/Antagonists
  if (type.includes('rival') || type.includes('antagonist') || type.includes('enemy') || type.includes('foe') || type.includes('adversary')) {
    return {
      color: '#EF4444', // Red
      strokeWidth: 3,
      strokeDasharray: '8 4',
      opacity: 0.7,
    }
  }

  // Family
  if (type.includes('family') || type.includes('sibling') || type.includes('parent') || type.includes('child') || type.includes('relative')) {
    return {
      color: '#F59E0B', // Gold/Amber
      strokeWidth: 4,
      opacity: 0.8,
    }
  }

  // Romantic
  if (type.includes('romantic') || type.includes('love') || type.includes('partner') || type.includes('dating') || type.includes('relationship')) {
    return {
      color: '#EC4899', // Pink
      strokeWidth: 3,
      opacity: 0.7,
    }
  }

  // Mentor/Student
  if (type.includes('mentor') || type.includes('student') || type.includes('teacher') || type.includes('apprentice') || type.includes('protégé')) {
    return {
      color: '#3B82F6', // Blue
      strokeWidth: 3,
      opacity: 0.6,
    }
  }

  // Professional/Colleagues
  if (type.includes('professional') || type.includes('colleague') || type.includes('coworker') || type.includes('business') || type.includes('partner')) {
    return {
      color: '#6B7280', // Gray
      strokeWidth: 2,
      opacity: 0.5,
    }
  }

  // Complex/Mixed
  if (type.includes('complex') || type.includes('mixed') || type.includes('complicated') || type.includes('multifaceted')) {
    return {
      color: '#10B981', // Default to green but will use gradient
      strokeWidth: 3,
      opacity: 0.7,
    }
  }

  // Default: Neutral connection (visible by default)
  return {
    color: '#10B981', // Default green
    strokeWidth: 3,
    opacity: 0.6,  // Increased for better visibility
  }
}

/**
 * Generate unique gradient ID for complex relationships
 */
export function getComplexGradientId(char1: string, char2: string): string {
  return `gradient-${char1}-${char2}`.replace(/\s+/g, '-').toLowerCase()
}

/**
 * Create SVG gradient definition for complex relationships
 */
export function createComplexGradient(char1: string, char2: string): string {
  const id = getComplexGradientId(char1, char2)
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  `
}
