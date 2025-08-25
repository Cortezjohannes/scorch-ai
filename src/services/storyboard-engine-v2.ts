/**
 * The Storyboarding Engine V2.0 - Writing with Motion
 * 
 * A comprehensive visual sequence planning system based on professional cinematography theory,
 * ASC standards, and the philosophies of master cinematographers like Roger Deakins and Emmanuel Lubezki.
 * 
 * This system synthesizes:
 * - ASC cinematography theory and modern practice
 * - Shot psychology and compositional grammar
 * - Genre-specific visual languages
 * - Color psychology and mood systems
 * - Pacing and narrative flow architecture
 * - Professional storyboarding methodologies
 * - AI-powered visual sequence generation
 */

import { generateContent } from './azure-openai'
import type { StoryPremise } from './premise-engine'
import type { ArchitectedCharacter } from './character-engine-v2'

// ============================================================================
// PART I: FOUNDATIONS OF VISUAL LANGUAGE
// ============================================================================

/**
 * ASC Theory and Cinematographic Principles
 */
export interface CinematographyPrinciples {
  lightingPhilosophy: 'naturalistic' | 'stylized' | 'chiaroscuro' | 'high-key' | 'practical-motivated';
  compositionApproach: 'classical' | 'rule-of-thirds' | 'symmetrical' | 'minimalist' | 'dynamic';
  cameraMovementStyle: 'static-observational' | 'fluid-immersive' | 'handheld-intimate' | 'crane-epic' | 'tracking-kinetic';
  colorPalette: ColorMoodSystem;
  pacingPhilosophy: 'contemplative' | 'rhythmic' | 'kinetic' | 'variable' | 'tension-release';
}

/**
 * Master Cinematographer Style Systems
 */
export interface CinematographerStyle {
  name: string;
  philosophy: string;
  signature: string;
  
  // Roger Deakins Style
  deakinsApproach?: {
    naturalisticLighting: boolean;
    minimalistComposition: boolean;
    shadowSculpting: boolean;
    purposefulMovement: boolean;
    emotionalTransparency: boolean;
  };
  
  // Emmanuel Lubezki Style
  lubezskiApproach?: {
    naturalLightObsession: boolean;
    wideAngleIntimacy: boolean;
    fluidLongTakes: boolean;
    immersiveParticipation: boolean;
    phenomenologicalExperience: boolean;
  };
  
  // Custom Style Parameters
  customParameters?: {
    lightingRatio: number; // 1-10 contrast level
    movementFrequency: number; // 1-10 camera movement amount
    shotDurationPreference: 'short' | 'medium' | 'long' | 'varied';
    intimacyLevel: number; // 1-10 how close to get to subjects
  };
}

/**
 * Shot Psychology Framework
 */
export interface ShotPsychology {
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  movement: CameraMovement;
  lighting: LightingDesign;
  psychologicalEffect: string;
  emotionalImpact: string;
  narrativeFunction: string;
}

export interface ShotSize {
  type: 'EWS' | 'WS' | 'FS' | 'MS' | 'MCU' | 'CU' | 'ECU';
  name: string;
  description: string;
  psychologicalEffect: string;
  commonUse: string;
  emotionalDistance: number; // 1-10 scale
}

export const SHOT_SIZES: Record<string, ShotSize> = {
  EWS: {
    type: 'EWS',
    name: 'Extreme Wide Shot',
    description: 'Subject is a small part of vast landscape',
    psychologicalEffect: 'Awe, isolation, insignificance, loneliness',
    commonUse: 'Establishing location, scale, theme',
    emotionalDistance: 10
  },
  WS: {
    type: 'WS',
    name: 'Wide Shot / Long Shot',
    description: 'Subject shown head to toe, does not fill frame',
    psychologicalEffect: 'Objectivity, narrative distance, context',
    commonUse: 'Character relationship to environment',
    emotionalDistance: 8
  },
  FS: {
    type: 'FS',
    name: 'Full Shot',
    description: 'Subject head to toe, largely filling frame',
    psychologicalEffect: 'Focus on physical performance and action',
    commonUse: 'Action, movement, multiple characters',
    emotionalDistance: 6
  },
  MS: {
    type: 'MS',
    name: 'Medium Shot',
    description: 'Subject framed from waist up',
    psychologicalEffect: 'Social connection, observation, neutrality',
    commonUse: 'Dialogue scenes, neutral baseline',
    emotionalDistance: 5
  },
  MCU: {
    type: 'MCU',
    name: 'Medium Close-Up',
    description: 'Subject framed from chest/shoulders up',
    psychologicalEffect: 'Growing intimacy, heightened emotional awareness',
    commonUse: 'Subtle facial expressions in dialogue',
    emotionalDistance: 3
  },
  CU: {
    type: 'CU',
    name: 'Close-Up',
    description: 'Subject\'s face or object fills frame',
    psychologicalEffect: 'Intimacy, empathy, emotional intensity, confrontation',
    commonUse: 'Character emotional state, key details',
    emotionalDistance: 2
  },
  ECU: {
    type: 'ECU',
    name: 'Extreme Close-Up',
    description: 'Single detail (eye, mouth) fills frame',
    psychologicalEffect: 'Claustrophobia, discomfort, intense focus, revelation',
    commonUse: 'Critical details, intense micro-expressions',
    emotionalDistance: 1
  }
};

export interface CameraAngle {
  type: 'extreme-low' | 'low' | 'eye-level' | 'high' | 'extreme-high' | 'dutch' | 'overhead';
  name: string;
  psychologicalEffect: string;
  powerDynamic: 'dominance' | 'neutral' | 'vulnerability' | 'disorientation';
  commonUse: string;
}

export const CAMERA_ANGLES: Record<string, CameraAngle> = {
  'extreme-low': {
    type: 'extreme-low',
    name: 'Extreme Low Angle',
    psychologicalEffect: 'Ultimate power, godlike dominance, intimidation',
    powerDynamic: 'dominance',
    commonUse: 'Villain reveals, heroic moments, architectural grandeur'
  },
  'low': {
    type: 'low',
    name: 'Low Angle',
    psychologicalEffect: 'Power, strength, confidence, authority',
    powerDynamic: 'dominance',
    commonUse: 'Hero shots, authority figures, empowerment'
  },
  'eye-level': {
    type: 'eye-level',
    name: 'Eye Level',
    psychologicalEffect: 'Equality, naturalism, neutral observation',
    powerDynamic: 'neutral',
    commonUse: 'Standard dialogue, natural interaction'
  },
  'high': {
    type: 'high',
    name: 'High Angle',
    psychologicalEffect: 'Vulnerability, weakness, diminishment',
    powerDynamic: 'vulnerability',
    commonUse: 'Victim shots, child POV, defeat moments'
  },
  'extreme-high': {
    type: 'extreme-high',
    name: 'Extreme High Angle / Overhead',
    psychologicalEffect: 'Complete vulnerability, fate, omniscience',
    powerDynamic: 'vulnerability',
    commonUse: 'Death scenes, surveillance POV, god\'s eye view'
  },
  'dutch': {
    type: 'dutch',
    name: 'Dutch Angle / Canted',
    psychologicalEffect: 'Disorientation, unease, psychological imbalance',
    powerDynamic: 'disorientation',
    commonUse: 'Horror, thriller, madness, instability'
  },
  'overhead': {
    type: 'overhead',
    name: 'Overhead Shot',
    psychologicalEffect: 'Detachment, pattern recognition, fate',
    powerDynamic: 'neutral',
    commonUse: 'Strategic overview, dance sequences, death'
  }
};

export interface CameraMovement {
  type: 'static' | 'pan' | 'tilt' | 'dolly-in' | 'dolly-out' | 'tracking' | 'zoom-in' | 'zoom-out' | 'crane' | 'handheld';
  name: string;
  emotionalConnotation: string;
  narrativeUse: string;
  energyLevel: number; // 1-10 scale
}

export const CAMERA_MOVEMENTS: Record<string, CameraMovement> = {
  'static': {
    type: 'static',
    name: 'Static / Lock-off',
    emotionalConnotation: 'Stability, focus, confinement, observation',
    narrativeUse: 'Dialogue, intense performances, formal compositions',
    energyLevel: 1
  },
  'pan': {
    type: 'pan',
    name: 'Pan',
    emotionalConnotation: 'Exploration, anticipation, revelation',
    narrativeUse: 'Following character, revealing landscape, connecting subjects',
    energyLevel: 4
  },
  'tilt': {
    type: 'tilt',
    name: 'Tilt',
    emotionalConnotation: 'Awe, power dynamics, discovery',
    narrativeUse: 'Revealing height, status relationships',
    energyLevel: 4
  },
  'dolly-in': {
    type: 'dolly-in',
    name: 'Dolly In',
    emotionalConnotation: 'Intimacy, intensity, psychological focus',
    narrativeUse: 'Character realization, emotional reaction',
    energyLevel: 6
  },
  'dolly-out': {
    type: 'dolly-out',
    name: 'Dolly Out',
    emotionalConnotation: 'Isolation, finality, emotional detachment',
    narrativeUse: 'Revealing context, creating distance',
    energyLevel: 5
  },
  'tracking': {
    type: 'tracking',
    name: 'Tracking Shot',
    emotionalConnotation: 'Immersion, participation, energy, momentum',
    narrativeUse: 'Following character in motion, journey immersion',
    energyLevel: 7
  },
  'zoom-in': {
    type: 'zoom-in',
    name: 'Zoom In',
    emotionalConnotation: 'Unease, claustrophobia, intensity, artificiality',
    narrativeUse: 'Dramatic emphasis, creating discomfort',
    energyLevel: 8
  },
  'zoom-out': {
    type: 'zoom-out',
    name: 'Zoom Out',
    emotionalConnotation: 'Revelation, context, sudden vulnerability',
    narrativeUse: 'Revealing wider context, isolation',
    energyLevel: 6
  },
  'crane': {
    type: 'crane',
    name: 'Crane / Jib',
    emotionalConnotation: 'Grandeur, freedom, fate, omniscience',
    narrativeUse: 'Establishing shots, revealing scale, scene conclusions',
    energyLevel: 8
  },
  'handheld': {
    type: 'handheld',
    name: 'Handheld',
    emotionalConnotation: 'Immediacy, intimacy, chaos, realism',
    narrativeUse: 'Action sequences, documentary feel, emotional intensity',
    energyLevel: 9
  }
};

/**
 * Lighting Design Framework
 */
export interface LightingDesign {
  placement: 'front' | 'side' | 'back' | 'top' | 'bottom' | 'practical';
  quality: 'hard' | 'soft' | 'mixed';
  intensity: 'low-key' | 'high-key' | 'chiaroscuro';
  color: ColorTemperature;
  motivation: 'natural' | 'practical' | 'stylized' | 'emotional';
  eyeLightTreatment: 'strong' | 'subtle' | 'absent' | 'dramatic';
  shadowStrategy: 'concealing' | 'revealing' | 'sculpting' | 'eliminating';
}

export interface ColorTemperature {
  kelvin: number;
  description: string;
  emotionalAssociation: string;
  commonSources: string[];
}

export const COLOR_TEMPERATURES: Record<string, ColorTemperature> = {
  'candle': {
    kelvin: 1900,
    description: 'Warm amber/orange',
    emotionalAssociation: 'Intimate, romantic, mysterious',
    commonSources: ['Candles', 'Fire', 'Oil lamps']
  },
  'tungsten': {
    kelvin: 3200,
    description: 'Warm yellow/orange',
    emotionalAssociation: 'Cozy, domestic, nostalgic',
    commonSources: ['Tungsten bulbs', 'Practical lamps', 'Sunset']
  },
  'neutral': {
    kelvin: 4000,
    description: 'Neutral white',
    emotionalAssociation: 'Natural, balanced, realistic',
    commonSources: ['Fluorescent', 'LED panels', 'Overcast sky']
  },
  'daylight': {
    kelvin: 5600,
    description: 'Cool white',
    emotionalAssociation: 'Clean, energetic, professional',
    commonSources: ['Daylight', 'HMI lights', 'Flash']
  },
  'overcast': {
    kelvin: 6500,
    description: 'Cool blue-white',
    emotionalAssociation: 'Somber, melancholic, sterile',
    commonSources: ['Overcast sky', 'Open shade', 'Computer screens']
  },
  'blue-hour': {
    kelvin: 9000,
    description: 'Deep blue',
    emotionalAssociation: 'Ethereal, cinematic, otherworldly',
    commonSources: ['Twilight sky', 'Blue hour', 'Moonlight']
  }
};

// ============================================================================
// PART II: COMPOSITIONAL GRAMMAR AND RULES
// ============================================================================

/**
 * Composition Rules Engine
 */
export interface CompositionRules {
  ruleOfThirds: RuleOfThirdsApplication;
  symmetryAndBalance: SymmetryApplication;
  leadingLines: LeadingLinesApplication;
  depthAndLayers: DepthApplication;
  headroomAndLookroom: FramingApplication;
  ruleBreaking: RuleBreakingStrategy;
}

export interface RuleOfThirdsApplication {
  enabled: boolean;
  subjectPlacement: 'left-third' | 'right-third' | 'top-third' | 'bottom-third' | 'intersection';
  horizonPlacement: 'upper-third' | 'lower-third' | 'center' | 'off-frame';
  narrativeReason: string;
}

export interface SymmetryApplication {
  type: 'perfect-symmetry' | 'near-symmetry' | 'asymmetrical' | 'dynamic-balance';
  axis: 'vertical' | 'horizontal' | 'diagonal' | 'radial';
  psychologicalEffect: string;
  appropriateGenres: string[];
}

export interface LeadingLinesApplication {
  lineTypes: ('architectural' | 'natural' | 'implied' | 'character-gaze' | 'lighting')[];
  direction: 'toward-subject' | 'away-from-subject' | 'parallel' | 'converging';
  strength: 'subtle' | 'moderate' | 'strong';
  narrativeFunction: string;
}

export interface DepthApplication {
  foregroundElements: string[];
  midgroundFocus: string;
  backgroundContext: string;
  depthCues: ('overlap' | 'size-variation' | 'atmospheric-perspective' | 'focus-pull')[];
  dimensionalityScore: number; // 1-10
}

export interface FramingApplication {
  headroom: 'tight' | 'standard' | 'generous' | 'extreme';
  lookroom: 'minimal' | 'standard' | 'generous' | 'reverse';
  breathingRoom: number; // 1-10 scale
  claustrophobiaLevel: number; // 1-10 scale
}

export interface RuleBreakingStrategy {
  rulesToBreak: ('rule-of-thirds' | 'headroom' | 'lookroom' | '180-degree' | '30-degree')[];
  intentionalEffect: string;
  genreAppropriateness: string[];
  psychologicalJustification: string;
}

// ============================================================================
// PART III: GENRE VISUAL LANGUAGES
// ============================================================================

/**
 * Genre-Specific Visual Lexicon
 */
export interface GenreVisualLexicon {
  genre: 'horror' | 'comedy' | 'drama' | 'action' | 'romance' | 'thriller' | 'sci-fi' | 'western';
  lightingStyle: LightingDesign;
  dominantColorPalette: string[];
  commonShotSizes: string[];
  cameraMovementStyle: string[];
  editingPace: 'slow' | 'moderate' | 'fast' | 'variable';
  psychologicalGoals: string[];
  avoidancePatterns: string[];
}

export const GENRE_LEXICONS: Record<string, GenreVisualLexicon> = {
  horror: {
    genre: 'horror',
    lightingStyle: {
      placement: 'side',
      quality: 'hard',
      intensity: 'low-key',
      color: COLOR_TEMPERATURES.candle,
      motivation: 'emotional',
      eyeLightTreatment: 'absent',
      shadowStrategy: 'concealing'
    },
    dominantColorPalette: ['Desaturated blues', 'Deep grays', 'Stark reds', 'Sickly greens'],
    commonShotSizes: ['ECU', 'CU', 'EWS'],
    cameraMovementStyle: ['handheld', 'static', 'dolly-in'],
    editingPace: 'variable',
    psychologicalGoals: ['Fear', 'Dread', 'Suspense', 'Unease'],
    avoidancePatterns: ['High-key lighting', 'Bright colors', 'Symmetrical framing']
  },
  comedy: {
    genre: 'comedy',
    lightingStyle: {
      placement: 'front',
      quality: 'soft',
      intensity: 'high-key',
      color: COLOR_TEMPERATURES.daylight,
      motivation: 'natural',
      eyeLightTreatment: 'strong',
      shadowStrategy: 'eliminating'
    },
    dominantColorPalette: ['Bright primaries', 'Saturated colors', 'Warm yellows', 'Vibrant oranges'],
    commonShotSizes: ['WS', 'MS', 'CU'],
    cameraMovementStyle: ['static', 'pan', 'zoom-in'],
    editingPace: 'fast',
    psychologicalGoals: ['Laughter', 'Joy', 'Surprise', 'Delight'],
    avoidancePatterns: ['Deep shadows', 'Dutch angles', 'Desaturated colors']
  },
  drama: {
    genre: 'drama',
    lightingStyle: {
      placement: 'side',
      quality: 'soft',
      intensity: 'low-key',
      color: COLOR_TEMPERATURES.neutral,
      motivation: 'natural',
      eyeLightTreatment: 'subtle',
      shadowStrategy: 'sculpting'
    },
    dominantColorPalette: ['Muted earth tones', 'Realistic palette', 'Emotional temperature shifts'],
    commonShotSizes: ['CU', 'MCU', 'MS'],
    cameraMovementStyle: ['dolly-in', 'static', 'tracking'],
    editingPace: 'slow',
    psychologicalGoals: ['Empathy', 'Emotional connection', 'Introspection'],
    avoidancePatterns: ['Excessive camera movement', 'Artificial lighting', 'Flashy techniques']
  },
  action: {
    genre: 'action',
    lightingStyle: {
      placement: 'practical',
      quality: 'hard',
      intensity: 'high-key',
      color: COLOR_TEMPERATURES.daylight,
      motivation: 'practical',
      eyeLightTreatment: 'strong',
      shadowStrategy: 'revealing'
    },
    dominantColorPalette: ['High contrast', 'Teal and orange', 'Dynamic color grading'],
    commonShotSizes: ['WS', 'MS', 'CU'],
    cameraMovementStyle: ['handheld', 'tracking', 'crane'],
    editingPace: 'fast',
    psychologicalGoals: ['Excitement', 'Adrenaline', 'Kinetic energy'],
    avoidancePatterns: ['Static shots', 'Long takes', 'Subtle movements']
  },
  romance: {
    genre: 'romance',
    lightingStyle: {
      placement: 'front',
      quality: 'soft',
      intensity: 'high-key',
      color: COLOR_TEMPERATURES.tungsten,
      motivation: 'natural',
      eyeLightTreatment: 'strong',
      shadowStrategy: 'eliminating'
    },
    dominantColorPalette: ['Warm pastels', 'Golden tones', 'Soft pinks', 'Romantic golds'],
    commonShotSizes: ['MCU', 'CU', 'MS'],
    cameraMovementStyle: ['dolly-in', 'static', 'tracking'],
    editingPace: 'slow',
    psychologicalGoals: ['Intimacy', 'Chemistry', 'Emotional connection'],
    avoidancePatterns: ['Harsh lighting', 'Cold colors', 'Aggressive camera work']
  }
};

// ============================================================================
// PART IV: COLOR PSYCHOLOGY AND MOOD SYSTEMS
// ============================================================================

/**
 * Color Psychology Framework
 */
export interface ColorMoodSystem {
  primaryPalette: ColorPsychology[];
  secondaryPalette: ColorPsychology[];
  accentColors: ColorPsychology[];
  colorHarmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary';
  emotionalArc: string;
  culturalContext: string;
}

export interface ColorPsychology {
  color: string;
  hex: string;
  psychologicalAssociations: string[];
  culturalMeanings: Record<string, string>;
  physiologicalEffect: 'arousing' | 'calming' | 'neutral';
  wavelength: 'long' | 'medium' | 'short';
  saturationLevel: number; // 1-10
  brightnessLevel: number; // 1-10
}

export const COLOR_PSYCHOLOGY: Record<string, ColorPsychology> = {
  red: {
    color: 'Red',
    hex: '#FF0000',
    psychologicalAssociations: ['Passion', 'Love', 'Anger', 'Power', 'Danger', 'Violence'],
    culturalMeanings: {
      'Western': 'Danger, passion, love',
      'Chinese': 'Luck, happiness, prosperity',
      'Indian': 'Purity, fertility'
    },
    physiologicalEffect: 'arousing',
    wavelength: 'long',
    saturationLevel: 10,
    brightnessLevel: 6
  },
  blue: {
    color: 'Blue',
    hex: '#0000FF',
    psychologicalAssociations: ['Calm', 'Trust', 'Sadness', 'Isolation', 'Professionalism', 'Cold'],
    culturalMeanings: {
      'Western': 'Calm, trust, sadness',
      'Middle Eastern': 'Protection, spirituality',
      'Korean': 'Death, mourning'
    },
    physiologicalEffect: 'calming',
    wavelength: 'short',
    saturationLevel: 10,
    brightnessLevel: 5
  },
  yellow: {
    color: 'Yellow',
    hex: '#FFFF00',
    psychologicalAssociations: ['Joy', 'Optimism', 'Caution', 'Madness', 'Betrayal', 'Illness'],
    culturalMeanings: {
      'Western': 'Happiness, cowardice',
      'Chinese': 'Imperial power, honor',
      'Egyptian': 'Mourning'
    },
    physiologicalEffect: 'arousing',
    wavelength: 'long',
    saturationLevel: 10,
    brightnessLevel: 9
  },
  green: {
    color: 'Green',
    hex: '#00FF00',
    psychologicalAssociations: ['Nature', 'Growth', 'Harmony', 'Envy', 'Sickness', 'Money'],
    culturalMeanings: {
      'Western': 'Nature, money, envy',
      'Islamic': 'Paradise, peace, nature',
      'Chinese': 'Health, prosperity'
    },
    physiologicalEffect: 'calming',
    wavelength: 'medium',
    saturationLevel: 10,
    brightnessLevel: 7
  },
  orange: {
    color: 'Orange',
    hex: '#FFA500',
    psychologicalAssociations: ['Energy', 'Warmth', 'Enthusiasm', 'Creativity', 'Attention'],
    culturalMeanings: {
      'Western': 'Energy, creativity, autumn',
      'Hindu': 'Sacred, spiritual',
      'Buddhist': 'Humility, renunciation'
    },
    physiologicalEffect: 'arousing',
    wavelength: 'long',
    saturationLevel: 10,
    brightnessLevel: 8
  },
  purple: {
    color: 'Purple',
    hex: '#800080',
    psychologicalAssociations: ['Royalty', 'Luxury', 'Mystery', 'Spirituality', 'Creativity'],
    culturalMeanings: {
      'Western': 'Royalty, luxury, mystery',
      'Thai': 'Mourning',
      'Catholic': 'Penitence, mourning'
    },
    physiologicalEffect: 'neutral',
    wavelength: 'short',
    saturationLevel: 8,
    brightnessLevel: 4
  }
};

// ============================================================================
// PART V: PACING AND TEMPORAL ARCHITECTURE
// ============================================================================

/**
 * Pacing Control Framework
 */
export interface PacingArchitecture {
  shotDuration: ShotDuration;
  editingRhythm: EditingRhythm;
  cameraMovementTempo: MovementTempo;
  sequencePacing: SequencePacing;
  emotionalModulation: EmotionalModulation;
}

export interface ShotDuration {
  averageLength: number; // seconds
  variationPattern: 'consistent' | 'accelerating' | 'decelerating' | 'rhythmic' | 'chaotic';
  longTakeThreshold: number; // seconds
  quickCutThreshold: number; // seconds
  narrativeReason: string;
}

export interface EditingRhythm {
  cutsPerMinute: number;
  rhythmPattern: 'steady' | 'building' | 'musical' | 'staccato' | 'flowing';
  transitionTypes: ('cut' | 'dissolve' | 'fade' | 'wipe' | 'match-cut')[];
  tempoDescription: string;
}

export interface MovementTempo {
  movementFrequency: number; // movements per minute
  movementSpeed: 'glacial' | 'slow' | 'moderate' | 'quick' | 'frenetic';
  movementStyle: 'smooth' | 'mechanical' | 'organic' | 'aggressive' | 'floating';
  energyContribution: number; // 1-10
}

export interface SequencePacing {
  overallTempo: 'contemplative' | 'measured' | 'energetic' | 'frantic';
  tensionCurve: 'building' | 'releasing' | 'oscillating' | 'plateau' | 'explosive';
  breathingRoom: number; // 1-10 scale
  intensityLevel: number; // 1-10 scale
}

export interface EmotionalModulation {
  pacingContrast: boolean;
  tensionReleaseCycle: boolean;
  emotionalBeats: string[];
  audienceEngagementStrategy: string;
}

// ============================================================================
// PART VI: GENERATIVE FRAMEWORKS
// ============================================================================

/**
 * Framework 1: Narrative Intent Model
 */
export interface NarrativeIntentModel {
  input: NarrativeIntent;
  processing: IntentProcessing;
  output: CinematicParameters;
}

export interface NarrativeIntent {
  category: 'emotion' | 'relationship' | 'narrative' | 'atmosphere';
  specificIntent: string;
  intensity: number; // 1-10
  duration: 'moment' | 'scene' | 'sequence' | 'act';
  context: string;
}

export interface IntentProcessing {
  psychologyLookup: ShotPsychology[];
  genreConsideration: GenreVisualLexicon;
  compositionRules: CompositionRules;
  colorMood: ColorMoodSystem;
}

export interface CinematicParameters {
  recommendedShots: StoryboardShot[];
  lightingDirection: LightingDesign;
  colorGuidance: string[];
  movementSuggestions: CameraMovement[];
  pacingRecommendations: PacingArchitecture;
  rationale: string;
}

/**
 * Framework 2: Scene Deconstruction Generator
 */
export interface SceneDeconstructionGenerator {
  input: ScriptScene;
  processing: SceneAnalysis;
  output: ShotSequence;
}

export interface ScriptScene {
  sceneHeading: string;
  location: string;
  timeOfDay: string;
  characters: string[];
  actionLines: string[];
  dialogueBlocks: DialogueBlock[];
}

export interface DialogueBlock {
  character: string;
  dialogue: string;
  parenthetical?: string;
  emotionalContext: string;
}

export interface SceneAnalysis {
  genreTemplate: GenreVisualLexicon;
  characterCount: number;
  emotionalBeats: string[];
  keyActions: string[];
  visualPriorities: string[];
}

export interface ShotSequence {
  establishingShot: StoryboardShot;
  masterShot: StoryboardShot;
  coverageShots: StoryboardShot[];
  emphasisShots: StoryboardShot[];
  transitionShot?: StoryboardShot;
}

/**
 * Framework 3: Compositional Assistant
 */
export interface CompositionalAssistant {
  input: RoughComposition;
  analysis: CompositionAnalysis;
  suggestions: CompositionSuggestions;
}

export interface RoughComposition {
  imageData: string; // base64 or file path
  subjects: string[];
  environment: string;
  intendedEmotion: string;
}

export interface CompositionAnalysis {
  ruleOfThirdsCompliance: number; // 1-10
  visualBalance: number; // 1-10
  leadingLinesDetected: string[];
  depthLayers: number;
  visualWeight: string;
}

export interface CompositionSuggestions {
  ruleAdjustments: string[];
  styleFilters: StyleFilter[];
  improvementTips: string[];
  alternativeFramings: string[];
}

export interface StyleFilter {
  name: string;
  cinematographer: string;
  adjustments: string[];
  visualExample: string;
}

// ============================================================================
// MAIN STORYBOARD ARCHITECTURE
// ============================================================================

/**
 * The Complete Storyboard Shot
 */
export interface StoryboardShot {
  // Basic Identification
  id: string;
  sceneNumber: string;
  shotNumber: string;
  description: string;
  
  // Visual Composition
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  composition: CompositionRules;
  
  // Lighting and Color
  lighting: LightingDesign;
  colorMood: ColorMoodSystem;
  
  // Technical Specifications
  lensChoice: string;
  focalLength: number;
  aperture: string;
  cameraHeight: number;
  
  // Narrative Function
  narrativeIntent: NarrativeIntent;
  emotionalPurpose: string;
  storyFunction: string;
  
  // Timing and Pacing
  estimatedDuration: number;
  pacingRole: string;
  transitionType: string;
  
  // Characters and Action
  charactersInShot: string[];
  keyAction: string;
  dialogueLine?: string;
  
  // Production Notes
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  equipment: string[];
  specialRequirements: string[];
  budgetImpact: 'low' | 'medium' | 'high';
  
  // AI Generation Metadata
  generatedBy: string;
  confidence: number; // 1-10
  alternativeOptions: string[];
}

/**
 * Complete Storyboard Sequence
 */
export interface StoryboardSequence {
  // Sequence Identity
  id: string;
  title: string;
  sceneRange: string;
  
  // Shots
  shots: StoryboardShot[];
  
  // Sequence-Level Design
  overallStyle: CinematographerStyle;
  genreApproach: GenreVisualLexicon;
  pacingArchitecture: PacingArchitecture;
  colorStrategy: ColorMoodSystem;
  
  // Narrative Context
  emotionalArc: string;
  storyPurpose: string;
  characterFocus: string[];
  
  // Production Planning
  estimatedDuration: number;
  complexity: string;
  budgetEstimate: string;
  specialRequirements: string[];
  
  // Quality Metrics
  visualConsistency: number; // 1-10
  narrativeClarity: number; // 1-10
  emotionalImpact: number; // 1-10
  technicalFeasibility: number; // 1-10
}

// ============================================================================
// STORYBOARD ENGINE V2.0 IMPLEMENTATION
// ============================================================================

export class StoryboardEngineV2 {
  
  /**
   * AI-ENHANCED: Generate complete visual sequence from script
   */
  static async generateStoryboardSequence(
    scriptScene: ScriptScene,
    characters: ArchitectedCharacter[],
    premise: StoryPremise,
    options: {
      genre?: string;
      cinematographerStyle?: string;
      complexity?: 'lean-forward' | 'lean-back';
      budget?: 'low' | 'medium' | 'high';
      targetDuration?: number;
    } = {}
  ): Promise<StoryboardSequence> {
    
    console.log(`🎬 STORYBOARD ENGINE V2.0: Generating sequence for ${scriptScene.sceneHeading}...`);
    
    try {
      // Stage 1: Analyze Scene and Context
      const sceneAnalysis = await this.analyzeSceneContext(
        scriptScene, characters, premise, options
      );
      
      // Stage 2: Apply Genre Visual Language
      const genreApproach = this.selectGenreApproach(
        options.genre || 'drama', sceneAnalysis
      );
      
      // Stage 3: Choose Cinematographer Style
      const cinematographerStyle = await this.selectCinematographerStyle(
        options.cinematographerStyle || 'naturalistic', sceneAnalysis
      );
      
      // Stage 4: Generate Shot Sequence
      const shotSequence = await this.generateShotSequence(
        sceneAnalysis, genreApproach, cinematographerStyle, options
      );
      
      // Stage 5: Apply Pacing Architecture
      const pacingArchitecture = await this.designPacingArchitecture(
        shotSequence, sceneAnalysis, options
      );
      
      // Stage 6: Integrate Color Strategy
      const colorStrategy = await this.designColorStrategy(
        sceneAnalysis, genreApproach, premise
      );
      
      // Stage 7: Assemble Complete Sequence
      const storyboardSequence = await this.assembleStoryboardSequence(
        scriptScene,
        shotSequence,
        cinematographerStyle,
        genreApproach,
        pacingArchitecture,
        colorStrategy,
        options
      );
      
      console.log(`✅ STORYBOARD ENGINE V2.0: Generated ${storyboardSequence.shots.length} shots`);
      
      return storyboardSequence;
      
    } catch (error) {
      console.error('❌ Storyboard Engine V2.0 failed:', error);
      throw new Error(`Storyboard generation failed: ${error}`);
    }
  }
  
  /**
   * Framework 1: Narrative Intent Model Implementation
   */
  static async processNarrativeIntent(
    intent: NarrativeIntent,
    context: any
  ): Promise<CinematicParameters> {
    
    const prompt = `As a master cinematographer, translate this narrative intent into specific cinematic techniques:

INTENT: ${intent.specificIntent}
CATEGORY: ${intent.category}
INTENSITY: ${intent.intensity}/10
DURATION: ${intent.duration}
CONTEXT: ${intent.context}

Using professional cinematography knowledge, provide:

1. SHOT SIZE RECOMMENDATIONS:
   - Which shot sizes best serve this intent?
   - Why these sizes create the desired effect?
   - Emotional distance considerations

2. CAMERA ANGLE STRATEGY:
   - Recommended angles and their psychological impact
   - Power dynamics considerations
   - Viewer relationship to subject

3. MOVEMENT APPROACH:
   - Static vs dynamic camera work
   - Specific movement types and their emotional connotations
   - Energy level and pacing implications

4. LIGHTING DESIGN:
   - Key lighting approach (hard/soft, high/low key)
   - Color temperature recommendations
   - Shadow strategy for emotional impact

5. COMPOSITIONAL GUIDANCE:
   - Rule of thirds application or breaking
   - Symmetry vs asymmetry considerations
   - Depth and layering strategies

Provide specific, actionable cinematographic recommendations.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a master cinematographer and visual storytelling expert. Provide specific, professional cinematographic guidance based on narrative intent.',
        temperature: 0.7,
        maxTokens: 2000
      });

      return this.parseNarrativeIntentResult(result, intent);
      
    } catch (error) {
      console.warn('AI narrative intent processing failed, using structured fallback');
      return this.generateFallbackCinematicParameters(intent);
    }
  }
  
  /**
   * Framework 2: Scene Deconstruction Implementation
   */
  static async deconstructScene(
    scriptScene: ScriptScene,
    genreTemplate: GenreVisualLexicon
  ): Promise<ShotSequence> {
    
    const prompt = `Deconstruct this script scene into a professional shot sequence:

SCENE: ${scriptScene.sceneHeading}
LOCATION: ${scriptScene.location}
TIME: ${scriptScene.timeOfDay}
CHARACTERS: ${scriptScene.characters.join(', ')}

ACTION LINES:
${scriptScene.actionLines.map((action, i) => `${i + 1}. ${action}`).join('\n')}

DIALOGUE BLOCKS:
${scriptScene.dialogueBlocks.map((block, i) => 
  `${i + 1}. ${block.character}: "${block.dialogue}"${block.parenthetical ? ` (${block.parenthetical})` : ''}`
).join('\n')}

GENRE: ${genreTemplate.genre}
VISUAL STYLE: ${genreTemplate.lightingStyle.motivation} lighting, ${genreTemplate.editingPace} pacing

Generate a professional shot breakdown:

1. ESTABLISHING SHOT:
   - Shot size and framing
   - Purpose and information conveyed
   - Duration estimate

2. MASTER SHOT:
   - Coverage of main action
   - Character relationships shown
   - Camera position rationale

3. COVERAGE SHOTS:
   - Individual character shots for dialogue
   - Over-the-shoulder shots
   - Reaction shots
   - Insert shots for important objects/actions

4. EMPHASIS SHOTS:
   - Close-ups for emotional beats
   - Extreme close-ups for critical details
   - Special shots for dramatic moments

5. TRANSITION SHOT:
   - How to exit the scene
   - Connection to next scene
   - Final emotional note

Provide professional shot descriptions with technical details.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a professional cinematographer and storyboard artist. Create comprehensive shot breakdowns for film production.',
        temperature: 0.6,
        maxTokens: 2500
      });

      return this.parseSceneDeconstructionResult(result, scriptScene, genreTemplate);
      
    } catch (error) {
      console.warn('AI scene deconstruction failed, using structured fallback');
      return this.generateFallbackShotSequence(scriptScene, genreTemplate);
    }
  }
  
  /**
   * Framework 3: Compositional Assistant Implementation
   */
  static async analyzeComposition(
    composition: RoughComposition
  ): Promise<CompositionSuggestions> {
    
    const prompt = `Analyze this composition and provide professional cinematographic guidance:

SUBJECTS: ${composition.subjects.join(', ')}
ENVIRONMENT: ${composition.environment}
INTENDED EMOTION: ${composition.intendedEmotion}

As a master cinematographer, analyze and suggest improvements:

1. RULE OF THIRDS ANALYSIS:
   - Current subject placement assessment
   - Recommendations for stronger composition
   - When to break the rule for effect

2. VISUAL BALANCE EVALUATION:
   - Weight distribution in frame
   - Symmetry vs asymmetry considerations
   - Dynamic balance opportunities

3. LEADING LINES IDENTIFICATION:
   - Available lines in the composition
   - How to strengthen directional flow
   - Eye movement through the frame

4. DEPTH AND LAYERING:
   - Foreground, midground, background use
   - Ways to enhance dimensionality
   - Focus and depth of field strategies

5. CINEMATOGRAPHER STYLE FILTERS:
   - Deakins approach: minimalism and natural light
   - Lubezki approach: wide-angle intimacy and movement
   - Custom adjustments for this specific shot

Provide specific, actionable composition improvements.`;

    try {
      const result = await generateContent(prompt, {
        systemPrompt: 'You are a master cinematographer specializing in composition and visual storytelling. Provide expert analysis and improvement suggestions.',
        temperature: 0.6,
        maxTokens: 1500
      });

      return this.parseCompositionAnalysisResult(result, composition);
      
    } catch (error) {
      console.warn('AI composition analysis failed, using structured fallback');
      return this.generateFallbackCompositionSuggestions(composition);
    }
  }
  
  // ============================================================================
  // HELPER METHODS AND PARSERS
  // ============================================================================
  
  private static async analyzeSceneContext(
    scriptScene: ScriptScene,
    characters: ArchitectedCharacter[],
    premise: StoryPremise,
    options: any
  ): Promise<SceneAnalysis> {
    
    // Analyze emotional beats with safe access
    const emotionalBeats = (scriptScene.dialogueBlocks || []).map(block => 
      block.emotionalContext || 'neutral'
    );
    
    // Identify key actions with safe access
    const keyActions = (scriptScene.actionLines || []).filter(action => 
      action && (
        action.toLowerCase().includes('enters') ||
        action.toLowerCase().includes('exits') ||
        action.toLowerCase().includes('grabs') ||
        action.toLowerCase().includes('looks') ||
        action.toLowerCase().includes('turns')
      )
    );
    
    return {
      genreTemplate: GENRE_LEXICONS[options.genre || 'drama'],
      characterCount: characters ? characters.length : 0,
      emotionalBeats: emotionalBeats,
      keyActions: keyActions,
      visualPriorities: ['Character emotion', 'Key actions', 'Environment']
    };
  }
  
  private static selectGenreApproach(
    genre: string,
    sceneAnalysis: SceneAnalysis
  ): GenreVisualLexicon {
    return GENRE_LEXICONS[genre] || GENRE_LEXICONS.drama;
  }
  
  private static async selectCinematographerStyle(
    styleHint: string,
    sceneAnalysis: SceneAnalysis
  ): Promise<CinematographerStyle> {
    
    if (styleHint.toLowerCase().includes('deakins')) {
      return {
        name: 'Roger Deakins Style',
        philosophy: 'Elegant simplicity and emotional transparency',
        signature: 'Naturalistic lighting and minimalist composition',
        deakinsApproach: {
          naturalisticLighting: true,
          minimalistComposition: true,
          shadowSculpting: true,
          purposefulMovement: true,
          emotionalTransparency: true
        }
      };
    }
    
    if (styleHint.toLowerCase().includes('lubezki')) {
      return {
        name: 'Emmanuel Lubezki Style',
        philosophy: 'Immersion and phenomenological experience',
        signature: 'Wide-angle intimacy and fluid long takes',
        lubezskiApproach: {
          naturalLightObsession: true,
          wideAngleIntimacy: true,
          fluidLongTakes: true,
          immersiveParticipation: true,
          phenomenologicalExperience: true
        }
      };
    }
    
    // Default naturalistic style
    return {
      name: 'Naturalistic Style',
      philosophy: 'Story-first visual approach',
      signature: 'Motivated lighting and purposeful camera work',
      customParameters: {
        lightingRatio: 6,
        movementFrequency: 5,
        shotDurationPreference: 'varied',
        intimacyLevel: 6
      }
    };
  }
  
  private static async generateShotSequence(
    sceneAnalysis: SceneAnalysis,
    genreApproach: GenreVisualLexicon,
    cinematographerStyle: CinematographerStyle,
    options: any
  ): Promise<ShotSequence> {
    
    // Generate basic shot sequence structure
    const establishingShot: StoryboardShot = {
      id: 'shot-establishing',
      sceneNumber: '1',
      shotNumber: '1',
      description: 'Establishing shot of location',
      shotSize: SHOT_SIZES.WS,
      cameraAngle: CAMERA_ANGLES['eye-level'],
      cameraMovement: CAMERA_MOVEMENTS.static,
      composition: this.generateDefaultComposition(),
      lighting: genreApproach.lightingStyle,
      colorMood: this.generateDefaultColorMood(),
      lensChoice: '35mm',
      focalLength: 35,
      aperture: 'f/2.8',
      cameraHeight: 5.5,
      narrativeIntent: {
        category: 'narrative',
        specificIntent: 'Establish location and context',
        intensity: 5,
        duration: 'moment',
        context: 'Scene opening'
      },
      emotionalPurpose: 'Orientation and context',
      storyFunction: 'Establishing',
      estimatedDuration: 3,
      pacingRole: 'Setup',
      transitionType: 'cut',
      charactersInShot: [],
      keyAction: 'Location reveal',
      complexity: 'simple',
      equipment: ['Camera', 'Tripod'],
      specialRequirements: [],
      budgetImpact: 'low',
      generatedBy: 'StoryboardEngineV2',
      confidence: 8,
      alternativeOptions: ['Drone establishing shot', 'Moving establishing shot']
    };
    
    const masterShot: StoryboardShot = {
      ...establishingShot,
      id: 'shot-master',
      shotNumber: '2',
      description: 'Master shot covering main action',
      shotSize: SHOT_SIZES.MS,
      charactersInShot: sceneAnalysis.genreTemplate?.genre === 'action' ? ['multiple'] : ['main'],
      keyAction: 'Main scene action',
      narrativeIntent: {
        category: 'narrative',
        specificIntent: 'Cover primary scene action',
        intensity: 6,
        duration: 'scene',
        context: 'Main coverage'
      },
      emotionalPurpose: 'Primary narrative progression',
      storyFunction: 'Coverage'
    };
    
    return {
      establishingShot,
      masterShot,
      coverageShots: [masterShot], // Simplified for now
      emphasisShots: [],
      transitionShot: undefined
    };
  }
  
  private static async designPacingArchitecture(
    shotSequence: ShotSequence,
    sceneAnalysis: SceneAnalysis,
    options: any
  ): Promise<PacingArchitecture> {
    
    const genrePacing = sceneAnalysis.genreTemplate?.editingPace || 'medium';
    
    return {
      shotDuration: {
        averageLength: genrePacing === 'fast' ? 2 : genrePacing === 'slow' ? 8 : 5,
        variationPattern: 'rhythmic',
        longTakeThreshold: 10,
        quickCutThreshold: 1,
        narrativeReason: `${genrePacing} pacing for ${sceneAnalysis.genreTemplate?.genre || 'drama'} genre`
      },
      editingRhythm: {
        cutsPerMinute: genrePacing === 'fast' ? 30 : genrePacing === 'slow' ? 8 : 15,
        rhythmPattern: 'steady',
        transitionTypes: ['cut'],
        tempoDescription: `${genrePacing} tempo editing`
      },
      cameraMovementTempo: {
        movementFrequency: 3,
        movementSpeed: 'moderate',
        movementStyle: 'smooth',
        energyContribution: 5
      },
      sequencePacing: {
        overallTempo: genrePacing === 'fast' ? 'energetic' : genrePacing === 'slow' ? 'contemplative' : 'measured',
        tensionCurve: 'building',
        breathingRoom: 5,
        intensityLevel: 6
      },
      emotionalModulation: {
        pacingContrast: true,
        tensionReleaseCycle: true,
        emotionalBeats: sceneAnalysis.emotionalBeats,
        audienceEngagementStrategy: 'Rhythmic progression with emotional beats'
      }
    };
  }
  
  private static async designColorStrategy(
    sceneAnalysis: SceneAnalysis,
    genreApproach: GenreVisualLexicon,
    premise: StoryPremise
  ): Promise<ColorMoodSystem> {
    
    const primaryColors = genreApproach.dominantColorPalette.map(colorName => {
      // Map color names to ColorPsychology objects
      const colorKey = colorName.toLowerCase().includes('blue') ? 'blue' :
                       colorName.toLowerCase().includes('red') ? 'red' :
                       colorName.toLowerCase().includes('green') ? 'green' :
                       colorName.toLowerCase().includes('yellow') ? 'yellow' :
                       colorName.toLowerCase().includes('orange') ? 'orange' :
                       colorName.toLowerCase().includes('purple') ? 'purple' : 'blue';
      return COLOR_PSYCHOLOGY[colorKey];
    });
    
    return {
      primaryPalette: primaryColors,
      secondaryPalette: [],
      accentColors: [],
      colorHarmony: 'analogous',
      emotionalArc: sceneAnalysis.emotionalBeats.join(' → '),
      culturalContext: 'Western'
    };
  }
  
  private static async assembleStoryboardSequence(
    scriptScene: ScriptScene,
    shotSequence: ShotSequence,
    cinematographerStyle: CinematographerStyle,
    genreApproach: GenreVisualLexicon,
    pacingArchitecture: PacingArchitecture,
    colorStrategy: ColorMoodSystem,
    options: any
  ): Promise<StoryboardSequence> {
    
    const allShots = [
      shotSequence.establishingShot,
      shotSequence.masterShot,
      ...shotSequence.coverageShots,
      ...shotSequence.emphasisShots
    ].filter((shot, index, array) => array.indexOf(shot) === index); // Remove duplicates
    
    return {
      id: `sequence-${Date.now()}`,
      title: scriptScene.sceneHeading,
      sceneRange: scriptScene.sceneHeading,
      shots: allShots,
      overallStyle: cinematographerStyle,
      genreApproach: genreApproach,
      pacingArchitecture: pacingArchitecture,
      colorStrategy: colorStrategy,
      emotionalArc: colorStrategy.emotionalArc,
      storyPurpose: 'Scene progression',
      characterFocus: scriptScene.characters,
      estimatedDuration: allShots.reduce((total, shot) => total + shot.estimatedDuration, 0),
      complexity: options.complexity || 'moderate',
      budgetEstimate: options.budget || 'medium',
      specialRequirements: [],
      visualConsistency: 8,
      narrativeClarity: 8,
      emotionalImpact: 7,
      technicalFeasibility: 9
    };
  }
  
  // Fallback and utility methods
  private static generateDefaultComposition(): CompositionRules {
    return {
      ruleOfThirds: {
        enabled: true,
        subjectPlacement: 'intersection',
        horizonPlacement: 'lower-third',
        narrativeReason: 'Standard balanced composition'
      },
      symmetryAndBalance: {
        type: 'asymmetrical',
        axis: 'vertical',
        psychologicalEffect: 'Dynamic balance',
        appropriateGenres: ['drama', 'action']
      },
      leadingLines: {
        lineTypes: ['architectural'],
        direction: 'toward-subject',
        strength: 'moderate',
        narrativeFunction: 'Guide viewer attention'
      },
      depthAndLayers: {
        foregroundElements: [],
        midgroundFocus: 'character',
        backgroundContext: 'environment',
        depthCues: ['overlap', 'size-variation'],
        dimensionalityScore: 6
      },
      headroomAndLookroom: {
        headroom: 'standard',
        lookroom: 'standard',
        breathingRoom: 5,
        claustrophobiaLevel: 3
      },
      ruleBreaking: {
        rulesToBreak: [],
        intentionalEffect: 'None',
        genreAppropriateness: [],
        psychologicalJustification: 'Standard composition approach'
      }
    };
  }
  
  private static generateDefaultColorMood(): ColorMoodSystem {
    return {
      primaryPalette: [COLOR_PSYCHOLOGY.blue],
      secondaryPalette: [],
      accentColors: [],
      colorHarmony: 'monochromatic',
      emotionalArc: 'Neutral progression',
      culturalContext: 'Western'
    };
  }
  
  // Parser methods (simplified for now)
  private static parseNarrativeIntentResult(result: string, intent: NarrativeIntent): CinematicParameters {
    // In production, this would parse the AI response more sophisticated
    return {
      recommendedShots: [],
      lightingDirection: {
        placement: 'front',
        quality: 'soft',
        intensity: 'high-key',
        color: COLOR_TEMPERATURES.daylight,
        motivation: 'natural',
        eyeLightTreatment: 'strong',
        shadowStrategy: 'eliminating'
      },
      colorGuidance: ['Warm tones for intimacy'],
      movementSuggestions: [CAMERA_MOVEMENTS.static],
      pacingRecommendations: {
        shotDuration: {
          averageLength: 5,
          variationPattern: 'consistent',
          longTakeThreshold: 10,
          quickCutThreshold: 1,
          narrativeReason: 'Standard pacing'
        },
        editingRhythm: {
          cutsPerMinute: 15,
          rhythmPattern: 'steady',
          transitionTypes: ['cut'],
          tempoDescription: 'Moderate tempo'
        },
        cameraMovementTempo: {
          movementFrequency: 3,
          movementSpeed: 'moderate',
          movementStyle: 'smooth',
          energyContribution: 5
        },
        sequencePacing: {
          overallTempo: 'measured',
          tensionCurve: 'building',
          breathingRoom: 5,
          intensityLevel: 5
        },
        emotionalModulation: {
          pacingContrast: true,
          tensionReleaseCycle: true,
          emotionalBeats: [intent.specificIntent],
          audienceEngagementStrategy: 'Standard engagement'
        }
      },
      rationale: `Generated for ${intent.specificIntent} with ${intent.intensity}/10 intensity`
    };
  }
  
  private static parseSceneDeconstructionResult(result: string, scriptScene: ScriptScene, genreTemplate: GenreVisualLexicon): ShotSequence {
    // Simplified parser - in production would be more sophisticated
    return this.generateFallbackShotSequence(scriptScene, genreTemplate);
  }
  
  private static parseCompositionAnalysisResult(result: string, composition: RoughComposition): CompositionSuggestions {
    return {
      ruleAdjustments: ['Consider rule of thirds placement'],
      styleFilters: [{
        name: 'Deakins Style',
        cinematographer: 'Roger Deakins',
        adjustments: ['Minimize composition', 'Natural lighting'],
        visualExample: 'Naturalistic framing'
      }],
      improvementTips: ['Add depth with foreground elements'],
      alternativeFramings: ['Try closer framing', 'Consider wide shot']
    };
  }
  
  private static generateFallbackCinematicParameters(intent: NarrativeIntent): CinematicParameters {
    return this.parseNarrativeIntentResult('', intent);
  }
  
  private static generateFallbackShotSequence(scriptScene: ScriptScene, genreTemplate: GenreVisualLexicon): ShotSequence {
    const basicShot: StoryboardShot = {
      id: 'fallback-shot',
      sceneNumber: '1',
      shotNumber: '1',
      description: 'Basic coverage shot',
      shotSize: SHOT_SIZES.MS,
      cameraAngle: CAMERA_ANGLES['eye-level'],
      cameraMovement: CAMERA_MOVEMENTS.static,
      composition: this.generateDefaultComposition(),
      lighting: genreTemplate.lightingStyle,
      colorMood: this.generateDefaultColorMood(),
      lensChoice: '50mm',
      focalLength: 50,
      aperture: 'f/2.8',
      cameraHeight: 5.5,
      narrativeIntent: {
        category: 'narrative',
        specificIntent: 'Basic coverage',
        intensity: 5,
        duration: 'scene',
        context: 'Standard shot'
      },
      emotionalPurpose: 'Standard coverage',
      storyFunction: 'Coverage',
      estimatedDuration: 5,
      pacingRole: 'Standard',
      transitionType: 'cut',
      charactersInShot: scriptScene.characters,
      keyAction: 'Scene action',
      complexity: 'simple',
      equipment: ['Camera', 'Tripod'],
      specialRequirements: [],
      budgetImpact: 'low',
      generatedBy: 'Fallback',
      confidence: 5,
      alternativeOptions: []
    };
    
    return {
      establishingShot: basicShot,
      masterShot: basicShot,
      coverageShots: [basicShot],
      emphasisShots: [],
      transitionShot: undefined
    };
  }
  
  private static generateFallbackCompositionSuggestions(composition: RoughComposition): CompositionSuggestions {
    return this.parseCompositionAnalysisResult('', composition);
  }
}

// Export the enhanced storyboard types
export type { StoryboardSequence, StoryboardShot };
 