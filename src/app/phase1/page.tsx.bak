'use client'

import { Phase1Form } from '@/components/phase1/Phase1Form'
import { Suspense } from 'react'

function Phase1Content() {
  // Using static default values instead of searchParams for better performance
  const synopsis = ''
  const theme = ''

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Phase1Form synopsis={synopsis} theme={theme} />
      </div>
    </div>
  )
}

export default function Phase1Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat">
            <span className="text-4xl">🔥</span>
          </div>
          <p className="text-white/90 text-lg elegant-fire">Loading Phase 1...</p>
        </div>
      </div>
    }>
      <Phase1Content />
    </Suspense>
  )
} 