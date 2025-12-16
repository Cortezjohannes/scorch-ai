'use client'

import { useEffect } from 'react'

export default function GreenlitPage() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/greenlit-landing.html'
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#10B981] mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading Greenlit...</p>
      </div>
    </div>
  )
}
