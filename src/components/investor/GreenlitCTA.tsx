'use client'

import React from 'react'
import type { CallToActionSection } from '@/types/investor-materials'

interface GreenlitCTAProps {
  callToAction: CallToActionSection
  ownerName?: string
  seriesTitle?: string
}

export default function GreenlitCTA({ callToAction, ownerName, seriesTitle }: GreenlitCTAProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greenlit Value Proposition Card */}
      <div className="p-8 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-xl border border-[#10B981]/20">
        <p className="text-lg text-white/80 mb-6 leading-relaxed">
          Greenlit is an AI showrunner that enables actors, has-beens, influencers, and directors to affordably produce and star in their own short-form vertical web dramas that can be produced, shot, and launched in 3-4 weeks as UGC.
        </p>
        <p className="text-lg text-white/80 leading-relaxed">
          Actors prepare a concept for a series and Greenlit will handle the whole pre- and post-production so they can focus on acting, filming, and promoting.
        </p>
      </div>

      {/* Embedded Pitch Deck */}
      <div className="w-full">
        <div 
          className="relative w-full rounded-lg overflow-hidden border-2 border-[#10B981]/30 shadow-2xl bg-[#121212]"
          style={{ 
            paddingBottom: '56.25%', /* 16:9 aspect ratio - standard widescreen for presentations */
            height: '0'
          }}
        >
          <iframe
            src="https://www.canva.com/design/DAG1Ln_Gs4E/rMJQ2iSgv8X-QXgHU28TYQ/view?embed"
            allow="fullscreen"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            style={{
              border: 'none',
              borderRadius: '0.5rem'
            }}
            title="Greenlit Pitch Deck"
          />
        </div>
        <p className="text-white/50 text-sm mt-4 text-center">
          <a 
            href="https://www.canva.com/design/DAG1Ln_Gs4E/rMJQ2iSgv8X-QXgHU28TYQ/view?utm_content=DAG1Ln_Gs4E&utm_campaign=designshare&utm_medium=link&utm_source=viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#10B981] transition-colors underline"
          >
            Open in new tab ↗
          </a>
        </p>
      </div>
    </div>
  )
}

