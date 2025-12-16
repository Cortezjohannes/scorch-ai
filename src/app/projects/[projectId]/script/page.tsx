'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '@/components/ui/ClientMotion';
import { useProject, GeneratedEpisode } from '@/context/ProjectContext';
import Link from 'next/link';
import ScriptEditor from '@/components/ScriptEditor';
import ScriptExporter from '@/components/ScriptExporter';
import ShotListEditor from '@/components/ShotListEditor';
import CharacterAnalyzer from '@/components/CharacterAnalyzer';

type ViewMode = 'screenplay' | 'scenes' | 'characters' | 'notes' | 'shotlist';
type ScriptFormat = 'standard' | 'bbc' | 'sitcom';

interface SceneData {
  id: string;
  number: number;
  heading: string;
  location: string;
  timeOfDay: string;
  description: string;
  dialogues: DialogueData[];
  notes: string[];
}

interface DialogueData {
  character: string;
  dialogue: string;
  parenthetical?: string;
  action?: string;
}

export default function ScriptPage() {
  const { projectTitle, storyBible, episodes, loading, error } = useProject();
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(
    episodes.length > 0 ? episodes[0].episodeNumber : null
  );
  const [viewMode, setViewMode] = useState<ViewMode>('screenplay');
  const [scriptFormat, setScriptFormat] = useState<ScriptFormat>('standard');
  const [fontSize, setFontSize] = useState<number>(14);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [showShotList, setShowShotList] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  // Handle loading state
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

  // Handle error state
  if (error) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6">
        <h3 className="text-red-500 font-medium mb-2">Error</h3>
        <p className="text-[#e7e7e7]/70">{error}</p>
      </div>
    );
  }

  // Show prompt if no episodes have been generated
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-[#36393f]/30 border border-[#36393f] rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-[#e2c376] mb-4">No Episodes Generated</h2>
        <p className="text-[#e7e7e7]/80 mb-6">
          No episode scripts have been generated yet. Head over to the Narrative tab or Workspace to generate your story episodes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="./narrative" 
            className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
          >
            🎬 Generate Episodes
          </Link>
          <Link 
            href="/workspace" 
            className="px-6 py-3 bg-[#2a2a2a] border border-[#e2c376] text-[#e2c376] font-medium rounded-lg hover:bg-[#2a2a2a]/70 transition-colors"
          >
            📝 Go to Workspace
          </Link>
        </div>
      </div>
    );
  }

  // Find the currently selected episode
  const currentEpisode = episodes.find(ep => ep.episodeNumber === selectedEpisode);

  // Enhanced script parser with automatic dialog expansion
  const parseScript = (scriptText: string): SceneData[] => {
    if (!scriptText) return [];
    
    const lines = scriptText.split('\n');
    const scenes: SceneData[] = [];
    let currentScene: SceneData | null = null;
    let sceneCounter = 1;
    let i = 0;

    // Common character names to recognize
    const characterNames = new Set(['ALEX', 'SARAH', 'MIKE', 'JOHN', 'EMMA', 'DAVID', 'LISA', 'MARK', 'ANNA', 'PAUL']);
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Scene heading detection (INT./EXT.)
      if (line.match(/^(INT\.|EXT\.)/i)) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        
        const parts = line.split('-');
        const location = parts[0]?.replace(/^(INT\.|EXT\.)\s*/i, '').trim() || 'Unknown Location';
        const timeOfDay = line.includes('DAY') ? 'DAY' : 
                         line.includes('NIGHT') ? 'NIGHT' : 
                         line.includes('MORNING') ? 'MORNING' :
                         line.includes('EVENING') ? 'EVENING' : 'CONTINUOUS';
        
        currentScene = {
          id: `scene-${sceneCounter}`,
          number: sceneCounter++,
          heading: line,
          location,
          timeOfDay,
          description: '',
          dialogues: [],
          notes: []
        };
        i++;
        continue;
      }
      
      // Character name detection (refined logic)
      if (line && line === line.toUpperCase() && 
          (characterNames.has(line) || 
           (line.length >= 3 && line.length <= 20 && 
            line.match(/^[A-Z\s]+$/) && 
            !line.includes('INT.') && 
            !line.includes('EXT.') &&
            !line.includes('CUT TO') &&
            !line.includes('FADE') &&
            !line.includes('DISSOLVE')))) {
        
        if (currentScene && i + 1 < lines.length) {
          const dialogueLine = lines[i + 1]?.trim();
          
          // Check if next line looks like dialogue (not all caps, not empty, not scene heading)
          if (dialogueLine && 
              dialogueLine !== dialogueLine.toUpperCase() && 
              !dialogueLine.match(/^(INT\.|EXT\.)/i) &&
              !dialogueLine.startsWith('(') &&
              dialogueLine.length > 3) {
            
            // Look for parenthetical on the line after dialogue
            let parenthetical: string | undefined;
            if (i + 2 < lines.length && lines[i + 2]?.trim().startsWith('(')) {
              parenthetical = lines[i + 2].trim();
              i++; // Skip the parenthetical line
            }
            
            // Add expanded dialogue automatically
            const expandedDialogue = expandDialogue(dialogueLine, line);
            
            currentScene.dialogues.push({
              character: line,
              dialogue: expandedDialogue,
              parenthetical
            });
            
            characterNames.add(line); // Learn new character names
            i += 2; // Skip character and dialogue lines
            continue;
          }
        }
      }
      
      // Action/description lines (everything else that's not dialogue)
      if (currentScene && line && 
          line !== line.toUpperCase() && 
          !line.match(/^(INT\.|EXT\.)/i) &&
          !currentScene.dialogues.some(d => d.dialogue.includes(line))) {
        
        if (!currentScene.description) {
          currentScene.description = line;
        } else {
          currentScene.description += ' ' + line;
        }
      }
      
      i++;
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    // Auto-expand scenes that are too short
    return scenes.map(scene => expandScene(scene));
  };

  // Dialog expansion function
  const expandDialogue = (originalDialogue: string, characterName: string): string => {
    // If dialogue is too short, expand it naturally
    if (originalDialogue.length < 20) {
      const expansions = [
        `${originalDialogue} I've been thinking about this for a while now.`,
        `${originalDialogue} This is really important to me.`,
        `${originalDialogue} We need to talk about what happens next.`,
        `You know, ${originalDialogue.toLowerCase()} And I think we should consider all our options.`,
        `${originalDialogue} I hope you understand where I'm coming from.`
      ];
      return expansions[Math.floor(Math.random() * expansions.length)];
    }
    
    // Add natural conversation flow for longer dialogue
    const endings = [
      ' What do you think about that?',
      ' Does that make sense to you?',
      ' I hope I\'m explaining this clearly.',
      ' This is just my perspective, though.',
      ' I\'d love to hear your thoughts on this.'
    ];
    
    if (Math.random() > 0.6) {
      return originalDialogue + endings[Math.floor(Math.random() * endings.length)];
    }
    
    return originalDialogue;
  };

  // Scene expansion function
  const expandScene = (scene: SceneData): SceneData => {
    // If scene has too few dialogues, add some
    if (scene.dialogues.length < 3 && scene.dialogues.length > 0) {
      const characters = Array.from(new Set(scene.dialogues.map(d => d.character)));
      
      // Add response dialogues
      const additionalDialogues = [
        {
          character: characters[0] || 'ALEX',
          dialogue: 'I understand what you\'re saying, but have you considered the implications?',
          parenthetical: undefined
        },
        {
          character: characters[1] || 'SARAH', 
          dialogue: 'That\'s exactly what I was thinking. We\'re definitely on the same page here.',
          parenthetical: '(nodding thoughtfully)'
        }
      ];
      
      scene.dialogues.push(...additionalDialogues.slice(0, 3 - scene.dialogues.length));
    }
    
    return scene;
  };

  const scenes = currentEpisode ? parseScript(currentEpisode.script || '') : [];
  const characters = Array.from(new Set(scenes.flatMap(scene => scene.dialogues.map(d => d.character))));

  // Save script changes
  const handleSaveScript = (updatedScript: string) => {
    if (!currentEpisode) return;
    
    // TODO: Implement script saving to backend
    console.log('Saving script:', updatedScript);
    setShowEditor(false);
    
    // Update local state for now
    // In a real implementation, this would update the episode in the project context
  };

  // Handle export with options
  const handleExport = (options: any) => {
    if (!currentEpisode) return;
    
    const content = currentEpisode.script || '';
    let filename = `${projectTitle}-Episode-${currentEpisode.episodeNumber}`;
    let mimeType = 'text/plain';
    
    switch (options.format) {
      case 'fountain':
        filename += '.fountain';
        break;
      case 'html':
        filename += '.html';
        mimeType = 'text/html';
        break;
      case 'word':
        filename += '.docx';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      default:
        filename += '.txt';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExporter(false);
  };

  // Generate mock shot list data for demonstration
  const generateShotListData = () => {
    const mockScenes = scenes.map((scene, index) => ({
      id: scene.id,
      number: scene.number,
      title: scene.heading,
      location: scene.location,
      timeOfDay: scene.timeOfDay,
      description: scene.description,
      shots: [
        {
          id: `shot-${scene.id}-1`,
          number: `${scene.number}.1`,
          type: 'wide' as const,
          description: 'Establishing shot of the location',
          camera: {
            movement: 'static' as const,
            angle: 'eye-level' as const,
            lens: '35mm',
            focus: 'auto'
          },
          lighting: {
            setup: 'Natural lighting',
            mood: 'natural' as const,
            keyLight: 'Window left',
            fillLight: 'Bounce right',
            backLight: 'Natural'
          },
          audio: {
            dialogue: false,
            soundEffects: ['ambient'],
            music: false,
            ambient: 'Location ambience'
          },
          talent: [],
          props: [],
          wardrobe: [],
          makeup: 'Standard',
          duration: '5 seconds',
          notes: 'Set up establishing mood',
          priority: 'standard' as const,
          complexity: 'simple' as const,
          location: scene.location,
          timeOfDay: scene.timeOfDay
        }
      ],
      estimatedDuration: '5 minutes',
      setupTime: '15 minutes',
      complexity: 'moderate' as const,
      requiredCrew: ['Director', 'DP', 'Sound'],
      specialEquipment: [],
      weatherRequirements: '',
      safetyConsiderations: []
    }));
    return mockScenes;
  };

  const renderScreenplayView = () => (
    <div 
      ref={scriptRef}
      className="screenplay-container bg-white text-black p-8 mx-auto max-w-4xl rounded-lg shadow-lg"
      style={{ 
        fontSize: `${fontSize}px`,
        fontFamily: 'Courier, monospace',
        lineHeight: 1.6,
        minHeight: '800px'
      }}
    >
      {/* Title Page */}
      <div className="text-center mb-12 page-break">
        <h1 className="text-2xl font-bold mb-4 uppercase">{projectTitle}</h1>
        <h2 className="text-xl mb-8">Episode {currentEpisode?.episodeNumber}</h2>
        <div className="mt-16">
          <p className="mb-2">Written by</p>
          <p className="font-bold">AI Story Engine</p>
        </div>
      </div>

      {/* Script Content */}
      {scenes.map((scene, sceneIndex) => (
        <div key={scene.id} className="scene mb-8">
          {showLineNumbers && (
            <div className="text-gray-400 text-xs mb-1">Scene {scene.number}</div>
          )}
          
          {/* Scene Heading */}
          <div className="scene-heading font-bold uppercase mb-4 text-center">
            {scene.heading}
          </div>

          {/* Scene Description */}
          {scene.description && (
            <div className="action mb-4 max-w-6xl">
              {scene.description}
            </div>
          )}

          {/* Dialogues */}
          {scene.dialogues.map((dialogue, dialogueIndex) => (
            <div key={dialogueIndex} className="dialogue mb-4">
              <div className="character-name text-center font-bold uppercase mb-1 max-w-xs mx-auto">
                {dialogue.character}
              </div>
              {dialogue.parenthetical && (
                <div className="parenthetical text-center italic mb-1 max-w-sm mx-auto">
                  {dialogue.parenthetical}
                </div>
              )}
              <div className="dialogue-text max-w-md mx-auto text-center">
                {dialogue.dialogue}
              </div>
              {dialogue.action && (
                <div className="action mt-2 max-w-6xl">
                  {dialogue.action}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderScenesView = () => (
    <div className="space-y-6">
      {scenes.map((scene) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#e2c376] mb-2">
                Scene {scene.number}
              </h3>
              <p className="text-[#e7e7e7]/80 font-mono text-sm">
                {scene.heading}
              </p>
            </div>
            <div className="text-right text-sm text-[#e7e7e7]/60">
              <div>{scene.location}</div>
              <div>{scene.timeOfDay}</div>
            </div>
          </div>
          
          {scene.description && (
            <div className="mb-4 p-3 bg-[#36393f]/30 rounded border-l-4 border-[#e2c376]/50">
              <p className="text-[#e7e7e7]/90">{scene.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#e2c376]/80 uppercase tracking-wide">
              Dialogue ({scene.dialogues.length} lines)
            </h4>
            {scene.dialogues.map((dialogue, index) => (
              <div key={index} className="flex gap-3 p-2 hover:bg-[#36393f]/20 rounded">
                <div className="text-[#e2c376] font-semibold min-w-[100px] text-sm">
                  {dialogue.character}:
                </div>
                <div className="text-[#e7e7e7]/90 text-sm flex-1">
                  {dialogue.dialogue}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCharactersView = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCharacter('')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            selectedCharacter === '' ? 'bg-[#e2c376] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
          }`}
        >
          All Characters
        </button>
        {characters.map((character) => (
          <button
            key={character}
            onClick={() => setSelectedCharacter(character)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedCharacter === character ? 'bg-[#e2c376] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
            }`}
          >
            {character}
          </button>
        ))}
      </div>

      {characters
        .filter(character => selectedCharacter === '' || character === selectedCharacter)
        .map((character) => {
          const characterDialogues = scenes.flatMap(scene => 
            scene.dialogues
              .filter(d => d.character === character)
              .map(d => ({ ...d, sceneNumber: scene.number, sceneHeading: scene.heading }))
          );

          return (
            <motion.div
              key={character}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#e2c376]">{character}</h3>
                <span className="text-sm text-[#e7e7e7]/60 bg-[#36393f]/50 px-2 py-1 rounded">
                  {characterDialogues.length} lines
                </span>
              </div>
              
              <div className="space-y-3">
                {characterDialogues.map((dialogue, index) => (
                  <div key={index} className="p-3 bg-[#36393f]/20 rounded border-l-4 border-[#e2c376]/30">
                    <div className="text-xs text-[#e7e7e7]/50 mb-1">
                      Scene {dialogue.sceneNumber} - {dialogue.sceneHeading}
                    </div>
                    <p className="text-[#e7e7e7]/90">{dialogue.dialogue}</p>
                    {dialogue.parenthetical && (
                      <p className="text-sm text-[#e7e7e7]/60 italic mt-1">{dialogue.parenthetical}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
    </div>
  );

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[#1a1a1a]' : ''} transition-all duration-300`}>
      <div className={`${isFullscreen ? 'h-full overflow-auto' : ''} py-6 px-4`}>
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <h2 className="text-2xl font-bold text-[#e2c376]">
            {projectTitle} - Professional Scripts
          </h2>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex border border-[#36393f] rounded-lg overflow-hidden">
              {[
                { mode: 'screenplay', icon: '📄', label: 'Script' },
                { mode: 'scenes', icon: '🎬', label: 'Scenes' },
                { mode: 'characters', icon: '👥', label: 'Characters' },
                { mode: 'shotlist', icon: '🎯', label: 'Shot List' },
                { mode: 'notes', icon: '📝', label: 'Notes' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode 
                      ? 'bg-[#e2c376] text-black' 
                      : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
                  }`}
                >
                  <span className="mr-1">{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Tools */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="px-3 py-2 bg-[#2a2a2a] text-[#e7e7e7]/80 rounded-lg hover:bg-[#36393f] transition-colors text-sm"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? '🗗' : '⛶'}
              </button>
              
              <div className="relative">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="px-3 py-2 bg-[#2a2a2a] text-[#e7e7e7]/80 rounded-lg border border-[#36393f] text-sm"
                >
                  <option value={12}>12pt</option>
                  <option value={14}>14pt</option>
                  <option value={16}>16pt</option>
                  <option value={18}>18pt</option>
                </select>
              </div>

              {currentEpisode && (
                <>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="px-3 py-2 bg-[#36393f] text-[#e7e7e7] rounded-lg hover:bg-[#4f535a] transition-colors text-sm font-medium"
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => setShowExporter(true)}
                    className="px-3 py-2 bg-[#e2c376] text-black rounded-lg hover:bg-[#d4b46a] transition-colors text-sm font-medium"
                  >
                    📥 Export
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      
      {/* Episode Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {episodes.map((episode: GeneratedEpisode) => (
          <button
            key={`episode-${episode.episodeNumber}`}
            onClick={() => setSelectedEpisode(episode.episodeNumber)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedEpisode === episode.episodeNumber 
                  ? 'bg-[#e2c376] text-black shadow-lg' 
                  : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
              }`}
            >
              <span>🎬</span>
              <span>Episode {episode.episodeNumber}</span>
              {episode.script && <span className="text-xs opacity-70">✓</span>}
          </button>
        ))}
      </div>
      
        {/* Search and Filters */}
        {currentEpisode && (
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search script content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg text-[#e7e7e7] placeholder-[#e7e7e7]/50 focus:border-[#e2c376] focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-[#e7e7e7]/80">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded"
                />
                Line Numbers
              </label>
            </div>
          </div>
        )}
        
        {/* Content Display */}
        <AnimatePresence mode="wait">
          {currentEpisode && (
            <motion.div
              key={`${currentEpisode.episodeNumber}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
                            {viewMode === 'screenplay' && renderScreenplayView()}
              {viewMode === 'scenes' && renderScenesView()}
              {viewMode === 'characters' && (
                <div className="h-[700px] border border-[#36393f] rounded-lg overflow-hidden">
                  <CharacterAnalyzer
                    scenes={scenes}
                    projectTitle={projectTitle}
                  />
                </div>
              )}
              {viewMode === 'shotlist' && (
                <div className="h-[600px] border border-[#36393f] rounded-lg overflow-hidden">
                  <ShotListEditor 
                    initialScenes={generateShotListData()}
                    onSave={(scenes) => console.log('Saving shot list:', scenes)}
                    readonly={false}
                  />
                </div>
              )}
              {viewMode === 'notes' && (
                <div className="bg-[#2a2a2a] border border-[#36393f] rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold text-[#e2c376] mb-4">Production Notes</h3>
                  <p className="text-[#e7e7e7]/70">
                    Notes and annotations feature coming soon. This will include director's notes, 
                    production comments, and collaborative feedback.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-[#36393f]/30 rounded-lg p-4">
                      <h4 className="font-semibold text-[#e2c376] mb-2">🎬 Director's Notes</h4>
                      <p className="text-sm text-[#e7e7e7]/70">
                        Scene-specific notes, performance directions, and creative vision documentation.
                      </p>
                    </div>
                    <div className="bg-[#36393f]/30 rounded-lg p-4">
                      <h4 className="font-semibold text-[#e2c376] mb-2">📝 Script Comments</h4>
                      <p className="text-sm text-[#e7e7e7]/70">
                        Collaborative annotations, revision suggestions, and feedback tracking.
                      </p>
                    </div>
                    <div className="bg-[#36393f]/30 rounded-lg p-4">
                      <h4 className="font-semibold text-[#e2c376] mb-2">🎯 Production Notes</h4>
                      <p className="text-sm text-[#e7e7e7]/70">
                        Location requirements, equipment lists, and logistical considerations.
                      </p>
                    </div>
                  </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
        {/* Navigation */}
        {currentEpisode && !isFullscreen && (
          <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              const currentIndex = episodes.findIndex(ep => ep.episodeNumber === selectedEpisode);
              if (currentIndex > 0) {
                setSelectedEpisode(episodes[currentIndex - 1].episodeNumber);
              }
            }}
            disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === 0}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === 0
                ? 'bg-[#2a2a2a]/50 text-[#e7e7e7]/40 cursor-not-allowed' 
                  : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
              }`}
          >
              <span>←</span>
              <span>Previous Episode</span>
          </button>
          
          <button
            onClick={() => {
              const currentIndex = episodes.findIndex(ep => ep.episodeNumber === selectedEpisode);
              if (currentIndex < episodes.length - 1) {
                setSelectedEpisode(episodes[currentIndex + 1].episodeNumber);
              }
            }}
            disabled={episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === episodes.length - 1}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                episodes.findIndex(ep => ep.episodeNumber === selectedEpisode) === episodes.length - 1
                ? 'bg-[#2a2a2a]/50 text-[#e7e7e7]/40 cursor-not-allowed' 
                  : 'bg-[#2a2a2a] text-[#e7e7e7]/80 hover:bg-[#36393f]'
              }`}
          >
              <span>Next Episode</span>
              <span>→</span>
          </button>
        </div>
              )}
      </div>

      {/* Modals */}
      {showEditor && currentEpisode && (
        <ScriptEditor
          initialScript={currentEpisode.script || ''}
          onSave={handleSaveScript}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {showExporter && currentEpisode && (
        <ScriptExporter
          scriptContent={currentEpisode.script || ''}
          projectTitle={projectTitle}
          episodeNumber={currentEpisode.episodeNumber}
          onExport={handleExport}
          onClose={() => setShowExporter(false)}
        />
      )}
    </div>
  );
}