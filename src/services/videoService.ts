'use client';

import { db, storage } from '../lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  uploadString, 
  deleteObject 
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { VideoFile } from '../context/VideoContext';

/**
 * Service for managing video operations with Firebase
 */
export const videoService = {
  /**
   * Upload a video file to Firebase Storage
   * @param userId The user ID
   * @param file The video file to upload
   * @param metadata Optional metadata for the video
   */
  async uploadVideo(userId: string, file: File, metadata: Partial<VideoFile> = {}): Promise<VideoFile> {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const videoId = uuidv4();
      const storageRef = ref(storage, `users/${userId}/videos/${videoId}`);
      
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Create a document in Firestore with the video metadata
      const videoCollection = collection(db, 'users', userId, 'videos');
      
      const videoData: VideoFile = {
        id: videoId,
        name: metadata.name || file.name,
        size: file.size,
        type: file.type,
        duration: metadata.duration || 0,
        url: downloadURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...metadata
      };
      
      await addDoc(videoCollection, videoData);
      
      return {
        ...videoData,
        url: downloadURL
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },
  
  /**
   * Upload a video from a data URL
   * @param userId The user ID
   * @param dataUrl The data URL of the video
   * @param metadata Optional metadata for the video
   */
  async uploadVideoFromDataUrl(userId: string, dataUrl: string, metadata: Partial<VideoFile> = {}): Promise<VideoFile> {
    if (!userId) throw new Error('User ID is required');
    if (!dataUrl) throw new Error('Data URL is required');
    
    try {
      const videoId = uuidv4();
      const storageRef = ref(storage, `users/${userId}/videos/${videoId}`);
      
      // Upload the data URL to Firebase Storage
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create a document in Firestore with the video metadata
      const videoCollection = collection(db, 'users', userId, 'videos');
      
      const videoData: VideoFile = {
        id: videoId,
        name: metadata.name || `Video ${videoId.slice(0, 8)}`,
        size: 0, // Size unknown for data URLs
        type: metadata.type || 'video/mp4',
        duration: metadata.duration || 0,
        url: downloadURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...metadata
      };
      
      await addDoc(videoCollection, videoData);
      
      return {
        ...videoData,
        url: downloadURL
      };
    } catch (error) {
      console.error('Error uploading video from data URL:', error);
      throw error;
    }
  },
  
  /**
   * Get all videos for a user
   * @param userId The user ID
   */
  async getUserVideos(userId: string): Promise<VideoFile[]> {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const videoCollection = collection(db, 'users', userId, 'videos');
      const q = query(videoCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as VideoFile[];
    } catch (error) {
      console.error('Error getting user videos:', error);
      throw error;
    }
  },
  
  /**
   * Get a single video by ID
   * @param userId The user ID
   * @param videoId The video ID
   */
  async getVideo(userId: string, videoId: string): Promise<VideoFile | null> {
    if (!userId) throw new Error('User ID is required');
    if (!videoId) throw new Error('Video ID is required');
    
    try {
      const videoDoc = doc(db, 'users', userId, 'videos', videoId);
      const snapshot = await getDoc(videoDoc);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        ...snapshot.data(),
        id: snapshot.id
      } as VideoFile;
    } catch (error) {
      console.error('Error getting video:', error);
      throw error;
    }
  },
  
  /**
   * Update a video's metadata
   * @param userId The user ID
   * @param videoId The video ID
   * @param updates The updates to apply
   */
  async updateVideo(userId: string, videoId: string, updates: Partial<VideoFile>): Promise<void> {
    if (!userId) throw new Error('User ID is required');
    if (!videoId) throw new Error('Video ID is required');
    
    try {
      const videoDoc = doc(db, 'users', userId, 'videos', videoId);
      await updateDoc(videoDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },
  
  /**
   * Delete a video
   * @param userId The user ID
   * @param videoId The video ID
   */
  async deleteVideo(userId: string, videoId: string): Promise<void> {
    if (!userId) throw new Error('User ID is required');
    if (!videoId) throw new Error('Video ID is required');
    
    try {
      // Delete from Firestore
      const videoDoc = doc(db, 'users', userId, 'videos', videoId);
      await deleteDoc(videoDoc);
      
      // Delete from Storage
      const storageRef = ref(storage, `users/${userId}/videos/${videoId}`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
}; 