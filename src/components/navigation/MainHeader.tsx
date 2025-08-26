'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  description: string
}

const primaryNavItems: NavItem[] = [
  {
    id: 'create',
    label: 'Create',
    href: '/',
    icon: '🎬',
    description: 'Start new stories and projects'
  },
  {
    id: 'projects', 
    label: 'Projects',
    href: '/projects',
    icon: '📁',
    description: 'Manage your creative projects'
  },
  {
    id: 'library',
    label: 'Library', 
    href: '/story-bible',
    icon: '📚',
    description: 'Story bible and resources'
  }
]

interface NavDropdownProps {
  item: NavItem
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
}

function NavDropdown({ item, isActive, isOpen, onToggle }: NavDropdownProps) {
  return (
    <div className="relative">
      <Link
        href={item.href}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-300 touch-target
          ${isActive 
            ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30' 
            : 'text-white/80 hover:text-white hover:bg-white/5'
          }
        `}
        onClick={onToggle}
      >
        <span className="text-lg">{item.icon}</span>
        <span className="font-medium elegant-fire">{item.label}</span>
      </Link>
    </div>
  )
}

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors touch-target"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-ember-gold/20 flex items-center justify-center">
          <span className="text-ember-gold font-bold text-sm">U</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-12 w-48 bg-black/95 backdrop-blur-lg border border-ember-gold/20 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              <Link
                href="/account"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
              <Link
                href="/workspace"
                className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Workspace
              </Link>
              <hr className="my-2 border-white/10" />
              <button
                className="w-full text-left px-3 py-2 text-white/60 hover:text-white/80 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileMenuToggle({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  return (
    <button
      className="md:hidden touch-target-comfortable p-2 text-white"
      onClick={onToggle}
      aria-label="Toggle mobile menu"
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl"
      >
        {isOpen ? '✕' : '☰'}
      </motion.div>
    </button>
  )
}

function MobileNavigation({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const mobileNavItems = [
    { label: 'Create Story', href: '/', icon: '🎬' },
    { label: 'My Projects', href: '/projects', icon: '📁' },
    { label: 'Story Bible', href: '/story-bible', icon: '📖' },
    { label: 'Pre-Production', href: '/preproduction', icon: '📋' },
    { label: 'Post-Production', href: '/postproduction', icon: '🎞️' },
    { label: 'Analytics', href: '/analytics', icon: '📊' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.nav
            className="
              fixed top-16 right-0 bottom-0 w-80 max-w-[90vw]
              bg-black/95 backdrop-blur-lg border-l border-ember-gold/20
              z-50 md:hidden overflow-y-auto mobile-scrollbar
            "
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              {/* Navigation Items */}
              <div className="space-y-2">
                {mobileNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="
                        flex items-center gap-4 p-4 rounded-lg
                        text-white/80 hover:text-white
                        hover:bg-ember-gold/10 
                        transition-all duration-200 touch-target-comfortable
                      "
                      onClick={onClose}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium elegant-fire">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Authentication Actions */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="space-y-3">
                  <Link
                    href="/account"
                    className="block w-full p-3 text-center text-white/80 hover:text-white border border-white/20 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Account
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full burn-button text-center touch-target-comfortable"
                    onClick={onClose}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

export function MainHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${isScrolled 
            ? 'bg-black/90 backdrop-blur-lg border-b border-ember-gold/20' 
            : 'bg-transparent'
          }
        `}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 ember-shadow rounded-lg flex items-center justify-center animate-emberFloat"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-3xl">🔥</span>
            </motion.div>
            <span className="elegant-fire text-xl md:text-2xl font-black text-ember-gold fire-gradient animate-flameFlicker">
              Scorched AI
            </span>
          </Link>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryNavItems.map((item) => (
              <NavDropdown
                key={item.id}
                item={item}
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                isOpen={activeDropdown === item.id}
                onToggle={() => setActiveDropdown(
                  activeDropdown === item.id ? null : item.id
                )}
              />
            ))}
          </nav>

          {/* Desktop User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <UserMenu />
            </div>
            
            <MobileMenuToggle 
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}
