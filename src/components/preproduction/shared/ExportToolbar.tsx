'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ExportToolbarProps {
  onExportPDF?: () => void
  onExportCSV?: () => void
  onPrint?: () => void
  onCopyJSON?: () => void
  disabled?: boolean
  customButtons?: Array<{
    label: string
    icon: string
    onClick: () => void
  }>
}

export function ExportToolbar({
  onExportPDF,
  onExportCSV,
  onPrint,
  onCopyJSON,
  disabled = false,
  customButtons = []
}: ExportToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-6 p-3 bg-[#1a1a1a]/50 border border-[#36393f]/50 rounded-lg">
      <span className="text-sm text-[#e7e7e7]/50 font-medium mr-2">Export:</span>
      
      {onExportPDF && (
        <ExportButton
          icon="📄"
          label="PDF"
          onClick={onExportPDF}
          disabled={disabled}
        />
      )}
      
      {onExportCSV && (
        <ExportButton
          icon="📊"
          label="CSV"
          onClick={onExportCSV}
          disabled={disabled}
        />
      )}
      
      {onPrint && (
        <ExportButton
          icon="🖨️"
          label="Print"
          onClick={onPrint}
          disabled={disabled}
        />
      )}
      
      {onCopyJSON && (
        <ExportButton
          icon="📋"
          label="Copy JSON"
          onClick={onCopyJSON}
          disabled={disabled}
        />
      )}
      
      {customButtons.map((button, index) => (
        <ExportButton
          key={index}
          icon={button.icon}
          label={button.label}
          onClick={button.onClick}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

interface ExportButtonProps {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
}

function ExportButton({ icon, label, onClick, disabled }: ExportButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </motion.button>
  )
}

// Utility function to convert table data to CSV
export function convertToCSV(data: any[], headers: string[]): string {
  const rows = [headers]
  
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    })
    rows.push(row)
  })
  
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

// Utility function to download CSV
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Utility function to copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}


