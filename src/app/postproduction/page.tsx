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
import '@/styles/greenlit-design.css'

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
      <div className="min-h-screen greenlit-bg-primary relative">
        {/* Floating Particles */}
        <div className="greenlit-particles">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="greenlit-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }} />
          ))}
        </div>

        {/* Geometric Background */}
        <div className="greenlit-geometric-bg">
          <div className="greenlit-geometric-shape"></div>
          <div className="greenlit-geometric-shape"></div>
        </div>

        <div className="greenlit-container">
          <motion.button
            onClick={handleBack}
            className="greenlit-button-secondary greenlit-mb-lg flex items-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="greenlit-text-center">
              <motion.h1
                className="greenlit-headline greenlit-mb-md"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: '200% 100%',
                }}
              >
                POST-PRODUCTION STUDIO
              </motion.h1>
              
              <motion.div
                className="w-24 h-1 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] mx-auto rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              
              {synopsis && (
                <div className="mt-6 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#00FF99]/20 rounded-2xl p-6">
                    <p className="text-white/90 text-lg italic mb-2">"{synopsis}"</p>
                    {theme && <p className="text-[#00FF99] font-semibold">Theme: {theme}</p>}
                  </div>
                </div>
              )}
            </div>
            
            {/* Workflow Stages */}
            <WorkflowStages 
              currentStage={currentStage}
              onStageChange={setCurrentStage}
            />
            
            {/* Current Stage Content */}
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#00FF99]/20 rounded-2xl p-6 shadow-2xl"
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
              phase="post-production"
            />
          )}
        </div>
      </div>
    </VideoProvider>
  )
} 