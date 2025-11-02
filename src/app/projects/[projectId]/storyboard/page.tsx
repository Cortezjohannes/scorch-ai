'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProject, Scene } from '@/context/ProjectContext';
import Link from 'next/link';
import Image from 'next/image';

export default function StoryboardPage() {
  const { projectTitle, episodes, loading, error, parseScenes, generateSceneImage } = useProject();
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(
    episodes.length > 0 ? episodes[0].episodeNumber : null
  );
  const [generatingImage, setGeneratingImage] = useState<{ episodeNumber: number, sceneIndex: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="w-12 h-12 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6">
        <h3 className="text-red-500 font-medium mb-2">Error</h3>
        <p className="text-[#e7e7e7]/70">{error}</p>
      </div>
    );
  }

  // Show prompt if no episodes have been generated
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">No Episodes Generated</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          No episodes have been generated yet. Head over to the Narrative tab or Workspace to generate your story episodes.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="./narrative" 
            className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
          >
            Go to Narrative Tab
          </Link>
          <Link 
            href="/workspace" 
            className="px-4 py-2 bg-[#2a2a2a] border border-[#e2c376] text-[#e2c376] font-medium rounded-lg hover:bg-[#2a2a2a]/70 transition-colors"
          >
            Go to Workspace
          </Link>
        </div>
      </div>
    );
  }

  // Parse scenes for the selected episode
  const currentEpisode = episodes.find(ep => ep.episodeNumber === selectedEpisode);
  const scenes = currentEpisode ? parseScenes(currentEpisode.episodeNumber) : [];

  // Function to construct prompt for a scene
  const constructPrompt = (scene: Scene, episodeNumber: number): string => {
    // Extract location and time from heading
    const headingMatch = scene.heading.match(/(INT\.|EXT\.|INT\/EXT\.) ([^-]+)(?:- )?(.+)?/i);
    
    let shotType = 'interior';
    let location = 'room';
    let timeOfDay = 'day';
    
    if (headingMatch) {
      shotType = headingMatch[1].includes('INT') ? 'interior' : 'exterior';
      if (headingMatch[1].includes('INT/EXT')) {
        shotType = 'interior and exterior';
      }
      
      location = headingMatch[2].trim();
      
      if (headingMatch[3]) {
        const timeMatch = headingMatch[3].match(/(DAY|NIGHT|MORNING|EVENING|AFTERNOON|DUSK|DAWN)/i);
        if (timeMatch) {
          timeOfDay = timeMatch[1].toLowerCase();
        }
      }
    }
    
    // Extract characters from description
    const allCapsRegex = /\b([A-Z]{2,}(?:'S)?)\b/g;
    const potentialCharacters = new Set<string>();
    let match;
    while ((match = allCapsRegex.exec(scene.description)) !== null) {
      potentialCharacters.add(match[1]);
    }
    
    // Filter out common non-character all-caps words
    const commonNonCharacters = ['INT', 'EXT', 'DAY', 'NIGHT', 'MORNING', 'EVENING', 'AFTERNOON'];
    const characters = Array.from(potentialCharacters).filter(char => 
      !commonNonCharacters.includes(char) && char.length > 1
    );
    
    // Create the prompt
    let prompt = `High quality cinematic ${shotType} shot of ${location} during ${timeOfDay}.`;
    
    if (characters.length > 0) {
      prompt += ` With characters: ${characters.join(', ')}.`;
    }
    
    // Add scene description
    prompt += ` ${scene.description}`;
    
    // Add style guidance
    prompt += ` Scene from Episode ${episodeNumber} of "${projectTitle}". Professional cinematic lighting, composition, and framing. Highly detailed, photorealistic, 4K film still.`;
    
    return prompt;
  };

  // Function to generate an image for a scene
  const handleGenerateImage = async (episodeNumber: number, sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    if (!scene) return;
    
    setGeneratingImage({ episodeNumber, sceneIndex });
    setErrorMessage(null);
    
    try {
      const prompt = constructPrompt(scene, episodeNumber);
      await generateSceneImage(episodeNumber, sceneIndex, prompt);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(null);
    }
  };

  return (
    <div className="py-6">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#e2c376]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {projectTitle} - Storyboard
      </motion.h2>
      
      {errorMessage && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}
      
      {/* Episode Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {episodes.map(episode => (
          <button
            key={`episode-${episode.episodeNumber}`}
            onClick={() => setSelectedEpisode(episode.episodeNumber)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors 
              ${selectedEpisode === episode.episodeNumber 
                ? 'bg-[#e2c376] text-black' 
                : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'}`}
          >
            Episode {episode.episodeNumber}
          </button>
        ))}
      </div>
      
      {/* Scenes Storyboard */}
      {scenes.length === 0 ? (
        <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-[#e7e7e7] mb-2">No Scenes Found</h3>
          <p className="text-[#e7e7e7]/70">
            No scenes could be detected in this episode. The script may be in a different format.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenes.map((scene, index) => (
            <motion.div
              key={`scene-${selectedEpisode}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-[#1a1a1a] border border-[#36393f] rounded-xl overflow-hidden"
            >
              {/* Scene Heading */}
              <div className="bg-[#2a2a2a] p-4 border-b border-[#36393f]">
                <h3 className="font-bold">Scene {index + 1}: {scene.heading}</h3>
              </div>
              
              {/* Scene Content */}
              <div className="p-4">
                <p className="text-sm text-[#e7e7e7]/70 mb-4">{scene.description}</p>
                
                {/* Image Area */}
                <div className="aspect-video bg-[#0a0a0a] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {scene.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={scene.imageUrl} 
                        alt={`Scene ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : scene.imageGenerating || (generatingImage?.episodeNumber === selectedEpisode && generatingImage?.sceneIndex === index) ? (
                    <div className="flex flex-col items-center justify-center">
                      <motion.div 
                        className="w-10 h-10 border-3 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full mb-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-sm text-[#e7e7e7]/50">Generating image...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-sm text-[#e7e7e7]/50 mb-3">No image generated yet</p>
                    </div>
                  )}
                </div>
                
                {/* Generate Button */}
                <button
                  onClick={() => handleGenerateImage(selectedEpisode!, index)}
                  disabled={scene.imageGenerating || (generatingImage?.episodeNumber === selectedEpisode && generatingImage?.sceneIndex === index)}
                  className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${scene.imageGenerating || (generatingImage?.episodeNumber === selectedEpisode && generatingImage?.sceneIndex === index)
                      ? 'bg-[#2a2a2a]/50 text-[#e7e7e7]/40 cursor-not-allowed'
                      : scene.imageUrl
                        ? 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
                        : 'bg-[#e2c376] text-black hover:bg-[#d4b46a]'
                    }`}
                >
                  {scene.imageUrl ? 'Regenerate Image' : 'Generate Image'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Episode Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            const currentIndex = episodes.findIndex(ep => ep.episodeNumber === selectedEpisode);
            if (currentIndex > 0) {
              setSelectedEpisode(episodes[currentIndex - 1].episodeNumber);
            }
          }}
          disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium
            ${episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === 0
              ? 'bg-[#2a2a2a]/50 text-[#e7e7e7]/40 cursor-not-allowed'
              : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f] transition-colors'}`}
        >
          ← Previous Episode
        </button>
        
        <button
          onClick={() => {
            const currentIndex = episodes.findIndex(ep => ep.episodeNumber === selectedEpisode);
            if (currentIndex < episodes.length - 1) {
              setSelectedEpisode(episodes[currentIndex + 1].episodeNumber);
            }
          }}
          disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === episodes.length - 1}
          className={`px-4 py-2 rounded-md text-sm font-medium
            ${episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === episodes.length - 1
              ? 'bg-[#2a2a2a]/50 text-[#e7e7e7]/40 cursor-not-allowed'
              : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f] transition-colors'}`}
        >
          Next Episode →
        </button>
      </div>
    </div>
  );
} 