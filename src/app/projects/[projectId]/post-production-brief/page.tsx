'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProject, PostProductionBrief } from '@/context/ProjectContext';

export default function PostProductionBriefPage() {
  const { storyBible, generatePostProductionBrief, isGeneratingAsset, error } = useProject();
  const postProductionBrief = storyBible?.postProductionBrief;
  const isGenerating = isGeneratingAsset('post_production_brief');
  const [activeScene, setActiveScene] = useState<number | null>(null);

  // Animation variants for staggered items
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const handleGenerateGuide = async () => {
    await generatePostProductionBrief();
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
        <p className="text-[#e7e7e7]/70 text-lg">Analyzing script and creating post-production brief...</p>
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

  // If no post-production brief exists yet, show generate button
  if (!postProductionBrief) {
    return (
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 mt-4">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">Post-Production Brief</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          Generate a comprehensive post-production guide for your project. The AI will analyze your script and create detailed instructions for editing, color grading, sound design, and music to guide the post-production process.
        </p>
        <button 
          onClick={handleGenerateGuide}
          className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors flex items-center gap-2"
        >
          <span>Generate Post-Production Brief</span>
        </button>
      </div>
    );
  }

  // Function to determine pacing color
  const getPacingColor = (pacing: string) => {
    if (pacing.toLowerCase().includes('fast')) return 'bg-red-500/20 text-red-300';
    if (pacing.toLowerCase().includes('medium')) return 'bg-yellow-500/20 text-yellow-300';
    if (pacing.toLowerCase().includes('slow')) return 'bg-blue-500/20 text-blue-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Display the generated post-production brief
  return (
    <div className="py-6">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#e2c376]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Post-Production Brief
      </motion.h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Style */}
        <motion.div
          className="lg:col-span-3 bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Overall Style</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Editing Style</h4>
              <p className="text-[#e7e7e7]/80">{postProductionBrief.overallStyle.editingStyle}</p>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Color Grading</h4>
              <p className="text-[#e7e7e7]/80">{postProductionBrief.overallStyle.colorGradingPalette}</p>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Music Genre</h4>
              <p className="text-[#e7e7e7]/80">{postProductionBrief.overallStyle.musicGenre}</p>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h4 className="font-semibold text-[#e2c376] mb-2">Pacing Notes</h4>
              <p className="text-[#e7e7e7]/80">{postProductionBrief.overallStyle.pacingNotes}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Scene-by-Scene Guide */}
        <motion.div
          className="lg:col-span-2 bg-[#1a1a1a] border border-[#36393f] rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-[#2a2a2a] p-4 border-b border-[#36393f]">
            <h3 className="text-xl font-bold">Scene-by-Scene Guide</h3>
          </div>
          
          <div className="p-4">
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {postProductionBrief.sceneBySceneGuide.map((scene, index) => (
                  <motion.div
                    key={`scene-${index}`}
                    variants={itemVariants}
                    className={`border border-[#36393f] rounded-lg overflow-hidden transition-all ${activeScene === index ? 'bg-[#2a2a2a]/50' : 'bg-[#2a2a2a]/20'}`}
                  >
                    {/* Scene Header */}
                    <div 
                      className="p-3 cursor-pointer hover:bg-[#36393f]/30 flex items-center justify-between transition-colors"
                      onClick={() => setActiveScene(activeScene === index ? null : index)}
                    >
                      <div className="font-medium">{scene.sceneName}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getPacingColor(scene.pacing)}`}>
                        {scene.pacing}
                      </div>
                    </div>
                    
                    {/* Expanded Scene Details */}
                    {activeScene === index && (
                      <div className="p-4 border-t border-[#36393f]/50 bg-[#1a1a1a]/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Transitions</h5>
                            <p className="text-xs text-[#e7e7e7]/70 mb-3">{scene.transitions}</p>
                            
                            <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Emotional Keywords</h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {scene.emotionalKeywords.map((keyword, kidx) => (
                                <span 
                                  key={`keyword-${index}-${kidx}`}
                                  className="text-xs px-2 py-1 bg-[#36393f] rounded-full"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            
                            <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Color Grading</h5>
                            <p className="text-xs text-[#e7e7e7]/70">{scene.colorGrading}</p>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Sound Design</h5>
                            <p className="text-xs text-[#e7e7e7]/70 mb-3">{scene.soundDesign}</p>
                            
                            <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Music Cues</h5>
                            <p className="text-xs text-[#e7e7e7]/70 mb-3">{scene.musicCues}</p>
                            
                            {scene.specialNotes && (
                              <>
                                <h5 className="text-xs font-semibold text-[#e2c376] mb-1">Special Notes</h5>
                                <p className="text-xs text-[#e7e7e7]/70">{scene.specialNotes}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Key Moments & Technical Requirements */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Key Moments */}
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl overflow-hidden">
            <div className="bg-[#2a2a2a] p-4 border-b border-[#36393f]">
              <h3 className="font-bold">Key Moments</h3>
            </div>
            
            <div className="p-4">
              <div className="max-h-[250px] overflow-y-auto pr-2">
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {postProductionBrief.keyMoments.map((moment, index) => (
                    <motion.div
                      key={`moment-${index}`}
                      variants={itemVariants}
                      className="bg-[#2a2a2a]/50 border border-[#36393f] rounded-lg p-3"
                    >
                      <div className="text-sm font-medium text-[#e2c376] mb-1">{moment.description}</div>
                      <div className="text-xs text-[#e7e7e7]/50 mb-2">{moment.timestamp}</div>
                      <div className="text-xs text-[#e7e7e7]/70 mb-1">
                        <span className="font-medium">Editing Notes:</span> {moment.editingNotes}
                      </div>
                      <div className="text-xs text-[#e7e7e7]/70">
                        <span className="font-medium">Importance:</span> {moment.importance}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Technical Requirements */}
          <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl overflow-hidden">
            <div className="bg-[#2a2a2a] p-4 border-b border-[#36393f]">
              <h3 className="font-bold">Technical Requirements</h3>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#e2c376] mb-2">Visual Effects</h4>
                  <ul className="space-y-1">
                    {postProductionBrief.technicalRequirements.visualEffects.map((effect, index) => (
                      <li 
                        key={`vfx-${index}`}
                        className="text-xs text-[#e7e7e7]/70 bg-[#2a2a2a]/50 p-2 rounded"
                      >
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#e2c376] mb-2">Sound Effects</h4>
                  <ul className="space-y-1">
                    {postProductionBrief.technicalRequirements.soundEffects.map((effect, index) => (
                      <li 
                        key={`sfx-${index}`}
                        className="text-xs text-[#e7e7e7]/70 bg-[#2a2a2a]/50 p-2 rounded"
                      >
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-[#e2c376] mb-2">Special Techniques</h4>
                  <ul className="space-y-1">
                    {postProductionBrief.technicalRequirements.specialTechniques.map((technique, index) => (
                      <li 
                        key={`technique-${index}`}
                        className="text-xs text-[#e7e7e7]/70 bg-[#2a2a2a]/50 p-2 rounded"
                      >
                        {technique}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
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
          Regenerate Post-Production Brief
        </button>
      </motion.div>
    </div>
  );
} 