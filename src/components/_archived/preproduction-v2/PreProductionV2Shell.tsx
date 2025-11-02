import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PreProductionV2Data } from '@/types/preproduction'
import { usePreProductionTheme } from '@/hooks/usePreProductionTheme'

// Tab Components
import { NarrativeTab } from './tabs/NarrativeTab'
import { ScriptTab } from './tabs/ScriptTab'
import { StoryboardTab } from './tabs/StoryboardTab'
import { PropsTab } from './tabs/PropsTab'
import { LocationsTab } from './tabs/LocationsTab'
import { CastingTab } from './tabs/CastingTab'
import { MarketingTab } from './tabs/MarketingTab'
import { PostProductionTab } from './tabs/PostProductionTab'

// Shared Components
import { ThemeToggle } from './shared/ThemeToggle'
import { ExportToolbar } from './shared/ExportToolbar'

/**
 * Pre-Production V2 Shell Component
 * 
 * Main orchestrator for the pre-production system.
 * Manages tabs, theme, and data flow.
 * 
 * Reduced from 4,266 lines to ~200 lines.
 */

type TabType = 'narrative' | 'script' | 'storyboard' | 'props' | 'location' | 'casting' | 'marketing' | 'postProduction'

const TABS = [
  { id: 'narrative', label: 'Narrative', icon: '📖', description: 'Episode overview' },
  { id: 'script', label: 'Scripts', icon: '📝', description: 'Scene scripts' },
  { id: 'storyboard', label: 'Storyboards', icon: '🎬', description: 'Visual planning' },
  { id: 'props', label: 'Props & Wardrobe', icon: '🎪', description: 'Production design' },
  { id: 'location', label: 'Locations', icon: '📍', description: 'Filming locations' },
  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Character casting' },
  { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Promotion strategy' },
  { id: 'postProduction', label: 'Post-Production', icon: '🎞️', description: 'Post-prod guide' }
] as const

interface PreProductionV2ShellProps {
  data: PreProductionV2Data | null
  isGenerating?: boolean
  onBack?: () => void
}

export const PreProductionV2Shell: React.FC<PreProductionV2ShellProps> = ({
  data,
  isGenerating = false,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('narrative')
  const { theme, themeConfig, toggleTheme } = usePreProductionTheme()
  
  // Apply theme CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--ppv2-bg', themeConfig.colors.background)
      root.style.setProperty('--ppv2-bg-secondary', themeConfig.colors.backgroundSecondary)
      root.style.setProperty('--ppv2-text', themeConfig.colors.text)
      root.style.setProperty('--ppv2-text-secondary', themeConfig.colors.textSecondary)
      root.style.setProperty('--ppv2-border', themeConfig.colors.border)
      root.style.setProperty('--ppv2-card', themeConfig.colors.card)
      
      // Add to body
      document.body.style.setProperty('--background', themeConfig.colors.background)
      document.body.style.setProperty('--card-bg', themeConfig.colors.card)
      document.body.style.setProperty('--border-color', themeConfig.colors.border)
      document.body.style.setProperty('--text-color', themeConfig.colors.text)
      document.body.style.setProperty('--background-secondary', themeConfig.colors.backgroundSecondary)
    }
  }, [theme, themeConfig])
  
  // Export functions (to be implemented)
  const handleExportPDF = () => {
    console.log('Export PDF - To be implemented')
    alert('PDF export coming soon!')
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      console.log('Copied to clipboard')
    }
  }
  
  const handleDownloadJSON = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `preproduction-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  
  // Render active tab content
  const renderTabContent = () => {
    if (!data) {
      return (
        <div className="text-center py-16">
          <p className="text-lg opacity-70">No content generated yet</p>
        </div>
      )
    }
    
    switch (activeTab) {
      case 'narrative':
        return <NarrativeTab data={data.narrative || null} />
      case 'script':
        return <ScriptTab data={data.script || null} />
      case 'storyboard':
        return <StoryboardTab data={data.storyboard || null} />
      case 'props':
        return <PropsTab data={data.props || null} />
      case 'location':
        return <LocationsTab data={data.location || null} />
      case 'casting':
        return <CastingTab data={data.casting || null} />
      case 'marketing':
        return <MarketingTab data={data.marketing || null} />
      case 'postProduction':
        return <PostProductionTab data={data.postProduction || null} />
      default:
        return <div>Tab not implemented</div>
    }
  }
  
  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ 
        backgroundColor: themeConfig.colors.background,
        color: themeConfig.colors.text
      }}
    >
      {/* Header */}
      <div className="border-b" style={{ borderColor: themeConfig.colors.border }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border hover:bg-opacity-80 transition-colors"
                  style={{ borderColor: themeConfig.colors.border }}
                >
                  ← Back
                </button>
              )}
              <h1 className="text-2xl font-bold">Pre-Production V2</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b overflow-x-auto scrollbar-hide" style={{ borderColor: themeConfig.colors.border }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-shrink-0 px-4 py-4 text-sm font-medium transition-all relative
                    ${isActive ? 'text-[#00FF99]' : 'opacity-70 hover:opacity-100'}
                  `}
                  style={{
                    borderBottom: isActive ? '2px solid #00FF99' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <div className="text-left hidden md:block">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-60">{tab.description}</div>
                    </div>
                    <span className="md:hidden">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Export Toolbar */}
        {data && (
          <ExportToolbar
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            onCopy={handleCopy}
            onDownloadJSON={handleDownloadJSON}
            disabled={isGenerating}
          />
        )}
        
        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PreProductionV2Shell

