'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'

interface PageSkeletonProps {
  variant?: 'dashboard' | 'projects' | 'bible' | 'generic'
  className?: string
}

export default function PageSkeleton({ variant = 'generic', className = '' }: PageSkeletonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'dashboard') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Hero Skeleton */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <div className={`h-8 rounded w-1/3 mb-4 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
          <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <div className={`h-6 rounded w-2/3 mb-3 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-full mb-2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'projects') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} flex items-center gap-4`}>
            <div className={`w-16 h-16 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            <div className="flex-1 space-y-2">
              <div className={`h-5 rounded w-1/3 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
              <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'bible') {
    return (
      <div className={`flex gap-6 ${className}`}>
        {/* Sidebar Skeleton */}
        <div className={`w-64 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-8 rounded mb-2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 space-y-4">
          <div className={`h-10 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-4 rounded ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
          ))}
        </div>
      </div>
    )
  }

  // Generic skeleton
  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`h-8 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
      <div className={`h-4 rounded w-full ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
      <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
      <div className={`h-4 rounded w-4/5 ${isDark ? 'bg-white/10' : 'bg-black/10'} animate-pulse`} />
    </div>
  )
}

