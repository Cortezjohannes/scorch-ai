'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import type { PreProductionData } from '@/types/preproduction'
import { subscribeToPreProduction, updatePreProduction } from '@/services/preproduction-firestore'
import { ExportToolbar } from './shared/ExportToolbar'

// Tab Components - All 12 Production Tabs
import { ScriptsTab } from './tabs/ScriptsTab'
import { ScriptBreakdownTab } from './tabs/ScriptBreakdownTab'
import { ShootingScheduleTab } from './tabs/ShootingScheduleTab'
import { ShotListTab } from './tabs/ShotListTab'
import { BudgetTrackerTab } from './tabs/BudgetTrackerTab'
import { LocationsTab } from './tabs/LocationsTab'
import { PropsWardrobeTab } from './tabs/PropsWardrobeTab'
import { EquipmentTab } from './tabs/EquipmentTab'
import { CastingTab } from './tabs/CastingTab'
import { StoryboardsTab } from './tabs/StoryboardsTab'
import { PermitsTab } from './tabs/PermitsTab'
import { RehearsalTab } from './tabs/RehearsalTab'

type TabType = 
  | 'scripts'
  | 'breakdown'
  | 'schedule'
  | 'shotlist'
  | 'budget'
  | 'locations'
  | 'props'
  | 'equipment'
  | 'casting'
  | 'storyboards'
  | 'permits'
  | 'rehearsal'

const TABS = [
  { id: 'scripts', label: 'Scripts', icon: '📝', description: 'Formatted screenplay' },
  { id: 'breakdown', label: 'Script Breakdown', icon: '📋', description: 'Scene analysis' },
  { id: 'schedule', label: 'Schedule', icon: '📅', description: 'Shoot timeline' },
  { id: 'shotlist', label: 'Shot List', icon: '🎬', description: 'Camera shots' },
  { id: 'budget', label: 'Budget', icon: '💰', description: 'Cost tracking' },
  { id: 'locations', label: 'Locations', icon: '📍', description: 'Filming sites' },
  { id: 'props', label: 'Props/Wardrobe', icon: '👗', description: 'Items needed' },
  { id: 'equipment', label: 'Equipment', icon: '🎥', description: 'Gear checklist' },
  { id: 'casting', label: 'Casting', icon: '🎭', description: 'Actor info' },
  { id: 'storyboards', label: 'Storyboards', icon: '🖼️', description: 'Visual plan' },
  { id: 'permits', label: 'Permits', icon: '📄', description: 'Legal docs' },
  { id: 'rehearsal', label: 'Rehearsal', icon: '🎪', description: 'Practice schedule' }
] as const

interface PreProductionShellProps {
  preProductionId: string
  userId: string
  storyBibleId: string
  onBack?: () => void
}

export function PreProductionShell({ preProductionId, userId, storyBibleId, onBack }: PreProductionShellProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('scripts')
  const [preProductionData, setPreProductionData] = useState<PreProductionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true)
    
    const unsubscribe = subscribeToPreProduction(userId, storyBibleId, preProductionId, (data) => {
      setPreProductionData(data)
      setIsLoading(false)
      setIsSyncing(false)
    })

    return () => {
      unsubscribe()
    }
  }, [userId, storyBibleId, preProductionId])

  const handleTabUpdate = async (tabName: string, tabData: any) => {
    if (!preProductionData || !user?.id) return

    setIsSyncing(true)
    try {
      await updatePreProduction(
        preProductionId,
        { [tabName]: tabData },
        user.id,
        storyBibleId
      )
    } catch (error) {
      console.error('Error updating tab:', error)
      setIsSyncing(false)
    }
  }

  const renderTabContent = () => {
    if (!preProductionData) return null

    const commonProps = {
      preProductionData,
      onUpdate: handleTabUpdate,
      currentUserId: user?.id || '',
      currentUserName: user?.displayName || user?.email || 'User'
    }

    switch (activeTab) {
      case 'scripts':
        return <ScriptsTab {...commonProps} />
      case 'breakdown':
        return <ScriptBreakdownTab {...commonProps} />
      case 'schedule':
        return <ShootingScheduleTab {...commonProps} />
      case 'shotlist':
        return <ShotListTab {...commonProps} />
      case 'budget':
        return <BudgetTrackerTab {...commonProps} />
      case 'locations':
        return <LocationsTab {...commonProps} />
      case 'props':
        return <PropsWardrobeTab {...commonProps} />
      case 'equipment':
        return <EquipmentTab {...commonProps} />
      case 'casting':
        return <CastingTab {...commonProps} />
      case 'storyboards':
        return <StoryboardsTab {...commonProps} />
      case 'permits':
        return <PermitsTab {...commonProps} />
      case 'rehearsal':
        return <RehearsalTab {...commonProps} />
      default:
        return <div>Tab not implemented</div>
    }
  }

  const handleExportPDF = () => {
    console.log('Export PDF - To be implemented')
    alert('PDF export coming soon!')
  }

  const handleExportCSV = () => {
    console.log('Export CSV - To be implemented')
    alert('CSV export coming soon!')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyJSON = async () => {
    if (preProductionData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(preProductionData, null, 2))
        alert('Copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00FF99] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#e7e7e7]">Loading pre-production data...</p>
        </div>
      </div>
    )
  }

  if (!preProductionData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#e7e7e7] text-xl mb-4">Pre-production data not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border border-[#36393f] hover:bg-[#2a2a2a] transition-colors text-[#e7e7e7]"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#00FF99]">
                  Pre-Production
                </h1>
                <p className="text-sm text-[#e7e7e7]/70">
                  Episode {preProductionData.episodeNumber}: {preProductionData.episodeTitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isSyncing && (
                <div className="flex items-center gap-2 text-sm text-[#00FF99]">
                  <div className="w-3 h-3 border-2 border-[#00FF99] border-t-transparent rounded-full animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              
              <div className="text-sm text-[#e7e7e7]/50">
                {preProductionData.collaborators.length} collaborator
                {preProductionData.collaborators.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[#1a1a1a] border-b border-[#36393f] sticky top-[73px] z-30">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex-shrink-0 px-4 py-3 text-sm font-medium transition-all relative
                    ${isActive ? 'text-[#00FF99]' : 'text-[#e7e7e7]/70 hover:text-[#e7e7e7]'}
                  `}
                  style={{
                    borderBottom: isActive ? '2px solid #00FF99' : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-60 hidden lg:block">{tab.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Export Toolbar */}
        <ExportToolbar
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          onCopyJSON={handleCopyJSON}
          disabled={isSyncing}
        />

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

