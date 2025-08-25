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
      const workspaceData = (window as any).reeled_workspace_data || {}
      const mode = workspaceData.mode || storyBible.creativeMode || 'beast'
      

      
      // Update progress
      setGenerationProgress(15)
      setGenerationStep(`Analyzing ${arcTitle}`)
      setGenerationStepIndex(2)
      
      // Prepare request data with workspace context for coherence
      const requestData = {
        storyBible,
        arcIndex,
        arcEpisodes: arcEpisodes || [],
        contentType,
        mode,
        // Include workspace data for story coherence
        workspaceEpisodes: workspaceData.workspaceEpisodes || {},
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
        const content = result.preProduction || result.content?.[contentType] || result.content
        
        // Save to localStorage for future reference
        try {
          const savedContent = localStorage.getItem('reeled-preproduction-content') || '{}'
          const parsedContent = JSON.parse(savedContent)
          localStorage.setItem('reeled-preproduction-content', JSON.stringify({
            ...parsedContent,
            [`arc${arcIndex}-${contentType}`]: content
          }))
        } catch (e) {
          console.error('Error saving to localStorage:', e)
        }
        
        // Call the callback with the new content
        onContentGenerated(content)
      } else if (result.rawContent) {
        // Handle raw content response
        onContentGenerated({ rawContent: result.rawContent })
      } else {
        throw new Error('Generation failed: Response format not recognized')
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
      // Hide progress overlay after a brief delay
      setTimeout(() => {
        setIsGenerating(false)
      }, 3000)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-[#2a2a2a] p-8 rounded-xl mt-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-[#e2c376]">
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
            className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
          >
            {`Generate ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
          </motion.button>
          
          {onGenerateAll && (
            <motion.button
              onClick={onGenerateAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[#1e1f22] border border-[#e2c376]/40 text-[#e2c376] font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
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
    default:
      return 'Generate content for this section.'
  }
} 