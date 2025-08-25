'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueLine {
  text: string;
  emotion: string;
  sceneNumber: number;
  sceneHeading: string;
  wordCount: number;
  timeCode?: string;
}

interface CharacterStats {
  name: string;
  totalLines: number;
  totalWords: number;
  scenesAppeared: number;
  averageWordsPerLine: number;
  emotionalRange: { [emotion: string]: number };
  dialogueComplexity: 'simple' | 'moderate' | 'complex';
  characterArc: 'static' | 'developing' | 'transformative';
  relationshipMap: { [character: string]: number };
  keyQuotes: string[];
  speechPatterns: {
    avgSentenceLength: number;
    vocabularyDiversity: number;
    commonWords: string[];
    uniquePhrases: string[];
  };
}

interface CharacterAnalyzerProps {
  scenes: Array<{
    id: string;
    number: number;
    heading: string;
    dialogues: Array<{
      character: string;
      dialogue: string;
      parenthetical?: string;
    }>;
  }>;
  projectTitle: string;
}

export default function CharacterAnalyzer({ scenes, projectTitle }: CharacterAnalyzerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [analysisView, setAnalysisView] = useState<'overview' | 'dialogue' | 'relationships' | 'arc'>('overview');
  const [sortBy, setSortBy] = useState<'lines' | 'words' | 'scenes' | 'complexity'>('lines');
  const [showOnlyMainCharacters, setShowOnlyMainCharacters] = useState(false);

  // Extract and analyze all characters
  const characterStats = useMemo(() => {
    const stats: { [name: string]: CharacterStats } = {};
    
    scenes.forEach(scene => {
      scene.dialogues.forEach(dialogue => {
        const character = dialogue.character;
        if (!stats[character]) {
          stats[character] = {
            name: character,
            totalLines: 0,
            totalWords: 0,
            scenesAppeared: 0,
            averageWordsPerLine: 0,
            emotionalRange: {},
            dialogueComplexity: 'simple',
            characterArc: 'static',
            relationshipMap: {},
            keyQuotes: [],
            speechPatterns: {
              avgSentenceLength: 0,
              vocabularyDiversity: 0,
              commonWords: [],
              uniquePhrases: []
            }
          };
        }

        const words = dialogue.dialogue.split(/\s+/).length;
        stats[character].totalLines++;
        stats[character].totalWords += words;

        // Count unique scenes
        const scenesSet = new Set();
        scenes.forEach(s => {
          if (s.dialogues.some(d => d.character === character)) {
            scenesSet.add(s.number);
          }
        });
        stats[character].scenesAppeared = scenesSet.size;

        // Analyze emotional range (simplified)
        const emotion = dialogue.parenthetical?.toLowerCase() || 'neutral';
        stats[character].emotionalRange[emotion] = (stats[character].emotionalRange[emotion] || 0) + 1;

        // Track relationships (who they speak with in same scenes)
        scene.dialogues.forEach(otherDialogue => {
          if (otherDialogue.character !== character) {
            stats[character].relationshipMap[otherDialogue.character] = 
              (stats[character].relationshipMap[otherDialogue.character] || 0) + 1;
          }
        });
      });
    });

    // Calculate derived stats
    Object.values(stats).forEach(character => {
      character.averageWordsPerLine = character.totalWords / character.totalLines;
      
      // Determine complexity based on vocabulary and sentence structure
      if (character.averageWordsPerLine > 15) {
        character.dialogueComplexity = 'complex';
      } else if (character.averageWordsPerLine > 8) {
        character.dialogueComplexity = 'moderate';
      }

      // Determine character arc based on emotional range and scene presence
      const emotionCount = Object.keys(character.emotionalRange).length;
      if (emotionCount > 5 && character.scenesAppeared > 3) {
        character.characterArc = 'transformative';
      } else if (emotionCount > 3 || character.scenesAppeared > 2) {
        character.characterArc = 'developing';
      }

      // Extract key quotes (longest lines)
      const allDialogues = scenes.flatMap(scene => 
        scene.dialogues
          .filter(d => d.character === character.name)
          .map(d => d.dialogue)
      );
      character.keyQuotes = allDialogues
        .sort((a, b) => b.length - a.length)
        .slice(0, 3);
    });

    return stats;
  }, [scenes]);

  const characters = Object.values(characterStats);
  const mainCharacters = characters.filter(c => c.totalLines >= 5 || c.scenesAppeared >= 2);
  const displayCharacters = showOnlyMainCharacters ? mainCharacters : characters;

  const sortedCharacters = [...displayCharacters].sort((a, b) => {
    switch (sortBy) {
      case 'lines': return b.totalLines - a.totalLines;
      case 'words': return b.totalWords - a.totalWords;
      case 'scenes': return b.scenesAppeared - a.scenesAppeared;
      case 'complexity': 
        const complexityOrder = { complex: 3, moderate: 2, simple: 1 };
        return complexityOrder[b.dialogueComplexity] - complexityOrder[a.dialogueComplexity];
      default: return b.totalLines - a.totalLines;
    }
  });

  const selectedCharacterData = selectedCharacter ? characterStats[selectedCharacter] : null;

  const getCharacterDialogues = (characterName: string) => {
    const dialogues: DialogueLine[] = [];
    scenes.forEach(scene => {
      scene.dialogues
        .filter(d => d.character === characterName)
        .forEach(dialogue => {
          dialogues.push({
            text: dialogue.dialogue,
            emotion: dialogue.parenthetical || 'neutral',
            sceneNumber: scene.number,
            sceneHeading: scene.heading,
            wordCount: dialogue.dialogue.split(/\s+/).length
          });
        });
    });
    return dialogues;
  };

  const getComplexityColor = (complexity: CharacterStats['dialogueComplexity']) => {
    switch (complexity) {
      case 'complex': return 'text-red-400 bg-red-400/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10';
      case 'simple': return 'text-green-400 bg-green-400/10';
    }
  };

  const getArcColor = (arc: CharacterStats['characterArc']) => {
    switch (arc) {
      case 'transformative': return 'text-purple-400 bg-purple-400/10';
      case 'developing': return 'text-blue-400 bg-blue-400/10';
      case 'static': return 'text-gray-400 bg-gray-400/10';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#36393f]/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#e2c376]">{characters.length}</div>
          <div className="text-sm text-[#e7e7e7]/70">Total Characters</div>
        </div>
        <div className="bg-[#36393f]/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#e2c376]">{mainCharacters.length}</div>
          <div className="text-sm text-[#e7e7e7]/70">Main Characters</div>
        </div>
        <div className="bg-[#36393f]/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#e2c376]">
            {characters.reduce((sum, c) => sum + c.totalLines, 0)}
          </div>
          <div className="text-sm text-[#e7e7e7]/70">Total Lines</div>
        </div>
        <div className="bg-[#36393f]/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#e2c376]">
            {Math.round(characters.reduce((sum, c) => sum + c.averageWordsPerLine, 0) / characters.length)}
          </div>
          <div className="text-sm text-[#e7e7e7]/70">Avg Words/Line</div>
        </div>
      </div>

      {/* Character List */}
      <div className="space-y-4">
        {sortedCharacters.map((character) => (
          <motion.div
            key={character.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#2a2a2a] border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCharacter === character.name 
                ? 'border-[#e2c376] shadow-lg shadow-[#e2c376]/20' 
                : 'border-[#36393f] hover:border-[#e2c376]/50'
            }`}
            onClick={() => setSelectedCharacter(
              selectedCharacter === character.name ? '' : character.name
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#e2c376] mb-2">{character.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[#e7e7e7]/60">Lines</div>
                    <div className="font-semibold">{character.totalLines}</div>
                  </div>
                  <div>
                    <div className="text-[#e7e7e7]/60">Words</div>
                    <div className="font-semibold">{character.totalWords.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[#e7e7e7]/60">Scenes</div>
                    <div className="font-semibold">{character.scenesAppeared}</div>
                  </div>
                  <div>
                    <div className="text-[#e7e7e7]/60">Avg Words/Line</div>
                    <div className="font-semibold">{Math.round(character.averageWordsPerLine)}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(character.dialogueComplexity)}`}>
                  {character.dialogueComplexity}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getArcColor(character.characterArc)}`}>
                  {character.characterArc}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedCharacter === character.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-[#36393f] pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Emotional Range */}
                    <div>
                      <h4 className="font-semibold text-[#e2c376] mb-3">Emotional Range</h4>
                      <div className="space-y-2">
                        {Object.entries(character.emotionalRange).map(([emotion, count]) => (
                          <div key={emotion} className="flex justify-between text-sm">
                            <span className="capitalize">{emotion}</span>
                            <span className="text-[#e7e7e7]/70">{count} times</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    <div>
                      <h4 className="font-semibold text-[#e2c376] mb-3">Key Relationships</h4>
                      <div className="space-y-2">
                        {Object.entries(character.relationshipMap)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([otherChar, interactions]) => (
                            <div key={otherChar} className="flex justify-between text-sm">
                              <span>{otherChar}</span>
                              <span className="text-[#e7e7e7]/70">{interactions} scenes</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Key Quotes */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-[#e2c376] mb-3">Key Quotes</h4>
                      <div className="space-y-2">
                        {character.keyQuotes.map((quote, index) => (
                          <div key={index} className="p-3 bg-[#36393f]/20 rounded border-l-4 border-[#e2c376]/30">
                            <p className="text-sm italic">"{quote}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderDialogueAnalysis = () => {
    if (!selectedCharacterData) {
      return (
        <div className="text-center py-12 text-[#e7e7e7]/50">
          <p>Select a character to analyze their dialogue patterns</p>
        </div>
      );
    }

    const dialogues = getCharacterDialogues(selectedCharacterData.name);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#e2c376]">
            {selectedCharacterData.name} - Dialogue Analysis
          </h3>
          <div className="text-sm text-[#e7e7e7]/70">
            {dialogues.length} lines analyzed
          </div>
        </div>

        <div className="space-y-4">
          {dialogues.map((dialogue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-[#e7e7e7]/50">
                  Scene {dialogue.sceneNumber} - {dialogue.sceneHeading}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-[#36393f]/50 px-2 py-1 rounded">{dialogue.wordCount} words</span>
                  <span className="bg-[#e2c376]/20 px-2 py-1 rounded">{dialogue.emotion}</span>
                </div>
              </div>
              <p className="text-[#e7e7e7]/90">"{dialogue.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#36393f]">
        <div>
          <h2 className="text-2xl font-bold text-[#e2c376]">Character Analysis</h2>
          <p className="text-[#e7e7e7]/70 mt-1">
            Deep dive into character development and dialogue patterns
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Analysis View Selector */}
          <div className="flex border border-[#36393f] rounded-lg overflow-hidden">
            {[
              { view: 'overview', icon: '📊', label: 'Overview' },
              { view: 'dialogue', icon: '💬', label: 'Dialogue' },
              { view: 'relationships', icon: '🔗', label: 'Relationships' },
              { view: 'arc', icon: '📈', label: 'Arc' }
            ].map(({ view, icon, label }) => (
              <button
                key={view}
                onClick={() => setAnalysisView(view as any)}
                className={`px-3 py-2 text-sm ${
                  analysisView === view 
                    ? 'bg-[#e2c376] text-black' 
                    : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
                }`}
              >
                {icon} <span className="hidden sm:inline ml-1">{label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-sm"
            >
              <option value="lines">Sort by Lines</option>
              <option value="words">Sort by Words</option>
              <option value="scenes">Sort by Scenes</option>
              <option value="complexity">Sort by Complexity</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-[#e7e7e7]/80">
              <input
                type="checkbox"
                checked={showOnlyMainCharacters}
                onChange={(e) => setShowOnlyMainCharacters(e.target.checked)}
                className="rounded"
              />
              Main Characters Only
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={analysisView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {analysisView === 'overview' && renderOverview()}
            {analysisView === 'dialogue' && renderDialogueAnalysis()}
            {analysisView === 'relationships' && (
              <div className="text-center py-12 text-[#e7e7e7]/50">
                <p>Relationship mapping coming soon...</p>
              </div>
            )}
            {analysisView === 'arc' && (
              <div className="text-center py-12 text-[#e7e7e7]/50">
                <p>Character arc analysis coming soon...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
