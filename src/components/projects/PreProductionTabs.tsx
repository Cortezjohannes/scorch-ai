'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface PreProductionTabsProps {
  projectId: string
}

// V2 system tabs - now showing what will be generated in V2
const v2Tabs = [
  { key: 'narrative', label: 'Narrative Overview', icon: '📖' },
  { key: 'script', label: 'Scripts (Per Scene)', icon: '📝' },
  { key: 'storyboard', label: 'Storyboards (Per Scene)', icon: '🎬' },
  { key: 'props', label: 'Props & Wardrobe', icon: '👗' },
  { key: 'locations', label: 'Filming Locations', icon: '🏗️' },
  { key: 'casting', label: 'Casting Guide', icon: '🎭' },
  { key: 'marketing', label: 'Marketing Strategy', icon: '📢' },
  { key: 'postproduction', label: 'Post-Production', icon: '🎞️' }
]

export default function PreProductionTabs({ projectId }: PreProductionTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  const startV2PreProduction = () => {
    // Set auto-generation flag and navigate to V2
    if (typeof window !== 'undefined') {
      localStorage.setItem('scorched-auto-generate', 'true')
    }
    router.push(`/preproduction/v2?projectId=${projectId}&arc=1`)
  }

  // Check if we're on the main narrative page
  const isOnNarrativePage = pathname === `/projects/${projectId}`

  return (
    <div className="border-b border-[#36393f]/50 bg-[#1a1a1a]/60 backdrop-blur-sm">
      <div className="px-4 py-4">
        {/* V2 Pre-Production CTA */}
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#e2c376]/10 border border-[#e2c376]/30 rounded-lg">
            <span className="text-[#e2c376] font-medium">✨ New V2 System Available</span>
          </div>
          <h3 className="text-lg font-semibold text-[#e7e7e7]">
            Comprehensive Pre-Production Generation
          </h3>
          <p className="text-sm text-[#e7e7e7]/70 max-w-2xl mx-auto">
            Generate all pre-production materials in one comprehensive workflow. 
            The new V2 system creates detailed content for every aspect of your production.
          </p>
          
          <Button
            onClick={startV2PreProduction}
            className="bg-[#e2c376] text-black hover:bg-[#f0d995] px-6 py-2 font-medium"
          >
            Start V2 Pre-Production
          </Button>
              </div>
              
        {/* V2 Content Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {v2Tabs.map((tab, index) => (
                <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-[#2a2a2a]/50 border border-[#36393f]/30 rounded-lg text-center"
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-xs font-medium text-[#e7e7e7]/80">{tab.label}</div>
            </motion.div>
          ))}
      </div>
      
        {/* Legacy Navigation Notice */}
        {!isOnNarrativePage && (
          <div className="mt-4 p-3 bg-orange-900/20 border border-orange-900/50 rounded-lg">
            <div className="flex items-center space-x-2 text-orange-400">
              <span>⚠️</span>
              <span className="text-sm font-medium">Legacy System</span>
            </div>
            <p className="text-xs text-orange-300/80 mt-1">
              You're viewing the old pre-production system. We recommend using the new V2 system for comprehensive generation.
            </p>
          </div>
        )}

        {/* Current navigation (for legacy routes) */}
        {!isOnNarrativePage && (
          <nav className="mt-4 pt-4 border-t border-[#36393f]/30">
            <div className="flex space-x-2 text-sm">
              <Link
                href={`/projects/${projectId}`}
                className="px-3 py-1 rounded text-[#e2c376] hover:bg-[#e2c376]/10"
              >
                ← Back to Project
              </Link>
              <button
                onClick={startV2PreProduction}
                className="px-3 py-1 rounded bg-[#e2c376]/20 text-[#e2c376] hover:bg-[#e2c376]/30"
              >
                Switch to V2
              </button>
        </div>
          </nav>
        )}
      </div>
    </div>
  )
} 