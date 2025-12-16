'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useVideo } from '@/context/VideoContext'

export type WorkflowStage = 'organization' | 'editing' | 'visual-effects' | 'sound-design' | 'music-scoring' | 'distribution'

export interface WorkflowStagesProps {
  currentStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
}

export function WorkflowStages({ currentStage, onStageChange }: WorkflowStagesProps) {
  const { uploadedVideos } = useVideo()
  const hasUploadedVideos = uploadedVideos.length > 0
  
  const stages = [
    {
      id: 'organization',
      title: 'Footage Organization',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
      ),
    },
    {
      id: 'editing',
      title: 'Video Editing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
        </svg>
      ),
    },
    {
      id: 'visual-effects',
      title: 'Visual Effects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      ),
    },
    {
      id: 'sound-design',
      title: 'Sound Design',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.06-7.072m-1.06 7.072a9 9 0 001.06-12.728M12 12h.01"></path>
        </svg>
      ),
    },
    {
      id: 'music-scoring',
      title: 'Musical Scoring',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
      ),
    },
    {
      id: 'distribution',
      title: 'Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
      ),
    },
  ]

  const handleStageChange = (stage: WorkflowStage) => {
    // Allow navigation to any stage
    onStageChange(stage)
  }

  return (
    <div className="bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-sm border border-[#10B981]/20 rounded-2xl p-6 mb-6 shadow-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stages.map(stage => {
          const isActive = currentStage === stage.id;
          const isCompleted = false; // Will implement completion tracking later
          
          return (
            <motion.button
              key={stage.id}
              className={`group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-black shadow-lg shadow-[#10B981]/25'
                  : isCompleted
                  ? 'bg-gradient-to-r from-[#10B981]/20 to-[#059669]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-gradient-to-r hover:from-[#10B981]/30 hover:to-[#059669]/30'
                  : 'bg-gradient-to-r from-black/40 to-black/60 border border-[#10B981]/20 text-white/70 hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#059669]/10 hover:border-[#10B981]/40 hover:text-white'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStageChange(stage.id as WorkflowStage)}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="relative z-10 mb-2 text-xl">{stage.icon}</div>
              <div className="relative z-10 text-xs text-center font-semibold">{stage.title}</div>
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 rounded-xl blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
} 