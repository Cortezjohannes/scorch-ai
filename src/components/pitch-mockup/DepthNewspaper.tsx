'use client'

import React from 'react'
import { motion } from '@/components/ui/ClientMotion'
import type { DepthSection } from '@/types/investor-materials'

interface DepthNewspaperProps {
  depth: DepthSection
}

export default function DepthNewspaper({ depth }: DepthNewspaperProps) {
  const { world } = depth

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-black">
      {/* Newspaper Header */}
      <div className="bg-[#2C2C2C] text-white py-4 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-2 tracking-tight">
              THE WORLD TIMES
            </h1>
            <div className="text-sm tracking-widest uppercase">Established 2087</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Masthead */}
        <div className="border-b-2 border-black mb-8 pb-4">
          <div className="flex justify-between items-center text-sm">
            <div>Volume I, Issue 1</div>
            <div className="font-bold">WORLD BUILDING EDITION</div>
            <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

                {/* Main Headline */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight mb-4">
            {world.setting?.split('.')[0] || 'The World We Live In'}
          </h2>
          <div className="text-sm text-gray-600 mb-4">By World Building Department</div>
          <div className="border-t-2 border-black pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1 */}
              <div className="md:col-span-2 space-y-6">
                <p className="text-lg leading-relaxed font-serif">
                  {world.setting || 'Setting information not available.'}
                </p>

                {/* Pull Quote */}
                {world.setting && world.setting.length > 200 && (
                  <div className="border-l-4 border-black pl-6 py-4 bg-gray-100 my-6">
                    <p className="text-2xl font-bold italic leading-relaxed">
                      "{world.setting.split('.')[0]}"
                    </p>
                    <div className="text-sm text-gray-600 mt-2">— World Building Archive</div>
                  </div>
                )}

                {/* Rules Section */}
                {world.rules && world.rules.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-3xl font-bold font-serif mb-4 border-b-2 border-black pb-2">
                      RULES & REGULATIONS
                    </h3>
                    <div className="space-y-4">
                      {world.rules.map((rule, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="border-l-4 border-black pl-4 py-2 bg-white"
                        >
                          <p className="text-lg leading-relaxed font-serif">{rule}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2 - Sidebar */}
              <div className="space-y-6">
                {/* Info Box */}
                <div className="bg-gray-200 border-2 border-black p-4">
                  <h4 className="font-bold text-lg mb-2 uppercase tracking-wide">Quick Facts</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="border-b border-gray-400 pb-2">
                      <strong>Locations:</strong> {world.locations?.length || 0}
                    </li>
                    <li className="border-b border-gray-400 pb-2">
                      <strong>Rules:</strong> {world.rules?.length || 0}
                    </li>
                    <li>
                      <strong>Status:</strong> Active
                    </li>
                  </ul>
                </div>

                {/* Ad Space */}
                <div className="bg-gray-300 border-2 border-black p-8 text-center">
                  <div className="text-xs uppercase tracking-widest mb-2">Advertisement</div>
                  <div className="text-sm italic">Memory Trading Services</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        {world.locations && world.locations.length > 0 && (
          <div className="mt-12 border-t-4 border-black pt-8">
            <h2 className="text-4xl font-bold font-serif mb-6 text-center">
              TRAVEL & LOCATIONS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {world.locations.map((location, idx) => (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border-2 border-black p-6"
                >
                  {/* Location Image */}
                  {location.imageUrl && (
                    <div className="mb-4 border-2 border-black overflow-hidden">
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Location Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold font-serif">{location.name}</h3>
                    {location.type && (
                      <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase">
                        {location.type}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-base leading-relaxed font-serif mb-4">
                    {location.description}
                  </p>

                  {/* Significance */}
                  {location.significance && (
                    <div className="border-t-2 border-gray-400 pt-4 mb-4">
                      <h4 className="font-bold text-sm uppercase mb-2 tracking-wide">
                        Significance
                      </h4>
                      <p className="text-sm leading-relaxed font-serif">{location.significance}</p>
                    </div>
                  )}

                  {/* Recurring Events */}
                  {location.recurringEvents && location.recurringEvents.length > 0 && (
                    <div className="border-t-2 border-gray-400 pt-4 mb-4">
                      <h4 className="font-bold text-sm uppercase mb-2 tracking-wide">
                        Recurring Events
                      </h4>
                      <ul className="space-y-1">
                        {location.recurringEvents.map((event, eventIdx) => (
                          <li key={eventIdx} className="text-sm flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span className="font-serif">{event}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Conflicts */}
                  {location.conflicts && location.conflicts.length > 0 && (
                    <div className="border-t-2 border-gray-400 pt-4">
                      <h4 className="font-bold text-sm uppercase mb-2 tracking-wide text-red-700">
                        Conflicts
                      </h4>
                      <ul className="space-y-1">
                        {location.conflicts.map((conflict, conflictIdx) => (
                          <li key={conflictIdx} className="text-sm flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span className="font-serif">{conflict}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 border-t-4 border-black pt-8">
          <div className="grid grid-cols-3 gap-8 text-center text-sm">
            <div>
              <div className="font-bold mb-2">THE WORLD TIMES</div>
              <div className="text-gray-600">Established 2087</div>
            </div>
            <div>
              <div className="font-bold mb-2">World Building Archive</div>
              <div className="text-gray-600">Official Documentation</div>
            </div>
            <div>
              <div className="font-bold mb-2">All Rights Reserved</div>
              <div className="text-gray-600">Memory Archive Division</div>
            </div>
          </div>
        </div>
      </div>

      {/* Newspaper Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lora:wght@400;700&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', 'Lora', serif;
        }
      `}</style>
    </div>
  )
}





