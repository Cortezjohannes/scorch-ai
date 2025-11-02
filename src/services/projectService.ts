'use client';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  theme?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  content?: any;
  userId?: string;
}

/**
 * Save a project to Firestore
 */
export async function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, userId: string, existingId?: string): Promise<Project> {
  try {
    const projectId = existingId || uuidv4();
    const projectsRef = collection(db, 'users', userId, 'projects');
    const now = new Date();
    
    const newProject: Project = {
      id: projectId,
      title: project.title,
      synopsis: project.synopsis,
      theme: project.theme,
      content: project.content || null,
      createdAt: existingId ? (await getDoc(doc(projectsRef, projectId))).data()?.createdAt || now : now,
      updatedAt: now,
      userId
    };

    await setDoc(doc(projectsRef, projectId), newProject);
    return newProject;
  } catch (error: any) {
    console.error('Error saving project:', error);
    throw new Error(`Failed to save project: ${error.message}`);
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const projectsRef = collection(db, 'users', userId, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as Project);
  } catch (error: any) {
    console.error('Error getting user projects:', error);
    throw new Error(`Failed to get user projects: ${error.message}`);
  }
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string, userId: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      return null;
    }
    
    return projectDoc.data() as Project;
  } catch (error: any) {
    console.error('Error getting project:', error);
    throw new Error(`Failed to get project: ${error.message}`);
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}