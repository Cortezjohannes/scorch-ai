'use client'

import React, { useState, useEffect, useMemo } from 'react'
import type { CharacterProfile, CharacterProfileDetailed, CharacterProfileLight, RelationshipMap, VisualsSection, StoryboardFrame } from '@/types/investor-materials'
import { getCharacterDetails } from '@/services/investor-link-service'
import InvestorLightbox from './shared/InvestorLightbox'

interface CharacterDossierProps {
  character: CharacterProfile | CharacterProfileLight
  relationships: RelationshipMap[]
  isOpen: boolean
  onClose: () => void
  characterImage?: string
  onGenerateImage?: (character: CharacterProfile) => void
  linkId?: string // Required for fetching detailed data
  visuals?: VisualsSection // Storyboard frames for matching to key scenes
}

export default function CharacterDossier({ 
  character, 
  relationships, 
  isOpen, 
  onClose,
  characterImage,
  onGenerateImage,
  linkId,
  visuals
}: CharacterDossierProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'lore' | 'scenework' | 'physical' | 'practice'>('overview')
  const [detailedCharacter, setDetailedCharacter] = useState<CharacterProfileDetailed | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  
  // Check if character has detailed data available
  const hasDetailedData = (character as CharacterProfileLight).hasDetailedData || false
  
  // Fetch detailed character data when dossier is opened
  useEffect(() => {
    if (isOpen && hasDetailedData && linkId && !detailedCharacter) {
      setIsLoadingDetails(true)
      getCharacterDetails(linkId, character.name)
        .then(details => {
          if (details) {
            setDetailedCharacter(details)
          }
        })
        .catch(error => {
          console.error('Error fetching character details:', error)
        })
        .finally(() => {
          setIsLoadingDetails(false)
        })
    }
  }, [isOpen, hasDetailedData, linkId, character.name, detailedCharacter])
  
  // Reset detailed data when dossier is closed
  useEffect(() => {
    if (!isOpen) {
      setDetailedCharacter(null)
    }
  }, [isOpen])
  
  // Use detailed character if available, otherwise use the lightweight version
  const displayCharacter: CharacterProfileDetailed = detailedCharacter || (character as CharacterProfileDetailed)

  // Helper function to find storyboard frames for a key scene
  const getFramesForScene = useMemo(() => {
    return (episodeNumber: number, sceneNumber: number): StoryboardFrame[] => {
      if (!visuals || !visuals.episodes) return []
      
      const episode = visuals.episodes[episodeNumber]
      if (!episode || !episode.scenes) return []
      
      const scene = episode.scenes.find(s => s.sceneNumber === sceneNumber)
      if (!scene || !scene.frames) return []
      
      // Return frames that have images
      return scene.frames.filter(frame => frame.imageUrl)
    }
  }, [visuals])

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'lore' as const, label: 'Lore' },
    { id: 'scenework' as const, label: 'Scenework' },
    { id: 'physical' as const, label: 'Physical & Voice' },
    { id: 'practice' as const, label: 'Practice' }
  ]

  return (
    <InvestorLightbox
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="full"
    >
      <div className="bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F] -m-6 p-8 rounded-lg">
        {/* Magazine-Style Hero Header */}
        <div className="text-center mb-10 pb-8 border-b-2 border-[#10B981]/30">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            {character.name}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#10B981]/50"></div>
            <span className="px-4 py-1.5 bg-[#10B981]/20 text-[#10B981] font-bold text-sm uppercase tracking-widest rounded-full">
              {character.role}
            </span>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#10B981]/50"></div>
          </div>
          {displayCharacter.throughLine?.superObjective && (
            <p className="text-lg text-white/80 italic max-w-3xl mx-auto leading-relaxed">
              "{displayCharacter.throughLine.superObjective}"
            </p>
          )}
        </div>

        {/* Portrait Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-[#10B981]/30 shadow-2xl flex-shrink-0">
            {characterImage ? (
              <img
                src={characterImage}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-5xl font-black text-white">
                {character.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            {!characterImage && character.imagePrompt && onGenerateImage && 'name' in character && (
              <button
                onClick={() => onGenerateImage(character as CharacterProfile)}
                className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <span className="text-sm text-white font-semibold">Generate Image</span>
              </button>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
            {displayCharacter.age && (
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Age</p>
                <p className="text-2xl font-bold text-white">{displayCharacter.age}</p>
              </div>
            )}
            {character.role && (
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Role</p>
                <p className="text-xl font-semibold text-white">{character.role}</p>
              </div>
            )}
            {displayCharacter.keyTraits && displayCharacter.keyTraits.length > 0 && (
              <div className="text-center md:text-left col-span-2 md:col-span-1">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Key Traits</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {displayCharacter.keyTraits.slice(0, 3).map((trait, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs font-semibold text-white bg-white/10 rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Magazine-Style Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 border-b-2 border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-widest relative whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#10B981]'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#10B981]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div>

          {/* Tab Content - Magazine Style */}
          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Character Study Guide */}
                {displayCharacter.studyGuide && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Character Study Guide</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                    </div>
          <div className="space-y-4">
                      {displayCharacter.studyGuide.background && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Background</h4>
                          <p className="text-white/90">{displayCharacter.studyGuide.background}</p>
                        </div>
                      )}
                      
                      {displayCharacter.studyGuide.motivations && displayCharacter.studyGuide.motivations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Motivations</h4>
                          <ul className="space-y-1">
                            {displayCharacter.studyGuide.motivations.map((motivation, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {motivation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.studyGuide.characterArc && (
                <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Character Arc</h4>
                          <p className="text-white/90">{displayCharacter.studyGuide.characterArc}</p>
                </div>
                      )}
                      
                      {displayCharacter.studyGuide.internalConflicts && displayCharacter.studyGuide.internalConflicts.length > 0 && (
                <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Internal Conflicts</h4>
                          <ul className="space-y-1">
                            {displayCharacter.studyGuide.internalConflicts.map((conflict, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {conflict}</li>
                            ))}
                          </ul>
                </div>
                      )}
                      
                      {displayCharacter.studyGuide.relationships && displayCharacter.studyGuide.relationships.length > 0 && (
                  <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Key Relationships</h4>
                          <div className="space-y-2">
                            {displayCharacter.studyGuide.relationships.map((rel, idx) => (
                              <div key={idx} className="p-3 bg-[#121212] rounded-lg border border-[#10B981]/20">
                                <p className="font-semibold text-white text-sm mb-1">{rel.characterName}</p>
                                <p className="text-white/70 text-xs">{rel.relationship}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Performance Reference */}
                {displayCharacter.performanceReference && displayCharacter.performanceReference.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Performance Reference</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                    </div>
                    <div className="space-y-4">
                      {displayCharacter.performanceReference.map((ref, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <p className="font-semibold text-white mb-1">{ref.characterName}</p>
                          <p className="text-sm text-white/70 mb-2 italic">from <em>{ref.source}</em></p>
                          <p className="text-sm text-white/80 mb-2">{ref.reason}</p>
                          {ref.sceneExample && (
                            <p className="text-xs text-white/60">Scene to watch: {ref.sceneExample}</p>
                          )}
                          {ref.keySimilarities && ref.keySimilarities.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-white/50 mb-1">Key Similarities:</p>
                              <ul className="list-disc list-inside text-xs text-white/70">
                                {ref.keySimilarities.map((similarity, simIdx) => (
                                  <li key={simIdx}>{similarity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Through Line / Super-Objective */}
                {displayCharacter.throughLine && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Through Line</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                    </div>
                    <div className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                      <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Super Objective</h4>
                      <p className="text-lg text-white font-semibold mb-4">{displayCharacter.throughLine.superObjective}</p>
                      {displayCharacter.throughLine.explanation && (
                        <>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Explanation</h4>
                          <p className="text-white/90">{displayCharacter.throughLine.explanation}</p>
                        </>
                      )}
                      {displayCharacter.throughLine.keyScenes && displayCharacter.throughLine.keyScenes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Key Scenes</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayCharacter.throughLine.keyScenes.map((sceneNum, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[#10B981]/10 rounded-full text-sm text-[#10B981]">
                                Scene {sceneNum}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Relationship Map */}
                {displayCharacter.relationshipMapActor && displayCharacter.relationshipMapActor.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Relationship Map</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                    </div>
                    <div className="space-y-4">
                      {displayCharacter.relationshipMapActor.map((rel, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-white">{rel.characterName}</p>
                            <span className="px-2 py-1 bg-[#10B981]/10 rounded text-xs text-[#10B981] capitalize">
                              {rel.relationshipType}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 mb-3">{rel.description}</p>
                          
                          {rel.keyMoments && rel.keyMoments.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-semibold text-white/50 mb-2 uppercase">Key Moments</h5>
                              <div className="space-y-1">
                                {rel.keyMoments.map((moment, mIdx) => (
                                  <div key={mIdx} className="text-xs text-white/70">
                                    <span className="text-[#10B981]">Ep {moment.episodeNumber}, Scene {moment.sceneNumber}:</span> {moment.moment}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {rel.evolution && (
                            <div className="pt-3 border-t border-white/10">
                              <h5 className="text-xs font-semibold text-white/50 mb-1 uppercase">Evolution</h5>
                              <p className="text-xs text-white/70 italic">{rel.evolution}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {!displayCharacter.studyGuide && !displayCharacter.performanceReference && !displayCharacter.throughLine && (!displayCharacter.relationshipMapActor || displayCharacter.relationshipMapActor.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-white/50">
                      Actor materials not yet generated for this character. Generate in Pre-Production.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Lore Tab - Physiology, Sociology, Psychology */}
            {activeTab === 'lore' && (
              <div className="space-y-8">
                {/* Physiology Section */}
                {displayCharacter.physiology && (
              <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Physiology</h3>
                <div className="space-y-4">
                      {displayCharacter.physiology.appearance && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Appearance</h4>
                          <p className="text-white">{displayCharacter.physiology.appearance}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {displayCharacter.physiology.gender && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Gender</h4>
                            <p className="text-white">{displayCharacter.physiology.gender}</p>
                          </div>
                        )}
                        {displayCharacter.physiology.height && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Height</h4>
                            <p className="text-white">{displayCharacter.physiology.height}</p>
                          </div>
                        )}
                        {displayCharacter.physiology.build && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Build</h4>
                            <p className="text-white">{displayCharacter.physiology.build}</p>
                          </div>
                        )}
                        {displayCharacter.physiology.health && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Health</h4>
                            <p className="text-white">{displayCharacter.physiology.health}</p>
                          </div>
                        )}
                      </div>
                      
                      {displayCharacter.physiology.physicalTraits && displayCharacter.physiology.physicalTraits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Physical Traits</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayCharacter.physiology.physicalTraits.map((trait, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[#10B981]/10 rounded-full text-sm text-white">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {displayCharacter.physiology.defects && displayCharacter.physiology.defects.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Physical Limitations</h4>
                          <ul className="list-disc list-inside text-white/80 text-sm">
                            {displayCharacter.physiology.defects.map((defect, idx) => (
                              <li key={idx}>{defect}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.physiology.heredity && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Heredity</h4>
                          <p className="text-white/80 text-sm">{displayCharacter.physiology.heredity}</p>
                        </div>
                  )}
                </div>
              </div>
            )}

                {/* Sociology Section */}
                {displayCharacter.sociology && (
                  <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Sociology</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {displayCharacter.sociology.class && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Social Class</h4>
                            <p className="text-white capitalize">{displayCharacter.sociology.class}</p>
                          </div>
                        )}
                        {displayCharacter.sociology.occupation && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Occupation</h4>
                            <p className="text-white">{displayCharacter.sociology.occupation}</p>
                          </div>
                        )}
                        {displayCharacter.sociology.education && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Education</h4>
                            <p className="text-white">{displayCharacter.sociology.education}</p>
                          </div>
                        )}
                        {displayCharacter.sociology.economicStatus && (
                          <div>
                            <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Economic Status</h4>
                            <p className="text-white">{displayCharacter.sociology.economicStatus}</p>
                          </div>
                        )}
                      </div>
                      
                      {displayCharacter.sociology.homeLife && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Home Life</h4>
                          <p className="text-white">{displayCharacter.sociology.homeLife}</p>
                        </div>
                      )}
                      
                      {displayCharacter.sociology.hobbies && displayCharacter.sociology.hobbies.length > 0 && (
              <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Hobbies & Interests</h4>
                <div className="flex flex-wrap gap-2">
                            {displayCharacter.sociology.hobbies.map((hobby, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white">
                                {hobby}
                    </span>
                  ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {displayCharacter.sociology.religion && (
                          <div>
                            <h4 className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">Religion</h4>
                            <p className="text-white/90">{displayCharacter.sociology.religion}</p>
                          </div>
                        )}
                        {displayCharacter.sociology.nationality && (
                          <div>
                            <h4 className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">Nationality</h4>
                            <p className="text-white/90">{displayCharacter.sociology.nationality}</p>
                          </div>
                        )}
                        {displayCharacter.sociology.politicalAffiliation && (
                          <div>
                            <h4 className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wider">Politics</h4>
                            <p className="text-white/90">{displayCharacter.sociology.politicalAffiliation}</p>
                          </div>
                        )}
                      </div>
                      
                      {displayCharacter.sociology.familyRelationships && displayCharacter.sociology.familyRelationships.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Family Relationships</h4>
                          <ul className="list-disc list-inside text-white/80 text-sm">
                            {displayCharacter.sociology.familyRelationships.map((rel, idx) => (
                              <li key={idx}>{rel}</li>
                            ))}
                          </ul>
                        </div>
                  )}
                </div>
              </div>
            )}

                {/* Psychology Section */}
                {displayCharacter.psychology && (
              <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Psychology</h3>
                <div className="space-y-4">
                      {(displayCharacter.psychology.coreValue || displayCharacter.psychology.opposingValue) && (
                        <div className="grid grid-cols-2 gap-4">
                          {displayCharacter.psychology.coreValue && (
                            <div className="p-3 bg-[#10B981]/10 rounded-lg">
                              <h4 className="text-sm font-semibold text-[#10B981] mb-1">Core Value</h4>
                              <p className="text-white">{displayCharacter.psychology.coreValue}</p>
                            </div>
                          )}
                          {displayCharacter.psychology.opposingValue && (
                            <div className="p-3 bg-[#EF4444]/10 rounded-lg">
                              <h4 className="text-sm font-semibold text-[#EF4444] mb-1">Opposing Value</h4>
                              <p className="text-white">{displayCharacter.psychology.opposingValue}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(displayCharacter.psychology.want || displayCharacter.psychology.need) && (
                        <div className="grid grid-cols-2 gap-4">
                          {displayCharacter.psychology.want && (
                            <div>
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Want (External Goal)</h4>
                              <p className="text-white">{displayCharacter.psychology.want}</p>
                            </div>
                          )}
                          {displayCharacter.psychology.need && (
                            <div>
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Need (Internal Lesson)</h4>
                              <p className="text-white">{displayCharacter.psychology.need}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {displayCharacter.psychology.primaryFlaw && (
                        <div className="p-3 bg-[#F59E0B]/10 rounded-lg">
                          <h4 className="text-sm font-semibold text-[#F59E0B] mb-1">Primary Flaw</h4>
                          <p className="text-white">{displayCharacter.psychology.primaryFlaw}</p>
                    </div>
                      )}
                      
                      {displayCharacter.psychology.secondaryFlaws && displayCharacter.psychology.secondaryFlaws.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Secondary Flaws</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayCharacter.psychology.secondaryFlaws.map((flaw, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[#F59E0B]/10 rounded-full text-sm text-[#F59E0B]">
                                {flaw}
                              </span>
                  ))}
                </div>
              </div>
            )}

                      {displayCharacter.psychology.temperament && displayCharacter.psychology.temperament.length > 0 && (
              <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Temperament</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayCharacter.psychology.temperament.map((temp, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white">
                                {temp}
                              </span>
                            ))}
                          </div>
              </div>
            )}

                      {displayCharacter.psychology.fears && displayCharacter.psychology.fears.length > 0 && (
              <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Fears</h4>
                          <ul className="list-disc list-inside text-white/80 text-sm">
                            {displayCharacter.psychology.fears.map((fear, idx) => (
                              <li key={idx}>{fear}</li>
                            ))}
                          </ul>
                    </div>
                  )}
                      
                      {displayCharacter.psychology.childhood && (
                    <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Childhood / Formative Experiences</h4>
                          <p className="text-white/80 text-sm">{displayCharacter.psychology.childhood}</p>
                    </div>
                  )}
                      
                      {displayCharacter.psychology.trauma && displayCharacter.psychology.trauma.length > 0 && (
                    <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Trauma</h4>
                          <ul className="list-disc list-inside text-white/80 text-sm">
                            {displayCharacter.psychology.trauma.map((t, idx) => (
                              <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

                {/* Empty State */}
                {!displayCharacter.physiology && !displayCharacter.sociology && !displayCharacter.psychology && (
                  <div className="text-center py-12">
                    <p className="text-white/50">
                      3D character data not yet generated. Create detailed characters in Story Bible.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scenework Tab - GOTE Analysis & Scene Breakdowns */}
            {activeTab === 'scenework' && (
              <div className="space-y-6">
                {/* GOTE Analysis */}
                {displayCharacter.gotAnalysis && displayCharacter.gotAnalysis.length > 0 && (
              <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">GOTE Analysis</h3>
                <div className="space-y-4">
                      {displayCharacter.gotAnalysis.map((gote, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#10B981]/20 rounded-full text-xs text-[#10B981] font-semibold">
                              Episode {gote.episodeNumber} • Scene {gote.sceneNumber}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Goal</h4>
                              <p className="text-white/90 text-sm">{gote.goal}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Obstacle</h4>
                              <p className="text-white/90 text-sm">{gote.obstacle}</p>
                            </div>
                          </div>
                          
                          {gote.tactics && gote.tactics.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Tactics</h4>
                              <ul className="space-y-1">
                                {gote.tactics.map((tactic, tIdx) => (
                                  <li key={tIdx} className="text-white/90 text-sm">• {tactic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {gote.expectation && (
                            <div className="mt-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Expectation</h4>
                              <p className="text-white/90 text-sm">{gote.expectation}</p>
                            </div>
                          )}
                          
                          {gote.techniqueNotes && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <h4 className="text-xs font-semibold text-white/50 mb-1 uppercase">Technique Notes</h4>
                              <p className="text-white/70 text-xs">{gote.techniqueNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene Breakdowns */}
                {displayCharacter.sceneBreakdowns && displayCharacter.sceneBreakdowns.length > 0 && (
                    <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Scene Breakdowns</h3>
                    <div className="space-y-4">
                      {displayCharacter.sceneBreakdowns.map((breakdown, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#10B981]/20 rounded-full text-xs text-[#10B981] font-semibold">
                              Episode {breakdown.episodeNumber} • Scene {breakdown.sceneNumber}
                            </span>
                            {breakdown.emotionalState && (
                              <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/70">
                                {breakdown.emotionalState}
                              </span>
                            )}
                          </div>
                          
                          {breakdown.objective && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Objective</h4>
                              <p className="text-white/90 text-sm">{breakdown.objective}</p>
                            </div>
                          )}
                          
                          {breakdown.tactics && breakdown.tactics.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Tactics</h4>
                              <ul className="space-y-1">
                                {breakdown.tactics.map((tactic, tIdx) => (
                                  <li key={tIdx} className="text-white/90 text-sm">• {tactic}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {breakdown.keyLines && breakdown.keyLines.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Key Lines</h4>
                              <div className="space-y-2">
                                {breakdown.keyLines.map((line, lIdx) => (
                                  <div key={lIdx} className="p-2 bg-white/5 rounded text-sm text-white/80 italic">
                                    "{line}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {breakdown.subtext && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Subtext</h4>
                              <p className="text-white/80 text-sm italic">{breakdown.subtext}</p>
                            </div>
                          )}
                          
                          {breakdown.techniqueNotes && (
                            <div className="pt-3 border-t border-white/10">
                              <h4 className="text-xs font-semibold text-white/50 mb-1 uppercase">Technique Notes</h4>
                              <p className="text-white/70 text-xs">{breakdown.techniqueNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!displayCharacter.gotAnalysis || displayCharacter.gotAnalysis.length === 0) && 
                 (!displayCharacter.sceneBreakdowns || displayCharacter.sceneBreakdowns.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-white/50">
                      Actor materials not yet generated for this character. Generate in Pre-Production.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Physical & Voice Tab */}
            {activeTab === 'physical' && (
              <div className="space-y-6">
                {/* Physical Character Work */}
                {displayCharacter.physicalWork && (
                  <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Physical Character Work</h3>
                    <div className="space-y-4">
                      {displayCharacter.physicalWork.bodyLanguage && displayCharacter.physicalWork.bodyLanguage.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Body Language</h4>
                          <ul className="space-y-1">
                            {displayCharacter.physicalWork.bodyLanguage.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.physicalWork.movement && displayCharacter.physicalWork.movement.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Movement</h4>
                          <ul className="space-y-1">
                            {displayCharacter.physicalWork.movement.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.physicalWork.posture && displayCharacter.physicalWork.posture.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Posture</h4>
                          <ul className="space-y-1">
                            {displayCharacter.physicalWork.posture.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                    </div>
                  )}
                      
                      {displayCharacter.physicalWork.transformationNotes && (
                    <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Transformation Notes</h4>
                          <p className="text-white/80 text-sm">{displayCharacter.physicalWork.transformationNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Voice & Speech Patterns */}
                {displayCharacter.voicePatterns && (
                  <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Voice & Speech Patterns</h3>
                    <div className="space-y-4">
                      {displayCharacter.voicePatterns.rhythm && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Rhythm</h4>
                          <p className="text-white/90">{displayCharacter.voicePatterns.rhythm}</p>
                        </div>
                      )}
                      
                      {displayCharacter.voicePatterns.accent && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-1 uppercase tracking-wider">Accent</h4>
                          <p className="text-white/90">{displayCharacter.voicePatterns.accent}</p>
                        </div>
                      )}
                      
                      {displayCharacter.voicePatterns.vocabulary && displayCharacter.voicePatterns.vocabulary.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Vocabulary</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayCharacter.voicePatterns.vocabulary.map((word, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[#10B981]/10 rounded-full text-sm text-white">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {displayCharacter.voicePatterns.keyPhrases && displayCharacter.voicePatterns.keyPhrases.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Key Phrases</h4>
                          <div className="space-y-2">
                            {displayCharacter.voicePatterns.keyPhrases.map((phrase, idx) => (
                              <div key={idx} className="p-2 bg-white/5 rounded text-sm text-white/80 italic">
                                "{phrase}"
                              </div>
                            ))}
                          </div>
                    </div>
                  )}
                      
                      {displayCharacter.voicePatterns.verbalTics && displayCharacter.voicePatterns.verbalTics.length > 0 && (
                    <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Verbal Tics</h4>
                      <div className="flex flex-wrap gap-2">
                            {displayCharacter.voicePatterns.verbalTics.map((tic, idx) => (
                              <span key={idx} className="px-3 py-1 bg-[#F59E0B]/10 rounded-full text-sm text-[#F59E0B]">
                                {tic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                  </div>
                )}

                {/* Empty State */}
                {!displayCharacter.physicalWork && !displayCharacter.voicePatterns && (
                  <div className="text-center py-12">
                    <p className="text-white/50">
                      Actor materials not yet generated for this character. Generate in Pre-Production.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Practice Tab - Monologues, Key Scenes, On-Set Prep */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {/* Monologue Practice */}
                {displayCharacter.monologues && displayCharacter.monologues.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">Monologue Practice</h3>
                    <div className="space-y-4">
                      {displayCharacter.monologues.map((monologue, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] rounded-lg border border-[#10B981]/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#10B981]/20 rounded-full text-xs text-[#10B981] font-semibold">
                              Episode {monologue.episodeNumber} • Scene {monologue.sceneNumber}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Text</h4>
                            <div className="p-4 bg-white/5 rounded-lg">
                              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{monologue.text}</p>
                            </div>
                          </div>
                          
                          {monologue.emotionalBeats && monologue.emotionalBeats.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Emotional Beats</h4>
                              <div className="space-y-2">
                                {monologue.emotionalBeats.map((beat, bIdx) => (
                                  <div key={bIdx} className="flex items-start gap-3">
                                    <span className="px-2 py-1 bg-[#EC4899]/20 rounded text-xs text-[#EC4899] font-semibold shrink-0">
                                      {beat.emotion}
                                    </span>
                                    <p className="text-white/80 text-sm italic flex-1">"{beat.line}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {monologue.practiceNotes && monologue.practiceNotes.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Practice Notes</h4>
                              <ul className="space-y-1">
                                {monologue.practiceNotes.map((note, nIdx) => (
                                  <li key={nIdx} className="text-white/90 text-sm">• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {monologue.performanceTips && monologue.performanceTips.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Performance Tips</h4>
                              <ul className="space-y-1">
                                {monologue.performanceTips.map((tip, tIdx) => (
                                  <li key={tIdx} className="text-white/90 text-sm">• {tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Scenes - Magazine Style with Storyboard Frames */}
                {displayCharacter.keyScenes && displayCharacter.keyScenes.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Key Scenes</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
                    </div>
                    
                    <div className="space-y-10">
                      {displayCharacter.keyScenes.map((scene, idx) => {
                        const sceneFrames = getFramesForScene(scene.episodeNumber, scene.sceneNumber)
                        
                        return (
                          <article key={idx} className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] to-[#151515] shadow-xl">
                            {/* Decorative header bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"></div>
                            
                            <div className="p-8 space-y-6">
                              {/* Scene Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="px-4 py-1.5 bg-[#10B981] text-white text-sm font-bold rounded-full uppercase tracking-wider">
                                      Episode {scene.episodeNumber} • Scene {scene.sceneNumber}
                                    </span>
                                    {scene.importance && (
                                      <span className="text-yellow-400 text-lg">
                                        {'★'.repeat(scene.importance)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Storyboard Frames Gallery */}
                              {sceneFrames.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Storyboard Frames</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {sceneFrames.slice(0, 6).map((frame, frameIdx) => (
                                      <div
                                        key={frameIdx}
                                        className="group relative aspect-video rounded-lg overflow-hidden border border-[#10B981]/20 hover:border-[#10B981]/60 transition-all hover:scale-105 cursor-pointer"
                                      >
                                        {frame.imageUrl && (
                                          <>
                                            <img
                                              src={frame.imageUrl}
                                              alt={frame.description || `Frame ${frame.shotNumber}`}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                                <p className="text-xs text-white font-semibold">Shot {frame.shotNumber}</p>
                                                {frame.cameraAngle && (
                                                  <p className="text-xs text-white/70">{frame.cameraAngle}</p>
                                                )}
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  {sceneFrames.length > 6 && (
                                    <p className="text-xs text-white/50 italic">
                                      + {sceneFrames.length - 6} more frames
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Why It Matters */}
                              {scene.whyItMatters && scene.whyItMatters.length > 0 && (
                                <div className="bg-[#10B981]/10 rounded-xl p-5 border border-[#10B981]/20">
                                  <h4 className="text-sm font-bold text-[#10B981] mb-3 uppercase tracking-wider">Why It Matters</h4>
                                  <ul className="space-y-2">
                                    {scene.whyItMatters.map((reason, rIdx) => (
                                      <li key={rIdx} className="text-white/90 text-base leading-relaxed flex items-start gap-2">
                                        <span className="text-[#10B981] mt-1.5">▸</span>
                                        <span>{reason}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* What To Focus On */}
                              {scene.whatToFocusOn && scene.whatToFocusOn.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">What To Focus On</h4>
                                  <ul className="space-y-2">
                                    {scene.whatToFocusOn.map((focus, fIdx) => (
                                      <li key={fIdx} className="text-white/90 text-base leading-relaxed flex items-start gap-2">
                                        <span className="text-white/50 mt-1.5">•</span>
                                        <span>{focus}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Quick Prep Tips */}
                              {scene.quickPrepTips && scene.quickPrepTips.length > 0 && (
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                  <h4 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Quick Prep Tips</h4>
                                  <ul className="space-y-2">
                                    {scene.quickPrepTips.map((tip, tIdx) => (
                                      <li key={tIdx} className="text-white/90 text-base leading-relaxed flex items-start gap-2">
                                        <span className="text-[#10B981] mt-1.5 font-bold">✓</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* On-Set Preparation */}
                {displayCharacter.onSetPrep && (
                  <div>
                    <h3 className="text-xl font-bold text-[#10B981] mb-4">On-Set Preparation</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {displayCharacter.onSetPrep.preScene && displayCharacter.onSetPrep.preScene.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Pre-Scene</h4>
                          <ul className="space-y-1">
                            {displayCharacter.onSetPrep.preScene.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.onSetPrep.warmUp && displayCharacter.onSetPrep.warmUp.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Warm-Up</h4>
                          <ul className="space-y-1">
                            {displayCharacter.onSetPrep.warmUp.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.onSetPrep.emotionalPrep && displayCharacter.onSetPrep.emotionalPrep.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Emotional Prep</h4>
                          <ul className="space-y-1">
                            {displayCharacter.onSetPrep.emotionalPrep.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {displayCharacter.onSetPrep.mentalChecklist && displayCharacter.onSetPrep.mentalChecklist.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">Mental Checklist</h4>
                          <ul className="space-y-1">
                            {displayCharacter.onSetPrep.mentalChecklist.map((item, idx) => (
                              <li key={idx} className="text-white/90 text-sm">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!displayCharacter.monologues || displayCharacter.monologues.length === 0) && 
                 (!displayCharacter.keyScenes || displayCharacter.keyScenes.length === 0) && 
                 !displayCharacter.onSetPrep && (
                  <div className="text-center py-12">
                    <p className="text-white/50">
                      Actor materials not yet generated for this character. Generate in Pre-Production.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </InvestorLightbox>
  )
}
