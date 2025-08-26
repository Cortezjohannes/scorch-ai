'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

// Scorched AI Foundation Demo - Week 1 Implementation
export default function FoundationDemo() {
  return (
    <div className="min-h-screen bg-accessible p-8">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Typography Scale Demo */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-hero text-high-contrast mb-4 fire-gradient animate-flameFlicker">
          🔥 SCORCHED AI FOUNDATION
        </h1>
        <h2 className="text-h1 text-high-contrast mb-3">
          Typography Scale Demo
        </h2>
        <h3 className="text-h2 text-medium-contrast mb-2">
          Section Headers Look Great
        </h3>
        <h4 className="text-h3 text-medium-contrast mb-2">
          Subsection Headers Scale Perfectly
        </h4>
        <p className="text-body-large text-medium-contrast mb-2 text-readable">
          This is important content using body-large. It scales beautifully across all devices with our responsive clamp() system.
        </p>
        <p className="text-body text-medium-contrast mb-2 text-readable">
          Standard body text maintains perfect readability while using the "League Spartan" font from our Design Philosophy.
        </p>
        <p className="text-caption text-low-contrast text-readable">
          Caption text for metadata and secondary information.
        </p>
      </motion.section>

      {/* Five-Card System Demo */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        id="main-content"
      >
        <h2 className="text-h2 text-high-contrast mb-6">
          Five-Card System Demo
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hero Card */}
          <Card variant="hero" className="animate-fadeIn touch-target-comfortable" tabIndex={0}>
            <CardHeader>
              <CardTitle>🔥 Hero Card</CardTitle>
              <CardDescription>Primary actions and featured content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-medium-contrast">
                Commands attention and drives action. Perfect for main CTAs and featured projects.
              </p>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card variant="content" className="animate-slideUp touch-target-comfortable" tabIndex={0}>
            <CardHeader>
              <CardTitle>📄 Content Card</CardTitle>
              <CardDescription>Information display and reading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-medium-contrast">
                Optimized for comfortable reading and focused content display.
              </p>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card variant="action" className="animate-scaleIn touch-target-comfortable" tabIndex={0}>
            <CardHeader>
              <CardTitle>⚡ Action Card</CardTitle>
              <CardDescription>Interactive elements and quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-medium-contrast">
                Invites interaction with clear purpose and immediate feedback.
              </p>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card variant="status" className="animate-fadeIn touch-target" tabIndex={0}>
            <CardContent className="pt-6">
              <div className="text-h3 text-high-contrast">📊 Status</div>
              <div className="text-body text-medium-contrast">System operational</div>
            </CardContent>
          </Card>

          {/* Navigation Card */}
          <Card variant="navigation" className="animate-slideUp touch-target" tabIndex={0}>
            <CardContent className="pt-3">
              <div className="flex items-center gap-2">
                <span className="text-body text-medium-contrast">🧭 Navigate</span>
                <span className="text-caption text-low-contrast">→</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Animation Demo */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-h2 text-high-contrast mb-6">
          Hardware-Accelerated Animations
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-status p-4 animate-emberFloat">
            <div className="text-body text-medium-contrast">Ember Float</div>
          </div>
          <div className="card-status p-4 animate-emberGlow">
            <div className="text-body text-medium-contrast">Ember Glow</div>
          </div>
          <div className="card-status p-4 animate-burnIntro">
            <div className="text-body text-medium-contrast">Burn Intro</div>
          </div>
          <div className="card-status p-4 animate-staggerIn">
            <div className="text-body text-medium-contrast">Stagger In</div>
          </div>
        </div>
      </motion.section>

      {/* Accessibility Demo */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-h2 text-high-contrast mb-6">
          Accessibility Features (WCAG 2.1 AA)
        </h2>
        
        <div className="space-y-4">
          <div className="card-content p-6">
            <h3 className="text-h3 text-high-contrast mb-2">Focus States</h3>
            <p className="text-body text-medium-contrast mb-4">
              Try using Tab to navigate through elements. All interactive elements have clear focus indicators.
            </p>
            <button className="burn-button touch-target-comfortable">
              Test Focus State
            </button>
          </div>
          
          <div className="card-content p-6">
            <h3 className="text-h3 text-high-contrast mb-2">Touch Targets</h3>
            <p className="text-body text-medium-contrast mb-4">
              All touch targets meet the 44px minimum size for mobile accessibility.
            </p>
            <div className="flex gap-2">
              <button className="touch-target bg-ember-glow/20 rounded border border-ember-gold/30">
                44px
              </button>
              <button className="touch-target-comfortable bg-ember-glow/20 rounded border border-ember-gold/30">
                48px
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Screen Reader Info */}
      <div className="sr-only">
        This page demonstrates the Scorched AI design system foundation, including responsive typography, 
        five card variants, hardware-accelerated animations, and WCAG 2.1 AA accessibility compliance.
      </div>
    </div>
  )
}
