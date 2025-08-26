'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useVideo } from '@/context/VideoContext'

export function AIAssistantPanel({ 
  projectData, 
  currentMode, 
  onUpdate 
}: { 
  projectData: any
  currentMode: string
  onUpdate: (data: any) => void 
}) {
  const { videos, uploadedVideos, selectedVideo } = useVideo()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analysis' | 'automation'>('suggestions')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  // Get contextual AI suggestions based on current mode and video data
  const aiSuggestions = getAISuggestions(currentMode, projectData, selectedVideo, videos || uploadedVideos)

  // Simulate AI processing
  const handleAIAction = async (action: string) => {
    setIsProcessing(true)
    setProcessingStep(`Processing ${action}...`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setProcessingStep('')
  }

  return (
    <motion.div
      className={`
        bg-black/80 border-l border-white/10 backdrop-blur-md flex flex-col
        ${isExpanded ? 'w-80' : 'w-16'}
      `}
      animate={{ width: isExpanded ? 320 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Toggle Button */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-ember-gold hover:text-ember-gold/80 transition-colors touch-target group"
          title={isExpanded ? "Collapse AI Assistant" : "Expand AI Assistant"}
        >
          <span className="text-2xl">{isExpanded ? '🤖' : '🤖'}</span>
          {isExpanded && (
            <motion.span 
              className="ml-2 font-medium text-body elegant-fire"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              AI Assistant
            </motion.span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Current Context Display */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="text-caption text-medium-contrast mb-1">Current Context</div>
              <div className="text-body text-high-contrast font-medium">
                {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
              </div>
              {selectedVideo && (
                <div className="text-caption text-ember-gold mt-1">
                  Working on: {selectedVideo.name}
                </div>
              )}
            </div>

            {/* AI Tab Navigation */}
            <div className="p-4 border-b border-white/10">
              <div className="flex gap-1">
                {[
                  { id: 'suggestions', label: 'Suggest', icon: '💡', description: 'Smart suggestions' },
                  { id: 'analysis', label: 'Analyze', icon: '📊', description: 'Content analysis' },
                  { id: 'automation', label: 'Auto', icon: '⚡', description: 'Automated tasks' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-1 px-3 py-2 rounded text-caption
                      transition-all duration-300 touch-target
                      ${activeTab === tab.id
                        ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                        : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                      }
                    `}
                    title={tab.description}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="p-4 border-b border-white/10 bg-ember-gold/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-ember-gold"
                  >
                    ⚙️
                  </motion.div>
                  <div>
                    <div className="text-caption text-ember-gold font-medium">AI Processing</div>
                    <div className="text-xs text-medium-contrast">{processingStep}</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderAIContent(activeTab, currentMode, aiSuggestions, handleAIAction, selectedVideo)}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick AI Actions */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="space-y-2">
                <button 
                  className="burn-button w-full py-2 text-caption"
                  onClick={() => handleAIAction('Smart Edit')}
                  disabled={isProcessing}
                >
                  🤖 Smart Edit
                </button>
                <button 
                  className="w-full py-2 border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10 rounded-lg transition-colors text-caption"
                  onClick={() => handleAIAction('Quick Analysis')}
                  disabled={isProcessing}
                >
                  📊 Quick Analysis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function renderAIContent(
  tab: string, 
  mode: string, 
  suggestions: any[], 
  handleAIAction: (action: string) => void,
  selectedVideo: any
) {
  switch (tab) {
    case 'suggestions':
      return <AISuggestionsContent suggestions={suggestions} onAction={handleAIAction} />
    case 'analysis':
      return <AIAnalysisContent mode={mode} selectedVideo={selectedVideo} onAction={handleAIAction} />
    case 'automation':
      return <AIAutomationContent mode={mode} onAction={handleAIAction} />
    default:
      return <AISuggestionsContent suggestions={suggestions} onAction={handleAIAction} />
  }
}

function AISuggestionsContent({ 
  suggestions, 
  onAction 
}: { 
  suggestions: any[]
  onAction: (action: string) => void 
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-high-contrast font-medium text-body mb-3 elegant-fire">Smart Suggestions</h3>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">🎬</div>
          <p className="text-medium-contrast text-caption">
            Select a video to get AI-powered suggestions for your editing workflow.
          </p>
        </div>
      ) : (
        suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              variant="content" 
              className="p-3 cursor-pointer hover:border-ember-gold/50 transition-colors"
              onClick={() => onAction(suggestion.title)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{suggestion.icon}</span>
                <div className="flex-1">
                  <h4 className="text-high-contrast font-medium text-caption mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-medium-contrast text-xs leading-relaxed mb-2">
                    {suggestion.description}
                  </p>
                  {suggestion.confidence && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-medium-contrast">Confidence:</span>
                      <div className="flex-1 bg-white/10 rounded-full h-1">
                        <div 
                          className="bg-ember-gold h-1 rounded-full"
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-ember-gold">{suggestion.confidence}%</span>
                    </div>
                  )}
                  <button className="text-ember-gold text-xs hover:text-ember-gold/80 transition-colors">
                    Apply Suggestion →
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  )
}

function AIAnalysisContent({ 
  mode, 
  selectedVideo, 
  onAction 
}: { 
  mode: string
  selectedVideo: any
  onAction: (action: string) => void 
}) {
  const analysisData = generateAnalysisData(mode, selectedVideo)

  return (
    <div className="space-y-4">
      <h3 className="text-high-contrast font-medium text-body mb-3 elegant-fire">AI Analysis</h3>
      
      {!selectedVideo ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-medium-contrast text-caption">
            Select a video to see detailed AI analysis results.
          </p>
        </div>
      ) : (
        <>
          {/* Analysis Results */}
          <div className="space-y-3">
            {Object.entries(analysisData).map(([key, value]) => (
              <Card key={key} variant="content" className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-ember-gold text-caption font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    value.status === 'good' ? 'bg-green-500/20 text-green-400' :
                    value.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {value.status}
                  </div>
                </div>
                <div className="text-medium-contrast text-xs mb-2">{value.description}</div>
                {value.score !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          value.status === 'good' ? 'bg-green-400' :
                          value.status === 'warning' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${value.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-high-contrast">{value.score}%</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Analysis Actions */}
          <div className="space-y-2">
            <button 
              className="burn-button w-full py-3 text-caption"
              onClick={() => onAction('Full Analysis')}
            >
              🔍 Run Full Analysis
            </button>
            <button 
              className="w-full py-2 border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10 rounded-lg transition-colors text-caption"
              onClick={() => onAction('Export Report')}
            >
              📋 Export Report
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function AIAutomationContent({ 
  mode, 
  onAction 
}: { 
  mode: string
  onAction: (action: string) => void 
}) {
  const automationOptions = {
    dashboard: [
      { name: 'Auto Project Setup', description: 'Initialize project with optimal settings', icon: '⚙️' },
      { name: 'Smart File Organization', description: 'Organize imported files intelligently', icon: '📁' },
      { name: 'Quick Preview Generation', description: 'Generate preview thumbnails', icon: '🖼️' }
    ],
    editing: [
      { name: 'Auto-cut Dead Space', description: 'Remove silence and long pauses', icon: '✂️' },
      { name: 'Smart Scene Detection', description: 'Identify and mark scene boundaries', icon: '🎬' },
      { name: 'Rhythm Matching', description: 'Match cuts to audio rhythm', icon: '🎵' },
      { name: 'Auto Stabilization', description: 'Stabilize shaky footage', icon: '🎯' }
    ],
    effects: [
      { name: 'Auto Color Correction', description: 'Apply intelligent color grading', icon: '🎨' },
      { name: 'Exposure Balancing', description: 'Balance exposure across clips', icon: '☀️' },
      { name: 'Noise Reduction', description: 'Remove visual noise and grain', icon: '✨' },
      { name: 'Smart Sharpening', description: 'Enhance image sharpness', icon: '🔍' }
    ],
    audio: [
      { name: 'Auto Sync Dialogue', description: 'Sync audio to video automatically', icon: '🎙️' },
      { name: 'Background Noise Removal', description: 'Clean up audio tracks', icon: '🔇' },
      { name: 'Level Normalization', description: 'Balance audio levels', icon: '📊' },
      { name: 'Smart Music Matching', description: 'Suggest matching background music', icon: '🎼' }
    ]
  }

  const options = automationOptions[mode as keyof typeof automationOptions] || automationOptions.dashboard

  return (
    <div className="space-y-4">
      <h3 className="text-high-contrast font-medium text-body mb-3 elegant-fire">AI Automation</h3>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <motion.button
            key={option.name}
            className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            onClick={() => onAction(option.name)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{option.icon}</span>
              <div className="flex-1">
                <div className="text-high-contrast font-medium text-caption group-hover:text-ember-gold transition-colors">
                  {option.name}
                </div>
                <div className="text-medium-contrast text-xs leading-relaxed">
                  {option.description}
                </div>
              </div>
              <span className="text-medium-contrast group-hover:text-ember-gold transition-colors">
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10">
        <button 
          className="burn-button w-full py-3 text-caption"
          onClick={() => onAction('Run All Automations')}
        >
          ⚡ Run All Automations
        </button>
        
        <p className="text-xs text-medium-contrast mt-2 text-center">
          Automations will be applied in optimal order
        </p>
      </div>
    </div>
  )
}

function getAISuggestions(mode: string, projectData: any, selectedVideo: any, videos: any[]) {
  const suggestionsByMode = {
    dashboard: [
      {
        icon: '🎬',
        title: 'Start Smart Edit',
        description: 'Let AI create an initial rough cut based on your footage',
        confidence: 92
      },
      {
        icon: '📊',
        title: 'Analyze Content',
        description: 'Get insights about your footage quality and content',
        confidence: 88
      }
    ],
    editing: [
      {
        icon: '✂️',
        title: 'Trim Silence',
        description: 'Automatically remove long pauses and dead air',
        confidence: 95
      },
      {
        icon: '🎵',
        title: 'Beat Detection',
        description: 'Find the rhythm in your audio for better cuts',
        confidence: 87
      },
      {
        icon: '🔄',
        title: 'Smart Transitions',
        description: 'Add appropriate transitions between scenes',
        confidence: 82
      }
    ],
    effects: [
      {
        icon: '🎨',
        title: 'Color Match',
        description: 'Ensure consistent color across all clips',
        confidence: 90
      },
      {
        icon: '☀️',
        title: 'Exposure Fix',
        description: 'Automatically fix under/over-exposed footage',
        confidence: 93
      },
      {
        icon: '✨',
        title: 'Enhance Quality',
        description: 'Apply AI-powered image enhancement',
        confidence: 85
      }
    ],
    audio: [
      {
        icon: '🎵',
        title: 'Add Background Music',
        description: 'AI-selected music that matches your content mood',
        confidence: 89
      },
      {
        icon: '🔊',
        title: 'Audio Enhancement',
        description: 'Improve dialogue clarity and remove noise',
        confidence: 94
      },
      {
        icon: '⚡',
        title: 'Auto Sync',
        description: 'Sync separate audio tracks with video',
        confidence: 96
      }
    ]
  }

  let suggestions = suggestionsByMode[mode as keyof typeof suggestionsByMode] || suggestionsByMode.dashboard

  // Add contextual suggestions based on current video
  if (selectedVideo) {
    suggestions = [...suggestions, {
      icon: '🎯',
      title: `Optimize ${selectedVideo.name}`,
      description: `Apply targeted improvements for this specific video`,
      confidence: 91
    }]
  }

  // Add suggestions based on video count
  if (videos && videos.length > 1) {
    suggestions = [...suggestions, {
      icon: '🔗',
      title: 'Multi-Clip Workflow',
      description: `Automatically organize and sequence ${videos.length} clips`,
      confidence: 88
    }]
  }

  return suggestions
}

function generateAnalysisData(mode: string, selectedVideo: any) {
  if (!selectedVideo) return {}

  const analysisTypes = {
    dashboard: {
      videoQuality: {
        description: 'Overall video quality assessment',
        status: 'good',
        score: 87
      },
      audioQuality: {
        description: 'Audio clarity and levels analysis',
        status: 'good',
        score: 92
      },
      contentDetection: {
        description: 'Scene and object detection results',
        status: 'warning',
        score: 74
      }
    },
    editing: {
      pacing: {
        description: 'Video pacing and rhythm analysis',
        status: 'good',
        score: 89
      },
      cuts: {
        description: 'Cut points and transition analysis',
        status: 'warning',
        score: 76
      },
      flow: {
        description: 'Overall narrative flow assessment',
        status: 'good',
        score: 84
      }
    },
    effects: {
      exposure: {
        description: 'Exposure levels and consistency',
        status: 'warning',
        score: 68
      },
      colorBalance: {
        description: 'Color temperature and balance',
        status: 'good',
        score: 91
      },
      contrast: {
        description: 'Contrast and dynamic range',
        status: 'critical',
        score: 45
      },
      sharpness: {
        description: 'Image sharpness and clarity',
        status: 'good',
        score: 88
      }
    },
    audio: {
      levels: {
        description: 'Audio level consistency',
        status: 'good',
        score: 93
      },
      clarity: {
        description: 'Dialogue and speech clarity',
        status: 'good',
        score: 89
      },
      noise: {
        description: 'Background noise levels',
        status: 'warning',
        score: 72
      },
      sync: {
        description: 'Audio-video synchronization',
        status: 'good',
        score: 96
      }
    }
  }

  return analysisTypes[mode as keyof typeof analysisTypes] || analysisTypes.dashboard
}
