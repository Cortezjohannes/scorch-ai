'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/story-bible', label: 'Story Bible' },
    { href: '/workspace', label: 'Workspace' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
          {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
            className={`px-3 py-2 rounded-lg text-sm relative ${
              isActive(link.href)
                ? 'text-[#e2c376] font-medium'
                : 'text-[#e7e7e7]/70 hover:text-[#e7e7e7] hover:bg-[#ffffff0a]'
            } transition-colors`}
          >
            {link.label}
            {isActive(link.href) && (
                  <motion.div
                layoutId="navIndicator"
                className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#e2c376]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
          
      {/* Mobile menu button */}
      <div className="md:hidden">
              <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-[#e7e7e7]/70 hover:text-[#e7e7e7] hover:bg-[#ffffff0a]"
                aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
              >
                {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
                ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
                  </svg>
              </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="absolute top-16 left-0 right-0 bg-[#121212] border-b border-[#36393f] md:hidden z-50"
        >
          <div className="flex flex-col p-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-lg ${
                  isActive(link.href)
                    ? 'bg-[#e2c37620] text-[#e2c376] font-medium'
                    : 'text-[#e7e7e7]/80 hover:bg-[#1e1e1e]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}