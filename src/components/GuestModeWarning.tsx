'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function GuestModeWarning() {
  const { user } = useAuth()

  // Don't show for authenticated users
  if (user) return null

  return (
    <div className="bg-amber-500/20 border-l-4 border-amber-500 p-4 mb-4 rounded-r-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-amber-500" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-amber-200">
            <strong className="font-semibold">Guest Mode:</strong> Your episodes are only saved locally and won't sync across devices.
            <Link 
              href="/login" 
              className="ml-2 underline font-semibold hover:text-amber-100 transition-colors"
            >
              Sign in to save to cloud
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}


