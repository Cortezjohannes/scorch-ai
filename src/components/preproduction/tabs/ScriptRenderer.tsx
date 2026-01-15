'use client'

import React from 'react'
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

export function ScriptRenderer({ script, showPageNumbers = true, onUpdate }: ScriptRendererProps) {
  return (
    <div 
      className="screenplay-container bg-[#1a1a1a] text-[#e7e7e7] p-12 rounded-lg border border-[#36393f] max-w-4xl mx-auto"
      style={{ fontFamily: 'Courier, monospace', fontSize: '12pt', lineHeight: '1.6' }}
    >
      {/* Title Page */}
      <div className="screenplay-title-page text-center py-20 mb-12 border-b-2 border-[#36393f]">
        {onUpdate ? (
          <EditableField
            value={script.title}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...script,
                  title: newValue as string
                })
              }
            }}
            placeholder="Enter script title..."
            className="text-4xl font-bold mb-4 uppercase text-center"
          />
        ) : (
          <h1 className="text-4xl font-bold mb-4 uppercase text-[#e7e7e7]">{script.title}</h1>
        )}
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
                onUpdate={onUpdate ? async (updatedElement: ScriptElement) => {
                  console.log('📝 Script element edited:', {
                    type: updatedElement.type,
                    contentPreview: updatedElement.content.substring(0, 50),
                    pageNumber: page.pageNumber,
                    elementIndex: idx
                  })
                  const updatedPages = [...script.pages]
                  const pageIndex = script.pages.findIndex(p => p.pageNumber === page.pageNumber)
                  if (pageIndex >= 0) {
                    updatedPages[pageIndex] = {
                      ...updatedPages[pageIndex],
                      elements: updatedPages[pageIndex].elements.map((el, i) => i === idx ? updatedElement : el)
                    }
                    await onUpdate({
                      ...script,
                      pages: updatedPages
                    })
                  }
                } : undefined}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Metadata Footer */}
      <div className="text-center text-xs text-[#e7e7e7]/50 mt-12 pt-8 border-t border-[#36393f]">
        Generated on {new Date(script.metadata.generatedAt).toLocaleDateString()}
      </div>
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
  switch (element.type) {
    case 'slug':
      return onUpdate ? (
        <div className="screenplay-slug font-bold uppercase tracking-wide text-base py-2">
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string
                })
              }
            }}
            placeholder="Enter scene heading..."
            className="font-bold uppercase"
          />
        </div>
      ) : (
        <div className="screenplay-slug font-bold uppercase tracking-wide text-base py-2">
          {element.content}
        </div>
      )

    case 'action':
      if (!element.content.trim()) return <div className="h-4" />
      return onUpdate ? (
        <div className="screenplay-action leading-relaxed">
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string
                })
              }
            }}
            multiline
            rows={2}
            placeholder="Enter action..."
            className="leading-relaxed"
          />
        </div>
      ) : (
        <div className="screenplay-action leading-relaxed">
          {element.content}
        </div>
      )

    case 'character':
      return onUpdate ? (
        <div className="screenplay-character font-bold uppercase mb-1" style={{ marginLeft: '3.7in', width: '2.5in' }}>
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string,
                  metadata: {
                    ...element.metadata,
                    characterName: newValue as string
                  }
                })
              }
            }}
            placeholder="Enter character name..."
            className="font-bold uppercase"
          />
        </div>
      ) : (
        <div className="screenplay-character font-bold uppercase mb-1" style={{ marginLeft: '3.7in', width: '2.5in' }}>
          {element.content}
        </div>
      )

    case 'dialogue':
      return onUpdate ? (
        <div className="screenplay-dialogue" style={{ marginLeft: '2.5in', width: '3.5in', textAlign: 'justify' }}>
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string
                })
              }
            }}
            multiline
            rows={3}
            placeholder="Enter dialogue..."
            className="text-justify"
          />
        </div>
      ) : (
        <div className="screenplay-dialogue" style={{ marginLeft: '2.5in', width: '3.5in', textAlign: 'justify' }}>
          {element.content}
        </div>
      )

    case 'parenthetical':
      return onUpdate ? (
        <div className="screenplay-parenthetical text-center max-w-xs mx-auto italic text-sm">
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string
                })
              }
            }}
            placeholder="Enter parenthetical..."
            className="text-center italic"
          />
        </div>
      ) : (
        <div className="screenplay-parenthetical text-center max-w-xs mx-auto italic text-sm">
          {element.content}
        </div>
      )

    case 'transition':
      return onUpdate ? (
        <div className="screenplay-transition text-right font-bold uppercase my-4">
          <EditableField
            value={element.content}
            onSave={async (newValue) => {
              if (onUpdate) {
                await onUpdate({
                  ...element,
                  content: newValue as string
                })
              }
            }}
            placeholder="Enter transition..."
            className="text-right font-bold uppercase"
          />
        </div>
      ) : (
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


