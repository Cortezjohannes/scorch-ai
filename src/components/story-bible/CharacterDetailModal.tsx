'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import CollapsibleSection, { isSectionEmpty } from '@/components/ui/CollapsibleSection'

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
                          <p className={`${prefix}-text-secondary text-sm whitespace-pre-wrap`}>{character.description}</p>
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
                            <div className="flex items-center gap-2 group">
                              <strong className={`${prefix}-text-primary text-sm`}>Age:</strong>
                              {editingField?.type === 'character' && editingField?.index === characterIndex && editingField?.field === 'physiology.age' ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    value={editValue}
                                    onChange={(e) => onEditValueChange(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') onSaveEdit()
                                      if (e.key === 'Escape') onCancelEditing()
                                    }}
                                    className={`${prefix}-bg-secondary border ${prefix}-border-accent rounded px-2 py-1 ${prefix}-text-primary text-sm flex-1`}
                                    autoFocus
                                  />
                                  <button onClick={onSaveEdit} className={`${prefix}-btn-primary px-2 py-1 rounded text-xs font-bold`}>✓</button>
                                  <button onClick={onCancelEditing} className={`bg-red-500 ${prefix}-text-primary px-2 py-1 rounded text-xs font-bold`}>✕</button>
                                </div>
                              ) : (
                                <>
                                  <span className={`${prefix}-text-secondary`}>{character.physiology.age || 'N/A'}</span>
                                  {!isLocked && (
                                    <button
                                      onClick={() => onStartEditing('character', 'physiology.age', character.physiology.age || '', characterIndex)}
                                      className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent transition-all text-xs ml-1`}
                                    >
                                      ✏️
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {/* Editable Gender */}
                            <div className="flex items-center gap-2 group">
                              <strong className={`${prefix}-text-primary text-sm`}>Gender:</strong>
                              {editingField?.type === 'character' && editingField?.index === characterIndex && editingField?.field === 'physiology.gender' ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    value={editValue}
                                    onChange={(e) => onEditValueChange(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') onSaveEdit()
                                      if (e.key === 'Escape') onCancelEditing()
                                    }}
                                    className={`${prefix}-bg-secondary border ${prefix}-border-accent rounded px-2 py-1 ${prefix}-text-primary text-sm flex-1`}
                                    autoFocus
                                  />
                                  <button onClick={onSaveEdit} className={`${prefix}-btn-primary px-2 py-1 rounded text-xs font-bold`}>✓</button>
                                  <button onClick={onCancelEditing} className={`bg-red-500 ${prefix}-text-primary px-2 py-1 rounded text-xs font-bold`}>✕</button>
                                </div>
                              ) : (
                                <>
                                  <span className={`${prefix}-text-secondary`}>{character.physiology.gender || 'N/A'}</span>
                                  {!isLocked && (
                                    <button
                                      onClick={() => onStartEditing('character', 'physiology.gender', character.physiology.gender || '', characterIndex)}
                                      className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent transition-all text-xs ml-1`}
                                    >
                                      ✏️
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Editable Appearance */}
                          <div>
                            <strong className={`${prefix}-text-primary text-sm`}>Appearance:</strong>
                            {editingField?.type === 'character' && editingField?.index === characterIndex && editingField?.field === 'physiology.appearance' ? (
                              <div className="flex items-start gap-1 mt-1">
                                <textarea
                                  value={editValue}
                                  onChange={(e) => onEditValueChange(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) onSaveEdit()
                                    if (e.key === 'Escape') onCancelEditing()
                                  }}
                                  className={`${prefix}-bg-secondary border ${prefix}-border-accent rounded px-2 py-1 ${prefix}-text-primary text-sm flex-1 min-h-[60px]`}
                                  autoFocus
                                />
                                <div className="flex flex-col gap-1">
                                  <button onClick={onSaveEdit} className={`${prefix}-btn-primary px-2 py-1 rounded text-xs font-bold`}>✓</button>
                                  <button onClick={onCancelEditing} className={`bg-red-500 ${prefix}-text-primary px-2 py-1 rounded text-xs font-bold`}>✕</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 group mt-1">
                                <p className={`${prefix}-text-secondary text-sm flex-1`}>{character.physiology.appearance || 'N/A'}</p>
                                {!isLocked && (
                                  <button
                                    onClick={() => onStartEditing('character', 'physiology.appearance', character.physiology.appearance || '', characterIndex)}
                                    className={`opacity-0 group-hover:opacity-100 ${prefix}-text-tertiary hover:${prefix}-text-accent transition-all text-xs`}
                                  >
                                    ✏️
                                  </button>
                                )}
                              </div>
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
                          {character.sociology.class && (
                            <p className={`${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Class:</strong> {character.sociology.class}</p>
                          )}
                          {character.sociology.occupation && (
                            <p className={`${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Occupation:</strong> {character.sociology.occupation}</p>
                          )}
                          {character.sociology.education && (
                            <div className={`${prefix}-text-secondary`}>
                              <strong className={`${prefix}-text-primary`}>Education:</strong>
                              {typeof character.sociology.education === 'string' ? (
                                <p className="mt-1">{character.sociology.education}</p>
                              ) : (
                                <div className="mt-1 space-y-1">
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
                          {character.sociology.homeLife && (
                            <p className={`${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Home Life:</strong> {character.sociology.homeLife}</p>
                          )}
                          {character.sociology.economicStatus && (
                            <p className={`${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Economic Status:</strong> {character.sociology.economicStatus}</p>
                          )}
                          {character.sociology.communityStanding && (
                            <p className={`${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Community Standing:</strong> {character.sociology.communityStanding}</p>
                          )}
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
                          {character.psychology.coreValue && (
                            <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-green-400`}>
                              <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Core Value:</strong> {character.psychology.coreValue}</p>
                              {character.psychology.moralStandpoint && (
                                <p className={`text-sm ${prefix}-text-secondary mt-1`}><strong className={`${prefix}-text-primary`}>Moral Standpoint:</strong> {character.psychology.moralStandpoint}</p>
                              )}
                            </div>
                          )}
                          
                          {character.psychology.want && (
                            <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-blue-400`}>
                              <p className="text-blue-400 font-bold text-xs mb-1">WANT (External Goal)</p>
                              {typeof character.psychology.want === 'string' ? (
                                <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology.want}</p>
                              ) : (
                                <div className={`text-sm ${prefix}-text-secondary space-y-1 mt-2`}>
                                  {character.psychology.want.consciousGoal && (
                                    <p><strong>Conscious Goal:</strong> {character.psychology.want.consciousGoal}</p>
                                  )}
                                  {character.psychology.want.externalObjective && (
                                    <p><strong>External Objective:</strong> {character.psychology.want.externalObjective}</p>
                                  )}
                                  {character.psychology.want.whatTheyThinkWillMakeThemHappy && (
                                    <p><strong>What They Think Will Make Them Happy:</strong> {character.psychology.want.whatTheyThinkWillMakeThemHappy}</p>
                                  )}
                                  {character.psychology.want.pursuitStrategy && (
                                    <p><strong>Pursuit Strategy:</strong> {character.psychology.want.pursuitStrategy}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {character.psychology.need && (
                            <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-purple-400`}>
                              <p className="text-purple-400 font-bold text-xs mb-1">NEED (Internal Lesson)</p>
                              {typeof character.psychology.need === 'string' ? (
                                <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology.need}</p>
                              ) : (
                                <div className={`text-sm ${prefix}-text-secondary space-y-1 mt-2`}>
                                  {character.psychology.need.unconsciousTruth && (
                                    <p><strong>Unconscious Truth:</strong> {character.psychology.need.unconsciousTruth}</p>
                                  )}
                                  {character.psychology.need.internalLesson && (
                                    <p><strong>Internal Lesson:</strong> {character.psychology.need.internalLesson}</p>
                                  )}
                                  {character.psychology.need.whatTheyActuallyNeedForFulfillment && (
                                    <p><strong>What They Actually Need:</strong> {character.psychology.need.whatTheyActuallyNeedForFulfillment}</p>
                                  )}
                                  {character.psychology.need.thematicSignificance && (
                                    <p><strong>Thematic Significance:</strong> {character.psychology.need.thematicSignificance}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {character.psychology.primaryFlaw && (
                            <div className={`${prefix}-card-secondary rounded-lg p-3 border-l-4 border-red-400`}>
                              <p className="text-red-400 font-bold text-xs mb-1">PRIMARY FLAW</p>
                              <p className={`text-sm ${prefix}-text-secondary`}>{character.psychology.primaryFlaw}</p>
                              <p className={`text-xs mt-1 ${prefix}-text-tertiary`}>*Creates obstacles until growth occurs</p>
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            {character.psychology.temperament?.length > 0 && (
                              <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Temperament:</strong> {character.psychology.temperament.join(', ')}</p>
                            )}
                            {character.psychology.attitude && (
                              <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Attitude:</strong> {character.psychology.attitude}</p>
                            )}
                            {character.psychology.iq && (
                              <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>IQ:</strong> {character.psychology.iq}</p>
                            )}
                            {character.psychology.fears?.[0] && (
                              <p className={`text-sm ${prefix}-text-secondary`}><strong className={`${prefix}-text-primary`}>Top Fear:</strong> {character.psychology.fears[0]}</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleSection>
                    </div>
                  ) : (
                    /* Legacy Character Display */
                    <div className="space-y-4">
                      <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                        <h5 className={`${prefix}-text-accent font-bold mb-2`}>Character Overview</h5>
                        <p className={`${prefix}-text-secondary mb-3`}>{character.description || 'No description available'}</p>
                        {character.archetype && (
                          <p className="text-sm"><strong className={`${prefix}-text-primary`}>Archetype:</strong> <span className={`${prefix}-text-secondary`}>{character.archetype}</span></p>
                        )}
                        {character.arc && (
                          <p className="text-sm"><strong className={`${prefix}-text-primary`}>Character Arc:</strong> <span className={`${prefix}-text-secondary`}>{character.arc}</span></p>
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

