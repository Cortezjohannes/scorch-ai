'use client'

import React from 'react'

interface ColorSwatch {
  name: string
  hex: string
  usage: string
  contrast?: string
}

interface ColorPaletteProps {
  theme: 'light' | 'dark'
}

const colorPalette: ColorSwatch[] = [
  {
    name: 'Primary Background',
    hex: '#FFFFFF',
    usage: 'Main page backgrounds, 60% of interface',
    contrast: 'WCAG AAA (21:1 with dark text)'
  },
  {
    name: 'Secondary Background',
    hex: '#FAFAFA',
    usage: 'Cards, sections, subtle backgrounds',
    contrast: 'WCAG AAA (20:1 with dark text)'
  },
  {
    name: 'Primary Green',
    hex: '#10B981',
    usage: 'CTAs, primary buttons, active states',
    contrast: 'WCAG AA (4.8:1 with dark text)'
  },
  {
    name: 'Secondary Green',
    hex: '#059669',
    usage: 'Hover states, secondary accents',
    contrast: 'WCAG AA (5.2:1 with dark text)'
  },
  {
    name: 'Accent Green',
    hex: '#E6FFF4',
    usage: 'Backgrounds, highlights, subtle accents',
    contrast: 'WCAG AAA (12:1 with dark text)'
  },
  {
    name: 'Text Primary',
    hex: '#1A1A1A',
    usage: 'Main content, headings',
    contrast: 'WCAG AAA (21:1 on white)'
  },
  {
    name: 'Text Secondary',
    hex: '#666666',
    usage: 'Secondary text, descriptions',
    contrast: 'WCAG AA (7.1:1 on white)'
  },
  {
    name: 'Border',
    hex: '#E5E5E5',
    usage: 'Borders, dividers, subtle separation',
    contrast: 'Subtle visual separation'
  },
  {
    name: 'Gold Primary',
    hex: '#E2C376',
    usage: 'Premium features, success states, special highlights',
    contrast: 'WCAG AA (5.1:1 with dark text)'
  },
  {
    name: 'Gold Secondary',
    hex: '#D4B05A',
    usage: 'Hover states, darker gold accents',
    contrast: 'WCAG AA (5.5:1 with dark text)'
  },
  {
    name: 'Gold Accent',
    hex: '#F9F5E8',
    usage: 'Backgrounds, subtle gold highlights',
    contrast: 'WCAG AAA (18:1 with dark text)'
  }
]

const darkColorPalette: ColorSwatch[] = [
  {
    name: 'Primary Background',
    hex: '#121212',
    usage: 'Main page backgrounds, 60% of interface',
    contrast: 'WCAG AAA (21:1 with white text)'
  },
  {
    name: 'Secondary Background',
    hex: '#1A1A1A',
    usage: 'Cards, sections, subtle backgrounds',
    contrast: 'WCAG AAA (19:1 with white text)'
  },
  {
    name: 'Tertiary Background',
    hex: '#2A2A2A',
    usage: 'Elevated surfaces, nested cards',
    contrast: 'WCAG AAA (17:1 with white text)'
  },
  {
    name: 'Primary Green',
    hex: '#10B981',
    usage: 'CTAs, primary buttons, active states',
    contrast: 'WCAG AA (4.8:1 with dark text)'
  },
  {
    name: 'Secondary Green',
    hex: '#059669',
    usage: 'Hover states, secondary accents',
    contrast: 'WCAG AA (5.2:1 with dark text)'
  },
  {
    name: 'Accent Green',
    hex: '#0A2E1F',
    usage: 'Backgrounds, highlights, subtle accents',
    contrast: 'WCAG AAA (12:1 with white text)'
  },
  {
    name: 'Text Primary',
    hex: '#FFFFFF',
    usage: 'Main content, headings',
    contrast: 'WCAG AAA (21:1 on dark)'
  },
  {
    name: 'Text Secondary',
    hex: '#E7E7E7',
    usage: 'Secondary text, descriptions',
    contrast: 'WCAG AA (14:1 on dark)'
  },
  {
    name: 'Border',
    hex: '#36393F',
    usage: 'Borders, dividers, subtle separation',
    contrast: 'Subtle visual separation'
  },
  {
    name: 'Gold Primary',
    hex: '#E2C376',
    usage: 'Premium features, success states, special highlights',
    contrast: 'WCAG AA (5.1:1 with dark text)'
  },
  {
    name: 'Gold Secondary',
    hex: '#D4B05A',
    usage: 'Hover states, darker gold accents',
    contrast: 'WCAG AA (5.5:1 with dark text)'
  },
  {
    name: 'Gold Accent',
    hex: '#2A2418',
    usage: 'Backgrounds, subtle gold highlights',
    contrast: 'WCAG AAA (18:1 with white text)'
  }
]

export default function ColorPalette({ theme }: ColorPaletteProps) {
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const palette = isDark ? darkColorPalette : colorPalette

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Color Palette - {theme === 'light' ? 'Light' : 'Dark'} Mode
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          {theme === 'light' ? 'Light' : 'Dark'} mode color system designed for accessibility and brand consistency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {palette.map((color) => (
          <div
            key={color.name}
            className={`rounded-lg overflow-hidden border ${prefix}-card ${prefix}-border`}
          >
            <div
              className="h-32 w-full"
              style={{ backgroundColor: color.hex }}
            />
            <div className="p-4 space-y-2">
              <h3 className={`font-semibold text-sm ${prefix}-text-primary`}>
                {color.name}
              </h3>
              <div className="flex items-center gap-2">
                <code className={`text-xs font-mono px-2 py-1 rounded ${prefix}-bg-secondary ${prefix}-text-secondary`}>
                  {color.hex}
                </code>
              </div>
              <p className={`text-xs ${prefix}-text-secondary`}>
                {color.usage}
              </p>
              {color.contrast && (
                <p className={`text-xs font-medium ${prefix}-text-accent`}>
                  {color.contrast}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-8 p-6 rounded-lg ${prefix}-card-accent`}>
        <h3 className={`font-semibold mb-2 ${prefix}-text-primary`}>
          Design Principles
        </h3>
        <ul className={`space-y-1 text-sm ${prefix}-text-secondary`}>
          <li>• <strong>60-30-10 Rule:</strong> 60% {isDark ? 'dark' : 'white'}, 30% {isDark ? 'darker' : 'off-white'}, 10% green/gold accents</li>
          <li>• <strong>WCAG AA Compliance:</strong> All text meets minimum 4.5:1 contrast ratio</li>
          <li>• <strong>Brand Consistency:</strong> Green (#10B981) for primary actions, Gold (#E2C376) for premium features</li>
          <li>• <strong>Visual Hierarchy:</strong> Green for CTAs/active states, Gold for premium/special highlights</li>
        </ul>
      </div>
    </div>
  )
}
