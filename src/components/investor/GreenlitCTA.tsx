'use client'

import React from 'react'
import Image from 'next/image'
import type { CallToActionSection } from '@/types/investor-materials'

interface GreenlitCTAProps {
  callToAction: CallToActionSection
  ownerName?: string
  seriesTitle?: string
}

export default function GreenlitCTA({ callToAction, ownerName, seriesTitle }: GreenlitCTAProps) {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-12">
      {/* Logo at the top */}
      <div className="flex justify-center mb-8">
        <Image 
          src="/greenlitailogo.png" 
          alt="Greenlit" 
          width={120} 
          height={120}
          className="logo" 
        />
      </div>

      {/* Series Title and Producer Info */}
      <div>
        <p className="text-5xl md:text-6xl font-serif italic text-white mb-8">
          {seriesTitle ? `"${seriesTitle}"` : '"This is your origin story."'} was produced by {ownerName || 'a storyteller'} using Greenlit
        </p>
      </div>

      {/* Greenlit Value Proposition */}
      <div className="p-8 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-xl border border-[#10B981]/20">
        <p className="text-lg text-white/80 mb-6 leading-relaxed">
          Greenlit is an AI showrunner that enables actors, has-beens, influencers, and directors to affordably produce and star in their own short-form vertical web dramas that can be produced, shot, and launched in 3-4 weeks as UGC.
        </p>
        <p className="text-lg text-white/80 leading-relaxed">
          Actors prepare a concept for a series and Greenlit will handle the whole pre- and post-production so you can focus on acting, filming, and promoting.
        </p>
      </div>

      {/* Why This Story Matters (if provided) */}
      {callToAction.whyYou && (
        <div className="p-8 bg-[#121212] rounded-xl border border-[#10B981]/20 text-left">
          <h3 className="text-xl font-bold text-white mb-4">Why This Story Matters</h3>
          <p className="text-white/80 leading-relaxed">{callToAction.whyYou}</p>
        </div>
      )}

      {/* Additional Context Above Button */}
      <div className="p-6 bg-[#121212] rounded-xl border border-[#10B981]/20">
        <p className="text-white/80 text-base leading-relaxed">
          This is just a small part of what Greenlit could do, we're building the ai showrunner that produces studio level stories with the scalability of UGC,
        </p>
      </div>

      {/* Single Focused CTA Button */}
      <div>
        <a 
          href="https://www.canva.com/design/DAG1Ln_Gs4E/rMJQ2iSgv8X-QXgHU28TYQ/view?utm_content=DAG1Ln_Gs4E&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hb827d8f2ce"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full max-w-md mx-auto px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#10B981]/20 transition-all text-lg text-center"
        >
          View Pitchdeck
        </a>
      </div>

      {/* Email Below Button */}
      <div className="pt-4">
        <p className="text-white/70 text-base">
          Johannes@thegreenlitstudios.com
        </p>
      </div>

      {/* Attribution */}
      <div className="pt-8 border-t border-white/10">
        {ownerName && (
          <p className="text-white/50 text-sm mb-2">
            Shared by {ownerName}
          </p>
        )}
        <p className="text-white/30 text-xs">
          Powered by Greenlit • Create your own series concept
        </p>
      </div>
    </div>
  )
}

