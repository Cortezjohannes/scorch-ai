'use client'

import React, { useState } from 'react'

interface InvestorMaterialsExamplesProps {
  theme: 'light' | 'dark'
}

export default function InvestorMaterialsExamples({ theme }: InvestorMaterialsExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-16">
      {/* Introduction */}
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Investor Materials Viewing Page - Design Concepts
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Comprehensive design exploration for the investor materials viewing experience. 
          Six overall page layout approaches and three design variants for each of the 11 content sections.
          Each concept addresses different user needs, content presentation styles, and visual aesthetics.
        </p>
      </div>

      {/* PART 1: OVERALL PAGE LAYOUT VARIANTS */}
      <div>
        <h2 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>
          Part 1: Overall Page Layout Variants
        </h2>
        <p className={`text-sm mb-8 ${prefix}-text-secondary`}>
          Six distinct approaches to organizing and navigating the investor materials package.
        </p>
      </div>

      {/* Layout Variant 1: Fixed Sidebar Navigation */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            1. Fixed Sidebar Navigation (Current Implementation)
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Traditional sidebar with section navigation, main content scrolls independently.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Desktop viewing, easy section jumping, quick navigation between sections
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Fixed Sidebar */}
            <div className={`absolute left-0 top-0 bottom-0 w-64 border-r ${prefix}-border ${prefix}-bg-secondary`}>
              <div className="p-6">
                <h3 className={`text-lg font-bold mb-6 ${prefix}-text-primary`}>
                  Investing Is Us
                </h3>
                <nav className="space-y-2">
                  {[
                    { icon: '🎯', label: 'Overview', active: true },
                    { icon: '📖', label: 'The Journey', active: false },
                    { icon: '🎬', label: 'Pilot Script', active: false },
                    { icon: '🎨', label: 'Visual Proof', active: false },
                    { icon: '👥', label: 'Characters', active: false },
                    { icon: '🧠', label: 'The Depth', active: false },
                    { icon: '🎭', label: 'Key Scenes', active: false },
                    { icon: '🎥', label: 'Production', active: false },
                    { icon: '📊', label: 'Marketing', active: false },
                    { icon: '🎪', label: 'Character Depth', active: false },
                    { icon: '🚀', label: 'Get Involved', active: false }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                        item.active 
                          ? `${prefix}-bg-accent ${prefix}-text-accent` 
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="absolute left-64 top-0 right-0 bottom-0 overflow-y-auto">
              <div className={`p-12 ${prefix}-bg-primary`}>
                <div className="max-w-4xl mx-auto">
                  <h1 className={`text-5xl font-bold mb-4 ${prefix}-text-primary`}>
                    Investing Is Us: The Sequoia Story
                  </h1>
                  <p className={`text-2xl mb-6 ${prefix}-text-secondary`}>
                    When a bold VC firm bets on the impossible, they discover the real investment is in themselves.
                  </p>
                  <div className="flex gap-4 mb-8">
                    <span className={`px-4 py-2 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent text-sm font-medium`}>
                      Business Drama
                    </span>
                    <span className={`px-4 py-2 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary text-sm`}>
                      Conviction vs. Consensus
                    </span>
                  </div>
                  <p className={`text-lg leading-relaxed ${prefix}-text-secondary`}>
                    This is the story of a venture capital firm's first fund. The wins. The near-misses. 
                    The late-night Slack threads. The vision that changed everything.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Variant 2: Top Navigation with Sticky Header */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            2. Top Navigation with Sticky Header
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Horizontal navigation bar that sticks to top, hero section takes full viewport.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Wide content, professional presentations, full-width hero impact
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Sticky Header */}
            <div className={`absolute top-0 left-0 right-0 h-16 border-b ${prefix}-border ${prefix}-bg-primary z-10`}>
              <div className="flex items-center justify-between px-8 h-full">
                <div className={`text-lg font-bold ${prefix}-text-primary`}>Investing Is Us</div>
                <nav className="flex gap-1 overflow-x-auto">
                  {['Overview', 'Journey', 'Pilot', 'Visuals', 'Characters', 'Depth', 'Scenes', 'Production', 'Marketing', 'CTA'].map((item, idx) => (
                    <button
                      key={item}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                        idx === 0
                          ? `${prefix}-bg-accent ${prefix}-text-accent`
                          : `${prefix}-text-secondary hover:${prefix}-bg-secondary`
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Hero Section */}
            <div className={`absolute top-16 left-0 right-0 bottom-0 ${prefix}-bg-primary overflow-y-auto`}>
              <div className="min-h-full flex items-center justify-center p-12">
                <div className="max-w-5xl mx-auto text-center">
                  <h1 className={`text-6xl font-bold mb-6 ${prefix}-text-primary`}>
                    Investing Is Us
                  </h1>
                  <p className={`text-3xl mb-8 ${prefix}-text-secondary`}>
                    The Sequoia Story
                  </p>
                  <p className={`text-xl mb-8 ${prefix}-text-secondary max-w-3xl mx-auto`}>
                    When a bold VC firm bets on the impossible, they discover the real investment is in themselves.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <span className={`px-6 py-3 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent font-medium`}>
                      Business Drama
                    </span>
                    <span className={`px-6 py-3 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary`}>
                      Conviction vs. Consensus
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Variant 3: Presentation/Slide Mode */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            3. Presentation/Slide Mode
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            One section per viewport, advance with arrows or scroll, full-screen focus.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Linear storytelling, guided experience, presentation-style viewing
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            {/* Navigation Arrows */}
            <button className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full ${prefix}-bg-primary border ${prefix}-border flex items-center justify-center ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
              ←
            </button>
            <button className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full ${prefix}-bg-primary border ${prefix}-border flex items-center justify-center ${prefix}-text-secondary hover:${prefix}-bg-secondary`}>
              →
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                <div
                  key={num}
                  className={`w-2 h-2 rounded-full ${
                    num === 1 ? `${prefix}-bg-accent` : `${prefix}-bg-secondary opacity-30`
                  }`}
                />
              ))}
            </div>

            {/* Full-Screen Section */}
            <div className={`absolute inset-0 ${prefix}-bg-primary flex items-center justify-center`}>
              <div className="max-w-4xl mx-auto text-center px-12">
                <h1 className={`text-7xl font-bold mb-8 ${prefix}-text-primary`}>
                  Investing Is Us
                </h1>
                <p className={`text-4xl mb-12 ${prefix}-text-secondary`}>
                  The Sequoia Story
                </p>
                <p className={`text-2xl ${prefix}-text-secondary`}>
                  When a bold VC firm bets on the impossible...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Variant 4: Magazine/Editorial Layout */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            4. Magazine/Editorial Layout
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Long-form scrolling with magazine-style layouts, generous whitespace, pull quotes.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Immersive reading, detailed content, editorial aesthetic
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary`}>
              {/* Hero Image Area */}
              <div className={`h-96 ${prefix}-bg-secondary relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className={`text-6xl font-bold mb-4 ${prefix}-text-primary`}>
                      Investing Is Us
                    </h1>
                    <p className={`text-2xl ${prefix}-text-secondary`}>
                      The Sequoia Story
                    </p>
                  </div>
                </div>
              </div>

              {/* Editorial Content */}
              <div className="max-w-4xl mx-auto px-12 py-16">
                <div className="grid grid-cols-3 gap-8 mb-12">
                  <div className="col-span-2">
                    <p className={`text-2xl font-serif leading-relaxed mb-6 ${prefix}-text-primary`}>
                      When a bold venture capital firm bets on the impossible, they discover the real investment is in themselves.
                    </p>
                    <p className={`text-lg leading-relaxed ${prefix}-text-secondary`}>
                      This is the story of a venture capital firm's first fund. The wins. The near-misses. 
                      The late-night Slack threads. The vision that changed everything.
                    </p>
                  </div>
                  <div className={`p-6 border-l-4 ${prefix}-border-accent ${prefix}-bg-accent/10`}>
                    <p className={`text-sm font-semibold mb-2 ${prefix}-text-accent`}>GENRE</p>
                    <p className={`text-lg ${prefix}-text-primary`}>Business Drama</p>
                    <p className={`text-sm font-semibold mt-4 mb-2 ${prefix}-text-accent`}>THEME</p>
                    <p className={`text-lg ${prefix}-text-primary`}>Conviction vs. Consensus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Variant 5: Dashboard/Grid Overview */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            5. Dashboard/Grid Overview
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Landing page with cards for each section, click to expand in modal.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Quick scanning, non-linear exploration, overview-first approach
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              {/* Header */}
              <div className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className={`text-5xl font-bold mb-4 ${prefix}-text-primary`}>
                  Investing Is Us: The Sequoia Story
                </h1>
                <p className={`text-xl ${prefix}-text-secondary mb-8`}>
                  Comprehensive investor materials package
                </p>
                <button className={`px-8 py-4 rounded-lg font-bold ${prefix}-btn-primary`}>
                  Download Full Package
                </button>
              </div>

              {/* Grid of Section Cards */}
              <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
                {[
                  { icon: '🎯', title: 'Overview', desc: 'Series concept and logline', stats: '1 section' },
                  { icon: '📖', title: 'The Journey', desc: '8-episode arc breakdown', stats: '8 episodes' },
                  { icon: '🎬', title: 'Pilot Script', desc: 'Full Episode 1 script', stats: '8 pages' },
                  { icon: '🎨', title: 'Visual Proof', desc: 'Storyboard frames', stats: '5 frames' },
                  { icon: '👥', title: 'Characters', desc: 'Main character profiles', stats: '4 characters' },
                  { icon: '🧠', title: 'The Depth', desc: 'Theme, stakes, world', stats: '3 sections' },
                  { icon: '🎭', title: 'Key Scenes', desc: 'Pivotal moments', stats: '4 scenes' },
                  { icon: '🎥', title: 'Production', desc: 'Budget, locations, props', stats: '4 categories' },
                  { icon: '📊', title: 'Marketing', desc: 'Strategy and positioning', stats: 'Complete' }
                ].map((card) => (
                  <div
                    key={card.title}
                    className={`p-6 rounded-xl cursor-pointer ${prefix}-card hover:${prefix}-shadow-lg transition-all`}
                  >
                    <div className={`text-4xl mb-4`}>{card.icon}</div>
                    <h3 className={`text-lg font-bold mb-2 ${prefix}-text-primary`}>{card.title}</h3>
                    <p className={`text-sm mb-3 ${prefix}-text-secondary`}>{card.desc}</p>
                    <p className={`text-xs ${prefix}-text-tertiary`}>{card.stats}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Variant 6: Split-Screen Exploration */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            6. Split-Screen Exploration
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Left side TOC, right side content with preview panes, 40/60 split.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Compare and reference, power users, multi-section viewing
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className="flex h-full">
              {/* Left TOC (40%) */}
              <div className={`w-2/5 border-r ${prefix}-border ${prefix}-bg-secondary overflow-y-auto`}>
                <div className="p-6">
                  <h3 className={`text-lg font-bold mb-6 ${prefix}-text-primary`}>Table of Contents</h3>
                  <div className="space-y-1">
                    {[
                      { icon: '🎯', label: 'Overview', active: true, children: [] },
                      { icon: '📖', label: 'The Journey', active: false, children: ['Episodes 1-8'] },
                      { icon: '🎬', label: 'Pilot Script', active: false, children: ['Full Script', 'Scene Breakdown'] },
                      { icon: '🎨', label: 'Visual Proof', active: false, children: ['Storyboards', 'Reference Images'] },
                      { icon: '👥', label: 'Characters', active: false, children: ['Main Characters', 'Relationships'] }
                    ].map((item) => (
                      <div key={item.label}>
                        <div
                          className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                            item.active 
                              ? `${prefix}-bg-accent ${prefix}-text-accent` 
                              : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                        </div>
                        {item.children && item.children.length > 0 && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <div
                                key={child}
                                className={`p-2 rounded text-sm ${prefix}-text-tertiary hover:${prefix}-bg-primary`}
                              >
                                {child}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content (60%) */}
              <div className={`flex-1 overflow-y-auto ${prefix}-bg-primary`}>
                <div className="p-12 max-w-4xl">
                  <h1 className={`text-5xl font-bold mb-4 ${prefix}-text-primary`}>
                    Investing Is Us: The Sequoia Story
                  </h1>
                  <p className={`text-2xl mb-6 ${prefix}-text-secondary`}>
                    When a bold VC firm bets on the impossible, they discover the real investment is in themselves.
                  </p>
                  <div className="flex gap-4 mb-8">
                    <span className={`px-4 py-2 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent text-sm font-medium`}>
                      Business Drama
                    </span>
                    <span className={`px-4 py-2 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary text-sm`}>
                      Conviction vs. Consensus
                    </span>
                  </div>
                  <p className={`text-lg leading-relaxed ${prefix}-text-secondary`}>
                    This is the story of a venture capital firm's first fund. The wins. The near-misses. 
                    The late-night Slack threads. The vision that changed everything.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PART 2: SECTION DESIGN VARIANTS */}
      <div className="mt-16">
        <h2 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>
          Part 2: Section Design Variants
        </h2>
        <p className={`text-sm mb-8 ${prefix}-text-secondary`}>
          Three design approaches for each of the 11 content sections.
        </p>
      </div>

      {/* Section 1: Hook/Overview - Variant A */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 1: Hook/Overview - Variant A: Hero Billboard
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Full-width gradient background, large serif title, centered layout, tagline beneath.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 bg-gradient-to-br from-[#10B981]/20 via-[#059669]/10 to-transparent flex items-center justify-center`}>
              <div className="text-center max-w-4xl px-12">
                <h1 className={`text-7xl font-serif font-bold mb-6 ${prefix}-text-primary`}>
                  Investing Is Us
                </h1>
                <p className={`text-3xl font-light mb-8 ${prefix}-text-secondary`}>
                  The Sequoia Story
                </p>
                <p className={`text-xl mb-8 ${prefix}-text-secondary`}>
                  When a bold VC firm bets on the impossible, they discover the real investment is in themselves.
                </p>
                <div className="flex gap-4 justify-center">
                  <span className={`px-6 py-3 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent font-medium`}>
                    Business Drama
                  </span>
                  <span className={`px-6 py-3 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary`}>
                    Conviction vs. Consensus
                  </span>
                </div>
                <div className="mt-12 animate-bounce">
                  <span className={`text-2xl ${prefix}-text-tertiary`}>↓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Hook/Overview - Variant B */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 1: Hook/Overview - Variant B: Split Introduction
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Left: Title and metadata. Right: Synopsis in elegant typography. Vertical divider.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
              <div className="w-1/2 p-12 flex flex-col justify-center border-r ${prefix}-border">
                <h1 className={`text-5xl font-bold mb-4 ${prefix}-text-primary`}>
                  Investing Is Us
                </h1>
                <p className={`text-2xl mb-8 ${prefix}-text-secondary`}>
                  The Sequoia Story
                </p>
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary uppercase`}>Genre</p>
                    <p className={`text-lg ${prefix}-text-primary`}>Business Drama</p>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary uppercase`}>Theme</p>
                    <p className={`text-lg ${prefix}-text-primary`}>Conviction vs. Consensus</p>
                  </div>
                </div>
              </div>
              <div className="w-1/2 p-12 flex flex-col justify-center">
                <p className={`text-xl leading-relaxed font-serif ${prefix}-text-secondary`}>
                  This is the story of a venture capital firm's first fund. The wins. The near-misses. 
                  The late-night Slack threads. The vision that changed everything.
                </p>
                <p className={`text-lg mt-6 leading-relaxed ${prefix}-text-secondary`}>
                  When a bold VC firm bets on the impossible, they discover the real investment is in themselves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Hook/Overview - Variant C */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 1: Hook/Overview - Variant C: Video-Style Poster
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Large background image with overlay gradient, title treatment like movie poster, key info in corner cards.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-secondary`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(16, 185, 129, 0.1) 10px, rgba(16, 185, 129, 0.1) 20px)'
              }} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-4xl px-12 relative z-10">
                <h1 className={`text-8xl font-bold mb-4 ${prefix}-text-primary drop-shadow-2xl`} style={{
                  textShadow: '0 0 40px rgba(0,0,0,0.8)',
                  letterSpacing: '0.05em'
                }}>
                  INVESTING IS US
                </h1>
                <p className={`text-3xl mb-8 ${prefix}-text-primary drop-shadow-lg`}>
                  THE SEQUOIA STORY
                </p>
              </div>
            </div>
            {/* Corner Info Cards */}
            <div className={`absolute top-6 right-6 ${prefix}-bg-primary/90 backdrop-blur-sm p-4 rounded-lg border ${prefix}-border`}>
              <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary`}>GENRE</p>
              <p className={`text-sm font-bold ${prefix}-text-primary`}>Business Drama</p>
            </div>
            <div className={`absolute bottom-6 left-6 ${prefix}-bg-primary/90 backdrop-blur-sm p-4 rounded-lg border ${prefix}-border`}>
              <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary`}>THEME</p>
              <p className={`text-sm font-bold ${prefix}-text-primary`}>Conviction vs. Consensus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Journey - Variant A: Vertical Timeline */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 2: Journey - Variant A: Vertical Timeline
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Left-aligned timeline with dots, episode cards expand on click, connecting lines between episodes.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-12`}>
              <div className="max-w-3xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>The Journey: Arc 1</h2>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((ep) => (
                    <div key={ep} className="relative pl-12">
                      <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${prefix}-bg-accent border-2 ${prefix}-border-primary`} />
                      {ep < 4 && (
                        <div className={`absolute left-1.5 top-6 w-0.5 h-16 ${prefix}-bg-border`} />
                      )}
                      <div className={`p-6 rounded-xl ${prefix}-card cursor-pointer hover:${prefix}-shadow-lg transition-all`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-semibold ${prefix}-text-accent`}>Episode {ep}</span>
                          <span className={`text-xs ${prefix}-text-tertiary`}>~8 min</span>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
                          Episode {ep} Title
                        </h3>
                        <p className={`text-sm ${prefix}-text-secondary`}>
                          Episode summary and key moments that drive the narrative forward...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Journey - Variant B: Horizontal Roadmap */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 2: Journey - Variant B: Horizontal Roadmap
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Episodes as stations on a journey, left-to-right progression, icons for each episode.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '400px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary p-12`}>
              <div className="h-full flex items-center">
                <div className="w-full relative">
                  {/* Connecting Line */}
                  <div className={`absolute top-12 left-0 right-0 h-1 ${prefix}-bg-border`} />
                  {/* Episode Stations */}
                  <div className="flex justify-between relative">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((ep) => (
                      <div key={ep} className="flex flex-col items-center cursor-pointer group">
                        <div className={`w-24 h-24 rounded-full ${prefix}-bg-accent border-4 ${prefix}-border-primary flex items-center justify-center text-2xl font-bold ${prefix}-text-accent mb-3 group-hover:scale-110 transition-transform`}>
                          {ep}
                        </div>
                        <p className={`text-xs font-medium text-center ${prefix}-text-secondary`}>
                          Ep {ep}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Journey - Variant C: Grid Gallery */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 2: Journey - Variant C: Grid Gallery
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            2x4 grid of episode cards, cover images or color-coded, flip animation on hover.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>The Journey: 8 Episodes</h2>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((ep) => (
                    <div
                      key={ep}
                      className={`aspect-[3/4] rounded-xl ${prefix}-card cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group`}
                      style={{ background: `linear-gradient(135deg, rgba(16, 185, 129, ${0.1 + ep * 0.05}), rgba(5, 150, 105, ${0.1 + ep * 0.05}))` }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className={`text-4xl font-bold mb-2 ${prefix}-text-accent`}>{ep}</div>
                        <p className={`text-xs text-center ${prefix}-text-secondary`}>
                          Episode {ep}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pilot Script - Variant A: Document Viewer */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 3: Pilot Script - Variant A: Document Viewer
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            PDF-like presentation, scene headings styled, monospace font for dialogue, page/scene counter.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
              {/* Toolbar */}
              <div className={`h-12 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center justify-between px-6`}>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${prefix}-text-secondary`}>Scene 1 of 5</span>
                  <span className={`text-sm ${prefix}-text-tertiary`}>Page 1 of 8</span>
                </div>
                <div className="flex gap-2">
                  <button className={`px-3 py-1 rounded text-sm ${prefix}-btn-secondary`}>Zoom -</button>
                  <button className={`px-3 py-1 rounded text-sm ${prefix}-btn-secondary`}>Zoom +</button>
                  <button className={`px-3 py-1 rounded text-sm ${prefix}-btn-secondary`}>Fullscreen</button>
                </div>
              </div>
              {/* Script Content */}
              <div className={`flex-1 overflow-y-auto p-12 ${prefix}-bg-primary`}>
                <div className="max-w-3xl mx-auto font-mono text-sm">
                  <div className={`mb-8 ${prefix}-text-primary`}>
                    <p className="font-bold text-lg mb-4">FADE IN:</p>
                    <p className="mb-4"><strong>INT. CONFERENCE ROOM - DAY</strong></p>
                    <p className="mb-4">
                      SARAH CHEN (42), managing partner, sits at the head of a long table. 
                      Her phone buzzes. She glances at it, then back at the presentation.
                    </p>
                    <p className="mb-4 text-center">
                      <strong>SARAH</strong><br/>
                      When did you pull out?
                    </p>
                    <p className="mb-4">
                      The room goes silent. All eyes on Sarah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pilot Script - Variant B: Screenplay Format */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 3: Pilot Script - Variant B: Screenplay Format
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Industry-standard formatting, action in caps, dialogue centered, scene numbers in margins.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-12`}>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-12 gap-4">
                  {/* Scene Number Column */}
                  <div className="col-span-1">
                    <div className={`text-right text-sm font-bold ${prefix}-text-tertiary`}>1</div>
                  </div>
                  {/* Script Content Column */}
                  <div className="col-span-11">
                    <p className={`font-bold text-lg mb-4 ${prefix}-text-primary`}>FADE IN:</p>
                    <p className={`font-bold mb-6 ${prefix}-text-primary`}>INT. CONFERENCE ROOM - DAY</p>
                    <p className={`mb-4 uppercase ${prefix}-text-primary`}>
                      Sarah Chen (42), managing partner, sits at the head of a long table. 
                      Her phone buzzes. She glances at it.
                    </p>
                    <div className="text-center mb-6">
                      <p className={`font-bold mb-2 ${prefix}-text-primary`}>SARAH</p>
                      <p className={`${prefix}-text-secondary`}>When did you pull out?</p>
                    </div>
                    <p className={`mb-4 uppercase ${prefix}-text-primary`}>
                      The room goes silent. All eyes on Sarah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pilot Script - Variant C: Reader-Friendly */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 3: Pilot Script - Variant C: Reader-Friendly
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Novel-style formatting, serif font for dialogue, scene breaks with icons, sidebar with scene list.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
              {/* Sidebar */}
              <div className={`w-48 border-r ${prefix}-border ${prefix}-bg-secondary p-6 overflow-y-auto`}>
                <h3 className={`text-sm font-bold mb-4 ${prefix}-text-primary`}>Scenes</h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div
                      key={num}
                      className={`p-2 rounded cursor-pointer ${num === 1 ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-text-secondary hover:${prefix}-bg-primary`}`}
                    >
                      Scene {num}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-2xl">🎬</span>
                    <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>Scene 1</h2>
                  </div>
                  <div className={`font-serif text-lg leading-relaxed ${prefix}-text-secondary space-y-6`}>
                    <p>
                      Sarah Chen sits at the head of a long conference table. Her phone buzzes. 
                      She glances at it, then back at the presentation.
                    </p>
                    <p className="text-center italic">
                      "When did you pull out?"
                    </p>
                    <p>
                      The room goes silent. All eyes turn to Sarah.
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className={`mt-12 h-1 ${prefix}-bg-border rounded-full`}>
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: '12.5%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Visual Proof - Variant A: Gallery Grid */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 4: Visual Proof - Variant A: Gallery Grid
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Masonry layout, lightbox on click, shot details on hover, filter by scene.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-6xl mx-auto">
                <h2 className={`text-3xl font-bold mb-6 ${prefix}-text-primary`}>Storyboard Gallery</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((frame) => (
                    <div
                      key={frame}
                      className={`aspect-video ${prefix}-bg-secondary rounded-xl cursor-pointer hover:scale-105 transition-transform relative group overflow-hidden`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl ${prefix}-text-tertiary`}>🎨</span>
                      </div>
                      <div className={`absolute bottom-0 left-0 right-0 p-4 ${prefix}-bg-primary/90 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform`}>
                        <p className={`text-sm font-semibold ${prefix}-text-primary`}>Scene {frame}, Shot 1</p>
                        <p className={`text-xs ${prefix}-text-secondary`}>Wide shot, conference room</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Visual Proof - Variant B: Filmstrip Scroll */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 4: Visual Proof - Variant B: Filmstrip Scroll
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Horizontal scroll, sequential presentation, scene/shot labels below, dialogue snippets as captions.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary`}>
              <div className="h-full overflow-x-auto overflow-y-hidden">
                <div className="flex h-full">
                  {[1, 2, 3, 4, 5].map((frame) => (
                    <div key={frame} className="flex-shrink-0 w-80 h-full p-4">
                      <div className={`h-3/4 ${prefix}-bg-secondary rounded-xl mb-4 flex items-center justify-center`}>
                        <span className={`text-6xl ${prefix}-text-tertiary`}>🎨</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold mb-1 ${prefix}-text-primary`}>
                          Scene {frame} • Shot 1
                        </p>
                        <p className={`text-xs mb-2 ${prefix}-text-secondary`}>
                          Wide shot, conference room
                        </p>
                        <p className={`text-xs italic ${prefix}-text-tertiary`}>
                          "When did you pull out?"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Visual Proof - Variant C: Scene Breakdown */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 4: Visual Proof - Variant C: Scene Breakdown
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Organized by scene, each scene expandable, shots presented in sequence, technical details beside images.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto space-y-6">
                {[1, 2].map((scene) => (
                  <div key={scene} className={`${prefix}-card rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${prefix}-text-primary`}>Scene {scene}</h3>
                      <button className={`text-sm ${prefix}-text-accent`}>Expand</button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((shot) => (
                        <div key={shot} className={`aspect-video ${prefix}-bg-secondary rounded-lg flex items-center justify-center`}>
                          <span className={`text-3xl ${prefix}-text-tertiary`}>🎨</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Characters - Variant A: Profile Cards */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 5: Characters - Variant A: Profile Cards
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Card layout with portraits, expandable for full bio, relationship lines connect cards.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-6xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>Main Characters</h2>
                <div className="grid grid-cols-2 gap-6">
                  {['Sarah Chen', 'Marcus Thompson', 'Jordan Patel'].map((name, idx) => (
                    <div key={name} className={`${prefix}-card rounded-xl p-6 cursor-pointer hover:${prefix}-shadow-lg transition-all`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-20 h-20 rounded-full ${prefix}-bg-accent flex items-center justify-center text-2xl font-bold ${prefix}-text-accent`}>
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-1 ${prefix}-text-primary`}>{name}</h3>
                          <p className={`text-sm ${prefix}-text-tertiary`}>
                            {idx === 0 ? 'Managing Partner' : idx === 1 ? 'Partner' : 'Associate'}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm ${prefix}-text-secondary mb-4`}>
                        A complex character with hidden motivations and a mysterious past that drives the narrative forward.
                      </p>
                      <button className={`text-sm ${prefix}-text-accent`}>View Full Profile →</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Characters - Variant B: Character Dossier */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 5: Characters - Variant B: Character Dossier
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            One character per screen section, left: Portrait and stats, right: Bio and relationships, tabs for different info.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto">
                <div className={`${prefix}-card rounded-xl p-8`}>
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left: Portrait & Stats */}
                    <div>
                      <div className={`w-32 h-32 rounded-full ${prefix}-bg-accent flex items-center justify-center text-4xl font-bold ${prefix}-text-accent mx-auto mb-6`}>
                        SC
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary uppercase`}>Role</p>
                          <p className={`text-lg ${prefix}-text-primary`}>Managing Partner</p>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary uppercase`}>Age</p>
                          <p className={`text-lg ${prefix}-text-primary`}>42</p>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold mb-1 ${prefix}-text-tertiary uppercase`}>Background</p>
                          <p className={`text-sm ${prefix}-text-secondary`}>Former founder, exited for $200M</p>
                        </div>
                      </div>
                    </div>
                    {/* Right: Bio & Relationships */}
                    <div>
                      <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Sarah Chen</h3>
                      <div className="space-y-4">
                        <div>
                          <p className={`text-sm font-semibold mb-2 ${prefix}-text-tertiary uppercase`}>Motivation</p>
                          <p className={`text-sm ${prefix}-text-secondary`}>
                            Prove that "founder intuition" is a learnable pattern, not just luck.
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-2 ${prefix}-text-tertiary uppercase`}>Key Relationships</p>
                          <div className="space-y-2">
                            <p className={`text-sm ${prefix}-text-secondary`}>• Marcus Thompson (Partner) - Creative tension</p>
                            <p className={`text-sm ${prefix}-text-secondary`}>• Jordan Patel (Associate) - Mentorship</p>
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

      {/* Section 5: Characters - Variant C: Interactive Web */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 5: Characters - Variant C: Interactive Web
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Central character surrounded by others, lines show relationships, click to focus on character.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary p-8`}>
              <div className="h-full relative">
                {/* Central Character */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={`w-24 h-24 rounded-full ${prefix}-bg-accent border-4 ${prefix}-border-primary flex items-center justify-center text-2xl font-bold ${prefix}-text-accent`}>
                    SC
                  </div>
                  <p className={`text-center mt-2 text-sm font-semibold ${prefix}-text-primary`}>Sarah Chen</p>
                </div>
                {/* Surrounding Characters */}
                <div className="absolute top-1/4 left-1/4">
                  <div className={`w-16 h-16 rounded-full ${prefix}-bg-secondary border-2 ${prefix}-border flex items-center justify-center text-lg font-bold ${prefix}-text-secondary`}>
                    MT
                  </div>
                  <p className={`text-center mt-1 text-xs ${prefix}-text-secondary`}>Marcus</p>
                </div>
                <div className="absolute top-1/4 right-1/4">
                  <div className={`w-16 h-16 rounded-full ${prefix}-bg-secondary border-2 ${prefix}-border flex items-center justify-center text-lg font-bold ${prefix}-text-secondary`}>
                    JP
                  </div>
                  <p className={`text-center mt-1 text-xs ${prefix}-text-secondary`}>Jordan</p>
                </div>
                {/* Relationship Lines (visual representation) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="25%" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#10B981' : '#10B981'} strokeWidth="2" opacity="0.3" />
                  <line x1="75%" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#10B981' : '#10B981'} strokeWidth="2" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Depth - Variant A: Tabbed Exploration */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 6: Depth - Variant A: Tabbed Exploration
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Three tabs: Theme, Stakes, World. Each tab full-width content, icons for sub-sections, quote callouts.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
              {/* Tabs */}
              <div className={`flex border-b ${prefix}-border ${prefix}-bg-secondary`}>
                {['Theme', 'Stakes', 'World'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`px-8 py-4 font-medium ${
                      idx === 0
                        ? `${prefix}-bg-accent ${prefix}-text-accent border-b-2 border-[#10B981]`
                        : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-12">
                <div className="max-w-4xl mx-auto">
                  <h2 className={`text-3xl font-bold mb-6 ${prefix}-text-primary`}>Theme</h2>
                  <p className={`text-xl mb-6 ${prefix}-text-secondary`}>
                    Conviction vs. Consensus
                  </p>
                  <div className={`p-6 border-l-4 ${prefix}-border-accent ${prefix}-bg-accent/10 mb-6`}>
                    <p className={`text-lg italic ${prefix}-text-primary`}>
                      "In a world of data, how much does gut instinct matter?"
                    </p>
                  </div>
                  <p className={`text-base leading-relaxed ${prefix}-text-secondary`}>
                    The show explores the tension between intuition and data, between trusting your gut 
                    and following the numbers. It asks: When is conviction visionary, and when is it delusional?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Depth - Variant B: Three-Column Layout */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 6: Depth - Variant B: Three-Column Layout
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Side-by-side comparison, equal columns, color-coded headers, bullet points and paragraphs.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: 'Theme', color: '#10B981', content: 'Conviction vs. Consensus' },
                    { title: 'Stakes', color: '#E2C376', content: 'Fund success, reputation, legacy' },
                    { title: 'World', color: '#059669', content: 'VC ecosystem, Sand Hill Road' }
                  ].map((col) => (
                    <div key={col.title} className={`${prefix}-card rounded-xl p-6`}>
                      <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`} style={{ color: col.color }}>
                        {col.title}
                      </h3>
                      <p className={`text-sm ${prefix}-text-secondary mb-4`}>{col.content}</p>
                      <ul className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <li key={item} className={`text-sm ${prefix}-text-secondary`}>
                            • Key point {item} about {col.title.toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Depth - Variant C: Layered Reveal */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 6: Depth - Variant C: Layered Reveal
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Surface level shown first, "Dig deeper" expandable sections, progressive disclosure.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto space-y-6">
                <div className={`${prefix}-card rounded-xl p-6`}>
                  <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Theme</h3>
                  <p className={`text-lg mb-4 ${prefix}-text-secondary`}>
                    Conviction vs. Consensus
                  </p>
                  <button className={`text-sm ${prefix}-text-accent`}>
                    Dig Deeper ↓
                  </button>
                </div>
                <div className={`${prefix}-card rounded-xl p-6 opacity-50`}>
                  <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Stakes</h3>
                  <p className={`text-lg mb-4 ${prefix}-text-secondary`}>
                    What's at risk for the firm and its partners
                  </p>
                  <button className={`text-sm ${prefix}-text-accent`}>
                    Dig Deeper ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Key Scenes - Variant A: Spotlight Cards */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 7: Key Scenes - Variant A: Spotlight Cards
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Large cards per scene, episode badge, context paragraph, scene excerpt in box, "Why it matters" callout.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto space-y-8">
                <div className={`${prefix}-card rounded-xl p-8`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent text-sm font-semibold`}>
                      Episode 5
                    </span>
                    <h3 className={`text-xl font-bold ${prefix}-text-primary`}>The Reckoning</h3>
                  </div>
                  <p className={`text-base mb-6 ${prefix}-text-secondary`}>
                    The controversial AI deal is falling apart. The CEO quit. The product launch failed.
                  </p>
                  <div className={`p-6 ${prefix}-bg-secondary rounded-lg mb-6`}>
                    <p className={`font-mono text-sm ${prefix}-text-primary`}>
                      SARAH: "This is exactly why we exist. When everyone else runs, we see something they don't."
                    </p>
                  </div>
                  <div className={`p-4 border-l-4 ${prefix}-border-accent ${prefix}-bg-accent/10`}>
                    <p className={`text-sm font-semibold mb-1 ${prefix}-text-accent`}>Why This Matters</p>
                    <p className={`text-sm ${prefix}-text-secondary`}>
                      This is the moment the firm's entire philosophy is tested under fire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Key Scenes - Variant B: Side-by-Side Comparison */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 7: Key Scenes - Variant B: Side-by-Side Comparison
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Two columns, Episode 3 vs Episode 8 comparison, visual progression, transformation highlighted.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-6xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 text-center ${prefix}-text-primary`}>The Transformation</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <div className={`px-3 py-1 rounded-lg ${prefix}-bg-secondary ${prefix}-text-secondary text-sm font-semibold inline-block mb-4`}>
                      Episode 3
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>The Doubt</h3>
                    <p className={`text-sm ${prefix}-text-secondary mb-4`}>
                      Sarah questions whether her instincts are still reliable after a miss.
                    </p>
                    <div className={`p-4 ${prefix}-bg-secondary rounded-lg`}>
                      <p className={`font-mono text-xs ${prefix}-text-primary`}>
                        "Are we just lucky?"
                      </p>
                    </div>
                  </div>
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <div className={`px-3 py-1 rounded-lg ${prefix}-bg-accent ${prefix}-text-accent text-sm font-semibold inline-block mb-4`}>
                      Episode 8
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>The Validation</h3>
                    <p className={`text-sm ${prefix}-text-secondary mb-4`}>
                      The thesis is proven. Sarah was right to trust herself.
                    </p>
                    <div className={`p-4 ${prefix}-bg-accent/10 rounded-lg`}>
                      <p className={`font-mono text-xs ${prefix}-text-primary`}>
                        "We saw something no one else did."
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <span className={`text-2xl ${prefix}-text-accent`}>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Key Scenes - Variant C: Cinematic Presentation */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 7: Key Scenes - Variant C: Cinematic Presentation
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Full-width scene cards, scene as "act breaks", large typography for dialogue, stage direction in italics.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary`}>
              <div className="min-h-full">
                <div className={`h-full flex items-center justify-center p-12 ${prefix}-bg-secondary`}>
                  <div className="max-w-4xl mx-auto text-center">
                    <p className={`text-sm mb-8 ${prefix}-text-tertiary uppercase tracking-wider`}>Act II</p>
                    <h2 className={`text-4xl font-bold mb-12 ${prefix}-text-primary`}>The Reckoning</h2>
                    <div className={`text-3xl font-serif mb-8 ${prefix}-text-primary`}>
                      "This is exactly why we exist."
                    </div>
                    <p className={`text-lg italic ${prefix}-text-secondary`}>
                      The controversial deal is falling apart. Sarah and Marcus face off.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Production - Variant A: Dashboard View */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 8: Production - Variant A: Dashboard View
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Four quadrants, Budget: Charts and graphs, Locations: Image gallery, Props: List with photos, Casting: Headshots grid.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '700px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-6xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>Production Ready</h2>
                <div className="grid grid-cols-2 gap-6">
                  {/* Budget Quadrant */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Budget</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm ${prefix}-text-secondary`}>Per Episode</span>
                          <span className={`text-lg font-bold ${prefix}-text-primary`}>$965</span>
                        </div>
                        <div className={`h-4 ${prefix}-bg-secondary rounded-full overflow-hidden`}>
                          <div className="h-full bg-[#10B981]" style={{ width: '65%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className={`text-sm ${prefix}-text-secondary`}>Arc Total</span>
                          <span className={`text-lg font-bold ${prefix}-text-primary`}>$7,720</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Locations Quadrant */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Locations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((loc) => (
                        <div key={loc} className={`aspect-video ${prefix}-bg-secondary rounded-lg flex items-center justify-center`}>
                          <span className={`text-2xl ${prefix}-text-tertiary`}>📍</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Props Quadrant */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Props</h3>
                    <div className="space-y-2">
                      {['Notebook', 'Term Sheet', 'Phone', 'Coffee Cup'].map((prop) => (
                        <div key={prop} className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${prefix}-bg-secondary rounded flex items-center justify-center`}>
                            <span className="text-lg">📝</span>
                          </div>
                          <span className={`text-sm ${prefix}-text-secondary`}>{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Casting Quadrant */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Casting</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['SC', 'MT', 'JP', 'AC'].map((initials) => (
                        <div key={initials} className={`aspect-square ${prefix}-bg-secondary rounded-full flex items-center justify-center text-lg font-bold ${prefix}-text-secondary`}>
                          {initials}
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

      {/* Section 8: Production - Variant B: Tabbed Sections */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 8: Production - Variant B: Tabbed Sections
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Horizontal tabs, each tab dedicated, Budget: Detailed breakdown, Locations: Map with pins, Props: Categorized list, Casting: Full profiles.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
              {/* Tabs */}
              <div className={`flex border-b ${prefix}-border ${prefix}-bg-secondary`}>
                {['Budget', 'Locations', 'Props', 'Casting'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`px-6 py-4 font-medium ${
                      idx === 0
                        ? `${prefix}-bg-accent ${prefix}-text-accent border-b-2 border-[#10B981]`
                        : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <h3 className={`text-2xl font-bold mb-6 ${prefix}-text-primary`}>Budget Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${prefix}-text-secondary`}>Base Budget</span>
                      <span className={`text-lg font-bold ${prefix}-text-primary`}>$165</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${prefix}-text-secondary`}>Optional Costs</span>
                      <span className={`text-lg font-bold ${prefix}-text-primary`}>$800</span>
                    </div>
                    <div className={`pt-4 border-t ${prefix}-border flex justify-between items-center`}>
                      <span className={`text-lg font-bold ${prefix}-text-primary`}>Total Per Episode</span>
                      <span className={`text-2xl font-bold ${prefix}-text-accent`}>$965</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Production - Variant C: Infographic Style */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 8: Production - Variant C: Infographic Style
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Visual hierarchy, Budget as pie chart, Locations as cards, Props as icon grid, Casting as polaroids.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-3 gap-8">
                  {/* Budget Pie Chart (visual representation) */}
                  <div className={`${prefix}-card rounded-xl p-6 flex flex-col items-center`}>
                    <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Budget</h3>
                    <div className="w-32 h-32 rounded-full border-8 border-[#10B981] flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${prefix}-text-primary`}>$965</div>
                        <div className={`text-xs ${prefix}-text-tertiary`}>per episode</div>
                      </div>
                    </div>
                  </div>
                  {/* Locations Cards */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Locations</h3>
                    <div className="space-y-3">
                      {['Conference Room', 'Coffee Shop', 'Office'].map((loc) => (
                        <div key={loc} className={`p-3 ${prefix}-bg-secondary rounded-lg`}>
                          <span className={`text-sm ${prefix}-text-secondary`}>{loc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Casting Polaroids */}
                  <div className={`${prefix}-card rounded-xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Casting</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['SC', 'MT', 'JP', 'AC'].map((initials) => (
                        <div key={initials} className={`aspect-[3/4] ${prefix}-bg-secondary rounded-lg p-2 flex flex-col items-center justify-center border-2 ${prefix}-border`}>
                          <div className={`w-16 h-16 rounded-full ${prefix}-bg-accent flex items-center justify-center text-lg font-bold ${prefix}-text-accent mb-2`}>
                            {initials}
                          </div>
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

      {/* Section 9: Marketing - Variant A: Strategy Brief */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 9: Marketing - Variant A: Strategy Brief
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Executive summary style, section headers clear, bullet points, platform icons, stats and projections.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>Marketing Strategy</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Target Audience</h3>
                    <ul className="space-y-2">
                      <li className={`text-sm ${prefix}-text-secondary`}>• Primary: VCs, founders, startup employees (500k+)</li>
                      <li className={`text-sm ${prefix}-text-secondary`}>• Secondary: Business/finance enthusiasts (5M+)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Key Selling Points</h3>
                    <ul className="space-y-2">
                      <li className={`text-sm ${prefix}-text-secondary`}>• Authentic VC perspective</li>
                      <li className={`text-sm ${prefix}-text-secondary`}>• Smart, fast-paced dialogue</li>
                      <li className={`text-sm ${prefix}-text-secondary`}>• Real-world relevance</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>Distribution Platforms</h3>
                    <div className="flex gap-4">
                      {['LinkedIn', 'X (Twitter)', 'YouTube'].map((platform) => (
                        <div key={platform} className={`px-4 py-2 ${prefix}-bg-secondary rounded-lg`}>
                          <span className={`text-sm ${prefix}-text-secondary`}>{platform}</span>
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

      {/* Section 9: Marketing - Variant B: Campaign Preview */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 9: Marketing - Variant B: Campaign Preview
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Mock social posts, visual brand guidelines, sample taglines prominent, audience personas, distribution timeline.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>Campaign Preview</h2>
                {/* Mock Social Post */}
                <div className={`${prefix}-card rounded-xl p-6 mb-6`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${prefix}-bg-accent`} />
                    <div>
                      <p className={`text-sm font-bold ${prefix}-text-primary`}>Investing Is Us</p>
                      <p className={`text-xs ${prefix}-text-tertiary`}>@investingisus • 2h</p>
                    </div>
                  </div>
                  <p className={`text-base mb-4 ${prefix}-text-primary`}>
                    "Before the exit, there's the investment." 🎬
                  </p>
                  <div className={`aspect-video ${prefix}-bg-secondary rounded-lg mb-4`} />
                  <div className="flex gap-4 text-sm">
                    <span className={prefix + '-text-secondary'}>❤️ 234</span>
                    <span className={prefix + '-text-secondary'}>💬 12</span>
                    <span className={prefix + '-text-secondary'}>🔄 45</span>
                  </div>
                </div>
                {/* Taglines */}
                <div className={`${prefix}-card rounded-xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Taglines</h3>
                  <div className="space-y-3">
                    {['Before the exit, there\'s the investment.', 'The best bets are the uncomfortable ones.', 'Conviction vs. Consensus: Choose one.'].map((tagline) => (
                      <p key={tagline} className={`text-lg font-semibold ${prefix}-text-primary`}>
                        "{tagline}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Marketing - Variant C: Pitch Deck Style */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 9: Marketing - Variant C: Pitch Deck Style
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Slide-like sections, big numbers, visual charts, competitive landscape, clear value props.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
                <div className="text-center mb-12">
                  <div className={`text-6xl font-bold mb-4 ${prefix}-text-accent`}>500K+</div>
                  <p className={`text-xl ${prefix}-text-secondary`}>Target Audience</p>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>3</div>
                    <p className={`text-sm ${prefix}-text-secondary`}>Distribution Platforms</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>$8K</div>
                    <p className={`text-sm ${prefix}-text-secondary`}>Production Budget</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>8</div>
                    <p className={`text-sm ${prefix}-text-secondary`}>Episodes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Character Depth - Variant A: Actor's Notebook */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 10: Character Depth - Variant A: Actor's Notebook
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Handwriting-style fonts, margin notes aesthetic, tabs for each character, intimate, personal feel.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto">
                <div className={`${prefix}-card rounded-xl p-8`} style={{ fontFamily: 'serif' }}>
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`} style={{ fontFamily: 'cursive' }}>
                        Sarah Chen - Character Notes
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className={`text-sm font-semibold mb-2 ${prefix}-text-tertiary uppercase`}>Through-Line</p>
                          <p className={`text-base leading-relaxed ${prefix}-text-secondary`}>
                            From self-doubt to earned conviction. Sarah questions whether she still has "it" 
                            in Episode 1, makes the controversial bet in Episode 4, and finds vindication in Episode 8.
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-2 ${prefix}-text-tertiary uppercase`}>Super Objective</p>
                          <p className={`text-base ${prefix}-text-primary font-semibold`}>
                            Prove that "founder intuition" is a learnable pattern, not just luck.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Margin Notes */}
                    <div className={`w-32 p-4 ${prefix}-bg-accent/10 rounded-lg border-l-2 ${prefix}-border-accent`}>
                      <p className={`text-xs italic ${prefix}-text-tertiary`}>
                            Watch: Sarah Snook (Succession) for intelligence + vulnerability
                          </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Character Depth - Variant B: Training Guide */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 10: Character Depth - Variant B: Training Guide
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Professional document style, clear sections, reference photos, bullet point exercises, timeline of character arc.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 ${prefix}-text-primary`}>Character Training Guide</h2>
                <div className={`${prefix}-card rounded-xl p-8`}>
                  <h3 className={`text-2xl font-bold mb-6 ${prefix}-text-primary`}>Sarah Chen</h3>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className={`w-32 h-32 ${prefix}-bg-secondary rounded-lg mb-4`} />
                      <p className={`text-xs ${prefix}-text-tertiary`}>Reference Photo</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold mb-2 ${prefix}-text-tertiary uppercase`}>Character Arc Timeline</p>
                      <div className="space-y-2">
                        <p className={`text-sm ${prefix}-text-secondary`}>Ep 1: Questions instincts</p>
                        <p className={`text-sm ${prefix}-text-secondary`}>Ep 4: Makes controversial bet</p>
                        <p className={`text-sm ${prefix}-text-secondary`}>Ep 8: Vindication</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold mb-3 ${prefix}-text-tertiary uppercase`}>Performance Exercises</p>
                    <ul className="space-y-2">
                      <li className={`text-sm ${prefix}-text-secondary`}>• Practice the "mask of confidence" - perform authority even when doubting</li>
                      <li className={`text-sm ${prefix}-text-secondary`}>• Study the three private moments where the mask slips</li>
                      <li className={`text-sm ${prefix}-text-secondary`}>• Work on the physical tell: touching collarbone when nervous</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Character Depth - Variant C: Study Cards */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 10: Character Depth - Variant C: Study Cards
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Flashcard aesthetic, flip to reveal details, one character per card, key info front, deep dive back.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary p-8`}>
              <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
                <div className={`w-96 h-64 ${prefix}-card rounded-xl p-8 cursor-pointer hover:scale-105 transition-transform perspective-1000`}>
                  {/* Front of Card */}
                  <div className="h-full flex flex-col justify-center items-center text-center">
                    <div className={`w-20 h-20 rounded-full ${prefix}-bg-accent flex items-center justify-center text-2xl font-bold ${prefix}-text-accent mb-4`}>
                      SC
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>Sarah Chen</h3>
                    <p className={`text-sm ${prefix}-text-tertiary`}>Managing Partner</p>
                    <p className={`text-xs mt-4 ${prefix}-text-secondary`}>Click to flip →</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: Call to Action - Variant A: Contact Form */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 11: Call to Action - Variant A: Contact Form
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Simple, elegant form, name, email, message, primary CTA button, contact info below, social links.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-2xl mx-auto">
                <h2 className={`text-3xl font-bold mb-8 text-center ${prefix}-text-primary`}>
                  Want to See This Story Come to Life?
                </h2>
                <div className={`${prefix}-card rounded-xl p-8`}>
                  <form className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>Name</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>Email</label>
                      <input
                        type="email"
                        className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>Message</label>
                      <textarea
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}
                        placeholder="Tell us about your interest..."
                      />
                    </div>
                    <button className={`w-full px-6 py-4 rounded-lg font-bold ${prefix}-btn-primary`}>
                      Schedule a Call
                    </button>
                  </form>
                  <div className={`mt-8 pt-8 border-t ${prefix}-border text-center`}>
                    <p className={`text-sm ${prefix}-text-secondary mb-4`}>Or reach us directly:</p>
                    <p className={`text-base ${prefix}-text-primary`}>hello@investingisus.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: Call to Action - Variant B: Next Steps Grid */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 11: Call to Action - Variant B: Next Steps Grid
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Three option cards, Schedule Call / Learn More / Invest, icon for each option, brief description, hover effects.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '500px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 overflow-y-auto ${prefix}-bg-primary p-8`}>
              <div className="max-w-5xl mx-auto">
                <h2 className={`text-3xl font-bold mb-12 text-center ${prefix}-text-primary`}>
                  Get Involved
                </h2>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: '📞', title: 'Schedule a Call', desc: 'Discuss the project and investment opportunity' },
                    { icon: '📚', title: 'Learn More', desc: 'Explore the production process and timeline' },
                    { icon: '💰', title: 'Invest', desc: 'Join us in bringing this story to life' }
                  ].map((option) => (
                    <div
                      key={option.title}
                      className={`${prefix}-card rounded-xl p-8 cursor-pointer hover:${prefix}-shadow-lg transition-all text-center`}
                    >
                      <div className={`text-5xl mb-4`}>{option.icon}</div>
                      <h3 className={`text-xl font-bold mb-3 ${prefix}-text-primary`}>{option.title}</h3>
                      <p className={`text-sm mb-6 ${prefix}-text-secondary`}>{option.desc}</p>
                      <button className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-primary`}>
                        Get Started
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11: Call to Action - Variant C: Impact Statement */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
            Section 11: Call to Action - Variant C: Impact Statement
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Large inspirational quote, "Why You" section prominent, single focused CTA, minimal distraction, owner attribution.
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            <div className={`absolute inset-0 ${prefix}-bg-primary p-12`}>
              <div className="max-w-4xl mx-auto h-full flex flex-col justify-center items-center text-center">
                <div className={`text-5xl font-serif italic mb-12 ${prefix}-text-primary`}>
                  "This is your origin story."
                </div>
                <div className={`max-w-2xl mb-12 ${prefix}-card rounded-xl p-8`}>
                  <h3 className={`text-2xl font-bold mb-4 ${prefix}-text-primary`}>Why This Story Matters</h3>
                  <p className={`text-lg leading-relaxed ${prefix}-text-secondary`}>
                    Your firm's thesis is unique. Your approach is different. Your portfolio proves it. 
                    This show captures the essence of what makes you special—the conviction, the vision, the impact.
                  </p>
                </div>
                <button className={`px-12 py-4 rounded-lg text-lg font-bold ${prefix}-btn-primary`}>
                  Invest in This Series
                </button>
                <p className={`text-sm mt-8 ${prefix}-text-tertiary`}>
                  Shared by Sequoia Capital
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  )
}

