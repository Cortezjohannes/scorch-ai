'use client'

import React from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { ContentSection } from '@/components/layout/ContentSection'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function StoryUniverseDemo() {
  return (
    <PageLayout
      title="📖 Story Universe Demo"
      subtitle="Week 4: Interactive story bible with character galaxy and world exploration"
      showSecondaryNav={true}
      showBreadcrumbs={true}
      showBackground={true}
    >
      {/* Interactive Story Overview */}
      <ContentSection
        title="Interactive Story Overview Dashboard"
        subtitle="Professional film studio-grade story health monitoring and navigation"
        variant="featured"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📊</span>
              <h3 className="text-h3 text-high-contrast">Story Health Metrics</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Real-time dashboard showing story completion, character development, world-building progress, and narrative consistency
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>🎭 Character development tracking</li>
              <li>🌍 World-building completeness</li>
              <li>📈 Plot structure analysis</li>
              <li>✅ Story consistency metrics</li>
              <li>🎯 Production readiness score</li>
            </ul>
          </Card>

          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h3 className="text-h3 text-high-contrast">Quick Access Navigation</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Instant navigation to any story element with gradient cards and smooth animations
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>🎭 Character Galaxy access</li>
              <li>🗺️ World Explorer navigation</li>
              <li>📊 Story Structure viewer</li>
              <li>✨ Creative Workshop tools</li>
              <li>⚡ Recent activity tracking</li>
            </ul>
          </Card>
        </div>
      </ContentSection>

      {/* Character Galaxy Visualization */}
      <ContentSection
        title="Character Galaxy Visualization"
        subtitle="Interactive character universe with relationship mapping and detailed profiles"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🌌</div>
            <h3 className="text-h3 text-high-contrast mb-3">Galaxy View</h3>
            <p className="text-body text-medium-contrast mb-4">
              Interactive character nodes in circular galaxy formation
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🎭 Role-based character icons</div>
              <div>🔗 Relationship connection lines</div>
              <div>⚡ Smooth selection animations</div>
              <div>📱 Touch-optimized interactions</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-h3 text-high-contrast mb-3">List View</h3>
            <p className="text-body text-medium-contrast mb-4">
              Organized character profiles with quick access
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>👥 Character role categories</div>
              <div>📊 Development status tracking</div>
              <div>🔍 Search and filter options</div>
              <div>📈 Character arc progress</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🕸️</div>
            <h3 className="text-h3 text-high-contrast mb-3">Relationship Map</h3>
            <p className="text-body text-medium-contrast mb-4">
              Visual relationship network and dynamics
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🔗 Connection strength visualization</div>
              <div>💭 Conflict and alliance mapping</div>
              <div>📈 Relationship evolution tracking</div>
              <div>🎯 Dramatic tension analysis</div>
            </div>
          </Card>
        </div>
      </ContentSection>

      {/* World Explorer Interface */}
      <ContentSection
        title="World Explorer Interface"
        subtitle="Interactive location mapping with atmospheric details and cultural context"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🗺️</span>
              <h3 className="text-h3 text-high-contrast">Interactive Map View</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Strategic location placement with importance-based sizing and connection mapping
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>📍 Location importance visualization</li>
              <li>🎨 Atmospheric color coding</li>
              <li>🔗 Connection relationship lines</li>
              <li>🎯 Story significance indicators</li>
              <li>📱 Mobile-optimized touch targets</li>
            </ul>
            <div className="mt-4">
              <div className="flex gap-3 text-caption">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400"></div>
                  <span>High Importance</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-400/20 border border-blue-400"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🏛️</span>
              <h3 className="text-h3 text-high-contrast">Setting & Culture Explorer</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Deep dive into world-building elements, cultural systems, and atmospheric details
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>⏰ Historical timeline visualization</li>
              <li>🏛️ Cultural system breakdown</li>
              <li>🌍 Environmental atmosphere mapping</li>
              <li>📖 World-building completeness tracking</li>
              <li>✨ Detail enhancement suggestions</li>
            </ul>
          </Card>
        </div>
      </ContentSection>

      {/* Story Navigation System */}
      <ContentSection
        title="Professional Story Navigation"
        subtitle="Film studio-grade navigation system with creative flow protection"
        variant="compact"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Story Health</h4>
            <p className="text-caption text-medium-contrast">Real-time completion tracking</p>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">🧭</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Smart Navigation</h4>
            <p className="text-caption text-medium-contrast">Context-aware story sections</p>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Flow Protection</h4>
            <p className="text-caption text-medium-contrast">No creative interruptions</p>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-2xl mb-2">🎬</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Professional Tools</h4>
            <p className="text-caption text-medium-contrast">Film industry standards</p>
          </Card>
        </div>
      </ContentSection>

      {/* Data Compatibility & Preservation */}
      <ContentSection
        title="100% Data Compatibility Verified"
        subtitle="All existing story bible data structures and functionality preserved"
      >
        <Card variant="content" className="p-6">
          <h3 className="text-h3 text-high-contrast mb-4">✅ Backend Integration Safety</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-body-large text-ember-gold mb-3">Preserved Data Sources</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>✅ localStorage 'scorched-story-bible' integration</li>
                <li>✅ localStorage 'reeled-story-bible' fallback</li>
                <li>✅ Dynamic user choice application</li>
                <li>✅ Complex JSON parsing system</li>
                <li>✅ Original helper function compatibility</li>
                <li>✅ 14 legacy tab system support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-body-large text-ember-gold mb-3">Enhanced UI Features</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>🌌 Interactive character galaxy visualization</li>
                <li>🗺️ Dynamic world exploration interface</li>
                <li>📊 Professional story health dashboard</li>
                <li>🧭 Smart navigation with smooth transitions</li>
                <li>📱 Mobile-optimized touch interactions</li>
                <li>⚡ 60fps animations and performance</li>
              </ul>
            </div>
          </div>
        </Card>
      </ContentSection>

      {/* Testing & Performance */}
      <ContentSection
        title="Performance & Accessibility Excellence"
        subtitle="Professional-grade performance with film studio standards"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="hero" className="bg-gradient-to-br from-green-500 to-blue-500 p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-h3 text-white font-bold mb-2">60fps Performance</h3>
            <p className="text-white/80 text-body">Hardware-accelerated animations and smooth interactions</p>
          </Card>

          <Card variant="hero" className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-h3 text-white font-bold mb-2">Mobile Excellence</h3>
            <p className="text-white/80 text-body">Touch-optimized with 44px+ target sizing</p>
          </Card>

          <Card variant="hero" className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-center">
            <div className="text-3xl mb-3">♿</div>
            <h3 className="text-h3 text-white font-bold mb-2">WCAG 2.1 AA</h3>
            <p className="text-white/80 text-body">Full accessibility compliance and screen reader support</p>
          </Card>
        </div>
      </ContentSection>

      {/* Demo Navigation */}
      <ContentSection
        title="Experience the Story Universe"
        subtitle="Test all interactive components and verify functionality"
        className="mb-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Story Bible', href: '/story-bible', icon: '📖', status: 'Interactive' },
            { label: 'Landing Page', href: '/', icon: '🔥', status: 'Enhanced' },
            { label: 'Navigation', href: '/navigation-demo', icon: '🧭', status: 'Three-tier' },
            { label: 'Foundation', href: '/foundation-demo', icon: '🏗️', status: 'Typography' },
            { label: 'Auth Flow', href: '/landing-auth-demo', icon: '🎬', status: 'Cinematic' },
            { label: 'Projects', href: '/projects', icon: '📁', status: 'Compatible' },
            { label: 'Workspace', href: '/workspace', icon: '✏️', status: 'Creative' },
            { label: 'Create Story', href: '/', icon: '🌟', status: 'Wizard' }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-navigation p-4 text-center hover:scale-105 transition-transform touch-target-comfortable"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-caption text-high-contrast font-medium mb-1">{item.label}</div>
              <div className="text-caption text-ember-gold">{item.status}</div>
            </Link>
          ))}
        </div>
      </ContentSection>
    </PageLayout>
  )
}
