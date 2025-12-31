'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from '@/components/ui/ClientMotion'
import { useChat } from '@/context/ChatContext'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { usePathname, useSearchParams } from 'next/navigation'
import MarkdownMessage from './MarkdownMessage'

export default function ChatWidget() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    isOpen,
    setIsOpen,
    hasSeenWelcome,
    markWelcomeSeen,
    addReaction,
    getReaction,
    saveInsight,
    isInsightSaved
  } = useChat()

  const [input, setInput] = useState('')
  const [storyBibleId, setStoryBibleId] = useState<string | null>(null)
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [currentEpisode, setCurrentEpisode] = useState<any>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)
  const [preProductionData, setPreProductionData] = useState<any>(null)
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false)
  const [hasSeenChat, setHasSeenChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Smart storyBibleId detection
  const detectStoryBibleId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    
    // 1. Check URL params
    const urlId = searchParams?.get('id') || searchParams?.get('storyBibleId')
    if (urlId) return urlId
    
    // 2. Check localStorage
    try {
      const stored = localStorage.getItem('greenlit-story-bible')
      if (stored) {
        const data = JSON.parse(stored)
        const bible = data.storyBible || data
        return bible?.id || null
      }
    } catch (e) {
      console.error('Error parsing story bible from localStorage:', e)
    }
    
    return null
  }, [searchParams])

  // Detect current episode number from URL
  const detectCurrentEpisodeNumber = useCallback((): number | null => {
    if (typeof window === 'undefined' || !pathname) return null
    
    // Check for episode number in URL patterns:
    // /episode/[id]
    // /preproduction/episode/[episodeNumber]
    // /workspace (check searchParams)
    
    const episodeMatch = pathname.match(/\/episode\/(\d+)/)
    if (episodeMatch) {
      return parseInt(episodeMatch[1])
    }
    
    const preprodMatch = pathname.match(/\/preproduction\/episode\/(\d+)/)
    if (preprodMatch) {
      return parseInt(preprodMatch[1])
    }
    
    // Check search params
    const episodeParam = searchParams?.get('episodeNumber')
    if (episodeParam) {
      const num = parseInt(episodeParam)
      if (!isNaN(num)) return num
    }
    
    return null
  }, [pathname, searchParams])

  // Function to load story bible and all related data
  const loadStoryBible = useCallback(async () => {
    if (typeof window === 'undefined') return
    
    const detectedId = detectStoryBibleId()
    setStoryBibleId(detectedId)
    
    const episodeNum = detectCurrentEpisodeNumber()
    setCurrentEpisodeNumber(episodeNum)
    
    try {
      // Try to fetch latest story bible from Firestore if authenticated
      if (detectedId && user?.id) {
        try {
          const { getStoryBible } = await import('@/services/story-bible-service')
          const latestBible = await getStoryBible(detectedId, user.id)
          if (latestBible) {
            setStoryBible(latestBible)
            console.log('✅ Loaded latest story bible from Firestore:', latestBible.seriesTitle)
          }
        } catch (e) {
          console.warn('⚠️ Could not fetch from Firestore, using localStorage:', e)
          // Fallback to localStorage
          const stored = localStorage.getItem('greenlit-story-bible')
          if (stored) {
            const data = JSON.parse(stored)
            const bible = data.storyBible || data
            if (bible?.id) {
              setStoryBible(bible)
            }
          }
        }
      } else {
        // Load story bible from localStorage (guest mode)
        const stored = localStorage.getItem('greenlit-story-bible')
        if (stored) {
          const data = JSON.parse(stored)
          const bible = data.storyBible || data
          if (bible?.id) {
            setStoryBible(bible)
          }
        }
      }
      
      // Load ALL episodes with FULL content (from Firestore if authenticated, otherwise localStorage)
      if (detectedId) {
        try {
          // Try Firestore first if authenticated
          if (user?.id) {
            const { getEpisodesForStoryBible } = await import('@/services/episode-service')
            const episodesRecord = await getEpisodesForStoryBible(detectedId, user.id)
            const episodesList = Object.values(episodesRecord).sort((a, b) => a.episodeNumber - b.episodeNumber)
            
            if (episodesList.length > 0) {
              setEpisodes(episodesList)
              console.log(`✅ Loaded ${episodesList.length} episodes from Firestore with full content`)
              
              // If we're on an episode page, set that as current
              if (episodeNum) {
                const episode = episodesRecord[episodeNum]
                if (episode) {
                  setCurrentEpisode(episode)
                  console.log('📺 Loaded current episode from Firestore:', episodeNum, episode.title || episode.episodeTitle)
                }
              }
            } else {
              // Fallback to localStorage if Firestore has no episodes
              console.log('⚠️ No episodes in Firestore, trying localStorage...')
              throw new Error('No episodes in Firestore')
            }
          } else {
            // Guest mode: load from localStorage
            throw new Error('Guest mode - use localStorage')
          }
        } catch (e) {
          // Fallback to localStorage
          const possibleKeys = [
            `episodes-${detectedId}`,
            'scorched-episodes',
            'greenlit-episodes',
            'reeled-episodes'
          ]
          
          for (const key of possibleKeys) {
            const storedEpisodes = localStorage.getItem(key)
            if (storedEpisodes) {
              try {
                const episodesData = JSON.parse(storedEpisodes)
                const episodesList = Array.isArray(episodesData) 
                  ? episodesData 
                  : Object.values(episodesData)
                if (episodesList.length > 0) {
                  setEpisodes(episodesList)
                  console.log(`✅ Loaded ${episodesList.length} episodes from localStorage`)
                  
                  // If we're on an episode page, load that specific episode
                  if (episodeNum) {
                    const episode = Array.isArray(episodesData) 
                      ? episodesData.find((ep: any) => ep.episodeNumber === episodeNum)
                      : episodesData[episodeNum]
                    if (episode) {
                      setCurrentEpisode(episode)
                      console.log('📺 Loaded current episode from localStorage:', episodeNum, episode.title || episode.episodeTitle)
                    }
                  }
                  break
                }
              } catch (parseError) {
                // Continue to next key
              }
            }
          }
        }
      }
      
      // Load pre-production data if on pre-production page
      if (episodeNum && detectedId && user?.id && pathname?.includes('/preproduction')) {
        try {
          const { getEpisodePreProduction } = await import('@/services/preproduction-firestore')
          const preProd = await getEpisodePreProduction(user.id, detectedId, episodeNum)
          if (preProd) {
            setPreProductionData(preProd)
            console.log('🎬 Loaded pre-production data for episode:', episodeNum)
          }
        } catch (e) {
          console.warn('Could not load pre-production data:', e)
        }
      }
    } catch (e) {
      console.error('Error loading story bible:', e)
    }
  }, [detectStoryBibleId, detectCurrentEpisodeNumber, user?.id, pathname])

  // Load story bible and check if user has seen chat
  useEffect(() => {
    loadStoryBible().catch(console.error)
    
    // Check if user has seen chat before
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chat-button-seen')
      setHasSeenChat(seen === 'true')
    }
  }, [loadStoryBible, pathname, searchParams])

  // Load chat session when storyBibleId changes
  const { loadSession } = useChat()
  useEffect(() => {
    if (storyBibleId) {
      loadSession(storyBibleId)
    }
  }, [storyBibleId, loadSession])

  // Listen for localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'greenlit-story-bible' && e.newValue) {
        loadStoryBible()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    const handleCustomStorageChange = () => {
      loadStoryBible()
    }
    window.addEventListener('storyBibleUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storyBibleUpdated', handleCustomStorageChange)
    }
  }, [loadStoryBible])

  // Show welcome tooltip on first visit
  useEffect(() => {
    if (!hasSeenWelcome && storyBibleId && !isOpen) {
      const timer = setTimeout(() => {
        setShowWelcomeTooltip(true)
        welcomeTimeoutRef.current = setTimeout(() => {
          setShowWelcomeTooltip(false)
        }, 10000) // Auto-dismiss after 10 seconds
      }, 2000) // Show after 2 seconds
      return () => {
        clearTimeout(timer)
        if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
      }
    }
  }, [hasSeenWelcome, storyBibleId, isOpen])

  // Mark chat button as seen when clicked
  const handleOpenChat = () => {
    setIsOpen(true)
    setShowWelcomeTooltip(false)
    if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
    if (!hasSeenChat && typeof window !== 'undefined') {
      localStorage.setItem('chat-button-seen', 'true')
      setHasSeenChat(true)
    }
  }

  // Auto-scroll to bottom only if user is already near the bottom
  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement
    if (!messagesContainer) return
    
    const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100
    
    // Only auto-scroll if user is already near the bottom (within 100px)
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (storyBibleId) {
          handleOpenChat()
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [storyBibleId])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !storyBibleId) return

    const message = input.trim()
    setInput('')
    
    // Reload all data before sending to ensure we have the latest
    await loadStoryBible()
    
    // Send message with all available context
    await sendMessage(
      message, 
      storyBibleId, 
      storyBible, 
      episodes, 
      user?.id,
      currentEpisode,
      currentEpisodeNumber,
      preProductionData
    )
  }

  const handleExampleQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Detect page context for contextual prompts
  const getPageContext = () => {
    if (!pathname) return null
    if (pathname.includes('/dashboard')) return 'dashboard'
    if (pathname.includes('/story-bible')) return 'story-bible'
    if (pathname.includes('/workspace')) return 'workspace'
    if (pathname.includes('/episode')) return 'episode'
    if (pathname.includes('/preproduction')) return 'preproduction'
    return null
  }

  const getContextualPrompt = () => {
    const context = getPageContext()
    const prompts: Record<string, string> = {
      dashboard: '💡 Need help? Ask Chief: the assistant producer',
      'story-bible': '💬 Chat about your story world',
      workspace: '🤔 Stuck? Get AI suggestions',
      episode: '💬 Discuss this episode',
      preproduction: '💡 Get production insights'
    }
    return prompts[context || ''] || null
  }

  // Progressive disclosure hints
  const getProgressiveHint = () => {
    if (messages.length === 1) {
      return '💡 Tip: You can ask about specific episodes, characters, or arcs'
    }
    if (messages.length === 3) {
      return '💡 Tip: Try asking "What if..." questions to brainstorm plot ideas'
    }
    if (messages.length === 10) {
      return '💡 Power user tip: Save insights you find useful with the 💾 button'
    }
    return null
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Don't show widget if no story bible
  if (!storyBibleId) return null

  const exampleQuestions = [
    'Tell me about my main characters',
    'What happens in Episode 1?',
    'Explain the story arcs',
    'Brainstorm plot ideas'
  ]

  return (
    <>
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {showWelcomeTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-[60] bg-black text-white p-4 rounded-lg shadow-xl max-w-xs"
          >
            <p className="text-sm mb-2 font-semibold">✨ New Feature!</p>
            <p className="text-xs mb-3 opacity-90">
                  Chat with Chief: the assistant producer to brainstorm ideas, understand your story, and get creative suggestions.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleOpenChat()
                  markWelcomeSeen()
                }}
                className="flex-1 bg-[#10B981] text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#059669] transition-colors"
              >
                Try It
              </button>
              <button
                onClick={() => {
                  setShowWelcomeTooltip(false)
                  markWelcomeSeen()
                  if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current)
                }}
                className="px-3 py-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open Chief: the assistant producer"
        >
          {/* Pulsing ring animation */}
          {(!hasSeenChat || !hasSeenWelcome) && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#10B981] opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Main button */}
          <div className={`relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
            isDark 
              ? 'bg-[#10B981] text-black hover:bg-[#059669]' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            
            {/* NEW badge */}
            {!hasSeenChat && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
            
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
              isDark ? 'border-[#1A1A1A]' : 'border-white'
            } ${
              isLoading ? 'bg-yellow-500' : storyBibleId ? 'bg-[#10B981]' : 'bg-gray-400'
            }`} />
          </div>
          
          {/* Hover tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className={`bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg ${
              isDark ? '' : ''
            }`}>
              💬 Chief: the assistant producer
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black"></div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Chat Widget - Desktop/Tablet */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col backdrop-blur-xl ${
              isDark 
                ? 'bg-[#1A1A1A]/95 border border-white/10' 
                : 'bg-white/95 border border-gray-200/50'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="/IMG_0546.JPG" 
                    alt="Chief: the assistant producer" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#10B981]/30"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                  )}
                  {!isLoading && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white dark:border-[#1A1A1A]">
                      <div className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Chief: the assistant producer
                  </h3>
                  {storyBibleId && (
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      {storyBible?.seriesTitle || 'Story'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Enhanced Empty State */}
              {messages.length === 0 && !isLoading && (
                <div className={`text-center py-12 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  <div className="text-5xl mb-6">💬</div>
                  <p className="text-base mb-2 font-semibold">Hi! I'm Chief: the assistant producer</p>
                  <p className="text-sm mb-8 opacity-70">Ask me anything about your story!</p>
                  
                  {/* Example Questions */}
                  <div className="space-y-3 px-2">
                    {exampleQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleQuestion(question)}
                        className={`w-full text-left text-sm p-4 rounded-xl transition-all duration-200 ${
                          isDark 
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">💡</span>
                        {question}
                      </button>
                    ))}
                  </div>
                  
                  {/* Contextual Prompt */}
                  {getContextualPrompt() && (
                    <p className="text-xs mt-6 opacity-60">{getContextualPrompt()}</p>
                  )}
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => {
                const reaction = getReaction(message.id)
                const isSaved = isInsightSaved(message.id)
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {message.role === 'user' ? (
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isDark
                          ? 'bg-[#10B981] text-black'
                          : 'bg-black text-white'
                      }`}>
                        You
                      </div>
                    ) : (
                      <img 
                        src="/IMG_0546.JPG" 
                        alt="Chief: the assistant producer" 
                        className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30"
                      />
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? isDark
                              ? 'bg-[#10B981] text-black rounded-br-sm'
                              : 'bg-black text-white rounded-br-sm'
                            : isDark
                            ? 'bg-white/5 text-white border border-white/10 rounded-bl-sm'
                            : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <MarkdownMessage
                            content={message.content}
                            className={`text-sm leading-relaxed text-[15px]`}
                          />
                        ) : (
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap`}>
                            {message.content}
                          </p>
                        )}
                        {message.references && (
                          <div className={`mt-3 pt-3 border-t ${
                            message.role === 'user'
                              ? 'border-black/20'
                              : isDark ? 'border-white/10' : 'border-gray-200'
                          }`}>
                            <p className={`text-xs ${
                              message.role === 'user' ? 'text-black/70' : isDark ? 'text-white/60' : 'text-gray-600'
                            }`}>
                              <span className="font-medium">References:</span> {message.references.characters?.join(', ') || 'None'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp and Actions */}
                      <div className={`flex items-center gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                        <p className={`text-xs ${
                          isDark ? 'text-white/40' : 'text-gray-400'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                        
                        {/* Interactive Elements for Assistant Messages */}
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addReaction(message.id, reaction === 'up' ? 'down' : 'up')}
                              className={`p-1.5 rounded-lg transition-all duration-200 ${
                                reaction === 'up' 
                                  ? isDark
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : 'bg-[#10B981]/10 text-[#10B981]'
                                  : isDark
                                  ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label="Thumbs up"
                            >
                              <svg className="w-4 h-4" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => saveInsight(message.id)}
                              className={`p-1.5 rounded-lg transition-all duration-200 ${
                                isSaved 
                                  ? isDark
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : 'bg-[#10B981]/10 text-[#10B981]'
                                  : isDark
                                  ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                              }`}
                              aria-label="Save insight"
                            >
                              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Progressive Disclosure Hints */}
              {getProgressiveHint() && messages.length > 0 && (
                <div className={`text-center py-2 px-4 rounded-lg ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  <p className="text-xs">{getProgressiveHint()}</p>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <img 
                    src="/IMG_0546.JPG" 
                    alt="Chief: the assistant producer" 
                    className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30 opacity-75"
                  />
                  <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ${
                    isDark 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                      } animate-bounce`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg ${
                  isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                }`}>
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`px-5 py-4 border-t ${
              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'
            }`}>
              <form onSubmit={handleSend} className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={storyBibleId ? "Ask about your story..." : "Open a story bible first..."}
                  disabled={isLoading || !storyBibleId}
                  rows={2}
                  className={`flex-1 resize-none rounded-xl px-4 py-3 text-sm ${
                    isDark
                      ? 'bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-[#10B981]/50'
                      : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#10B981]'
                  } focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all disabled:opacity-50`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !storyBibleId}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                    isDark
                      ? 'bg-[#10B981] text-black hover:bg-[#059669] shadow-lg shadow-[#10B981]/20'
                      : 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-[#10B981]/20'
                  }`}
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`mt-3 text-xs ${isDark ? 'text-white/50 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  Clear history
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Modal - Full Screen */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className={`absolute bottom-0 left-0 right-0 h-[90vh] rounded-t-xl flex flex-col ${
                isDark 
                  ? 'bg-[#1A1A1A] border-t border-white/10' 
                  : 'bg-white border-t border-gray-200'
              }`}
            >
              {/* Mobile Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src="/IMG_0546.JPG" 
                      alt="Chief: the assistant producer" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#10B981]/30"
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse" />
                    )}
                    {!isLoading && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-white dark:border-[#1A1A1A]">
                        <div className="absolute inset-0 bg-[#10B981] rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                      Chief: the assistant producer
                    </h3>
                    {storyBibleId && (
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {storyBible?.seriesTitle || 'Story'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded hover:bg-white/10 transition-colors ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Messages - Same content as desktop */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.length === 0 && !isLoading && (
                  <div className={`text-center py-12 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    <div className="text-5xl mb-6">💬</div>
                    <p className="text-base mb-2 font-semibold">Hi! I'm Chief: the assistant producer</p>
                    <p className="text-sm mb-8 opacity-70">Ask me anything about your story!</p>
                    
                    <div className="space-y-3 px-2">
                      {exampleQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExampleQuestion(question)}
                          className={`w-full text-left text-sm p-4 rounded-xl transition-all duration-200 ${
                            isDark 
                              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10' 
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">💡</span>
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => {
                  const reaction = getReaction(message.id)
                  const isSaved = isInsightSaved(message.id)
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      {message.role === 'user' ? (
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isDark
                            ? 'bg-[#10B981] text-black'
                            : 'bg-black text-white'
                        }`}>
                          You
                        </div>
                      ) : (
                        <img 
                          src="/IMG_0546.JPG" 
                          alt="Chief: the assistant producer" 
                          className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30"
                        />
                      )}
                      
                      {/* Message Bubble */}
                      <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? isDark
                                ? 'bg-[#10B981] text-black rounded-br-sm'
                                : 'bg-black text-white rounded-br-sm'
                              : isDark
                              ? 'bg-white/5 text-white border border-white/10 rounded-bl-sm'
                              : 'bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <MarkdownMessage
                              content={message.content}
                              className={`text-sm leading-relaxed text-[15px]`}
                            />
                          ) : (
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap`}>
                              {message.content}
                            </p>
                          )}
                        </div>
                        
                        {/* Timestamp and Actions */}
                        <div className={`flex items-center gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1`}>
                          <p className={`text-xs ${
                            isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </p>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => addReaction(message.id, reaction === 'up' ? 'down' : 'up')}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  reaction === 'up' 
                                    ? isDark
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : 'bg-[#10B981]/10 text-[#10B981]'
                                    : isDark
                                    ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => saveInsight(message.id)}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  isSaved 
                                    ? isDark
                                      ? 'bg-[#10B981]/20 text-[#10B981]'
                                      : 'bg-[#10B981]/10 text-[#10B981]'
                                    : isDark
                                    ? 'hover:bg-white/10 text-white/50 hover:text-white/70'
                                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <img 
                      src="/IMG_0546.JPG" 
                      alt="Chief: the assistant producer" 
                      className="flex-shrink-0 w-8 h-8 rounded-full object-cover border border-[#10B981]/30 opacity-75"
                    />
                    <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ${
                      isDark 
                        ? 'bg-white/5 border border-white/10' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '0ms' }} />
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '150ms' }} />
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-[#10B981]' : 'bg-[#10B981]'
                        } animate-bounce`} style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className={`p-3 rounded-lg ${
                    isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                  }`}>
                    <p className="text-sm">Error: {error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Input */}
              <div className={`p-4 border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <form onSubmit={handleSend} className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your story..."
                    disabled={isLoading || !storyBibleId}
                    rows={2}
                    className={`flex-1 resize-none rounded-lg px-4 py-2 text-sm ${
                      isDark
                        ? 'bg-white/5 text-white placeholder-white/40 border border-white/10'
                        : 'bg-gray-50 text-black placeholder-black/40 border border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-50`}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || !storyBibleId}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-[#10B981] text-black hover:bg-[#059669]'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
