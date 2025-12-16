'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export type StoryBibleSection = 
  | 'premise' 
  | 'overview' 
  | 'characters' 
  | 'arcs' 
  | 'world' 
  | 'marketing'
  | 'choices' 
  | 'tension' 
  | 'choice-arch' 
  | 'living-world' 
  | 'trope' 
  | 'cohesion' 
  | 'dialogue' 
  | 'genre' 
  | 'theme'

interface SectionItem {
  id: StoryBibleSection
  icon: string
  label: string
  category: 'core' | 'branching' | 'technical'
  count?: number
}

interface StoryBibleSidebarProps {
  activeSection: StoryBibleSection
  onSectionChange: (section: StoryBibleSection) => void
  storyBible: any
  theme: 'light' | 'dark'
  isMobile?: boolean
  onMobileClose?: () => void
  onExport?: () => void
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isLocked?: boolean
}

const sections: SectionItem[] = [
  { id: 'overview', icon: '📖', label: 'Overview', category: 'core' },
  { id: 'characters', icon: '👥', label: 'Characters', category: 'core' },
  { id: 'world', icon: '🌍', label: 'World', category: 'core' },
  { id: 'marketing', icon: '📢', label: 'Marketing', category: 'core' },
  { id: 'tension', icon: '⚡', label: 'Tension', category: 'technical' },
  { id: 'choice-arch', icon: '🎯', label: 'Choice Architecture', category: 'technical' },
  { id: 'living-world', icon: '🌍', label: 'Living World', category: 'technical' },
  { id: 'trope', icon: '📖', label: 'Trope Analysis', category: 'technical' },
  { id: 'cohesion', icon: '🔗', label: 'Cohesion', category: 'technical' },
  { id: 'dialogue', icon: '🗣️', label: 'Dialogue', category: 'technical' },
  { id: 'genre', icon: '🎭', label: 'Genre', category: 'technical' },
  { id: 'theme', icon: '🎯', label: 'Theme', category: 'technical' },
  { id: 'premise', icon: '🎯', label: 'Premise', category: 'technical' }
]

export default function StoryBibleSidebar({
  activeSection,
  onSectionChange,
  storyBible,
  theme,
  isMobile = false,
  onMobileClose,
  onExport,
  onImport,
  isLocked = false
}: StoryBibleSidebarProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core', 'technical'])
  )

  // Get counts for sections
  const getSectionCount = (sectionId: StoryBibleSection): number | undefined => {
    if (sectionId === 'characters' && storyBible?.mainCharacters) {
      return storyBible.mainCharacters.length
    }
    if (sectionId === 'arcs' && storyBible?.narrativeArcs) {
      return storyBible.narrativeArcs.length
    }
    return undefined
  }

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections

    const query = searchQuery.toLowerCase()
    return sections.filter(section => 
      section.label.toLowerCase().includes(query) ||
      section.id.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups: Record<string, SectionItem[]> = {
      core: [],
      branching: [],
      technical: []
    }

    filteredSections.forEach(section => {
      groups[section.category].push(section)
    })

    return groups
  }, [filteredSections])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleSectionClick = (sectionId: StoryBibleSection) => {
    onSectionChange(sectionId)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div className={`h-full flex flex-col ${prefix}-bg-secondary border-r ${prefix}-border`}>
      {/* Search Bar */}
      <div className={`p-4 border-b ${prefix}-border`}>
        <div className={`relative ${prefix}-bg-primary rounded-lg border ${prefix}-border`}>
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 pr-10 ${prefix}-bg-primary ${prefix}-text-primary focus:outline-none focus:ring-2 focus:ring-[#10B981] rounded-lg text-sm`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        </div>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Core Sections */}
        {groupedSections.core.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => toggleCategory('core')}
              className={`w-full px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1 flex items-center justify-between hover:${prefix}-bg-primary rounded transition-colors`}
            >
              <span>Core</span>
              <span className="text-xs">{expandedCategories.has('core') ? '▼' : '▶'}</span>
            </button>
            {expandedCategories.has('core') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                {groupedSections.core.map((section) => {
                  const count = getSectionCount(section.id)
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                        isActive
                          ? `${prefix}-bg-accent ${prefix}-text-accent shadow-md`
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{section.label}</span>
                      {count !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isActive 
                            ? `${prefix}-bg-primary ${prefix}-text-accent` 
                            : `${prefix}-bg-primary ${prefix}-text-tertiary`
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* Branching Sections */}
        {groupedSections.branching.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => toggleCategory('branching')}
              className={`w-full px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1 flex items-center justify-between hover:${prefix}-bg-primary rounded transition-colors`}
            >
              <span>Branching</span>
              <span className="text-xs">{expandedCategories.has('branching') ? '▼' : '▶'}</span>
            </button>
            {expandedCategories.has('branching') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                {groupedSections.branching.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                        isActive
                          ? `${prefix}-bg-accent ${prefix}-text-accent shadow-md`
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{section.label}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* Technical Sections */}
        {groupedSections.technical.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => toggleCategory('technical')}
              className={`w-full px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1 flex items-center justify-between hover:${prefix}-bg-primary rounded transition-colors`}
            >
              <span>Technical</span>
              <span className="text-xs">{expandedCategories.has('technical') ? '▼' : '▶'}</span>
            </button>
            {expandedCategories.has('technical') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                {groupedSections.technical.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                        isActive
                          ? `${prefix}-bg-accent ${prefix}-text-accent shadow-md`
                          : `${prefix}-text-tertiary hover:${prefix}-bg-primary hover:${prefix}-text-secondary`
                      }`}
                    >
                      <span className="text-sm">{section.icon}</span>
                      <span className="text-xs flex-1 text-left">{section.label}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* No results message */}
        {searchQuery && filteredSections.length === 0 && (
          <div className={`p-4 text-center ${prefix}-text-tertiary text-sm`}>
            No sections found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Actions Section */}
      {(onExport || onImport) && (
        <div className={`p-4 border-t ${prefix}-border`}>
          <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-2`}>
            Actions
          </div>
          <div className="space-y-2">
            {onExport && (
              <button
                onClick={onExport}
                disabled={isLocked}
                className={`w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                  isLocked
                    ? `${prefix}-text-tertiary cursor-not-allowed opacity-50`
                    : `${prefix}-btn-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-accent`
                }`}
                title={isLocked ? 'Story bible is locked' : 'Export story bible as JSON'}
              >
                <span className="text-lg">💾</span>
                <span className="text-sm font-medium flex-1 text-left">Export Story Bible</span>
              </button>
            )}
            {onImport && (
              <label
                className={`w-full p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${
                  isLocked
                    ? `${prefix}-text-tertiary cursor-not-allowed opacity-50`
                    : `${prefix}-btn-secondary ${prefix}-text-secondary hover:${prefix}-bg-accent hover:${prefix}-text-accent`
                }`}
                title={isLocked ? 'Story bible is locked' : 'Import story bible from JSON file'}
              >
                <span className="text-lg">📥</span>
                <span className="text-sm font-medium flex-1 text-left">Import Story Bible</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImport}
                  disabled={isLocked}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

