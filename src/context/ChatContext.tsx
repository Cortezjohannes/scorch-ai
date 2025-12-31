'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  references?: {
    characters?: string[]
    episodes?: number[]
    arcs?: string[]
  }
}

export interface ChatSession {
  storyBibleId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  userId?: string
}

interface ChatContextType {
  // Current session
  currentSession: ChatSession | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  
  // Actions
  sendMessage: (
    message: string, 
    storyBibleId: string, 
    storyBible?: any, 
    episodes?: any[], 
    userId?: string,
    currentEpisode?: any,
    currentEpisodeNumber?: number | null,
    preProductionData?: any
  ) => Promise<void>
  clearHistory: () => void
  loadSession: (storyBibleId: string) => void
  
  // UI state
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  
  // Onboarding
  hasSeenWelcome: boolean
  markWelcomeSeen: () => void
  
  // Reactions & Insights
  addReaction: (messageId: string, reaction: 'up' | 'down') => void
  getReaction: (messageId: string) => 'up' | 'down' | null
  saveInsight: (messageId: string) => void
  getSavedInsights: () => string[]
  isInsightSaved: (messageId: string) => boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

const STORAGE_KEY_PREFIX = 'chat-session-'

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  // Onboarding state
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('chat-welcome-seen') === 'true'
  })

  // Load session from localStorage
  const loadSession = useCallback((storyBibleId: string) => {
    if (!storyBibleId) return

    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${storyBibleId}`
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        const session: ChatSession = JSON.parse(stored)
        setCurrentSession(session)
        setMessages(session.messages || [])
      } else {
        // Create new session
        const newSession: ChatSession = {
          storyBibleId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id
        }
        setCurrentSession(newSession)
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading chat session:', error)
      setError('Failed to load chat history')
    }
  }, [user?.id])

  // Save session to localStorage
  const saveSession = useCallback((session: ChatSession) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${session.storyBibleId}`
      localStorage.setItem(storageKey, JSON.stringify(session))
    } catch (error) {
      console.error('Error saving chat session:', error)
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async (
    message: string,
    storyBibleId: string,
    storyBible?: any,
    episodes?: any[],
    userId?: string,
    currentEpisode?: any,
    currentEpisodeNumber?: number | null,
    preProductionData?: any
  ) => {
    if (!message.trim() || !storyBibleId) return

    setIsLoading(true)
    setError(null)

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    // Add user message to state immediately
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Update or create session
    let session = currentSession
    if (!session || session.storyBibleId !== storyBibleId) {
      session = {
        storyBibleId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id
      }
      setCurrentSession(session)
    }

    session.messages = updatedMessages
    session.updatedAt = new Date().toISOString()
    saveSession(session)

    // Create assistant message placeholder for streaming
    const assistantMessageId = `msg-${Date.now()}-assistant`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    // Add empty assistant message for streaming
    const messagesWithPlaceholder = [...updatedMessages, assistantMessage]
    setMessages(messagesWithPlaceholder)

    try {
      // Call API with streaming
      const response = await fetch('/api/chat/story-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          storyBibleId,
          userId: userId || user?.id,
          conversationHistory: updatedMessages.slice(-10),
          storyBible,
          episodes: episodes?.map(ep => ({
            episodeNumber: ep.episodeNumber,
            title: ep.title || ep.episodeTitle,
            synopsis: ep.synopsis || ep.summary || 'No synopsis',
            scenes: (ep.scenes || []).map((scene: any) => ({
              sceneNumber: scene.sceneNumber || scene.scene,
              title: scene.title,
              content: scene.content || scene.description || scene.text || '',
              location: scene.location,
              timeOfDay: scene.timeOfDay,
              characters: scene.characters
            })),
            rundown: ep.rundown || '',
            branchingOptions: ep.branchingOptions || [],
            episodeTitle: ep.episodeTitle || ep.title,
            arcIndex: ep.arcIndex,
            arcTitle: ep.arcTitle
          })),
          currentEpisode: currentEpisode ? {
            episodeNumber: currentEpisode.episodeNumber || currentEpisodeNumber,
            title: currentEpisode.title || currentEpisode.episodeTitle,
            synopsis: currentEpisode.synopsis,
            scenes: currentEpisode.scenes || [],
            rundown: currentEpisode.rundown || '',
            branchingOptions: currentEpisode.branchingOptions || []
          } : null,
          currentEpisodeNumber,
          preProductionData: preProductionData ? {
            episodeNumber: preProductionData.episodeNumber,
            scriptBreakdown: preProductionData.scriptBreakdown,
            storyboards: preProductionData.storyboards,
            shotList: preProductionData.shotList,
            locations: preProductionData.locations,
            props: preProductionData.props,
            wardrobe: preProductionData.wardrobe,
            casting: preProductionData.casting,
            marketing: preProductionData.marketing
          } : null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from assistant')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let finalReferences: any = undefined

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                fullContent += data.content
                // Update message content incrementally
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ))
              } else if (data.type === 'done') {
                finalReferences = data.references
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Streaming error')
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError)
            }
          }
        }
      }

      // Finalize assistant message
      const finalAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        references: finalReferences
      }

      // Update messages with final content
      const finalMessages = [...updatedMessages, finalAssistantMessage]
      setMessages(finalMessages)

      // Update session
      if (session) {
        session.messages = finalMessages
        session.updatedAt = new Date().toISOString()
        saveSession(session)
        setCurrentSession(session)
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.message || 'Failed to send message')
      
      // Remove assistant placeholder on error
      setMessages(updatedMessages)
    } finally {
      setIsLoading(false)
    }
  }, [messages, currentSession, user?.id, saveSession, user])

  // Clear history
  const clearHistory = useCallback(() => {
    if (currentSession) {
      const clearedSession: ChatSession = {
        ...currentSession,
        messages: [],
        updatedAt: new Date().toISOString()
      }
      setCurrentSession(clearedSession)
      setMessages([])
      saveSession(clearedSession)
    }
  }, [currentSession, saveSession])

  // Mark welcome as seen
  const markWelcomeSeen = useCallback(() => {
    setHasSeenWelcome(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-welcome-seen', 'true')
    }
  }, [])

  // Add reaction to message
  const addReaction = useCallback((messageId: string, reaction: 'up' | 'down') => {
    if (typeof window === 'undefined') return
    const key = `chat-reaction-${messageId}`
    localStorage.setItem(key, reaction)
  }, [])

  // Get reaction for message
  const getReaction = useCallback((messageId: string): 'up' | 'down' | null => {
    if (typeof window === 'undefined') return null
    const key = `chat-reaction-${messageId}`
    const reaction = localStorage.getItem(key)
    return (reaction === 'up' || reaction === 'down') ? reaction : null
  }, [])

  // Save insight
  const saveInsight = useCallback((messageId: string) => {
    if (typeof window === 'undefined') return
    const key = 'chat-saved-insights'
    const saved = localStorage.getItem(key)
    const insights = saved ? JSON.parse(saved) : []
    if (!insights.includes(messageId)) {
      insights.push(messageId)
      localStorage.setItem(key, JSON.stringify(insights))
    }
  }, [])

  // Get saved insights
  const getSavedInsights = useCallback((): string[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('chat-saved-insights')
    return saved ? JSON.parse(saved) : []
  }, [])

  // Check if insight is saved
  const isInsightSaved = useCallback((messageId: string): boolean => {
    return getSavedInsights().includes(messageId)
  }, [getSavedInsights])

  const value: ChatContextType = {
    currentSession,
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    loadSession,
    isOpen,
    setIsOpen,
    hasSeenWelcome,
    markWelcomeSeen,
    addReaction,
    getReaction,
    saveInsight,
    getSavedInsights,
    isInsightSaved
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

