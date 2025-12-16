'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const { theme } = useTheme()
  const prefix = theme === 'dark' ? 'dark' : 'light'

  const links = [
    { href: '/', label: 'Home' },
    { href: '/uprising', label: 'Uprising', special: true },
    { href: '/program', label: 'Program' },
    { href: '/criteria', label: 'Criteria' },
    { href: '/fund', label: 'Fund' },
    { href: '/playbook', label: 'Playbook' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg text-sm relative ${
              isActive(link.href)
                ? `${prefix}-text-accent font-medium`
                : `${prefix}-text-secondary hover:${prefix}-text-primary hover:${prefix}-bg-accent`
            } transition-colors ${
              link.special ? 'relative overflow-hidden' : ''
            }`}
          >
            {link.special && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-lg border-2"
                  style={{
                    background: theme === 'light' 
                      ? 'conic-gradient(from 0deg, #C9A961, #B8944F, #C9A961, #B8944F, #C9A961)'
                      : 'conic-gradient(from 0deg, #10B981, #059669, #10B981, #059669, #10B981)',
                    borderRadius: '8px',
                    zIndex: -1
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className={`absolute inset-0.5 ${prefix}-bg-primary rounded-lg z-0`} />
              </>
            )}
            <span className="relative z-10">{link.label}</span>
            {isActive(link.href) && (
              <motion.div
                layoutId="navIndicator"
                className={`absolute bottom-1 left-3 right-3 h-0.5`}
                style={{ backgroundColor: theme === 'light' ? '#C9A961' : '#10B981' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        ))}
        
        {/* Auth Links */}
        <div className="ml-4 flex items-center space-x-2">
          <GlobalThemeToggle />
          {isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg text-sm ${prefix}-text-secondary hover:${prefix}-text-primary hover:${prefix}-bg-accent transition-colors flex items-center gap-2 max-w-[200px]`}
              >
                <span className="text-lg flex-shrink-0">👤</span>
                <span className="truncate">{user.displayName || user.email}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className={`px-4 py-2 rounded-lg text-sm ${prefix}-bg-accent hover:${prefix}-bg-accent/50 transition-colors`}
                style={{ color: theme === 'light' ? '#C9A961' : '#10B981' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg text-sm ${prefix}-text-secondary hover:${prefix}-text-primary hover:${prefix}-bg-accent transition-colors`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`px-4 py-2 rounded-lg text-sm ${prefix}-btn-primary font-medium transition-colors`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg ${prefix}-text-secondary hover:${prefix}-text-primary hover:${prefix}-bg-accent transition-colors`}
          aria-label="Toggle menu"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </motion.svg>
        </button>
      </div>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute top-16 left-4 right-4 max-h-[calc(100vh-5rem)] overflow-y-auto ${prefix}-bg-primary/95 backdrop-blur-md border ${prefix}-border rounded-xl shadow-2xl md:hidden z-50`}
            >
              <div className="p-4 space-y-2 safe-area-padding">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg relative transition-all ${
                        isActive(link.href)
                          ? `${prefix}-bg-accent ${prefix}-text-green font-medium`
                          : `${prefix}-text-secondary hover:${prefix}-bg-secondary hover:${prefix}-text-primary`
                      } ${
                        link.special ? 'overflow-hidden' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.special && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2"
                            style={{
                              background: theme === 'light' 
                                ? 'conic-gradient(from 0deg, #C9A961, #B8944F, #C9A961, #B8944F, #C9A961)'
                                : 'conic-gradient(from 0deg, #10B981, #059669, #10B981, #059669, #10B981)',
                              borderRadius: '8px',
                              zIndex: -1
                            }}
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          />
                          <div className={`absolute inset-0.5 ${prefix}-bg-primary rounded-lg z-0`} />
                        </>
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Auth Links */}
                <div className={`border-t ${prefix}-border pt-2 mt-2 space-y-2`}>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className={`${prefix}-text-secondary text-sm`}>Theme</span>
                    <GlobalThemeToggle />
                  </div>
                  {isAuthenticated && user ? (
                    <>
                      <div className={`px-4 py-2 ${prefix}-text-secondary text-sm flex items-center gap-2`}>
                        <span className="text-lg flex-shrink-0">👤</span>
                        <span className="truncate">{user.displayName || user.email}</span>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg ${prefix}-text-secondary hover:${prefix}-bg-secondary hover:${prefix}-text-primary transition-all`}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 rounded-lg ${prefix}-bg-accent ${prefix}-text-green hover:${prefix}-bg-accent/50 transition-colors text-left`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg ${prefix}-text-secondary hover:${prefix}-bg-secondary hover:${prefix}-text-primary transition-all`}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg ${prefix}-btn-primary font-medium transition-colors text-center`}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}