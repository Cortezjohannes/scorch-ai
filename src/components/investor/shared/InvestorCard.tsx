'use client'

import React from 'react'

interface InvestorCardProps {
  icon: string
  title: string
  description: string
  stats?: string
  onClick: () => void
  accentColor?: string
}

export default function InvestorCard({
  icon,
  title,
  description,
  stats,
  onClick,
  accentColor = '#10B981'
}: InvestorCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#121212] border border-[#10B981]/20 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-[#10B981]/40 hover:shadow-lg hover:shadow-[#10B981]/10 hover:-translate-y-1"
    >
      {/* Icon */}
      <div className="text-4xl mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#10B981] transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-white/70 mb-4 line-clamp-2">
        {description}
      </p>

      {/* Stats */}
      {stats && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">{stats}</span>
          <span className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      )}

      {/* Hover Accent */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, transparent 100%)`
        }}
      />
    </div>
  )
}

