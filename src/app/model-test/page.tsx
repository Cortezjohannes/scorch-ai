'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ModelTestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setTesting(true)
    setError(null)
    setResults(null)

    try {
      console.log('🧪 Starting model comparison test...')
      
      const response = await fetch('/api/test-model-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
        console.log('✅ Test complete:', data.results)
      } else {
        throw new Error(data.error || 'Test failed')
      }
      
    } catch (err) {
      console.error('❌ Test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setTesting(false)
    }
  }

  const renderMetrics = (modelResult: any, label: string) => {
    if (!modelResult.success) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h4 className="text-xl font-bold text-red-400 mb-2">{label} - Failed ❌</h4>
          <p className="text-red-300">{modelResult.error}</p>
        </div>
      )
    }

    const { content, metrics, generationTime } = modelResult

    return (
      <div className="bg-[#1a1a1a] border border-[#00FF99]/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-[#00FF99]">{label}</h4>
          <span className="text-[#00FF99] font-mono">{(generationTime / 1000).toFixed(2)}s</span>
        </div>

        {/* Episode Title & Synopsis */}
        <div className="mb-6 pb-6 border-b border-[#00FF99]/20">
          <h5 className="text-2xl font-bold text-white mb-2">{content.title}</h5>
          <p className="text-white/80 italic">{content.synopsis}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/30 p-3 rounded">
            <div className="text-[#00FF99]/70 text-sm">Scenes</div>
            <div className="text-white text-2xl font-bold">{metrics.sceneCount}</div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-[#00FF99]/70 text-sm">Total Words</div>
            <div className="text-white text-2xl font-bold">{metrics.totalWords}</div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-[#00FF99]/70 text-sm">Avg/Scene</div>
            <div className="text-white text-2xl font-bold">{metrics.avgWordsPerScene}</div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-[#00FF99]/70 text-sm">Dialogue</div>
            <div className="text-white text-2xl font-bold">{metrics.dialogueCount}</div>
          </div>
        </div>

        {/* Quality Indicators */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Paragraphs:</span>
            <span className="text-white">{metrics.paragraphCount} ({metrics.avgWordsPerParagraph} words avg)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Script Formatting:</span>
            <span className={metrics.hasScriptFormatting ? 'text-red-400' : 'text-green-400'}>
              {metrics.hasScriptFormatting ? '❌ Yes (bad)' : '✅ No (good)'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Branching Options:</span>
            <span className="text-white">{metrics.branchingOptionsCount}</span>
          </div>
        </div>

        {/* Scene Previews */}
        <div className="space-y-4">
          <h6 className="text-lg font-semibold text-[#00FF99]">Scene Previews:</h6>
          {content.scenes?.map((scene: any, idx: number) => (
            <div key={idx} className="bg-black/50 p-4 rounded border border-[#00FF99]/10">
              <div className="text-[#00FF99] font-semibold mb-2">
                Scene {scene.sceneNumber}: {scene.title}
              </div>
              <div className="text-white/90 text-sm line-clamp-4">
                {scene.content.substring(0, 300)}...
              </div>
              <button
                onClick={() => {
                  const modal = document.getElementById(`scene-${label}-${idx}`)
                  if (modal) modal.classList.remove('hidden')
                }}
                className="text-[#00FF99] text-xs mt-2 hover:underline"
              >
                Read Full Scene →
              </button>

              {/* Full Scene Modal */}
              <div id={`scene-${label}-${idx}`} className="hidden fixed inset-0 bg-black/80 z-50 overflow-auto p-8">
                <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-[#00FF99]/20 rounded-lg p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#00FF99]">Scene {scene.sceneNumber}: {scene.title}</h3>
                    <button
                      onClick={() => {
                        const modal = document.getElementById(`scene-${label}-${idx}`)
                        if (modal) modal.classList.add('hidden')
                      }}
                      className="text-white hover:text-[#00FF99] text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {scene.content.split('\n\n').map((para: string, pIdx: number) => (
                      <p key={pIdx} className="text-white/90 mb-4 text-lg leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(18,18,18)] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#00FF99] mb-2">🧪 Model Comparison Test</h1>
          <p className="text-white/70 text-lg">
            GPT-4.1 vs Gemini 2.5 Pro - Which generates better narrative prose?
          </p>
        </div>

        {/* Run Test Button */}
        {!results && (
          <motion.button
            onClick={runTest}
            disabled={testing}
            className="bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,255,153,0.5)] transition-all"
            whileHover={{ scale: testing ? 1 : 1.05 }}
            whileTap={{ scale: testing ? 1 : 0.95 }}
          >
            {testing ? '🔄 Testing Both Models...' : '▶️ Run Comparison Test'}
          </motion.button>
        )}

        {/* Testing Indicator */}
        {testing && (
          <div className="mt-8 bg-[#1a1a1a] border border-[#00FF99]/20 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00FF99] mx-auto mb-4"></div>
            <p className="text-xl text-white/90">Testing both models in parallel...</p>
            <p className="text-sm text-white/60 mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-2">Test Failed</h3>
            <p className="text-red-300">{error}</p>
            <button
              onClick={runTest}
              className="mt-4 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded text-red-300"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-8 mt-8">
            {/* Comparison Summary */}
            <div className="bg-gradient-to-br from-[#00FF99]/20 to-transparent border border-[#00FF99] rounded-lg p-6">
              <h2 className="text-3xl font-bold text-[#00FF99] mb-6">📊 Comparison Results</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Speed Winner */}
                <div className="bg-black/30 p-6 rounded-lg">
                  <div className="text-[#00FF99] text-sm font-semibold mb-2">⚡ SPEED</div>
                  <div className="text-white text-2xl font-bold mb-1">{results.comparison.speed.faster}</div>
                  <div className="text-white/60 text-sm">
                    {results.comparison.speed.speedDifferencePercent}% faster
                  </div>
                  <div className="text-white/40 text-xs mt-2">
                    GPT: {(results.comparison.speed.gpt41Time / 1000).toFixed(1)}s | 
                    Gemini: {(results.comparison.speed.gemini25Time / 1000).toFixed(1)}s
                  </div>
                </div>

                {/* Content Length Winner */}
                <div className="bg-black/30 p-6 rounded-lg">
                  <div className="text-[#00FF99] text-sm font-semibold mb-2">📝 LENGTH</div>
                  <div className="text-white text-2xl font-bold mb-1">{results.comparison.contentLength.longer}</div>
                  <div className="text-white/60 text-sm">
                    {results.comparison.contentLength.lengthDifference} more words
                  </div>
                  <div className="text-white/40 text-xs mt-2">
                    GPT: {results.comparison.contentLength.gpt41Words}w | 
                    Gemini: {results.comparison.contentLength.gemini25Words}w
                  </div>
                </div>

                {/* Quality Winner */}
                <div className="bg-black/30 p-6 rounded-lg">
                  <div className="text-[#00FF99] text-sm font-semibold mb-2">⭐ QUALITY SCORE</div>
                  <div className="text-white text-2xl font-bold mb-1">{results.comparison.qualityScore.winner}</div>
                  <div className="text-white/60 text-sm">
                    Based on automated metrics
                  </div>
                  <div className="text-white/40 text-xs mt-2">
                    GPT: {results.comparison.qualityScore.gpt41} | 
                    Gemini: {results.comparison.qualityScore.gemini25}
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Results */}
            <div className="grid md:grid-cols-2 gap-6">
              {renderMetrics(results.gpt41, 'GPT-4.1')}
              {renderMetrics(results.gemini25, 'Gemini 2.5 Pro')}
            </div>

            {/* Run Another Test */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResults(null)
                  setError(null)
                }}
                className="bg-[#00FF99]/20 hover:bg-[#00FF99]/30 border border-[#00FF99] text-[#00FF99] px-6 py-3 rounded-lg font-semibold transition-all"
              >
                🔄 Run Another Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}










