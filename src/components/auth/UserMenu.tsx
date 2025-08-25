'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { AuthModal } from './AuthModal'

export function UserMenu() {
  const auth = useAuth()
  const user = auth?.user || null
  const isAuthenticated = auth?.isAuthenticated || false
  const logout = auth?.logout || (() => {})
  const [isOpen, setIsOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login')
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/')
    // Refresh the page to update UI
    window.location.reload()
  }
  
  const openLoginModal = () => {
    setAuthModalView('login')
    setAuthModalOpen(true)
  }
  
  const openSignupModal = () => {
    setAuthModalView('signup')
    setAuthModalOpen(true)
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={openLoginModal}
          className="px-3 py-1.5 text-sm rounded-md hover:bg-[#e7e7e7]/10 transition-colors text-[#e7e7e7]/90"
        >
          Log In
        </button>
        <button
          onClick={openSignupModal}
          className="px-3 py-1.5 text-sm rounded-md bg-[#e2c376] text-black hover:bg-[#d4b46a] transition-colors"
        >
          Sign Up
        </button>
        
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          initialView={authModalView}
        />
      </div>
    )
  }
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#e7e7e7]/10 transition-colors"
        aria-label="User menu"
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-[#e7e7e7]/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#e2c376] flex items-center justify-center text-black font-medium text-sm">
            {getInitials(user?.name || 'User')}
          </div>
        )}
        <span className="text-sm text-[#e7e7e7]/90 hidden md:block">
          {user?.name}
        </span>
        <svg
          className={`w-4 h-4 text-[#e7e7e7]/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-[#1e1f22] border border-[#e7e7e7]/10 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-[#e7e7e7]/10">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-[#e7e7e7]/50 truncate">{user?.email}</div>
            </div>
            
            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-[#e7e7e7]/10 transition-colors"
              >
                My Account
              </Link>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-[#e7e7e7]/10 transition-colors"
              >
                My Projects
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#e2c376]/20 text-[#e2c376] rounded-full">
                  {user?.projects.length || 0}
                </span>
              </Link>
            </div>
            
            <div className="py-1 border-t border-[#e7e7e7]/10">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 