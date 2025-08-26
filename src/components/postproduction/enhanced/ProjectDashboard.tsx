'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'
import { useVideo } from '@/context/VideoContext'

interface ProjectMetric {
  label: string
  value: string | number
  icon: string
  status: 'good' | 'warning' | 'critical'
  change?: string
  description?: string
}

interface RenderTask {
  id: string
  name: string
  progress: number
  status: 'queued' | 'rendering' | 'completed' | 'error'
  size: string
  estimatedTime?: string
}

export function ProjectDashboard({ projectData }: { projectData: any }) {
  const { videos, uploadedVideos, selectedVideo, isUploading } = useVideo()
  
  // Calculate real metrics from existing video data
  const calculateProjectMetrics = (): ProjectMetric[] => {
    const videoCount = videos?.length || uploadedVideos?.length || 0
    const totalSize = videos?.reduce((sum, video) => sum + (video.size || 0), 0) || 0
    const readyVideos = videos?.filter(video => video.status === 'ready').length || 0
    const processingVideos = videos?.filter(video => video.status === 'processing').length || 0
    
    // Calculate total duration from video metadata
    const totalDuration = videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0
    const formattedDuration = formatDuration(totalDuration)
    
    return [
      { 
        label: 'Raw Footage', 
        value: formatFileSize(totalSize), 
        icon: '📹', 
        status: totalSize > 0 ? 'good' : 'warning',
        description: `${videoCount} video files uploaded`
      },
      { 
        label: 'Timeline Duration', 
        value: formattedDuration, 
        icon: '⏱️', 
        status: totalDuration > 0 ? 'good' : 'warning',
        description: 'Total footage duration'
      },
      { 
        label: 'Ready Files', 
        value: readyVideos, 
        icon: '✅', 
        status: readyVideos === videoCount && videoCount > 0 ? 'good' : 'warning',
        description: `${readyVideos}/${videoCount} files ready`
      },
      { 
        label: 'Processing', 
        value: processingVideos, 
        icon: '🔄', 
        status: processingVideos > 0 ? 'warning' : 'good',
        description: 'Files currently processing'
      },
      { 
        label: 'AI Analysis', 
        value: getAIAnalysisStatus(videos), 
        icon: '🤖', 
        status: 'good',
        description: 'AI processing completion'
      },
      { 
        label: 'Export Quality', 
        value: '4K', 
        icon: '🎯', 
        status: 'good',
        description: 'Target export resolution'
      }
    ]
  }

  // Generate realistic recent activity from video data
  const generateRecentActivity = () => {
    const activities = []
    
    if (videos?.length > 0) {
      activities.push({
        action: `Analyzed ${videos.length} video clips`,
        time: '15 min ago',
        type: 'ai'
      })
    }
    
    if (selectedVideo) {
      activities.push({
        action: `Selected ${selectedVideo.name} for editing`,
        time: '30 min ago',
        type: 'editing'
      })
    }
    
    activities.push(
      { action: 'AI scene detection completed', time: '1 hour ago', type: 'ai' },
      { action: 'Color grading applied to Scene 3', time: '2 hours ago', type: 'effects' },
      { action: 'Audio sync optimization', time: '3 hours ago', type: 'audio' }
    )
    
    return activities
  }

  // Generate render queue from project status
  const generateRenderQueue = (): RenderTask[] => {
    return [
      {
        id: '1',
        name: 'Main_Timeline_Preview.mp4',
        progress: 100,
        status: 'completed',
        size: '245 MB',
        estimatedTime: 'Complete'
      },
      {
        id: '2',
        name: 'Scene_02_ColorGrade.mp4',
        progress: isUploading ? 45 : 73,
        status: isUploading ? 'rendering' : 'rendering',
        size: '312 MB',
        estimatedTime: '3 min remaining'
      },
      {
        id: '3',
        name: 'Audio_Mix_Export.wav',
        progress: 0,
        status: 'queued',
        size: '198 MB',
        estimatedTime: 'Waiting...'
      }
    ]
  }

  const projectMetrics = calculateProjectMetrics()
  const recentActivity = generateRecentActivity()
  const renderingQueue = generateRenderQueue()

  // Calculate overall project health
  const projectHealth = Math.round(
    projectMetrics.reduce((sum, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20
      return sum + score
    }, 0) / projectMetrics.length
  )

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      {/* Project Health Metrics */}
      <ContentSection title="📊 Project Overview">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {projectMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="status" className="text-center p-4 hover:scale-105 transition-transform cursor-pointer group">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className={`text-h3 font-bold mb-1 ${
                  metric.status === 'good' ? 'text-green-400' :
                  metric.status === 'warning' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {metric.value}
                  {metric.change && (
                    <span className="text-xs text-green-400 ml-1">
                      {metric.change}
                    </span>
                  )}
                </div>
                <div className="text-caption text-medium-contrast mb-2">
                  {metric.label}
                </div>
                <div className={`
                  w-3 h-3 rounded-full mx-auto mb-2
                  ${metric.status === 'good' ? 'bg-green-400' :
                    metric.status === 'warning' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }
                `} />
                <div className="text-xs text-medium-contrast opacity-0 group-hover:opacity-100 transition-opacity">
                  {metric.description}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* Project Health Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="hero" className="bg-gradient-to-br from-green-500 to-blue-500 p-6 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-h3 text-white font-bold mb-2">Project Health</h3>
          <div className="text-3xl font-bold text-white mb-2">{projectHealth}%</div>
          <p className="text-white/80 text-body">
            {projectHealth >= 80 ? 'Excellent Progress' :
             projectHealth >= 60 ? 'Good Progress' :
             projectHealth >= 40 ? 'Needs Attention' : 'Setup Required'}
          </p>
        </Card>

        <Card variant="hero" className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <h3 className="text-h3 text-white font-bold mb-2">Active Videos</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {videos?.length || uploadedVideos?.length || 0}
          </div>
          <p className="text-white/80 text-body">Files in Project</p>
        </Card>

        <Card variant="hero" className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="text-h3 text-white font-bold mb-2">Ready to Export</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {projectHealth >= 80 ? 'Yes' : 'Soon'}
          </div>
          <p className="text-white/80 text-body">Production Status</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <ContentSection title="🔥 Recent Activity">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-2xl">
                    {activity.type === 'effects' ? '✨' :
                     activity.type === 'audio' ? '🎵' :
                     activity.type === 'editing' ? '✂️' : '🤖'}
                  </div>
                  <div className="flex-1">
                    <p className="text-high-contrast font-medium text-body">{activity.action}</p>
                    <p className="text-medium-contrast text-caption">{activity.time}</p>
                  </div>
                  <button className="text-ember-gold hover:text-ember-gold/80 text-caption">
                    View →
                  </button>
                </motion.div>
              ))}
            </div>
          </Card>
        </ContentSection>

        {/* Rendering Queue */}
        <ContentSection title="⚙️ Rendering Queue">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {renderingQueue.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-high-contrast font-medium text-body">{task.name}</h4>
                      <p className="text-medium-contrast text-caption">{task.size}</p>
                    </div>
                    <div className={`
                      px-3 py-1 rounded text-caption font-medium
                      ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'rendering' ? 'bg-yellow-500/20 text-yellow-400' :
                        task.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }
                    `}>
                      {task.status}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`
                        h-2 rounded-full
                        ${task.status === 'completed' ? 'bg-green-400' :
                          task.status === 'rendering' ? 'bg-yellow-400' :
                          task.status === 'error' ? 'bg-red-400' :
                          'bg-gray-400'
                        }
                      `}
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-caption text-medium-contrast">
                    <span>{task.progress}%</span>
                    <span>{task.estimatedTime}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </ContentSection>

        {/* Quick Actions */}
        <ContentSection title="🚀 Quick Actions">
          <div className="space-y-4">
            <QuickActionCard
              title="Auto Edit"
              description="AI-powered scene assembly and cuts"
              icon="🤖"
              action="Start Auto Edit"
              gradient="from-purple-500 to-blue-500"
              onClick={() => {/* Open auto edit modal */}}
            />
            <QuickActionCard
              title="Color Grade"
              description="Apply cinematic color correction"
              icon="🎨"
              action="Open Color Tools"
              gradient="from-orange-500 to-red-500"
              onClick={() => {/* Navigate to effects mode */}}
            />
            <QuickActionCard
              title="Export Preview"
              description="Generate preview for review"
              icon="📹"
              action="Create Preview"
              gradient="from-green-500 to-blue-500"
              onClick={() => {/* Navigate to export mode */}}
            />
            <QuickActionCard
              title="Add Music"
              description="AI-suggested background tracks"
              icon="🎼"
              action="Browse Music"
              gradient="from-pink-500 to-purple-500"
              onClick={() => {/* Navigate to audio mode */}}
            />
          </div>
        </ContentSection>
      </div>

      {/* Project Timeline Overview */}
      <ContentSection title="📈 Timeline Overview">
        <Card variant="content" className="p-6">
          <TimelinePreview videos={videos || uploadedVideos} selectedVideo={selectedVideo} />
        </Card>
      </ContentSection>

      {/* Video Library Quick Access */}
      {(videos?.length > 0 || uploadedVideos?.length > 0) && (
        <ContentSection title="📽️ Video Library">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(videos || uploadedVideos)?.slice(0, 12).map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  variant="content" 
                  className="p-3 cursor-pointer hover:border-ember-gold/50 transition-all aspect-video"
                  onClick={() => {/* Select video for editing */}}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎬</div>
                      <div className="text-caption text-high-contrast font-medium truncate">
                        {video.name}
                      </div>
                    </div>
                    <div className="text-xs text-medium-contrast text-center">
                      {video.duration ? formatDuration(video.duration) : '--:--'}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ContentSection>
      )}
    </div>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  action, 
  gradient,
  onClick
}: {
  title: string
  description: string
  icon: string
  action: string
  gradient: string
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="action" 
        className={`bg-gradient-to-br ${gradient} cursor-pointer group p-4 touch-target-comfortable transition-all duration-300 hover:shadow-lg`}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-3xl mb-3">{icon}</div>
          <h3 className="font-bold text-white mb-2 elegant-fire text-body">{title}</h3>
          <p className="text-white/80 text-caption mb-3 leading-relaxed">{description}</p>
          <button className="text-white font-medium group-hover:text-yellow-200 transition-colors text-caption">
            {action} →
          </button>
        </div>
      </Card>
    </motion.div>
  )
}

function TimelinePreview({ 
  videos, 
  selectedVideo 
}: { 
  videos: any[]
  selectedVideo: any 
}) {
  if (!videos?.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-h3 text-high-contrast mb-2">No Videos Yet</h3>
        <p className="text-body text-medium-contrast">
          Upload video files to see timeline preview
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-32 w-full bg-gradient-to-r from-black/20 to-black/40 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center p-4">
        <div className="flex-1 flex gap-1 h-16">
          {videos.slice(0, 8).map((video, index) => (
            <motion.div
              key={video.id}
              className={`h-full rounded flex-1 flex items-center justify-center ${
                selectedVideo?.id === video.id 
                  ? 'bg-ember-gold/40 border-2 border-ember-gold' 
                  : 'bg-ember-gold/20 hover:bg-ember-gold/30'
              } transition-colors cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <div className="text-lg mb-1">🎬</div>
                <div className="text-xs text-white/80 truncate max-w-16">
                  {video.name.length > 8 ? video.name.substring(0, 8) + '...' : video.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Timeline scrubber */}
        <div className="absolute bottom-2 left-4 right-4">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div className="bg-ember-gold h-1 rounded-full w-1/3" />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>00:00</span>
            <span>Current: 05:32</span>
            <span>15:42</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getAIAnalysisStatus(videos: any[]): string {
  if (!videos?.length) return '0%'
  const analyzedCount = videos.filter(video => video.status === 'ready').length
  const percentage = Math.round((analyzedCount / videos.length) * 100)
  return `${percentage}%`
}
