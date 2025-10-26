/**
 * Story Bible Templates
 * Pre-built templates for different genres to help users get started faster
 */

export interface StoryBibleTemplate {
  id: string
  name: string
  description: string
  icon: string
  defaultPrompt: {
    logline: string
    protagonist: string
    stakes: string
    vibe: string
    theme: string
  }
}

export const storyBibleTemplates: StoryBibleTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with your own unique vision',
    icon: '✨',
    defaultPrompt: {
      logline: '',
      protagonist: '',
      stakes: '',
      vibe: '',
      theme: ''
    }
  },
  {
    id: 'comedy',
    name: 'Comedy Series',
    description: 'Lighthearted humor with memorable characters',
    icon: '😄',
    defaultPrompt: {
      logline: 'A quirky [profession] navigates hilarious misadventures in [setting]',
      protagonist: 'Witty, lovable, slightly chaotic but well-meaning',
      stakes: 'Finding success while staying true to themselves',
      vibe: 'Warm, fast-paced, laugh-out-loud funny with heart',
      theme: 'Being yourself is the best path to happiness'
    }
  },
  {
    id: 'drama',
    name: 'Drama Series',
    description: 'Character-driven stories with emotional depth',
    icon: '🎭',
    defaultPrompt: {
      logline: 'A [profession] faces a life-changing crisis that challenges everything they believe in',
      protagonist: 'Complex, flawed, determined to overcome their demons',
      stakes: 'Their relationships, career, and sense of identity hang in the balance',
      vibe: 'Intense, emotionally raw, deeply personal',
      theme: 'Redemption comes through facing the truth'
    }
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Series',
    description: 'Future worlds with high-concept ideas',
    icon: '🚀',
    defaultPrompt: {
      logline: 'In a future where [sci-fi concept], a [protagonist] discovers a truth that could change everything',
      protagonist: 'Brilliant, resourceful, questioning the status quo',
      stakes: 'The fate of humanity/civilization hangs in the balance',
      vibe: 'Mind-bending, visually stunning, thought-provoking',
      theme: 'Technology reveals what it means to be human'
    }
  },
  {
    id: 'crime',
    name: 'Crime/Mystery',
    description: 'Suspenseful investigations and moral dilemmas',
    icon: '🔍',
    defaultPrompt: {
      logline: 'A brilliant [detective/investigator] hunts a [criminal] while battling their own demons',
      protagonist: 'Sharp, obsessive, haunted by past cases',
      stakes: 'Catch the culprit before more lives are lost',
      vibe: 'Dark, tense, procedurally satisfying',
      theme: 'Justice isn\'t always black and white'
    }
  },
  {
    id: 'thriller',
    name: 'Thriller Series',
    description: 'High-stakes tension and conspiracy',
    icon: '⚡',
    defaultPrompt: {
      logline: 'An ordinary person is thrust into a deadly conspiracy and must survive by their wits',
      protagonist: 'Resourceful, paranoid, fighting for survival',
      stakes: 'Their life and the lives of those they love',
      vibe: 'Fast-paced, paranoid, edge-of-your-seat suspense',
      theme: 'Trust no one, question everything'
    }
  },
  {
    id: 'fantasy',
    name: 'Fantasy Series',
    description: 'Magic, myth, and epic adventures',
    icon: '⚔️',
    defaultPrompt: {
      logline: 'In a world of magic, a unlikely hero must master ancient powers to save their realm',
      protagonist: 'Destined but doubtful, learning to embrace their power',
      stakes: 'The destruction of their world and everything they love',
      vibe: 'Epic, magical, filled with wonder and danger',
      theme: 'True power comes from within'
    }
  },
  {
    id: 'romance',
    name: 'Romance Series',
    description: 'Love stories with emotional complexity',
    icon: '💕',
    defaultPrompt: {
      logline: 'Two people from different worlds find unexpected love despite the obstacles keeping them apart',
      protagonist: 'Guarded heart, afraid to be vulnerable',
      stakes: 'Finding love or protecting themselves from heartbreak',
      vibe: 'Swoonworthy, emotionally intimate, hopeful',
      theme: 'Love is worth the risk'
    }
  }
]

export function getTemplate(id: string): StoryBibleTemplate | undefined {
  return storyBibleTemplates.find(t => t.id === id)
}

export function getDefaultTemplate(): StoryBibleTemplate {
  return storyBibleTemplates[0] // Blank canvas
}







