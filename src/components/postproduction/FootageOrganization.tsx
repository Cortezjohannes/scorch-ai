'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useVideo } from '@/context/VideoContext'
import { useAuth } from '@/context/AuthContext'
import { getEpisodePreProduction } from '@/services/preproduction-firestore'
import { getStoryBible } from '@/services/story-bible-service'
import { getEpisodeRangeForArc } from '@/services/preproduction-firestore'

interface FootageOrganizationProps {
  storyBibleId?: string
  episodeNumber?: number
  arcIndex?: number | null
  arcEpisodes?: number[]
}

interface SceneData {
  sceneNumber: number
  sceneTitle?: string
  location?: string
  storyboardFrames: Array<{
    id: string
    shotNumber: number
    frameImage?: string
    description?: string
    cameraAngle?: string
  }>
}

interface EpisodeData {
  episodeNumber: number
  episodeTitle?: string
  scenes: SceneData[]
}

export function FootageOrganization({ 
  storyBibleId, 
  episodeNumber, 
  arcIndex, 
  arcEpisodes 
}: FootageOrganizationProps) {
  const { user } = useAuth()
  const { uploadedVideos, addVideos, selectedVideo, setSelectedVideo, updateVideoMetadata } = useVideo()
  const [isLoading, setIsLoading] = useState(true)
  const [episodesData, setEpisodesData] = useState<Map<number, EpisodeData>>(new Map())
  const [availableEpisodes, setAvailableEpisodes] = useState<number[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<number>(episodeNumber || (arcEpisodes && arcEpisodes.length > 0 ? arcEpisodes[0] : 1))
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({})
  const [uploadingScenes, setUploadingScenes] = useState<Record<string, boolean>>({})
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set())

  // Determine available episodes
  useEffect(() => {
    const determineEpisodes = async () => {
      if (!storyBibleId || !user?.id) return

      let episodes: number[] = []
      
      if (arcIndex !== null && arcIndex !== undefined && arcEpisodes && arcEpisodes.length > 0) {
        episodes = arcEpisodes
      } else if (episodeNumber !== undefined && episodeNumber > 0) {
        episodes = [episodeNumber]
      } else {
        const storyBible = await getStoryBible(storyBibleId, user.id)
        if (storyBible && arcIndex !== null && arcIndex !== undefined) {
          episodes = getEpisodeRangeForArc(storyBible, arcIndex)
        }
      }

      if (episodes.length > 0) {
        setAvailableEpisodes(episodes)
        const targetEpisode = (episodeNumber !== undefined && episodeNumber > 0) ? episodeNumber : episodes[0]
        if (targetEpisode !== currentEpisode) {
          setCurrentEpisode(targetEpisode)
        }
      }
    }

    determineEpisodes()
  }, [storyBibleId, episodeNumber, arcIndex, arcEpisodes, user?.id, currentEpisode])

  // Load pre-production data for current episode
  useEffect(() => {
    const loadEpisodeData = async () => {
      if (!storyBibleId || !currentEpisode || !user?.id) {
        setIsLoading(false)
        return
      }

      if (episodesData.has(currentEpisode)) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const preProdData = await getEpisodePreProduction(user.id, storyBibleId, currentEpisode)
        
        if (!preProdData) {
          console.warn(`No pre-production data found for episode ${currentEpisode}`)
          setIsLoading(false)
          return
        }

        const sceneMap = new Map<number, SceneData>()

        if (preProdData.storyboards?.scenes) {
          preProdData.storyboards.scenes.forEach((scene: any) => {
            const sceneNum = scene.sceneNumber || scene.number || 0
            sceneMap.set(sceneNum, {
              sceneNumber: sceneNum,
              storyboardFrames: (scene.frames || []).map((frame: any) => ({
                id: frame.id || frame.frameId || '',
                shotNumber: frame.shotNumber || frame.number || 0,
                frameImage: frame.frameImage,
                description: frame.description || frame.notes,
                cameraAngle: frame.cameraAngle || frame.angle,
              }))
            })
          })
        }

        if (preProdData.shotList?.scenes) {
          preProdData.shotList.scenes.forEach((shotScene: any) => {
            const sceneNum = shotScene.sceneNumber || shotScene.number || 0
            const existing = sceneMap.get(sceneNum)
            
            if (existing) {
              existing.sceneTitle = shotScene.sceneTitle || shotScene.title || existing.sceneTitle
              existing.location = shotScene.location || existing.location
            } else {
              sceneMap.set(sceneNum, {
                sceneNumber: sceneNum,
                sceneTitle: shotScene.sceneTitle || shotScene.title,
                location: shotScene.location,
                storyboardFrames: []
              })
            }
          })
        }

        const scenesArray = Array.from(sceneMap.values())
          .sort((a, b) => a.sceneNumber - b.sceneNumber)

        const episodeData: EpisodeData = {
          episodeNumber: currentEpisode,
          episodeTitle: preProdData.episodeTitle,
          scenes: scenesArray
        }

        setEpisodesData(prev => {
          const newMap = new Map(prev)
          newMap.set(currentEpisode, episodeData)
          return newMap
        })

        // Auto-expand first scene
        if (scenesArray.length > 0) {
          setExpandedScenes(prev => new Set([...prev, scenesArray[0].sceneNumber]))
        }
      } catch (error) {
        console.error(`Error loading episode ${currentEpisode} data:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisodeData()
  }, [storyBibleId, currentEpisode, user?.id, episodesData])

  useEffect(() => {
    if (episodeNumber !== undefined && episodeNumber > 0 && episodeNumber !== currentEpisode) {
      setCurrentEpisode(episodeNumber)
    } else if (!episodeNumber && arcEpisodes && arcEpisodes.length > 0 && arcEpisodes[0] !== currentEpisode) {
      setCurrentEpisode(arcEpisodes[0])
    }
  }, [episodeNumber, arcEpisodes, currentEpisode])

  const toggleScene = (sceneNumber: number) => {
    setExpandedScenes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sceneNumber)) {
        newSet.delete(sceneNumber)
      } else {
        newSet.add(sceneNumber)
      }
      return newSet
    })
  }

  const handleSceneFileUpload = async (sceneNumber: number, files: File[]) => {
    if (!files.length) return

    const sceneKey = `${currentEpisode}-${sceneNumber}`
    setUploadingScenes(prev => ({ ...prev, [sceneKey]: true }))

    try {
      addVideos(files)

      const currentEpisodeData = episodesData.get(currentEpisode)
      const scene = currentEpisodeData?.scenes.find(s => s.sceneNumber === sceneNumber)
      const sceneTitle = scene?.sceneTitle
      const matchedSceneName = `Episode ${currentEpisode} - Scene ${sceneNumber}${sceneTitle ? ` - ${sceneTitle}` : ''}`

      setTimeout(async () => {
        const recentVideos = uploadedVideos.filter(v => {
          const uploadTime = new Date(v.uploadDate).getTime()
          const now = Date.now()
          return (now - uploadTime) < 5000
        })

        for (const video of recentVideos) {
          try {
            await updateVideoMetadata(video.id, {
              metadata: {
                ...video.metadata,
                episodeNumber: currentEpisode,
                sceneNumber,
                matchedSceneName
              }
            })
          } catch (err) {
            console.error('Error updating video metadata:', err)
          }
        }
      }, 2000)
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploadingScenes(prev => ({ ...prev, [sceneKey]: false }))
    }
  }

  const handleDrag = (e: React.DragEvent, sceneNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    const sceneKey = `${currentEpisode}-${sceneNumber}`

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [sceneKey]: true }))
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [sceneKey]: false }))
    }
  }

  const handleDrop = (e: React.DragEvent, sceneNumber: number) => {
    e.preventDefault()
    e.stopPropagation()
    const sceneKey = `${currentEpisode}-${sceneNumber}`
    setDragActive(prev => ({ ...prev, [sceneKey]: false }))

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      handleSceneFileUpload(sceneNumber, filesArray)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, sceneNumber: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      handleSceneFileUpload(sceneNumber, filesArray)
      e.target.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const currentEpisodeData = episodesData.get(currentEpisode)
  const currentScenes = currentEpisodeData?.scenes || []

  if (isLoading && !currentEpisodeData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mb-4"></div>
          <p className="text-gray-400">Loading episode {currentEpisode} data...</p>
        </div>
      </div>
    )
  }

  if (!currentEpisodeData || currentScenes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No pre-production data found</p>
        <p className="text-gray-500 text-sm">
          Please complete pre-production (storyboards/shot list) for episode {currentEpisode} first.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Make sure storyboards are generated in the Storyboards tab.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header - Simplified */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-[#10B981]">Footage Organization</h2>
        <p className="text-sm text-gray-400">
          {currentScenes.length} scene{currentScenes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Scene sections - Collapsible */}
      <div className="space-y-3">
        {currentScenes.map((scene, sceneIndex) => {
          const sceneKey = `${currentEpisode}-${scene.sceneNumber}`
          const sceneFiles = uploadedVideos.filter(v => 
            v.metadata?.episodeNumber === currentEpisode && 
            v.metadata?.sceneNumber === scene.sceneNumber
          )
          const isExpanded = expandedScenes.has(scene.sceneNumber)

          return (
            <motion.div
              key={sceneKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: sceneIndex * 0.05 }}
              className="bg-[#121212] border border-[#10B981]/20 rounded-xl overflow-hidden hover:border-[#10B981]/40 transition-all"
            >
              {/* Collapsible Scene Header */}
              <button
                onClick={() => toggleScene(scene.sceneNumber)}
                className="w-full p-5 flex items-center justify-between hover:bg-[#1a1a1a]/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
                    <span className="text-[#10B981] font-bold text-lg">{scene.sceneNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {scene.sceneTitle || `Scene ${scene.sceneNumber}`}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {scene.location && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {scene.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {scene.storyboardFrames.length} frame{scene.storyboardFrames.length !== 1 ? 's' : ''}
                      </span>
                      {sceneFiles.length > 0 && (
                        <span className="flex items-center gap-1.5 text-[#10B981]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {sceneFiles.length} file{sceneFiles.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 space-y-6 border-t border-[#10B981]/10">
                      {/* Storyboard Frames - Larger with more context */}
                      {scene.storyboardFrames.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#10B981] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Storyboard Reference
                          </h4>
                          <div className="overflow-x-auto pb-4 -mx-2 px-2">
                            <div className="flex gap-6 min-w-max">
                              {scene.storyboardFrames.map((frame, frameIndex) => (
                                <motion.div
                                  key={frame.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2, delay: frameIndex * 0.05 }}
                                  className="flex-shrink-0 w-72 bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#10B981]/20 hover:border-[#10B981]/40 transition-all group"
                                >
                                  {frame.frameImage ? (
                                    <div className="relative">
                                      <img
                                        src={frame.frameImage}
                                        alt={`Scene ${scene.sceneNumber} - Shot ${frame.shotNumber}`}
                                        className="w-full h-auto object-contain bg-[#0a0a0a]"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                          const parent = target.parentElement
                                          if (parent) {
                                            parent.innerHTML = `
                                              <div class="w-full h-48 bg-[#0a0a0a] flex items-center justify-center text-gray-500 text-sm">
                                                Image unavailable
                                              </div>
                                            `
                                          }
                                        }}
                                      />
                                      <div className="absolute top-2 right-2 bg-[#10B981]/90 text-black text-xs font-bold px-2 py-1 rounded">
                                        Shot {frame.shotNumber}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-48 bg-[#0a0a0a] flex items-center justify-center text-gray-500 text-sm">
                                      No image
                                    </div>
                                  )}
                                  <div className="p-4 bg-[#1a1a1a]">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <p className="text-sm font-semibold text-white">Shot {frame.shotNumber}</p>
                                        {frame.cameraAngle && (
                                          <p className="text-xs text-[#10B981] mt-1">{frame.cameraAngle}</p>
                                        )}
                                      </div>
                                    </div>
                                    {frame.description && (
                                      <p className="text-xs text-gray-400 line-clamp-2 mt-2">{frame.description}</p>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Section */}
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          dragActive[sceneKey]
                            ? 'border-[#10B981] bg-[#10B981]/10'
                            : 'border-[#10B981]/30 hover:border-[#10B981]/50 bg-[#0a0a0a]/50'
                        }`}
                        onDragEnter={(e) => handleDrag(e, scene.sceneNumber)}
                        onDragLeave={(e) => handleDrag(e, scene.sceneNumber)}
                        onDragOver={(e) => handleDrag(e, scene.sceneNumber)}
                        onDrop={(e) => handleDrop(e, scene.sceneNumber)}
                      >
                        {uploadingScenes[sceneKey] ? (
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
                            <p className="text-gray-300">Uploading files...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <svg className="w-12 h-12 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-300">
                              Drag and drop footage files here, or{' '}
                              <label className="text-[#10B981] cursor-pointer hover:underline font-medium">
                                browse
                                <input
                                  type="file"
                                  multiple
                                  accept="video/*,audio/*,image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileInputChange(e, scene.sceneNumber)}
                                />
                              </label>
                            </p>
                            <p className="text-gray-500 text-sm">Supports video, audio, and image files</p>
                          </div>
                        )}
                      </div>

                      {/* Uploaded Files */}
                      {sceneFiles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#10B981] mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Uploaded Files ({sceneFiles.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sceneFiles.map((file) => (
                              <div
                                key={file.id}
                                className={`bg-[#1a1a1a] rounded-lg overflow-hidden border cursor-pointer hover:border-[#10B981]/50 transition-all ${
                                  selectedVideo?.id === file.id ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : 'border-[#10B981]/20'
                                }`}
                                onClick={() => setSelectedVideo(file)}
                              >
                                <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center">
                                  {file.type?.includes('video') ? (
                                    <svg className="w-8 h-8 text-[#10B981]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  ) : file.type?.includes('image') ? (
                                    <svg className="w-8 h-8 text-[#10B981]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-8 h-8 text-[#10B981]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.06-7.072m-1.06 7.072a9 9 0 001.06-12.728" />
                                    </svg>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="text-xs font-medium text-white truncate">{file.name}</p>
                                  <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
