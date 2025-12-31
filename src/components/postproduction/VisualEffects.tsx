'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideo } from '@/context/VideoContext'
import { loadPostProductionData } from '@/services/postproduction-data-loader'
import { generateSceneIntelligence } from '@/services/scene-intelligence-generator'
import { mapShotsToStoryboards } from '@/services/postproduction-shot-mapper'
import { useAuth } from '@/context/AuthContext'
import { StoryboardReferencePanel } from './StoryboardReferencePanel'
import { ComingSoonOverlay } from './ComingSoonOverlay'
import type { PostProductionDataContext } from '@/services/postproduction-data-loader'
import type { SceneIntelligence } from '@/services/scene-intelligence-generator'

interface VisualEffectsProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

interface EffectPreset {
  id: string;
  name: string;
  description: string;
  category: 'color' | 'stylistic' | 'blur' | 'sharpen' | 'other';
  thumbnail: string;
  cssFilter: string;
}

export function VisualEffects({ storyBibleId, episodeNumber, arcIndex, arcEpisodes }: VisualEffectsProps) {
  const { user } = useAuth()
  const { selectedVideo } = useVideo()
  
  // Post-production data state
  const [postProductionData, setPostProductionData] = useState<PostProductionDataContext | null>(null)
  const [sceneIntelligence, setSceneIntelligence] = useState<Record<number, SceneIntelligence>>({})
  const [selectedScene, setSelectedScene] = useState<number | null>(null)
  const [showReel, setShowReel] = useState<boolean>(false)
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [splitView, setSplitView] = useState<boolean>(false)
  const [splitPosition, setSplitPosition] = useState<number>(50)
  const [intensity, setIntensity] = useState<number>(100)
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false)
  
  // Load post-production data on mount
  useEffect(() => {
    if (storyBibleId && episodeNumber) {
      loadPostProductionDataForComponent()
    }
  }, [storyBibleId, episodeNumber, user?.id])

  const loadPostProductionDataForComponent = async () => {
    if (!storyBibleId || !episodeNumber) return
    
    try {
      const data = await loadPostProductionData(storyBibleId, episodeNumber, user?.id)
      if (data) {
        setPostProductionData(data)
        
        // Generate scene intelligence for VFX planning
        if (data.shotList && data.storyboards) {
          const shotMappings = mapShotsToStoryboards(data.shotList, data.storyboards)
          const intelligence: Record<number, SceneIntelligence> = {}
          
          const sceneNumbers = new Set(shotMappings.map(m => m.sceneNumber))
          for (const sceneNum of sceneNumbers) {
            const sceneIntel = await generateSceneIntelligence(sceneNum, data, shotMappings)
            if (sceneIntel) {
              intelligence[sceneNum] = sceneIntel
            }
          }
          
          setSceneIntelligence(intelligence)
          
          // Select first scene with VFX needs
          const sceneWithVFX = Object.values(intelligence).find(s => 
            s.vfx.shotsNeedingVFX.length > 0 || s.vfx.propsToRemove.length > 0
          )
          if (sceneWithVFX) {
            setSelectedScene(sceneWithVFX.sceneNumber)
          }
        }
      }
    } catch (error) {
      console.error('Error loading post-production data:', error)
    }
  }
  
  const effectPresets: EffectPreset[] = [
    {
      id: 'normal',
      name: 'Normal',
      description: 'No effects applied',
      category: 'other',
      thumbnail: '/effects/normal.jpg',
      cssFilter: 'none'
    },
    {
      id: 'warm',
      name: 'Warm',
      description: 'Adds warm orange tones',
      category: 'color',
      thumbnail: '/effects/warm.jpg',
      cssFilter: 'sepia(0.3) saturate(1.3) hue-rotate(-10deg)'
    },
    {
      id: 'cool',
      name: 'Cool',
      description: 'Adds cool blue tones',
      category: 'color',
      thumbnail: '/effects/cool.jpg',
      cssFilter: 'saturate(1.2) hue-rotate(10deg) brightness(1.1)'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Classic film look',
      category: 'stylistic',
      thumbnail: '/effects/vintage.jpg',
      cssFilter: 'sepia(0.6) contrast(0.9) saturate(0.8)'
    },
    {
      id: 'noir',
      name: 'Noir',
      description: 'Black and white film noir',
      category: 'stylistic',
      thumbnail: '/effects/noir.jpg',
      cssFilter: 'grayscale(1) contrast(1.3) brightness(0.8)'
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Hollywood film look',
      category: 'color',
      thumbnail: '/effects/cinematic.jpg',
      cssFilter: 'contrast(1.1) saturate(1.1) brightness(0.9)'
    },
    {
      id: 'dreamy',
      name: 'Dreamy',
      description: 'Soft dreamy effect',
      category: 'blur',
      thumbnail: '/effects/dreamy.jpg',
      cssFilter: 'brightness(1.1) contrast(0.9) saturate(1.2) blur(1px)'
    },
    {
      id: 'sharp',
      name: 'Sharp',
      description: 'Enhanced details',
      category: 'sharpen',
      thumbnail: '/effects/sharp.jpg',
      cssFilter: 'contrast(1.3) brightness(1.05) saturate(1.05)'
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      description: 'Enhanced colors',
      category: 'color',
      thumbnail: '/effects/vibrant.jpg',
      cssFilter: 'saturate(1.8) contrast(1.15)'
    },
    {
      id: 'muted',
      name: 'Muted',
      description: 'Subtle desaturated look',
      category: 'color',
      thumbnail: '/effects/muted.jpg',
      cssFilter: 'saturate(0.7) brightness(1.05)'
    },
    {
      id: 'ai-enhanced',
      name: 'AI Enhanced',
      description: 'AI-optimized color correction',
      category: 'other',
      thumbnail: '/effects/ai-enhanced.jpg',
      cssFilter: 'contrast(1.05) saturate(1.05) brightness(1.02)'
    }
  ]
  
  const categories = [
    { id: 'all', name: 'All Effects' },
    { id: 'color', name: 'Color Correction' },
    { id: 'stylistic', name: 'Stylistic' },
    { id: 'blur', name: 'Blur & Softening' },
    { id: 'sharpen', name: 'Sharpening' },
    { id: 'other', name: 'Other' }
  ]
  
  // Set initial effect
  useEffect(() => {
    setSelectedEffect('normal')
  }, [])
  
  // Find the current effect preset
  const currentEffect = selectedEffect 
    ? effectPresets.find(e => e.id === selectedEffect) 
    : effectPresets[0]
  
  // Calculate the CSS filter based on intensity
  const getFilterStyle = (cssFilter: string, intensity: number): string => {
    if (cssFilter === 'none') return 'none'
    
    // For intensity other than 100%, we need to parse and adjust the filter values
    const filterParts = cssFilter.split(' ')
    return filterParts.map(part => {
      // Extract function name and value
      const matches = part.match(/([\w-]+)\(([\d.]+)([^)]*)\)/)
      if (!matches) return part
      
      const [_, funcName, value, unit] = matches
      // Adjust the value based on intensity (as percentage)
      const adjustedValue = Number(value) * (intensity / 100)
      
      // Rebuild the filter function
      return `${funcName}(${adjustedValue}${unit})`
    }).join(' ')
  }
  
  // Toggle play/pause
  const togglePlayPause = (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return
    
    if (previewPlaying) {
      videoElement.pause()
    } else {
      videoElement.play()
    }
    setPreviewPlaying(!previewPlaying)
  }
  
  // Handle split slider drag
  const handleSplitDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!splitView) return
    
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newPosition = (x / rect.width) * 100
    
    // Constrain between 10% and 90%
    setSplitPosition(Math.max(10, Math.min(90, newPosition)))
  }
  
  // Render VFX requirements panel
  const renderVFXRequirements = () => {
    if (!postProductionData || Object.keys(sceneIntelligence).length === 0) {
      return null
    }

    const scenesWithVFX = Object.values(sceneIntelligence).filter(s => 
      s.vfx.shotsNeedingVFX.length > 0 || s.vfx.propsToRemove.length > 0
    )

    if (scenesWithVFX.length === 0) {
      return (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-400">No VFX requirements identified from pre-production data.</div>
        </div>
      )
    }

    const shotMappings = postProductionData.shotList && postProductionData.storyboards
      ? mapShotsToStoryboards(postProductionData.shotList, postProductionData.storyboards)
      : []

    return (
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#e2c376]">VFX Requirements from Pre-Production</h3>
        {scenesWithVFX.map(scene => (
          <div key={scene.sceneNumber} className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-white">
                Scene {scene.sceneNumber}
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${
                scene.vfx.complexity === 'very-complex' ? 'bg-red-500/20 text-red-400' :
                scene.vfx.complexity === 'complex' ? 'bg-orange-500/20 text-orange-400' :
                scene.vfx.complexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {scene.vfx.complexity.toUpperCase()}
              </span>
            </div>
            
            {scene.vfx.shotsNeedingVFX.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Shots Requiring VFX ({scene.vfx.shotsNeedingVFX.length})
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {scene.vfx.shotsNeedingVFX.map(shot => {
                    const mapping = shotMappings.find(m => 
                      m.sceneNumber === scene.sceneNumber && m.shotNumber === shot.shotNumber
                    )
                    return (
                      <StoryboardReferencePanel
                        key={shot.shotId || shot.shotNumber}
                        storyboardFrame={mapping?.storyboardFrame || null}
                        shotNumber={shot.shotNumber}
                        sceneNumber={scene.sceneNumber}
                      />
                    )
                  })}
                </div>
              </div>
            )}
            
            {scene.vfx.propsToRemove.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">
                  Props to Remove/Replace ({scene.vfx.propsToRemove.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {scene.vfx.propsToRemove.map((prop, index) => (
                    <span
                      key={index}
                      className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                    >
                      {typeof prop === 'string' ? prop : prop.prop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <ComingSoonOverlay 
      title="Visual Effects"
      description="The Visual Effects post-production workflow is currently under development. This feature will allow you to apply and manage VFX based on your pre-production data."
    >
      <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">Visual Effects</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSplitView(!splitView)}
            className={`px-3 py-2 rounded-md ${
              splitView 
                ? 'bg-[#e2c376] text-black font-medium' 
                : 'bg-[#36393f] hover:bg-[#4f535a]'
            } transition-colors`}
          >
            Before/After
          </button>
          <button
            onClick={() => setShowReel(!showReel)}
            className={`px-3 py-2 rounded-md ${
              showReel 
                ? 'bg-[#e2c376] text-black font-medium' 
                : 'bg-[#36393f] hover:bg-[#4f535a]'
            } transition-colors`}
          >
            Effect Reel
          </button>
        </div>
      </div>
      
      {/* VFX Requirements Panel */}
      {renderVFXRequirements()}
      
      {/* Main preview area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video preview with effects */}
        <div 
          className="lg:col-span-2 bg-[#36393f] rounded-lg overflow-hidden relative"
          onMouseMove={splitView ? handleSplitDrag : undefined}
        >
          <div className="aspect-video bg-black relative">
            {selectedVideo ? (
              <>
                {/* Original video (for split view) */}
                {splitView && (
                  <div 
                    className="absolute top-0 left-0 h-full z-10 overflow-hidden"
                    style={{ width: `${splitPosition}%` }}
                  >
                    <video
                      src={selectedVideo.url}
                      poster={selectedVideo.thumbnail || '/footage-1.jpg'}
                      className="w-auto h-full object-cover"
                      style={{ minWidth: '100%' }}
                      onPlay={() => setPreviewPlaying(true)}
                      onPause={() => setPreviewPlaying(false)}
                      onClick={(e) => togglePlayPause(e.currentTarget)}
                    />
                    <div className="absolute top-0 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded m-2">
                      Before
                    </div>
                  </div>
                )}
                
                {/* Filtered video */}
                <div 
                  className={`absolute top-0 ${splitView ? 'left-0' : 'inset-0'} h-full`}
                  style={splitView ? { 
                    clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`,
                    width: '100%'
                  } : {}}
                >
                  <video
                    src={selectedVideo.url}
                    poster={selectedVideo.thumbnail || '/footage-1.jpg'}
                    className="w-full h-full object-cover"
                    style={{ 
                      filter: currentEffect ? getFilterStyle(currentEffect.cssFilter, intensity) : 'none'
                    }}
                    onPlay={() => setPreviewPlaying(true)}
                    onPause={() => setPreviewPlaying(false)}
                    onClick={(e) => togglePlayPause(e.currentTarget)}
                  />
                  {splitView && (
                    <div className="absolute top-0 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded m-2">
                      After
                    </div>
                  )}
                </div>
                
                {/* Split line */}
                {splitView && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white z-20 cursor-ew-resize"
                    style={{ left: `${splitPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-30">
                  <div className="flex flex-col space-y-2">
                    <div className="w-full bg-gray-700/50 h-1 rounded-full overflow-hidden">
                      <div className="bg-[#e2c376] h-full" style={{ width: '35%' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span>00:35</span>
                      <div className="flex space-x-4">
                        <button className="hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9l-6 6m0 0l6 6m-6-6h18"></path>
                          </svg>
                        </button>
                        <button 
                          className="hover:text-white"
                          onClick={() => {
                            const videos = document.querySelectorAll('video')
                            videos.forEach(video => {
                              togglePlayPause(video)
                            })
                          }}
                        >
                          {previewPlaying ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                        </button>
                        <button className="hover:text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </button>
                      </div>
                      <span>01:30</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <p>Select a video clip to preview</p>
              </div>
            )}
          </div>
          
          {/* Intensity slider */}
          {selectedEffect && selectedEffect !== 'normal' && (
            <div className="p-3 border-t border-[#2b2d31]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Effect Intensity</span>
                <span className="text-sm text-gray-400">{intensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2b2d31] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
        
        {/* Effects panel */}
        <div className="bg-[#36393f] rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-300">Effect Presets</h3>
              <div className="text-[#e2c376] bg-[#e2c376]/10 px-2 py-0.5 rounded text-xs font-medium">
                AI
              </div>
            </div>
            
            {/* Category filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-[#e2c376] text-black' 
                      : 'bg-[#2b2d31] hover:bg-[#4f535a]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Effect presets grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {effectPresets
                .filter(effect => selectedCategory === 'all' || effect.category === selectedCategory)
                .map(effect => (
                  <motion.div
                    key={effect.id}
                    className={`rounded-md overflow-hidden cursor-pointer ${
                      selectedEffect === effect.id ? 'ring-2 ring-[#e2c376]' : ''
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedEffect(effect.id)}
                  >
                    <div className="aspect-video bg-[#2b2d31] relative">
                      <div 
                        className="w-full h-full" 
                        style={{
                          backgroundImage: "url('/footage-1.jpg')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: getFilterStyle(effect.cssFilter, intensity)
                        }}
                      ></div>
                      {effect.id === 'ai-enhanced' && (
                        <div className="absolute top-2 right-2 bg-[#e2c376]/80 text-black text-xs px-1.5 py-0.5 rounded">
                          AI
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-[#2b2d31]">
                      <div className="text-sm font-medium truncate">{effect.name}</div>
                      <div className="text-xs text-gray-400 truncate">{effect.description}</div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Effect reel animation - shows different effects applied to the video in succession */}
      {showReel && selectedVideo && (
        <div className="bg-[#36393f] rounded-lg overflow-hidden p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-300">Effect Reel Preview</h3>
            <div className="text-[#e2c376] bg-[#e2c376]/10 px-2 py-0.5 rounded text-xs font-medium">
              AI Generated
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {effectPresets.slice(0, 5).map((effect, index) => (
              <div key={effect.id} className="space-y-1">
                <div className="aspect-video bg-[#2b2d31] rounded overflow-hidden">
                  <div 
                    className="w-full h-full" 
                    style={{
                      backgroundImage: `url(${selectedVideo.thumbnail || '/footage-1.jpg'})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: getFilterStyle(effect.cssFilter, intensity)
                    }}
                  ></div>
                </div>
                <p className="text-xs text-center text-gray-400">{effect.name}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              className="px-3 py-1.5 rounded-md bg-[#e2c376] text-black text-sm font-medium hover:bg-[#d4b46a] transition-colors"
            >
              Generate AI Effect Recommendations
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <BackgroundManipulationPreview />
      </div>
    </div>
    </ComingSoonOverlay>
  )
}

// Add this component to visualize the background change effect

const BackgroundManipulationPreview = () => {
  const [activeEffect, setActiveEffect] = useState<string>('green-screen')
  const [isApplying, setIsApplying] = useState<boolean>(false)
  const [applicationProgress, setApplicationProgress] = useState<number>(0)
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false)
  
  const effectOptions = [
    { id: 'green-screen', name: 'Green Screen', icon: '🎬' },
    { id: 'background-blur', name: 'Background Blur', icon: '🔍' },
    { id: 'scene-matching', name: 'Scene Matching', icon: '🖼️' },
    { id: 'ai-background', name: 'AI Background Generation', icon: '🤖' }
  ]
  
  const handleEffectChange = (effectId: string) => {
    setActiveEffect(effectId)
  }
  
  const applyEffect = () => {
    setIsApplying(true)
    setApplicationProgress(0)
    
    const interval = setInterval(() => {
      setApplicationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsApplying(false)
          setIsPreviewVisible(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }
  
  return (
    <div className="border border-[#e7e7e7]/10 rounded-xl overflow-hidden">
      <div className="bg-[#1e1f22] p-4">
        <h3 className="font-semibold mb-4">Background Manipulation</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {effectOptions.map(effect => (
            <button
              key={effect.id}
              onClick={() => handleEffectChange(effect.id)}
              className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ${
                activeEffect === effect.id
                  ? 'bg-[#e2c37620] text-[#e2c376] border border-[#e2c37640]'
                  : 'bg-[#2a2a2a] text-[#e7e7e7]/70 border border-transparent hover:border-[#e7e7e7]/20'
              }`}
            >
              <span>{effect.icon}</span>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* Original video layer */}
            <div className="absolute inset-0 z-10">
              <img 
                src="/footage-1.jpg" 
                className="w-full h-full object-cover" 
                alt="Original footage"
              />
            </div>
            
            {/* Effect preview layer */}
            {isPreviewVisible && (
              <div className="absolute inset-0 z-20">
                {activeEffect === 'green-screen' && (
                  <div className="relative w-full h-full">
                    <img 
                      src="/footage-1.jpg" 
                      className="w-full h-full object-cover opacity-80" 
                      alt="Actor footage"
                    />
                    <div className="absolute inset-0 bg-[url('/bg-replacement.jpg')] bg-cover bg-center mix-blend-multiply opacity-90"></div>
                  </div>
                )}
                
                {activeEffect === 'background-blur' && (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-[url('/footage-1.jpg')] bg-cover bg-center blur-md"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1/2 h-3/4 bg-[url('/character-cutout.png')] bg-contain bg-center bg-no-repeat"></div>
                    </div>
                  </div>
                )}
                
                {activeEffect === 'scene-matching' && (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-[url('/scene-match-bg.jpg')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 flex items-end justify-center">
                      <div className="w-1/3 h-2/3 bg-[url('/character-cutout.png')] bg-contain bg-bottom bg-no-repeat"></div>
                    </div>
                  </div>
                )}
                
                {activeEffect === 'ai-background' && (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f36] to-[#0f0a15]"></div>
                    <div className="absolute inset-0">
                      <div className="absolute top-[10%] left-[20%] w-8 h-8 rounded-full bg-purple-300 blur-md opacity-40"></div>
                      <div className="absolute top-[30%] right-[30%] w-12 h-12 rounded-full bg-blue-300 blur-md opacity-30"></div>
                      <div className="absolute bottom-[20%] left-[40%] w-10 h-10 rounded-full bg-pink-300 blur-md opacity-30"></div>
                      <div className="absolute inset-0 bg-[url('/ai-particles.png')] bg-cover opacity-40"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1/2 h-3/4 bg-[url('/character-cutout.png')] bg-contain bg-center bg-no-repeat"></div>
                    </div>
                  </div>
                )}
                
                {/* AI badge */}
                <div className="absolute top-2 right-2 z-30 bg-[#e2c37680] text-black text-xs font-bold px-1.5 py-0.5 rounded">
                  AI
                </div>
              </div>
            )}
            
            {/* Processing overlay */}
            {isApplying && (
              <div className="absolute inset-0 z-30 bg-black/50 flex flex-col items-center justify-center">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#e2c37620] mb-2">
                    <span className="text-[#e2c376] text-lg">AI</span>
                  </div>
                  <div className="text-sm font-medium">Processing {activeEffect.replace(/-/g, ' ')}</div>
                </div>
                
                <div className="w-3/4 h-2 bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-[#e2c376] transition-all" 
                    style={{ width: `${applicationProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#e7e7e7]/70">
                  Analyzing scene edges and depth...
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-[#e7e7e7]/70">
                Auto mask quality: High
              </div>
              <div className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-[#e7e7e7]/70">
                Edge detection: Enhanced
              </div>
            </div>
            
            <button
              onClick={applyEffect}
              disabled={isApplying}
              className={`px-4 py-1.5 rounded text-sm font-medium ${
                isApplying
                  ? 'bg-[#2a2a2a] text-[#e7e7e7]/40 cursor-not-allowed'
                  : 'bg-[#e2c37620] text-[#e2c376] hover:bg-[#e2c37630]'
              }`}
            >
              {isApplying ? 'Processing...' : 'Apply Effect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 