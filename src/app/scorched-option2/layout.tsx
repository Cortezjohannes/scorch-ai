'use client'

import { League_Spartan } from 'next/font/google'

const leagueSpartan = League_Spartan({ 
  subsets: ['latin'],
  display: 'swap', 
  preload: true
})

export default function Option2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Scorched AI - Burn Hollywood. Ignite Your Empire.</title>
        <meta name="description" content="The revolutionary AI showrunner platform. 60% actor ownership. No gatekeepers. No permission required. Start your revolution." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${leagueSpartan.className} antialiased bg-black`}>
        {children}
      </body>
    </html>
  )
}
