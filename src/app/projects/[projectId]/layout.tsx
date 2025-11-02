'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import PreProductionTabs from '@/components/projects/PreProductionTabs'
import { ProjectProvider } from '@/context/ProjectContext'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) {
        return
      }

      try {
        // First check localStorage for quick loading
        const cachedProject = localStorage.getItem(`scorched-project-${projectId}`) || localStorage.getItem(`reeled-project-${projectId}`)
        if (cachedProject) {
          setProject(JSON.parse(cachedProject))
          setLoading(false)
        }

        // Then fetch from Firestore for most up-to-date data
        const projectRef = doc(db, 'users', user.id, 'projects', projectId as string)
        const projectSnap = await getDoc(projectRef)

        if (projectSnap.exists()) {
          const projectData = { id: projectSnap.id, ...projectSnap.data() }
          setProject(projectData)
          
          // Cache in localStorage for faster loading next time
          localStorage.setItem(`scorched-project-${projectId}`, JSON.stringify(projectData))
        } else {
          // If no Firestore data but we had localStorage data, keep using that
          // Otherwise set error
          if (!cachedProject) {
            setError('Project not found')
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [user, projectId])

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // Handle error state
  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-[#00FF99] mb-4">Error</h2>
          <p className="text-[#e7e7e7]/80 mb-6">{error || "Couldn't load project"}</p>
          <Link href="/projects" className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors">
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  // If we have a project, get data from it
  // Use storyBible if it exists, otherwise fall back to older project structure
  const projectTitle = project.storyBible?.seriesTitle || project.title || 'Untitled Project'
  const projectTheme = project.storyBible?.theme || project.theme || 'No theme specified'
  const projectSynopsis = project.storyBible?.synopsis || project.synopsis || projectTheme;

  return (
    <ProjectProvider projectId={projectId as string}>
      <div className="min-h-screen bg-[#121212]">
        {/* Project header */}
        <motion.header 
          className="bg-[#1a1a1a] border-b border-[#36393f] p-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-transparent bg-clip-text">
                  {projectTitle}
                </h1>
                <p className="text-[#e7e7e7]/70 mt-1">
                  {projectSynopsis}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  href="/projects" 
                  className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] font-medium rounded-lg hover:bg-[#36393f] transition-colors"
                >
                  All Projects
                </Link>
                <Link 
                  href={`/workspace`}
                  className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
                >
                  Story Workspace
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Tab navigation */}
        <div className="border-b border-[#36393f]">
          <div className="max-w-6xl mx-auto">
            <PreProductionTabs projectId={projectId as string} />
          </div>
        </div>

        {/* Page content */}
        <main className="max-w-6xl mx-auto p-6">
          {children}
        </main>
      </div>
    </ProjectProvider>
  )
} 