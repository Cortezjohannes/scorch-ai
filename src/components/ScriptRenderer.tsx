'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface ScriptRendererProps {
  episode: any
}

export default function ScriptRenderer({ episode }: ScriptRendererProps) {
  if (!episode) {
    return (
      <div className="text-center p-6 bg-[#2a2a2a] rounded-lg">
        <p className="text-[#e7e7e7]/70">No episode content available</p>
      </div>
    )
  }
  
  return (
    <Card className="border border-[#36393f] shadow-md overflow-hidden">
      <CardHeader className="bg-[#2a2a2a]">
        <div className="flex justify-between items-center">
          <CardTitle className="flex gap-2 items-center">
            <span className="text-[#e2c376] min-w-[110px]">
              Episode {episode.number || '?'}
            </span>
            {episode.title || 'Untitled'}
          </CardTitle>
        </div>
        <CardDescription className="mt-2">
          {episode.synopsis || "No synopsis available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 bg-[#1e1f22] font-mono text-sm">
        {/* Scene formatting */}
        {(episode.scenes || []).map((scene: any, sceneIndex: number) => (
          <div key={sceneIndex} className="mb-8">
            <div className="uppercase font-bold text-center mb-4">
              SCENE {scene.number || sceneIndex + 1} - {scene.location || "LOCATION"}
            </div>
            
            <div className="mb-4 text-[#e7e7e7]/80">
              {scene.description || "No description available"}
            </div>
            
            {/* Dialogues */}
            {scene.dialogues && scene.dialogues.length > 0 ? (
              <div className="space-y-6 mt-6">
                {scene.dialogues.map((dialogue: any, dialogueIndex: number) => (
                  <div key={dialogueIndex} className="mb-4">
                    <div className="text-center uppercase font-bold text-[#e2c376] mb-1">
                      {dialogue.character || "CHARACTER"}
                    </div>
                    <div className="pl-12 pr-12 mb-1">
                      "{dialogue.lines || "No dialogue"}"
                    </div>
                    {dialogue.direction && (
                      <div className="text-center text-[#e7e7e7]/60 italic">
                        ({dialogue.direction})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[#e7e7e7]/50 italic text-center mt-4">
                No dialogues available
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
