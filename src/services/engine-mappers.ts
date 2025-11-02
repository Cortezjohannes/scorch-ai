/**
 * Engine Data Mappers - Convert Story Bible to Engine-Specific Formats
 * 
 * These mappers transform story bible data into the specific interfaces
 * required by each Murphy Pillar engine for real integration.
 */

import type { 
  CastingMetadata, 
  CharacterCastingProfile,
  ActorProfile 
} from './casting-engine';

import type { 
  ScoutingMetadata 
} from './location-scouting-engine';

import type { 
  StoryboardMetadata 
} from './storyboarding-engine';

import type { 
  NarrativeScene 
} from './fractal-narrative-engine';

// ===== STORY BIBLE TYPE DEFINITIONS =====

interface StoryBible {
  seriesTitle?: string;
  genre?: string;
  premise?: {
    theme: string;
    premiseStatement: string;
  };
  characters3D?: Character3D[];
  mainCharacters?: any[];
  narrativeArcs?: {
    title: string;
    episodes: Episode[];
  }[];
}

interface Character3D {
  name: string;
  physiology: {
    age: number;
    appearance: string;
    physicalTraits?: string[];
  };
  sociology: {
    occupation: string;
    education: string;
    socialClass: string;
    relationships?: string[];
  };
  psychology: {
    coreValue: string;
    relatedFlaw?: string;
    primaryFlaw?: string;
    want: string;
    need: string;
    fears?: string[];
    motivations?: string[];
  };
  premiseRole: string; // "protagonist", "antagonist", etc.
  premiseFunction?: string;
  speechPattern?: {
    vocabulary: string;
    rhythm: string;
    signature: string;
  };
}

interface Episode {
  title: string;
  summary?: string;
  description?: string;
  setting?: string;
  characters?: string[];
}

// ===== CONFIGURATION CONSTANTS =====

export const ENGINE_CONFIG = {
  BUDGET_RANGES: {
    'low-budget': 1_000_000,
    'mid-budget': 5_000_000,
    'high-budget': 20_000_000,
    'premium': 50_000_000
  },
  
  PRODUCTION_TIMELINES: {
    'low-budget': { prepWeeks: 4, shootDaysPerEpisode: 3, postWeeks: 8 },
    'mid-budget': { prepWeeks: 6, shootDaysPerEpisode: 5, postWeeks: 12 },
    'high-budget': { prepWeeks: 8, shootDaysPerEpisode: 8, postWeeks: 16 },
    'premium': { prepWeeks: 12, shootDaysPerEpisode: 12, postWeeks: 20 }
  },
  
  GEOGRAPHICAL_SCOPES: ['local', 'regional', 'national', 'international'] as const,
  
  TARGET_AUDIENCES: {
    'Drama': 'Adults 25-54, seeking complex character-driven narratives',
    'Comedy': 'Adults 18-49, seeking entertainment and humor',
    'Action': 'Adults 18-44, seeking high-energy entertainment',
    'Romance': 'Adults 25-54, seeking emotional connection',
    'Thriller': 'Adults 18-54, seeking suspense and excitement',
    'Fantasy': 'Teens and young adults 13-34, seeking escapism',
    'Science Fiction': 'Adults 18-49, seeking innovative concepts'
  }
};

// ===== CASTING ENGINE MAPPER =====

export function mapToCastingMetadata(
  storyBible: StoryBible, 
  budgetLevel: keyof typeof ENGINE_CONFIG.BUDGET_RANGES = 'mid-budget'
): CastingMetadata {
  const budget = ENGINE_CONFIG.BUDGET_RANGES[budgetLevel];
  const timeline = ENGINE_CONFIG.PRODUCTION_TIMELINES[budgetLevel];
  
  return {
    projectName: storyBible.seriesTitle || 'Untitled Project',
    genre: storyBible.genre || 'Drama',
    targetAudience: ENGINE_CONFIG.TARGET_AUDIENCES[storyBible.genre as keyof typeof ENGINE_CONFIG.TARGET_AUDIENCES] || 'General audience',
    productionBudget: budget,
    castingBudget: Math.floor(budget * 0.15), // 15% of total budget
    shootingSchedule: `${timeline.shootDaysPerEpisode} days per episode`,
    locations: extractLocationsFromStoryBible(storyBible),
    directorsVision: storyBible.premise?.premiseStatement || 'Character-driven narrative exploring human relationships'
  };
}

export function mapToCharacterCastingProfiles(characters3D: Character3D[]): CharacterCastingProfile[] {
  return characters3D.map((char, index) => ({
    characterId: `char-${index}`,
    characterName: char.name,
    role: char.premiseRole as any, // Type conversion - would need proper enum
    characterDescription: char.premiseFunction || `${char.psychology.want} drives their character arc`,
    physicalRequirements: {
      age: char.physiology.age,
      gender: 'flexible', // Could be inferred from character data
      height: 'flexible',
      build: 'flexible',
      appearance: char.physiology.appearance,
      specialRequirements: char.physiology.physicalTraits || []
    } as any,
    performanceRequirements: {
      actingStyle: char.psychology.coreValue,
      emotionalRange: 'wide',
      specialSkills: extractSkillsFromCharacter(char),
      experienceLevel: char.premiseRole === 'protagonist' ? 'experienced' : 'moderate'
    } as any,
    personalityTraits: [
      { trait: char.psychology.coreValue, importance: 'high' },
      { trait: char.psychology.relatedFlaw || char.psychology.primaryFlaw || 'complex', importance: 'high' },
      { trait: char.psychology.want, importance: 'medium' }
    ] as any,
    screenTime: determineScreenTime(char.premiseRole),
    importance: char.premiseRole === 'protagonist' ? 'Lead' : 'Supporting',
    relationships: extractRelationships(char),
    specialSkills: extractSpecialSkills(char),
    ageRange: determineAgeRange(char.physiology.age),
    castingPriority: char.premiseRole === 'protagonist' ? 'Critical' : 'High'
  } as any));
}

// ===== LOCATION SCOUTING MAPPER =====

export function mapToScoutingMetadata(
  storyBible: StoryBible,
  budgetLevel: keyof typeof ENGINE_CONFIG.BUDGET_RANGES = 'mid-budget'
): ScoutingMetadata {
  const budget = ENGINE_CONFIG.BUDGET_RANGES[budgetLevel];
  const timeline = ENGINE_CONFIG.PRODUCTION_TIMELINES[budgetLevel];
  const episodes = storyBible.narrativeArcs?.[0]?.episodes || [];
  
  return {
    projectName: storyBible.seriesTitle || 'Untitled Project',
    genre: storyBible.genre || 'Drama',
    productionTimeline: `${timeline.prepWeeks} weeks prep, ${episodes.length * timeline.shootDaysPerEpisode} shooting days`,
    locationBudget: Math.floor(budget * 0.20), // 20% of total budget
    totalLocationsNeeded: estimateLocationCount(episodes),
    scoutingTeam: ['Location Manager', 'Assistant Location Manager', 'Location Scout'],
    directorVision: storyBible.premise?.premiseStatement || 'Realistic environments supporting character development'
  };
}

// ===== STORYBOARD MAPPER =====

export function mapToStoryboardMetadata(
  storyBible: StoryBible,
  budgetLevel: keyof typeof ENGINE_CONFIG.BUDGET_RANGES = 'mid-budget'
): StoryboardMetadata {
  const episodes = storyBible.narrativeArcs?.[0]?.episodes || [];
  const estimatedScenes = episodes.length * 8; // ~8 scenes per episode
  const estimatedShots = estimatedScenes * 12; // ~12 shots per scene
  
  return {
    projectName: storyBible.seriesTitle || 'Untitled Project',
    totalScenes: estimatedScenes,
    totalShots: estimatedShots,
    genre: storyBible.genre || 'Drama',
    artisticStyle: determineArtisticStyle(storyBible.genre),
    director: 'TBD', // To be determined during production
    cinematographer: 'TBD'
  };
}

// ===== HELPER FUNCTIONS =====

function extractLocationsFromStoryBible(storyBible: StoryBible): string[] {
  const episodes = storyBible.narrativeArcs?.[0]?.episodes || [];
  const locations = episodes
    .map(ep => ep.setting)
    .filter((location): location is string => Boolean(location))
    .filter((location, index, arr) => arr.indexOf(location) === index); // Remove duplicates
  
  return locations.length > 0 ? locations : ['Interior Studio', 'Exterior Urban', 'Residential'];
}

function extractSkillsFromCharacter(char: Character3D): string[] {
  const skills: string[] = [];
  
  // Extract from occupation
  if (char.sociology.occupation) {
    skills.push(`Professional ${char.sociology.occupation.toLowerCase()} background`);
  }
  
  // Extract from psychological traits
  if (char.psychology.motivations) {
    skills.push(...char.psychology.motivations);
  }
  
  return skills.length > 0 ? skills : ['General acting'];
}

function determineScreenTime(premiseRole: string): any {
  switch (premiseRole.toLowerCase()) {
    case 'protagonist':
      return { category: 'Lead', percentage: 60, minutesPerEpisode: 25 };
    case 'antagonist':
      return { category: 'Supporting', percentage: 25, minutesPerEpisode: 10 };
    default:
      return { category: 'Supporting', percentage: 15, minutesPerEpisode: 6 };
  }
}

function extractRelationships(char: Character3D): any[] {
  const relationships = char.sociology.relationships || [];
  return relationships.map(rel => ({
    relatedCharacter: rel,
    type: 'TBD',
    importance: 'medium'
  }));
}

function extractSpecialSkills(char: Character3D): any[] {
  const skills: any[] = [];
  
  if (char.speechPattern) {
    skills.push({
      skill: 'Speech Pattern',
      description: `${char.speechPattern.vocabulary} vocabulary, ${char.speechPattern.rhythm} rhythm`,
      level: 'required'
    });
  }
  
  return skills;
}

function determineAgeRange(age: number): any {
  if (age < 18) return { min: age - 2, max: age + 2, category: 'Minor' };
  if (age < 30) return { min: age - 5, max: age + 5, category: 'Young Adult' };
  if (age < 50) return { min: age - 7, max: age + 7, category: 'Adult' };
  return { min: age - 10, max: age + 10, category: 'Mature Adult' };
}

function estimateLocationCount(episodes: Episode[]): number {
  const uniqueLocations = new Set(
    episodes.map(ep => ep.setting).filter(Boolean)
  );
  // Return actual count - some intimate stories may need fewer than 5 locations
  return Math.max(uniqueLocations.size, 1); // At least 1 location
}

function determineArtisticStyle(genre?: string): string {
  const styleMap: Record<string, string> = {
    'Drama': 'Naturalistic with emotional depth',
    'Comedy': 'Bright and dynamic with comedic timing',
    'Action': 'Dynamic with high-energy compositions',
    'Romance': 'Soft and romantic with warm tones',
    'Thriller': 'Tense with dramatic shadows and angles',
    'Fantasy': 'Stylized with magical realism elements',
    'Science Fiction': 'Futuristic with technological aesthetics'
  };
  
  return styleMap[genre || 'Drama'] || 'Cinematic with professional composition';
}

// ===== DIALOGUE ENGINE MAPPER =====

export function mapToNarrativeScene(
  episode: Episode, 
  episodeIndex: number, 
  characters: Character3D[]
): NarrativeScene {
  const primaryCharacter = characters[0] || { name: 'Character', psychology: { want: 'Goal', need: 'Need' } };
  
  return {
    id: `scene-${episodeIndex}`,
    sceneNumber: episodeIndex + 1,
    title: episode.title || `Scene ${episodeIndex + 1}`,
    
    // G.O.D.D. Framework
    goal: {
      character: primaryCharacter.name,
      objective: primaryCharacter.psychology.want || 'Achieve their desire',
      motivation: primaryCharacter.psychology.need || 'Find fulfillment',
      stakes: 'Risk losing what matters most'
    },
    
    obstacle: {
      type: 'character' as const,
      source: characters[1]?.name || 'Opposing force',
      description: 'Conflict arises from opposing desires',
      difficulty: 'medium' as const
    },
    
    dilemma: {
      description: 'Must choose between wants and needs',
      options: [
        'Pursue immediate desire',
        'Sacrifice for greater good',
        'Find a compromise'
      ],
      noEasyWay: 'Every choice has significant consequences'
    },
    
    decision: {
      character: primaryCharacter.name,
      choice: 'Take action based on core values',
      reasoning: primaryCharacter.psychology.coreValue || 'Driven by personal beliefs',
      cost: 'Risk losing something important'
    },
    turningPoint: {
      type: 'decision' as const,
      stimulus: 'Character faces a crucial decision',
      reaction: 'Character must choose their path',
      shift: 'Character commits to action',
      newDirection: 'Story moves forward with new momentum'
    },
    location: episode.setting || 'Primary location',
    timeOfDay: 'Day',
    duration: '5 minutes',
    mood: 'Tense',
    characters: characters.map(char => ({
      name: char.name,
      role: 'protagonist' as const,
      objective: char.psychology.want || 'Achieve their goal',
      tactics: ['Direct approach', 'Strategic planning']
    })),
    conflict: {
      type: 'interpersonal' as const,
      description: 'Character development through conflict',
      intensity: 5
    },
    dialogueApproach: {
      subtext: 'Character development through conflict',
      strategy: 'Direct confrontation',
      conflict: 'Opposing objectives'
    },
  };
}

// ===== MOCK ACTOR DATABASE =====

export function generateMockActorDatabase(): ActorProfile[] {
  // This would be replaced with a real actor database in production
  return [
    {
      actorId: 'actor-001',
      name: 'Professional Actor A',
      age: 28,
      physicalAttributes: {
        height: 175,
        build: 'Athletic',
        appearance: 'Versatile leading type'
      } as any,
      actingExperience: {
        yearsActive: 8,
        notableWorks: ['Independent Film A', 'TV Series B'],
        trainingBackground: 'Method Acting'
      } as any,
      marketValue: {
        dailyRate: 5000,
        marketTier: 'Rising'
      } as any,
      availability: {
        status: 'Available',
        conflictingProjects: []
      } as any,
      strengths: [
        { category: 'Dramatic Range', level: 'High' },
        { category: 'Physical Performance', level: 'Medium' }
      ] as any,
      filmography: [],
      awards: [],
      representation: {
        agent: 'Major Talent Agency',
        manager: 'Professional Management'
      } as any,
      rateStructure: {
        quote: 5000,
        backend: 7500,
        perks: ['Travel allowance', 'Overtime'],
        flexibility: 0.8
      },
      personalBrand: {
        image: 'Versatile Professional',
        strengths: ['Method Acting', 'Physical Performance'],
        associations: ['Rising Star'],
        risks: ['Limited exposure']
      },
      riskFactors: [
        { type: 'availability', probability: 0.2, impact: 0.3, mitigation: 'Backup options' },
        { type: 'performance', probability: 0.1, impact: 0.4, mitigation: 'Coaching support' },
        { type: 'market', probability: 0.3, impact: 0.2, mitigation: 'Diversified portfolio' }
      ]
    }
    // Add more mock actors as needed
  ];
}
 