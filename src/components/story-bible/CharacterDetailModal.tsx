'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import CollapsibleSection, { isSectionEmpty } from '@/components/ui/CollapsibleSection'
import { EditableField } from '@/components/preproduction/shared/EditableField'

interface CharacterDetailModalProps {
  isOpen: boolean
  onClose: () => void
  character: any
  characterIndex: number
  onSave: (updatedCharacter: any) => Promise<void>
  onDelete: () => void
  onUpgrade?: () => void
  isLocked: boolean
  theme: 'light' | 'dark'
  editingField: {type: string, index?: number | string, field?: string, subfield?: string} | null
  editValue: string
  onStartEditing: (type: string, field: string, currentValue: string, index?: number | string, subfield?: string) => void
  onSaveEdit: () => void
  onCancelEditing: () => void
  onEditValueChange: (value: string) => void
}

export default function CharacterDetailModal({
  isOpen,
  onClose,
  character,
  characterIndex,
  onSave,
  onDelete,
  onUpgrade,
  isLocked,
  theme,
  editingField,
  editValue,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onEditValueChange
}: CharacterDetailModalProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const is3D = character?.physiology && character?.sociology && character?.psychology
  const [showFullImageModal, setShowFullImageModal] = useState(false)

  // DEBUG: Log what character data we're actually receiving
  console.log('🎭 [CHARACTER MODAL] Character data received:', {
    name: character?.name,
    hasPhysiology: !!character?.physiology,
    hasSociology: !!character?.sociology,
    hasPsychology: !!character?.psychology,
    is3D,
    physiologyKeys: character?.physiology ? Object.keys(character.physiology) : [],
    sociologyKeys: character?.sociology ? Object.keys(character.sociology) : [],
    psychologyKeys: character?.psychology ? Object.keys(character.psychology) : [],
    // Show actual values to check if they're real or placeholders
    age: character?.physiology?.age,
    gender: character?.physiology?.gender,
    appearance: character?.physiology?.appearance?.substring(0, 50),
    occupation: character?.sociology?.occupation,
    want: typeof character?.psychology?.want === 'string' 
      ? character.psychology.want.substring(0, 50)
      : character?.psychology?.want?.consciousGoal?.substring(0, 50),
    // Check if this looks like hardcoded data
    looksLikeHardcoded: character?.physiology?.age === '32' && 
                       character?.physiology?.gender === 'Non-binary' &&
                       character?.sociology?.occupation === 'Marketing Executive'
  })

  if (!character) return null

  const getInitials = (name: string) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-hidden"
          >
            <div className={`h-full ${prefix}-bg-primary ${prefix}-border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${prefix}-border flex-shrink-0`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 flex items-center justify-center text-xl font-bold text-[#10B981] flex-shrink-0">
                    {getInitials(character.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingField?.type === 'character' && editingField?.index === characterIndex && editingField?.field === 'name' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => onEditValueChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveEdit()
                            if (e.key === 'Escape') onCancelEditing()
                          }}
                          className={`text-2xl font-bold ${prefix}-bg-secondary border-2 ${prefix}-border-accent rounded-lg px-3 py-1 ${prefix}-text-primary flex-1`}
                          autoFocus
                        />
                        <button onClick={onSaveEdit} className={`${prefix}-btn-primary px-3 py-1 rounded-lg font-bold text-sm`}>✓</button>
                        <button onClick={onCancelEditing} className={`bg-red-500 ${prefix}-text-primary px-3 py-1 rounded-lg font-bold text-sm`}>✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className={`text-2xl font-bold ${prefix}-text-primary truncate`}>{character.name}</h2>
                        {!isLocked && (
                          <button
                            onClick={() => onStartEditing('character', 'name', character.name, characterIndex)}
                            className={`${prefix}-text-tertiary hover:${prefix}-text-accent transition-colors flex-shrink-0`}
                            title="Edit character name"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    )}
                    <p className={`${prefix}-text-secondary text-sm mt-1`}>
                      {character.premiseFunction || character.archetype || 'Character'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isLocked && onUpgrade && (
                    <button
                      onClick={onUpgrade}
                      className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 ${prefix}-text-primary font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 text-sm`}
                      title="Upgrade character complexity"
                    >
                      ⬆️ Upgrade
                    </button>
                  )}
                  {!isLocked && (
                    <button
                      onClick={onDelete}
                      className={`px-4 py-2 bg-red-500/80 ${prefix}-text-primary font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm`}
                      title="Delete character"
                    >
                      🗑️ Delete
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary transition-colors`}
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Character Image and Description - At the top */}
                  {(character.visualReference?.imageUrl || character.description) && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 space-y-4`}>
                      {character.visualReference?.imageUrl && (
                        <div className="w-full max-w-md mx-auto">
                          <img
                            src={character.visualReference.imageUrl}
                            alt={character.name}
                            className="w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowFullImageModal(true)}
                          />
                        </div>
                      )}
                      {character.description && (
                        <div>
                          <h3 className={`text-lg font-semibold ${prefix}-text-primary mb-2`}>Description</h3>
                          {!isLocked ? (
                            <EditableField
                              value={character.description || ''}
                              onSave={async (newValue) => {
                                const updated = { ...character, description: newValue as string }
                                await onSave(updated)
                              }}
                              multiline
                              rows={4}
                              placeholder="Enter character description..."
                              className="text-sm"
                            />
                          ) : (
                            <p className={`${prefix}-text-secondary text-sm whitespace-pre-wrap`}>{character.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {is3D ? (
                    /* 3D Character Display - Accordion Layout */
                    <div className="space-y-4">
                      {/* Physiology */}
                      <CollapsibleSection
                        title="Physiology"
                        icon="🏃"
                        theme={theme}
                        isLocked={isLocked}
                        isEmptyDefault={isSectionEmpty(character.physiology || {}, ['physicalTraits'])}
                      >
                        <div className="space-y-4">
                          {/* Age and Gender in Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Editable Age */}
                            <div className="flex items-center gap-2">
                              <strong className={`${prefix}-text-primary text-sm`}>Age:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.physiology?.age || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      physiology: {
                                        ...character.physiology,
                                        age: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter age..."
                                  className="text-sm flex-1"
                                />
                              ) : (
                                <span className={`${prefix}-text-secondary`}>{character.physiology?.age || 'N/A'}</span>
                              )}
                            </div>
                            
                            {/* Editable Gender */}
                            <div className="flex items-center gap-2">
                              <strong className={`${prefix}-text-primary text-sm`}>Gender:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.physiology?.gender || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      physiology: {
                                        ...character.physiology,
                                        gender: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter gender..."
                                  className="text-sm flex-1"
                                />
                              ) : (
                                <span className={`${prefix}-text-secondary`}>{character.physiology?.gender || 'N/A'}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Editable Appearance */}
                          <div>
                            <strong className={`${prefix}-text-primary text-sm mb-1 block`}>Appearance:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.physiology?.appearance || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    physiology: {
                                      ...character.physiology,
                                      appearance: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={3}
                                placeholder="Enter appearance description..."
                                className="text-sm"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary text-sm`}>{character.physiology?.appearance || 'N/A'}</p>
                            )}
                          </div>
                          
                          {character.physiology.build && (
                            <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Build:</strong> {character.physiology.build}</p>
                          )}
                          {character.physiology.health && (
                            <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Health:</strong> {character.physiology.health}</p>
                          )}
                          {character.physiology.physicalTraits?.length > 0 && (
                            <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Traits:</strong> {character.physiology.physicalTraits.join(', ')}</p>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* Sociology */}
                      <CollapsibleSection
                        title="Sociology"
                        icon="🏛️"
                        theme={theme}
                        isLocked={isLocked}
                        isEmptyDefault={isSectionEmpty(character.sociology || {})}
                      >
                        <div className="space-y-4 text-sm">
                          <div>
                            <strong className={`${prefix}-text-primary`}>Class:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.sociology?.class || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    sociology: {
                                      ...character.sociology,
                                      class: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                placeholder="Enter class..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary`}>{character.sociology?.class || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary`}>Occupation:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.sociology?.occupation || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    sociology: {
                                      ...character.sociology,
                                      occupation: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                placeholder="Enter occupation..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary`}>{character.sociology?.occupation || 'N/A'}</p>
                            )}
                          </div>
                          {character.sociology?.education && (
                            <div>
                              <strong className={`${prefix}-text-primary`}>Education:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={typeof character.sociology.education === 'string' ? character.sociology.education : JSON.stringify(character.sociology.education)}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      sociology: {
                                        ...character.sociology,
                                        education: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  multiline
                                  rows={3}
                                  placeholder="Enter education..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <div className={`${prefix}-text-secondary mt-1`}>
                                  {typeof character.sociology.education === 'string' ? (
                                    <p>{character.sociology.education}</p>
                                  ) : (
                                    <div className="space-y-1">
                                      {character.sociology.education.level && (
                                        <p><strong>Level:</strong> {character.sociology.education.level}</p>
                                      )}
                                      {character.sociology.education.institutions && Array.isArray(character.sociology.education.institutions) && character.sociology.education.institutions.length > 0 && (
                                        <p><strong>Institutions:</strong> {character.sociology.education.institutions.join(', ')}</p>
                                      )}
                                      {character.sociology.education.learningStyle && (
                                        <p><strong>Learning Style:</strong> {character.sociology.education.learningStyle}</p>
                                      )}
                                      {character.sociology.education.knowledgeAreas && Array.isArray(character.sociology.education.knowledgeAreas) && character.sociology.education.knowledgeAreas.length > 0 && (
                                        <p><strong>Knowledge Areas:</strong> {character.sociology.education.knowledgeAreas.join(', ')}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <div>
                            <strong className={`${prefix}-text-primary`}>Home Life:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.sociology?.homeLife || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    sociology: {
                                      ...character.sociology,
                                      homeLife: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={2}
                                placeholder="Enter home life..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary`}>{character.sociology?.homeLife || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary`}>Economic Status:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.sociology?.economicStatus || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    sociology: {
                                      ...character.sociology,
                                      economicStatus: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                placeholder="Enter economic status..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary`}>{character.sociology?.economicStatus || 'N/A'}</p>
                            )}
                          </div>
                          <div>
                            <strong className={`${prefix}-text-primary`}>Community Standing:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.sociology?.communityStanding || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    sociology: {
                                      ...character.sociology,
                                      communityStanding: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                placeholder="Enter community standing..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`${prefix}-text-secondary`}>{character.sociology?.communityStanding || 'N/A'}</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>
                    
                      {/* Psychology */}
                      <CollapsibleSection
                        title="Psychology"
                        icon="🧠"
                        theme={theme}
                        isLocked={isLocked}
                        isEmptyDefault={isSectionEmpty(character.psychology || {})}
                      >
                        <div className="space-y-3">
                          <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-green-400`}>
                            <strong className={`${prefix}-text-primary text-sm`}>Core Value:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.psychology?.coreValue || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    psychology: {
                                      ...character.psychology,
                                      coreValue: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                placeholder="Enter core value..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology?.coreValue || 'N/A'}</p>
                            )}
                            <div className="mt-2">
                              <strong className={`${prefix}-text-primary text-sm`}>Moral Standpoint:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.psychology?.moralStandpoint || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      psychology: {
                                        ...character.psychology,
                                        moralStandpoint: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter moral standpoint..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <p className={`text-sm ${prefix}-text-secondary mt-1`}>{character.psychology?.moralStandpoint || 'N/A'}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-blue-400`}>
                            <p className="text-blue-400 font-bold text-xs mb-1">WANT (External Goal)</p>
                            {!isLocked ? (
                              <EditableField
                                value={typeof character.psychology?.want === 'string' ? character.psychology.want : (character.psychology?.want?.consciousGoal || '')}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    psychology: {
                                      ...character.psychology,
                                      want: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={3}
                                placeholder="Enter want (external goal)..."
                                className="text-sm"
                              />
                            ) : (
                              <p className={`text-sm ${prefix}-text-secondary`}>
                                {typeof character.psychology?.want === 'string' ? character.psychology.want : (character.psychology?.want?.consciousGoal || 'N/A')}
                              </p>
                            )}
                          </div>
                          
                          <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-purple-400`}>
                            <p className="text-purple-400 font-bold text-xs mb-1">NEED (Internal Lesson)</p>
                            {!isLocked ? (
                              <EditableField
                                value={typeof character.psychology?.need === 'string' ? character.psychology.need : (character.psychology?.need?.internalLesson || '')}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    psychology: {
                                      ...character.psychology,
                                      need: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={3}
                                placeholder="Enter need (internal lesson)..."
                                className="text-sm"
                              />
                            ) : (
                              <p className={`text-sm ${prefix}-text-secondary`}>
                                {typeof character.psychology?.need === 'string' ? character.psychology.need : (character.psychology?.need?.internalLesson || 'N/A')}
                              </p>
                            )}
                          </div>
                          
                          <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-red-400`}>
                            <p className="text-red-400 font-bold text-xs mb-1">PRIMARY FLAW</p>
                            {!isLocked ? (
                              <EditableField
                                value={character.psychology?.primaryFlaw || ''}
                                onSave={async (newValue) => {
                                  const updated = {
                                    ...character,
                                    psychology: {
                                      ...character.psychology,
                                      primaryFlaw: newValue as string
                                    }
                                  }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={2}
                                placeholder="Enter primary flaw..."
                                className="text-sm"
                              />
                            ) : (
                              <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology?.primaryFlaw || 'N/A'}</p>
                            )}
                            <p className={`text-xs mt-1 ${prefix}-text-tertiary`}>*Creates obstacles until growth occurs</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Temperament:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={Array.isArray(character.psychology?.temperament) ? character.psychology.temperament.join(', ') : (character.psychology?.temperament || '')}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      psychology: {
                                        ...character.psychology,
                                        temperament: (newValue as string).split(',').map(t => t.trim()).filter(Boolean)
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter temperament (comma-separated)..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <p className={`text-sm ${prefix}-text-secondary`}>
                                  {Array.isArray(character.psychology?.temperament) ? character.psychology.temperament.join(', ') : (character.psychology?.temperament || 'N/A')}
                                </p>
                              )}
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Attitude:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.psychology?.attitude || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      psychology: {
                                        ...character.psychology,
                                        attitude: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter attitude..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology?.attitude || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>IQ:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.psychology?.iq || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      psychology: {
                                        ...character.psychology,
                                        iq: newValue as string
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter IQ..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology?.iq || 'N/A'}</p>
                              )}
                            </div>
                            <div>
                              <strong className={`${prefix}-text-primary text-sm`}>Top Fear:</strong>
                              {!isLocked ? (
                                <EditableField
                                  value={character.psychology?.fears?.[0] || ''}
                                  onSave={async (newValue) => {
                                    const updated = {
                                      ...character,
                                      psychology: {
                                        ...character.psychology,
                                        fears: [newValue as string, ...(character.psychology?.fears?.slice(1) || [])]
                                      }
                                    }
                                    await onSave(updated)
                                  }}
                                  placeholder="Enter top fear..."
                                  className="text-sm mt-1"
                                />
                              ) : (
                                <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology?.fears?.[0] || 'N/A'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleSection>
                    </div>
                  ) : (
                    /* Legacy Character Display */
                    <div className="space-y-4">
                      <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                        <h5 className={`${prefix}-text-accent font-bold mb-2`}>Character Overview</h5>
                        <div className="mb-3">
                          <strong className={`${prefix}-text-primary text-sm`}>Description:</strong>
                          {!isLocked ? (
                            <EditableField
                              value={character.description || ''}
                              onSave={async (newValue) => {
                                const updated = { ...character, description: newValue as string }
                                await onSave(updated)
                              }}
                              multiline
                              rows={4}
                              placeholder="Enter character description..."
                              className="text-sm mt-1"
                            />
                          ) : (
                            <p className={`${prefix}-text-secondary`}>{character.description || 'No description available'}</p>
                          )}
                        </div>
                        <div>
                          <strong className={`${prefix}-text-primary text-sm`}>Archetype:</strong>
                          {!isLocked ? (
                            <EditableField
                              value={character.archetype || ''}
                              onSave={async (newValue) => {
                                const updated = { ...character, archetype: newValue as string }
                                await onSave(updated)
                              }}
                              placeholder="Enter archetype..."
                              className="text-sm mt-1"
                            />
                          ) : (
                            <p className="text-sm"><span className={`${prefix}-text-secondary`}>{character.archetype || 'N/A'}</span></p>
                          )}
                        </div>
                        <div className="mt-2">
                          <strong className={`${prefix}-text-primary text-sm`}>Character Arc:</strong>
                          {!isLocked ? (
                            <EditableField
                              value={character.arc || ''}
                              onSave={async (newValue) => {
                                const updated = { ...character, arc: newValue as string }
                                await onSave(updated)
                              }}
                              multiline
                              rows={3}
                              placeholder="Enter character arc..."
                              className="text-sm mt-1"
                            />
                          ) : (
                            <p className="text-sm"><span className={`${prefix}-text-secondary`}>{character.arc || 'N/A'}</span></p>
                          )}
                        </div>
                        {character.backstory && (
                          <div className="mt-2">
                            <strong className={`${prefix}-text-primary text-sm`}>Backstory:</strong>
                            {!isLocked ? (
                              <EditableField
                                value={character.backstory || ''}
                                onSave={async (newValue) => {
                                  const updated = { ...character, backstory: newValue as string }
                                  await onSave(updated)
                                }}
                                multiline
                                rows={4}
                                placeholder="Enter backstory..."
                                className="text-sm mt-1"
                              />
                            ) : (
                              <p className={`text-sm ${prefix}-text-secondary mt-1`}>{character.backstory}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Speech Pattern */}
                  {character.speechPattern && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h5 className={`${prefix}-text-accent font-bold mb-3 flex items-center`}>
                        🗣️ Speech Pattern
                      </h5>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        {character.speechPattern.vocabulary && (
                          <p><strong className={`${prefix}-text-primary`}>Vocabulary:</strong> <span className={`${prefix}-text-secondary`}>{character.speechPattern.vocabulary}</span></p>
                        )}
                        {character.speechPattern.rhythm && (
                          <p><strong className={`${prefix}-text-primary`}>Rhythm:</strong> <span className={`${prefix}-text-secondary`}>{character.speechPattern.rhythm}</span></p>
                        )}
                        {character.speechPattern.voiceNotes && (
                          <p><strong className={`${prefix}-text-primary`}>Voice Notes:</strong> <span className={`${prefix}-text-secondary`}>{character.speechPattern.voiceNotes}</span></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Living Narrative Info */}
                  {character.arcIntroduction && (
                    <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <h5 className={`${prefix}-text-accent font-bold mb-3 flex items-center`}>
                        📖 Living Narrative
                      </h5>
                      <div className="text-sm space-y-1">
                        <p><strong className={`${prefix}-text-primary`}>Introduces:</strong> <span className={`${prefix}-text-secondary`}>Arc {character.arcIntroduction}</span></p>
                        {character.arcDeparture && (
                          <p><strong className={`${prefix}-text-primary`}>Departs:</strong> <span className={`${prefix}-text-secondary`}>Arc {character.arcDeparture} {character.departureReason && `(${character.departureReason})`}</span></p>
                        )}
                        <p className={`${prefix}-text-tertiary mt-2`}>
                          This character's role evolves based on story needs and user choices.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImageModal && character?.visualReference?.imageUrl && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullImageModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center"
              >
                <img
                  src={character.visualReference.imageUrl}
                  alt={character.name}
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
                />
                <button
                  onClick={() => setShowFullImageModal(false)}
                  className={`absolute top-4 right-4 p-2 ${prefix}-bg-secondary ${prefix}-text-secondary rounded-lg hover:${prefix}-bg-tertiary transition-colors z-10`}
                  title="Close"
                >
                  <X size={24} />
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}

