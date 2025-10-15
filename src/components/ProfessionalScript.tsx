'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface ScriptElement {
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition'
  content: string
  character?: string
}

interface ScriptScene {
  sceneNumber?: number
  sceneHeading?: string
  elements: ScriptElement[]
}

interface ProfessionalScriptProps {
  scriptData: any
  title?: string
  episodeNumber?: number
}

export default function ProfessionalScript({ 
  scriptData, 
  title = "Episode Script",
  episodeNumber = 1 
}: ProfessionalScriptProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Script editing state
  const [editingElement, setEditingElement] = useState<{sceneIndex: number, elementIndex: number} | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')
  const [parsedScenes, setParsedScenes] = useState<ScriptScene[]>([])
  
  // Initialize parsed scenes when scriptData changes
  React.useEffect(() => {
    const scenes = parseScriptData(scriptData)
    setParsedScenes(scenes)
  }, [scriptData])

  // Script editing functions
  const startEditingElement = (sceneIndex: number, elementIndex: number, content: string) => {
    setEditingElement({ sceneIndex, elementIndex })
    setEditingContent(content)
  }

  const cancelEditing = () => {
    setEditingElement(null)
    setEditingContent('')
  }

  const saveElementEdit = () => {
    if (!editingElement) return

    const updatedScenes = [...parsedScenes]
    updatedScenes[editingElement.sceneIndex].elements[editingElement.elementIndex].content = editingContent
    
    setParsedScenes(updatedScenes)
    
    // Save to localStorage
    try {
      const savedScripts = localStorage.getItem('scorched-preproduction-scripts') || '{}'
      const scripts = JSON.parse(savedScripts)
      scripts[`episode-${episodeNumber}`] = {
        ...scriptData,
        scenes: updatedScenes
      }
      localStorage.setItem('scorched-preproduction-scripts', JSON.stringify(scripts))
      console.log(`✅ Script element edited and saved`)
    } catch (error) {
      console.error('Error saving script edit:', error)
    }
    
    setEditingElement(null)
    setEditingContent('')
  }

  // Parse script data into professional format
  const parseScriptData = (data: any): ScriptScene[] => {
    if (!data) return []
    
    const scenes: ScriptScene[] = []
    
    // Handle different data formats
    if (data.scenes && Array.isArray(data.scenes)) {
      data.scenes.forEach((scene: any, index: number) => {
        const sceneElements: ScriptElement[] = []
        
        // Scene heading
        if (scene.location || scene.setting) {
          const timeOfDay = scene.timeOfDay || scene.time || 'DAY'
          const location = scene.location || scene.setting
          const interior = scene.interior !== false // Default to interior unless specified
          
          sceneElements.push({
            type: 'scene_heading',
            content: `${interior ? 'INT.' : 'EXT.'} ${location.toUpperCase()} - ${timeOfDay.toUpperCase()}`
          })
        }
        
        // Action lines and dialogue
        if (scene.description) {
          sceneElements.push({
            type: 'action',
            content: scene.description
          })
        }
        
        // Parse dialogue
        if (scene.dialogue && Array.isArray(scene.dialogue)) {
          scene.dialogue.forEach((dialogueItem: any) => {
            if (dialogueItem.character && dialogueItem.text) {
              sceneElements.push({
                type: 'character',
                content: dialogueItem.character.toUpperCase(),
                character: dialogueItem.character
              })
              
              // Add parenthetical if present
              if (dialogueItem.direction || dialogueItem.parenthetical) {
                sceneElements.push({
                  type: 'parenthetical',
                  content: `(${dialogueItem.direction || dialogueItem.parenthetical})`
                })
              }
              
              sceneElements.push({
                type: 'dialogue',
                content: dialogueItem.text,
                character: dialogueItem.character
              })
            }
          })
        }
        
        // If no structured dialogue, try to extract from narrative
        if (!scene.dialogue && scene.narrative) {
          // Simple dialogue extraction from narrative text
          const lines = scene.narrative.split('\n')
          lines.forEach((line: string) => {
            const trimmed = line.trim()
            if (trimmed) {
              // Check if line looks like dialogue (contains quotes)
              if (trimmed.includes('"') && trimmed.includes(':')) {
                const [speaker, ...dialogueParts] = trimmed.split(':')
                if (speaker && dialogueParts.length > 0) {
                  sceneElements.push({
                    type: 'character',
                    content: speaker.trim().toUpperCase(),
                    character: speaker.trim()
                  })
                  sceneElements.push({
                    type: 'dialogue',
                    content: dialogueParts.join(':').replace(/"/g, '').trim(),
                    character: speaker.trim()
                  })
                }
              } else {
                // Treat as action line
                sceneElements.push({
                  type: 'action',
                  content: trimmed
                })
              }
            }
          })
        }
        
        scenes.push({
          sceneNumber: index + 1,
          sceneHeading: sceneElements.find(e => e.type === 'scene_heading')?.content,
          elements: sceneElements
        })
      })
    } else if (typeof data === 'string') {
      // Parse raw script text
      const lines = data.split('\n')
      let currentScene: ScriptElement[] = []
      
      lines.forEach((line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return
        
        // Scene headings (INT./EXT.)
        if (trimmed.match(/^(INT\.|EXT\.)/)) {
          if (currentScene.length > 0) {
            scenes.push({ elements: currentScene })
            currentScene = []
          }
          currentScene.push({
            type: 'scene_heading',
            content: trimmed
          })
        }
        // Character names (ALL CAPS line)
        else if (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && !trimmed.includes('.')) {
          currentScene.push({
            type: 'character',
            content: trimmed,
            character: trimmed
          })
        }
        // Parentheticals
        else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          currentScene.push({
            type: 'parenthetical',
            content: trimmed
          })
        }
        // Dialogue or action
        else {
          const lastElement = currentScene[currentScene.length - 1]
          if (lastElement && (lastElement.type === 'character' || lastElement.type === 'parenthetical')) {
            currentScene.push({
              type: 'dialogue',
              content: trimmed,
              character: lastElement.character
            })
          } else {
            currentScene.push({
              type: 'action',
              content: trimmed
            })
          }
        }
      })
      
      if (currentScene.length > 0) {
        scenes.push({ elements: currentScene })
      }
    }
    
    return scenes
  }

  const scenes = parsedScenes
  
  if (scenes.length === 0) {
    return (
      <div className="bg-white text-black font-mono text-xs leading-relaxed p-8 max-w-4xl mx-auto shadow-2xl">
        <div className="text-center py-12">
          <p className="text-gray-600">No script content available</p>
        </div>
      </div>
    )
  }

  const renderScriptElement = (element: ScriptElement, elementIndex: number, sceneIndex: number) => {
    switch (element.type) {
      case 'scene_heading':
        const isEditingHeading = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="font-bold text-black mb-4 mt-8 first:mt-4 group relative"
            style={{ marginLeft: '0px' }}
          >
            {isEditingHeading ? (
              <div className="space-y-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 font-bold text-black"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit scene heading"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case 'action':
        const isEditingAction = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="text-black mb-4 leading-relaxed max-w-none group relative"
            style={{ 
              marginLeft: '0px',
              marginRight: '0px',
              textAlign: 'left'
            }}
          >
            {isEditingAction ? (
              <div className="space-y-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 text-black"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="flex-1">{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit action"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case 'character':
        const isEditingCharacter = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="font-bold text-black mt-6 mb-1 group relative"
            style={{ 
              marginLeft: '192px', // ~3.7 inches from left in 12pt
              textAlign: 'left'
            }}
          >
            {isEditingCharacter ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 font-bold text-black"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit character name"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case 'parenthetical':
        const isEditingParenthetical = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="text-black mb-1 italic group relative"
            style={{ 
              marginLeft: '148px', // Slightly indented from character name
              textAlign: 'left'
            }}
          >
            {isEditingParenthetical ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 text-black italic"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit parenthetical"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case 'dialogue':
        const isEditingDialogue = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="text-black mb-4 leading-relaxed group relative"
            style={{ 
              marginLeft: '96px',  // ~2.5 inches from left
              marginRight: '96px', // ~2 inches from right
              textAlign: 'left'
            }}
          >
            {isEditingDialogue ? (
              <div className="space-y-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 text-black"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="flex-1">{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit dialogue"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      case 'transition':
        const isEditingTransition = editingElement?.sceneIndex === sceneIndex && editingElement?.elementIndex === elementIndex
        
        return (
          <motion.div
            key={`${sceneIndex}-${elementIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: elementIndex * 0.05 }}
            className="font-bold text-black mb-4 mt-4 group relative"
            style={{ 
              textAlign: 'right',
              marginRight: '0px'
            }}
          >
            {isEditingTransition ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full bg-yellow-50 border border-yellow-300 rounded p-2 font-bold text-black text-right"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={saveElementEdit}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-end">
                <span>{element.content}</span>
                <button
                  onClick={() => startEditingElement(sceneIndex, elementIndex, element.content)}
                  className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded transition-all"
                  title="Edit transition"
                >
                  ✏️
                </button>
              </div>
            )}
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="bg-white shadow-2xl border border-gray-300 max-w-5xl mx-auto">
      {/* Script Header */}
      <div className="border-b border-gray-300 p-6 bg-gray-50">
        <div className="text-center">
          <h1 className="font-bold text-xl text-black mb-2 font-mono">
            {title}
          </h1>
          <div className="text-sm text-gray-600 font-mono">
            Episode {episodeNumber}
          </div>
        </div>
      </div>
      
      {/* Script Content */}
      <div 
        className="font-mono text-black bg-white"
        style={{ 
          fontSize: '12px',
          lineHeight: '1.5',
          padding: '48px 48px', // 1 inch margins approximately
          minHeight: '800px'
        }}
      >
        {scenes.map((scene, sceneIndex) => (
          <div key={sceneIndex} className="mb-8">
            {scene.elements.map((element, elementIndex) => 
              renderScriptElement(element, elementIndex, sceneIndex)
            )}
          </div>
        ))}
      </div>
      
      {/* Page Footer */}
      <div className="border-t border-gray-300 p-4 bg-gray-50 text-center">
        <div className="text-xs text-gray-500 font-mono">
          Page {currentPage} • Generated by Reeled AI
        </div>
      </div>
    </div>
  )
}

