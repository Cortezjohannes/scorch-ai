'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import ScriptRenderer from './ScriptRenderer'
import PreProductionLoader from './PreProductionLoader'

interface ScriptSectionProps {
  generatedContent: any
  storyBible: any
  arcIndex: number
  arcEpisodes: any[]
  arcTitle: string
  selectedEpisode: number
  generateAllContent: () => void
}

export default function ScriptSection({
  generatedContent,
  storyBible,
  arcIndex,
  arcEpisodes,
  arcTitle,
  selectedEpisode,
  generateAllContent
}: ScriptSectionProps) {
  const scriptEpisodes = generatedContent?.generatedContent?.script?.episodes || 
                         generatedContent?.script?.episodes || [];
  
  // Check if script content is available
  if (!scriptEpisodes || scriptEpisodes.length === 0) {
    return (
      <PreProductionLoader
        contentType="script"
        storyBible={storyBible}
        arcIndex={arcIndex}
        arcEpisodes={arcEpisodes}
        arcTitle={arcTitle}
        onContentGenerated={(content) => {
          // This would normally update state in the parent component
          console.log("Script content generated:", content);
          // We're relying on page refresh to show the new content
          window.location.reload();
        }}
        onGenerateAll={generateAllContent}
      />
    )
  }
  
  // Filter to the selected episode
  const selectedEpisodeContent = scriptEpisodes
    .filter((ep: any) => parseInt(ep.number) === selectedEpisode || ep.number === selectedEpisode);
  
  if (selectedEpisodeContent.length === 0) {
    return (
      <div className="p-6 bg-[#2a2a2a] rounded-lg text-center">
        <p className="text-[#e7e7e7]/70">No script content available for Episode {selectedEpisode}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-[#10B981] mb-2">Script</h3>
        <p className="text-[#e7e7e7]/70">
          Professional screenplay format for all episodes in this arc.
        </p>
      </div>
      
      <Card className="border border-[#36393f] shadow-md">
        <CardHeader className="bg-[#2a2a2a]">
          <CardTitle>Episode Navigation</CardTitle>
          <CardDescription>Select an episode to view its script</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {scriptEpisodes.map((ep: any) => (
              <button
                key={ep.number}
                onClick={() => window.location.href = `?arc=${arcIndex + 1}&episode=${ep.number}`}
                className={`px-4 py-2 rounded-lg ${
                  selectedEpisode === parseInt(ep.number)
                    ? "bg-[#10B981] text-black font-medium" 
                    : "bg-[#36393f] text-[#e7e7e7] hover:bg-[#4f535a]"
                }`}
              >
                {ep.number || '?'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedEpisodeContent.map((episode: any, index: number) => (
        <ScriptRenderer key={index} episode={episode} />
      ))}
    </div>
  );
} 