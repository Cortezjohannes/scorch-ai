'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { useVideo } from '@/context/VideoContext'
import { useTheme } from '@/context/ThemeContext'
import { ComingSoonOverlay } from './ComingSoonOverlay'

interface AudioTrack {
  id: string
  name: string
  type: 'music' | 'sfx' | 'voiceover'
  duration: number
}

interface AudioEffect {
  id: string
  name: string
  type: 'equalizer' | 'reverb' | 'compression'
  active: boolean
}

interface ProcessingTask {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed';
}

interface SoundDesignProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

export function SoundDesign({ storyBibleId, episodeNumber, arcIndex, arcEpisodes }: SoundDesignProps) {
  const { videos } = useVideo()
  const selectedVideo = videos.length > 0 ? videos[0] : null
  const [selectedTrack, setSelectedTrack] = useState<string>('main')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false)
  const [showWaveform, setShowWaveform] = useState<boolean>(true)
  const [processingTasks, setProcessingTasks] = useState<ProcessingTask[]>([
    { id: 'noise-reduction', name: 'Noise Reduction', description: 'Removing background noise', progress: 0, status: 'pending' },
    { id: 'voice-enhancement', name: 'Voice Enhancement', description: 'Improving dialogue clarity', progress: 0, status: 'pending' },
    { id: 'audio-balance', name: 'Audio Balancing', description: 'Adjusting levels across tracks', progress: 0, status: 'pending' },
    { id: 'spatial-audio', name: 'Spatial Enhancement', description: 'Optimizing stereo field', progress: 0, status: 'pending' },
    { id: 'eq-optimization', name: 'EQ Optimization', description: 'Frequency response correction', progress: 0, status: 'pending' },
  ])
  
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    { id: 'track-1', name: 'Background Music', type: 'music', duration: 120 },
    { id: 'track-2', name: 'Ambient Sounds', type: 'sfx', duration: 85 },
    { id: 'track-3', name: 'Narrator Voice', type: 'voiceover', duration: 65 },
  ])
  
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([
    { id: 'effect-1', name: 'Bass Boost', type: 'equalizer', active: true },
    { id: 'effect-2', name: 'Small Room', type: 'reverb', active: false },
    { id: 'effect-3', name: 'Vocal Enhancer', type: 'compression', active: true },
  ])
  
  // Track progress for the mock processing
  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        setIsProcessing(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isProcessing])

  const handleRemoveTrack = (trackId: string) => {
    setAudioTracks(audioTracks.filter(track => track.id !== trackId))
  }

  const handleToggleEffect = (effectId: string) => {
    setAudioEffects(audioEffects.map(effect => 
        effect.id === effectId 
        ? { ...effect, active: !effect.active } 
          : effect
    ))
  }

  // Add a new audio track
  const handleAddTrack = (type: 'music' | 'sfx' | 'voiceover') => {
    const newTrack: AudioTrack = {
      id: `track-${Date.now()}`,
      name: type === 'music' ? 'New Music' : type === 'sfx' ? 'New Effect' : 'New Voiceover',
      type,
      duration: 60,
    }
    setAudioTracks([...audioTracks, newTrack])
  }
  
  // Run AI audio analysis
  const runAudioAnalysis = () => {
    setShowAnalysis(true)
    setIsProcessing(true)
    
    // Reset all processing tasks
    setProcessingTasks(prevTasks => 
      prevTasks.map(task => ({ ...task, progress: 0, status: 'pending' }))
    )
    
    // Process each task sequentially with a delay
    processingTasks.forEach((task, index) => {
      // Start the task with a delay based on its position
      setTimeout(() => {
        // Mark task as processing
        setProcessingTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? { ...t, status: 'processing' } : t
          )
        )
        
        // Simulate progress
        const interval = setInterval(() => {
          setProcessingTasks(prevTasks => {
            // Find the current task
            const updatedTasks = [...prevTasks]
            const taskIndex = updatedTasks.findIndex(t => t.id === task.id)
            
            if (taskIndex !== -1) {
              const currentProgress = updatedTasks[taskIndex].progress
              
              if (currentProgress >= 100) {
                clearInterval(interval)
                updatedTasks[taskIndex] = {
                  ...updatedTasks[taskIndex],
                  status: 'completed',
                  progress: 100
                }
              } else {
                // Random increment between 1-5%
                const increment = Math.random() * 5 + 1
                updatedTasks[taskIndex] = {
                  ...updatedTasks[taskIndex],
                  progress: Math.min(currentProgress + increment, 100)
                }
              }
            }
            
            return updatedTasks
          })
        }, 100)
        
        // Ensure task completes after a reasonable time
        setTimeout(() => {
          clearInterval(interval)
          setProcessingTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === task.id 
                ? { ...t, status: 'completed', progress: 100 } 
                : t
            )
          )
          
          // If this is the last task, finish the entire process
          if (index === processingTasks.length - 1) {
            setTimeout(() => {
              setIsProcessing(false)
              
              // Auto-apply the AI effects
              setAudioEffects(prevEffects => 
                prevEffects.map(effect => 
                  effect.active ? { ...effect, active: true } : effect
                )
              )
            }, 500)
          }
        }, 3000 + Math.random() * 2000) // Random completion time
      }, index * 1200) // Staggered start times
    })
  }
  
  // Generate a realistic-looking audio waveform SVG
  const generateWaveformSVG = (complexity: number = 50, intensity: number = 30) => {
    const width = 700;
    const height = 80;
    const points = [];
    
    // Generate random points for the waveform
    for (let i = 0; i < complexity; i++) {
      const x = (width / complexity) * i;
      const randomFactor = Math.random() * 2 - 1; // between -1 and 1
      const y = height / 2 + randomFactor * (intensity * (selectedTrack === 'voiceover' ? 0.7 : 1));
      points.push(`${x},${y}`);
    }
    
    // Connect the points to form a continuous line
    return `M0,${height/2} L${points.join(" L")} L${width},${height/2}`;
  }
  
  // Generate multiple waveforms for a more realistic look
  const waveformPaths = [
    generateWaveformSVG(70, 25),
    generateWaveformSVG(50, 30),
    generateWaveformSVG(100, 20),
  ]
  
  return (
    <ComingSoonOverlay 
      title="Sound Design"
      description="The Sound Design post-production workflow is currently under development. This feature will allow you to enhance audio, apply effects, and manage sound tracks based on your pre-production data."
    >
      <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">Sound Design</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowWaveform(!showWaveform)}
            className={`px-3 py-2 rounded-md ${
              showWaveform 
                ? 'bg-[#e2c376] text-black font-medium' 
                : 'bg-[#36393f] hover:bg-[#4f535a]'
            } transition-colors`}
          >
            Waveform
          </button>
          <button
            onClick={runAudioAnalysis}
            className="px-3 py-2 rounded-md bg-[#e2c376] text-black font-medium hover:bg-[#d4b46a] transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Enhance Audio'}
          </button>
        </div>
      </div>
      
      {/* Main audio workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Audio preview and waveform */}
        <div className="lg:col-span-2 bg-[#36393f] rounded-lg overflow-hidden">
          {/* Audio player + waveform */}
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-300">Audio Preview</h3>
              <div className="flex space-x-2">
                <button className="text-sm px-2 py-1 rounded bg-[#4f535a] hover:bg-[#5f636a] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
                <button className="text-sm px-2 py-1 rounded bg-[#4f535a] hover:bg-[#5f636a] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {showWaveform ? (
              <div className="relative h-32 bg-[#2b2d31] rounded-lg overflow-hidden p-2">
                {/* Audio waveform visualization */}
                <svg width="100%" height="100%" className="text-[#e2c376]">
                  {waveformPaths.map((path, i) => (
                    <path 
                      key={i} 
                      d={path} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={i === 0 ? 2 : 1} 
                      strokeOpacity={i === 0 ? 0.8 : 0.4} 
                      className="transform translate-y-0"
                    />
                  ))}
                  
                  {/* Playhead */}
                  <line 
                    x1="35%" 
                    y1="0" 
                    x2="35%" 
                    y2="100%" 
                    stroke="white" 
                    strokeWidth="1"
                  />
                </svg>
                
                {/* Time markers */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
                  <span>00:00</span>
                  <span>01:30</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-black relative">
                {selectedVideo ? (
                  <img 
                    src={selectedVideo.thumbnail || '/footage-1.jpg'} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <p>Select a video to preview audio</p>
                  </div>
                )}
                
                {/* Audio visualizer overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center space-x-1 px-8">
                    {Array.from({ length: 50 }).map((_, i) => {
                      const height = 5 + Math.random() * 45;
                      return (
                        <div 
                          key={i} 
                          className="w-1.5 bg-[#e2c376]/70"
                          style={{ height: `${height}%` }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Playback controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 items-center">
                  <button className="text-white/80 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <button className="text-white/80 hover:text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                  <button className="text-white/80 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Audio tracks timeline */}
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Tracks</h3>
              <div className="space-y-2">
                {audioTracks.map(track => (
                  <div 
                    key={track.id}
                    className={`flex h-8 rounded-md overflow-hidden cursor-pointer transition-colors ${
                      selectedTrack === track.id 
                        ? 'bg-[#4f535a] border-l-4 border-[#e2c376]' 
                        : 'bg-[#2b2d31] hover:bg-[#3b3e43]'
                    }`}
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    <div className="w-28 shrink-0 px-3 flex items-center border-r border-[#1f2023]">
                      <span className="text-xs truncate">{track.name}</span>
                    </div>
                    <div className="flex-1 relative">
                      {track.id === 'main' && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                          Master Track (Combined Audio)
                        </div>
                      )}
                      {track.id === 'voiceover' && (
                        <div className="absolute left-[20%] top-0 bottom-0 right-[30%] bg-[#5f636a]/40 flex items-center px-2">
                          <span className="text-xs truncate">Voiceover</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Audio tools & effects */}
        <div className="bg-[#36393f] rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-300">Audio Effects & Tools</h3>
              <div className="text-[#e2c376] bg-[#e2c376]/10 px-2 py-0.5 rounded text-xs font-medium">
                AI
              </div>
            </div>
            
            <div className="space-y-3">
              {audioEffects.map(effect => (
                <div 
                  key={effect.id}
                  className={`p-3 rounded-md cursor-pointer border transition-all ${
                    effect.active 
                      ? 'border-[#e2c376] bg-[#e2c376]/5' 
                      : 'border-[#2b2d31] bg-[#2b2d31] hover:bg-[#3b3e43]'
                  }`}
                  onClick={() => handleToggleEffect(effect.id)}
                >
                  <div className="flex items-start">
                    <div className="shrink-0 mr-3">
                      <div className={`p-2 rounded-full ${
                        effect.active ? 'bg-[#e2c376]/20 text-[#e2c376]' : 'bg-[#4f535a] text-gray-300'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={effect.type === 'equalizer' ? 'M4 21h16M4 14h16M4 7h16' : effect.type === 'reverb' ? 'M3 12.3v3.5a2 2 0 0 0 1 1.73l7 4.2c.68.4 1.5.4 2.2 0l7-4.2a2 2 0 0 0 1-1.73V7.2a2 2 0 0 0-1-1.73l-7-4.2c-.72-.4-1.52-.4-2.2 0l-7 4.2a2 2 0 0 0-1 1.73Z' : 'M2 10.6L2 13.4C2 14.28 2.71001 15 3.6 15H7.6C8.48999 15 9.2 14.28 9.2 13.4V10.6C9.2 9.72 8.48999 9 7.6 9H3.6C2.71001 9 2 9.72 2 10.6Z'}></path>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium flex items-center">
                          {effect.name}
                        </h4>
                        <div>
                          <div className="w-10 h-5 rounded-full relative bg-[#4f535a] flex items-center p-0.5">
                            <div className={`w-4 h-4 rounded-full absolute transition-all ${
                              effect.active 
                                ? 'bg-[#e2c376] translate-x-5' 
                                : 'bg-gray-300 translate-x-0'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{effect.type.charAt(0).toUpperCase() + effect.type.slice(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Audio Analysis Panel - Shows when analysis is running */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#36393f] rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#e2c376] flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                  </svg>
                  AI Audio Analysis
                </h3>
                <div className="flex items-center">
                  <div className="text-[#e2c376] bg-[#e2c376]/10 px-2 py-0.5 rounded text-xs font-medium">
                    AI
                  </div>
                  {!isProcessing && (
                    <button 
                      onClick={() => setShowAnalysis(false)}
                      className="ml-2 text-gray-400 hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Audio spectrum visualization */}
                {isProcessing && (
                  <div className="h-16 bg-[#2b2d31] rounded-lg overflow-hidden flex items-end p-2">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const height = 10 + Math.random() * 90;
                      return (
                        <div 
                          key={i} 
                          className="flex-1 mx-0.5 bg-[#e2c376] animate-pulse"
                          style={{ 
                            height: `${height}%`,
                            animationDuration: `${0.5 + Math.random()}s`
                          }}
                        ></div>
                      );
                    })}
                  </div>
                )}
                
                {/* Processing tasks */}
                <div className="space-y-3">
                  {processingTasks.map(task => (
                    <div key={task.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          {task.status === 'pending' && (
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                          {task.status === 'processing' && (
                            <svg className="w-4 h-4 mr-2 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                          )}
                          {task.status === 'completed' && (
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                          <span>{task.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {task.status === 'pending' ? 'Pending' : 
                           task.status === 'processing' ? `${Math.round(task.progress)}%` : 
                           'Complete'}
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-[#2b2d31] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      
                      <p className="text-xs text-gray-400">{task.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Results summary */}
                {!isProcessing && processingTasks.every(task => task.status === 'completed') && (
                  <div className="mt-4 bg-[#2b2d31] rounded-lg p-3">
                    <h4 className="font-medium text-[#e2c376] mb-2">Analysis Results</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Detected and reduced background noise by 85%</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Enhanced dialogue clarity through frequency isolation</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Balanced music and dialogue levels for optimal mix</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <span>Detected slight audio clipping at 1:42 - consider re-recording or additional processing</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-6 mt-6">
        <SoundWaveVisualizer />
        <AudioEqualizerVisualizer />
      </div>
    </div>
    </ComingSoonOverlay>
  )
}

// Add animated sound wave visualization

// Add this component to visualize sound waves and animations
const SoundWaveVisualizer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioSegments, setAudioSegments] = useState<{ id: number, amplitude: number, color: string }[]>([])
  
  useEffect(() => {
    // Initialize sound wave with random values
    const generateInitialSegments = () => {
      const segments = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        amplitude: Math.random() * 0.8 + 0.2, // between 0.2 and 1
        color: '#e7e7e7'
      }))
      setAudioSegments(segments)
    }
    
    generateInitialSegments()
    
    // Animate the segments
    const animateSegments = () => {
      setAudioSegments(prev => 
        prev.map(segment => ({
          ...segment,
          amplitude: Math.max(0.1, Math.min(1, segment.amplitude + (Math.random() * 0.3 - 0.15)))
        }))
      )
    }
    
    const interval = setInterval(animateSegments, 150)
    return () => clearInterval(interval)
  }, [])
  
  const startAnalysis = () => {
    setIsAnalyzing(true)
    
    // Simulate audio analysis with color changes
    setTimeout(() => {
      // Highlight issues with red
      setAudioSegments(prev => {
        const newSegments = [...prev]
        // Mark some random segments as problematic (red)
        ;[5, 12, 25, 38].forEach(index => {
          if (newSegments[index]) {
            newSegments[index] = { ...newSegments[index], color: '#e05858' }
          }
        })
        return newSegments
      })
      
      // After some time, show enhancement in gold
      setTimeout(() => {
        setAudioSegments(prev => {
          return prev.map(segment => ({
            ...segment,
            color: segment.color === '#e05858' ? '#e2c376' : segment.color
          }))
        })
        
        setTimeout(() => {
          setIsAnalyzing(false)
        }, 1000)
      }, 2000)
    }, 1500)
  }
  
  return (
    <div className="border border-[#e7e7e7]/10 rounded-xl overflow-hidden">
      <div className="bg-[#1e1f22] p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Audio Waveform Analysis</h3>
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className={`px-3 py-1.5 rounded text-sm ${
              isAnalyzing
                ? 'bg-[#2a2a2a] text-[#e7e7e7]/50 cursor-not-allowed'
                : 'bg-[#e2c37620] text-[#e2c376] hover:bg-[#e2c37630]'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Audio'}
          </button>
        </div>
        
        <div className="h-32 bg-[#2a2a2a] rounded-lg p-4 mb-4 relative">
          {/* Sound wave visualization */}
          <div className="flex items-center justify-between h-full gap-[2px]">
            {audioSegments.map(segment => (
              <motion.div
                key={segment.id}
                initial={{ height: `${segment.amplitude * 100}%` }}
                animate={{ 
                  height: `${segment.amplitude * 100}%`,
                  backgroundColor: segment.color 
                }}
                transition={{ duration: 0.2 }}
                className="w-full bg-current rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
            ))}
          </div>
          
          {/* Processing overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e2c37620] mb-2">
                  <span className="text-[#e2c376] text-lg">AI</span>
                </div>
                <div className="text-sm text-center mb-1">Analyzing audio quality</div>
                <div className="text-xs text-[#e7e7e7]/70">Detecting noise and distortion...</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="px-2 py-1 bg-[#2a2a2a] rounded-lg text-xs text-[#e7e7e7]/70">
            Background noise: Low
          </div>
          <div className="px-2 py-1 bg-[#2a2a2a] rounded-lg text-xs text-[#e7e7e7]/70">
            Clarity: 92%
          </div>
          <div className="px-2 py-1 bg-[#2a2a2a] rounded-lg text-xs text-[#e7e7e7]/70">
            Enhanced: Yes
          </div>
          <div className="px-2 py-1 flex items-center rounded-lg text-xs">
            <span className="text-[#e2c376] bg-[#e2c37620] py-0.5 px-1 rounded mr-1">AI</span>
            <span className="text-[#e7e7e7]/70">Auto-processed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add animated equalizer component
const AudioEqualizerVisualizer = () => {
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [eqSettings, setEqSettings] = useState([
    { freq: '60Hz', value: 0 },
    { freq: '150Hz', value: 0 },
    { freq: '400Hz', value: 0 },
    { freq: '1kHz', value: 0 },
    { freq: '2.5kHz', value: 0 },
    { freq: '6kHz', value: 0 },
    { freq: '12kHz', value: 0 },
  ])
  
  const applyEQPreset = () => {
    setIsAdjusting(true)
    
    // Simulate AI adjusting EQ settings over time
    setTimeout(() => {
      setEqSettings([
        { freq: '60Hz', value: 2 },
        { freq: '150Hz', value: 1 },
        { freq: '400Hz', value: 0 },
        { freq: '1kHz', value: 3 },
        { freq: '2.5kHz', value: 4 },
        { freq: '6kHz', value: 1 },
        { freq: '12kHz', value: -1 },
      ])
      
      setTimeout(() => {
        setIsAdjusting(false)
      }, 1000)
    }, 1500)
  }
  
  return (
    <div className="border border-[#e7e7e7]/10 rounded-xl overflow-hidden">
      <div className="bg-[#1e1f22] p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Voice EQ Enhancement</h3>
          <button
            onClick={applyEQPreset}
            disabled={isAdjusting}
            className={`px-3 py-1.5 rounded text-sm ${
              isAdjusting
                ? 'bg-[#2a2a2a] text-[#e7e7e7]/50 cursor-not-allowed'
                : 'bg-[#e2c37620] text-[#e2c376] hover:bg-[#e2c37630]'
            }`}
          >
            {isAdjusting ? 'Optimizing...' : 'Auto-Optimize EQ'}
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-4">
          {eqSettings.map((band, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-32 w-full bg-[#2a2a2a] rounded-lg relative flex flex-col items-center justify-center mb-2">
                {/* The slider visualization */}
                <div className="h-24 w-1 bg-[#3a3a3a] rounded-full relative flex items-center justify-center">
                  <motion.div
                    className="absolute w-4 h-4 rounded-full bg-[#e2c376] shadow-md flex items-center justify-center"
                    initial={{ top: '50%' }}
                    animate={{ 
                      top: `${50 - (band.value * 10)}%`
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    {isAdjusting && (
                      <motion.div
                        className="absolute w-8 h-8 rounded-full bg-[#e2c376]/20"
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 1.5
                        }}
                      />
                    )}
                  </motion.div>
                </div>
                
                {/* Value indicator */}
                <div className="absolute bottom-2 text-xs font-mono text-[#e7e7e7]/70">
                  {band.value > 0 ? `+${band.value}` : band.value}
                </div>
              </div>
              <div className="text-xs text-[#e7e7e7]/70">
                {band.freq}
              </div>
            </div>
          ))}
        </div>
        
        {isAdjusting && (
          <div className="mb-4 p-2 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-[#e7e7e7]/70">
              <svg className="animate-spin h-3 w-3 text-[#e2c376]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>AI is optimizing audio EQ for voice clarity...</span>
            </div>
          </div>
        )}
        
        <div className="p-3 bg-[#e2c37610] border border-[#e2c37620] rounded-lg text-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs px-1.5 py-0.5 bg-[#e2c376] text-black rounded font-medium">AI</span>
            <span className="font-medium">Voice Enhancement Applied</span>
          </div>
          <p className="text-xs text-[#e7e7e7]/80">
            AI has analyzed your dialogue audio and applied optimal equalization settings to enhance voice clarity while reducing background noise. The mid-range frequencies have been boosted to improve dialogue intelligibility.
          </p>
        </div>
      </div>
    </div>
  )
}