'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'

// Detect server-side rendering
const isServer = typeof window === 'undefined';

// Simple user type with minimal properties
export interface User {
  id: string
  email: string | null
  displayName: string | null
  projects: string[]
  collaborations: string[]
  photoURL: string | null
}

export type AuthError = {
  code: string;
  message: string;
}

// Simplified AuthContext interface
interface AuthContextProps {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  getCollaborators: (projectId: string) => Promise<User[]>
  addCollaborator: (projectId: string, email: string) => Promise<void>
  removeCollaborator: (projectId: string, userId: string) => Promise<void>
  updateUserAvailability: (
    userId: string,
    availability: { date: string; hours: number[] }[]
  ) => Promise<void>
  getUserAvailability: (
    userId: string
  ) => Promise<{ date: string; hours: number[] }[]>
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextProps | undefined>(undefined)

// Simplified function to convert Firebase user to our User type
const createUserProfile = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      projects: [],
      collaborations: []
    };
};

// More reliable check if Firebase is available and correctly initialized
const isFirebaseAvailable = () => {
  if (isServer) return false; // Firebase isn't available on server
  
  try {
    // Check if auth is properly initialized and methods exist
    return !!auth && 
           typeof auth.currentUser !== 'undefined' &&
           typeof auth.onAuthStateChanged === 'function';
  } catch (error) {
    console.warn('Firebase appears to be unavailable:', error);
    return false;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Instead of throwing, provide a minimal mock context when not in provider
    if (process.env.NODE_ENV !== 'production') {
      console.warn('useAuth() was called outside of AuthProvider - using mock implementation');
      return createMockAuthImplementation();
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Create a mock auth implementation for development or when Firebase is disabled
const createMockAuthImplementation = (): AuthContextProps => {
  // Create a mock user
  const mockUser: User = {
    id: 'mock-user-123',
    email: 'user@example.com',
    displayName: 'Test User',
    projects: ['mock-project-1', 'mock-project-2'],
    collaborations: [],
    photoURL: null
  };
  
  console.log('Using mock auth implementation');
  
  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signUp: async () => { console.log('Mock sign up called'); },
    signIn: async () => { console.log('Mock sign in called'); },
    signOut: async () => { console.log('Mock sign out called'); },
    resetPassword: async () => { console.log('Mock reset password called'); },
    updateUserProfile: async () => { console.log('Mock update profile called'); },
    getCollaborators: async () => {
      return [mockUser];
    },
    addCollaborator: async () => { console.log('Mock add collaborator called'); },
    removeCollaborator: async () => { console.log('Mock remove collaborator called'); },
    updateUserAvailability: async () => { console.log('Mock update availability called'); },
    getUserAvailability: async () => {
      return [{ date: '2025-04-15', hours: [9, 10, 11, 12] }];
    }
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine if we should use the mock implementation
  const [useMockAuth] = useState(() => {
    // Always use the mock implementation on the server
    if (isServer) return true;
    
    // Check if Firebase is properly available
    const firebaseAvailable = isFirebaseAvailable();
    console.log('Firebase available:', firebaseAvailable);
    
    return !firebaseAvailable;
  });
  
  useEffect(() => {
    // If we're using the mock implementation, set up mock data
    if (useMockAuth) {
      console.log('Firebase disabled: Using mock implementation');
      const mockImpl = createMockAuthImplementation();
      setUser(mockImpl.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return () => {}; // Empty cleanup function
    }
    
    // Otherwise use the real Firebase implementation
    try {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              projects: userData.projects || [],
              collaborations: userData.collaborations || []
            })
          } else {
            // New user, create in Firestore
            const newUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              projects: [],
              collaborations: [],
              createdAt: new Date().toISOString()
            }
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              projects: [],
              collaborations: []
            })
          }
          
          setIsAuthenticated(true)
        } catch (err: any) {
          console.error('Error getting user data:', err)
          setError(err.message)
            
            // Fallback to basic user info if Firestore fails
            setUser(createUserProfile(firebaseUser))
            setIsAuthenticated(true)
        }
      } else {
        // User is signed out
        setUser(null)
        setIsAuthenticated(false)
      }
      
      setIsLoading(false)
    })
    
    return () => unsubscribe()
    } catch (err: any) {
      // Handle initialization errors
      console.error('Firebase auth initialization error:', err);
      setError(err.message);
      setIsLoading(false);
      
      // Fall back to mock implementation
      const mockImpl = createMockAuthImplementation();
      setUser(mockImpl.user);
      setIsAuthenticated(true);
      
      return () => {};
    }
  }, [useMockAuth])

  // Rest of the functions
  // Either use the real implementation or the mock implementation

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      const newUser = {
        id: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        projects: [],
        collaborations: [],
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Update Firebase profile
      await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || null });
      
      // Update Firestore document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { displayName, photoURL: photoURL || null });
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          displayName,
          photoURL: photoURL || null
        });
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCollaborators = async (projectId: string): Promise<User[]> => {
    try {
      // Get the project document to find collaborator IDs
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const collaboratorIds = projectData.collaborators || [];
      
      if (collaboratorIds.length === 0) {
        return [];
      }
      
      // Fetch all collaborator profiles
      const collaborators: User[] = [];
      
      for (const id of collaboratorIds) {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          collaborators.push({
            id,
            email: userData.email || null,
            displayName: userData.displayName || null,
            photoURL: userData.photoURL || null,
            projects: userData.projects || [],
            collaborations: userData.collaborations || []
          });
        }
      }
      
      return collaborators;
    } catch (err: any) {
      console.error('Get collaborators error:', err);
      return [];
    }
  };

  const addCollaborator = async (projectId: string, email: string) => {
    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found with that email');
      }
      
      const collaboratorDoc = querySnapshot.docs[0];
      const collaboratorId = collaboratorDoc.id;
      const collaboratorData = collaboratorDoc.data();
      
      // Update project with new collaborator
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const currentCollaborators = projectData.collaborators || [];
      
      if (currentCollaborators.includes(collaboratorId)) {
        throw new Error('User is already a collaborator');
      }
      
      // Update project
      await updateDoc(projectRef, {
        collaborators: [...currentCollaborators, collaboratorId]
      });
      
      // Update user's collaborations
      const userCollaborations = collaboratorData.collaborations || [];
      await updateDoc(doc(db, 'users', collaboratorId), {
        collaborations: [...userCollaborations, projectId]
      });
    } catch (err: any) {
      console.error('Add collaborator error:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeCollaborator = async (projectId: string, userId: string) => {
    try {
      // Update project
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      const currentCollaborators = projectData.collaborators || [];
      
      if (!currentCollaborators.includes(userId)) {
        throw new Error('User is not a collaborator');
      }
      
      // Update project
      await updateDoc(projectRef, {
        collaborators: currentCollaborators.filter((id: string) => id !== userId)
      });
      
      // Update user's collaborations
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userCollaborations = userData.collaborations || [];
        
        await updateDoc(userRef, {
          collaborations: userCollaborations.filter((id: string) => id !== projectId)
        });
      }
    } catch (err: any) {
      console.error('Remove collaborator error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateUserAvailability = async (
    userId: string,
    availability: { date: string; hours: number[] }[]
  ) => {
    try {
      // Update the user's availability in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { availability });
    } catch (err: any) {
      console.error('Update availability error:', err);
      setError(err.message);
      throw err;
    }
  };

  const getUserAvailability = async (
    userId: string
  ): Promise<{ date: string; hours: number[] }[]> => {
    try {
      // Get the user's availability from Firestore
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return [];
      }
      
      const userData = userDoc.data();
      return userData.availability || [];
    } catch (err: any) {
      console.error('Get availability error:', err);
      return [];
    }
  };

  // Provide the auth context value
  const authValue: AuthContextProps = useMockAuth 
    ? createMockAuthImplementation()
    : {
        user,
    isAuthenticated,
        isLoading,
        error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
    getCollaborators,
    addCollaborator,
    removeCollaborator,
    updateUserAvailability,
    getUserAvailability
      };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
} 