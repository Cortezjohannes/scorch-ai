'use client'

import React, { useState } from 'react'
import type { CharacterProfile } from '@/types/investor-materials'

interface CharacterCardProps {
  character: CharacterProfile
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#10B981]/20 hover:border-[#10B981]/40 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{character.name}</h3>
          <p className="text-[#10B981] text-sm">{character.role}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/50 hover:text-white transition-colors"
        >
          {expanded ? '−' : '+'}
        </button>
      </div>

      {character.background && (
        <p className="text-white/70 text-sm mb-3">{character.background}</p>
      )}

      <div className="space-y-2">
        <div>
          <span className="text-white/50 text-xs">MOTIVATION</span>
          <p className="text-white/80 text-sm">{character.motivation}</p>
        </div>
        {expanded && (
          <>
            {character.arc && (
              <div>
                <span className="text-white/50 text-xs">ARC</span>
                <p className="text-white/80 text-sm">{character.arc}</p>
              </div>
            )}
            {character.conflicts.length > 0 && (
              <div>
                <span className="text-white/50 text-xs">CONFLICTS</span>
                <ul className="text-white/70 text-sm space-y-1 mt-1">
                  {character.conflicts.map((conflict, idx) => (
                    <li key={idx}>• {conflict}</li>
                  ))}
                </ul>
              </div>
            )}
            {character.keyTraits.length > 0 && (
              <div>
                <span className="text-white/50 text-xs">KEY TRAITS</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {character.keyTraits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#10B981]/10 rounded text-xs text-[#10B981]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

