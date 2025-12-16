/**
 * 🤖 MODEL CONFIGURATION - Latest AI Models
 * Central configuration for all AI models used in Greenlit
 */

// 🚀 GEMINI 3 PRO CONFIGURATION (As per official docs)
export const GEMINI_CONFIG = {
  // Gemini models - USING THE BEST AVAILABLE AS USER DEMANDED
  MODELS: {
    PRO: 'gemini-3-pro-preview', // THE MOST POWERFUL MODEL - GEMINI 3 PRO
    FLASH: 'gemini-3-pro-preview', // Upgraded from 2.5-flash to 3.0
    FLASH_LITE: 'gemini-3-pro-preview', // Upgraded from 2.5-flash to 3.0
    // PROPER fallback hierarchy - 3 Pro → 3 Pro (no 2.5 fallback as it's obsolete)
    PRO_FALLBACK: 'gemini-3-pro-preview', // Upgraded from 2.5 Pro to 3.0
    LAST_RESORT: 'gemini-3-pro-preview' // 🔥 UPGRADED TO GEMINI 3 PRO!
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

  // Generation config for creative storytelling - MAXIMUM CREATIVITY!
  GENERATION_CONFIG: {
    temperature: 0.9, // 🔥 INCREASED FOR MAXIMUM CREATIVITY!
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
  
  // 🎨 CREATIVE/CHARACTER ENGINES → Gemini 3 Pro (Creativity & Psychology)
  'character-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Complex psychology needs creative thinking
  'strategic-dialogue-engine': GEMINI_CONFIG.MODELS.PRO, // Natural dialogue needs creative voice
  'world-building-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Immersive world creation
  'living-world-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Dynamic world systems
  'interactive-choice-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Creative branching narratives
  'choice-engine-v2': GEMINI_CONFIG.MODELS.PRO, // Creative choice systems
  
  // 🎭 GENRE-SPECIFIC ENGINES → Gemini 3 Pro (Genre expertise & creativity)  
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
  
  // 🌍 LANGUAGE/CULTURAL ENGINES → Gemini 3 Pro (Cultural understanding)
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
  
  // Gemini fallback chain: 3 Pro Preview only (2.5 and below are obsolete)
  GEMINI_FALLBACKS: [
    GEMINI_CONFIG.MODELS.PRO, // Primary: Best creative thinking (Gemini 3)
    'gemini-3-pro-preview', // Secondary: Same model as retry
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
    [GEMINI_CONFIG.MODELS.PRO]: 2097152, // ~2M tokens (Gemini 3 Pro)
    'gemini-3-pro-preview': 2097152, // ~2M tokens (upgraded from 2.5)
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