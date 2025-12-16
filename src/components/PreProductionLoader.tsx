'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import GenerationProgressOverlay from './GenerationProgressOverlay'

interface PreProductionLoaderProps {
  contentType: string
  storyBible: any
  arcIndex: number
  arcEpisodes: any[]
  arcTitle: string
  onContentGenerated: (content: any) => void
  onGenerateAll?: () => void // Optional callback for Generate All button
}

export default function PreProductionLoader({
  contentType,
  storyBible,
  arcIndex,
  arcEpisodes,
  arcTitle,
  onContentGenerated,
  onGenerateAll
}: PreProductionLoaderProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStep, setGenerationStep] = useState('')
  const [generationStepIndex, setGenerationStepIndex] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!storyBible) {
      setError('Cannot generate content: missing story bible')
      return
    }
    
    // Reset error state
    setError(null)
    
    // Set initial generation state
    setIsGenerating(true)
    setGenerationProgress(5)
    setGenerationStep(`Preparing ${contentType} generation`)
    setGenerationStepIndex(1)
    
    try {
      // Get creative mode from workspace data first, then story bible, then default to beast
      const workspaceData = (window as any).scorched_workspace_data || (window as any).reeled_workspace_data || {}
      const mode = workspaceData.mode || storyBible.creativeMode || 'beast'
      
      console.log('Workspace data:', workspaceData);
      console.log('Story bible:', storyBible);
      console.log('Arc episodes:', arcEpisodes);
      
      // Update progress
      setGenerationProgress(15)
      setGenerationStep(`Analyzing ${arcTitle}`)
      setGenerationStepIndex(2)
      
      // Fallback arc episodes if not provided
      const actualEpisodes = arcEpisodes && arcEpisodes.length > 0 
        ? arcEpisodes
        : [{
            episodeNumber: 1,
            episodeTitle: "Episode 1",
            scenes: [
              {
                content: "INT. OFFICE - DAY\nThe team works on their project."
              }
            ]
          }];
      
      // Prepare request data with workspace context for coherence
      const requestData = {
        storyBible,
        arcIndex,
        arcEpisodes: actualEpisodes,
        contentType,
        mode,
        // Include workspace data for story coherence
        workspaceEpisodes: workspaceData.workspaceEpisodes || {
          1: actualEpisodes[0]
        },
        userChoices: workspaceData.userChoices || [],
        generatedEpisodes: workspaceData.generatedEpisodes || {},
        completedArcs: workspaceData.completedArcs || {}
      }
      
      // Update progress
      setGenerationProgress(30)
      setGenerationStep(`Generating ${contentType} content`)
      setGenerationStepIndex(3)
      
      // Make API request
      console.log('Sending API request to generate content:', contentType)
      console.log('Request data:', JSON.stringify(requestData))
      
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      // Update progress
      setGenerationProgress(75)
      setGenerationStep('Processing response')
      setGenerationStepIndex(4)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API request failed: ${errorData.error || errorData.details || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      // Update progress
      setGenerationProgress(90)
      setGenerationStep('Finalizing content')
      setGenerationStepIndex(5)
      
      if (result.success) {
        // Extract content from the response - handle both content and preProduction response formats
        const content = result.preProduction?.[contentType] || result.preProduction || result.content?.[contentType] || result.content
        
        // Save to localStorage for future reference
        try {
          const savedContent = localStorage.getItem('scorched-preproduction-content') || localStorage.getItem('reeled-preproduction-content') || '{}'
          const parsedContent = JSON.parse(savedContent)
          const updatedContent = {
            ...parsedContent,
            [`arc${arcIndex}-${contentType}`]: content
          };
          localStorage.setItem('reeled-preproduction-content', JSON.stringify(updatedContent))
          
          // Also save to the arc-specific storage key
          localStorage.setItem(`reeled-preproduction-${arcIndex}`, localStorage.getItem(`reeled-preproduction-${arcIndex}`) || '{}')
          const arcContent = JSON.parse(localStorage.getItem(`reeled-preproduction-${arcIndex}`) || '{}')
          arcContent[contentType] = content
          localStorage.setItem(`reeled-preproduction-${arcIndex}`, JSON.stringify(arcContent))
        } catch (e) {
          console.error('Error saving to localStorage:', e)
        }
        
        // Call the callback with the new content
        onContentGenerated(content)
      } else if (result.rawContent) {
        // Handle raw content response
        onContentGenerated({ rawContent: result.rawContent })
      } else {
        // If generation failed, use fallback data
        console.log('Generation failed - using fallback data');
        const fallbackData = getFallbackData(contentType);
        onContentGenerated(fallbackData);
      }
      
      // Complete progress
      setGenerationProgress(100)
      setGenerationStep('Generation complete!')
      
      // Hide progress overlay after a brief delay
      setTimeout(() => {
        setIsGenerating(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error generating content:', error)
      // Show error in generation step
      setError((error as Error).message)
      setGenerationStep(`Error: ${(error as Error).message}`)
      
      // Use fallback data in case of error
      console.log('Error - using fallback data');
      const fallbackData = getFallbackData(contentType);
      onContentGenerated(fallbackData);
      
      // Hide progress overlay after a brief delay
      setTimeout(() => {
        setIsGenerating(false)
      }, 3000)
    }
  }

  // Provide fallback data for different content types
  function getFallbackData(contentType: string): any {
    const data: Record<string, any> = {
      script: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            scenes: [
              {
                sceneNumber: 1,
                screenplay: "INT. OFFICE - DAY\n\nA development team is gathered around a conference table.\n\nDEVELOPER\nThe API seems to be having issues. Let's implement our fallback plan.\n\nPRODUCT MANAGER\nGood idea. Our users shouldn't notice any disruption."
              }
            ]
          }
        ],
        totalScenes: 1,
        format: "scene-by-scene-screenplay"
      },
      storyboard: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            scenes: [
              {
                sceneNumber: 1,
                storyboard: "SHOT 1: WIDE SHOT\nCamera: Eye Level - Static\nDescription: Conference room with development team around table."
              }
            ]
          }
        ],
        visualStyle: {
          description: "Clean, professional aesthetic with balanced composition",
          cinematicReferences: ["The Social Network"]
        },
        format: "visual-storyboard"
      },
      props: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            props: "ESSENTIAL PROPS LIST - FALLBACK\n\n1. OFFICE SETTING\n   - Conference table\n   - Laptops and devices\n   - Notepads\n   - Coffee mugs\n\n2. CHARACTER-SPECIFIC ITEMS\n   - Developer: Laptop with coding stickers\n   - Product Manager: Tablet with project management software"
          }
        ],
        format: "production-props"
      },
      casting: {
        characters: [
          {
            name: "DEVELOPER",
            description: "Technical team member - 20s-30s, any gender, conveys intelligence and problem-solving ability."
          },
          {
            name: "PRODUCT MANAGER",
            description: "Leadership role - 30s-40s, any gender, projects confidence and organization skills."
          }
        ],
        format: "casting-guide"
      },
      location: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            locations: "LOCATION REQUIREMENTS - FALLBACK\n\n1. MODERN OFFICE SETTING\n   - Conference room with table for 6-8 people\n   - Tech company aesthetic\n   - Good lighting for daytime scene"
          }
        ],
        format: "location-guide"
      },
      marketing: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            marketingHooks: [
              "When systems fail, people step up",
              "Reliability through innovation",
              "Engineering excellence in action"
            ],
            hashtags: ["TechLife", "Innovation", "EngineeringExcellence"]
          }
        ],
        format: "marketing-strategy"
      },
      postProduction: {
        episodes: [
          {
            episodeNumber: 1,
            episodeTitle: "Fallback Episode",
            scenes: [
              {
                sceneNumber: 1,
                sceneTitle: "Conference Room",
                notes: "POST-PRODUCTION GUIDE - FALLBACK\n\n1. EDITING\n   - Clean cuts between speakers\n   - Professional pacing\n\n2. COLOR GRADING\n   - Natural, corporate look\n   - Neutral color temperature\n\n3. SOUND\n   - Clear dialogue prioritization\n   - Subtle office ambience"
              }
            ]
          }
        ],
        format: "post-production-guide"
      }
    };
    
    return data[contentType] || { content: `Fallback content for ${contentType}` };
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-[#2a2a2a] p-8 rounded-xl mt-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-[#10B981]">
            {`No ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content Yet`}
          </h3>
          <p className="text-[#e7e7e7]/70 mt-2">
            {getDescriptionForContentType(contentType)}
          </p>
          {error && (
            <p className="text-red-400 mt-3 p-3 bg-red-900/20 rounded-md">
              {error}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-[#10B981] text-black font-medium rounded-lg hover:bg-[#059669] transition-colors"
          >
            {`Generate ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
          </motion.button>
          
          {onGenerateAll && (
            <motion.button
              onClick={onGenerateAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[#1e1f22] border border-[#10B981]/40 text-[#10B981] font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              Generate All Content
            </motion.button>
          )}
        </div>
      </div>
      
      <GenerationProgressOverlay 
        isVisible={isGenerating}
        progress={generationProgress}
        currentStep={generationStep}
        totalSteps={5}
        currentStepIndex={generationStepIndex}
      />
    </>
  )
}

// Helper function to get description based on content type
function getDescriptionForContentType(contentType: string): string {
  switch (contentType) {
    case 'storyboard':
      return 'Generate a detailed storyboard with camera angles, shot compositions, and scene breakdowns.'
    case 'script':
      return 'Generate professional screenplays with formatted scenes, action descriptions, and dialogue.'
    case 'casting':
      return 'Generate detailed character profiles with physical descriptions, personality traits, and role requirements.'
    case 'props':
      return 'Generate comprehensive lists of props, costumes, and set dressing elements needed for production.'
    case 'marketing':
      return 'Generate a comprehensive marketing strategy with target audience analysis, taglines, and promotional assets.'
    case 'scheduling':
      return 'Generate a practical filming schedule with location groupings, actor requirements, and technical setup times.'
    case 'location':
      return 'Generate location scouting recommendations with practical filming considerations.'
    case 'postProduction':
      return 'Generate post-production guidance including editing, sound design, and visual effects.'
    default:
      return 'Generate content for this section.'
  }
}