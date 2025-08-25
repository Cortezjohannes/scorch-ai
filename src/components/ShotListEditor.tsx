'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Shot {
  id: string;
  number: string;
  type: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'over-shoulder' | 'point-of-view' | 'insert' | 'establishing';
  description: string;
  camera: {
    movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'steadicam' | 'handheld' | 'crane' | 'drone';
    angle: 'eye-level' | 'high' | 'low' | 'birds-eye' | 'worms-eye' | 'dutch';
    lens: string;
    focus: string;
  };
  lighting: {
    setup: string;
    mood: 'bright' | 'natural' | 'moody' | 'dramatic' | 'romantic' | 'ominous' | 'clinical';
    keyLight: string;
    fillLight: string;
    backLight: string;
  };
  audio: {
    dialogue: boolean;
    soundEffects: string[];
    music: boolean;
    ambient: string;
  };
  talent: string[];
  props: string[];
  wardrobe: string[];
  makeup: string;
  duration: string;
  notes: string;
  priority: 'critical' | 'important' | 'standard' | 'optional';
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  location: string;
  timeOfDay: string;
}

interface Scene {
  id: string;
  number: number;
  title: string;
  location: string;
  timeOfDay: string;
  description: string;
  shots: Shot[];
  estimatedDuration: string;
  setupTime: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  requiredCrew: string[];
  specialEquipment: string[];
  weatherRequirements: string;
  safetyConsiderations: string[];
}

interface ShotListEditorProps {
  initialScenes: Scene[];
  onSave: (scenes: Scene[]) => void;
  readonly?: boolean;
}

export default function ShotListEditor({ initialScenes, onSave, readonly = false }: ShotListEditorProps) {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    initialScenes.length > 0 ? initialScenes[0].id : null
  );
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'timeline'>('cards');
  const [filterBy, setFilterBy] = useState<'all' | 'priority' | 'complexity' | 'location'>('all');
  const [sortBy, setSortBy] = useState<'number' | 'priority' | 'complexity' | 'duration'>('number');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);

  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  const addScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      number: scenes.length + 1,
      title: 'New Scene',
      location: '',
      timeOfDay: 'DAY',
      description: '',
      shots: [],
      estimatedDuration: '5 minutes',
      setupTime: '15 minutes',
      complexity: 'simple',
      requiredCrew: [],
      specialEquipment: [],
      weatherRequirements: '',
      safetyConsiderations: []
    };
    setScenes(prev => [...prev, newScene]);
    setSelectedSceneId(newScene.id);
  };

  const addShot = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      number: `${scene.number}.${scene.shots.length + 1}`,
      type: 'medium',
      description: '',
      camera: {
        movement: 'static',
        angle: 'eye-level',
        lens: '50mm',
        focus: 'auto'
      },
      lighting: {
        setup: 'Standard 3-point',
        mood: 'natural',
        keyLight: 'Key left',
        fillLight: 'Fill right',
        backLight: 'Back center'
      },
      audio: {
        dialogue: false,
        soundEffects: [],
        music: false,
        ambient: ''
      },
      talent: [],
      props: [],
      wardrobe: [],
      makeup: 'Standard',
      duration: '10 seconds',
      notes: '',
      priority: 'standard',
      complexity: 'simple',
      location: scene.location,
      timeOfDay: scene.timeOfDay
    };

    setScenes(prev => prev.map(s => 
      s.id === sceneId 
        ? { ...s, shots: [...s.shots, newShot] }
        : s
    ));
    setSelectedShotId(newShot.id);
  };

  const updateShot = (sceneId: string, shotId: string, updates: Partial<Shot>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? {
            ...scene,
            shots: scene.shots.map(shot => 
              shot.id === shotId ? { ...shot, ...updates } : shot
            )
          }
        : scene
    ));
  };

  const deleteShot = (sceneId: string, shotId: string) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, shots: scene.shots.filter(shot => shot.id !== shotId) }
        : scene
    ));
    setSelectedShotId(null);
  };

  const moveShot = (sceneId: string, shotId: string, direction: 'up' | 'down') => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const shotIndex = scene.shots.findIndex(s => s.id === shotId);
    if (
      (direction === 'up' && shotIndex === 0) ||
      (direction === 'down' && shotIndex === scene.shots.length - 1)
    ) return;

    const newShots = [...scene.shots];
    const shot = newShots[shotIndex];
    newShots.splice(shotIndex, 1);
    newShots.splice(direction === 'up' ? shotIndex - 1 : shotIndex + 1, 0, shot);

    // Renumber shots
    newShots.forEach((shot, index) => {
      shot.number = `${scene.number}.${index + 1}`;
    });

    setScenes(prev => prev.map(s => 
      s.id === sceneId ? { ...s, shots: newShots } : s
    ));
  };

  const getPriorityColor = (priority: Shot['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'important': return 'text-orange-400 bg-orange-400/10';
      case 'standard': return 'text-blue-400 bg-blue-400/10';
      case 'optional': return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getComplexityColor = (complexity: Shot['complexity']) => {
    switch (complexity) {
      case 'simple': return 'text-green-400 bg-green-400/10';
      case 'moderate': return 'text-yellow-400 bg-yellow-400/10';
      case 'complex': return 'text-orange-400 bg-orange-400/10';
      case 'very-complex': return 'text-red-400 bg-red-400/10';
    }
  };

  const renderShotCard = (shot: Shot, sceneId: string) => (
    <motion.div
      key={shot.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[#2a2a2a] border rounded-lg p-4 cursor-pointer transition-all ${
        selectedShotId === shot.id 
          ? 'border-[#e2c376] shadow-lg shadow-[#e2c376]/20' 
          : 'border-[#36393f] hover:border-[#e2c376]/50'
      }`}
      onClick={() => setSelectedShotId(selectedShotId === shot.id ? null : shot.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-[#e2c376] text-lg">Shot {shot.number}</h4>
          <p className="text-sm text-[#e7e7e7]/70">{shot.type.replace('-', ' ').toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(shot.priority)}`}>
            {shot.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(shot.complexity)}`}>
            {shot.complexity}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#e7e7e7]/90 mb-3">{shot.description || 'No description'}</p>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-[#e7e7e7]/60 mb-3">
        <div>📷 {shot.camera.movement} • {shot.camera.angle}</div>
        <div>⏱️ {shot.duration}</div>
        <div>💡 {shot.lighting.mood}</div>
        <div>👥 {shot.talent.length} talent</div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {selectedShotId === shot.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#36393f] pt-3 mt-3"
          >
            {showTechnicalDetails && (
              <div className="space-y-3">
                {/* Camera Details */}
                <div>
                  <h5 className="font-semibold text-[#e2c376] mb-2">Camera</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Movement: {shot.camera.movement}</div>
                    <div>Angle: {shot.camera.angle}</div>
                    <div>Lens: {shot.camera.lens}</div>
                    <div>Focus: {shot.camera.focus}</div>
                  </div>
                </div>

                {/* Lighting */}
                <div>
                  <h5 className="font-semibold text-[#e2c376] mb-2">Lighting</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Setup: {shot.lighting.setup}</div>
                    <div>Mood: {shot.lighting.mood}</div>
                    <div>Key: {shot.lighting.keyLight}</div>
                    <div>Fill: {shot.lighting.fillLight}</div>
                  </div>
                </div>

                {/* Talent & Props */}
                <div>
                  <h5 className="font-semibold text-[#e2c376] mb-2">Production</h5>
                  <div className="space-y-1 text-sm">
                    <div>Talent: {shot.talent.join(', ') || 'None'}</div>
                    <div>Props: {shot.props.join(', ') || 'None'}</div>
                    <div>Audio: {shot.audio.dialogue ? 'Dialogue' : 'No dialogue'}</div>
                  </div>
                </div>

                {/* Notes */}
                {shot.notes && (
                  <div>
                    <h5 className="font-semibold text-[#e2c376] mb-2">Notes</h5>
                    <p className="text-sm text-[#e7e7e7]/80">{shot.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Controls */}
            {!readonly && (
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#36393f]">
                <div className="flex gap-2">
                  <button
                    onClick={() => moveShot(sceneId, shot.id, 'up')}
                    className="px-2 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-xs hover:bg-[#4f535a]"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveShot(sceneId, shot.id, 'down')}
                    className="px-2 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-xs hover:bg-[#4f535a]"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {/* Open edit modal */}}
                    className="px-3 py-1 bg-[#e2c376] text-black rounded text-xs hover:bg-[#d4b46a]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteShot(sceneId, shot.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-[#36393f]">
        <div>
          <h2 className="text-2xl font-bold text-[#e2c376]">Shot List & Scene Breakdown</h2>
          <p className="text-[#e7e7e7]/70 mt-1">
            Professional production planning and shot tracking
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex border border-[#36393f] rounded-lg overflow-hidden">
            {[
              { mode: 'cards', icon: '📋', label: 'Cards' },
              { mode: 'list', icon: '📝', label: 'List' },
              { mode: 'timeline', icon: '📊', label: 'Timeline' }
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-2 text-sm ${
                  viewMode === mode 
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
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className={`px-3 py-2 text-sm rounded ${
                showTechnicalDetails 
                  ? 'bg-[#e2c376] text-black' 
                  : 'bg-[#2a2a2a] text-[#e7e7e7] border border-[#36393f]'
              }`}
            >
              📐 Tech Details
            </button>
            {!readonly && (
              <button
                onClick={() => onSave(scenes)}
                className="px-4 py-2 bg-[#e2c376] text-black rounded font-medium hover:bg-[#d4b46a]"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Scene Sidebar */}
        <div className="w-80 border-r border-[#36393f] bg-[#2a2a2a]/30">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[#e2c376]">Scenes</h3>
              {!readonly && (
                <button
                  onClick={addScene}
                  className="px-3 py-1 bg-[#e2c376] text-black rounded text-sm hover:bg-[#d4b46a]"
                >
                  + Scene
                </button>
              )}
            </div>

            <div className="space-y-2">
              {scenes.map((scene) => (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSceneId === scene.id 
                      ? 'bg-[#e2c376]/20 border border-[#e2c376]' 
                      : 'bg-[#36393f]/30 hover:bg-[#36393f]/50'
                  }`}
                  onClick={() => setSelectedSceneId(scene.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Scene {scene.number}</h4>
                      <p className="text-sm text-[#e7e7e7]/70">{scene.title}</p>
                      <p className="text-xs text-[#e7e7e7]/50 mt-1">
                        {scene.location} • {scene.timeOfDay}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[#e7e7e7]/60">
                      <div>{scene.shots.length} shots</div>
                      <div className={getComplexityColor(scene.complexity)}>
                        {scene.complexity}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Shot Details */}
        <div className="flex-1 overflow-auto">
          {selectedScene ? (
            <div className="p-6">
              {/* Scene Header */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#e2c376]">
                      Scene {selectedScene.number}: {selectedScene.title}
                    </h3>
                    <p className="text-[#e7e7e7]/70 mt-1">{selectedScene.description}</p>
                  </div>
                  {!readonly && (
                    <button
                      onClick={() => addShot(selectedScene.id)}
                      className="px-4 py-2 bg-[#e2c376] text-black rounded font-medium hover:bg-[#d4b46a]"
                    >
                      + Add Shot
                    </button>
                  )}
                </div>

                {/* Scene Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#36393f]/20 rounded-lg">
                  <div>
                    <div className="text-xs text-[#e7e7e7]/60 uppercase tracking-wide">Location</div>
                    <div className="text-sm font-medium">{selectedScene.location}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#e7e7e7]/60 uppercase tracking-wide">Time</div>
                    <div className="text-sm font-medium">{selectedScene.timeOfDay}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#e7e7e7]/60 uppercase tracking-wide">Duration</div>
                    <div className="text-sm font-medium">{selectedScene.estimatedDuration}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#e7e7e7]/60 uppercase tracking-wide">Setup</div>
                    <div className="text-sm font-medium">{selectedScene.setupTime}</div>
                  </div>
                </div>
              </div>

              {/* Shots */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#e2c376]">
                  Shots ({selectedScene.shots.length})
                </h4>
                
                {selectedScene.shots.length > 0 ? (
                  <div className="grid gap-4">
                    {selectedScene.shots.map((shot) => renderShotCard(shot, selectedScene.id))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#e7e7e7]/50">
                    <p>No shots in this scene yet.</p>
                    {!readonly && (
                      <button
                        onClick={() => addShot(selectedScene.id)}
                        className="mt-4 px-4 py-2 bg-[#e2c376] text-black rounded font-medium hover:bg-[#d4b46a]"
                      >
                        Add First Shot
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#e7e7e7]/50">
              <div className="text-center">
                <p className="text-lg">Select a scene to view shot details</p>
                <p className="text-sm mt-2">Choose from the scenes list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
