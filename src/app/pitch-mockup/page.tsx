'use client'

import React, { useState } from 'react'
import { motion } from '@/components/ui/ClientMotion'
import ScriptScreenplay from '@/components/pitch-mockup/ScriptScreenplay'
import StoryboardComicBook from '@/components/pitch-mockup/StoryboardComicBook'
import MarketingPitchDeck from '@/components/pitch-mockup/MarketingPitchDeck'
import CharactersRelationshipWeb from '@/components/pitch-mockup/CharactersRelationshipWeb'
import DepthNewspaper from '@/components/pitch-mockup/DepthNewspaper'
import ProductionDashboard from '@/components/pitch-mockup/ProductionDashboard'
import KeyScenesCinematic from '@/components/pitch-mockup/KeyScenesCinematic'
import { createSamplePitchData } from '@/components/pitch-mockup/sampleData'
import type { InvestorMaterialsPackage } from '@/types/investor-materials'

const SECTIONS = [
  { id: 'script', label: 'Script', icon: '📄' },
  { id: 'storyboard', label: 'Storyboard', icon: '🎨' },
  { id: 'marketing', label: 'Marketing', icon: '📊' },
  { id: 'characters', label: 'Characters', icon: '👥' },
  { id: 'depth', label: 'Depth', icon: '📰' },
  { id: 'production', label: 'Production', icon: '🎥' },
  { id: 'key-scenes', label: 'Key Scenes', icon: '🎬' },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function PitchMockupPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('script')
  const [sampleData] = useState<InvestorMaterialsPackage>(() => createSamplePitchData())

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-[#e2c376]/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#e2c376]">
              Pitch Materials Showcase
            </h1>
            <div className="text-sm text-white/60">
              Interactive Mockups • Readability First
            </div>
          </div>
          
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#e2c376] text-black shadow-lg'
                    : 'bg-[#2a2a2a] text-white/80 hover:bg-[#36393f]'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'script' && (
            <ScriptScreenplay
              pilot={sampleData.pilot}
              story={sampleData.story}
              episodeScripts={sampleData.episodeScripts}
            />
          )}
          
          {activeSection === 'storyboard' && (
            <StoryboardComicBook visuals={sampleData.visuals} />
          )}
          
          {activeSection === 'marketing' && (
            <MarketingPitchDeck
              marketing={sampleData.marketing}
              seriesTitle={sampleData.hook.seriesTitle}
              posterImageUrl={sampleData.marketing.visualAssets?.seriesPoster?.imageUrl}
              teaserVideoUrl={sampleData.marketing.visualAssets?.seriesTeaser?.videoUrl}
            />
          )}
          
          {activeSection === 'characters' && (
            <CharactersRelationshipWeb characters={sampleData.characters} />
          )}
          
          {activeSection === 'depth' && (
            <DepthNewspaper depth={sampleData.depth} />
          )}
          
          {activeSection === 'production' && (
            <ProductionDashboard
              production={sampleData.production}
              characters={sampleData.characters.mainCharacters}
            />
          )}
          
          {activeSection === 'key-scenes' && (
            <KeyScenesCinematic keyScenes={sampleData.keyScenes} />
          )}
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#36393f] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/60 text-sm">
          <p>These are interactive mockups showcasing the redesigned pitch materials.</p>
          <p className="mt-2">All data is sample data for demonstration purposes.</p>
        </div>
      </div>
    </div>
  )
}





