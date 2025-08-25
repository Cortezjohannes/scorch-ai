'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VisualDevelopment } from './VisualDevelopment'
import { ProductionPlanning } from './ProductionPlanning'
import { TechnicalPreproduction } from './TechnicalPreproduction'

interface Phase2FormProps {
  synopsis?: string
  theme?: string
}

export function Phase2Form({ synopsis = '', theme = '' }: Phase2FormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'visual' | 'production' | 'technical'>('visual')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generatePhase2Content = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate/phase2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          synopsis,
          theme,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Phase 2 content')
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text">
            Phase 2
          </h2>
          <p className="text-[#e7e7e7]/70">
            Visual Development, Production Planning, and Technical Pre-production
          </p>
        </div>

        {!generatedContent && (
          <motion.button
            onClick={generatePhase2Content}
            disabled={isGenerating}
            className="btn-primary w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating Phase 2 Content...</span>
              </div>
            ) : (
              'Generate Phase 2 Content'
            )}
          </motion.button>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#e2c37610] border border-[#e2c37640] rounded-xl p-4 text-[#e2c376] mt-4"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {generatedContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={() => setActiveTab('visual')}
              className={`tab-button ${
                activeTab === 'visual' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">🎨</span>
              <span>Visual Development</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('production')}
              className={`tab-button ${
                activeTab === 'production' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">📋</span>
              <span>Production Planning</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('technical')}
              className={`tab-button ${
                activeTab === 'technical' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">🎥</span>
              <span>Technical Pre-production</span>
            </motion.button>
          </div>

          {/* Content Display */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'visual' && generatedContent && (
              <VisualDevelopment
                conceptArt={generatedContent.visual.conceptArt}
                styleGuide={generatedContent.visual.styleGuide}
                locations={generatedContent.visual.locations}
                costumes={generatedContent.visual.costumes}
              />
            )}
            {activeTab === 'production' && generatedContent && (
              <ProductionPlanning
                budget={generatedContent.production.budget}
                schedule={generatedContent.production.schedule}
                resources={generatedContent.production.resources}
                riskAssessment={generatedContent.production.riskAssessment}
              />
            )}
            {activeTab === 'technical' && generatedContent && (
              <TechnicalPreproduction
                shotList={generatedContent.technical.shotList}
                equipment={generatedContent.technical.equipment}
                technical={generatedContent.technical.technical}
                vfx={generatedContent.technical.vfx}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 