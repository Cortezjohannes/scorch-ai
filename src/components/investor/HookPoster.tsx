'use client'

import React from 'react'
import type { HookSection } from '@/types/investor-materials'

interface HookPosterProps {
  hook: HookSection
}

export default function HookPoster({ hook }: HookPosterProps) {
  return (
    <div className="relative w-full min-h-[90vh] bg-[#0A0A0A] flex">
      {/* Left Side - Title and Metadata */}
      <div className="w-1/2 p-12 md:p-16 flex flex-col justify-center border-r border-[#10B981]/20">
        <div className="max-w-lg">
          {/* Series Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-10 text-white leading-tight">
            {hook.seriesTitle}
          </h1>
          
          {/* Metadata */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Genre</p>
              <p className="text-lg font-medium text-white">{hook.genre}</p>
            </div>
            
            <div>
              <p className="text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Theme</p>
              <p className="text-lg font-medium text-white">{hook.theme}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Synopsis */}
      <div className="w-1/2 p-12 md:p-16 flex flex-col justify-center bg-[#121212]">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold mb-6 text-white/50 uppercase tracking-wider">Synopsis</h2>
          {hook.synopsis ? (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light">
              {hook.synopsis}
            </p>
          ) : (
            <p className="text-lg text-white/60 italic">Synopsis not available</p>
          )}
        </div>
      </div>
    </div>
  )
}

