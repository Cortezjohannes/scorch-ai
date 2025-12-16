'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'

interface VideoMetadata {
  duration: number
  resolution: string
  frameRate?: number
  codec?: string
  bitrate?: string
}

interface UploadedContent {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'cancelled'
  progress: number
  uploadedAt: Date
  error?: string
  preview?: string
  metadata?: VideoMetadata
  processingStage?: 'uploading' | 'analyzing' | 'transcoding' | 'finalizing'
  cancelToken?: AbortController
}

const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
]

export default function PostProduction() {
  const [uploads, setUploads] = useState<UploadedContent[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const uploadIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, MKV, WebM)',
      }
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      // 2GB limit
      return {
        valid: false,
        error: 'File size too large. Maximum size is 2GB',
      }
    }
    return { valid: true }
  }

  const getDetailedVideoMetadata = (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        // Create MediaSource for codec info
        const mediaSource = new MediaSource()
        const objectUrl = URL.createObjectURL(mediaSource)
        video.src = objectUrl

        mediaSource.addEventListener('sourceopen', () => {
          URL.revokeObjectURL(objectUrl)
          const codec = MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"') 
            ? 'H.264' 
            : 'Unknown'

          resolve({
            duration: video.duration,
            resolution: `${video.videoWidth}x${video.videoHeight}`,
            frameRate: 30, // Estimated, as exact frame rate is not directly accessible
            codec,
            bitrate: `${Math.round(file.size / video.duration / 125)} kbps`, // Estimated bitrate
          })
        })
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = Math.random().toString(36).substring(7)
      const validation = validateFile(file)

      if (!validation.valid) {
        setUploads((prev) => [
          ...prev,
          {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            status: 'error',
            progress: 0,
            uploadedAt: new Date(),
            error: validation.error,
          },
        ])
        continue
      }

      const preview = URL.createObjectURL(file)
      const metadata = await getDetailedVideoMetadata(file)
      const cancelToken = new AbortController()

      // Add file to uploads list
      const newUpload: UploadedContent = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date(),
        preview,
        metadata,
        processingStage: 'uploading',
        cancelToken,
      }

      setUploads((prev) => [...prev, newUpload])

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        if (cancelToken.signal.aborted) {
          clearInterval(interval)
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === fileId
                ? { ...upload, status: 'cancelled', progress: 0 }
                : upload
            )
          )
          return
        }

        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === fileId
                ? {
                    ...upload,
                    status: 'processing',
                    progress: 100,
                    processingStage: 'analyzing',
                  }
                : upload
            )
          )

          // Simulate processing stages
          if (!cancelToken.signal.aborted) {
            setTimeout(() => {
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.id === fileId
                    ? { ...upload, processingStage: 'transcoding' }
                    : upload
                )
              )
            }, 2000)

            setTimeout(() => {
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.id === fileId
                    ? { ...upload, processingStage: 'finalizing' }
                    : upload
                )
              )
            }, 4000)

            setTimeout(() => {
              setUploads((prev) =>
                prev.map((upload) =>
                  upload.id === fileId ? { ...upload, status: 'ready' } : upload
                )
              )
            }, 6000)
          }
        } else {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === fileId ? { ...upload, progress } : upload
            )
          )
        }
      }, 500)

      uploadIntervals.current[fileId] = interval
    }
  }

  const handleDelete = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id)
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview)
      }
      if (upload?.cancelToken) {
        upload.cancelToken.abort()
      }
      if (uploadIntervals.current[id]) {
        clearInterval(uploadIntervals.current[id])
        delete uploadIntervals.current[id]
      }
      return prev.filter((upload) => upload.id !== id)
    })
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleDeleteSelected = useCallback(() => {
    selectedFiles.forEach(handleDelete)
  }, [selectedFiles, handleDelete])

  const handleCancel = useCallback((id: string) => {
    const upload = uploads.find((u) => u.id === id)
    if (upload?.cancelToken) {
      upload.cancelToken.abort()
    }
  }, [uploads])

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.round(seconds % 60)
    return [h, m, s]
      .map((v) => (v < 10 ? '0' + v : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <main className="min-h-screen text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <motion.div
                className="inline-flex items-center space-x-4 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
                  <span className="text-3xl">🎬</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black elegant-fire fire-gradient animate-flameFlicker">
                  REVOLUTIONARY POST-PRODUCTION
                </h1>
              </motion.div>
              <p className="text-white/90 text-xl elegant-fire">Upload your filmed content for revolutionary post-production</p>
            </div>
          {selectedFiles.size > 0 && (
            <motion.button
              onClick={handleDeleteSelected}
              className="px-6 py-3 bg-[#D62828]/20 text-[#D62828] rounded-xl hover:bg-[#D62828]/30 transition-colors font-black border-2 border-[#D62828]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              DELETE SELECTED ({selectedFiles.size})
            </motion.button>
          )}
        </div>

        {/* Revolutionary Upload Area */}
        <motion.div
          className={`rebellious-card relative ${
            isDragging ? 'border-[#e2c376] bg-[#e2c376]/20' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileInput"
            multiple
            accept={ACCEPTED_VIDEO_TYPES.join(',')}
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          />
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center py-12 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-12 h-12 mb-4 transition-colors ${
                isDragging ? 'text-[#e2c376]' : 'text-[#e7e7e7]/40'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xl font-black mb-2 elegant-fire">DROP YOUR REVOLUTIONARY CONTENT HERE</p>
            <p className="text-white/70 text-lg elegant-fire">
              Supported formats: MP4, MOV, AVI, MKV, WebM (max 2GB)
            </p>
          </label>
        </motion.div>

        {/* Revolutionary Uploads List */}
        {uploads.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black elegant-fire">REVOLUTIONARY UPLOADED CONTENT</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {uploads.map((upload) => (
                  <motion.div
                    key={upload.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`rebellious-card cursor-pointer transition-colors ${
                      selectedUpload === upload.id ? 'bg-[#e2c376]/20 border-[#e2c376]/60' : ''
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex gap-4">
                      {/* Selection Checkbox */}
                      <div 
                        className="flex items-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFileSelection(upload.id)
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(upload.id)}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-gray-300 text-[#e2c376] focus:ring-[#e2c376]"
                        />
                      </div>

                      {/* Preview Thumbnail */}
                      {upload.preview && (
                        <div 
                          className="relative w-48 aspect-video rounded-lg overflow-hidden bg-black"
                          onClick={() => setSelectedUpload(upload.id)}
                        >
                          <video
                            src={upload.preview}
                            className="absolute inset-0 w-full h-full object-cover"
                            ref={selectedUpload === upload.id ? videoRef : undefined}
                            controls={selectedUpload === upload.id}
                            muted
                          />
                          {selectedUpload === upload.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFullscreen()
                              }}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-black/70 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                {isFullscreen ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 14h6m0 0v6m0-6L4 20M20 10h-6m0 0V4m0 6l6-6"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                  />
                                )}
                              </svg>
                            </button>
                          )}
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-black mb-2 text-[#e2c376] elegant-fire text-lg">{upload.name}</h3>
                            <div className="flex flex-wrap gap-3 text-white/70 elegant-fire">
                              <span>{formatFileSize(upload.size)}</span>
                              {upload.metadata && (
                                <>
                                  <span>{formatDuration(upload.metadata.duration)}</span>
                                  <span>{upload.metadata.resolution}</span>
                                  {upload.metadata.frameRate && (
                                    <span>{upload.metadata.frameRate} fps</span>
                                  )}
                                  {upload.metadata.codec && (
                                    <span>{upload.metadata.codec}</span>
                                  )}
                                  {upload.metadata.bitrate && (
                                    <span>{upload.metadata.bitrate}</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(upload.status === 'uploading' || upload.status === 'processing') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancel(upload.id)
                                }}
                                className="p-1 hover:bg-[#e7e7e7]/10 rounded transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-[#e7e7e7]/50"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(upload.id)
                              }}
                              className="p-1 hover:bg-[#e7e7e7]/10 rounded transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                            <span
                              className={`px-4 py-2 rounded-xl font-black ${
                                upload.status === 'ready'
                                  ? 'bg-[#e2c376]/20 text-[#e2c376]'
                                  : upload.status === 'error'
                                  ? 'bg-[#D62828]/20 text-[#D62828]'
                                  : upload.status === 'cancelled'
                                  ? 'bg-white/20 text-white/70'
                                  : upload.status === 'processing'
                                  ? 'bg-[#FF6B00]/20 text-[#FF6B00]'
                                  : 'bg-[#e2c376]/20 text-[#e2c376]'
                              }`}
                            >
                              {upload.status === 'ready'
                                ? 'READY'
                                : upload.status === 'error'
                                ? 'ERROR'
                                : upload.status === 'cancelled'
                                ? 'CANCELLED'
                                : upload.status === 'processing'
                                ? (upload.processingStage && upload.processingStage.toUpperCase()) || 'PROCESSING'
                                : 'UPLOADING'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {(upload.status === 'uploading' ||
                          upload.status === 'processing') && (
                          <div className="space-y-1">
                            <div className="w-full bg-[#e7e7e7]/10 rounded-full h-1.5">
                              <motion.div
                                className="bg-[#e2c376] h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${upload.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            {upload.status === 'processing' && (
                              <div className="flex justify-between text-white/80 elegant-fire">
                                <span>
                                  {upload.processingStage === 'analyzing'
                                    ? 'ANALYZING REVOLUTIONARY METADATA...'
                                    : upload.processingStage === 'transcoding'
                                    ? 'TRANSCODING FOR OPTIMAL PLAYBACK...'
                                    : 'FINALIZING REVOLUTION...'}
                                </span>
                                <span className="font-black">{Math.round(upload.progress)}%</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Revolutionary Error Message */}
                        {upload.status === 'error' && upload.error && (
                          <p className="text-lg text-[#D62828] mt-3 font-black elegant-fire">{upload.error}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    </main>
  )
} 