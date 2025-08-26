'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useVideo } from '@/context/VideoContext'

interface CreativeWorkspaceProps {
  mode: 'editing' | 'effects' | 'audio'
  projectData: any
  onUpdate: (data: any) => void
}

export function CreativeWorkspace({ mode, projectData, onUpdate }: CreativeWorkspaceProps) {
  const { videos, uploadedVideos, selectedVideo, setSelectedVideo } = useVideo()
  const [activePanel, setActivePanel] = useState<string>('timeline')
  const [timelineZoom, setTimelineZoom] = useState(50)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [panelSizes, setPanelSizes] = useState({
    preview: 70,
    timeline: 30
  })
  const videoRef = useRef<HTMLVideoElement>(null)

  // Use existing videos or uploaded videos
  const availableVideos = videos?.length ? videos : uploadedVideos || []

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayback()
          break
        case 'arrowleft':
          e.preventDefault()
          seekVideo(currentTime - (e.shiftKey ? 10 : 1))
          break
        case 'arrowright':
          e.preventDefault()
          seekVideo(currentTime + (e.shiftKey ? 10 : 1))
          break
        case 'home':
          e.preventDefault()
          seekVideo(0)
          break
        case 'end':
          e.preventDefault()
          if (selectedVideo?.duration) {
            seekVideo(selectedVideo.duration)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, selectedVideo])

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const seekVideo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, selectedVideo?.duration || 0))
      setCurrentTime(time)
    }
  }

  return (
    <div className="h-full flex flex-col bg-black/20">
      {/* Professional Tool Bar */}
      <WorkspaceToolbar 
        mode={mode}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        currentTime={currentTime}
        selectedVideo={selectedVideo}
        onSeek={seekVideo}
        isPlaying={isPlaying}
        onTogglePlayback={togglePlayback}
      />

      {/* Main Workspace - Resizable Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Preview and Timeline Area */}
        <div 
          className="flex flex-col bg-black/20"
          style={{ width: `${panelSizes.preview}%` }}
        >
          {/* Video Preview Panel */}
          <div 
            className="bg-black/40 border-b border-white/10"
            style={{ height: '60%' }}
          >
            <VideoPreviewPanel 
              selectedVideo={selectedVideo}
              availableVideos={availableVideos}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              videoRef={videoRef}
              isPlaying={isPlaying}
              onTogglePlayback={togglePlayback}
              onVideoSelect={setSelectedVideo}
            />
          </div>
          
          {/* Timeline Panel */}
          <div 
            className="bg-black/60"
            style={{ height: '40%' }}
          >
            <TimelinePanel 
              projectData={projectData}
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              zoom={timelineZoom}
              onZoomChange={setTimelineZoom}
              mode={mode}
              selectedVideo={selectedVideo}
              availableVideos={availableVideos}
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="w-1 bg-white/10 hover:bg-ember-gold/50 cursor-col-resize transition-colors"
          onMouseDown={(e) => handlePanelResize(e, 'preview')}
        />

        {/* Side Panel */}
        <div 
          className="border-l border-white/10 bg-black/40 overflow-hidden"
          style={{ width: `${100 - panelSizes.preview}%` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activePanel}-${mode}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderSidePanel(activePanel, mode, projectData, selectedVideo, availableVideos)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  function handlePanelResize(e: React.MouseEvent, panel: string) {
    const startX = e.clientX
    const startWidth = panelSizes.preview

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const containerWidth = window.innerWidth * 0.8 // Approximate workspace width
      const deltaPercent = (deltaX / containerWidth) * 100
      const newWidth = Math.max(30, Math.min(80, startWidth + deltaPercent))
      
      setPanelSizes({
        preview: newWidth,
        timeline: panelSizes.timeline
      })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }
}

function WorkspaceToolbar({ 
  mode, 
  activePanel, 
  onPanelChange,
  currentTime,
  selectedVideo,
  onSeek,
  isPlaying,
  onTogglePlayback
}: {
  mode: string
  activePanel: string
  onPanelChange: (panel: string) => void
  currentTime: number
  selectedVideo: any
  onSeek: (time: number) => void
  isPlaying: boolean
  onTogglePlayback: () => void
}) {
  const toolsByMode = {
    editing: [
      { id: 'timeline', label: 'Timeline', icon: '⏱️', shortcut: 'T' },
      { id: 'cuts', label: 'Cuts', icon: '✂️', shortcut: 'C' },
      { id: 'transitions', label: 'Transitions', icon: '🔄', shortcut: 'R' },
      { id: 'text', label: 'Text', icon: '💬', shortcut: 'X' }
    ],
    effects: [
      { id: 'color', label: 'Color', icon: '🎨', shortcut: 'C' },
      { id: 'filters', label: 'Filters', icon: '🔍', shortcut: 'F' },
      { id: 'motion', label: 'Motion', icon: '📐', shortcut: 'M' },
      { id: 'composite', label: 'Composite', icon: '🎭', shortcut: 'P' }
    ],
    audio: [
      { id: 'mixer', label: 'Mixer', icon: '🎛️', shortcut: 'M' },
      { id: 'effects', label: 'Effects', icon: '🔊', shortcut: 'E' },
      { id: 'sync', label: 'Sync', icon: '⚡', shortcut: 'S' },
      { id: 'music', label: 'Music', icon: '🎵', shortcut: 'U' }
    ]
  }

  const tools = toolsByMode[mode as keyof typeof toolsByMode] || []

  return (
    <div className="border-b border-white/10 bg-black/80 backdrop-blur-md">
      {/* Primary Toolbar */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Tool Selection */}
        <div className="flex gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onPanelChange(tool.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-caption font-medium
                transition-all duration-300 touch-target
                ${activePanel === tool.id
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                }
              `}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="hidden md:inline">{tool.label}</span>
              <span className="hidden lg:inline text-xs opacity-60">
                {tool.shortcut}
              </span>
            </button>
          ))}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onSeek(0)}
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Go to Start (Home)"
          >
            ⏮️
          </button>
          <button 
            onClick={() => onSeek(currentTime - 10)}
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Rewind 10s (Shift+←)"
          >
            ⏪
          </button>
          <button 
            onClick={onTogglePlayback}
            className="touch-target-comfortable bg-ember-gold/20 text-ember-gold hover:bg-ember-gold/30 rounded-lg px-4 py-2 font-medium transition-colors"
            title="Play/Pause (Space)"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button 
            onClick={() => onSeek(currentTime + 10)}
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Forward 10s (Shift+→)"
          >
            ⏩
          </button>
          <button 
            onClick={() => selectedVideo?.duration && onSeek(selectedVideo.duration)}
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Go to End (End)"
          >
            ⏭️
          </button>
        </div>

        {/* Workspace Controls */}
        <div className="flex items-center gap-3">
          <div className="text-caption text-medium-contrast">
            {formatTime(currentTime)} / {selectedVideo?.duration ? formatTime(selectedVideo.duration) : '--:--'}
          </div>
          <div className="w-px h-4 bg-white/20" />
          <button className="touch-target text-medium-contrast hover:text-high-contrast text-caption">
            Undo
          </button>
          <button className="touch-target text-medium-contrast hover:text-high-contrast text-caption">
            Redo
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button className="burn-button px-4 py-2 text-caption">
            ✨ Apply AI
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoPreviewPanel({ 
  selectedVideo,
  availableVideos,
  currentTime, 
  onTimeChange, 
  videoRef,
  isPlaying,
  onTogglePlayback,
  onVideoSelect
}: {
  selectedVideo: any
  availableVideos: any[]
  currentTime: number
  onTimeChange: (time: number) => void
  videoRef: React.RefObject<HTMLVideoElement>
  isPlaying: boolean
  onTogglePlayback: () => void
  onVideoSelect: (video: any) => void
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Video Selection */}
      {availableVideos.length > 0 && (
        <div className="p-3 border-b border-white/10">
          <select
            value={selectedVideo?.id || ''}
            onChange={(e) => {
              const video = availableVideos.find(v => v.id === e.target.value)
              if (video) onVideoSelect(video)
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none"
          >
            <option value="">Select a video to preview...</option>
            {availableVideos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.name} {video.duration ? `(${formatTime(video.duration)})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center p-4">
        {selectedVideo ? (
          <div className="relative w-full h-full">
            <Card variant="content" className="w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                className="max-w-full max-h-full object-contain rounded-lg"
                onTimeUpdate={(e) => onTimeChange((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    onTimeChange(0)
                  }
                }}
                onClick={onTogglePlayback}
              >
                <source src={selectedVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Card>
            
            {/* Video Overlay Info */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                <h3 className="text-high-contrast font-medium text-caption">{selectedVideo.name}</h3>
                <p className="text-medium-contrast text-xs">
                  {selectedVideo.metadata?.resolution || 'Unknown'} • {selectedVideo.metadata?.fps || 'Unknown'} fps
                </p>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-high-contrast text-caption font-medium">
                  {formatTime(currentTime)}
                </div>
                <div className="text-medium-contrast text-xs">
                  {selectedVideo.duration ? formatTime(selectedVideo.duration) : '--:--'}
                </div>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                {/* Timeline Scrubber */}
                <div className="mb-2">
                  <input
                    type="range"
                    min="0"
                    max={selectedVideo.duration || 100}
                    value={currentTime}
                    onChange={(e) => onTimeChange(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #e2c376 0%, #e2c376 ${
                        (currentTime / (selectedVideo.duration || 100)) * 100
                      }%, rgba(255,255,255,0.2) ${
                        (currentTime / (selectedVideo.duration || 100)) * 100
                      }%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onTogglePlayback}
                      className="text-white hover:text-ember-gold transition-colors"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <span className="text-white text-caption">
                      {formatTime(currentTime)} / {selectedVideo.duration ? formatTime(selectedVideo.duration) : '--:--'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="text-white/60 hover:text-white transition-colors">
                      🔊
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-6">🎬</div>
            <h3 className="text-h2 font-bold text-high-contrast mb-4 elegant-fire">
              Professional Video Preview
            </h3>
            <p className="text-body text-medium-contrast mb-6 max-w-md">
              Select a video from your project to begin professional editing with precision controls and real-time preview.
            </p>
            {availableVideos.length === 0 && (
              <div className="text-medium-contrast text-caption">
                No videos available. Upload videos to begin editing.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TimelinePanel({ 
  projectData, 
  currentTime, 
  onTimeChange, 
  zoom, 
  onZoomChange,
  mode,
  selectedVideo,
  availableVideos
}: {
  projectData: any
  currentTime: number
  onTimeChange: (time: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  mode: string
  selectedVideo: any
  availableVideos: any[]
}) {
  // Generate timeline tracks based on available videos
  const timelineTracks = [
    { 
      id: 'video1', 
      type: 'video', 
      label: 'Video Track 1',
      clips: selectedVideo ? [{
        id: selectedVideo.id,
        name: selectedVideo.name,
        startTime: 0,
        duration: selectedVideo.duration || 30,
        source: selectedVideo
      }] : []
    },
    { 
      id: 'audio1', 
      type: 'audio', 
      label: 'Audio Track 1',
      clips: selectedVideo ? [{
        id: `${selectedVideo.id}-audio`,
        name: `${selectedVideo.name} (Audio)`,
        startTime: 0,
        duration: selectedVideo.duration || 30,
        source: selectedVideo
      }] : []
    },
    { 
      id: 'effects1', 
      type: 'effects', 
      label: 'Effects Track',
      clips: []
    }
  ]

  const totalDuration = Math.max(
    ...timelineTracks.flatMap(track => 
      track.clips.map(clip => clip.startTime + clip.duration)
    ),
    60 // Minimum 1 minute timeline
  )

  return (
    <div className="h-full flex flex-col bg-black/80">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h3 className="text-high-contrast font-medium text-body elegant-fire">Professional Timeline</h3>
          <div className="text-medium-contrast text-caption">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-medium-contrast text-caption">Zoom:</label>
            <input
              type="range"
              min="10"
              max="500"
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-medium-contrast text-caption w-12">{zoom}%</span>
          </div>
          
          <button className="text-medium-contrast hover:text-high-contrast text-caption">
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Labels */}
        <div className="w-32 border-r border-white/10 bg-black/40">
          <div className="h-8 border-b border-white/10 flex items-center px-3 text-caption text-medium-contrast font-medium">
            Tracks
          </div>
          {timelineTracks.map((track) => (
            <div
              key={track.id}
              className="h-16 flex items-center px-3 border-b border-white/10 text-medium-contrast text-caption"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {track.type === 'video' ? '🎬' : track.type === 'audio' ? '🎵' : '✨'}
                </span>
                <span>{track.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 relative overflow-x-auto">
          {/* Time Ruler */}
          <div className="h-8 border-b border-white/10 bg-black/60 relative">
            <TimelineRuler 
              duration={totalDuration} 
              zoom={zoom} 
              currentTime={currentTime}
              onTimeClick={onTimeChange}
            />
          </div>

          {/* Timeline Tracks */}
          <div className="relative">
            {timelineTracks.map((track, trackIndex) => (
              <div
                key={track.id}
                className="h-16 border-b border-white/10 relative bg-black/20 hover:bg-black/30 transition-colors"
              >
                {/* Track clips */}
                {track.clips.map((clip, clipIndex) => {
                  const leftPercent = (clip.startTime / totalDuration) * 100 * (zoom / 100)
                  const widthPercent = (clip.duration / totalDuration) * 100 * (zoom / 100)
                  
                  return (
                    <motion.div
                      key={clip.id}
                      className={`
                        absolute h-12 m-2 rounded cursor-pointer
                        ${track.type === 'video' ? 'bg-blue-500/30 border border-blue-500/50' :
                          track.type === 'audio' ? 'bg-green-500/30 border border-green-500/50' :
                          'bg-purple-500/30 border border-purple-500/50'}
                        hover:opacity-80 transition-opacity
                      `}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: '60px'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: trackIndex * 0.1 + clipIndex * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-2 text-white text-xs truncate">
                        <div className="font-medium">{clip.name}</div>
                        <div className="opacity-60">{formatTime(clip.duration)}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-ember-gold z-10 pointer-events-none"
              style={{
                left: `${(currentTime / totalDuration) * 100 * (zoom / 100)}%`
              }}
            >
              <div className="w-4 h-4 bg-ember-gold rounded-full -ml-2 -mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineRuler({ 
  duration, 
  zoom, 
  currentTime, 
  onTimeClick 
}: {
  duration: number
  zoom: number
  currentTime: number
  onTimeClick: (time: number) => void
}) {
  const intervals = Math.ceil(duration / 10) // 10-second intervals
  const markers = Array.from({ length: intervals + 1 }, (_, i) => i * 10)

  return (
    <div 
      className="h-full relative cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const timelineWidth = rect.width
        const clickPercent = clickX / timelineWidth
        const clickTime = (clickPercent * duration) / (zoom / 100)
        onTimeClick(Math.max(0, Math.min(clickTime, duration)))
      }}
    >
      {markers.map((time) => {
        const leftPercent = (time / duration) * 100 * (zoom / 100)
        if (leftPercent > 100) return null
        
        return (
          <div
            key={time}
            className="absolute top-0 bottom-0 border-l border-white/30"
            style={{ left: `${leftPercent}%` }}
          >
            <div className="text-xs text-white/60 ml-1 mt-1">
              {formatTime(time)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Side panel renderer for different tools
function renderSidePanel(
  activePanel: string, 
  mode: string, 
  projectData: any, 
  selectedVideo: any,
  availableVideos: any[]
) {
  switch (activePanel) {
    case 'timeline':
      return <TimelinePropertiesPanel selectedVideo={selectedVideo} />
    case 'color':
      return <ColorGradingPanel selectedVideo={selectedVideo} />
    case 'mixer':
      return <AudioMixerPanel selectedVideo={selectedVideo} />
    case 'effects':
      return <EffectsLibraryPanel mode={mode} />
    case 'cuts':
      return <CutsAndTrimsPanel selectedVideo={selectedVideo} />
    case 'transitions':
      return <TransitionsPanel />
    case 'filters':
      return <FiltersPanel />
    case 'motion':
      return <MotionPanel />
    case 'sync':
      return <AudioSyncPanel selectedVideo={selectedVideo} />
    case 'music':
      return <MusicLibraryPanel />
    default:
      return <DefaultPropertiesPanel panel={activePanel} mode={mode} />
  }
}

// Panel components
function TimelinePropertiesPanel({ selectedVideo }: { selectedVideo: any }) {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Timeline Properties</h3>
      
      {selectedVideo && (
        <div className="space-y-4">
          <Card variant="content" className="p-4">
            <h4 className="text-ember-gold text-caption font-medium mb-3">Current Video</h4>
            <div className="space-y-2 text-caption">
              <div><span className="text-medium-contrast">Name:</span> <span className="text-high-contrast">{selectedVideo.name}</span></div>
              <div><span className="text-medium-contrast">Duration:</span> <span className="text-high-contrast">{selectedVideo.duration ? formatTime(selectedVideo.duration) : 'Unknown'}</span></div>
              <div><span className="text-medium-contrast">Size:</span> <span className="text-high-contrast">{selectedVideo.size ? formatFileSize(selectedVideo.size) : 'Unknown'}</span></div>
              <div><span className="text-medium-contrast">Status:</span> <span className="text-high-contrast">{selectedVideo.status}</span></div>
            </div>
          </Card>
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <label className="block text-ember-gold text-caption mb-2">Project Duration</label>
          <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none" placeholder="00:15:42" />
        </div>
        <div>
          <label className="block text-ember-gold text-caption mb-2">Frame Rate</label>
          <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none">
            <option>24 fps</option>
            <option>30 fps</option>
            <option>60 fps</option>
          </select>
        </div>
        <div>
          <label className="block text-ember-gold text-caption mb-2">Resolution</label>
          <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none">
            <option>1920x1080</option>
            <option>3840x2160</option>
            <option>1280x720</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function ColorGradingPanel({ selectedVideo }: { selectedVideo: any }) {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Color Grading</h3>
      
      <div className="space-y-4">
        {['Exposure', 'Contrast', 'Highlights', 'Shadows', 'Saturation', 'Vibrance'].map((control) => (
          <div key={control}>
            <label className="block text-ember-gold text-caption mb-2">{control}</label>
            <input 
              type="range" 
              className="w-full" 
              min="-100" 
              max="100" 
              defaultValue="0"
            />
            <div className="flex justify-between text-xs text-medium-contrast mt-1">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>
        ))}
        
        <button className="burn-button w-full py-3 text-body">
          🤖 Apply AI Color Correction
        </button>
        
        <button className="w-full py-2 border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10 rounded-lg transition-colors text-caption">
          Reset All Values
        </button>
      </div>
    </div>
  )
}

function AudioMixerPanel({ selectedVideo }: { selectedVideo: any }) {
  const tracks = ['Master', 'Dialogue', 'Music', 'SFX', 'Ambient']
  
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Audio Mixer</h3>
      
      <div className="space-y-4">
        {tracks.map((track) => (
          <div key={track} className="space-y-2">
            <label className="block text-ember-gold text-caption">{track}</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                className="flex-1" 
                min="0" 
                max="100" 
                defaultValue="75"
              />
              <span className="text-medium-contrast text-caption w-12">75%</span>
              <button className="text-medium-contrast hover:text-high-contrast">
                🔇
              </button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-white/10">
          <button className="burn-button w-full py-3 text-body">
            🤖 Auto Audio Enhancement
          </button>
        </div>
      </div>
    </div>
  )
}

function EffectsLibraryPanel({ mode }: { mode: string }) {
  const effectCategories = {
    effects: {
      'Color': ['Color Correction', 'LUT Application', 'White Balance', 'Color Wheels'],
      'Blur & Sharpen': ['Gaussian Blur', 'Motion Blur', 'Unsharp Mask', 'Smart Sharpen'],
      'Stylize': ['Film Grain', 'Vintage', 'Glow', 'Vignette']
    },
    audio: {
      'Dynamics': ['Compressor', 'Limiter', 'Gate', 'Expander'],
      'EQ': ['Parametric EQ', 'Graphic EQ', 'High Pass', 'Low Pass'],
      'Time': ['Reverb', 'Delay', 'Echo', 'Chorus']
    }
  }

  const effects = effectCategories[mode as keyof typeof effectCategories] || effectCategories.effects

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">
        {mode === 'effects' ? 'Visual Effects' : 'Audio Effects'}
      </h3>
      
      <div className="space-y-4">
        {Object.entries(effects).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-ember-gold text-caption font-medium mb-2">{category}</h4>
            <div className="space-y-1">
              {items.map((effect) => (
                <button
                  key={effect}
                  className="w-full p-3 text-left text-medium-contrast hover:text-high-contrast hover:bg-white/5 rounded transition-colors text-caption"
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Additional specialized panels
function CutsAndTrimsPanel({ selectedVideo }: { selectedVideo: any }) {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Cuts & Trims</h3>
      <div className="space-y-3">
        <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          ✂️ Split at Playhead
        </button>
        <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          🗑️ Delete Selected
        </button>
        <button className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          🔄 Duplicate Clip
        </button>
      </div>
    </div>
  )
}

function TransitionsPanel() {
  const transitions = ['Fade', 'Dissolve', 'Wipe', 'Slide', 'Push', 'Zoom']
  
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Transitions</h3>
      <div className="space-y-2">
        {transitions.map((transition) => (
          <button
            key={transition}
            className="w-full p-3 text-left text-medium-contrast hover:text-high-contrast hover:bg-white/5 rounded transition-colors"
          >
            🔄 {transition}
          </button>
        ))}
      </div>
    </div>
  )
}

function FiltersPanel() {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Filters</h3>
      <p className="text-medium-contrast text-caption">Advanced filter controls coming soon.</p>
    </div>
  )
}

function MotionPanel() {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Motion Graphics</h3>
      <p className="text-medium-contrast text-caption">Motion graphics tools coming soon.</p>
    </div>
  )
}

function AudioSyncPanel({ selectedVideo }: { selectedVideo: any }) {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Audio Sync</h3>
      <button className="burn-button w-full py-3">
        🤖 Auto Sync Audio
      </button>
    </div>
  )
}

function MusicLibraryPanel() {
  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h3 className="text-high-contrast font-medium text-body elegant-fire">Music Library</h3>
      <p className="text-medium-contrast text-caption">AI music suggestions coming soon.</p>
    </div>
  )
}

function DefaultPropertiesPanel({ panel, mode }: { panel: string; mode: string }) {
  return (
    <div className="p-4 text-center h-full flex items-center justify-center">
      <div>
        <div className="text-4xl mb-4">🛠️</div>
        <h3 className="text-high-contrast font-medium mb-2 elegant-fire">{panel} Properties</h3>
        <p className="text-medium-contrast text-caption">
          Professional {panel} controls for {mode} mode.
        </p>
      </div>
    </div>
  )
}

// Helper functions
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
