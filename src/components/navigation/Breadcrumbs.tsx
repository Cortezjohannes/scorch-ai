'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: string
}

export function Breadcrumbs({ projectId, projectTitle }: { 
  projectId?: string
  projectTitle?: string 
}) {
  const pathname = usePathname()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: '🏠' }
    ]

    // Build breadcrumbs based on current path
    if (segments.includes('projects')) {
      breadcrumbs.push({ label: 'Projects', href: '/projects', icon: '📁' })
      
      if (projectId) {
        breadcrumbs.push({ 
          label: projectTitle || 'Project', 
          href: `/projects/${projectId}`,
          icon: '🎬'
        })
        
        // Add specific project section if applicable
        if (pathname.includes('/characters')) {
          breadcrumbs.push({ label: 'Characters', href: pathname, icon: '👥' })
        }
        if (pathname.includes('/script')) {
          breadcrumbs.push({ label: 'Script', href: pathname, icon: '📝' })
        }
        if (pathname.includes('/storyboard')) {
          breadcrumbs.push({ label: 'Storyboard', href: pathname, icon: '🎨' })
        }
      }
    }

    if (segments.includes('story-bible')) {
      breadcrumbs.push({ 
        label: 'Story Bible', 
        href: '/story-bible',
        icon: '📖'
      })
    }

    if (segments.includes('workspace')) {
      breadcrumbs.push({ 
        label: 'Workspace', 
        href: '/workspace',
        icon: '✏️'
      })
    }

    if (segments.includes('preproduction')) {
      breadcrumbs.push({ 
        label: 'Pre-Production', 
        href: '/preproduction',
        icon: '📋'
      })
      
      if (segments.includes('v2')) {
        breadcrumbs.push({ 
          label: 'Technical Prep', 
          href: '/preproduction/v2',
          icon: '🔧'
        })
      }
    }

    if (segments.includes('phase1')) {
      breadcrumbs.push({ 
        label: 'Pre-Production', 
        href: '/preproduction',
        icon: '📋'
      })
      breadcrumbs.push({ 
        label: 'Phase 1', 
        href: '/phase1',
        icon: '🎯'
      })
    }

    if (segments.includes('phase2')) {
      breadcrumbs.push({ 
        label: 'Pre-Production', 
        href: '/preproduction',
        icon: '📋'
      })
      breadcrumbs.push({ 
        label: 'Phase 2', 
        href: '/phase2',
        icon: '⚡'
      })
    }

    if (segments.includes('postproduction') || segments.includes('post-production')) {
      breadcrumbs.push({ 
        label: 'Post-Production', 
        href: '/postproduction',
        icon: '🎞️'
      })
    }

    if (segments.includes('episode')) {
      breadcrumbs.push({ 
        label: 'Episodes', 
        href: '/episode',
        icon: '🎬'
      })
      
      // Add specific episode if it's a numbered episode
      const episodeId = segments[segments.indexOf('episode') + 1]
      if (episodeId && !isNaN(Number(episodeId))) {
        breadcrumbs.push({ 
          label: `Episode ${episodeId}`, 
          href: `/episode/${episodeId}`,
          icon: '📺'
        })
      }
    }

    if (segments.includes('analytics')) {
      breadcrumbs.push({ 
        label: 'Analytics', 
        href: '/analytics',
        icon: '📊'
      })
    }

    if (segments.includes('account')) {
      breadcrumbs.push({ 
        label: 'Account', 
        href: '/account',
        icon: '👤'
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  
  if (breadcrumbs.length <= 1) return null

  return (
    <motion.nav
      className="flex items-center gap-2 px-4 py-3 text-sm bg-black/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      role="navigation"
      aria-label="Breadcrumb"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 overflow-x-auto mobile-scrollbar">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2 whitespace-nowrap">
              {index > 0 && (
                <span className="text-white/40" aria-hidden="true">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              
              {index === breadcrumbs.length - 1 ? (
                // Current page - not a link
                <span
                  className="flex items-center gap-1 px-2 py-1 rounded text-ember-gold font-medium"
                  aria-current="page"
                >
                  {crumb.icon && <span>{crumb.icon}</span>}
                  <span>{crumb.label}</span>
                </span>
              ) : (
                // Link to previous pages
                <Link
                  href={crumb.href}
                  className="
                    flex items-center gap-1 px-2 py-1 rounded
                    text-white/60 hover:text-white/80 hover:bg-white/5
                    transition-colors duration-200 touch-target
                  "
                >
                  {crumb.icon && <span>{crumb.icon}</span>}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
