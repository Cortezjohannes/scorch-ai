'use client';

import React from 'react';
import { motion } from '@/components/ui/ClientMotion';
import { useProject, Character } from '@/context/ProjectContext';
import Link from 'next/link';

export default function CharactersPage() {
  const { storyBible, loading, error } = useProject();

  // Define animation variants for staggered animation
  const containerVariants = {
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
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="w-12 h-12 border-4 border-t-[#e2c376] border-r-[#e2c37650] border-b-[#e2c37630] border-l-[#e2c37620] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6">
        <h3 className="text-red-500 font-medium mb-2">Error</h3>
        <p className="text-[#e7e7e7]/70">{error}</p>
      </div>
    );
  }

  // Show prompt to go to narrative tab if story bible is not available
  if (!storyBible || !storyBible.mainCharacters || storyBible.mainCharacters.length === 0) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">No Character Information</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          The story bible hasn't been generated yet or doesn't contain character information.
        </p>
        <Link href="./narrative" className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors">
          Go to Narrative Tab
        </Link>
      </div>
    );
  }

  // Determine character archetype color
  const getArchetypeColor = (archetype: string): string => {
    const archetypeMap: Record<string, string> = {
      'Hero': 'from-blue-500 to-blue-700',
      'Mentor': 'from-purple-500 to-purple-700',
      'Ally': 'from-green-500 to-green-700',
      'Trickster': 'from-yellow-500 to-yellow-700',
      'Shadow': 'from-red-500 to-red-700',
      'Herald': 'from-orange-500 to-orange-700',
      'Threshold Guardian': 'from-indigo-500 to-indigo-700',
      'Shapeshifter': 'from-pink-500 to-pink-700',
      'Villain': 'from-red-700 to-red-900',
      'Protector': 'from-blue-600 to-blue-800',
      'Rebel': 'from-red-500 to-red-700',
      'Skeptic': 'from-yellow-600 to-yellow-800',
      'Outsider': 'from-purple-600 to-purple-800',
      'Leader': 'from-green-600 to-green-800',
      'Jokester': 'from-amber-500 to-amber-700',
      'Reluctant Leader': 'from-blue-500 to-indigo-700'
    };
    
    // Check if the archetype contains any of the keys
    for (const key of Object.keys(archetypeMap)) {
      if (archetype.toLowerCase().includes(key.toLowerCase())) {
        return archetypeMap[key];
      }
    }
    
    // Default color if no match
    return 'from-gray-500 to-gray-700';
  };

  return (
    <div className="py-6">
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#e2c376]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Main Characters
      </motion.h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {storyBible.mainCharacters.map((character: Character, index: number) => (
          <motion.div 
            key={`${character.name}-${index}`} 
            className="bg-[#1a1a1a] border border-[#36393f] rounded-xl overflow-hidden hover:border-[#e2c376]/30 transition-colors"
            variants={itemVariants}
          >
            <div className={`h-2 bg-gradient-to-r ${getArchetypeColor(character.archetype)}`} />
            <div className="p-5">
              <h3 className="font-bold text-xl text-white mb-1">{character.name}</h3>
              
              <div className="inline-block px-3 py-1 rounded-full bg-[#36393f]/50 text-sm font-medium text-[#e7e7e7]/80 mb-4">
                {character.archetype}
              </div>
              
              <h4 className="font-semibold text-[#e2c376] mb-2">Character Arc</h4>
              <p className="text-[#e7e7e7]/70 mb-4 text-sm">{character.arc}</p>
              
              {character.description && (
                <>
                  <h4 className="font-semibold text-[#e2c376] mb-2">Description</h4>
                  <p className="text-[#e7e7e7]/70 text-sm">{character.description}</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 