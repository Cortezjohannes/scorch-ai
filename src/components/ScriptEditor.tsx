'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ScriptEditorProps {
  initialScript: string;
  onSave: (script: string) => void;
  onCancel: () => void;
}

interface ScriptElement {
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  content: string;
  id: string;
}

export default function ScriptEditor({ initialScript, onSave, onCancel }: ScriptEditorProps) {
  const [elements, setElements] = useState<ScriptElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [autoFormat, setAutoFormat] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parseScriptToElements(initialScript);
  }, [initialScript]);

  const parseScriptToElements = (script: string) => {
    const lines = script.split('\n');
    const parsedElements: ScriptElement[] = [];
    let elementId = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let type: ScriptElement['type'] = 'action';
      
      // Determine element type based on formatting
      if (trimmed.match(/^(INT\.|EXT\.|FADE)/i)) {
        type = 'scene_heading';
      } else if (trimmed.match(/^[A-Z\s]+$/) && trimmed.length > 2 && trimmed.length < 30) {
        type = 'character';
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        type = 'parenthetical';
      } else if (trimmed.match(/^(CUT TO:|FADE TO:|DISSOLVE TO:)/i)) {
        type = 'transition';
      } else if (parsedElements[parsedElements.length - 1]?.type === 'character') {
        type = 'dialogue';
      }

      parsedElements.push({
        type,
        content: trimmed,
        id: `element-${elementId++}`
      });
    });

    setElements(parsedElements);
  };

  const updateElement = (id: string, content: string, type?: ScriptElement['type']) => {
    setElements(prev => prev.map(el => 
      el.id === id 
        ? { ...el, content, ...(type && { type }) }
        : el
    ));
  };

  const addElement = (afterId: string | null, type: ScriptElement['type'] = 'action') => {
    const newElement: ScriptElement = {
      type,
      content: '',
      id: `element-${Date.now()}`
    };

    if (afterId) {
      const index = elements.findIndex(el => el.id === afterId);
      const newElements = [...elements];
      newElements.splice(index + 1, 0, newElement);
      setElements(newElements);
    } else {
      setElements(prev => [...prev, newElement]);
    }

    setSelectedElement(newElement.id);
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex(el => el.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === elements.length - 1)
    ) return;

    const newElements = [...elements];
    const element = newElements[index];
    newElements.splice(index, 1);
    newElements.splice(direction === 'up' ? index - 1 : index + 1, 0, element);
    setElements(newElements);
  };

  const handleSave = () => {
    const script = elements.map(el => el.content).join('\n');
    onSave(script);
  };

  const getElementStyle = (type: ScriptElement['type']) => {
    switch (type) {
      case 'scene_heading':
        return 'font-bold uppercase text-center text-[#e2c376] py-2';
      case 'character':
        return 'font-bold uppercase text-center text-[#e2c376] mt-4 mb-1';
      case 'dialogue':
        return 'text-center max-w-md mx-auto px-12';
      case 'parenthetical':
        return 'text-center italic text-[#e7e7e7]/70 text-sm';
      case 'action':
        return 'my-2 max-w-6xl';
      case 'transition':
        return 'text-right font-bold uppercase text-[#e2c376] mt-4';
      default:
        return '';
    }
  };

  const renderElement = (element: ScriptElement, index: number) => {
    const isSelected = selectedElement === element.id;
    
    return (
      <motion.div
        key={element.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group ${isSelected ? 'ring-2 ring-[#e2c376] rounded' : ''}`}
        onClick={() => setSelectedElement(element.id)}
      >
        {/* Element Type Indicator */}
        <div className="absolute -left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            value={element.type}
            onChange={(e) => updateElement(element.id, element.content, e.target.value as ScriptElement['type'])}
            className="text-xs bg-[#2a2a2a] border border-[#36393f] rounded px-1 py-0.5"
          >
            <option value="scene_heading">Scene</option>
            <option value="action">Action</option>
            <option value="character">Character</option>
            <option value="dialogue">Dialogue</option>
            <option value="parenthetical">Parenthetical</option>
            <option value="transition">Transition</option>
          </select>
        </div>

        {/* Element Controls */}
        {isSelected && (
          <div className="absolute -right-16 top-0 flex flex-col gap-1">
            <button
              onClick={() => moveElement(element.id, 'up')}
              className="text-xs bg-[#2a2a2a] border border-[#36393f] rounded px-1 py-0.5 hover:bg-[#36393f]"
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              onClick={() => moveElement(element.id, 'down')}
              className="text-xs bg-[#2a2a2a] border border-[#36393f] rounded px-1 py-0.5 hover:bg-[#36393f]"
              disabled={index === elements.length - 1}
            >
              ↓
            </button>
            <button
              onClick={() => addElement(element.id)}
              className="text-xs bg-[#e2c376] text-black rounded px-1 py-0.5 hover:bg-[#d4b46a]"
            >
              +
            </button>
            <button
              onClick={() => deleteElement(element.id)}
              className="text-xs bg-red-500 text-white rounded px-1 py-0.5 hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Element Content */}
        <div className={getElementStyle(element.type)}>
          {isSelected ? (
            <textarea
              value={element.content}
              onChange={(e) => updateElement(element.id, e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-inherit font-inherit text-center"
              autoFocus
              rows={Math.max(1, Math.ceil(element.content.length / 60))}
              onBlur={() => setSelectedElement(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addElement(element.id);
                }
              }}
            />
          ) : (
            <div className="min-h-[1.5em] cursor-pointer">
              {element.content || (
                <span className="text-[#e7e7e7]/30 italic">
                  Click to edit {element.type.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#36393f]">
          <h2 className="text-xl font-bold text-[#e2c376]">Script Editor</h2>
          
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex border border-[#36393f] rounded-lg overflow-hidden">
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`px-3 py-1 text-sm ${!isPreviewMode ? 'bg-[#e2c376] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/80'}`}
              >
                Edit
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`px-3 py-1 text-sm ${isPreviewMode ? 'bg-[#e2c376] text-black' : 'bg-[#2a2a2a] text-[#e7e7e7]/80'}`}
              >
                Preview
              </button>
            </div>

            {/* Auto Format Toggle */}
            <label className="flex items-center gap-2 text-sm text-[#e7e7e7]/80">
              <input
                type="checkbox"
                checked={autoFormat}
                onChange={(e) => setAutoFormat(e.target.checked)}
                className="rounded"
              />
              Auto Format
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#e2c376] text-black rounded-lg hover:bg-[#d4b46a] transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-6">
          {isPreviewMode ? (
            // Preview Mode
            <div className="screenplay-container bg-white text-black p-8 mx-auto max-w-4xl rounded-lg">
              <div className="space-y-2">
                {elements.map((element, index) => (
                  <div key={element.id} className={getElementStyle(element.type)}>
                    {element.content}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div ref={editorRef} className="screenplay-container bg-[#2a2a2a] text-[#e7e7e7] p-8 mx-auto max-w-4xl rounded-lg relative">
              <div className="space-y-2">
                {elements.map((element, index) => renderElement(element, index))}
              </div>

              {/* Add Element Button */}
              <button
                onClick={() => addElement(null)}
                className="mt-4 px-4 py-2 bg-[#e2c376] text-black rounded-lg hover:bg-[#d4b46a] transition-colors font-medium"
              >
                + Add Element
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#36393f] bg-[#2a2a2a]/50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addElement(null, 'scene_heading')}
              className="px-3 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-sm hover:bg-[#4f535a] transition-colors"
            >
              + Scene Heading
            </button>
            <button
              onClick={() => addElement(null, 'character')}
              className="px-3 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-sm hover:bg-[#4f535a] transition-colors"
            >
              + Character
            </button>
            <button
              onClick={() => addElement(null, 'action')}
              className="px-3 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-sm hover:bg-[#4f535a] transition-colors"
            >
              + Action
            </button>
            <button
              onClick={() => addElement(null, 'dialogue')}
              className="px-3 py-1 bg-[#36393f] text-[#e7e7e7] rounded text-sm hover:bg-[#4f535a] transition-colors"
            >
              + Dialogue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
