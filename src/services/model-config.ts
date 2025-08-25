/**
 * 🤖 MODEL CONFIGURATION - Latest AI Models
 * Central configuration for all AI models used in Reeled AI
 */

// 🚀 GEMINI 2.5 PRO CONFIGURATION (As per official docs)
export const GEMINI_CONFIG = {
  // Gemini models - USING THE BEST AVAILABLE AS USER DEMANDED
  MODELS: {
    PRO: 'gemini-2.5-pro', // THE MOST POWERFUL MODEL - USER'S EXPLICIT REQUIREMENT
    FLASH: 'gemini-2.5-flash', // UPGRADED MODEL
    FLASH_LITE: 'gemini-2.5-flash',
    // PROPER fallback hierarchy - 2.0 then 1.5 only if absolutely necessary
    PRO_FALLBACK: 'gemini-2.0-flash-exp',
    LAST_RESORT: 'gemini-1.5-pro-latest'
  },
  
  // Model selection based on use case
  getModel: (mode: 'beast' | 'stable' | 'fast') => {
    switch (mode) {
      case 'beast':
        return GEMINI_CONFIG.MODELS.PRO // Most powerful thinking model
      case 'stable':
        return GEMINI_CONFIG.MODELS.PRO // Reliable performance
      case 'fast':
        return GEMINI_CONFIG.MODELS.FLASH_LITE // Fastest responses
      default:
        return GEMINI_CONFIG.MODELS.PRO
    }
  },

  // Enhanced safety settings for creative content
  SAFETY_SETTINGS: {
    HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
    HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
    SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
    DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE'
  },

  // Generation config for creative storytelling
  GENERATION_CONFIG: {
    temperature: 0.7,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 8192
  }
}

// 🔥 AZURE OPENAI GPT-5 CONFIGURATION
export const AZURE_CONFIG = {
  // GPT-5 deployment configurations
  DEPLOYMENTS: {
    GPT_5: 'gpt-5',
    GPT_5_PREVIEW: 'gpt-5-preview',
    GPT_5_TURBO: 'gpt-5-turbo'
  },

  // Model selection based on complexity
  getModel: (complexity: 'simple' | 'complex' | 'creative') => {
    switch (complexity) {
      case 'creative':
        return AZURE_CONFIG.DEPLOYMENTS.GPT_5 // Full GPT-5 for creative tasks
      case 'complex':
        return AZURE_CONFIG.DEPLOYMENTS.GPT_5_PREVIEW // Preview for complex reasoning
      case 'simple':
        return AZURE_CONFIG.DEPLOYMENTS.GPT_5_TURBO // Turbo for simple tasks
      default:
        return AZURE_CONFIG.DEPLOYMENTS.GPT_5
    }
  },

  // API configuration
  API_VERSION: '2024-12-01-preview', // Latest API version supporting GPT-5
  
  // Generation parameters optimized for GPT-5-mini
  GENERATION_PARAMS: {
    temperature: 1, // GPT-5-mini only supports temperature=1
    max_completion_tokens: 4096,
    // Note: GPT-5-mini has limited parameter support
  }
}

// 🎭 COMPREHENSIVE ENGINE-MODEL MAPPING
// Intelligent routing based on engine purpose and AI model strengths
export const ENGINE_MODELS = {
  // 🎯 ANALYTICAL/STRUCTURAL ENGINES → GPT-4.1/GPT-5-mini (Logic & Structure)
  'premise-engine-v2': 'gpt-4.1', // Logical premise analysis needs reasoning
  'fractal-narrative-engine-v2': 'gpt-4.1', // Narrative structure needs analytical thinking
  'theme-integration-engine-v2': 'gpt-4.1', // Thematic analysis requires logical connections
  'pacing-rhythm-engine-v2': 'gpt-4.1', // Mathematical timing analysis
  'tension-escalation-engine': 'gpt-4.1', // Structural tension building
  'five-minute-canvas-engine-v2': 'gpt-4.1', // Structural framework analysis
  'conflict-architecture-engine-v2': 'gpt-4.1', // Logical conflict mapping
  'episode-cohesion-engine-v2': 'gpt-4.1', // Analytical coherence checking
  
  // 🎨 CREATIVE/CHARACTER ENGINES → Gemini 2.5 Pro (Creativity & Psychology)
  'character-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Complex psychology needs creative thinking
  'strategic-dialogue-engine': GEMINI_CONFIG.MODELS.PRO, // Natural dialogue needs creative voice
  'world-building-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Immersive world creation
  'living-world-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Dynamic world systems
  'interactive-choice-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Creative branching narratives
  'choice-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Creative choice systems
  
  // 🎭 GENRE-SPECIFIC ENGINES → Gemini 2.5 Pro (Genre expertise & creativity)  
  'comedy-timing-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Comedy requires creative timing
  'horror-atmosphere-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Horror needs atmospheric creativity
  'romance-chemistry-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Romance needs emotional intelligence
  'mystery-construction-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Mystery plotting needs creative misdirection
  'genre-mastery-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Genre conventions need creative application
  
  // 🔧 TECHNICAL/PRODUCTION ENGINES → GPT-4.1 (Technical precision)
  'storyboard-engine-v2': 'gpt-4.1', // Visual planning needs technical precision
  'casting-engine-v2': 'gpt-4.1', // Casting analysis needs structured comparison
  'sound-design-engine-v2': 'gpt-4.1', // Technical audio planning
  'performance-coaching-engine-v2': 'gpt-4.1', // Structured performance guidance
  'serialized-continuity-engine-v2': 'gpt-4.1', // Technical continuity tracking
  
  // 🌍 LANGUAGE/CULTURAL ENGINES → Gemini 2.5 Pro (Cultural understanding)
  'language-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Language nuance needs cultural creativity
  'intelligent-trope-system': GEMINI_CONFIG.MODELS.PRO, // Trope subversion needs creative insight
  
  // 📊 LEGACY V1 ENGINES → Maintain compatibility but prefer V2
  'premise-engine': 'gpt-4.1',
  'character-engine': GEMINI_CONFIG.MODELS.PRO,
  'fractal-narrative-engine': 'gpt-4.1',
  'world-building-engine': GEMINI_CONFIG.MODELS.PRO,
  'strategic-dialogue-engine-v1': GEMINI_CONFIG.MODELS.PRO,
}

// 🔄 INTELLIGENT FALLBACK CONFIGURATION
export const FALLBACK_CONFIG = {
  // Azure fallback chain: GPT-4.1 → GPT-5-mini → GPT-4o (best to basic)
  AZURE_FALLBACKS: [
    'gpt-4.1', // Primary: Most capable reasoning
    AZURE_CONFIG.DEPLOYMENTS.GPT_5_TURBO, // Secondary: Fast but limited
    'gpt-4o-2024-11-20' // Last resort: Reliable backup
  ],
  
  // Gemini fallback chain: 2.5 Pro → 2.5 Flash → 1.5 Pro
  GEMINI_FALLBACKS: [
    GEMINI_CONFIG.MODELS.PRO, // Primary: Best creative thinking
    GEMINI_CONFIG.MODELS.FLASH, // Secondary: Faster alternative  
    'gemini-1.5-pro-002' // Last resort: Stable backup
  ],
  
  // Cross-provider fallback: If all Azure fails → Gemini, if all Gemini fails → Azure
  CROSS_PROVIDER_FALLBACK: {
    'azure-to-gemini': GEMINI_CONFIG.MODELS.PRO,
    'gemini-to-azure': 'gpt-4.1'
  }
}

// 🎯 PERFORMANCE OPTIMIZATION
export const PERFORMANCE_CONFIG = {
  // Parallel processing limits
  MAX_CONCURRENT_REQUESTS: 5,
  
  // Request timeouts
  REQUEST_TIMEOUT_MS: 60000, // 60 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  
  // Token limits per model
  TOKEN_LIMITS: {
    [GEMINI_CONFIG.MODELS.PRO]: 2097152, // ~2M tokens
    [AZURE_CONFIG.DEPLOYMENTS.GPT_5]: 128000, // 128k tokens
    [AZURE_CONFIG.DEPLOYMENTS.GPT_5_TURBO]: 128000
  }
}

export default {
  GEMINI_CONFIG,
  AZURE_CONFIG,
  ENGINE_MODELS,
  FALLBACK_CONFIG,
  PERFORMANCE_CONFIG
}