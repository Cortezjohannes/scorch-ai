'use client'

import React from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { ContentSection } from '@/components/layout/ContentSection'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PreProductionDemo() {
  return (
    <PageLayout
      title="📋 Pre-Production Workflow Demo"
      subtitle="Week 5: Professional project management with visual Kanban, resource tracking, and film studio-grade tools"
      showSecondaryNav={true}
      showBreadcrumbs={true}
      showBackground={true}
    >
      {/* Professional Project Management Dashboard */}
      <ContentSection
        title="Visual Project Management Dashboard"
        subtitle="Film studio-grade project health monitoring and critical path tracking"
        variant="featured"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📊</span>
              <h3 className="text-h3 text-high-contrast">Production Pipeline Overview</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Professional dashboard showing real-time project health metrics, critical path analysis, and production readiness scoring
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>📄 Script elements and breakdown status</li>
              <li>🎬 Storyboard shots and visual planning</li>
              <li>🎭 Cast members and character assignments</li>
              <li>📍 Location confirmations and permits</li>
              <li>📹 Equipment booking and availability</li>
              <li>🎯 Overall project health scoring</li>
            </ul>
          </Card>

          <Card variant="hero" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🛣️</span>
              <h3 className="text-h3 text-high-contrast">Critical Path Analysis</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Intelligent critical path tracking with dependency management and milestone monitoring
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>🔗 Task dependency mapping</li>
              <li>⏱️ Duration and timeline estimates</li>
              <li>📈 Progress tracking with completion %</li>
              <li>🚨 Bottleneck identification</li>
              <li>📅 Deadline management system</li>
              <li>🎯 Production readiness indicators</li>
            </ul>
          </Card>
        </div>
      </ContentSection>

      {/* Kanban Planning Board */}
      <ContentSection
        title="Kanban-Style Planning Board"
        subtitle="Professional task management with drag-and-drop workflow optimization"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-h3 text-high-contrast mb-3">Smart Task Generation</h3>
            <p className="text-body text-medium-contrast mb-4">
              Intelligent task creation based on existing project content
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>📝 Script-based task generation</div>
              <div>🎬 Storyboard workflow tasks</div>
              <div>🎭 Casting requirement tasks</div>
              <div>📍 Location scouting tasks</div>
              <div>📹 Equipment planning tasks</div>
              <div>💰 Budget approval workflows</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-h3 text-high-contrast mb-3">5-Column Workflow</h3>
            <p className="text-body text-medium-contrast mb-4">
              Professional Kanban board with optimized workflow stages
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>📚 Backlog management</div>
              <div>📋 To-Do organization</div>
              <div>🚀 In Progress (WIP limits)</div>
              <div>👀 Review and approval</div>
              <div>✅ Completion tracking</div>
              <div>📊 Board statistics</div>
            </div>
          </Card>

          <Card variant="content" className="p-6 text-center">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-h3 text-high-contrast mb-3">Advanced Task Features</h3>
            <p className="text-body text-medium-contrast mb-4">
              Comprehensive task management with professional features
            </p>
            <div className="space-y-1 text-caption text-ember-gold">
              <div>🚨 Priority level system</div>
              <div>👥 Team member assignments</div>
              <div>⏱️ Time estimation tracking</div>
              <div>🔗 Dependency management</div>
              <div>📈 Progress percentage</div>
              <div>📱 Mobile drag-and-drop</div>
            </div>
          </Card>
        </div>
      </ContentSection>

      {/* Resource Management Hub */}
      <ContentSection
        title="Resource Management Hub"
        subtitle="Professional budget tracking, equipment management, and timeline visualization"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💰</span>
              <h3 className="text-h3 text-high-contrast">Budget Management</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Professional financial tracking with category breakdown and burn rate monitoring
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>💳 Real-time budget tracking</li>
              <li>📊 Category-based allocations</li>
              <li>🔥 Burn rate analysis</li>
              <li>⚠️ Budget alert system</li>
              <li>📈 Spending trend visualization</li>
              <li>🛡️ Contingency fund management</li>
            </ul>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎬</span>
              <h3 className="text-h3 text-high-contrast">Equipment Management</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Comprehensive equipment tracking with booking status and cost management
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>📹 Department-based organization</li>
              <li>✅ Booking status tracking</li>
              <li>💰 Cost calculation and monitoring</li>
              <li>🚨 Priority level indicators</li>
              <li>📅 Duration and availability</li>
              <li>🏠 Owned vs rental tracking</li>
            </ul>
          </Card>

          <Card variant="action" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📅</span>
              <h3 className="text-h3 text-high-contrast">Schedule Management</h3>
            </div>
            <p className="text-body text-medium-contrast mb-4">
              Timeline visualization with milestone tracking and deadline management
            </p>
            <ul className="space-y-2 text-caption text-ember-gold">
              <li>📈 Visual timeline progression</li>
              <li>🎯 Milestone completion tracking</li>
              <li>🚨 Critical deadline alerts</li>
              <li>📊 Progress percentage calculation</li>
              <li>🏷️ Category-based organization</li>
              <li>⏰ Status-based color coding</li>
            </ul>
          </Card>
        </div>
      </ContentSection>

      {/* Data Integration & Compatibility */}
      <ContentSection
        title="100% Data Compatibility Verified"
        subtitle="Seamless integration with existing pre-production workflows and data structures"
        variant="compact"
      >
        <Card variant="content" className="p-6">
          <h3 className="text-h3 text-high-contrast mb-4">✅ Existing System Integration</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-body-large text-ember-gold mb-3">Preserved Data Sources</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>✅ localStorage 'reeled-preproduction-content' integration</li>
                <li>✅ Arc-based content organization support</li>
                <li>✅ Firebase project data compatibility</li>
                <li>✅ Story bible data cross-referencing</li>
                <li>✅ Existing v2 pre-production routes</li>
                <li>✅ 4100+ line codebase integration</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-body-large text-ember-gold mb-3">Enhanced Features</h4>
              <ul className="space-y-1 text-body text-medium-contrast">
                <li>📊 Visual project health dashboard</li>
                <li>📋 Kanban task management board</li>
                <li>💰 Professional budget tracking</li>
                <li>🎬 Equipment management system</li>
                <li>📅 Timeline and milestone tracking</li>
                <li>🎯 Intelligent task generation</li>
              </ul>
            </div>
          </div>
        </Card>
      </ContentSection>

      {/* Professional Film Studio Standards */}
      <ContentSection
        title="Film Studio-Grade Professional Tools"
        subtitle="Industry-standard project management that scales from indie to blockbuster productions"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="hero" className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 text-center">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-h3 text-white font-bold mb-2">Industry Standards</h3>
            <p className="text-white/80 text-body">Professional project management meeting Hollywood production standards</p>
          </Card>

          <Card variant="hero" className="bg-gradient-to-br from-green-500 to-blue-500 p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-h3 text-white font-bold mb-2">Data Intelligence</h3>
            <p className="text-white/80 text-body">Smart data extraction and intelligent task generation from existing content</p>
          </Card>

          <Card variant="hero" className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-h3 text-white font-bold mb-2">Workflow Efficiency</h3>
            <p className="text-white/80 text-body">Streamlined processes that reduce planning time while improving quality</p>
          </Card>

          <Card variant="hero" className="bg-gradient-to-br from-orange-500 to-red-500 p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="text-h3 text-white font-bold mb-2">Mobile Optimized</h3>
            <p className="text-white/80 text-body">Touch-friendly interface for on-set management and mobile workflows</p>
          </Card>
        </div>
      </ContentSection>

      {/* Testing & Performance Excellence */}
      <ContentSection
        title="Performance & User Experience Excellence"
        subtitle="Professional-grade performance with film production workflow optimization"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="status" className="text-center p-4">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">60fps Interactions</h4>
            <p className="text-caption text-medium-contrast">Smooth drag-and-drop and animated transitions</p>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-3xl mb-2">📱</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Touch Optimized</h4>
            <p className="text-caption text-medium-contrast">44px+ touch targets and gesture support</p>
          </Card>
          
          <Card variant="status" className="text-center p-4">
            <div className="text-3xl mb-2">♿</div>
            <h4 className="text-body text-high-contrast font-bold mb-2">Accessibility</h4>
            <p className="text-caption text-medium-contrast">WCAG 2.1 AA compliance with screen reader support</p>
          </Card>
        </div>
      </ContentSection>

      {/* Demo Navigation Links */}
      <ContentSection
        title="Experience the Pre-Production Workflow"
        subtitle="Test all professional project management features and verify functionality"
        className="mb-16"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pre-Production Hub', href: '/preproduction/hub', icon: '📋', status: 'Enhanced' },
            { label: 'Classic v2', href: '/preproduction/v2', icon: '🔄', status: 'Compatible' },
            { label: 'Story Bible', href: '/story-bible', icon: '📖', status: 'Interactive' },
            { label: 'Landing Page', href: '/', icon: '🔥', status: 'Cinematic' },
            { label: 'Navigation', href: '/navigation-demo', icon: '🧭', status: 'Three-tier' },
            { label: 'Foundation', href: '/foundation-demo', icon: '🏗️', status: 'Typography' },
            { label: 'Auth Flow', href: '/landing-auth-demo', icon: '🎬', status: 'Enhanced' },
            { label: 'Story Universe', href: '/story-universe-demo', icon: '🌌', status: 'Galaxy' }
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

      {/* Integration Verification */}
      <ContentSection
        title="Integration Verification Complete"
        subtitle="All existing functionality preserved with enhanced professional interface"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-ember-gold mb-4">🔄 Backward Compatibility</h3>
            <ul className="space-y-2 text-body text-medium-contrast">
              <li>✅ All existing pre-production routes functional</li>
              <li>✅ localStorage data integration preserved</li>
              <li>✅ Firebase project compatibility maintained</li>
              <li>✅ Story bible cross-referencing working</li>
              <li>✅ Complex JSON parsing system intact</li>
              <li>✅ Arc-based organization supported</li>
            </ul>
          </Card>
          
          <Card variant="content" className="p-6">
            <h3 className="text-h3 text-ember-gold mb-4">🚀 Enhanced Capabilities</h3>
            <ul className="space-y-2 text-body text-medium-contrast">
              <li>📊 Professional project health metrics</li>
              <li>📋 Kanban workflow optimization</li>
              <li>💰 Advanced budget tracking</li>
              <li>🎬 Equipment management system</li>
              <li>📅 Timeline visualization</li>
              <li>🎯 Intelligent task generation</li>
            </ul>
          </Card>
        </div>
      </ContentSection>
    </PageLayout>
  )
}
