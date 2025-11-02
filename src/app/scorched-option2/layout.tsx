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
        <title>Greenlit - Be Your Own Showrunner</title>
        <meta name="description" content="The AI showrunner platform for professional actors. Own your IP. 70% revenue share guaranteed. You're already greenlit." />
        <link rel="icon" href="/Greenlit.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${leagueSpartan.className} antialiased bg-black`}>
        {children}
      </body>
    </html>
  )
}
