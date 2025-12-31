'use client'

import React from 'react'
import type { DepthSection } from '@/types/investor-materials'

interface DepthTabsProps {
  depth: DepthSection
}

export default function DepthTabs({ depth }: DepthTabsProps) {
  const { world, livingWorld } = depth

  return (
    <div className="space-y-12 bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F] -m-6 p-8 rounded-lg">
      {/* Hero Header - Brochure Style */}
      <div className="text-center space-y-4 pb-8 border-b-2 border-[#10B981]/30">
        <div className="inline-block">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">
            Explore The World
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-[#10B981] to-[#059669] mx-auto rounded-full"></div>
        </div>
        <p className="text-lg text-white/70 italic max-w-2xl mx-auto">
          Your guide to the places, rules, and living dynamics of this rich world
        </p>
      </div>

      {/* Setting Section - Featured Destination Style */}
      {world.setting && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <h2 className="text-3xl font-bold text-white tracking-wide uppercase">
                The Setting
              </h2>
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="text-6xl font-black text-[#10B981]/10 absolute -top-4 -left-4 select-none">"</div>
              <p className="text-xl text-white/95 leading-relaxed whitespace-pre-line relative z-10 font-light">
                {world.setting}
              </p>
              <div className="text-6xl font-black text-[#10B981]/10 absolute -bottom-8 -right-4 select-none">"</div>
            </div>
          </div>
        </section>
      )}

      {/* Rules Section - Travel Tips Style */}
      {world.rules && world.rules.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <h2 className="text-3xl font-bold text-white tracking-wide uppercase">
                Rules of the World
              </h2>
              <span className="text-2xl">⚖️</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {world.rules.map((rule, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] to-[#151515] p-6 hover:border-[#10B981]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#10B981]/20"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"></div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-lg border-2 border-[#10B981]/40">
                    {idx + 1}
                  </div>
                  <p className="text-white/90 leading-relaxed pt-2 flex-1">{rule}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Locations Section - Destinations Gallery */}
      {world.locations && world.locations.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <h2 className="text-3xl font-bold text-white tracking-wide uppercase">
                Key Locations
              </h2>
              <span className="text-2xl">📍</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {world.locations.map((location, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border-2 border-[#10B981]/20 bg-gradient-to-br from-[#1A1A1A] to-[#151515] hover:border-[#10B981]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#10B981]/20 hover:-translate-y-1"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-bl-full"></div>
                
                <div className="relative p-6 space-y-4">
                  {/* Location Image */}
                  {location.imageUrl && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border-2 border-[#10B981]/30 shadow-lg">
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        {location.type && (
                          <span className="inline-block px-4 py-1.5 text-xs font-bold text-white bg-[#10B981] rounded-full uppercase tracking-wide shadow-lg">
                            {location.type}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                      {location.name}
                      {!location.imageUrl && location.type && (
                        <span className="text-sm font-normal px-3 py-1 text-[#10B981] bg-[#10B981]/10 rounded-full">
                          {location.type}
                        </span>
                      )}
                    </h3>

                    {location.description && (
                      <p className="text-white/85 leading-relaxed mb-4 text-base">
                        {location.description}
                      </p>
                    )}

                    {location.significance && (
                      <div className="bg-[#10B981]/10 rounded-lg p-4 border border-[#10B981]/20 mb-4">
                        <p className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
                          Why It Matters
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {location.significance}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {location.recurringEvents && location.recurringEvents.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                            Recurring Events
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {location.recurringEvents.map((event, eventIdx) => (
                              <span
                                key={eventIdx}
                                className="inline-block px-3 py-1 text-xs text-white/80 bg-white/5 rounded-full border border-white/10"
                              >
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {location.conflicts && location.conflicts.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                            Notable Conflicts
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {location.conflicts.map((conflict, conflictIdx) => (
                              <span
                                key={conflictIdx}
                                className="inline-block px-3 py-1 text-xs text-white/80 bg-[#EF4444]/10 rounded-full border border-[#EF4444]/20"
                              >
                                {conflict}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Living World Section - Tour Brochure Style */}
      {livingWorld && (
        <section className="space-y-8">
          {/* Section Header */}
          <div className="relative py-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent"></div>
            </div>
            <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 rounded-2xl p-8 border-2 border-[#10B981]/30 backdrop-blur-sm">
              <div className="text-4xl mb-3">🌍</div>
              <h2 className="text-4xl font-black text-white text-center tracking-tight mb-2">
                Living World
              </h2>
              <p className="text-sm text-white/60 text-center uppercase tracking-widest font-semibold">
                A Dynamic World That Breathes
              </p>
            </div>
          </div>

          {/* Living World Cards - Magazine Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Background Events */}
            {livingWorld.backgroundEvents && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-7 shadow-xl group hover:border-[#10B981]/60 transition-all duration-300">
                <div className="absolute top-0 left-0 w-20 h-20 bg-[#10B981]/10 rounded-br-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-tl-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-3xl">📅</div>
                    <h3 className="text-xl font-bold text-white tracking-wide uppercase">Background Events</h3>
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-[#10B981] to-transparent mb-4"></div>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line text-base">
                    {livingWorld.backgroundEvents}
                  </p>
                </div>
              </div>
            )}

            {/* Social Dynamics */}
            {livingWorld.socialDynamics && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-7 shadow-xl group hover:border-[#10B981]/60 transition-all duration-300">
                <div className="absolute top-0 left-0 w-20 h-20 bg-[#10B981]/10 rounded-br-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-tl-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-3xl">👥</div>
                    <h3 className="text-xl font-bold text-white tracking-wide uppercase">Social Dynamics</h3>
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-[#10B981] to-transparent mb-4"></div>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line text-base">
                    {livingWorld.socialDynamics}
                  </p>
                </div>
              </div>
            )}

            {/* Economic Factors */}
            {livingWorld.economicFactors && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-7 shadow-xl group hover:border-[#10B981]/60 transition-all duration-300">
                <div className="absolute top-0 left-0 w-20 h-20 bg-[#10B981]/10 rounded-br-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-tl-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-3xl">💼</div>
                    <h3 className="text-xl font-bold text-white tracking-wide uppercase">Economic Factors</h3>
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-[#10B981] to-transparent mb-4"></div>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line text-base">
                    {livingWorld.economicFactors}
                  </p>
                </div>
              </div>
            )}

            {/* Political Undercurrents */}
            {livingWorld.politicalUndercurrents && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-7 shadow-xl group hover:border-[#10B981]/60 transition-all duration-300">
                <div className="absolute top-0 left-0 w-20 h-20 bg-[#10B981]/10 rounded-br-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-tl-full"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-3xl">🏛️</div>
                    <h3 className="text-xl font-bold text-white tracking-wide uppercase">Political Undercurrents</h3>
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-[#10B981] to-transparent mb-4"></div>
                  <p className="text-white/90 leading-relaxed whitespace-pre-line text-base">
                    {livingWorld.politicalUndercurrents}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cultural Shifts - Full Width Feature */}
          {livingWorld.culturalShifts && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-r from-[#1A1A1A] via-[#151515] to-[#1A1A1A] p-8 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#10B981]"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#10B981]/10 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#10B981]/5 rounded-tr-full"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">🎭</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-wide uppercase mb-1">
                      Cultural Shifts
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#10B981] to-transparent"></div>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed whitespace-pre-line text-lg max-w-4xl">
                  {livingWorld.culturalShifts}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Empty State */}
      {(!world.setting || world.setting.trim() === '') &&
        (!world.rules || world.rules.length === 0) &&
        (!world.locations || world.locations.length === 0) &&
        (!livingWorld || 
          (!livingWorld.backgroundEvents && !livingWorld.socialDynamics && 
           !livingWorld.economicFactors && !livingWorld.politicalUndercurrents && 
           !livingWorld.culturalShifts)) && (
          <div className="text-center text-white/70 py-16">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-xl">World building information not available.</p>
          </div>
        )}
    </div>
  )
}
