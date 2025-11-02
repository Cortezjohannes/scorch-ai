'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Questionnaire, QuestionnaireQuestion } from '@/services/ai-generators/questionnaire-generator'

interface QuestionnaireModalProps {
  questionnaire: Questionnaire | null
  isOpen: boolean
  onClose: () => void
  onComplete: (answers: Record<string, any>) => void
  existingAnswers?: Record<string, any>
}

export function QuestionnaireModal({
  questionnaire,
  isOpen,
  onClose,
  onComplete,
  existingAnswers = {}
}: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(existingAnswers)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  // Reset answers when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      setAnswers(existingAnswers || {})
      setCurrentCategoryIndex(0)
    }
  }, [questionnaire, existingAnswers])

  if (!questionnaire) return null

  const totalQuestions = questionnaire.categories.reduce((sum, cat) => sum + cat.questions.length, 0)
  const answeredQuestions = Object.keys(answers).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const currentCategory = questionnaire.categories[currentCategoryIndex]
  const isFirstCategory = currentCategoryIndex === 0
  const isLastCategory = currentCategoryIndex === questionnaire.categories.length - 1

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (!isLastCategory) {
      setCurrentCategoryIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstCategory) {
      setCurrentCategoryIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    onComplete(answers)
    onClose()
  }

  const handleSkip = () => {
    onComplete({}) // Empty answers
    onClose()
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'cast-capabilities': 'Cast Capabilities',
      'production-crew': 'Production Crew',
      'existing-equipment': 'Existing Equipment',
      'budget-constraints': 'Budget Constraints',
      'materials-access': 'Materials Access',
      'logistics': 'Logistics'
    }
    return labels[category] || category
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a1a] rounded-lg border border-[#36393f] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#36393f]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#e7e7e7]">
                  Pre-Production Questionnaire
                </h2>
                <button
                  onClick={onClose}
                  className="text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#e7e7e7]/70 mb-4">
                Answer these contextual questions to help generate accurate props/wardrobe and equipment breakdowns.
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#e7e7e7]/60">
                  <span>Progress</span>
                  <span>{answeredQuestions} / {totalQuestions} questions</span>
                </div>
                <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                  <motion.div
                    className="bg-[#00FF99] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {questionnaire.categories.map((cat, idx) => (
                  <button
                    key={cat.category}
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      idx === currentCategoryIndex
                        ? 'bg-[#00FF99] text-black'
                        : 'bg-[#2a2a2a] text-[#e7e7e7]/70 hover:bg-[#36393f]'
                    }`}
                  >
                    {getCategoryLabel(cat.category)}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#e7e7e7]">
                  {getCategoryLabel(currentCategory.category)}
                </h3>

                {currentCategory.questions.map((question) => (
                  <QuestionInput
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => handleAnswer(question.id, value)}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#36393f] flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-[#e7e7e7]/70 hover:text-[#e7e7e7] transition-colors text-sm"
              >
                Skip for now
              </button>

              <div className="flex items-center gap-3">
                {!isFirstCategory && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors text-sm font-medium"
                  >
                    ← Previous
                  </button>
                )}
                
                {!isLastCategory ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-[#00FF99] text-black rounded-lg hover:bg-[#00CC7A] transition-colors text-sm font-medium"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-4 py-2 bg-[#00FF99] text-black rounded-lg hover:bg-[#00CC7A] transition-colors text-sm font-medium"
                  >
                    Complete ({answeredQuestions}/{totalQuestions})
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function QuestionInput({
  question,
  value,
  onChange
}: {
  question: QuestionnaireQuestion
  value: any
  onChange: (value: any) => void
}) {
  const renderInput = () => {
    switch (question.type) {
      case 'yes-no':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => onChange(true)}
                className="w-4 h-4 rounded border-[#36393f] bg-[#2a2a2a] text-[#00FF99] focus:ring-[#00FF99]"
              />
              <span className="text-[#e7e7e7]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => onChange(false)}
                className="w-4 h-4 rounded border-[#36393f] bg-[#2a2a2a] text-[#00FF99] focus:ring-[#00FF99]"
              />
              <span className="text-[#e7e7e7]">No</span>
            </label>
          </div>
        )

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="w-4 h-4 rounded border-[#36393f] bg-[#2a2a2a] text-[#00FF99] focus:ring-[#00FF99]"
                />
                <span className="text-[#e7e7e7]">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#00FF99] focus:border-transparent"
            placeholder="Enter number"
          />
        )

      case 'text':
      default:
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] focus:outline-none focus:ring-2 focus:ring-[#00FF99] focus:border-transparent resize-none"
            placeholder="Enter your answer..."
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-[#e7e7e7] font-medium">
          {question.question}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </span>
        {question.helpText && (
          <p className="text-xs text-[#e7e7e7]/60 mt-1">{question.helpText}</p>
        )}
      </label>
      {renderInput()}
    </div>
  )
}


