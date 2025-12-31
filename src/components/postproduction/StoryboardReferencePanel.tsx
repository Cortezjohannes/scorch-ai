'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StoryboardFrame {
  id: string
  shotNumber: number
  frameImage?: string
  description?: string
  cameraAngle?: string
  notes?: string
}

interface StoryboardReferencePanelProps {
  storyboardFrame: StoryboardFrame | null
  shotNumber: number
  sceneNumber: number
}

export function StoryboardReferencePanel({
  storyboardFrame,
  shotNumber,
  sceneNumber
}: StoryboardReferencePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#2b2d31] rounded-lg overflow-hidden border border-[#36393f] hover:border-[#e2c376]/50 transition-colors"
    >
      {/* Storyboard Image */}
      <div className="aspect-video bg-[#1a1a1a] relative">
        {storyboardFrame?.frameImage ? (
          <img
            src={storyboardFrame.frameImage}
            alt={`Scene ${sceneNumber} Shot ${shotNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-xs">No image</div>
            </div>
          </div>
        )}
        
        {/* Shot Number Badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Shot {shotNumber}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-xs text-gray-400 mb-1">
          Scene {sceneNumber}
        </div>
        {storyboardFrame?.cameraAngle && (
          <div className="text-xs text-gray-300 mb-1">
            {storyboardFrame.cameraAngle}
          </div>
        )}
        {storyboardFrame?.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
            {storyboardFrame.description}
          </p>
        )}
        {!storyboardFrame && (
          <p className="text-xs text-gray-500 italic">
            No storyboard reference available
          </p>
        )}
      </div>
    </motion.div>
  )
}

