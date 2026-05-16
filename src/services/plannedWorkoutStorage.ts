import type { PlannedWorkout } from '../types/plannedWorkout'

const PLANNED_WORKOUTS_STORAGE_KEY = 'carnet-de-sport-planned-workouts'

export function getStoredPlannedWorkouts() {
  const storedPlannedWorkouts = localStorage.getItem(
    PLANNED_WORKOUTS_STORAGE_KEY
  )

  if (!storedPlannedWorkouts) {
    return null
  }

  try {
    return JSON.parse(storedPlannedWorkouts) as PlannedWorkout[]
  } catch {
    return null
  }
}

export function savePlannedWorkouts(plannedWorkouts: PlannedWorkout[]) {
  localStorage.setItem(
    PLANNED_WORKOUTS_STORAGE_KEY,
    JSON.stringify(plannedWorkouts)
  )
}