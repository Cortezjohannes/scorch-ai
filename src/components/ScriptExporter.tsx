'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ExportOptions {
  format: 'pdf' | 'fountain' | 'final-draft' | 'celtx' | 'word' | 'html';
  includeTitle: boolean;
  includeSceneNumbers: boolean;
  includeCoverPage: boolean;
  includeCharacterList: boolean;
  includeRevisionNotes: boolean;
  paperSize: 'letter' | 'a4';
  fontFamily: 'courier' | 'times' | 'arial';
  fontSize: number;
  lineSpacing: 'single' | 'double';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  watermark?: string;
  includeMetadata: boolean;
}

interface ScriptExporterProps {
  scriptContent: string;
  projectTitle: string;
  episodeNumber?: number;
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

export default function ScriptExporter({ 
  scriptContent, 
  projectTitle, 
  episodeNumber,
  onExport, 
  onClose 
}: ScriptExporterProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeTitle: true,
    includeSceneNumbers: true,
    includeCoverPage: true,
    includeCharacterList: false,
    includeRevisionNotes: false,
    paperSize: 'letter',
    fontFamily: 'courier',
    fontSize: 12,
    lineSpacing: 'double',
    margins: {
      top: 1,
      bottom: 1,
      left: 1.5,
      right: 1
    },
    includeMetadata: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const formatOptions = [
    { 
      value: 'pdf', 
      label: 'PDF', 
      description: 'Industry standard, universally readable',
      icon: '📄',
      features: ['Professional formatting', 'Print ready', 'Cross-platform']
    },
    { 
      value: 'fountain', 
      label: 'Fountain', 
      description: 'Plain text markup for screenwriters',
      icon: '⛲',
      features: ['Plain text', 'Version control friendly', 'Open standard']
    },
    { 
      value: 'final-draft', 
      label: 'Final Draft', 
      description: 'Industry standard screenwriting software',
      icon: '📝',
      features: ['FDX format', 'Full compatibility', 'Professional standard']
    },
    { 
      value: 'celtx', 
      label: 'Celtx', 
      description: 'Pre-production planning software',
      icon: '🎬',
      features: ['Production integration', 'Scheduling support', 'Budget planning']
    },
    { 
      value: 'word', 
      label: 'Word Document', 
      description: 'Microsoft Word format for collaboration',
      icon: '📃',
      features: ['Comments support', 'Track changes', 'Wide compatibility']
    },
    { 
      value: 'html', 
      label: 'Web Page', 
      description: 'HTML format for web viewing',
      icon: '🌐',
      features: ['Web optimized', 'Interactive elements', 'Searchable']
    }
  ];

  const fontOptions = [
    { value: 'courier', label: 'Courier New', description: 'Industry standard monospace' },
    { value: 'times', label: 'Times New Roman', description: 'Traditional serif font' },
    { value: 'arial', label: 'Arial', description: 'Clean sans-serif font' }
  ];

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      await onExport(options);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }));
  };

  const getEstimatedFileSize = () => {
    const baseSize = scriptContent.length / 1024; // KB
    let multiplier = 1;
    
    switch (options.format) {
      case 'pdf': multiplier = 3; break;
      case 'word': multiplier = 2.5; break;
      case 'html': multiplier = 1.5; break;
      default: multiplier = 1;
    }
    
    const size = baseSize * multiplier;
    return size > 1024 ? `${(size / 1024).toFixed(1)} MB` : `${size.toFixed(0)} KB`;
  };

  const getEstimatedPages = () => {
    // Rough estimation: 1 page per 250 words in screenplay format
    const wordCount = scriptContent.split(/\s+/).length;
    const pages = Math.ceil(wordCount / 250);
    return pages;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] border border-[#36393f] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#36393f]">
          <div>
            <h2 className="text-xl font-bold text-[#e2c376]">Export Script</h2>
            <p className="text-[#e7e7e7]/70 mt-1">
              {projectTitle}{episodeNumber && ` - Episode ${episodeNumber}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#36393f] rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-[#e2c376] mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formatOptions.map((format) => (
                <motion.div
                  key={format.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    options.format === format.value
                      ? 'border-[#e2c376] bg-[#e2c376]/10' 
                      : 'border-[#36393f] bg-[#2a2a2a] hover:border-[#e2c376]/50'
                  }`}
                  onClick={() => updateOptions({ format: format.value as any })}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <h4 className="font-semibold">{format.label}</h4>
                      <p className="text-xs text-[#e7e7e7]/60">{format.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {format.features.map((feature, index) => (
                      <div key={index} className="text-xs text-[#e7e7e7]/70 flex items-center gap-1">
                        <span className="text-green-400">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="text-lg font-semibold text-[#e2c376] mb-4">Content Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'includeCoverPage', label: 'Cover Page', description: 'Title page with metadata' },
                { key: 'includeTitle', label: 'Title Headers', description: 'Page headers with title' },
                { key: 'includeSceneNumbers', label: 'Scene Numbers', description: 'Numbered scenes for production' },
                { key: 'includeCharacterList', label: 'Character List', description: 'Cast of characters page' },
                { key: 'includeRevisionNotes', label: 'Revision Notes', description: 'Change tracking information' },
                { key: 'includeMetadata', label: 'Document Metadata', description: 'File properties and info' }
              ].map((option) => (
                <label key={option.key} className="flex items-start gap-3 p-3 rounded-lg bg-[#2a2a2a] border border-[#36393f]">
                  <input
                    type="checkbox"
                    checked={options[option.key as keyof ExportOptions] as boolean}
                    onChange={(e) => updateOptions({ [option.key]: e.target.checked })}
                    className="mt-1 rounded"
                  />
                  <div>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-[#e7e7e7]/60">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Formatting Options */}
          <div>
            <h3 className="text-lg font-semibold text-[#e2c376] mb-4">Formatting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font & Layout */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select
                    value={options.fontFamily}
                    onChange={(e) => updateOptions({ fontFamily: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label} - {font.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <select
                      value={options.fontSize}
                      onChange={(e) => updateOptions({ fontSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg"
                    >
                      <option value={10}>10pt</option>
                      <option value={11}>11pt</option>
                      <option value={12}>12pt (Standard)</option>
                      <option value={13}>13pt</option>
                      <option value={14}>14pt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Line Spacing</label>
                    <select
                      value={options.lineSpacing}
                      onChange={(e) => updateOptions({ lineSpacing: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double (Standard)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Paper Size</label>
                  <div className="flex gap-2">
                    {['letter', 'a4'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateOptions({ paperSize: size as any })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                          options.paperSize === size
                            ? 'bg-[#e2c376] text-black'
                            : 'bg-[#2a2a2a] border border-[#36393f] hover:border-[#e2c376]/50'
                        }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margins */}
              <div>
                <h4 className="font-medium mb-3">Margins (inches)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'top', label: 'Top' },
                    { key: 'bottom', label: 'Bottom' },
                    { key: 'left', label: 'Left' },
                    { key: 'right', label: 'Right' }
                  ].map((margin) => (
                    <div key={margin.key}>
                      <label className="block text-sm text-[#e7e7e7]/70 mb-1">{margin.label}</label>
                      <input
                        type="number"
                        min="0.5"
                        max="3"
                        step="0.25"
                        value={options.margins[margin.key as keyof typeof options.margins]}
                        onChange={(e) => updateOptions({ 
                          margins: { 
                            ...options.margins, 
                            [margin.key]: Number(e.target.value) 
                          }
                        })}
                        className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div>
            <h3 className="text-lg font-semibold text-[#e2c376] mb-4">Security & Branding</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Watermark Text (Optional)</label>
              <input
                type="text"
                placeholder="CONFIDENTIAL DRAFT"
                value={options.watermark || ''}
                onChange={(e) => updateOptions({ watermark: e.target.value || undefined })}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#36393f] rounded-lg"
              />
              <p className="text-xs text-[#e7e7e7]/60 mt-1">
                Add a watermark to protect drafts and indicate version status
              </p>
            </div>
          </div>

          {/* Preview Stats */}
          <div className="bg-[#36393f]/20 rounded-lg p-4">
            <h4 className="font-semibold text-[#e2c376] mb-3">Export Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-[#e7e7e7]/60">Estimated Pages</div>
                <div className="font-semibold">{getEstimatedPages()}</div>
              </div>
              <div>
                <div className="text-[#e7e7e7]/60">File Size</div>
                <div className="font-semibold">{getEstimatedFileSize()}</div>
              </div>
              <div>
                <div className="text-[#e7e7e7]/60">Word Count</div>
                <div className="font-semibold">{scriptContent.split(/\s+/).length.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[#e7e7e7]/60">Format</div>
                <div className="font-semibold">{options.format.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-[#36393f]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#2a2a2a] border border-[#36393f] text-[#e7e7e7] rounded-lg hover:bg-[#36393f] transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-6 py-2 bg-[#36393f] text-[#e7e7e7] rounded-lg hover:bg-[#4f535a] transition-colors"
            >
              {previewMode ? 'Hide Preview' : 'Preview'}
            </button>
            
            <button
              onClick={handleExport}
              disabled={isGenerating}
              className="px-8 py-2 bg-[#e2c376] text-black rounded-lg hover:bg-[#d4b46a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  📥 Export Script
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
