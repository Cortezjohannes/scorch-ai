'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'

interface ProjectMetric {
  label: string
  value: string | number
  icon: string
  status: 'good' | 'warning' | 'critical'
  change?: string
  description?: string
}

interface CriticalPathItem {
  task: string
  status: 'completed' | 'in-progress' | 'pending' | 'blocked'
  duration: number
  completion?: number
  dependencies?: string[]
}

interface UpcomingDeadline {
  task: string
  date: string
  urgency: 'high' | 'medium' | 'low'
  category: string
}

export function ProductionPipelineOverview({ projectData }: { projectData: any }) {
  // Calculate metrics from existing project data
  const calculateMetrics = (data: any): ProjectMetric[] => {
    const storyboardCount = data?.storyboard?.shots?.length || 0
    const scriptPages = data?.script?.elements?.length || 0
    const castMembers = data?.casting?.characters?.length || 0
    const locations = data?.location?.locations?.length || 0
    const equipmentItems = data?.production?.equipment?.length || 0
    const propsCount = data?.props?.props?.length || 0

    return [
      { 
        label: 'Script Elements', 
        value: scriptPages, 
        icon: '📄', 
        status: scriptPages > 20 ? 'good' : scriptPages > 10 ? 'warning' : 'critical',
        description: 'Scene headings, actions, dialogue'
      },
      { 
        label: 'Storyboard Shots', 
        value: storyboardCount, 
        icon: '🎬', 
        status: storyboardCount > 15 ? 'good' : storyboardCount > 8 ? 'warning' : 'critical',
        description: 'Visual shot planning'
      },
      { 
        label: 'Cast Members', 
        value: castMembers, 
        icon: '🎭', 
        status: castMembers > 5 ? 'good' : castMembers > 2 ? 'warning' : 'critical',
        description: 'Character casting requirements'
      },
      { 
        label: 'Locations', 
        value: locations, 
        icon: '📍', 
        status: locations > 3 ? 'good' : locations > 1 ? 'warning' : 'critical',
        description: 'Filming locations secured'
      },
      { 
        label: 'Equipment Items', 
        value: equipmentItems, 
        icon: '📹', 
        status: equipmentItems > 10 ? 'good' : equipmentItems > 5 ? 'warning' : 'critical',
        description: 'Production equipment list'
      },
      { 
        label: 'Props & Wardrobe', 
        value: propsCount, 
        icon: '🎨', 
        status: propsCount > 8 ? 'good' : propsCount > 4 ? 'warning' : 'critical',
        description: 'Props and costume inventory'
      }
    ]
  }

  // Generate critical path from project status
  const generateCriticalPath = (data: any): CriticalPathItem[] => {
    const hasScript = data?.script?.elements?.length > 0
    const hasStoryboard = data?.storyboard?.shots?.length > 0
    const hasCasting = data?.casting?.characters?.length > 0
    const hasLocations = data?.location?.locations?.length > 0
    const hasEquipment = data?.production?.equipment?.length > 0

    return [
      { 
        task: 'Script Breakdown', 
        status: hasScript ? 'completed' : 'pending', 
        duration: 2,
        completion: hasScript ? 100 : 0
      },
      { 
        task: 'Storyboard Creation', 
        status: hasStoryboard ? 'completed' : hasScript ? 'in-progress' : 'pending', 
        duration: 3,
        completion: hasStoryboard ? 100 : hasScript ? 60 : 0,
        dependencies: ['Script Breakdown']
      },
      { 
        task: 'Casting Confirmation', 
        status: hasCasting ? 'completed' : 'pending', 
        duration: 4,
        completion: hasCasting ? 100 : 0
      },
      { 
        task: 'Location Locking', 
        status: hasLocations ? 'completed' : 'pending', 
        duration: 3,
        completion: hasLocations ? 100 : 0
      },
      { 
        task: 'Equipment Booking', 
        status: hasEquipment ? 'completed' : hasLocations ? 'in-progress' : 'pending', 
        duration: 2,
        completion: hasEquipment ? 100 : hasLocations ? 40 : 0,
        dependencies: ['Location Locking']
      },
      { 
        task: 'Final Production Schedule', 
        status: (hasScript && hasStoryboard && hasCasting && hasLocations) ? 'in-progress' : 'pending', 
        duration: 1,
        completion: (hasScript && hasStoryboard && hasCasting && hasLocations) ? 25 : 0,
        dependencies: ['Script Breakdown', 'Casting Confirmation', 'Location Locking']
      }
    ]
  }

  // Generate upcoming deadlines
  const generateUpcomingDeadlines = (data: any): UpcomingDeadline[] => {
    const now = new Date()
    const addDays = (days: number) => {
      const date = new Date(now)
      date.setDate(date.getDate() + days)
      return date.toISOString().split('T')[0]
    }

    return [
      { task: 'Script Final Draft', date: addDays(3), urgency: 'high', category: 'Script' },
      { task: 'Location Contracts', date: addDays(7), urgency: 'high', category: 'Location' },
      { task: 'Equipment Confirmation', date: addDays(10), urgency: 'medium', category: 'Production' },
      { task: 'Cast Final Fitting', date: addDays(14), urgency: 'medium', category: 'Casting' },
      { task: 'Technical Rehearsal', date: addDays(18), urgency: 'high', category: 'Production' },
      { task: 'Production Insurance', date: addDays(21), urgency: 'low', category: 'Legal' }
    ]
  }

  const projectMetrics = calculateMetrics(projectData)
  const criticalPath = generateCriticalPath(projectData)
  const upcomingDeadlines = generateUpcomingDeadlines(projectData)

  // Calculate overall project health
  const projectHealth = Math.round(
    projectMetrics.reduce((sum, metric) => {
      const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 20
      return sum + score
    }, 0) / projectMetrics.length
  )

  return (
    <div className="space-y-8">
      {/* Project Health Overview */}
      <ContentSection title="📊 Project Health Dashboard">
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
                <div className={`text-2xl font-bold mb-1 ${
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
             projectHealth >= 40 ? 'Needs Attention' : 'Critical Issues'}
          </p>
        </Card>

        <Card variant="hero" className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-center">
          <div className="text-4xl mb-3">⏱️</div>
          <h3 className="text-h3 text-white font-bold mb-2">Timeline Status</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {criticalPath.filter(item => item.status === 'completed').length}/{criticalPath.length}
          </div>
          <p className="text-white/80 text-body">Critical Tasks Complete</p>
        </Card>

        <Card variant="hero" className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-center">
          <div className="text-4xl mb-3">🚨</div>
          <h3 className="text-h3 text-white font-bold mb-2">Urgent Items</h3>
          <div className="text-3xl font-bold text-white mb-2">
            {upcomingDeadlines.filter(item => item.urgency === 'high').length}
          </div>
          <p className="text-white/80 text-body">High Priority Deadlines</p>
        </Card>
      </div>

      {/* Project Progress Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Critical Path */}
        <ContentSection title="🛣️ Critical Path">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {criticalPath.map((item, index) => (
                <motion.div
                  key={item.task}
                  className="p-4 rounded-lg bg-white/5 border-l-4 border-l-transparent hover:border-l-ember-gold transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${item.status === 'completed' ? 'bg-green-400 border-green-400' :
                        item.status === 'in-progress' ? 'bg-yellow-400 border-yellow-400' :
                        item.status === 'blocked' ? 'bg-red-400 border-red-400' :
                        'bg-transparent border-gray-400'
                      }
                    `}>
                      {item.status === 'completed' && (
                        <span className="text-white text-xs">✓</span>
                      )}
                      {item.status === 'in-progress' && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-high-contrast text-body">{item.task}</h4>
                      <div className="flex items-center gap-4 text-caption text-medium-contrast">
                        <span>{item.duration} day{item.duration !== 1 ? 's' : ''}</span>
                        {item.dependencies && (
                          <span>Depends on: {item.dependencies.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`
                      px-3 py-1 rounded-full text-caption font-medium
                      ${item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        item.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }
                    `}>
                      {item.status.replace('-', ' ')}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {item.completion !== undefined && (
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-green-400' :
                          item.status === 'in-progress' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.completion}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </ContentSection>

        {/* Upcoming Deadlines */}
        <ContentSection title="📅 Upcoming Deadlines">
          <Card variant="content" className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.slice(0, 6).map((deadline, index) => (
                <motion.div
                  key={deadline.task}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-high-contrast text-body">{deadline.task}</h4>
                    <div className="flex items-center gap-3 text-caption text-medium-contrast">
                      <span>{deadline.date}</span>
                      <span className="text-ember-gold">{deadline.category}</span>
                    </div>
                  </div>
                  
                  <div className={`
                    px-3 py-1 rounded-full text-caption font-medium
                    ${deadline.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                      deadline.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }
                  `}>
                    {deadline.urgency}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </ContentSection>
      </div>

      {/* Quick Actions */}
      <ContentSection title="🚀 Quick Actions">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="Script Analysis"
            description="Review script breakdown and requirements"
            icon="📝"
            action="Analyze Script"
            gradient="from-blue-500 to-purple-500"
            onClick={() => {/* Navigate to script view */}}
          />
          <QuickActionCard
            title="Storyboard Review"
            description="Check visual shot planning progress"
            icon="🎬"
            action="View Storyboard"
            gradient="from-green-500 to-blue-500"
            onClick={() => {/* Navigate to storyboard view */}}
          />
          <QuickActionCard
            title="Budget Tracking"
            description="Monitor financial status and allocations"
            icon="💰"
            action="View Budget"
            gradient="from-yellow-500 to-orange-500"
            onClick={() => {/* Navigate to budget view */}}
          />
          <QuickActionCard
            title="Export Report"
            description="Generate comprehensive progress summary"
            icon="📊"
            action="Create Report"
            gradient="from-purple-500 to-pink-500"
            onClick={() => {/* Generate report */}}
          />
        </div>
      </ContentSection>
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
        className={`bg-gradient-to-br ${gradient} cursor-pointer group p-6 touch-target-comfortable transition-all duration-300 hover:shadow-lg`}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="font-bold text-white mb-2 elegant-fire text-body-large">{title}</h3>
          <p className="text-white/80 text-caption mb-4 leading-relaxed">{description}</p>
          <button className="text-white font-medium group-hover:text-yellow-200 transition-colors text-body">
            {action} →
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
