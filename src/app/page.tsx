'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UltimateEngineLoader from '@/components/UltimateEngineLoader'
import { RecentStories } from '@/components/RecentStories'
export default function Home() {
  const router = useRouter()
  const [synopsis, setSynopsis] = useState<string>('')
  const [theme, setTheme] = useState<string>('')
  const [showIntroduction, setShowIntroduction] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('🔥 Initializing Scorched AI...')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [synopsisCharCount, setSynopsisCharCount] = useState(0)
  const [themeCharCount, setThemeCharCount] = useState(0)
  const [showEmberParticles, setShowEmberParticles] = useState(false)
  
  // Cinematic introduction sequence
  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntroduction(false)
      setIsFormVisible(true)
    }, 3000)

    const emberTimer = setTimeout(() => {
      setShowEmberParticles(true)
    }, 4000)

    return () => {
      clearTimeout(introTimer)
      clearTimeout(emberTimer)
    }
  }, [])
  
  // Character count tracking
  useEffect(() => {
    setSynopsisCharCount(synopsis.length)
  }, [synopsis])
  
  useEffect(() => {
    setThemeCharCount(theme.length)
  }, [theme])
  
  // Handle user selecting a creative mode and starting the flow
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

    // Rebellious AI progression steps
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
      // Generate story bible via API
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
        throw new Error('Failed to generate story bible');
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
  
  return (
    <>
      <UltimateEngineLoader
        isVisible={isLoading}
        progress={loadingProgress}
        currentStep={currentStep}
      />
      
      {/* Cinematic Introduction Sequence */}
      <AnimatePresence>
        {showIntroduction && (
        <motion.div
          initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
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
                className="text-7xl font-black mb-4 elegant-fire fire-gradient animate-flameFlicker"
              >
                SCORCHED AI
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-2xl text-white font-semibold elegant-fire"
              >
                Burn Hollywood. Ignite Your Empire.
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-8 text-[#e2c376] text-lg elegant-fire"
              >
                ⚡ Initializing Revolutionary AI Systems...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Ember Particles */}
      {showEmberParticles && (
        <div className="fixed inset-0 pointer-events-none z-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#e2c376] rounded-full opacity-40"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 50,
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
      
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative"
        style={{ paddingTop: '100px' }}
      >

        {/* Hero Section */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="max-w-6xl w-full mx-auto"
            >
              {/* Main Hero Card */}
              <motion.div 
                initial={{ rotateX: -15, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="rebellious-card mb-8 relative overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D62828]/10 via-transparent to-[#e2c376]/5 pointer-events-none" />
                
          <motion.div
                  initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="relative text-center mb-10"
                >
                  <motion.div
                    className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-5xl">🔥</span>
        </motion.div>

                  <motion.h1 
                    className="text-5xl md:text-6xl font-black mb-6 elegant-fire fire-gradient animate-flameFlicker"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    IGNITE YOUR EMPIRE
                  </motion.h1>
                  
                  <motion.p 
                    className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed elegant-fire"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    No gatekeepers. No committees. No compromise.
                    <br />
                    <span className="text-[#e2c376] font-bold">Create. Control. Conquer.</span>
                  </motion.p>
                  
                  <motion.div 
                    className="mt-6 text-white/70 text-lg elegant-fire"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    14 Revolutionary AI Engines • 60% Actor Ownership • Zero Hollywood Bureaucracy
                  </motion.div>
                </motion.div>

                {/* Revolutionary Form */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  {/* Synopsis Input */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="synopsis" className="block mb-3 text-white font-bold text-lg elegant-fire">
                      ⚡ Your Revolutionary Story
                      <span className="ml-2 text-sm text-[#e2c376] font-normal">
                        ({synopsisCharCount}/500 characters)
                      </span>
                        </label>
                                        <motion.div className="relative">
                      <motion.textarea
                            id="synopsis"
                        className="input-field min-h-[120px] resize-none"
                        rows={4}
                        maxLength={500}
                        placeholder="Describe your rebellious story that challenges the status quo and burns convention to the ground..."
                            value={synopsis}
                            onChange={(e) => setSynopsis(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {synopsis.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 text-[#e2c376] opacity-60"
                        >
                          🔥
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.p 
                      className="mt-2 text-sm text-white/60 elegant-fire leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <span className="text-[#FF6B00] font-semibold">Revolutionary Example:</span> "A rogue AI developer discovers their company is using their creation to manipulate elections worldwide, forcing them to choose between career security and exposing a conspiracy that could topple governments."
                    </motion.p>
                  </motion.div>

                  {/* Theme Input */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="theme" className="block mb-3 text-white font-bold text-lg elegant-fire">
                      🎯 Your Battle Cry
                      <span className="ml-2 text-sm text-[#e2c376] font-normal">
                        ({themeCharCount}/100 characters)
                      </span>
                        </label>
                                        <motion.div className="relative">
                      <motion.input
              type="text"
                            id="theme"
                        className="input-field"
                        maxLength={100}
                        placeholder="What principle will your protagonist defend against all odds?"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {theme.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#e2c376] opacity-60"
                        >
                          ⚡
                        </motion.div>
                      )}
                    </motion.div>
                    <motion.p 
                      className="mt-2 text-sm text-white/60 elegant-fire leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                    >
                      <span className="text-[#FF6B00] font-semibold">Battle Examples:</span> "Truth over convenient lies" • "Individual freedom vs. collective security" • "Humanity over artificial perfection"
                    </motion.p>
                  </motion.div>

                  {/* Revolutionary Action Button */}
                  <motion.div 
                    className="pt-6"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                  >
                      <motion.button
              onClick={handleStart}
              disabled={isLoading || !synopsis.trim() || !theme.trim()}
                      className={`burn-button w-full py-6 text-xl relative ${
                isLoading || !synopsis.trim() || !theme.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
                      whileHover={synopsis.trim() && theme.trim() && !isLoading ? { 
                        y: -3, 
                        scale: 1.02,
                        boxShadow: "0 15px 40px rgba(214, 40, 40, 0.4)"
                      } : {}}
                      whileTap={synopsis.trim() && theme.trim() && !isLoading ? { 
                        y: -1, 
                        scale: 0.98 
                      } : {}}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <span className="relative z-10 elegant-fire">
                            {isLoading 
                          ? '🔥 FORGING YOUR EMPIRE...'
                          : '⚡ IGNITE THE REVOLUTION'
                        }
                      </span>
                      
                      {!isLoading && synopsis.trim() && theme.trim() && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            repeatDelay: 3,
                            ease: "linear" 
                          }}
                        />
                      )}
            </motion.button>
                    
                    <motion.div 
                      className="mt-4 text-center text-white/50 text-sm elegant-fire"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      🔥 No gatekeepers • No committees • No permission required 🔥
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Recent Rebellions Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="mt-12"
              >
                <motion.div
                  className="rebellious-card"
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-2xl font-bold text-[#e2c376] mb-6 elegant-fire text-center">
                    🔥 Recent Rebellions
                  </h3>
        <RecentStories />
                </motion.div>
              </motion.div>

              {/* Revolutionary Footer */}
              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.8 }}
              >
                <motion.div 
                  className="inline-block px-6 py-3 border border-[#e2c376]/30 rounded-xl bg-black/40 backdrop-blur-sm"
                  whileHover={{ 
                    borderColor: "#e2c376", 
                    boxShadow: "0 0 20px rgba(226, 195, 118, 0.2)" 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-white/70 elegant-fire">
                    <span className="text-[#e2c376] font-bold">Scorched AI v2.0</span> - The Revolutionary Platform
                  </p>
                  <p className="text-white/50 text-sm mt-1 elegant-fire">
                    Empowering actors, not replacing them • 60% ownership guaranteed
                  </p>
                </motion.div>
                
                <motion.div 
                  className="mt-6 flex justify-center space-x-8 text-white/40"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.6 }}
                >
                  <motion.a 
                    href="#revolution" 
                    className="elegant-fire hover:text-[#e2c376] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    Revolution
                  </motion.a>
                  <motion.a 
                    href="#platform" 
                    className="elegant-fire hover:text-[#e2c376] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    Platform
                  </motion.a>
                  <motion.a 
                    href="#rebels" 
                    className="elegant-fire hover:text-[#e2c376] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    Founders
                  </motion.a>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
    </>
  )
}
