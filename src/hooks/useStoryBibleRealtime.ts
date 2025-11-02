/**
 * Real-time Story Bible Sync Hook
 * 
 * Provides real-time updates for story bible changes
 * Useful for collaborative editing or cross-device sync
 */

'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import type { StoryBible } from '@/services/story-bible-service'

interface UseStoryBibleRealtimeOptions {
  userId: string
  storyBibleId: string
  enabled?: boolean
  onUpdate?: (storyBible: StoryBible) => void
  onError?: (error: Error) => void
}

interface UseStoryBibleRealtimeReturn {
  storyBible: StoryBible | null
  loading: boolean
  error: Error | null
  unsubscribe: () => void
}

/**
 * Hook for real-time story bible sync
 */
export function useStoryBibleRealtime({
  userId,
  storyBibleId,
  enabled = true,
  onUpdate,
  onError
}: UseStoryBibleRealtimeOptions): UseStoryBibleRealtimeReturn {
  const [storyBible, setStoryBible] = useState<StoryBible | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [unsubscribeFn, setUnsubscribeFn] = useState<Unsubscribe | null>(null)

  useEffect(() => {
    if (!enabled || !userId || !storyBibleId) {
      setLoading(false)
      return
    }

    let unsubscribe: Unsubscribe

    try {
      const docRef = doc(db, 'users', userId, 'storyBibles', storyBibleId)
      
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            const storyBibleData: StoryBible = {
              ...data,
              id: snapshot.id,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
            } as StoryBible
            
            setStoryBible(storyBibleData)
            
            if (onUpdate) {
              onUpdate(storyBibleData)
            }
            
            console.log('📡 Story bible updated in real-time')
          } else {
            console.warn('Story bible not found')
            setStoryBible(null)
          }
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Real-time sync error:', err)
          setError(err as Error)
          setLoading(false)
          
          if (onError) {
            onError(err as Error)
          }
        }
      )

      setUnsubscribeFn(() => unsubscribe)
    } catch (err) {
      console.error('Failed to setup real-time sync:', err)
      setError(err as Error)
      setLoading(false)
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
        console.log('📡 Real-time sync disconnected')
      }
    }
  }, [userId, storyBibleId, enabled])

  const manualUnsubscribe = () => {
    if (unsubscribeFn) {
      unsubscribeFn()
      setUnsubscribeFn(null)
      console.log('📡 Manually unsubscribed from real-time sync')
    }
  }

  return {
    storyBible,
    loading,
    error,
    unsubscribe: manualUnsubscribe
  }
}

/**
 * Hook for real-time version history sync
 */
export function useVersionHistoryRealtime({
  userId,
  storyBibleId,
  enabled = true,
  limitCount = 20
}: {
  userId: string
  storyBibleId: string
  enabled?: boolean
  limitCount?: number
}) {
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !userId || !storyBibleId) {
      setLoading(false)
      return
    }

    // Note: For versions, we'd typically use a query with onSnapshot
    // This is a simplified version - full implementation would use query subscription
    setLoading(false)
    
    // TODO: Implement full real-time version sync if needed
    console.log('Version real-time sync placeholder')

  }, [userId, storyBibleId, enabled, limitCount])

  return { versions, loading, error }
}

/**
 * Hook for real-time episode reflections
 */
export function useEpisodeReflectionsRealtime({
  userId,
  storyBibleId,
  enabled = true
}: {
  userId: string
  storyBibleId: string
  enabled?: boolean
}) {
  const [reflections, setReflections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !userId || !storyBibleId) {
      setLoading(false)
      return
    }

    // TODO: Implement real-time reflections sync
    setLoading(false)
    console.log('Reflections real-time sync placeholder')

  }, [userId, storyBibleId, enabled])

  return { reflections, loading, error }
}

