'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UseSharedStoryBibleOptions {
  linkId: string;
  onError?: (error: Error) => void;
}

export interface UseSharedStoryBibleReturn {
  storyBible: any | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  version: number;
  lastModified: Date | null;
  updateStoryBible: (updates: any) => Promise<void>;
  saving: boolean;
}

/**
 * Hook for real-time collaboration on shared story bibles
 * Uses Firestore's onSnapshot for live updates and debounced auto-save
 */
export function useSharedStoryBible({
  linkId,
  onError
}: UseSharedStoryBibleOptions): UseSharedStoryBibleReturn {
  const [storyBible, setStoryBible] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [version, setVersion] = useState(0);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareIdRef = useRef<string | null>(null);

  // Fetch initial data and get shareId
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`/api/shared/${linkId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load shared story bible');
        }
        
        const { data } = await response.json();
        shareIdRef.current = data.shareId;
        setStoryBible(data.storyBible);
        setVersion(data.version);
        setLastModified(data.lastModified ? new Date(data.lastModified) : null);
        setLoading(false);
        setConnected(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
        setConnected(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    fetchInitialData();
  }, [linkId, onError]);

  // Set up real-time listener
  useEffect(() => {
    if (!shareIdRef.current) return;

    const shareId = shareIdRef.current;
    const docRef = doc(db, 'sharedStoryBibles', shareId);

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setStoryBible(data.storyBible);
          setVersion(data.version || 0);
          setLastModified(data.lastModified?.toDate() || null);
          setConnected(true);
          setError(null);
        } else {
          setError('Shared story bible no longer exists');
          setConnected(false);
        }
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setError('Lost connection to shared story bible');
        setConnected(false);
        onError?.(err);
      }
    );

    return () => unsubscribe();
  }, [onError]);

  // Debounced update function
  const updateStoryBible = useCallback(
    async (updates: any) => {
      if (!shareIdRef.current) {
        throw new Error('Share ID not available');
      }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set saving state
      setSaving(true);

      // Optimistically update local state
      setStoryBible(updates);

      // Debounce the actual save (500ms)
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const shareId = shareIdRef.current;
          if (!shareId) return;

          const docRef = doc(db, 'sharedStoryBibles', shareId);
          
          await updateDoc(docRef, {
            storyBible: updates,
            lastModified: serverTimestamp(),
            version: increment(1)
          });

          // Log the edit action
          await fetch(`/api/shared/${linkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });

          setSaving(false);
        } catch (err) {
          console.error('Error saving updates:', err);
          setSaving(false);
          const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }, 500);
    },
    [linkId, onError]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    storyBible,
    loading,
    error,
    connected,
    version,
    lastModified,
    updateStoryBible,
    saving
  };
}







