'use client'

import { useState } from 'react'
import EpisodeEngineLoader from './EpisodeEngineLoader'

export default function EpisodeEngineLoaderDemo() {
  const [showLoader, setShowLoader] = useState(false)
  const [useEngines, setUseEngines] = useState(true)
  const [episodeNumber, setEpisodeNumber] = useState(1)
  const [seriesTitle, setSeriesTitle] = useState('Test Series')

  const handleGenerate = () => {
    setShowLoader(true)
    // Simulate API call
    setTimeout(() => {
      setShowLoader(false)
    }, 8000) // 8 seconds demo
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Episode Engine Loader Demo</h1>
      
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
          <label className="block text-sm font-medium mb-2">Series Title</label>
          <input
            type="text"
            value={seriesTitle}
            onChange={(e) => setSeriesTitle(e.target.value)}
            className="border rounded px-3 py-2 w-full"
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
            <span className="text-sm font-medium">Use Engines (5 steps vs 3 steps)</span>
          </label>
        </div>
        
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Generate Episode
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>• Engines ON: Shows 5 steps (Narrative Blueprint → Strategic Dialogue → Tension Escalation → Choice Quality → Final Synthesis)</p>
        <p>• Engines OFF: Shows 3 steps (Narrative Blueprint → Story-Bible Synthesis → Final Polish)</p>
        <p>• Timer shows MM:SS format</p>
        <p>• Progress bar advances through steps</p>
        <p>• Active step pulses with ⚡, completed steps show ✅</p>
      </div>

      <EpisodeEngineLoader
        open={showLoader}
        episodeNumber={episodeNumber}
        seriesTitle={seriesTitle}
        useEngines={useEngines}
        onDone={() => setShowLoader(false)}
      />
    </div>
  )
} 