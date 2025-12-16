'use client'

import React, { useState } from 'react'

interface ComponentShowcaseProps {
  theme: 'light' | 'dark'
}

export default function ComponentShowcase({ theme }: ComponentShowcaseProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const tabs = ['Overview', 'Details', 'Settings', 'Advanced']
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Component Showcase
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          All UI components styled for {theme === 'light' ? 'light' : 'dark'} mode
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Buttons
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className={`px-6 py-3 rounded-lg font-medium hover:shadow-md ${prefix}-btn-primary`}>
            Primary Button (Green)
          </button>

          <button className={`px-6 py-3 rounded-lg font-medium hover:shadow-md ${prefix}-btn-gold`}>
            Premium Button (Gold)
          </button>

          <button className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-secondary`}>
            Secondary Button
          </button>

          <button className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-ghost`}>
            Ghost Button
          </button>

          <button className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-disabled`} disabled>
            Disabled Button
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Cards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg cursor-pointer ${prefix}-card`}>
            <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>
              Default Card
            </h4>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Hover to see interactive state
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-accent`}>
            <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>
              Green Accent
            </h4>
            <p className={`text-sm ${prefix}-text-secondary`}>
              With green accent background
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-gold`}>
            <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>
              Gold Accent
            </h4>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Premium gold accent card
            </p>
          </div>

          <div className={`p-6 rounded-lg ${prefix}-card-secondary`}>
            <h4 className={`font-semibold mb-2 ${prefix}-text-primary`}>
              Secondary Card
            </h4>
            <p className={`text-sm ${prefix}-text-secondary`}>
              Subtle background variation
            </p>
          </div>
        </div>
      </section>

      {/* Input Fields */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Input Fields
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>
              Text Input
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter text here..."
              className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>
              Textarea
            </label>
            <textarea
              placeholder="Enter multiple lines..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg resize-none ${prefix}-input`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${prefix}-text-primary`}>
              Select Dropdown
            </label>
            <select className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Tabs
        </h3>
        <div className={`flex gap-2 border-b ${prefix}-border`}>
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 font-medium relative ${prefix}-tab ${
                activeTab === index ? `${prefix}-tab-active` : ''
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={`p-4 rounded-lg ${prefix}-bg-secondary`}>
          <p className={prefix + '-text-secondary'}>
            Active tab: <strong className={prefix + '-text-primary'}>{tabs[activeTab]}</strong>
          </p>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Loading States
        </h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => setIsLoading(false), 2000)
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isLoading ? `${prefix}-btn-disabled` : `${prefix}-btn-primary`
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start Loading'}
          </button>

          {isLoading && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: '#10B981',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Typography
        </h3>
        <div className="space-y-4">
          <h1 className={`text-4xl font-bold ${prefix}-text-primary`}>
            Heading 1 - Primary Text
          </h1>
          <h2 className={`text-3xl font-bold ${prefix}-text-primary`}>
            Heading 2 - Primary Text
          </h2>
          <h3 className={`text-2xl font-semibold ${prefix}-text-primary`}>
            Heading 3 - Primary Text
          </h3>
          <p className={`text-base ${prefix}-text-primary`}>
            Body text - Primary content with excellent readability on {isDark ? 'dark' : 'white'} background.
          </p>
          <p className={`text-base ${prefix}-text-secondary`}>
            Secondary text - Supporting content with good contrast for hierarchy.
          </p>
          <p className={`text-sm ${prefix}-text-tertiary`}>
            Tertiary text - Subtle information and metadata.
          </p>
          <p className={`text-base font-medium ${prefix}-text-accent`}>
            Accent text - Green highlights for emphasis and CTAs.
          </p>
          <p className={`text-base font-medium ${prefix}-text-gold`}>
            Gold text - Premium features and special highlights.
          </p>
        </div>
      </section>

      {/* Badges & Status */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Badges & Status Indicators
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${prefix}-bg-accent ${prefix}-text-accent`}>
            Active (Green)
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${prefix}-badge-gold`}>
            Premium (Gold)
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${prefix}-bg-secondary ${prefix}-text-secondary`}>
            Standard
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${prefix}-bg-secondary ${prefix}-text-primary border ${prefix}-border`}>
            With Border
          </span>
        </div>
      </section>
    </div>
  )
}
