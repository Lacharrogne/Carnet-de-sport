import type { WeeklyGoal } from '../types/weeklyGoal'

const WEEKLY_GOAL_STORAGE_KEY = 'carnet-de-sport-weekly-goal'

export const DEFAULT_WEEKLY_GOAL: WeeklyGoal = {
  targetMinutes: 180,
}

export function getStoredWeeklyGoal() {
  const storedWeeklyGoal = localStorage.getItem(WEEKLY_GOAL_STORAGE_KEY)

  if (!storedWeeklyGoal) {
    return null
  }

  try {
    return JSON.parse(storedWeeklyGoal) as WeeklyGoal
  } catch {
    return null
  }
}

export function saveWeeklyGoal(weeklyGoal: WeeklyGoal) {
  localStorage.setItem(WEEKLY_GOAL_STORAGE_KEY, JSON.stringify(weeklyGoal))
}