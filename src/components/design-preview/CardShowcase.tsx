'use client'

import React from 'react'

interface CardShowcaseProps {
  theme: 'light' | 'dark'
}

export default function CardShowcase({ theme }: CardShowcaseProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Card Variations
        </h2>
        <p className="text-base mb-6" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
          Different card styles for various use cases
        </p>
      </div>

      {/* Default Cards */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Default Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-6 rounded-lg cursor-pointer ${prefix}-card`}>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Interactive Card
            </h4>
            <p className="text-sm mb-3" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Hover to see interactive state with green border and shadow
            </p>
            <div className="flex gap-2">
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
                Action
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-secondary`}>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Secondary Card
            </h4>
            <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Subtle background variation for less prominent content
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-accent`}>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Accent Card (Green)
            </h4>
            <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Highlighted content with green accent background
            </p>
          </div>
        </div>
      </section>

      {/* Premium Cards */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Premium Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-lg ${prefix}-card-gold`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                Premium Feature
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${prefix}-badge-gold`}>
                Premium
              </span>
            </div>
            <p className="text-sm mb-4" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Gold accent card for premium features and special highlights
            </p>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-gold`}>
              Upgrade
            </button>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                Standard Feature
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'dark-bg-accent dark-text-accent' : 'light-bg-accent light-text-accent'}`}>
                Standard
              </span>
            </div>
            <p className="text-sm mb-4" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Standard card for regular features and content
            </p>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Card States */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Card States
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-6 rounded-lg ${prefix}-card`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-xs font-medium" style={isDark ? { color: '#10B981' } : { color: '#10B981' }}>
                Active
              </span>
            </div>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Active State
            </h4>
            <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Card with active indicator
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-secondary opacity-75`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#999999' }} />
              <span className="text-xs font-medium" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
                Inactive
              </span>
            </div>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
              Inactive State
            </h4>
            <p className="text-sm" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
              Card with inactive/disabled state
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card`} style={{
            borderWidth: '2px',
            borderStyle: 'dashed',
            borderColor: isDark ? '#36393F' : '#E5E5E5'
          }}>
            <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Empty State
            </h4>
            <p className="text-sm" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
              Placeholder for empty content
            </p>
          </div>
        </div>
      </section>

      {/* Card with Content */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Content Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-lg ${prefix}-card`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold mb-1" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                  Episode 1
                </h4>
                <p className="text-xs" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
                  Last updated 2 days ago
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'dark-bg-accent dark-text-accent' : 'light-bg-accent light-text-accent'}`}>
                Active
              </span>
            </div>
            <p className="text-sm mb-4" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Episode description and details. This card shows how content is displayed in a card format.
            </p>
            <div className="flex gap-2">
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
                View
              </button>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-ghost`}>
                Edit
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold mb-1" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                  Project Stats
                </h4>
                <p className="text-xs" style={isDark ? { color: '#999999' } : { color: '#999999' }}>
                  Overview
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>12</p>
                <p className="text-xs" style={isDark ? { color: '#999999' } : { color: '#999999' }}>Episodes</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#059669' }}>8</p>
                <p className="text-xs" style={isDark ? { color: '#999999' } : { color: '#999999' }}>Complete</p>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: '#E2C376' }}>4</p>
                <p className="text-xs" style={isDark ? { color: '#999999' } : { color: '#999999' }}>Premium</p>
              </div>
            </div>
            <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-secondary`}>
              View Details
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}





