'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from '@/components/ui/ClientMotion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import PageSkeleton from '@/components/loaders/PageSkeleton'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'

export default function ProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchProjects = async () => {
      // Check both useAuth hook and Firebase auth directly (fallback for cross-device issues)
      let userIdToUse = user?.id
      if (!userIdToUse && typeof window !== 'undefined') {
        try {
          const { auth } = await import('@/lib/firebase')
          const currentUser = auth.currentUser
          if (currentUser) {
            userIdToUse = currentUser.uid
            console.log('🔍 Projects: useAuth returned null, but Firebase auth.currentUser exists:', userIdToUse)
          }
        } catch (authError) {
          console.error('❌ Error checking Firebase auth in projects:', authError)
        }
      }

      if (!userIdToUse) {
        setLoading(false)
      return
    }
    
      try {
        const projectsRef = collection(db, 'users', userIdToUse, 'projects')
        const q = query(projectsRef, orderBy('createdAt', 'desc'))
        const projectsSnap = await getDocs(q)

        const projectsList: any[] = []
        projectsSnap.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() })
        })

        setProjects(projectsList)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [user])
  
  if (!user) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Sign In Required</h2>
          <p className="text-[#e7e7e7]/80 mb-6 text-center">
            Please sign in to view your projects.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/login"
              className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <PageSkeleton variant="projects" />
      </div>
    )
  }
  
  return (
    <motion.div 
      className="min-h-screen p-6 max-w-7xl mx-auto relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      <AnimatedBackground variant="particles" intensity="low" page="projects" />
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <GlobalThemeToggle />
      </div>
      {/* Revolutionary Header */}
      <motion.div 
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Fire Icon */}
        <motion.div
          className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="text-5xl">🔥</span>
        </motion.div>
        
        {/* Revolutionary Title */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 elegant-fire fire-gradient animate-flameFlicker"
          initial={{ letterSpacing: "-0.1em", opacity: 0 }}
          animate={{ letterSpacing: "0.02em", opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          YOUR SCORCHED EMPIRE
        </motion.h1>

        {/* Revolutionary Subtitle */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed elegant-fire">
            Command center for your <span className="text-[#e2c376] font-bold">revolutionary projects</span>. Ignite creativity, forge narratives, dominate Hollywood.
          </p>
        </motion.div>
      </motion.div>

      {/* Revolutionary Project Controls */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        {/* Project Count */}
        <motion.div 
          className="px-6 py-3 bg-gradient-to-r from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/30 rounded-xl"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-[#e2c376] font-bold text-lg elegant-fire">🏛️ {projects.length} ACTIVE REBELLIONS</span>
      </motion.div>

        {/* New Project Button */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
        <Link 
          href="/"
            className="burn-button px-8 py-3 text-lg font-bold inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
            <span className="relative z-10 elegant-fire">⚡ IGNITE NEW REBELLION</span>
        </Link>
        </motion.div>
      </motion.div>
        
        {/* Revolutionary Error Display */}
        {error && (
          <motion.div 
            className="bg-gradient-to-r from-[#D62828]/20 to-[#FF6B00]/20 border border-[#D62828]/50 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="text-white font-bold elegant-fire">{error}</span>
          </div>
          </motion.div>
        )}
        
      {projects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
          {projects.map((project, index) => {
            // Support both new and old formats
            const projectTitle = project.storyBible?.seriesTitle || project.title || 'Untitled Project'
            const projectTheme = project.storyBible?.theme || project.theme || 'No theme'
            const createdAt = project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'

            return (
              <motion.div
                key={project.id}
                className="rebellious-card p-6 cursor-pointer relative overflow-hidden group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + (index * 0.1), duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 via-[#FF6B00]/10 to-[#e2c376]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* Project Icon */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 ember-shadow rounded-xl flex items-center justify-center mr-4">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-[#e2c376] mb-1 line-clamp-1 elegant-fire animate-flameFlicker">{projectTitle}</h2>
                      <div className="text-xs text-[#e2c376]/70 elegant-fire">Created {createdAt}</div>
                    </div>
                  </div>
                  
                  {/* Project Theme */}
                  <p className="text-white/90 text-base mb-6 line-clamp-3 elegant-fire leading-relaxed">{projectTheme}</p>
                  
                  {/* Project Status */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#e2c376]/20">
                    <div className="px-3 py-1 bg-gradient-to-r from-[#D62828]/30 to-[#FF6B00]/30 border border-[#e2c376]/40 rounded-lg">
                      <span className="text-[#e2c376] text-sm font-bold elegant-fire">
                        {project.storyBible?.narrativeArcs?.length ? `🏛️ ${project.storyBible.narrativeArcs.length} ARCS` : '🔥 PRE-PRODUCTION'}
                      </span>
                    </div>
                    <div className="flex items-center text-[#e2c376]/70">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs elegant-fire">OPEN</span>
                    </div>
                  </div>
                      </div>
              </motion.div>
            )
          })}
          </motion.div>
        ) : (
          <motion.div 
          className="rebellious-card p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {/* Background flame effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 via-[#FF6B00]/10 to-[#e2c376]/10 opacity-50"></div>
          
          <div className="relative z-10">
            {/* Empty state icon */}
            <motion.div
              className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.4, type: "spring" }}
            >
              <span className="text-6xl">🏛️</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-black text-[#e2c376] mb-4 elegant-fire fire-gradient animate-flameFlicker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
            >
              NO REBELLIONS YET
            </motion.h2>
            
            <motion.p 
              className="text-white/90 text-lg mb-8 max-w-md mx-auto elegant-fire leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              Your empire awaits. Start your first <span className="text-[#e2c376] font-bold">revolutionary project</span> and watch Hollywood burn.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
          <Link 
            href="/"
                className="burn-button px-10 py-4 text-xl font-black inline-flex items-center"
          >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="relative z-10 elegant-fire">🔥 IGNITE FIRST REBELLION</span>
          </Link>
            </motion.div>
          </div>
          </motion.div>
        )}
    </motion.div>
  )
} 