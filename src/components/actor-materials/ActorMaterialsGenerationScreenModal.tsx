'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import type { ActingTechnique } from '@/types/actor-materials'

interface ActorMaterialsGenerationScreenModalProps {
  isOpen: boolean
  onClose: () => void
  remainingCharacters: Array<{ id: string; name: string; description: string; imageUrl?: string }>
  allCharacters: Array<{ id: string; name: string; description: string; imageUrl?: string }>
  materials?: any
  selectedCharacterForGeneration: string
  onSelectCharacter: (characterId: string) => void
  selectedTechnique?: ActingTechnique
  onSelectTechnique: (technique?: ActingTechnique) => void
  onGenerateSelected: () => void
  onGenerateAllRemaining: () => void
  generating: boolean
  generatingCharacter: string | null
  error: string | null
  hasManyCharacters: boolean
}

export default function ActorMaterialsGenerationScreenModal({
  isOpen,
  onClose,
  remainingCharacters,
  allCharacters,
  materials,
  selectedCharacterForGeneration,
  onSelectCharacter,
  selectedTechnique,
  onSelectTechnique,
  onGenerateSelected,
  onGenerateAllRemaining,
  generating,
  generatingCharacter,
  error,
  hasManyCharacters
}: ActorMaterialsGenerationScreenModalProps) {
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const hasPartialMaterials = materials && materials.characters.length > 0 && materials.characters.length < allCharacters.length

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative w-full max-w-4xl max-h-[90vh] ${prefix}-card rounded-xl overflow-hidden shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 ${prefix}-card border-b ${prefix}-border p-6 z-10`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${prefix}-text-primary`}>
                  Generate Actor Materials
                </h2>
                <p className={`text-sm ${prefix}-text-secondary mt-1`}>
                  {hasPartialMaterials 
                    ? `${materials.characters.length} of ${allCharacters.length} characters already generated`
                    : `Generate materials for ${allCharacters.length} characters`}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 ${prefix}-text-secondary hover:${prefix}-text-primary transition-colors rounded-lg hover:bg-black/20`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎭</div>
              
              {hasPartialMaterials && materials && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${prefix}-text-primary mb-1`}>
                        ✓ {materials.characters.length} character{materials.characters.length !== 1 ? 's' : ''} already generated
                      </p>
                      <p className={`text-sm ${prefix}-text-secondary`}>
                        {materials.characters.map((c: any) => c.characterName).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Character Selector Dropdown */}
              {allCharacters.length > 0 && (
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                    Select Character {remainingCharacters.length > 0 && `(${remainingCharacters.length} remaining)`}
                  </label>
                  <select
                    value={selectedCharacterForGeneration}
                    onChange={(e) => onSelectCharacter(e.target.value)}
                    className={`px-4 py-2 rounded-lg ${prefix}-input w-full max-w-xs`}
                  >
                    <option value="">-- Select a character --</option>
                    {allCharacters.map((char) => {
                      const isGenerated = materials?.characters?.some((c: any) => c.characterName.toLowerCase() === char.name.toLowerCase())
                      const isRemaining = remainingCharacters.some(c => c.id === char.id)
                      return (
                        <option key={char.id} value={char.id}>
                          {char.name}{isGenerated && !isRemaining ? ' (regenerate)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  {selectedCharacterForGeneration && (() => {
                    const selectedChar = allCharacters.find(c => c.id === selectedCharacterForGeneration)
                    if (!selectedChar) return null
                    
                    return (
                      <div className={`mt-4 p-4 rounded-lg border ${prefix}-border bg-gradient-to-br ${
                        prefix === 'dark' 
                          ? 'from-black/40 to-[#1a1a1a]/60 border-[#10B981]/20' 
                          : 'from-white/80 to-gray-50/80 border-gray-300'
                      }`}>
                        <div className="flex items-start gap-4">
                          {selectedChar.imageUrl && (
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#10B981]/30 shadow-lg ring-2 ring-[#10B981]/10">
                                <img
                                  src={selectedChar.imageUrl}
                                  alt={selectedChar.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold mb-2 ${prefix}-text-primary`}>
                              {selectedChar.name}
                            </h3>
                            <p className={`text-sm leading-relaxed ${prefix}-text-secondary`}>
                              {selectedChar.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Technique Selector */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${prefix}-text-primary`}>
                  Acting Technique (Optional)
                </label>
                <select
                  value={selectedTechnique || ''}
                  onChange={(e) => onSelectTechnique(e.target.value as ActingTechnique || undefined)}
                  className={`px-4 py-2 rounded-lg ${prefix}-input w-full max-w-xs`}
                >
                  <option value="">None (General Approach)</option>
                  <optgroup label="Psychological">
                    <option value="stanislavski">Stanislavski</option>
                    <option value="meisner">Meisner</option>
                    <option value="method-acting">Method Acting</option>
                    <option value="adler">Adler</option>
                    <option value="hagen">Hagen</option>
                  </optgroup>
                  <optgroup label="Physical">
                    <option value="chekhov">Chekhov</option>
                    <option value="laban">Laban</option>
                    <option value="viewpoints">Viewpoints</option>
                  </optgroup>
                  <optgroup label="Practical">
                    <option value="practical-aesthetics">Practical Aesthetics</option>
                    <option value="spolin">Spolin</option>
                  </optgroup>
                </select>
              </div>

              {/* Generate Buttons */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={onGenerateSelected}
                  disabled={generating || !selectedCharacterForGeneration}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    selectedCharacterForGeneration && !generating
                      ? `${prefix}-btn-primary`
                      : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {generating && generatingCharacter ? `Generating ${generatingCharacter}...` : 'Generate Selected Character'}
                </button>
                
                {remainingCharacters.length > 1 && (
                  <button
                    onClick={onGenerateAllRemaining}
                    disabled={generating}
                    className={`px-6 py-3 rounded-lg font-semibold ${prefix}-btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {generating && !generatingCharacter ? 'Generating...' : `Generate All Remaining (${remainingCharacters.length})`}
                  </button>
                )}
              </div>

              {hasManyCharacters && remainingCharacters.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className={`text-sm ${prefix}-text-secondary`}>
                    ⚠️ Generating all {remainingCharacters.length} remaining characters at once may timeout. Consider generating characters one at a time using the dropdown above.
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-red-500 font-semibold mb-1">Generation Failed</p>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

