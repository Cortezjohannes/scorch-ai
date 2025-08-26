'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/card'
import { ProjectDashboard } from '@/components/postproduction/enhanced/ProjectDashboard'
import { CreativeWorkspace } from '@/components/postproduction/enhanced/CreativeWorkspace'
import { AIAssistantPanel } from '@/components/postproduction/enhanced/AIAssistantPanel'
import { ExportDistributionHub } from '@/components/postproduction/enhanced/ExportDistributionHub'
import { VideoProvider } from '@/context/VideoContext'

type WorkspaceMode = 'dashboard' | 'editing' | 'effects' | 'audio' | 'export'

export default function EnhancedPostProductionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)

  const synopsis = searchParams.get('synopsis') || ''
  const theme = searchParams.get('theme') || ''
  const projectId = searchParams.get('projectId')

  // Load project data and existing footage
  useEffect(() => {
    setIsLoading(true)
    
    const loadProjectData = async () => {
      try {
        // Load project data from various sources
        let loadedData: any = {
          synopsis,
          theme,
          title: 'Professional Edit',
          footage: [],
          timeline: initializeTimeline(),
          assets: initializeAssets()
        }

        // Load existing project data from localStorage
        const existingProject = localStorage.getItem('reeled-postproduction-project')
        if (existingProject) {
          try {
            const parsedProject = JSON.parse(existingProject)
            loadedData = { ...loadedData, ...parsedProject }
          } catch (error) {
            console.error('Error parsing existing project:', error)
          }
        }

        // Load story bible data if available
        const storyBibleData = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
        if (storyBibleData) {
          try {
            const parsedStoryBible = JSON.parse(storyBibleData)
            loadedData.storyBible = parsedStoryBible
          } catch (error) {
            console.error('Error parsing story bible:', error)
          }
        }

        // Load pre-production data if available
        const preProductionData = localStorage.getItem('reeled-preproduction-content')
        if (preProductionData) {
          try {
            const parsedPreProduction = JSON.parse(preProductionData)
            loadedData.preProduction = parsedPreProduction
          } catch (error) {
            console.error('Error parsing pre-production data:', error)
          }
        }

        console.log('📽️ Loaded post-production project data:', loadedData)
        setProjectData(loadedData)
      } catch (error) {
        console.error('Error loading project data:', error)
        setProjectData({
          title: 'New Project',
          synopsis: synopsis || 'No synopsis available',
          theme: theme || 'No theme specified',
          footage: [],
          timeline: initializeTimeline(),
          assets: initializeAssets()
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectData()
  }, [synopsis, theme, projectId])

  // Save project updates
  const handleProjectUpdate = (updatedData: any) => {
    const newProjectData = { ...projectData, ...updatedData }
    setProjectData(newProjectData)
    
    // Save to localStorage
    try {
      localStorage.setItem('reeled-postproduction-project', JSON.stringify(newProjectData))
    } catch (error) {
      console.error('Error saving project data:', error)
    }
  }

  // Loading screen
  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-4xl">🎬</span>
            </motion.div>
            <p className="text-body-large text-medium-contrast elegant-fire">Loading professional editing workspace...</p>
          </motion.div>
        </div>
      </PageLayout>
    )
  }

  return (
    <VideoProvider>
      <PageLayout
        showSecondaryNav={true}
        showBreadcrumbs={true}
        className="h-screen overflow-hidden"
        projectId={projectId}
      >
        {/* Professional Post-Production Workspace */}
        <div className="flex h-full">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Enhanced Workspace Navigation */}
            <PostProductionNavigation
              currentMode={currentMode}
              onModeChange={setCurrentMode}
              projectData={projectData}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMode}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderWorkspaceMode(currentMode, projectData, handleProjectUpdate)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* AI Assistant Panel (Always Accessible) */}
          <AIAssistantPanel 
            projectData={projectData}
            currentMode={currentMode}
            onUpdate={handleProjectUpdate}
          />
        </div>
      </PageLayout>
    </VideoProvider>
  )
}

// Enhanced Navigation for post-production modes
function PostProductionNavigation({ 
  currentMode, 
  onModeChange, 
  projectData 
}: {
  currentMode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
  projectData: any
}) {
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      description: 'Project overview and health metrics',
      shortcut: '1'
    },
    { 
      id: 'editing', 
      label: 'Edit', 
      icon: '✂️', 
      description: 'Professional video editing and timeline',
      shortcut: '2'
    },
    { 
      id: 'effects', 
      label: 'Effects', 
      icon: '✨', 
      description: 'Visual effects and color grading',
      shortcut: '3'
    },
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: '🎵', 
      description: 'Sound design and audio mixing',
      shortcut: '4'
    },
    { 
      id: 'export', 
      label: 'Export', 
      icon: '📤', 
      description: 'Export and distribution hub',
      shortcut: '5'
    }
  ]

  // Handle keyboard shortcuts for professional workflow
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const shortcut = e.key
        const item = navigationItems.find(item => item.shortcut === shortcut)
        if (item) {
          e.preventDefault()
          onModeChange(item.id as WorkspaceMode)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onModeChange])

  // Calculate completion status for each mode
  const getCompletionStatus = (mode: string) => {
    switch (mode) {
      case 'editing':
        return projectData?.timeline?.tracks?.length > 0 ? 'active' : 'pending'
      case 'effects':
        return projectData?.effects?.applied?.length > 0 ? 'completed' : 'pending'
      case 'audio':
        return projectData?.audio?.mixed ? 'completed' : 'pending'
      case 'export':
        return projectData?.exports?.length > 0 ? 'completed' : 'pending'
      default:
        return 'active'
    }
  }

  return (
    <div className="border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Project Info */}
        <div className="flex items-center gap-4">
          <h1 className="text-h2 font-bold text-high-contrast elegant-fire">
            {projectData?.title || 'Professional Edit'}
          </h1>
          <div className="flex items-center gap-3 text-caption text-medium-contrast">
            <span>🎬</span>
            <span>Post-Production Workspace</span>
            <span>•</span>
            <span>Industry-Grade Tools</span>
          </div>
        </div>

        {/* Mode Navigation */}
        <nav className="flex gap-1">
          {navigationItems.map((item) => {
            const status = getCompletionStatus(item.id)
            
            return (
              <button
                key={item.id}
                onClick={() => onModeChange(item.id as WorkspaceMode)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg
                  transition-all duration-300 group relative touch-target
                  ${currentMode === item.id
                    ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                    : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                  }
                `}
                title={`${item.description} (Ctrl+${item.shortcut})`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="hidden md:block text-left">
                  <div className="font-medium text-caption elegant-fire">{item.label}</div>
                  <div className="text-xs opacity-60 group-hover:opacity-80">
                    ⌘{item.shortcut}
                  </div>
                </div>
                
                {/* Status Indicator */}
                <div className={`
                  w-2 h-2 rounded-full
                  ${status === 'completed' ? 'bg-green-400' :
                    status === 'active' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }
                `} />
              </button>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button 
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Project Settings"
          >
            ⚙️
          </button>
          
          <button 
            className="touch-target text-medium-contrast hover:text-high-contrast transition-colors"
            title="Full Screen (F)"
          >
            ⛶
          </button>
          
          <div className="w-px h-6 bg-white/20" />
          
          <button 
            className="burn-button px-4 py-2 text-caption"
            title="Quick Render"
          >
            🚀 Render
          </button>
        </div>
      </div>
    </div>
  )
}

// Render different workspace modes
function renderWorkspaceMode(mode: WorkspaceMode, projectData: any, setProjectData: any) {
  switch (mode) {
    case 'dashboard':
      return <ProjectDashboard projectData={projectData} />
    case 'editing':
      return <CreativeWorkspace mode="editing" projectData={projectData} onUpdate={setProjectData} />
    case 'effects':
      return <CreativeWorkspace mode="effects" projectData={projectData} onUpdate={setProjectData} />
    case 'audio':
      return <CreativeWorkspace mode="audio" projectData={projectData} onUpdate={setProjectData} />
    case 'export':
      return <ExportDistributionHub projectData={projectData} />
    default:
      return <ProjectDashboard projectData={projectData} />
  }
}

// Helper functions for initialization
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function initializeTimeline() {
  return {
    duration: 0,
    tracks: [
      { id: 'video1', type: 'video', label: 'Video Track 1', clips: [] },
      { id: 'audio1', type: 'audio', label: 'Audio Track 1', clips: [] }
    ],
    markers: [],
    currentTime: 0,
    zoom: 50
  }
}

function initializeAssets() {
  return {
    videos: [],
    audio: [],
    images: [],
    effects: []
  }
}
