'use client'

import { useSearchParams } from 'next/navigation'
import { PreProductionForm } from '@/components/preproduction/PreProductionForm'

export default function PreProductionPage() {
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
        <PreProductionForm synopsis={synopsis} theme={theme} />
      </div>
    </div>
  )
} 