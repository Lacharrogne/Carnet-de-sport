import type { Workout } from '../types/workout'

const WORKOUTS_STORAGE_KEY = 'carnet-de-sport-workouts'

export function getStoredWorkouts() {
  const storedWorkouts = localStorage.getItem(WORKOUTS_STORAGE_KEY)

  if (!storedWorkouts) {
    return null
  }

  try {
    return JSON.parse(storedWorkouts) as Workout[]
  } catch {
    return null
  }
}

export function saveWorkouts(workouts: Workout[]) {
  localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts))
}