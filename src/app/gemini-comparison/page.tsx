'use client'

import { useState } from 'react'

interface ComparisonResult {
  model: string
  success: boolean
  script: string
  responseTime: number
  metrics: {
    characterCount: number
    lineCount: number
    sceneCount: number
    dialogueCount: number
    actionLineCount: number
  }
  error?: string
}

interface ComparisonData {
  success: boolean
  scenario: string
  context: string
  results: {
    gemini3: ComparisonResult
    gemini25: ComparisonResult
  }
  comparison: {
    responseTimeDiff: number
    characterCountDiff: number
    sceneCountDiff: number
    dialogueCountDiff: number
  }
}

const TEST_SCENARIOS = [
  { id: 'standard', name: 'Standard Episode Script', description: 'Full episode with multiple scenes and dialogue' },
  { id: 'dialogue', name: 'Dialogue-Heavy Scene', description: 'Focus on natural conversation and character voice' },
  { id: 'action', name: 'Action Sequence', description: 'Fast-paced action with visual descriptions' },
  { id: 'character', name: 'Character-Driven Moment', description: 'Emotional depth and character development' },
]

export default function GeminiComparisonPage() {
  const [selectedScenario, setSelectedScenario] = useState('standard')
  const [customContext, setCustomContext] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<ComparisonData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runComparison = async () => {
    setTesting(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/test-script-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: useCustom ? null : selectedScenario,
          customPrompt: useCustom ? customPrompt : null,
          customContext: useCustom ? customContext : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Test failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        throw new Error(data.error || 'Comparison failed')
      }
    } catch (err) {
      console.error('❌ Comparison error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gemini 3 vs Gemini 2.5 Script Comparison</h1>
          <p className="text-gray-400">Compare script generation quality and performance between models</p>
        </div>

        {/* Test Configuration */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="space-y-4">
            {/* Scenario Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Test Scenario</label>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUseCustom(false)}
                  className={`px-4 py-2 rounded ${!useCustom ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-700 transition`}
                >
                  Preset Scenarios
                </button>
                <button
                  onClick={() => setUseCustom(true)}
                  className={`px-4 py-2 rounded ${useCustom ? 'bg-green-600' : 'bg-gray-700'} hover:bg-green-700 transition`}
                >
                  Custom Test
                </button>
              </div>

              {!useCustom ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TEST_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario.id)}
                      className={`p-4 rounded border text-left transition ${
                        selectedScenario === scenario.id
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold mb-1">{scenario.name}</div>
                      <div className="text-xs text-gray-400">{scenario.description}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Context</label>
                    <textarea
                      value={customContext}
                      onChange={(e) => setCustomContext(e.target.value)}
                      placeholder="Series context, characters, setting..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prompt</label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Script generation prompt..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                      rows={5}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={runComparison}
              disabled={testing || (useCustom && (!customPrompt || !customContext))}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition"
            >
              {testing ? '🔄 Running Comparison...' : '🚀 Run Comparison'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Comparison Summary */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Comparison Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Response Time</div>
                  <div className="text-2xl font-bold">
                    {results.comparison.responseTimeDiff > 0 ? '+' : ''}
                    {formatTime(results.comparison.responseTimeDiff)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Gemini 3 vs 2.5</div>
                </div>
                <div className="bg-gray-700/50 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Character Count</div>
                  <div className="text-2xl font-bold">
                    {results.comparison.characterCountDiff > 0 ? '+' : ''}
                    {results.comparison.characterCountDiff.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Difference</div>
                </div>
                <div className="bg-gray-700/50 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Scenes</div>
                  <div className="text-2xl font-bold">
                    {results.comparison.sceneCountDiff > 0 ? '+' : ''}
                    {results.comparison.sceneCountDiff}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Difference</div>
                </div>
                <div className="bg-gray-700/50 rounded p-4">
                  <div className="text-sm text-gray-400 mb-1">Dialogue Lines</div>
                  <div className="text-2xl font-bold">
                    {results.comparison.dialogueCountDiff > 0 ? '+' : ''}
                    {results.comparison.dialogueCountDiff}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Difference</div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gemini 3 Result */}
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Gemini 3 Pro Preview</h3>
                      <div className="text-sm opacity-90">
                        {results.results.gemini3.success ? '✅ Success' : '❌ Failed'}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(results.results.gemini3.script)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {results.results.gemini3.success ? (
                  <>
                    <div className="p-4 bg-gray-700/30 border-b border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Response Time:</span>
                          <span className="ml-2 font-semibold">{formatTime(results.results.gemini3.responseTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Characters:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini3.metrics.characterCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Lines:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini3.metrics.lineCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Scenes:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini3.metrics.sceneCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dialogue:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini3.metrics.dialogueCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Action Lines:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini3.metrics.actionLineCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">
                        {results.results.gemini3.script}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-red-400">
                    <p>Error: {results.results.gemini3.error}</p>
                  </div>
                )}
              </div>

              {/* Gemini 2.5 Result */}
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Gemini 2.5 Pro</h3>
                      <div className="text-sm opacity-90">
                        {results.results.gemini25.success ? '✅ Success' : '❌ Failed'}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(results.results.gemini25.script)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {results.results.gemini25.success ? (
                  <>
                    <div className="p-4 bg-gray-700/30 border-b border-gray-600">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Response Time:</span>
                          <span className="ml-2 font-semibold">{formatTime(results.results.gemini25.responseTime)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Characters:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini25.metrics.characterCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Lines:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini25.metrics.lineCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Scenes:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini25.metrics.sceneCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Dialogue:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini25.metrics.dialogueCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Action Lines:</span>
                          <span className="ml-2 font-semibold">{results.results.gemini25.metrics.actionLineCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">
                        {results.results.gemini25.script}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-red-400">
                    <p>Error: {results.results.gemini25.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

