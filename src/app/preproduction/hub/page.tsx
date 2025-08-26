'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/card'
import { ProductionPipelineOverview } from '@/components/preproduction/ProductionPipelineOverview'
import { PlanningBoard } from '@/components/preproduction/PlanningBoard'
import { ResourceManagementHub } from '@/components/preproduction/ResourceManagementHub'

type ViewMode = 'overview' | 'planning' | 'resources' | 'creative' | 'technical'

export default function PreProductionHub() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewMode>('overview')
  const [projectData, setProjectData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const synopsis = searchParams.get('synopsis') || ''
  const theme = searchParams.get('theme') || ''
  const projectId = searchParams.get('projectId')

  // Load project data from various sources
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        let loadedData: any = {}

        // Load from URL parameters (new projects)
        if (synopsis && theme) {
          loadedData = {
            synopsis,
            theme,
            title: 'New Project',
            createdAt: new Date().toISOString(),
            stages: initializeProjectStages(),
            resources: initializeResources(),
            timeline: initializeTimeline()
          }
        }

        // Load existing pre-production data from localStorage
        const preProductionContent = localStorage.getItem('reeled-preproduction-content')
        if (preProductionContent) {
          try {
            const parsedContent = JSON.parse(preProductionContent)
            loadedData = { ...loadedData, ...parsedContent }
          } catch (error) {
            console.error('Error parsing pre-production content:', error)
          }
        }

        // Load story bible data if available
        const storyBibleData = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')
        if (storyBibleData) {
          try {
            const parsedStoryBible = JSON.parse(storyBibleData)
            loadedData = { ...loadedData, storyBible: parsedStoryBible }
          } catch (error) {
            console.error('Error parsing story bible:', error)
          }
        }

        // If we have existing arc-based content, load that too
        if (projectId) {
          const arcContent = localStorage.getItem(`reeled-preproduction-${projectId}`)
          if (arcContent) {
            try {
              const parsedArcContent = JSON.parse(arcContent)
              loadedData = { ...loadedData, ...parsedArcContent }
            } catch (error) {
              console.error('Error parsing arc content:', error)
            }
          }
        }

        // Set default title if none exists
        if (!loadedData.title) {
          loadedData.title = loadedData.storyBible?.title || 
                           loadedData.synopsis?.substring(0, 50) + '...' || 
                           'Untitled Project'
        }

        console.log('📋 Loaded project data:', loadedData)
        setProjectData(loadedData)
      } catch (error) {
        console.error('Error loading project data:', error)
        // Create minimal project data
        setProjectData({
          title: 'New Project',
          synopsis: synopsis || 'No synopsis available',
          theme: theme || 'No theme specified',
          stages: initializeProjectStages(),
          resources: initializeResources(),
          timeline: initializeTimeline()
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectData()
  }, [projectId, synopsis, theme])

  // Enhanced navigation system
  const handleNavigate = (section: ViewMode) => {
    setCurrentView(section)
  }

  // Save project data updates
  const handleProjectUpdate = (updatedData: any) => {
    const newProjectData = { ...projectData, ...updatedData }
    setProjectData(newProjectData)
    
    // Save to localStorage
    try {
      localStorage.setItem('reeled-preproduction-content', JSON.stringify(newProjectData))
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
              <span className="text-4xl">📋</span>
            </motion.div>
            <p className="text-body-large text-medium-contrast elegant-fire">Loading pre-production hub...</p>
          </motion.div>
        </div>
      </PageLayout>
    )
  }

  // No project data state
  if (!projectData) {
    return (
      <PageLayout
        title="Pre-Production Hub"
        subtitle="Professional project management for film production"
        showBreadcrumbs={true}
      >
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-h2 font-bold text-high-contrast mb-4 elegant-fire">No Project Data Found</h2>
          <p className="text-body text-medium-contrast mb-8 max-w-md mx-auto">
            Start by creating a story or loading an existing project to access the pre-production management tools.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="burn-button text-body px-8 py-4 touch-target-comfortable"
            >
              🔥 Create New Story
            </button>
            <button
              onClick={() => router.push('/preproduction/v2')}
              className="px-8 py-4 border border-ember-gold/30 text-ember-gold hover:bg-ember-gold/10 rounded-lg transition-colors touch-target-comfortable"
            >
              📋 Classic Pre-Production
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={projectData?.title || 'Pre-Production Hub'}
      showSecondaryNav={true}
      showBreadcrumbs={true}
      projectId={projectId}
    >
      {/* Enhanced Pre-Production Navigation */}
      <PreProductionNavigation
        currentView={currentView}
        onViewChange={handleNavigate}
        projectData={projectData}
      />

      {/* Main Content */}
      <div className="py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {renderCurrentView(currentView, projectData, handleProjectUpdate)}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  )
}

// Enhanced Navigation Component
function PreProductionNavigation({ 
  currentView, 
  onViewChange, 
  projectData 
}: {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  projectData: any
}) {
  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: '📊', 
      description: 'Project status and health metrics',
      completion: calculateOverallCompletion(projectData)
    },
    { 
      id: 'planning', 
      label: 'Planning Board', 
      icon: '📋', 
      description: 'Kanban task management',
      completion: calculatePlanningCompletion(projectData)
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: '🎯', 
      description: 'Budget, equipment, scheduling',
      completion: calculateResourceCompletion(projectData)
    },
    { 
      id: 'creative', 
      label: 'Creative Brief', 
      icon: '🎨', 
      description: 'Visual direction and style',
      completion: calculateCreativeCompletion(projectData)
    },
    { 
      id: 'technical', 
      label: 'Technical Prep', 
      icon: '🔧', 
      description: 'Equipment and requirements',
      completion: calculateTechnicalCompletion(projectData)
    }
  ]

  // Calculate overall project health
  const overallHealth = Math.round(
    navigationItems.reduce((sum, item) => sum + item.completion, 0) / navigationItems.length
  )

  return (
    <div className="border-b border-white/10 sticky top-16 bg-black/80 backdrop-blur-md z-30">
      <div className="py-4">
        {/* Project Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-h2 font-bold text-high-contrast elegant-fire">
              {projectData?.title || 'Pre-Production Project'}
            </h1>
            <p className="text-body text-medium-contrast">
              Pre-Production Phase • {getProjectStatus(overallHealth)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-caption text-medium-contrast">Overall Progress</div>
              <div className={`text-h3 font-bold ${
                overallHealth >= 80 ? 'text-green-400' :
                overallHealth >= 60 ? 'text-yellow-400' :
                overallHealth >= 40 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {overallHealth}%
              </div>
            </div>
            <button 
              className="burn-button px-4 py-2 touch-target"
              onClick={() => {
                // Navigate to production when ready
                if (overallHealth >= 80) {
                  window.location.href = '/production'
                } else {
                  alert('Complete more pre-production tasks before starting production')
                }
              }}
            >
              {overallHealth >= 80 ? '🚀 Launch Production' : '📋 Continue Planning'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 overflow-x-auto mobile-scrollbar">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewMode)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap
                transition-all duration-300 group relative touch-target
                ${currentView === item.id
                  ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30'
                  : 'text-medium-contrast hover:text-high-contrast hover:bg-white/5'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="text-left">
                <div className="font-medium flex items-center gap-2">
                  <span className="text-caption elegant-fire">{item.label}</span>
                  <div className={`
                    w-6 h-6 rounded-full text-xs flex items-center justify-center
                    ${item.completion === 100 
                      ? 'bg-green-500 text-white' 
                      : item.completion > 0 
                        ? 'bg-ember-gold text-black' 
                        : 'bg-white/20 text-white/60'
                    }
                  `}>
                    {item.completion === 100 ? '✓' : item.completion}
                  </div>
                </div>
                <div className="text-xs opacity-60 group-hover:opacity-80">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

// Render different views
function renderCurrentView(view: ViewMode, projectData: any, onUpdate: (data: any) => void) {
  switch (view) {
    case 'overview':
      return <ProductionPipelineOverview projectData={projectData} />
    case 'planning':
      return <PlanningBoard projectData={projectData} onUpdate={onUpdate} />
    case 'resources':
      return <ResourceManagementHub projectData={projectData} onUpdate={onUpdate} />
    case 'creative':
      return <CreativeBriefView projectData={projectData} onUpdate={onUpdate} />
    case 'technical':
      return <TechnicalPreparationView projectData={projectData} onUpdate={onUpdate} />
    default:
      return <ProductionPipelineOverview projectData={projectData} />
  }
}

// Placeholder components for future implementation
function CreativeBriefView({ projectData, onUpdate }: { projectData: any, onUpdate: (data: any) => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎨</div>
        <h2 className="text-h2 font-bold text-high-contrast mb-4 elegant-fire">Creative Brief</h2>
        <p className="text-body text-medium-contrast mb-8">
          Visual direction, style guide, and creative vision management coming soon.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card variant="content" className="p-6 text-left">
            <h3 className="text-h3 text-ember-gold mb-3">Visual Style</h3>
            <div className="text-body text-medium-contrast">
              Color palette, cinematography style, and visual mood definitions for your project.
            </div>
          </Card>
          <Card variant="content" className="p-6 text-left">
            <h3 className="text-h3 text-ember-gold mb-3">Brand Guidelines</h3>
            <div className="text-body text-medium-contrast">
              Logo usage, typography, and overall brand consistency across all materials.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TechnicalPreparationView({ projectData, onUpdate }: { projectData: any, onUpdate: (data: any) => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🔧</div>
        <h2 className="text-h2 font-bold text-high-contrast mb-4 elegant-fire">Technical Preparation</h2>
        <p className="text-body text-medium-contrast mb-8">
          Equipment specifications, technical requirements, and setup procedures coming soon.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card variant="content" className="p-6 text-left">
            <h3 className="text-h3 text-ember-gold mb-3">Equipment Specs</h3>
            <div className="text-body text-medium-contrast">
              Detailed technical specifications and compatibility requirements.
            </div>
          </Card>
          <Card variant="content" className="p-6 text-left">
            <h3 className="text-h3 text-ember-gold mb-3">Setup Procedures</h3>
            <div className="text-body text-medium-contrast">
              Step-by-step technical setup and calibration procedures.
            </div>
          </Card>
          <Card variant="content" className="p-6 text-left">
            <h3 className="text-h3 text-ember-gold mb-3">Backup Plans</h3>
            <div className="text-body text-medium-contrast">
              Contingency procedures and alternative equipment options.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper functions for completion calculations
function calculateOverallCompletion(projectData: any): number {
  if (!projectData) return 0
  
  let score = 0
  const maxScore = 100
  
  // Story foundation (20 points)
  if (projectData.synopsis) score += 10
  if (projectData.theme) score += 10
  
  // Pre-production content (60 points)
  if (projectData.script?.elements?.length > 0) score += 15
  if (projectData.storyboard?.shots?.length > 0) score += 15
  if (projectData.casting?.characters?.length > 0) score += 10
  if (projectData.location?.locations?.length > 0) score += 10
  if (projectData.production?.equipment?.length > 0) score += 10
  
  // Planning and organization (20 points)
  if (projectData.stages?.length > 0) score += 10
  if (projectData.resources) score += 10
  
  return Math.min(score, maxScore)
}

function calculatePlanningCompletion(projectData: any): number {
  if (!projectData) return 0
  
  let score = 0
  if (projectData.script?.elements?.length > 0) score += 25
  if (projectData.storyboard?.shots?.length > 0) score += 25
  if (projectData.casting?.characters?.length > 0) score += 25
  if (projectData.stages?.length > 0) score += 25
  
  return Math.min(score, 100)
}

function calculateResourceCompletion(projectData: any): number {
  if (!projectData) return 0
  
  let score = 0
  if (projectData.production?.equipment?.length > 0) score += 30
  if (projectData.location?.locations?.length > 0) score += 30
  if (projectData.resources?.budget) score += 20
  if (projectData.resources?.timeline) score += 20
  
  return Math.min(score, 100)
}

function calculateCreativeCompletion(projectData: any): number {
  if (!projectData) return 0
  
  let score = 0
  if (projectData.storyboard?.shots?.length > 0) score += 40
  if (projectData.synopsis) score += 30
  if (projectData.theme) score += 30
  
  return Math.min(score, 100)
}

function calculateTechnicalCompletion(projectData: any): number {
  if (!projectData) return 0
  
  let score = 0
  if (projectData.production?.equipment?.length > 0) score += 50
  if (projectData.props?.props?.length > 0) score += 25
  if (projectData.location?.locations?.length > 0) score += 25
  
  return Math.min(score, 100)
}

function getProjectStatus(completion: number): string {
  if (completion < 25) return 'Getting Started'
  if (completion < 50) return 'Early Planning'
  if (completion < 75) return 'Active Development'
  if (completion < 90) return 'Final Preparations'
  return 'Ready for Production'
}

// Initialize functions for new projects
function initializeProjectStages() {
  return [
    { id: 'script', name: 'Script Analysis', status: 'pending', priority: 'high' },
    { id: 'casting', name: 'Casting Requirements', status: 'pending', priority: 'high' },
    { id: 'locations', name: 'Location Scouting', status: 'pending', priority: 'medium' },
    { id: 'equipment', name: 'Equipment Planning', status: 'pending', priority: 'medium' },
    { id: 'scheduling', name: 'Production Schedule', status: 'pending', priority: 'high' },
    { id: 'budget', name: 'Budget Allocation', status: 'pending', priority: 'high' }
  ]
}

function initializeResources() {
  return {
    budget: { allocated: 0, spent: 0, categories: [] },
    equipment: { required: [], acquired: [], pending: [] },
    timeline: { startDate: null, endDate: null, milestones: [] }
  }
}

function initializeTimeline() {
  return {
    phases: [
      { name: 'Pre-Production', duration: 14, status: 'current' },
      { name: 'Production', duration: 21, status: 'pending' },
      { name: 'Post-Production', duration: 30, status: 'pending' }
    ]
  }
}
