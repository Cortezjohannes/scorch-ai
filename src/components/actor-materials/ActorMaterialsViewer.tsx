'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ActorPreparationMaterials, ActingTechnique } from '@/types/actor-materials'
import { useTheme } from '@/context/ThemeContext'
import CharacterStudyGuide from './CharacterStudyGuide'
import GOTEAnalysis from './GOTEAnalysis'
import RelationshipMap from './RelationshipMap'
import SceneBreakdown from './SceneBreakdown'
import PerformanceReference from './PerformanceReference'
import ThroughLine from './ThroughLine'
import PhysicalCharacterWork from './PhysicalCharacterWork'
import VoicePatterns from './VoicePatterns'
import KeyScenes from './KeyScenes'
import MonologuePractice from './MonologuePractice'
import OnSetPreparation from './OnSetPreparation'
import OnSetPrepModal from './OnSetPrepModal'
import TechniqueSelector from './TechniqueSelector'
import GuidedTooltip from './GuidedTooltip'

interface ActorMaterialsViewerProps {
  materials: ActorPreparationMaterials
  storyBible: any
  onRegenerate: (technique?: ActingTechnique, characterName?: string, characterId?: string) => void
  onRegenerateCharacter?: (characterName: string, characterId: string) => void
  shareLink?: string | null
  onGenerateCharacter?: (characterName: string, characterId: string) => void
  allCharacters?: Array<{ id: string; name: string; description: string }>
  generatingCharacter?: string | null
  generating?: boolean
  selectedTechnique?: ActingTechnique
  onOpenGenerationModal?: (characterId?: string) => void
  remainingCharacters?: Array<{ id: string; name: string; description: string; imageUrl?: string }>
  onDeleteAllMaterials?: () => void // DEBUG: Delete all materials
}

export default function ActorMaterialsViewer({
  materials,
  storyBible,
  onRegenerate,
  onRegenerateCharacter,
  shareLink,
  onGenerateCharacter,
  allCharacters,
  generatingCharacter,
  generating,
  selectedTechnique,
  onOpenGenerationModal,
  remainingCharacters,
  onDeleteAllMaterials
}: ActorMaterialsViewerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    materials.characters[0]?.characterName || null
  )
  const [currentTechnique, setCurrentTechnique] = useState<ActingTechnique | undefined>(
    selectedTechnique || materials.technique
  )
  const [activeSection, setActiveSection] = useState<'overview' | 'relationships' | 'scene-work' | 'physical-voice' | 'practice'>('overview')
  const [readingMode, setReadingMode] = useState<'professional' | 'guided'>('professional')
  const [goteViewMode, setGoteViewMode] = useState<'table' | 'cards'>('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnSetModalOpen, setIsOnSetModalOpen] = useState(false)
  
  // Load reading mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('actor-materials-reading-mode') as 'professional' | 'guided' | null
    if (savedMode) {
      setReadingMode(savedMode)
    }
  }, [])
  
  // Save reading mode to localStorage
  useEffect(() => {
    localStorage.setItem('actor-materials-reading-mode', readingMode)
  }, [readingMode])
  
  const character = materials.characters.find(c => c.characterName === selectedCharacter)
  
  const handleTechniqueChange = (technique: ActingTechnique | undefined) => {
    setCurrentTechnique(technique)
    if (technique !== materials.technique && selectedCharacter) {
      // Find the character ID
      const char = materials.characters.find(c => c.characterName === selectedCharacter)
      const charId = allCharacters?.find(c => c.name === selectedCharacter)?.id
      if (char && charId) {
        // Regenerate only the selected character with new technique
        onRegenerate(technique, selectedCharacter, charId)
      }
    }
  }
  
  // Filter content based on search query
  const shouldShowSection = (sectionContent: string): boolean => {
    if (!searchQuery.trim()) return true
    return sectionContent.toLowerCase().includes(searchQuery.toLowerCase())
  }
  
  const filteredGoteAnalysis = character?.gotAnalysis?.filter(gote => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return gote.goal.toLowerCase().includes(query) ||
           gote.obstacle.toLowerCase().includes(query) ||
           gote.tactics.some(t => t.toLowerCase().includes(query))
  }) || []
  
  const filteredSceneBreakdowns = character?.sceneBreakdowns?.filter(scene => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return scene.objective.toLowerCase().includes(query) ||
           scene.emotionalState.toLowerCase().includes(query) ||
           scene.keyLines.some(line => line.toLowerCase().includes(query))
  }) || []
  
  // Section icons
  const sectionIcons: Record<string, React.ReactNode> = {
    overview: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    relationships: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'scene-work': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    'physical-voice': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    practice: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  // Stats calculation
  const stats = character ? {
    scenes: character.gotAnalysis?.length || 0,
    relationships: character.relationshipMap?.length || 0,
    monologues: character.monologues?.length || 0,
    keyScenes: character.keyScenes?.length || 0
  } : null
  
  return (
    <div className="min-h-screen" style={{ background: isDark ? 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)' : 'linear-gradient(to bottom, #fafafa, #f0f0f0)' }}>
      {/* Film strip decoration - top */}
      <div className="h-4 flex justify-between px-2 border-b-2 border-[#10B981]/30">
        {[...Array(40)].map((_, i) => (
          <div key={`top-${i}`} className="w-2 h-full bg-[#10B981]/20" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Cinematic Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className={`p-6 md:p-8 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-12 ${isDark ? 'bg-[#10B981]' : 'bg-[#C9A961]'} rounded-full`} />
                  <h1 className={`text-3xl md:text-4xl font-bold ${prefix}-text-primary tracking-tight`}>
                    🎭 Actor Performance Preparation Guide
                  </h1>
                </div>
                <p className={`text-sm md:text-base ${prefix}-text-secondary ml-5 flex items-center gap-2 flex-wrap`}>
                  <span className="font-semibold">{materials.arcTitle}</span>
                  <span className="opacity-50">•</span>
                  <span>{materials.characters.length} Character{materials.characters.length !== 1 ? 's' : ''}</span>
                  {materials.technique && (
                    <>
                      <span className="opacity-50">•</span>
                      <span className={`px-2 py-0.5 rounded ${isDark ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#C9A961]/20 text-[#C9A961]'} text-xs font-medium`}>
                        {materials.technique.charAt(0).toUpperCase() + materials.technique.slice(1).replace(/-/g, ' ')}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {remainingCharacters && remainingCharacters.length > 0 && onOpenGenerationModal && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                    onClick={onOpenGenerationModal}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${isDark ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#10B981] text-black hover:bg-[#059669]'} shadow-lg whitespace-nowrap`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                    Generate More ({remainingCharacters.length})
              </motion.button>
                )}
                {/* DEBUG: Delete All Materials Button */}
                {onDeleteAllMaterials && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDeleteAllMaterials}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${isDark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/50' : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'} shadow-lg whitespace-nowrap text-sm`}
                    title="DEBUG: Delete all actor materials for this arc"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    🐛 Delete All
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>


        {/* Character Selector - Visual Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
            <label className={`block text-lg font-bold mb-4 ${prefix}-text-primary flex items-center gap-2`}>
              <span className="text-2xl">🎬</span>
            Select Character
          </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.characters.map((char, idx) => {
                const isSelected = selectedCharacter === char.characterName
                const charStats = {
                  scenes: char.gotAnalysis?.length || 0,
                  relationships: char.relationshipMap?.length || 0
                }
                
                return (
                  <motion.button
                key={char.characterName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCharacter(char.characterName)}
                    className={`relative p-5 rounded-xl text-left transition-all overflow-hidden group ${
                      isSelected
                        ? isDark 
                          ? 'bg-gradient-to-br from-[#10B981]/30 to-[#10B981]/10 border-2 border-[#10B981] shadow-lg shadow-[#10B981]/20'
                          : 'bg-gradient-to-br from-[#C9A961]/30 to-[#C9A961]/10 border-2 border-[#C9A961] shadow-lg shadow-[#C9A961]/20'
                        : isDark
                          ? 'bg-[#1a1a1a]/80 border-2 border-white/10 hover:border-[#10B981]/50'
                          : 'bg-white/60 border-2 border-gray-200 hover:border-[#C9A961]/50'
                    }`}
                  >
                    {/* Decorative corner */}
                    <div className={`absolute top-0 right-0 w-16 h-16 ${isDark ? 'bg-[#10B981]/10' : 'bg-[#C9A961]/10'} rounded-bl-full opacity-50`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          isSelected
                            ? isDark ? 'bg-[#10B981]/20' : 'bg-[#C9A961]/20'
                            : isDark ? 'bg-white/10' : 'bg-gray-100'
                        }`}>
                          {char.characterName.charAt(0)}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-6 h-6 rounded-full ${isDark ? 'bg-[#10B981]' : 'bg-[#C9A961]'} flex items-center justify-center`}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      
                      <h3 className={`font-bold text-lg mb-2 ${prefix}-text-primary`}>
                {char.characterName}
                      </h3>
                      
                      <div className={`flex items-center gap-3 text-xs ${prefix}-text-secondary mb-2`}>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                          {charStats.scenes} scenes
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {charStats.relationships} connections
                        </span>
                      </div>
                      {onOpenGenerationModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const charData = allCharacters?.find(c => c.name === char.characterName)
                            if (charData) {
                              onOpenGenerationModal(charData.id)
                            }
                          }}
                          disabled={generating}
                          className={`w-full mt-2 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                            isDark
                              ? 'bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 border border-[#10B981]/30'
                              : 'bg-[#C9A961]/20 text-[#C9A961] hover:bg-[#C9A961]/30 border border-[#C9A961]/30'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          🔄 Regenerate
                        </button>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: 'Scenes', value: stats.scenes, icon: '🎬', color: isDark ? '#10B981' : '#C9A961' },
              { label: 'Relationships', value: stats.relationships, icon: '🤝', color: isDark ? '#3B82F6' : '#8B7355' },
              { label: 'Monologues', value: stats.monologues, icon: '🎤', color: isDark ? '#F59E0B' : '#D4AF37' },
              { label: 'Key Scenes', value: stats.keyScenes, icon: '⭐', color: isDark ? '#EC4899' : '#B8860B' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`p-4 rounded-xl border-2 ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-gray-200'} backdrop-blur-sm hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-3xl font-bold ${prefix}-text-primary`} style={{ color: stat.color }}>
                    {stat.value}
                  </span>
      </div>
                <p className={`text-sm font-medium ${prefix}-text-secondary`}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      
      {/* Reading Mode & Technique Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Reading Mode */}
        <div className={`p-5 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
            <span className={`${prefix}-text-primary font-semibold mb-3 block flex items-center gap-2`}>
              <span className="text-xl">📖</span>
              Reading Mode
            </span>
        <div className="flex gap-2">
          <button
            onClick={() => setReadingMode('professional')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              readingMode === 'professional'
                    ? isDark
                      ? 'bg-[#10B981] text-black shadow-lg'
                      : 'bg-[#C9A961] text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 text-white/70 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Professional
          </button>
          <button
            onClick={() => setReadingMode('guided')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              readingMode === 'guided'
                    ? isDark
                      ? 'bg-[#10B981] text-black shadow-lg'
                      : 'bg-[#C9A961] text-white shadow-lg'
                    : isDark
                      ? 'bg-white/5 text-white/70 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Guided
          </button>
        </div>
      </div>
        
          {/* Search */}
        <div className={`p-5 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
            <label className={`${prefix}-text-primary font-semibold mb-3 block flex items-center gap-2`}>
              <span className="text-xl">🔍</span>
              Search Materials
            </label>
          <input
            type="text"
            placeholder="Search across all sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg ${isDark ? 'bg-white/5 text-white border-white/10' : 'bg-white border-gray-200'} border-2 focus:outline-none transition-all ${isDark ? 'focus:border-[#10B981]' : 'focus:border-[#C9A961]'} text-sm`}
          />
        </div>
      </motion.div>
      
      {/* Technique Selector */}
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
        <TechniqueSelector
          selectedTechnique={currentTechnique}
          onTechniqueChange={handleTechniqueChange}
          currentTechnique={materials.technique}
        />
      </motion.div>
      
      {/* Character Materials */}
      {character && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
          {/* Tab Navigation with Icons */}
            <div className={`border-2 rounded-xl overflow-hidden ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
              <div className="flex overflow-x-auto">
              {(['overview', 'relationships', 'scene-work', 'physical-voice', 'practice'] as const).map((tab) => (
            <button
                  key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`flex-1 min-w-[140px] px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeSection === tab
                        ? isDark
                          ? 'bg-[#10B981] text-black'
                          : 'bg-[#C9A961] text-white'
                        : isDark
                          ? 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                          : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                    {sectionIcons[tab]}
                  <span className="hidden sm:inline">
                  {tab === 'overview' ? 'Overview' : tab === 'relationships' ? 'Relationships' : tab === 'scene-work' ? 'Scene Work' : tab === 'physical-voice' ? 'Physical & Voice' : 'Practice'}
                    </span>
                    <span className="sm:hidden">
                      {tab === 'overview' ? 'Overview' : tab === 'relationships' ? 'Relations' : tab === 'scene-work' ? 'Scenes' : tab === 'physical-voice' ? 'Physical' : 'Practice'}
                    </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
            <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Print Button - Removed */}
                
                {/* Character Study Guide */}
                {shouldShowSection(character.studyGuide.background + character.studyGuide.motivations.join(' ')) && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h3 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">📚</span>
                      Character Study Guide
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Character Study Guide"
                          explanation="A comprehensive overview of your character's background, motivations, relationships, and journey. This is your foundation for understanding who you're playing."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h3>
                    <CharacterStudyGuide studyGuide={character.studyGuide} readingMode={readingMode} />
                  </div>
                )}
                
                {/* Performance Reference */}
                {character.performanceReference && character.performanceReference.length > 0 && shouldShowSection(character.performanceReference.map(r => r.reason).join(' ')) && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h3 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🎥</span>
                      Performance Reference
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Performance Reference"
                          explanation="Comparisons to well-known characters or performances that can inspire your interpretation. Watch the suggested scenes to see similar acting choices."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h3>
                    <PerformanceReference references={character.performanceReference} />
                  </div>
          )}
          
                {/* Through Line */}
                {shouldShowSection(character.throughLine.superObjective + character.throughLine.explanation) && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h3 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🎯</span>
                      Through Line / Super-Objective
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Super-Objective"
                          explanation="Your character's ultimate goal throughout the entire story. This is what drives every scene - the 'why' behind everything your character does."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h3>
                    <ThroughLine throughLine={character.throughLine} readingMode={readingMode} />
                  </div>
          )}
            </motion.div>
            )}
            
            {activeSection === 'relationships' && (
              <motion.div
                key="relationships"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
          {/* Relationship Map */}
                {character.relationshipMap && character.relationshipMap.length > 0 ? (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h3 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🤝</span>
                      Relationship Map
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Relationship Map"
                          explanation="A detailed breakdown of your character's relationships with every other character in the story. This includes power dynamics, emotional dependencies, conflict patterns, and how relationships evolve scene-by-scene."
                        >
                          <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h3>
                    <RelationshipMap relationships={character.relationshipMap} />
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm text-center`}>
                    <p className={`${prefix}-text-secondary`}>
                      No relationship data available. Relationships are generated during the actor materials generation process.
                    </p>
                  </div>
                )}
            </motion.div>
          )}
          
            {activeSection === 'scene-work' && (
            <motion.div
                key="scene-work"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* GOTE View Mode Toggle */}
                  <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm flex gap-2`}>
              <button
                    onClick={() => setGoteViewMode('table')}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      goteViewMode === 'table'
                          ? isDark ? 'bg-[#10B981] text-black' : 'bg-[#C9A961] text-white'
                          : isDark ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    📊 Table View
              </button>
                  <button
                    onClick={() => setGoteViewMode('cards')}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      goteViewMode === 'cards'
                          ? isDark ? 'bg-[#10B981] text-black' : 'bg-[#C9A961] text-white'
                          : isDark ? 'bg-white/5 text-white/70' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🎴 Card View
                  </button>
                </div>
                
                {/* GOTE Analysis */}
                {filteredGoteAnalysis.length > 0 && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🎬</span>
                      GOTE Analysis
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="GOTE Method"
                          explanation="Goal, Obstacle, Tactics, Expectation - a scene analysis technique. Goal: What your character wants. Obstacle: What's in the way. Tactics: How you'll try to get it. Expectation: What you think will happen."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h4>
                    <GOTEAnalysis gotAnalysis={filteredGoteAnalysis} viewMode={goteViewMode} readingMode={readingMode} />
                    {filteredGoteAnalysis.length < (character.gotAnalysis?.length || 0) && (
                        <p className={`text-sm mt-4 ${prefix}-text-secondary`}>
                        Showing {filteredGoteAnalysis.length} of {character.gotAnalysis?.length || 0} scenes (filtered by search)
                      </p>
                    )}
                  </div>
                )}
                
                {/* Scene Breakdowns */}
                {filteredSceneBreakdowns.length > 0 && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">📋</span>
                        Scene Breakdowns
                      </h4>
                    <SceneBreakdown breakdowns={filteredSceneBreakdowns} readingMode={readingMode} />
                    {filteredSceneBreakdowns.length < (character.sceneBreakdowns?.length || 0) && (
                        <p className={`text-sm mt-4 ${prefix}-text-secondary`}>
                        Showing {filteredSceneBreakdowns.length} of {character.sceneBreakdowns?.length || 0} scenes (filtered by search)
                      </p>
                    )}
                  </div>
          )}
          
                {/* Search Results Empty State */}
                {searchQuery.trim() && filteredGoteAnalysis.length === 0 && filteredSceneBreakdowns.length === 0 && (
                    <div className={`p-8 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm text-center`}>
                      <div className="text-6xl mb-4 opacity-50">🔍</div>
                      <p className={`text-lg ${prefix}-text-secondary mb-4`}>No results found for "{searchQuery}"</p>
            <button
                      onClick={() => setSearchQuery('')}
                        className={`px-6 py-3 rounded-lg text-sm font-semibold ${isDark ? 'bg-[#10B981] text-black hover:bg-[#10B981]/90' : 'bg-[#C9A961] text-white hover:bg-[#C9A961]/90'} transition-all`}
                    >
                      Clear Search
            </button>
                  </div>
              )}
                </motion.div>
              )}
          
            {activeSection === 'physical-voice' && (
            <motion.div
                key="physical-voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
            >
                {/* Physical Character Work */}
                {character.physicalWork && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🤸</span>
                      Physical Character Work
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Physical Character Work"
                          explanation="How your character moves, stands, and uses their body. This includes posture, gestures, and physical habits that make your character unique."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                      )}
                    </h4>
                    <PhysicalCharacterWork physicalWork={character.physicalWork} readingMode={readingMode} />
                  </div>
                )}
                
                {/* Voice Patterns */}
                {character.voicePatterns && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">🎤</span>
                      Voice & Speech Patterns
                      {readingMode === 'guided' && (
                        <GuidedTooltip
                          term="Voice Patterns"
                          explanation="How your character speaks - their accent, tone, pace, and speech patterns. This helps you sound like your character."
                        >
                            <span className="text-base">ℹ️</span>
                        </GuidedTooltip>
                )}
                    </h4>
                    <VoicePatterns voicePatterns={character.voicePatterns} readingMode={readingMode} />
                  </div>
                )}
            </motion.div>
          )}
          
            {activeSection === 'practice' && (
            <motion.div
                key="practice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Print Button */}
                <div className="flex justify-end">
              <button
                    onClick={() => window.print()}
                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${isDark ? 'bg-[#10B981] text-black hover:bg-[#10B981]/90' : 'bg-[#C9A961] text-white hover:bg-[#C9A961]/90'} transition-all`}
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    Print Practice Materials
                  </button>
                </div>
                
                {/* Monologues */}
                {character.monologues && character.monologues.length > 0 && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">💬</span>
                        Monologue Practice
                      </h4>
                    <MonologuePractice monologues={character.monologues} />
                  </div>
                )}
                
                {/* Key Scenes */}
                {character.keyScenes && character.keyScenes.length > 0 && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                      <h4 className={`text-2xl font-bold mb-5 ${prefix}-text-primary flex items-center gap-3`}>
                        <span className="text-3xl">⭐</span>
                        Key Scenes
                      </h4>
                    <KeyScenes keyScenes={character.keyScenes} />
                  </div>
          )}
          
          {/* On-Set Preparation */}
                {character.onSetPrep && (
                    <div className={`p-6 rounded-xl border-2 ${isDark ? 'border-[#10B981]/30 bg-black/40' : 'border-[#C9A961]/30 bg-white/80'} backdrop-blur-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                        <h4 className={`text-2xl font-bold ${prefix}-text-primary flex items-center gap-3`}>
                          <span className="text-3xl">🎬</span>
                          On-Set Preparation
                        </h4>
            <button
                        onClick={() => setIsOnSetModalOpen(true)}
                          className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap ${isDark ? 'bg-[#10B981] text-black hover:bg-[#10B981]/90' : 'bg-[#C9A961] text-white hover:bg-[#C9A961]/90'} transition-all`}
                      >
                        Quick Access
            </button>
                    </div>
                    <OnSetPreparation preparation={character.onSetPrep} />
                  </div>
                )}
                
                {/* On-Set Prep Modal */}
                <OnSetPrepModal
                  isOpen={isOnSetModalOpen}
                  onClose={() => setIsOnSetModalOpen(false)}
                  onSetPrep={character.onSetPrep}
                  characterName={character.characterName}
                />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Film strip decoration - bottom */}
      <div className="h-4 flex justify-between px-2 border-t-2 border-[#10B981]/30 mt-12">
        {[...Array(40)].map((_, i) => (
          <div key={`bottom-${i}`} className="w-2 h-full bg-[#10B981]/20" />
        ))}
      </div>
    </div>
  )
}
