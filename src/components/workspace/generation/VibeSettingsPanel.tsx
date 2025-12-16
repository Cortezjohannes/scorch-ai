'use client'

import React from 'react'

interface VibeSettingsPanelProps {
  vibeSettings: {
    tone: number
    pacing: number
    dialogueStyle: number
  }
  onSettingsChange: (settings: { tone: number; pacing: number; dialogueStyle: number }) => void
  theme: 'light' | 'dark'
}

export default function VibeSettingsPanel({
  vibeSettings,
  onSettingsChange,
  theme
}: VibeSettingsPanelProps) {
  const prefix = theme === 'dark' ? 'dark' : 'light'

  const getToneLabel = (value: number) => {
    if (value < 25) return 'Dark/Gritty'
    if (value < 75) return 'Balanced'
    return 'Light/Comedic'
  }

  const getPacingLabel = (value: number) => {
    if (value < 25) return 'Slow Burn'
    if (value < 75) return 'Steady'
    return 'High Octane'
  }

  const getDialogueLabel = (value: number) => {
    if (value < 25) return 'Sparse/Subtextual'
    if (value < 75) return 'Balanced'
    return 'Snappy/Expository'
  }

  const handleSliderChange = (key: 'tone' | 'pacing' | 'dialogueStyle', value: number) => {
    onSettingsChange({
      ...vibeSettings,
      [key]: value
    })
  }

  const applyPreset = (preset: 'dramatic' | 'balanced' | 'light') => {
    switch (preset) {
      case 'dramatic':
        onSettingsChange({ tone: 20, pacing: 30, dialogueStyle: 25 })
        break
      case 'balanced':
        onSettingsChange({ tone: 50, pacing: 50, dialogueStyle: 50 })
        break
      case 'light':
        onSettingsChange({ tone: 80, pacing: 70, dialogueStyle: 75 })
        break
    }
  }

  return (
    <div className={`p-4 rounded-lg ${prefix}-card ${prefix}-border ${prefix}-shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <label className={`text-sm font-semibold ${prefix}-text-primary`}>
          Vibe Settings
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => applyPreset('dramatic')}
            className={`px-2 py-1 text-xs rounded font-medium ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 ${prefix}-text-secondary transition-all duration-200 hover:scale-105`}
          >
            Dramatic
          </button>
          <button
            onClick={() => applyPreset('balanced')}
            className={`px-2 py-1 text-xs rounded font-medium ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 ${prefix}-text-secondary transition-all duration-200 hover:scale-105`}
          >
            Balanced
          </button>
          <button
            onClick={() => applyPreset('light')}
            className={`px-2 py-1 text-xs rounded font-medium ${prefix}-bg-secondary hover:${prefix}-bg-secondary/80 ${prefix}-text-secondary transition-all duration-200 hover:scale-105`}
          >
            Light
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Tone Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span className={`text-xs ${prefix}-text-secondary`}>Tone</span>
            <span className={`text-xs font-medium ${prefix}-text-accent`}>
              {getToneLabel(vibeSettings.tone)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={vibeSettings.tone}
              onChange={(e) => handleSliderChange('tone', parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${prefix === 'dark' ? 'bg-[#36393f]' : 'bg-gray-200'} accent-[#10B981] transition-all duration-200`}
              style={{
                background: prefix === 'dark' 
                  ? `linear-gradient(to right, #10B981 0%, #10B981 ${vibeSettings.tone}%, #36393f ${vibeSettings.tone}%, #36393f 100%)`
                  : `linear-gradient(to right, #C9A961 0%, #C9A961 ${vibeSettings.tone}%, #E2E8F0 ${vibeSettings.tone}%, #E2E8F0 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${prefix}-text-tertiary`}>Dark</span>
              <span className={`text-xs ${prefix}-text-tertiary`}>Light</span>
            </div>
          </div>
        </div>

        {/* Pacing Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span className={`text-xs ${prefix}-text-secondary`}>Pacing</span>
            <span className={`text-xs font-medium ${prefix}-text-accent`}>
              {getPacingLabel(vibeSettings.pacing)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={vibeSettings.pacing}
              onChange={(e) => handleSliderChange('pacing', parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${prefix === 'dark' ? 'bg-[#36393f]' : 'bg-gray-200'} accent-[#10B981] transition-all duration-200`}
              style={{
                background: prefix === 'dark'
                  ? `linear-gradient(to right, #10B981 0%, #10B981 ${vibeSettings.pacing}%, #36393f ${vibeSettings.pacing}%, #36393f 100%)`
                  : `linear-gradient(to right, #C9A961 0%, #C9A961 ${vibeSettings.pacing}%, #E2E8F0 ${vibeSettings.pacing}%, #E2E8F0 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${prefix}-text-tertiary`}>Slow Burn</span>
              <span className={`text-xs ${prefix}-text-tertiary`}>High Octane</span>
            </div>
          </div>
        </div>

        {/* Dialogue Style Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span className={`text-xs ${prefix}-text-secondary`}>Dialogue Style</span>
            <span className={`text-xs font-medium ${prefix}-text-accent`}>
              {getDialogueLabel(vibeSettings.dialogueStyle)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={vibeSettings.dialogueStyle}
              onChange={(e) => handleSliderChange('dialogueStyle', parseInt(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${prefix === 'dark' ? 'bg-[#36393f]' : 'bg-gray-200'} accent-[#10B981] transition-all duration-200`}
              style={{
                background: prefix === 'dark'
                  ? `linear-gradient(to right, #10B981 0%, #10B981 ${vibeSettings.dialogueStyle}%, #36393f ${vibeSettings.dialogueStyle}%, #36393f 100%)`
                  : `linear-gradient(to right, #C9A961 0%, #C9A961 ${vibeSettings.dialogueStyle}%, #E2E8F0 ${vibeSettings.dialogueStyle}%, #E2E8F0 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${prefix}-text-tertiary`}>Sparse</span>
              <span className={`text-xs ${prefix}-text-tertiary`}>Snappy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

