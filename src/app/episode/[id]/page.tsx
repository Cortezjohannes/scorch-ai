'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import EpisodeEngineLoader from '@/components/EpisodeEngineLoader'
import AnimatedBackground from '@/components/AnimatedBackground'
import '@/styles/greenlit-design.css'

interface BranchingOption {
  id: number
  text: string
  description: string
  isCanonical?: boolean
}

// Add this interface back to fix the error
interface DialogueProps {
  character: string
  line: string
  emotion?: string
}

interface SceneProps {
  sceneNumber: number
  title?: string
  content: string
  _edited?: boolean // Flag to mark if scene was edited by user
}

interface EpisodeData {
  episodeNumber: number
  episodeTitle: string
  synopsis: string
    scenes: SceneProps[]
  rundown: string
  branchingOptions: BranchingOption[]
}

interface UserChoice {
  episodeNumber: number
  choiceId: number
  choiceText: string
}

// Function to parse screenplay format into structured scenes and dialogues
const parseScriptIntoScenes = (scriptText: string, episodeTitle: string, rawBranchingOptions: string[]): EpisodeData => {
  // Default return if parsing fails
  const defaultEpisode: EpisodeData = {
    episodeNumber: 1, // Default to 1 for parsing
    episodeTitle: episodeTitle || "Episode",
    synopsis: "An unexpected turn of events challenges our characters.",
    scenes: [
      {
        sceneNumber: 1,
        content: "The characters find themselves in a difficult situation."
      },
      {
        sceneNumber: 2,
        content: "They attempt to resolve the situation but encounter obstacles."
      },
      {
        sceneNumber: 3,
        content: "They face a critical decision that will determine their path forward."
      }
    ],
    rundown: "This episode establishes key conflicts and sets the stage for future developments.",
    branchingOptions: rawBranchingOptions.map((text, i) => ({
      id: i + 1,
      text,
      description: `This path leads the story in a new direction with unexpected consequences.`
    }))
  };
  
  try {
    // Skip parsing if script text is empty or invalid
    if (!scriptText || typeof scriptText !== 'string' || scriptText.trim().length < 10) {
      console.error('Invalid script text:', scriptText);
      return defaultEpisode;
    }

    // Clean up the script text to remove any weird formatting
    const cleanScriptText = scriptText
      .replace(/\\n/g, '\n')           // Replace escaped newlines
      .replace(/\n{3,}/g, '\n\n')      // Replace excessive newlines
      .replace(/^\s+/gm, '')           // Remove leading whitespace from lines
      .trim();

    // Split the script by scene headings (INT./EXT.)
    const sceneMatches = cleanScriptText.match(/(?:INT\.|EXT\.)[\s\S]*?(?=(?:INT\.|EXT\.)|$)/g);
    
    if (!sceneMatches || sceneMatches.length === 0) {
      console.error('No scene headings found in script');
      
      // Fallback: If no scene headings found, try to create a single scene from the whole script
      const fallbackScene: SceneProps = {
        sceneNumber: 1,
        content: cleanScriptText.split('\n\n')[0] || "The scene unfolds..."
      };
      
      // Try to extract dialogues from the text
      const dialogueMatches = [...cleanScriptText.matchAll(/([A-Z][A-Z\s]+)(?:\([^)]*\))?\n([\s\S]*?)(?=\n[A-Z][A-Z\s]+|\n\n|$)/g)];
      
      if (dialogueMatches.length > 0) {
        for (const match of dialogueMatches) {
          const character = match[1].trim();
          let line = match[2].trim();
          let emotion: string | undefined = undefined;
          
          // Check for parenthetical emotion cues
          const emotionMatch = line.match(/\(([^)]+)\)/);
          if (emotionMatch) {
            emotion = emotionMatch[1].trim();
            line = line.replace(emotionMatch[0], '').trim();
          }
          
          fallbackScene.content += `\n${character} ${line}`;
        }
      } else {
        // If no dialogues found, add a narrator dialogue
        fallbackScene.content += "\nNARRATOR: The story continues...";
      }
      
      return {
        episodeNumber: 1, // Default to 1 for parsing
        episodeTitle,
        synopsis: fallbackScene.content.split('\n')[0] || "Episode Synopsis",
        scenes: [fallbackScene],
        rundown: "Episode Rundown",
        branchingOptions: rawBranchingOptions.map((text, i) => ({
          id: i + 1,
          text,
          description: `Choose this path to ${text.toLowerCase()}.`
        }))
      };
    }
    
    const scenes: SceneProps[] = [];
    
    for (const sceneText of sceneMatches) {
      // Extract scene heading (setting)
      const settingMatch = sceneText.match(/(?:INT\.|EXT\.)[^\\n]*/);
      const setting = settingMatch ? settingMatch[0].trim() : "UNKNOWN SETTING";
      
      // Remove the setting line to work with just the content
      const sceneContent = sceneText.replace(settingMatch?.[0] || '', '').trim();
      
      // Split by character dialogue patterns
      const dialoguePattern = /([A-Z][A-Z\s]+)(?:\([^)]*\))?\n([\s\S]*?)(?=\n[A-Z][A-Z\s]+|\n\n|$)/g;
      const dialogueMatches = [...sceneContent.matchAll(dialoguePattern)];
      
      // Extract action text (everything that's not dialogue)
      let actionText = sceneContent;
      for (const match of dialogueMatches) {
        actionText = actionText.replace(match[0], '\n');
      }
      actionText = actionText.replace(/\n{2,}/g, '\n').trim();
      
      // Create content by combining setting and action
      let narrativeContent = `In ${setting}. ${actionText}`;
      
      // Add simplified dialogue summaries
      for (const match of dialogueMatches) {
        const character = match[1].trim();
        let line = match[2].trim();
        
        // Remove parenthetical emotion cues
        const emotionMatch = line.match(/\(([^)]+)\)/);
        if (emotionMatch) {
          line = line.replace(emotionMatch[0], '').trim();
        }
        
        narrativeContent += `\n${character} says "${line}"`;
      }
      
      scenes.push({
        sceneNumber: scenes.length + 1, // Assign a number based on order
        content: narrativeContent
      });
    }
    
    // Process branching options into narrative descriptions
    const formattedOptions = rawBranchingOptions.map((text, i) => {
      // Create detailed narrative descriptions
      let description;
      
      // Make description based on the option text content
      if (text.toLowerCase().includes("confront") || text.toLowerCase().includes("face")) {
        description = "This path leads to a direct confrontation that could change relationships and reveal hidden truths. Characters will be pushed to their limits.";
      } 
      else if (text.toLowerCase().includes("escape") || text.toLowerCase().includes("flee") || text.toLowerCase().includes("run")) {
        description = "Taking this path means avoiding immediate danger, but running from problems often creates new ones. The characters will need to deal with the consequences of what they left behind.";
      }
      else if (text.toLowerCase().includes("help") || text.toLowerCase().includes("save") || text.toLowerCase().includes("rescue")) {
        description = "This choice puts the characters in a position to be heroes, but saving others often comes with personal risk and sacrifice. The grateful might become allies in future challenges.";
      }
      else if (text.toLowerCase().includes("hide") || text.toLowerCase().includes("secret") || text.toLowerCase().includes("wait")) {
        description = "Patience can be powerful. This path involves gathering information and making careful plans before acting. The characters will learn things that could change their perspective.";
      }
      else if (text.toLowerCase().includes("truth") || text.toLowerCase().includes("reveal") || text.toLowerCase().includes("tell")) {
        description = "Honesty can heal or hurt. This choice leads to revelations that will permanently change how characters see each other and their situation. Some truths cannot be unheard.";
      }
      else if (text.toLowerCase().includes("together") || text.toLowerCase().includes("alliance") || text.toLowerCase().includes("join")) {
        description = "Unity brings strength but requires compromise. This path forges new bonds between characters who must learn to trust each other despite their differences.";
      }
      else if (text.toLowerCase().includes("alone") || text.toLowerCase().includes("separate") || text.toLowerCase().includes("leave")) {
        description = "Sometimes the hardest path must be walked alone. This choice isolates characters but may reveal inner strength they didn't know they had. Independence comes with both freedom and risk.";
      }
      else if (text.toLowerCase().includes("?")) {
        description = "This choice raises questions that will lead to surprising answers. The characters' curiosity might reveal more than they bargained for.";
      }
      else {
        // If no specific keywords match, use these engaging default descriptions
        const narrativeDescriptions = [
          "This path takes the story into uncharted territory. Characters will face new challenges that test their resolve and values.",
          "Choosing this direction shifts the power dynamics between characters and introduces unexpected allies or enemies.",
          "This decision leads to a pivotal moment that will echo throughout the story and shape the characters' futures."
        ];
        description = narrativeDescriptions[i % narrativeDescriptions.length];
      }
      
      return {
        id: i + 1,
        text,
        description,
        isCanonical: false // Legacy format doesn't have canonical marking
      };
    });
    
    return {
      episodeNumber: 1, // Default to 1 for parsing
      episodeTitle,
      synopsis: scenes[0]?.content.split('.')[0] || "Episode Synopsis",
      scenes,
      rundown: "Episode Rundown",
      branchingOptions: formattedOptions
    };
  } catch (error) {
    console.error('Error parsing script:', error);
    return defaultEpisode;
  }
};

// Add this helper function to extract a synopsis
const extractSynopsis = (scenes: SceneProps[]): string => {
  if (!scenes || scenes.length === 0) return "The story continues...";
  
  // Get the first scene's action text and clean it up
  let firstSceneAction = scenes[0].content
    .replace(/CUT TO:|FADE OUT:|FADE IN:|DISSOLVE TO:|INT\.|EXT\./gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/---/g, '')
    .trim();
  
  // For 5-minute episodes, we might want to include more content in the synopsis
  // Take the first 3-5 sentences instead of 2-3
  const sentences = firstSceneAction.split('.');
  return sentences.slice(0, Math.min(5, sentences.length)).join('.') + '.';
};

// Add this helper function to clean screenplay text for display
const cleanSceneContent = (scene: SceneProps): SceneProps => {
  // Clean up setting text
  const cleanSetting = scene.content
    .replace(/INT\.|EXT\./, '')
    .trim();
    
  // Clean up action text
  const cleanAction = scene.content
    .replace(/CUT TO:|FADE OUT:|FADE IN:|DISSOLVE TO:/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/---/g, '')
    .trim();
  
  // Remove choice point dialogues
  const filteredDialogues = scene.content.split('\n').filter(line => 
    !line.includes('Choice') && 
    !line.includes('says Choice') &&
    !line.includes('asks Choice')
  );
  
  return {
    sceneNumber: scene.sceneNumber,
    content: filteredDialogues.join('\n').trim()
  };
};

// Add this function to convert screenplay to narrative format
const convertScriptToNarrative = (scenes: SceneProps[]): { synopsis: string, narrativeContent: string } => {
  if (!scenes || scenes.length === 0) {
    return { synopsis: "The story continues...", narrativeContent: "The adventure unfolds..." };
  }
  
  // Generate a more comprehensive synopsis for 5-minute episodes
  let synopsis = "";
  
  // Use the first scene for the initial context
  if (scenes[0]) {
    const firstScene = cleanSceneContent(scenes[0]);
    synopsis = firstScene.content.split('.').slice(0, 3).join('.') + '.';
  }
  
  // Add main plot points from multiple scenes to complete the synopsis
  if (scenes.length > 2) {
    // Get key plot points from an early-middle scene
    const earlyMidScene = cleanSceneContent(scenes[Math.floor(scenes.length / 3)]);
    if (earlyMidScene.content && earlyMidScene.content.length > 0) {
      synopsis += " " + earlyMidScene.content.split('.')[0] + ".";
    }
    
    // Get key plot points from middle scene
    const midScene = cleanSceneContent(scenes[Math.floor(scenes.length / 2)]);
    if (midScene.content && midScene.content.length > 0) {
      synopsis += " " + midScene.content.split('.')[0] + ".";
    }
    
    // Get resolution from final scene
    const finalScene = cleanSceneContent(scenes[scenes.length - 1]);
    if (finalScene.content && finalScene.content.length > 0) {
      synopsis += " " + finalScene.content.split('.').slice(-2, -1)[0] + ".";
    }
  }
  
  // Create Wikipedia-style scene summaries
  let narrativeContent = "";
  
  scenes.forEach((scene, index) => {
    // Clean the scene first
    const cleanedScene = cleanSceneContent(scene);
    
    // Add scene as a section
    narrativeContent += `## ${scene.sceneNumber}\n\n`;
    
    // Add a concise summary of the action
    narrativeContent += `${cleanedScene.content.trim()}\n\n`;
    
    // Summarize dialogues as key plot points rather than direct quotes
    if (cleanedScene.content.length > 0) {
      const dialogueSummary = [];
      let currentCharacter = "";
      let combinedLines = "";
      
      // Group dialogues by character and combine them
      const lines = cleanedScene.content.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('NARRATOR:')) {
          if (currentCharacter && combinedLines) {
            dialogueSummary.push(`NARRATOR ${combinedLines.toLowerCase().startsWith('says') ? combinedLines : 'says ' + combinedLines}`);
          }
          currentCharacter = "NARRATOR";
          combinedLines = line.replace('NARRATOR:', '').trim();
        } else if (line.trim().startsWith('CHARACTER:')) {
          if (currentCharacter && combinedLines) {
            dialogueSummary.push(`${currentCharacter} ${combinedLines.toLowerCase().startsWith('says') ? combinedLines : 'says ' + combinedLines}`);
          }
          currentCharacter = line.replace('CHARACTER:', '').trim();
          combinedLines = "";
        } else if (line.trim().length > 0) {
          combinedLines += ` ${line.trim()}`;
        }
      }
      if (currentCharacter && combinedLines) {
        dialogueSummary.push(`${currentCharacter} ${combinedLines.toLowerCase().startsWith('says') ? combinedLines : 'says ' + combinedLines}`);
      }
      
      // Add summarized dialogues
      if (dialogueSummary.length > 0) {
        narrativeContent += dialogueSummary.join('. ') + '.\n\n';
      }
    }
  });
  
  return {
    synopsis,
    narrativeContent: narrativeContent.trim()
  };
};

// Function to convert the API response to our expected format
const processApiResponse = (rawApiData: any, episodeId: number, episodeTitle: string): EpisodeData => {
  // Default return if parsing fails
  const defaultEpisode: EpisodeData = {
    episodeNumber: episodeId,
    episodeTitle: episodeTitle || `Episode ${episodeId}`,
    synopsis: "An unexpected turn of events challenges our characters.",
    scenes: [
      {
        sceneNumber: 1,
        content: "The characters find themselves in a difficult situation."
      },
      {
        sceneNumber: 2,
        content: "They attempt to resolve the situation but encounter obstacles."
      },
      {
        sceneNumber: 3,
        content: "They face a critical decision that will determine their path forward."
      }
    ],
    rundown: "This episode establishes key conflicts and sets the stage for future developments.",
    branchingOptions: [
      {
        id: 1,
        text: "Take a bold approach",
        description: "Choose a risky but potentially rewarding path.",
        isCanonical: false
      },
      {
        id: 2,
        text: "Proceed with caution",
        description: "Choose a safer path that may yield slower results.",
        isCanonical: true
      },
      {
        id: 3,
        text: "Find an alternative solution",
        description: "Look for a creative approach to the problem at hand.",
        isCanonical: false
      }
    ]
  };
  
  try {
    // Check if we have a valid response
    if (!rawApiData || typeof rawApiData !== 'object') {
      console.error('Invalid API response:', rawApiData);
      return defaultEpisode;
    }
    
    // Check if we have the new format with scenes array
    if (rawApiData.scenes && Array.isArray(rawApiData.scenes)) {
      // We have the new format, use it directly
      return {
        episodeNumber: episodeId,
        episodeTitle: rawApiData.episodeTitle || episodeTitle || `Episode ${episodeId}`,
        synopsis: rawApiData.synopsis || defaultEpisode.synopsis,
        scenes: rawApiData.scenes || defaultEpisode.scenes,
        rundown: rawApiData.rundown || defaultEpisode.rundown,
        branchingOptions: Array.isArray(rawApiData.branchingOptions)
          ? rawApiData.branchingOptions.map((option: any, i: number) => {
              // Handle both old string format and new object format
              if (typeof option === 'string') {
                return {
                  id: i + 1,
                  text: option,
                  description: createBranchingDescription(option, i),
                  isCanonical: false
                };
              } else {
                return {
                  id: option.id || i + 1,
                  text: option.text || `Option ${i + 1}`,
                  description: option.description || createBranchingDescription(option.text || `Option ${i + 1}`, i),
                  isCanonical: option.isCanonical || false
                };
              }
            })
          : defaultEpisode.branchingOptions
      };
    }
    
    // Handle legacy format with script property
    if (rawApiData.script && typeof rawApiData.script === 'string') {
      // Try to convert the screenplay format to our new format
      return convertScriptToStructuredEpisode(rawApiData, episodeId, episodeTitle);
    }
    
    // If none of the above worked, return the default
    return defaultEpisode;
  } catch (error) {
    console.error('Error processing API response:', error);
    return defaultEpisode;
  }
};

// Helper function to create branching option descriptions
const createBranchingDescription = (text: string, index: number): string => {
  // Make description based on the option text content
  if (text.toLowerCase().includes("confront") || text.toLowerCase().includes("face")) {
    return "This path leads to a direct confrontation that could change relationships and reveal hidden truths. Characters will be pushed to their limits.";
  } 
  else if (text.toLowerCase().includes("escape") || text.toLowerCase().includes("flee") || text.toLowerCase().includes("run")) {
    return "Taking this path means avoiding immediate danger, but running from problems often creates new ones. The characters will need to deal with the consequences of what they left behind.";
  }
  else if (text.toLowerCase().includes("help") || text.toLowerCase().includes("save") || text.toLowerCase().includes("rescue")) {
    return "This choice puts the characters in a position to be heroes, but saving others often comes with personal risk and sacrifice. The grateful might become allies in future challenges.";
  }
  else if (text.toLowerCase().includes("hide") || text.toLowerCase().includes("secret") || text.toLowerCase().includes("wait")) {
    return "Patience can be powerful. This path involves gathering information and making careful plans before acting. The characters will learn things that could change their perspective.";
  }
  else if (text.toLowerCase().includes("truth") || text.toLowerCase().includes("reveal") || text.toLowerCase().includes("tell")) {
    return "Honesty can heal or hurt. This choice leads to revelations that will permanently change how characters see each other and their situation. Some truths cannot be unheard.";
  }
  else if (text.toLowerCase().includes("together") || text.toLowerCase().includes("alliance") || text.toLowerCase().includes("join")) {
    return "Unity brings strength but requires compromise. This path forges new bonds between characters who must learn to trust each other despite their differences.";
  }
  else if (text.toLowerCase().includes("alone") || text.toLowerCase().includes("separate") || text.toLowerCase().includes("leave")) {
    return "Sometimes the hardest path must be walked alone. This choice isolates characters but may reveal inner strength they didn't know they had. Independence comes with both freedom and risk.";
  }
  else if (text.toLowerCase().includes("?")) {
    return "This choice raises questions that will lead to surprising answers. The characters' curiosity might reveal more than they bargained for.";
  }
  else {
    // If no specific keywords match, use these engaging default descriptions
    const narrativeDescriptions = [
      "This path takes the story into uncharted territory. Characters will face new challenges that test their resolve and values.",
      "Choosing this direction shifts the power dynamics between characters and introduces unexpected allies or enemies.",
      "This decision leads to a pivotal moment that will echo throughout the story and shape the characters' futures."
    ];
    return narrativeDescriptions[index % narrativeDescriptions.length];
  }
};

// Function to convert legacy screenplay format to the new structured episode format
const convertScriptToStructuredEpisode = (rawApiData: any, episodeId: number, episodeTitle: string): EpisodeData => {
  const scriptText = rawApiData.script || "";
  const branchingOptions = rawApiData.branchingOptions || [];
  
  // Parse the script into scenes
  const sceneMatches = scriptText.match(/(?:INT\.|EXT\.)[\s\S]*?(?=(?:INT\.|EXT\.)|$)/g) || [];
  
  // Create structured scenes from the screenplay
  const scenes: SceneProps[] = [];
  for (let i = 0; i < Math.min(sceneMatches.length, 3); i++) {
    const sceneText = sceneMatches[i] || "";
    
    // Extract scene heading
    const settingMatch = sceneText.match(/(?:INT\.|EXT\.)[^\\n]*/);
    const setting = settingMatch ? settingMatch[0].trim() : "UNKNOWN SETTING";
    
    // Remove the setting line to work with just the content
    const sceneContent = sceneText.replace(settingMatch?.[0] || '', '').trim();
    
    // Convert screenplay format to narrative
    const narrativeContent = sceneContent
      .replace(/[A-Z][A-Z\s]+\n(?:\([^)]*\))?\n/g, '') // Remove character names and parentheticals
      .replace(/\n{2,}/g, ' ') // Replace double line breaks with spaces
      .replace(/\n/g, ' ') // Replace single line breaks with spaces
      .trim();
    
    scenes.push({
      sceneNumber: i + 1,
      content: `In ${setting}. ${narrativeContent}`
    });
  }
  
  // Ensure we have exactly 3 scenes
  while (scenes.length < 3) {
    scenes.push({
      sceneNumber: scenes.length + 1,
      content: "The story continues with unexpected developments."
    });
  }
  
  // Create a synopsis from the first scene
  const synopsis = scenes[0].content.split('.').slice(0, 2).join('.') + '.';
  
  // Create a rundown
  const rundown = `Episode ${episodeId} advances the story by introducing new challenges and decisions for the characters. This episode sets up important dynamics that will influence future choices and relationships.`;
  
  return {
    episodeNumber: episodeId,
    episodeTitle: episodeTitle || `Episode ${episodeId}`,
    synopsis,
    scenes,
    rundown,
    branchingOptions: Array.isArray(branchingOptions)
      ? branchingOptions.map((option: any, i: number) => {
          // Handle both old string format and new object format
          if (typeof option === 'string') {
            return {
              id: i + 1,
              text: option,
              description: createBranchingDescription(option, i),
              isCanonical: false
            };
          } else {
            return {
              id: option.id || i + 1,
              text: option.text || `Option ${i + 1}`,
              description: option.description || createBranchingDescription(option.text || `Option ${i + 1}`, i),
              isCanonical: option.isCanonical || false
            };
          }
        })
      : []
  };
};

export default function EpisodePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const episodeId = parseInt(params.id as string)
  
  const [storyBible, setStoryBible] = useState<any>(null)
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userChoices, setUserChoices] = useState<UserChoice[]>([])
  const [selectedOption, setSelectedOption] = useState<BranchingOption | null>(null)
  const [showOptionDetails, setShowOptionDetails] = useState(false)
  const [previousEpisodesExist, setPreviousEpisodesExist] = useState(true)
  const [activeTab, setActiveTab] = useState<'script' | 'treatment'>('treatment')
  const [narrativeContent, setNarrativeContent] = useState<{ synopsis: string, narrativeContent: string } | null>(null)
  const [generationTimeout, setGenerationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [localStoragePollingInterval, setLocalStoragePollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null)
  
  // Add a state for the completion lightbox
  const [showCompletionLightbox, setShowCompletionLightbox] = useState<boolean>(false)
  const [completedArcNumber, setCompletedArcNumber] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Add state for creative path
  const [customStoryInput, setCustomStoryInput] = useState<string>('')
  const [showCreativePath, setShowCreativePath] = useState<boolean>(false)
  
  // Scene editing state
  const [editingScene, setEditingScene] = useState<number | null>(null)
  const [editingSceneContent, setEditingSceneContent] = useState<string>('')
  const [isSceneLocked, setIsSceneLocked] = useState<boolean>(false)

  // Effect to set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Effect to load story bible and previous choices from localStorage
  useEffect(() => {
    // Only run on client side to prevent hydration errors
    if (typeof window === 'undefined') return
    
    const loadData = () => {
      try {
        // Load story bible
        const savedBible = typeof window !== 'undefined' ? (localStorage.getItem('greenlit-story-bible') || localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')) : null
        if (savedBible) {
          const parsed = JSON.parse(savedBible)
          
          // Ensure the story bible has the creative mode property
          if (parsed.storyBible && !parsed.storyBible.creativeMode) {
            parsed.storyBible.creativeMode = parsed.creativeMode || 'beast'
          }
          
          setStoryBible(parsed.storyBible)
          
          // Check if this episode should be accessible
          if (episodeId > 1) {
            // Check if previous episodes exist
            try {
            const savedEpisodes = typeof window !== 'undefined' ? (localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) : null
            if (savedEpisodes) {
              const episodes = JSON.parse(savedEpisodes)
                
                // Previous episode must exist for this one to be accessible
                if (!episodes[episodeId - 1]) {
                  console.log(`Episode ${episodeId-1} not found, must generate in order`)
                  setPreviousEpisodesExist(false)
                setTimeout(() => {
                    setError(`Episodes must be generated in order. Please start with Episode ${episodeId-1}.`)
                  setLoading(false)
                }, 500)
                  return
              }
            } else {
              // No episodes saved at all
              setPreviousEpisodesExist(false)
              setTimeout(() => {
                setError(`Episodes must be generated in order. Please start with Episode 1.`)
                setLoading(false)
              }, 500)
                return
              }
            } catch (error) {
              console.error('Error checking episode access:', error)
              setError('Failed to validate episode sequence')
              setPreviousEpisodesExist(false)
              setLoading(false)
              return
            }
          }
          
          // Load user choices
          const savedChoices = typeof window !== 'undefined' ? (localStorage.getItem('greenlit-user-choices') || localStorage.getItem('scorched-user-choices') || localStorage.getItem('reeled-user-choices')) : null
          if (savedChoices) {
            setUserChoices(JSON.parse(savedChoices))
          }
        } else {
          // If no story bible found, redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load your story data')
      } finally {
        if (episodeId === 1) {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [router, episodeId])

  // Effect to poll localStorage for episodes when in loading state
  useEffect(() => {
    // Only run on client side to prevent hydration errors
    if (typeof window === 'undefined') return
    
    // Only start polling if we're in loading/generating state
    if ((loading || generating) && episodeId > 0 && !localStoragePollingInterval) {
      console.log(`Starting localStorage polling for episode ${episodeId}`);
      
      // Set generation start time if not set
      if (!generationStartTime) {
        setGenerationStartTime(Date.now());
      }
      
      // Check localStorage every 2 seconds
      const interval = setInterval(() => {
        try {
          const savedEpisodes = typeof window !== 'undefined' ? (localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) : null;
          if (savedEpisodes) {
            const episodes = JSON.parse(savedEpisodes);
            
            // If this episode exists in localStorage but not in our state
            // CRITICAL: Only display if it's marked as fully enhanced (not just a draft)
            if (episodes[episodeId] && !episodeData) {
              const episode = episodes[episodeId];
              
              // Check if this is a complete, enhanced episode
              const isEnhanced = episode._generationComplete === true || 
                                episode.generationType === 'comprehensive-enhanced' ||
                                episode.generationType === 'legacy-enhanced' ||
                                episode.generationType === 'story-bible-only';
              
              if (isEnhanced) {
                console.log(`✅ Found ENHANCED episode ${episodeId} in localStorage during polling`);
                
                // Calculate how long we've been generating
                const generationTimeElapsed = generationStartTime ? (Date.now() - generationStartTime) / 1000 : 0;
                console.log(`🎉 Generation took approximately ${generationTimeElapsed.toFixed(1)} seconds`);
                
                // Clear intervals and timeouts
                if (generationTimeout) {
                  clearTimeout(generationTimeout);
                  setGenerationTimeout(null);
                }
                
                // Display the enhanced episode
                setEpisodeData(episodes[episodeId]);
                setLoading(false);
                setGenerating(false);
                // Clear the polling interval
                clearInterval(interval);
                setLocalStoragePollingInterval(null);
              } else {
                console.log(`⏳ Found DRAFT episode ${episodeId} in localStorage - waiting for enhancement to complete...`);
                // Continue polling - don't display the draft
              }
            }
          }
        } catch (error) {
          console.error('Error polling localStorage:', error);
        }
      }, 2000); // Poll every 2 seconds
      
      setLocalStoragePollingInterval(interval);
      
      // If we've been polling for over 2 minutes, force a refresh
      const forceRefreshTimeout = setTimeout(() => {
        console.log(`Force refreshing for episode ${episodeId} after extended polling`);
        window.location.reload();
      }, 120000); // 2 minutes
      
      return () => {
        clearInterval(interval);
        clearTimeout(forceRefreshTimeout);
        setLocalStoragePollingInterval(null);
      };
    }
    
    // Clear polling if we're no longer loading/generating
    if (!loading && !generating && localStoragePollingInterval) {
      clearInterval(localStoragePollingInterval);
      setLocalStoragePollingInterval(null);
    }
  }, [loading, generating, episodeId, episodeData, generationStartTime, localStoragePollingInterval, generationTimeout]);

  // Effect to redirect to episode studio if episode doesn't exist yet
  useEffect(() => {
    if (!storyBible || !previousEpisodesExist || generating) return;
    
    // Check if this episode already exists
    const checkEpisodeExists = () => {
      try {
        const savedEpisodes = typeof window !== 'undefined' 
          ? (localStorage.getItem('greenlit-episodes') || localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) 
          : null;
        
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes);
          if (episodes[episodeId]) {
            // Episode exists, display it
            setEpisodeData(episodes[episodeId]);
            setLoading(false);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking episode existence:', error);
        return false;
      }
    };
    
    // If episode doesn't exist, redirect to Episode Studio (Director's Chair)
    if (!checkEpisodeExists() && !episodeData) {
      console.log(`Episode ${episodeId} doesn't exist yet - redirecting to Episode Studio`);
      router.push(`/episode-studio/${episodeId}`);
    }
  }, [storyBible, episodeId, previousEpisodesExist, generating, router, episodeData]);

  // OLD AUTO-GENERATION CODE - DEPRECATED IN FAVOR OF DIRECTOR'S CHAIR
  // Effect to generate episode content when loaded
  useEffect(() => {
    const generateEpisode = async () => {
      // DISABLED: We now redirect to episode-studio instead of auto-generating
      return;
      
      if (!storyBible || generating || !previousEpisodesExist) return;
      
      setGenerating(true);
      setError(null);
      setGenerationStartTime(Date.now());
      
      // Set a timeout to handle stuck generation
      const timeout = setTimeout(() => {
        console.log(`Generation timeout for episode ${episodeId} - showing error`);
        
        // Check one more time if the episode exists in localStorage before showing the error
        try {
          const savedEpisodes = typeof window !== 'undefined' ? (localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) : null;
          if (savedEpisodes) {
            const episodes = JSON.parse(savedEpisodes);
            if (episodes[episodeId]) {
              console.log(`Found episode ${episodeId} in localStorage during timeout check`);
              setEpisodeData(episodes[episodeId]);
              setLoading(false);
              setGenerating(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking localStorage during timeout:', error);
        }
        
        setError('Episode generation is taking longer than expected. The enhancement process can take up to 5 minutes for comprehensive results.');
        setGenerating(false);
      }, 300000); // 5 minute timeout to accommodate enhancement process
      
      setGenerationTimeout(timeout);
      
      try {
        // Find the most recent choice for the previous episode
        const previousChoice = userChoices.find(choice => choice.episodeNumber === episodeId - 1);
        
        // Get creative mode from user's original choice, not story bible
        let creativeMode = 'beast'; // default fallback
        const savedBible = typeof window !== 'undefined' ? (localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible')) : null;
        if (savedBible) {
          try {
            const parsed = JSON.parse(savedBible as string);
            creativeMode = parsed.creativeMode || 'beast';
            console.log(`Using user's original mode choice: ${creativeMode}`);
          } catch (e) {
            console.warn('Could not parse saved bible for mode, using beast mode');
          }
        }
        
        console.log(`🎬 Episode Generation: Requesting seamless episode ${episodeId} generation with mode: ${creativeMode}`);
        console.log(`📄 Previous choice: ${previousChoice?.choiceText || "none"}`);
        
        const response = await fetch('/api/generate/episode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyBible,
            episodeNumber: episodeId, // FIXED: Use correct parameter name
            previousChoice: previousChoice?.choiceText || null,
            userChoices: userChoices, // CRITICAL: Add user choices for story coherence
            mode: creativeMode // Pass the creative mode to the API
          }),
        });
        
        // Clear the timeout since we got a response
        if (generationTimeout) {
          clearTimeout(generationTimeout as NodeJS.Timeout);
          setGenerationTimeout(null);
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate episode');
        }
        
        const data = await response.json();
        
        console.log(`Client: Received episode data for episode ${episodeId}`);
        
        // Ensure we have valid data
        if (!data || !data.episode) {
          throw new Error('Invalid response data from API');
        }
        
        // Get arc and episode information
        const arcIndex = Math.floor((episodeId - 1) / 10);
        const episodeWithinArc = ((episodeId - 1) % 10) + 1;
        
        // Safely access narrative arc data with fallbacks
        const narrativeArcs = storyBible.narrativeArcs || [];
        const narrativeArc = narrativeArcs[arcIndex] || {
          title: `Arc ${arcIndex + 1}`,
          summary: "The journey continues...",
          episodes: []
        };
        
        // Safely find episode info
        const episodes = narrativeArc.episodes || [];
        const episodeInfo = episodes.find((ep: any) => ep?.number === episodeWithinArc) || null;
        const episodeTitle = episodeInfo?.title || `Episode ${episodeId}`;
        
        // Process the raw API data into the structured format our component expects
        const processedEpisodeData = processApiResponse(
          data.episode,
          episodeId,
          episodeTitle
        );
        
        // Check if the processed data is valid
        if (!processedEpisodeData || !Array.isArray(processedEpisodeData.scenes) || processedEpisodeData.scenes.length === 0) {
          console.error(`Client: Invalid episode data structure for episode ${episodeId}`, processedEpisodeData);
          throw new Error('The generated episode has an invalid structure');
        }
        
        // Mark as fully enhanced and complete
        (processedEpisodeData as any)._generationComplete = true;
        (processedEpisodeData as any).generationType = data.generationType || 'enhanced';
        (processedEpisodeData as any)._enhancementTimestamp = Date.now();
        
        console.log(`🎉 Episode ${episodeId} FULLY ENHANCED and ready for display`);
        setEpisodeData(processedEpisodeData);
        setLoading(false);        // ensure loader closes
        setGenerating(false);     // ensure loader closes
        
        // Save the ENHANCED episode to localStorage with completion flags
        const savedEpisodes = typeof window !== 'undefined' ? (localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) : null;
        const savedEpisodesData = savedEpisodes ? JSON.parse(savedEpisodes as string) : {};
          
        savedEpisodesData[episodeId] = processedEpisodeData;
        if (typeof window !== 'undefined') {
          localStorage.setItem('scorched-episodes', JSON.stringify(savedEpisodesData));
        }
        
        console.log(`💾 Enhanced episode ${episodeId} saved to localStorage with completion flags`);
      } catch (error) {
        console.error('Error generating episode:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        
        // Clear any existing timeout
        if (generationTimeout) {
          clearTimeout(generationTimeout as NodeJS.Timeout);
          setGenerationTimeout(null);
        }
      } finally {
        setGenerating(false);
      }
    };
    
    // Check if we already have this episode in localStorage (ONLY ENHANCED ONES)
    const checkSavedEpisode = () => {
      try {
        const savedEpisodes = typeof window !== 'undefined' ? (localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes')) : null;
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes);
          if (episodes[episodeId]) {
            const episode = episodes[episodeId];
            
            // Only load if it's a complete, enhanced episode
            const isEnhanced = episode._generationComplete === true || 
                              episode.generationType === 'comprehensive-enhanced' ||
                              episode.generationType === 'legacy-enhanced' ||
                              episode.generationType === 'story-bible-only';
            
            if (isEnhanced) {
              console.log(`✅ Loading ENHANCED episode ${episodeId} from localStorage`);
              setEpisodeData(episodes[episodeId]);
              return true;
            } else {
              console.log(`⏳ Found DRAFT episode ${episodeId} in localStorage - ignoring and generating enhanced version`);
              return false; // Don't load the draft, generate a new enhanced version
            }
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking saved episode:', error);
        return false;
      }
    };
    
    // DISABLED: Auto-generation is now handled by Director's Chair (episode-studio)
    // The code below is kept for reference but not executed
    /*
    if (storyBible && !episodeData && !generating && previousEpisodesExist) {
      if (!checkSavedEpisode()) {
        generateEpisode();
      } else {
        setLoading(false);
      }
    }
    */
    
    // Cleanup function to clear timeout on unmount
    return () => {
      if (generationTimeout) {
        clearTimeout(generationTimeout);
      }
    };
  }, [storyBible, episodeId, generating, episodeData, userChoices, previousEpisodesExist, generationTimeout]);
  
  // Handle user selecting a branching option
  const handleSelectOption = (option: BranchingOption) => {
    setSelectedOption(option)
    setShowOptionDetails(true)
  }
  
  // Handle creative path selection
  const handleCreativePath = () => {
    setShowCreativePath(true)
    setSelectedOption(null)
    setShowOptionDetails(false)
  }
  
  // Handle custom story input
  const handleCustomStorySubmit = () => {
    if (!customStoryInput.trim()) return
    
    // Create a custom choice object
    const customChoice: UserChoice = {
      episodeNumber: episodeId,
      choiceId: -1, // Use -1 to indicate custom choice
      choiceText: customStoryInput.trim()
    }
    
    // Update choices in state
    const updatedChoices = [
      ...userChoices.filter(choice => choice.episodeNumber !== episodeId),
      customChoice
    ]
    
    setUserChoices(updatedChoices)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('greenlit-user-choices', JSON.stringify(updatedChoices))
      localStorage.setItem('scorched-user-choices', JSON.stringify(updatedChoices))
      localStorage.setItem('reeled-user-choices', JSON.stringify(updatedChoices))
    }
    
    // Reset creative path state
    setCustomStoryInput('')
    setShowCreativePath(false)
    
    // Show completion lightbox
    setShowCompletionLightbox(true)
  }
  
  // Handle confirming a choice
  const handleConfirmChoice = () => {
    if (!selectedOption) return
    
    // Save the choice
    const newChoice: UserChoice = {
      episodeNumber: episodeId,
      choiceId: selectedOption.id,
      choiceText: selectedOption.text
    }
    
    // Update choices in state
    const updatedChoices = [
      ...userChoices.filter(choice => choice.episodeNumber !== episodeId),
      newChoice
    ]
    
    setUserChoices(updatedChoices)
    
    // Save to localStorage (use greenlit key for consistency)
    localStorage.setItem('greenlit-user-choices', JSON.stringify(updatedChoices))
    
    // Hide the details dialog
    setShowOptionDetails(false)
    
    // Reset states before navigation to prevent loading issues
    setEpisodeData(null)
    setLoading(true)
    setGenerating(false)
    setError(null)
    
    // Check if this is the end of an arc using dynamic arc structure
    let isArcEnd = false;
    let arcNumber = 0;
    
    if (storyBible && storyBible.narrativeArcs) {
      let runningEpisodeCount = 0;
      
      // Calculate which arc this episode belongs to and if it's the last episode
      for (let i = 0; i < storyBible.narrativeArcs.length; i++) {
        const arc = storyBible.narrativeArcs[i];
        const arcEpisodeCount = arc.episodes?.length || 10;
        
        if (episodeId >= runningEpisodeCount + 1 && episodeId <= runningEpisodeCount + arcEpisodeCount) {
          // This episode is in arc i (0-based index for consistency with workspace)
          arcNumber = i; // Arc index is 0-based
          
          // Check if this is the last episode of the arc
          if (episodeId === runningEpisodeCount + arcEpisodeCount) {
            isArcEnd = true;
          }
          break;
        }
        
        runningEpisodeCount += arcEpisodeCount;
      }
    } else {
      // Fallback to old logic if no arc structure
      if (episodeId % 10 === 0) {
        isArcEnd = true;
        arcNumber = Math.floor(episodeId / 10);
      }
    }
    
    if (isArcEnd) {
      // This is the end of an arc - show congratulatory popup and redirect to workspace
      console.log(`🎉 Arc ${arcNumber + 1} completed at episode ${episodeId}`);
      
      // Set a flag in localStorage to show we completed this arc (using 0-based index)
      const savedCompletedArcs = localStorage.getItem('greenlit-completed-arcs') || localStorage.getItem('scorched-completed-arcs') || localStorage.getItem('reeled-completed-arcs')
      const completedArcs = savedCompletedArcs ? JSON.parse(savedCompletedArcs) : {};
      completedArcs[arcNumber] = true; // arcNumber is 0-based index
      // Save to greenlit key (primary) for consistency
      localStorage.setItem('greenlit-completed-arcs', JSON.stringify(completedArcs));
      
      // Show completion lightbox instead of alert (display as 1-based for users)
      setCompletedArcNumber(arcNumber + 1);
      setShowCompletionLightbox(true);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        router.push('/workspace');
      }, 5000);
    } else {
      // Use a slight delay to allow state updates before navigation
      setTimeout(() => {
        if (episodeId < 60) {  // Allow up to 60 episodes total (6 arcs × 10 episodes)
          // Save timestamp so we know when we started navigating
          localStorage.setItem('scorched-navigation-timestamp', Date.now().toString());
          
          // Navigate to Episode Studio for next episode creation
          router.push(`/episode-studio/${episodeId + 1}`);
        } else {
          // Series finale - could show a completion screen
          router.push('/series-complete');
        }
      }, 100);
    }
  }

  // Scene editing functions
  const startEditingScene = (sceneIndex: number) => {
    if (isSceneLocked) {
      alert('🔒 Scenes are locked after the next episode is generated to maintain continuity.')
      return
    }
    
    if (!episodeData || !episodeData.scenes[sceneIndex]) return
    
    setEditingScene(sceneIndex)
    setEditingSceneContent(episodeData.scenes[sceneIndex].content)
  }
  
  const cancelEditingScene = () => {
    setEditingScene(null)
    setEditingSceneContent('')
  }
  
  const saveSceneEdit = () => {
    if (!episodeData || editingScene === null) return
    
    // Update the scene content
    const updatedScenes = [...episodeData.scenes]
    updatedScenes[editingScene] = {
      ...updatedScenes[editingScene],
      content: editingSceneContent,
      _edited: true // Mark as edited for AI awareness
    }
    
    // Update episode data
    const updatedEpisodeData = {
      ...episodeData,
      scenes: updatedScenes
    }
    
    setEpisodeData(updatedEpisodeData)
    
    // Save to localStorage
    try {
      const savedEpisodes = localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes') || localStorage.getItem('greenlit-episodes')
      const episodes = savedEpisodes ? JSON.parse(savedEpisodes) : {}
      episodes[episodeId] = updatedEpisodeData
      
      // Save back to the same key we found
      const key = localStorage.getItem('scorched-episodes') ? 'scorched-episodes' : 
                  localStorage.getItem('reeled-episodes') ? 'reeled-episodes' : 'greenlit-episodes'
      localStorage.setItem(key, JSON.stringify(episodes))
      
      console.log(`✅ Scene ${editingScene + 1} edited and saved`)
    } catch (error) {
      console.error('Error saving scene edit:', error)
    }
    
    // Clear editing state
    setEditingScene(null)
    setEditingSceneContent('')
  }
  
  // Check if scenes should be locked (after next episode is generated)
  useEffect(() => {
    if (!episodeData) return
    
    // Check if next episode exists
    const checkNextEpisode = () => {
      try {
        const savedEpisodes = localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes') || localStorage.getItem('greenlit-episodes')
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes)
          const nextEpisodeExists = episodes[episodeId + 1]
          setIsSceneLocked(!!nextEpisodeExists)
        }
      } catch (error) {
        console.error('Error checking next episode:', error)
      }
    }
    
    checkNextEpisode()
  }, [episodeData, episodeId])

  // Check if episode data is valid
  const isValidEpisodeData = episodeData && 
    episodeData.episodeTitle && 
    episodeData.synopsis &&
    Array.isArray(episodeData.scenes) &&
    episodeData.scenes.length > 0 &&
    episodeData.rundown &&
    Array.isArray(episodeData.branchingOptions) &&
    episodeData.branchingOptions.length > 0;

  // Not found or previous episodes don't exist state
  if (!previousEpisodesExist && episodeId > 1) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-lg w-full">
          <h2 className="text-xl font-bold text-[#00FF99] mb-4 font-medium cinematic-header">Episodes Must Be Generated In Order</h2>
          <p className="text-[#e7e7e7]/80 mb-6">
            You need to generate Episode 1 first before proceeding to later episodes.
          </p>
          <button
            onClick={() => router.push('/episode/1')}
            className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
          >
            Go to Episode 1
          </button>
        </div>
      </div>
    )
  }

  // Loading state with our in-brand loader
  if (!error && (loading || generating || !isValidEpisodeData) && !episodeData) {
    try {
      const savedEpisodes = localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes');
      if (savedEpisodes) {
        const episodes = JSON.parse(savedEpisodes);
        if (episodes[episodeId] && !episodeData) {
          setTimeout(() => {
            setEpisodeData(episodes[episodeId]);
            setLoading(false);
            setGenerating(false);
          }, 0);
        }
      }
    } catch (e) {
      console.error('Error checking localStorage in loading state:', e);
    }
    
    return (
      <>
        <EpisodeEngineLoader
          open={true}
          episodeNumber={episodeId}
          seriesTitle={storyBible?.seriesTitle}
          useEngines={true}
        />
      </>
    );
  }

  // Error state
  if (error || !storyBible) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#36393f] rounded-xl p-6 max-w-lg w-full">
          <h2 className="text-xl font-bold text-[#00FF99] mb-4 font-medium cinematic-header">Something went wrong</h2>
          <p className="text-[#e7e7e7]/80 mb-6">{error || "Couldn't load the story bible."}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/story-bible')}
              className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
            >
              Return to Story Bible
            </button>
            {episodeId === 1 && (
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Refresh the page instead of trying to call generateEpisode directly
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                }}
                className="px-4 py-2 bg-[#2a2a2a] text-[#e7e7e7] font-medium rounded-lg hover:bg-[#36393f] transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Calculate arc and episode within arc
  const arcIndex = Math.floor((episodeId - 1) / 10)
  const episodeWithinArc = ((episodeId - 1) % 10) + 1
  
  // Get arc info with safe access
  const narrativeArcs = storyBible?.narrativeArcs || []
  const narrativeArc = narrativeArcs[arcIndex] || { 
    title: `Arc ${arcIndex + 1}`, 
    summary: "The journey continues..." 
  }

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a]" />
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full animate-spin" />
          <p className="text-[#e7e7e7]/70 mt-4">Loading episode...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8 pb-24 relative" style={{ zIndex: 1 }}>
      <AnimatedBackground intensity="medium" />
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Episode Content */}
          <div className="bg-black border border-[#00FF99]/20 rounded-xl overflow-hidden">
            {episodeData ? (
              <div>
                {/* Episode Header */}
                <div className="bg-black p-8 border-b border-[#00FF99]/20">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#00FF99] mb-4 tracking-wide leading-tight font-medium cinematic-header">
                      {episodeData.episodeTitle}
                    </h1>
                    <div className="text-white/90 flex items-center text-lg tracking-wide">
                      <span className="mr-3">Episode {episodeId}/60</span>
                      <span className="text-[#00FF99]/60">•</span>
                      <span className="ml-3">Arc {arcIndex + 1}/6: Episode {episodeWithinArc}/10</span>
                      {narrativeArc?.title && narrativeArc.title !== `Arc ${arcIndex + 1}` && (
                        <>
                          <span className="text-[#00FF99]/60 mx-3">•</span>
                          <span className="text-[#00FF99]/80">{narrativeArc.title}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Episode Synopsis */}
                    <div className="mt-8 bg-gradient-to-r from-[#00FF99]/10 to-transparent p-6 rounded-lg border border-[#00FF99]/20">
                      <div className="text-white/95 text-xl leading-relaxed tracking-wide">
                        <span className="italic font-light">"{episodeData.synopsis}"</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Main Content with Scenes */}
                <div className="p-8 sm:p-10 bg-black">
                  <div className="max-w-3xl mx-auto">
                    {/* Divider */}
                    <div className="border-t border-[#00FF99]/20 mb-10"></div>
                    
                    {/* Scenes */}
                    <div className="space-y-12">
                      {episodeData.scenes && Array.isArray(episodeData.scenes) ? 
                        episodeData.scenes.map((scene, index) => {
                          const totalScenes = episodeData.scenes.length;
                          
                          // Dynamic scene labels based on total scene count
                          const getSceneLabel = (sceneIndex: number, total: number) => {
                            if (total === 1) return "The scene";
                            if (total === 2) return sceneIndex === 0 ? "First scene" : "Final scene";
                            if (total === 3) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === 1) return "Second scene";
                              return "Final scene";
                            }
                            if (total === 4) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === 1) return "Second scene";
                              if (sceneIndex === 2) return "Third scene";
                              return "Final scene";
                            }
                            if (total === 5) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === 1) return "Second scene";
                              if (sceneIndex === 2) return "Third scene";
                              if (sceneIndex === 3) return "Fourth scene";
                              return "Final scene";
                            }
                            if (total === 6) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === total - 1) return "Final scene";
                              return `Scene ${sceneIndex + 1}`;
                            }
                            if (total === 7) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === total - 1) return "Final scene";
                              return `Scene ${sceneIndex + 1}`;
                            }
                            if (total === 8) {
                              if (sceneIndex === 0) return "Opening scene";
                              if (sceneIndex === total - 1) return "Final scene";
                              return `Scene ${sceneIndex + 1}`;
                            }
                            return `Scene ${sceneIndex + 1}`;
                          };
                          
                          return (
                          <div key={scene.sceneNumber || index} className="mb-16 group">
                            {/* Scene Header with Chapter-like Styling */}
                            <div className="border-l-4 border-[#00FF99] pl-6 mb-8">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-2xl font-semibold text-[#00FF99] mb-2 tracking-wide">
                              {getSceneLabel(index, totalScenes)}
                            </h2>
                                  {scene.title && (
                                    <p className="text-white/70 text-lg italic">
                                      {scene.title}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Edit Scene Button */}
                                {!isSceneLocked && (
                                  <button
                                    onClick={() => startEditingScene(index)}
                                    className="opacity-0 group-hover:opacity-100 text-[#00FF99]/70 hover:text-[#00FF99] transition-all text-sm px-3 py-1 bg-[#00FF99]/10 rounded-lg border border-[#00FF99]/30 hover:bg-[#00FF99]/20"
                                    title="Edit scene content"
                                  >
                                    ✏️ Edit Scene
                                  </button>
                                )}
                                
                                {/* Lock Notice */}
                                {isSceneLocked && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    🔒 Locked
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Scene Content with Book-like Typography */}
                            <div className="prose prose-lg prose-invert max-w-none">
                              {editingScene === index ? (
                                /* Inline Editing Mode */
                                <div className="space-y-4">
                                  <div className="bg-[#1a1a1a] border border-[#00FF99]/30 rounded-lg p-4">
                                    <textarea
                                      value={editingSceneContent}
                                      onChange={(e) => setEditingSceneContent(e.target.value)}
                                      className="w-full bg-transparent text-white/95 text-xl leading-relaxed tracking-wide font-light resize-none border-none outline-none min-h-[300px]"
                                      placeholder="Edit scene content..."
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={saveSceneEdit}
                                      className="px-4 py-2 bg-[#00FF99] text-black font-semibold rounded-lg hover:bg-[#00CC7A] transition-colors flex items-center gap-2"
                                    >
                                      ✓ Save Changes
                                    </button>
                                    <button
                                      onClick={cancelEditingScene}
                                      className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                      ✕ Cancel
                                    </button>
                                    <div className="text-sm text-gray-400">
                                      Changes will be saved to localStorage
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Display Mode */
                                <div className="text-white/95 leading-relaxed text-xl tracking-wide font-light space-y-4">
                                  {scene.content.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={pIndex} className="mb-6 text-justify">
                                      {paragraph}
                                    </p>
                                  ))}
                                </div>
                              )}
                              </div>
                                </div>
                        )}) : 
                        <div>
                          <h2 className="text-2xl font-bold text-[#00FF99] mb-4">Scene information unavailable</h2>
                          <div className="text-white/80">Scene content could not be loaded.</div>
                            </div>
                      }
                      
                      {/* Episode rundown */}
                      {episodeData.rundown && (
                        <div className="mt-16 pt-8 border-t border-[#00FF99]/20">
                          <div className="border-l-4 border-[#00FF99] pl-6 mb-6">
                            <h2 className="text-2xl font-semibold text-[#00FF99] mb-2 tracking-wide">
                              Episode Analysis
                          </h2>
                            <p className="text-white/70 text-lg italic">
                              Behind the scenes insights
                            </p>
                          </div>
                          <div className="prose prose-lg prose-invert max-w-none">
                            <div className="text-white/90 leading-relaxed text-lg tracking-wide font-light">
                              {episodeData.rundown.split('\n\n').map((paragraph, pIndex) => (
                                <p key={pIndex} className="mb-4 text-justify">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                        </div>
                      </div>
                      )}
                </div>
                    
                    {/* Divider */}
                    <div className="border-t border-[#00FF99]/20 my-8"></div>
                
                {/* Continue to Next Episode */}
                    <div>
                      <h2 className="text-2xl font-bold text-[#00FF99] mb-6 text-center tracking-wide">
                    Ready for the next episode?
                      </h2>
                      
                  <div className="text-center space-y-4">
                    <p className="text-white/80 text-lg leading-relaxed">
                      Use the Director's Chair to craft your next episode with precision and creative control.
                    </p>
                    
                        <motion.button
                      onClick={() => router.push(`/episode-studio/${episodeId + 1}`)}
                      className="w-full max-w-md mx-auto bg-gradient-to-r from-[#00FF99] to-[#00cc7a] text-black px-8 py-4 rounded-lg font-semibold text-lg hover:from-[#00cc7a] hover:to-[#00b366] transition-all duration-200 shadow-[0_0_20px_rgba(0,255,153,0.3)] hover:shadow-[0_0_25px_rgba(0,255,153,0.5)]"
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                      📽️ Go to Director's Chair
                        </motion.button>
                        
                    <p className="text-[#e7e7e7]/60 text-sm">
                      Craft Episode {episodeId + 1} with the Episode Studio
                    </p>
                            </div>
                            </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-black">
                <p className="text-white/70">Episode data not found.</p>
                <button
                  onClick={() => router.push('/story-bible')}
                  className="mt-4 px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
                >
                  Return to Story Bible
                </button>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {episodeId > 1 && (
              <button
                onClick={() => router.push(`/episode/${episodeId - 1}`)}
                className="px-4 py-2 bg-black border border-[#00FF99]/30 text-white font-medium rounded-lg hover:bg-[#00FF99]/10 hover:border-[#00FF99]/50 transition-colors flex items-center tracking-wide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous Episode
              </button>
            )}
            
            <button
              onClick={() => router.push('/workspace')}
              className="px-4 py-2 bg-black border border-[#00FF99]/30 text-white font-medium rounded-lg hover:bg-[#00FF99]/10 hover:border-[#00FF99]/50 transition-colors tracking-wide"
            >
              Workspace
            </button>
            
            {/* Only show next episode button if a choice has been made */}
            {userChoices.some(choice => choice.episodeNumber === episodeId) && episodeId < 60 && (
              <button
                onClick={() => router.push(`/episode-studio/${episodeId + 1}`)}
                className="px-4 py-2 bg-black border border-[#00FF99]/30 text-white font-medium rounded-lg hover:bg-[#00FF99]/10 hover:border-[#00FF99]/50 transition-colors flex items-center tracking-wide"
              >
                Next Episode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Choice confirmation dialog - keep existing implementation */}
      <AnimatePresence>
        {showOptionDetails && selectedOption && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-[#00FF99]/50 rounded-xl p-6 max-w-lg w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#00FF99] tracking-wide">Choose this path?</h3>
              <div className="bg-[#00FF99]/5 border border-[#00FF99]/20 rounded-lg p-4 mb-4">
                <div className="text-[#00FF99] font-medium mb-2 tracking-wide">{selectedOption.text}</div>
                <p className="text-white/90 leading-relaxed font-light">{selectedOption.description}</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOptionDetails(false)}
                  className="px-4 py-2 bg-black border border-[#00FF99]/30 text-white font-medium rounded-lg hover:bg-[#00FF99]/10 transition-colors tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmChoice}
                  className="px-4 py-2 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors tracking-wide"
                >
                  Confirm Choice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creative Path Input Modal */}
      <AnimatePresence>
        {showCreativePath && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black border border-[#FF6B35]/50 rounded-xl p-6 max-w-2xl w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#FF6B35] tracking-wide flex items-center gap-2">
                ✨ The Most Creative Path
              </h3>
              <p className="text-white/80 mb-4 leading-relaxed">
                Write your own story continuation. What happens next is entirely up to you! Be as creative as you want.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#FF6B35] mb-2">
                  Your Story Continuation
                </label>
                <textarea
                  value={customStoryInput}
                  onChange={(e) => setCustomStoryInput(e.target.value)}
                  placeholder="Describe what happens next in the story..."
                  className="w-full h-32 p-4 bg-[#1a1a1a] border border-[#FF6B35]/30 rounded-lg text-white placeholder-white/50 focus:border-[#FF6B35]/70 focus:outline-none resize-none"
                  autoFocus
                />
                <div className="text-xs text-white/60 mt-1">
                  {customStoryInput.length} characters
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreativePath(false)
                    setCustomStoryInput('')
                  }}
                  className="px-4 py-2 bg-black border border-[#FF6B35]/30 text-white font-medium rounded-lg hover:bg-[#FF6B35]/10 transition-colors tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomStorySubmit}
                  disabled={!customStoryInput.trim()}
                  className="px-4 py-2 bg-[#FF6B35] text-white font-medium rounded-lg hover:bg-[#FF6B35]/80 transition-colors tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Your Story
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arc Completion Celebration Lightbox */}
      <AnimatePresence>
        {showCompletionLightbox && completedArcNumber !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00FF99] rounded-xl p-8 max-w-lg w-full shadow-2xl overflow-hidden relative"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {/* Background animated elements */}
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#00FF99]/20 blur-3xl z-0"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#00FF99]/20 blur-3xl z-0"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Confetti-like particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => {
                  // Pre-calculate random values to avoid hydration mismatch
                  const initialX = (i * 17) % 100 - 50; // Deterministic but varied
                  const animateX1 = (i * 23) % 100;
                  const animateX2 = (i * 31) % 100;
                  const animateX3 = (i * 37) % 100;
                  const duration = 4 + (i % 7);
                  const delay = (i % 3);
                  
                  return (
                    <motion.div
                      key={i}
                      className={`absolute rounded-full w-2 h-2 ${
                        i % 3 === 0 ? 'bg-[#00FF99]' : i % 3 === 1 ? 'bg-white' : 'bg-[#00CC7A]'
                      }`}
                      initial={{ 
                        x: initialX + "%", 
                        y: -10,
                        opacity: 0
                      }}
                      animate={{ 
                        y: ["0%", "100%"],
                        x: [
                          `${animateX1}%`, 
                          `${animateX2}%`, 
                          `${animateX3}%`
                        ],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: duration,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
                  transition={{ 
                    type: "spring", 
                    delay: 0.2,
                    duration: 0.8
                  }}
                >
                  <span className="text-6xl">🏆</span>
                </motion.div>
                
                <motion.h2
                  className="text-3xl font-bold text-center text-[#00FF99] mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Congratulations!
                </motion.h2>
                
                <motion.div
                  className="text-center text-[#e7e7e7] mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xl mb-2">You've completed Arc {completedArcNumber}!</p>
                  <p className="text-[#e7e7e7]/70">
                    Return to the workspace to start production or continue to the next arc.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <button
                    onClick={() => {
                      setShowCompletionLightbox(false);
                      router.push('/workspace');
                    }}
                    className="px-6 py-3 bg-[#00FF99] text-black font-medium rounded-lg hover:bg-[#00CC7A] transition-colors"
                  >
                    Go to Workspace
                  </button>
                </motion.div>
                
                <motion.p
                  className="text-center text-[#e7e7e7]/50 text-sm mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Redirecting in a few seconds...
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 