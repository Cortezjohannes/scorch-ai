'use client'

import React from 'react'

interface EpisodeDetailExamplesProps {
  theme: 'light' | 'dark'
}

export default function EpisodeDetailExamples({ theme }: EpisodeDetailExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const [activeConcept, setActiveConcept] = React.useState(1)
  const [tabbedActiveTab, setTabbedActiveTab] = React.useState('script')

  const sampleEpisode = {
    title: 'Diamond Cut, Diamond Kept',
    episodeNumber: 8,
    arcNumber: 1,
    synopsis: 'As LAUNCH faces mounting scrutiny and pressure to cash out of Greenlit AI, Jason and Molly must prove their convictions to their team, their partners, and themselves. A tense day of internal challenges, existential doubt, and ultimate resolve.',
    scenes: [
      {
        number: 1,
        title: 'The Pressure Mounts',
        setting: 'INT. LAUNCH OFFICES - MORNING',
        content: 'The LAUNCH conference room is tense. Jason Calacanis stands at the head of the table, facing down his partners. The morning light streams through floor-to-ceiling windows, casting long shadows across the polished mahogany.\n\nMOLLY\n(calm but firm)\nWe\'ve been here before. Every time we make a bold move, the doubters come out.\n\nJASON\n(running a hand through his hair)\nThis isn\'t just doubt, Molly. This is different. The market is questioning our judgment.\n\nThe room falls silent. Jason looks around at his team, seeing the weight of their collective decision.'
      },
      {
        number: 2,
        title: 'The Test',
        setting: 'EXT. SILICON VALLEY STREET - AFTERNOON',
        content: 'Jason walks alone through the streets of Palo Alto, phone buzzing with notifications. Each alert is another voice questioning LAUNCH\'s strategy. He stops at a coffee shop, watching entrepreneurs pitch their ideas to investors at nearby tables.\n\nHe remembers his own early days—the skepticism, the rejections, the moments when conviction was all he had. His phone rings. It\'s Molly.\n\nMOLLY (V.O.)\nWe need to make a statement. Not to them—to ourselves.\n\nJason looks at his reflection in the window, seeing the determination that\'s carried him this far.'
      },
      {
        number: 3,
        title: 'Diamond Hands',
        setting: 'INT. LAUNCH OFFICES - EVENING',
        content: 'Back in the conference room, the entire team has gathered. Jason stands before them, the setting sun painting the room in gold.\n\nJASON\n(raising his voice with conviction)\nWe didn\'t get here by following the crowd. We got here by seeing what others couldn\'t. Greenlit AI isn\'t just an investment—it\'s a bet on the future we believe in.\n\nMolly steps forward, joining him.\n\nMOLLY\nDiamond hands aren\'t about never selling. They\'re about holding when it matters most. This matters.\n\nThe team nods, one by one. The resolve is visible in their eyes.'
      }
    ],
    analysis: 'This episode serves as a crucial character moment for both Jason and Molly, establishing their partnership dynamic while exploring themes of conviction versus pragmatism. The three-act structure builds tension through internal conflict, external pressure, and ultimate resolution. The "diamond hands" metaphor becomes literalized through their decision to hold firm despite market pressure.'
  }

  const renderContent = () => {
    switch (activeConcept) {
      case 1:
        return renderScreenplayFormat()
      case 2:
        return renderNarrativeReader()
      case 3:
        return renderSplitPanel()
      case 4:
        return renderTabbedInterface()
      case 5:
        return renderStreamingStyle()
      default:
        return renderScreenplayFormat()
    }
  }

  const renderScreenplayFormat = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
          1. Traditional Screenplay Format
        </h3>
        <p className={`text-sm ${prefix}-text-secondary mb-1`}>
          Final Draft/WriterDuet style layout with industry-standard formatting. Monospaced font, proper indentation, and screenplay conventions.
        </p>
        <p className={`text-xs ${prefix}-text-tertiary`}>
          <strong>Best for:</strong> Professional script reading, industry-standard presentation, production teams
        </p>
      </div>

      <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
        <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
          <div className={`absolute inset-0 ${prefix}-bg-primary`}>
            {/* Header */}
            <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-xl font-bold ${prefix}-text-primary`}>{sampleEpisode.title}</h2>
                <div className={`text-sm ${prefix}-text-secondary`}>
                  Episode {sampleEpisode.episodeNumber} • Arc {sampleEpisode.arcNumber}
                </div>
              </div>
              <p className={`text-sm italic ${prefix}-text-secondary`}>"{sampleEpisode.synopsis}"</p>
            </div>

            {/* Screenplay Content */}
            <div className="p-8 overflow-y-auto" style={{ height: 'calc(100% - 120px)', fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}>
              {sampleEpisode.scenes.map((scene, idx) => (
                <div key={idx} className="mb-8">
                  <div className="mb-4">
                    <div className="uppercase font-bold mb-2" style={{ marginLeft: '0', marginRight: '0' }}>
                      {scene.setting}
                    </div>
                    <div className="mb-4" style={{ marginLeft: '0', marginRight: '0', textAlign: 'justify' }}>
                      {scene.content.split('\n\n').map((para, pIdx) => {
                        if (para.match(/^[A-Z][A-Z\s]+$/)) {
                          // Character name
                          return (
                            <div key={pIdx} className="mb-2" style={{ marginLeft: '3.7in', width: '2.5in' }}>
                              <div className="font-bold uppercase">{para}</div>
                            </div>
                          )
                        } else if (para.match(/^\([^)]+\)$/)) {
                          // Parenthetical
                          return (
                            <div key={pIdx} className="mb-1" style={{ marginLeft: '3.1in', width: '2in' }}>
                              <div className="italic">{para}</div>
                            </div>
                          )
                        } else if (para.includes(':')) {
                          // Dialogue
                          const [char, ...dialogue] = para.split(':')
                          return (
                            <div key={pIdx} className="mb-4">
                              <div className="font-bold uppercase mb-1" style={{ marginLeft: '3.7in', width: '2.5in' }}>
                                {char.trim()}
                              </div>
                              <div style={{ marginLeft: '2.5in', width: '3.5in', textAlign: 'justify' }}>
                                {dialogue.join(':').trim()}
                              </div>
                            </div>
                          )
                        } else {
                          // Action
                          return (
                            <div key={pIdx} className="mb-2" style={{ marginLeft: '0', marginRight: '0', textAlign: 'justify' }}>
                              {para}
                            </div>
                          )
                        }
                      })}
                    </div>
                  </div>
                  {idx < sampleEpisode.scenes.length - 1 && (
                    <div className="text-center my-6">
                      <span className={`text-xs ${prefix}-text-tertiary`}>FADE TO:</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNarrativeReader = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
          2. Enhanced Narrative Reader View
        </h3>
        <p className={`text-sm ${prefix}-text-secondary mb-1`}>
          Magazine/article-style layout with large, readable serif fonts. Collapsible scene sections with improved visual hierarchy and sidebar navigation.
        </p>
        <p className={`text-xs ${prefix}-text-tertiary`}>
          <strong>Best for:</strong> Casual reading, narrative-focused experience, general audience
        </p>
      </div>

      <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
        <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
          <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
            {/* Sidebar */}
            <div className={`w-64 border-r ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto`}>
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase ${prefix}-text-primary mb-4`}>Navigation</h3>
                <div className="space-y-2">
                  {sampleEpisode.scenes.map((scene, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        idx === 0 ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                      }`}
                    >
                      Scene {scene.number}: {scene.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`border-t ${prefix}-border pt-4`}>
                <h4 className={`text-xs font-bold uppercase ${prefix}-text-primary mb-2`}>Episode Info</h4>
                <div className={`text-xs space-y-1 ${prefix}-text-secondary`}>
                  <p><strong>Episode:</strong> {sampleEpisode.episodeNumber}/60</p>
                  <p><strong>Arc:</strong> {sampleEpisode.arcNumber}/6</p>
                  <p><strong>Scenes:</strong> {sampleEpisode.scenes.length}</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="mb-12 text-center">
                  <h1 className={`text-5xl font-bold mb-4 ${prefix}-text-primary`} style={{ fontFamily: 'Georgia, serif' }}>
                    {sampleEpisode.title}
                  </h1>
                  <div className={`flex justify-center gap-4 text-sm ${prefix}-text-secondary mb-6`}>
                    <span>Episode {sampleEpisode.episodeNumber}</span>
                    <span>•</span>
                    <span>Arc {sampleEpisode.arcNumber}</span>
                  </div>
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 mb-8`}>
                    <p className={`text-lg italic leading-relaxed ${prefix}-text-secondary`} style={{ fontFamily: 'Georgia, serif' }}>
                      "{sampleEpisode.synopsis}"
                    </p>
                  </div>
                </header>

                {/* Scenes */}
                <div className="space-y-12">
                  {sampleEpisode.scenes.map((scene, idx) => (
                    <article key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-8`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full ${prefix}-bg-accent flex items-center justify-center text-lg font-bold ${prefix}-text-accent`}>
                          {scene.number}
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold ${prefix}-text-primary mb-1`} style={{ fontFamily: 'Georgia, serif' }}>
                            {scene.title}
                          </h2>
                          <p className={`text-sm ${prefix}-text-tertiary`}>{scene.setting}</p>
                        </div>
                      </div>
                      <div className={`space-y-4 ${prefix}-text-secondary`} style={{ fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.8' }}>
                        {scene.content.split('\n\n').map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Analysis */}
                <div className={`mt-12 ${prefix}-card ${prefix}-border rounded-lg p-8`}>
                  <h2 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`} style={{ fontFamily: 'Georgia, serif' }}>
                    Episode Analysis
                  </h2>
                  <p className={`${prefix}-text-secondary leading-relaxed`} style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8' }}>
                    {sampleEpisode.analysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSplitPanel = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
          3. Split-Panel Master-Detail
        </h3>
        <p className={`text-sm ${prefix}-text-secondary mb-1`}>
          Left sidebar with scene list and summaries. Right panel shows full scene content. Click scene in sidebar to view details.
        </p>
        <p className={`text-xs ${prefix}-text-tertiary`}>
          <strong>Best for:</strong> Long episodes, easy navigation between scenes, production workflows
        </p>
      </div>

      <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
        <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
          <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
            {/* Left Sidebar - Scene List */}
            <div className={`w-80 border-r ${prefix}-border ${prefix}-bg-secondary overflow-y-auto`}>
              <div className="p-4 border-b ${prefix}-border">
                <h2 className={`text-lg font-bold ${prefix}-text-primary mb-1`}>{sampleEpisode.title}</h2>
                <p className={`text-xs ${prefix}-text-secondary`}>Episode {sampleEpisode.episodeNumber}</p>
              </div>
              <div className="p-4 space-y-3">
                {sampleEpisode.scenes.map((scene, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      idx === 0
                        ? `${prefix}-bg-accent ${prefix}-text-accent ${prefix}-border border-2`
                        : `${prefix}-card ${prefix}-border border hover:${prefix}-border-accent`
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? `${prefix}-text-accent` : `${prefix}-text-secondary`
                      }`} style={{ backgroundColor: idx === 0 ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                        {scene.number}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm ${idx === 0 ? `${prefix}-text-accent` : `${prefix}-text-primary`}`}>
                          {scene.title}
                        </h3>
                        <p className={`text-xs mt-1 ${prefix}-text-tertiary`}>{scene.setting}</p>
                      </div>
                    </div>
                    <p className={`text-xs line-clamp-2 mt-2 ${prefix}-text-secondary`}>
                      {scene.content.substring(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel - Scene Detail */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 max-w-4xl">
                {/* Selected Scene Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full ${prefix}-bg-accent flex items-center justify-center text-2xl font-bold ${prefix}-text-accent`}>
                      {sampleEpisode.scenes[0].number}
                    </div>
                    <div>
                      <h1 className={`text-3xl font-bold ${prefix}-text-primary mb-1`}>
                        {sampleEpisode.scenes[0].title}
                      </h1>
                      <p className={`text-sm ${prefix}-text-tertiary`}>{sampleEpisode.scenes[0].setting}</p>
                    </div>
                  </div>
                </div>

                {/* Scene Content */}
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-8 mb-8`}>
                  <div className={`space-y-6 ${prefix}-text-secondary`} style={{ lineHeight: '1.8' }}>
                    {sampleEpisode.scenes[0].content.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} className="text-base">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Episode Synopsis */}
                <div className={`${prefix}-card-secondary ${prefix}-border rounded-lg p-6 mb-8`}>
                  <h3 className={`text-sm font-bold uppercase mb-2 ${prefix}-text-primary`}>Episode Synopsis</h3>
                  <p className={`text-sm ${prefix}-text-secondary italic`}>"{sampleEpisode.synopsis}"</p>
                </div>

                {/* Analysis */}
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                  <h3 className={`text-lg font-bold mb-3 ${prefix}-text-primary`}>Episode Analysis</h3>
                  <p className={`text-sm ${prefix}-text-secondary leading-relaxed`}>
                    {sampleEpisode.analysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabbedInterface = () => {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            4. Tabbed Interface
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Multiple tabs for different content types: Script, Treatment, Analysis, and Metadata. Organized information with clear separation.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Multiple content types, organized information, comprehensive episode details
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
              {/* Header */}
              <div className={`border-b ${prefix}-border p-6 ${prefix}-bg-secondary`}>
                <h2 className={`text-2xl font-bold ${prefix}-text-primary mb-1`}>{sampleEpisode.title}</h2>
                <p className={`text-sm ${prefix}-text-secondary`}>Episode {sampleEpisode.episodeNumber} • Arc {sampleEpisode.arcNumber}</p>
              </div>

              {/* Tabs */}
              <div className={`border-b ${prefix}-border ${prefix}-bg-secondary flex`}>
                {[
                  { id: 'script', label: 'Script' },
                  { id: 'treatment', label: 'Treatment' },
                  { id: 'analysis', label: 'Analysis' },
                  { id: 'metadata', label: 'Metadata' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabbedActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      tabbedActiveTab === tab.id
                        ? `${prefix}-border-accent ${prefix}-text-accent`
                        : `${prefix}-border-transparent ${prefix}-text-secondary hover:${prefix}-text-primary`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">
                {tabbedActiveTab === 'script' && (
                <div className="max-w-4xl mx-auto">
                  <div style={{ fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}>
                    {sampleEpisode.scenes.map((scene, idx) => (
                      <div key={idx} className="mb-8">
                        <div className="uppercase font-bold mb-4">{scene.setting}</div>
                        <div className="space-y-4">
                          {scene.content.split('\n\n').map((para, pIdx) => (
                            <div key={pIdx} className="text-justify">{para}</div>
                          ))}
                        </div>
                        {idx < sampleEpisode.scenes.length - 1 && (
                          <div className="text-center my-6">
                            <span className={`text-xs ${prefix}-text-tertiary`}>FADE TO:</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
                {tabbedActiveTab === 'treatment' && (
                <div className="max-w-3xl mx-auto">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 mb-6`}>
                    <h3 className={`text-lg font-bold mb-3 ${prefix}-text-primary`}>Synopsis</h3>
                    <p className={`${prefix}-text-secondary italic`}>"{sampleEpisode.synopsis}"</p>
                  </div>
                  {sampleEpisode.scenes.map((scene, idx) => (
                    <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-6 mb-4`}>
                      <h3 className={`text-lg font-bold mb-2 ${prefix}-text-primary`}>
                        Scene {scene.number}: {scene.title}
                      </h3>
                      <p className={`text-sm ${prefix}-text-tertiary mb-3`}>{scene.setting}</p>
                      <p className={`${prefix}-text-secondary leading-relaxed`}>{scene.content}</p>
                    </div>
                  ))}
                </div>
              )}
                {tabbedActiveTab === 'analysis' && (
                <div className="max-w-3xl mx-auto">
                  <div className={`${prefix}-card ${prefix}-border rounded-lg p-8`}>
                    <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Episode Analysis</h3>
                    <p className={`${prefix}-text-secondary leading-relaxed mb-6`}>{sampleEpisode.analysis}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className={`${prefix}-card-secondary ${prefix}-border rounded-lg p-4`}>
                        <h4 className={`text-sm font-bold mb-2 ${prefix}-text-primary`}>Structure</h4>
                        <p className={`text-xs ${prefix}-text-secondary`}>Three-act structure with rising tension</p>
                      </div>
                      <div className={`${prefix}-card-secondary ${prefix}-border rounded-lg p-4`}>
                        <h4 className={`text-sm font-bold mb-2 ${prefix}-text-primary`}>Themes</h4>
                        <p className={`text-xs ${prefix}-text-secondary`}>Conviction, partnership, resilience</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                {tabbedActiveTab === 'metadata' && (
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-2 gap-6">
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                      <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Episode Info</h3>
                      <div className={`space-y-3 text-sm ${prefix}-text-secondary`}>
                        <div><strong className={prefix + '-text-primary'}>Number:</strong> {sampleEpisode.episodeNumber}/60</div>
                        <div><strong className={prefix + '-text-primary'}>Arc:</strong> {sampleEpisode.arcNumber}/6</div>
                        <div><strong className={prefix + '-text-primary'}>Scenes:</strong> {sampleEpisode.scenes.length}</div>
                        <div><strong className={prefix + '-text-primary'}>Status:</strong> Completed</div>
                      </div>
                    </div>
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                      <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Production Notes</h3>
                      <div className={`text-sm ${prefix}-text-secondary space-y-2`}>
                        <p>• Pre-production completed</p>
                        <p>• Casting finalized</p>
                        <p>• Location scouting in progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStreamingStyle = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
          5. Streaming Platform Style
        </h3>
        <p className={`text-sm ${prefix}-text-secondary mb-1`}>
          Hero banner, large episode title, scenes as cards/tiles. Play button aesthetic with modern, visual-first design.
        </p>
        <p className={`text-xs ${prefix}-text-tertiary`}>
          <strong>Best for:</strong> Modern, visual-first experience, consumer-facing presentation
        </p>
      </div>

      <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
        <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
          <div className={`absolute inset-0 ${prefix}-bg-primary overflow-y-auto`}>
            {/* Hero Banner */}
            <div className={`h-64 ${prefix}-bg-accent relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${prefix}-text-primary`}>
                    {sampleEpisode.title}
                  </h1>
                  <div className={`flex justify-center gap-4 text-sm ${prefix}-text-primary/80`}>
                    <span>Episode {sampleEpisode.episodeNumber}</span>
                    <span>•</span>
                    <span>Arc {sampleEpisode.arcNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-w-6xl mx-auto">
              {/* Synopsis Card */}
              <div className={`${prefix}-card ${prefix}-border rounded-xl p-6 mb-8`}>
                <p className={`text-lg ${prefix}-text-secondary italic`}>"{sampleEpisode.synopsis}"</p>
              </div>

              {/* Scenes Grid */}
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-6 ${prefix}-text-primary`}>Scenes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sampleEpisode.scenes.map((scene, idx) => (
                    <div
                      key={idx}
                      className={`${prefix}-card ${prefix}-border rounded-xl overflow-hidden hover:${prefix}-border-accent transition-all cursor-pointer group`}
                    >
                      <div className={`h-32 ${prefix}-bg-accent flex items-center justify-center`}>
                        <div className={`w-16 h-16 rounded-full ${prefix}-bg-primary flex items-center justify-center text-2xl font-bold ${prefix}-text-accent`}>
                          {scene.number}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className={`font-bold mb-2 ${prefix}-text-primary`}>{scene.title}</h3>
                        <p className={`text-xs ${prefix}-text-tertiary mb-3`}>{scene.setting}</p>
                        <p className={`text-sm line-clamp-3 ${prefix}-text-secondary`}>
                          {scene.content.substring(0, 150)}...
                        </p>
                        <button className={`mt-4 w-full py-2 ${prefix}-bg-accent ${prefix}-text-accent rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity`}>
                          View Scene
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Section */}
              <div className={`${prefix}-card ${prefix}-border rounded-xl p-8`}>
                <h2 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Episode Analysis</h2>
                <p className={`${prefix}-text-secondary leading-relaxed`}>{sampleEpisode.analysis}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-16">
      <section className="space-y-8">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
            Episode Detail Page Designs
          </h2>
          <p className={`text-base mb-6 ${prefix}-text-secondary`}>
            Five distinct design approaches for displaying episode content. Each concept organizes scenes, dialogue, and analysis differently to optimize for different use cases and audiences.
          </p>
        </div>

        {/* Concept Selector */}
        <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setActiveConcept(num)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeConcept === num
                    ? `${prefix}-bg-accent ${prefix}-text-accent`
                    : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                }`}
              >
                Concept {num}
              </button>
            ))}
          </div>
        </div>

        {/* Render Active Concept */}
        {renderContent()}
      </section>
    </div>
  )
}

