'use client'

import React, { useState, useRef } from 'react'
import type { PreProductionData, Permit } from '@/types/preproduction'
import { EditableField } from '../shared/EditableField'
import { StatusBadge } from '../shared/StatusBadge'
import { TableView } from '../shared/TableView'

interface PermitsTabProps {
  preProductionData: PreProductionData
  onUpdate: (tabName: string, tabData: any) => Promise<void>
  currentUserId: string
  currentUserName: string
}

export function PermitsTab({
  preProductionData,
  onUpdate,
  currentUserId,
  currentUserName
}: PermitsTabProps) {
  const [selectedType, setSelectedType] = useState<'all' | string>('all')
  const [uploadingPermitId, setUploadingPermitId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  
  const permitsData = preProductionData.permits || {
    permits: [],
    checklist: [],
    lastUpdated: Date.now()
  }

  const handlePermitUpdate = async (permitId: string, updates: Partial<Permit>) => {
    const updatedPermits = permitsData.permits.map(permit =>
      permit.id === permitId ? { ...permit, ...updates } : permit
    )
    
    await onUpdate('permits', {
      ...permitsData,
      permits: updatedPermits,
      lastUpdated: Date.now()
    })
  }

  const handleAddPermit = async () => {
    const newPermit: Permit = {
      id: `permit_${Date.now()}`,
      name: 'New Permit',
      type: 'filming',
      location: '',
      authority: '',
      applicationDate: '',
      expiryDate: '',
      status: 'not-applied',
      cost: 0,
      contactPerson: '',
      contactPhone: '',
      documentUrl: '',
      notes: '',
      comments: []
    }
    
    await onUpdate('permits', {
      ...permitsData,
      permits: [...permitsData.permits, newPermit],
      lastUpdated: Date.now()
    })
  }

  const handleChecklistToggle = async (index: number) => {
    const updatedChecklist = [...permitsData.checklist]
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed: !updatedChecklist[index].completed
    }
    
    await onUpdate('permits', {
      ...permitsData,
      checklist: updatedChecklist,
      lastUpdated: Date.now()
    })
  }

  const handleAddComment = async (permitId: string, content: string) => {
    const permit = permitsData.permits.find(p => p.id === permitId)
    if (!permit) return

    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      content,
      timestamp: Date.now()
    }

    const updatedPermits = permitsData.permits.map(p =>
      p.id === permitId
        ? { ...p, comments: [...(p.comments || []), newComment] }
        : p
    )

    await onUpdate('permits', {
      ...permitsData,
      permits: updatedPermits,
      lastUpdated: Date.now()
    })
  }

  const handleFileSelect = async (permitId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPermitId(permitId)
    setUploadProgress(prev => ({ ...prev, [permitId]: 0 }))

    // Mock upload progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 10
      if (progress <= 100) {
        setUploadProgress(prev => ({ ...prev, [permitId]: progress }))
      } else {
        clearInterval(progressInterval)
        
        // Simulate successful upload - create a mock URL
        const mockFileUrl = URL.createObjectURL(file)
        const fileName = file.name
        
        // Update permit with file URL
        handlePermitUpdate(permitId, { 
          documentUrl: mockFileUrl,
          documentFileName: fileName,
          documentFileSize: file.size,
          documentUploadDate: new Date().toISOString()
        })
        
        setUploadingPermitId(null)
        setUploadProgress(prev => {
          const updated = { ...prev }
          delete updated[permitId]
          return updated
        })
      }
    }, 200)
  }

  const handleFileRemove = async (permitId: string) => {
    const permit = permitsData.permits.find(p => p.id === permitId)
    if (!permit) return

    // Revoke object URL if it exists
    if (permit.documentUrl && permit.documentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(permit.documentUrl)
    }

    await handlePermitUpdate(permitId, {
      documentUrl: '',
      documentFileName: undefined,
      documentFileSize: undefined,
      documentUploadDate: undefined
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Filter permits
  const filteredPermits = selectedType === 'all'
    ? permitsData.permits
    : permitsData.permits.filter(p => p.type === selectedType)

  // Stats
  const totalPermits = permitsData.permits.length
  const approvedCount = permitsData.permits.filter(p => p.status === 'approved').length
  const pendingCount = permitsData.permits.filter(p => p.status === 'pending').length
  const totalCost = permitsData.permits.reduce((sum, p) => sum + (p.cost || 0), 0)
  const checklistProgress = permitsData.checklist.length > 0
    ? Math.round((permitsData.checklist.filter(item => item.completed).length / permitsData.checklist.length) * 100)
    : 0

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Permit Name',
      render: (permit: Permit) => (
        <EditableField
          value={permit.name}
          onSave={(value) => handlePermitUpdate(permit.id, { name: value })}
          className="font-medium text-[#e7e7e7]"
        />
      ),
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      render: (permit: Permit) => (
        <select
          value={permit.type}
          onChange={(e) => handlePermitUpdate(permit.id, { type: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="filming">Filming</option>
          <option value="parking">Parking</option>
          <option value="noise">Noise</option>
          <option value="drone">Drone</option>
          <option value="other">Other</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      render: (permit: Permit) => (
        <EditableField
          value={permit.location}
          onSave={(value) => handlePermitUpdate(permit.id, { location: value })}
          placeholder="Location..."
          className="text-sm text-[#e7e7e7]/70"
        />
      )
    },
    {
      key: 'authority',
      label: 'Authority',
      render: (permit: Permit) => (
        <EditableField
          value={permit.authority}
          onSave={(value) => handlePermitUpdate(permit.id, { authority: value })}
          placeholder="Issuing authority..."
          className="text-sm text-[#e7e7e7]/70"
        />
      )
    },
    {
      key: 'applicationDate',
      label: 'Applied',
      render: (permit: Permit) => (
        <EditableField
          value={permit.applicationDate}
          onSave={(value) => handlePermitUpdate(permit.id, { applicationDate: value })}
          placeholder="Date..."
          className="text-sm text-[#e7e7e7]/70"
        />
      ),
      sortable: true
    },
    {
      key: 'expiryDate',
      label: 'Expires',
      render: (permit: Permit) => (
        <EditableField
          value={permit.expiryDate}
          onSave={(value) => handlePermitUpdate(permit.id, { expiryDate: value })}
          placeholder="Date..."
          className="text-sm text-[#e7e7e7]/70"
        />
      ),
      sortable: true
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (permit: Permit) => (
        <div className="flex items-center gap-1">
          <span className="text-[#e7e7e7]/50">$</span>
          <EditableField
            value={permit.cost?.toString() || '0'}
            onSave={(value) => handlePermitUpdate(permit.id, { cost: parseFloat(value) || 0 })}
            type="number"
            className="text-[#00FF99] font-medium"
          />
        </div>
      ),
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (permit: Permit) => (
        <select
          value={permit.status}
          onChange={(e) => handlePermitUpdate(permit.id, { status: e.target.value as any })}
          className="bg-[#1a1a1a] border border-[#36393f] rounded px-2 py-1 text-[#e7e7e7] text-sm"
        >
          <option value="not-applied">Not Applied</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
      ),
      sortable: true
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (permit: Permit) => {
        const isUploading = uploadingPermitId === permit.id
        const progress = uploadProgress[permit.id] || 0
        const hasDocument = permit.documentUrl || (permit as any).documentFileName

        return (
          <div className="flex items-center gap-2">
            {hasDocument ? (
              <div className="flex items-center gap-2">
                <a
                  href={permit.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF99] hover:text-[#00CC7A] text-sm flex items-center gap-1"
                >
                  <span>📄</span>
                  <span className="max-w-[100px] truncate">
                    {(permit as any).documentFileName || 'Document'}
                  </span>
                </a>
                {(permit as any).documentFileSize && (
                  <span className="text-xs text-[#e7e7e7]/50">
                    ({formatFileSize((permit as any).documentFileSize)})
                  </span>
                )}
                <button
                  onClick={() => handleFileRemove(permit.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00FF99] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#e7e7e7]/70">{progress}%</span>
                  </div>
                ) : (
                  <>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[permit.id] = el
                      }}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={(e) => handleFileSelect(permit.id, e)}
                    />
                    <button
                      onClick={() => fileInputRefs.current[permit.id]?.click()}
                      className="text-[#00FF99] hover:text-[#00CC7A] text-sm flex items-center gap-1"
                      title="Upload document"
                    >
                      <span>📤</span>
                      <span>Upload</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Permits</div>
          <div className="text-2xl font-bold text-[#00FF99]">{totalPermits}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-[#00FF99]">${totalCost.toLocaleString()}</div>
        </div>
        
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#36393f]">
          <div className="text-sm text-[#e7e7e7]/70 mb-1">Checklist</div>
          <div className="text-2xl font-bold text-[#e7e7e7]">{checklistProgress}%</div>
        </div>
      </div>

      {/* Pre-Production Checklist */}
      {permitsData.checklist && permitsData.checklist.length > 0 && (
        <div className="bg-[#2a2a2a] rounded-lg border border-[#36393f] p-4">
          <h3 className="text-lg font-bold text-[#e7e7e7] mb-4">Legal & Insurance Checklist</h3>
          <div className="space-y-2">
            {permitsData.checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-[#1a1a1a] transition-colors">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleChecklistToggle(index)}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className={`text-sm ${item.completed ? 'text-[#e7e7e7]/50 line-through' : 'text-[#e7e7e7]'}`}>
                    {item.item}
                  </div>
                  {item.description && (
                    <div className="text-xs text-[#e7e7e7]/50 mt-1">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] text-sm"
        >
          <option value="all">All Types</option>
          <option value="filming">Filming Only</option>
          <option value="parking">Parking Only</option>
          <option value="noise">Noise Only</option>
          <option value="drone">Drone Only</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={handleAddPermit}
          className="px-4 py-2 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
        >
          + Add Permit
        </button>
      </div>

      {/* Permits Table */}
      {permitsData.permits.length === 0 ? (
        <div className="text-center py-16 bg-[#2a2a2a] rounded-lg border border-[#36393f]">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-[#e7e7e7] mb-2">No Permits Added</h3>
          <p className="text-[#e7e7e7]/70 mb-6">
            Track filming permits, insurance, and legal documents
          </p>
          <button
            onClick={handleAddPermit}
            className="px-6 py-3 bg-[#00FF99] text-black rounded-lg font-medium hover:bg-[#00CC7A] transition-colors"
          >
            + Add First Permit
          </button>
        </div>
      ) : (
        <TableView
          columns={columns}
          data={filteredPermits}
          keyField="id"
          showSearch={true}
          showPagination={true}
          pageSize={20}
          striped={true}
          hoverable={true}
          enableComments={true}
          onAddComment={handleAddComment}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          emptyMessage={`No ${selectedType === 'all' ? 'permits' : selectedType + ' permits'} found`}
        />
      )}
    </div>
  )
}
