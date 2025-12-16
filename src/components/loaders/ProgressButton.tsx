'use client'

import React from 'react'
import { motion } from '@/components/ui/ClientMotion'
import { useTheme } from '@/context/ThemeContext'

interface ProgressButtonProps {
  isLoading: boolean
  progress?: number
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

export default function ProgressButton({
  isLoading,
  progress = 0,
  onClick,
  disabled = false,
  children,
  className = '',
  variant = 'primary'
}: ProgressButtonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const baseClasses = `px-6 py-3 rounded-lg font-semibold transition-all relative overflow-hidden ${className}`
  
  const getButtonClasses = () => {
    if (isLoading) {
      if (variant === 'primary') {
        return isDark
          ? 'bg-[#10B981]/50 text-white cursor-wait'
          : 'bg-black/50 text-white cursor-wait'
      } else {
        return isDark
          ? 'bg-white/10 text-white/70 cursor-wait'
          : 'bg-black/10 text-black/70 cursor-wait'
      }
    }
    
    if (variant === 'primary') {
      return isDark
        ? 'bg-[#10B981] text-black hover:bg-[#059669]'
        : 'bg-black text-white hover:bg-gray-800'
    } else {
      return isDark
        ? 'bg-white/10 text-white hover:bg-white/20'
        : 'bg-black/10 text-black hover:bg-black/20'
    }
  }

  const getProgressColor = () => {
    if (variant === 'primary') {
      return isDark ? 'bg-[#059669]' : 'bg-gray-700'
    } else {
      return isDark ? 'bg-white/20' : 'bg-black/20'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${getButtonClasses()}`}
    >
      <span className="relative z-10">
        {isLoading && progress > 0 
          ? `${children} ${Math.round(progress)}%`
          : children
        }
      </span>
      {isLoading && progress > 0 && (
        <motion.div
          className={`absolute inset-0 ${getProgressColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      )}
    </button>
  )
}

