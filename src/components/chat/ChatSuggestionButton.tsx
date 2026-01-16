'use client'

import React from 'react'
import { useChat } from '@/context/ChatContext'
import { useTheme } from '@/context/ThemeContext'

interface ChatSuggestionButtonProps {
  suggestion: string
  context?: string
  className?: string
  variant?: 'default' | 'inline' | 'action'
}

export default function ChatSuggestionButton({ 
  suggestion, 
  context,
  className = '',
  variant = 'default'
}: ChatSuggestionButtonProps) {
  const { setIsOpen } = useChat()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  const handleClick = () => {
    setIsOpen(true)
    // Dispatch custom event to pre-fill the input
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-suggestion', { 
        detail: { suggestion, context } 
      }))
    }
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
          isDark
            ? 'text-[#10B981] hover:bg-[#10B981]/10'
            : 'text-green-600 hover:bg-green-50'
        } ${className}`}
      >
        💬 {suggestion}
      </button>
    )
  }

  if (variant === 'action') {
    return (
      <button
        onClick={handleClick}
        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
          isDark
            ? 'bg-[#10B981] text-black hover:bg-[#059669]'
            : 'bg-[#10B981] text-white hover:bg-[#059669]'
        } ${className}`}
      >
        💬 {suggestion}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
          : 'bg-gray-100 hover:bg-gray-200 text-black border border-gray-200'
      } ${className}`}
    >
      💡 {suggestion}
    </button>
  )
}









