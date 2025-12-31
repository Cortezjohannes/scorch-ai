'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useVideo } from '@/context/VideoContext'
import { loadPostProductionData } from '@/services/postproduction-data-loader'
import { generateSceneIntelligence } from '@/services/scene-intelligence-generator'
import { mapShotsToStoryboards } from '@/services/postproduction-shot-mapper'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import type { PostProductionDataContext } from '@/services/postproduction-data-loader'
import type { SceneIntelligence } from '@/services/scene-intelligence-generator'
import type { EditingInstructions } from '@/types/editing-instructions'
import { SceneEditingCard } from './SceneEditingCard'

interface VideoEditingProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

interface VideoClip {
  id: string
  name: string
  startTime: number
  endTime: number
  track: number
  thumbnail?: string
  duration?: number
  thumbnailUrl?: string
  selected?: boolean
  type?: string
}

interface SceneMarker {
  id: string
  time: number
  label: string
  confidence: number
}

// Add new interfaces for script elements
interface Dialogue {
  character: string
  lines: string
  emotion: string
}

interface Scene {
  number: number
  location: string
  description: string
  dialogues: Dialogue[]
}

interface Episode {
  number: number
  title: string
  synopsis: string
  scenes: Scene[]
}

interface AIProcess {
  id: string
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed'
  progress: number
}

export function VideoEditing({ storyBibleId, episodeNumber, arcIndex, arcEpisodes }: VideoEditingProps = {}) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { uploadedVideos, selectedVideo, setSelectedVideo } = useVideo();
  
  // Theme-aware accent color
  const accentColor = isDark ? '#10B981' : '#C9A961'
  const accentColorDark = isDark ? '#059669' : '#B8944F'
  
  // Post-production data state
  const [postProductionData, setPostProductionData] = useState<PostProductionDataContext | null>(null)
  const [sceneIntelligence, setSceneIntelligence] = useState<Record<number, SceneIntelligence>>({})
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false)
  
  // State for clips, timeline, and AI features
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('trim')
  const [timelineZoom, setTimelineZoom] = useState<number>(50)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [showSceneMarkers, setShowSceneMarkers] = useState<boolean>(true)
  const [isAIProcessing, setIsAIProcessing] = useState<boolean>(false)
  const [processStage, setProcessStage] = useState<string>('')
  const [processComplete, setProcessComplete] = useState<boolean>(false)
  const [previousStages, setPreviousStages] = useState<string[]>([])
  const [currentStage, setCurrentStage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'preview' | 'script'>('preview')
  const [showAIPanel, setShowAIPanel] = useState<boolean>(true)
  const [showAutoEdit, setShowAutoEdit] = useState<boolean>(false)
  const [aiProcessingStep, setAiProcessingStep] = useState<string>('')
  const [aiProcessingProgress, setAiProcessingProgress] = useState(0)
  const [showColorGradingPanel, setShowColorGradingPanel] = useState(false)
  const [hasAppliedAI, setHasAppliedAI] = useState(false)
  
  // Editing mode state
  const [editingMode, setEditingMode] = useState<'ai-assisted' | 'fully-ai'>('ai-assisted')
  const [editingInstructions, setEditingInstructions] = useState<Record<number, EditingInstructions>>({})
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 })
  const [generatingScenes, setGeneratingScenes] = useState<number[]>([])

  // Determine effective episode number
  const effectiveEpisodeNumber = episodeNumber > 0 ? episodeNumber : (arcEpisodes && arcEpisodes.length > 0 ? arcEpisodes[0] : 0)

  // Get available scenes
  const availableScenes = useMemo(() => {
    if (postProductionData?.shotList?.scenes) {
      return postProductionData.shotList.scenes.map(s => s.sceneNumber)
    }
    if (postProductionData?.storyboards?.scenes) {
      return postProductionData.storyboards.scenes.map((s: any) => s.sceneNumber)
    }
    return []
  }, [postProductionData])

  // Generate editing instructions for a batch of scenes
  const handleGenerateInstructions = async (sceneNumbers: number[]) => {
    if (!postProductionData || sceneNumbers.length === 0 || !storyBibleId || !effectiveEpisodeNumber) {
      console.error('Missing required data for generating instructions')
      return
    }

    setIsGeneratingInstructions(true)
    setGeneratingScenes(sceneNumbers)
    setGenerationProgress({ current: 0, total: sceneNumbers.length })

    try {
      // Generate in batches of 2-3 scenes
      const batchSize = 2
      const batches: number[][] = []
      for (let i = 0; i < sceneNumbers.length; i += batchSize) {
        batches.push(sceneNumbers.slice(i, i + batchSize))
      }

      const allInstructions: EditingInstructions[] = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        setGenerationProgress({ current: i * batchSize, total: sceneNumbers.length })

        // Call the API route with post-production data from client
        const response = await fetch('/api/generate/editing-instructions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sceneNumbers: batch,
            postProductionData: postProductionData,
            sceneIntelligence: sceneIntelligence
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || 'Failed to generate editing instructions')
        }

        const data = await response.json()
        if (data.success && data.instructions) {
          allInstructions.push(...data.instructions.scenes)
        } else {
          throw new Error('Invalid response from API')
        }
      }

      // Store instructions by scene number
      const instructionsMap: Record<number, EditingInstructions> = {}
      allInstructions.forEach(instruction => {
        instructionsMap[instruction.sceneNumber] = instruction
      })

      setEditingInstructions(prev => ({ ...prev, ...instructionsMap }))
      setGenerationProgress({ current: sceneNumbers.length, total: sceneNumbers.length })
    } catch (error) {
      console.error('Error generating editing instructions:', error)
      alert(`Failed to generate editing instructions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingInstructions(false)
      setGeneratingScenes([])
    }
  }

  // Get storyboard frames for a scene
  const getStoryboardFramesForScene = (sceneNumber: number) => {
    if (!postProductionData?.storyboards) return []
    const scene = postProductionData.storyboards.scenes.find((s: any) => s.sceneNumber === sceneNumber)
    return scene?.frames || []
  }

  // Get shot list for a scene
  const getShotListForScene = (sceneNumber: number) => {
    if (!postProductionData?.shotList) return []
    const scene = postProductionData.shotList.scenes.find((s: any) => s.sceneNumber === sceneNumber)
    return scene?.shots || []
  }
  
  const [sceneMarkers, setSceneMarkers] = useState<SceneMarker[]>([
    { id: '1', time: 0, label: 'Opening', confidence: 0.92 },
    { id: '2', time: 7.5, label: 'Character Introduction', confidence: 0.88 },
    { id: '3', time: 15, label: 'Dialogue', confidence: 0.95 },
    { id: '4', time: 20, label: 'Action', confidence: 0.79 },
    { id: '5', time: 28, label: 'Closing', confidence: 0.87 }
  ])
  
  // Reference for the video player
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Load post-production data on mount
  useEffect(() => {
    const effectiveEpisode = episodeNumber > 0 ? episodeNumber : (arcEpisodes && arcEpisodes.length > 0 ? arcEpisodes[0] : 0)
    if (storyBibleId && effectiveEpisode) {
      loadPostProductionDataForComponent(effectiveEpisode)
    }
  }, [storyBibleId, episodeNumber, arcEpisodes, user?.id])

  const loadPostProductionDataForComponent = async (epNum: number) => {
    if (!storyBibleId || !epNum) return
    
    setIsLoadingData(true)
    try {
      const data = await loadPostProductionData(storyBibleId, epNum, user?.id)
      if (data) {
        setPostProductionData(data)
        
        // Generate scene intelligence for all scenes
        if (data.shotList && data.storyboards) {
          const shotMappings = mapShotsToStoryboards(data.shotList, data.storyboards)
          const intelligence: Record<number, SceneIntelligence> = {}
          
          // Get unique scene numbers
          const sceneNumbers = new Set(shotMappings.map(m => m.sceneNumber))
          
          for (const sceneNum of sceneNumbers) {
            const sceneIntel = await generateSceneIntelligence(sceneNum, data, shotMappings)
            if (sceneIntel) {
              intelligence[sceneNum] = sceneIntel
            }
          }
          
          setSceneIntelligence(intelligence)
        }
      }
    } catch (error) {
      console.error('Error loading post-production data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Convert post-production data to Episode format for script tab
  const episode: Episode = useMemo(() => {
    const effectiveEpisode = episodeNumber > 0 ? episodeNumber : (arcEpisodes && arcEpisodes.length > 0 ? arcEpisodes[0] : 1)
    if (!postProductionData) {
      return {
        number: effectiveEpisode,
        title: "Episode",
        synopsis: "",
        scenes: []
      }
    }

    const scenes: Scene[] = []
    
    // Extract scenes from shot list or episode data
    if (postProductionData.shotList) {
      postProductionData.shotList.scenes.forEach(scene => {
        const intelligence = sceneIntelligence[scene.sceneNumber]
        const dialogues: Dialogue[] = []
        
        // Extract dialogue from scene intelligence
        if (intelligence?.script.dialogue) {
          intelligence.script.dialogue.forEach((line, index) => {
            dialogues.push({
              character: `Character ${index + 1}`,
              lines: line,
              emotion: 'neutral'
            })
          })
        }
        
        scenes.push({
          number: scene.sceneNumber,
          location: scene.location || 'Unknown',
          description: intelligence?.script.actionLines.join(' ') || scene.sceneTitle || '',
          dialogues
        })
      })
    } else if (postProductionData.episode?.scenes) {
      postProductionData.episode.scenes.forEach((scene: any) => {
        const intelligence = sceneIntelligence[scene.sceneNumber]
        scenes.push({
          number: scene.sceneNumber,
          location: 'Unknown',
          description: scene.content || '',
          dialogues: intelligence?.script.dialogue.map((line, i) => ({
            character: `Character ${i + 1}`,
            lines: line,
            emotion: 'neutral'
          })) || []
        })
      })
    }

    return {
      number: effectiveEpisode || postProductionData.episodeNumber || 1,
      title: postProductionData.episode?.title || `Episode ${effectiveEpisode || 1}`,
      synopsis: postProductionData.episode?.synopsis || '',
      scenes
    }
  }, [postProductionData, sceneIntelligence, episodeNumber, arcEpisodes])

  // Mock episode data for the script tab (fallback)
  const [fallbackEpisode, setFallbackEpisode] = useState<Episode>({
    number: 1,
    title: "Pilot",
    synopsis: "Introduction to the main characters and the central conflict.",
    scenes: [
      {
        number: 1,
        location: "City Street",
        description: "A busy street in the morning. People rushing to work.",
        dialogues: [
          {
            character: "Alex",
            lines: "I can't believe it's come to this.",
            emotion: "Frustrated"
          },
          {
            character: "Jamie",
            lines: "We knew it was a risk from the start.",
            emotion: "Calm"
          }
        ]
      },
      {
        number: 2,
        location: "Office",
        description: "A modern office. Alex enters, looking stressed.",
        dialogues: [
          {
            character: "Boss",
            lines: "You're late again.",
            emotion: "Disappointed"
          },
          {
            character: "Alex",
            lines: "Sorry, it won't happen again.",
            emotion: "Apologetic"
          }
        ]
      }
    ]
  });
  
  // AI processing states
  const [aiProcesses, setAiProcesses] = useState<AIProcess[]>([
    { id: 'scene-detection', name: 'Scene Detection', description: 'Analyzing video for scene changes', status: 'pending', progress: 0 },
    { id: 'content-analysis', name: 'Content Analysis', description: 'Identifying key elements and subjects', status: 'pending', progress: 0 },
    { id: 'smart-trimming', name: 'Smart Trimming', description: 'Removing dead space and repetitive content', status: 'pending', progress: 0 },
    { id: 'pace-optimization', name: 'Pace Optimization', description: 'Adjusting clip durations for optimal pacing', status: 'pending', progress: 0 },
    { id: 'transition-selection', name: 'Transition Selection', description: 'Applying suitable transitions between clips', status: 'pending', progress: 0 },
  ])
  
  // AI enhanchement suggestions
  const [suggestions, setSuggestions] = useState<string[]>([
    'Trim the opening sequence by 2.4 seconds for better pacing',
    'Apply subtle color correction to match lighting in scene 3',
    'Enhance audio clarity in dialogue at 01:42',
    'Add subtle transition between scenes 2 and 3',
    'Crop to center focus on main subject at 00:58'
  ])
  
  // Use videoContext to load clips
  useEffect(() => {
    if (uploadedVideos.length > 0) {
      // Convert uploaded videos to clip format
      const newClips = uploadedVideos
        .filter(video => video.type === 'video')
        .map((video, index) => ({
          id: video.id,
          name: video.matchedSceneName || video.name,
          startTime: index * 10, // Mock timing - each clip starts 10 seconds after the previous
          endTime: (index + 1) * 10,
          track: index % 3, // Add track property (use modulo to distribute across 3 tracks)
          duration: 10, // Mock 10 second duration for all clips
          thumbnailUrl: video.thumbnail || '/footage-1.jpg',
          selected: video.id === selectedVideo?.id,
          type: 'main'
        }));
      
      setClips(newClips);
    }
  }, [uploadedVideos, selectedVideo]);

  // Update video player when selectedVideo changes
  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      videoRef.current.src = selectedVideo.url;
      videoRef.current.load();
    }
  }, [selectedVideo]);
  
  // Simulate AI Processing
  const handleAIAutoEdit = () => {
    setIsAIProcessing(true)
    setPreviousStages([])
    setCurrentStage('Analyzing footage')
    
    // Simulate AI processing stages with timeouts
    const stages = [
      'Analyzing footage',
      'Detecting scenes',
      'Identifying key moments',
      'Applying smart cuts',
      'Optimizing transitions',
      'Finalizing edit'
    ]
    
    stages.forEach((stage, index) => {
      setTimeout(() => {
        if (index > 0) {
          setPreviousStages(prev => [...prev, stages[index - 1]])
        }
        setCurrentStage(stage)
        
        // When we reach the last stage, complete the process
        if (index === stages.length - 1) {
          setTimeout(() => {
            setProcessComplete(true)
            setIsAIProcessing(false)
          }, 1000)
        }
      }, index * 1500)
    })
  }
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Simulate AI processing with progress animation
  const simulateAIProcessing = () => {
    // Reset all processes
    setAiProcesses(prev => prev.map(process => ({
      ...process,
      status: 'pending',
      progress: 0
    })))
    
    // Process each AI task sequentially with delays
    aiProcesses.forEach((process, index) => {
      // Start each process with a staggered delay
      setTimeout(() => {
        // Set current process to processing
        setAiProcesses(prev => prev.map(p => 
          p.id === process.id 
            ? { ...p, status: 'processing', progress: 0 } 
            : p
        ))
        
        // Create progress animation interval
        const interval = setInterval(() => {
          setAiProcesses(prev => {
            const updatedProcesses = [...prev]
            const processIndex = updatedProcesses.findIndex(p => p.id === process.id)
            
            if (processIndex !== -1) {
              const currentProgress = updatedProcesses[processIndex].progress
              
              if (currentProgress >= 100) {
                clearInterval(interval)
                updatedProcesses[processIndex] = {
                  ...updatedProcesses[processIndex],
                  status: 'completed',
                  progress: 100
                }
              } else {
                // Simulate varying progress speeds
                const increment = Math.random() * 5 + 1
                updatedProcesses[processIndex] = {
                  ...updatedProcesses[processIndex],
                  progress: Math.min(currentProgress + increment, 100)
                }
              }
            }
            
            return updatedProcesses
          })
        }, 100)
        
        // Auto complete after a set duration
        setTimeout(() => {
          clearInterval(interval)
          setAiProcesses(prev => prev.map(p => 
            p.id === process.id 
              ? { ...p, status: 'completed', progress: 100 } 
              : p
          ))
          
          // After all processes complete, show the auto edit panel
          if (index === aiProcesses.length - 1) {
            setTimeout(() => {
              setShowAutoEdit(true)
            }, 1000)
          }
        }, 5000 + Math.random() * 2000) // Vary completion time slightly
      }, index * 1000) // Stagger start times
    })
  }
  
  // Apply auto-editing to timeline
  const applyAutoEdit = () => {
    // Simulate applying AI edits to timeline
    setShowAutoEdit(false)
    
    // Show a loading effect
    setClips([]) // Temporarily clear clips
    
    setTimeout(() => {
      // Create new intelligently arranged clips
      const optimizedClips: VideoClip[] = uploadedVideos
        .filter(video => video.type === 'video')
        .map((video, index) => {
          // Create more varied and optimized timeline arrangement
          const trackVariation = [0, 1, 0, 2, 1, 0]
          const track = trackVariation[index % trackVariation.length]
          
          // Create more varied clip lengths based on index
          const durationMultiplier = [1.2, 0.8, 1, 0.9, 1.1][index % 5]
          const duration = 20 * durationMultiplier
          
          // Calculate start time with small gaps between clips
          const startTime = index > 0 
            ? clips.reduce((acc, clip) => Math.max(acc, clip.endTime), 0) + 2
            : 0
            
          return {
            id: `optimized-clip-${video.id}`,
            name: video.name,
            startTime,
            endTime: startTime + duration,
            track,
            thumbnail: video.thumbnail || '/footage-1.jpg',
            duration: duration,
            thumbnailUrl: video.thumbnail || '/footage-1.jpg',
            selected: false,
            type: 'video'
          }
        })
      
      setClips(optimizedClips)
    }, 1500)
  }
  
  // Function to simulate AI video processing with visual feedback
  const processVideoWithAI = () => {
    if (!selectedVideo) return

    setIsAIProcessing(true)
    setAiProcessingProgress(0)
    
    const steps = [
      'Analyzing footage content...',
      'Detecting scenes and cuts...',
      'Identifying low quality segments...',
      'Optimizing color grading...',
      'Enhancing audio clarity...',
      'Removing unused footage...',
      'Applying smart transitions...',
      'Finalizing edits...'
    ]
    
    let currentStep = 0
    const totalSteps = steps.length
    
    const processStep = () => {
      if (currentStep < totalSteps) {
        setAiProcessingStep(steps[currentStep])
        setAiProcessingProgress(Math.round((currentStep / totalSteps) * 100))
        currentStep++
        setTimeout(processStep, 800) // Each step takes 800ms
      } else {
        // Processing complete
        setAiProcessingProgress(100)
        setTimeout(() => {
          setIsAIProcessing(false)
          setHasAppliedAI(true)
          setShowColorGradingPanel(true)
        }, 1000)
      }
    }
    
    processStep()
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#10B981]">Video Editing</h2>
        {isGeneratingInstructions && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#10B981]"></div>
            Generating... ({generationProgress.current}/{generationProgress.total})
          </div>
        )}
      </div>

      {/* Editing Mode Selection */}
      <div className="flex items-center gap-4 p-4 bg-[#121212] rounded-xl border border-[#10B981]/20">
        <span className="text-sm font-medium text-gray-300">Editing Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingMode('ai-assisted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              editingMode === 'ai-assisted'
                ? 'bg-[#10B981] text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-300 border border-[#10B981]/20'
            }`}
          >
            AI-Assisted Manual Editing
          </button>
          <button
            onClick={() => {}}
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] text-gray-500 cursor-not-allowed relative border border-[#10B981]/10"
          >
            Fully AI Edit
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
              Soon
            </span>
          </button>
        </div>
      </div>

      {/* Scene-by-Scene Editing Guide (AI-Assisted Mode) */}
      {editingMode === 'ai-assisted' && (
        <div className="space-y-3">
          {isLoadingData ? (
            <div className="text-center py-12 text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mb-4"></div>
              <p>Loading pre-production data...</p>
            </div>
          ) : availableScenes.length === 0 ? (
            <div className="text-center py-12 border border-[#10B981]/20 rounded-xl bg-[#121212]">
              <p className="text-gray-400 mb-2">No scene data available</p>
              <p className="text-sm text-gray-500">
                Pre-production shot list or storyboards are required
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableScenes.map((sceneNum) => {
                const sceneShots = postProductionData?.shotList?.scenes.find(
                  (s: any) => s.sceneNumber === sceneNum
                )
                const storyboardFrames = getStoryboardFramesForScene(sceneNum)
                const shotList = getShotListForScene(sceneNum)

                return (
                  <SceneEditingCard
                    key={sceneNum}
                    sceneNumber={sceneNum}
                    sceneTitle={sceneShots?.sceneTitle}
                    location={sceneShots?.location}
                    storyboardFrames={storyboardFrames}
                    shotList={shotList}
                    editingInstructions={editingInstructions[sceneNum]}
                    isGenerating={generatingScenes.includes(sceneNum)}
                    onGenerateInstructions={() => handleGenerateInstructions([sceneNum])}
                    postProductionData={postProductionData}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
