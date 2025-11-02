'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useVideo } from '@/context/VideoContext'

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

export function VideoEditing() {
  const { uploadedVideos, selectedVideo, setSelectedVideo } = useVideo();
  
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
  
  const [sceneMarkers, setSceneMarkers] = useState<SceneMarker[]>([
    { id: '1', time: 0, label: 'Opening', confidence: 0.92 },
    { id: '2', time: 7.5, label: 'Character Introduction', confidence: 0.88 },
    { id: '3', time: 15, label: 'Dialogue', confidence: 0.95 },
    { id: '4', time: 20, label: 'Action', confidence: 0.79 },
    { id: '5', time: 28, label: 'Closing', confidence: 0.87 }
  ])
  
  // Reference for the video player
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Mock episode data for the script tab
  const [episode, setEpisode] = useState<Episode>({
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">Video Editing</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={processVideoWithAI}
            disabled={isAIProcessing || !selectedVideo}
            className="inline-flex items-center px-3 py-1.5 bg-[#e2c376] text-black rounded-md text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Auto-Edit with AI
          </button>
          <button className="inline-flex items-center px-3 py-1.5 bg-[#36393f] hover:bg-[#4f535a] rounded-md text-sm font-medium transition-colors">
            Save Edit
          </button>
        </div>
      </div>
      
      {/* Video Preview Area */}
      <div className="relative bg-[#1e1f22] rounded-lg overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          {selectedVideo ? (
            <video 
              ref={videoRef}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full" 
              controls={false}
            >
              <source src={selectedVideo.url} type={`video/${selectedVideo.type === 'video' ? 'mp4' : 'webm'}`} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>Select a video clip to preview</p>
            </div>
          )}
        </div>
        
        {/* Video controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/80">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / 
                {selectedVideo ? " 2:15" : " 0:00"}
              </div>
              <div className="text-sm text-white/80">
                {selectedVideo ? selectedVideo.name : "No video selected"}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#e2c376]" 
                style={{ width: `${(currentTime / (videoRef.current?.duration || 135)) * 100}%` }}
              ></div>
            </div>
            
            {/* Control buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button className="text-white hover:text-[#e2c376] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path>
                </svg>
              </button>
              <button 
                className="text-white hover:text-[#e2c376] transition-colors"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
              </button>
              <button className="text-white hover:text-[#e2c376] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Processing Modal */}
      <AnimatePresence>
        {isAIProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e1f22] rounded-xl overflow-hidden shadow-xl max-w-lg w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#e2c37620] rounded-full flex items-center justify-center">
                    <span className="text-[#e2c376] text-xl">AI</span>
                  </div>
                  <h3 className="text-xl font-semibold">AI Video Processing</h3>
                </div>
                
                <div className="mb-6">
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#e2c376]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${aiProcessingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-sm text-[#e7e7e7]/70">{aiProcessingStep}</span>
                    <span className="text-sm font-semibold">{aiProcessingProgress}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Visual representation of AI processing */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div 
                      className="aspect-video bg-[#2a2a2a] rounded-md overflow-hidden"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        backgroundColor: ['#2a2a2a', '#3a3a3a', '#2a2a2a']
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#e2c376]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="aspect-video bg-[#2a2a2a] rounded-md overflow-hidden"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        backgroundColor: ['#2a2a2a', '#3a3a3a', '#2a2a2a']
                      }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#e2c376]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="aspect-video bg-[#2a2a2a] rounded-md overflow-hidden"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        backgroundColor: ['#2a2a2a', '#3a3a3a', '#2a2a2a']
                      }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#e2c376]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="text-center text-sm text-[#e7e7e7]/50">
                    AI is analyzing and enhancing your footage. This may take a few moments.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Clips area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Clips</h3>
          <div className="flex space-x-2">
            <button className="text-sm px-2 py-1 rounded bg-[#36393f] hover:bg-[#4f535a] transition-colors">
              Import
            </button>
            <button className="text-sm px-2 py-1 rounded bg-[#36393f] hover:bg-[#4f535a] transition-colors">
              Organize
            </button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-2 space-x-3">
          {clips.length > 0 ? (
            clips.map(clip => (
              <div 
                key={clip.id}
                className={`flex-shrink-0 w-40 bg-[#36393f] rounded overflow-hidden cursor-pointer transition-all ${
                  clip.selected ? 'ring-2 ring-[#e2c376]' : ''
                }`}
                onClick={() => {
                  // Find the corresponding uploaded video
                  const video = uploadedVideos.find(v => v.id === clip.id);
                  if (video) {
                    setSelectedVideo(video);
                  }
                  // Mark this clip as selected
                  setClips(clips.map(c => ({
                    ...c,
                    selected: c.id === clip.id
                  })));
                }}
              >
                <div className="aspect-video bg-[#2b2d31] relative">
                  <img 
                    src={clip.thumbnailUrl}
                    alt={clip.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor((clip.duration || 0) / 60)}:{((clip.duration || 0) % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-sm truncate">{clip.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{clip.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : uploadedVideos.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-6 text-gray-400">
              <p>No video clips available.</p>
              <p className="text-sm">Upload videos in the Footage Organization step.</p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-6 text-gray-400">
              <svg className="animate-spin w-6 h-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Processing your videos...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Timeline</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Zoom:</span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseInt(e.target.value))}
              className="w-24 accent-[#e2c376]"
            />
          </div>
        </div>
        
        <div className="bg-[#2b2d31] rounded p-3 overflow-x-auto">
          <div className="flex flex-col space-y-3" style={{ width: `${timelineZoom * 10}px` }}>
            {/* Scene markers */}
            {showSceneMarkers && (
              <div className="relative h-6">
                {sceneMarkers.map((marker) => (
                  <div 
                    key={marker.id}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `${(marker.time / 30) * 100}%` }}
                  >
                    <div className="w-px h-2 bg-[#e2c376]"></div>
                    <div className="text-xs text-[#e2c376] whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                      {marker.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Time ruler */}
            <div className="relative h-6 border-t border-b border-[#36393f]">
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 flex flex-col justify-between items-center"
                  style={{ left: `${(i * 5 / 30) * 100}%` }}
                >
                  <div className="w-px h-2 bg-gray-500"></div>
                  <div className="text-xs text-gray-500">{i * 5}s</div>
                  <div className="w-px h-2 bg-gray-500"></div>
                </div>
              ))}
            </div>
            
            {/* Clips on timeline */}
            <div className="relative h-12 bg-[#36393f]/50">
              {clips.map(clip => (
                <div 
                  key={clip.id}
                  className="absolute top-1 bottom-1 bg-[#9c7b3c] rounded overflow-hidden cursor-pointer shadow-md hover:brightness-110 transition-all"
                  style={{ 
                    left: `${(clip.startTime / 30) * 100}%`,
                    width: `${((clip.duration || 0) / 30) * 100}%`
                  }}
                >
                  <div className="h-full p-1 flex items-center">
                    <div className="w-6 overflow-hidden flex-shrink-0">
                      <img 
                        src={clip.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-1 overflow-hidden whitespace-nowrap text-xs">
                      {clip.name}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-white/80 z-10"
                style={{ left: `${(currentTime / 30) * 100}%` }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Script and Preview tabs */}
      <div className="space-y-3">
        <div className="flex border-b border-[#36393f]">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'preview' 
                ? 'text-[#e2c376] border-b-2 border-[#e2c376]' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'script' 
                ? 'text-[#e2c376] border-b-2 border-[#e2c376]' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('script')}
          >
            Script
          </button>
        </div>
        
        <div className="bg-[#2b2d31] rounded p-4">
          {activeTab === 'preview' ? (
            <div className="flex items-center justify-between">
              <div className="text-sm">Auto-save enabled</div>
              <button className="text-sm px-3 py-1.5 bg-[#e2c376] text-black rounded">
                Export Preview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold">{episode.title}</h3>
                <p className="text-sm text-gray-300">{episode.synopsis}</p>
              </div>
              
              <div className="space-y-4">
                {episode.scenes.map(scene => (
                  <div key={scene.number} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Scene {scene.number}: {scene.location}</h4>
                      <div className="flex space-x-1">
                        <button className="text-xs px-2 py-0.5 bg-[#36393f] hover:bg-[#4f535a] rounded transition-colors">
                          Edit
                        </button>
                        <button className="text-xs px-2 py-0.5 bg-[#36393f] hover:bg-[#4f535a] rounded transition-colors">
                          Link
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 italic">{scene.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      {scene.dialogues.map((dialogue, i) => (
                        <div key={i} className="space-y-1">
                          <div className="font-medium">{dialogue.character}</div>
                          <div className="pl-4">"{dialogue.lines}"</div>
                          <div className="pl-4 text-xs text-gray-400">[{dialogue.emotion}]</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Color Grading Panel */}
      <AnimatePresence>
        {showColorGradingPanel && hasAppliedAI && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border border-[#e7e7e7]/10 rounded-xl overflow-hidden mb-6"
          >
            <div className="bg-[#1e1f22] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#e2c376] bg-[#e2c37620] text-xs py-1 px-2 rounded-md">AI</span>
                  <h3 className="font-medium">AI Color Grading Applied</h3>
                </div>
                <button 
                  onClick={() => setShowColorGradingPanel(false)}
                  className="text-[#e7e7e7]/50 hover:text-[#e7e7e7]/80"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Exposure</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[65%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Contrast</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[82%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Saturation</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[58%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Highlights</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[45%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Shadows</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[72%]"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#e7e7e7]/70">Warmth</label>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e2c376] w-[62%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg p-3">
                  <div className="text-xs text-[#e7e7e7]/70 mb-2">Color Scheme Applied</div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#e8c273]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#d9ab62]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#c29347]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#8a6b36]"></div>
                    <div className="w-6 h-6 rounded-full bg-[#5a472a]"></div>
                  </div>
                  <div className="mt-2 text-xs text-[#e7e7e7]/50">
                    Cinematic gold tones to match your series theme
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-[#e7e7e7]/70">
                <p>AI has analyzed your footage and applied optimal color grading settings to match your pre-production vision. The system detected low lighting in some scenes and has adjusted exposure while preserving the mood.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
