'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import { storage, db } from '@/lib/firebase'
import { useAuth } from './AuthContext'
import { doc, setDoc, updateDoc, getDoc, deleteDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore'

// Define the interface for a video file
export interface VideoFile {
  id: string
  name: string
  url: string
  uploadDate: string
  size: number
  type: string
  duration?: number
  thumbnail?: string
  metadata?: {
    fps?: number
    resolution?: string
    codec?: string
    [key: string]: any
  }
  status: 'uploading' | 'processing' | 'ready' | 'error'
  projectId?: string
  matchedSceneName?: string
  processing?: boolean
}

// Define the interface for the VideoContext
interface VideoContextType {
  videos: VideoFile[]
  uploadVideo: (file: File, projectId?: string) => Promise<VideoFile>
  getVideo: (videoId: string) => VideoFile | undefined
  deleteVideo: (videoId: string) => Promise<void>
  updateVideoMetadata: (videoId: string, metadata: Partial<VideoFile>) => Promise<void>
  isUploading: boolean
  uploadProgress: number
  error: string | null
  
  // Legacy support for components still using old API
  uploadedVideos: VideoFile[]
  addVideos: (files: File[]) => void
  removeVideo: (id: string) => void
  selectedVideo: VideoFile | null
  setSelectedVideo: (video: VideoFile | null) => void
}

// Create the context with default values
const VideoContext = createContext<VideoContextType>({
  videos: [],
  uploadVideo: async () => ({} as VideoFile),
  getVideo: () => undefined,
  deleteVideo: async () => {},
  updateVideoMetadata: async () => {},
  isUploading: false,
  uploadProgress: 0,
  error: null,
  
  // Legacy support
  uploadedVideos: [],
  addVideos: () => {},
  removeVideo: () => {},
  selectedVideo: null,
  setSelectedVideo: () => {}
})

// Provider component to wrap around components that need access to this context
export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // For legacy support
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null)
  
  // Load videos from Firebase when the user changes
  useEffect(() => {
    const loadVideos = async () => {
      if (!user) {
        setVideos([]);
        return;
      }
      
      try {
        // Get user's videos collection reference
        const userVideosRef = ref(storage, `users/${user.id}/videos`);
        
        // List all videos in the user's storage
        const result = await listAll(userVideosRef);
        
        // Get user's video metadata from Firestore
        const videoMetadataDoc = await getDoc(doc(db, 'users', user.id, 'metadata', 'videos'));
        const videoMetadata = videoMetadataDoc.exists() ? videoMetadataDoc.data().videos : [];
        
        // Map the files to our VideoFile interface
        const videoPromises = result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          
          // Find metadata for this video
          const metadata = videoMetadata.find((v: any) => v.id === item.name) || {};
          
          return {
            id: item.name,
            name: metadata.name || item.name,
            url,
            uploadDate: metadata.uploadDate || new Date().toISOString(),
            size: metadata.size || 0,
            type: metadata.type || 'video/mp4',
            duration: metadata.duration,
            thumbnail: metadata.thumbnail,
            metadata: metadata.metadata || {},
            status: metadata.status || 'ready',
            projectId: metadata.projectId
          };
        });
        
        const loadedVideos = await Promise.all(videoPromises);
        setVideos(loadedVideos);
        
        // Set first video as selected for legacy components
        if (loadedVideos.length > 0 && !selectedVideo) {
          setSelectedVideo(loadedVideos[0]);
        }
      } catch (err) {
        console.error('Error loading videos:', err);
        setError('Failed to load videos');
      }
    };
    
    loadVideos();
  }, [user, selectedVideo]);
  
  // Legacy function to add videos
  const addVideos = async (files: File[]) => {
    if (!files.length) return;
    
    console.log('Adding videos to upload queue:', files.length, 'files');
    console.log('File types:', files.map(f => f.type).join(', '));
    
    // Check if user is logged in
    if (!user) {
      console.error('Cannot upload videos: No user is logged in');
      setError('You must be logged in to upload videos');
      return;
    }
    
    // Filter out non-video files
    const videoFiles = files.filter(file => 
      file.type.startsWith('video/') || 
      file.name.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)
    );
    
    if (videoFiles.length === 0) {
      console.error('No valid video files to upload');
      setError('Please select valid video files (MP4, MOV, etc.)');
      return;
    }
    
    console.log('Valid video files:', videoFiles.length);
    
    for (const file of videoFiles) {
      try {
        console.log(`Processing file: ${file.name} (${formatFileSize(file.size)})`);
        const uploadedVideo = await uploadVideo(file);
        console.log('Video uploaded successfully:', uploadedVideo.id);
        setSelectedVideo(uploadedVideo);
      } catch (err) {
        console.error('Error adding video:', err);
      }
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i < sizes.length ? i : 0];
  };
  
  // Legacy function to remove a video
  const removeVideo = async (id: string) => {
    try {
      await deleteVideo(id);
      if (selectedVideo && selectedVideo.id === id) {
        setSelectedVideo(videos.length > 0 ? videos[0] : null);
      }
    } catch (err) {
      console.error('Error removing video:', err);
    }
  };
  
  // Function to upload a video
  const uploadVideo = async (file: File, projectId?: string): Promise<VideoFile> => {
    if (!user) {
      throw new Error('User must be logged in to upload videos');
    }
    
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('Starting video upload process for:', file.name);
      
      // Create a unique ID for the video
      const videoId = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      console.log('Generated video ID:', videoId);
      
      // Create a reference to the file location in Firebase Storage
      const videoRef = ref(storage, `users/${user.id}/videos/${videoId}`);
      console.log('Storage path:', `users/${user.id}/videos/${videoId}`);
      
      // Upload the file to Firebase Storage
      console.log('Starting Firebase upload...');
      const uploadTask = await uploadBytes(videoRef, file);
      console.log('Upload complete, getting download URL...');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log('Download URL obtained:', downloadURL);
      
      // Create the video object
      const newVideo: VideoFile = {
        id: videoId,
        name: file.name,
        url: downloadURL,
        uploadDate: new Date().toISOString(),
        size: file.size,
        type: file.type,
        status: 'ready',
        metadata: {},
        projectId
      };
      
      // Save the video metadata to Firestore
      console.log('Saving metadata to Firestore...');
      const userVideoMetadataRef = doc(db, 'users', user.id, 'metadata', 'videos');
      const metadataDoc = await getDoc(userVideoMetadataRef);
      
      if (metadataDoc.exists()) {
        await updateDoc(userVideoMetadataRef, {
          videos: arrayUnion({
            id: videoId,
            name: file.name,
            uploadDate: new Date().toISOString(),
            size: file.size,
            type: file.type,
            status: 'ready',
            projectId
          })
        });
      } else {
        await setDoc(userVideoMetadataRef, {
          videos: [{
            id: videoId,
            name: file.name,
            uploadDate: new Date().toISOString(),
            size: file.size,
            type: file.type,
            status: 'ready',
            projectId
          }]
        });
      }
      
      // If a project ID is provided, update the project with the video
      if (projectId) {
        console.log('Updating project with video reference...');
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          await updateDoc(projectRef, {
            videos: arrayUnion(videoId),
            updatedAt: Timestamp.now()
          });
        }
      }
      
      // Update the local state
      console.log('Upload successful, updating local state...');
      setVideos(prev => [...prev, newVideo]);
      
      return newVideo;
    } catch (err: any) {
      console.error('Error uploading video:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Failed to upload video');
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };
  
  // Function to get a specific video
  const getVideo = (videoId: string): VideoFile | undefined => {
    return videos.find(v => v.id === videoId);
  };
  
  // Function to delete a video
  const deleteVideo = async (videoId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to delete videos');
    }
    
    try {
      // Reference to the video in Firebase Storage
      const videoRef = ref(storage, `users/${user.id}/videos/${videoId}`);
      
      // Delete the file from Firebase Storage
      await deleteObject(videoRef);
      
      // Update the Firestore metadata
      const userVideoMetadataRef = doc(db, 'users', user.id, 'metadata', 'videos');
      await updateDoc(userVideoMetadataRef, {
        videos: arrayRemove(videos.find(v => v.id === videoId))
      });
      
      // If the video is associated with a project, update the project
      const videoData = videos.find(v => v.id === videoId);
      if (videoData?.projectId) {
        const projectRef = doc(db, 'projects', videoData.projectId);
        await updateDoc(projectRef, {
          videos: arrayRemove(videoId),
          updatedAt: Timestamp.now()
        });
      }
      
      // Update the local state
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err: any) {
      console.error('Error deleting video:', err);
      setError(err.message || 'Failed to delete video');
      throw err;
    }
  };
  
  // Function to update video metadata
  const updateVideoMetadata = async (videoId: string, metadata: Partial<VideoFile>): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to update video metadata');
    }
    
    try {
      // Find the video in the local state
      const videoIndex = videos.findIndex(v => v.id === videoId);
      if (videoIndex === -1) {
        throw new Error('Video not found');
      }
      
      // Update the metadata in Firestore
      const userVideoMetadataRef = doc(db, 'users', user.id, 'metadata', 'videos');
      const metadataDoc = await getDoc(userVideoMetadataRef);
      
      if (metadataDoc.exists()) {
        const videoMetadata = metadataDoc.data().videos;
        const updatedMetadata = videoMetadata.map((v: any) => {
          if (v.id === videoId) {
            return { ...v, ...metadata };
          }
          return v;
        });
        
        await updateDoc(userVideoMetadataRef, {
          videos: updatedMetadata
        });
      }
      
      // Update the local state
      const updatedVideos = [...videos];
      updatedVideos[videoIndex] = {
        ...updatedVideos[videoIndex],
        ...metadata
      };
      
      setVideos(updatedVideos);
      
      // Update selectedVideo if needed
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo({
          ...selectedVideo,
          ...metadata
        });
      }
    } catch (err: any) {
      console.error('Error updating video metadata:', err);
      setError(err.message || 'Failed to update video metadata');
      throw err;
    }
  };
  
  return (
    <VideoContext.Provider
      value={{
        videos,
        uploadVideo,
        getVideo,
        deleteVideo,
        updateVideoMetadata,
        isUploading,
        uploadProgress,
        error,
        
        // Legacy support
        uploadedVideos: videos,
        addVideos,
        removeVideo,
        selectedVideo,
        setSelectedVideo
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

// Custom hook to use the video context
export const useVideo = () => useContext(VideoContext) 