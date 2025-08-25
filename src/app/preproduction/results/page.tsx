'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import Image from 'next/image'
import StoryboardDisplay from '@/components/StoryboardDisplay'
import PreProductionLoader from '@/components/PreProductionLoader'
import ProductionLoadingScreen from '@/components/ProductionLoadingScreen'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TabType = 'storyboard' | 'script' | 'casting' | 'production' | 'marketing' | 'props' | 'postProduction' | 'location'

// Define a minimal user type to avoid type errors
interface MinimalUser {
  id: string;
  email: string;
  displayName: string;
  projects: any[];
  collaborations: any[];
  photoURL: string | null;
}

export default function PreProductionResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('script')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [showLightbox, setShowLightbox] = useState<boolean>(false)
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1)
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
  const [projectSaved, setProjectSaved] = useState<boolean>(false)
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [showCollaboratorModal, setShowCollaboratorModal] = useState<boolean>(false)
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState<string>('')
  const [availabilityData, setAvailabilityData] = useState<{[key: string]: {date: string, hours: number[]}[]}>({})
  const [contentType, setContentType] = useState<string>('preproduction')
  const [projectTitle, setProjectTitle] = useState<string>('')
  const [projectSynopsis, setProjectSynopsis] = useState<string>('')
  
  // Arc data
  const [arcIndex, setArcIndex] = useState<number>(0)
  const [arcTitle, setArcTitle] = useState<string>('')
  const [arcEpisodes, setArcEpisodes] = useState<any[]>([])
  const [storyBible, setStoryBible] = useState<any>(null)
  
  // Auto-generation state
  const [autoGenerateTriggered, setAutoGenerateTriggered] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState<boolean>(false)
  
  // Dialogue expansion state
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set())
  const [expandingDialogue, setExpandingDialogue] = useState<number | null>(null)
  
  // Get URL parameters
  const projectId = searchParams.get('projectId')
  const mode = searchParams.get('mode') || 'production'
  
  // Use auth context with error handling
  let user: MinimalUser | null = null
  let getProject: ((id: string, userId: string) => Promise<any>) | null = null
  
  try {
    const authContext = useAuth()
    user = authContext?.user || null
    getProject = authContext?.getProject || null
  } catch (error) {
    console.warn('Auth context not available, using default values:', error);
    user = null
    getProject = null
  }

  // Parse arc from URL
  useEffect(() => {
    const arcParam = searchParams.get('arc')
    if (arcParam) {
      try {
        const parsedArc = parseInt(arcParam, 10) - 1 // Convert to 0-based index
        if (!isNaN(parsedArc) && parsedArc >= 0) {
          setArcIndex(parsedArc)
        }
      } catch (e) {
        console.error('Error parsing arc parameter:', e)
      }
    }
  }, [searchParams])

  // Check for auto-generation flag
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const autoGenerate = localStorage.getItem('reeled-auto-generate')
      if (autoGenerate === 'true') {
        setShouldAutoGenerate(true)
        setIsGenerating(true)
      }
    }
  }, [])

  // Load arc index from localStorage as fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedArcIndex = localStorage.getItem('currentArcIndex')
        if (storedArcIndex) {
          setArcIndex(parseInt(storedArcIndex, 10) || 0)
        }
      } catch (e) {
        console.error('Error parsing stored arc index:', e)
      }
    }
  }, [])

  // Load story bible
  useEffect(() => {
    async function loadStoryBible() {
      if (typeof window === 'undefined') return
      
      try {
        // ENHANCED: Load comprehensive preproduction data
        const preProductionData = localStorage.getItem('reeled-preproduction-data')
        if (preProductionData) {
          const parsedData = JSON.parse(preProductionData)

          
          setStoryBible(parsedData.storyBible)
          setArcEpisodes(parsedData.arcEpisodes || [])
          setArcIndex(parsedData.arcIndex || 0)
          
          if (parsedData.storyBible?.seriesTitle) {
            setProjectTitle(parsedData.storyBible.seriesTitle)
          }
          if (parsedData.storyBible?.synopsis) {
            setProjectSynopsis(parsedData.storyBible.synopsis)
          }
          
          // Store workspace data for API calls INCLUDING user's mode choice
          window.reeled_workspace_data = {
            workspaceEpisodes: parsedData.workspaceEpisodes,
            userChoices: parsedData.userChoices,
            generatedEpisodes: parsedData.generatedEpisodes,
            completedArcs: parsedData.completedArcs,
            mode: parsedData.mode || 'beast' // Store user's mode choice
          }
          
          return // Use comprehensive data instead of fallback
        }
        
        // Load pre-production content from localStorage
        const preProductionContent = localStorage.getItem('reeled-preproduction-content')
        
        if (preProductionContent) {
          try {
            const parsedContent = JSON.parse(preProductionContent)
            
            // Restructure the saved content to match UI expectations
            const currentArcIndex = arcIndex || 0
            const restructuredContent: any = {}
            
            // Map the saved content keys to expected structure
            Object.keys(parsedContent).forEach(key => {
              if (key.startsWith(`arc${currentArcIndex}-`)) {
                const contentType = key.replace(`arc${currentArcIndex}-`, '')
                restructuredContent[contentType] = parsedContent[key]
              }
            })
            
            if (Object.keys(restructuredContent).length > 0) {
              setGeneratedContent(restructuredContent)
            }
          } catch (e) {
            console.error('Error parsing pre-production content:', e)
          }
        }
        
        // ADDITIONAL: Check for ProductionLoadingScreen storage pattern
        const currentArcIndex = arcIndex || 0
        console.log('🔍 Current arc index:', currentArcIndex)
        const productionLoadingContent = localStorage.getItem(`reeled-preproduction-${currentArcIndex}`)
        console.log('🔍 Production loading content:', productionLoadingContent ? 'FOUND' : 'NOT FOUND')
        
        if (productionLoadingContent) {
          try {
            const parsedProductionContent = JSON.parse(productionLoadingContent)
            console.log('✅ Setting production content:', Object.keys(parsedProductionContent))
            setGeneratedContent(parsedProductionContent)
          } catch (e) {
            console.error('Error parsing ProductionLoadingScreen content:', e)
          }
        } else {
          // FALLBACK: Check for arc 0 if arc 1 doesn't exist
          const fallbackContent = localStorage.getItem(`reeled-preproduction-0`)
          console.log('🔍 Fallback content (arc 0):', fallbackContent ? 'FOUND' : 'NOT FOUND')
          
          if (fallbackContent) {
            try {
              const parsedFallbackContent = JSON.parse(fallbackContent)
              console.log('✅ Setting fallback content:', Object.keys(parsedFallbackContent))
              setGeneratedContent(parsedFallbackContent)
            } catch (e) {
              console.error('Error parsing fallback content:', e)
            }
          }
        }
        
        // Fallback: Load traditional story bible data
        const storyBibleData = localStorage.getItem('reeled-story-bible')
        if (storyBibleData) {
          const parsedStoryBible = JSON.parse(storyBibleData)
          // Handle nested structure if needed
          const actualStoryBible = parsedStoryBible.storyBible || parsedStoryBible
          setStoryBible(actualStoryBible)
          
          if (actualStoryBible.seriesTitle) {
            setProjectTitle(actualStoryBible.seriesTitle)
          }
          if (actualStoryBible.synopsis) {
            setProjectSynopsis(actualStoryBible.synopsis)
          }
          

        }
      } catch (e) {
        console.error('Error loading story bible:', e)
      }
    }
    
    loadStoryBible()
  }, [arcIndex])

  useEffect(() => {
    async function loadContent() {
      // If projectId is provided, load from Firestore
      if (projectId && user) {
        try {
          const projectRef = doc(db, 'projects', projectId)
          const projectDoc = await getDoc(projectRef)
          if (projectDoc.exists()) {
            const project = projectDoc.data()
            if (project && project.content) {
              setGeneratedContent(project.content)
              setProjectSaved(true)
              return
            }
          }
        } catch (error) {
          console.error('Error loading project from Firestore:', error)
        }
      }
      
      // Get episodes for this arc from localStorage and story bible
      try {
        const savedEpisodes = localStorage.getItem('reeled-episodes')
        if (savedEpisodes && storyBible) {
          const episodesData = JSON.parse(savedEpisodes)
          
          // Ensure episodes is an array
          const episodes = Array.isArray(episodesData) ? episodesData : []
          
          // Get arc info from story bible
          const currentArc = storyBible.narrativeArcs?.[arcIndex]
          if (currentArc) {
            setArcTitle(currentArc.title)
            
            // Calculate episode range for this arc
            const episodesPerArc = currentArc.episodes?.length || 10
            const arcStartEpisode = arcIndex * episodesPerArc + 1
            const arcEndEpisode = arcStartEpisode + episodesPerArc - 1
            
            // Filter episodes that belong to this arc
            const currentArcEpisodes = episodes.filter((ep: any) => 
              ep.episodeNumber >= arcStartEpisode && ep.episodeNumber <= arcEndEpisode
            )
            
            setArcEpisodes(currentArcEpisodes)
          }
        }
      } catch (error) {
        console.error('Error loading episodes from localStorage:', error)
      }

      // Load content from localStorage only if not auto-generating
      if (!shouldAutoGenerate) {
        try {
          const savedContent = localStorage.getItem(`reeled-preproduction-${arcIndex}`)
          if (savedContent) {
            try {
              const parsedContent = JSON.parse(savedContent)
              setGeneratedContent(parsedContent)
            } catch (innerError) {
              console.error("Failed to parse content", innerError);
              setGeneratedContent(null)
            }
          } else {
            console.log('No saved content found for arc', arcIndex)
            setGeneratedContent(null)
          }
        } catch (error) {
          console.error('Error parsing stored content:', error);
          setGeneratedContent(null)
        }
      } else {
        // Clear any existing content when auto-generating
        setGeneratedContent(null)
      }
    }
    
    loadContent()
  }, [router, projectId, user, arcIndex, storyBible, selectedEpisode])

  // Simple episode navigation component
  const EpisodeNavigation = ({ episodes }: { episodes: any[] }) => {
    if (!episodes || episodes.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {episodes.map((episode, index) => (
          <button
            key={index}
            onClick={() => setSelectedEpisode(index + 1)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedEpisode === index + 1
                ? "bg-[#e2c376] text-black"
                : "bg-[#36393f]/40 text-[#e7e7e7]/70 hover:bg-[#36393f]/60"
            )}
          >
            Episode {index + 1}
            {episode.title && `: ${episode.title}`}
          </button>
        ))}
      </div>
    )
  }

  // Render different tabs
  const renderTabContent = () => {
    // Allow individual content generation even if overall generatedContent is null
    switch (activeTab) {
      case 'storyboard':
        return renderStoryboard()
      case 'script':
        return renderScript()
      case 'casting':
        return renderCasting()
      case 'marketing':
        return renderMarketing()
      case 'props':
        return renderProps()
      case 'postProduction':
        return renderPostProduction()
      case 'location':
        return renderLocation()
      default:
        return <div>Content type not implemented yet</div>
    }
  }

  const renderStoryboard = () => {
    const storyboardData = generatedContent?.storyboard
    if (!storyboardData || !storyboardData.visualStyle) {
      return (
        <PreProductionLoader
          contentType="storyboard"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, storyboard: content }))
          }}
        />
      )
    }

    const storyboardEpisodes = storyboardData.episodes || []
    const visualStyle = storyboardData.visualStyle || {}

    return (
      <div className="space-y-8">
        {/* Visual Style Guide */}
        <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
            <CardTitle>Visual Style Guide</CardTitle>
            <CardDescription>Overall visual aesthetic for the production</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6 bg-gradient-to-b from-[#1e1f22] to-[#1c1d20]">
            <div>
              <h3 className="text-lg font-semibold text-[#e2c376] mb-3">Overall Visual Aesthetic</h3>
              <p className="text-[#e7e7e7]/90 leading-relaxed">{visualStyle.description}</p>
            </div>

            {visualStyle.cinematicReferences && (
              <div>
                <h3 className="text-lg font-semibold text-[#e2c376] mb-3">Cinematic References</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visualStyle.cinematicReferences.map((ref: string, index: number) => (
                    <div key={index} className="bg-[#252628] p-3 rounded-lg border border-[#36393f]/40">
                      <p className="text-[#e7e7e7]/90">{ref}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3">
              <div className="bg-[#e2c376]/20 border border-[#e2c376]/30 rounded-full px-4 py-1 text-sm font-medium text-[#e2c376]">
                Visual Style
              </div>
              <div className="bg-[#1e1f22] border border-[#36393f]/40 rounded-full px-4 py-1 text-sm text-[#e7e7e7]/80">
                Color Palette
              </div>
              <div className="bg-[#1e1f22] border border-[#36393f]/40 rounded-full px-4 py-1 text-sm text-[#e7e7e7]/80">
                Lighting
              </div>
              <div className="bg-[#1e1f22] border border-[#36393f]/40 rounded-full px-4 py-1 text-sm text-[#e7e7e7]/80">
                Camera Work
              </div>
              <div className="bg-[#1e1f22] border border-[#36393f]/40 rounded-full px-4 py-1 text-sm text-[#e7e7e7]/80">
                Production Design
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-[#252628] p-4 rounded-lg border border-[#36393f]/40">
                <h4 className="text-md font-medium mb-3 text-[#e2c376]/90">Color Palette</h4>
                <p className="text-sm text-[#e7e7e7]/80">
                  Cinematic color grading with emphasis on storytelling through visual mood
                </p>
              </div>
              <div className="bg-[#252628] p-4 rounded-lg border border-[#36393f]/40">
                <h4 className="text-md font-medium mb-3 text-[#e2c376]/90">Lighting</h4>
                <p className="text-sm text-[#e7e7e7]/80">
                  Dynamic lighting setups to enhance dramatic tension and character development
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Episodes */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Episodes</h3>

          {/* Episode Navigation */}
          <div className="mb-6">
            <EpisodeNavigation episodes={storyboardEpisodes} />
          </div>

          {/* Episode Content */}
          {storyboardEpisodes.map((episode: any, episodeIndex: number) => {
            if (selectedEpisode !== episodeIndex + 1) return null

            return (
              <div key={episodeIndex} className="space-y-8">
                <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex gap-3 items-center">
                        <span className="text-[#e2c376] min-w-[110px] text-lg">
                          Episode {episodeIndex + 1}
                        </span>
                        <span className="text-xl">{episode.title || 'Untitled'}</span>
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-3 text-[#e7e7e7]/90 text-base italic max-w-3xl">
                      {episode.summary || episode.description || 'No summary available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-gradient-to-b from-[#1e1f22] to-[#1c1d20]">
                    <div className="p-6">
                      <h4 className="text-lg font-bold mb-4 text-[#e2c376]/90">Storyboard Frames</h4>
                      <div className="grid grid-cols-1 gap-10">
                        {(episode.scenes || []).map((scene: any, sceneIndex: number) => (
                          <Card key={sceneIndex} className="border border-[#36393f]/50 bg-[#252628]/90 shadow-md overflow-hidden relative storyboard-scene">
                            <CardHeader className="bg-[#2a2a2a]/90 border-b border-[#36393f]/40 py-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e2c376]/20 text-[#e2c376] font-medium text-sm">
                                    {sceneIndex + 1}
                                  </div>
                                  <CardTitle className="text-base">
                                    Scene {sceneIndex + 1}: {scene.title || scene.location || 'Untitled Scene'}
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="grid md:grid-cols-2 gap-0">
                                {/* Left Column: Scene Description */}
                                <div className="p-5 bg-[#1d1e22] border-r border-[#36393f]/30">
                                  <h6 className="font-medium text-[#e2c376] mb-3">Scene Description</h6>
                                  <p className="text-[#e7e7e7]/90 mb-4 text-sm leading-relaxed">{scene.description || "No description available"}</p>

                                  <div className="mt-4">
                                    <h6 className="font-medium text-[#e2c376] mb-2">Characters in Scene</h6>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {scene.characters && scene.characters.length > 0 ? (
                                        scene.characters.map((character: string, i: number) => (
                                          <div key={i} className="bg-[#36393f]/40 px-3 py-1 rounded-full text-sm">
                                            {character}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-[#e7e7e7]/50 text-sm">No characters detected</div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-5">
                                    <h6 className="font-medium text-[#e2c376] mb-2">Image Prompt</h6>
                                    <div className="bg-[#36393f]/20 p-3 rounded-md text-xs text-[#e7e7e7]/80 font-mono max-h-40 overflow-y-auto">
                                      {scene.imagePrompt || scene.description || "No image prompt available"}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Storyboard Image */}
                                <div className="relative">
                                  <div className="aspect-video bg-gradient-to-tr from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center overflow-hidden">
                                    {scene.storyboardImage ? (
                                      <Image
                                        src={scene.storyboardImage}
                                        alt={`Scene ${sceneIndex + 1} storyboard`}
                                        width={400}
                                        height={225}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="p-6 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#e2c376]/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-[#e7e7e7]/60 text-sm">Storyboard image not yet generated</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Generate Image Button */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                    <Button
                                      className="bg-[#e2c376] text-black hover:bg-[#d4b46a] transition-colors"
                                      onClick={() => {/* TODO: Implement image generation */}}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      Generate Image
                                    </Button>
                                  </div>
                                </div>

                                {/* Camera Notes */}
                                <div className="p-4">
                                  <h6 className="font-medium text-[#e2c376] mb-3">Camera Notes</h6>
                                  <div className="grid grid-cols-3 gap-3 text-xs text-[#e7e7e7]/80">
                                    {(scene.shots || []).map((shot: any, shotIndex: number) => (
                                      <div key={shotIndex} className="bg-[#36393f]/20 p-3 rounded-md">
                                        <div className="font-medium mb-1">Shot {shotIndex + 1}</div>
                                        <div className="text-[#e7e7e7]/60 text-xs">{shot.description || ""}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderScript = () => {
    const scriptData = generatedContent?.script
    
    // Enhanced content detection - check for any script content including raw content
    const hasScriptContent = scriptData && (
      (scriptData.episodes && scriptData.episodes.length > 0) ||
      (scriptData.script && scriptData.script.length > 0) ||
      (typeof scriptData === 'string' && scriptData.length > 0) ||
      (scriptData.rawContent && scriptData.rawContent.length > 0) ||
      (scriptData.content && scriptData.content.length > 0)
    )
    
    if (!hasScriptContent) {
      // Show a simple message if no story bible is available
      if (!storyBible) {
        return (
          <div className="text-center py-12">
            <p className="text-[#e7e7e7]/70">Please complete your story bible first</p>
          </div>
        )
      }
      
      return (
        <PreProductionLoader
          contentType="script"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, script: content }))
          }}
          onGenerateAll={() => {/* TODO: Implement generate all */}}
        />
      )
    }

    // Handle different script data formats
    let scriptEpisodes = []
    let displayContent = ''
    
    if (scriptData.episodes && Array.isArray(scriptData.episodes)) {
      scriptEpisodes = scriptData.episodes
    } else if (typeof scriptData === 'string') {
      displayContent = scriptData
    } else if (scriptData.rawContent) {
      displayContent = scriptData.rawContent
    } else if (scriptData.content) {
      if (typeof scriptData.content === 'string') {
        displayContent = scriptData.content
      } else if (scriptData.content.episodes) {
        scriptEpisodes = scriptData.content.episodes
      }
    } else if (scriptData.script) {
      if (typeof scriptData.script === 'string') {
        displayContent = scriptData.script
      } else if (Array.isArray(scriptData.script)) {
        scriptEpisodes = scriptData.script
      }
    }

    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[#e2c376] mb-4 tracking-tight">Script</h3>
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232427] p-5 rounded-lg border border-[#36393f]/50 shadow-md">
            <h4 className="font-medium mb-2 text-[#e2c376]/90">About Professional Scripts</h4>
            <p className="text-[#e7e7e7]/80 text-sm leading-relaxed">
              Professional scripts follow industry-standard formatting with proper scene headings, action lines, 
              character names, and dialogue. Each scene is carefully structured to advance the narrative while 
              maintaining proper pacing and visual storytelling principles.
            </p>
            </div>
            </div>

        {/* Raw Content Display */}
        {displayContent && (
          <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
              <CardTitle className="text-[#e2c376]">Generated Script Content</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-b from-[#1e1f22] to-[#1c1d20]">
              <pre className="whitespace-pre-wrap text-[#e7e7e7]/90 font-mono text-sm leading-relaxed bg-[#252628] p-4 rounded-lg border border-[#36393f]/40 overflow-x-auto">
                {displayContent}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Episode Navigation - only show if we have episodes */}
        {scriptEpisodes.length > 0 && (
          <div className="mb-6">
            <EpisodeNavigation
              episodes={scriptEpisodes}
            />
          </div>
        )}

        {/* Episode Scripts */}
        {scriptEpisodes.map((episode: any, episodeIndex: number) => {
          if (selectedEpisode !== episodeIndex + 1) return null

          const dialogueStats = getDialogueLength(episode)
          const isExpanded = expandedEpisodes.has(episodeIndex)
          const isExpanding = expandingDialogue === episodeIndex

          return (
            <Card key={episodeIndex} className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex gap-3 items-center mb-2">
                      <span className="text-[#e2c376] min-w-[110px] text-lg">
                        Episode {episodeIndex + 1}
                      </span>
                      <span className="text-xl">{episode.title || 'Untitled'}</span>
                      {isExpanded && (
                        <span className="text-xs bg-[#e2c376]/20 text-[#e2c376] px-2 py-1 rounded-full">
                          Enhanced
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-[#e7e7e7]/90 text-base italic max-w-3xl">
                      {episode.summary || episode.description || 'No summary available'}
                    </CardDescription>
                  </div>
                  
                  <div className="ml-4 text-right">
                    {/* Dialogue Stats */}
                    <div className="text-xs text-[#e7e7e7]/60 mb-2">
                      <div className="mb-1">
                        <span className="text-[#e2c376]/80">{dialogueStats.genre}</span> • 
                        {dialogueStats.wordCount} words • {dialogueStats.lineCount} lines
                      </div>
                      <div className="text-[#e7e7e7]/50">
                        Target: {dialogueStats.targetWords} words • {dialogueStats.targetLines} lines
                      </div>
                      <div className={dialogueStats.needsExpansion ? "text-orange-400" : "text-green-400"}>
                        {dialogueStats.needsExpansion 
                          ? `Needs expansion for ${dialogueStats.genre.toLowerCase()}` 
                          : "Sufficient dialogue"}
                      </div>
                    </div>
                    
                    {/* Expand Dialogue Button */}
                    {dialogueStats.needsExpansion && !isExpanded && (
                      <Button 
                        size="sm" 
                        onClick={() => expandEpisodeDialogue(episodeIndex, episode)}
                        disabled={isExpanding}
                        className="bg-[#e2c376] text-black hover:bg-[#d4b46a] text-xs"
                      >
                        {isExpanding ? (
                          <>
                            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin mr-1"></div>
                            Expanding...
                          </>
                        ) : (
                          "Expand Dialogue"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Script Content */}
                <div className="bg-gradient-to-b from-[#1e1f22] to-[#1c1d20] py-8 px-4 md:px-8 min-h-[50vh]">
                  {/* Script Scenes */}
                  <div className="max-w-4xl mx-auto">
                    {(episode.scenes || []).map((scene: any, sceneIndex: number) => (
                      <div key={sceneIndex} className="mb-14 screenplay relative">
                        {/* Scene Number */}
                        <div className="absolute -left-10 top-0 rounded-full bg-[#e2c376]/20 w-8 h-8 flex items-center justify-center text-xs text-[#e2c376]/70 font-medium hidden md:flex">
                          {sceneIndex + 1}
                        </div>

                        {/* Scene Heading */}
                        <div className="uppercase font-bold mb-6 text-center text-[#e2c376] py-2 border-b border-t border-[#36393f]/30 tracking-wide">
                          {scene.location || `Scene ${sceneIndex + 1}`}
                        </div>

                        {/* Scene Description */}
                        <div className="mb-8 text-[#e7e7e7]/95 leading-relaxed whitespace-pre-line px-2 md:px-6 text-base">
                          {scene.description || ""}
                        </div>

                        {/* Debug: Log scene structure */}
                        {process.env.NODE_ENV === 'development' && console.log('Scene structure:', scene)}

                        {/* Enhanced dialogue rendering with multiple fallbacks */}
                        {scene.dialogue && Array.isArray(scene.dialogue) && scene.dialogue.length > 0 ? (
                          <div className="mx-4 mb-6 space-y-4 screenplay-dialogue">
                            {isExpanded && (
                              <div className="text-center text-[#e2c376]/60 text-sm mb-4 italic">
                                ✨ Enhanced with AI-generated dialogue for full 5-minute script
                              </div>
                            )}
                            {scene.dialogue.map((dialogue: any, dialogueIndex: number) => (
                              <div key={dialogueIndex} className={`dialogue-block ${dialogue.enhanced ? 'relative' : ''} mb-4`}>
                                {dialogue.enhanced && (
                                  <div className="absolute -left-2 top-0 w-1 h-full bg-[#e2c376]/30 rounded-full"></div>
                                )}
                                
                                {/* Professional Screenplay Character Name - Centered and All Caps */}
                                <div className="text-center uppercase font-bold text-base mb-2 mt-6 tracking-wide">
                                  {dialogue.character || dialogue.CHARACTER || 'CHARACTER'}
                                  {dialogue.enhanced && (
                                    <span className="ml-2 text-xs normal-case text-[#e2c376]/60">
                                      enhanced
                                    </span>
                                  )}
                                </div>
                                
                                {/* Professional Parenthetical/Stage Direction */}
                                {(dialogue.direction || dialogue.parenthetical) && (
                                  <div className="text-center italic mb-2 text-[#e7e7e7]/80 text-sm">
                                    ({dialogue.direction || dialogue.parenthetical})
                                  </div>
                                )}
                                
                                {/* Professional Dialogue Block - Centered with proper margins */}
                                <div className="text-center mx-8 md:mx-12 lg:mx-16 mb-3 leading-relaxed text-base">
                                  {dialogue.line || dialogue.text || dialogue.dialogue || ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : scene.content || scene.text ? (
                          /* If dialogue array doesn't exist but there's content, show it */
                          <div className="whitespace-pre-line text-[#e7e7e7]/90 px-6 leading-relaxed">
                            {scene.content || scene.text}
                          </div>
                        ) : (
                          /* Fallback message with debug info */
                          <div className="whitespace-pre-line text-[#e7e7e7]/90 px-6">
                            <div className="text-[#e7e7e7]/60 italic text-center py-8">
                              <div className="text-2xl mb-2">🎬</div>
                              <div className="text-lg mb-2">No dialogue content available</div>
                              <div className="text-sm text-[#e7e7e7]/50">
                                Click "Expand Dialogue" to generate a full 5-minute script with professional dialogue
                              </div>
                            </div>
                            {process.env.NODE_ENV === 'development' && (
                              <div className="text-xs text-[#e7e7e7]/40 mt-2">
                                Debug: Scene keys: {Object.keys(scene).join(', ')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Scene Break */}
                        {sceneIndex < (episode.scenes || []).length - 1 && (
                          <div className="text-[#e7e7e7]/50 italic text-center mt-4 p-4">
                            [Scene continues...]
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Episode End */}
                    <div className="uppercase text-right font-bold mt-8 text-[#e7e7e7]/60 tracking-wide pr-4">
                      End of Episode {episodeIndex + 1}
                    </div>

                    {/* Episode Separator */}
                    <div className="mt-14 mb-14 flex items-center justify-center">
                      <div className="w-16 h-[1px] bg-[#e2c376]/20"></div>
                      <div className="mx-4 text-[#e2c376]/40 text-sm">* * *</div>
                      <div className="w-16 h-[1px] bg-[#e2c376]/20"></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-4 border-t border-[#36393f]/40 text-center text-[#e7e7e7]/60 text-sm">
                  Generated by Reeled AI • Episode {episodeIndex + 1} of {scriptEpisodes.length}
                </div>
              </CardContent>

              <CardFooter className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-t border-[#36393f]/50 p-4 flex justify-between">
                <div className="text-sm text-[#e7e7e7]/70">
                  <div>Professional screenplay format</div>
                  {isExpanded && (
                    <div className="text-xs text-[#e2c376]/60 mt-1">
                      Enhanced with AI dialogue • {dialogueStats.wordCount} words total
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    Print
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderCasting = () => {
    const castingData = generatedContent?.casting
    
    // Enhanced content detection for casting
    const hasCastingContent = castingData && (
      (castingData.characters && castingData.characters.length > 0) ||
      (typeof castingData === 'string' && castingData.length > 0) ||
      (castingData.rawContent && castingData.rawContent.length > 0) ||
      (castingData.content && castingData.content.length > 0) ||
      (castingData.casting && Object.keys(castingData.casting).length > 0)
    )
    
    if (!hasCastingContent) {
      return (
        <PreProductionLoader
          contentType="casting"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, casting: content }))
          }}
        />
      )
    }
    
    // Handle different casting data formats
    let castingCharacters = []
    let displayContent = ''
    
    if (castingData.characters && Array.isArray(castingData.characters)) {
      castingCharacters = castingData.characters
    } else if (typeof castingData === 'string') {
      displayContent = castingData
    } else if (castingData.rawContent) {
      displayContent = castingData.rawContent
    } else if (castingData.content) {
      if (typeof castingData.content === 'string') {
        displayContent = castingData.content
      } else if (castingData.content.characters) {
        castingCharacters = castingData.content.characters
      }
    } else if (castingData.casting) {
      if (typeof castingData.casting === 'string') {
        displayContent = castingData.casting
      } else if (castingData.casting.characters) {
        castingCharacters = castingData.casting.characters
      }
    }

    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[#e2c376] mb-4 tracking-tight">Casting Guide</h3>
          </div>

        {/* Raw Content Display */}
        {displayContent && (
          <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
              <CardTitle className="text-[#e2c376]">Generated Casting Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-gradient-to-b from-[#1e1f22] to-[#1c1d20]">
              <pre className="whitespace-pre-wrap text-[#e7e7e7]/90 font-mono text-sm leading-relaxed bg-[#252628] p-4 rounded-lg border border-[#36393f]/40 overflow-x-auto">
                {displayContent}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Characters */}
        {castingCharacters.map((character: any, index: number) => (
          <Card key={index} className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
              <CardTitle className="flex gap-3 items-center">
                <span className="text-[#e2c376]">{character.name || 'Unnamed Character'}</span>
                <span className="text-sm bg-[#36393f]/40 px-2 py-1 rounded">
                  {character.importance || 'Supporting'}
                    </span>
              </CardTitle>
              <CardDescription>
                {character.role || character.description || 'No role description'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                      <div>
                  <h4 className="font-semibold mb-3 text-[#e2c376]">Physical Description</h4>
                  <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                    {character.physicalDescription || 'No physical description provided'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#e2c376]">Personality</h4>
                  <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                    {character.personality || 'No personality description provided'}
                  </p>
                </div>
              </div>
              
              {character.castingSuggestions && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-[#e2c376]">Casting Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {character.castingSuggestions.map((suggestion: string, i: number) => (
                      <div key={i} className="bg-[#36393f]/40 px-3 py-1 rounded-full text-sm">
                        {suggestion}
                      </div>
                    ))}
                      </div>
                      </div>
                    )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderMarketing = () => {
    const marketingData = generatedContent?.marketing
    if (!marketingData || !marketingData.marketingHooks || marketingData.marketingHooks.length === 0) {
      return (
        <PreProductionLoader
          contentType="marketing"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, marketing: content }))
          }}
        />
      )
    }

    return (
      <div className="space-y-8">
        <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
            <CardTitle>Marketing Strategy</CardTitle>
            <CardDescription>Comprehensive marketing plan and materials</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {marketingData.targetAudience && (
              <div>
                <h4 className="font-semibold mb-3 text-[#e2c376]">Target Audience</h4>
                <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                  {marketingData.targetAudience.primaryDemographic || 'No target audience defined'}
            </p>
          </div>
            )}
            
            {marketingData.marketingHooks && marketingData.marketingHooks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-[#e2c376]">Marketing Hooks</h4>
                <div className="space-y-2">
                  {marketingData.marketingHooks.map((hook: any, index: number) => (
                    <div key={index} className="bg-[#252628] p-3 rounded-lg border border-[#36393f]/40">
                      {/* Handle both object format and string format */}
                      {typeof hook === 'object' && hook !== null ? (
              <div>
                          {hook.tagline && (
                            <p className="text-[#e2c376] font-medium text-sm mb-1">{hook.tagline}</p>
                          )}
                          {hook.supportingCopy && (
                            <p className="text-[#e7e7e7]/90 text-sm">{hook.supportingCopy}</p>
                          )}
                          {!hook.tagline && !hook.supportingCopy && hook.hook && (
                            <p className="text-[#e7e7e7]/90 text-sm">{hook.hook}</p>
                          )}
                </div>
                      ) : (
                        <p className="text-[#e7e7e7]/90 text-sm">{hook}</p>
                      )}
                </div>
            ))}
          </div>
        </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProps = () => {
    const propsData = generatedContent?.props
    
    // Enhanced content detection for props
    const hasPropsContent = propsData && (
      (propsData.essentialProps && propsData.essentialProps.length > 0) ||
      (typeof propsData === 'string' && propsData.length > 0) ||
      (propsData.rawContent && propsData.rawContent.length > 0) ||
      (propsData.content && propsData.content.length > 0) ||
      (propsData.props && Object.keys(propsData.props).length > 0)
    )
    
    if (!hasPropsContent) {
      return (
        <PreProductionLoader
          contentType="props"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, props: content }))
          }}
        />
      )
    }
    
    // Handle different props data formats
    let essentialProps = []
    let displayContent = ''
    
    if (propsData.essentialProps && Array.isArray(propsData.essentialProps)) {
      essentialProps = propsData.essentialProps
    } else if (typeof propsData === 'string') {
      displayContent = propsData
    } else if (propsData.rawContent) {
      displayContent = propsData.rawContent
    } else if (propsData.content) {
      if (typeof propsData.content === 'string') {
        displayContent = propsData.content
      } else if (propsData.content.essentialProps) {
        essentialProps = propsData.content.essentialProps
      }
    } else if (propsData.props) {
      if (typeof propsData.props === 'string') {
        displayContent = propsData.props
      } else if (propsData.props.essentialProps) {
        essentialProps = propsData.props.essentialProps
      }
    }

    return (
      <div className="space-y-8">
        <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
            <CardTitle>Props & Wardrobe</CardTitle>
            <CardDescription>Essential props and costume requirements</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Raw Content Display */}
            {displayContent && (
              <div>
                <h4 className="font-semibold mb-3 text-[#e2c376]">Generated Props Information</h4>
                <pre className="whitespace-pre-wrap text-[#e7e7e7]/90 font-mono text-sm leading-relaxed bg-[#252628] p-4 rounded-lg border border-[#36393f]/40 overflow-x-auto">
                  {displayContent}
                </pre>
          </div>
            )}
            
            {essentialProps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-[#e2c376]">Essential Props</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {essentialProps.map((prop: any, index: number) => (
                    <div key={index} className="bg-[#252628] p-4 rounded-lg border border-[#36393f]/40">
                      <h5 className="font-medium mb-2 text-[#e2c376]/90">{prop.name || 'Unnamed Prop'}</h5>
                      <p className="text-[#e7e7e7]/80 text-sm">{prop.description || 'No description'}</p>
                        </div>
                  ))}
                    </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPostProduction = () => {
    const postProdData = generatedContent?.postProduction
    if (!postProdData || !postProdData.overallStyle) {
      return (
        <PreProductionLoader
          contentType="postProduction"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, postProduction: content }))
          }}
        />
      )
    }

    return (
      <div className="space-y-8">
        <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
            <CardTitle>Post-Production Guide</CardTitle>
            <CardDescription>Editing, color grading, and audio guidelines</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {postProdData.overallStyle && (
                <div>
                <h4 className="font-semibold mb-3 text-[#e2c376]">Overall Style</h4>
                <p className="text-[#e7e7e7]/90 text-sm leading-relaxed">
                  {postProdData.overallStyle.approach || postProdData.overallStyle.description || 'No style guide available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderLocation = () => {
    const locationData = generatedContent?.location
    if (!locationData || !locationData.locations || locationData.locations.length === 0) {
      return (
        <PreProductionLoader
          contentType="location"
          arcIndex={arcIndex}
          storyBible={storyBible}
          arcEpisodes={arcEpisodes}
          arcTitle={arcTitle}
          onContentGenerated={(content) => {
            setGeneratedContent(prev => ({ ...prev, location: content }))
          }}
        />
      )
    }

    return (
        <div className="space-y-8">
        <Card className="border border-[#36393f]/70 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-[#2a2a2a] to-[#252628] border-b border-[#36393f]/50">
            <CardTitle>Location Guide</CardTitle>
            <CardDescription>Filming locations and requirements</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {locationData.locations && locationData.locations.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {locationData.locations.map((location: any, index: number) => (
                  <div key={index} className="bg-[#252628] p-4 rounded-lg border border-[#36393f]/40">
                    <h5 className="font-medium mb-2 text-[#e2c376]/90">{location.name || 'Unnamed Location'}</h5>
                    <p className="text-[#e7e7e7]/80 text-sm mb-2">Type: {location.type || 'Unknown'}</p>
                    <p className="text-[#e7e7e7]/80 text-sm">{location.description || 'No description'}</p>
                  </div>
                ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleProductionComplete = (allGeneratedContent: any) => {
    setGeneratedContent(allGeneratedContent)
    setIsGenerating(false)
    setShouldAutoGenerate(false)
  }

  // Function to get genre-specific dialogue thresholds
  const getGenreThresholds = (storyBible: any): { minWords: number, minLines: number, genre: string } => {
    const theme = (storyBible?.theme || '').toLowerCase()
    const seriesTitle = (storyBible?.seriesTitle || '').toLowerCase()
    const description = (storyBible?.synopsis || storyBible?.description || '').toLowerCase()
    
    // Analyze content to determine genre
    const content = `${theme} ${seriesTitle} ${description}`
    
    // Comedy: Highest dialogue density (fast-paced, snappy exchanges)
    // Industry data: ~91 words/min in features, but TV episodes are denser
    if (content.includes('comedy') || content.includes('humor') || content.includes('funny') || 
        content.includes('sitcom') || content.includes('romantic comedy')) {
      return { minWords: 575, minLines: 48, genre: 'Comedy' }
    }
    
    // Crime/Business/Tech: Very high dialogue (meetings, negotiations, explanations)
    // Industry data: Highest word count genre in features
    if (content.includes('startup') || content.includes('business') || content.includes('tech') || 
        content.includes('entrepreneur') || content.includes('corporate') || content.includes('crime') ||
        content.includes('detective') || content.includes('police')) {
      return { minWords: 560, minLines: 45, genre: 'Business/Crime' }
    }
    
    // Drama: High dialogue (character development, emotional scenes)
    // Industry data: ~77 words/min in features, TV dramas are more dialogue-heavy
    if (content.includes('drama') || content.includes('relationship') || content.includes('character') || 
        content.includes('family') || content.includes('emotional') || content.includes('psychological')) {
      return { minWords: 480, minLines: 40, genre: 'Drama' }
    }
    
    // Thriller/Mystery: Medium-high dialogue (exposition, tension-building)
    // Industry data: ~68 words/min in features
    if (content.includes('thriller') || content.includes('mystery') || content.includes('suspense')) {
      return { minWords: 420, minLines: 35, genre: 'Thriller' }
    }
    
    // Sci-Fi/Fantasy: Medium dialogue (world-building vs action balance)
    // Mix of exposition and visual storytelling
    if (content.includes('sci-fi') || content.includes('science fiction') || content.includes('fantasy') || 
        content.includes('supernatural') || content.includes('future') || content.includes('magic')) {
      return { minWords: 400, minLines: 32, genre: 'Sci-Fi/Fantasy' }
    }
    
    // Action/Adventure: Lower dialogue (visual storytelling, quick exchanges)
    // Industry data: ~59 words/min in features
    if (content.includes('action') || content.includes('adventure') || content.includes('fight') || 
        content.includes('chase') || content.includes('martial arts') || content.includes('war')) {
      return { minWords: 365, minLines: 28, genre: 'Action' }
    }
    
    // Horror: Low dialogue (atmospheric tension, strategic silence)
    // Industry data: Lowest word count genre (~57 words/min)
    if (content.includes('horror') || content.includes('scary') || content.includes('ghost') || 
        content.includes('supernatural') || content.includes('zombie')) {
      return { minWords: 340, minLines: 26, genre: 'Horror' }
    }
    
    // Romance: High dialogue (relationship development, emotional exchanges)
    if (content.includes('romance') || content.includes('love') || content.includes('dating')) {
      return { minWords: 500, minLines: 42, genre: 'Romance' }
    }
    
    // Western: Lower dialogue (traditional visual storytelling)
    if (content.includes('western') || content.includes('cowboy') || content.includes('frontier')) {
      return { minWords: 350, minLines: 27, genre: 'Western' }
    }
    
    // Default for unknown genres (assume drama-level)
    return { minWords: 450, minLines: 37, genre: 'General Drama' }
  }

  // Function to estimate dialogue length and determine if expansion is needed
  const getDialogueLength = (episode: any): { wordCount: number, lineCount: number, needsExpansion: boolean, genre: string, targetWords: number, targetLines: number } => {
    let totalWords = 0
    let totalLines = 0
    
    if (episode.scenes) {
      episode.scenes.forEach((scene: any) => {
        if (scene.dialogue && scene.dialogue.length > 0) {
          scene.dialogue.forEach((dialogue: any) => {
            const text = dialogue.line || dialogue.text || ''
            totalWords += text.split(' ').length
            totalLines += 1
          })
        }
      })
    }
    
    // Get genre-specific thresholds
    const thresholds = getGenreThresholds(storyBible)
    const needsExpansion = totalWords < thresholds.minWords || totalLines < thresholds.minLines
    
    return { 
      wordCount: totalWords, 
      lineCount: totalLines, 
      needsExpansion,
      genre: thresholds.genre,
      targetWords: thresholds.minWords,
      targetLines: thresholds.minLines
    }
  }

  // Function to expand dialogue for an episode
  const expandEpisodeDialogue = async (episodeIndex: number, episode: any) => {
    setExpandingDialogue(episodeIndex)
    
    // Calculate genre info for this episode
    const episodeDialogueStats = getDialogueLength(episode)
    
    try {
      // ENHANCED: Include workspace data for coherence
      const workspaceData = (window as any).reeled_workspace_data || {}
      
      const response = await fetch('/api/generate/preproduction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyBible: storyBible,
          arcIndex,
          arcEpisodes,
          contentType: 'script-expansion',
          episodeIndex,
          episodeData: episode,
          genreInfo: episodeDialogueStats,
          mode: workspaceData.mode || 'beast', // Use user's chosen mode
          // Include workspace data for story coherence
          workspaceEpisodes: workspaceData.workspaceEpisodes || {},
          userChoices: workspaceData.userChoices || [],
          generatedEpisodes: workspaceData.generatedEpisodes || {},
          completedArcs: workspaceData.completedArcs || {}
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.content) {
          // Update the generated content with expanded dialogue
          setGeneratedContent((prev: any) => {
            const updated = { ...prev }
            if (updated.script && updated.script.episodes) {
              updated.script.episodes[episodeIndex] = {
                ...updated.script.episodes[episodeIndex],
                scenes: result.content.scenes || updated.script.episodes[episodeIndex].scenes,
                expanded: true
              }
            }
            return updated
          })
          
          // Mark episode as expanded
          setExpandedEpisodes(prev => new Set([...prev, episodeIndex]))
        }
      }
    } catch (error) {
      console.error('Error expanding dialogue:', error)
    } finally {
      setExpandingDialogue(null)
    }
  }

  // Show loading screen if auto-generating
  if (isGenerating && shouldAutoGenerate) {
    // Get workspace data for production
    const workspaceData = (window as any).reeled_workspace_data || {}
    
    return (
      <ProductionLoadingScreen
        onComplete={handleProductionComplete}
        storyBible={storyBible?.storyBible || storyBible}
        arcIndex={arcIndex}
        arcEpisodes={arcEpisodes}
        workspaceEpisodes={workspaceData.workspaceEpisodes || {}}
        userChoices={workspaceData.userChoices || []}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] text-[#e7e7e7]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#e2c376] via-[#f0d480] to-[#e2c376] text-transparent bg-clip-text mb-4">
              Pre-Production Complete
            </h1>
            <p className="text-xl text-[#e7e7e7]/80 mb-2">
            {projectTitle || 'Your Project'} - Arc {arcIndex + 1}
          </p>
            <p className="text-[#e7e7e7]/60">
              Professional-grade pre-production materials ready for your production team
          </p>
        </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 text-center border border-[#36393f]/50">
              <div className="text-3xl font-bold text-[#e2c376] mb-2">
                {Object.keys(generatedContent || {}).length}
              </div>
              <div className="text-[#e7e7e7]/70 text-sm">Content Types</div>
            </div>
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 text-center border border-[#36393f]/50">
              <div className="text-3xl font-bold text-[#e2c376] mb-2">
                {arcEpisodes.length || 10}
              </div>
              <div className="text-[#e7e7e7]/70 text-sm">Episodes</div>
            </div>
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 text-center border border-[#36393f]/50">
              <div className="text-3xl font-bold text-[#e2c376] mb-2">100%</div>
              <div className="text-[#e7e7e7]/70 text-sm">Complete</div>
            </div>
            <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 text-center border border-[#36393f]/50">
              <div className="text-3xl font-bold text-[#e2c376] mb-2">🎬</div>
              <div className="text-[#e7e7e7]/70 text-sm">Ready to Film</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-[#2a2a2a] via-[#252628] to-[#2a2a2a] p-2 rounded-xl border border-[#36393f]/50 backdrop-blur-sm">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'script', label: 'Script', icon: '📝', description: 'Professional screenplay' },
                  { id: 'storyboard', label: 'Storyboard', icon: '🎬', description: 'Visual scene breakdown' },
                  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Character casting guide' },
                  { id: 'props', label: 'Props', icon: '🎪', description: 'Production requirements' },
                  { id: 'location', label: 'Location', icon: '📍', description: 'Filming locations' },
                  { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Promotional strategy' },
                  { id: 'postProduction', label: 'Post-Prod', icon: '✂️', description: 'Editing guidelines' }
          ].map((tab) => (
                  <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative group",
                activeTab === tab.id
                        ? "bg-gradient-to-r from-[#e2c376] to-[#f0d480] text-black shadow-lg"
                        : "bg-[#36393f]/20 text-[#e7e7e7]/70 hover:bg-[#36393f]/40 hover:text-[#e7e7e7]"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1a1a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#36393f]/50">
                      {tab.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a1a]"></div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
        </div>
          
          {/* Active Tab Indicator */}
          <div className="text-center">
            <motion.h2 
              className="text-2xl font-bold text-[#e2c376] mb-4"
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[
                { id: 'script', label: 'Professional Script', icon: '📝' },
                { id: 'storyboard', label: 'Visual Storyboard', icon: '🎬' },
                { id: 'casting', label: 'Casting Directory', icon: '🎭' },
                { id: 'props', label: 'Props & Wardrobe', icon: '🎪' },
                { id: 'location', label: 'Location Guide', icon: '📍' },
                { id: 'marketing', label: 'Marketing Strategy', icon: '📢' },
                { id: 'postProduction', label: 'Post-Production Brief', icon: '✂️' }
              ].find(tab => tab.id === activeTab)?.label || 'Content'}
            </motion.h2>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          className="min-h-[60vh]"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e2c376]/5 via-transparent to-[#e2c376]/5 rounded-2xl opacity-50"></div>
            
            {/* Content */}
            <div className="relative z-10">
          {renderTabContent()}
        </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}