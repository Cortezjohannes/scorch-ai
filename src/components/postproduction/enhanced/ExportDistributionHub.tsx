'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'
import { useVideo } from '@/context/VideoContext'

interface ExportPreset {
  id: string
  name: string
  description: string
  resolution: string
  quality: string
  format: string
  size: string
  icon: string
  recommended?: boolean
}

interface ExportJob {
  id: string
  name: string
  preset: string
  progress: number
  status: 'queued' | 'exporting' | 'completed' | 'error'
  estimatedTime?: string
  fileSize?: string
}

export function ExportDistributionHub({ projectData }: { projectData: any }) {
  const { videos, uploadedVideos, selectedVideo } = useVideo()
  const [activeTab, setActiveTab] = useState<'export' | 'distribute' | 'settings'>('export')
  const [selectedPreset, setSelectedPreset] = useState<string>('youtube_4k')
  const [customSettings, setCustomSettings] = useState({
    resolution: '1920x1080',
    framerate: '30',
    bitrate: '8000',
    format: 'mp4',
    quality: 'high'
  })
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Main_Timeline_4K.mp4',
      preset: 'YouTube 4K',
      progress: 100,
      status: 'completed',
      fileSize: '2.4 GB'
    },
    {
      id: '2',
      name: 'Social_Media_Preview.mp4',
      preset: 'Instagram Story',
      progress: 67,
      status: 'exporting',
      estimatedTime: '5 min remaining',
      fileSize: 'Estimated 45 MB'
    }
  ])

  const availableVideos = videos?.length ? videos : uploadedVideos || []

  const exportPresets: ExportPreset[] = [
    {
      id: 'youtube_4k',
      name: 'YouTube 4K',
      description: 'High quality 4K upload for YouTube',
      resolution: '3840x2160',
      quality: 'High',
      format: 'MP4 (H.264)',
      size: '~2.5 GB',
      icon: '📺',
      recommended: true
    },
    {
      id: 'youtube_1080p',
      name: 'YouTube 1080p',
      description: 'Standard HD quality for YouTube',
      resolution: '1920x1080',
      quality: 'High',
      format: 'MP4 (H.264)',
      size: '~800 MB',
      icon: '📹'
    },
    {
      id: 'instagram_story',
      name: 'Instagram Story',
      description: 'Vertical format for Instagram Stories',
      resolution: '1080x1920',
      quality: 'Medium',
      format: 'MP4 (H.264)',
      size: '~120 MB',
      icon: '📱'
    },
    {
      id: 'instagram_feed',
      name: 'Instagram Feed',
      description: 'Square format for Instagram posts',
      resolution: '1080x1080',
      quality: 'Medium',
      format: 'MP4 (H.264)',
      size: '~150 MB',
      icon: '⬜'
    },
    {
      id: 'tiktok',
      name: 'TikTok/Shorts',
      description: 'Vertical short-form content',
      resolution: '1080x1920',
      quality: 'Medium',
      format: 'MP4 (H.264)',
      size: '~80 MB',
      icon: '🎵'
    },
    {
      id: 'preview_web',
      name: 'Web Preview',
      description: 'Compressed for web streaming',
      resolution: '1280x720',
      quality: 'Medium',
      format: 'MP4 (H.264)',
      size: '~200 MB',
      icon: '🌐'
    },
    {
      id: 'professional',
      name: 'Professional Master',
      description: 'Uncompressed for archival',
      resolution: '4096x2160',
      quality: 'Lossless',
      format: 'ProRes 422',
      size: '~8.5 GB',
      icon: '🎬'
    },
    {
      id: 'custom',
      name: 'Custom Settings',
      description: 'Configure your own export settings',
      resolution: 'Variable',
      quality: 'Custom',
      format: 'Various',
      size: 'Variable',
      icon: '⚙️'
    }
  ]

  const distributionPlatforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Upload directly to YouTube',
      icon: '📺',
      status: 'connected',
      formats: ['MP4', 'MOV', 'AVI']
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      description: 'Upload to Vimeo Pro',
      icon: '🎥',
      status: 'disconnected',
      formats: ['MP4', 'MOV']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Share to Instagram feed or stories',
      icon: '📱',
      status: 'connected',
      formats: ['MP4']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Upload to TikTok',
      icon: '🎵',
      status: 'disconnected',
      formats: ['MP4']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Save to cloud storage',
      icon: '☁️',
      status: 'connected',
      formats: ['Any']
    },
    {
      id: 'local',
      name: 'Local Storage',
      description: 'Save to your computer',
      icon: '💾',
      status: 'ready',
      formats: ['Any']
    }
  ]

  const handleExport = (presetId: string) => {
    const preset = exportPresets.find(p => p.id === presetId)
    if (!preset) return

    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `Export_${preset.name.replace(/\s+/g, '_')}.mp4`,
      preset: preset.name,
      progress: 0,
      status: 'queued',
      estimatedTime: 'Calculating...'
    }

    setExportJobs(prev => [...prev, newJob])

    // Simulate export progress
    setTimeout(() => {
      setExportJobs(prev => 
        prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'exporting', estimatedTime: '8 min remaining' }
            : job
        )
      )
    }, 1000)
  }

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold text-high-contrast elegant-fire">Export & Distribution</h2>
          <p className="text-body text-medium-contrast">
            Professional export and distribution workflows
          </p>
        </div>
        
        <div className="flex gap-2">
          {[
            { id: 'export', label: 'Export', icon: '📤', description: 'Export video files' },
            { id: 'distribute', label: 'Distribute', icon: '🌐', description: 'Share to platforms' },
            { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Export preferences' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all touch-target
                ${activeTab === tab.id
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                }
              `}
              title={tab.description}
            >
              <span>{tab.icon}</span>
              <span className="hidden md:inline text-caption">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'export' && (
            <ExportTab
              exportPresets={exportPresets}
              selectedPreset={selectedPreset}
              onPresetSelect={setSelectedPreset}
              customSettings={customSettings}
              onCustomSettingsChange={setCustomSettings}
              onExport={handleExport}
              availableVideos={availableVideos}
              selectedVideo={selectedVideo}
            />
          )}
          
          {activeTab === 'distribute' && (
            <DistributeTab
              platforms={distributionPlatforms}
              exportJobs={exportJobs.filter(job => job.status === 'completed')}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab
              customSettings={customSettings}
              onSettingsChange={setCustomSettings}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Export Queue */}
      {exportJobs.length > 0 && (
        <ContentSection title="📋 Export Queue">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {exportJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-high-contrast font-medium text-body">{job.name}</h4>
                      <p className="text-medium-contrast text-caption">{job.preset}</p>
                    </div>
                    <div className={`
                      px-3 py-1 rounded text-caption font-medium
                      ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'exporting' ? 'bg-yellow-500/20 text-yellow-400' :
                        job.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }
                    `}>
                      {job.status}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`
                        h-2 rounded-full
                        ${job.status === 'completed' ? 'bg-green-400' :
                          job.status === 'exporting' ? 'bg-yellow-400' :
                          job.status === 'error' ? 'bg-red-400' :
                          'bg-gray-400'
                        }
                      `}
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-caption text-medium-contrast">
                    <span>{job.progress}%</span>
                    <span>{job.estimatedTime || job.fileSize}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </ContentSection>
      )}
    </div>
  )
}

function ExportTab({
  exportPresets,
  selectedPreset,
  onPresetSelect,
  customSettings,
  onCustomSettingsChange,
  onExport,
  availableVideos,
  selectedVideo
}: {
  exportPresets: ExportPreset[]
  selectedPreset: string
  onPresetSelect: (preset: string) => void
  customSettings: any
  onCustomSettingsChange: (settings: any) => void
  onExport: (presetId: string) => void
  availableVideos: any[]
  selectedVideo: any
}) {
  return (
    <div className="space-y-8">
      {/* Export Presets */}
      <ContentSection title="🎯 Export Presets">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportPresets.map((preset) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.2 }}
            >
              <Card
                variant={selectedPreset === preset.id ? "hero" : "content"}
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedPreset === preset.id 
                    ? 'border-ember-gold/50 bg-ember-gold/10' 
                    : 'hover:border-ember-gold/30'
                } ${preset.recommended ? 'ring-2 ring-green-400/30' : ''}`}
                onClick={() => onPresetSelect(preset.id)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{preset.icon}</div>
                  <h3 className="font-bold text-high-contrast mb-2 text-body">
                    {preset.name}
                    {preset.recommended && (
                      <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </h3>
                  <p className="text-medium-contrast text-caption mb-3">{preset.description}</p>
                  <div className="space-y-1 text-xs">
                    <div><span className="text-ember-gold">Resolution:</span> {preset.resolution}</div>
                    <div><span className="text-ember-gold">Quality:</span> {preset.quality}</div>
                    <div><span className="text-ember-gold">Format:</span> {preset.format}</div>
                    <div><span className="text-ember-gold">Size:</span> {preset.size}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* Custom Settings */}
      {selectedPreset === 'custom' && (
        <ContentSection title="⚙️ Custom Export Settings">
          <Card variant="content" className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Resolution</label>
                  <select
                    value={customSettings.resolution}
                    onChange={(e) => onCustomSettingsChange({...customSettings, resolution: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none"
                  >
                    <option value="3840x2160">4K (3840x2160)</option>
                    <option value="1920x1080">Full HD (1920x1080)</option>
                    <option value="1280x720">HD (1280x720)</option>
                    <option value="1080x1920">Vertical HD (1080x1920)</option>
                    <option value="1080x1080">Square (1080x1080)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Frame Rate</label>
                  <select
                    value={customSettings.framerate}
                    onChange={(e) => onCustomSettingsChange({...customSettings, framerate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none"
                  >
                    <option value="24">24 fps (Cinema)</option>
                    <option value="30">30 fps (Standard)</option>
                    <option value="60">60 fps (High)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Bitrate (kbps)</label>
                  <input
                    type="number"
                    value={customSettings.bitrate}
                    onChange={(e) => onCustomSettingsChange({...customSettings, bitrate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none"
                    min="1000"
                    max="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Format</label>
                  <select
                    value={customSettings.format}
                    onChange={(e) => onCustomSettingsChange({...customSettings, format: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none"
                  >
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="mov">MOV (QuickTime)</option>
                    <option value="avi">AVI</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </ContentSection>
      )}

      {/* Export Actions */}
      <ContentSection title="🚀 Export Actions">
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-4 elegant-fire">Quick Export</h3>
            <p className="text-medium-contrast text-caption mb-4">
              Export your current timeline with the selected preset.
            </p>
            <button 
              className="burn-button w-full py-3 text-body"
              onClick={() => onExport(selectedPreset)}
              disabled={!selectedVideo && availableVideos.length === 0}
            >
              📤 Export Now
            </button>
          </Card>
          
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-4 elegant-fire">Batch Export</h3>
            <p className="text-medium-contrast text-caption mb-4">
              Export multiple versions simultaneously.
            </p>
            <button 
              className="w-full py-3 border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10 rounded-lg transition-colors text-body"
              disabled={!selectedVideo && availableVideos.length === 0}
            >
              📋 Setup Batch Export
            </button>
          </Card>
        </div>
      </ContentSection>
    </div>
  )
}

function DistributeTab({
  platforms,
  exportJobs
}: {
  platforms: any[]
  exportJobs: any[]
}) {
  return (
    <div className="space-y-8">
      {/* Distribution Platforms */}
      <ContentSection title="🌐 Distribution Platforms">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Card
              key={platform.id}
              variant="content"
              className={`p-4 ${
                platform.status === 'connected' ? 'border-green-400/30' :
                platform.status === 'ready' ? 'border-blue-400/30' :
                'border-gray-400/30'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{platform.icon}</div>
                <h3 className="font-bold text-high-contrast mb-2 text-body">{platform.name}</h3>
                <p className="text-medium-contrast text-caption mb-3">{platform.description}</p>
                <div className={`
                  inline-block px-3 py-1 rounded text-caption
                  ${platform.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                    platform.status === 'ready' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }
                `}>
                  {platform.status}
                </div>
                <div className="mt-3">
                  <button className={`
                    w-full py-2 rounded-lg transition-colors text-caption
                    ${platform.status === 'connected' ? 'bg-ember-gold/20 text-ember-gold' :
                      'border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10'
                    }
                  `}>
                    {platform.status === 'connected' ? 'Upload' : 'Connect'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ContentSection>

      {/* Ready to Distribute */}
      {exportJobs.length > 0 && (
        <ContentSection title="📤 Ready to Distribute">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {exportJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <h4 className="text-high-contrast font-medium text-body">{job.name}</h4>
                    <p className="text-medium-contrast text-caption">{job.fileSize}</p>
                  </div>
                  <button className="burn-button px-4 py-2 text-caption">
                    📤 Distribute
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </ContentSection>
      )}
    </div>
  )
}

function SettingsTab({
  customSettings,
  onSettingsChange
}: {
  customSettings: any
  onSettingsChange: (settings: any) => void
}) {
  return (
    <div className="space-y-8">
      <ContentSection title="⚙️ Export Preferences">
        <Card variant="content" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 text-high-contrast mb-4 elegant-fire">Default Settings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Default Quality</label>
                  <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ember-gold text-caption mb-2">Default Format</label>
                  <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-high-contrast text-caption focus:border-ember-gold focus:outline-none">
                    <option>MP4</option>
                    <option>MOV</option>
                    <option>AVI</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 text-high-contrast mb-4 elegant-fire">Export Behavior</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-high-contrast text-caption">Auto-open export folder after completion</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-high-contrast text-caption">Show notification when export completes</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-high-contrast text-caption">Automatically upload to connected platforms</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </ContentSection>
    </div>
  )
}
