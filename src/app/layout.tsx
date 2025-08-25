'use client'

import './globals.css'
import { Suspense } from 'react'
import ClientLayout from '@/components/ClientLayout'

// Note: League Spartan is loaded via Google Fonts in globals.css

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ fontFamily: 'League Spartan, sans-serif' }}>
      <head>
        <title>Scorched AI - Burn Hollywood. Ignite Your Empire.</title>
        <meta name="description" content="The AI showrunner platform where actors wield the flame. No gatekeepers. No bureaucracy. 60% ownership of your content." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <meta name="theme-color" content="#e2c376" />
      </head>
      <body className="antialiased bg-layout" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <ClientLayout>
          <div className="relative min-h-screen">
            {/* Fire Video Background */}
            <video 
              className="fire-video-background"
              autoPlay 
              muted 
              loop 
              playsInline
              preload="auto"
            >
              <source src="/fire_background.mp4" type="video/mp4" />
            </video>
            
            {/* Scorched AI Navigation */}
            <nav className="scorched-nav">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 ember-shadow rounded-lg flex items-center justify-center animate-emberFloat">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black elegant-fire fire-gradient animate-flameFlicker">
                      Scorched AI
                    </h1>
                  </div>
                  <div className="hidden md:flex items-center space-x-8">
                    <a href="#revolution" className="text-gray-300 hover:text-[#e2c376] transition-colors font-semibold elegant-fire">
                      Revolution
                    </a>
                    <a href="#platform" className="text-gray-300 hover:text-[#e2c376] transition-colors font-semibold elegant-fire">
                      Platform
                    </a>
                    <a href="#rebels" className="text-gray-300 hover:text-[#e2c376] transition-colors font-semibold elegant-fire">
                      Founders
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            
            {/* Main Content */}
            <main className="relative z-10 min-h-screen pt-20 overflow-x-hidden">
              <div className="w-full">
                {children}
              </div>
            </main>
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}
