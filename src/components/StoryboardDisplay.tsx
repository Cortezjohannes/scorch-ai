'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface StoryboardDisplayProps {
  episode: any
  visualStyle: any
}

export default function StoryboardDisplay({ episode, visualStyle = {} }: StoryboardDisplayProps) {
  if (!episode) {
    return (
      <div className="text-center p-6 bg-[#2a2a2a] rounded-lg">
        <p className="text-[#e7e7e7]/70">No storyboard content available</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Episode synopsis */}
      <Card className="border border-[#36393f] shadow-md overflow-hidden">
        <CardHeader className="bg-[#2a2a2a]">
          <CardTitle>Episode {episode.number}: {episode.title || 'Untitled'}</CardTitle>
          <CardDescription>{episode.synopsis || "No synopsis available"}</CardDescription>
        </CardHeader>
      </Card>
      
      {/* Scenes */}
      <div className="space-y-6">
        <h5 className="text-lg font-bold">Scenes</h5>
        
        {(episode.scenes || []).map((scene: any, sceneIndex: number) => (
          <Card key={sceneIndex} className="border border-[#36393f] bg-[#232427] shadow-md overflow-hidden">
            <CardHeader className="bg-[#2a2a2a] border-b border-[#36393f]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Scene {scene.number || sceneIndex + 1}
                </CardTitle>
                <span className="text-[#e7e7e7]/70 text-sm">
                  {scene.location || "Location unknown"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="mb-4">
                <h6 className="font-medium text-[#e2c376] mb-2">Description</h6>
                <p className="text-[#e7e7e7]/90">{scene.description || "No description available"}</p>
              </div>
              
              {/* Scene visualization placeholder */}
              <div className="mt-6 mb-6 bg-[#1a1a1a]/50 p-4 rounded-md border border-dashed border-[#36393f]">
                <div className="text-center text-[#e7e7e7]/60 text-sm mb-4">
                  <span className="block">Scene visualization</span>
                  <span className="text-xs">Based on description and visual style</span>
                </div>
                <div className="aspect-video bg-gradient-to-tr from-[#1a1a1a] to-[#2a2a2a] rounded overflow-hidden flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#e2c376]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              {/* Shots */}
              {scene.shots && scene.shots.length > 0 ? (
                <div>
                  <h6 className="font-medium text-[#e2c376] mb-3">Shot Breakdown</h6>
                  <div className="space-y-4">
                    {scene.shots.map((shot: any, shotIndex: number) => (
                      <div key={shotIndex} className="p-4 border border-[#36393f] rounded-md bg-[#1e1f22]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Shot {shot.number || shotIndex + 1}</span>
                          <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded-full text-[#e7e7e7]/70">
                            {shot.duration || "Duration unspecified"}
                          </span>
                        </div>
                        <p className="text-sm mb-3">{shot.description || "No description available"}</p>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs text-[#e7e7e7]/70">
                          <div>
                            <span className="block font-medium text-[#e2c376]/80">Camera</span>
                            {shot.camera || "Not specified"}
                          </div>
                          <div>
                            <span className="block font-medium text-[#e2c376]/80">Movement</span>
                            {shot.movement || "Not specified"}
                          </div>
                          <div>
                            <span className="block font-medium text-[#e2c376]/80">Composition</span>
                            {shot.composition || "Not specified"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-[#1e1f22] rounded-md text-[#e7e7e7]/50">
                  No shot breakdown available
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
