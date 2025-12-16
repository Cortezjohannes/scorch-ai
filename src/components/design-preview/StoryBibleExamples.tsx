'use client'

import React from 'react'

interface StoryBibleExamplesProps {
  theme: 'light' | 'dark'
}

export default function StoryBibleExamples({ theme }: StoryBibleExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-16">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Story Bible Page Redesign Concepts
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Four distinct layout approaches for organizing and navigating the 14+ story bible sections. Each concept addresses information architecture, discoverability, and user workflow differently.
        </p>
      </div>

      {/* Concept 1: Sidebar Navigation (Notion/GitBook Style) */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            1. Sidebar Navigation (Notion/GitBook Style)
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Hierarchical left sidebar with collapsible sections, full-width content area, and search functionality.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Power users, deep navigation, organized content structure, quick section switching
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Left Sidebar */}
            <div className={`absolute left-0 top-0 bottom-0 w-80 border-r ${prefix}-border ${prefix}-bg-secondary`}>
              {/* Search Bar */}
              <div className={`p-4 border-b ${prefix}-border`}>
                <div className={`relative ${prefix}-bg-primary rounded-lg border ${prefix}-border`}>
                  <input
                    type="text"
                    placeholder="Search story bible..."
                    className={`w-full px-4 py-2 pr-10 ${prefix}-bg-primary ${prefix}-text-primary focus:outline-none text-sm`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                </div>
              </div>

              {/* Navigation Tree */}
              <div className="p-2 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
                {/* Core Sections */}
                <div className="mb-4">
                  <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1`}>
                    Core
                  </div>
                  {[
                    { icon: '🎯', label: 'Premise', active: false },
                    { icon: '📖', label: 'Overview', active: false },
                    { icon: '👥', label: 'Characters', active: true, count: 12 },
                    { icon: '📚', label: 'Story Arcs', active: false, count: 6 },
                    { icon: '🌍', label: 'World', active: false }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 mb-1 ${
                        item.active 
                          ? `${prefix}-bg-accent ${prefix}-text-accent` 
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.count && (
                        <span className={`text-xs ${prefix}-text-tertiary`}>{item.count}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Branching */}
                <div className="mb-4">
                  <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1`}>
                    Branching
                  </div>
                  <div className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${prefix}-text-secondary hover:${prefix}-bg-primary`}>
                    <span className="text-sm">🔀</span>
                    <span className="text-sm font-medium">Choices</span>
                  </div>
                </div>

                {/* Technical (Collapsible) */}
                <div className="mb-4">
                  <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1 flex items-center justify-between cursor-pointer`}>
                    <span>Technical</span>
                    <span className="text-xs">▼</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    {[
                      { icon: '⚡', label: 'Tension' },
                      { icon: '🎯', label: 'Choice Architecture' },
                      { icon: '🌍', label: 'Living World' },
                      { icon: '📖', label: 'Trope Analysis' },
                      { icon: '🔗', label: 'Cohesion' },
                      { icon: '🗣️', label: 'Dialogue' },
                      { icon: '🎭', label: 'Genre' },
                      { icon: '🎯', label: 'Theme' }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 ${prefix}-text-tertiary hover:${prefix}-bg-primary hover:${prefix}-text-secondary`}
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="absolute left-80 top-0 right-0 bottom-0">
              {/* Header */}
              <div className={`h-20 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-6`}>
                <div>
                  <h1 className={`text-2xl font-bold ${prefix}-text-primary mb-1`}>The Shadow Chronicles</h1>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`${prefix}-text-secondary`}>📖 Story Bible</span>
                    <span className={`${prefix}-text-tertiary`}>/</span>
                    <span className={`${prefix}-text-secondary`}>👥 Characters</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    💾 Save
                  </button>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    🔗 Share
                  </button>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    ⋮
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`p-8 ${prefix}-bg-primary overflow-y-auto`} style={{ height: 'calc(100% - 80px)' }}>
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h2 className={`text-xl font-bold ${prefix}-text-primary mb-4`}>Main Characters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-lg font-bold text-[#10B981]">
                              {i === 1 ? 'JD' : i === 2 ? 'SM' : i === 3 ? 'EK' : 'AL'}
                            </div>
                            <div>
                              <div className={`font-semibold ${prefix}-text-primary`}>
                                {i === 1 ? 'John Doe' : i === 2 ? 'Sarah Miller' : i === 3 ? 'Elena Kova' : 'Alex Lee'}
                              </div>
                              <div className={`text-xs ${prefix}-text-tertiary`}>
                                {i === 1 ? 'Protagonist' : i === 2 ? 'Antagonist' : i === 3 ? 'Supporting' : 'Supporting'}
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm ${prefix}-text-secondary line-clamp-2`}>
                            A complex character with hidden motivations and a mysterious past that drives the narrative forward...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 2: Wiki-Style with Table of Contents */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            2. Wiki-Style with Table of Contents
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Horizontal tabs for main sections, right sidebar TOC for current section, scrollable content with anchor links.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Familiar wiki pattern, long-form content, easy section jumping, reference-style reading
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 h-24 border-b ${prefix}-border ${prefix}-bg-primary`}>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h1 className={`text-2xl font-bold ${prefix}-text-primary`}>The Shadow Chronicles</h1>
                  <div className="flex items-center gap-2">
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                      💾 Save
                    </button>
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                      🔗 Share
                    </button>
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                      ⋮
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={`absolute top-24 left-0 right-0 h-14 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center gap-1 px-6 overflow-x-auto`}>
              {[
                { icon: '🎯', label: 'Premise', active: false },
                { icon: '📖', label: 'Overview', active: false },
                { icon: '👥', label: 'Characters', active: true },
                { icon: '📚', label: 'Arcs', active: false },
                { icon: '🌍', label: 'World', active: false },
                { icon: '🔀', label: 'Choices', active: false },
                { icon: '⚙️', label: 'Advanced', active: false, badge: 8 }
              ].map((tab) => (
                <button
                  key={tab.label}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                    tab.active
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-xs ${prefix}-bg-primary ${prefix}-text-tertiary`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Main Layout */}
            <div className="absolute top-[152px] left-0 right-0 bottom-0 flex">
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 0px)' }}>
                <div className={`p-8 ${prefix}-bg-primary`}>
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                      <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-4`}>Characters</h2>
                      <p className={`text-base ${prefix}-text-secondary mb-6`}>
                        The main characters that drive the narrative forward, each with unique motivations and arcs.
                      </p>
                    </div>

                    {/* Character Sections */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} id={`character-${i}`} className={`p-6 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-2xl font-bold text-[#10B981]">
                            {i === 1 ? 'JD' : i === 2 ? 'SM' : 'EK'}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold ${prefix}-text-primary mb-1`}>
                              {i === 1 ? 'John Doe' : i === 2 ? 'Sarah Miller' : 'Elena Kova'}
                            </h3>
                            <p className={`text-sm ${prefix}-text-tertiary mb-3`}>
                              {i === 1 ? 'Protagonist' : i === 2 ? 'Antagonist' : 'Supporting Character'}
                            </p>
                            <p className={`text-sm ${prefix}-text-secondary`}>
                              A complex character with hidden motivations and a mysterious past that drives the narrative forward. Their journey represents the core themes of the series...
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Table of Contents */}
              <div className={`w-64 border-l ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto`}>
                <h3 className={`text-sm font-bold ${prefix}-text-primary mb-3`}>Table of Contents</h3>
                <div className="space-y-1">
                  {[
                    { label: 'Main Characters', active: true },
                    { label: 'John Doe', indent: true },
                    { label: 'Sarah Miller', indent: true },
                    { label: 'Elena Kova', indent: true },
                    { label: 'Supporting Characters', active: false },
                    { label: 'Minor Characters', active: false }
                  ].map((item, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className={`block px-2 py-1 rounded text-sm ${
                        item.active
                          ? `${prefix}-bg-accent ${prefix}-text-accent`
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      } ${item.indent ? 'pl-6' : ''}`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                <div className={`mt-6 pt-6 border-t ${prefix}-border`}>
                  <h3 className={`text-sm font-bold ${prefix}-text-primary mb-3`}>Quick Links</h3>
                  <div className="space-y-1">
                    {['Premise', 'Overview', 'Arcs', 'World'].map((link) => (
                      <a
                        key={link}
                        href="#"
                        className={`block px-2 py-1 rounded text-sm ${prefix}-text-secondary hover:${prefix}-bg-primary`}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 3: Dashboard-Style Grid Layout */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            3. Dashboard-Style Grid Layout
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Visual cards for each section with previews, click to expand full content in modal or slide-over.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Visual overview, quick scanning, seeing completion status, modern dashboard feel
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 h-20 border-b ${prefix}-border ${prefix}-bg-primary`}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${prefix}-text-primary mb-1`}>The Shadow Chronicles</h1>
                  <p className={`text-xs ${prefix}-text-secondary`}>Story Bible Overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    💾 Save
                  </button>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className={`absolute top-20 left-0 right-0 h-16 border-b ${prefix}-border ${prefix}-bg-secondary`}>
              <div className="px-6 py-3 flex items-center gap-6">
                <div>
                  <div className={`text-xs ${prefix}-text-tertiary mb-0.5`}>Characters</div>
                  <div className={`text-lg font-bold ${prefix}-text-primary`}>12</div>
                </div>
                <div>
                  <div className={`text-xs ${prefix}-text-tertiary mb-0.5`}>Arcs</div>
                  <div className={`text-lg font-bold ${prefix}-text-primary`}>6</div>
                </div>
                <div>
                  <div className={`text-xs ${prefix}-text-tertiary mb-0.5`}>Episodes</div>
                  <div className={`text-lg font-bold ${prefix}-text-primary`}>60</div>
                </div>
                <div>
                  <div className={`text-xs ${prefix}-text-tertiary mb-0.5`}>Completion</div>
                  <div className={`text-lg font-bold ${prefix}-text-primary`}>85%</div>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className={`absolute top-36 left-0 right-0 bottom-0 p-6 ${prefix}-bg-primary overflow-y-auto`}>
              <div className="max-w-7xl mx-auto">
                <h2 className={`text-lg font-bold ${prefix}-text-primary mb-4`}>Core Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: '🎯', title: 'Premise', desc: 'Core concept and story foundation', status: 'complete', color: 'green' },
                    { icon: '📖', title: 'Overview', desc: 'Series summary and key themes', status: 'complete', color: 'green' },
                    { icon: '👥', title: 'Characters', desc: '12 main and supporting characters', status: 'complete', color: 'green' },
                    { icon: '📚', title: 'Story Arcs', desc: '6 narrative arcs with episode breakdown', status: 'in-progress', color: 'yellow' },
                    { icon: '🌍', title: 'World', desc: 'World-building and setting details', status: 'complete', color: 'green' },
                    { icon: '🔀', title: 'Choices', desc: 'Branching narrative paths', status: 'draft', color: 'gray' }
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${prefix}-card ${prefix}-border cursor-pointer hover:${prefix}-border-accent transition-all ${prefix}-shadow-sm hover:${prefix}-shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{card.icon}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          card.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                          card.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {card.status === 'complete' ? '✓' : card.status === 'in-progress' ? '⋯' : '○'}
                        </span>
                      </div>
                      <h3 className={`text-lg font-bold ${prefix}-text-primary mb-1`}>{card.title}</h3>
                      <p className={`text-sm ${prefix}-text-secondary`}>{card.desc}</p>
                    </div>
                  ))}
                </div>

                <h2 className={`text-lg font-bold ${prefix}-text-primary mb-4`}>Technical Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: '⚡', title: 'Tension' },
                    { icon: '🎯', title: 'Choice Arch' },
                    { icon: '🌍', title: 'Living World' },
                    { icon: '📖', title: 'Trope' },
                    { icon: '🔗', title: 'Cohesion' },
                    { icon: '🗣️', title: 'Dialogue' },
                    { icon: '🎭', title: 'Genre' },
                    { icon: '🎯', title: 'Theme' }
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${prefix}-card ${prefix}-border cursor-pointer hover:${prefix}-border-accent transition-all`}
                    >
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <h4 className={`text-sm font-medium ${prefix}-text-primary`}>{card.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 4: Split-Panel Master-Detail */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            4. Split-Panel Master-Detail
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Left panel with scrollable list of all sections, right panel shows selected section content. Always-visible navigation.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Reference-style usage, efficient space usage, always-visible navigation, quick section switching
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Top Header */}
            <div className={`absolute top-0 left-0 right-0 h-16 border-b ${prefix}-border ${prefix}-bg-primary`}>
              <div className="px-6 py-3 flex items-center justify-between">
                <h1 className={`text-xl font-bold ${prefix}-text-primary`}>The Shadow Chronicles</h1>
                <div className="flex items-center gap-2">
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    💾 Save
                  </button>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>

            {/* Split Layout */}
            <div className="absolute top-16 left-0 right-0 bottom-0 flex">
              {/* Left Panel - Master List */}
              <div className={`w-80 border-r ${prefix}-border ${prefix}-bg-secondary`}>
                {/* Search */}
                <div className={`p-3 border-b ${prefix}-border`}>
                  <input
                    type="text"
                    placeholder="Filter sections..."
                    className={`w-full px-3 py-2 rounded-lg ${prefix}-bg-primary ${prefix}-border border ${prefix}-text-primary text-sm focus:outline-none`}
                  />
                </div>

                {/* Section List */}
                <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                  {/* Core */}
                  <div className="p-2">
                    <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1`}>
                      Core
                    </div>
                    {[
                      { icon: '🎯', label: 'Premise', active: false },
                      { icon: '📖', label: 'Overview', active: false },
                      { icon: '👥', label: 'Characters', active: true, count: 12 },
                      { icon: '📚', label: 'Story Arcs', active: false, count: 6 },
                      { icon: '🌍', label: 'World', active: false }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 mb-1 ${
                          item.active
                            ? `${prefix}-bg-accent ${prefix}-text-accent`
                            : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {item.count && (
                          <span className={`text-xs px-2 py-0.5 rounded ${prefix}-bg-primary ${prefix}-text-tertiary`}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Branching */}
                  <div className="p-2">
                    <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1`}>
                      Branching
                    </div>
                    <div className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${prefix}-text-secondary hover:${prefix}-bg-primary`}>
                      <span className="text-lg">🔀</span>
                      <span className="text-sm font-medium">Choices</span>
                    </div>
                  </div>

                  {/* Technical */}
                  <div className="p-2">
                    <div className={`px-3 py-2 text-xs font-bold ${prefix}-text-tertiary uppercase mb-1`}>
                      Technical
                    </div>
                    {[
                      { icon: '⚡', label: 'Tension' },
                      { icon: '🎯', label: 'Choice Architecture' },
                      { icon: '🌍', label: 'Living World' },
                      { icon: '📖', label: 'Trope Analysis' },
                      { icon: '🔗', label: 'Cohesion' },
                      { icon: '🗣️', label: 'Dialogue' },
                      { icon: '🎭', label: 'Genre' },
                      { icon: '🎯', label: 'Theme' }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 mb-1 ${prefix}-text-tertiary hover:${prefix}-bg-primary hover:${prefix}-text-secondary`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Detail Content */}
              <div className="flex-1 overflow-y-auto">
                <div className={`p-8 ${prefix}-bg-primary`}>
                  <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <div className={`flex items-center gap-2 text-sm mb-6 ${prefix}-text-secondary`}>
                      <span>📖 Story Bible</span>
                      <span>/</span>
                      <span className={`${prefix}-text-primary`}>Characters</span>
                    </div>

                    {/* Content */}
                    <div>
                      <h2 className={`text-3xl font-bold ${prefix}-text-primary mb-2`}>Characters</h2>
                      <p className={`text-base ${prefix}-text-secondary mb-8`}>
                        The main characters that drive the narrative forward, each with unique motivations and character arcs.
                      </p>

                      {/* Character Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`p-5 rounded-lg ${prefix}-card ${prefix}-border`}>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981]">
                                {i === 1 ? 'JD' : i === 2 ? 'SM' : i === 3 ? 'EK' : 'AL'}
                              </div>
                              <div>
                                <h3 className={`text-lg font-bold ${prefix}-text-primary`}>
                                  {i === 1 ? 'John Doe' : i === 2 ? 'Sarah Miller' : i === 3 ? 'Elena Kova' : 'Alex Lee'}
                                </h3>
                                <p className={`text-xs ${prefix}-text-tertiary`}>
                                  {i === 1 ? 'Protagonist' : i === 2 ? 'Antagonist' : 'Supporting'}
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm ${prefix}-text-secondary line-clamp-3`}>
                              A complex character with hidden motivations and a mysterious past that drives the narrative forward...
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Character Detail Modal Design Options */}
      <section className="space-y-8">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
            Character Detail Modal Designs
          </h2>
          <p className={`text-base mb-6 ${prefix}-text-secondary`}>
            Four distinct design approaches for the character detail modal that opens when clicking a character card. Each concept organizes the 3D character data (Physiology, Sociology, Psychology) differently.
          </p>
        </div>

        {/* Concept 1: Tabbed Modal Design */}
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              1. Tabbed Modal Design
            </h3>
            <p className={`text-sm ${prefix}-text-secondary mb-1`}>
              Tab navigation to switch between Physiology, Sociology, and Psychology. Clean, focused view showing one dimension at a time.
            </p>
            <p className={`text-xs ${prefix}-text-tertiary`}>
              <strong>Best for:</strong> Detailed reading, focused editing, reducing visual clutter, step-by-step character review
            </p>
          </div>
          
          <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
            <div className="relative" style={{ height: '800px', overflow: 'hidden' }}>
              {/* Modal Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                {/* Modal Container */}
                <div className={`absolute inset-4 md:inset-8 lg:inset-16 ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                        JC
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-2xl font-bold ${prefix}-text-primary truncate`}>Jason Calacanis</h2>
                        <p className={`${prefix}-text-secondary text-sm`}>The Maverick Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm`}>
                        🗑️ Delete
                      </button>
                      <button className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary`}>
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className={`flex border-b ${prefix}-border ${prefix}-bg-secondary`}>
                    {['Physiology', 'Sociology', 'Psychology'].map((tab, idx) => (
                      <button
                        key={tab}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                          idx === 0
                            ? `${prefix}-border-accent ${prefix}-text-accent`
                            : `${prefix}-border-transparent ${prefix}-text-secondary hover:${prefix}-text-primary`
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div>
                        <h3 className={`text-xl font-semibold ${prefix}-text-primary mb-4`}>Physiology</h3>
                        <div className="space-y-4">
                          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                            <div className="flex items-center justify-between mb-2">
                              <strong className={`${prefix}-text-primary`}>Age:</strong>
                              <button className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent text-xs`}>✏️</button>
                            </div>
                            <p className={`${prefix}-text-secondary`}>52</p>
                          </div>
                          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                            <div className="flex items-center justify-between mb-2">
                              <strong className={`${prefix}-text-primary`}>Gender:</strong>
                              <button className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent text-xs`}>✏️</button>
                            </div>
                            <p className={`${prefix}-text-secondary`}>Male</p>
                          </div>
                          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                            <div className="flex items-center justify-between mb-2">
                              <strong className={`${prefix}-text-primary`}>Appearance:</strong>
                              <button className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent text-xs`}>✏️</button>
                            </div>
                            <p className={`${prefix}-text-secondary text-sm`}>
                              Stands around 5'11", with the solid, slightly stocky build of a former brawler who now spends his time in Aeron chairs. A perpetual 5 o'clock shadow clings to a jaw that's often clenched. His dark hair is kept short, more for efficiency than style.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept 2: Accordion/Collapsible Modal Design */}
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              2. Accordion/Collapsible Modal Design
            </h3>
            <p className={`text-sm ${prefix}-text-secondary mb-1`}>
              Three large collapsible sections that can be expanded/collapsed independently. All sections can be open simultaneously for comprehensive view.
            </p>
            <p className={`text-xs ${prefix}-text-tertiary`}>
              <strong>Best for:</strong> Quick scanning, comparing dimensions, flexible viewing, actors who need to reference multiple sections
            </p>
          </div>
          
          <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
            <div className="relative" style={{ height: '800px', overflow: 'hidden' }}>
              {/* Modal Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                {/* Modal Container */}
                <div className={`absolute inset-4 md:inset-8 lg:inset-16 ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                        JC
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-2xl font-bold ${prefix}-text-primary truncate`}>Jason Calacanis</h2>
                        <p className={`${prefix}-text-secondary text-sm`}>The Maverick Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm`}>
                        🗑️ Delete
                      </button>
                      <button className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary`}>
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-4">
                      {/* Physiology Accordion */}
                      <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                        <button className={`w-full px-6 py-4 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-tertiary transition-colors`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏃</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Physiology</h3>
                          </div>
                          <span className={`${prefix}-text-tertiary`}>▼</span>
                        </button>
                        <div className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Age:</strong>
                              <p className={`${prefix}-text-secondary`}>52</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Gender:</strong>
                              <p className={`${prefix}-text-secondary`}>Male</p>
                            </div>
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary text-sm`}>Appearance:</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              Stands around 5'11", with the solid, slightly stocky build of a former brawler who now spends his time in Aeron chairs...
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sociology Accordion */}
                      <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                        <button className={`w-full px-6 py-4 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-tertiary transition-colors`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏛️</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Sociology</h3>
                          </div>
                          <span className={`${prefix}-text-tertiary`}>▶</span>
                        </button>
                      </div>

                      {/* Psychology Accordion */}
                      <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                        <button className={`w-full px-6 py-4 flex items-center justify-between ${prefix}-bg-secondary hover:${prefix}-bg-tertiary transition-colors`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🧠</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Psychology</h3>
                          </div>
                          <span className={`${prefix}-text-tertiary`}>▶</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept 3: Grid Cards Modal Design */}
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              3. Grid Cards Modal Design
            </h3>
            <p className={`text-sm ${prefix}-text-secondary mb-1`}>
              Three equal-width cards displayed side-by-side (or stacked on mobile). All dimensions visible simultaneously with distinct visual styling.
            </p>
            <p className={`text-xs ${prefix}-text-tertiary`}>
              <strong>Best for:</strong> Comprehensive overview, comparing dimensions at a glance, visual organization, quick reference
            </p>
          </div>
          
          <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
            <div className="relative" style={{ height: '800px', overflow: 'hidden' }}>
              {/* Modal Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                {/* Modal Container */}
                <div className={`absolute inset-4 md:inset-8 lg:inset-16 ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                        JC
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-2xl font-bold ${prefix}-text-primary truncate`}>Jason Calacanis</h2>
                        <p className={`${prefix}-text-secondary text-sm`}>The Maverick Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm`}>
                        🗑️ Delete
                      </button>
                      <button className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary`}>
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Grid Cards Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Physiology Card */}
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-5 border-l-4 border-green-400`}>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏃</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Physiology</h3>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className={`${prefix}-text-primary`}>Age:</strong>
                              <p className={`${prefix}-text-secondary`}>52</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary`}>Gender:</strong>
                              <p className={`${prefix}-text-secondary`}>Male</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary`}>Appearance:</strong>
                              <p className={`${prefix}-text-secondary text-xs mt-1`}>
                                Stands around 5'11", with the solid, slightly stocky build of a former brawler...
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sociology Card */}
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-5 border-l-4 border-blue-400`}>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏛️</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Sociology</h3>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className={`${prefix}-text-primary`}>Class:</strong>
                              <p className={`${prefix}-text-secondary`}>New Money</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary`}>Occupation:</strong>
                              <p className={`${prefix}-text-secondary`}>Angel Investor, VC, Podcaster</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary`}>Education:</strong>
                              <p className={`${prefix}-text-secondary`}>Fordham University</p>
                            </div>
                          </div>
                        </div>

                        {/* Psychology Card */}
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-5 border-l-4 border-purple-400`}>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🧠</span>
                            <h3 className={`text-lg font-semibold ${prefix}-text-primary`}>Psychology</h3>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div>
                              <strong className={`${prefix}-text-primary`}>Core Value:</strong>
                              <p className={`${prefix}-text-secondary text-xs`}>
                                Conviction in the Operator. He believes that relentless, visionary founders are everything...
                              </p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary`}>Moral Standpoint:</strong>
                              <p className={`${prefix}-text-secondary text-xs`}>
                                Pragmatic Utilitarianism. He believes the ends justify the means...
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept 4: Single Column Stacked Design */}
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              4. Single Column Stacked Design
            </h3>
            <p className={`text-sm ${prefix}-text-secondary mb-1`}>
              Vertical flow with clear section headers. Each dimension (Physiology, Sociology, Psychology) as a distinct block with generous spacing.
            </p>
            <p className={`text-xs ${prefix}-text-tertiary`}>
              <strong>Best for:</strong> Reading flow, print-friendly, mobile-first, clean minimal aesthetic, easy scanning
            </p>
          </div>
          
          <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
            <div className="relative" style={{ height: '800px', overflow: 'hidden' }}>
              {/* Modal Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                {/* Modal Container */}
                <div className={`absolute inset-4 md:inset-8 lg:inset-16 ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
                  {/* Header */}
                  <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                        JC
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-2xl font-bold ${prefix}-text-primary truncate`}>Jason Calacanis</h2>
                        <p className={`${prefix}-text-secondary text-sm`}>The Maverick Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm`}>
                        🗑️ Delete
                      </button>
                      <button className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary`}>
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Stacked Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-8">
                      {/* Physiology Section */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🏃</span>
                          <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>Physiology</h3>
                        </div>
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 space-y-4`}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Age:</strong>
                              <p className={`${prefix}-text-secondary`}>52</p>
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Gender:</strong>
                              <p className={`${prefix}-text-secondary`}>Male</p>
                            </div>
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary text-sm`}>Appearance:</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-2`}>
                              Stands around 5'11", with the solid, slightly stocky build of a former brawler who now spends his time in Aeron chairs. A perpetual 5 o'clock shadow clings to a jaw that's often clenched. His dark hair is kept short, more for efficiency than style. His eyes are sharp and intelligent but carry the weary, restless energy of someone who hasn't had a full night's sleep in a decade.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sociology Section */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🏛️</span>
                          <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>Sociology</h3>
                        </div>
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 space-y-4`}>
                          <div>
                            <strong className={`${prefix}-text-primary text-sm`}>Class:</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              New Money. Grew up working-class in Bay Ridge, Brooklyn. He's fiercely proud of his scrappy origins and despises the inherited privilege and Ivy League pedigrees of his Sand Hill Road rivals.
                            </p>
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary text-sm`}>Occupation:</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              Angel Investor, Venture Capitalist, Podcaster (The All-In Podcast). He's a media personality as much as a VC, using his platform to build deal flow, shape narratives, and wage public wars against his competitors.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Psychology Section */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🧠</span>
                          <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>Psychology</h3>
                        </div>
                        <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 space-y-4`}>
                          <div className={`${prefix}-card-secondary rounded-lg p-4 border-l-4 border-green-400`}>
                            <strong className={`${prefix}-text-primary text-sm`}>Core Value:</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              Conviction in the Operator. He believes that relentless, visionary founders (the 'jockeys') are everything, and that the idea, the market, and the spreadsheet are all secondary.
                            </p>
                          </div>
                          <div className={`${prefix}-card-secondary rounded-lg p-4 border-l-4 border-blue-400`}>
                            <strong className={`${prefix}-text-primary text-sm`}>WANT (External Goal):</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              To go 'all-in' on Greenlit AI, lead the round, and build the definitive venture fund for the AI-driven creator economy, cementing his legacy as a visionary investor.
                            </p>
                          </div>
                          <div className={`${prefix}-card-secondary rounded-lg p-4 border-l-4 border-purple-400`}>
                            <strong className={`${prefix}-text-primary text-sm`}>NEED (Internal Lesson):</strong>
                            <p className={`${prefix}-text-secondary text-sm mt-1`}>
                              To recognize that his obsession with being the 'kingmaker' has blinded him to the human cost of his ambition, and that true legacy comes from empowering others, not controlling them.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

