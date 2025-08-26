'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/PageLayout'
import { ContentSection } from '@/components/layout/ContentSection'
import UltimateEngineLoader from '@/components/UltimateEngineLoader'
import { RecentStories } from '@/components/RecentStories'
import { StoryCreationWizard } from '@/components/landing/StoryCreationWizard'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'

export default function LandingPage() {
  const router = useRouter()
  
  // Preserve all existing state from original implementation
  const [synopsis, setSynopsis] = useState<string>('')
  const [theme, setTheme] = useState<string>('')
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('🔥 Initializing Scorched AI...')
  const [synopsisCharCount, setSynopsisCharCount] = useState(0)
  const [themeCharCount, setThemeCharCount] = useState(0)
  const [showEmberParticles, setShowEmberParticles] = useState(false)
  
  // New state for enhanced UX
  const [showWizard, setShowWizard] = useState(false)

  // Preserve existing cinematic introduction sequence timing
  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntroduction(false)
    }, 3000)

    const emberTimer = setTimeout(() => {
      setShowEmberParticles(true)
    }, 4000)

    return () => {
      clearTimeout(introTimer)
      clearTimeout(emberTimer)
    }
  }, [])
  
  // Preserve existing character count tracking
  useEffect(() => {
    setSynopsisCharCount(synopsis.length)
  }, [synopsis])
  
  useEffect(() => {
    setThemeCharCount(theme.length)
  }, [theme])
  
  // PRESERVE EXACT EXISTING API CALL LOGIC - DO NOT MODIFY
  const handleStart = async () => {
    if (!synopsis.trim()) {
      alert('Please enter a synopsis for your series');
      return;
    }
    
    if (!theme.trim()) {
      alert('Please enter a theme for your series');
      return;
    }
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep('🔥 Igniting the Scorched AI Revolution...');

    // Preserve exact same rebellious AI progression steps
    const progressSteps = [
      { progress: 15, step: '🎯 Rebellion Engine: Analyzing story foundation with zero compromise...' },
      { progress: 25, step: '⚡ Character Forge: Creating complex rebels who defy convention...' },
      { progress: 40, step: '🌪️ Narrative Storm: Building structure that breaks all rules...' },
      { progress: 55, step: '💬 Dialogue Fire: Crafting words that burn with authenticity...' },
      { progress: 70, step: '🌍 World Incinerator: Establishing settings that challenge reality...' },
      { progress: 85, step: '🎭 Master Orchestrator: Conducting the perfect rebellion...' },
      { progress: 95, step: '🔥 Finalizing your empire-building content...' }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setLoadingProgress(progressSteps[stepIndex].progress);
        setCurrentStep(progressSteps[stepIndex].step);
        stepIndex++;
      }
    }, 3000); // Update every 3 seconds
    
    try {
      console.log('📡 Making API call to /api/generate/story-bible');
      console.log('📤 Sending data:', { synopsis: synopsis.trim(), theme: theme.trim() });
      // PRESERVE EXACT SAME API CALL
      const response = await fetch('/api/generate/story-bible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          synopsis: synopsis.trim(),
          theme: theme.trim(),
          // Multi-model AI - no mode parameter needed
        }),
      });

      console.log('📡 API response received:', response.status, response.ok);

      if (!response.ok) {
        console.log('❌ API response not ok:', response.status, response.statusText);
        const errorData = await response.text();
        console.log('❌ API error response:', errorData);
        throw new Error(`Failed to generate story bible: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Story bible generated successfully:', data);
      
      // Complete the revolution
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setCurrentStep('🔥 Your Empire Has Been Forged! Welcome to the Revolution!');
      
      if (data.storyBible) {
        // Save story bible to localStorage
        const storyBibleData = {
          storyBible: data.storyBible,
          synopsis: synopsis.trim(),
          theme: theme.trim(),
          createdAt: new Date().toISOString(),
          platform: 'Scorched AI - Revolution Edition'
        };
        
        console.log('🔥 Saving to localStorage:', storyBibleData);
        localStorage.setItem('scorched-story-bible', JSON.stringify(storyBibleData));
        
        // Verify the save worked
        const verification = localStorage.getItem('scorched-story-bible');
        console.log('🔍 Verification - localStorage contains:', verification ? 'Revolution saved successfully!' : 'REVOLUTION SAVE FAILED!');
        
        console.log('🔥 Empire saved to localStorage, redirecting to story bible...');
        // Redirect to story bible page
        router.push('/story-bible');
      } else {
        console.error('❌ No story bible data in response:', data);
        throw new Error('The revolution failed - no story data received');
      }
    } catch (error) {
      console.error('Revolution generation failed:', error);
      clearInterval(progressInterval);
      setCurrentStep('🔥 The fire dimmed... Reigniting rebellion...');
      
      // Show error for longer and don't redirect immediately
      setTimeout(() => {
        setCurrentStep('⚡ Charging revolutionary engines...');
        setLoadingProgress(50);
        
        // Try again after a delay
        setTimeout(() => {
          setCurrentStep('💥 Revolution temporarily halted. Check your ammunition and try again.');
          setIsLoading(false);
          setLoadingProgress(0);
        }, 3000);
      }, 2000);
    } finally {
      // Reset loading state after a delay
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setCurrentStep('🔥 Initializing Scorched AI...');
      }, 2000);
    }
  }

  // Handle wizard completion - convert wizard data to existing format
  const handleWizardComplete = (wizardData: any) => {
    // Set the synopsis and theme from wizard data
    setSynopsis(wizardData.synopsis || '')
    setTheme(wizardData.theme || '')
    
    // Close the wizard
    setShowWizard(false)
    
    // Auto-start the story creation process with a longer delay to ensure state is updated
    setTimeout(() => {
      // Double-check that we have the data before starting
      if (wizardData.synopsis?.trim() && wizardData.theme?.trim()) {
        handleStart()
      } else {
        console.error('❌ Wizard data validation failed:', wizardData)
        alert('Please ensure both synopsis and theme are provided')
      }
    }, 1000)
  }
  
  return (
    <>
      {/* Preserve existing UltimateEngineLoader component */}
      <UltimateEngineLoader
        isVisible={isLoading}
        progress={loadingProgress}
        currentStep={currentStep}
      />
      
      <PageLayout showBackground={true} className="relative">
        {/* Preserve existing floating ember particles */}
        {showEmberParticles && (
          <div className="fixed inset-0 pointer-events-none z-5">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-ember-gold rounded-full opacity-40"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50,
                  scale: 0 
                }}
                animate={{ 
                  y: -50, 
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {showIntroduction ? (
            // Preserve existing cinematic introduction
            <CinematicIntro onComplete={() => setShowIntroduction(false)} />
          ) : (
            <MainLandingContent onStartCreating={() => setShowWizard(true)} />
          )}
        </AnimatePresence>

        {/* Story Creation Wizard Modal */}
      <AnimatePresence>
          {showWizard && (
            <StoryCreationWizard
              onClose={() => setShowWizard(false)}
              onComplete={handleWizardComplete}
            />
          )}
        </AnimatePresence>
      </PageLayout>
    </>
  )
}

// Preserve existing cinematic introduction with enhancements
function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  return (
        <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-20 h-20 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
              >
                <span className="text-6xl">🔥</span>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
          className="text-hero font-black mb-4 elegant-fire fire-gradient animate-flameFlicker"
              >
                SCORCHED AI
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
          className="text-h2 text-high-contrast font-semibold elegant-fire"
              >
                Burn Hollywood. Ignite Your Empire.
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
          className="mt-8 text-ember-gold text-body-large elegant-fire"
              >
                ⚡ Initializing Revolutionary AI Systems...
              </motion.div>
            </motion.div>
          </motion.div>
  )
}

// Enhanced main landing content
function MainLandingContent({ onStartCreating }: { onStartCreating: () => void }) {
  return (
            <motion.div
      className="relative z-10 pt-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Hero Section */}
      <motion.section
        className="text-center mb-16"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="elegant-fire fire-gradient text-hero font-black mb-6">
          CREATE STORIES THAT
          <br />
          <span className="text-ember-gold">BURN HOLLYWOOD</span>
        </h1>
        
        <p className="text-body-large text-medium-contrast mb-8 max-w-3xl mx-auto">
          The AI showrunner that gives actors 60% ownership. 
          Create professional series from simple ideas.
        </p>
        
                      <motion.button
          className="burn-button text-body-large px-8 py-4 mx-auto touch-target-comfortable"
          onClick={onStartCreating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔥 Ignite Your Story
            </motion.button>
      </motion.section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Recent Stories */}
      <ContentSection
        title="Recent Rebellions"
        subtitle="See what other creators are building with Scorched AI"
        className="mb-16"
      >
        <RecentStories />
      </ContentSection>

      {/* Call to Action */}
      <ContentSection className="text-center mb-16">
              <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-h2 font-bold text-high-contrast mb-4 elegant-fire">
            Ready to Start Your Revolution?
          </h2>
          <p className="text-body text-medium-contrast mb-6">
            Join the creators who are changing the entertainment industry forever.
          </p>
          <motion.button
            className="burn-button text-body-large px-8 py-4 touch-target-comfortable"
            onClick={onStartCreating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔥 Begin Your Story
          </motion.button>
                </motion.div>
      </ContentSection>
            </motion.div>
  )
}