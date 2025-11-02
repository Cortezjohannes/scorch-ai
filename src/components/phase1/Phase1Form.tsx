'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Narrative } from './Narrative'
import { Storyboard } from './Storyboard'
import { Script } from './Script'
import { Casting } from './Casting'

interface Phase1FormProps {
  synopsis?: string
  theme?: string
}

export function Phase1Form({ synopsis = '', theme = '' }: Phase1FormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'narrative' | 'storyboard' | 'script' | 'casting'>('narrative')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generatePhase1Content = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate/phase1', {
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
        throw new Error(errorData.error || 'Failed to generate Phase 1 content')
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
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-transparent bg-clip-text">
            Phase 1
          </h2>
          <p className="text-[#e7e7e7]/70">
            Pre-production: Narrative, Storyboard, Script, and Casting
          </p>
        </div>

        {!generatedContent && (
          <motion.button
            onClick={generatePhase1Content}
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
                <span>Generating Phase 1 Content...</span>
              </div>
            ) : (
              'Generate Phase 1 Content'
            )}
          </motion.button>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#00FF9910] border border-[#00FF9940] rounded-xl p-4 text-[#00FF99] mt-4"
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
              onClick={() => setActiveTab('narrative')}
              className={`tab-button ${
                activeTab === 'narrative' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">📝</span>
              <span>Narrative</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('storyboard')}
              className={`tab-button ${
                activeTab === 'storyboard' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">🎬</span>
              <span>Storyboard</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('script')}
              className={`tab-button ${
                activeTab === 'script' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">📄</span>
              <span>Script</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('casting')}
              className={`tab-button ${
                activeTab === 'casting' ? 'tab-button-active' : 'text-[#e7e7e7]/70'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">🎭</span>
              <span>Casting</span>
            </motion.button>
          </div>

          {/* Content Display */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'narrative' && generatedContent && (
              <Narrative
                overview={generatedContent.narrative.overview}
                plotPoints={generatedContent.narrative.plotPoints}
                characters={generatedContent.narrative.characters}
                themes={generatedContent.narrative.themes}
              />
            )}
            {activeTab === 'storyboard' && generatedContent && (
              <Storyboard
                scenes={generatedContent.storyboard.scenes}
                visualStyle={generatedContent.storyboard.visualStyle}
                transitions={generatedContent.storyboard.transitions}
              />
            )}
            {activeTab === 'script' && generatedContent && (
              <Script
                scenes={generatedContent.script.scenes}
                dialogues={generatedContent.script.dialogues}
                directions={generatedContent.script.directions}
              />
            )}
            {activeTab === 'casting' && generatedContent && (
              <Casting
                roles={generatedContent.casting.roles}
                requirements={generatedContent.casting.requirements}
                notes={generatedContent.casting.notes}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 