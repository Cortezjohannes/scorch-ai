'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface VideoGenerationRequest {
  shotDescription: string
  sceneContext: string
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  style: 'realistic' | 'cinematic' | 'documentary'
  quality: 'standard' | 'high'
  hasAudio?: boolean // Optional: only applies to quality mode
}

interface VideoResponse {
  videoUrl: string
  thumbnailUrl?: string
  success: boolean
  error?: string
  metadata?: {
    duration: number
    aspectRatio: string
    quality: string
    generationTime: number
    creditsUsed: number
    cost?: {
      amount: number
      currency: string
      mode: 'standard' | 'fast'
      hasAudio: boolean
    }
  }
}

export default function TestVEO3Page() {
  const [request, setRequest] = useState<VideoGenerationRequest>({
    shotDescription: 'A wide shot of a coffee shop interior, morning light streaming through windows, people sitting at tables',
    sceneContext: 'Opening scene of a character entering a coffee shop',
    duration: 8, // VEO 3.1 only supports 4, 6, or 8 seconds
    aspectRatio: '16:9',
    style: 'cinematic',
    quality: 'high',
    hasAudio: false // Default to no audio to save costs
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<VideoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [costEstimate, setCostEstimate] = useState<number | null>(null)

  // Calculate cost estimate
  // Note: Fast mode does NOT support audio, so hasAudio is always false for fast mode
  const calculateCost = (duration: number, hasAudio: boolean, useFastMode: boolean): number => {
    let costPerSecond: number
    if (useFastMode) {
      costPerSecond = 0.10 // Fast mode doesn't support audio, so always use no-audio pricing
    } else {
      costPerSecond = hasAudio ? 0.40 : 0.20
    }
    return duration * costPerSecond
  }

  // Update cost estimate when parameters change
  React.useEffect(() => {
    const useFastMode = request.quality === 'standard'
    // Fast mode doesn't support audio, so always false for fast mode
    // For quality mode, use the user's preference (defaults to false to save costs)
    const hasAudio = useFastMode ? false : (request.hasAudio ?? false)
    const cost = calculateCost(request.duration, hasAudio, useFastMode)
    setCostEstimate(cost)
  }, [request.duration, request.quality, request.hasAudio])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-veo3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotDescription: request.shotDescription,
          sceneContext: request.sceneContext,
          episodeId: 'test-episode',
          options: {
            duration: request.duration,
            aspectRatio: request.aspectRatio,
            style: request.style,
            quality: request.quality,
            hasAudio: request.quality === 'high' ? (request.hasAudio ?? false) : false // Only for quality mode
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      // If result has an error, also set it in error state for display
      if (data && !data.success && data.error) {
        setError(data.error)
      } else if (data && data.success) {
        setError(null) // Clear any previous errors on success
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate video'
      setError(errorMessage)
      setResult({
        success: false,
        error: errorMessage,
        videoUrl: ''
      })
      console.error('Video generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            VEO 3.1 Video Generation Test
          </h1>
          <p className="text-gray-400">Test Google VEO 3.1 video generation with cost tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#10B981]">Generation Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shot Description</label>
                <textarea
                  value={request.shotDescription}
                  onChange={(e) => setRequest({ ...request, shotDescription: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  rows={3}
                  placeholder="Describe the shot you want to generate..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Scene Context</label>
                <textarea
                  value={request.sceneContext}
                  onChange={(e) => setRequest({ ...request, sceneContext: e.target.value })}
                  className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  rows={2}
                  placeholder="Provide context about the scene..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <select
                    value={request.duration}
                    onChange={(e) => setRequest({ ...request, duration: parseInt(e.target.value) })}
                    className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="4">4 seconds</option>
                    <option value="6">6 seconds</option>
                    <option value="8">8 seconds</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">VEO 3.1 only supports 4, 6, or 8 seconds per clip</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Orientation</label>
                  <select
                    value={request.aspectRatio}
                    onChange={(e) => {
                      const newAspectRatio = e.target.value as any;
                      // Fast Mode now supports both 16:9 and 9:16 (per official documentation)
                      setRequest({ ...request, aspectRatio: newAspectRatio });
                    }}
                    className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="16:9">Horizontal (16:9)</option>
                    <option value="9:16">Vertical (9:16)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <select
                    value={request.style}
                    onChange={(e) => setRequest({ ...request, style: e.target.value as any })}
                    className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Generation Mode</label>
                  <select
                    value={request.quality}
                    onChange={(e) => {
                      const newQuality = e.target.value as any;
                      // Fast mode doesn't support audio, so disable it when switching to fast mode
                      setRequest({ 
                        ...request, 
                        quality: newQuality,
                        hasAudio: newQuality === 'standard' ? false : request.hasAudio
                      });
                    }}
                    className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="standard">Fast Mode</option>
                    <option value="high">Quality Mode</option>
                  </select>
                </div>
              </div>

              {/* Audio Toggle - Only for Quality Mode */}
              {request.quality === 'high' && (
                <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="block text-sm font-medium">Generate Audio</span>
                      <span className="text-xs text-gray-400">Adds $0.20/second to cost</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={request.hasAudio ?? false}
                      onChange={(e) => setRequest({ ...request, hasAudio: e.target.checked })}
                      className="w-5 h-5 rounded border-[#36393f] bg-[#1a1a1a] text-[#10B981] focus:ring-2 focus:ring-[#10B981]"
                    />
                  </label>
                </div>
              )}

              {/* Cost Estimate */}
              {costEstimate !== null && (
                <div className="bg-[#2a2a2a] border border-[#10B981]/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Estimated Cost</p>
                      <p className="text-2xl font-bold text-[#10B981]">${costEstimate.toFixed(2)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{request.duration}s × ${request.quality === 'standard' ? '0.10' : (request.hasAudio ? '0.40' : '0.20')}/sec</p>
                      <p className="text-xs mt-1">
                        {request.quality === 'standard' 
                          ? 'Fast Mode (no audio)' 
                          : request.hasAudio 
                            ? 'Quality Mode + Audio' 
                            : 'Quality Mode (no audio)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !request.shotDescription.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Video...
                  </>
                ) : (
                  <>
                    <span>🎬</span>
                    Generate Video
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#10B981]">Results</h2>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-400 font-semibold">Error</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-12 w-12 text-[#10B981] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">Generating video... This may take 60-90 seconds.</p>
              </div>
            )}

            {result && !result.success && result.error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-400 font-semibold">Generation Failed</p>
                <p className="text-red-300 text-sm mt-1">{result.error}</p>
              </div>
            )}

            {result && result.success && (
              <div className="space-y-4">
                {result.videoUrl && (
                  <div>
                    <div className="w-full rounded-lg bg-black overflow-hidden" style={{
                      aspectRatio: result.metadata?.aspectRatio === '9:16' ? '9/16' : 
                                   result.metadata?.aspectRatio === '16:9' ? '16/9' : 
                                   result.metadata?.aspectRatio === '1:1' ? '1/1' : 'auto',
                      maxWidth: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <video
                        src={result.videoUrl}
                        controls
                        className="w-full h-full object-contain rounded-lg"
                        autoPlay
                        loop
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Video load error:', e)
                          setError('Failed to load video. Please check the console for details.')
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      <p>Video URL: {result.videoUrl.substring(0, 80)}...</p>
                      {result.metadata?.aspectRatio && (
                        <p>Aspect Ratio: {result.metadata.aspectRatio}</p>
                      )}
                    </div>
                  </div>
                )}

                {result.metadata && (
                  <div className="bg-[#2a2a2a] rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-[#10B981]">Generation Metadata</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="ml-2">{result.metadata.duration}s</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Aspect Ratio:</span>
                        <span className="ml-2">{result.metadata.aspectRatio}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Quality:</span>
                        <span className="ml-2">{result.metadata.quality}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Generation Time:</span>
                        <span className="ml-2">{(result.metadata.generationTime / 1000).toFixed(1)}s</span>
                      </div>
                    </div>

                    {result.metadata.cost && (
                      <div className="mt-4 pt-4 border-t border-[#36393f]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Actual Cost</p>
                            <p className="text-2xl font-bold text-[#10B981]">${result.metadata.cost.amount.toFixed(2)}</p>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <p>{result.metadata.cost.mode} mode</p>
                            <p>{result.metadata.cost.hasAudio ? 'With audio' : 'Without audio'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.error && (
                  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            {!isGenerating && !result && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>Fill in the form and click "Generate Video" to test VEO 3.1</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#36393f] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#10B981]">VEO 3.1 Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Standard Mode</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• With audio: $0.40/second</li>
                <li>• Without audio: $0.20/second</li>
                <li className="text-white mt-2">8s video = $3.20 (with audio)</li>
              </ul>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h3 className="font-semibold mb-2">Fast Mode</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• With audio: $0.15/second</li>
                <li>• Without audio: $0.10/second</li>
                <li className="text-white mt-2">8s video = $1.20 (with audio)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

