'use client'

import React from 'react'
import { FileText, Copy } from 'lucide-react'

type KeyScene = {
  sceneNumber: number
  episodeNumber: number
  dialogue: string
  context: string
}

interface AuditionSidesViewerProps {
  keyScenes?: KeyScene[]
  characterName: string
}

export function AuditionSidesViewer({ keyScenes = [], characterName }: AuditionSidesViewerProps) {
  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  if (!keyScenes.length) {
    return (
      <div className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] text-xs text-[#e7e7e7]/60">
        No audition sides available for {characterName} yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {keyScenes.map((scene, idx) => {
        const dialogue = scene.dialogue || ''
        return (
          <div key={`${scene.episodeNumber}-${scene.sceneNumber}-${idx}`} className="border border-[#36393f] rounded-lg p-3 bg-[#1a1a1a] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#e7e7e7]/70">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#10B981]" />
                <span>
                  Ep {scene.episodeNumber} • Scene {scene.sceneNumber}
                </span>
              </div>
              <button
                onClick={() => handleCopy(dialogue)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7]/70 hover:border-[#10B981]/50 hover:text-[#10B981] transition-colors text-[11px]"
                title="Copy dialogue"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            {scene.context && (
              <div className="text-xs text-[#e7e7e7]/60">
                <span className="font-semibold text-[#e7e7e7]/80">Context: </span>
                {scene.context}
              </div>
            )}
            {dialogue && (
              <pre className="whitespace-pre-wrap text-xs text-[#e7e7e7] bg-[#111] border border-[#36393f] rounded p-2 overflow-x-auto">
                {dialogue}
              </pre>
            )}
          </div>
        )
      })}
    </div>
  )
}
























