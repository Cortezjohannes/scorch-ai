'use client';

import { ReactNode } from 'react';
import { FirebaseProvider } from '@/context/FirebaseContext';
import { AuthProvider } from '@/context/AuthContext';
import { VideoProvider } from '@/context/VideoContext';
import dynamic from 'next/dynamic';

// Lazy-load additional components
const SessionExpiry = dynamic(() => import('@/components/auth/SessionExpiry'), {
  ssr: false,
});

const DataMigration = dynamic(() => import('@/components/migration/DataMigration'), {
  ssr: false,
});

interface DynamicProvidersProps {
  children: ReactNode;
}

export function DynamicProviders({ children }: DynamicProvidersProps) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <VideoProvider>
          <>
            {/* Session Expiry Handler - dynamically loaded */}
            <SessionExpiry />
            
            {/* Data Migration Dialog - dynamically loaded */}
            <DataMigration />
            
            {children}
          </>
        </VideoProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
} 