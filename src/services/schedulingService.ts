import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'

/**
 * Interface for availability date
 */
export interface AvailabilityDate {
  date: string
  hours: number[]
}

/**
 * Interface for team member availability
 */
export interface MemberAvailability {
  userId: string
  userName: string
  dates: AvailabilityDate[]
}

/**
 * Interface for optimal shooting time
 */
export interface OptimalShootingTime {
  date: string
  bestHours: number[]
  availabilityCount: number
  totalMembers: number
}

/**
 * Interface for a scene in the shooting schedule
 */
export interface ScheduledScene {
  sceneId: string
  episodeNumber: number
  sceneNumber: number
  location: string
  description: string
  scheduledDate?: string
  scheduledHour?: number
  status: 'pending' | 'scheduled' | 'completed'
  estimatedDuration: number // in hours
  assignedCrew?: string[]
}

/**
 * Interface for a shooting schedule
 */
export interface ShootingSchedule {
  projectId: string
  locations: {
    name: string
    scenes: ScheduledScene[]
    scheduledDate?: string
  }[]
  startDate?: string
  endDate?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

/**
 * Set or update a user's availability
 */
export const setUserAvailability = async (
  userId: string,
  projectId: string,
  availability: AvailabilityDate[]
): Promise<void> => {
  try {
    const availabilityRef = doc(db, 'projects', projectId, 'availability', userId)
    const availabilityDoc = await getDoc(availabilityRef)
    
    if (availabilityDoc.exists()) {
      // Update existing document
      await updateDoc(availabilityRef, {
        dates: availability,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new document
      await setDoc(availabilityRef, {
        userId,
        dates: availability,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error: any) {
    console.error('Error setting user availability:', error)
    throw new Error(`Failed to set availability: ${error.message}`)
  }
}

/**
 * Get a user's availability for a project
 */
export const getUserAvailability = async (
  userId: string,
  projectId: string
): Promise<AvailabilityDate[]> => {
  try {
    const availabilityRef = doc(db, 'projects', projectId, 'availability', userId)
    const availabilityDoc = await getDoc(availabilityRef)
    
    if (availabilityDoc.exists()) {
      const availabilityData = availabilityDoc.data()
      return availabilityData.dates || []
    }
    
    return []
  } catch (error: any) {
    console.error('Error getting user availability:', error)
    throw new Error(`Failed to get availability: ${error.message}`)
  }
}

/**
 * Get all team member availability for a project
 */
export const getTeamAvailability = async (
  projectId: string
): Promise<MemberAvailability[]> => {
  try {
    const projectRef = doc(db, 'projects', projectId)
    const projectDoc = await getDoc(projectRef)
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found')
    }
    
    const projectData = projectDoc.data()
    const teamMembers = [projectData.ownerId, ...(projectData.collaborators || [])]
    
    // Get availability for each team member
    const teamAvailability: MemberAvailability[] = []
    
    for (const userId of teamMembers) {
      // Get user info
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        // Get user availability
        const availabilityRef = doc(db, 'projects', projectId, 'availability', userId)
        const availabilityDoc = await getDoc(availabilityRef)
        
        if (availabilityDoc.exists()) {
          const availabilityData = availabilityDoc.data()
          
          teamAvailability.push({
            userId,
            userName: userData.displayName || userData.email,
            dates: availabilityData.dates || []
          })
        } else {
          // User has no availability data
          teamAvailability.push({
            userId,
            userName: userData.displayName || userData.email,
            dates: []
          })
        }
      }
    }
    
    return teamAvailability
  } catch (error: any) {
    console.error('Error getting team availability:', error)
    throw new Error(`Failed to get team availability: ${error.message}`)
  }
}

/**
 * Calculate optimal shooting times based on team availability
 */
export const calculateOptimalShootingTimes = async (
  projectId: string
): Promise<OptimalShootingTime[]> => {
  try {
    // Get all team member availability
    const teamAvailability = await getTeamAvailability(projectId)
    
    if (teamAvailability.length === 0) {
      return []
    }
    
    // Map to store date availability counts
    const dateAvailability: {
      [date: string]: { [hour: number]: number }
    } = {}
    
    // Count availability for each date and hour
    teamAvailability.forEach(member => {
      member.dates.forEach(dateEntry => {
        const { date, hours } = dateEntry
        
        if (!dateAvailability[date]) {
          dateAvailability[date] = {}
        }
        
        hours.forEach(hour => {
          if (!dateAvailability[date][hour]) {
            dateAvailability[date][hour] = 0
          }
          
          dateAvailability[date][hour]++
        })
      })
    })
    
    // Convert to OptimalShootingTime array
    const optimalTimes: OptimalShootingTime[] = Object.entries(dateAvailability).map(
      ([date, hours]) => {
        // Sort hours by count (descending)
        const sortedHours = Object.entries(hours)
          .sort(([_, countA], [__, countB]) => countB - countA)
          .map(([hour]) => parseInt(hour))
        
        // Get maximum availability count
        const maxCount = Math.max(...Object.values(hours))
        
        return {
          date,
          bestHours: sortedHours.slice(0, 5), // Top 5 hours
          availabilityCount: maxCount,
          totalMembers: teamAvailability.length
        }
      }
    )
    
    // Sort dates by highest availability percentage
    return optimalTimes.sort(
      (a, b) =>
        b.availabilityCount / b.totalMembers - a.availabilityCount / a.totalMembers
    )
  } catch (error: any) {
    console.error('Error calculating optimal shooting times:', error)
    throw new Error(`Failed to calculate optimal shooting times: ${error.message}`)
  }
}

/**
 * Create a shooting schedule for a project
 */
export const createShootingSchedule = async (
  projectId: string,
  userId: string
): Promise<ShootingSchedule> => {
  try {
    // Get all scenes from the project
    const projectRef = doc(db, 'projects', projectId)
    const projectDoc = await getDoc(projectRef)
    
    if (!projectDoc.exists()) {
      throw new Error('Project not found')
    }
    
    const projectData = projectDoc.data()
    
    // Check if user has permission
    if (projectData.ownerId !== userId && !projectData.collaborators?.includes(userId)) {
      throw new Error('You do not have permission to create a shooting schedule for this project')
    }
    
    // Extract scenes from project content
    let scenes: ScheduledScene[] = []
    const content = projectData.content || {}
    const episodes = content.narrative?.episodes || content.generatedContent?.narrative?.episodes || []
    
    episodes.forEach((episode: any) => {
      if (episode?.scenes) {
        episode.scenes.forEach((scene: any) => {
          scenes.push({
            sceneId: `${episode.number}-${scene.number}`,
            episodeNumber: episode.number,
            sceneNumber: scene.number,
            location: scene.location || 'Unknown',
            description: scene.description || '',
            status: 'pending',
            estimatedDuration: 2 // Default 2 hours per scene
          })
        })
      }
    })
    
    // Group scenes by location
    const locationGroups: { [key: string]: ScheduledScene[] } = {}
    
    scenes.forEach(scene => {
      if (!locationGroups[scene.location]) {
        locationGroups[scene.location] = []
      }
      
      locationGroups[scene.location].push(scene)
    })
    
    // Sort scenes within each location by episode and scene number
    Object.values(locationGroups).forEach(scenes => {
      scenes.sort((a, b) => {
        if (a.episodeNumber !== b.episodeNumber) {
          return a.episodeNumber - b.episodeNumber
        }
        return a.sceneNumber - b.sceneNumber
      })
    })
    
    // Create the shooting schedule
    const schedule: ShootingSchedule = {
      projectId,
      locations: Object.entries(locationGroups).map(([name, scenes]) => ({
        name,
        scenes
      })),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId
    }
    
    // Save the schedule to Firestore
    const scheduleRef = doc(db, 'projects', projectId, 'schedule', 'shooting')
    await setDoc(scheduleRef, schedule)
    
    return schedule
  } catch (error: any) {
    console.error('Error creating shooting schedule:', error)
    throw new Error(`Failed to create shooting schedule: ${error.message}`)
  }
}

/**
 * Get the shooting schedule for a project
 */
export const getShootingSchedule = async (
  projectId: string
): Promise<ShootingSchedule | null> => {
  try {
    const scheduleRef = doc(db, 'projects', projectId, 'schedule', 'shooting')
    const scheduleDoc = await getDoc(scheduleRef)
    
    if (scheduleDoc.exists()) {
      return scheduleDoc.data() as ShootingSchedule
    }
    
    return null
  } catch (error: any) {
    console.error('Error getting shooting schedule:', error)
    throw new Error(`Failed to get shooting schedule: ${error.message}`)
  }
}

/**
 * Update a scene in the shooting schedule
 */
export const updateScheduledScene = async (
  projectId: string,
  sceneId: string,
  updates: Partial<ScheduledScene>
): Promise<void> => {
  try {
    const scheduleRef = doc(db, 'projects', projectId, 'schedule', 'shooting')
    const scheduleDoc = await getDoc(scheduleRef)
    
    if (!scheduleDoc.exists()) {
      throw new Error('Shooting schedule not found')
    }
    
    const schedule = scheduleDoc.data() as ShootingSchedule
    
    // Find and update the scene
    let sceneFound = false
    
    schedule.locations.forEach(location => {
      const sceneIndex = location.scenes.findIndex(scene => scene.sceneId === sceneId)
      
      if (sceneIndex !== -1) {
        location.scenes[sceneIndex] = {
          ...location.scenes[sceneIndex],
          ...updates
        }
        sceneFound = true
      }
    })
    
    if (!sceneFound) {
      throw new Error('Scene not found in shooting schedule')
    }
    
    // Update the schedule in Firestore
    await updateDoc(scheduleRef, {
      locations: schedule.locations,
      updatedAt: Timestamp.now()
    })
  } catch (error: any) {
    console.error('Error updating scheduled scene:', error)
    throw new Error(`Failed to update scheduled scene: ${error.message}`)
  }
}

/**
 * Automatically schedule scenes based on optimal shooting times
 */
export const autoScheduleScenes = async (
  projectId: string
): Promise<ShootingSchedule> => {
  try {
    // Get the shooting schedule
    const scheduleRef = doc(db, 'projects', projectId, 'schedule', 'shooting')
    const scheduleDoc = await getDoc(scheduleRef)
    
    if (!scheduleDoc.exists()) {
      throw new Error('Shooting schedule not found')
    }
    
    const schedule = scheduleDoc.data() as ShootingSchedule
    
    // Get optimal shooting times
    const optimalTimes = await calculateOptimalShootingTimes(projectId)
    
    if (optimalTimes.length === 0) {
      throw new Error('No availability data to schedule scenes')
    }
    
    // Sort locations by number of scenes (descending)
    const sortedLocations = [...schedule.locations].sort(
      (a, b) => b.scenes.length - a.scenes.length
    )
    
    // Start date for scheduling
    let currentDateIndex = 0
    let currentHourIndex = 0
    
    // Schedule scenes at each location
    sortedLocations.forEach(location => {
      // Assign date to location
      if (currentDateIndex < optimalTimes.length) {
        location.scheduledDate = optimalTimes[currentDateIndex].date
        
        // Schedule each scene
        location.scenes.forEach(scene => {
          if (currentHourIndex < optimalTimes[currentDateIndex].bestHours.length) {
            // Schedule at optimal hour
            scene.scheduledDate = optimalTimes[currentDateIndex].date
            scene.scheduledHour = optimalTimes[currentDateIndex].bestHours[currentHourIndex]
            scene.status = 'scheduled'
            
            // Move to next hour
            currentHourIndex++
          } else {
            // Move to next date
            currentDateIndex++
            currentHourIndex = 0
            
            // If we have more optimal dates
            if (currentDateIndex < optimalTimes.length) {
              location.scheduledDate = optimalTimes[currentDateIndex].date
              scene.scheduledDate = optimalTimes[currentDateIndex].date
              scene.scheduledHour = optimalTimes[currentDateIndex].bestHours[currentHourIndex]
              scene.status = 'scheduled'
              
              // Move to next hour
              currentHourIndex++
            }
          }
        })
      }
      
      // Move to next date for next location
      currentDateIndex++
      currentHourIndex = 0
    })
    
    // Update the schedule with start/end dates
    let allDates: string[] = []
    sortedLocations.forEach(location => {
      location.scenes.forEach(scene => {
        if (scene.scheduledDate) {
          allDates.push(scene.scheduledDate)
        }
      })
    })
    
    if (allDates.length > 0) {
      allDates.sort()
      schedule.startDate = allDates[0]
      schedule.endDate = allDates[allDates.length - 1]
    }
    
    // Update the schedule in Firestore
    await updateDoc(scheduleRef, {
      locations: sortedLocations,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      updatedAt: Timestamp.now()
    })
    
    // Return the updated schedule
    return {
      ...schedule,
      locations: sortedLocations
    }
  } catch (error: any) {
    console.error('Error auto-scheduling scenes:', error)
    throw new Error(`Failed to auto-schedule scenes: ${error.message}`)
  }
} 