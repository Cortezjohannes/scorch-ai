'use client'

import React from 'react'

interface GenerationSuiteExamplesProps {
  theme: 'light' | 'dark'
}

export default function GenerationSuiteExamples({ theme }: GenerationSuiteExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-16">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Episode Generation Suite Concepts
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Four distinct interface approaches for the episode generation modal. Each concept offers different workflows and creative control levels.
        </p>
      </div>

      {/* Concept 1: Split-Panel Studio */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            1. Split-Panel Studio
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Three-panel layout with dedicated spaces for controls, editing, and preview. Optimized for creative workflow.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Full creative control, beat sheet editing, visual preview of episode structure
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Full-screen modal overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
              {/* Modal Container */}
              <div className={`absolute inset-4 ${prefix}-card ${prefix}-border border rounded-xl overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-6`}>
                  <div>
                    <h1 className={`text-lg font-bold ${prefix}-text-primary`}>Episode 5: The Discovery</h1>
                    <p className={`text-xs ${prefix}-text-secondary`}>Arc 1 • Episode 5 of 10</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <button className={`px-3 py-1 rounded text-xs font-medium ${prefix}-bg-accent ${prefix}-text-accent`}>Quick</button>
                      <button className={`px-3 py-1 rounded text-xs font-medium ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>Advanced</button>
                      <button className={`px-3 py-1 rounded text-xs font-medium ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>YOLO</button>
                    </div>
                    <button className={`text-xl ${prefix}-text-secondary hover:${prefix}-text-primary`}>×</button>
                  </div>
                </div>

                {/* Three-Panel Layout */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Panel: Episode Info & Quick Actions (20%) */}
                  <div className={`w-64 border-r ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto`}>
                    <div className="mb-4">
                      <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Episode Context</h3>
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border mb-2`}>
                        <div className={`text-xs ${prefix}-text-secondary mb-1`}>Arc</div>
                        <div className={`text-sm font-medium ${prefix}-text-primary`}>The Beginning</div>
                      </div>
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs ${prefix}-text-secondary mb-1`}>Characters</div>
                        <div className="flex gap-1 mt-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xs font-bold text-[#10B981]">JD</div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xs font-bold text-[#10B981]">SM</div>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xs font-bold text-[#10B981]">+2</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Quick Actions</h3>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary mb-2`}>
                        Use Previous Episode Context
                      </button>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
                        Load Template
                      </button>
                    </div>
                  </div>

                  {/* Center Panel: Creative Controls (50%) */}
                  <div className={`flex-1 ${prefix}-bg-primary p-6 overflow-y-auto`}>
                    <div className="max-w-2xl mx-auto space-y-6">
                      {/* Episode Goal */}
                      <div>
                        <label className={`text-sm font-semibold ${prefix}-text-primary mb-2 block`}>
                          Episode Goal
                        </label>
                        <textarea
                          className={`w-full h-24 p-3 rounded-lg ${prefix}-card ${prefix}-border resize-none ${prefix}-text-primary`}
                          placeholder="What should this episode accomplish? What character development or plot points need to happen?"
                          defaultValue="The team discovers a hidden facility that changes everything they thought they knew about the project."
                        />
                        <div className={`text-xs mt-1 ${prefix}-text-tertiary`}>142 characters</div>
                      </div>

                      {/* Vibe Settings */}
                      <div>
                        <label className={`text-sm font-semibold ${prefix}-text-primary mb-3 block`}>
                          Vibe Settings
                        </label>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className={`text-xs ${prefix}-text-secondary`}>Tone</span>
                              <span className={`text-xs ${prefix}-text-accent`}>Dark/Gritty</span>
                            </div>
                            <div className="relative">
                              <div className={`h-2 rounded-full ${prefix}-bg-secondary`}>
                                <div className="h-full w-[35%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"></div>
                              </div>
                              <div className="absolute top-0 left-[35%] w-4 h-4 bg-[#10B981] rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1"></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className={`text-xs ${prefix}-text-tertiary`}>Dark</span>
                              <span className={`text-xs ${prefix}-text-tertiary`}>Light</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className={`text-xs ${prefix}-text-secondary`}>Pacing</span>
                              <span className={`text-xs ${prefix}-text-accent`}>Balanced</span>
                            </div>
                            <div className="relative">
                              <div className={`h-2 rounded-full ${prefix}-bg-secondary`}>
                                <div className="h-full w-[50%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"></div>
                              </div>
                              <div className="absolute top-0 left-[50%] w-4 h-4 bg-[#10B981] rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1"></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className={`text-xs ${prefix}-text-tertiary`}>Slow Burn</span>
                              <span className={`text-xs ${prefix}-text-tertiary`}>High Octane</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Beat Sheet */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`text-sm font-semibold ${prefix}-text-primary`}>
                            Beat Sheet
                          </label>
                          <button className={`text-xs ${prefix}-text-accent hover:underline`}>Auto-Generate</button>
                        </div>
                        <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border min-h-[200px] ${prefix}-text-secondary text-sm`}>
                          <div className="space-y-2">
                            <div>1. Opening: Team arrives at facility</div>
                            <div>2. Discovery: Hidden documents reveal truth</div>
                            <div>3. Conflict: Internal debate about next steps</div>
                            <div>4. Climax: Decision to investigate further</div>
                            <div>5. Resolution: New plan formed</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button className={`flex-1 px-6 py-3 rounded-lg font-bold ${prefix}-btn-primary`}>
                          Generate Episode
                        </button>
                        <button className={`px-6 py-3 rounded-lg border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
                          Save Draft
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Live Preview (30%) */}
                  <div className={`w-80 border-l ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto`}>
                    <h3 className={`text-sm font-semibold ${prefix}-text-primary mb-3`}>Episode Preview</h3>
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs font-semibold ${prefix}-text-primary mb-1`}>Scene 1</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>INT. FACILITY - DAY</div>
                      </div>
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs font-semibold ${prefix}-text-primary mb-1`}>Scene 2</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>INT. OFFICE - DAY</div>
                      </div>
                      <div className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs font-semibold ${prefix}-text-primary mb-1`}>Scene 3</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>EXT. FACILITY - NIGHT</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#36393f]">
                      <div className={`text-xs ${prefix}-text-secondary mb-2`}>Progress</div>
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full ${prefix}-bg-secondary`}>
                          <div className="h-full w-[45%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"></div>
                        </div>
                        <span className={`text-xs ${prefix}-text-accent`}>45%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 2: Timeline-Based Generator */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            2. Timeline-Based Generator
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            DAW-inspired interface with horizontal timeline showing story beats. Visual progress tracking.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Visual thinkers, beat-by-beat editing, understanding episode structure at a glance
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
              <div className={`absolute inset-4 ${prefix}-card ${prefix}-border border rounded-xl overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-6`}>
                  <div>
                    <h1 className={`text-lg font-bold ${prefix}-text-primary`}>Episode 5: The Discovery</h1>
                    <p className={`text-xs ${prefix}-text-secondary`}>Timeline View</p>
                  </div>
                  <button className={`text-xl ${prefix}-text-secondary hover:${prefix}-text-primary`}>×</button>
                </div>

                {/* Timeline Interface */}
                <div className={`flex-1 ${prefix}-bg-primary p-6 overflow-y-auto`}>
                  <div className="max-w-5xl mx-auto space-y-6">
                    {/* Episode Goal Bar */}
                    <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
                      <label className={`text-sm font-semibold ${prefix}-text-primary mb-2 block`}>
                        Episode Goal
                      </label>
                      <input
                        type="text"
                        className={`w-full p-2 rounded ${prefix}-bg-secondary ${prefix}-border border ${prefix}-text-primary`}
                        defaultValue="The team discovers a hidden facility..."
                      />
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-semibold ${prefix}-text-primary`}>Story Beats Timeline</h3>
                        <button className={`text-xs ${prefix}-text-accent hover:underline`}>Auto-Generate Beats</button>
                      </div>
                      
                      {/* Timeline Track */}
                      <div className={`relative ${prefix}-bg-secondary rounded-lg p-4`} style={{ height: '400px' }}>
                        {/* Time markers */}
                        <div className="absolute top-0 left-0 right-0 h-8 border-b border-[#36393f] flex">
                          {[0, 15, 30, 45, 60].map((min) => (
                            <div key={min} className="flex-1 border-r border-[#36393f] flex items-center justify-center">
                              <span className={`text-xs ${prefix}-text-tertiary`}>{min}m</span>
                            </div>
                          ))}
                        </div>

                        {/* Beat Blocks */}
                        <div className="mt-8 space-y-3">
                          {[
                            { start: 0, end: 15, label: 'Opening: Arrival', color: '#10B981' },
                            { start: 15, end: 30, label: 'Discovery: Hidden Docs', color: '#059669' },
                            { start: 30, end: 45, label: 'Conflict: Internal Debate', color: '#10B981' },
                            { start: 45, end: 60, label: 'Resolution: New Plan', color: '#059669' }
                          ].map((beat, idx) => (
                            <div key={idx} className="relative" style={{ marginLeft: `${(beat.start / 60) * 100}%`, width: `${((beat.end - beat.start) / 60) * 100}%` }}>
                              <div
                                className="h-16 rounded-lg border-2 border-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: beat.color }}
                              >
                                <span className="text-white text-xs font-medium text-center px-2">{beat.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3">
                      <button className={`flex-1 px-6 py-3 rounded-lg font-bold ${prefix}-btn-primary`}>
                        Generate from Timeline
                      </button>
                      <button className={`px-6 py-3 rounded-lg border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
                        Export Timeline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 3: Card-Based Workflow */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            3. Card-Based Workflow
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Step-by-step cards that expand and collapse. Mobile-friendly vertical flow.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Guided workflows, mobile users, clear step progression
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
              <div className={`absolute inset-4 ${prefix}-card ${prefix}-border border rounded-xl overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-6`}>
                  <div>
                    <h1 className={`text-lg font-bold ${prefix}-text-primary`}>Episode 5: The Discovery</h1>
                    <p className={`text-xs ${prefix}-text-secondary`}>Step 2 of 4</p>
                  </div>
                  <button className={`text-xl ${prefix}-text-secondary hover:${prefix}-text-primary`}>×</button>
                </div>

                {/* Card Flow */}
                <div className={`flex-1 ${prefix}-bg-primary p-6 overflow-y-auto`}>
                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Card 1: Episode Goal - Completed */}
                    <div className={`p-5 rounded-lg ${prefix}-card ${prefix}-border border-2 border-[#10B981]`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-sm">✓</div>
                          <h3 className={`text-base font-semibold ${prefix}-text-primary`}>1. Episode Goal</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${prefix}-bg-accent ${prefix}-text-accent`}>Complete</span>
                      </div>
                      <p className={`text-sm ${prefix}-text-secondary`}>The team discovers a hidden facility...</p>
                    </div>

                    {/* Card 2: Vibe Settings - Active */}
                    <div className={`p-5 rounded-lg ${prefix}-card ${prefix}-border border-2 border-[#10B981]`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-bold text-sm">2</div>
                          <h3 className={`text-base font-semibold ${prefix}-text-primary`}>2. Vibe Settings</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${prefix}-bg-accent ${prefix}-text-accent`}>Active</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs ${prefix}-text-secondary`}>Tone</span>
                            <span className={`text-xs ${prefix}-text-accent`}>Dark</span>
                          </div>
                          <div className={`h-2 rounded-full ${prefix}-bg-secondary`}>
                            <div className="h-full w-[35%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs ${prefix}-text-secondary`}>Pacing</span>
                            <span className={`text-xs ${prefix}-text-accent`}>Balanced</span>
                          </div>
                          <div className={`h-2 rounded-full ${prefix}-bg-secondary`}>
                            <div className="h-full w-[50%] bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Beat Sheet - Pending */}
                    <div className={`p-5 rounded-lg ${prefix}-card ${prefix}-border opacity-60`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-[#36393f] flex items-center justify-center font-bold text-sm">3</div>
                          <h3 className={`text-base font-semibold ${prefix}-text-primary`}>3. Beat Sheet</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${prefix}-bg-secondary ${prefix}-text-secondary`}>Pending</span>
                      </div>
                      <p className={`text-sm ${prefix}-text-secondary`}>Will be generated automatically...</p>
                    </div>

                    {/* Card 4: Generate - Pending */}
                    <div className={`p-5 rounded-lg ${prefix}-card ${prefix}-border opacity-60`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-[#36393f] flex items-center justify-center font-bold text-sm">4</div>
                          <h3 className={`text-base font-semibold ${prefix}-text-primary`}>4. Generate Episode</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${prefix}-bg-secondary ${prefix}-text-secondary`}>Locked</span>
                      </div>
                      <p className={`text-sm ${prefix}-text-secondary`}>Complete previous steps to unlock...</p>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 pt-4">
                      <button className={`flex-1 px-6 py-3 rounded-lg font-bold ${prefix}-btn-primary`}>
                        Continue to Beat Sheet
                      </button>
                      <button className={`px-6 py-3 rounded-lg border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
                        Save Progress
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept 4: Command Palette Style */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            4. Command Palette Style
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Minimal, distraction-free interface. Focus on episode goal with expandable advanced options.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Quick generation, minimal UI, keyboard-focused workflows
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
              <div className={`absolute inset-4 ${prefix}-card ${prefix}-border border rounded-xl overflow-hidden flex flex-col`}>
                {/* Minimal Header */}
                <div className={`h-12 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-6`}>
                  <span className={`text-sm font-medium ${prefix}-text-primary`}>Episode 5: The Discovery</span>
                  <button className={`text-lg ${prefix}-text-secondary hover:${prefix}-text-primary`}>×</button>
                </div>

                {/* Centered Content */}
                <div className={`flex-1 ${prefix}-bg-primary flex items-center justify-center p-12`}>
                  <div className="w-full max-w-2xl space-y-6">
                    {/* Episode Goal - Focus */}
                    <div>
                      <label className={`text-sm font-medium ${prefix}-text-secondary mb-2 block`}>
                        What should this episode accomplish?
                      </label>
                      <textarea
                        className={`w-full h-32 p-4 rounded-lg ${prefix}-card ${prefix}-border resize-none ${prefix}-text-primary text-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]`}
                        placeholder="Describe the episode goal, character development, or plot points..."
                        defaultValue="The team discovers a hidden facility that changes everything they thought they knew about the project."
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className={`text-xs ${prefix}-text-tertiary`}>142 characters</div>
                        <button className={`text-xs ${prefix}-text-accent hover:underline`}>Use AI Suggestions</button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                      <button className={`flex-1 px-6 py-4 rounded-lg font-bold text-lg ${prefix}-btn-primary`}>
                        Generate Episode
                      </button>
                      <button className={`px-6 py-4 rounded-lg border ${prefix}-border ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
                        YOLO Mode
                      </button>
                    </div>

                    {/* Advanced Options - Collapsed */}
                    <div className={`border-t ${prefix}-border pt-4`}>
                      <button className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary flex items-center gap-2`}>
                        <span>▼</span>
                        <span>Advanced Options</span>
                      </button>
                      <div className={`mt-3 p-4 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary text-sm`}>
                        Vibe settings, beat sheet editor, and director's notes available when expanded
                      </div>
                    </div>

                    {/* Keyboard Shortcuts Hint */}
                    <div className={`text-center text-xs ${prefix}-text-tertiary`}>
                      Press <kbd className={`px-2 py-1 rounded ${prefix}-bg-secondary`}>Enter</kbd> to generate, <kbd className={`px-2 py-1 rounded ${prefix}-bg-secondary`}>Esc</kbd> to close
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="space-y-4">
        <h3 className={`text-2xl font-bold ${prefix}-text-primary`}>
          Generation Suite Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
            <h4 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Split-Panel</h4>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Full creative control</li>
              <li>• Live preview</li>
              <li>• Best for advanced users</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
            <h4 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Timeline</h4>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Visual beat editing</li>
              <li>• DAW-inspired</li>
              <li>• Structure-focused</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
            <h4 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Card-Based</h4>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Guided workflow</li>
              <li>• Mobile-friendly</li>
              <li>• Step-by-step</li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
            <h4 className={`text-sm font-semibold ${prefix}-text-primary mb-2`}>Command Palette</h4>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Minimal UI</li>
              <li>• Quick generation</li>
              <li>• Keyboard-focused</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

