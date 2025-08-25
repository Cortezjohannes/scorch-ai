'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  WorldBuildingEngine, 
  WorldBlueprint, 
  WorldType, 
  ComplexityLevel,
  CulturalSystem,
  GeographySystem,
  PoliticalSystem,
  EconomicSystem,
  HistoricalTimeline,
  LanguageSystem,
  ReligionSystem,
  MagicSystem,
  TechnologySystem
} from '@/services/world-building-engine'
import { StoryPremise } from '@/services/premise-engine'
import { Character3D } from '@/services/character-engine'
import { GenreProfile } from '@/services/genre-mastery-system'

export function WorldBuildingDemo() {
  const [worldBlueprint, setWorldBlueprint] = useState<WorldBlueprint | null>(null)
  const [selectedWorldType, setSelectedWorldType] = useState<WorldType>('fantasy')
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('complex')
  const [activeView, setActiveView] = useState<string>('overview')
  const [selectedCulture, setSelectedCulture] = useState<number>(0)
  const [selectedContinent, setSelectedContinent] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const worldTypes: { id: WorldType; name: string; icon: string; description: string }[] = [
    { id: 'fantasy', name: 'Fantasy', icon: '🏰', description: 'Magic, dragons, and medieval kingdoms' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀', description: 'Futuristic technology and space exploration' },
    { id: 'historical', name: 'Historical', icon: '🏛️', description: 'Authentic historical periods and cultures' },
    { id: 'contemporary', name: 'Contemporary', icon: '🏙️', description: 'Modern-day realistic settings' },
    { id: 'post-apocalyptic', name: 'Post-Apocalyptic', icon: '☢️', description: 'Survival in destroyed worlds' },
    { id: 'alternate-history', name: 'Alternate History', icon: '🔄', description: 'What if history went differently' },
    { id: 'magical-realism', name: 'Magical Realism', icon: '✨', description: 'Subtle magic in realistic worlds' },
    { id: 'hybrid', name: 'Hybrid', icon: '🌈', description: 'Blend multiple world types' }
  ]

  const complexityLevels: { id: ComplexityLevel; name: string; description: string }[] = [
    { id: 'simple', name: 'Simple', description: '1-2 cultures, basic systems' },
    { id: 'moderate', name: 'Moderate', description: '3-4 cultures, developed systems' },
    { id: 'complex', name: 'Complex', description: '5-6 cultures, sophisticated systems' },
    { id: 'ultra-complex', name: 'Ultra-Complex', description: '7+ cultures, intricate interconnections' }
  ]

  const viewTabs = [
    { id: 'overview', name: 'Overview', icon: '🌍' },
    { id: 'geography', name: 'Geography', icon: '🗺️' },
    { id: 'cultures', name: 'Cultures', icon: '👥' },
    { id: 'politics', name: 'Politics', icon: '⚖️' },
    { id: 'economics', name: 'Economics', icon: '💰' },
    { id: 'history', name: 'History', icon: '📚' },
    { id: 'languages', name: 'Languages', icon: '🗣️' },
    { id: 'religions', name: 'Religions', icon: '⛪' },
    { id: 'systems', name: 'Systems', icon: '⚙️' },
    { id: 'integration', name: 'Integration', icon: '🔗' }
  ]

  const generateWorld = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    try {
      // Mock generation with progress updates
      const steps = [
        'Analyzing story requirements...',
        'Generating geography and climate...',
        'Developing cultural systems...',
        'Creating political structures...',
        'Establishing economic systems...',
        'Building historical timeline...',
        'Generating language systems...',
        'Creating belief systems...',
        'Implementing magic/tech systems...',
        'Integrating all systems...',
        'Validating consistency...',
        'Finalizing world blueprint...'
      ]
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setGenerationProgress(((i + 1) / steps.length) * 100)
      }
      
      // Generate mock world blueprint
      const mockWorld = createMockWorldBlueprint(selectedWorldType, complexityLevel)
      setWorldBlueprint(mockWorld)
      
    } catch (error) {
      console.error('Error generating world:', error)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const createMockWorldBlueprint = (worldType: WorldType, complexity: ComplexityLevel): WorldBlueprint => {
    const culturalCount = complexity === 'simple' ? 2 : complexity === 'moderate' ? 4 : complexity === 'complex' ? 6 : 8
    
    const mockCultures: CulturalSystem[] = Array.from({ length: culturalCount }, (_, i) => ({
      id: `culture-${i}`,
      name: ['Valdris Empire', 'Nomadic Keth', 'Seafaring Thalassans', 'Mountain Dwarves', 'Forest Elves', 'Desert Tribes', 'Scholarly Mages', 'Warrior Clans'][i],
      description: [
        'A mighty empire built on conquest and order',
        'Free-spirited nomads who follow the wind',
        'Master sailors who rule the waves',
        'Hardy mountain folk with ancient traditions',
        'Mystical forest dwellers in harmony with nature',
        'Resilient desert survivors with rich oral traditions',
        'Knowledge-seeking academics who pursue magical arts',
        'Honor-bound warriors with complex clan hierarchies'
      ][i],
      values: [
        { name: 'Order', description: 'Structure and hierarchy above all', priority: 9, expression: [], conflicts: [], storyUtility: { plotRelevance: 8, characterMotivation: 7, conflictSource: 9 } },
        { name: 'Freedom', description: 'Personal liberty and autonomy', priority: 10, expression: [], conflicts: [], storyUtility: { plotRelevance: 9, characterMotivation: 9, conflictSource: 8 } }
      ],
      worldview: {
        cosmology: ['Divine mandate', 'Endless journey', 'Oceanic cycles', 'Mountain permanence', 'Natural harmony', 'Desert endurance', 'Pursuit of knowledge', 'Ancestral honor'][i],
        morality: ['Lawful good', 'Chaotic neutral', 'Lawful neutral', 'Lawful good', 'Neutral good', 'True neutral', 'Lawful neutral', 'Lawful neutral'][i],
        philosophy: ['Order brings prosperity', 'Freedom is life', 'The sea provides', 'Stone endures', 'Balance in all things', 'Adapt or perish', 'Knowledge is power', 'Honor above all'][i]
      },
      socialStructure: {
        hierarchy: 'rigid' as any,
        mobility: 'limited' as any,
        classes: [],
        roles: [],
        institutions: [],
        familyStructure: 'nuclear' as any,
        kinshipPatterns: [],
        inheritance: 'patrilineal' as any,
        marriage: 'monogamous' as any,
        powerDistribution: 'centralized' as any,
        authorityStructures: [],
        decisionMaking: 'hierarchical' as any
      },
      traditions: [],
      arts: [],
      music: [],
      literature: [],
      architecture: [],
      communication: {
        directness: [9, 3, 7, 8, 5, 6, 9, 8][i],
        formality: [9, 2, 6, 7, 4, 5, 8, 9][i],
        emotionalExpression: [3, 9, 6, 5, 8, 7, 4, 6][i],
        conflictApproach: ['direct confrontation', 'avoidance', 'negotiation', 'formal challenge', 'mediation', 'elder judgment', 'debate', 'ritual combat'][i]
      },
      conflictResolution: 'formal' as any,
      leadership: 'authoritarian' as any,
      education: 'formal' as any,
      origins: { foundingMyth: 'Ancient conquest', migrationPattern: 'None', culturalAncestors: [] },
      influences: [],
      adaptations: [],
      futureTrajectory: { direction: 'expansion', probability: 0.8, timeframe: 'decades' },
      characterTypes: [],
      conflictSources: [],
      storyOpportunities: [],
      homelands: [],
      diaspora: [],
      culturalBorders: [],
      allies: [],
      rivals: [],
      neutral: [],
      trade: []
    }))

    const mockGeography: GeographySystem = {
      continents: [
        {
          name: 'Aethermoor',
          size: 'large',
          terrain: ['mountains', 'plains', 'forests'],
          climate: ['temperate', 'continental'],
          nations: [],
          territories: [],
          contested: [],
          culturalRegions: [],
          tradeRoutes: [],
          importance: 'central',
          storyRole: 'setting',
          conflictPotential: 'high'
        },
        {
          name: 'Thalassos',
          size: 'medium',
          terrain: ['coastlines', 'islands'],
          climate: ['oceanic', 'mediterranean'],
          nations: [],
          territories: [],
          contested: [],
          culturalRegions: [],
          tradeRoutes: [],
          importance: 'major',
          storyRole: 'setting',
          conflictPotential: 'moderate'
        }
      ],
      oceans: [
        { name: 'Crimson Sea', size: 'vast', depth: 'deep', currents: [], weather: [], mysticalProperties: [] }
      ],
      climateZones: [
        { name: 'Northern Temperate', type: 'temperate', seasons: 4, precipitation: 'moderate', temperature: 'mild' }
      ],
      naturalWonders: [
        { name: 'The Singing Crystals', type: 'magical', location: 'Aethermoor', significance: 'Power source', storyPotential: 9 }
      ],
      culturalInfluence: [],
      economicInfluence: [],
      politicalInfluence: [],
      conflictInfluence: [],
      geologicalRealism: 8,
      climaticRealism: 9,
      ecologicalRealism: 8,
      storySettings: [],
      symbolicMeaning: [],
      plotDevices: []
    }

    const mockPolitics: PoliticalSystem = {
      type: 'empire',
      structure: {
        centralAuthority: 'emperor',
        regionalDivisions: 'provinces',
        localGovernment: 'appointed-governors',
        checks: 'imperial-council'
      },
      primaryPower: {
        name: 'Imperial Throne',
        type: 'hereditary-monarchy',
        influence: 10,
        legitimacy: 8,
        stability: 7
      },
      secondaryPowers: [
        { name: 'Noble Houses', type: 'aristocracy', influence: 7, legitimacy: 6, stability: 8 },
        { name: 'Military Orders', type: 'military', influence: 8, legitimacy: 7, stability: 9 }
      ],
      opposition: [
        { name: 'Free Cities Alliance', type: 'republican', influence: 5, legitimacy: 6, stability: 6 }
      ],
      decisionMaking: {
        process: 'imperial-decree',
        consultation: 'advisory-council',
        implementation: 'bureaucratic',
        appeals: 'limited'
      },
      succession: {
        method: 'primogeniture',
        stability: 'moderate',
        conflicts: ['succession-wars']
      },
      lawMaking: { process: 'imperial-edict', enforcement: 'imperial-guard' },
      enforcement: { primaryForce: 'legions', localForce: 'city-guards', specialForces: ['inquisitors'] },
      internalFactions: [],
      externalRelations: [],
      alliances: [],
      conflicts: [],
      intrigue: [],
      instability: [],
      changeOpportunities: [],
      characterRoles: []
    }

    const mockEconomics: EconomicSystem = {
      type: 'feudal',
      complexity: 7,
      currency: {
        primary: 'Imperial Gold',
        secondary: 'Silver Crowns',
        local: 'Copper Commons',
        exchange: '1:10:100',
        stability: 8,
        acceptance: 9
      },
      trade: {
        internal: 'well-developed',
        external: 'expanding',
        routes: ['Silk Road', 'Northern Passage'],
        barriers: 'moderate-tariffs',
        guilds: 'powerful'
      },
      production: {
        agriculture: 'dominant',
        crafts: 'guild-controlled',
        manufacturing: 'limited',
        services: 'emerging'
      },
      distribution: {
        method: 'market-towns',
        efficiency: 7,
        equity: 4,
        accessibility: 6
      },
      primarySector: { dominance: 60, employment: 70, productivity: 6, innovation: 3 },
      secondarySector: { dominance: 30, employment: 20, productivity: 8, innovation: 5 },
      tertiarySector: { dominance: 10, employment: 10, productivity: 7, innovation: 4 },
      resources: [
        { name: 'Iron Ore', abundance: 8, location: 'Mountains', strategic: 9, conflicts: ['mining-rights'] },
        { name: 'Magical Crystals', abundance: 3, location: 'Singing Valley', strategic: 10, conflicts: ['crystal-wars'] }
      ],
      scarcity: [
        { resource: 'Rare Metals', level: 8, impact: 'high-tech-limitation', solutions: ['trade-expansion'] }
      ],
      abundance: [
        { resource: 'Fertile Land', level: 9, impact: 'food-security', opportunities: ['export-potential'] }
      ],
      sustainability: { renewable: 6, conservation: 5, innovation: 4, awareness: 3 },
      tradePartners: [],
      competitors: [],
      dependencies: [],
      economicConflicts: [],
      opportunityStructures: [],
      plotDevices: [],
      characterMotivations: []
    }

    const mockHistory: HistoricalTimeline = {
      eras: [
        {
          name: 'Age of Foundation',
          duration: 500,
          startYear: -500,
          endYear: 0,
          characteristics: ['tribal-confederations', 'early-settlements', 'first-kingdoms'],
          majorEvents: ['Great Migration', 'First Unification Wars'],
          culturalDevelopments: ['writing-systems', 'early-religions'],
          technologicalProgress: ['bronze-working', 'agriculture'],
          politicalEvolution: ['chieftains-to-kings']
        },
        {
          name: 'Imperial Age',
          duration: 300,
          startYear: 0,
          endYear: 300,
          characteristics: ['empire-building', 'cultural-flowering', 'technological-advancement'],
          majorEvents: ['Imperial Conquest', 'Golden Peace'],
          culturalDevelopments: ['imperial-culture', 'artistic-renaissance'],
          technologicalProgress: ['iron-working', 'engineering'],
          politicalEvolution: ['empire-formation']
        }
      ],
      majorEvents: [
        {
          name: 'The Great Unification',
          date: { year: 0, month: 1, day: 1 },
          description: 'Emperor Valdris united the warring kingdoms',
          causes: [
            { type: 'political', description: 'Endless warfare exhausted the land' },
            { type: 'economic', description: 'Trade routes needed protection' }
          ],
          consequences: [
            { type: 'political', description: 'Single empire established', magnitude: 10 },
            { type: 'cultural', description: 'Cultural synthesis began', magnitude: 8 }
          ],
          politicalImpact: 'transformative',
          economicImpact: 'major',
          culturalImpact: 'major',
          technologicalImpact: 'moderate',
          currentRelevance: 'high',
          characterConnections: [],
          plotOpportunities: [],
          tensionSources: []
        }
      ],
      culturalShifts: [],
      technologicalAdvances: [],
      cycles: [],
      trends: [],
      turning_points: [],
      ongoingEvents: [],
      recentHistory: [],
      emergingTrends: [],
      futureSeeds: [],
      relevantHistory: [],
      hiddenHistory: [],
      mythologizedHistory: [],
      characterConnections: []
    }

    const mockLanguages: LanguageSystem[] = [
      {
        name: 'High Valdrian',
        family: 'Indo-Valdric',
        speakers: [
          { group: 'Imperial Court', count: 1000, fluency: 'native', prestige: 10 },
          { group: 'Noble Houses', count: 50000, fluency: 'fluent', prestige: 9 }
        ],
        phonology: { consonants: 24, vowels: 8, tones: 0, stress: 'lexical' },
        grammar: { type: 'fusional', wordOrder: 'SOV', cases: 6, genders: 3 },
        vocabulary: { size: 'large', borrowing: 'moderate', innovation: 'high' },
        writing: { system: 'alphabetic', direction: 'left-to-right', complexity: 'moderate' },
        dialects: [
          { name: 'Court Valdrian', region: 'Capital', prestige: 10, divergence: 'minimal' },
          { name: 'Provincial Valdrian', region: 'Provinces', prestige: 7, divergence: 'moderate' }
        ],
        sociolects: [],
        registers: [
          { name: 'Imperial', usage: 'formal-court', complexity: 'high', prestige: 10 },
          { name: 'Common', usage: 'everyday', complexity: 'moderate', prestige: 6 }
        ],
        culturalRole: { identity: 9, literature: 8, religion: 7, administration: 10 },
        literaryTradition: { epics: ['Valdrian Saga'], poetry: ['Imperial Odes'], prose: ['Chronicles'] },
        oralTradition: { legends: ['Founding Myths'], songs: ['Battle Hymns'], stories: ['Hero Tales'] },
        taboos: [
          { type: 'religious', description: 'Never speak gods names in vain', severity: 'high' },
          { type: 'social', description: 'Address superiors with proper titles', severity: 'moderate' }
        ],
        characterVoices: [],
        dialoguePatterns: [],
        conflictSources: [],
        historicalChanges: [],
        currentTrends: [],
        futureEvolution: { direction: 'standardization', factors: ['imperial-policy'], timeframe: 'centuries' }
      }
    ]

    const mockReligions: ReligionSystem[] = [
      {
        name: 'The Eternal Order',
        type: 'monotheism',
        followers: [
          { demographic: 'Imperial Citizens', count: 5000000, devotion: 'moderate', influence: 8 },
          { demographic: 'Clergy', count: 100000, devotion: 'high', influence: 10 }
        ],
        theology: {
          deities: [{ name: 'The Eternal', domain: 'Order and Justice', power: 'omnipotent' }],
          cosmology: 'Great Chain of Being',
          creation: 'Divine Command',
          afterlife: 'Judgment and Reward'
        },
        cosmology: {
          structure: 'hierarchical-planes',
          creation: 'divine-word',
          time: 'linear-with-end',
          space: 'bounded-sacred'
        },
        eschatology: {
          endTimes: 'Final Judgment',
          signs: ['moral-decay', 'natural-disasters'],
          outcome: 'separation-of-good-evil',
          timeline: 'prophetic-calendar'
        },
        ethics: {
          commandments: ['Obey Divine Order', 'Serve the Greater Good', 'Protect the Innocent'],
          virtues: ['Justice', 'Temperance', 'Courage', 'Wisdom'],
          vices: ['Chaos', 'Selfishness', 'Cowardice', 'Ignorance'],
          moralFramework: 'divine-command-theory'
        },
        rituals: [
          { name: 'Daily Prayers', frequency: 'daily', participation: 'individual', significance: 'personal-devotion' },
          { name: 'Weekly Service', frequency: 'weekly', participation: 'communal', significance: 'community-binding' }
        ],
        ceremonies: [
          { name: 'Coming of Age', type: 'lifecycle', participants: 'youth', significance: 'social-recognition' },
          { name: 'Imperial Coronation', type: 'state', participants: 'nobility', significance: 'divine-legitimacy' }
        ],
        holidays: [
          { name: 'Day of Order', date: 'spring-equinox', duration: 1, activities: ['prayers', 'charity'] },
          { name: 'Festival of Unity', date: 'summer-solstice', duration: 3, activities: ['parades', 'feasts'] }
        ],
        pilgrimage: [
          { destination: 'Temple of the Eternal', difficulty: 'moderate', significance: 'major-blessing' }
        ],
        hierarchy: {
          structure: 'pyramidal',
          ranks: ['Eternal Archpriest', 'High Priests', 'Priests', 'Acolytes'],
          advancement: 'merit-and-calling',
          authority: 'divine-appointment'
        },
        institutions: [
          { name: 'Temple of the Eternal', type: 'central-temple', influence: 10, resources: 'vast' },
          { name: 'Missionary Orders', type: 'evangelical', influence: 7, resources: 'moderate' }
        ],
        orders: [
          { name: 'Order of the Righteous', type: 'militant', members: 5000, purpose: 'defend-faith' },
          { name: 'Scholarly Brothers', type: 'contemplative', members: 1000, purpose: 'preserve-knowledge' }
        ],
        politicalInfluence: { level: 9, methods: ['advisory-council', 'moral-authority'] },
        culturalInfluence: { level: 8, methods: ['education', 'art-patronage'] },
        economicInfluence: { level: 7, methods: ['tithes', 'temple-lands'] },
        relationships: [],
        conflicts: [],
        syncretism: [],
        characterFaith: [],
        moralFramework: {
          foundation: 'divine-command',
          application: 'contextual-wisdom',
          conflicts: 'hierarchical-resolution',
          growth: 'spiritual-maturity'
        },
        conflictSources: [],
        mysteries: [
          { name: 'The Divine Silence', description: 'Why the Eternal no longer speaks directly', implications: 'theological-crisis' }
        ]
      }
    ]

    const mockMagic: MagicSystem = worldType === 'fantasy' ? {
      name: 'Arcane Weaving',
      type: 'hard-magic',
      source: {
        type: 'ambient-energy',
        description: 'Magical energy flows through ley lines',
        accessibility: 'trained-only',
        depletion: 'renewable'
      },
      rules: [
        { principle: 'Conservation of Energy', description: 'Magic cannot create energy, only transform it' },
        { principle: 'Sympathetic Connection', description: 'Similar things affect each other across distance' },
        { principle: 'Will and Focus', description: 'Mental discipline required for complex magic' }
      ],
      limitations: [
        { type: 'physical', description: 'Magic causes physical exhaustion' },
        { type: 'mental', description: 'Complex spells require intense concentration' },
        { type: 'material', description: 'Some spells require specific components' }
      ],
      costs: [
        { type: 'fatigue', description: 'Physical and mental exhaustion', recovery: 'rest-and-meditation' },
        { type: 'components', description: 'Rare materials consumed in casting', acquisition: 'expensive-or-dangerous' }
      ],
      schools: [
        { name: 'Evocation', focus: 'Energy manipulation', difficulty: 'moderate', practitioners: 'battle-mages' },
        { name: 'Transmutation', focus: 'Matter transformation', difficulty: 'high', practitioners: 'artificers' },
        { name: 'Divination', focus: 'Information gathering', difficulty: 'variable', practitioners: 'seers' }
      ],
      practitioners: [
        { type: 'Imperial Mages', training: 'formal-academy', allegiance: 'empire', power: 'moderate-to-high' },
        { type: 'Hedge Wizards', training: 'self-taught', allegiance: 'none', power: 'low-to-moderate' }
      ],
      artifacts: [
        { name: 'Crystal of Power', type: 'amplifier', rarity: 'legendary', effect: 'doubles-magical-power' },
        { name: 'Scribes Quill', type: 'utility', rarity: 'uncommon', effect: 'auto-writing-spells' }
      ],
      creatures: [
        { name: 'Arcane Elemental', type: 'summoned', rarity: 'rare', abilities: ['energy-projection', 'flight'] },
        { name: 'Familiar', type: 'bonded', rarity: 'common', abilities: ['telepathic-link', 'spell-assistance'] }
      ],
      acceptance: {
        public: 'cautious-respect',
        government: 'regulated-approval',
        religion: 'theological-debate',
        nobility: 'strategic-interest'
      },
      regulation: {
        licensing: 'required-for-practice',
        restrictions: ['no-harmful-magic', 'registration-required'],
        enforcement: 'magical-inquisitors',
        penalties: 'fines-to-imprisonment'
      },
      institutions: [
        { name: 'Imperial Arcane Academy', type: 'education', influence: 9, resources: 'extensive' },
        { name: 'Guild of Artificers', type: 'professional', influence: 7, resources: 'moderate' }
      ],
      conflicts: [
        { name: 'Arcane Wars', period: 'historical', outcome: 'regulation-established' },
        { name: 'Magic vs Faith', period: 'ongoing', nature: 'ideological' }
      ],
      plotDevices: [
        { device: 'Magical Catastrophe', potential: 'world-ending', prevention: 'heroes-required' },
        { device: 'Lost Artifact', potential: 'power-shift', acquisition: 'quest-needed' }
      ],
      characterAbilities: [],
      tensionSources: [],
      mysteries: [
        { name: 'The Sundering', description: 'Ancient event that changed how magic works', implications: 'historical-secrets' }
      ],
      powerLevel: 'moderate',
      consistency: { rules: 9, application: 8, consequences: 9 },
      storyService: { plot: 8, character: 7, conflict: 9, atmosphere: 8 }
    } : null

    const mockTechnology: TechnologySystem = {
      level: 'medieval',
      development: {
        rate: 'slow',
        focus: ['military', 'agriculture', 'crafts'],
        innovation: 'guild-driven',
        diffusion: 'gradual'
      },
      transportation: {
        land: ['horses', 'carts', 'roads'],
        water: ['sailing-ships', 'river-barges'],
        speed: 'animal-powered',
        capacity: 'limited'
      },
      communication: {
        methods: ['messengers', 'signal-fires', 'written-letters'],
        speed: 'horse-speed',
        reliability: 'weather-dependent',
        security: 'encryption-basic'
      },
      warfare: {
        weapons: ['swords', 'bows', 'siege-engines'],
        armor: ['mail', 'plate'],
        tactics: ['formation-fighting', 'cavalry-charges'],
        fortification: ['stone-castles', 'city-walls']
      },
      medicine: {
        understanding: 'humoral-theory',
        treatments: ['herbs', 'surgery-basic', 'prayer'],
        practitioners: ['physicians', 'barber-surgeons', 'healers'],
        effectiveness: 'limited-but-improving'
      },
      agriculture: {
        methods: ['three-field-system', 'animal-power'],
        crops: ['grains', 'vegetables', 'livestock'],
        productivity: 'subsistence-plus',
        innovation: 'crop-rotation'
      },
      manufacturing: {
        methods: ['hand-crafts', 'water-mills', 'guild-system'],
        materials: ['wood', 'iron', 'textiles'],
        quality: 'high-craftsmanship',
        scale: 'small-scale'
      },
      energy: {
        sources: ['human', 'animal', 'water', 'wind'],
        applications: ['mills', 'transportation', 'crafts'],
        efficiency: 'low-but-reliable',
        sustainability: 'renewable'
      },
      adoption: {
        rate: 'conservative',
        barriers: ['cost', 'tradition', 'guild-resistance'],
        champions: ['innovators', 'merchants'],
        process: 'gradual-acceptance'
      },
      resistance: {
        sources: ['tradition', 'economic-disruption', 'religious-concerns'],
        intensity: 'moderate',
        resolution: 'compromise-adaptation'
      },
      inequality: {
        access: 'class-based',
        impact: 'moderate-disadvantage',
        mitigation: 'guild-apprenticeships'
      },
      plotRelevance: {
        advancement: 'major-plot-point',
        failure: 'catastrophic-consequences',
        control: 'power-struggles',
        ethics: 'moral-dilemmas'
      },
      characterAccess: [],
      conflictSources: [],
      research: {
        methods: ['empirical-observation', 'trial-and-error'],
        institutions: ['guilds', 'monasteries'],
        funding: 'patronage',
        dissemination: 'apprenticeship'
      },
      innovation: [],
      technological_change: []
    }

    return {
      id: `world-${Date.now()}`,
      name: `Realm of ${selectedWorldType === 'fantasy' ? 'Aethermoor' : selectedWorldType === 'sci-fi' ? 'Neo Terra' : 'Terra Historica'}`,
      description: `A ${complexity} ${worldType} world with ${culturalCount} distinct cultures, rich history, and intricate systems.`,
      premise: {
        theme: 'power-and-responsibility',
        premiseStatement: 'Those who seek power must accept the burden of responsibility',
        premiseType: 'cause-effect',
        character: 'aspiring-leader',
        conflict: 'power-vs-conscience',
        resolution: 'wisdom-through-sacrifice',
        isTestable: true,
        isSpecific: true,
        isArgued: true
      },
      geography: mockGeography,
      climate: { zones: mockGeography.climateZones, patterns: [], changes: [], impacts: [] },
      ecology: { biomes: [], species: [], food_chains: [], conservation: 6 },
      resources: mockEconomics.resources,
      cultures: mockCultures,
      languages: mockLanguages,
      religions: mockReligions,
      traditions: [],
      politics: mockPolitics,
      economics: mockEconomics,
      social: { classes: mockCultures[0].socialStructure.classes, mobility: mockCultures[0].socialStructure.mobility, institutions: [] },
      legal: { system: 'imperial-law', courts: [], enforcement: 'legions' },
      timeline: mockHistory,
      mythology: { creation: 'divine-formation', legends: [], heroes: [], artifacts: [] },
      conflicts: [],
      evolution: { drivers: [], trajectories: [], predictions: [] },
      magic: mockMagic,
      technology: mockTechnology,
      supernatural: worldType.includes('fantasy') ? { entities: [], phenomena: [], rules: [] } : null,
      storyRelevance: { plot: 9, character: 8, conflict: 9, atmosphere: 8 },
      characterIntegration: [],
      conflictSources: [],
      tensionGenerators: [],
      currentState: { 
        stability: 7, 
        prosperity: 6, 
        conflicts: ['border-tensions'], 
        opportunities: ['trade-expansion'],
        threats: ['succession-crisis'],
        changes: []
      },
      dynamicElements: [],
      changeDrivers: [],
      consistency: { internal: 9, historical: 8, cultural: 9, logical: 8 },
      depth: { cultural: 8, historical: 9, political: 8, economic: 7 },
      believability: { realism: 8, authenticity: 9, coherence: 8 },
      storyService: { plot: 9, character: 8, conflict: 9, theme: 8 }
    }
  }

  // Auto-start generation when component mounts
  useEffect(() => {
    generateWorld()
  }, [])

  const getWorldTypeColor = (type: WorldType) => {
    const colors = {
      fantasy: 'from-purple-600 to-pink-600',
      'sci-fi': 'from-blue-600 to-cyan-600',
      historical: 'from-amber-600 to-orange-600',
      contemporary: 'from-gray-600 to-slate-600',
      'post-apocalyptic': 'from-red-600 to-orange-600',
      'alternate-history': 'from-green-600 to-teal-600',
      'magical-realism': 'from-indigo-600 to-purple-600',
      hybrid: 'from-rose-600 to-pink-600'
    }
    return colors[type] || 'from-gray-600 to-slate-600'
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-[#e2c376] mb-4">🌍 World Building Engine Demo - Double Effort Edition</h3>
      <p className="text-[#e7e7e7]/70 mb-6">
        Experience the most sophisticated fictional world construction system ever created - building living, breathing worlds 
        with internal consistency, rich cultures, dynamic economies, political intrigue, deep history, and environmental realism 
        that serves as the foundation for compelling storytelling.
      </p>

      {/* World Building Principles */}
      <div className="mb-6 bg-[#2a2a2a] rounded-lg p-4">
        <h4 className="text-[#e2c376] font-bold mb-4">🎯 World Building Principles</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-blue-400">
            <h5 className="text-blue-400 font-semibold text-sm mb-1">🧩 INTERNAL CONSISTENCY</h5>
            <p className="text-xs text-[#e7e7e7]/90">Every world element follows logical rules</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-green-400">
            <h5 className="text-green-400 font-semibold text-sm mb-1">🌱 LIVING CULTURES</h5>
            <p className="text-xs text-[#e7e7e7]/90">Rich societies with authentic traditions</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-purple-400">
            <h5 className="text-purple-400 font-semibold text-sm mb-1">📚 DEEP HISTORY</h5>
            <p className="text-xs text-[#e7e7e7]/90">Layered past that shapes present conflicts</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 border-l-4 border-orange-400">
            <h5 className="text-orange-400 font-semibold text-sm mb-1">📖 STORY SERVICE</h5>
            <p className="text-xs text-[#e7e7e7]/90">Every element serves narrative purposes</p>
          </div>
        </div>
      </div>

      {/* World Configuration */}
      <div className="mb-6 grid md:grid-cols-2 gap-6">
        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <h4 className="text-[#e2c376] font-bold mb-4">🎨 World Type Selection</h4>
          <div className="grid grid-cols-2 gap-2">
            {worldTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedWorldType(type.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedWorldType === type.id
                    ? `bg-gradient-to-r ${getWorldTypeColor(type.id)} text-white`
                    : 'bg-[#1a1a1a] text-[#e7e7e7] hover:bg-[#36393f]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-semibold text-sm">{type.name}</span>
                </div>
                <p className="text-xs opacity-90">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4">
          <h4 className="text-[#e2c376] font-bold mb-4">⚙️ Complexity Level</h4>
          <div className="space-y-2">
            {complexityLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setComplexityLevel(level.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  complexityLevel === level.id
                    ? 'bg-[#e2c376] text-black'
                    : 'bg-[#1a1a1a] text-[#e7e7e7] hover:bg-[#36393f]'
                }`}
              >
                <div className="font-semibold">{level.name}</div>
                <div className="text-sm opacity-90">{level.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Controls */}
      <div className="mb-6 text-center">
        <button
          onClick={generateWorld}
          disabled={isGenerating}
          className="bg-[#e2c376] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#d4b46a] transition-colors disabled:opacity-50"
        >
          {isGenerating ? 'Generating World...' : 'Generate New World'}
        </button>
        
        {isGenerating && (
          <div className="mt-4">
            <div className="w-full bg-[#2a2a2a] rounded-full h-2">
              <div 
                className="bg-[#e2c376] h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#e7e7e7]/70 mt-2">
              Constructing comprehensive world systems... {Math.round(generationProgress)}%
            </p>
          </div>
        )}
      </div>

      {worldBlueprint && (
        <div className="space-y-6">
          {/* World Overview */}
          <div className="bg-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-[#e2c376] font-bold mb-4">🌍 {worldBlueprint.name}</h4>
            <p className="text-[#e7e7e7]/90 mb-4">{worldBlueprint.description}</p>
            
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <h5 className="font-semibold text-white mb-2">Quality Metrics</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Consistency:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.consistency.internal}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depth:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.depth.cultural}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Believability:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.believability.realism}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Story Service:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.storyService.plot}/10</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <h5 className="font-semibold text-white mb-2">World State</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Stability:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.currentState.stability}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prosperity:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.currentState.prosperity}/10</span>
                  </div>
                  <p className="text-xs text-[#e7e7e7]/70 mt-2">
                    Active Conflicts: {worldBlueprint.currentState.conflicts.length}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <h5 className="font-semibold text-white mb-2">Systems Count</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Cultures:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.cultures.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.languages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Religions:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.religions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Continents:</span>
                    <span className="text-[#e2c376]">{worldBlueprint.geography.continents.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <h5 className="font-semibold text-white mb-2">Premise Integration</h5>
                <div className="space-y-1">
                  <p className="text-xs"><strong>Theme:</strong> {worldBlueprint.premise.theme}</p>
                  <p className="text-xs"><strong>Type:</strong> {worldBlueprint.premise.premiseType}</p>
                  <p className="text-xs text-[#e7e7e7]/70 mt-2">
                    World serves story premise through cultural conflicts and historical tensions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#2a2a2a] rounded-lg p-1 flex flex-wrap justify-center gap-1">
              {viewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === tab.id 
                      ? 'bg-[#e2c376] text-black' 
                      : 'text-[#e7e7e7]/70 hover:bg-[#36393f]'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* View Content */}
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* World Systems Overview */}
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-[#e2c376] font-bold mb-4">🌟 World Systems Overview</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-blue-400">
                      <h5 className="text-blue-400 font-semibold mb-3">🗺️ Physical World</h5>
                      <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                        <li>✅ {worldBlueprint.geography.continents.length} continents with diverse terrain</li>
                        <li>✅ {worldBlueprint.geography.climateZones.length} climate zones</li>
                        <li>✅ {worldBlueprint.geography.naturalWonders.length} natural wonders</li>
                        <li>✅ Geological realism: {worldBlueprint.geography.geologicalRealism}/10</li>
                      </ul>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-green-400">
                      <h5 className="text-green-400 font-semibold mb-3">👥 Cultural Systems</h5>
                      <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                        <li>✅ {worldBlueprint.cultures.length} distinct cultures</li>
                        <li>✅ {worldBlueprint.languages.length} language systems</li>
                        <li>✅ {worldBlueprint.religions.length} belief systems</li>
                        <li>✅ Rich traditions and customs</li>
                      </ul>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-4 border-l-4 border-purple-400">
                      <h5 className="text-purple-400 font-semibold mb-3">⚙️ Societal Systems</h5>
                      <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                        <li>✅ {worldBlueprint.politics.type} political system</li>
                        <li>✅ {worldBlueprint.economics.type} economic model</li>
                        <li>✅ {worldBlueprint.timeline.eras.length} historical eras</li>
                        <li>✅ Complex social hierarchies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* World Building Revolution */}
                <div className="bg-gradient-to-r from-[#e2c376]/20 to-[#c4a75f]/20 rounded-lg p-6 border border-[#e2c376]/50">
                  <h4 className="text-[#e2c376] font-bold mb-4">🌍 World Building Revolution</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3">🎯 Ten Comprehensive Systems</h5>
                      <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                        <li>✅ Geography & Climate - Physical world foundation</li>
                        <li>✅ Cultural Development - Living societies with depth</li>
                        <li>✅ Political Structures - Power dynamics and governance</li>
                        <li>✅ Economic Systems - Trade, resources, and wealth</li>
                        <li>✅ Historical Timelines - Deep past shaping present</li>
                        <li>✅ Language Systems - Communication and identity</li>
                        <li>✅ Religion & Belief - Spiritual frameworks</li>
                        <li>✅ Magic/Technology - Supernatural/advanced systems</li>
                        <li>✅ Social Hierarchies - Class and relationship systems</li>
                        <li>✅ Story Integration - Everything serves narrative</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white font-semibold mb-3">🔗 Engine Integration</h5>
                      <ul className="text-sm text-[#e7e7e7]/90 space-y-1">
                        <li>✅ Premise-driven world conflicts</li>
                        <li>✅ Character-culture integration</li>
                        <li>✅ Narrative-environment synergy</li>
                        <li>✅ Dialogue-language authenticity</li>
                        <li>✅ Trope-culture alignment</li>
                        <li>✅ Living world evolution</li>
                        <li>✅ Choice-consequence realism</li>
                        <li>✅ Genre-world consistency</li>
                        <li>✅ Tension-environment enhancement</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                    <p className="text-sm text-[#e7e7e7]/90">
                      <strong>The World Building Principle:</strong> Every element of your fictional world must serve the story 
                      while maintaining internal consistency. From the shape of continents to the structure of languages, 
                      from economic systems to religious beliefs - everything interconnects to create a living, breathing 
                      reality that enhances rather than distracts from your narrative.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'geography' && (
              <motion.div
                key="geography"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-[#e2c376] font-bold mb-4">🗺️ Geographic Systems</h4>
                  
                  {/* Continent Selector */}
                  <div className="mb-6">
                    <h5 className="text-white font-semibold mb-3">Select Continent</h5>
                    <div className="flex gap-2">
                      {worldBlueprint.geography.continents.map((continent, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedContinent(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedContinent === index
                              ? 'bg-[#e2c376] text-black'
                              : 'bg-[#1a1a1a] text-[#e7e7e7] hover:bg-[#36393f]'
                          }`}
                        >
                          {continent.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Continent Details */}
                  {worldBlueprint.geography.continents[selectedContinent] && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-white font-semibold mb-3">
                          {worldBlueprint.geography.continents[selectedContinent].name}
                        </h5>
                        <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-sm"><strong>Size:</strong> {worldBlueprint.geography.continents[selectedContinent].size}</p>
                            <p className="text-sm"><strong>Story Role:</strong> {worldBlueprint.geography.continents[selectedContinent].storyRole}</p>
                            <p className="text-sm"><strong>Conflict Potential:</strong> {worldBlueprint.geography.continents[selectedContinent].conflictPotential}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold mb-1">Terrain Types:</p>
                            <div className="flex flex-wrap gap-1">
                              {worldBlueprint.geography.continents[selectedContinent].terrain.map((terrain, i) => (
                                <span key={i} className="px-2 py-1 bg-[#2a2a2a] rounded text-xs">{terrain}</span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-semibold mb-1">Climate Zones:</p>
                            <div className="flex flex-wrap gap-1">
                              {worldBlueprint.geography.continents[selectedContinent].climate.map((climate, i) => (
                                <span key={i} className="px-2 py-1 bg-[#2a2a2a] rounded text-xs">{climate}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-white font-semibold mb-3">Geographic Realism</h5>
                        <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Geological Realism</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-[#36393f] rounded-full h-2">
                                <div 
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${worldBlueprint.geography.geologicalRealism * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-[#e2c376] text-sm font-bold">{worldBlueprint.geography.geologicalRealism}/10</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Climatic Realism</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-[#36393f] rounded-full h-2">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{ width: `${worldBlueprint.geography.climaticRealism * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-[#e2c376] text-sm font-bold">{worldBlueprint.geography.climaticRealism}/10</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Ecological Realism</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-[#36393f] rounded-full h-2">
                                <div 
                                  className="h-2 bg-purple-500 rounded-full"
                                  style={{ width: `${worldBlueprint.geography.ecologicalRealism * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-[#e2c376] text-sm font-bold">{worldBlueprint.geography.ecologicalRealism}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Natural Wonders */}
                  {worldBlueprint.geography.naturalWonders.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-white font-semibold mb-3">Natural Wonders</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        {worldBlueprint.geography.naturalWonders.map((wonder, index) => (
                          <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
                            <h6 className="font-semibold text-[#e2c376] mb-1">{wonder.name}</h6>
                            <p className="text-xs text-[#e7e7e7]/90 mb-2">{wonder.significance}</p>
                            <div className="flex justify-between text-xs">
                              <span>Type: {wonder.type}</span>
                              <span>Story Potential: {wonder.storyPotential}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'cultures' && (
              <motion.div
                key="cultures"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-[#e2c376] font-bold mb-4">👥 Cultural Systems</h4>
                  
                  {/* Culture Selector */}
                  <div className="mb-6">
                    <h5 className="text-white font-semibold mb-3">Select Culture</h5>
                    <div className="grid md:grid-cols-4 gap-2">
                      {worldBlueprint.cultures.map((culture, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCulture(index)}
                          className={`p-3 rounded-lg text-left transition-colors ${
                            selectedCulture === index
                              ? 'bg-[#e2c376] text-black'
                              : 'bg-[#1a1a1a] text-[#e7e7e7] hover:bg-[#36393f]'
                          }`}
                        >
                          <div className="font-semibold text-sm">{culture.name}</div>
                          <div className="text-xs opacity-90">{culture.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Culture Details */}
                  {worldBlueprint.cultures[selectedCulture] && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-white font-semibold mb-3">
                            {worldBlueprint.cultures[selectedCulture].name}
                          </h5>
                          <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
                            <p className="text-sm text-[#e7e7e7]/90">{worldBlueprint.cultures[selectedCulture].description}</p>
                            
                            <div>
                              <p className="text-sm font-semibold mb-2">Core Values</p>
                              {worldBlueprint.cultures[selectedCulture].values.map((value, i) => (
                                <div key={i} className="mb-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{value.name}</span>
                                    <span className="text-[#e2c376] text-sm">{value.priority}/10</span>
                                  </div>
                                  <p className="text-xs text-[#e7e7e7]/70">{value.description}</p>
                                </div>
                              ))}
                            </div>
                            
                            <div>
                              <p className="text-sm font-semibold mb-1">Worldview</p>
                              <p className="text-xs text-[#e7e7e7]/90">
                                <strong>Philosophy:</strong> {worldBlueprint.cultures[selectedCulture].worldview.philosophy}
                              </p>
                              <p className="text-xs text-[#e7e7e7]/90">
                                <strong>Morality:</strong> {worldBlueprint.cultures[selectedCulture].worldview.morality}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-white font-semibold mb-3">Social Structure</h5>
                          <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
                            <div>
                              <p className="text-sm"><strong>Hierarchy:</strong> {worldBlueprint.cultures[selectedCulture].socialStructure.hierarchy}</p>
                              <p className="text-sm"><strong>Social Mobility:</strong> {worldBlueprint.cultures[selectedCulture].socialStructure.mobility}</p>
                              <p className="text-sm"><strong>Family Structure:</strong> {worldBlueprint.cultures[selectedCulture].socialStructure.familyStructure}</p>
                              <p className="text-sm"><strong>Inheritance:</strong> {worldBlueprint.cultures[selectedCulture].socialStructure.inheritance}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-semibold mb-1">Communication Style</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span>Directness: </span>
                                  <span className="text-[#e2c376]">{worldBlueprint.cultures[selectedCulture].communication.directness}/10</span>
                                </div>
                                <div>
                                  <span>Formality: </span>
                                  <span className="text-[#e2c376]">{worldBlueprint.cultures[selectedCulture].communication.formality}/10</span>
                                </div>
                                <div>
                                  <span>Emotion: </span>
                                  <span className="text-[#e2c376]">{worldBlueprint.cultures[selectedCulture].communication.emotionalExpression}/10</span>
                                </div>
                                <div className="col-span-2">
                                  <span>Conflict Style: </span>
                                  <span className="text-[#e2c376]">{worldBlueprint.cultures[selectedCulture].communication.conflictApproach}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-white font-semibold mb-3">Cultural Evolution</h5>
                        <div className="bg-[#1a1a1a] rounded-lg p-4">
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p><strong>Origins:</strong> {worldBlueprint.cultures[selectedCulture].origins.foundingMyth}</p>
                            </div>
                            <div>
                              <p><strong>Future Direction:</strong> {worldBlueprint.cultures[selectedCulture].futureTrajectory.direction}</p>
                            </div>
                            <div>
                              <p><strong>Probability:</strong> {Math.round(worldBlueprint.cultures[selectedCulture].futureTrajectory.probability * 100)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Additional view implementations would continue... */}
            {/* For brevity, I'll show the framework for other views */}
            
            {activeView === 'politics' && (
              <motion.div
                key="politics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#2a2a2a] rounded-lg p-4"
              >
                <h4 className="text-[#e2c376] font-bold mb-4">⚖️ Political Systems</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-3">Government Structure</h5>
                    <p className="text-sm mb-2"><strong>Type:</strong> {worldBlueprint.politics.type}</p>
                    <p className="text-sm mb-2"><strong>Primary Power:</strong> {worldBlueprint.politics.primaryPower.name}</p>
                    <p className="text-sm mb-2"><strong>Legitimacy:</strong> {worldBlueprint.politics.primaryPower.legitimacy}/10</p>
                    <p className="text-sm mb-2"><strong>Stability:</strong> {worldBlueprint.politics.primaryPower.stability}/10</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-3">Power Centers</h5>
                    {worldBlueprint.politics.secondaryPowers.map((power, i) => (
                      <div key={i} className="mb-2 p-2 bg-[#2a2a2a] rounded">
                        <p className="text-sm font-medium">{power.name}</p>
                        <p className="text-xs text-[#e7e7e7]/70">Influence: {power.influence}/10</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'economics' && (
              <motion.div
                key="economics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#2a2a2a] rounded-lg p-4"
              >
                <h4 className="text-[#e2c376] font-bold mb-4">💰 Economic Systems</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-3">Economic Structure</h5>
                    <p className="text-sm mb-2"><strong>Type:</strong> {worldBlueprint.economics.type}</p>
                    <p className="text-sm mb-2"><strong>Complexity:</strong> {worldBlueprint.economics.complexity}/10</p>
                    <p className="text-sm mb-2"><strong>Currency:</strong> {worldBlueprint.economics.currency.primary}</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-3">Economic Sectors</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Primary:</span>
                        <span className="text-[#e2c376]">{worldBlueprint.economics.primarySector.dominance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Secondary:</span>
                        <span className="text-[#e2c376]">{worldBlueprint.economics.secondarySector.dominance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tertiary:</span>
                        <span className="text-[#e2c376]">{worldBlueprint.economics.tertiarySector.dominance}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <h5 className="text-white font-semibold mb-3">Key Resources</h5>
                    {worldBlueprint.economics.resources.map((resource, i) => (
                      <div key={i} className="mb-2 p-2 bg-[#2a2a2a] rounded">
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-[#e7e7e7]/70">Strategic Value: {resource.strategic}/10</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Placeholder for other views */}
            {['history', 'languages', 'religions', 'systems', 'integration'].includes(activeView) && (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#2a2a2a] rounded-lg p-4"
              >
                <h4 className="text-[#e2c376] font-bold mb-4">
                  {viewTabs.find(tab => tab.id === activeView)?.icon} {viewTabs.find(tab => tab.id === activeView)?.name}
                </h4>
                <div className="bg-[#1a1a1a] rounded-lg p-6 text-center">
                  <p className="text-[#e7e7e7]/70 mb-4">
                    This view showcases the sophisticated {activeView} system of the World Building Engine.
                  </p>
                  <p className="text-sm text-[#e7e7e7]/50">
                    Detailed implementation available in the full system.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 