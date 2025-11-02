'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface EditableFieldProps {
  value: string | number
  onSave: (newValue: string | number) => Promise<void> | void
  type?: 'text' | 'number' | 'textarea' | 'select'
  options?: Array<{ value: string; label: string }> // For select type
  placeholder?: string
  className?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
}

export function EditableField({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = 'Click to edit...',
  className = '',
  disabled = false,
  multiline = false,
  rows = 3
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving field:', error)
      // Revert on error
      setEditValue(value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && type !== 'textarea') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (disabled) {
    return (
      <div className={`px-3 py-2 text-[#e7e7e7]/70 ${className}`}>
        {value || placeholder}
      </div>
    )
  }

  if (!isEditing) {
    return (
      <motion.div
        onClick={() => setIsEditing(true)}
        className={`px-3 py-2 rounded cursor-pointer hover:bg-[#2a2a2a]/50 transition-colors min-h-[40px] flex items-center ${className}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {value || <span className="text-[#e7e7e7]/40">{placeholder}</span>}
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue as string}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 bg-[#2a2a2a] border border-[#00FF99] rounded text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#00FF99]/50 ${className}`}
          disabled={isSaving}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : multiline || type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue as string}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 bg-[#2a2a2a] border border-[#00FF99] rounded text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#00FF99]/50 resize-none ${className}`}
          disabled={isSaving}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3 py-2 bg-[#2a2a2a] border border-[#00FF99] rounded text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#00FF99]/50 ${className}`}
          disabled={isSaving}
        />
      )}
      
      {isSaving && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-[#00FF99] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className="text-xs text-[#e7e7e7]/50 mt-1">
        Press Enter to save, Esc to cancel
      </div>
    </div>
  )
}


