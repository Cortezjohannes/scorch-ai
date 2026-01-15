'use client'

import { useState } from 'react'

interface BehindTheScenesProps {
  videoUrl: string
}

export default function BehindTheScenes({ videoUrl }: BehindTheScenesProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const videoId = getVideoId(videoUrl)
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null

  if (!embedUrl) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">Invalid YouTube URL</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3 crt-text-glow">
            Greenlit Demo
          </h2>
          <p className="text-lg text-white/80">
            Greenlit is an AI showrunner that enables actors to create their own short form dramas in 3-4 weeks at the fraction of the cost.
          </p>
        </div>

        {/* Video Embed Container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
                <div className="text-white text-sm">Loading video...</div>
              </div>
            </div>
          )}
          
          <iframe
            src={embedUrl}
            title="Greenlit Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
            style={{
              border: '2px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
            }}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Description */}
        <div className="text-center mt-6">
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            See how Greenlit streamlines the entire production process from concept to screen.
          </p>
        </div>
      </div>
    </div>
  )
}

