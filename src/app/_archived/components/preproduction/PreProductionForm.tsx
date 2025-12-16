'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from '@/components/ui/ClientMotion'
import { useRouter } from 'next/navigation'
import { GenerationIndicator } from '@/components/GenerationIndicator'
import UltimateEngineLoader from '@/components/UltimateEngineLoader'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface PreProductionFormProps {
  synopsis: string
  theme: string
}

export function PreProductionForm({ synopsis: initialSynopsis, theme: initialTheme }: PreProductionFormProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [synopsis, setSynopsis] = useState(initialSynopsis)
  const [theme, setTheme] = useState(initialTheme)
  const [progressText, setProgressText] = useState("Planning your story bible...")
  const [generationComplete, setGenerationComplete] = useState(false)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [storyBible, setStoryBible] = useState<any>(null)
  const { user } = useAuth();

  const generateStoryBible = async () => {
    if (isGenerating) return;
    
    if (!synopsis.trim() || !theme.trim()) {
      setError('Please provide both a synopsis and theme');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setProgressText("Creating your comprehensive story bible...");
    setProgressPercentage(15);
    
    try {
      // Murphy's Engine Progress Updates
      const murphyProgressSteps = [
        { progress: 10, text: "🐱 Murphy is analyzing your story theme!" },
        { progress: 25, text: "🐱 Murphy is creating complex characters with deep psychology!" },
        { progress: 45, text: "🐱 Murphy is weaving intricate story structures!" },
        { progress: 65, text: "🐱 Murphy is crafting immersive worlds and settings!" },
        { progress: 80, text: "🐱 Murphy is perfecting character voices and conversations!" },
        { progress: 90, text: "🐱 Murphy is orchestrating all engines together!" }
      ];
      
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < murphyProgressSteps.length) {
          const step = murphyProgressSteps[stepIndex];
          setProgressPercentage(step.progress);
          setProgressText(step.text);
          stepIndex++;
        }
      }, 3000);
      
      // Make API call to generate story bible
      const response = await fetch('/api/generate/story-bible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          synopsis,
          theme
        }),
      });

      clearInterval(progressInterval);
      
      // Final Murphy completion
      setProgressPercentage(100);
      setProgressText("🐱 Murphy has crafted your perfect story! 🎉");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story bible');
      }

      const data = await response.json();
      setStoryBible(data.storyBible);
      setProgressPercentage(100);
      setGenerationComplete(true);
      
      // Store the story bible in localStorage for persistence
      localStorage.setItem('scorched-story-bible', JSON.stringify({
        synopsis,
        theme,
        storyBible: data.storyBible,
        timestamp: new Date().toISOString()
      }));
      
      // Save to Firestore if user is logged in
      if (user) {
        try {
          setProgressText("Saving your project...");
          
          // Create new project in Firestore
          const projectsRef = collection(db, 'users', user.id, 'projects');
          const newProjectRef = await addDoc(projectsRef, {
            title: data.storyBible.seriesTitle || 'Untitled Project',
            synopsis,
            theme,
            storyBible: data.storyBible,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Redirect to the new project workspace
          router.push(`/projects/${newProjectRef.id}`);
        } catch (saveError) {
          console.error('Error saving to Firestore:', saveError);
          // If Firestore save fails, still redirect to story bible
          router.push(`/story-bible?synopsis=${encodeURIComponent(synopsis)}&theme=${encodeURIComponent(theme)}`);
        }
      } else {
        // If no user is logged in, just go to the story bible
        router.push(`/story-bible?synopsis=${encodeURIComponent(synopsis)}&theme=${encodeURIComponent(theme)}`);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setProgressPercentage(0);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="w-full space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-transparent bg-clip-text">
              Story Bible Creator
            </h2>
            <p className="text-[#e7e7e7]/70">
              Generate a comprehensive story bible for your series
            </p>
          </div>
        </div>

        {(!isGenerating && !storyBible) ? (
          <motion.div 
            className="relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-[#1e1e1e] to-[#121212]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3f3f3f]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative p-6 sm:p-8">
              {/* Film reel decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <motion.svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM7 15C8.1 15 9 14.1 9 13C9 11.9 8.1 11 7 11C5.9 11 5 11.9 5 13C5 14.1 5.9 15 7 15ZM13 17C14.1 17 15 16.1 15 15C15 13.9 14.1 13 13 13C11.9 13 11 13.9 11 15C11 16.1 11.9 17 13 17ZM17 11C18.1 11 19 10.1 19 9C19 7.9 18.1 7 17 7C15.9 7 15 7.9 15 9C15 10.1 15.9 11 17 11ZM11 9C12.1 9 13 8.1 13 7C13 5.9 12.1 5 11 5C9.9 5 9 5.9 9 7C9 8.1 9.9 9 11 9Z" fill="white"/>
                </motion.svg>
              </div>
              
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <motion.span 
                  className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-black"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 4.64-1.345.32-.376.319-.789.319-1.321 0-1.585-1.397-3.5-5.25-3.5-3.835 0-5.25 1.915-5.25 3.5 0 .532-.001.945.319 1.32.85 1.004 2.73 1.232 4.64 1.346.332.02.61-.246.61-.578z" />
                    <path d="M9.375 5.25a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM9 8.25a3.75 3.75 0 00-3.75 3.75v.75c0 2.9 2.35 5.25 5.25 5.25h4.5a.75.75 0 000-1.5h-4.5c-2.078 0-3.75-1.672-3.75-3.75v-.75c0-1.664 1.67-3 3.75-3h6c2.08 0 3.75 1.336 3.75 3v.75c0 .137-.03.27-.069.399A.75.75 0 0021 13.5h.308c.264 0 .54.061.729.26.187.198.282.466.282.74v.752a.75.75 0 01-1.5 0v-.75a.265.265 0 00-.07-.18.25.25 0 00-.18-.07H20.25a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-.75a.75.75 0 010-1.5h.75a.75.75 0 00.75-.75v-.75a.75.75 0 00-.75-.75h-.369C19.135 18.879 17.274 20.25 15 20.25h-1.5v1.5h-1.5v-1.5H9c-3.337 0-6-2.663-6-6v-.75A5.25 5.25 0 019 8.25h6z" />
                  </svg>
                </motion.span>
                <span className="bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">Your Vision</span>
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="relative group">
                  <label htmlFor="synopsis" className="block mb-2 font-medium text-[#10B981] group-focus-within:text-[#10B981]">
                    Synopsis
                  </label>
                  <div className="relative">
                    <textarea
                      id="synopsis"
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Enter your story synopsis... What's the journey?"
                      className="w-full p-4 bg-[#1a1a1a]/80 border border-gray-700 group-focus-within:border-[#10B981]/70 focus:border-[#10B981]/70 rounded-lg text-white transition-all duration-300 focus:ring-1 focus:ring-[#10B981]/30"
                      style={{ minHeight: "140px" }}
                      disabled={isGenerating}
                    />
                    <motion.div 
                      className="absolute bottom-3 right-3 text-[#10B981]/30 pointer-events-none"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Tell us about your series concept and narrative arc</p>
                </div>
                
                <div className="relative group">
                  <label htmlFor="theme" className="block mb-2 font-medium text-[#10B981] group-focus-within:text-[#10B981]">
                    Theme
                  </label>
                  <div className="relative">
                    <input
                      id="theme"
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Enter the main theme(s)... What's your message?"
                      className="w-full p-4 bg-[#1a1a1a]/80 border border-gray-700 group-focus-within:border-[#10B981]/70 focus:border-[#10B981]/70 rounded-lg text-white transition-all duration-300 focus:ring-1 focus:ring-[#10B981]/30"
                      disabled={isGenerating}
                    />
                    <motion.div 
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#10B981]/30 pointer-events-none"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">The underlying message or concept that ties your series together</div>
                </div>
              </div>
              

              
              {/* Ready badge - shows when both fields have content */}
              {synopsis.trim() && theme.trim() && (
                <motion.div 
                  className="mb-6 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="px-4 py-1.5 bg-[#1f1f1f] border border-[#10B981]/30 rounded-full flex items-center text-sm">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-[#10B981] mr-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Ready to create your story bible
                  </span>
                </motion.div>
              )}
              
              {/* Generate button with enhanced styling */}
              <motion.button
                onClick={generateStoryBible}
                disabled={!synopsis.trim() || !theme.trim() || isGenerating}
                className={`relative overflow-hidden w-full py-5 text-lg font-medium rounded-lg transition-all duration-300 ${
                  synopsis.trim() && theme.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-black shadow-lg shadow-[#10B981]/20' 
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={synopsis.trim() && theme.trim() && !isGenerating ? { scale: 1.02, y: -2 } : {}}
                whileTap={synopsis.trim() && theme.trim() && !isGenerating ? { scale: 0.98 } : {}}
              >
                {/* Background shimmer effect */}
                {synopsis.trim() && theme.trim() && !isGenerating && (
                  <motion.div 
                    className="absolute inset-0 bg-white opacity-10"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '100%', opacity: 0.15 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1 }}
                  />
                )}
                
                <div className="relative flex items-center justify-center">
                  <span className="mr-2">Generate Story Bible</span>
                  {synopsis.trim() && theme.trim() && !isGenerating && (
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-5 h-5"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                </div>
              </motion.button>
              
              {/* Film strip decorative element */}
              <div className="mt-8 flex justify-center">
                <div className="h-6 w-full flex">
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="h-full flex-1 bg-[#2a2a2a] mx-0.5 rounded-sm"
                      animate={{ 
                        opacity: i % 2 === 0 ? [0.3, 0.5, 0.3] : [0.5, 0.7, 0.5],
                        height: i % 3 === 0 ? ['100%', '90%', '100%'] : '100%'
                      }}
                      transition={{ 
                        duration: 2 + (i * 0.2), 
                        repeat: Infinity, 
                        repeatType: 'reverse' 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 mb-6">
            {/* Ultimate Engine Loader with Real Engine Progress */}
            <UltimateEngineLoader
              isVisible={isGenerating}
              progress={progressPercentage}
              currentStep={progressText}
              onComplete={() => {
                setIsGenerating(false);
                setGenerationComplete(true);
              }}
            />
            
            <div>
              <GenerationIndicator 
                isGenerating={isGenerating} 
                phase={"Story Bible Creation"} 
                completionMessage={generationComplete ? "Story Bible generated!" : "Generation complete!"}
                className="my-8"
                readyToShow={isGenerating && Boolean(synopsis.trim()) && Boolean(theme.trim())}
                progressPercentage={progressPercentage}
                statusText={progressText}
              />
            </div>
            
            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#10B98110] border border-[#10B98140] rounded-xl p-4 text-[#10B981] mt-4"
              >
                {error}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
} 