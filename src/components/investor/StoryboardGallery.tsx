'use client'

import React, { useState } from 'react'
import type { StoryboardFrame } from '@/types/investor-materials'

interface StoryboardGalleryProps {
  frames: StoryboardFrame[]
}

export default function StoryboardGallery({ frames }: StoryboardGalleryProps) {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null)

  if (frames.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        No storyboard frames available
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frames.map((frame, idx) => (
          <div
            key={idx}
            className="bg-[#121212] rounded-xl overflow-hidden border border-[#10B981]/20 hover:border-[#10B981]/40 transition-colors cursor-pointer"
            onClick={() => setSelectedFrame(idx)}
          >
            {frame.imageUrl ? (
              <img
                src={frame.imageUrl}
                alt={frame.description}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-[#0A0A0A] flex items-center justify-center">
                <span className="text-white/30">No image</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#10B981] text-xs font-semibold">
                  Scene {frame.sceneNumber} • Shot {frame.shotNumber}
                </span>
                <span className="text-white/50 text-xs">
                  {frame.cameraAngle}
                </span>
              </div>
              <p className="text-white/80 text-sm mb-2 line-clamp-2">
                {frame.description}
              </p>
              {frame.dialogueSnippet && (
                <p className="text-white/60 text-xs italic">
                  "{frame.dialogueSnippet}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for selected frame */}
      {selectedFrame !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFrame(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#121212] rounded-xl overflow-hidden border border-[#10B981]/20"
            onClick={(e) => e.stopPropagation()}
          >
            {frames[selectedFrame].imageUrl && (
              <img
                src={frames[selectedFrame].imageUrl}
                alt={frames[selectedFrame].description}
                className="w-full h-auto"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#10B981] font-semibold">
                  Scene {frames[selectedFrame].sceneNumber} • Shot {frames[selectedFrame].shotNumber}
                </span>
                <button
                  onClick={() => setSelectedFrame(null)}
                  className="text-white/50 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/80 mb-4">{frames[selectedFrame].description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Camera Angle:</span>
                  <p className="text-white/80">{frames[selectedFrame].cameraAngle}</p>
                </div>
                <div>
                  <span className="text-white/50">Movement:</span>
                  <p className="text-white/80">{frames[selectedFrame].cameraMovement}</p>
                </div>
              </div>
              {frames[selectedFrame].dialogueSnippet && (
                <div className="mt-4 p-4 bg-[#0A0A0A] rounded-lg">
                  <p className="text-white/70 italic">"{frames[selectedFrame].dialogueSnippet}"</p>
                </div>
              )}
              {frames[selectedFrame].visualNotes && (
                <div className="mt-4">
                  <span className="text-white/50 text-sm">Notes:</span>
                  <p className="text-white/70 text-sm">{frames[selectedFrame].visualNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

