'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { User } from 'firebase/auth'

interface DashboardHeroProps {
  user: User | null
  hasProjects: boolean
  lastProjectTitle?: string
  lastProjectId?: string
}

export default function DashboardHero({ user, hasProjects, lastProjectTitle, lastProjectId }: DashboardHeroProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Creator'
  
  return (
    <div className={`relative ${isDark ? 'bg-gradient-to-br from-[#181818] to-[#1F1F1F] border border-[#475569]' : 'bg-gradient-to-br from-[#F2F3F5] to-white border border-[#E2E8F0]'} rounded-2xl p-8 md:p-12 text-center overflow-hidden mb-8`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981] rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <motion.h1 
          className={`text-3xl md:text-4xl lg:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-4`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome back, {displayName}
        </motion.h1>
        
        <motion.p 
          className={`text-lg md:text-xl ${isDark ? 'text-white/70' : 'text-black/70'} mb-8 max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {hasProjects 
            ? "What's next? Continue your creative journey or start something new"
            : "Ready to create your first story? Let's build something amazing together"
          }
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {hasProjects && lastProjectId && lastProjectTitle && (
            <Link
              href={`/dashboard?id=${lastProjectId}`}
              className={`px-6 py-3 ${isDark ? 'bg-[#1F1F1F] border border-[#475569] text-white hover:bg-[#181818]' : 'bg-white border border-[#E2E8F0] text-black hover:bg-[#F2F3F5]'} rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105`}
            >
              Continue "{lastProjectTitle}" →
            </Link>
          )}
          
          <Link
            href="/demo"
            className={`px-8 py-4 ${isDark ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#10B981] text-white hover:bg-[#059669]'} rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105`}
          >
            {hasProjects ? '+ Create New Story' : 'Create Your First Story →'}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

