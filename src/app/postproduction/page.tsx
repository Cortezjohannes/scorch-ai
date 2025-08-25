'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Import stage components
import { WorkflowStages, type WorkflowStage } from '@/components/postproduction/WorkflowStages'
import { FootageOrganization } from '@/components/postproduction/FootageOrganization'
import { VideoEditing } from '@/components/postproduction/VideoEditing'
import { VisualEffects } from '@/components/postproduction/VisualEffects'
import { SoundDesign } from '@/components/postproduction/SoundDesign'
import { MusicScoring } from '@/components/postproduction/MusicScoring'
import { Distribution } from '@/components/postproduction/Distribution'

// Import the generation indicator
import { GenerationIndicator } from '@/components/GenerationIndicator'

// Import VideoContext provider
import { VideoProvider } from '@/context/VideoContext'

export default function PostProductionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('organization')
  
  const synopsis = searchParams.get('synopsis') || ''
  const theme = searchParams.get('theme') || ''

  const handleBack = () => {
    router.back()
  }

  // Simulate initial loading when first arriving at the page
  useEffect(() => {
    setLoading(true)
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }, [])
  
  // Render stage components with the current stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'organization':
        return <FootageOrganization />
      case 'editing':
        return <VideoEditing />
      case 'visual-effects':
        return <VisualEffects />
      case 'sound-design':
        return <SoundDesign />
      case 'music-scoring':
        return <MusicScoring />
      case 'distribution':
        return <Distribution />
      default:
        return <FootageOrganization />
    }
  }
  
  return (
    <VideoProvider>
      <div className="container mx-auto px-4 py-8">
        <motion.button
          onClick={handleBack}
          className="mb-4 px-4 py-2 rounded-md bg-[#36393f] hover:bg-[#4f535a] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-8"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-[#e2c376] to-[#c4a75f] text-transparent bg-clip-text">
              Post-production
            </h2>
            {synopsis && (
              <div className="text-[#e7e7e7]/70 mb-4 sm:mb-6 text-sm sm:text-base">
                <p className="italic">"{synopsis}"</p>
                {theme && <p>Theme: {theme}</p>}
              </div>
            )}
            
            {/* Workflow Stages */}
            <WorkflowStages 
              currentStage={currentStage}
              onStageChange={setCurrentStage}
            />
          </div>
          
          {/* Current Stage Content */}
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card px-3 py-4 sm:p-6"
          >
            {renderCurrentStage()}
          </motion.div>
        </motion.div>
        
        {/* Loading indicator */}
        {loading && (
          <GenerationIndicator 
            isGenerating={loading}
            completionMessage="Post-production setup complete"
            readyToShow={loading && true}
          />
        )}
      </div>
    </VideoProvider>
  )
} 