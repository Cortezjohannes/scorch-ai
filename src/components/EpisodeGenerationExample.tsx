'use client'

import { useState } from 'react'
import EpisodeEngineLoader from './EpisodeEngineLoader'

interface StoryBible {
  seriesTitle: string
  genre: string
  premise: { premiseStatement: string }
  mainCharacters: Array<{ name: string; premiseRole: string; description: string }>
  narrativeArcs: Array<{ title: string; summary: string; episodes: Array<{ number: number; title: string; summary: string }> }>
}

export default function EpisodeGenerationExample() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [useEngines, setUseEngines] = useState(true)
  const [episodeNumber, setEpisodeNumber] = useState(1)
  const [generatedEpisode, setGeneratedEpisode] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock story bible for demo
  const mockStoryBible: StoryBible = {
    seriesTitle: 'The Mural Society',
    genre: 'drama',
    premise: { premiseStatement: 'Art can change a community, but at what cost?' },
    mainCharacters: [
      { name: 'Leo', premiseRole: 'protagonist', description: 'A passionate street artist' },
      { name: 'Jenna', premiseRole: 'ally', description: 'Leo\'s best friend and supporter' },
      { name: 'Cassie', premiseRole: 'antagonist', description: 'A strict school administrator' }
    ],
    narrativeArcs: [
      {
        title: 'The Beginning',
        summary: 'Leo starts his mural project',
        episodes: [
          { number: 1, title: 'First Stroke', summary: 'Leo begins his first mural' }
        ]
      }
    ]
  }

  const generateEpisode = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedEpisode(null)

    try {
      const response = await fetch('/api/generate/episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyBible: mockStoryBible,
          episodeNumber,
          useEngines
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setGeneratedEpisode(data.episode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Episode Generation Example</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Episode Number</label>
          <input
            type="number"
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(Number(e.target.value))}
            className="border rounded px-3 py-2"
            min="1"
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useEngines}
              onChange={(e) => setUseEngines(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Use Engines ({useEngines ? '5 steps' : '3 steps'})</span>
          </label>
        </div>
        
        <button
          onClick={generateEpisode}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Episode'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {generatedEpisode && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Episode Generated Successfully!</h3>
          <p><strong>Title:</strong> {generatedEpisode.title}</p>
          <p><strong>Synopsis:</strong> {generatedEpisode.synopsis}</p>
          <p><strong>Scenes:</strong> {generatedEpisode.scenes?.length || 0}</p>
          {generatedEpisode.murphyPillarMetadata && (
            <p><strong>Engines Used:</strong> {generatedEpisode.murphyPillarMetadata.enginesUsed?.join(', ')}</p>
          )}
        </div>
      )}

      {/* Episode Engine Loader */}
      <EpisodeEngineLoader
        open={isGenerating}
        episodeNumber={episodeNumber}
        seriesTitle={mockStoryBible.seriesTitle}
        useEngines={useEngines}
        onDone={() => {
          // This will be called when the simulated progress reaches 100%
          // In a real app, you might want to keep the loader open until the API actually responds
        }}
      />
    </div>
  )
} 