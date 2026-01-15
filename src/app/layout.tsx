'use client'

import './globals.css'
import { Suspense } from 'react'
import ClientLayout from '@/components/ClientLayout'
import { ThemeProvider } from '@/context/ThemeContext'

// Note: League Spartan is loaded via Google Fonts in globals.css

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ fontFamily: 'League Spartan, sans-serif' }}>
      <head>
        <title>Greenlit - The Studio System is Broken. Build Your Own.</title>
        <meta name="description" content="The production platform for professional actors. Launch your series, own your IP. 70% revenue share guaranteed." />
        <link rel="icon" href="/Greenlit.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        <meta name="theme-color" content="#10B981" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased dark-bg-primary" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <ThemeProvider>
          <ClientLayout>
            <div className="relative min-h-screen">
              {/* Main Content */}
              <main className="relative z-10 min-h-screen overflow-x-hidden">
                <div className="w-full">
                  {children}
                </div>
              </main>
            </div>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}

