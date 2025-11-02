'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface GeneratedContentProps {
  narrative: string
  storyboard: string
  scripts: string
  casting: string
  sceneBreakdowns: string
  zapierProcessing: {
    narrative: 'success' | 'warning'
    storyboard: 'success' | 'warning'
    scripts: 'success' | 'warning'
    casting: 'success' | 'warning'
  }
}

type ContentSection = 'narrative' | 'storyboard' | 'scripts' | 'casting' | 'breakdowns'

export function GeneratedContent({
  narrative,
  storyboard,
  scripts,
  casting,
  sceneBreakdowns,
  zapierProcessing,
}: GeneratedContentProps) {
  const [activeSection, setActiveSection] = useState<ContentSection>('narrative')

  const sections = [
    {
      id: 'narrative' as ContentSection,
      title: 'Narrative Outline',
      content: narrative,
      icon: '📝',
      status: zapierProcessing.narrative,
    },
    {
      id: 'storyboard' as ContentSection,
      title: 'Storyboards',
      content: storyboard,
      icon: '🎬',
      status: zapierProcessing.storyboard,
    },
    {
      id: 'scripts' as ContentSection,
      title: 'Scripts',
      content: scripts,
      icon: '📄',
      status: zapierProcessing.scripts,
    },
    {
      id: 'casting' as ContentSection,
      title: 'Casting Suggestions',
      content: casting,
      icon: '🎭',
      status: zapierProcessing.casting,
    },
    {
      id: 'breakdowns' as ContentSection,
      title: 'Scene Breakdowns',
      content: sceneBreakdowns,
      icon: '🎥',
      status: 'warning',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-12 space-y-8"
    >
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`tab-button ${
              activeSection === section.id ? 'tab-button-active' : 'text-[#e7e7e7]/70'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{section.icon}</span>
            <span>{section.title}</span>
            {section.status === 'warning' && (
              <span className="inline-block w-2 h-2 rounded-full bg-[#e2c376] animate-pulse" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Content Display */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card"
      >
        <h2 className="text-3xl font-semibold mb-6 text-[#e2c376] flex items-center gap-3">
          <span className="text-2xl">
            {sections.find(s => s.id === activeSection)?.icon}
          </span>
          {sections.find(s => s.id === activeSection)?.title}
        </h2>
        <div className="prose prose-custom">
          {sections
            .find(s => s.id === activeSection)
            ?.content.split('\n')
            .map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
        </div>
      </motion.div>

      {/* Processing Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-[#e7e7e7]/60"
      >
        {sections.find(s => s.id === activeSection)?.status === 'warning' && (
          <p className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e2c376] animate-pulse" />
            <span>Syncing with cloud services...</span>
          </p>
        )}
      </motion.div>
    </motion.div>
  )
} 