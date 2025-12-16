'use client'

import React from 'react'

interface LayoutExamplesProps {
  theme: 'light' | 'dark'
}

export default function LayoutExamples({ theme }: LayoutExamplesProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-16">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          App Layout Concepts
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Four distinct layout approaches for the entire production platform. Each concept offers different navigation patterns and user experience philosophies.
        </p>
      </div>

      {/* Layout Concept 1: Sidebar Navigation */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            1. Sidebar Navigation Layout
        </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Modern app-style navigation with fixed left sidebar. Similar to Notion, VS Code, or Linear.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Power users, complex workflows, quick context switching between sections
            </p>
          </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          {/* Mockup Container */}
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div className={`absolute left-0 top-0 bottom-0 w-64 border-r ${prefix}-border ${prefix}-bg-secondary`}>
              {/* Sidebar Header */}
              <div className={`p-4 border-b ${prefix}-border`}>
                <div className={`text-lg font-bold ${prefix}-text-primary mb-1`}>Greenlit</div>
                <div className={`text-xs ${prefix}-text-tertiary`}>Production Platform</div>
              </div>
              
              {/* Navigation Items */}
              <div className="p-2 space-y-1">
            {[
                  { icon: '📊', label: 'Dashboard', active: true },
                  { icon: '🎞️', label: 'The Reel', active: false },
                  { icon: '📖', label: 'Story Bible', active: false },
                  { icon: '⚡', label: 'Workspace', active: false },
                  { icon: '🎬', label: 'Episode Pre-Production', active: false, selector: true },
                  { icon: '📐', label: 'Production Assistant', active: false, selector: true },
                  { icon: '🎭', label: 'Actor Materials', active: false, selector: true }
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                      item.active 
                        ? `${prefix}-bg-accent ${prefix}-text-accent` 
                        : `${prefix}-text-secondary hover:${prefix}-bg-secondary`
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.selector && (
                      <span className={`text-xs ml-auto ${prefix}-text-tertiary`}>▼</span>
                    )}
              </div>
            ))}
          </div>

              {/* Collapse Button */}
              <div className={`absolute bottom-4 left-4 right-4 p-2 rounded-lg border ${prefix}-border ${prefix}-bg-secondary text-center cursor-pointer`}>
                <span className={`text-xs ${prefix}-text-secondary`}>← Collapse</span>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="absolute left-64 top-0 right-0 bottom-0">
              {/* Top Bar */}
              <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-6`}>
                <div>
                  <h1 className={`text-xl font-bold ${prefix}-text-primary`}>Dashboard</h1>
                  <p className={`text-xs ${prefix}-text-secondary`}>Overview of your current series in production</p>
                </div>
                <div className="flex items-center gap-3">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
                    New Episode
                </button>
                </div>
              </div>
              
              {/* Content */}
              <div className={`p-6 ${prefix}-bg-primary overflow-y-auto`} style={{ height: 'calc(100% - 64px)' }}>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {['Total Episodes', 'Active', 'Completed', 'In Progress'].map((stat, idx) => (
                    <div key={stat} className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border`}>
                      <div className={`text-xs mb-1 ${prefix}-text-secondary`}>{stat}</div>
                      <div className={`text-2xl font-bold ${prefix}-text-accent`}>
                        {idx === 0 ? '12' : idx === 1 ? '5' : idx === 2 ? '7' : '3'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Episode Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-4 rounded-lg ${prefix}-card ${prefix}-border`}>
                      <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Episode {i}</div>
                      <div className={`text-xs mb-3 ${prefix}-text-secondary`}>In Production</div>
                      <div className={`h-2 rounded-full ${prefix}-bg-secondary mb-2`}>
                        <div className={`h-full rounded-full ${prefix}-bg-accent`} style={{ width: '60%' }}></div>
                      </div>
              </div>
            ))}
          </div>

                <div className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border`}>
                  <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Story Bible</div>
                  <div className={`text-xs ${prefix}-text-secondary`}>Last updated 2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Concept 2: Top Navigation + Tabs */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            2. Top Navigation + Tabs Layout
          </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Traditional web app style with horizontal navigation and secondary tabs. Clean and familiar.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Content-focused workflows, traditional web app users, clear section separation
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            {/* Top Navigation */}
            <div className={`h-16 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-6`}>
              <div className="flex items-center gap-8">
                <div className={`text-lg font-bold ${prefix}-text-primary`}>Greenlit</div>
                <nav className="flex gap-6">
                  {['Dashboard', 'The Reel', 'Story Bible', 'Workspace'].map((item) => (
                    <a key={item} className={`text-sm font-medium ${prefix}-text-secondary hover:${prefix}-text-primary`}>
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${prefix}-bg-secondary ${prefix}-border border`}></div>
              </div>
            </div>

            {/* Secondary Tab Navigation */}
            <div className={`h-12 border-b ${prefix}-border ${prefix}-bg-secondary flex items-center px-6 gap-1`}>
              {['Overview', 'Episodes', 'Story Bible', 'Pre-Production'].map((tab, idx) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    idx === 0 
                      ? `${prefix}-tab-active ${prefix}-text-accent` 
                      : `${prefix}-tab ${prefix}-text-secondary`
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className={`${prefix}-bg-primary`} style={{ height: 'calc(100% - 112px)' }}>
              <div className="p-6">
                <div className="mb-6">
                  <h1 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>Dashboard</h1>
                  <p className={`text-sm ${prefix}-text-secondary`}>Your production overview</p>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {['Episodes', 'Active', 'Completed', 'In Progress'].map((stat, idx) => (
                    <div key={stat} className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border`}>
                      <div className={`text-xs mb-1 ${prefix}-text-secondary`}>{stat}</div>
                      <div className={`text-2xl font-bold ${prefix}-text-accent`}>
                        {idx === 0 ? '12' : idx === 1 ? '5' : idx === 2 ? '7' : '3'}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Episode Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className={`p-5 rounded-lg ${prefix}-card ${prefix}-border`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className={`text-lg font-semibold mb-1 ${prefix}-text-primary`}>Episode {i}</div>
                          <div className={`text-xs ${prefix}-text-secondary`}>In Production</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${prefix}-bg-accent ${prefix}-text-accent`}>Active</span>
                      </div>
                      <div className={`h-2 rounded-full ${prefix}-bg-secondary mb-4`}>
                        <div className={`h-full rounded-full ${prefix}-bg-accent`} style={{ width: '75%' }}></div>
                      </div>
                      <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
                        Continue Editing
              </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating Action Button */}
            <button 
              className={`absolute bottom-6 right-6 w-14 h-14 rounded-full ${prefix}-btn-primary flex items-center justify-center text-2xl ${prefix}-shadow-lg`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Layout Concept 3: Dashboard-First Layout */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            3. Dashboard-First Layout
        </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Landing page is a visual dashboard with cards. Click cards to drill down into sections.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Overview-focused users, quick scanning, visual learners, project managers
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            {/* Minimal Header */}
            <div className={`h-14 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-6`}>
              <div className={`text-lg font-bold ${prefix}-text-primary`}>Greenlit</div>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${prefix}-text-secondary`}>John Doe</span>
                <div className={`w-8 h-8 rounded-full ${prefix}-bg-secondary ${prefix}-border border`}></div>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className={`${prefix}-bg-primary p-8`} style={{ height: 'calc(100% - 56px)', overflowY: 'auto' }}>
              <div className="mb-6">
                <h1 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>Production Dashboard</h1>
                <p className={`text-sm ${prefix}-text-secondary`}>Overview of your current series in production</p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Episodes', value: '12', color: 'accent' },
                  { label: 'In Production', value: '5', color: 'accent' },
                  { label: 'Completed', value: '7', color: 'accent' },
                  { label: 'Draft', value: '2', color: 'accent' }
                ].map((stat) => (
                  <div key={stat.label} className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border text-center`}>
                    <div className={`text-3xl font-bold mb-1 ${prefix}-text-accent`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs ${prefix}-text-secondary`}>{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Main Navigation Cards */}
              <div className="mb-6">
                <h2 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Quick Access</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: '⚡', title: 'Workspace', desc: 'Generate episodes', color: 'accent' },
                    { icon: '📖', title: 'Story Bible', desc: 'View story details', color: 'accent' },
                    { icon: '🎞️', title: 'The Reel', desc: 'View generated episodes', color: 'accent' }
                  ].map((card) => (
                    <div 
                      key={card.title}
                      className={`p-6 rounded-lg cursor-pointer ${prefix}-card ${prefix}-border hover:${prefix}-border-accent transition-all`}
                    >
                      <div className={`text-4xl mb-3`}>{card.icon}</div>
                      <div className={`text-lg font-semibold mb-1 ${prefix}-text-primary`}>{card.title}</div>
                      <div className={`text-xs ${prefix}-text-secondary`}>{card.desc}</div>
                    </div>
                  ))}
                </div>
          </div>

              {/* Production Tools */}
          <div className="mb-6">
                <h2 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Production Tools</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: '🎬', title: 'Episode Pre-Production', desc: 'Select episode', selector: true },
                    { icon: '📐', title: 'Production Assistant', desc: 'Select arc', selector: true },
                    { icon: '🎭', title: 'Actor Materials', desc: 'Select arc', selector: true }
                  ].map((card) => (
                    <div 
                      key={card.title}
                      className={`p-6 rounded-lg cursor-pointer ${prefix}-card ${prefix}-border hover:${prefix}-border-accent transition-all relative`}
                    >
                      <div className={`text-4xl mb-3`}>{card.icon}</div>
                      <div className={`text-lg font-semibold mb-1 ${prefix}-text-primary`}>{card.title}</div>
                      <div className={`text-xs ${prefix}-text-secondary`}>{card.desc}</div>
                      {card.selector && (
                        <div className={`absolute top-4 right-4 text-xs ${prefix}-text-tertiary`}>▼</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Recent Episodes</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className={`text-sm font-semibold ${prefix}-text-primary`}>Episode {i}</div>
                          <div className={`text-xs ${prefix}-text-secondary`}>Updated 2 hours ago</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${prefix}-badge-gold`}>Active</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${prefix}-bg-secondary`}>
                        <div className={`h-full rounded-full ${prefix}-bg-accent`} style={{ width: `${60 + i * 10}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Concept 4: Command Center Layout */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            4. Command Center Layout
              </h3>
          <p className={`text-sm ${prefix}-text-secondary mb-1`}>
            Unified interface with split panels. Context-switching without navigation. Power-user focused.
          </p>
          <p className={`text-xs ${prefix}-text-tertiary`}>
            <strong>Best for:</strong> Advanced users, multi-tasking, real-time editing, complex workflows
          </p>
        </div>
        
        <div className={`rounded-lg overflow-hidden border ${prefix}-border ${prefix}-card ${prefix}-shadow-lg`}>
          <div className="relative" style={{ height: '600px', overflow: 'hidden' }}>
            {/* Top Bar */}
            <div className={`h-12 border-b ${prefix}-border ${prefix}-bg-primary flex items-center justify-between px-4`}>
              <div className={`text-sm font-bold ${prefix}-text-primary`}>Greenlit Command Center</div>
              <div className="flex items-center gap-3">
                <button className={`px-3 py-1 rounded text-xs font-medium ${prefix}-btn-ghost`}>Split View</button>
                <div className={`w-6 h-6 rounded-full ${prefix}-bg-secondary ${prefix}-border border`}></div>
              </div>
            </div>

            {/* Three-Panel Layout */}
            <div className="flex" style={{ height: 'calc(100% - 48px)' }}>
              {/* Left Panel - Navigation */}
              <div className={`w-56 border-r ${prefix}-border ${prefix}-bg-secondary`}>
                <div className="p-3 space-y-1">
                  {['Dashboard', 'The Reel', 'Story Bible', 'Workspace', 'Episode Pre-Prod', 'Arc Pre-Prod', 'Actor Materials'].map((item, idx) => (
                <div
                      key={item}
                      className={`p-2 rounded text-sm cursor-pointer ${
                        idx === 0 
                          ? `${prefix}-bg-accent ${prefix}-text-accent` 
                          : `${prefix}-text-secondary hover:${prefix}-bg-primary`
                      }`}
                >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Center Panel - Main Content */}
              <div className={`flex-1 ${prefix}-bg-primary overflow-y-auto`}>
                <div className="p-6">
                  <div className="mb-4">
                    <h1 className={`text-xl font-bold mb-1 ${prefix}-text-primary`}>Dashboard Overview</h1>
                    <div className={`text-xs ${prefix}-text-secondary`}>Current Series • In Production</div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${prefix}-card-secondary ${prefix}-border mb-4`}>
                    <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Scene Content</div>
                    <div className={`text-xs ${prefix}-text-secondary leading-relaxed`}>
                      INT. OFFICE - DAY
                      <br /><br />
                      The room is dimly lit. Papers scattered across the desk. A figure sits in the shadows...
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {['Characters', 'Locations', 'Props', 'Dialogue'].map((section) => (
                      <div key={section} className={`p-3 rounded-lg ${prefix}-card ${prefix}-border`}>
                        <div className={`text-xs font-semibold mb-1 ${prefix}-text-primary`}>{section}</div>
                        <div className={`text-xs ${prefix}-text-secondary`}>3 items</div>
                </div>
              ))}
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Inspector */}
              <div className={`w-72 border-l ${prefix}-border ${prefix}-bg-secondary`}>
                <div className="p-4 border-b ${prefix}-border">
                  <div className={`text-sm font-semibold ${prefix}-text-primary`}>Inspector</div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${prefix}-text-secondary`}>Episode Details</div>
                    <div className={`text-sm ${prefix}-text-primary`}>Episode 1</div>
                    <div className={`text-xs ${prefix}-text-secondary`}>Status: In Production</div>
                  </div>
                  
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${prefix}-text-secondary`}>Progress</div>
                    <div className={`h-2 rounded-full ${prefix}-bg-primary mb-2`}>
                      <div className={`h-full rounded-full ${prefix}-bg-accent`} style={{ width: '65%' }}></div>
                    </div>
                    <div className={`text-xs ${prefix}-text-secondary`}>65% Complete</div>
                  </div>
                  
                  <div>
                    <div className={`text-xs font-semibold mb-2 ${prefix}-text-secondary`}>Quick Actions</div>
                    <div className="space-y-2">
                      <button className={`w-full px-3 py-2 rounded text-xs font-medium ${prefix}-btn-primary`}>
                        Save Changes
                      </button>
                      <button className={`w-full px-3 py-2 rounded text-xs font-medium ${prefix}-btn-ghost`}>
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Summary */}
      <section className={`rounded-lg p-6 ${prefix}-card-secondary ${prefix}-border`}>
        <h3 className={`text-xl font-semibold mb-4 ${prefix}-text-primary`}>Layout Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Sidebar Navigation</div>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Best for power users</li>
              <li>• Quick context switching</li>
              <li>• Familiar app pattern</li>
            </ul>
          </div>
          <div>
            <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Top Navigation + Tabs</div>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Traditional web app feel</li>
              <li>• Clear section separation</li>
              <li>• Content-focused</li>
            </ul>
          </div>
          <div>
            <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Dashboard-First</div>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Visual overview</li>
              <li>• Quick scanning</li>
              <li>• Project management style</li>
            </ul>
          </div>
          <div>
            <div className={`text-sm font-semibold mb-2 ${prefix}-text-primary`}>Command Center</div>
            <ul className={`text-xs space-y-1 ${prefix}-text-secondary`}>
              <li>• Multi-panel efficiency</li>
              <li>• Advanced workflows</li>
              <li>• Real-time editing</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
