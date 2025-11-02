'use client'

import React, { useState } from 'react'

interface CharacterNameEditorProps {
  characters: any[]
  onSaveChanges: (nameChanges: {[key: string]: string}) => void
  onCancel: () => void
}

export default function CharacterNameEditor({ characters, onSaveChanges, onCancel }: CharacterNameEditorProps) {
  const [editedNames, setEditedNames] = useState<{[key: string]: string}>({})

  const handleNameChange = (originalName: string, newName: string) => {
    setEditedNames(prev => ({
      ...prev,
      [originalName]: newName.trim()
    }))
  }

  const getDisplayName = (originalName: string) => {
    return editedNames[originalName] || originalName
  }

  const handleSave = () => {
    // Only save non-empty names that are different
    const validChanges: {[key: string]: string} = {}
    Object.keys(editedNames).forEach(oldName => {
      const newName = editedNames[oldName]
      if (newName && newName.trim() !== '' && newName !== oldName) {
        validChanges[oldName] = newName
      }
    })
    onSaveChanges(validChanges)
  }

  const hasChanges = Object.keys(editedNames).some(oldName => {
    const newName = editedNames[oldName]
    return newName && newName.trim() !== '' && newName !== oldName
  })

  return (
    <div className="bg-[#1e1e1e] border border-[#36393f] rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#e2c376]">Edit Character Names</h3>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
              hasChanges
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {characters.map((character: any, index: number) => (
          <div key={index} className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#e7e7e7]/70 mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={getDisplayName(character.name)}
                onChange={(e) => handleNameChange(character.name, e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#e2c376]/30 rounded px-3 py-2 text-[#e2c376] focus:outline-none focus:ring-2 focus:ring-[#e2c376]/50 focus:border-[#e2c376]"
                placeholder="Enter character name"
              />
            </div>
            <div className="text-sm text-[#e7e7e7]/60">
              <p><strong>Archetype:</strong> {character.archetype}</p>
              <p className="mt-1 line-clamp-2">{character.description?.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="mt-4 p-3 bg-[#e2c376]/10 border border-[#e2c376]/30 rounded-lg">
          <p className="text-sm text-[#e2c376]">
            <strong>Note:</strong> Name changes will be applied throughout your story bible and all generated episodes.
          </p>
        </div>
      )}
    </div>
  )
}
