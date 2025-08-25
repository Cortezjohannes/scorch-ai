'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import EpisodeEngineLoader from '@/components/EpisodeEngineLoader'

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
  content: string
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

  // Effect to load story bible and previous choices from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Load story bible
        const savedBible = localStorage.getItem('reeled-story-bible')
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
            const savedEpisodes = localStorage.getItem('reeled-episodes')
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
          const savedChoices = localStorage.getItem('reeled-user-choices')
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
          const savedEpisodes = localStorage.getItem('reeled-episodes');
          if (savedEpisodes) {
            const episodes = JSON.parse(savedEpisodes);
            
            // If this episode exists in localStorage but not in our state
            if (episodes[episodeId] && !episodeData) {
              console.log(`Found episode ${episodeId} in localStorage during polling`);
              
              // Calculate how long we've been generating
              const generationTimeElapsed = generationStartTime ? (Date.now() - generationStartTime) / 1000 : 0;
              console.log(`Generation took approximately ${generationTimeElapsed.toFixed(1)} seconds`);
              
              // Clear intervals and timeouts
              if (generationTimeout) {
                clearTimeout(generationTimeout);
                setGenerationTimeout(null);
              }
              
              // Instead of forcing a refresh, set state and stop polling
              setEpisodeData(episodes[episodeId]);
              setLoading(false);
              setGenerating(false);
              // Clear the polling interval
              clearInterval(interval);
              setLocalStoragePollingInterval(null);
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

  // Effect to generate episode content when loaded
  useEffect(() => {
    const generateEpisode = async () => {
      if (!storyBible || generating || !previousEpisodesExist) return;
      
      setGenerating(true);
      setError(null);
      setGenerationStartTime(Date.now());
      
      // Set a timeout to handle stuck generation
      const timeout = setTimeout(() => {
        console.log(`Generation timeout for episode ${episodeId} - showing error`);
        
        // Check one more time if the episode exists in localStorage before showing the error
        try {
          const savedEpisodes = localStorage.getItem('reeled-episodes');
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
        
        setError('Episode generation is taking longer than expected. You can wait or try reloading the page.');
        setGenerating(false);
      }, 60000); // 60 second timeout
      
      setGenerationTimeout(timeout);
      
      try {
        // Find the most recent choice for the previous episode
        const previousChoice = userChoices.find(choice => choice.episodeNumber === episodeId - 1);
        
        // Get creative mode from user's original choice, not story bible
        let creativeMode = 'beast'; // default fallback
        const savedBible = localStorage.getItem('reeled-story-bible');
        if (savedBible) {
          try {
            const parsed = JSON.parse(savedBible);
            creativeMode = parsed.creativeMode || 'beast';
            console.log(`Using user's original mode choice: ${creativeMode}`);
          } catch (e) {
            console.warn('Could not parse saved bible for mode, using beast mode');
          }
        }
        
        console.log(`Client: Requesting episode ${episodeId} with mode: ${creativeMode}, previous choice:`, previousChoice?.choiceText || "none");
        
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
          clearTimeout(generationTimeout);
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
        
        console.log(`Client: Episode ${episodeId} processed successfully`);
        setEpisodeData(processedEpisodeData);
        setLoading(false);        // ensure loader closes
        setGenerating(false);     // ensure loader closes
        
        // Save the processed episode to localStorage
        const savedEpisodes = localStorage.getItem('reeled-episodes') 
          ? JSON.parse(localStorage.getItem('reeled-episodes')!) 
          : {};
          
        savedEpisodes[episodeId] = processedEpisodeData;
        localStorage.setItem('reeled-episodes', JSON.stringify(savedEpisodes));
      } catch (error) {
        console.error('Error generating episode:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        
        // Clear any existing timeout
        if (generationTimeout) {
          clearTimeout(generationTimeout);
          setGenerationTimeout(null);
        }
      } finally {
        setGenerating(false);
      }
    };
    
    // Check if we already have this episode in localStorage
    const checkSavedEpisode = () => {
      try {
        const savedEpisodes = localStorage.getItem('reeled-episodes');
        if (savedEpisodes) {
          const episodes = JSON.parse(savedEpisodes);
          if (episodes[episodeId]) {
            console.log(`Client: Loading episode ${episodeId} from localStorage`);
            setEpisodeData(episodes[episodeId]);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking saved episode:', error);
        return false;
      }
    };
    
    if (storyBible && !episodeData && !generating && previousEpisodesExist) {
      if (!checkSavedEpisode()) {
        generateEpisode();
      } else {
        setLoading(false);
      }
    }
    
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
    
    // Save to localStorage
    localStorage.setItem('reeled-user-choices', JSON.stringify(updatedChoices))
    
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
          // This episode is in arc i
          arcNumber = i + 1; // Arc number is 1-based
          
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
      console.log(`🎉 Arc ${arcNumber} completed at episode ${episodeId}`);
      
      // Set a flag in localStorage to show we completed this arc
      const completedArcs = localStorage.getItem('reeled-completed-arcs')
        ? JSON.parse(localStorage.getItem('reeled-completed-arcs')!)
        : {};
      completedArcs[arcNumber] = true;
      localStorage.setItem('reeled-completed-arcs', JSON.stringify(completedArcs));
      
      // Show completion lightbox instead of alert
      setCompletedArcNumber(arcNumber);
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
          localStorage.setItem('reeled-navigation-timestamp', Date.now().toString());
          
          // Navigate to next episode
          router.push(`/episode/${episodeId + 1}`);
        } else {
          // Series finale - could show a completion screen
          router.push('/series-complete');
        }
      }, 100);
    }
  }

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
          <h2 className="text-xl font-bold text-[#e2c376] mb-4">Episodes Must Be Generated In Order</h2>
          <p className="text-[#e7e7e7]/80 mb-6">
            You need to generate Episode 1 first before proceeding to later episodes.
          </p>
          <button
            onClick={() => router.push('/episode/1')}
            className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
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
      const savedEpisodes = localStorage.getItem('reeled-episodes');
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
          <h2 className="text-xl font-bold text-[#e2c376] mb-4">Something went wrong</h2>
          <p className="text-[#e7e7e7]/80 mb-6">{error || "Couldn't load the story bible."}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/story-bible')}
              className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
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

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Episode Content */}
          <div className="bg-black border border-[#e2c376]/20 rounded-xl overflow-hidden">
            {episodeData ? (
              <div>
                {/* Episode Header */}
                <div className="bg-black p-8 border-b border-[#e2c376]/20">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#e2c376] mb-4 tracking-wide leading-tight">
                      {episodeData.episodeTitle}
                    </h1>
                    <div className="text-white/90 flex items-center text-lg tracking-wide">
                      <span className="mr-3">Episode {episodeId}/60</span>
                      <span className="text-[#e2c376]/60">•</span>
                      <span className="ml-3">Arc {arcIndex + 1}/6: Episode {episodeWithinArc}/10</span>
                      {narrativeArc?.title && narrativeArc.title !== `Arc ${arcIndex + 1}` && (
                        <>
                          <span className="text-[#e2c376]/60 mx-3">•</span>
                          <span className="text-[#e2c376]/80">{narrativeArc.title}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Episode Synopsis */}
                    <div className="mt-8 text-white/95 text-xl leading-relaxed tracking-wide">
                      <span className="italic">"{episodeData.synopsis}"</span>
                    </div>
                  </div>
                </div>
                
                {/* Main Content with Scenes */}
                <div className="p-8 sm:p-10 bg-black">
                  <div className="max-w-3xl mx-auto">
                    {/* Divider */}
                    <div className="border-t border-[#e2c376]/20 mb-10"></div>
                    
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
                          <div key={scene.sceneNumber || index}>
                            <h2 className="text-3xl font-bold text-[#e2c376] mb-6 tracking-wide leading-tight">
                              {getSceneLabel(index, totalScenes)}
                            </h2>
                            <div className="text-white/95 leading-relaxed text-lg tracking-wide font-light">
                              {scene.content}
                              </div>
                                </div>
                        )}) : 
                        <div>
                          <h2 className="text-2xl font-bold text-[#e2c376] mb-4">Scene information unavailable</h2>
                          <div className="text-white/80">Scene content could not be loaded.</div>
                            </div>
                      }
                      
                      {/* Episode rundown */}
                      {episodeData.rundown && (
                        <div>
                          <h2 className="text-2xl font-bold text-[#e2c376] mb-4 tracking-wide">
                            Episode rundown
                          </h2>
                          <div className="text-white/90 leading-relaxed tracking-wide font-light">
                            {episodeData.rundown}
                        </div>
                      </div>
                      )}
                </div>
                    
                    {/* Divider */}
                    <div className="border-t border-[#e2c376]/20 my-8"></div>
                
                {/* Branching choices section */}
                    <div>
                      <h2 className="text-2xl font-bold text-[#e2c376] mb-6 text-center tracking-wide">
                        What happens next
                      </h2>
                      
                      <div className="space-y-5">
                        {episodeData.branchingOptions && Array.isArray(episodeData.branchingOptions) ? 
                          episodeData.branchingOptions.map((option) => {
                      // Check if this choice was already made
                      const choiceMade = userChoices.some(choice => 
                        choice.episodeNumber === episodeId && choice.choiceId === option.id
                            );
                      
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handleSelectOption(option)}
                                className={`w-full text-left p-6 bg-black border rounded-xl transition-all duration-300 relative ${
                            choiceMade 
                              ? 'bg-[#e2c376]/10 border-[#e2c376] text-[#e2c376]' 
                              : option.isCanonical 
                                ? 'border-[#e2c376]/50 hover:bg-[#e2c376]/8 hover:border-[#e2c376]/70'
                                : 'border-[#e2c376]/30 hover:bg-[#e2c376]/5 hover:border-[#e2c376]/50'
                          }`}
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                        >
                          {/* Canonical indicator */}
                          {option.isCanonical && !choiceMade && (
                            <div className="absolute top-4 right-4 bg-[#e2c376]/20 border border-[#e2c376]/50 px-2 py-1 rounded-full">
                              <span className="text-xs font-medium text-[#e2c376] tracking-wide">CANON</span>
                            </div>
                          )}
                          
                                <div className="flex items-start">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 font-bold ${
                              choiceMade ? 'bg-[#e2c376] text-black' : 'bg-[#e2c376]/20 text-[#e2c376]'
                            }`}>
                              {option.id}
                            </div>
                            <div className="flex-1 pr-16">
                                    <div className="font-medium text-lg text-[#e2c376] tracking-wide leading-relaxed">
                                      {option.text}
                                    </div>
                                    <div className="text-white/80 mt-3 leading-relaxed tracking-wide font-light">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                            );
                          }) :
                          <div className="text-center text-white/80">
                            <p>No branching choices available. Please try reloading the page.</p>
                            <button 
                              onClick={() => window.location.reload()} 
                              className="mt-4 px-4 py-2 bg-[#e2c376]/20 text-[#e2c376] rounded-lg hover:bg-[#e2c376]/30 border border-[#e2c376]/30"
                            >
                              Reload Page
                            </button>
                          </div>
                        }
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
                  className="mt-4 px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
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
                className="px-4 py-2 bg-black border border-[#e2c376]/30 text-white font-medium rounded-lg hover:bg-[#e2c376]/10 hover:border-[#e2c376]/50 transition-colors flex items-center tracking-wide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous Episode
              </button>
            )}
            
            <button
              onClick={() => router.push('/workspace')}
              className="px-4 py-2 bg-black border border-[#e2c376]/30 text-white font-medium rounded-lg hover:bg-[#e2c376]/10 hover:border-[#e2c376]/50 transition-colors tracking-wide"
            >
              Workspace
            </button>
            
            {/* Only show next episode button if a choice has been made */}
            {userChoices.some(choice => choice.episodeNumber === episodeId) && episodeId < 60 && (
              <button
                onClick={() => router.push(`/episode/${episodeId + 1}`)}
                className="px-4 py-2 bg-black border border-[#e2c376]/30 text-white font-medium rounded-lg hover:bg-[#e2c376]/10 hover:border-[#e2c376]/50 transition-colors flex items-center tracking-wide"
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
              className="bg-black border border-[#e2c376]/50 rounded-xl p-6 max-w-lg w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#e2c376] tracking-wide">Choose this path?</h3>
              <div className="bg-[#e2c376]/5 border border-[#e2c376]/20 rounded-lg p-4 mb-4">
                <div className="text-[#e2c376] font-medium mb-2 tracking-wide">{selectedOption.text}</div>
                <p className="text-white/90 leading-relaxed font-light">{selectedOption.description}</p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowOptionDetails(false)}
                  className="px-4 py-2 bg-black border border-[#e2c376]/30 text-white font-medium rounded-lg hover:bg-[#e2c376]/10 transition-colors tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmChoice}
                  className="px-4 py-2 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors tracking-wide"
                >
                  Confirm Choice
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
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#e2c376] rounded-xl p-8 max-w-lg w-full shadow-2xl overflow-hidden relative"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {/* Background animated elements */}
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#e2c376]/20 blur-3xl z-0"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#e2c376]/20 blur-3xl z-0"
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
                        i % 3 === 0 ? 'bg-[#e2c376]' : i % 3 === 1 ? 'bg-white' : 'bg-[#a87b2c]'
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
                  className="text-3xl font-bold text-center text-[#e2c376] mb-4"
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
                    className="px-6 py-3 bg-[#e2c376] text-black font-medium rounded-lg hover:bg-[#d4b46a] transition-colors"
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