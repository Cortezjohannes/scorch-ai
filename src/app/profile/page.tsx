'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from '@/components/ui/ClientMotion'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import { getStoryBibles, deleteStoryBible, StoryBible } from '@/services/story-bible-service'
import { getUserShareLinks, revokeShareLink, ShareLink } from '@/services/share-link-service'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal'
import ShareLinkCard from '@/components/dashboard/ShareLinkCard'
import DashboardHero from '@/components/dashboard/DashboardHero'
import ProjectCard from '@/components/dashboard/ProjectCard'
import PageSkeleton from '@/components/loaders/PageSkeleton'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [storyBibles, setStoryBibles] = useState<StoryBible[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; storyBible: StoryBible | null }>({
    isOpen: false,
    storyBible: null,
  })
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'in-progress' | 'complete'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'a-z' | 'z-a'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Shared links states
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loadingSharedLinks, setLoadingSharedLinks] = useState(true)
  const [showSharedLinks, setShowSharedLinks] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    console.log('🔍 Profile Page Auth Check:');
    console.log('  - isLoading:', isLoading);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    
    if (!isLoading && !isAuthenticated) {
      console.log('  → Redirecting to login...');
      router.push('/login?redirect=/profile')
    } else if (!isLoading && isAuthenticated) {
      console.log('  ✅ Authenticated, staying on profile');
    }
  }, [isAuthenticated, isLoading, user, router])

  // Load story bibles
  useEffect(() => {
    async function loadStoryBibles() {
      // Check both useAuth hook and Firebase auth directly (fallback for cross-device issues)
      let userIdToUse = user?.id
      if (!userIdToUse && typeof window !== 'undefined') {
        try {
          const { auth } = await import('@/lib/firebase')
          const currentUser = auth.currentUser
          if (currentUser) {
            userIdToUse = currentUser.uid
            console.log('🔍 Profile: useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse)
          }
        } catch (authError) {
          console.error('❌ Error checking Firebase auth in profile:', authError)
        }
      }

      if (userIdToUse) {
        setLoadingProjects(true)
        try {
          const bibles = await getStoryBibles(userIdToUse)
          setStoryBibles(bibles)
        } catch (error) {
          console.error('Error loading story bibles:', error)
        } finally {
          setLoadingProjects(false)
        }
      } else {
        setLoadingProjects(false)
      }
    }

    if (!isLoading) {
      loadStoryBibles()
    }
  }, [user, isLoading])

  // Load shared links
  useEffect(() => {
    async function loadSharedLinks() {
      // Check both useAuth hook and Firebase auth directly (fallback for cross-device issues)
      let userIdToUse = user?.id
      if (!userIdToUse && typeof window !== 'undefined') {
        try {
          const { auth } = await import('@/lib/firebase')
          const currentUser = auth.currentUser
          if (currentUser) {
            userIdToUse = currentUser.uid
            console.log('🔍 Profile (shared links): useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse)
          }
        } catch (authError) {
          console.error('❌ Error checking Firebase auth in profile (shared links):', authError)
        }
      }

      if (userIdToUse) {
        setLoadingSharedLinks(true)
        try {
          const links = await getUserShareLinks(userIdToUse)
          setShareLinks(links)
          // Auto-expand if user has 5 or fewer links
          setShowSharedLinks(links.length > 0 && links.length <= 5)
        } catch (error) {
          console.error('Error loading shared links:', error)
        } finally {
          setLoadingSharedLinks(false)
        }
      } else {
        setLoadingSharedLinks(false)
      }
    }

    if (!isLoading) {
      loadSharedLinks()
    }
  }, [user, isLoading])

  // Handle revoking a shared link
  const handleRevokeLink = async (shareId: string) => {
    if (!user) return
    
    try {
      await revokeShareLink(shareId, user.id)
      // Remove from local state
      setShareLinks(prev => prev.filter(link => link.shareId !== shareId))
    } catch (error) {
      console.error('Error revoking link:', error)
      alert('Failed to revoke link. Please try again.')
    }
  }

  // Filter and sort story bibles
  const filteredAndSortedBibles = React.useMemo(() => {
    let filtered = storyBibles

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(bible =>
        bible.seriesTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bible => bible.status === statusFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'a-z':
          return (a.seriesTitle || '').localeCompare(b.seriesTitle || '')
        case 'z-a':
          return (b.seriesTitle || '').localeCompare(a.seriesTitle || '')
        default:
          return 0
      }
    })

    return sorted
  }, [storyBibles, searchQuery, statusFilter, sortBy])

  const handleDelete = async () => {
    if (!deleteModal.storyBible) return

    try {
      await deleteStoryBible(deleteModal.storyBible.id, user?.id)
      setStoryBibles(prev => prev.filter(sb => sb.id !== deleteModal.storyBible?.id))
      setDeleteModal({ isOpen: false, storyBible: null })
    } catch (error) {
      console.error('Error deleting story bible:', error)
    }
  }
  
  const handleDeleteClick = (id: string) => {
    const bible = storyBibles.find(sb => sb.id === id)
    if (bible) {
      setDeleteModal({ isOpen: true, storyBible: bible })
    }
  }
  
  // Get recent projects (top 5 most recently edited)
  const recentProjects = React.useMemo(() => {
    return [...storyBibles]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [storyBibles])
  
  // Get last project for hero "Continue" button
  const lastProject = recentProjects[0]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${prefix}-bg-primary`} style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`w-16 h-16 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 border-2 ${prefix}-border-accent rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#10B981]/20 overflow-hidden`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image 
              src="/greenlitailogo.png" 
              alt="Greenlit Logo" 
              width={48}
              height={48}
              className="object-contain"
            />
          </motion.div>
          <motion.div 
            className="w-12 h-12 border-4 border-t-[#10B981] border-r-[#10B98150] border-b-[#10B98130] border-l-[#10B98120] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className={`${prefix}-text-primary text-lg`}>Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`min-h-screen py-16 ${prefix}-bg-primary relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <AnimatedBackground variant="particles" intensity="low" page="profile" />
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <GlobalThemeToggle />
      </div>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <DashboardHero 
            user={user}
            hasProjects={storyBibles.length > 0}
            lastProjectTitle={lastProject?.seriesTitle}
            lastProjectId={lastProject?.id}
          />
          
          {/* Recent Projects Carousel */}
          {!loadingProjects && recentProjects.length > 0 && (
          <motion.div
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'}`}>
                  Recent Projects
                </h2>
                {filteredAndSortedBibles.length > recentProjects.length && (
                  <button
                    onClick={() => {
                      const element = document.getElementById('all-projects')
                      element?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className={`text-sm ${prefix === 'dark' ? 'text-[#34D399] hover:text-[#10B981]' : 'text-[#059669] hover:text-[#10B981]'} font-medium transition-colors`}
                  >
                    View All →
                  </button>
                  )}
                </div>

              {/* Horizontal Scroll Carousel */}
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {recentProjects.map((bible, index) => (
                  <ProjectCard
                    key={bible.id}
                    bible={bible}
                    index={index}
                    variant="carousel"
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {/* All Projects Section */}
          {!loadingProjects && storyBibles.length > 0 && (
            <motion.div
              id="all-projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1`}>
                    All Projects
                  </h2>
                  <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                    {filteredAndSortedBibles.length} {filteredAndSortedBibles.length === 1 ? 'project' : 'projects'}
                  </p>
                </div>

                {/* View Toggle */}
                  <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? `${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399]' : 'bg-[#10B981]/10 text-[#059669]'}`
                        : `${prefix === 'dark' ? 'bg-[#1F1F1F] text-white/60 hover:bg-[#181818]' : 'bg-[#F2F3F5] text-black/60 hover:bg-[#EBEDF0]'}`
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? `${prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399]' : 'bg-[#10B981]/10 text-[#059669]'}`
                        : `${prefix === 'dark' ? 'bg-[#1F1F1F] text-white/60 hover:bg-[#181818]' : 'bg-[#F2F3F5] text-black/60 hover:bg-[#EBEDF0]'}`
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-4 flex flex-col sm:flex-row gap-3 mb-6`}>
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
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                  className={`px-4 py-2 ${prefix === 'dark' ? 'bg-[#121212] text-white border-[#475569]' : 'bg-white text-black border-[#E2E8F0]'} border rounded-lg focus:outline-none focus:border-[#10B981] text-sm cursor-pointer`}
                    >
                      <option value="recent">Sort: Recent</option>
                      <option value="oldest">Oldest</option>
                      <option value="a-z">A-Z</option>
                      <option value="z-a">Z-A</option>
                    </select>
                  </div>
              
              {/* Projects Display */}
              {filteredAndSortedBibles.length === 0 ? (
                <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-12 text-center`}>
                  <div className="text-6xl mb-4">🔍</div>
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
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedBibles.map((bible, index) => (
                    <ProjectCard
                      key={bible.id}
                      bible={bible}
                      index={index}
                      variant="grid"
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              ) : (
                <div className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl overflow-hidden`}>
                  <div className={`${prefix === 'dark' ? 'bg-[#1F1F1F] border-b border-[#475569]' : 'bg-[#F2F3F5] border-b border-[#E2E8F0]'} px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} uppercase tracking-wide`}>
                    <div className="col-span-5">Project</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Last Edited</div>
                    <div className="col-span-2">Progress</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-[#475569]/50">
                    {filteredAndSortedBibles.map((bible, index) => {
                      const formatDate = (dateString: string) => {
                        const date = new Date(dateString)
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      }
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'complete':
                            return prefix === 'dark' ? 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40' : 'bg-[#10B981]/10 text-[#059669] border-[#10B981]/30'
                          case 'in-progress':
                            return prefix === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          case 'draft':
                            return prefix === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/40' : 'bg-gray-500/10 text-gray-600 border-gray-500/30'
                          default:
                            return ''
                        }
                      }
                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'complete': return '✓'
                          case 'in-progress': return '⚡'
                          case 'draft': return '📝'
                          default: return '•'
                        }
                      }
                      const getProgressPercentage = (status: string) => {
                        switch (status) {
                          case 'complete': return 100
                          case 'in-progress': return 60
                          case 'draft': return 20
                          default: return 0
                        }
                      }
                      return (
                      <motion.div
                        key={bible.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group px-6 py-4 grid grid-cols-12 gap-4 items-center hover:${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#F2F3F5]'} transition-colors cursor-pointer`}
                        >
                          <div className="col-span-5">
                            <h3 className={`font-semibold ${prefix === 'dark' ? 'text-white' : 'text-black'} mb-1`}>
                                  {bible.seriesTitle || 'Untitled Story Bible'}
                            </h3>
                            {bible.seriesOverview && (
                              <p className={`text-sm ${prefix === 'dark' ? 'text-white/60' : 'text-black/60'} line-clamp-1`}>
                                {bible.seriesOverview}
                              </p>
                            )}
                              </div>
                          <div className="col-span-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bible.status)}`}>
                              <span>{getStatusIcon(bible.status)}</span>
                              <span className="capitalize">{bible.status.replace('-', ' ')}</span>
                            </div>
                          </div>
                          <div className={`col-span-2 text-sm ${prefix === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                            {formatDate(bible.updatedAt)}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <div className={`flex-1 h-2 ${prefix === 'dark' ? 'bg-[#1F1F1F]' : 'bg-[#E2E8F0]'} rounded-full overflow-hidden`}>
                                <div 
                                  className={`h-full ${
                                    bible.status === 'complete' ? 'bg-[#10B981]' :
                                    bible.status === 'in-progress' ? 'bg-amber-500' :
                                    'bg-gray-500'
                                  } transition-all`}
                                  style={{ width: `${getProgressPercentage(bible.status)}%` }}
                                />
                              </div>
                              <span className={`text-xs ${prefix === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                                {getProgressPercentage(bible.status)}%
                              </span>
                            </div>
                          </div>
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
                                handleDeleteClick(bible.id)
                              }}
                              title="Delete"
                            >
                              ×
                            </button>
                        </div>
                      </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Empty State - No Projects */}
          {!loadingProjects && storyBibles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${prefix === 'dark' ? 'bg-[#181818] border border-[#475569]' : 'bg-white border border-[#E2E8F0]'} rounded-xl p-12 text-center`}
            >
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
            </motion.div>
          )}
          
          {/* Loading State */}
          {loadingProjects && (
            <PageSkeleton variant="dashboard" />
          )}

          {/* Shared Links Section */}
          {shareLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className={`${prefix}-bg-secondary border ${prefix}-border-accent rounded-2xl p-8 mb-6 ${prefix}-shadow-lg`}
            >
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => setShowSharedLinks(!showSharedLinks)}>
                <div className="flex items-center gap-3">
                  <h3 className={`text-xl font-bold ${prefix}-text-primary`}>Shared Links</h3>
                  <span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-medium">
                    {shareLinks.filter(l => l.isActive).length} active
                  </span>
                </div>
                <button className={`${prefix}-text-tertiary hover:${prefix}-text-primary transition-colors`}>
                  {showSharedLinks ? '▼' : '▶'}
                </button>
              </div>

              {showSharedLinks && (
                <div className="space-y-3">
                  {loadingSharedLinks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[1, 2].map(i => (
                        <div key={i} className={`${prefix}-bg-secondary rounded-lg p-4 border ${prefix}-border animate-pulse`}>
                          <div className="h-5 bg-[#10B981]/10 rounded mb-3 w-3/4"></div>
                          <div className="h-4 bg-[#10B981]/10 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {shareLinks.map((link) => {
                        const storyBible = storyBibles.find(sb => sb.id === link.storyBibleId)
                        return (
                          <ShareLinkCard
                            key={link.shareId}
                            link={link}
                            storyBibleTitle={storyBible?.seriesTitle}
                            onRevoke={handleRevokeLink}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`${prefix}-bg-secondary border border-red-500/30 rounded-2xl p-8 ${prefix}-shadow-lg`}
          >
            <h3 className={`text-lg font-bold ${prefix}-text-primary mb-4 flex items-center gap-2`}>
              <span>⚠️</span> Danger Zone
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-red-500/20">
                <div>
                  <div className={`${prefix}-text-primary font-medium mb-1`}>Sign Out</div>
                  <div className={`${prefix}-text-tertiary text-sm`}>Sign out of your account on this device</div>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className={`${prefix}-text-primary font-medium mb-1`}>Delete Account</div>
                  <div className={`${prefix}-text-tertiary text-sm`}>Permanently delete your account and all data</div>
                </div>
                <button className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Story Bible?"
        message={`Are you sure you want to delete "${deleteModal.storyBible?.seriesTitle || 'this story bible'}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, storyBible: null })}
      />
    </motion.div>
  )
}

