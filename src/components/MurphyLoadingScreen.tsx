'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface MurphyLoadingScreenProps {
  isVisible: boolean;
  currentEngine?: string;
  progress?: number;
  onComplete?: () => void;
}

interface EngineStep {
  engine: string;
  message: string;
  icon: string;
  duration: number;
  progress: number;
}

const MURPHY_ENGINE_STEPS: EngineStep[] = [
  {
    engine: "Premise Engine",
    message: "Murphy is analyzing your story theme and finding the perfect foundation! 🐱📖",
    icon: "📖",
    duration: 3000,
    progress: 10
  },
  {
    engine: "3D Character Engine", 
    message: "Murphy is creating complex characters with deep psychology! 🐱👥",
    icon: "👥",
    duration: 8000,
    progress: 35
  },
  {
    engine: "Fractal Narrative Engine",
    message: "Murphy is weaving intricate story structures! 🐱🌟",
    icon: "🌟", 
    duration: 5000,
    progress: 55
  },
  {
    engine: "World Building Engine",
    message: "Murphy is crafting immersive worlds and settings! 🐱🏗️",
    icon: "🏗️",
    duration: 4000,
    progress: 70
  },
  {
    engine: "Strategic Dialogue Engine",
    message: "Murphy is perfecting character voices and conversations! 🐱💬",
    icon: "💬",
    duration: 3000,
    progress: 85
  },
  {
    engine: "Master Conductor",
    message: "Murphy is orchestrating all engines together! 🐱🎼",
    icon: "🎼",
    duration: 2000,
    progress: 100
  }
];

export default function MurphyLoadingScreen({ 
  isVisible, 
  currentEngine, 
  progress = 0,
  onComplete 
}: MurphyLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [murphyEmotion, setMurphyEmotion] = useState('😸'); // Happy cat

  useEffect(() => {
    if (!isVisible) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= MURPHY_ENGINE_STEPS.length) {
          clearInterval(stepInterval);
          setTimeout(() => onComplete?.(), 1000);
          return prev;
        }
        return nextStep;
      });
    }, 4000);

    return () => clearInterval(stepInterval);
  }, [isVisible, onComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const progressInterval = setInterval(() => {
      setAnimatedProgress(prev => {
        const target = MURPHY_ENGINE_STEPS[currentStep]?.progress || 0;
        const diff = target - prev;
        if (Math.abs(diff) < 1) return target;
        return prev + (diff / 10);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentStep, isVisible]);

  useEffect(() => {
    // Murphy's emotions change based on progress
    if (animatedProgress < 20) setMurphyEmotion('😸'); // Happy
    else if (animatedProgress < 40) setMurphyEmotion('😺'); // Content  
    else if (animatedProgress < 60) setMurphyEmotion('😻'); // Heart eyes
    else if (animatedProgress < 80) setMurphyEmotion('😹'); // Laughing
    else if (animatedProgress < 95) setMurphyEmotion('😽'); // Kissing
    else setMurphyEmotion('🙀'); // Surprised (finished!)
  }, [animatedProgress]);

  if (!isVisible) return null;

  const currentEngineStep = MURPHY_ENGINE_STEPS[currentStep] || MURPHY_ENGINE_STEPS[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="w-96 p-8 text-center space-y-8 rebellious-card relative z-10">
        {/* Revolutionary Murphy the Cat */}
        <motion.div 
          className="text-8xl animate-bounce"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {murphyEmotion}
        </motion.div>
        
        {/* Revolutionary Main Title */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black elegant-fire fire-gradient animate-flameFlicker">
            MURPHY'S REVOLUTIONARY ENGINE
          </h2>
          <p className="text-lg text-white/90 elegant-fire">
            AI-Powered Empire Building in Progress
          </p>
        </div>

        {/* Revolutionary Current Engine Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <motion.span 
              className="text-3xl animate-pulse"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {currentEngineStep.icon}
            </motion.span>
            <span className="font-black text-xl text-[#e2c376] elegant-fire">{currentEngineStep.engine}</span>
          </div>
          
          <p className="text-lg text-white/90 leading-relaxed elegant-fire">
            {currentEngineStep.message}
          </p>
        </div>

        {/* Revolutionary Progress Bar */}
        <div className="space-y-4">
          <div className="w-full bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] rounded-xl h-4 border border-[#e2c376]/20 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-[#D62828] via-[#FF6B00] to-[#e2c376] h-4 rounded-xl transition-all duration-300 ease-out"
              style={{ width: `${Math.min(animatedProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-lg text-white/80 elegant-fire">
            <span>REVOLUTION PROGRESS</span>
            <span className="font-black text-[#e2c376]">{Math.round(animatedProgress)}%</span>
          </div>
        </div>

        {/* Revolutionary Engine List */}
        <div className="space-y-4 text-sm">
          <p className="text-[#e2c376] font-black elegant-fire">ACTIVE REVOLUTIONARY ENGINES:</p>
          <div className="grid grid-cols-2 gap-3 text-white/90">
            {MURPHY_ENGINE_STEPS.slice(0, currentStep + 1).map((step, index) => (
              <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${
                index === currentStep ? 'bg-[#D62828]/20 border border-[#D62828]/40' : 'bg-[#2a2a2a]/50'
              }`}>
                <span className="text-lg">{step.icon}</span>
                <span className="truncate elegant-fire font-bold">{step.engine}</span>
                {index < currentStep && <span className="text-[#e2c376] text-xl">✅</span>}
                {index === currentStep && <motion.span className="text-[#FF6B00] text-xl" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>⚡</motion.span>}
              </div>
            ))}
          </div>
        </div>

        {/* Revolutionary Cat Facts */}
        <div className="text-sm text-white/70 italic elegant-fire">
          {animatedProgress < 25 && "Murphy processes 14 revolutionary engines simultaneously! 🔥"}
          {animatedProgress >= 25 && animatedProgress < 50 && "Did you know? Murphy can create 5 characters in parallel! 🎭"}
          {animatedProgress >= 50 && animatedProgress < 75 && "Murphy uses advanced narrative psychology! 🧠"}
          {animatedProgress >= 75 && animatedProgress < 95 && "Almost done! Murphy is fine-tuning your empire! ✨"}
          {animatedProgress >= 95 && "Murphy has crafted your perfect revolution! 🏆"}
        </div>
      </div>
    </div>
  );
}