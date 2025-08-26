'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface WizardData {
  genre?: string
  synopsis: string
  theme: string
  mood?: string
  target_audience?: string
}

interface StoryCreationWizardProps {
  onClose: () => void
  onComplete: (data: WizardData) => void
}

interface StepProps {
  data: WizardData
  onComplete: (stepData: Partial<WizardData>) => void
  onBack?: () => void
}

export function StoryCreationWizard({ onClose, onComplete }: StoryCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    synopsis: '',
    theme: ''
  })

  const steps = [
    { id: 'genre', title: 'Choose Your Genre', component: GenreSelection },
    { id: 'synopsis', title: 'Tell Your Story', component: SynopsisInput },
    { id: 'theme', title: 'Define Your Theme', component: ThemeInput },
    { id: 'mood', title: 'Set the Mood', component: MoodSelection }
  ]

  const handleStepComplete = (stepData: Partial<WizardData>) => {
    const newData = { ...wizardData, ...stepData }
    setWizardData(newData)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Ensure we have the required fields before completing
      if (newData.synopsis.trim() && newData.theme.trim()) {
        onComplete(newData)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        className="bg-black/90 border border-ember-gold/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto mobile-scrollbar"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h2 font-bold text-high-contrast elegant-fire">
              {steps[currentStep].title}
            </h2>
            <p className="text-body text-medium-contrast">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="touch-target-comfortable text-white/60 hover:text-white transition-colors text-2xl"
            aria-label="Close wizard"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-flame-red to-ember-gold h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const StepComponent = steps[currentStep].component
              return (
                <StepComponent
                  data={wizardData}
                  onComplete={handleStepComplete}
                  onBack={currentStep > 0 ? handleBack : undefined}
                />
              )
            })()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// Genre Selection Step
function GenreSelection({ data, onComplete, onBack }: StepProps) {
  const genres = [
    { id: 'drama', name: 'Drama', icon: '🎭', description: 'Deep, emotional storytelling' },
    { id: 'comedy', name: 'Comedy', icon: '😂', description: 'Humor and entertainment' },
    { id: 'thriller', name: 'Thriller', icon: '🔥', description: 'Suspense and tension' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀', description: 'Future and technology' },
    { id: 'fantasy', name: 'Fantasy', icon: '🗡️', description: 'Magic and adventure' },
    { id: 'horror', name: 'Horror', icon: '👻', description: 'Fear and supernatural' }
  ]

  return (
    <div>
      <p className="text-body text-medium-contrast mb-6">
        Choose the primary genre for your story. This helps our AI understand the tone and style you're aiming for.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {genres.map((genre) => (
          <motion.div
            key={genre.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              variant="action"
              className="cursor-pointer text-center touch-target-comfortable transition-all duration-300 hover:border-ember-gold/50"
              onClick={() => onComplete({ genre: genre.id })}
            >
              <div className="text-3xl mb-2">{genre.icon}</div>
              <h3 className="font-bold text-high-contrast mb-1 elegant-fire">{genre.name}</h3>
              <p className="text-caption text-medium-contrast">{genre.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
        >
          ← Back
        </button>
      )}
    </div>
  )
}

// Synopsis Input Step
function SynopsisInput({ data, onComplete, onBack }: StepProps) {
  const [synopsis, setSynopsis] = useState(data.synopsis || '')
  const characterCount = synopsis.length

  return (
    <div>
      <p className="text-body text-medium-contrast mb-6">
        Describe your story idea. Don't worry about perfection - our AI will help develop it further.
      </p>
      
      <div className="relative">
        <textarea
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="A detective investigates mysterious disappearances in a small coastal town, uncovering secrets that challenge everything they believed about justice..."
          className="input-field h-32 mb-4 resize-none"
          maxLength={500}
        />
        
        <div className="text-right text-caption text-medium-contrast mb-6">
          {characterCount}/500 characters
        </div>
      </div>

      {/* Example prompts */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <p className="text-caption text-ember-gold mb-2">💡 Need inspiration? Try these examples:</p>
        <div className="space-y-1 text-caption text-medium-contrast">
          <p>"A rogue AI developer discovers their company is manipulating elections worldwide..."</p>
          <p>"In a world where memories can be traded, a memory thief seeks their own past..."</p>
          <p>"A small-town chef inherits a mysterious restaurant that serves impossible dishes..."</p>
        </div>
      </div>

      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={() => onComplete({ synopsis })}
          disabled={synopsis.length < 20}
          className="burn-button disabled:opacity-50 disabled:cursor-not-allowed touch-target-comfortable"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// Theme Input Step
function ThemeInput({ data, onComplete, onBack }: StepProps) {
  const [theme, setTheme] = useState(data.theme || '')

  const suggestedThemes = [
    'Redemption and second chances',
    'The cost of ambition',
    'Family bonds vs. duty',
    'Truth vs. comfortable lies',
    'Power corrupts absolutely',
    'Love conquers all'
  ]

  return (
    <div>
      <p className="text-body text-medium-contrast mb-6">
        What's the central theme or message of your story? This gives your narrative emotional depth.
      </p>
      
      <textarea
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        placeholder="The importance of facing uncomfortable truths to find real justice..."
        className="input-field h-24 mb-4 resize-none"
        maxLength={200}
      />
      
      <div className="mb-6">
        <p className="text-caption text-medium-contrast mb-3">Or choose from popular themes:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedThemes.map((suggestedTheme) => (
            <button
              key={suggestedTheme}
              onClick={() => setTheme(suggestedTheme)}
              className="px-3 py-1 text-caption bg-white/10 hover:bg-ember-gold/20 text-medium-contrast hover:text-ember-gold rounded-full transition-colors touch-target"
            >
              {suggestedTheme}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={() => onComplete({ theme })}
          disabled={theme.length < 10}
          className="burn-button disabled:opacity-50 disabled:cursor-not-allowed touch-target-comfortable"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// Mood Selection Step
function MoodSelection({ data, onComplete, onBack }: StepProps) {
  const moods = [
    { id: 'dark', name: 'Dark & Gritty', color: 'from-gray-800 to-gray-900', description: 'Serious, intense atmosphere' },
    { id: 'bright', name: 'Bright & Optimistic', color: 'from-yellow-400 to-orange-500', description: 'Uplifting, hopeful tone' },
    { id: 'mysterious', name: 'Mysterious & Suspenseful', color: 'from-purple-800 to-blue-900', description: 'Intriguing, enigmatic feel' },
    { id: 'romantic', name: 'Romantic & Emotional', color: 'from-pink-500 to-red-500', description: 'Heart-warming, passionate' },
    { id: 'action', name: 'Fast-Paced & Intense', color: 'from-red-600 to-orange-600', description: 'High-energy, thrilling' },
    { id: 'contemplative', name: 'Thoughtful & Reflective', color: 'from-blue-600 to-indigo-700', description: 'Deep, philosophical' }
  ]

  return (
    <div>
      <p className="text-body text-medium-contrast mb-6">
        Finally, what's the overall mood and atmosphere you want to create?
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {moods.map((mood) => (
          <motion.div
            key={mood.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              variant="action"
              className={`cursor-pointer text-center bg-gradient-to-br ${mood.color} border-white/20 hover:border-white/40 transition-all duration-300 touch-target-comfortable`}
              onClick={() => onComplete({ mood: mood.id })}
            >
              <h3 className="font-bold text-white mb-1 elegant-fire">{mood.name}</h3>
              <p className="text-caption text-white/80">{mood.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ← Back
          </button>
        )}
        
        <button
          onClick={() => onComplete({ mood: 'neutral' })}
          className="burn-button touch-target-comfortable"
        >
          🔥 Create My Story
        </button>
      </div>
    </div>
  )
}
