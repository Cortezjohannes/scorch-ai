'use client'

import React from 'react'
import type { DepthSection } from '@/types/investor-materials'

interface DepthTabsProps {
  depth: DepthSection
}

export default function DepthTabs({ depth }: DepthTabsProps) {
  const { world } = depth

  return (
    <div className="space-y-8">
      {/* Setting Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white border-b border-[#10B981]/30 pb-3">
          The Setting
        </h2>
        <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#10B981]/20">
          <p className="text-lg text-white/90 leading-relaxed whitespace-pre-line">
            {world.setting || 'Setting information not available.'}
          </p>
        </div>
      </div>

      {/* Rules Section */}
      {world.rules && world.rules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-[#10B981]/30 pb-3">
            The Rules
          </h2>
          <div className="space-y-3">
            {world.rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-[#10B981] border border-[#10B981]/20"
              >
                <p className="text-white/90 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations Section */}
      {world.locations && world.locations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white border-b border-[#10B981]/30 pb-3">
            Key Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {world.locations.map((location, idx) => (
              <div
                key={idx}
                className="bg-[#1A1A1A] rounded-lg p-6 border border-[#10B981]/20 hover:border-[#10B981]/40 transition-colors"
              >
                <div className="space-y-3">
                  {/* Location Image */}
                  {location.imageUrl && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 border border-[#10B981]/20">
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">
                      {location.name}
                    </h3>
                    {location.type && (
                      <span className="px-3 py-1 text-xs font-medium text-[#10B981] bg-[#10B981]/10 rounded-full whitespace-nowrap">
                        {location.type}
                      </span>
                    )}
                  </div>

                  {location.description && (
                    <p className="text-white/80 leading-relaxed">
                      {location.description}
                    </p>
                  )}

                  {location.significance && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-sm font-medium text-white/70 mb-1">
                        Significance
                      </p>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {location.significance}
                      </p>
                    </div>
                  )}

                  {location.recurringEvents && location.recurringEvents.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-sm font-medium text-white/70 mb-2">
                        Recurring Events
                      </p>
                      <ul className="space-y-1">
                        {location.recurringEvents.map((event, eventIdx) => (
                          <li
                            key={eventIdx}
                            className="text-white/70 text-sm flex items-start gap-2"
                          >
                            <span className="text-[#10B981] mt-1">•</span>
                            <span>{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {location.conflicts && location.conflicts.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-sm font-medium text-white/70 mb-2">
                        Conflicts
                      </p>
                      <ul className="space-y-1">
                        {location.conflicts.map((conflict, conflictIdx) => (
                          <li
                            key={conflictIdx}
                            className="text-white/70 text-sm flex items-start gap-2"
                          >
                            <span className="text-[#10B981] mt-1">•</span>
                            <span>{conflict}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!world.setting || world.setting.trim() === '') &&
        (!world.rules || world.rules.length === 0) &&
        (!world.locations || world.locations.length === 0) && (
          <div className="text-center text-white/70 py-12">
            <p>World building information not available.</p>
          </div>
        )}
    </div>
  )
}
