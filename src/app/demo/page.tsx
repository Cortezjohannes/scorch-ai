'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UltimateEngineLoader from '@/components/UltimateEngineLoader'
import { RecentStories } from '@/components/RecentStories'
import AnimatedBackground from '@/components/AnimatedBackground'
import PitchPlaybookModal from '@/components/PitchPlaybookModal'
import '@/styles/greenlit-design.css'


export default function DemoPage() {
  const router = useRouter()
  const [logline, setLogline] = useState<string>('')
  const [protagonist, setProtagonist] = useState<string>('')
  const [stakes, setStakes] = useState<string>('')
  const [vibe, setVibe] = useState<string>('')
  const [theme, setTheme] = useState<string>('')
  const [showLogoLoading, setShowLogoLoading] = useState(true)
  const [showIntroduction, setShowIntroduction] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Initializing Greenlit...')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [showPitchPlaybook, setShowPitchPlaybook] = useState(false)
  
  // Fallback to ensure form shows
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isFormVisible) {
        setShowIntroduction(false)
        setIsFormVisible(true)
      }
    }, 5000) // 5 second fallback
    
    return () => clearTimeout(fallbackTimer)
  }, [isFormVisible])

  const [showEmberParticles, setShowEmberParticles] = useState(false)
  
  // Logo loading sequence - goes directly to form
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogoLoading(false)
      setIsFormVisible(true) // Skip the 2nd introduction
    }, 3000) // 3 seconds of twinkling logo

    return () => clearTimeout(logoTimer)
  }, [])
  

  // Handle user selecting a creative mode and starting the flow
  const handleStart = async () => {
    if (!logline.trim()) {
      alert('Please enter a logline for your series');
      return;
    }
    
    if (!protagonist.trim()) {
      alert('Please enter your protagonist details');
      return;
    }
    
    if (!stakes.trim()) {
      alert('Please enter the stakes for your series');
      return;
    }
    
    if (!vibe.trim()) {
      alert('Please enter the vibe for your series');
      return;
    }
    
    if (!theme.trim()) {
      alert('Please enter a theme for your series');
      return;
    }
    setIsLoading(true);
    setLoadingProgress(0);
    setCurrentStep('Preparing your Greenlit production suite...');

    // Rebellious AI progression steps
    const progressSteps = [
      { progress: 15, step: 'Story Foundation: Clarifying your series premise and goals...' },
      { progress: 25, step: 'Character Builder: Developing leads with depth and intention...' },
      { progress: 40, step: 'Structure Engine: Mapping arcs and episode flow...' },
      { progress: 55, step: 'Dialogue Pass: Establishing voice and tone...' },
      { progress: 70, step: 'Worldbuilding: Defining rules, locations, and tone...' },
      { progress: 85, step: 'Showrunner Sync: Aligning creative with production realities...' },
      { progress: 95, step: 'Finalizing assets and preparing your workspace...' }
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
          logline: logline.trim(),
          protagonist: protagonist.trim(),
          stakes: stakes.trim(),
          vibe: vibe.trim(),
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
      
      // Complete the process
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setCurrentStep("You're Already Greenlit. Let's build your show.");
      
      if (data.storyBible) {
        // Save story bible to localStorage
        const storyBibleData = {
          storyBible: data.storyBible,
          logline: logline.trim(),
          protagonist: protagonist.trim(),
          stakes: stakes.trim(),
          vibe: vibe.trim(),
          theme: theme.trim(),
          createdAt: new Date().toISOString(),
          platform: 'Greenlit - AI Showrunner'
        };
        
        console.log('🔥 Saving to localStorage:', storyBibleData);
        localStorage.setItem('greenlit-story-bible', JSON.stringify(storyBibleData));
        
        // Verify the save worked
        const verification = localStorage.getItem('greenlit-story-bible');
        console.log('🔍 Verification - localStorage contains:', verification ? 'Saved successfully!' : 'SAVE FAILED!');
        
        console.log('🔥 Story Bible saved to localStorage, redirecting to story bible display...');
        // Redirect to story bible results page
        router.push('/story-bible');
      } else {
        console.error('❌ No story bible data in response:', data);
        throw new Error('The process failed - no story data received');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      clearInterval(progressInterval);
      setCurrentStep('⚠️ Something went wrong. Retrying...');
      
      // Show error for longer and don't redirect immediately
      setTimeout(() => {
        setCurrentStep('⚡ Reconnecting to production engines...');
        setLoadingProgress(50);
        
        // Try again after a delay
        setTimeout(() => {
          setCurrentStep('⏳ Temporarily halted. Check your input and try again.');
          setIsLoading(false);
          setLoadingProgress(0);
        }, 3000);
      }, 2000);
    } finally {
      // Reset loading state after a delay
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setCurrentStep('✨ Initializing Greenlit...');
      }, 2000);
    }
  };

  
  return (
    <div className="min-h-screen greenlit-bg-primary text-white relative">
      <AnimatedBackground intensity="low" />
      <UltimateEngineLoader
        isVisible={isLoading}
        progress={loadingProgress}
        currentStep={currentStep}
      />

      {/* Floating Particles */}
      <div className="greenlit-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="greenlit-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      {/* Geometric Background */}
      <div className="greenlit-geometric-bg">
        <div className="greenlit-geometric-shape"></div>
        <div className="greenlit-geometric-shape"></div>
        <div className="greenlit-geometric-shape"></div>
      </div>

      {/* Twinkling Logo Loading Screen */}
      <AnimatePresence>
        {showLogoLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 greenlit-bg-secondary z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="greenlit-text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-48 h-48 flex items-center justify-center mx-auto greenlit-mb-lg"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 1, 0.4],
                    filter: [
                      "brightness(0.8) drop-shadow(0 0 20px rgba(0, 255, 153, 0.4))",
                      "brightness(1.5) drop-shadow(0 0 40px rgba(0, 255, 153, 0.8))",
                      "brightness(0.8) drop-shadow(0 0 20px rgba(0, 255, 153, 0.4))"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-40 h-40"
                >
                  <img 
                    src="/greenlitailogo.png" 
                    alt="Greenlit Logo" 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </motion.div>
              
              {/* "You're Already Greenlit" text */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="greenlit-headline-large greenlit-mb-md"
              >
                You're Already Greenlit.
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative">
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
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
              className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                  filter: [
                    "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))",
                    "brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 153, 0.6))",
                    "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))"
                  ]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16"
              >
                <img 
                  src="/greenlitailogo.png" 
                  alt="Greenlit Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
            
            {/* Emergency skip button */}
            <button 
              onClick={() => {
                setShowIntroduction(false)
                setIsFormVisible(true)
              }}
              className="mt-4 px-4 py-2 bg-[#00FF99] text-black rounded-lg text-sm"
            >
              Skip Introduction
            </button>
              
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-7xl font-bold mb-4 font-medium greenlit-gradient"
              >
                GREENLIT
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-2xl text-white font-semibold font-medium"
              >
                The Studio System is Broken. Build Your Own.
              </motion.p>
              
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-8 text-[#00FF99] text-lg font-medium"
              >
                ⚡ Initializing AI Showrunner Systems...
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
              className="absolute w-2 h-2 bg-[#00FF99] rounded-full opacity-40"
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
      
        {/* Hero Section */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="greenlit-container"
            >
              {/* Main Hero Card */}
              <motion.div 
                initial={{ rotateX: -15, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="greenlit-card-primary greenlit-mb-lg relative overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00CC7A]/10 via-transparent to-[#00FF99]/5 pointer-events-none" />
                
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="relative greenlit-text-center greenlit-mb-xl"
                >
                  <motion.div
                    className="w-16 h-16 flex items-center justify-center mx-auto greenlit-mb-md"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 1, 0.6],
                        filter: [
                          "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))",
                          "brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 153, 0.6))",
                          "brightness(1) drop-shadow(0 0 10px rgba(0, 255, 153, 0.3))"
                        ]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-12 h-12"
                    >
                      <img 
                        src="/greenlitailogo.png" 
                        alt="Greenlit Logo" 
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.h1 
                    className="greenlit-headline"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    Writers' Room
                  </motion.h1>
                  
                  <motion.p 
                    className="greenlit-subheadline max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    Let's co-write your story.
                    <br />
                    <span className="text-[#00FF99] font-bold">Greenlit AI will build the world.</span>
                  </motion.p>
                  
                  <motion.div 
                    className="greenlit-body-large greenlit-text-muted greenlit-mt-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                  >
                    30+ AI Production Engines • 70% Revenue Share • Direct-to-Audience Distribution
                  </motion.div>
                  
                  {/* Pitch Playbook Trigger */}
                  <motion.div
                    className="greenlit-mt-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                  >
                    <button
                      onClick={() => setShowPitchPlaybook(true)}
                      className="greenlit-button-secondary inline-flex items-center group"
                    >
                      <span className="mr-2">📖</span>
                      The Pitch Playbook: How to Craft Your Vision
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </button>
                  </motion.div>
                </motion.div>

                {/* Professional Form - The 5 Essential Questions */}
                <motion.div 
                  className="space-y-10"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  {/* Input 1: The Logline */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="logline" className="greenlit-label greenlit-mb-md block">
                      1. The Story: What's the epic tale you're about to tell?
                    </label>
                    <motion.div className="relative">
                      <motion.textarea
                        id="logline"
                        className="greenlit-textarea w-full"
                        rows={4}
                        placeholder="(e.g., A hopeless romantic architect tells his kids the epic story of how he met their mother, recounting years of dating mishaps, friendship drama, and the one that got away - all while sitting in a booth at MacLaren's Pub.)"
                        value={logline}
                        onChange={(e) => setLogline(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {logline.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 text-[#00FF99] opacity-60"
                        >
                          ✨
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Input 2: The Protagonist */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="protagonist" className="greenlit-label greenlit-mb-md block">
                      2. The Hero: Who's the main character we'll root for through every twist and turn?
                    </label>
                    <motion.div className="relative">
                      <motion.textarea
                        id="protagonist"
                        className="greenlit-textarea w-full"
                        rows={3}
                        placeholder="(e.g., Ted Mosby, a 27-year-old architect with an idealistic view of love and destiny. He's searching for 'the one' while navigating the chaotic world of dating in New York City with his best friends Marshall, Lily, Barney, and Robin.)"
                        value={protagonist}
                        onChange={(e) => setProtagonist(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {protagonist.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 text-[#00FF99] opacity-60"
                        >
                          👤
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Input 3: The Stakes */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="stakes" className="greenlit-label greenlit-mb-md block">
                      3. The Drama: What's at risk if our hero doesn't succeed?
                    </label>
                    <motion.div className="relative">
                      <motion.textarea
                        id="stakes"
                        className="greenlit-textarea w-full"
                        rows={3}
                        placeholder="(e.g., If Ted doesn't find true love soon, he'll settle for someone who's 'good enough' and miss out on the epic romance he's been waiting for. Meanwhile, Marshall and Lily's relationship faces the ultimate test as they navigate career changes and the pressure to start a family.)"
                        value={stakes}
                        onChange={(e) => setStakes(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {stakes.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 text-[#00FF99] opacity-60"
                        >
                          ⚡
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Input 4: The Vibe */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="vibe" className="greenlit-label greenlit-mb-md block">
                      4. The Feel: What's the mood and energy? ('X meets Y' format works best)
                    </label>
                    <motion.div className="relative">
                      <motion.input
                        type="text"
                        id="vibe"
                        className="greenlit-input w-full"
                        placeholder="(e.g., Witty ensemble comedy with heart and nostalgia. 'Friends' meets 'The Wonder Years' with a romantic twist - think warm, relatable humor mixed with genuine emotional moments and clever storytelling.)"
                        value={vibe}
                        onChange={(e) => setVibe(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {vibe.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#00FF99] opacity-60"
                        >
                          🎭
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Input 5: The Theme */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="relative"
                  >
                    <label htmlFor="theme" className="greenlit-label greenlit-mb-md block">
                      5. The Heart: What deeper message will resonate with your audience?
                    </label>
                    <motion.div className="relative">
                      <motion.input
                        type="text"
                        id="theme"
                        className="greenlit-input w-full"
                        placeholder="(e.g., The journey to finding true love, The importance of friendship and chosen family, Growing up and accepting change, The difference between settling and finding 'the one', The power of timing in relationships.)"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      {theme.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-[#00FF99] opacity-60"
                        >
                          🎯
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Professional Action Button */}
                  <motion.div 
                    className="greenlit-mt-lg"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                  >
                    <motion.button
                      onClick={handleStart}
                      disabled={isLoading || !logline.trim() || !protagonist.trim() || !stakes.trim() || !vibe.trim() || !theme.trim()}
                      className={`greenlit-button-primary greenlit-button-glow w-full py-6 text-xl relative ${
                        isLoading || !logline.trim() || !protagonist.trim() || !stakes.trim() || !vibe.trim() || !theme.trim() ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      whileHover={logline.trim() && protagonist.trim() && stakes.trim() && vibe.trim() && theme.trim() && !isLoading ? { 
                        y: -3, 
                        scale: 1.02,
                        boxShadow: "0 15px 40px rgba(0, 255, 153, 0.4)"
                      } : {}}
                      whileTap={logline.trim() && protagonist.trim() && stakes.trim() && vibe.trim() && theme.trim() && !isLoading ? { 
                        y: -1, 
                        scale: 0.98 
                      } : {}}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <span className="relative z-10 font-medium">
                        {isLoading 
                          ? '✨ CREATING YOUR SERIES...'
                          : 'Activate the Murphy Engine →'
                        }
                      </span>
                      
                      {!isLoading && logline.trim() && protagonist.trim() && stakes.trim() && vibe.trim() && theme.trim() && (
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
                      className="greenlit-mt-md greenlit-text-center greenlit-caption"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      🔥 No gatekeepers • No committees • No permission required 🔥
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Recent Series Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="greenlit-mt-xl"
              >
                <motion.div
                  className="greenlit-card"
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="greenlit-headline greenlit-text-center greenlit-mb-md" style={{ fontSize: '1.5rem' }}>
                    ✨ Recent Series
                  </h3>
                  <RecentStories />
                </motion.div>
              </motion.div>

              {/* Professional Footer */}
              <motion.div 
                className="greenlit-mt-xl greenlit-text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.8 }}
              >
                <motion.div 
                  className="inline-block greenlit-card-primary"
                  whileHover={{ 
                    borderColor: "#00FF99", 
                    boxShadow: "0 0 20px rgba(0, 255, 153, 0.2)" 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="greenlit-body-large greenlit-text-muted">
                    <span className="text-[#00FF99] font-bold">Greenlit v2.0</span> - The AI Showrunner Platform
                  </p>
                  <p className="greenlit-caption greenlit-mt-sm">
                    Empowering actors, not replacing them • 70% revenue share guaranteed
                  </p>
                </motion.div>
                
                <motion.div 
                  className="greenlit-mt-md flex justify-center space-x-8 greenlit-text-dim"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.6 }}
                >
                  <motion.a 
                    href="#platform" 
                    className="greenlit-body hover:text-[#00FF99] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    Platform
                  </motion.a>
                  <motion.a 
                    href="#criteria" 
                    className="greenlit-body hover:text-[#00FF99] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    Criteria
                  </motion.a>
                  <motion.a 
                    href="#founders" 
                    className="greenlit-body hover:text-[#00FF99] transition-colors"
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
      
      {/* Pitch Playbook Modal */}
      <PitchPlaybookModal 
        isOpen={showPitchPlaybook} 
        onClose={() => setShowPitchPlaybook(false)} 
      />
    </div>
  )
}
