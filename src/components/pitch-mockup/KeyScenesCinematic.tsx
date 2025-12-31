'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import type { KeyScenesSection } from '@/types/investor-materials'

interface KeyScenesCinematicProps {
  keyScenes: KeyScenesSection
}

export default function KeyScenesCinematic({ keyScenes }: KeyScenesCinematicProps) {
  const [selectedScene, setSelectedScene] = useState<string | null>(null)

  const scenes = [
    keyScenes.episode3,
    keyScenes.episode5,
    keyScenes.episode7,
    keyScenes.episode8
  ].filter(Boolean)

  const currentScene = selectedScene
    ? scenes.find((s) => s && `${s.episodeNumber}-${s.sceneNumber}` === selectedScene)
    : scenes[0]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-[#e2c376] mb-4">Key Scenes</h2>
        <p className="text-white/70 text-lg leading-relaxed">
          Critical moments that define the story. Each scene includes context and director's commentary.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scene List */}
          <div className="lg:col-span-1">
            <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-4">
              <h3 className="font-bold text-[#e2c376] mb-4">Scenes</h3>
              <div className="space-y-2">
                {scenes.map((scene) => {
                  if (!scene) return null
                  const sceneId = `${scene.episodeNumber}-${scene.sceneNumber}`
                  const isSelected = selectedScene === sceneId || (!selectedScene && scene === scenes[0])
                  return (
                    <button
                      key={sceneId}
                      onClick={() => setSelectedScene(sceneId)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-[#e2c376] text-black'
                          : 'bg-[#2a2a2a] text-white/80 hover:bg-[#36393f]'
                      }`}
                    >
                      <div className="font-semibold">Episode {scene.episodeNumber}</div>
                      <div className="text-xs opacity-70 mt-1">{scene.sceneTitle}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Scene Detail */}
          <div className="lg:col-span-3">
            {currentScene && (
              <motion.div
                key={`${currentScene.episodeNumber}-${currentScene.sceneNumber}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Scene Header */}
                <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-5xl font-black text-[#e2c376] mb-2">
                        Episode {currentScene.episodeNumber}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {currentScene.episodeTitle}
                      </div>
                      <div className="text-lg text-white/70">
                        Scene {currentScene.sceneNumber}: {currentScene.sceneTitle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context */}
                <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-[#e2c376] mb-4">Context</h3>
                  <p className="text-white/80 text-lg leading-relaxed">{currentScene.context}</p>
                </div>

                {/* Scene Excerpt */}
                <div className="bg-[#FAF9F6] text-black rounded-lg p-8 border-2 border-[#e2c376]">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">SCENE EXCERPT</div>
                    <div className="text-2xl font-bold">{currentScene.sceneTitle}</div>
                  </div>
                  <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {currentScene.excerpt}
                  </div>
                </div>

                {/* Director's Note */}
                <div className="bg-gradient-to-br from-[#e2c376]/20 to-[#e2c376]/10 border-2 border-[#e2c376] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎬</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#e2c376] mb-2">
                        Director's Note: Why It Matters
                      </h3>
                      <p className="text-white text-lg leading-relaxed">
                        {currentScene.whyItMatters}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emotional Beat */}
                <div className="bg-[#121212] border border-[#e2c376]/20 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#e2c376] mb-2">Emotional Beat</h3>
                  <p className="text-white/80 leading-relaxed">
                    This scene represents a pivotal moment in the character's journey, marking a
                    significant shift in their understanding of the world and their place in it.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





