'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { db, auth, storage } from '@/lib/firebase'
import { Firestore } from 'firebase/firestore'
import { Auth } from 'firebase/auth'
import { FirebaseStorage } from 'firebase/storage'

// Detect server-side rendering
const isServer = typeof window === 'undefined';

// Create a context for Firebase services
interface FirebaseContextType {
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  isServer: boolean;
}

// Create the context with default values
const FirebaseContext = createContext<FirebaseContextType>({
  db,
  auth,
  storage,
  isServer
});

// Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  // Memoize the firebase services to prevent unnecessary re-renders
  const firebaseServices = useMemo(() => ({
    db,
    auth,
    storage,
    isServer
  }), []);
  
  return (
    <FirebaseContext.Provider value={firebaseServices}>
      {children}
    </FirebaseContext.Provider>
  )
}

// Custom hook to use the firebase context
export const useFirebase = () => useContext(FirebaseContext) 