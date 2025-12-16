'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EpisodePreProductionExamplesProps {
  theme: 'light' | 'dark'
}

export default function EpisodePreProductionExamples({ theme }: EpisodePreProductionExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [activeLayout, setActiveLayout] = React.useState(1)
  const [activeTab, setActiveTab] = React.useState<'narrative' | 'scripts' | 'breakdown' | 'storyboards' | 'shotlist' | 'props' | null>('narrative')
  
  // When switching to Dashboard Grid layout, show overview first
  React.useEffect(() => {
    if (activeLayout === 4 && activeTab !== null) {
      setActiveTab(null)
    } else if (activeLayout !== 4 && activeTab === null) {
      setActiveTab('narrative')
    }
  }, [activeLayout, activeTab])
  const [activeConcept, setActiveConcept] = React.useState<Record<string, number>>({
    narrative: 1,
    scripts: 1,
    breakdown: 1,
    storyboards: 1,
    shotlist: 1,
    props: 1
  })

  const sampleEpisode = {
    number: 8,
    title: 'Diamond Cut, Diamond Kept',
    arc: 1,
    synopsis: 'As LAUNCH faces mounting scrutiny and pressure to cash out of Greenlit AI, Jason and Molly must prove their convictions to their team, their partners, and themselves. A tense day of internal challenges, existential doubt, and ultimate resolve.',
    characters: ['Jason Calacanis', 'Molly Wood', 'Team Member 1', 'Team Member 2'],
    totalScenes: 3,
    completion: 65
  }

  const sampleNarrative = {
    synopsis: sampleEpisode.synopsis,
    arcInfo: {
      arcNumber: 1,
      arcTitle: 'The Foundation',
      episodeInArc: 8,
      totalInArc: 10
    },
    characterAppearances: [
      { name: 'Jason Calacanis', scenes: [1, 2, 3], role: 'Protagonist' },
      { name: 'Molly Wood', scenes: [1, 3], role: 'Co-founder' },
      { name: 'Team Member 1', scenes: [1], role: 'Supporting' }
    ],
    notes: 'This episode establishes the core conflict and sets up the partnership dynamic.'
  }

  const sampleScript = {
    title: sampleEpisode.title,
    scenes: [
      {
        number: 1,
        heading: 'INT. LAUNCH OFFICES - MORNING',
        action: 'The LAUNCH conference room is tense. Jason Calacanis stands at the head of the table, facing down his partners.',
        dialogue: [
          { character: 'MOLLY', line: 'We\'ve been here before. Every time we make a bold move, the doubters come out.' },
          { character: 'JASON', line: 'This isn\'t just doubt, Molly. This is different. The market is questioning our judgment.' }
        ]
      },
      {
        number: 2,
        heading: 'EXT. SILICON VALLEY STREET - AFTERNOON',
        action: 'Jason walks alone through the streets of Palo Alto, phone buzzing with notifications.',
        dialogue: [
          { character: 'MOLLY (V.O.)', line: 'We need to make a statement. Not to them—to ourselves.' }
        ]
      }
    ]
  }

  const sampleBreakdown = {
    scenes: [
      {
        sceneNumber: 1,
        title: 'The Pressure Mounts',
        setting: 'INT. LAUNCH OFFICES - MORNING',
        characters: ['Jason Calacanis', 'Molly Wood', 'Team Member 1'],
        props: ['Conference table', 'Laptops', 'Whiteboard'],
        locations: ['LAUNCH Offices - Conference Room'],
        specialRequirements: ['Natural lighting', 'Multiple camera angles']
      },
      {
        sceneNumber: 2,
        title: 'The Test',
        setting: 'EXT. SILICON VALLEY STREET - AFTERNOON',
        characters: ['Jason Calacanis'],
        props: ['Phone', 'Coffee cup'],
        locations: ['Palo Alto - Main Street'],
        specialRequirements: ['Exterior shoot', 'Street permit']
      },
      {
        sceneNumber: 3,
        title: 'Diamond Hands',
        setting: 'INT. LAUNCH OFFICES - EVENING',
        characters: ['Jason Calacanis', 'Molly Wood', 'Team Member 1', 'Team Member 2'],
        props: ['Conference table', 'Projector'],
        locations: ['LAUNCH Offices - Conference Room'],
        specialRequirements: ['Evening lighting', 'Group scene']
      }
    ]
  }

  const sampleStoryboards = {
    scenes: [
      {
        sceneNumber: 1,
        frames: [
          {
            id: '1-1',
            shotNumber: '1',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop',
            description: 'Wide shot of conference room, Jason at head of table',
            cameraAngle: 'Wide',
            cameraMovement: 'Static',
            duration: '5s'
          },
          {
            id: '1-2',
            shotNumber: '2',
            imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop',
            description: 'Close-up on Jason\'s face, showing determination',
            cameraAngle: 'Close-up',
            cameraMovement: 'Static',
            duration: '3s'
          }
        ]
      },
      {
        sceneNumber: 2,
        frames: [
          {
            id: '2-1',
            shotNumber: '1',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
            description: 'Jason walking down Silicon Valley street',
            cameraAngle: 'Medium',
            cameraMovement: 'Following',
            duration: '8s'
          }
        ]
      }
    ]
  }

  const sampleShotList = {
    scenes: [
      {
        sceneNumber: 1,
        shots: [
          {
            id: '1-1',
            shotNumber: '1',
            shotType: 'Wide',
            cameraMovement: 'Static',
            lens: '24mm',
            frameUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop',
            description: 'Establishing shot of conference room',
            duration: '5s',
            notes: 'Natural lighting from windows'
          },
          {
            id: '1-2',
            shotNumber: '2',
            shotType: 'Close-up',
            cameraMovement: 'Static',
            lens: '85mm',
            frameUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=225&fit=crop',
            description: 'Jason\'s reaction',
            duration: '3s',
            notes: 'Focus on eyes'
          }
        ]
      }
    ]
  }

  const samplePropsWardrobe = {
    props: [
      { name: 'Conference table', description: 'Large mahogany table', character: 'N/A', scenes: [1, 3], quantity: 1 },
      { name: 'Laptops', description: 'MacBook Pro', character: 'Team', scenes: [1], quantity: 3 },
      { name: 'Phone', description: 'iPhone', character: 'Jason', scenes: [2], quantity: 1 }
    ],
    wardrobe: [
      { name: 'Business suit', description: 'Navy blue, tailored', character: 'Jason', scenes: [1, 2, 3], quantity: 1 },
      { name: 'Blazer', description: 'Black, professional', character: 'Molly', scenes: [1, 3], quantity: 1 }
    ]
  }

  const tabs = [
    { id: 'narrative', label: 'Narrative', icon: '📖' },
    { id: 'scripts', label: 'Script', icon: '📝' },
    { id: 'breakdown', label: 'Breakdown', icon: '📋' },
    { id: 'storyboards', label: 'Storyboards', icon: '🖼️' },
    { id: 'shotlist', label: 'Shot List', icon: '🎬' },
    { id: 'props', label: 'Props/Wardrobe', icon: '👗' }
  ]

  const renderLayoutConcept = () => {
    switch (activeLayout) {
      case 1:
        return renderHorizontalTabs()
      case 2:
        return renderSidebarNavigation()
      case 3:
        return renderStepWizard()
      case 4:
        return renderDashboardGrid()
      default:
        return renderHorizontalTabs()
    }
  }

  const renderHorizontalTabs = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Header */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary`}>← Dashboard</button>
                <span className={prefix + '-text-tertiary'}>/</span>
                <span className={`text-sm ${prefix}-text-primary`}>Episode Pre-Production</span>
              </div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Episode {sampleEpisode.number}: {sampleEpisode.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                Export
              </button>
              <div className={`w-8 h-8 rounded-full ${prefix}-bg-accent flex items-center justify-center text-sm font-bold ${prefix}-text-accent`}>
                {sampleEpisode.completion}%
              </div>
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className={`border-b ${prefix}-border ${prefix}-bg-secondary flex overflow-x-auto`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${prefix}-border-accent ${prefix}-text-accent`
                    : `${prefix}-border-transparent ${prefix}-text-secondary hover:${prefix}-text-primary`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSidebarNavigation = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
          {/* Left Sidebar */}
          <div className={`w-64 border-r ${prefix}-border ${prefix}-bg-secondary flex flex-col`}>
            <div className={`p-4 border-b ${prefix}-border`}>
              <h2 className={`text-lg font-bold ${prefix}-text-primary mb-1`}>
                Episode {sampleEpisode.number}
              </h2>
              <p className={`text-sm ${prefix}-text-secondary`}>{sampleEpisode.title}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === tab.id
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tab.icon}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${activeTab === tab.id ? `${prefix}-text-accent` : `${prefix}-text-primary`}`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs ${prefix}-text-tertiary`}>
                        {tab.id === 'narrative' ? 'Overview' : tab.id === 'scripts' ? 'Screenplay' : 'Details'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className={`p-4 border-t ${prefix}-border`}>
              <div className={`text-xs ${prefix}-text-tertiary mb-2`}>Overall Progress</div>
              <div className={`h-2 ${prefix}-bg-primary rounded-full overflow-hidden`}>
                <div className={`h-full ${prefix}-bg-accent`} style={{ width: `${sampleEpisode.completion}%` }}></div>
              </div>
              <div className={`text-sm font-medium mt-2 ${prefix}-text-primary`}>{sampleEpisode.completion}% Complete</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-6 border-b ${prefix}-border flex items-center justify-between`}>
              <h3 className={`text-2xl font-bold ${prefix}-text-primary`}>
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                Export
              </button>
            </div>
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStepWizard = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Progress Stepper */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Episode {sampleEpisode.number}: {sampleEpisode.title}
              </h2>
              <div className={`text-sm font-medium ${prefix}-text-primary`}>
                Step {tabs.findIndex(t => t.id === activeTab) + 1} of {tabs.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tabs.map((tab, idx) => (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : idx < tabs.findIndex(t => t.id === activeTab)
                        ? `${prefix}-bg-primary ${prefix}-text-secondary`
                        : `${prefix}-bg-primary ${prefix}-text-tertiary`
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                  {idx < tabs.length - 1 && (
                    <div className={`w-8 h-0.5 ${idx < tabs.findIndex(t => t.id === activeTab) ? `${prefix}-bg-accent` : `${prefix}-bg-primary`}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className={`h-1 ${prefix}-bg-primary rounded-full mt-3 overflow-hidden`}>
              <div className={`h-full ${prefix}-bg-accent transition-all`} style={{ width: `${((tabs.findIndex(t => t.id === activeTab) + 1) / tabs.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>

          {/* Navigation Buttons */}
          <div className={`border-t ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
            <button
              onClick={() => {
                const currentIdx = tabs.findIndex(t => t.id === activeTab)
                if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1].id as any)
              }}
              disabled={tabs.findIndex(t => t.id === activeTab) === 0}
              className={`px-4 py-2 ${prefix}-bg-primary ${prefix}-border border rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${prefix}-text-secondary`}
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                const currentIdx = tabs.findIndex(t => t.id === activeTab)
                if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1].id as any)
              }}
              disabled={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1}
              className={`px-4 py-2 ${prefix}-bg-accent ${prefix}-text-accent rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDashboardGrid = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Header */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary`}>← Dashboard</button>
                <span className={prefix + '-text-tertiary'}>/</span>
                <span className={`text-sm ${prefix}-text-primary`}>Episode Pre-Production</span>
              </div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Episode {sampleEpisode.number}: {sampleEpisode.title}
              </h2>
            </div>
            <div className={`w-8 h-8 rounded-full ${prefix}-bg-accent flex items-center justify-center text-sm font-bold ${prefix}-text-accent`}>
              {sampleEpisode.completion}%
            </div>
          </div>

          {/* Overview Grid */}
          {activeTab === null ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${prefix}-card ${prefix}-border rounded-lg p-6 text-left hover:${prefix}-border-accent transition-all`}
                  >
                    <div className="text-4xl mb-3">{tab.icon}</div>
                    <h3 className={`text-lg font-bold mb-2 ${prefix}-text-primary`}>{tab.label}</h3>
                    <div className={`text-sm ${prefix}-text-secondary mb-4`}>
                      {tab.id === 'narrative' ? 'Episode overview and synopsis' :
                       tab.id === 'scripts' ? 'Formatted screenplay' :
                       tab.id === 'breakdown' ? 'Scene-by-scene analysis' :
                       tab.id === 'storyboards' ? 'Visual planning with AI images' :
                       tab.id === 'shotlist' ? 'Camera shots and angles' :
                       'Props and wardrobe items'}
                    </div>
                    <div className={`flex items-center justify-between`}>
                      <span className={`text-xs ${prefix}-text-tertiary`}>Status: Ready</span>
                      <span className={`text-xs ${prefix}-text-accent`}>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab(null as any)}
                    className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary`}
                  >
                    ← Overview
                  </button>
                  <span className={prefix + '-text-tertiary'}>/</span>
                  <span className={`text-sm ${prefix}-text-primary`}>{tabs.find(t => t.id === activeTab)?.label}</span>
                </div>
                <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                  Export
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {renderTabContent()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'narrative':
        return renderNarrativeTab()
      case 'scripts':
        return renderScriptsTab()
      case 'breakdown':
        return renderBreakdownTab()
      case 'storyboards':
        return renderStoryboardsTab()
      case 'shotlist':
        return renderShotListTab()
      case 'props':
        return renderPropsTab()
      default:
        return renderNarrativeTab()
    }
  }

  const renderNarrativeTab = () => {
    const concept = activeConcept.narrative
    switch (concept) {
      case 1:
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-8`}>
              <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Synopsis</h3>
              <p className={`${prefix}-text-secondary leading-relaxed`}>{sampleNarrative.synopsis}</p>
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Characters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleNarrative.characterAppearances.map((char, idx) => (
                  <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                    <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{char.name}</h4>
                    <p className={`text-sm ${prefix}-text-secondary mb-2`}>{char.role}</p>
                    <div className={`text-xs ${prefix}-text-tertiary`}>
                      Scenes: {char.scenes.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Episode Info</h3>
              <div className={`space-y-3 text-sm ${prefix}-text-secondary`}>
                <div><strong className={prefix + '-text-primary'}>Number:</strong> {sampleEpisode.number}</div>
                <div><strong className={prefix + '-text-primary'}>Arc:</strong> {sampleNarrative.arcInfo.arcNumber}</div>
                <div><strong className={prefix + '-text-primary'}>Position:</strong> {sampleNarrative.arcInfo.episodeInArc}/{sampleNarrative.arcInfo.totalInArc}</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Synopsis</h3>
                <p className={`${prefix}-text-secondary leading-relaxed mb-4`}>{sampleNarrative.synopsis}</p>
                <div className={`${prefix}-card-secondary ${prefix}-border rounded-lg p-4`}>
                  <h4 className={`text-sm font-bold mb-2 ${prefix}-text-primary`}>Notes</h4>
                  <p className={`text-sm ${prefix}-text-secondary`}>{sampleNarrative.notes}</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Arc Timeline</h3>
              <div className="flex items-center gap-2">
                {Array.from({ length: sampleNarrative.arcInfo.totalInArc }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded ${
                      idx + 1 === sampleNarrative.arcInfo.episodeInArc
                        ? `${prefix}-bg-accent`
                        : idx + 1 < sampleNarrative.arcInfo.episodeInArc
                        ? `${prefix}-bg-accent opacity-50`
                        : `${prefix}-bg-primary`
                    }`}
                  ></div>
                ))}
              </div>
              <div className={`text-sm mt-2 ${prefix}-text-secondary`}>
                Episode {sampleNarrative.arcInfo.episodeInArc} of {sampleNarrative.arcInfo.totalInArc} in Arc {sampleNarrative.arcInfo.arcNumber}
              </div>
            </div>
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Synopsis</h3>
              <p className={`${prefix}-text-secondary leading-relaxed`}>{sampleNarrative.synopsis}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderScriptsTab = () => {
    const concept = activeConcept.scripts
    switch (concept) {
      case 1:
        return (
          <div style={{ fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}>
            <div className="mb-8">
              <div className="uppercase font-bold mb-4">{sampleScript.scenes[0].heading}</div>
              <div className="mb-4 text-justify">{sampleScript.scenes[0].action}</div>
              {sampleScript.scenes[0].dialogue.map((d, idx) => (
                <div key={idx} className="mb-4">
                  <div className="mb-1" style={{ marginLeft: '3.7in', width: '2.5in' }}>
                    <div className="font-bold uppercase">{d.character}</div>
                  </div>
                  <div style={{ marginLeft: '2.5in', width: '3.5in', textAlign: 'justify' }}>
                    {d.line}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="flex gap-6">
            <div className={`w-64 ${prefix}-bg-secondary rounded-lg p-4`}>
              <h4 className={`font-bold mb-3 ${prefix}-text-primary`}>Scenes</h4>
              {sampleScript.scenes.map((scene, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-3 py-2 rounded mb-2 ${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`}
                >
                  Scene {scene.number}
                </button>
              ))}
            </div>
            <div className="flex-1" style={{ fontFamily: 'Courier, monospace', fontSize: '12pt' }}>
              <div className="uppercase font-bold mb-4">{sampleScript.scenes[0].heading}</div>
              <div className="mb-4">{sampleScript.scenes[0].action}</div>
              {sampleScript.scenes[0].dialogue.map((d, idx) => (
                <div key={idx} className="mb-4">
                  <div className="font-bold uppercase mb-1">{d.character}</div>
                  <div>{d.line}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            {sampleScript.scenes.map((scene, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                <button className={`w-full text-left flex items-center justify-between mb-4`}>
                  <h3 className={`text-lg font-bold ${prefix}-text-primary`}>
                    Scene {scene.number}: {scene.heading}
                  </h3>
                  <span className={prefix + '-text-tertiary'}>▼</span>
                </button>
                <div className={`${prefix}-text-secondary`}>
                  <p className="mb-4">{scene.action}</p>
                  {scene.dialogue.map((d, dIdx) => (
                    <div key={dIdx} className="mb-3">
                      <strong className={prefix + '-text-primary'}>{d.character}:</strong> {d.line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderBreakdownTab = () => {
    const concept = activeConcept.breakdown
    switch (concept) {
      case 1:
        return (
          <div className="space-y-3">
            {sampleBreakdown.scenes.map((scene, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <button className={`w-full p-4 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-tertiary`}>
                  <div>
                    <h3 className={`font-bold ${prefix}-text-primary`}>Scene {scene.sceneNumber}: {scene.title}</h3>
                    <p className={`text-sm ${prefix}-text-tertiary`}>{scene.setting}</p>
                  </div>
                  <span className={prefix + '-text-tertiary'}>▼</span>
                </button>
                <div className="p-4 space-y-3">
                  <div>
                    <strong className={`text-sm ${prefix}-text-primary`}>Characters:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {scene.characters.map((char, cIdx) => (
                        <span key={cIdx} className={`px-2 py-1 ${prefix}-bg-accent ${prefix}-text-accent rounded text-xs`}>
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong className={`text-sm ${prefix}-text-primary`}>Props:</strong>
                    <p className={`text-sm ${prefix}-text-secondary`}>{scene.props.join(', ')}</p>
                  </div>
                  <div>
                    <strong className={`text-sm ${prefix}-text-primary`}>Locations:</strong>
                    <p className={`text-sm ${prefix}-text-secondary`}>{scene.locations.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleBreakdown.scenes.map((scene, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`font-bold mb-2 ${prefix}-text-primary`}>Scene {scene.sceneNumber}</h3>
                <p className={`text-sm mb-3 ${prefix}-text-secondary`}>{scene.title}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {scene.characters.slice(0, 2).map((char, cIdx) => (
                    <span key={cIdx} className={`px-2 py-0.5 ${prefix}-bg-accent ${prefix}-text-accent rounded text-xs`}>
                      {char}
                    </span>
                  ))}
                  {scene.characters.length > 2 && (
                    <span className={`px-2 py-0.5 ${prefix}-bg-primary ${prefix}-text-secondary rounded text-xs`}>
                      +{scene.characters.length - 2}
                    </span>
                  )}
                </div>
                <div className={`text-xs ${prefix}-text-tertiary`}>
                  {scene.props.length} props • {scene.locations.length} location
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Scene</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Characters</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Props</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Locations</th>
                </tr>
              </thead>
              <tbody>
                {sampleBreakdown.scenes.map((scene, idx) => (
                  <tr key={idx} className={`border-t ${prefix}-border`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{scene.sceneNumber}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>
                      <div className="flex flex-wrap gap-1">
                        {scene.characters.map((char, cIdx) => (
                          <span key={cIdx} className={`px-2 py-0.5 ${prefix}-bg-accent ${prefix}-text-accent rounded text-xs`}>
                            {char}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`p-3 ${prefix}-text-secondary text-sm`}>{scene.props.length}</td>
                    <td className={`p-3 ${prefix}-text-secondary text-sm`}>{scene.locations[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 4:
        return (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {['Characters', 'Props', 'Locations'].map((category) => (
              <div key={category} className={`min-w-64 ${prefix}-bg-secondary rounded-lg p-4`}>
                <h3 className={`font-bold mb-3 ${prefix}-text-primary`}>{category}</h3>
                <div className="space-y-2">
                  {sampleBreakdown.scenes.map((scene, idx) => (
                    <div key={idx} className={`${prefix}-card ${prefix}-border rounded p-3`}>
                      <div className={`text-xs font-medium mb-1 ${prefix}-text-tertiary`}>Scene {scene.sceneNumber}</div>
                      <div className={`text-sm ${prefix}-text-secondary`}>
                        {category === 'Characters' ? scene.characters.join(', ') :
                         category === 'Props' ? scene.props.join(', ') :
                         scene.locations.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderStoryboardsTab = () => {
    const concept = activeConcept.storyboards
    switch (concept) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleStoryboards.scenes.flatMap(scene => scene.frames).map((frame, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className={`text-xs font-medium mb-2 ${prefix}-text-tertiary`}>
                    Scene {frame.id.split('-')[0]} • Shot {frame.shotNumber}
                  </div>
                  <p className={`text-sm mb-2 ${prefix}-text-primary`}>{frame.description}</p>
                  <div className={`text-xs ${prefix}-text-secondary`}>
                    {frame.cameraAngle} • {frame.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 2:
        return (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {sampleStoryboards.scenes.flatMap(scene => scene.frames).map((frame, idx) => (
                <div key={idx} className="flex-shrink-0 w-64">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                    <img
                      src={frame.imageUrl}
                      alt={frame.description}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <div className={`text-xs font-medium mb-1 ${prefix}-text-tertiary`}>
                        Scene {frame.id.split('-')[0]} • Shot {frame.shotNumber}
                      </div>
                      <p className={`text-sm ${prefix}-text-primary line-clamp-2`}>{frame.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sampleStoryboards.scenes.flatMap(scene => scene.frames).map((frame, idx) => (
              <button
                key={idx}
                className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden hover:${prefix}-border-accent transition-all`}
              >
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2">
                  <div className={`text-xs ${prefix}-text-tertiary`}>
                    {frame.id.split('-')[0]}-{frame.shotNumber}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {sampleStoryboards.scenes.flatMap(scene => scene.frames).map((frame, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden mb-4 break-inside-avoid`}>
                <img
                  src={frame.imageUrl}
                  alt={frame.description}
                  className="w-full object-cover"
                  style={{ height: idx % 3 === 0 ? '300px' : idx % 3 === 1 ? '200px' : '250px' }}
                />
                <div className="p-4">
                  <div className={`text-xs font-medium mb-1 ${prefix}-text-tertiary`}>
                    Scene {frame.id.split('-')[0]} • Shot {frame.shotNumber}
                  </div>
                  <p className={`text-sm ${prefix}-text-primary`}>{frame.description}</p>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderShotListTab = () => {
    const concept = activeConcept.shotlist
    switch (concept) {
      case 1:
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Frame</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Shot</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Type</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Movement</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Lens</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sampleShotList.scenes.flatMap(scene => scene.shots).map((shot, idx) => (
                  <tr key={idx} className={`border-t ${prefix}-border`}>
                    <td className="p-3">
                      <img src={shot.frameUrl} alt={shot.description} className="w-24 h-14 object-cover rounded" />
                    </td>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{shot.shotNumber}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{shot.shotType}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{shot.cameraMovement}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{shot.lens}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{shot.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleShotList.scenes.flatMap(scene => scene.shots).map((shot, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <img
                  src={shot.frameUrl}
                  alt={shot.description}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className={`text-xs font-medium mb-2 ${prefix}-text-tertiary`}>
                    Shot {shot.shotNumber}
                  </div>
                  <p className={`text-sm mb-3 ${prefix}-text-primary`}>{shot.description}</p>
                  <div className={`grid grid-cols-2 gap-2 text-xs ${prefix}-text-secondary`}>
                    <div><strong>Type:</strong> {shot.shotType}</div>
                    <div><strong>Lens:</strong> {shot.lens}</div>
                    <div><strong>Movement:</strong> {shot.cameraMovement}</div>
                    <div><strong>Duration:</strong> {shot.duration}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="flex gap-6">
            <div className={`w-80 ${prefix}-bg-secondary rounded-lg p-4`}>
              <h4 className={`font-bold mb-3 ${prefix}-text-primary`}>Shots</h4>
              {sampleShotList.scenes.flatMap(scene => scene.shots).map((shot, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-3 py-2 rounded mb-2 ${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`}
                >
                  Shot {shot.shotNumber}: {shot.shotType}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden mb-4`}>
                <img
                  src={sampleShotList.scenes[0].shots[0].frameUrl}
                  alt={sampleShotList.scenes[0].shots[0].description}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h4 className={`font-bold mb-3 ${prefix}-text-primary`}>Shot Details</h4>
                <div className={`space-y-2 text-sm ${prefix}-text-secondary`}>
                  <div><strong className={prefix + '-text-primary'}>Type:</strong> {sampleShotList.scenes[0].shots[0].shotType}</div>
                  <div><strong className={prefix + '-text-primary'}>Movement:</strong> {sampleShotList.scenes[0].shots[0].cameraMovement}</div>
                  <div><strong className={prefix + '-text-primary'}>Lens:</strong> {sampleShotList.scenes[0].shots[0].lens}</div>
                  <div><strong className={prefix + '-text-primary'}>Duration:</strong> {sampleShotList.scenes[0].shots[0].duration}</div>
                  <div><strong className={prefix + '-text-primary'}>Notes:</strong> {sampleShotList.scenes[0].shots[0].notes}</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleShotList.scenes.flatMap(scene => scene.shots).map((shot, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <img
                  src={shot.frameUrl}
                  alt={shot.description}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <div className={`text-xs font-medium mb-1 ${prefix}-text-primary`}>
                    Shot {shot.shotNumber} • {shot.shotType}
                  </div>
                  <p className={`text-sm mb-2 ${prefix}-text-primary`}>{shot.description}</p>
                  <div className={`text-xs ${prefix}-text-primary/80`}>
                    {shot.lens} • {shot.cameraMovement} • {shot.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderPropsTab = () => {
    const concept = activeConcept.props
    switch (concept) {
      case 1:
        return (
          <div>
            <div className="flex gap-2 mb-6">
              <button className={`px-4 py-2 ${prefix}-bg-accent ${prefix}-text-accent rounded-lg font-medium`}>
                Props
              </button>
              <button className={`px-4 py-2 ${prefix}-bg-primary ${prefix}-text-secondary rounded-lg font-medium`}>
                Wardrobe
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {samplePropsWardrobe.props.map((item, idx) => (
                <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{item.name}</h4>
                  <p className={`text-sm mb-3 ${prefix}-text-secondary`}>{item.description}</p>
                  <div className={`text-xs ${prefix}-text-tertiary`}>
                    <div>Character: {item.character}</div>
                    <div>Scenes: {item.scenes.join(', ')}</div>
                    <div>Quantity: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-3">
            {[...samplePropsWardrobe.props, ...samplePropsWardrobe.wardrobe].map((item, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-4 flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-full ${prefix}-bg-accent flex items-center justify-center text-xl`}>
                  {idx < samplePropsWardrobe.props.length ? '📦' : '👗'}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold mb-1 ${prefix}-text-primary`}>{item.name}</h4>
                  <p className={`text-sm ${prefix}-text-secondary`}>{item.description}</p>
                </div>
                <div className={`text-right text-sm ${prefix}-text-secondary`}>
                  <div>{item.character}</div>
                  <div className={`text-xs ${prefix}-text-tertiary`}>Scenes: {item.scenes.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...samplePropsWardrobe.props, ...samplePropsWardrobe.wardrobe].map((item, idx) => (
              <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <div className="h-32 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl">
                  {idx < samplePropsWardrobe.props.length ? '📦' : '👗'}
                </div>
                <div className="p-4">
                  <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{item.name}</h4>
                  <p className={`text-sm mb-3 ${prefix}-text-secondary`}>{item.description}</p>
                  <div className={`text-xs ${prefix}-text-tertiary`}>
                    {item.character} • Scenes: {item.scenes.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 4:
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Item</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Category</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Character</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Scenes</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {[...samplePropsWardrobe.props.map(p => ({ ...p, category: 'Prop' })), ...samplePropsWardrobe.wardrobe.map(w => ({ ...w, category: 'Wardrobe' }))].map((item, idx) => (
                  <tr key={idx} className={`border-t ${prefix}-border`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{item.name}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.category}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.character}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.scenes.join(', ')}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-16">
      <section className="space-y-8">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
            Episode Pre-Production Page Designs
          </h2>
          <p className={`text-base mb-6 ${prefix}-text-secondary`}>
            Multiple layout concepts for the overall page structure, plus tab-specific design options for each of the 6 pre-production sections. Each tab showcases different content types with industry-standard patterns.
          </p>
        </div>

        {/* Overall Layout Selector */}
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              Overall Page Layout
            </h3>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Choose the overall structure that houses all tabs and navigation
            </p>
          </div>
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <div className="flex flex-wrap gap-2">
              {[
                { num: 1, label: 'Horizontal Tabs' },
                { num: 2, label: 'Sidebar Navigation' },
                { num: 3, label: 'Step Wizard' },
                { num: 4, label: 'Dashboard Grid' }
              ].map((layout) => (
                <button
                  key={layout.num}
                  onClick={() => setActiveLayout(layout.num)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLayout === layout.num
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Active Layout */}
        <div className="space-y-6">
          {renderLayoutConcept()}
        </div>

        {/* Tab-Specific Concept Selectors (shown when in a tab) */}
        {activeTab && activeTab !== null && (
          <div className="space-y-4 mt-8">
            <div className="mb-4">
              <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
                {tabs.find(t => t.id === activeTab)?.label} - Design Concepts
              </h3>
              <p className={`text-sm ${prefix}-text-secondary`}>
                Different layout approaches for this tab's content type
              </p>
            </div>
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: activeTab === 'breakdown' || activeTab === 'storyboards' || activeTab === 'shotlist' || activeTab === 'props' ? 4 : 3 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveConcept({ ...activeConcept, [activeTab]: idx + 1 })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeConcept[activeTab] === idx + 1
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                    }`}
                  >
                    Concept {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

