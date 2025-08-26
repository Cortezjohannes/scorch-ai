'use client'

import React from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { ContentSection } from '@/components/layout/ContentSection'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingAuthDemo() {
  return (
    <PageLayout
      title="🎬 Landing & Authentication Demo"
      subtitle="Week 3: Cinematic first impressions with rebellious professionalism"
      showSecondaryNav={true}
      showBreadcrumbs={true}
      showBackground={true}
    >
      {/* Enhanced Landing Page Demo */}
      <ContentSection
        title="Enhanced Landing Page"
        subtitle="Cinematic introduction with progressive disclosure story creation wizard"
        variant="featured"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔥</span>
              <h3 className="text-h3 text-high-contrast">Cinematic Intro</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              3-second professional introduction sequence with ember animations and revolutionary branding
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>🎬 Smooth scale and rotation animations</li>
              <li>⚡ Revolutionary messaging timing</li>
              <li>🔥 Ember particle effects</li>
            </ul>
            <div className="mt-4">
              <Link href="/" className="text-ember-gold hover:text-ember-gold/80 font-medium">
                View Landing Page →
              </Link>
            </div>
          </Card>

          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🧙‍♂️</span>
              <h3 className="text-h3 text-high-contrast">Story Creation Wizard</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Progressive disclosure wizard that guides users through story creation without overwhelming them
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>🎭 Genre selection with visual cards</li>
              <li>📝 Synopsis input with guidance</li>
              <li>🎨 Theme definition with suggestions</li>
              <li>🌟 Mood setting with gradients</li>
            </ul>
            <div className="mt-4">
              <span className="text-ember-gold">Click "Ignite Your Story" to test</span>
            </div>
          </Card>
        </div>
      </ContentSection>

      {/* Feature Showcase Demo */}
      <ContentSection
        title="Feature Showcase System"
        subtitle="Highlighting platform capabilities with cinematic animations"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-h3 text-high-contrast mb-3">AI Story Development</h3>
            <p className="text-body text-medium-contrast mb-4">
              Transform simple ideas into complex narratives
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🔥 Character arcs</div>
              <div>🔥 Plot development</div>
              <div>🔥 World building</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-h3 text-high-contrast mb-3">Pre-Production Planning</h3>
            <p className="text-body text-medium-contrast mb-4">
              Complete technical preparation pipeline
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🔥 Script analysis</div>
              <div>🔥 Resource planning</div>
              <div>🔥 Timeline management</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🎞️</div>
            <h3 className="text-h3 text-high-contrast mb-3">Post-Production Tools</h3>
            <p className="text-body text-medium-contrast mb-4">
              Professional editing and distribution
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🔥 Video editing</div>
              <div>🔥 Effect templates</div>
              <div>🔥 Distribution strategy</div>
            </div>
          </Card>
        </div>
      </ContentSection>

      {/* Authentication Enhancement Demo */}
      <ContentSection
        title="Enhanced Authentication Experience"
        subtitle="Revolutionary branding with professional user flows"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔑</span>
              <h3 className="text-h3 text-high-contrast">Enhanced Login</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Welcoming experience with cinematic introduction and clear branding
            </p>
            <ul className="space-y-2 text-caption text-ember-gold mb-4">
              <li>🔥 Revolutionary welcome animation</li>
              <li>⚡ Branded loading states</li>
              <li>🎭 Terms of Revolution messaging</li>
              <li>📱 Mobile-optimized touch targets</li>
            </ul>
            <Link href="/login" className="text-ember-gold hover:text-ember-gold/80 font-medium">
              Test Login Experience →
            </Link>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h3 className="text-h3 text-high-contrast">Revolutionary Signup</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Value proposition showcase with compelling benefits and manifesto
            </p>
            <ul className="space-y-2 text-caption text-ember-gold mb-4">
              <li>🔥 60% ownership messaging</li>
              <li>⚡ AI-powered creation benefits</li>
              <li>🎭 Revolutionary platform USP</li>
              <li>📜 Scorched Manifesto display</li>
            </ul>
            <Link href="/signup" className="text-ember-gold hover:text-ember-gold/80 font-medium">
              Test Signup Experience →
            </Link>
          </Card>
        </div>
      </ContentSection>

      {/* Backward Compatibility Verification */}
      <ContentSection
        title="Backend Compatibility Verification"
        subtitle="All existing functionality preserved with enhanced UX"
        variant="compact"
      >
        <Card variant="status" className="p-6">
          <h3 className="text-h3 text-high-contrast mb-4">✅ 100% Backward Compatible</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-body-large text-high-contrast mb-3">Preserved API Calls</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>✅ /api/generate/story-bible endpoint</li>
                <li>✅ Synopsis + theme data format</li>
                <li>✅ Loading progression system</li>
                <li>✅ Character count tracking</li>
                <li>✅ Form validation rules</li>
                <li>✅ Error handling flows</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-body-large text-high-contrast mb-3">Enhanced UX Features</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>🔥 Progressive disclosure wizard</li>
                <li>⚡ Cinematic introduction</li>
                <li>🎭 Feature showcase system</li>
                <li>📱 Mobile-optimized interactions</li>
                <li>🎨 Brand personality integration</li>
                <li>🚀 Professional onboarding flow</li>
              </ul>
            </div>
          </div>
        </Card>
      </ContentSection>

      {/* Mobile Optimization Demo */}
      <ContentSection
        title="Mobile-First Design Excellence"
        subtitle="Touch-friendly interactions with 60fps animations"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="content" className="p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-h3 text-high-contrast mb-2">Touch Targets</h3>
            <p className="text-body text-medium-contrast mb-3">
              All interactive elements meet 44px+ standard
            </p>
            <div className="flex gap-2 justify-center">
              <div className="w-11 h-11 bg-ember-gold/20 rounded flex items-center justify-center text-ember-gold">
                44px
              </div>
              <div className="w-12 h-12 bg-ember-gold/30 rounded flex items-center justify-center text-ember-gold text-caption">
                48px
              </div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-3xl mb-3">🎭</div>
            <h3 className="text-h3 text-high-contrast mb-2">Gesture Support</h3>
            <p className="text-body text-medium-contrast mb-3">
              Smooth swipe and tap interactions
            </p>
            <motion.div
              className="mx-auto w-16 h-16 bg-ember-gold/20 rounded-lg flex items-center justify-center cursor-pointer"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-ember-gold">👆</span>
            </motion.div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-h3 text-high-contrast mb-2">60fps Animations</h3>
            <p className="text-body text-medium-contrast mb-3">
              Hardware-accelerated smooth performance
            </p>
            <motion.div
              className="mx-auto w-8 h-8 bg-ember-gold rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Card>
        </div>
      </ContentSection>

      {/* Test All User Flows */}
      <ContentSection
        title="Complete User Flow Testing"
        subtitle="End-to-end verification of enhanced experience"
        className="mb-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Landing Page', href: '/', icon: '🏠', status: 'Enhanced' },
            { label: 'Story Wizard', href: '/', icon: '🧙‍♂️', status: 'Progressive' },
            { label: 'Login Flow', href: '/login', icon: '🔑', status: 'Branded' },
            { label: 'Signup Flow', href: '/signup', icon: '🚀', status: 'Revolutionary' },
            { label: 'Navigation', href: '/navigation-demo', icon: '🧭', status: 'Three-tier' },
            { label: 'Foundation', href: '/foundation-demo', icon: '🏗️', status: 'Typography' },
            { label: 'Story Bible', href: '/story-bible', icon: '📖', status: 'Preserved' },
            { label: 'Projects', href: '/projects', icon: '📁', status: 'Compatible' }
          ].map((flow) => (
            <Link
              key={flow.href}
              href={flow.href}
              className="card-navigation p-4 text-center hover:scale-105 transition-transform touch-target-comfortable"
            >
              <div className="text-2xl mb-2">{flow.icon}</div>
              <div className="text-caption text-high-contrast font-medium mb-1">{flow.label}</div>
              <div className="text-caption text-ember-gold">{flow.status}</div>
            </Link>
          ))}
        </div>
      </ContentSection>
    </PageLayout>
  )
}
