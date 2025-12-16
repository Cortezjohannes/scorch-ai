'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArcPreProductionExamplesProps {
  theme: 'light' | 'dark'
}

export default function ArcPreProductionExamples({ theme }: ArcPreProductionExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [activeLayout, setActiveLayout] = React.useState(1)
  const [activeTab, setActiveTab] = React.useState<'casting' | 'schedule' | 'budget' | 'equipment' | 'locations' | 'props' | 'permits' | null>('casting')
  
  // When switching to Dashboard Grid layout, show overview first
  React.useEffect(() => {
    if (activeLayout === 3 && activeTab !== null) {
      setActiveTab(null)
    } else if (activeLayout !== 3 && activeTab === null) {
      setActiveTab('casting')
    }
  }, [activeLayout, activeTab])
  
  const [activeConcept, setActiveConcept] = React.useState<Record<string, number>>({
    casting: 1,
    schedule: 1,
    budget: 1,
    equipment: 1,
    locations: 1,
    props: 1,
    permits: 1
  })

  // Sample Arc Data
  const sampleArc = {
    arcIndex: 1,
    arcTitle: 'The Foundation',
    episodeNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
    totalEpisodes: 8,
    completion: 72
  }

  // Sample Casting Data
  const sampleCasting = {
    cast: [
      {
        id: '1',
        actorName: 'John Smith',
        characterName: 'Jason Calacanis',
        roleType: 'Lead',
        episodes: [1, 2, 3, 4, 5, 6, 7, 8],
        status: 'Confirmed',
        payRate: '$15,000/episode',
        contact: 'john@agent.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '2',
        actorName: 'Jane Doe',
        characterName: 'Molly Wood',
        roleType: 'Lead',
        episodes: [1, 2, 3, 4, 5, 6, 7, 8],
        status: 'Confirmed',
        payRate: '$15,000/episode',
        contact: 'jane@agent.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '3',
        actorName: 'Mike Johnson',
        characterName: 'Sterling',
        roleType: 'Supporting',
        episodes: [1, 2, 3, 4, 6],
        status: 'Confirmed',
        payRate: '$5,000/episode',
        contact: 'mike@agent.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '4',
        actorName: 'Sarah Williams',
        characterName: 'Anya',
        roleType: 'Supporting',
        episodes: [2, 3, 5, 9, 13, 16],
        status: 'Confirmed',
        payRate: '$5,000/episode',
        contact: 'sarah@agent.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '5',
        actorName: 'TBD',
        characterName: 'Marco',
        roleType: 'Supporting',
        episodes: [2, 3, 13, 17],
        status: 'Needs Casting',
        payRate: '$5,000/episode',
        contact: '',
        availability: 'TBD',
        contractStatus: 'Pending'
      },
      {
        id: '6',
        actorName: 'Background Actors',
        characterName: 'Warriors Fans',
        roleType: 'Extra',
        episodes: [2],
        status: 'Confirmed',
        payRate: '$200/day',
        contact: 'casting@extras.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '7',
        actorName: 'Background Actors',
        characterName: 'Team Of Founders',
        roleType: 'Extra',
        episodes: [3],
        status: 'Confirmed',
        payRate: '$200/day',
        contact: 'casting@extras.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '8',
        actorName: 'Background Actors',
        characterName: 'Co-founders',
        roleType: 'Extra',
        episodes: [13],
        status: 'Confirmed',
        payRate: '$200/day',
        contact: 'casting@extras.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '9',
        actorName: 'Background Actors',
        characterName: 'Launch Lieutenants',
        roleType: 'Extra',
        episodes: [9],
        status: 'Confirmed',
        payRate: '$200/day',
        contact: 'casting@extras.com',
        availability: 'Available',
        contractStatus: 'Signed'
      },
      {
        id: '10',
        actorName: 'TBD',
        characterName: 'Disastrous Call',
        roleType: 'Extra',
        episodes: [1],
        status: 'Needs Casting',
        payRate: '$200/day',
        contact: '',
        availability: 'TBD',
        contractStatus: 'Pending'
      }
    ],
    totalCast: 10,
    confirmed: 8,
    needsCasting: 2,
    leadRoles: 3,
    supporting: 2,
    extras: 5,
    totalPayroll: 120000
  }

  // Sample Schedule Data
  const sampleSchedule = {
    shootingDays: [
      {
        day: 1,
        date: '2024-03-15',
        location: 'LAUNCH Offices',
        scenes: [
          { episode: 1, scene: 1, title: 'The Pressure Mounts', time: '09:00-12:00', cast: ['Jason', 'Molly'] },
          { episode: 1, scene: 3, title: 'Diamond Hands', time: '13:00-17:00', cast: ['Jason', 'Molly', 'Team'] }
        ],
        status: 'Scheduled'
      },
      {
        day: 2,
        date: '2024-03-16',
        location: 'Palo Alto - Main Street',
        scenes: [
          { episode: 1, scene: 2, title: 'The Test', time: '10:00-14:00', cast: ['Jason'] }
        ],
        status: 'Scheduled'
      },
      {
        day: 3,
        date: '2024-03-18',
        location: 'LAUNCH Offices',
        scenes: [
          { episode: 2, scene: 1, title: 'Opening Scene', time: '09:00-12:00', cast: ['Jason', 'Molly'] },
          { episode: 2, scene: 2, title: 'Team Meeting', time: '13:00-16:00', cast: ['Jason', 'Molly', 'Sterling'] }
        ],
        status: 'Scheduled'
      },
      {
        day: 4,
        date: '2024-03-19',
        location: 'Silicon Valley Street',
        scenes: [
          { episode: 2, scene: 3, title: 'Street Walk', time: '10:00-13:00', cast: ['Jason'] }
        ],
        status: 'Scheduled'
      },
      {
        day: 5,
        date: '2024-03-20',
        location: 'LAUNCH Offices',
        scenes: [
          { episode: 3, scene: 1, title: 'Founder Meeting', time: '09:00-12:00', cast: ['Jason', 'Molly', 'Team'] }
        ],
        status: 'Scheduled'
      }
    ],
    totalDays: 20,
    scheduledDays: 5,
    remainingDays: 15
  }

  // Sample Budget Data
  const sampleBudget = {
    totalBudget: 500000,
    spent: 125000,
    remaining: 375000,
    categories: [
      { name: 'Cast', budget: 120000, spent: 30000, remaining: 90000 },
      { name: 'Crew', budget: 150000, spent: 40000, remaining: 110000 },
      { name: 'Equipment', budget: 80000, spent: 25000, remaining: 55000 },
      { name: 'Locations', budget: 60000, spent: 15000, remaining: 45000 },
      { name: 'Props/Wardrobe', budget: 40000, spent: 10000, remaining: 30000 },
      { name: 'Post-Production', budget: 50000, spent: 5000, remaining: 45000 }
    ],
    lineItems: [
      { category: 'Cast', item: 'Lead Actor 1', budget: 120000, spent: 30000, remaining: 90000 },
      { category: 'Cast', item: 'Lead Actor 2', budget: 120000, spent: 30000, remaining: 90000 },
      { category: 'Crew', item: 'Director', budget: 50000, spent: 15000, remaining: 35000 },
      { category: 'Crew', item: 'DP', budget: 40000, spent: 12000, remaining: 28000 },
      { category: 'Equipment', item: 'Camera Rental', budget: 30000, spent: 10000, remaining: 20000 },
      { category: 'Equipment', item: 'Lighting', budget: 25000, spent: 8000, remaining: 17000 },
      { category: 'Locations', item: 'LAUNCH Offices', budget: 30000, spent: 8000, remaining: 22000 },
      { category: 'Locations', item: 'Palo Alto Street', budget: 15000, spent: 4000, remaining: 11000 }
    ]
  }

  // Sample Equipment Data
  const sampleEquipment = {
    camera: [
      { id: '1', name: 'RED Komodo 6K', quantity: 2, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 5000 },
      { id: '2', name: 'Canon C70', quantity: 1, episodes: [1, 2, 3], status: 'Booked', rental: true, cost: 2000 },
      { id: '3', name: 'Sony FX6', quantity: 1, episodes: [4, 5, 6], status: 'Booked', rental: true, cost: 2500 }
    ],
    lighting: [
      { id: '1', name: 'ARRI SkyPanel S60', quantity: 4, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 3000 },
      { id: '2', name: 'Kino Flo Celeb 400', quantity: 2, episodes: [1, 2, 3], status: 'Booked', rental: true, cost: 1500 }
    ],
    audio: [
      { id: '1', name: 'Sennheiser MKH 416', quantity: 2, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 800 },
      { id: '2', name: 'Zoom F8n', quantity: 1, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 600 }
    ],
    grip: [
      { id: '1', name: 'C-Stand', quantity: 8, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 400 },
      { id: '2', name: 'Sandbags', quantity: 16, episodes: [1, 2, 3, 4, 5, 6, 7, 8], status: 'Booked', rental: true, cost: 200 }
    ]
  }

  // Sample Locations Data
  const sampleLocations = [
    {
      id: '1',
      name: 'LAUNCH Offices',
      address: '1234 Silicon Valley Blvd, Palo Alto, CA',
      type: 'INT',
      episodes: [1, 2, 3, 4, 5, 6, 7, 8],
      scenes: [1, 3, 5, 7, 9, 11, 13, 15],
      availability: 'Confirmed',
      cost: 8000,
      contact: 'facilities@launch.com',
      notes: 'Main office space, conference room available',
      photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop']
    },
    {
      id: '2',
      name: 'Palo Alto - Main Street',
      address: 'University Ave, Palo Alto, CA',
      type: 'EXT',
      episodes: [1, 2, 3],
      scenes: [2, 4, 6],
      availability: 'Confirmed',
      cost: 4000,
      contact: 'permits@paloalto.gov',
      notes: 'Street permit required, 9am-5pm only',
      photos: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop']
    },
    {
      id: '3',
      name: 'Silicon Valley Street',
      address: 'Castro St, Mountain View, CA',
      type: 'EXT',
      episodes: [2, 3, 4],
      scenes: [3, 5, 7],
      availability: 'Confirmed',
      cost: 3500,
      contact: 'permits@mountainview.gov',
      notes: 'Weekend shooting preferred',
      photos: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=450&fit=crop']
    },
    {
      id: '4',
      name: 'Rehearsal Studio A',
      address: '456 Production Way, Los Angeles, CA',
      type: 'INT',
      episodes: [],
      scenes: [],
      availability: 'Confirmed',
      cost: 2000,
      contact: 'studio@rehearsal.com',
      notes: 'Rehearsal space, not for filming',
      photos: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=450&fit=crop']
    }
  ]

  // Sample Props/Wardrobe Data
  const samplePropsWardrobe = {
    props: [
      { id: '1', name: 'Conference Table', description: 'Large mahogany table', character: 'N/A', episodes: [1, 3, 5, 7], scenes: [1, 3, 5, 7], quantity: 1, status: 'Obtained', cost: 0 },
      { id: '2', name: 'Laptops', description: 'MacBook Pro', character: 'Team', episodes: [1, 2, 3], scenes: [1, 2, 3], quantity: 3, status: 'Obtained', cost: 0 },
      { id: '3', name: 'Phone', description: 'iPhone', character: 'Jason', episodes: [1, 2, 3], scenes: [2, 4, 6], quantity: 1, status: 'Obtained', cost: 0 },
      { id: '4', name: 'Whiteboard', description: 'Large whiteboard', character: 'N/A', episodes: [1, 2, 3], scenes: [1, 2, 3], quantity: 1, status: 'Sourced', cost: 200 }
    ],
    wardrobe: [
      { id: '1', name: 'Business Suit', description: 'Navy blue, tailored', character: 'Jason', episodes: [1, 2, 3, 4, 5, 6, 7, 8], scenes: [1, 2, 3, 4, 5, 6, 7, 8], quantity: 1, status: 'Obtained', cost: 1500 },
      { id: '2', name: 'Blazer', description: 'Black, professional', character: 'Molly', episodes: [1, 2, 3, 4, 5, 6, 7, 8], scenes: [1, 2, 3, 4, 5, 6, 7, 8], quantity: 1, status: 'Obtained', cost: 1200 },
      { id: '3', name: 'Casual Outfit', description: 'Jeans and t-shirt', character: 'Jason', episodes: [2, 3], scenes: [2, 4, 6], quantity: 1, status: 'Sourced', cost: 300 }
    ]
  }

  // Sample Permits Data
  const samplePermits = [
    {
      id: '1',
      type: 'Street Permit',
      location: 'Palo Alto - Main Street',
      status: 'Approved',
      applicationDate: '2024-02-15',
      approvalDate: '2024-02-28',
      expirationDate: '2024-04-15',
      contact: 'permits@paloalto.gov',
      documents: ['permit-paloalto-001.pdf']
    },
    {
      id: '2',
      type: 'Street Permit',
      location: 'Silicon Valley Street',
      status: 'Approved',
      applicationDate: '2024-02-20',
      approvalDate: '2024-03-05',
      expirationDate: '2024-04-20',
      contact: 'permits@mountainview.gov',
      documents: ['permit-mountainview-001.pdf']
    },
    {
      id: '3',
      type: 'Location Agreement',
      location: 'LAUNCH Offices',
      status: 'Approved',
      applicationDate: '2024-02-10',
      approvalDate: '2024-02-25',
      expirationDate: '2024-05-10',
      contact: 'facilities@launch.com',
      documents: ['location-agreement-launch.pdf']
    },
    {
      id: '4',
      type: 'Insurance Certificate',
      location: 'All Locations',
      status: 'Approved',
      applicationDate: '2024-02-01',
      approvalDate: '2024-02-15',
      expirationDate: '2024-08-01',
      contact: 'insurance@production.com',
      documents: ['insurance-cert-2024.pdf']
    },
    {
      id: '5',
      type: 'Music License',
      location: 'N/A',
      status: 'In Progress',
      applicationDate: '2024-03-01',
      approvalDate: null,
      expirationDate: null,
      contact: 'licensing@music.com',
      documents: []
    }
  ]

  const tabs = [
    { id: 'casting', label: 'Casting', icon: '🎭', description: 'Actor info' },
    { id: 'schedule', label: 'Schedule', icon: '📅', description: 'Shoot timeline' },
    { id: 'budget', label: 'Budget', icon: '💰', description: 'Cost tracking' },
    { id: 'equipment', label: 'Equipment', icon: '🎥', description: 'Gear checklist' },
    { id: 'locations', label: 'Locations', icon: '📍', description: 'Series locations' },
    { id: 'props', label: 'Props/Wardrobe', icon: '👗', description: 'Series items' },
    { id: 'permits', label: 'Permits', icon: '📄', description: 'Legal docs' }
  ]

  // Tab content rendering
  const renderTabContent = () => {
    if (!activeTab) return null
    
    switch (activeTab) {
      case 'casting':
        return renderCastingTab()
      case 'schedule':
        return renderScheduleTab()
      case 'budget':
        return renderBudgetTab()
      case 'equipment':
        return renderEquipmentTab()
      case 'locations':
        return renderLocationsTab()
      case 'props':
        return renderPropsTab()
      case 'permits':
        return renderPermitsTab()
      default:
        return null
    }
  }

  // Layout rendering functions
  const renderLayoutConcept = () => {
    switch (activeLayout) {
      case 1:
        return renderHorizontalTabs()
      case 2:
        return renderSidebarTimeline()
      case 3:
        return renderDashboardDeepDive()
      case 4:
        return renderKanbanBoard()
      default:
        return renderHorizontalTabs()
    }
  }

  const renderHorizontalTabs = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Header */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary`}>← Dashboard</button>
                <span className={prefix + '-text-tertiary'}>/</span>
                <span className={`text-sm ${prefix}-text-primary`}>Production Assistant</span>
              </div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Arc {sampleArc.arcIndex}: {sampleArc.arcTitle}
              </h2>
              <p className={`text-sm ${prefix}-text-secondary`}>
                Episodes {sampleArc.episodeNumbers.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                Export
              </button>
              <div className={`w-8 h-8 rounded-full ${prefix}-bg-accent flex items-center justify-center text-sm font-bold ${prefix}-text-accent`}>
                {sampleArc.completion}%
              </div>
            </div>
          </div>

          {/* Horizontal Tabs */}
          <div className={`border-b ${prefix}-border ${prefix}-bg-secondary flex overflow-x-auto`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${prefix}-border-accent ${prefix}-text-accent`
                    : `${prefix}-border-transparent ${prefix}-text-secondary hover:${prefix}-text-primary`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSidebarTimeline = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex`}>
          {/* Left Sidebar */}
          <div className={`w-64 border-r ${prefix}-border ${prefix}-bg-secondary flex flex-col`}>
            <div className={`p-4 border-b ${prefix}-border`}>
              <h2 className={`text-lg font-bold ${prefix}-text-primary mb-1`}>
                Arc {sampleArc.arcIndex}
              </h2>
              <p className={`text-sm ${prefix}-text-secondary`}>{sampleArc.arcTitle}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === tab.id
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tab.icon}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${activeTab === tab.id ? `${prefix}-text-accent` : `${prefix}-text-primary`}`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs ${prefix}-text-tertiary`}>
                        {tab.description}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${activeTab === tab.id ? `${prefix}-border-accent` : `${prefix}-border-primary`} flex items-center justify-center text-xs`}>
                      {activeTab === tab.id ? '✓' : '0'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className={`p-4 border-t ${prefix}-border`}>
              <div className={`text-xs ${prefix}-text-tertiary mb-2`}>Overall Progress</div>
              <div className={`h-2 ${prefix}-bg-primary rounded-full overflow-hidden`}>
                <div className={`h-full ${prefix}-bg-accent`} style={{ width: `${sampleArc.completion}%` }}></div>
              </div>
              <div className={`text-sm font-medium mt-2 ${prefix}-text-primary`}>{sampleArc.completion}% Complete</div>
            </div>
          </div>

          {/* Right Timeline */}
          <div className={`w-80 border-r ${prefix}-border ${prefix}-bg-secondary p-4 overflow-y-auto`}>
            <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Arc Timeline</h3>
            <div className="space-y-3">
              {sampleArc.episodeNumbers.map((epNum, idx) => (
                <div key={idx} className={`${prefix}-card ${prefix}-border rounded-lg p-3`}>
                  <div className={`text-sm font-bold ${prefix}-text-primary`}>Episode {epNum}</div>
                  <div className={`text-xs ${prefix}-text-tertiary mt-1`}>
                    {idx < 3 ? 'Completed' : idx === 3 ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className={`p-6 border-b ${prefix}-border flex items-center justify-between`}>
              <h3 className={`text-2xl font-bold ${prefix}-text-primary`}>
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                Export
              </button>
            </div>
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDashboardDeepDive = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Header */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {activeTab && (
                  <>
                    <button onClick={() => setActiveTab(null)} className={`text-sm ${prefix}-text-secondary hover:${prefix}-text-primary`}>← Overview</button>
                    <span className={prefix + '-text-tertiary'}>/</span>
                  </>
                )}
                <span className={`text-sm ${prefix}-text-primary`}>Production Assistant</span>
              </div>
              <h2 className={`text-xl font-bold ${prefix}-text-primary`}>
                Arc {sampleArc.arcIndex}: {sampleArc.arcTitle}
              </h2>
            </div>
            <div className={`w-8 h-8 rounded-full ${prefix}-bg-accent flex items-center justify-center text-sm font-bold ${prefix}-text-accent`}>
              {sampleArc.completion}%
            </div>
          </div>

          {/* Overview Grid or Tab Content */}
          {activeTab === null ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${prefix}-card ${prefix}-border rounded-lg p-6 text-left hover:${prefix}-border-accent transition-all`}
                  >
                    <div className="text-4xl mb-3">{tab.icon}</div>
                    <h3 className={`text-lg font-bold mb-2 ${prefix}-text-primary`}>{tab.label}</h3>
                    <div className={`text-sm ${prefix}-text-secondary mb-4`}>
                      {tab.description}
                    </div>
                    <div className={`flex items-center justify-between`}>
                      <span className={`text-xs ${prefix}-text-tertiary`}>Status: Ready</span>
                      <span className={`text-xs ${prefix}-text-accent`}>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${prefix}-text-primary`}>{tabs.find(t => t.id === activeTab)?.label}</span>
                </div>
                <button className={`px-3 py-1.5 ${prefix}-bg-primary ${prefix}-border border rounded-lg text-sm ${prefix}-text-secondary`}>
                  Export
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {renderTabContent()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderKanbanBoard = () => (
    <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
      <div className="relative" style={{ height: '900px', overflow: 'hidden' }}>
        <div className={`absolute inset-0 ${prefix}-bg-primary flex flex-col`}>
          {/* Header */}
          <div className={`border-b ${prefix}-border p-4 ${prefix}-bg-secondary`}>
            <h2 className={`text-xl font-bold ${prefix}-text-primary mb-2`}>
              Arc {sampleArc.arcIndex}: {sampleArc.arcTitle}
            </h2>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Kanban Board View - Drag items between columns
            </p>
          </div>

          {/* Kanban Columns */}
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {['Pre-Production', 'In Progress', 'Complete', 'Blocked'].map((column, colIdx) => (
                <div key={colIdx} className={`w-80 ${prefix}-bg-secondary rounded-lg p-4`}>
                  <h3 className={`font-bold mb-4 ${prefix}-text-primary`}>{column}</h3>
                  <div className="space-y-3">
                    {tabs.slice(colIdx * 2, colIdx * 2 + 2).map((tab) => (
                      <div
                        key={tab.id}
                        className={`${prefix}-card ${prefix}-border rounded-lg p-4 cursor-move`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{tab.icon}</span>
                          <span className={`font-medium ${prefix}-text-primary`}>{tab.label}</span>
                        </div>
                        <div className={`text-xs ${prefix}-text-secondary`}>{tab.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Tab Content Rendering Functions
  const renderCastingTab = () => {
    const concept = activeConcept.casting
    switch (concept) {
      case 1: // Actor Profile Cards Grid
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="grid grid-cols-4 gap-4 w-full">
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <div className={`text-sm ${prefix}-text-secondary mb-1`}>Total Cast</div>
                  <div className={`text-2xl font-bold ${prefix}-text-accent`}>{sampleCasting.totalCast}</div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <div className={`text-sm ${prefix}-text-secondary mb-1`}>Confirmed</div>
                  <div className={`text-2xl font-bold ${prefix}-text-accent`}>{sampleCasting.confirmed}/{sampleCasting.totalCast}</div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <div className={`text-sm ${prefix}-text-secondary mb-1`}>Needs Casting</div>
                  <div className={`text-2xl font-bold ${prefix}-text-accent`}>{sampleCasting.needsCasting}</div>
                </div>
                <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <div className={`text-sm ${prefix}-text-secondary mb-1`}>Total Payroll</div>
                  <div className={`text-2xl font-bold ${prefix}-text-accent`}>${sampleCasting.totalPayroll.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleCasting.cast.map((actor) => (
                <div key={actor.id} className={`${prefix}-card ${prefix}-border rounded-lg p-4 hover:${prefix}-border-accent transition-all cursor-pointer`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full ${prefix}-bg-accent flex items-center justify-center text-lg font-bold ${prefix}-text-accent`}>
                      {actor.actorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${prefix}-text-primary`}>{actor.actorName}</h4>
                      <p className={`text-sm ${prefix}-text-secondary`}>{actor.characterName}</p>
                    </div>
                  </div>
                  <div className={`text-xs space-y-1 ${prefix}-text-secondary`}>
                    <div><strong className={prefix + '-text-primary'}>Role:</strong> {actor.roleType}</div>
                    <div><strong className={prefix + '-text-primary'}>Status:</strong> {actor.status}</div>
                    <div><strong className={prefix + '-text-primary'}>Episodes:</strong> {actor.episodes.length}</div>
                    <div><strong className={prefix + '-text-primary'}>Pay:</strong> {actor.payRate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2: // Table with Embedded Details
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Actor</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Character</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Role</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Episodes</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Status</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {sampleCasting.cast.map((actor) => (
                  <tr key={actor.id} className={`border-t ${prefix}-border hover:${prefix}-bg-secondary`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{actor.actorName}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{actor.characterName}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{actor.roleType}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{actor.episodes.length}</td>
                    <td className={`p-3`}>
                      <span className={`px-2 py-1 rounded text-xs ${
                        actor.status === 'Confirmed' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                      }`}>
                        {actor.status}
                      </span>
                    </td>
                    <td className={`p-3 ${prefix}-text-secondary text-sm`}>{actor.contact || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 3: // Character-Centric View
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleCasting.cast.filter(a => a.roleType !== 'Extra').map((actor) => (
                <div key={actor.id} className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${prefix}-text-primary mb-1`}>{actor.characterName}</h3>
                      <p className={`text-sm ${prefix}-text-secondary`}>
                        {actor.actorName === 'TBD' ? 'Needs Casting' : `Actor: ${actor.actorName}`}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      actor.status === 'Confirmed' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                    }`}>
                      {actor.status}
                    </span>
                  </div>
                  <div className={`space-y-2 text-sm ${prefix}-text-secondary`}>
                    <div><strong className={prefix + '-text-primary'}>Role Type:</strong> {actor.roleType}</div>
                    <div><strong className={prefix + '-text-primary'}>Episodes:</strong> {actor.episodes.join(', ')}</div>
                    <div><strong className={prefix + '-text-primary'}>Pay Rate:</strong> {actor.payRate}</div>
                    <div><strong className={prefix + '-text-primary'}>Contract:</strong> {actor.contractStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 4: // Timeline + Availability Calendar
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Actor Availability Calendar</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className={`text-center text-xs font-bold ${prefix}-text-secondary`}>{day}</div>
                ))}
                {Array.from({ length: 28 }).map((_, idx) => (
                  <div key={idx} className={`aspect-square ${prefix}-bg-secondary rounded border ${prefix}-border flex items-center justify-center text-xs ${prefix}-text-secondary`}>
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <h4 className={`font-bold mb-3 ${prefix}-text-primary`}>Episode Shooting Schedule</h4>
              <div className="space-y-2">
                {sampleSchedule.shootingDays.slice(0, 3).map((day) => (
                  <div key={day.day} className={`${prefix}-bg-secondary rounded p-3`}>
                    <div className={`text-sm font-medium ${prefix}-text-primary`}>
                      Day {day.day} - {day.date} • {day.location}
                    </div>
                    <div className={`text-xs ${prefix}-text-secondary mt-1`}>
                      {day.scenes.length} scene{day.scenes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderScheduleTab = () => {
    const concept = activeConcept.schedule
    switch (concept) {
      case 1: // Gantt Chart Style
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6 overflow-x-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Shooting Schedule Timeline</h3>
              <div className="space-y-4" style={{ minWidth: '800px' }}>
                {sampleSchedule.shootingDays.map((day) => (
                  <div key={day.day} className="relative">
                    <div className={`${prefix}-bg-secondary rounded p-3 mb-2`}>
                      <div className={`text-sm font-medium ${prefix}-text-primary`}>
                        Day {day.day} - {day.date} • {day.location}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {day.scenes.map((scene, idx) => (
                        <div
                          key={idx}
                          className={`${prefix}-bg-accent ${prefix}-text-accent rounded px-3 py-2 text-sm`}
                          style={{ width: `${(scene.time.split('-')[1].split(':')[0] - scene.time.split('-')[0].split(':')[0]) * 50}px` }}
                        >
                          Ep {scene.episode} Sc {scene.scene}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 2: // Calendar Grid
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
            <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Shooting Calendar</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={`text-center text-xs font-bold ${prefix}-text-secondary p-2`}>{day}</div>
              ))}
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayNum = idx - 2
                const scheduleDay = sampleSchedule.shootingDays.find(d => d.date === `2024-03-${String(dayNum).padStart(2, '0')}`)
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded border ${prefix}-border flex flex-col items-center justify-center p-1 ${
                      scheduleDay ? `${prefix}-bg-accent ${prefix}-border-accent` : `${prefix}-bg-secondary`
                    }`}
                  >
                    {dayNum > 0 && dayNum < 32 && (
                      <>
                        <div className={`text-xs font-medium ${scheduleDay ? `${prefix}-text-accent` : `${prefix}-text-secondary`}`}>
                          {dayNum}
                        </div>
                        {scheduleDay && (
                          <div className={`text-xs ${prefix}-text-accent`}>
                            Day {scheduleDay.day}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 3: // Strip Board
        return (
          <div className="space-y-4">
            {sampleSchedule.shootingDays.map((day) => (
              <div key={day.day} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className={`text-sm font-bold mb-3 ${prefix}-text-primary`}>
                  Day {day.day} - {day.date} • {day.location}
                </div>
                <div className="space-y-2">
                  {day.scenes.map((scene, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded ${prefix}-bg-secondary`}
                    >
                      <div className={`w-16 h-12 rounded ${prefix}-bg-accent flex items-center justify-center text-xs font-bold ${prefix}-text-accent`}>
                        {scene.episode}-{scene.scene}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${prefix}-text-primary`}>{scene.title}</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>{scene.time}</div>
                      </div>
                      <div className={`text-xs ${prefix}-text-secondary`}>
                        {scene.cast.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      case 4: // List View with Nested Episodes
        return (
          <div className="space-y-4">
            {sampleArc.episodeNumbers.slice(0, 3).map((epNum) => {
              const episodeDays = sampleSchedule.shootingDays.filter(d => d.scenes.some(s => s.episode === epNum))
              return (
                <div key={epNum} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                  <button className={`w-full p-4 flex items-center justify-between ${prefix}-bg-secondary`}>
                    <h3 className={`font-bold ${prefix}-text-primary`}>Episode {epNum}</h3>
                    <span className={prefix + '-text-tertiary'}>▼</span>
                  </button>
                  <div className="p-4 space-y-3">
                    {episodeDays.map((day) => (
                      <div key={day.day} className={`${prefix}-bg-primary rounded p-3`}>
                        <div className={`text-sm font-medium ${prefix}-text-primary mb-2`}>
                          Day {day.day} - {day.date} • {day.location}
                        </div>
                        {day.scenes.filter(s => s.episode === epNum).map((scene, idx) => (
                          <div key={idx} className={`text-sm ${prefix}-text-secondary ml-4`}>
                            Scene {scene.scene}: {scene.title} ({scene.time})
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  const renderBudgetTab = () => {
    const concept = activeConcept.budget
    switch (concept) {
      case 1: // Category Cards with Progress
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className={`text-sm ${prefix}-text-secondary mb-1`}>Total Budget</div>
                <div className={`text-2xl font-bold ${prefix}-text-primary`}>${sampleBudget.totalBudget.toLocaleString()}</div>
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className={`text-sm ${prefix}-text-secondary mb-1`}>Spent</div>
                <div className={`text-2xl font-bold ${prefix}-text-accent`}>${sampleBudget.spent.toLocaleString()}</div>
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className={`text-sm ${prefix}-text-secondary mb-1`}>Remaining</div>
                <div className={`text-2xl font-bold ${prefix}-text-primary`}>${sampleBudget.remaining.toLocaleString()}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleBudget.categories.map((category) => (
                <div key={category.name} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`font-bold mb-3 ${prefix}-text-primary`}>{category.name}</h3>
                  <div className={`h-2 ${prefix}-bg-primary rounded-full overflow-hidden mb-2`}>
                    <div
                      className={`h-full ${prefix}-bg-accent`}
                      style={{ width: `${(category.spent / category.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className={`text-sm ${prefix}-text-secondary`}>
                    ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                  </div>
                  <div className={`text-xs ${prefix}-text-tertiary mt-1`}>
                    ${category.remaining.toLocaleString()} remaining
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2: // Detailed Spreadsheet
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Category</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Item</th>
                  <th className={`text-right p-3 text-sm font-bold ${prefix}-text-primary`}>Budget</th>
                  <th className={`text-right p-3 text-sm font-bold ${prefix}-text-primary`}>Spent</th>
                  <th className={`text-right p-3 text-sm font-bold ${prefix}-text-primary`}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {sampleBudget.lineItems.map((item, idx) => (
                  <tr key={idx} className={`border-t ${prefix}-border`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{item.category}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.item}</td>
                    <td className={`p-3 text-right ${prefix}-text-secondary`}>${item.budget.toLocaleString()}</td>
                    <td className={`p-3 text-right ${prefix}-text-accent`}>${item.spent.toLocaleString()}</td>
                    <td className={`p-3 text-right ${prefix}-text-secondary`}>${item.remaining.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className={`border-t-2 ${prefix}-border font-bold`}>
                  <td colSpan={2} className={`p-3 ${prefix}-text-primary`}>Total</td>
                  <td className={`p-3 text-right ${prefix}-text-primary`}>${sampleBudget.totalBudget.toLocaleString()}</td>
                  <td className={`p-3 text-right ${prefix}-text-accent`}>${sampleBudget.spent.toLocaleString()}</td>
                  <td className={`p-3 text-right ${prefix}-text-primary`}>${sampleBudget.remaining.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      case 3: // Visual Budget Breakdown
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Budget by Category</h3>
                <div className="space-y-3">
                  {sampleBudget.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm ${prefix}-text-secondary`}>{cat.name}</span>
                        <span className={`text-sm font-medium ${prefix}-text-primary`}>${cat.budget.toLocaleString()}</span>
                      </div>
                      <div className={`h-3 ${prefix}-bg-primary rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${prefix}-bg-accent`}
                          style={{ width: `${(cat.budget / sampleBudget.totalBudget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Spending Progress</h3>
                <div className="space-y-3">
                  {sampleBudget.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm ${prefix}-text-secondary`}>{cat.name}</span>
                        <span className={`text-sm font-medium ${prefix}-text-accent`}>
                          {Math.round((cat.spent / cat.budget) * 100)}%
                        </span>
                      </div>
                      <div className={`h-3 ${prefix}-bg-primary rounded-full overflow-hidden`}>
                        <div
                          className={`h-full ${prefix}-bg-accent`}
                          style={{ width: `${(cat.spent / cat.budget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 4: // Cost Tracking Timeline
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Payment Schedule</h3>
              <div className="space-y-4">
                {sampleBudget.categories.map((cat, idx) => (
                  <div key={cat.name} className="relative">
                    <div className="flex items-center gap-4">
                      <div className={`w-24 text-sm font-medium ${prefix}-text-primary`}>
                        {cat.name}
                      </div>
                      <div className="flex-1">
                        <div className={`h-2 ${prefix}-bg-primary rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${prefix}-bg-accent`}
                            style={{ width: `${(cat.spent / cat.budget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className={`w-32 text-right text-sm ${prefix}-text-secondary`}>
                        ${cat.spent.toLocaleString()} / ${cat.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderEquipmentTab = () => {
    const concept = activeConcept.equipment
    const allEquipment = [
      ...sampleEquipment.camera,
      ...sampleEquipment.lighting,
      ...sampleEquipment.audio,
      ...sampleEquipment.grip
    ]
    switch (concept) {
      case 1: // Categorized Lists
        return (
          <div className="space-y-6">
            {[
              { name: 'Camera', items: sampleEquipment.camera },
              { name: 'Lighting', items: sampleEquipment.lighting },
              { name: 'Audio', items: sampleEquipment.audio },
              { name: 'Grip', items: sampleEquipment.grip }
            ].map((category) => (
              <div key={category.name} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>{category.name}</h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.id} className={`${prefix}-bg-secondary rounded p-3 flex items-center justify-between`}>
                      <div>
                        <div className={`font-medium ${prefix}-text-primary`}>{item.name}</div>
                        <div className={`text-sm ${prefix}-text-secondary`}>
                          Qty: {item.quantity} • Episodes: {item.episodes.length} • Status: {item.status}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${prefix}-text-accent`}>
                        ${item.cost.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      case 2: // Visual Equipment Wall
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allEquipment.map((item) => (
              <div
                key={item.id}
                className={`${prefix}-card ${prefix}-border rounded-lg p-4 text-center hover:${prefix}-border-accent transition-all cursor-pointer ${
                  item.status === 'Booked' ? `${prefix}-bg-accent/10` : ''
                }`}
              >
                <div className={`text-4xl mb-3`}>
                  {item.name.includes('Camera') || item.name.includes('RED') || item.name.includes('Canon') || item.name.includes('Sony') ? '📷' :
                   item.name.includes('Light') || item.name.includes('ARRI') || item.name.includes('Kino') ? '💡' :
                   item.name.includes('Audio') || item.name.includes('Sennheiser') || item.name.includes('Zoom') ? '🎤' :
                   '🔧'}
                </div>
                <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{item.name}</h4>
                <div className={`text-xs ${prefix}-text-secondary`}>
                  Qty: {item.quantity} • {item.status}
                </div>
              </div>
            ))}
          </div>
        )
      case 3: // Checklist by Shooting Day
        return (
          <div className="space-y-4">
            {sampleSchedule.shootingDays.slice(0, 3).map((day) => (
              <div key={day.day} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <h3 className={`font-bold mb-3 ${prefix}-text-primary`}>
                  Day {day.day} - {day.date} • {day.location}
                </h3>
                <div className="space-y-2">
                  {allEquipment.slice(0, 4).map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5" defaultChecked={item.status === 'Booked'} />
                      <div className="flex-1">
                        <div className={`font-medium ${prefix}-text-primary`}>{item.name}</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>Qty: {item.quantity}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      case 4: // Equipment + Crew Assignment
        return (
          <div className="space-y-6">
            {[
              { name: 'Camera', items: sampleEquipment.camera, crew: 'DP, Camera Operator' },
              { name: 'Lighting', items: sampleEquipment.lighting, crew: 'Gaffer, Best Boy' },
              { name: 'Audio', items: sampleEquipment.audio, crew: 'Sound Mixer, Boom Operator' },
              { name: 'Grip', items: sampleEquipment.grip, crew: 'Key Grip, Grip' }
            ].map((category) => (
              <div key={category.name} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${prefix}-text-primary`}>{category.name}</h3>
                  <div className={`text-sm ${prefix}-text-secondary`}>Crew: {category.crew}</div>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div key={item.id} className={`${prefix}-bg-secondary rounded p-3`}>
                      <div className={`font-medium ${prefix}-text-primary`}>{item.name}</div>
                      <div className={`text-sm ${prefix}-text-secondary`}>
                        Operator: TBD • Status: {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderLocationsTab = () => {
    const concept = activeConcept.locations
    switch (concept) {
      case 1: // Map View with Pins
        return (
          <div className="space-y-6">
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>Location Map</h3>
              <div className={`${prefix}-bg-secondary rounded-lg h-64 flex items-center justify-center relative`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <div className={`text-sm ${prefix}-text-secondary`}>Interactive Map View</div>
                  <div className={`text-xs ${prefix}-text-tertiary mt-2`}>
                    {sampleLocations.length} locations marked
                  </div>
                </div>
                {/* Simulated pins */}
                {sampleLocations.map((loc, idx) => (
                  <div
                    key={loc.id}
                    className="absolute"
                    style={{
                      left: `${20 + idx * 25}%`,
                      top: `${30 + idx * 15}%`
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full ${prefix}-bg-accent border-2 border-white`}></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleLocations.map((location) => (
                <div key={location.id} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{location.name}</h4>
                  <div className={`text-sm ${prefix}-text-secondary`}>{location.address}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 2: // Location Cards Grid
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleLocations.map((location) => (
              <div key={location.id} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <div className="h-32 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-4xl">📍</span>
                </div>
                <div className="p-4">
                  <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{location.name}</h4>
                  <div className={`text-xs space-y-1 ${prefix}-text-secondary`}>
                    <div>{location.address}</div>
                    <div>Type: {location.type}</div>
                    <div>Episodes: {location.episodes.length}</div>
                    <div>Cost: ${location.cost.toLocaleString()}</div>
                    <div>Status: {location.availability}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 3: // Episode-Location Matrix
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Location</th>
                  {sampleArc.episodeNumbers.map((epNum) => (
                    <th key={epNum} className={`text-center p-3 text-sm font-bold ${prefix}-text-primary`}>
                      Ep {epNum}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleLocations.map((location) => (
                  <tr key={location.id} className={`border-t ${prefix}-border`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{location.name}</td>
                    {sampleArc.episodeNumbers.map((epNum) => (
                      <td key={epNum} className="p-3 text-center">
                        {location.episodes.includes(epNum) ? (
                          <span className={`text-lg ${prefix}-text-accent`}>✓</span>
                        ) : (
                          <span className={`text-lg ${prefix}-text-tertiary`}>-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 4: // Detailed Location Sheets
        return (
          <div className="space-y-6">
            {sampleLocations.map((location) => (
              <div key={location.id} className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>{location.name}</h3>
                    <div className={`text-sm ${prefix}-text-secondary`}>{location.address}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    location.availability === 'Confirmed' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                  }`}>
                    {location.availability}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Type</div>
                    <div className={`text-sm ${prefix}-text-secondary`}>{location.type}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Cost</div>
                    <div className={`text-sm ${prefix}-text-secondary`}>${location.cost.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Episodes</div>
                    <div className={`text-sm ${prefix}-text-secondary`}>{location.episodes.join(', ')}</div>
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Contact</div>
                    <div className={`text-sm ${prefix}-text-secondary`}>{location.contact}</div>
                  </div>
                </div>
                <div>
                  <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Notes</div>
                  <div className={`text-sm ${prefix}-text-secondary`}>{location.notes}</div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderPropsTab = () => {
    const concept = activeConcept.props
    const allItems = [...samplePropsWardrobe.props, ...samplePropsWardrobe.wardrobe]
    switch (concept) {
      case 1: // Character Wardrobe Boards
        return (
          <div className="space-y-6">
            {['Jason', 'Molly'].map((character) => {
              const characterItems = allItems.filter(item => item.character === character)
              return (
                <div key={character} className={`${prefix}-card ${prefix}-border rounded-lg p-6`}>
                  <h3 className={`text-xl font-bold mb-4 ${prefix}-text-primary`}>{character} Wardrobe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {characterItems.map((item) => (
                      <div key={item.id} className={`${prefix}-bg-secondary rounded-lg p-4`}>
                        <div className="h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded mb-3 flex items-center justify-center">
                          <span className="text-4xl">👗</span>
                        </div>
                        <h4 className={`font-bold mb-2 ${prefix}-text-primary`}>{item.name}</h4>
                        <div className={`text-xs ${prefix}-text-secondary`}>{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      case 2: // Inventory Table
        return (
          <div className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
            <table className="w-full">
              <thead className={`${prefix}-bg-secondary`}>
                <tr>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Item</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Category</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Character</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Status</th>
                  <th className={`text-left p-3 text-sm font-bold ${prefix}-text-primary`}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item) => (
                  <tr key={item.id} className={`border-t ${prefix}-border`}>
                    <td className={`p-3 ${prefix}-text-primary font-medium`}>{item.name}</td>
                    <td className={`p-3 ${prefix}-text-secondary`}>
                      {samplePropsWardrobe.props.find(p => p.id === item.id) ? 'Prop' : 'Wardrobe'}
                    </td>
                    <td className={`p-3 ${prefix}-text-secondary`}>{item.character}</td>
                    <td className={`p-3`}>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'Obtained' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={`p-3 ${prefix}-text-secondary`}>${item.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 3: // Scene-Based Prop List
        return (
          <div className="space-y-4">
            {[1, 2, 3].map((sceneNum) => {
              const sceneItems = allItems.filter(item => item.scenes.includes(sceneNum))
              return (
                <div key={sceneNum} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`font-bold mb-3 ${prefix}-text-primary`}>Scene {sceneNum}</h3>
                  <div className="space-y-2">
                    {sceneItems.map((item) => (
                      <div key={item.id} className={`${prefix}-bg-secondary rounded p-3 flex items-center justify-between`}>
                        <div>
                          <div className={`font-medium ${prefix}-text-primary`}>{item.name}</div>
                          <div className={`text-xs ${prefix}-text-secondary`}>
                            {samplePropsWardrobe.props.find(p => p.id === item.id) ? 'Prop' : 'Wardrobe'} • {item.character}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'Obtained' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      case 4: // Photo Gallery
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allItems.map((item) => (
              <div key={item.id} className={`${prefix}-card ${prefix}-border rounded-lg overflow-hidden`}>
                <div className="h-32 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-4xl">
                    {samplePropsWardrobe.props.find(p => p.id === item.id) ? '📦' : '👗'}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className={`font-bold mb-1 ${prefix}-text-primary text-sm`}>{item.name}</h4>
                  <div className={`text-xs ${prefix}-text-secondary`}>
                    {item.character} • {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  const renderPermitsTab = () => {
    const concept = activeConcept.permits
    switch (concept) {
      case 1: // Document Checklist
        return (
          <div className="space-y-4">
            {samplePermits.map((permit) => (
              <div key={permit.id} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-bold ${prefix}-text-primary`}>{permit.type}</h3>
                    <div className={`text-sm ${prefix}-text-secondary`}>{permit.location}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    permit.status === 'Approved' ? `${prefix}-bg-accent ${prefix}-text-accent` :
                    permit.status === 'In Progress' ? `${prefix}-bg-primary ${prefix}-text-secondary` :
                    `${prefix}-bg-primary ${prefix}-text-secondary`
                  }`}>
                    {permit.status}
                  </span>
                </div>
                <div className={`grid grid-cols-2 gap-4 text-sm ${prefix}-text-secondary`}>
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Application Date</div>
                    <div>{permit.applicationDate}</div>
                  </div>
                  {permit.approvalDate && (
                    <div>
                      <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Approval Date</div>
                      <div>{permit.approvalDate}</div>
                    </div>
                  )}
                  {permit.expirationDate && (
                    <div>
                      <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Expiration Date</div>
                      <div>{permit.expirationDate}</div>
                    </div>
                  )}
                  <div>
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Contact</div>
                    <div>{permit.contact}</div>
                  </div>
                </div>
                {permit.documents.length > 0 && (
                  <div className="mt-3">
                    <div className={`text-xs font-medium ${prefix}-text-tertiary mb-1`}>Documents</div>
                    <div className="flex flex-wrap gap-2">
                      {permit.documents.map((doc, idx) => (
                        <span key={idx} className={`px-2 py-1 ${prefix}-bg-secondary rounded text-xs ${prefix}-text-secondary`}>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      case 2: // Timeline with Deadlines
        return (
          <div className="space-y-6">
            <div className="relative">
              <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${prefix}-bg-primary`}></div>
              <div className="space-y-6">
                {samplePermits.map((permit, idx) => (
                  <div key={permit.id} className="relative flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full ${prefix}-bg-accent flex items-center justify-center text-sm font-bold ${prefix}-text-accent z-10`}>
                      {idx + 1}
                    </div>
                    <div className={`flex-1 ${prefix}-card ${prefix}-border rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold ${prefix}-text-primary`}>{permit.type}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          permit.status === 'Approved' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                        }`}>
                          {permit.status}
                        </span>
                      </div>
                      <div className={`text-sm ${prefix}-text-secondary`}>
                        {permit.location}
                      </div>
                      <div className={`text-xs ${prefix}-text-tertiary mt-2`}>
                        Applied: {permit.applicationDate}
                        {permit.approvalDate && ` • Approved: ${permit.approvalDate}`}
                        {permit.expirationDate && ` • Expires: ${permit.expirationDate}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      case 3: // Location-Based
        return (
          <div className="space-y-6">
            {sampleLocations.map((location) => {
              const locationPermits = samplePermits.filter(p => p.location === location.name || p.location === 'All Locations')
              return (
                <div key={location.id} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                  <h3 className={`text-lg font-bold mb-4 ${prefix}-text-primary`}>{location.name}</h3>
                  <div className="space-y-3">
                    {locationPermits.map((permit) => (
                      <div key={permit.id} className={`${prefix}-bg-secondary rounded p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`font-medium ${prefix}-text-primary`}>{permit.type}</div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            permit.status === 'Approved' ? `${prefix}-bg-accent ${prefix}-text-accent` : `${prefix}-bg-primary ${prefix}-text-secondary`
                          }`}>
                            {permit.status}
                          </span>
                        </div>
                        <div className={`text-xs ${prefix}-text-secondary`}>
                          Contact: {permit.contact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      case 4: // Document Repository
        return (
          <div className="space-y-6">
            {['Permits', 'Insurance', 'Contracts', 'Misc'].map((folder) => (
              <div key={folder} className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📁</span>
                  <h3 className={`font-bold ${prefix}-text-primary`}>{folder}</h3>
                </div>
                <div className="space-y-2">
                  {samplePermits
                    .filter(p => folder === 'Permits' || folder === 'Insurance' && p.type.includes('Insurance'))
                    .flatMap(p => p.documents)
                    .map((doc, idx) => (
                      <div key={idx} className={`${prefix}-bg-secondary rounded p-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <span className={`text-sm ${prefix}-text-primary`}>{doc}</span>
                        </div>
                        <button className={`text-xs ${prefix}-text-accent`}>Download</button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-16">
      <section className="space-y-8">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
            Production Assistant Page Designs
          </h2>
          <p className={`text-base mb-6 ${prefix}-text-secondary`}>
            Multiple layout concepts for the overall page structure, plus tab-specific design options for each of the 8 production assistant sections. Each tab showcases different content types with industry-standard patterns.
          </p>
        </div>

        {/* Overall Layout Selector */}
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
              Overall Page Layout
            </h3>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Choose the overall structure that houses all tabs and navigation
            </p>
          </div>
          <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
            <div className="flex flex-wrap gap-2">
              {[
                { num: 1, label: 'Horizontal Tabs' },
                { num: 2, label: 'Sidebar + Timeline' },
                { num: 3, label: 'Dashboard + Deep Dive' },
                { num: 4, label: 'Kanban Board' }
              ].map((layout) => (
                <button
                  key={layout.num}
                  onClick={() => setActiveLayout(layout.num)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLayout === layout.num
                      ? `${prefix}-bg-accent ${prefix}-text-accent`
                      : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Active Layout */}
        <div className="space-y-6">
          {renderLayoutConcept()}
        </div>

        {/* Tab-Specific Concept Selectors (shown when in a tab) */}
        {activeTab && activeTab !== null && (
          <div className="space-y-4 mt-8">
            <div className="mb-4">
              <h3 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
                {tabs.find(t => t.id === activeTab)?.label} - Design Concepts
              </h3>
              <p className={`text-sm ${prefix}-text-secondary`}>
                Different layout approaches for this tab's content type
              </p>
            </div>
            <div className={`${prefix}-card ${prefix}-border rounded-lg p-4`}>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveConcept({ ...activeConcept, [activeTab]: idx + 1 })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeConcept[activeTab] === idx + 1
                        ? `${prefix}-bg-accent ${prefix}-text-accent`
                        : `${prefix}-bg-secondary ${prefix}-text-secondary hover:${prefix}-bg-tertiary`
                    }`}
                  >
                    Concept {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

