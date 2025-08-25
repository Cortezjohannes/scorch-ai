'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { saveProject } from '@/services/projectService'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type SaveContentModalProps = {
  isOpen: boolean
  onClose: () => void
  contentData: any
  projectTitle: string
  projectSynopsis: string
  projectTheme?: string
  onSaveSuccess?: (projectId: string) => void
}

export function SaveContentModal({
  isOpen,
  onClose,
  contentData,
  projectTitle,
  projectSynopsis,
  projectTheme = '',
  onSaveSuccess
}: SaveContentModalProps) {
  const { user, isAuthenticated } = useAuth()
  const [view, setView] = useState<'login' | 'signup' | 'save'>('save')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Close modal if user clicks outside
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  // Handle saving content for authenticated user
  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      setView('login')
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      const savedProject = await saveProject({
        title: projectTitle,
        synopsis: projectSynopsis,
        theme: projectTheme,
        content: contentData
      }, user.id)
      
      setSuccess(true)
      
      if (onSaveSuccess) {
        onSaveSuccess(savedProject.id)
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Error saving project:', err)
      setError(err.message || 'Failed to save project')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={handleOutsideClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border border-[#36393f] shadow-md">
              <CardHeader className="bg-[#2a2a2a]">
                <CardTitle>
                  {view === 'save' && 'Save Your Content'}
                  {view === 'login' && 'Sign In to Save'}
                  {view === 'signup' && 'Create Account'}
                </CardTitle>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </CardHeader>
              
              <CardContent className="p-6">
                {view === 'save' && (
                  <div className="space-y-4">
                    {isAuthenticated ? (
                      <>
                        <p className="text-[#e7e7e7]/90">
                          Save your project to access it later from any device.
                        </p>
                        <div className="bg-[#36393f] p-4 rounded-md">
                          <div className="mb-2">
                            <div className="text-sm text-[#e7e7e7]/70">Project Title</div>
                            <div className="font-medium">{projectTitle}</div>
                          </div>
                          <div>
                            <div className="text-sm text-[#e7e7e7]/70">Synopsis</div>
                            <div className="text-[#e7e7e7]/90">{projectSynopsis.substring(0, 100)}...</div>
                          </div>
                        </div>
                        
                        {error && (
                          <div className="p-3 bg-red-900/20 border border-red-900/30 rounded-md text-red-200">
                            {error}
                          </div>
                        )}
                        
                        {success && (
                          <div className="p-3 bg-green-900/20 border border-green-900/30 rounded-md text-green-200">
                            Project saved successfully!
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-3 mt-4">
                          <Button 
                            variant="outline"
                            onClick={onClose}
                            className="bg-[#36393f] text-[#e7e7e7]/90 hover:bg-[#4f535a] hover:text-[#e7e7e7]"
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-[#e2c376] text-black hover:bg-[#d4b46a]"
                            disabled={isSaving || success}
                          >
                            {isSaving ? 'Saving...' : 'Save Project'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[#e7e7e7]/90 mb-4">
                          You need to sign in to save your project and access it later.
                        </p>
                        
                        <div className="flex justify-between space-x-3">
                          <Button
                            onClick={() => setView('login')}
                            className="flex-1 bg-[#e2c376] text-black hover:bg-[#d4b46a]"
                          >
                            Sign In
                          </Button>
                          <Button
                            onClick={() => setView('signup')}
                            className="flex-1 bg-[#36393f] text-[#e7e7e7]/90 hover:bg-[#4f535a] hover:text-[#e7e7e7]"
                          >
                            Create Account
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {view === 'login' && (
                  <>
                    <LoginForm isModal={true} />
                    <div className="mt-4 text-center">
                      <p className="text-[#e7e7e7]/70 text-sm">
                        Don't have an account?{' '}
                        <button
                          onClick={() => setView('signup')}
                          className="text-[#e2c376] hover:underline"
                        >
                          Create one
                        </button>
                      </p>
                      <button
                        onClick={() => setView('save')}
                        className="text-[#e7e7e7]/50 text-xs hover:text-[#e7e7e7]/70 mt-2"
                      >
                        ← Back
                      </button>
                    </div>
                  </>
                )}
                
                {view === 'signup' && (
                  <>
                    <SignupForm isModal={true} />
                    <div className="mt-4 text-center">
                      <p className="text-[#e7e7e7]/70 text-sm">
                        Already have an account?{' '}
                        <button
                          onClick={() => setView('login')}
                          className="text-[#e2c376] hover:underline"
                        >
                          Sign in
                        </button>
                      </p>
                      <button
                        onClick={() => setView('save')}
                        className="text-[#e7e7e7]/50 text-xs hover:text-[#e7e7e7]/70 mt-2"
                      >
                        ← Back
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 