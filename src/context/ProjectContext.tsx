'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { collection, doc, getDoc, updateDoc, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { extendSeriesWithArc } from '@/services/story-bible-service';

// Types
export type Character = {
  name: string;
  archetype: string;
  arc: string;
  description: string;
};

export type Episode = {
  number: number;
  title: string;
  summary: string;
  script?: string;
  branchingOptions?: string[];
  chosenPath?: string;
};

export type NarrativeArc = {
  title: string;
  summary: string;
  episodes: Episode[];
};

export type WorldBuilding = {
  setting: string;
  rules: string;
  locations: Array<{ name: string; description: string }>;
};

// Add types for the new assets
export type PropsAndWardrobe = {
  props: Array<{
    sceneName: string;
    items: Array<{
      name: string;
      description: string;
      character?: string;
      significance?: string;
    }>;
  }>;
  wardrobe: Array<{
    character: string;
    items: Array<{
      sceneName: string;
      description: string;
      notes?: string;
    }>;
  }>;
};

export type MarketingGuide = {
  targetAudience: {
    primary: string;
    secondary: string;
  };
  loglines: string[];
  taglines: string[];
  keySellingPoints: string[];
  visualStyle: {
    colorPalette: string;
    imageryThemes: string;
    posterConcepts: string[];
  };
  audioStrategy: {
    musicGenre: string;
    soundDesign: string;
    voiceoverTone: string;
  };
  socialMediaStrategy: {
    platforms: string[];
    contentApproach: string;
    engagementIdeas: string[];
  };
};

export type PostProductionBrief = {
  overallStyle: {
    editingStyle: string;
    colorGradingPalette: string;
    musicGenre: string;
    pacingNotes: string;
  };
  sceneBySceneGuide: Array<{
    sceneName: string;
    pacing: string;
    transitions: string;
    emotionalKeywords: string[];
    colorGrading: string;
    soundDesign: string;
    musicCues: string;
    specialNotes?: string;
  }>;
  keyMoments: Array<{
    description: string;
    timestamp: string;
    editingNotes: string;
    importance: string;
  }>;
  technicalRequirements: {
    visualEffects: string[];
    soundEffects: string[];
    specialTechniques: string[];
  };
};

// Update StoryBible type to include the new asset types
export type StoryBible = {
  seriesTitle: string;
  mainCharacters: Character[];
  narrativeArcs: NarrativeArc[];
  potentialBranchingPaths: string;

  // Added optional metadata for display
  synopsis?: string;
  theme?: string;
  genre?: string;
  seriesOverview?: string;

  potentialNewCharacters?: string;
  potentialNewLocations?: string;
  narrativeElements?: {
    callbacks: string;
    foreshadowing: string;
    recurringMotifs: string;
  };
  worldBuilding?: WorldBuilding;
  propsAndWardrobe?: PropsAndWardrobe;
  marketingGuide?: MarketingGuide;
  postProductionBrief?: PostProductionBrief;
};

// Add the Scene type with imageUrl property
export type Scene = {
  heading: string;
  description: string;
  imageUrl?: string;
  imageGenerating?: boolean;
};

// Update the GeneratedEpisode type to include scenes and narrative elements
export type GeneratedEpisode = {
  episodeNumber: number;
  episodeTitle?: string;
  synopsis?: string;
  script: string;
  rundown?: string;
  callbacks?: string[];
  foreshadowing?: string[];
  newCharacters?: string[];
  newLocations?: string[];
  branchingOptions: string[];
  chosenPath?: string;
  scenes?: Scene[];
};

// Update ProjectContextType to include new functions
type ProjectContextType = {
  projectId: string | null;
  projectTitle: string;
  projectTheme: string;
  storyBible: StoryBible | null;
  episodes: GeneratedEpisode[];
  loading: boolean;
  error: string | null;
  generateEpisode: (episodeNumber: number, previousChoice?: string) => Promise<void>;
  setEpisodeChoice: (episodeNumber: number, choice: string) => Promise<void>;
  generateSceneImage: (episodeNumber: number, sceneIndex: number, prompt: string) => Promise<string>;
  parseScenes: (episodeNumber: number) => Scene[];
  generatePropsAndWardrobe: () => Promise<void>;
  generateMarketingGuide: () => Promise<void>;
  generatePostProductionBrief: () => Promise<void>;
  isGeneratingAsset: (assetType: 'props_wardrobe' | 'marketing' | 'post_production_brief') => boolean;
  extendSeries: (episodesPerArc?: number) => Promise<void>;
};

// Update the default context with new functions
const defaultContext: ProjectContextType = {
  projectId: null,
  projectTitle: 'Untitled Project',
  projectTheme: '',
  storyBible: null,
  episodes: [],
  loading: false,
  error: null,
  generateEpisode: async () => {},
  setEpisodeChoice: async () => {},
  generateSceneImage: async () => '',
  parseScenes: () => [],
  generatePropsAndWardrobe: async () => {},
  generateMarketingGuide: async () => {},
  generatePostProductionBrief: async () => {},
  isGeneratingAsset: () => false,
  extendSeries: async () => {}
};

const ProjectContext = createContext<ProjectContextType>(defaultContext);

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children, projectId }: { children: ReactNode; projectId: string }) => {
  // Existing state variables
  const [projectTitle, setProjectTitle] = useState<string>('Untitled Project');
  const [projectTheme, setProjectTheme] = useState<string>('');
  const [storyBible, setStoryBible] = useState<StoryBible | null>(null);
  const [episodes, setEpisodes] = useState<GeneratedEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add new state for tracking asset generation
  const [generatingPropsWardrobe, setGeneratingPropsWardrobe] = useState<boolean>(false);
  const [generatingMarketing, setGeneratingMarketing] = useState<boolean>(false);
  const [generatingPostProduction, setGeneratingPostProduction] = useState<boolean>(false);
  
  const { user } = useAuth();

  // Load project data when component mounts
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          // Check localStorage if user is not authenticated
          const localStoryBible = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible');
          if (localStoryBible) {
            const parsedData = JSON.parse(localStoryBible);
            setProjectTitle(parsedData.storyBible?.seriesTitle || 'Untitled Project');
            setProjectTheme(parsedData.theme || '');
            setStoryBible(parsedData.storyBible || null);
          }
          
          // Load episodes from localStorage
          const localEpisodes = localStorage.getItem('scorched-episodes') || localStorage.getItem('reeled-episodes');
          if (localEpisodes) {
            setEpisodes(JSON.parse(localEpisodes));
          }
        } else if (projectId) {
          // Fetch from Firestore if user is authenticated
          const projectRef = doc(db, 'users', user.id, 'projects', projectId);
          const projectDoc = await getDoc(projectRef);
          
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            setProjectTitle(projectData.title || 'Untitled Project');
            setProjectTheme(projectData.theme || '');
            setStoryBible(projectData.storyBible || null);
            
            // Load episodes if they exist
            const episodesRef = collection(projectRef, 'episodes');
            const episodesSnapshot = await getDocs(episodesRef);
            const episodesData = episodesSnapshot.docs.map(doc => ({
              ...doc.data() as GeneratedEpisode,
              id: doc.id
            }));
            
            setEpisodes(episodesData);
          } else {
            setError('Project not found');
          }
        }
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, user]);

  // Generate a new episode
  const generateEpisode = async (episodeNumber: number, previousChoice?: string) => {
    try {
      setLoading(true);
      
      // Generate episode using the API
      const response = await fetch('/api/generate/episode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storyBible,
          currentEpisodeNumber: episodeNumber,
          previousChoice
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate episode');
      }
      
      const data = await response.json();
      const newEpisode: GeneratedEpisode = data.episode;
      
      // Update episodes state
      setEpisodes(prev => {
        const exists = prev.findIndex(ep => ep.episodeNumber === episodeNumber);
        let updatedEpisodes;
        if (exists >= 0) {
          updatedEpisodes = [...prev];
          updatedEpisodes[exists] = newEpisode;
        } else {
          updatedEpisodes = [...prev, newEpisode];
        }
      
        // Save to localStorage with the updated episodes
      localStorage.setItem('scorched-episodes', JSON.stringify(updatedEpisodes));
        
        return updatedEpisodes;
      });
      
      // Save to Firestore if user is authenticated
      if (user && projectId) {
        const episodeRef = doc(collection(db, 'users', user.id, 'projects', projectId, 'episodes'), `episode-${episodeNumber}`);
        await setDoc(episodeRef, {
          ...newEpisode,
          updatedAt: serverTimestamp()
        });
      }
      
    } catch (err) {
      console.error('Error generating episode:', err);
      setError('Failed to generate episode');
    } finally {
      setLoading(false);
    }
  };
  
  // Update episode choice
  const setEpisodeChoice = async (episodeNumber: number, choice: string) => {
    try {
      // Update episodes state
      setEpisodes(prev => {
        return prev.map(ep => {
          if (ep.episodeNumber === episodeNumber) {
            return { ...ep, chosenPath: choice };
          }
          return ep;
        });
      });
      
      // Save to localStorage
      const updatedEpisodes = episodes.map(ep => {
        if (ep.episodeNumber === episodeNumber) {
          return { ...ep, chosenPath: choice };
        }
        return ep;
      });
      
      localStorage.setItem('scorched-episodes', JSON.stringify(updatedEpisodes));
      
      // Save to Firestore if user is authenticated
      if (user && projectId) {
        const episodeRef = doc(db, 'users', user.id, 'projects', projectId, 'episodes', `episode-${episodeNumber}`);
        await updateDoc(episodeRef, {
          chosenPath: choice,
          updatedAt: serverTimestamp()
        });
      }
      
    } catch (err) {
      console.error('Error updating episode choice:', err);
      setError('Failed to update choice');
    }
  };

  // Parse script to extract scenes
  const parseScenes = (episodeNumber: number): Scene[] => {
    const episode = episodes.find(ep => ep.episodeNumber === episodeNumber);
    
    if (!episode) return [];
    
    // Return existing scenes if already parsed
    if (episode.scenes && episode.scenes.length > 0) {
      return episode.scenes;
    }
    
    const script = episode.script;
    if (!script) return [];
    
    // Parse script to extract scenes
    const sceneRegex = /INT\.|EXT\.|INT\/EXT\..*?(?=INT\.|EXT\.|INT\/EXT\.|$)/g;
    const matches = script.match(sceneRegex);
    
    if (!matches) {
      // If no scene markers, create a single scene from the whole script
      return [{
        heading: `EPISODE ${episodeNumber}`,
        description: script.substring(0, 200) + (script.length > 200 ? '...' : ''),
        imageUrl: undefined
      }];
    }
    
    return matches.map((sceneText, index) => {
      // Extract scene heading (first line)
      const lines = sceneText.split('\n');
      const heading = lines[0].trim();
      
      // Extract scene description (rest of the text, shortened)
      const description = sceneText.substring(heading.length).trim();
      const shortDescription = description.substring(0, 200) + (description.length > 200 ? '...' : '');
      
      return {
        heading,
        description: shortDescription,
        imageUrl: undefined
      };
    });
  };

  // Generate image for a specific scene
  const generateSceneImage = async (episodeNumber: number, sceneIndex: number, prompt: string): Promise<string> => {
    try {
      // Find the episode
      const episodeToUpdate = episodes.find(ep => ep.episodeNumber === episodeNumber);
      if (!episodeToUpdate) {
        throw new Error(`Episode ${episodeNumber} not found`);
      }
      
      // Parse scenes if not already done
      if (!episodeToUpdate.scenes || episodeToUpdate.scenes.length === 0) {
        episodeToUpdate.scenes = parseScenes(episodeNumber);
      }
      
      // Check if scene exists
      if (!episodeToUpdate.scenes[sceneIndex]) {
        throw new Error(`Scene ${sceneIndex} not found in episode ${episodeNumber}`);
      }
      
      // Set scene as generating
      setEpisodes(prevEpisodes => {
        return prevEpisodes.map(ep => {
          if (ep.episodeNumber === episodeNumber) {
            const updatedScenes = [...(ep.scenes || [])];
            updatedScenes[sceneIndex] = {
              ...updatedScenes[sceneIndex],
              imageGenerating: true
            };
            
            return {
              ...ep,
              scenes: updatedScenes
            };
          }
          return ep;
        });
      });
      
      // Call the API to generate the image
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
          userId: user?.id  // Pass userId for caching
        })
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Image generation failed: ${imageResponse.statusText}`);
      }
      
      const imageData = await imageResponse.json();
      const imageUrl = imageData.imageUrl || imageData.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }

      // Store base64 data URL directly (can be persisted)
      // Convert to blob URL only for display in components
      
      // Update the episode with the generated image URL
      setEpisodes(prevEpisodes => {
        const updatedEpisodes = prevEpisodes.map(ep => {
          if (ep.episodeNumber === episodeNumber) {
            const updatedScenes = [...(ep.scenes || [])];
            updatedScenes[sceneIndex] = {
              ...updatedScenes[sceneIndex],
              imageUrl,
              imageGenerating: false
            };
            
            return {
              ...ep,
              scenes: updatedScenes
            };
          }
          return ep;
        });
        
        // Save to localStorage
        localStorage.setItem('scorched-episodes', JSON.stringify(updatedEpisodes));
        
        return updatedEpisodes;
      });
      
      // Save to Firestore if user is authenticated
      if (user && projectId) {
        try {
          const episodeRef = doc(db, 'users', user.id, 'projects', projectId, 'episodes', `episode-${episodeNumber}`);
          await updateDoc(episodeRef, {
            scenes: episodeToUpdate.scenes.map((scene, idx) => {
              if (idx === sceneIndex) {
                return {
                  ...scene,
                  imageUrl,
                  imageGenerating: false
                };
              }
              return scene;
            }),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.error('Error saving scene image to Firestore:', err);
        }
      }
      
      return imageUrl;
    } catch (err) {
      console.error('Error generating scene image:', err);
      
      // Reset the image generating state
      setEpisodes(prevEpisodes => {
        return prevEpisodes.map(ep => {
          if (ep.episodeNumber === episodeNumber) {
            const updatedScenes = [...(ep.scenes || [])];
            if (updatedScenes[sceneIndex]) {
              updatedScenes[sceneIndex] = {
                ...updatedScenes[sceneIndex],
                imageGenerating: false
              };
            }
            
            return {
              ...ep,
              scenes: updatedScenes
            };
          }
          return ep;
        });
      });
      
      throw err;
    }
  };

  // Function to check if a specific asset is being generated
  const isGeneratingAsset = (assetType: 'props_wardrobe' | 'marketing' | 'post_production_brief'): boolean => {
    switch (assetType) {
      case 'props_wardrobe':
        return generatingPropsWardrobe;
      case 'marketing':
        return generatingMarketing;
      case 'post_production_brief':
        return generatingPostProduction;
      default:
        return false;
    }
  };

  // Extend series by adding a new arc
  const extendSeries = async (episodesPerArc: number = 8): Promise<void> => {
    if (!storyBible) {
      setError('No story bible available to extend');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the service function to extend the series
      const updatedBible = await extendSeriesWithArc(storyBible, user?.id, episodesPerArc);
      
      // Update state
      setStoryBible(updatedBible);
      
      // Also update localStorage for consistency
      if (typeof window !== 'undefined') {
        const storyBibleData = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible') || localStorage.getItem('greenlit-story-bible');
        if (storyBibleData) {
          const parsed = JSON.parse(storyBibleData);
          localStorage.setItem('scorched-story-bible', JSON.stringify({
            ...parsed,
            storyBible: updatedBible
          }));
        }
      }

      console.log('✅ Series extended with new arc');
    } catch (err: any) {
      console.error('Error extending series:', err);
      setError(`Failed to extend series: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to combine all episode scripts
  const getCombinedScript = (): string => {
    return episodes
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map(episode => episode.script)
      .join('\n\n');
  };
  
  // Function to update storyBible with new asset data
  const updateStoryBibleWithAsset = async <T,>(
    assetType: 'propsAndWardrobe' | 'marketingGuide' | 'postProductionBrief',
    data: T
  ) => {
    if (!storyBible) return;
    
    // Update state
    setStoryBible(prevBible => {
      if (!prevBible) return prevBible;
      
      const updatedBible = {
        ...prevBible,
        [assetType]: data
      };
      
      // Save to localStorage
      const storyBibleData = localStorage.getItem('scorched-story-bible') || localStorage.getItem('reeled-story-bible');
      if (storyBibleData) {
        const parsed = JSON.parse(storyBibleData);
        localStorage.setItem('scorched-story-bible', JSON.stringify({
          ...parsed,
          storyBible: updatedBible
        }));
      }
      
      return updatedBible;
    });
    
    // Save to Firestore if user is authenticated
    if (user && projectId) {
      try {
        const projectRef = doc(db, 'users', user.id, 'projects', projectId);
        await updateDoc(projectRef, {
          [`storyBible.${assetType}`]: data,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error(`Error saving ${assetType} to Firestore:`, err);
        throw err;
      }
    }
  };
  
  // Generate Props and Wardrobe
  const generatePropsAndWardrobe = async () => {
    if (!storyBible || episodes.length === 0) {
      setError('No story or episodes available to analyze');
      return;
    }
    
    try {
      setGeneratingPropsWardrobe(true);
      setError(null);
      
      const scriptText = getCombinedScript();
      
      const response = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptText,
          task: 'props_wardrobe'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate props and wardrobe: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Invalid response from API');
      }
      
      await updateStoryBibleWithAsset('propsAndWardrobe', data.result);
      console.log('Props and wardrobe generated successfully');
      
    } catch (err: any) {
      console.error('Error generating props and wardrobe:', err);
      setError(`Failed to generate props and wardrobe: ${err.message}`);
    } finally {
      setGeneratingPropsWardrobe(false);
    }
  };
  
  // Generate Marketing Guide
  const generateMarketingGuide = async () => {
    if (!storyBible || episodes.length === 0) {
      setError('No story or episodes available to analyze');
      return;
    }
    
    try {
      setGeneratingMarketing(true);
      setError(null);
      
      const scriptText = getCombinedScript();
      
      const response = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptText,
          task: 'marketing'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate marketing guide: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Invalid response from API');
      }
      
      await updateStoryBibleWithAsset('marketingGuide', data.result);
      console.log('Marketing guide generated successfully');
      
    } catch (err: any) {
      console.error('Error generating marketing guide:', err);
      setError(`Failed to generate marketing guide: ${err.message}`);
    } finally {
      setGeneratingMarketing(false);
    }
  };
  
  // Generate Post-Production Brief
  const generatePostProductionBrief = async () => {
    if (!storyBible || episodes.length === 0) {
      setError('No story or episodes available to analyze');
      return;
    }
    
    try {
      setGeneratingPostProduction(true);
      setError(null);
      
      const scriptText = getCombinedScript();
      
      const response = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptText,
          task: 'post_production_brief'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate post-production brief: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Invalid response from API');
      }
      
      await updateStoryBibleWithAsset('postProductionBrief', data.result);
      console.log('Post-production brief generated successfully');
      
    } catch (err: any) {
      console.error('Error generating post-production brief:', err);
      setError(`Failed to generate post-production brief: ${err.message}`);
    } finally {
      setGeneratingPostProduction(false);
    }
  };

  const value = {
    projectId,
    projectTitle,
    projectTheme,
    storyBible,
    episodes,
    loading,
    error,
    generateEpisode,
    setEpisodeChoice,
    generateSceneImage,
    parseScenes,
    generatePropsAndWardrobe,
    generateMarketingGuide,
    generatePostProductionBrief,
    isGeneratingAsset,
    extendSeries
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext; 