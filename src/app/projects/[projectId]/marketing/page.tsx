'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useProject, MarketingGuide } from '@/context/ProjectContext';

export default function MarketingPage() {
  const { storyBible, generateMarketingGuide, isGeneratingAsset, error } = useProject();
  const marketingGuide = storyBible?.marketingGuide;
  const isGenerating = isGeneratingAsset('marketing');

  // Animation variants for staggered items
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const handleGenerateGuide = async () => {
    await generateMarketingGuide();
  };

  // Display loading state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div 
          className="w-16 h-16 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-[#e7e7e7]/70 text-lg">Analyzing script and creating marketing strategy...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 mt-4">
        <h3 className="text-red-400 font-bold mb-2">Error</h3>
        <p className="text-[#e7e7e7]/80">{error}</p>
        <button 
          onClick={handleGenerateGuide}
          className="mt-4 px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If no marketing guide exists yet, show generate button
  if (!marketingGuide) {
    return (
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 mt-4">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">Marketing Guide</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          Generate a comprehensive marketing strategy for your project. The AI will analyze your script and create a detailed marketing plan including target audience, loglines, taglines, visual style, and social media strategy.
        </p>
        <button 
          onClick={handleGenerateGuide}
          className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors flex items-center gap-2"
        >
          <span>Generate Marketing Guide</span>
        </button>
      </div>
    );
  }

  // Display the generated marketing guide
  return (
    <div className="py-6">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#e2c376]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Marketing Guide
      </motion.h2>
      
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Target Audience */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Target Audience</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Primary</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.targetAudience.primary}</p>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Secondary</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.targetAudience.secondary}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Loglines */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Loglines</h3>
          
          <div className="space-y-3">
            {marketingGuide.loglines.map((logline, index) => (
              <div 
                key={`logline-${index}`}
                className="bg-[#2a2a2a] rounded-lg p-4"
              >
                <p className="text-[#e7e7e7]/80 italic">"{logline}"</p>
                <div className="mt-1 text-xs text-[#e7e7e7]/50">Option {index + 1}</div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Taglines */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Taglines</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {marketingGuide.taglines.map((tagline, index) => (
              <div 
                key={`tagline-${index}`}
                className="bg-[#2a2a2a] rounded-lg p-4 text-center"
              >
                <p className="text-[#e2c376] font-medium">"{tagline}"</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Key Selling Points */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Key Selling Points</h3>
          
          <ul className="space-y-2">
            {marketingGuide.keySellingPoints.map((point, index) => (
              <li 
                key={`point-${index}`}
                className="flex items-start"
              >
                <div className="min-w-6 h-6 flex items-center justify-center rounded-full bg-[#e2c376] text-black font-bold mr-3">
                  {index + 1}
                </div>
                <p className="text-[#e7e7e7]/80 pt-1">{point}</p>
              </li>
            ))}
          </ul>
        </motion.div>
        
        {/* Visual Style */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Visual Style</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Color Palette</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.visualStyle.colorPalette}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Imagery Themes</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.visualStyle.imageryThemes}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Poster Concepts</h4>
              <ul className="space-y-2">
                {marketingGuide.visualStyle.posterConcepts.map((concept, index) => (
                  <li 
                    key={`concept-${index}`}
                    className="bg-[#2a2a2a] rounded-lg p-3"
                  >
                    <p className="text-[#e7e7e7]/80">{concept}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Audio Strategy */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Audio Strategy</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Music Genre</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.audioStrategy.musicGenre}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Sound Design</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.audioStrategy.soundDesign}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Voiceover Tone</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.audioStrategy.voiceoverTone}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Social Media Strategy */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Social Media Strategy</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Recommended Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {marketingGuide.socialMediaStrategy.platforms.map((platform, index) => (
                  <span 
                    key={`platform-${index}`}
                    className="px-3 py-1 bg-[#2a2a2a] rounded-full text-sm"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Content Approach</h4>
              <p className="text-[#e7e7e7]/80">{marketingGuide.socialMediaStrategy.contentApproach}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#e2c376] mb-2">Engagement Ideas</h4>
              <ul className="space-y-2">
                {marketingGuide.socialMediaStrategy.engagementIdeas.map((idea, index) => (
                  <li 
                    key={`idea-${index}`}
                    className="bg-[#2a2a2a] rounded-lg p-3"
                  >
                    <p className="text-[#e7e7e7]/80">{idea}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Regenerate button */}
      <motion.div 
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button 
          onClick={handleGenerateGuide}
          className="px-6 py-2 bg-[#2a2a2a] text-[#e7e7e7]/80 font-medium rounded-lg hover:bg-[#36393f] transition-colors"
        >
          Regenerate Marketing Guide
        </button>
      </motion.div>
    </div>
  );
} 