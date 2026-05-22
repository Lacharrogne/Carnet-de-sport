import { SPORT_CATEGORIES } from '../data/sportOptions'
import type { Workout } from '../types/workout'

export type AdvancedWorkoutStats = {
  totalWorkouts: number
  totalDuration: number
  averageDuration: number
  totalDistanceKm: number
  swimmingDistanceM: number
  totalSets: number
  maxWeight: number
  totalElevation: number
  activeSportsCount: number
  favoriteSportLabel: string
  favoriteSportEmoji: string
}

function getNumber(value: number | undefined) {
  return value ?? 0
}

export function getAdvancedWorkoutStats(
  workouts: Workout[]
): AdvancedWorkoutStats {
  const totalWorkouts = workouts.length

  const totalDuration = workouts.reduce((total, workout) => {
    return total + workout.duration
  }, 0)

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  const totalDistanceKm = workouts.reduce((total, workout) => {
    if (
      workout.category === 'course' ||
      workout.category === 'marche' ||
      workout.category === 'velo'
    ) {
      return total + getNumber(workout.details?.distance)
    }

    return total
  }, 0)

  const swimmingDistanceM = workouts.reduce((total, workout) => {
    if (workout.category === 'natation') {
      return total + getNumber(workout.details?.distance)
    }

    return total
  }, 0)

  const totalSets = workouts.reduce((total, workout) => {
    if (workout.category === 'musculation') {
      return total + getNumber(workout.details?.sets)
    }

    return total
  }, 0)

  const maxWeight = workouts.reduce((max, workout) => {
    if (workout.category !== 'musculation') {
      return max
    }

    return Math.max(max, getNumber(workout.details?.weight))
  }, 0)

  const totalElevation = workouts.reduce((total, workout) => {
    if (workout.category === 'velo') {
      return total + getNumber(workout.details?.elevation)
    }

    return total
  }, 0)

  const categoryStats = SPORT_CATEGORIES.map((category) => {
    const count = workouts.filter((workout) => {
      return workout.category === category.id
    }).length

    return {
      ...category,
      count,
    }
  }).sort((a, b) => b.count - a.count)

  const activeSports = categoryStats.filter((category) => category.count > 0)
  const favoriteSport = activeSports[0]

  return {
    totalWorkouts,
    totalDuration,
    averageDuration,
    totalDistanceKm,
    swimmingDistanceM,
    totalSets,
    maxWeight,
    totalElevation,
    activeSportsCount: activeSports.length,
    favoriteSportLabel: favoriteSport?.label ?? 'Aucun sport',
    favoriteSportEmoji: favoriteSport?.emoji ?? '🌱',
  }
}