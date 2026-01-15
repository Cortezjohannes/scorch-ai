'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EditableField } from '../shared/EditableField'

interface ScriptElement {
  type: 'slug' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'page-break'
  content: string
  metadata?: {
    sceneNumber?: number
    characterName?: string
  }
}

interface ScriptPage {
  pageNumber: number
  elements: ScriptElement[]
}

interface GeneratedScript {
  title: string
  episodeNumber: number
  pages: ScriptPage[]
  metadata: {
    pageCount: number
    sceneCount: number
    characterCount: number
    estimatedRuntime: string
    generatedAt: number
  }
}

interface ScriptRendererProps {
  script: GeneratedScript
  showPageNumbers?: boolean
  onUpdate?: (updatedScript: GeneratedScript) => Promise<void>
}

// Convert script structure to plain text
function scriptToText(script: GeneratedScript): string {
  let text = `${script.title}\n\nEpisode ${script.episodeNumber}\n\n`
  
  script.pages.forEach((page) => {
    page.elements.forEach((element) => {
      switch (element.type) {
        case 'slug':
          text += `\n${element.content}\n`
          break
        case 'action':
          text += `${element.content}\n`
          break
        case 'character':
          text += `\n${element.content}\n`
          break
        case 'dialogue':
          text += `${element.content}\n`
          break
        case 'parenthetical':
          text += `${element.content}\n`
          break
        case 'transition':
          text += `\n${element.content}\n`
          break
        case 'page-break':
          text += `\n--- PAGE BREAK ---\n`
          break
      }
    })
  })
  
  return text.trim()
}

// Parse plain text back to script structure
function textToScript(text: string, originalScript: GeneratedScript): GeneratedScript {
  const lines = text.split('\n')
  const pages: ScriptPage[] = []
  let currentPage: ScriptElement[] = []
  let pageNumber = 1
  let sceneNumber = 1
  
  // Skip title and episode number lines
  let i = 0
  while (i < lines.length && (lines[i].trim() === '' || !lines[i].match(/^(INT\.|EXT\.)/i))) {
    i++
  }
  
  for (; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      if (currentPage.length > 0) {
        currentPage.push({ type: 'action', content: '' })
      }
      continue
    }
    
    // Page break
    if (line.includes('PAGE BREAK')) {
      if (currentPage.length > 0) {
        pages.push({ pageNumber: pageNumber++, elements: currentPage })
        currentPage = []
      }
      continue
    }
    
    // Scene heading (slug)
    if (line.match(/^(INT\.|EXT\.)/i)) {
      if (currentPage.length > 0 && pages.length === 0) {
        // First page
        pages.push({ pageNumber: pageNumber++, elements: currentPage })
        currentPage = []
      }
      currentPage.push({
        type: 'slug',
        content: line,
        metadata: { sceneNumber: sceneNumber++ }
      })
      continue
    }
    
    // Transition
    if (line.match(/^(CUT TO:|FADE TO:|FADE OUT:|DISSOLVE TO:)/i)) {
      currentPage.push({ type: 'transition', content: line })
      continue
    }
    
    // Parenthetical
    if (line.startsWith('(') && line.endsWith(')')) {
      currentPage.push({ type: 'parenthetical', content: line })
      continue
    }
    
    // Character name (all caps, short line, followed by dialogue)
    if (line.match(/^[A-Z\s]+$/) && line.length > 2 && line.length < 40 && 
        i + 1 < lines.length && lines[i + 1].trim() && 
        !lines[i + 1].trim().match(/^(INT\.|EXT\.|CUT TO:|FADE)/i)) {
      currentPage.push({
        type: 'character',
        content: line,
        metadata: { characterName: line }
      })
      // Next line is dialogue
      if (i + 1 < lines.length) {
        i++
        currentPage.push({ type: 'dialogue', content: lines[i].trim() })
      }
      continue
    }
    
    // Check if previous element was character (then this is dialogue)
    if (currentPage.length > 0 && currentPage[currentPage.length - 1].type === 'character') {
      currentPage.push({ type: 'dialogue', content: line })
      continue
    }
    
    // Default to action
    currentPage.push({ type: 'action', content: line })
  }
  
  // Add last page
  if (currentPage.length > 0) {
    pages.push({ pageNumber: pageNumber, elements: currentPage })
  }
  
  // Update metadata
  const sceneCount = pages.reduce((count, page) => 
    count + page.elements.filter(el => el.type === 'slug').length, 0
  )
  
  const characterCount = new Set(
    pages.flatMap(page => 
      page.elements
        .filter(el => el.type === 'character' && el.metadata?.characterName)
        .map(el => el.metadata!.characterName!)
    )
  ).size
  
  return {
    ...originalScript,
    pages,
    metadata: {
      ...originalScript.metadata,
      pageCount: pages.length,
      sceneCount
    }
  }
}

export function ScriptRenderer({ script, showPageNumbers = true, onUpdate }: ScriptRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleStartEdit = () => {
    setEditText(scriptToText(script))
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!onUpdate) return
    
    setIsSaving(true)
    try {
      const updatedScript = textToScript(editText, script)
      await onUpdate(updatedScript)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving script:', error)
      alert('Failed to save script. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div 
      className="screenplay-container bg-[#1a1a1a] text-[#e7e7e7] p-12 rounded-lg border border-[#36393f] max-w-4xl mx-auto"
      style={{ fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}
    >
      {/* Edit Mode Toggle */}
      {onUpdate && (
        <div className="mb-6 flex justify-end">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Edit Script</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] font-medium rounded-lg hover:bg-[#36393f] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Script</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Title Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#e7e7e7]/70 mb-2">
                Script Title
              </label>
              <input
                type="text"
                value={editText.split('\n')[0]}
                onChange={(e) => {
                  const lines = editText.split('\n')
                  lines[0] = e.target.value
                  setEditText(lines.join('\n'))
                }}
                className="w-full bg-[#2a2a2a] border border-[#36393f] rounded-lg px-4 py-2 text-[#e7e7e7] text-2xl font-bold uppercase"
                placeholder="Enter script title..."
              />
            </div>

            {/* Full Script Text Editor */}
            <div>
              <label className="block text-sm font-medium text-[#e7e7e7]/70 mb-2">
                Script Content
              </label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-[600px] bg-[#2a2a2a] border border-[#36393f] rounded-lg px-4 py-3 text-[#e7e7e7] font-mono text-sm leading-relaxed resize-none"
                placeholder="Enter your script content here..."
                style={{ fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}
              />
              <p className="text-xs text-[#e7e7e7]/50 mt-2">
                Format: Scene headings (INT./EXT.), Character names in ALL CAPS, Dialogue, Action lines, etc.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Title Page */}
            <div className="screenplay-title-page text-center py-20 mb-12 border-b-2 border-[#36393f]">
              <h1 className="text-4xl font-bold mb-4 uppercase text-[#e7e7e7]">{script.title}</h1>
              <div className="text-xl mb-8 text-[#e7e7e7]">Episode {script.episodeNumber}</div>
              <div className="text-sm text-[#e7e7e7]/70 space-y-2">
                <div>{script.metadata.sceneCount} Scenes</div>
                <div>{script.metadata.characterCount} Characters</div>
                <div>Runtime: ~{script.metadata.estimatedRuntime}</div>
              </div>
            </div>

            {/* Script Pages */}
            {script.pages.map((page) => (
              <div key={page.pageNumber} className="screenplay-page mb-12 relative">
                {showPageNumbers && (
                  <div className="absolute -top-6 right-0 text-[#e7e7e7]/50 text-xs">
                    Page {page.pageNumber}
                  </div>
                )}
                
                <div className="space-y-4">
                  {page.elements.map((element, idx) => (
                    <ScriptElementRenderer 
                      key={idx} 
                      element={element} 
                      onUpdate={undefined}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Metadata Footer */}
            <div className="text-center text-xs text-[#e7e7e7]/50 mt-12 pt-8 border-t border-[#36393f]">
              Generated on {new Date(script.metadata.generatedAt).toLocaleDateString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScriptElementRenderer({ 
  element, 
  onUpdate 
}: { 
  element: ScriptElement
  onUpdate?: (updatedElement: ScriptElement) => Promise<void>
}) {
  // Read-only view only - editing is done at the script level
  switch (element.type) {
    case 'slug':
      return (
        <div className="screenplay-slug font-bold uppercase tracking-wide text-base py-2">
          {element.content}
        </div>
      )

    case 'action':
      if (!element.content.trim()) return <div className="h-4" />
      return (
        <div className="screenplay-action leading-relaxed">
          {element.content}
        </div>
      )

    case 'character':
      return (
        <div className="screenplay-character font-bold uppercase mb-1" style={{ marginLeft: '3.7in', width: '2.5in' }}>
          {element.content}
        </div>
      )

    case 'dialogue':
      return (
        <div className="screenplay-dialogue" style={{ marginLeft: '2.5in', width: '3.5in', textAlign: 'justify' }}>
          {element.content}
        </div>
      )

    case 'parenthetical':
      return (
        <div className="screenplay-parenthetical text-center max-w-xs mx-auto italic text-sm">
          {element.content}
        </div>
      )

    case 'transition':
      return (
        <div className="screenplay-transition text-right font-bold uppercase my-4">
          {element.content}
        </div>
      )

    case 'page-break':
      return (
        <div className="screenplay-page-break border-t-2 border-dashed border-[#36393f] my-8" />
      )

    default:
      return null
  }
}

// Compact view for breakdown mode
export function ScriptBreakdownView({ script }: { script: GeneratedScript }) {
  // Extract all scenes (slug lines)
  const scenes = script.pages.flatMap(page => 
    page.elements
      .filter(el => el.type === 'slug')
      .map(el => ({
        sceneNumber: el.metadata?.sceneNumber || 0,
        heading: el.content
      }))
  )

  // Extract all characters
  const characters = new Set<string>()
  script.pages.forEach(page => {
    page.elements.forEach(el => {
      if (el.type === 'character' && el.metadata?.characterName) {
        characters.add(el.metadata.characterName)
      }
    })
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Pages</div>
          <div className="text-2xl font-bold text-[#10B981]">{script.metadata.pageCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Scenes</div>
          <div className="text-2xl font-bold text-[#10B981]">{script.metadata.sceneCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Characters</div>
          <div className="text-2xl font-bold text-[#10B981]">{script.metadata.characterCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Runtime</div>
          <div className="text-2xl font-bold text-[#10B981]">~{script.metadata.estimatedRuntime}</div>
        </div>
      </div>

      {/* Scenes List */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#36393f] p-6">
        <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Scenes</h3>
        <div className="space-y-2">
          {scenes.map((scene, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded border border-[#36393f]">
              <div className="w-8 h-8 flex items-center justify-center bg-[#10B981] text-black font-bold rounded">
                {scene.sceneNumber}
              </div>
              <div className="flex-1 text-[#e7e7e7] font-mono text-sm">
                {scene.heading}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Characters List */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#36393f] p-6">
        <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Characters</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(characters).map((char, idx) => (
            <div key={idx} className="px-4 py-2 bg-[#2a2a2a] rounded border border-[#36393f] text-[#e7e7e7] text-sm">
              {char}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


