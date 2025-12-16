'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { EditableField } from './EditableField'
import { StatusBadge, StatusSelector } from './StatusBadge'
import { CollaborativeNotes } from './CollaborativeNotes'
import type { StatusType } from '@/types/preproduction'

export interface TableColumn<T = any> {
  key: string
  label: string
  width?: string // e.g., '200px', '20%'
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode
  editable?: boolean
  type?: 'text' | 'number' | 'select' | 'status' | 'custom'
  options?: Array<{ value: string; label: string }> // For select type
  statusOptions?: Array<StatusType | string> // For status type
  onEdit?: (rowIndex: number, newValue: any) => Promise<void>
}

export interface TableViewProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  onRowClick?: (row: T, rowIndex: number) => void
  keyField?: string // Field to use as unique key (default: 'id')
  showSearch?: boolean
  showFilters?: boolean
  showPagination?: boolean
  pageSize?: number
  emptyMessage?: string
  className?: string
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  enableComments?: boolean
  onAddComment?: (rowIndex: number, comment: string) => Promise<void>
  currentUserId?: string
  currentUserName?: string
}

export function TableView<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  keyField = 'id',
  showSearch = true,
  showFilters = false,
  showPagination = true,
  pageSize = 10,
  emptyMessage = 'No data available',
  className = '',
  striped = true,
  hoverable = true,
  compact = false,
  enableComments = false,
  onAddComment,
  currentUserId = '',
  currentUserName = ''
}: TableViewProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [statusSelectorState, setStatusSelectorState] = useState<{
    rowIndex: number
    columnKey: string
  } | null>(null)

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal === bVal) return 0
        
        const comparison = aVal < bVal ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, filters, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = showPagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleFilter = (columnKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnKey]: value }))
    setCurrentPage(1)
  }

  const renderCell = (column: TableColumn<T>, row: T, rowIndex: number) => {
    const value = row[column.key]

    // Custom render function
    if (column.render) {
      return column.render(value, row, rowIndex)
    }

    // Status badge
    if (column.type === 'status') {
      return (
        <div className="relative">
          <StatusBadge
            status={value}
            onClick={
              column.editable
                ? () => setStatusSelectorState({ rowIndex, columnKey: column.key })
                : undefined
            }
            editable={column.editable}
          />
          {statusSelectorState?.rowIndex === rowIndex &&
            statusSelectorState?.columnKey === column.key && (
              <StatusSelector
                currentStatus={value}
                availableStatuses={column.statusOptions || []}
                onSelect={async (newStatus) => {
                  if (column.onEdit) {
                    await column.onEdit(rowIndex, newStatus)
                  }
                  setStatusSelectorState(null)
                }}
                onClose={() => setStatusSelectorState(null)}
              />
            )}
        </div>
      )
    }

    // Editable field
    if (column.editable && column.onEdit) {
      return (
        <EditableField
          value={value}
          type={column.type || 'text'}
          options={column.options}
          onSave={async (newValue) => {
            if (column.onEdit) {
              await column.onEdit(rowIndex, newValue)
            }
          }}
        />
      )
    }

    // Default rendering
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? '✓' : '✗'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value)
    
    return String(value)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex items-center gap-4">
          {showSearch && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] placeholder-[#e7e7e7]/40 focus:outline-none focus:border-[#10B981]"
            />
          )}
          
          {showFilters && (
            <div className="flex items-center gap-2">
              {columns.filter(col => col.filterable).map(col => (
                <input
                  key={col.key}
                  type="text"
                  value={filters[col.key] || ''}
                  onChange={(e) => handleFilter(col.key, e.target.value)}
                  placeholder={`Filter ${col.label}...`}
                  className="px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded text-[#e7e7e7] text-sm placeholder-[#e7e7e7]/40 focus:outline-none focus:border-[#10B981]"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#36393f]">
        <table className="w-full">
          <thead className="bg-[#1a1a1a]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 ${compact ? 'py-2' : 'py-3'} text-left text-sm font-medium text-[#e7e7e7] border-b border-[#36393f] ${
                    column.sortable ? 'cursor-pointer hover:bg-[#2a2a2a] transition-colors' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="text-[#e7e7e7]/40">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {enableComments && (
                <th className={`px-4 ${compact ? 'py-2' : 'py-3'} text-left text-sm font-medium text-[#e7e7e7] border-b border-[#36393f] w-24`}>
                  Notes
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableComments ? 1 : 0)}
                  className="px-4 py-8 text-center text-[#e7e7e7]/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={row[keyField] || rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className={`
                    ${striped && rowIndex % 2 === 1 ? 'bg-[#1a1a1a]/30' : ''}
                    ${hoverable ? 'hover:bg-[#2a2a2a]/50 cursor-pointer' : ''}
                    transition-colors
                  `}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 ${compact ? 'py-2' : 'py-3'} text-sm text-[#e7e7e7] border-b border-[#36393f]/30`}
                    >
                      {renderCell(column, row, rowIndex)}
                    </td>
                  ))}
                  {enableComments && onAddComment && (
                    <td className={`px-4 ${compact ? 'py-2' : 'py-3'} border-b border-[#36393f]/30`}>
                      <CollaborativeNotes
                        comments={row.comments || []}
                        onAddComment={async (content) => {
                          await onAddComment(rowIndex, content)
                        }}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                      />
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#e7e7e7]/50">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#2a2a2a] text-[#e7e7e7] rounded hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-[#e7e7e7]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-[#2a2a2a] text-[#e7e7e7] rounded hover:bg-[#36393f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


