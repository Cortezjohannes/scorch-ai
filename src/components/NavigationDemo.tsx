'use client'

import React from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { ContentSection } from '@/components/layout/ContentSection'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function NavigationDemo() {
  return (
    <PageLayout
      title="🧭 Navigation System Demo"
      subtitle="Three-tier navigation architecture with progressive disclosure"
      showSecondaryNav={true}
      showBreadcrumbs={true}
      showBackground={true}
    >
      <ContentSection
        title="Primary Navigation"
        subtitle="Always visible top-level navigation for main app sections"
        variant="featured"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎬</span>
              <h3 className="text-h3 text-high-contrast">Create</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Story generation hub for starting new projects
            </p>
            <Link href="/" className="text-ember-gold hover:text-ember-gold/80 font-medium">
              Go to Create →
            </Link>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📁</span>
              <h3 className="text-h3 text-high-contrast">Projects</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Manage your creative projects and workflows
            </p>
            <Link href="/projects" className="text-ember-gold hover:text-ember-gold/80 font-medium">
              View Projects →
            </Link>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="text-h3 text-high-contrast">Library</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Story bible, templates, and resources
            </p>
            <Link href="/story-bible" className="text-ember-gold hover:text-ember-gold/80 font-medium">
              Open Library →
            </Link>
          </Card>
        </div>
      </ContentSection>

      <ContentSection
        title="Navigation Features"
        subtitle="Complete three-tier navigation system with accessibility and mobile support"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3">✅ Backward Compatible</h3>
            <p className="text-body text-medium-contrast">
              All existing routes and navigation links continue to work exactly as before.
            </p>
          </Card>

          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3">📱 Mobile Optimized</h3>
            <p className="text-body text-medium-contrast">
              Touch-friendly navigation with 44px+ touch targets and gesture support.
            </p>
          </Card>

          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3">🧭 Smart Breadcrumbs</h3>
            <p className="text-body text-medium-contrast">
              Dynamic breadcrumb system that adapts to complex workflow paths.
            </p>
          </Card>

          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-high-contrast mb-3">⚡ Context Aware</h3>
            <p className="text-body text-medium-contrast">
              Secondary navigation appears based on current workflow context.
            </p>
          </Card>
        </div>
      </ContentSection>

      <ContentSection
        title="Test All Routes"
        subtitle="Verify all existing routes continue to work perfectly"
        variant="compact"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Home', href: '/', icon: '🏠' },
            { label: 'Projects', href: '/projects', icon: '📁' },
            { label: 'Story Bible', href: '/story-bible', icon: '📖' },
            { label: 'Pre-Production', href: '/preproduction', icon: '📋' },
            { label: 'Phase 1', href: '/phase1', icon: '🎯' },
            { label: 'Phase 2', href: '/phase2', icon: '⚡' },
            { label: 'Post-Production', href: '/postproduction', icon: '🎞️' },
            { label: 'Analytics', href: '/analytics', icon: '📊' },
            { label: 'Account', href: '/account', icon: '👤' },
            { label: 'Workspace', href: '/workspace', icon: '✏️' },
            { label: 'Login', href: '/login', icon: '🔑' }
          ].map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="card-navigation p-3 text-center hover:scale-105 transition-transform"
            >
              <div className="text-lg mb-1">{route.icon}</div>
              <div className="text-sm text-medium-contrast">{route.label}</div>
            </Link>
          ))}
        </div>
      </ContentSection>
    </PageLayout>
  )
}
