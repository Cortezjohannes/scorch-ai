# 🔥 SCORCHED AI UI/UX REDESIGN - IMPLEMENTATION GUIDE
## **CHUNK 4: STORY CREATION & BIBLE INTERFACE**

> **⚠️ CRITICAL REMINDER**: This is a **FRONTEND-ONLY** redesign. We are **NOT** touching any story generation APIs, AI engines, or backend logic. We're simply making the story development interface more intuitive and visually organized - like upgrading the dashboard while keeping the engine completely unchanged.

---

## **📋 Overview**

This chunk focuses on redesigning the story bible and story creation interfaces to make complex narrative information more digestible and interactive. We're transforming dense text outputs into engaging, explorable story universes.

### **🎯 Goals of This Chunk**
- **Information Architecture**: Organize complex story data clearly
- **Visual Storytelling**: Make story elements more engaging
- **Interactive Exploration**: Allow users to dive deep into story details
- **Progressive Disclosure**: Reveal information complexity gradually
- **Cross-Reference Navigation**: Easy movement between related story elements

---

## **📖 Story Bible Redesign Architecture**

### **Current Analysis**
Your existing story bible page (`src/app/story-bible/page.tsx`) appears to be quite comprehensive (1702 lines). Let's enhance it with better information organization.

### **Enhanced Story Bible Interface**

**Purpose**: Transform the story bible from a document view into an interactive story universe explorer.

```tsx
// ENHANCE: src/app/story-bible/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/Card'
import { StoryOverviewDashboard } from '@/components/story-bible/StoryOverviewDashboard'
import { CharacterGalaxy } from '@/components/story-bible/CharacterGalaxy'
import { WorldExplorer } from '@/components/story-bible/WorldExplorer'
import { PlotArchitecture } from '@/components/story-bible/PlotArchitecture'
import { StoryBibleGenerator } from '@/components/story-bible/StoryBibleGenerator'

type ViewMode = 'overview' | 'characters' | 'world' | 'plot' | 'themes' | 'generate'

export default function StoryBiblePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewMode>('overview')
  const [storyData, setStoryData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing story data or show generator
  useEffect(() => {
    // Check for existing story bible in localStorage or from API
    const existingStory = localStorage.getItem('reeled-story-bible')
    if (existingStory) {
      try {
        setStoryData(JSON.parse(existingStory))
      } catch (error) {
        console.error('Error parsing story data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  // If no story data, show generator
  if (!isLoading && !storyData) {
    return (
      <PageLayout
        title="Create Your Story Bible"
        subtitle="Generate a comprehensive story foundation for your series"
        showBreadcrumbs={true}
      >
        <StoryBibleGenerator
          onComplete={(data) => setStoryData(data)}
        />
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <StoryBibleLoadingScreen />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      showSecondaryNav={true}
      showBreadcrumbs={true}
    >
      {/* Story Bible Navigation */}
      <StoryBibleNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        storyTitle={storyData?.title || 'Your Story'}
      />

      {/* Main Content Area */}
      <div className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderCurrentView(currentView, storyData, setStoryData)}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  )
}

// Navigation for different story bible sections
function StoryBibleNavigation({ 
  currentView, 
  onViewChange, 
  storyTitle 
}: {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  storyTitle: string
}) {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '🏠', description: 'Story dashboard and metrics' },
    { id: 'characters', label: 'Characters', icon: '👥', description: 'Character profiles and relationships' },
    { id: 'world', label: 'World', icon: '🌍', description: 'Settings, locations, and world-building' },
    { id: 'plot', label: 'Plot', icon: '📈', description: 'Story structure and narrative flow' },
    { id: 'themes', label: 'Themes', icon: '💭', description: 'Central themes and messages' },
    { id: 'generate', label: 'Generate', icon: '🎲', description: 'Create additional content' }
  ]

  return (
    <div className="border-b border-white/10 sticky top-32 bg-black/80 backdrop-blur-md z-30">
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{storyTitle}</h1>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>📊</span>
            <span>Story Health: 87%</span>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto mobile-scrollbar">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewMode)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap
                transition-all duration-300 group
                ${currentView === item.id
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-60 group-hover:opacity-80">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

// Render different views based on selection
function renderCurrentView(view: ViewMode, storyData: any, setStoryData: (data: any) => void) {
  switch (view) {
    case 'overview':
      return <StoryOverviewDashboard storyData={storyData} />
    case 'characters':
      return <CharacterGalaxy characters={storyData?.characters || []} />
    case 'world':
      return <WorldExplorer worldData={storyData?.world || {}} />
    case 'plot':
      return <PlotArchitecture plotData={storyData?.plot || {}} />
    case 'themes':
      return <ThemeExplorer themes={storyData?.themes || []} />
    case 'generate':
      return <AdditionalContentGenerator storyData={storyData} onUpdate={setStoryData} />
    default:
      return <StoryOverviewDashboard storyData={storyData} />
  }
}
```

### **Story Overview Dashboard**

**Purpose**: Provide a high-level view of the entire story with quick navigation to specific elements.

```tsx
// CREATE: src/components/story-bible/StoryOverviewDashboard.tsx
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { ContentSection } from '@/components/layout/ContentSection'

interface StoryMetric {
  label: string
  value: string | number
  icon: string
  trend?: 'up' | 'down' | 'stable'
}

export function StoryOverviewDashboard({ storyData }: { storyData: any }) {
  const storyMetrics: StoryMetric[] = [
    { label: 'Characters', value: storyData?.characters?.length || 0, icon: '👥' },
    { label: 'Locations', value: storyData?.world?.locations?.length || 0, icon: '🌍' },
    { label: 'Plot Points', value: storyData?.plot?.majorPoints?.length || 0, icon: '📈' },
    { label: 'Themes', value: storyData?.themes?.length || 0, icon: '💭' },
    { label: 'Completion', value: '87%', icon: '✅', trend: 'up' },
    { label: 'Consistency', value: '92%', icon: '🎯', trend: 'stable' }
  ]

  const recentActivity = [
    { action: 'Updated character arc for Sarah Chen', time: '2 hours ago', type: 'character' },
    { action: 'Added new location: Underground Lab', time: '5 hours ago', type: 'world' },
    { action: 'Refined central theme development', time: '1 day ago', type: 'theme' },
    { action: 'Generated episode 3 outline', time: '2 days ago', type: 'plot' }
  ]

  return (
    <div className="space-y-8">
      {/* Story Health Metrics */}
      <ContentSection title="Story Health">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {storyMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="status" className="text-center">
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-white/60">
                  {metric.label}
                </div>
                {metric.trend && (
                  <div className={`text-xs mt-1 ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* Quick Access Tiles */}
      <ContentSection title="Quick Access">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAccessTile
            title="Character Spotlight"
            description="Focus on main character development"
            icon="🎭"
            action="View Characters"
            gradient="from-purple-500 to-blue-500"
          />
          <QuickAccessTile
            title="World Building"
            description="Explore locations and settings"
            icon="🏗️"
            action="Explore World"
            gradient="from-green-500 to-blue-500"
          />
          <QuickAccessTile
            title="Plot Development"
            description="Review story structure and pacing"
            icon="📊"
            action="Analyze Plot"
            gradient="from-orange-500 to-red-500"
          />
          <QuickAccessTile
            title="Generate Content"
            description="Create new story elements"
            icon="✨"
            action="Generate More"
            gradient="from-yellow-500 to-orange-500"
          />
        </div>
      </ContentSection>

      {/* Recent Activity */}
      <ContentSection title="Recent Activity">
        <Card variant="content">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl">
                  {activity.type === 'character' ? '👤' :
                   activity.type === 'world' ? '🌍' :
                   activity.type === 'theme' ? '💭' : '📈'}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-white/60 text-sm">{activity.time}</p>
                </div>
                <button className="text-ember-gold hover:text-ember-gold/80 text-sm">
                  View →
                </button>
              </motion.div>
            ))}
          </div>
        </Card>
      </ContentSection>

      {/* Story Synopsis */}
      <ContentSection title="Story Synopsis">
        <Card variant="content">
          <div className="prose-custom">
            <p className="text-readable text-lg leading-relaxed">
              {storyData?.synopsis || 'Your story synopsis will appear here once generated.'}
            </p>
          </div>
        </Card>
      </ContentSection>
    </div>
  )
}

function QuickAccessTile({ 
  title, 
  description, 
  icon, 
  action, 
  gradient 
}: {
  title: string
  description: string
  icon: string
  action: string
  gradient: string
}) {
  return (
    <Card variant="hero" className={`bg-gradient-to-br ${gradient} cursor-pointer group`}>
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-4">{description}</p>
        <button className="text-white font-medium group-hover:text-yellow-200 transition-colors">
          {action} →
        </button>
      </div>
    </Card>
  )
}
```

### **Character Galaxy Component**

**Purpose**: Visualize character relationships and make character exploration interactive.

```tsx
// CREATE: src/components/story-bible/CharacterGalaxy.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'

interface Character {
  id: string
  name: string
  role: string
  description: string
  relationships: string[]
  arc: string
  traits: string[]
  backstory: string
}

export function CharacterGalaxy({ characters }: { characters: Character[] }) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [viewMode, setViewMode] = useState<'galaxy' | 'list' | 'relationships'>('galaxy')

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Character Universe</h2>
        <div className="flex gap-2">
          {[
            { mode: 'galaxy', icon: '🌌', label: 'Galaxy View' },
            { mode: 'list', icon: '📋', label: 'List View' },
            { mode: 'relationships', icon: '🕸️', label: 'Relationships' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setViewMode(option.mode as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${viewMode === option.mode
                  ? 'bg-ember-gold/20 text-ember-gold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Character View */}
        <div className="lg:col-span-2">
          {viewMode === 'galaxy' && (
            <CharacterGalaxyView 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
          {viewMode === 'list' && (
            <CharacterListView 
              characters={characters}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
          {viewMode === 'relationships' && (
            <CharacterRelationshipView 
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
            />
          )}
        </div>

        {/* Character Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCharacter ? (
              <CharacterDetailPanel 
                key={selectedCharacter.id}
                character={selectedCharacter}
                onClose={() => setSelectedCharacter(null)}
              />
            ) : (
              <CharacterSelectionPrompt />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Galaxy visualization of characters
function CharacterGalaxyView({ 
  characters, 
  selectedCharacter, 
  onSelectCharacter 
}: {
  characters: Character[]
  selectedCharacter: Character | null
  onSelectCharacter: (character: Character) => void
}) {
  return (
    <Card variant="content" className="h-96 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        {/* Character Nodes */}
        {characters.map((character, index) => {
          const angle = (index / characters.length) * 2 * Math.PI
          const radius = 120
          const x = Math.cos(angle) * radius + 50
          const y = Math.sin(angle) * radius + 50

          return (
            <motion.button
              key={character.id}
              className={`
                absolute w-16 h-16 rounded-full border-2 
                flex items-center justify-center text-2xl
                transition-all duration-300 hover:scale-110
                ${selectedCharacter?.id === character.id
                  ? 'border-ember-gold bg-ember-gold/20 shadow-lg shadow-ember-gold/30'
                  : 'border-white/30 bg-white/10 hover:border-white/50'
                }
              `}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onSelectCharacter(character)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {getCharacterEmoji(character.role)}
            </motion.button>
          )
        })}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {characters.map((character, index) => {
            const angle1 = (index / characters.length) * 2 * Math.PI
            const radius = 120
            const x1 = Math.cos(angle1) * radius + 50
            const y1 = Math.sin(angle1) * radius + 50

            return character.relationships?.map((relationshipId) => {
              const relatedIndex = characters.findIndex(c => c.id === relationshipId)
              if (relatedIndex === -1) return null

              const angle2 = (relatedIndex / characters.length) * 2 * Math.PI
              const x2 = Math.cos(angle2) * radius + 50
              const y2 = Math.sin(angle2) * radius + 50

              return (
                <motion.line
                  key={`${character.id}-${relationshipId}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(226, 195, 118, 0.3)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                />
              )
            })
          })}
        </svg>

        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-20 h-20 rounded-full bg-ember-gold/20 border-2 border-ember-gold flex items-center justify-center">
            <span className="text-3xl">🎭</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        Click characters to explore relationships
      </div>
    </Card>
  )
}

// Character detail panel
function CharacterDetailPanel({ 
  character, 
  onClose 
}: { 
  character: Character
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card variant="content">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{character.name}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-ember-gold text-sm font-medium">Role</label>
            <p className="text-white/80">{character.role}</p>
          </div>

          <div>
            <label className="text-ember-gold text-sm font-medium">Description</label>
            <p className="text-white/80 text-sm leading-relaxed">
              {character.description}
            </p>
          </div>

          {character.traits && (
            <div>
              <label className="text-ember-gold text-sm font-medium">Key Traits</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {character.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {character.arc && (
            <div>
              <label className="text-ember-gold text-sm font-medium">Character Arc</label>
              <p className="text-white/80 text-sm leading-relaxed">
                {character.arc}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <button className="w-full burn-button py-2 text-sm">
              Edit Character
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function CharacterSelectionPrompt() {
  return (
    <Card variant="content" className="text-center">
      <div className="text-4xl mb-4">👥</div>
      <h3 className="text-lg font-medium text-white mb-2">
        Select a Character
      </h3>
      <p className="text-white/60 text-sm">
        Choose a character from the galaxy or list to view detailed information and relationships.
      </p>
    </Card>
  )
}

// Helper function to get character emoji based on role
function getCharacterEmoji(role: string): string {
  const roleMap: Record<string, string> = {
    'protagonist': '🦸',
    'antagonist': '🦹',
    'mentor': '🧙',
    'love_interest': '💕',
    'sidekick': '🤝',
    'comic_relief': '🎭',
    'authority': '👑',
    'victim': '😰',
    'herald': '📢',
    'threshold_guardian': '🚪'
  }
  
  return roleMap[role.toLowerCase()] || '👤'
}

// List view and relationship view components would follow similar patterns...
function CharacterListView({ characters, onSelectCharacter }: any) {
  return (
    <Card variant="content">
      <div className="space-y-3">
        {characters.map((character: Character) => (
          <motion.button
            key={character.id}
            className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
            onClick={() => onSelectCharacter(character)}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCharacterEmoji(character.role)}</span>
              <div>
                <h4 className="font-medium text-white">{character.name}</h4>
                <p className="text-sm text-white/60">{character.role}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  )
}

function CharacterRelationshipView({ characters, selectedCharacter, onSelectCharacter }: any) {
  return (
    <Card variant="content">
      <p className="text-white/60 text-center py-8">
        Relationship visualization coming soon...
      </p>
    </Card>
  )
}
```

---

## **🌍 World Explorer Component**

**Purpose**: Make world-building information interactive and explorable.

```tsx
// CREATE: src/components/story-bible/WorldExplorer.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'

interface Location {
  id: string
  name: string
  type: string
  description: string
  importance: 'high' | 'medium' | 'low'
  connectedTo: string[]
  atmosphere: string
  keyFeatures: string[]
}

export function WorldExplorer({ worldData }: { worldData: any }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'timeline' | 'cultures'>('map')

  const locations: Location[] = worldData?.locations || []

  return (
    <div className="space-y-6">
      {/* World Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">World Explorer</h2>
        <div className="flex gap-2">
          {[
            { mode: 'map', icon: '🗺️', label: 'Map View' },
            { mode: 'timeline', icon: '⏰', label: 'Timeline' },
            { mode: 'cultures', icon: '🏛️', label: 'Cultures' }
          ].map((option) => (
            <button
              key={option.mode}
              onClick={() => setViewMode(option.mode as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${viewMode === option.mode
                  ? 'bg-ember-gold/20 text-ember-gold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* World Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {viewMode === 'map' && (
            <InteractiveWorldMap 
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          )}
          {viewMode === 'timeline' && (
            <WorldTimeline worldData={worldData} />
          )}
          {viewMode === 'cultures' && (
            <CulturalExplorer worldData={worldData} />
          )}
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <LocationDetailPanel 
                key={selectedLocation.id}
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            ) : (
              <WorldOverviewPanel worldData={worldData} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function InteractiveWorldMap({ 
  locations, 
  selectedLocation, 
  onSelectLocation 
}: {
  locations: Location[]
  selectedLocation: Location | null
  onSelectLocation: (location: Location) => void
}) {
  return (
    <Card variant="content" className="h-96 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20">
        {/* Location Markers */}
        {locations.map((location, index) => {
          // Distribute locations in a grid pattern
          const gridSize = Math.ceil(Math.sqrt(locations.length))
          const row = Math.floor(index / gridSize)
          const col = index % gridSize
          const x = (col / (gridSize - 1)) * 80 + 10
          const y = (row / (gridSize - 1)) * 80 + 10

          const importanceSize = {
            high: 'w-12 h-12',
            medium: 'w-10 h-10',
            low: 'w-8 h-8'
          }

          return (
            <motion.button
              key={location.id}
              className={`
                absolute ${importanceSize[location.importance]}
                rounded-full border-2 flex items-center justify-center
                transition-all duration-300 hover:scale-110
                ${selectedLocation?.id === location.id
                  ? 'border-ember-gold bg-ember-gold/20 shadow-lg shadow-ember-gold/30'
                  : 'border-white/30 bg-white/10 hover:border-white/50'
                }
              `}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => onSelectLocation(location)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {getLocationEmoji(location.type)}
            </motion.button>
          )
        })}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {locations.map((location, index) => {
            const gridSize = Math.ceil(Math.sqrt(locations.length))
            const row1 = Math.floor(index / gridSize)
            const col1 = index % gridSize
            const x1 = (col1 / (gridSize - 1)) * 80 + 10
            const y1 = (row1 / (gridSize - 1)) * 80 + 10

            return location.connectedTo?.map((connectionId) => {
              const connectedIndex = locations.findIndex(l => l.id === connectionId)
              if (connectedIndex === -1) return null

              const row2 = Math.floor(connectedIndex / gridSize)
              const col2 = connectedIndex % gridSize
              const x2 = (col2 / (gridSize - 1)) * 80 + 10
              const y2 = (row2 / (gridSize - 1)) * 80 + 10

              return (
                <motion.line
                  key={`${location.id}-${connectionId}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(226, 195, 118, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                />
              )
            })
          })}
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        Click locations to explore details
      </div>
    </Card>
  )
}

function LocationDetailPanel({ 
  location, 
  onClose 
}: { 
  location: Location
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card variant="content">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{location.name}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-ember-gold text-sm font-medium">Type</label>
            <p className="text-white/80">{location.type}</p>
          </div>

          <div>
            <label className="text-ember-gold text-sm font-medium">Atmosphere</label>
            <p className="text-white/80">{location.atmosphere}</p>
          </div>

          <div>
            <label className="text-ember-gold text-sm font-medium">Description</label>
            <p className="text-white/80 text-sm leading-relaxed">
              {location.description}
            </p>
          </div>

          {location.keyFeatures && (
            <div>
              <label className="text-ember-gold text-sm font-medium">Key Features</label>
              <ul className="list-disc list-inside text-white/80 text-sm space-y-1">
                {location.keyFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <button className="w-full burn-button py-2 text-sm">
              Edit Location
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function WorldOverviewPanel({ worldData }: { worldData: any }) {
  return (
    <Card variant="content" className="text-center">
      <div className="text-4xl mb-4">🌍</div>
      <h3 className="text-lg font-medium text-white mb-2">
        World Overview
      </h3>
      <p className="text-white/60 text-sm mb-4">
        Explore the rich universe of your story through interactive maps, timelines, and cultural details.
      </p>
      
      <div className="space-y-3 text-left">
        <div className="flex justify-between">
          <span className="text-white/60">Locations:</span>
          <span className="text-ember-gold">{worldData?.locations?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Cultures:</span>
          <span className="text-ember-gold">{worldData?.cultures?.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Time Period:</span>
          <span className="text-ember-gold">{worldData?.timePeriod || 'Modern'}</span>
        </div>
      </div>
    </Card>
  )
}

// Helper functions
function getLocationEmoji(type: string): string {
  const typeMap: Record<string, string> = {
    'city': '🏙️',
    'town': '🏘️',
    'village': '🏡',
    'forest': '🌲',
    'mountain': '⛰️',
    'desert': '🏜️',
    'ocean': '🌊',
    'building': '🏢',
    'home': '🏠',
    'castle': '🏰',
    'cave': '🕳️',
    'space': '🚀'
  }
  
  return typeMap[type.toLowerCase()] || '📍'
}

// Placeholder components for other views
function WorldTimeline({ worldData }: any) {
  return (
    <Card variant="content">
      <p className="text-white/60 text-center py-8">
        World timeline visualization coming soon...
      </p>
    </Card>
  )
}

function CulturalExplorer({ worldData }: any) {
  return (
    <Card variant="content">
      <p className="text-white/60 text-center py-8">
        Cultural system explorer coming soon...
      </p>
    </Card>
  )
}
```

---

## **🔧 Implementation Instructions**

### **Step 1: Create Story Bible Components**
1. Create folder: `src/components/story-bible/`
2. Add all component files provided above
3. Start with `StoryOverviewDashboard.tsx`
4. Test each component in isolation

### **Step 2: Enhance Existing Story Bible Page**
1. Backup current `src/app/story-bible/page.tsx`
2. Implement enhanced version gradually
3. Keep all existing data fetching logic
4. Test navigation between views

### **Step 3: Data Integration**
1. Ensure components work with existing story data structure
2. Add fallbacks for missing data
3. Maintain compatibility with current API responses
4. Test with both generated and mock data

### **Step 4: Progressive Enhancement**
1. Start with overview dashboard only
2. Add character galaxy view
3. Implement world explorer
4. Test all interactions thoroughly

### **Step 5: Testing Checklist**
- [ ] All existing story data displays correctly
- [ ] Navigation between views works smoothly
- [ ] Character and location selection functions properly
- [ ] Mobile responsiveness is excellent
- [ ] Loading states handle gracefully
- [ ] No existing functionality is broken

---

## **⚡ Performance Considerations**

### **Data Handling**
- Lazy load complex visualizations
- Cache character and location data
- Efficient re-rendering with React patterns

### **Animation Performance**
- Use CSS transforms for smooth animations
- Implement proper will-change management
- Ensure 60fps on mobile devices

### **Memory Management**
- Clean up event listeners
- Optimize large data sets
- Efficient component unmounting

---

## **🚨 Integration Safety**

### **Data Compatibility**
- All components work with existing story data format
- Graceful handling of missing or incomplete data
- Backward compatibility with current API responses

### **Functionality Preservation**
- No changes to story generation logic
- All existing features remain accessible
- Current user workflows continue working

---

## **📱 Next Steps**

After implementing the story bible enhancements:
1. Test with real generated story data
2. Gather user feedback on navigation and usability
3. Optimize performance based on usage patterns
4. Move to **CHUNK 5: Pre-Production Workflow**

This story bible redesign transforms complex narrative data into an engaging, explorable experience while maintaining all existing story generation functionality.
