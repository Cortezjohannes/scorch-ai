'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Workspace page is defunct and redirects to dashboard to prevent confusion.
 * This page should no longer be used - all workspace functionality has been moved to the dashboard.
 */
export default function WorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Preserve the story bible ID if it exists in the URL
    const storyBibleId = searchParams.get('id')
    const redirectUrl = storyBibleId ? `/dashboard?id=${storyBibleId}` : '/dashboard'
    
    // Redirect immediately to dashboard
    router.replace(redirectUrl)
  }, [router, searchParams])
  
  // Return null or a simple loading message while redirecting
  return null
}
