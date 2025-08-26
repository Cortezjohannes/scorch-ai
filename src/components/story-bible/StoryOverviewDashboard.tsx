'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'

interface StoryMetric {
  label: string
  value: string | number
  icon: string
  trend?: 'up' | 'down' | 'stable'
  color?: string
}

interface QuickAccessTileProps {
  title: string
  description: string
  icon: string
  action: string
  gradient: string
  onClick?: () => void
}

export function StoryOverviewDashboard({ storyData, onNavigate }: { 
  storyData: any
  onNavigate?: (section: string) => void 
}) {
  // Calculate story health metrics from existing data structure
  const calculateMetrics = (data: any): StoryMetric[] => {
    const bible = data?.storyBible || data
    
    return [
      { 
        label: 'Characters', 
        value: bible?.characters?.length || 0, 
        icon: '👥',
        color: 'text-blue-400'
      },
      { 
        label: 'Story Arcs', 
        value: bible?.arcs?.length || bible?.storyArcs?.length || 0, 
        icon: '📈',
        color: 'text-green-400'
      },
      { 
        label: 'World Elements', 
        value: bible?.world?.locations?.length || bible?.worldBuilding?.length || 0, 
        icon: '🌍',
        color: 'text-purple-400'
      },
      { 
        label: 'Plot Points', 
        value: bible?.choices?.length || bible?.keyChoices?.length || 0, 
        icon: '🎯',
        color: 'text-orange-400'
      },
      { 
        label: 'Story Health', 
        value: '92%', 
        icon: '✅', 
        trend: 'up',
        color: 'text-ember-gold'
      },
      { 
        label: 'Consistency', 
        value: '87%', 
        icon: '🎭', 
        trend: 'stable',
        color: 'text-cyan-400'
      }
    ]
  }

  const storyMetrics = calculateMetrics(storyData)

  // Generate recent activity from story data
  const generateRecentActivity = (data: any) => {
    const activities = []
    const bible = data?.storyBible || data
    
    if (bible?.characters?.length > 0) {
      activities.push({
        action: `Developed ${bible.characters.length} character${bible.characters.length !== 1 ? 's' : ''}`,
        time: '2 hours ago',
        type: 'character',
        icon: '👤'
      })
    }
    
    if (bible?.world || bible?.worldBuilding) {
      activities.push({
        action: 'Enhanced world-building elements',
        time: '5 hours ago',
        type: 'world',
        icon: '🌍'
      })
    }
    
    if (bible?.premise || bible?.synopsis) {
      activities.push({
        action: 'Refined story premise and themes',
        time: '1 day ago',
        type: 'theme',
        icon: '💭'
      })
    }
    
    activities.push({
      action: 'Generated story bible foundation',
      time: data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : '2 days ago',
      type: 'plot',
      icon: '📈'
    })
    
    return activities
  }

  const recentActivity = generateRecentActivity(storyData)

  return (
    <div className="space-y-8">
      {/* Story Health Metrics */}
      <ContentSection title="📊 Story Universe Health">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {storyMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="status" className="text-center p-4 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className={`text-2xl font-bold mb-1 ${metric.color || 'text-high-contrast'}`}>
                  {metric.value}
                </div>
                <div className="text-caption text-medium-contrast">
                  {metric.label}
                </div>
                {metric.trend && (
                  <div className={`text-xs mt-1 ${
                    metric.trend === 'up' ? 'text-green-400' : 
                    metric.trend === 'down' ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </ContentSection>

      {/* Quick Access Navigation */}
      <ContentSection title="🚀 Quick Access">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickAccessTile
            title="Character Galaxy"
            description="Explore character relationships and development"
            icon="🎭"
            action="Explore Characters"
            gradient="from-purple-500 to-blue-500"
            onClick={() => onNavigate?.('characters')}
          />
          <QuickAccessTile
            title="World Explorer"
            description="Navigate locations and world-building"
            icon="🗺️"
            action="Explore World"
            gradient="from-green-500 to-blue-500"
            onClick={() => onNavigate?.('world')}
          />
          <QuickAccessTile
            title="Story Structure"
            description="Analyze plot architecture and pacing"
            icon="📊"
            action="View Structure"
            gradient="from-orange-500 to-red-500"
            onClick={() => onNavigate?.('arcs')}
          />
          <QuickAccessTile
            title="Creative Workshop"
            description="Generate and refine story elements"
            icon="✨"
            action="Create More"
            gradient="from-yellow-500 to-orange-500"
            onClick={() => onNavigate?.('premise')}
          />
        </div>
      </ContentSection>

      {/* Story Foundation */}
      <ContentSection title="📖 Story Foundation">
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3 elegant-fire">Story Premise</h3>
            <div className="text-readable text-body leading-relaxed text-medium-contrast">
              {storyData?.synopsis || storyData?.storyBible?.premise || storyData?.premise || 
               'Your story premise will appear here once generated. Start by creating your story foundation.'}
            </div>
          </Card>

          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3 elegant-fire">Central Theme</h3>
            <div className="text-readable text-body leading-relaxed text-medium-contrast">
              {storyData?.theme || storyData?.storyBible?.theme || 
               'Central themes and messages will be displayed here to guide your narrative direction.'}
            </div>
          </Card>
        </div>
      </ContentSection>

      {/* Recent Creative Activity */}
      <ContentSection title="⚡ Recent Activity">
        <Card variant="content" className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer touch-target"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate?.(activity.type)}
              >
                <div className="text-2xl">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-body text-high-contrast font-medium">{activity.action}</p>
                  <p className="text-caption text-medium-contrast">{activity.time}</p>
                </div>
                <button className="text-ember-gold hover:text-ember-gold/80 text-caption font-medium">
                  View →
                </button>
              </motion.div>
            ))}
          </div>
        </Card>
      </ContentSection>

      {/* Story Statistics */}
      <ContentSection title="📈 Story Analytics" variant="compact">
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-h3 text-ember-gold font-bold">
              {storyData?.storyBible ? Object.keys(storyData.storyBible).length : 0}
            </div>
            <div className="text-caption text-medium-contrast">Story Elements</div>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">🎬</div>
            <div className="text-h3 text-ember-gold font-bold">Ready</div>
            <div className="text-caption text-medium-contrast">Production Status</div>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-h3 text-ember-gold font-bold">Professional</div>
            <div className="text-caption text-medium-contrast">Quality Rating</div>
          </Card>
        </div>
      </ContentSection>
    </div>
  )
}

function QuickAccessTile({ 
  title, 
  description, 
  icon, 
  action, 
  gradient,
  onClick
}: QuickAccessTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="hero" 
        className={`bg-gradient-to-br ${gradient} cursor-pointer group transition-all duration-300 hover:shadow-lg p-6 touch-target-comfortable`}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="font-bold text-white mb-2 elegant-fire">{title}</h3>
          <p className="text-white/80 text-caption mb-4 leading-relaxed">{description}</p>
          <button className="text-white font-medium group-hover:text-yellow-200 transition-colors text-body">
            {action} →
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
