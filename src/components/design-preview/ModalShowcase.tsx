'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalShowcaseProps {
  theme: 'light' | 'dark'
}

export default function ModalShowcase({ theme }: ModalShowcaseProps) {
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  const closeModal = () => setOpenModal(null)

  // Handle ESC key to close modal
  useEffect(() => {
    if (!openModal) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [openModal])

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Modal Examples
        </h2>
        <p className="text-base mb-6" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
          Different modal styles and use cases
        </p>
      </div>

      {/* Modal Triggers */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Modal Types
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setOpenModal('confirm')}
            className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-primary`}
          >
            Open Confirm Modal
          </button>
          <button
            onClick={() => setOpenModal('info')}
            className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-secondary`}
          >
            Open Info Modal
          </button>
          <button
            onClick={() => setOpenModal('form')}
            className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-gold`}
          >
            Open Form Modal
          </button>
          <button
            onClick={() => setOpenModal('large')}
            className={`px-6 py-3 rounded-lg font-medium ${prefix}-btn-ghost`}
          >
            Open Large Modal
          </button>
        </div>
      </section>

      {/* Confirm Modal */}
      {mounted && openModal === 'confirm' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className={`max-w-md w-full rounded-lg p-6 ${prefix}-card`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Confirm Action
            </h3>
            <p className="text-sm mb-6" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
              Are you sure you want to perform this action? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-ghost`}
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Info Modal */}
      {mounted && openModal === 'info' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className={`max-w-md w-full rounded-lg p-6 ${prefix}-card-accent`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                  Information
                </h3>
                <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
                  This is an informational modal with an icon and accent background.
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Form Modal */}
      {mounted && openModal === 'form' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className={`max-w-lg w-full rounded-lg p-6 ${prefix}-card`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
              Create New Project
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className={`w-full px-4 py-3 rounded-lg ${prefix}-input`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg resize-none ${prefix}-input`}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-ghost`}
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}
              >
                Create
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Large Modal */}
      {mounted && openModal === 'large' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className={`max-w-4xl w-full rounded-lg p-6 ${prefix}-card max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                Large Modal
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={isDark ? { backgroundColor: '#2A2A2A', color: '#FFFFFF' } : { backgroundColor: '#FAFAFA', color: '#1A1A1A' }}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
                This is a large modal that can contain more content. It has a scrollable area and can be used for detailed views or complex forms.
              </p>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${prefix}-card-secondary p-4 rounded-lg`}>
                <div>
                  <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                    Feature 1
                  </h4>
                  <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
                    Description of feature 1
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
                    Feature 2
                  </h4>
                  <p className="text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
                    Description of feature 2
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-ghost`}
              >
                Close
              </button>
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Guidelines */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={isDark ? { color: '#FFFFFF' } : { color: '#1A1A1A' }}>
          Modal Guidelines
        </h3>
        <div className={`p-6 rounded-lg ${prefix}-card-secondary`}>
          <ul className="space-y-2 text-sm" style={isDark ? { color: '#E7E7E7' } : { color: '#666666' }}>
            <li>• <strong>Overlay:</strong> Semi-transparent dark background (rgba(0, 0, 0, 0.5))</li>
            <li>• <strong>Backdrop:</strong> Click outside to close (optional)</li>
            <li>• <strong>Size:</strong> Responsive with max-width constraints</li>
            <li>• <strong>Scroll:</strong> Large modals should be scrollable</li>
            <li>• <strong>Actions:</strong> Primary action on right, secondary on left</li>
            <li>• <strong>Close:</strong> X button in top-right or Cancel button</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

