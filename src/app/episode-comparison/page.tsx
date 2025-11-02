'use client'

import { useState, useEffect } from 'react'

interface Scene {
  sceneNumber: number
  title: string
  content: string
}

interface BranchingOption {
  id: number
  text: string
  description?: string
  isCanonical: boolean
}

interface Episode {
  episodeNumber: number
  title: string
  synopsis: string
  scenes: Scene[]
  branchingOptions: BranchingOption[]
  episodeRundown: string
}

interface EpisodeData {
  method: string
  duration: number
  episode: Episode
  metadata: any
}

export default function EpisodeComparisonPage() {
  const [standardEpisode, setStandardEpisode] = useState<EpisodeData | null>(null)
  const [premiumEpisode, setPremiumEpisode] = useState<EpisodeData | null>(null)
  const [legacyEpisode, setLegacyEpisode] = useState<EpisodeData | null>(null)
  const [selectedMode, setSelectedMode] = useState<'standard' | 'premium' | 'legacy'>('premium')
  const [darkMode, setDarkMode] = useState(false)
  const [expandedScenes, setExpandedScenes] = useState<number[]>([1]) // First scene expanded by default

  useEffect(() => {
    // Load test results
    Promise.all([
      fetch('/test-results/standard-episode.json').then(r => r.json()),
      fetch('/test-results/premium-episode.json').then(r => r.json()),
      fetch('/test-results/legacy-episode.json').then(r => r.json()),
    ]).then(([standard, premium, legacy]) => {
      setStandardEpisode(standard)
      setPremiumEpisode(premium)
      setLegacyEpisode(legacy)
    }).catch(err => {
      console.error('Failed to load episodes:', err)
    })
  }, [])

  const toggleScene = (sceneNumber: number) => {
    setExpandedScenes(prev => 
      prev.includes(sceneNumber)
        ? prev.filter(n => n !== sceneNumber)
        : [...prev, sceneNumber]
    )
  }

  if (!standardEpisode || !premiumEpisode || !legacyEpisode) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Loading episodes...
        </div>
      </div>
    )
  }

  const episodes = {
    standard: standardEpisode,
    premium: premiumEpisode,
    legacy: legacyEpisode
  }

  const currentEpisode = episodes[selectedMode]

  const qualityScores = {
    standard: { overall: 6.9, dialogue: 6, atmosphere: 7, character: 6 },
    premium: { overall: 10, dialogue: 10, atmosphere: 10, character: 10 },
    legacy: { overall: 8.8, dialogue: 8, atmosphere: 9, character: 8 }
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors ${
        darkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Episode Comparison</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                "The Algorithm" - Episode 1
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className={`rounded-2xl p-6 border transition-colors ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <p className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Select Generation Mode:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModeCard
              mode="standard"
              title="Standard Mode"
              duration={standardEpisode.duration}
              score={qualityScores.standard.overall}
              badge="Fast & Smart"
              isSelected={selectedMode === 'standard'}
              onClick={() => setSelectedMode('standard')}
              darkMode={darkMode}
            />
            <ModeCard
              mode="premium"
              title="Premium Mode"
              duration={premiumEpisode.duration}
              score={qualityScores.premium.overall}
              badge="🏆 Best Quality"
              isSelected={selectedMode === 'premium'}
              onClick={() => setSelectedMode('premium')}
              darkMode={darkMode}
              isPremium
            />
            <ModeCard
              mode="legacy"
              title="Legacy Mode"
              duration={legacyEpisode.duration}
              score={qualityScores.legacy.overall}
              badge="Baseline"
              isSelected={selectedMode === 'legacy'}
              onClick={() => setSelectedMode('legacy')}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Episode Content */}
      <main className="max-w-4xl mx-auto px-6 pb-20">
        {/* Episode Header */}
        <article className={`rounded-2xl p-8 mb-6 border transition-colors ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="mb-6">
            <span className={`text-sm font-semibold ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Episode 1
            </span>
            <h2 className="text-4xl font-bold mt-2 mb-4 leading-tight">
              {currentEpisode.episode.title}
            </h2>
            <p className={`text-lg leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {currentEpisode.episode.synopsis}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 pt-6 border-t" style={{
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 1)'
          }}>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Generation Time
              </div>
              <div className="text-2xl font-bold">
                {currentEpisode.duration.toFixed(1)}s
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Quality Score
              </div>
              <div className="text-2xl font-bold">
                {qualityScores[selectedMode].overall}/10
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Scenes
              </div>
              <div className="text-2xl font-bold">
                {currentEpisode.episode.scenes.length}
              </div>
            </div>
            {currentEpisode.metadata.engineMetadata && (
              <div>
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  Engines
                </div>
                <div className="text-2xl font-bold text-green-500">
                  {currentEpisode.metadata.engineMetadata.successfulEngines}/
                  {currentEpisode.metadata.engineMetadata.totalEnginesRun}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Scenes */}
        <div className="space-y-6">
          {currentEpisode.episode.scenes.map((scene) => (
            <article
              key={scene.sceneNumber}
              className={`rounded-2xl overflow-hidden border transition-all ${
                darkMode 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleScene(scene.sceneNumber)}
                className={`w-full text-left px-8 py-6 transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-700/50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`text-sm font-semibold mb-1 ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      Scene {scene.sceneNumber}
                    </div>
                    <h3 className="text-2xl font-bold">
                      {scene.title}
                    </h3>
                  </div>
                  <div className={`ml-4 text-2xl transition-transform ${
                    expandedScenes.includes(scene.sceneNumber) ? 'rotate-180' : ''
                  }`}>
                    ↓
                  </div>
                </div>
              </button>
              
              {expandedScenes.includes(scene.sceneNumber) && (
                <div className={`px-8 pb-8 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`prose max-w-none pt-6 ${
                    darkMode ? 'prose-invert' : ''
                  }`} style={{
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {scene.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-6 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Branching Options */}
        <div className={`rounded-2xl p-8 mt-6 border transition-colors ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className="text-2xl font-bold mb-6">What Happens Next?</h3>
          <div className="space-y-4">
            {currentEpisode.episode.branchingOptions.map((option) => (
              <div
                key={option.id}
                className={`p-5 rounded-xl border-2 transition-all ${
                  option.isCanonical
                    ? darkMode
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-purple-500 bg-purple-50'
                    : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                    option.isCanonical
                      ? 'bg-purple-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {option.id}
                  </div>
                  <div className="flex-1">
                    <p className={`leading-relaxed ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {option.text}
                    </p>
                    {option.description && (
                      <p className={`text-sm mt-2 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {option.description}
                      </p>
                    )}
                    {option.isCanonical && (
                      <span className={`inline-block text-xs font-semibold mt-2 ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        ★ Canonical Path
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Episode Analysis */}
        <div className={`rounded-2xl p-8 mt-6 border transition-colors ${
          darkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className="text-2xl font-bold mb-4">Episode Analysis</h3>
          <div className={`prose max-w-none ${
            darkMode ? 'prose-invert' : ''
          }`} style={{
            fontSize: '1rem',
            lineHeight: '1.7'
          }}>
            <p>{currentEpisode.episode.episodeRundown}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function ModeCard({ 
  mode, 
  title, 
  duration, 
  score, 
  badge,
  isSelected, 
  onClick,
  darkMode,
  isPremium 
}: { 
  mode: string
  title: string
  duration: number
  score: number
  badge: string
  isSelected: boolean
  onClick: () => void
  darkMode: boolean
  isPremium?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? isPremium
            ? 'border-purple-500 shadow-lg shadow-purple-500/20'
            : darkMode
              ? 'border-purple-400 shadow-lg'
              : 'border-purple-500 shadow-lg'
          : darkMode
            ? 'border-gray-700 hover:border-gray-600'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="mb-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isPremium
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : darkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-700'
        }`}>
          {badge}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="flex items-baseline gap-3 mb-2">
        <div className="text-3xl font-bold">{score}</div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          / 10
        </div>
      </div>
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {duration.toFixed(1)}s generation
      </div>
    </button>
  )
}










