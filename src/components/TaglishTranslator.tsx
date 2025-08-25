'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TaglishTranslatorProps {
  onTranslation?: (translatedScript: string) => void
  initialScript?: string
  className?: string
}

interface TranslationSettings {
  mixingIntensity: 'Light' | 'Moderate' | 'Heavy'
  regionalVariation: 'Manila' | 'Cebu' | 'Davao' | 'General'
  generationPreference: 'Gen Z' | 'Millennial' | 'Gen X' | 'Mixed'
  formalityLevel: 'Street' | 'Conversational' | 'Semi-Formal' | 'Professional'
  quickMode: boolean
}

export default function TaglishTranslator({ 
  onTranslation, 
  initialScript = '', 
  className = '' 
}: TaglishTranslatorProps) {
  const [script, setScript] = useState(initialScript)
  const [translatedScript, setTranslatedScript] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<TranslationSettings>({
    mixingIntensity: 'Moderate',
    regionalVariation: 'Manila',
    generationPreference: 'Mixed',
    formalityLevel: 'Conversational',
    quickMode: true
  })
  const [translationNotes, setTranslationNotes] = useState<any[]>([])
  const [qualityMetrics, setQualityMetrics] = useState<any>(null)

  const handleTranslate = async () => {
    if (!script.trim()) {
      alert('Please enter a script to translate')
      return
    }

    setIsTranslating(true)
    
    try {
      const response = await fetch('/api/translate/taglish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script,
          quickTranslation: settings.quickMode,
          settings: settings,
          context: {
            genre: 'Drama',
            setting: `Urban ${settings.regionalVariation}`,
            audience: 'General',
            tone: 'Casual'
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTranslatedScript(result.translatedScript)
        setTranslationNotes(result.translationNotes || [])
        setQualityMetrics(result.qualityMetrics || null)
        
        if (onTranslation) {
          onTranslation(result.translatedScript)
        }
      } else {
        throw new Error(result.error || 'Translation failed')
      }
    } catch (error: any) {
      console.error('Translation error:', error)
      alert(`Translation failed: ${error.message}`)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedScript)
    // You could add a toast notification here
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🌏 Taglish Translator
          </h2>
          <p className="text-gray-600 text-sm">
            Convert English scripts to authentic Filipino Taglish
          </p>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border"
          >
            <h3 className="font-semibold mb-4">Translation Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Mode Toggle */}
              <div className="col-span-full">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.quickMode}
                    onChange={(e) => setSettings({...settings, quickMode: e.target.checked})}
                    className="rounded"
                  />
                  <span className="font-medium">Quick Mode</span>
                  <span className="text-sm text-gray-600">
                    (Fast translation without character analysis)
                  </span>
                </label>
              </div>

              {/* Mixing Intensity */}
              <div>
                <label className="block text-sm font-medium mb-1">Code-Switching Intensity</label>
                <select
                  value={settings.mixingIntensity}
                  onChange={(e) => setSettings({...settings, mixingIntensity: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Light">Light (Mostly English)</option>
                  <option value="Moderate">Moderate (Balanced Mix)</option>
                  <option value="Heavy">Heavy (More Tagalog)</option>
                </select>
              </div>

              {/* Regional Variation */}
              <div>
                <label className="block text-sm font-medium mb-1">Regional Variation</label>
                <select
                  value={settings.regionalVariation}
                  onChange={(e) => setSettings({...settings, regionalVariation: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Manila">Manila</option>
                  <option value="Cebu">Cebu</option>
                  <option value="Davao">Davao</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Generation Preference */}
              <div>
                <label className="block text-sm font-medium mb-1">Generation Style</label>
                <select
                  value={settings.generationPreference}
                  onChange={(e) => setSettings({...settings, generationPreference: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Gen Z">Gen Z</option>
                  <option value="Millennial">Millennial</option>
                  <option value="Gen X">Gen X</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Formality Level */}
              <div>
                <label className="block text-sm font-medium mb-1">Formality Level</label>
                <select
                  value={settings.formalityLevel}
                  onChange={(e) => setSettings({...settings, formalityLevel: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="Street">Street</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Semi-Formal">Semi-Formal</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">English Script</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your English script here..."
          className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Translate Button */}
      <div className="mb-6">
        <button
          onClick={handleTranslate}
          disabled={isTranslating || !script.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isTranslating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Translating to Taglish...
            </div>
          ) : (
            '🇵🇭 Translate to Taglish'
          )}
        </button>
      </div>

      {/* Output Section */}
      {translatedScript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Taglish Translation</label>
            <button
              onClick={handleCopyTranslation}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              📋 Copy
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border min-h-40 whitespace-pre-wrap font-mono text-sm">
            {translatedScript}
          </div>

          {/* Quality Metrics */}
          {qualityMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{qualityMetrics.authenticityScore}</div>
                <div className="text-xs text-gray-600">Authenticity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{qualityMetrics.codewitchingBalance}</div>
                <div className="text-xs text-gray-600">Balance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{qualityMetrics.characterConsistency}</div>
                <div className="text-xs text-gray-600">Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{qualityMetrics.culturalAccuracy}</div>
                <div className="text-xs text-gray-600">Cultural</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{qualityMetrics.overallQuality}</div>
                <div className="text-xs text-gray-600">Overall</div>
              </div>
            </div>
          )}

          {/* Translation Notes */}
          {translationNotes.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium mb-2">Translation Notes</h4>
              <div className="space-y-2">
                {translationNotes.map((note, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">"{note.originalPhrase}"</span>
                    {' → '}
                    <span className="font-medium text-blue-600">"{note.translatedPhrase}"</span>
                    <div className="text-gray-600 text-xs mt-1">{note.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
 