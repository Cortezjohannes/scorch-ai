'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface SecondaryNavItem {
  label: string
  href: string
  icon: string
  isActive?: boolean
}

const navigationMaps = {
  story: [
    { label: 'Story Bible', href: '/story-bible', icon: '📖' },
    { label: 'Workspace', href: '/workspace', icon: '✏️' },
    { label: 'Analytics', href: '/analytics', icon: '📊' }
  ],
  preproduction: [
    { label: 'Planning', href: '/preproduction', icon: '📋' },
    { label: 'Technical Prep', href: '/preproduction/v2', icon: '🔧' },
    { label: 'Phase 1', href: '/phase1', icon: '🎯' },
    { label: 'Phase 2', href: '/phase2', icon: '⚡' }
  ],
  production: [
    { label: 'Episodes', href: '/episode', icon: '🎬' },
    { label: 'Post-Production', href: '/postproduction', icon: '🎞️' },
    { label: 'Analytics', href: '/analytics', icon: '📊' }
  ],
  projects: [
    { label: 'Overview', href: '/projects', icon: '📂' },
    { label: 'Story Bible', href: '/story-bible', icon: '📖' },
    { label: 'Pre-Production', href: '/preproduction', icon: '📋' },
    { label: 'Episodes', href: '/episode', icon: '🎬' }
  ]
}

export function SecondaryNav({ projectId }: { projectId?: string }) {
  const pathname = usePathname()
  
  // Determine which navigation set to show based on current path
  const getNavigationContext = (): SecondaryNavItem[] => {
    if (pathname.includes('/story-bible') || pathname.includes('/workspace')) {
      return navigationMaps.story
    }
    if (pathname.includes('/preproduction') || pathname.includes('/phase')) {
      return navigationMaps.preproduction  
    }
    if (pathname.includes('/episode') || pathname.includes('/post')) {
      return navigationMaps.production
    }
    if (pathname.includes('/projects') && !pathname.includes('/projects/')) {
      return navigationMaps.projects
    }
    // For project-specific pages, show relevant context
    if (pathname.includes('/projects/') && projectId) {
      return [
        { label: 'Project Overview', href: `/projects/${projectId}`, icon: '📂' },
        { label: 'Story Bible', href: '/story-bible', icon: '📖' },
        { label: 'Pre-Production', href: '/preproduction', icon: '📋' },
        { label: 'Episodes', href: '/episode', icon: '🎬' }
      ]
    }
    return []
  }

  const navItems = getNavigationContext()
  
  if (navItems.length === 0) return null

  return (
    <motion.nav
      className="
        sticky top-16 z-40 
        bg-black/80 backdrop-blur-md 
        border-b border-ember-gold/10
        px-4 py-3
      "
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 overflow-x-auto mobile-scrollbar">
          {navItems.map((item, index) => {
            const href = item.href.replace('[id]', projectId || '')
            const isActive = pathname === href || 
                           (href !== '/' && pathname.startsWith(href)) ||
                           (item.href === '/episode' && pathname.includes('/episode/'))
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    whitespace-nowrap transition-all duration-300 touch-target
                    ${isActive 
                      ? 'bg-ember-gold/20 text-ember-gold border border-ember-gold/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium elegant-fire">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
