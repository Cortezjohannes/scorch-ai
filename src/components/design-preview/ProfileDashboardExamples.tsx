'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'

interface ProfileDashboardExamplesProps {
  theme: 'light' | 'dark'
}

type LayoutConcept = 'studio' | 'desk' | 'focus'

interface MockStoryBible {
  id: string
  seriesTitle: string
  genre: string
  status: 'draft' | 'in-progress' | 'complete'
  lastEdited: string
  characterCount: number
  arcCount: number
  wordCount?: number
  overview?: string
}

const mockStoryBibles: MockStoryBible[] = [
  {
    id: '1',
    seriesTitle: 'The Midnight Chronicles',
    genre: 'Sci-Fi Thriller',
    status: 'in-progress',
    lastEdited: '2024-01-15',
    characterCount: 12,
    arcCount: 3,
    wordCount: 45000,
    overview: 'A time-traveling detective solves crimes across multiple timelines while trying to prevent a catastrophic future.'
  },
  {
    id: '2',
    seriesTitle: 'Crimson Shadows',
    genre: 'Urban Fantasy',
    status: 'complete',
    lastEdited: '2024-01-10',
    characterCount: 8,
    arcCount: 5,
    wordCount: 120000,
    overview: 'A secret society of vampires and werewolves navigates modern-day politics in New York City.'
  },
  {
    id: '3',
    seriesTitle: 'Echoes of Tomorrow',
    genre: 'Drama',
    status: 'draft',
    lastEdited: '2024-01-08',
    characterCount: 6,
    arcCount: 2,
    wordCount: 15000,
    overview: 'Three generations of a family grapple with legacy, memory, and the choices that define them.'
  },
  {
    id: '4',
    seriesTitle: 'Neon Dreams',
    genre: 'Cyberpunk',
    status: 'in-progress',
    lastEdited: '2024-01-12',
    characterCount: 15,
    arcCount: 4,
    wordCount: 68000,
    overview: 'In a dystopian future, a hacker uncovers a conspiracy that threatens to erase human consciousness.'
  },
  {
    id: '5',
    seriesTitle: 'The Last Lighthouse',
    genre: 'Mystery',
    status: 'draft',
    lastEdited: '2024-01-05',
    characterCount: 5,
    arcCount: 1,
    wordCount: 8000,
    overview: 'A small coastal town holds dark secrets that surface when a lighthouse keeper disappears.'
  },
  {
    id: '6',
    seriesTitle: 'Stardust & Steel',
    genre: 'Space Opera',
    status: 'in-progress',
    lastEdited: '2024-01-14',
    characterCount: 20,
    arcCount: 6,
    wordCount: 95000,
    overview: 'A ragtag crew of space pirates becomes embroiled in an intergalactic war for control of rare energy crystals.'
  }
]

export default function ProfileDashboardExamples({ theme }: ProfileDashboardExamplesProps) {
  const { theme: contextTheme } = useTheme()
  const actualTheme = theme || contextTheme || 'dark'
  const isDark = actualTheme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  
  const [activeLayout, setActiveLayout] = useState<LayoutConcept>('studio')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'in-progress' | 'complete'>('all')
  
  // Filter story bibles
  const filteredBibles = mockStoryBibles.filter(bible => {
    const matchesSearch = bible.seriesTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bible.genre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bible.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
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
  
  const renderStudioLayout = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className={`${prefix}-card p-4 flex flex-col sm:flex-row gap-3`}>
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm cursor-pointer`}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        
        {/* Grid of Project Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card - Always First */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group cursor-pointer`}
          >
            <Link href="/demo">
              <div className={`h-80 ${prefix === 'dark' ? 'bg-[#181818] border-2 border-dashed border-[#475569]' : 'bg-[#F2F3F5] border-2 border-dashed border-[#E2E8F0]'} rounded-xl flex flex-col items-center justify-center transition-all hover:border-[#10B981] hover:${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#EBEDF0]'}`}>
                <div className={`w-16 h-16 ${prefix === 'dark' ? 'bg-[#10B981]/20' : 'bg-[#10B981]/10'} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">+</span>
                </div>
                <h3 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
                  New Story
                </h3>
                <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} text-center px-4`}>
                  Start creating your next epic tale
                </p>
                <div className={`mt-4 px-4 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399]' : 'bg-[#10B981]/10 text-[#059669]'} rounded-lg text-sm font-medium group-hover:${prefix === 'dark' ? 'bg-[#10B981]/30' : 'bg-[#10B981]/20'} transition-colors`}>
                  Create Now →
                </div>
              </div>
            </Link>
          </motion.div>
          
          {/* Story Bible Cards */}
          {filteredBibles.map((bible, index) => (
            <motion.div
              key={bible.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`relative group cursor-pointer h-80 ${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl overflow-hidden transition-all hover:border-[#10B981] hover:${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'}`}
            >
              {/* Poster-style background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                bible.genre.includes('Sci-Fi') ? 'from-blue-500/20 to-purple-500/20' :
                bible.genre.includes('Fantasy') ? 'from-purple-500/20 to-pink-500/20' :
                bible.genre.includes('Drama') ? 'from-amber-500/20 to-orange-500/20' :
                bible.genre.includes('Cyberpunk') ? 'from-cyan-500/20 to-blue-500/20' :
                bible.genre.includes('Mystery') ? 'from-gray-500/20 to-slate-500/20' :
                'from-green-500/20 to-teal-500/20'
              } opacity-50 group-hover:opacity-70 transition-opacity`} />
              
              <div className="relative h-full flex flex-col p-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
                    {getStatusIcon(bible.status)} {bible.status}
                  </div>
                </div>
                
                {/* Title and Genre */}
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2 line-clamp-2`}>
                    {bible.seriesTitle}
                  </h3>
                  <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-4`}>
                    {bible.genre}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className={`flex gap-4 text-xs ${prefix === 'dark' ? 'text-white/50' : 'text-black/50'} mb-4`}>
                    <span>{bible.characterCount} characters</span>
                    <span>•</span>
                    <span>{bible.arcCount} arcs</span>
                  </div>
                </div>
                
                {/* Actions - Show on Hover */}
                <div className={`flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <Link
                    href={`/dashboard?id=${bible.id}`}
                    className={`flex-1 px-3 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium text-center transition-colors`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </Link>
                  <button
                    className={`px-3 py-2 ${prefix === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'} rounded-lg text-sm font-medium transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Delete action would go here
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredBibles.length === 0 && (
          <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-12 text-center`}>
            <div className="text-6xl mb-4">📖</div>
            <h4 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
              No projects found
            </h4>
            <p className={`${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-6`}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium transition-colors`}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    )
  }
  
  const renderDeskLayout = () => {
    return (
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1`}>
              Your Projects
            </h2>
            <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
              {filteredBibles.length} {filteredBibles.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <Link
            href="/demo"
            className={`px-6 py-3 ${prefix === 'dark' ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#10B981] text-white hover:bg-[#059669]'} rounded-lg font-semibold transition-colors whitespace-nowrap`}
          >
            + New Project
          </Link>
        </div>
        
        {/* Search and Filter */}
        <div className={`${prefix}-card p-4 flex flex-col sm:flex-row gap-3`}>
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm cursor-pointer`}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        
        {/* List/Table View */}
        <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl overflow-hidden`}>
          {/* Table Header */}
          <div className={`${prefix === 'dark' ? 'bg-[#1F1F1F] border-b border-[#475569]' : 'bg-[#F2F3F5] border-b border-[#E2E8F0]'} px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} uppercase tracking-wide`}>
            <div className="col-span-5">Project</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Edited</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-[#475569]/50">
            {filteredBibles.map((bible, index) => (
              <motion.div
                key={bible.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group px-6 py-4 grid grid-cols-12 gap-4 items-center hover:${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'} transition-colors cursor-pointer`}
              >
                {/* Project Info */}
                <div className="col-span-5">
                  <h3 className={`font-semibold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1`}>
                    {bible.seriesTitle}
                  </h3>
                  <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    {bible.genre}
                  </p>
                </div>
                
                {/* Status */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
                    <span>{getStatusIcon(bible.status)}</span>
                    <span className="capitalize">{bible.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                {/* Last Edited */}
                <div className={`col-span-2 text-sm ${prefix === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                  {formatDate(bible.lastEdited)}
                </div>
                
                {/* Progress */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 ${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#E2E8F0]'} rounded-full overflow-hidden`}>
                      <div 
                        className={`h-full ${
                          bible.status === 'complete' ? 'bg-[#10B981]' :
                          bible.status === 'in-progress' ? 'bg-amber-500' :
                          'bg-gray-500'
                        } transition-all`}
                        style={{ width: `${bible.status === 'complete' ? 100 : bible.status === 'in-progress' ? 60 : 20}%` }}
                      />
                    </div>
                    <span className={`text-xs ${prefix === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                      {bible.status === 'complete' ? '100%' : bible.status === 'in-progress' ? '60%' : '20%'}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard?id=${bible.id}`}
                    className={`p-2 ${prefix === 'dark' ? 'hover:bg-[#10B981]/20 text-[#34D399]' : 'hover:bg-[#10B981]/10 text-[#059669]'} rounded-lg transition-colors`}
                    onClick={(e) => e.stopPropagation()}
                    title="Open"
                  >
                    →
                  </Link>
                  <button
                    className={`p-2 ${prefix === 'dark' ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-500/10 text-red-600'} rounded-lg transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Delete action
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Empty State */}
        {filteredBibles.length === 0 && (
          <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-12 text-center`}>
            <div className="text-6xl mb-4">📋</div>
            <h4 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
              No projects found
            </h4>
            <p className={`${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-6`}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium transition-colors`}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    )
  }
  
  const renderFocusLayout = () => {
    const recentBibles = filteredBibles.slice(0, 3)
    
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className={`relative ${prefix === 'dark' ? 'bg-gradient-to-br from-[#181818] to-[#1F1F1F] border border-[#475569]' : 'bg-gradient-to-br from-[#F2F3F5] to-white border border-[#E2E8F0]'} rounded-2xl p-12 text-center overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981] rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h1 className={`text-4xl md:text-5xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-4`}>
              What's next?
            </h1>
            <p className={`text-lg ${prefix === 'dark' ? 'text-white/70' : 'text-black/70'} mb-8 max-w-2xl mx-auto`}>
              Continue your creative journey or start something new
            </p>
            <Link
              href="/demo"
              className={`inline-block px-8 py-4 ${prefix === 'dark' ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#10B981] text-white hover:bg-[#059669]'} rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105`}
            >
              Create New Story →
            </Link>
          </div>
        </div>
        
        {/* Recent Projects Section */}
        {recentBibles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'}`}>
                Recent Projects
              </h2>
              <Link
                href="#"
                className={`text-sm ${prefix === 'dark' ? 'text-[#34D399] hover:text-[#10B981]' : 'text-[#059669] hover:text-[#10B981]'} font-medium transition-colors`}
              >
                View All →
              </Link>
            </div>
            
            {/* Horizontal Scroll Carousel */}
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {recentBibles.map((bible, index) => (
                <motion.div
                  key={bible.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`flex-shrink-0 w-80 ${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-6 cursor-pointer transition-all hover:border-[#10B981] hover:${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
                      {getStatusIcon(bible.status)} {bible.status}
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
                    {bible.seriesTitle}
                  </h3>
                  <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-4`}>
                    {bible.genre}
                  </p>
                  
                  {bible.overview && (
                    <p className={`text-sm ${prefix === 'dark' ? 'text-white/70' : 'text-black/70'} mb-4 line-clamp-3`}>
                      {bible.overview}
                    </p>
                  )}
                  
                  <div className={`flex items-center justify-between text-xs ${prefix === 'dark' ? 'text-white/50' : 'text-black/50'} mb-4`}>
                    <span>Last edited: {formatDate(bible.lastEdited)}</span>
                    <span>{bible.characterCount} characters</span>
                  </div>
                  
                  <Link
                    href={`/dashboard?id=${bible.id}`}
                    className={`block w-full px-4 py-2 ${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] hover:bg-[#10B981]/30' : 'bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20'} rounded-lg text-sm font-medium text-center transition-colors`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Continue →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Projects Section */}
        {filteredBibles.length > 3 && (
          <div>
            <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-6`}>
              All Projects
            </h2>
            
            {/* Search and Filter */}
            <div className={`${prefix}-card p-4 flex flex-col sm:flex-row gap-3 mb-6`}>
              <input
                type="text"
                placeholder="🔍 Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm`}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm cursor-pointer`}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            
            {/* Grid of remaining projects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBibles.slice(3).map((bible, index) => (
                <motion.div
                  key={bible.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-lg p-4 cursor-pointer transition-all hover:border-[#10B981]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`font-semibold ${prefix === 'dark' ? 'text-white' : 'text-black'} flex-1`}>
                      {bible.seriesTitle}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
                      {getStatusIcon(bible.status)}
                    </div>
                  </div>
                  <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-2`}>
                    {bible.genre}
                  </p>
                  <p className={`text-xs ${prefix === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                    {formatDate(bible.lastEdited)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {filteredBibles.length === 0 && (
          <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-12 text-center`}>
            <div className="text-6xl mb-4">✨</div>
            <h4 className={`text-xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-2`}>
              No projects yet
            </h4>
            <p className={`${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} mb-6`}>
              Create your first story to get started
            </p>
            <Link
              href="/demo"
              className={`inline-block px-6 py-3 ${prefix === 'dark' ? 'bg-[#10B981] text-black hover:bg-[#059669]' : 'bg-[#10B981] text-white hover:bg-[#059669]'} rounded-lg font-semibold transition-colors`}
            >
              Create Your First Story
            </Link>
          </div>
        )}
      </div>
    )
  }
  
  const renderLayout = () => {
    switch (activeLayout) {
      case 'studio':
        return renderStudioLayout()
      case 'desk':
        return renderDeskLayout()
      case 'focus':
        return renderFocusLayout()
      default:
        return renderStudioLayout()
    }
  }
  
  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix === 'dark' ? 'text-white' : 'text-black'}`}>
          Profile Dashboard Redesign
        </h2>
        <p className={`text-base mb-6 ${prefix === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
          Explore different layout concepts for the user dashboard - the first page users see after signing up
        </p>
      </div>
      
      {/* Layout Selector */}
      <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${prefix === 'dark' ? 'text-white' : 'text-black'}`}>
          Layout Concept
        </h3>
        <div className="flex gap-3 flex-wrap">
          {[
            { id: 'studio', label: 'The Studio', desc: 'Visual Grid - Best for inspiration' },
            { id: 'desk', label: 'The Desk', desc: 'Clean List - Best for organization' },
            { id: 'focus', label: 'The Focus', desc: 'Hero View - Best for quick access' }
          ].map((layout) => (
            <button
              key={layout.id}
              onClick={() => setActiveLayout(layout.id as LayoutConcept)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors text-left ${
                activeLayout === layout.id
                  ? `${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40' : 'bg-[#10B981]/10 text-[#059669] border border-[#10B981]/30'}`
                  : `${prefix === 'dark' ? 'bg-[#1F1F1F] text-white/70 hover:bg-[#1F1F1F]/80 border border-[#475569]' : 'bg-[#F2F3F5] text-black/70 hover:bg-[#EBEDF0] border border-[#E2E8F0]'}`
              }`}
            >
              <div className="font-semibold">{layout.label}</div>
              <div className="text-xs opacity-70 mt-1">{layout.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-8`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayout}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderLayout()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

