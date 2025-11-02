'use client'

import React, { useState } from 'react'
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
