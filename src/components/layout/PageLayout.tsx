'use client'

import { ReactNode } from 'react'
import { MainHeader } from '@/components/navigation/MainHeader'
import { SecondaryNav } from '@/components/navigation/SecondaryNav'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showSecondaryNav?: boolean
  showBreadcrumbs?: boolean
  projectId?: string
  projectTitle?: string
  className?: string
  showBackground?: boolean // Option to show/hide fire background
}

export function PageLayout({
  children,
  title,
  subtitle,
  showSecondaryNav = false,
  showBreadcrumbs = false,
  projectId,
  projectTitle,
  className = '',
  showBackground = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-pitch-black relative">
      {/* Fire Video Background - Optional */}
      {showBackground && (
        <video 
          className="fire-video-background"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
        >
          <source src="/fire_background.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* Main Header */}
      <MainHeader />
      
      {/* Secondary Navigation */}
      {showSecondaryNav && (
        <SecondaryNav projectId={projectId} />
      )}
      
      {/* Main Content Area */}
      <main className={`
        relative z-10 pt-16 
        ${showSecondaryNav ? 'lg:pt-32' : ''}
        ${showBackground ? '' : 'bg-pitch-black'}
      `}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <Breadcrumbs 
            projectId={projectId} 
            projectTitle={projectTitle} 
          />
        )}
        
        {/* Page Title Section */}
        {(title || subtitle) && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {title && (
              <h1 className="text-h1 font-bold text-high-contrast mb-2 elegant-fire">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-body-large text-medium-contrast max-w-3xl elegant-fire">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className={`max-w-7xl mx-auto px-4 ${className}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
