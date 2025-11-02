'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import StoryboardDisplay from './StoryboardDisplay'
import PreProductionLoader from './PreProductionLoader'

interface StoryboardSectionProps {
  generatedContent: any
  storyBible: any
  arcIndex: number
  arcEpisodes: any[]
  arcTitle: string
  selectedEpisode: number
  generateAllContent: () => void
}

export default function StoryboardSection({
  generatedContent,
  storyBible,
  arcIndex,
  arcEpisodes,
  arcTitle,
  selectedEpisode,
  generateAllContent
}: StoryboardSectionProps) {
  const storyboardContent = generatedContent?.storyboard || generatedContent?.generatedContent?.storyboard;
  const storyboardEpisodes = storyboardContent?.episodes || [];
  const visualStyle = storyboardContent?.visualStyle || {
    description: "No visual style defined",
    cinematicReferences: []
  };
  
  // Check if storyboard content is available
  if (!storyboardEpisodes || storyboardEpisodes.length === 0) {
    return (
      <PreProductionLoader
        contentType="storyboard"
        storyBible={storyBible}
        arcIndex={arcIndex}
        arcEpisodes={arcEpisodes}
        arcTitle={arcTitle}
        onContentGenerated={(content) => {
          // This would normally update state in the parent component
          console.log("Storyboard content generated:", content);
          // We're relying on page refresh to show the new content
          window.location.reload();
        }}
        onGenerateAll={generateAllContent}
      />
    )
  }
  
  // Filter to the selected episode
  const selectedEpisodeContent = storyboardEpisodes
    .filter((ep: any) => parseInt(ep.number) === selectedEpisode || ep.number === selectedEpisode);
  
  if (selectedEpisodeContent.length === 0) {
    return (
      <div className="p-6 bg-[#2a2a2a] rounded-lg text-center">
        <p className="text-[#e7e7e7]/70">No storyboard content available for Episode {selectedEpisode}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Visual style card */}
      <Card className="border border-[#36393f] shadow-md">
        <CardHeader className="bg-[#2a2a2a]">
          <CardTitle>Visual Style Guide</CardTitle>
          <CardDescription>Overall visual aesthetic for the production</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#00FF99] mb-2">Overall Visual Aesthetic</h3>
            <p className="text-[#e7e7e7]/90">{visualStyle.description}</p>
          </div>
          
          {visualStyle.cinematicReferences && visualStyle.cinematicReferences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#00FF99] mb-2">Cinematic References</h3>
              <ul className="list-disc list-inside">
                {visualStyle.cinematicReferences.map((ref: string, index: number) => (
                  <li key={index} className="text-[#e7e7e7]/90">{ref}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 pt-3">
            <div className="bg-[#232427] border border-[#36393f] rounded-md px-3 py-1 text-sm font-medium text-[#00FF99]">
              Cinematic
            </div>
            <div className="bg-[#232427] border border-[#36393f] rounded-md px-3 py-1 text-sm text-[#e7e7e7]/80">
              Stylized
            </div>
            <div className="bg-[#232427] border border-[#36393f] rounded-md px-3 py-1 text-sm text-[#e7e7e7]/80">
              Modern
            </div>
            <div className="bg-[#232427] border border-[#36393f] rounded-md px-3 py-1 text-sm text-[#e7e7e7]/80">
              Dramatic
            </div>
            <div className="bg-[#232427] border border-[#36393f] rounded-md px-3 py-1 text-sm text-[#e7e7e7]/80">
              Teen Drama
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-md font-medium mb-2">Color Palette</h4>
              <p className="text-sm text-[#e7e7e7]/80">
                {visualStyle.colorPalette || "Balanced, natural palette with vibrant accents for emotional moments"}
              </p>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Lighting</h4>
              <p className="text-sm text-[#e7e7e7]/80">
                {visualStyle.lighting || "Natural with stylized moments to emphasize emotional beats"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Episodes */}
      <div>
        <h3 className="text-xl font-bold mb-4">Episodes</h3>
        
        {/* Episode navigation */}
        <Card className="border border-[#36393f] shadow-md mb-6">
          <CardHeader className="bg-[#2a2a2a]">
            <CardTitle>Episode Navigation</CardTitle>
            <CardDescription>Select an episode to view its storyboard</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {storyboardEpisodes.map((ep: any) => (
                <button
                  key={ep.number}
                  onClick={() => window.location.href = `?arc=${arcIndex + 1}&episode=${ep.number}`}
                  className={`px-4 py-2 rounded-lg ${
                    selectedEpisode === parseInt(ep.number)
                      ? "bg-[#00FF99] text-black font-medium" 
                      : "bg-[#36393f] text-[#e7e7e7] hover:bg-[#4f535a]"
                  }`}
                >
                  {ep.number || '?'}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Selected Episode Storyboard */}
        {selectedEpisodeContent.map((episode: any, index: number) => (
          <StoryboardDisplay key={index} episode={episode} visualStyle={visualStyle} />
        ))}
      </div>
    </div>
  );
} 