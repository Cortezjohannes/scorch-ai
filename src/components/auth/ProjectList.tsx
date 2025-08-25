'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Project } from '@/context/AuthContext'

export function ProjectList() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <div className="text-[#e7e7e7]/50 mb-4">Please sign in to view your projects</div>
        <Link 
          href="/login" 
          className="px-4 py-2 bg-[#e2c376] text-black rounded-md hover:bg-[#d4b46a] transition-colors inline-block"
        >
          Sign In
        </Link>
      </div>
    )
  }
  
  const filteredProjects = user.projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#e2c376]">My Projects</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[#e2c376] text-black'
                : 'bg-[#36393f] hover:bg-[#4f535a] text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'in-progress'
                ? 'bg-[#e2c376] text-black'
                : 'bg-[#36393f] hover:bg-[#4f535a] text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'completed'
                ? 'bg-[#e2c376] text-black'
                : 'bg-[#36393f] hover:bg-[#4f535a] text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-[#e7e7e7]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-[#e7e7e7]/50 mb-6">
            {filter === 'all'
              ? "You haven't created any projects yet."
              : filter === 'in-progress'
              ? "You don't have any projects in progress."
              : "You don't have any completed projects."}
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-[#e2c376] text-black rounded-md hover:bg-[#d4b46a] transition-colors inline-block"
          >
            Create New Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-dashed border-[#e7e7e7]/10 rounded-lg p-6 flex flex-col items-center justify-center h-64 cursor-pointer"
          >
            <Link href="/" className="flex flex-col items-center">
              <svg className="w-12 h-12 text-[#e7e7e7]/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span className="text-lg font-medium text-[#e2c376]">Create New Project</span>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#1e1f22] rounded-lg overflow-hidden shadow-md"
    >
      <div className="aspect-video bg-gradient-to-br from-[#e2c37620] to-[#111]">
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#e7e7e7]/20 text-lg">No Preview</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{project.title || 'Untitled Project'}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            project.status === 'completed' 
              ? 'bg-green-500/20 text-green-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {project.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
        
        <p className="text-sm text-[#e7e7e7]/50 mt-1 line-clamp-2">
          {project.synopsis}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-[#e7e7e7]/30">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          
          <span className={`text-xs px-2 py-0.5 rounded ${
            project.stage === 'preproduction'
              ? 'bg-purple-500/20 text-purple-400'
              : project.stage === 'production'
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {project.stage === 'preproduction'
              ? 'Pre-production'
              : project.stage === 'production'
              ? 'Production'
              : 'Post-production'}
          </span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Link
            href={`/${project.stage}?projectId=${project.id}`}
            className="flex-1 text-center px-3 py-1.5 bg-[#e2c376] text-black rounded-md hover:bg-[#d4b46a] transition-colors text-sm"
          >
            Continue
          </Link>
        </div>
      </div>
    </motion.div>
  )
} 