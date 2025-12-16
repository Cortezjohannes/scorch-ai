'use client';

import React from 'react';
import { motion } from '@/components/ui/ClientMotion';
import { useProject, PropsAndWardrobe } from '@/context/ProjectContext';

export default function PropsWardrobePage() {
  const { storyBible, generatePropsAndWardrobe, isGeneratingAsset, error } = useProject();
  const propsAndWardrobe = storyBible?.propsAndWardrobe;
  const isGenerating = isGeneratingAsset('props_wardrobe');

  // Animation variants for list items
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
    await generatePropsAndWardrobe();
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
        <p className="text-[#e7e7e7]/70 text-lg">Analyzing script and generating props & wardrobe list...</p>
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

  // If no props and wardrobe data exists yet, show generate button
  if (!propsAndWardrobe) {
    return (
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-8 mt-4">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">Props & Wardrobe List</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          Generate a comprehensive list of all props and costume items needed for your production. The AI will analyze your script and identify items organized by scene and character.
        </p>
        <button 
          onClick={handleGenerateGuide}
          className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors flex items-center gap-2"
        >
          <span>Generate Props & Wardrobe List</span>
        </button>
      </div>
    );
  }

  // Display the generated props and wardrobe data
  return (
    <div className="py-6">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#e2c376]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Props & Wardrobe
      </motion.h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Props Section */}
        <motion.div
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Props</h3>
          
          <div className="space-y-6">
            {propsAndWardrobe.props.map((sceneProps, index) => (
              <motion.div 
                key={`props-scene-${index}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="border-t border-[#36393f] pt-4 first:border-0 first:pt-0"
              >
                <h4 className="font-bold text-[#e7e7e7] mb-3">{sceneProps.sceneName}</h4>
                <ul className="space-y-3">
                  {sceneProps.items.map((item, itemIndex) => (
                    <motion.li 
                      key={`props-item-${index}-${itemIndex}`}
                      variants={itemVariants}
                      className="bg-[#2a2a2a] rounded-lg p-4"
                    >
                      <div className="font-medium text-[#e2c376]">{item.name}</div>
                      <div className="text-sm text-[#e7e7e7]/80 mt-1">{item.description}</div>
                      
                      {item.character && (
                        <div className="mt-2 text-xs text-[#e7e7e7]/60">
                          <span className="font-medium">Character:</span> {item.character}
                        </div>
                      )}
                      
                      {item.significance && (
                        <div className="mt-1 text-xs text-[#e7e7e7]/60">
                          <span className="font-medium">Significance:</span> {item.significance}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Wardrobe Section */}
        <motion.div
          className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-4">Wardrobe</h3>
          
          <div className="space-y-6">
            {propsAndWardrobe.wardrobe.map((characterWardrobe, index) => (
              <motion.div 
                key={`wardrobe-char-${index}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="border-t border-[#36393f] pt-4 first:border-0 first:pt-0"
              >
                <h4 className="font-bold text-[#e7e7e7] mb-3">{characterWardrobe.character}</h4>
                <ul className="space-y-3">
                  {characterWardrobe.items.map((item, itemIndex) => (
                    <motion.li 
                      key={`wardrobe-item-${index}-${itemIndex}`}
                      variants={itemVariants}
                      className="bg-[#2a2a2a] rounded-lg p-4"
                    >
                      <div className="font-medium text-[#e2c376] text-sm">{item.sceneName}</div>
                      <div className="text-sm text-[#e7e7e7]/80 mt-2">{item.description}</div>
                      
                      {item.notes && (
                        <div className="mt-2 text-xs text-[#e7e7e7]/60">
                          <span className="font-medium">Notes:</span> {item.notes}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
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
          Regenerate Props & Wardrobe List
        </button>
      </motion.div>
    </div>
  );
} 