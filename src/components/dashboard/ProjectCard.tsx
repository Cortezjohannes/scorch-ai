'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { StoryBible } from '@/services/story-bible-service'

interface ProjectCardProps {
  bible: StoryBible
  index?: number
  variant?: 'grid' | 'carousel'
  onDelete?: (id: string) => void
}

export default function ProjectCard({ bible, index = 0, variant = 'grid', onDelete }: ProjectCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return isDark ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40' : 'bg-[#10B981]/10 text-[#059669] border-[#10B981]/30'
      case 'in-progress':
        return isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
      case 'draft':
        return isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/40' : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
      default:
        return ''
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return '✓'
      case 'in-progress':
        return '⚡'
      case 'draft':
        return '📝'
      default:
        return '•'
    }
  }
  
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'complete':
        return 100
      case 'in-progress':
        return 60
      case 'draft':
        return 20
      default:
        return 0
    }
  }
  
  if (variant === 'carousel') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className={`flex-shrink-0 w-80 ${isDark ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-6 cursor-pointer transition-all hover:border-[#10B981] hover:${isDark ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
            {getStatusIcon(bible.status)} {bible.status.replace('-', ' ')}
          </div>
        </div>
        
        <Link href={`/dashboard?id=${bible.id}`}>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2`}>
            {bible.seriesTitle || 'Untitled Story Bible'}
          </h3>
          {bible.seriesOverview && (
            <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'} mb-4 line-clamp-3`}>
              {bible.seriesOverview}
            </p>
          )}
        </Link>
        
        <div className={`flex items-center justify-between text-xs ${isDark ? 'text-white/50' : 'text-black/50'} mb-4`}>
          <span>Last edited: {formatDate(bible.updatedAt)}</span>
          <span>{(bible.characters?.length || bible.mainCharacters?.length || 0)} characters</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className={`flex-1 h-2 ${isDark ? 'bg-[#1F1F1F]' : 'bg-[#E2E8F0]'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${
                  bible.status === 'complete' ? 'bg-[#10B981]' :
                  bible.status === 'in-progress' ? 'bg-amber-500' :
                  'bg-gray-500'
                } transition-all`}
                style={{ width: `${getProgressPercentage(bible.status)}%` }}
              />
            </div>
            <span className={`text-xs ${isDark ? 'text-white/50' : 'text-black/50'}`}>
              {getProgressPercentage(bible.status)}%
            </span>
          </div>
        </div>
        
        <Link
          href={`/dashboard?id=${bible.id}`}
          className={`block w-full px-4 py-2 ${isDark ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium text-center transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          Continue →
        </Link>
      </motion.div>
    )
  }
  
  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative group cursor-pointer h-80 ${isDark ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl overflow-hidden transition-all hover:border-[#10B981] hover:${isDark ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'}`}
    >
      {/* Poster-style background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        (bible.seriesTitle || '').toLowerCase().includes('sci') ? 'from-blue-500/20 to-purple-500/20' :
        (bible.seriesTitle || '').toLowerCase().includes('fantasy') ? 'from-purple-500/20 to-pink-500/20' :
        (bible.seriesTitle || '').toLowerCase().includes('drama') ? 'from-amber-500/20 to-orange-500/20' :
        (bible.seriesTitle || '').toLowerCase().includes('cyber') ? 'from-cyan-500/20 to-blue-500/20' :
        (bible.seriesTitle || '').toLowerCase().includes('mystery') ? 'from-gray-500/20 to-slate-500/20' :
        'from-green-500/20 to-teal-500/20'
      } opacity-50 group-hover:opacity-70 transition-opacity`} />
      
      <div className="relative h-full flex flex-col p-6">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
            {getStatusIcon(bible.status)} {bible.status.replace('-', ' ')}
          </div>
        </div>
        
        {/* Title and Overview */}
        <div className="flex-1 flex flex-col justify-end">
          <Link href={`/dashboard?id=${bible.id}`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-2 line-clamp-2`}>
              {bible.seriesTitle || 'Untitled Story Bible'}
            </h3>
            {bible.seriesOverview && (
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'} mb-4 line-clamp-2`}>
                {bible.seriesOverview}
              </p>
            )}
          </Link>
          
          {/* Quick Stats */}
          <div className={`flex gap-4 text-xs ${isDark ? 'text-white/50' : 'text-black/50'} mb-4`}>
            <span>{(bible.characters?.length || bible.mainCharacters?.length || 0)} characters</span>
            <span>•</span>
            <span>{(bible.storyArcs?.length || bible.narrativeArcs?.length || 0)} arcs</span>
            {bible.worldElements && bible.worldElements.length > 0 && (
              <>
                <span>•</span>
                <span>{bible.worldElements.length} locations</span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions - Show on Hover */}
        <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <Link
            href={`/dashboard?id=${bible.id}`}
            className={`flex-1 px-3 py-2 ${isDark ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium text-center transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            Open
          </Link>
          {onDelete && (
            <button
              className={`px-3 py-2 ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'} rounded-lg text-sm font-medium transition-colors`}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bible.id)
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

