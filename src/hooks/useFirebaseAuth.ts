'use client';

import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UseFirebaseAuthReturn {
  user: FirebaseAuthUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<FirebaseAuthUser | null>;
  signIn: (email: string, password: string) => Promise<FirebaseAuthUser | null>;
  signInWithGoogle: () => Promise<FirebaseAuthUser | null>;
  signOut: () => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Firebase User to our user format
  const formatUser = (user: User): FirebaseAuthUser => {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  };

  // Create or update user in Firestore
  const createUserDocument = async (user: FirebaseAuthUser) => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    // If user doesn't exist in Firestore, create it
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      // Update last login time
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string): Promise<FirebaseAuthUser | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const formattedUser = formatUser(userCredential.user);
      await createUserDocument(formattedUser);
      return formattedUser;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string): Promise<FirebaseAuthUser | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const formattedUser = formatUser(userCredential.user);
      await createUserDocument(formattedUser);
      return formattedUser;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<FirebaseAuthUser | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const formattedUser = formatUser(userCredential.user);
      await createUserDocument(formattedUser);
      return formattedUser;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        const formattedUser = formatUser(user);
        setUser(formattedUser);
        await createUserDocument(formattedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
} 