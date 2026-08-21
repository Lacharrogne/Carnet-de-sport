import { estimateWorkoutCalories } from './caloriesService'
import { getSessionStrengthVolume } from './workoutTrendsService'
import type { Workout } from '../types/workout'

export type PeriodStats = {
  sessions: number
  minutes: number
  calories: number
  volume: number
  distanceKm: number
}

export type PeriodComparison = {
  /** Libellé de la période ('semaine' | 'mois'). */
  label: string
  current: PeriodStats
  previous: PeriodStats
}

const RUN_LIKE: Workout['category'][] = [
  'course',
  'trail',
  'marche',
  'randonnee',
  'velo',
  'vtt',
]

function emptyStats(): PeriodStats {
  return { sessions: 0, minutes: 0, calories: 0, volume: 0, distanceKm: 0 }
}

function statsForRange(
  workouts: Workout[],
  start: Date,
  end: Date,
  weightKg: number,
): PeriodStats {
  const stats = emptyStats()

  for (const workout of workouts) {
    const date = new Date(`${workout.date}T00:00:00`)
    if (date < start || date >= end) {
      continue
    }

    stats.sessions += 1
    stats.minutes += workout.duration
    stats.calories += estimateWorkoutCalories(workout, weightKg)
    stats.volume += getSessionStrengthVolume(workout)

    if (RUN_LIKE.includes(workout.category)) {
      stats.distanceKm += workout.details?.distance ?? 0
    }
  }

  return stats
}

function startOfWeek(date: Date): Date {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return monday
}

/**
 * Compare la période courante à la précédente (semaine et mois), sur les
 * séances, le temps, les calories, le volume muscu et la distance.
 */
export function getPeriodComparisons(
  workouts: Workout[],
  weightKg: number,
): { week: PeriodComparison; month: PeriodComparison } {
  const now = new Date()

  // Semaines (lundi → lundi).
  const thisMonday = startOfWeek(now)
  const nextMonday = new Date(thisMonday)
  nextMonday.setDate(thisMonday.getDate() + 7)
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)

  // Mois (1er → 1er).
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  return {
    week: {
      label: 'semaine',
      current: statsForRange(workouts, thisMonday, nextMonday, weightKg),
      previous: statsForRange(workouts, lastMonday, thisMonday, weightKg),
    },
    month: {
      label: 'mois',
      current: statsForRange(workouts, thisMonthStart, nextMonthStart, weightKg),
      previous: statsForRange(workouts, lastMonthStart, thisMonthStart, weightKg),
    },
  }
}

/** Variation en % entre deux valeurs (0 si pas de base). */
export function deltaPercent(current: number, previous: number): number {
  if (previous > 0) {
    return Math.round(((current - previous) / previous) * 100)
  }
  return current > 0 ? 100 : 0
}
