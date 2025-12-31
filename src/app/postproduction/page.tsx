'use client'

// Force dynamic rendering to prevent SSR issues with framer-motion
export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from '@/components/ui/ClientMotion'
import { useState, useEffect } from 'react'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisodeRangeForArc } from '@/services/preproduction-firestore'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

// Import stage components
import { WorkflowStages, type WorkflowStage } from '@/components/postproduction/WorkflowStages'
import { FootageOrganization } from '@/components/postproduction/FootageOrganization'
import { FillerScenes } from '@/components/postproduction/FillerScenes'
import { VideoEditing } from '@/components/postproduction/VideoEditing'
import { VisualEffects } from '@/components/postproduction/VisualEffects'
import { SoundDesign } from '@/components/postproduction/SoundDesign'
import { MusicScoring } from '@/components/postproduction/MusicScoring'
import { Distribution } from '@/components/postproduction/Distribution'
import { EpisodeSwitcher } from '@/components/postproduction/EpisodeSwitcher'

// Import the generation indicator
import { GenerationIndicator } from '@/components/GenerationIndicator'

// Import VideoContext provider
import { VideoProvider } from '@/context/VideoContext'

// Import AnimatedBackground for particles effect
import AnimatedBackground from '@/components/AnimatedBackground'

// Import GlobalThemeToggle for theme switching
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'

export default function PostProductionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [loading, setLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('organization')
  const [storyBible, setStoryBible] = useState<any>(null)
  const [arcEpisodes, setArcEpisodes] = useState<number[]>([])
  
  const storyBibleId = searchParams.get('storyBibleId') || searchParams.get('id') || ''
  const episodeNumber = parseInt(searchParams.get('episodeNumber') || '0')
  const arcIndex = searchParams.get('arcIndex') ? parseInt(searchParams.get('arcIndex')!) : null
  
  // Reset loading when episode changes
  useEffect(() => {
    if (episodeNumber > 0) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }, [episodeNumber])
  
  // Load story bible and arc episode data
  useEffect(() => {
    const loadStoryBible = async () => {
      if (storyBibleId && !searchParams.get('synopsis')) {
        try {
          const bible = await getStoryBible(storyBibleId, user?.id)
          if (bible) {
            setStoryBible(bible)
            
            // If arcIndex is provided, load all episodes in that arc
            if (arcIndex !== null && bible?.narrativeArcs) {
              const episodeNumbers = getEpisodeRangeForArc(bible, arcIndex)
              setArcEpisodes(episodeNumbers)
            }
          }
        } catch (error) {
          console.error('Error loading story bible:', error)
        }
      }
    }
    
    loadStoryBible()
  }, [storyBibleId, user?.id, searchParams, arcIndex])
  
  const synopsis = searchParams.get('synopsis') || storyBible?.synopsis || ''
  const storyTheme = searchParams.get('theme') || storyBible?.theme || ''

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
  
  // Get effective episode number (from URL or first in arc)
  const effectiveEpisodeNumber = episodeNumber > 0 ? episodeNumber : (arcEpisodes && arcEpisodes.length > 0 ? arcEpisodes[0] : 0)

  // Render stage components with the current stage
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'organization':
        return <FootageOrganization storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'filler-scenes':
        return <FillerScenes storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'editing':
        return <VideoEditing storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'visual-effects':
        return <VisualEffects storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'sound-design':
        return <SoundDesign storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'music-scoring':
        return <MusicScoring storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      case 'distribution':
        return <Distribution storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
      default:
        return <FootageOrganization storyBibleId={storyBibleId} episodeNumber={effectiveEpisodeNumber} arcIndex={arcIndex} arcEpisodes={arcEpisodes} />
    }
  }
  
  return (
    <VideoProvider>
      <div className={`min-h-screen ${prefix}-bg-primary relative`}>
        {/* Animated Background with Particles */}
        <AnimatedBackground variant="particles" intensity="medium" page="post-production" />
        
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <GlobalThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.button
            onClick={() => {
              if (storyBibleId) {
                router.push(`/dashboard?id=${storyBibleId}`)
              } else {
                router.back()
              }
            }}
            className={`mb-6 px-6 py-3 rounded-lg border ${prefix}-text-accent transition-all duration-300 flex items-center gap-2`}
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(201, 169, 97, 0.2)',
              borderColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(201, 169, 97, 0.3)',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(201, 169, 97, 0.3)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(201, 169, 97, 0.2)'
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl sm:text-5xl font-black mb-4 bg-clip-text text-transparent"
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
                  backgroundImage: theme === 'dark' 
                    ? 'linear-gradient(to right, #10B981, #059669, #10B981)'
                    : 'linear-gradient(to right, #C9A961, #B8944F, #C9A961)',
                }}
              >
                POST-PRODUCTION STUDIO
              </motion.h1>
              
              <motion.div
                className="w-24 h-1 mx-auto rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(to right, #10B981, #059669)'
                    : 'linear-gradient(to right, #C9A961, #B8944F)',
                }}
              />
              
              {(storyBible?.seriesTitle || arcIndex !== null || episodeNumber > 0) && (
                <div className="mt-6 max-w-4xl mx-auto relative z-10">
                  <div 
                    className={`${prefix}-bg-secondary backdrop-blur-sm border rounded-2xl p-4`}
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(24, 24, 24, 0.6)' : 'rgba(235, 237, 240, 0.6)',
                      borderColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(201, 169, 97, 0.2)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      {storyBible?.seriesTitle && (
                        <span className={`${prefix}-text-primary text-lg font-semibold`}>{storyBible.seriesTitle}</span>
                      )}
                      {arcIndex !== null && storyBible?.narrativeArcs?.[arcIndex] && (
                        <span className={`${prefix}-text-accent font-medium`}>
                          {storyBible.narrativeArcs[arcIndex].title || `Arc ${arcIndex + 1}`}
                          {arcEpisodes.length > 0 && (
                            <span className={`${prefix}-text-secondary text-sm ml-2`}>
                              (Episodes {arcEpisodes[0]} - {arcEpisodes[arcEpisodes.length - 1]})
                            </span>
                          )}
                        </span>
                      )}
                      {arcEpisodes.length > 1 ? (
                        <EpisodeSwitcher
                          currentEpisode={effectiveEpisodeNumber}
                          availableEpisodes={arcEpisodes}
                          storyBibleId={storyBibleId}
                          arcIndex={arcIndex}
                        />
                      ) : effectiveEpisodeNumber > 0 ? (
                        <span className={`${prefix}-text-accent text-sm font-medium`}>Episode {effectiveEpisodeNumber}</span>
                      ) : null}
                    </div>
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
              className={`${prefix}-bg-secondary backdrop-blur-sm border rounded-2xl p-6 ${prefix}-shadow-lg`}
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(24, 24, 24, 0.6)' : 'rgba(235, 237, 240, 0.6)',
                borderColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(201, 169, 97, 0.2)',
              }}
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