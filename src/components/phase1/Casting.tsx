'use client'

import { useState } from 'react'
import { motion } from '@/components/ui/ClientMotion'

interface CastingProps {
  roles?: any[];
  requirements?: any[];
  notes?: any[];
  isLoading?: boolean;
}

export function Casting({ roles = [], requirements = [], notes = [], isLoading = false }: CastingProps) {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#e2c37640] rounded w-3/4"></div>
          <div className="h-4 bg-[#e2c37640] rounded w-1/2"></div>
          <div className="h-4 bg-[#e2c37640] rounded w-2/3"></div>
        </div>
      ) : roles.length > 0 ? (
        <div className="space-y-6">
          <section>
            <h3 className="text-xl text-[#e2c376] mb-3">Characters & Casting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role, index) => (
                <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg">
                  <h4 className="font-bold mb-1">{role.name}</h4>
                  <p className="text-sm text-[#e7e7e7]/70 mb-2">{role.description}</p>
                  <div className="text-xs text-[#e2c376]">
                    Suggested: {role.suggestions?.join(', ') || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {requirements && requirements.length > 0 && (
            <section>
              <h3 className="text-xl text-[#e2c376] mb-3">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2">
                {requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </section>
          )}
          
          {notes && notes.length > 0 && (
            <section>
              <h3 className="text-xl text-[#e2c376] mb-3">Notes</h3>
              <ul className="list-disc pl-5 space-y-2">
                {notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-[#e7e7e7]/60">
          <p>Generate content to see casting suggestions here</p>
        </div>
      )}
    </div>
  )
} 