'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EngineInfo {
  id: string
  name: string
  version: 'v1' | 'v2' | 'latest'
  category: 'core' | 'genre' | 'production' | 'enhancement'
  status: 'active' | 'deprecated' | 'available' | 'unavailable'
  lastUsed?: string
  description: string
  upgradeAvailable?: boolean
}

const ENGINE_STATUS: EngineInfo[] = [
  // 🚀 CORE ENGINES
  { id: 'premise-v2', name: 'Premise Engine', version: 'v2', category: 'core', status: 'active', description: 'Advanced premise generation with Egri\'s equation' },
  { id: 'character-3d-v2', name: '3D Character Engine', version: 'v2', category: 'core', status: 'active', description: 'Psychological character development' },
  { id: 'fractal-narrative-v2', name: 'Fractal Narrative Engine', version: 'v2', category: 'core', status: 'active', description: 'Adaptive story structure' },
  { id: 'strategic-dialogue', name: 'Strategic Dialogue Engine', version: 'latest', category: 'core', status: 'active', description: 'Character voice and dialogue' },
  { id: 'world-building-v2', name: 'World Building Engine', version: 'v2', category: 'core', status: 'active', description: 'Immersive setting creation' },
  
  // 🎭 GENRE ENGINES  
  { id: 'comedy-timing-v2', name: 'Comedy Timing Engine', version: 'v2', category: 'genre', status: 'available', description: 'Perfect comedic pacing' },
  { id: 'horror-atmosphere-v2', name: 'Horror Atmosphere Engine', version: 'v2', category: 'genre', status: 'available', description: 'Spine-chilling atmosphere' },
  { id: 'romance-chemistry-v2', name: 'Romance Chemistry Engine', version: 'v2', category: 'genre', status: 'available', description: 'Authentic romantic connections' },
  { id: 'mystery-construction-v2', name: 'Mystery Construction Engine', version: 'v2', category: 'genre', status: 'available', description: 'Intricate mystery plots' },
  { id: 'tension-escalation', name: 'Tension Escalation Engine', version: 'latest', category: 'genre', status: 'active', description: 'Emotional intensity building' },
  
  // 🎬 PRODUCTION ENGINES
  { id: 'storyboard-v2', name: 'Storyboard Engine', version: 'v2', category: 'production', status: 'available', description: 'Visual scene planning' },
  { id: 'casting-v2', name: 'Casting Engine', version: 'v2', category: 'production', status: 'available', description: 'Character casting direction' },
  { id: 'location-v2', name: 'Location Engine', version: 'v2', category: 'production', status: 'available', description: 'Location scouting and sets' },
  { id: 'sound-design-v2', name: 'Sound Design Engine', version: 'v2', category: 'production', status: 'available', description: 'Audio landscape design' },
  { id: 'visual-storytelling-v2', name: 'Visual Storytelling Engine', version: 'v2', category: 'production', status: 'available', description: 'Cinematography planning' },
  
  // ✨ ENHANCEMENT ENGINES
  { id: 'interactive-choice-v2', name: 'Choice Engine', version: 'v2', category: 'enhancement', status: 'available', description: 'Interactive branching narratives' },
  { id: 'living-world-v2', name: 'Living World Engine', version: 'v2', category: 'enhancement', status: 'available', description: 'Dynamic character management' },
  { id: 'theme-integration-v2', name: 'Theme Integration Engine', version: 'v2', category: 'enhancement', status: 'available', description: 'Cohesive thematic development' },
  { id: 'pacing-rhythm-v2', name: 'Pacing Engine', version: 'v2', category: 'enhancement', status: 'available', description: 'Perfect narrative rhythm' },
  { id: 'engagement-v2', name: 'Engagement Engine', version: 'v2', category: 'enhancement', status: 'available', description: 'Audience engagement optimization' },

  // 🔧 DEPRECATED V1 ENGINES (Should be upgraded)
  { id: 'premise-v1', name: 'Premise Engine', version: 'v1', category: 'core', status: 'deprecated', description: 'Legacy premise generation', upgradeAvailable: true },
  { id: 'character-v1', name: 'Character Engine', version: 'v1', category: 'core', status: 'deprecated', description: 'Basic character creation', upgradeAvailable: true },
  { id: 'casting-v1', name: 'Casting Engine', version: 'v1', category: 'production', status: 'deprecated', description: 'Legacy casting system', upgradeAvailable: true }
]

export default function EngineStatusDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [engines, setEngines] = useState<EngineInfo[]>(ENGINE_STATUS)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    v2Engines: 0,
    deprecated: 0
  })

  useEffect(() => {
    const filteredEngines = selectedCategory === 'all' 
      ? engines 
      : engines.filter(engine => engine.category === selectedCategory)
    
    const newStats = {
      total: filteredEngines.length,
      active: filteredEngines.filter(e => e.status === 'active').length,
      v2Engines: filteredEngines.filter(e => e.version === 'v2').length,
      deprecated: filteredEngines.filter(e => e.status === 'deprecated').length
    }
    setStats(newStats)
  }, [selectedCategory, engines])

  const categories = [
    { id: 'all', name: 'All Engines', icon: '🚀' },
    { id: 'core', name: 'Core', icon: '⚡' },
    { id: 'genre', name: 'Genre', icon: '🎭' },
    { id: 'production', name: 'Production', icon: '🎬' },
    { id: 'enhancement', name: 'Enhancement', icon: '✨' }
  ]

  const filteredEngines = selectedCategory === 'all' 
    ? engines 
    : engines.filter(engine => engine.category === selectedCategory)

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text mb-2">
            🏛️ Murphy Pillar Engine Status
          </h1>
          <p className="text-[#e7e7e7]/70 text-lg">
            Real-time status of all 60+ AI engines • V2 engines are prioritized for production use
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#e2c376] mb-2">{stats.total}</div>
            <div className="text-sm text-[#e7e7e7]/70">Total Engines</div>
          </div>
          <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.active}</div>
            <div className="text-sm text-[#e7e7e7]/70">Active Engines</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#e2c376]/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#e2c376] mb-2">{stats.v2Engines}</div>
            <div className="text-sm text-[#e7e7e7]/70">V2 Engines</div>
          </div>
          <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.deprecated}</div>
            <div className="text-sm text-[#e7e7e7]/70">Deprecated (V1)</div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#e2c376] text-black border-[#e2c376] font-medium'
                  : 'bg-[#1a1a1a] text-[#e7e7e7] border-[#36393f] hover:border-[#e2c376]/50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Engine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEngines.map((engine, index) => (
              <EngineCard key={engine.id} engine={engine} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-12 bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#e2c376] mb-4">Engine Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-[#e7e7e7]">Active - Currently in use</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-[#e7e7e7]">Available - Ready for deployment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-[#e7e7e7]">Deprecated - V1 engines (upgrade available)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-[#e7e7e7]">Unavailable - Not ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Individual Engine Card Component
function EngineCard({ engine, index }: { engine: EngineInfo; index: number }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500/30 bg-green-900/10 shadow-green-500/20'
      case 'available': return 'border-blue-500/30 bg-blue-900/10 shadow-blue-500/20'
      case 'deprecated': return 'border-orange-500/30 bg-orange-900/10 shadow-orange-500/20'
      case 'unavailable': return 'border-red-500/30 bg-red-900/10 shadow-red-500/20'
      default: return 'border-[#36393f] bg-[#1a1a1a]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢'
      case 'available': return '🔵'
      case 'deprecated': return '🟠'
      case 'unavailable': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`p-6 rounded-xl border shadow-lg transition-all duration-300 hover:scale-105 ${getStatusColor(engine.status)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-1">{engine.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
              engine.version === 'v2' ? 'bg-[#e2c376] text-black' :
              engine.version === 'latest' ? 'bg-purple-500 text-white' :
              'bg-[#36393f] text-[#e7e7e7]'
            }`}>
              {engine.version.toUpperCase()}
            </span>
            <span className="text-xs text-[#e7e7e7]/50 capitalize">{engine.category}</span>
          </div>
        </div>
        <div className="text-2xl">{getStatusIcon(engine.status)}</div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#e7e7e7]/80 mb-4">{engine.description}</p>

      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium capitalize ${
          engine.status === 'active' ? 'text-green-400' :
          engine.status === 'available' ? 'text-blue-400' :
          engine.status === 'deprecated' ? 'text-orange-400' :
          'text-red-400'
        }`}>
          {engine.status}
        </span>
        
        {engine.upgradeAvailable && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-2 py-1 bg-[#e2c376] text-black text-xs font-bold rounded-full"
          >
            UPGRADE TO V2
          </motion.div>
        )}
      </div>

      {/* Activity Indicator */}
      {engine.status === 'active' && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-green-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}