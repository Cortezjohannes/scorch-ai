'use client'

import React, { useState, useEffect } from 'react'
import ColorPalette from '@/components/design-preview/ColorPalette'
import ComponentShowcase from '@/components/design-preview/ComponentShowcase'
import LayoutExamples from '@/components/design-preview/LayoutExamples'
import CardShowcase from '@/components/design-preview/CardShowcase'
import ModalShowcase from '@/components/design-preview/ModalShowcase'
import BackgroundShowcase from '@/components/design-preview/BackgroundShowcase'
import GenerationSuiteExamples from '@/components/design-preview/GenerationSuiteExamples'
import StoryBibleExamples from '@/components/design-preview/StoryBibleExamples'
import EpisodeDetailExamples from '@/components/design-preview/EpisodeDetailExamples'
import EpisodePreProductionExamples from '@/components/design-preview/EpisodePreProductionExamples'
import ArcPreProductionExamples from '@/components/design-preview/ArcPreProductionExamples'
import ActorMaterialsExamples from '@/components/design-preview/ActorMaterialsExamples'
import InvestorMaterialsExamples from '@/components/design-preview/InvestorMaterialsExamples'
import DemoExamples from '@/components/design-preview/DemoExamples'
import ProfileDashboardExamples from '@/components/design-preview/ProfileDashboardExamples'
import LoadingExamples from '@/components/design-preview/LoadingExamples'
import LandingPageExamples from '@/components/design-preview/LandingPageExamples'
import ThemeToggle from '@/components/design-preview/ThemeToggle'

export default function DesignPreviewPage() {
  const [activeSection, setActiveSection] = useState('colors')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const sections = [
    { id: 'colors', label: 'Color Palette' },
    { id: 'components', label: 'Components' },
    { id: 'cards', label: 'Cards' },
    { id: 'modals', label: 'Modals' },
    { id: 'layouts', label: 'Layouts' },
    { id: 'generation-suite', label: 'Generation Suite' },
    { id: 'story-bible', label: 'Story Bible' },
    { id: 'episode-detail', label: 'Episode Detail' },
    { id: 'episode-preproduction', label: 'Episode Pre-Production' },
    { id: 'arc-preproduction', label: 'Production Assistant' },
    { id: 'actor-materials', label: 'Actor Materials' },
    { id: 'investor-materials', label: 'Investor Materials' },
    { id: 'demo-page', label: 'Demo Page' },
    { id: 'profile-dashboard', label: 'Profile Dashboard' },
    { id: 'loading-systems', label: 'Loading Systems' },
    { id: 'landing-page', label: 'Landing Page' },
    { id: 'backgrounds', label: 'Backgrounds' }
  ]

  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div 
      className={`min-h-screen ${prefix}-bg-primary`}
      style={{ 
        fontFamily: 'League Spartan, sans-serif',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Header */}
      <header 
        className={`sticky top-0 z-50 border-b ${prefix}-bg-primary ${prefix}-border ${prefix}-shadow`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${prefix}-text-primary`}>
                Design System Preview
              </h1>
              <p className={`text-sm mt-1 ${prefix}-text-secondary`}>
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'} - Green & {theme === 'light' ? 'White' : 'Black'} Color Scheme
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${prefix}-text-secondary`}>
                  {theme === 'light' ? 'Light' : 'Dark'}
                </span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'dark-bg-accent dark-text-accent' : 'light-bg-accent light-text-accent'}`}>
                Preview Mode
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`border-b ${prefix}-border ${prefix}-bg-secondary`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 font-medium relative ${prefix}-tab ${
                  activeSection === section.id ? `${prefix}-tab-active` : ''
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeSection === 'colors' && <ColorPalette theme={theme} />}
        {activeSection === 'components' && <ComponentShowcase theme={theme} />}
        {activeSection === 'cards' && <CardShowcase theme={theme} />}
        {activeSection === 'modals' && <ModalShowcase theme={theme} />}
        {activeSection === 'layouts' && <LayoutExamples theme={theme} />}
        {activeSection === 'generation-suite' && <GenerationSuiteExamples theme={theme} />}
        {activeSection === 'story-bible' && <StoryBibleExamples theme={theme} />}
        {activeSection === 'episode-detail' && <EpisodeDetailExamples theme={theme} />}
        {activeSection === 'episode-preproduction' && <EpisodePreProductionExamples theme={theme} />}
        {activeSection === 'arc-preproduction' && <ArcPreProductionExamples theme={theme} />}
        {activeSection === 'actor-materials' && <ActorMaterialsExamples theme={theme} />}
        {activeSection === 'investor-materials' && <InvestorMaterialsExamples theme={theme} />}
        {activeSection === 'demo-page' && <DemoExamples theme={theme} />}
        {activeSection === 'profile-dashboard' && <ProfileDashboardExamples theme={theme} />}
        {activeSection === 'loading-systems' && <LoadingExamples theme={theme} />}
        {activeSection === 'landing-page' && <LandingPageExamples theme={theme} />}
        {activeSection === 'backgrounds' && <BackgroundShowcase theme={theme} />}
      </main>

      {/* Footer */}
      <footer 
        className={`border-t mt-16 ${prefix}-border ${prefix}-bg-secondary`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className={`text-sm font-medium mb-2 ${prefix}-text-primary`}>
                Design System Information
              </p>
              <ul className={`text-sm space-y-1 ${prefix}-text-secondary`}>
                <li>• All colors meet WCAG AA contrast requirements</li>
                <li>• Green (#10B981) maintained as primary brand color</li>
                <li>• Gold (#E2C376) for premium features</li>
                <li>• {theme === 'light' ? 'Light' : 'Dark'} mode optimized for readability</li>
              </ul>
            </div>
            <div className={`text-sm ${prefix}-text-secondary`}>
              <p>This is a preview page for the {theme === 'light' ? 'light' : 'dark'} mode redesign.</p>
              <p className="mt-1">No functionality has been changed.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
