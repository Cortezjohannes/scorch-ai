'use client'

import { useState } from 'react'
import { Image as ImageIcon, Sparkles, RefreshCw, Download, Trash2, History, Settings } from 'lucide-react'
import { characterVisualConsistency, VisualReference } from '@/services/character-visual-consistency'
import { generateImage } from '@/services/ai-image-generator'

// ============================================================================
// TYPES
// ============================================================================

interface CharacterGalleryProps {
  characters: any[]
  onUpdateCharacter?: (characterName: string, visualData: any) => void
  readOnly?: boolean
}

type ImageStyle = 'photorealistic' | 'anime' | 'comic' | 'painterly' | 'sketch'

// ============================================================================
// CHARACTER GALLERY COMPONENT
// ============================================================================

export default function CharacterGallery({
  characters,
  onUpdateCharacter,
  readOnly = false
}: CharacterGalleryProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<any | null>(null)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photorealistic')
  const [showStyleSettings, setShowStyleSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerateImage = async (character: any, style: ImageStyle) => {
    setGeneratingFor(character.name)

    try {
      // Build consistent prompt
      const prompt = characterVisualConsistency.buildConsistentPrompt(
        character.name,
        character,
        style
      )

      console.log('🎨 Generating image with prompt:', prompt)

      // Generate image
      const imageUrl = await generateImage(prompt, {
        width: 512,
        height: 512,
        model: 'stable-diffusion'
      })

      // Store visual reference
      characterVisualConsistency.storeVisualReference(
        character.name,
        imageUrl,
        prompt,
        style
      )

      // Update character data
      if (onUpdateCharacter) {
        onUpdateCharacter(character.name, {
          visualReference: {
            imageUrl,
            style,
            prompt,
            generatedAt: new Date()
          }
        })
      }

      console.log('✅ Image generated successfully')
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleDownloadImage = (imageUrl: string, characterName: string) => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `${characterName.replace(/\s+/g, '-')}-portrait.png`
    a.click()
  }

  const handleSetGlobalStyle = (style: ImageStyle) => {
    characterVisualConsistency.setGlobalStylePreference(style)
    setSelectedStyle(style)
    alert(`Global style set to ${style} for all future character images`)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const getStyleIcon = (style: ImageStyle): string => {
    switch (style) {
      case 'photorealistic':
        return '📷'
      case 'anime':
        return '🎌'
      case 'comic':
        return '💥'
      case 'painterly':
        return '🎨'
      case 'sketch':
        return '✏️'
      default:
        return '🖼️'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Character Gallery</h2>
            <p className="text-sm text-gray-400">
              Visual references for {characters.length} character{characters.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStyleSettings(!showStyleSettings)}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Style Settings
        </button>
      </div>

      {/* Style Settings */}
      {showStyleSettings && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Global Style Settings</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['photorealistic', 'anime', 'comic', 'painterly', 'sketch'] as ImageStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStyle === style
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50'
                }`}
              >
                <div className="text-3xl mb-2 text-center">{getStyleIcon(style)}</div>
                <div className="text-sm text-white text-center font-medium">
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSetGlobalStyle(selectedStyle)}
            className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Set as Default Style for All Characters
          </button>
        </div>
      )}

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(character => {
          const visualRef = characterVisualConsistency.getVisualReference(character.name)
          const isGenerating = generatingFor === character.name

          return (
            <div
              key={character.name}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-900 flex items-center justify-center">
                {visualRef?.imageUrl ? (
                  <img
                    src={visualRef.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-500 text-sm">No image generated</p>
                  </div>
                )}

                {visualRef && (
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    {getStyleIcon(visualRef.style)}
                    {visualRef.style}
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white text-sm">Generating image...</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{character.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {character.archetype || 'Character'}
                </p>

                {/* Actions */}
                {!readOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateImage(character, selectedStyle)}
                      disabled={isGenerating}
                      className="flex-1 px-3 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {visualRef ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>

                    {visualRef && (
                      <>
                        <button
                          onClick={() => handleDownloadImage(visualRef.imageUrl, character.name)}
                          className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCharacter(character)
                            setShowHistory(true)
                          }}
                          className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {visualRef && (
                  <p className="text-xs text-gray-500 mt-3">
                    Generated {new Date(visualRef.generatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {characters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No characters available</p>
        </div>
      )}

      {/* History Modal */}
      {showHistory && selectedCharacter && (
        <HistoryModal
          character={selectedCharacter}
          onClose={() => {
            setShowHistory(false)
            setSelectedCharacter(null)
          }}
          onRestore={(version) => {
            characterVisualConsistency.restoreVersion(selectedCharacter.name, version)
            if (onUpdateCharacter) {
              const restored = characterVisualConsistency.getVisualReference(selectedCharacter.name)
              if (restored) {
                onUpdateCharacter(selectedCharacter.name, { visualReference: restored })
              }
            }
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// HISTORY MODAL
// ============================================================================

function HistoryModal({
  character,
  onClose,
  onRestore
}: {
  character: any
  onClose: () => void
  onRestore: (version: number) => void
}) {
  const history = characterVisualConsistency.getVisualHistory(character.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-purple-500/30">
          <h3 className="text-2xl font-bold text-white">Visual History: {character.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{history.length} version{history.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((ref) => (
              <div key={ref.version} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="aspect-square bg-gray-900">
                  <img
                    src={ref.imageUrl}
                    alt={`Version ${ref.version}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Version {ref.version}</span>
                    <span className="text-xs text-gray-400">{ref.style}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(ref.generatedAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => {
                      onRestore(ref.version)
                      onClose()
                    }}
                    className="w-full px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-purple-500/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

