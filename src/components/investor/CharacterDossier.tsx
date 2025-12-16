'use client'

import React, { useState } from 'react'
import type { CharacterProfile, RelationshipMap } from '@/types/investor-materials'
import InvestorLightbox from './shared/InvestorLightbox'

interface CharacterDossierProps {
  character: CharacterProfile
  relationships: RelationshipMap[]
  isOpen: boolean
  onClose: () => void
  characterImage?: string
  onGenerateImage?: (character: CharacterProfile) => void
}

export default function CharacterDossier({ 
  character, 
  relationships, 
  isOpen, 
  onClose,
  characterImage,
  onGenerateImage
}: CharacterDossierProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'conflicts' | 'relationships' | 'traits' | 'performance' | 'throughline' | 'physical' | 'voice'>('background')

  // Build tabs dynamically based on available data
  const tabs = [
    { id: 'background' as const, label: 'Background & Motivation' },
    { id: 'conflicts' as const, label: 'Conflicts & Arc' },
    { id: 'relationships' as const, label: 'Relationships' },
    { id: 'traits' as const, label: 'Key Traits' },
    ...(character.performanceReference ? [{ id: 'performance' as const, label: 'Performance Reference' }] : []),
    ...(character.throughLine ? [{ id: 'throughline' as const, label: 'Through Line' }] : []),
    ...(character.physicalWork ? [{ id: 'physical' as const, label: 'Physical Work' }] : []),
    ...(character.voicePatterns ? [{ id: 'voice' as const, label: 'Voice Patterns' }] : [])
  ]

  return (
    <InvestorLightbox
      isOpen={isOpen}
      onClose={onClose}
      title={character.name}
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Portrait & Stats */}
        <div className="md:col-span-1">
          <div className="relative w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-[#10B981]/30">
            {characterImage ? (
              <img
                src={characterImage}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-4xl font-bold text-white">
                {character.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            {!characterImage && character.imagePrompt && onGenerateImage && (
              <button
                onClick={() => onGenerateImage(character)}
                className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <span className="text-xs text-white font-semibold">Generate Image</span>
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Role</p>
              <p className="text-lg text-white">{character.role}</p>
            </div>
            {character.age && (
              <div>
                <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Age</p>
                <p className="text-lg text-white">{character.age}</p>
              </div>
            )}
            {character.throughLine?.superObjective && (
              <div>
                <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Super Objective</p>
                <p className="text-sm text-white/90 italic">{character.throughLine.superObjective}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Bio & Details */}
        <div className="md:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#10B981]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'background' && (
              <>
                <div>
                  <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Background</p>
                  <p className="text-white/90">{character.background}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Motivation</p>
                  <p className="text-white/90 font-semibold">{character.motivation}</p>
                </div>
                {character.throughLine?.explanation && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Character Through Line</p>
                    <p className="text-white/90">{character.throughLine.explanation}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'conflicts' && (
              <>
                {character.arc && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Character Arc</p>
                    <p className="text-white/90">{character.arc}</p>
                  </div>
                )}
                {character.conflicts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Key Conflicts</p>
                    <ul className="space-y-2">
                      {character.conflicts.map((conflict, idx) => (
                        <li key={idx} className="text-white/90">• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {character.keyScenes && character.keyScenes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Key Scenes</p>
                    <div className="space-y-2">
                      {character.keyScenes.map((scene, idx) => (
                        <div key={idx} className="p-3 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <p className="text-sm font-semibold text-white mb-1">Scene {scene.sceneNumber}</p>
                          <p className="text-xs text-white/70 mb-1">{scene.objective}</p>
                          <p className="text-xs text-[#10B981]">{scene.emotionalState}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'relationships' && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Key Relationships</p>
                <div className="space-y-4">
                  {relationships.map((rel, idx) => {
                    const otherChar = rel.character1 === character.name ? rel.character2 : rel.character1
                    return (
                      <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                        <p className="font-semibold text-white mb-1">{otherChar}</p>
                        <p className="text-sm text-white/70 mb-2">{rel.description}</p>
                        <p className="text-xs text-white/50">{rel.relationshipType}</p>
                        {rel.evolution && (
                          <p className="text-xs text-white/60 mt-2 italic">{rel.evolution}</p>
                        )}
                      </div>
                    )
                  })}
                  {relationships.length === 0 && (
                    <p className="text-white/50">No specific relationships defined</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'traits' && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Key Traits</p>
                <div className="flex flex-wrap gap-2">
                  {character.keyTraits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-sm text-[#10B981]"
                    >
                      {trait}
                    </span>
                  ))}
                  {character.keyTraits.length === 0 && (
                    <p className="text-white/50">No traits defined</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'performance' && character.performanceReference && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Performance References</p>
                <div className="space-y-4">
                  {character.performanceReference.map((ref, idx) => (
                    <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                      <p className="font-semibold text-white mb-1">{ref.characterName}</p>
                      <p className="text-sm text-white/70 mb-2">{ref.source}</p>
                      <p className="text-xs text-white/90">{ref.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'throughline' && character.throughLine && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Super Objective</p>
                <p className="text-lg text-white font-semibold mb-4">{character.throughLine.superObjective}</p>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Explanation</p>
                <p className="text-white/90">{character.throughLine.explanation}</p>
              </div>
            )}

            {activeTab === 'physical' && character.physicalWork && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Physical Character Work</p>
                <div className="space-y-4">
                  {character.physicalWork.posture && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Posture</p>
                      <p className="text-white/90">{character.physicalWork.posture}</p>
                    </div>
                  )}
                  {character.physicalWork.movement && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Movement</p>
                      <p className="text-white/90">{character.physicalWork.movement}</p>
                    </div>
                  )}
                  {character.physicalWork.gestures && character.physicalWork.gestures.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Key Gestures</p>
                      <ul className="space-y-1">
                        {character.physicalWork.gestures.map((gesture, idx) => (
                          <li key={idx} className="text-white/90 text-sm">• {gesture}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'voice' && character.voicePatterns && (
              <div>
                <p className="text-sm font-semibold mb-2 text-white/50 uppercase tracking-wider">Voice Patterns</p>
                <div className="space-y-4">
                  {character.voicePatterns.speechPattern && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Speech Pattern</p>
                      <p className="text-white/90">{character.voicePatterns.speechPattern}</p>
                    </div>
                  )}
                  {character.voicePatterns.vocalRange && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Vocal Range</p>
                      <p className="text-white/90">{character.voicePatterns.vocalRange}</p>
                    </div>
                  )}
                  {character.voicePatterns.emotionalRange && character.voicePatterns.emotionalRange.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-white/50 uppercase tracking-wider">Emotional Range</p>
                      <div className="flex flex-wrap gap-2">
                        {character.voicePatterns.emotionalRange.map((emotion, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-sm text-[#10B981]"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InvestorLightbox>
  )
}
