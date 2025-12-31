'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface InvestorLightboxProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

// Subtle CRT effects styles for modals
const crtModalStyles = `
  .crt-modal-scanlines {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      transparent 50%,
      rgba(0, 0, 0, 0.015) 50%
    );
    background-size: 100% 4px;
    animation: crt-modal-scanline-move 0.15s linear infinite;
    pointer-events: none;
    opacity: 0.4;
  }
  
  @keyframes crt-modal-scanline-move {
    0% { transform: translateY(0); }
    100% { transform: translateY(4px); }
  }
  
  .crt-modal-flicker {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    animation: crt-modal-flicker 0.2s infinite;
    pointer-events: none;
    opacity: 0.3;
  }
  
  @keyframes crt-modal-flicker {
    0% { opacity: 1; }
    50% { opacity: 0.995; }
    100% { opacity: 1; }
  }
  
  .crt-modal-glow {
    position: absolute;
    inset: -1px;
    background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.03) 0%, transparent 70%);
    filter: blur(2px);
    pointer-events: none;
    z-index: -1;
  }
  
  .crt-modal-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.15) 100%
    );
    pointer-events: none;
    opacity: 0.5;
  }
`

export default function InvestorLightbox({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'full'
}: InvestorLightboxProps) {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll and save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-y', scrollY.toString())
    } else {
      // Restore scroll position
      const scrollY = document.body.getAttribute('data-scroll-y')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
      }
      document.body.removeAttribute('data-scroll-y')
    }
    return () => {
      const scrollY = document.body.getAttribute('data-scroll-y')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
      }
      document.body.removeAttribute('data-scroll-y')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!mounted) return null

  const modalContent = (
    <>
      {/* Subtle CRT Effects Styles */}
      <style dangerouslySetInnerHTML={{__html: crtModalStyles}} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              overflow: 'hidden',
              zIndex: 99999,
              pointerEvents: 'auto'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose()
              }
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed bg-black/90 backdrop-blur-sm"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1
              }}
              onClick={onClose}
            />

            {/* Modal Content - 95% fullscreen, centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`relative bg-[#0A0A0A] border-0 shadow-2xl overflow-hidden flex flex-col`}
              style={{
                width: '100vw',
                height: '100vh',
                maxWidth: '100vw',
                maxHeight: '100vh',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                filter: 'contrast(1.02) brightness(0.99)',
                margin: 0,
                borderRadius: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle CRT Effects Overlay */}
              <div className="crt-modal-scanlines"></div>
              <div className="crt-modal-flicker"></div>
              <div className="crt-modal-glow"></div>
              <div className="crt-modal-vignette"></div>
              
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#10B981]/20 flex-shrink-0 relative z-10">
                  <h2 className="text-3xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
                <div className="p-8">
                  {children}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return createPortal(modalContent, document.body)
}

