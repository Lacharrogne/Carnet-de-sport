import type { SportCategoryId, Workout } from './workout'

export type PlannedWorkout = {
  id: string
  title: string
  category: SportCategoryId
  date: string
  duration: number
  objective?: string
  notes?: string
  improvementIdea?: string
  details?: Workout['details']
}