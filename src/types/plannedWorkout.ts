import type { SportCategoryId } from './workout'

export type PlannedWorkout = {
  id: string
  title: string
  category: SportCategoryId
  date: string
  duration: number
  objective: string
}