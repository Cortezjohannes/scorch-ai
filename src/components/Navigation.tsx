'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/uprising', label: 'Uprising', special: true },
    { href: '/program', label: 'Program' },
    { href: '/criteria', label: 'Criteria' },
    { href: '/fund', label: 'Fund' },
    { href: '/playbook', label: 'Playbook' },
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
                ? 'text-[#00FF99] font-medium'
                : 'text-[#E7E7E7]/70 hover:text-[#FFFFFF] hover:bg-[#00FF991A]'
            } transition-colors ${
              link.special ? 'relative overflow-hidden' : ''
            }`}
          >
            {link.special && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-lg border-2"
                  style={{
                    background: 'conic-gradient(from 0deg, #00FF99, #00CC7A, #00FF99, #00CC7A, #00FF99)',
                    borderRadius: '8px',
                    zIndex: -1
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0.5 bg-[#121212] rounded-lg z-0" />
              </>
            )}
            <span className="relative z-10">{link.label}</span>
            {isActive(link.href) && (
              <motion.div
                layoutId="navIndicator"
                className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#00FF99]"
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
          className="p-2 rounded-lg text-[#E7E7E7]/70 hover:text-[#FFFFFF] hover:bg-[#00FF991A] transition-colors"
          aria-label="Toggle menu"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
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
          </motion.svg>
        </button>
      </div>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-16 left-4 right-4 bg-[#121212]/95 backdrop-blur-md border border-[#00FF99]/20 rounded-xl shadow-2xl md:hidden z-50"
            >
              <div className="p-4 space-y-2">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-lg relative transition-all ${
                        isActive(link.href)
                          ? 'bg-[#00FF991A] text-[#00FF99] font-medium'
                          : 'text-[#E7E7E7]/80 hover:bg-[#1E1E1E] hover:text-white'
                      } ${
                        link.special ? 'overflow-hidden' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.special && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2"
                            style={{
                              background: 'conic-gradient(from 0deg, #00FF99, #00CC7A, #00FF99, #00CC7A, #00FF99)',
                              borderRadius: '8px',
                              zIndex: -1
                            }}
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          />
                          <div className="absolute inset-0.5 bg-[#121212] rounded-lg z-0" />
                        </>
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}