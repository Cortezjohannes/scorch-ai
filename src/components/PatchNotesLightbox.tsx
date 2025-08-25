'use client'

import { useState, useEffect, useRef } from 'react'

interface PatchNotesLightboxProps {
  isOpen: boolean
  onClose: () => void
}

export function PatchNotesLightbox({ isOpen, onClose }: PatchNotesLightboxProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Close the lightbox with escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [onClose])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      >
        <div 
          className="w-full max-w-xl max-h-[85vh] bg-[#1a1a1a] border border-[#e2c37650] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glowing header */}
          <div className="bg-gradient-to-r from-[#e2c37620] via-[#e2c37660] to-[#e2c37620] p-3 sm:p-4 border-b border-[#e2c37680]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-[#e2c376]">
                Reeled AI 
                <span className="ml-2 text-xs sm:text-sm px-1.5 py-0.5 bg-[#e2c376] text-[#121212] rounded-md font-bold inline-flex items-center justify-center">
                  v2
                </span>
              </h2>
              <button 
                onClick={onClose}
                className="text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div 
            ref={contentRef}
            className="p-4 sm:p-6 overflow-y-auto mobile-scrollbar"
            style={{ maxHeight: 'calc(85vh - 140px)' }}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-[#e2c376] mb-3 sm:mb-4">What's New in Version 2</h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start">
                <div className="mr-2 sm:mr-3 p-1 bg-[#e2c37620] rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#e2c376]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#e7e7e7] font-medium text-sm sm:text-base">Upgraded to GPT-4o</h4>
                  <p className="text-[#e7e7e7]/70 text-xs sm:text-sm">Enhanced AI capabilities with OpenAI's latest model for better content generation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 sm:mr-3 p-1 bg-[#e2c37620] rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#e2c376]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#e7e7e7] font-medium text-sm sm:text-base">Improved Image Generation</h4>
                  <p className="text-[#e7e7e7]/70 text-xs sm:text-sm">Direct integration with Azure DALL-E 3 for high-quality, context-aware image generation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 sm:mr-3 p-1 bg-[#e2c37620] rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#e2c376]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#e7e7e7] font-medium text-sm sm:text-base">Enhanced Script Generation</h4>
                  <p className="text-[#e7e7e7]/70 text-xs sm:text-sm">More detailed and cinematic scripts with improved dialogue and scene descriptions.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-[#e2c37640]">
            <div className="flex justify-between items-center">
              <p className="text-[#e7e7e7]/50 text-xs">Thank you for using Reeled AI</p>
              <button 
                onClick={onClose} 
                className="px-3 sm:px-4 py-1.5 bg-[#e2c376] text-[#121212] text-xs sm:text-sm font-medium rounded-md hover:bg-[#d4b76c] transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 