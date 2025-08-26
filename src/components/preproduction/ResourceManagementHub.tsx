'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'

export function ResourceManagementHub({ projectData, onUpdate }: { 
  projectData: any
  onUpdate: (data: any) => void 
}) {
  const [activeTab, setActiveTab] = useState<'budget' | 'equipment' | 'schedule'>('budget')

  const tabs = [
    { id: 'budget', label: 'Budget', icon: '💰', description: 'Financial planning and tracking' },
    { id: 'equipment', label: 'Equipment', icon: '🎬', description: 'Equipment requirements and booking' },
    { id: 'schedule', label: 'Schedule', icon: '📅', description: 'Timeline and milestone management' }
  ]

  return (
    <div className="space-y-6">
      {/* Resource Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-bold text-high-contrast elegant-fire">Resource Management</h2>
        <div className="flex gap-2">
          {tabs.map((tab) => (
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
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline text-caption">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'budget' && <BudgetManagement projectData={projectData} />}
        {activeTab === 'equipment' && <EquipmentManagement projectData={projectData} />}
        {activeTab === 'schedule' && <ScheduleManagement projectData={projectData} />}
      </motion.div>
    </div>
  )
}

function BudgetManagement({ projectData }: { projectData: any }) {
  // Generate realistic budget data based on project scope
  const generateBudgetCategories = (data: any) => {
    const hasStoryboard = data?.storyboard?.shots?.length > 0
    const hasScript = data?.script?.elements?.length > 0
    const castCount = data?.casting?.characters?.length || 4
    const locationCount = data?.location?.locations?.length || 3
    const equipmentCount = data?.production?.equipment?.length || 10

    // Base budget calculation
    const baseBudget = 50000
    const scaleFactor = 1 + (castCount * 0.2) + (locationCount * 0.15) + (equipmentCount * 0.05)
    const totalBudget = Math.round(baseBudget * scaleFactor)

    return [
      { 
        name: 'Cast & Crew', 
        allocated: Math.round(totalBudget * 0.45), 
        spent: Math.round(totalBudget * 0.45 * 0.25), 
        icon: '👥',
        items: ['Director', 'Cinematographer', 'Lead Actors', 'Supporting Cast', 'Crew'],
        status: 'active'
      },
      { 
        name: 'Equipment', 
        allocated: Math.round(totalBudget * 0.25), 
        spent: Math.round(totalBudget * 0.25 * 0.35), 
        icon: '🎬',
        items: ['Camera Package', 'Audio Equipment', 'Lighting Kit', 'Grips & Gaffers'],
        status: hasStoryboard ? 'active' : 'pending'
      },
      { 
        name: 'Locations', 
        allocated: Math.round(totalBudget * 0.15), 
        spent: Math.round(totalBudget * 0.15 * 0.60), 
        icon: '📍',
        items: ['Location Fees', 'Permits', 'Transportation', 'Catering'],
        status: locationCount > 0 ? 'active' : 'pending'
      },
      { 
        name: 'Post-Production', 
        allocated: Math.round(totalBudget * 0.10), 
        spent: 0, 
        icon: '🎞️',
        items: ['Editing Suite', 'Color Grading', 'Sound Mix', 'VFX'],
        status: 'future'
      },
      { 
        name: 'Marketing', 
        allocated: Math.round(totalBudget * 0.08), 
        spent: Math.round(totalBudget * 0.08 * 0.15), 
        icon: '📢',
        items: ['Social Media', 'Poster Design', 'Website', 'Press Kit'],
        status: 'active'
      },
      { 
        name: 'Contingency', 
        allocated: Math.round(totalBudget * 0.07), 
        spent: Math.round(totalBudget * 0.07 * 0.10), 
        icon: '🛡️',
        items: ['Emergency Fund', 'Insurance', 'Legal', 'Miscellaneous'],
        status: 'reserve'
      }
    ]
  }

  const budgetCategories = generateBudgetCategories(projectData)
  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const burnRate = Math.round((totalSpent / totalAllocated) * 100)

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-h3 text-high-contrast font-bold">
            ${totalAllocated.toLocaleString()}
          </div>
          <div className="text-caption text-medium-contrast">Total Budget</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">💳</div>
          <div className="text-h3 text-ember-gold font-bold">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-caption text-medium-contrast">Spent ({burnRate}%)</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">💵</div>
          <div className="text-h3 text-green-400 font-bold">
            ${(totalAllocated - totalSpent).toLocaleString()}
          </div>
          <div className="text-caption text-medium-contrast">Remaining</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">📊</div>
          <div className={`text-h3 font-bold ${
            burnRate > 80 ? 'text-red-400' : burnRate > 60 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {burnRate < 25 ? 'Low' : burnRate < 60 ? 'Normal' : burnRate < 80 ? 'High' : 'Critical'}
          </div>
          <div className="text-caption text-medium-contrast">Burn Rate</div>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <ContentSection title="💼 Budget Breakdown">
        <Card variant="content" className="p-6">
          <div className="space-y-4">
            {budgetCategories.map((category, index) => {
              const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
              const status = percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'good'
              
              return (
                <motion.div
                  key={category.name}
                  className="p-4 rounded-lg bg-white/5 border-l-4 border-l-transparent hover:border-l-ember-gold transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium text-high-contrast text-body">{category.name}</h4>
                        <p className="text-caption text-medium-contrast">
                          ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-body font-bold text-high-contrast">
                        {percentage.toFixed(1)}%
                      </div>
                      <div className={`
                        text-xs px-2 py-1 rounded border
                        ${category.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          category.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          category.status === 'future' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }
                      `}>
                        {category.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <motion.div
                      className={`
                        h-2 rounded-full
                        ${status === 'good' ? 'bg-green-400' :
                          status === 'warning' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }
                      `}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    />
                  </div>

                  {/* Budget Items */}
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="px-2 py-1 bg-white/10 rounded text-caption text-medium-contrast"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </ContentSection>

      {/* Budget Alerts */}
      <ContentSection title="🚨 Budget Alerts">
        <div className="grid md:grid-cols-2 gap-4">
          {budgetCategories
            .filter(cat => {
              const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0
              return percentage > 70 || cat.status === 'pending'
            })
            .map((category, index) => {
              const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
              const isOverspent = percentage > 90
              
              return (
                <Card key={category.name} variant="action" className={`p-4 ${
                  isOverspent ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' :
                  'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-high-contrast">{category.name}</h4>
                      <p className="text-caption text-medium-contrast">
                        {isOverspent ? 'Over budget!' : category.status === 'pending' ? 'Awaiting allocation' : 'High usage'}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })
          }
        </div>
      </ContentSection>
    </div>
  )
}

function EquipmentManagement({ projectData }: { projectData: any }) {
  // Generate equipment lists based on project requirements
  const generateEquipmentLists = (data: any) => {
    const hasStoryboard = data?.storyboard?.shots?.length > 0
    const hasScript = data?.script?.elements?.length > 0
    const scriptComplexity = data?.script?.elements?.length || 10
    
    return [
      {
        name: 'Camera Department',
        totalCost: 2400,
        items: [
          { name: 'RED Komodo 6K', status: hasStoryboard ? 'confirmed' : 'pending', cost: 1200, duration: '14 days', priority: 'high' },
          { name: 'Sony FX6 (Backup)', status: 'pending', cost: 800, duration: '7 days', priority: 'medium' },
          { name: 'Tripod & Support', status: 'confirmed', cost: 200, duration: '14 days', priority: 'high' },
          { name: 'Lens Package', status: hasScript ? 'confirmed' : 'pending', cost: 600, duration: '14 days', priority: 'high' }
        ]
      },
      {
        name: 'Audio Department',
        totalCost: 650,
        items: [
          { name: 'Sound Devices 633', status: 'confirmed', cost: 300, duration: '14 days', priority: 'high' },
          { name: 'Shotgun Mics (3x)', status: 'confirmed', cost: 150, duration: '14 days', priority: 'high' },
          { name: 'Wireless Lavs (4x)', status: 'pending', cost: 200, duration: '14 days', priority: 'medium' }
        ]
      },
      {
        name: 'Lighting Department', 
        totalCost: 1100,
        items: [
          { name: 'ARRI SkyPanel S60', status: scriptComplexity > 15 ? 'pending' : 'not-needed', cost: 600, duration: '10 days', priority: 'medium' },
          { name: 'LED Panel Kit', status: 'owned', cost: 0, duration: '14 days', priority: 'high' },
          { name: 'Practical Lights', status: 'pending', cost: 300, duration: '14 days', priority: 'low' },
          { name: 'Grip Equipment', status: 'confirmed', cost: 200, duration: '14 days', priority: 'medium' }
        ]
      },
      {
        name: 'Support Equipment',
        totalCost: 450,
        items: [
          { name: 'Monitor & Wireless', status: 'confirmed', cost: 250, duration: '14 days', priority: 'high' },
          { name: 'Storage & Backup', status: 'confirmed', cost: 100, duration: '14 days', priority: 'high' },
          { name: 'Power & Cables', status: 'owned', cost: 0, duration: '14 days', priority: 'high' },
          { name: 'Camera Accessories', status: 'pending', cost: 100, duration: '14 days', priority: 'low' }
        ]
      }
    ]
  }

  const equipmentCategories = generateEquipmentLists(projectData)
  const totalItems = equipmentCategories.reduce((sum, cat) => sum + cat.items.length, 0)
  const confirmedItems = equipmentCategories.reduce((sum, cat) => 
    sum + cat.items.filter(item => item.status === 'confirmed' || item.status === 'owned').length, 0)
  const pendingItems = equipmentCategories.reduce((sum, cat) => 
    sum + cat.items.filter(item => item.status === 'pending').length, 0)
  const totalCost = equipmentCategories.reduce((sum, cat) => 
    sum + cat.items.reduce((catSum, item) => catSum + item.cost, 0), 0)

  return (
    <div className="space-y-6">
      {/* Equipment Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">📹</div>
          <div className="text-h3 text-high-contrast font-bold">{totalItems}</div>
          <div className="text-caption text-medium-contrast">Total Items</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-h3 text-green-400 font-bold">{confirmedItems}</div>
          <div className="text-caption text-medium-contrast">Confirmed</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-h3 text-yellow-400 font-bold">{pendingItems}</div>
          <div className="text-caption text-medium-contrast">Pending</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-h3 text-ember-gold font-bold">${(totalCost/1000).toFixed(1)}k</div>
          <div className="text-caption text-medium-contrast">Total Cost</div>
        </Card>
      </div>

      {/* Equipment Lists */}
      <div className="space-y-6">
        {equipmentCategories.map((category, categoryIndex) => (
          <ContentSection key={category.name} title={`${category.name} ($${category.totalCost.toLocaleString()})`}>
            <Card variant="content" className="p-6">
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const statusConfig = {
                    'confirmed': { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
                    'pending': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '⏳' },
                    'owned': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🏠' },
                    'not-needed': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '❌' }
                  }
                  
                  const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pending
                  
                  return (
                    <motion.div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (categoryIndex * 0.2) + (itemIndex * 0.1) }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{config.icon}</span>
                        <div>
                          <h4 className="font-medium text-high-contrast text-body">{item.name}</h4>
                          <div className="flex items-center gap-3 text-caption text-medium-contrast">
                            <span>{item.duration}</span>
                            <span className={`
                              px-2 py-1 rounded text-xs border
                              ${item.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-green-500/20 text-green-400 border-green-500/30'
                              }
                            `}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-body font-medium text-high-contrast">
                          {item.cost > 0 ? `$${item.cost}` : 'Owned'}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border ${config.color}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </ContentSection>
        ))}
      </div>

      {/* Equipment Alerts */}
      <ContentSection title="⚠️ Equipment Alerts">
        <div className="grid md:grid-cols-2 gap-4">
          {equipmentCategories.flatMap(cat => 
            cat.items.filter(item => item.status === 'pending' && item.priority === 'high')
          ).map((item, index) => (
            <Card key={`${item.name}-${index}`} variant="action" className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-high-contrast">{item.name}</h4>
                  <p className="text-caption text-medium-contrast">High priority item needs confirmation</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ContentSection>
    </div>
  )
}

function ScheduleManagement({ projectData }: { projectData: any }) {
  // Generate timeline based on project data
  const generateMilestones = (data: any) => {
    const hasScript = data?.script?.elements?.length > 0
    const hasStoryboard = data?.storyboard?.shots?.length > 0
    const hasCasting = data?.casting?.characters?.length > 0
    const hasLocations = data?.location?.locations?.length > 0

    const now = new Date()
    const addDays = (days: number) => {
      const date = new Date(now)
      date.setDate(date.getDate() + days)
      return date.toISOString().split('T')[0]
    }

    return [
      { 
        name: 'Pre-Production Start', 
        date: addDays(-7), 
        status: 'completed',
        category: 'Planning',
        description: 'Project kickoff and initial planning'
      },
      { 
        name: 'Script Finalization', 
        date: addDays(-3), 
        status: hasScript ? 'completed' : 'in-progress',
        category: 'Script',
        description: 'Final script approval and breakdown'
      },
      { 
        name: 'Storyboard Creation', 
        date: addDays(2), 
        status: hasStoryboard ? 'completed' : hasScript ? 'in-progress' : 'pending',
        category: 'Visual',
        description: 'Visual planning and shot design'
      },
      { 
        name: 'Cast Confirmation', 
        date: addDays(5), 
        status: hasCasting ? 'completed' : 'in-progress',
        category: 'Casting', 
        description: 'Final casting decisions and contracts'
      },
      { 
        name: 'Location Locking', 
        date: addDays(8), 
        status: hasLocations ? 'completed' : 'pending',
        category: 'Locations',
        description: 'Secure all filming locations'
      },
      { 
        name: 'Equipment Booking', 
        date: addDays(12), 
        status: hasLocations ? 'in-progress' : 'pending',
        category: 'Equipment',
        description: 'Finalize equipment rentals and bookings'
      },
      { 
        name: 'Technical Rehearsal', 
        date: addDays(18), 
        status: 'pending',
        category: 'Production',
        description: 'Run through technical setups'
      },
      { 
        name: 'Production Start', 
        date: addDays(21), 
        status: 'pending',
        category: 'Production',
        description: 'First day of principal photography'
      }
    ]
  }

  const milestones = generateMilestones(projectData)
  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalDays = 28
  const daysElapsed = 7
  const progressPercentage = Math.round((completedMilestones / milestones.length) * 100)

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-h3 text-high-contrast font-bold">{totalDays} days</div>
          <div className="text-caption text-medium-contrast">Total Timeline</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-h3 text-ember-gold font-bold">{totalDays - daysElapsed} days</div>
          <div className="text-caption text-medium-contrast">Remaining</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-h3 text-green-400 font-bold">{progressPercentage}%</div>
          <div className="text-caption text-medium-contrast">Progress</div>
        </Card>
        <Card variant="status" className="text-center p-4">
          <div className="text-3xl mb-2">📊</div>
          <div className={`text-h3 font-bold ${
            progressPercentage >= 80 ? 'text-green-400' :
            progressPercentage >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {progressPercentage >= 80 ? 'Excellent' :
             progressPercentage >= 60 ? 'On Track' : 'Behind'}
          </div>
          <div className="text-caption text-medium-contrast">Status</div>
        </Card>
      </div>

      {/* Timeline Visualization */}
      <ContentSection title="📈 Project Timeline">
        <Card variant="content" className="p-6">
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const statusConfig = {
                'completed': { color: 'bg-green-400', textColor: 'text-green-400', icon: '✅' },
                'in-progress': { color: 'bg-yellow-400', textColor: 'text-yellow-400', icon: '🔄' },
                'pending': { color: 'bg-gray-400', textColor: 'text-gray-400', icon: '⏳' }
              }
              
              const config = statusConfig[milestone.status as keyof typeof statusConfig]
              
              return (
                <motion.div
                  key={milestone.name}
                  className="relative flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Timeline Line */}
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-white/20" />
                  )}
                  
                  <div className={`w-4 h-4 rounded-full ${config.color} shrink-0`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-high-contrast text-body">{milestone.name}</h4>
                      <span className="text-caption text-medium-contrast">{milestone.date}</span>
                    </div>
                    <p className="text-caption text-medium-contrast mb-2">{milestone.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs border ${
                        milestone.category === 'Planning' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        milestone.category === 'Script' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        milestone.category === 'Visual' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                        milestone.category === 'Casting' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                        milestone.category === 'Locations' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        milestone.category === 'Equipment' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {milestone.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${
                        milestone.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        milestone.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {config.icon} {milestone.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </ContentSection>

      {/* Critical Deadlines */}
      <ContentSection title="🚨 Critical Deadlines">
        <div className="grid md:grid-cols-2 gap-4">
          {milestones
            .filter(milestone => milestone.status === 'pending' || milestone.status === 'in-progress')
            .slice(0, 4)
            .map((milestone, index) => {
              const isUrgent = new Date(milestone.date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
              
              return (
                <Card key={milestone.name} variant="action" className={`p-4 ${
                  isUrgent ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' :
                  'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isUrgent ? '🚨' : '⏰'}</span>
                    <div>
                      <h4 className="font-medium text-high-contrast">{milestone.name}</h4>
                      <div className="flex items-center gap-2 text-caption text-medium-contrast">
                        <span>{milestone.date}</span>
                        <span>•</span>
                        <span className="text-ember-gold">{milestone.category}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          }
        </div>
      </ContentSection>
    </div>
  )
}
