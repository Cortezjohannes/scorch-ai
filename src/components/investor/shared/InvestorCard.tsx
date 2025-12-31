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
      className="group relative border border-[#10B981]/30 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:border-[#10B981]/70 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden backdrop-blur-md"
      style={{
        background: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        boxShadow: `
          0 4px 6px rgba(0, 0, 0, 0.2),
          0 0 20px rgba(16, 185, 129, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 0 30px rgba(16, 185, 129, 0.05)
        `
      }}
    >
      {/* Subtle Dark Overlay for Readability */}
      <div
        className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)'
        }}
      />

      {/* Animated Border Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10, transparent)`,
          filter: 'blur(8px)',
          margin: '-2px'
        }}
      />
      
      {/* Animated Border Ring */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `
            0 0 0 1px ${accentColor}50,
            0 0 20px ${accentColor}30,
            0 0 40px ${accentColor}15,
            inset 0 0 20px ${accentColor}08
          `
        }}
      />

      {/* Background Gradient Overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${accentColor}12 0%, transparent 60%)`
        }}
      />

      {/* CRT Scanline Overlay for Card */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(
            transparent 50%,
            rgba(16, 185, 129, 0.04) 50%
          )`,
          backgroundSize: '100% 4px',
          animation: 'scanline-move 0.1s linear infinite'
        }}
      />
      
      {/* Subtle Noise Texture */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none mix-blend-mode-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Icon with Enhanced Glow */}
        <div 
          className="text-5xl mb-5 relative inline-block transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
          }}
        >
          {icon}
        </div>

        {/* Title with Enhanced Typography */}
        <h3 
          className="text-xl font-bold text-white mb-3 group-hover:text-[#10B981] transition-all duration-500 leading-tight"
          style={{
            textShadow: `
              0 0 8px rgba(16, 185, 129, 0.4),
              0 0 16px rgba(16, 185, 129, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.8),
              0 4px 12px rgba(0, 0, 0, 0.6)
            `,
            letterSpacing: '0.01em'
          }}
        >
          {title}
        </h3>

        {/* Description with Better Spacing */}
        <p 
          className="text-sm text-white/90 mb-5 line-clamp-2 leading-relaxed"
          style={{
            textShadow: `
              0 1px 3px rgba(0, 0, 0, 0.8),
              0 2px 6px rgba(0, 0, 0, 0.6)
            `
          }}
        >
          {description}
        </p>

        {/* Stats with Enhanced Styling */}
        {stats && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10 group-hover:border-[#10B981]/30 transition-colors duration-500">
            <span 
              className="text-xs font-medium text-white/80 uppercase tracking-wider"
              style={{
                textShadow: `
                  0 1px 3px rgba(0, 0, 0, 0.8),
                  0 2px 6px rgba(0, 0, 0, 0.6)
                `
              }}
            >
              {stats}
            </span>
            <span 
              className="text-[#10B981] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1"
              style={{
                textShadow: `
                  0 0 8px rgba(16, 185, 129, 0.6),
                  0 0 16px rgba(16, 185, 129, 0.3)
                `
              }}
            >
              View
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </div>
        )}
      </div>

      {/* Corner Accent Glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
          filter: 'blur(20px)'
        }}
      />
      
      {/* Bottom Accent Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981]/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          boxShadow: `0 0 10px ${accentColor}40`
        }}
      />
    </div>
  )
}

