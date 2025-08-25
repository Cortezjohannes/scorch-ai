'use client'

import { Phase2Form } from '@/components/phase2/Phase2Form'
import { useSearchParams } from 'next/navigation'

export default function Phase2Page() {
  const searchParams = useSearchParams()
  const synopsis = searchParams.get('synopsis') || ''
  const theme = searchParams.get('theme') || ''

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Phase2Form synopsis={synopsis} theme={theme} />
      </div>
    </div>
  )
} 