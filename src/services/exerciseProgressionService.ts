import type { Workout } from '../types/workout'
import { parseSportNumber } from './workoutTrendsService'

export type ExercisePoint = {
  date: string
  shortLabel: string
  longLabel: string
  maxWeight: number
  estimatedOneRepMax: number
  volume: number
}

export type TrackedExercise = {
  name: string
  sessions: number
}

/**
 * Liste des exercices de musculation déjà enregistrés (avec au moins une charge),
 * triés par fréquence décroissante. Sert à alimenter le sélecteur de progression.
 */
export function getTrackedExercises(workouts: Workout[]): TrackedExercise[] {
  const countByName = new Map<string, { name: string; sessions: number }>()

  for (const workout of workouts) {
    if (workout.category !== 'musculation') {
      continue
    }

    const seenInSession = new Set<string>()

    for (const exercise of workout.details?.strengthExercises ?? []) {
      const name = exercise.name?.trim()
      const weight = parseSportNumber(exercise.weight)

      if (!name || weight <= 0) {
        continue
      }

      const key = name.toLowerCase()

      if (seenInSession.has(key)) {
        continue
      }
      seenInSession.add(key)

      const existing = countByName.get(key)

      if (existing) {
        existing.sessions += 1
      } else {
        countByName.set(key, { name, sessions: 1 })
      }
    }
  }

  return Array.from(countByName.values()).sort((a, b) => {
    if (b.sessions !== a.sessions) {
      return b.sessions - a.sessions
    }

    return a.name.localeCompare(b.name)
  })
}

/**
 * Points de progression pour un exercice donné : par séance (date), la charge
 * max et le 1RM estimé (Epley). Triés du plus ancien au plus récent.
 */
export function getExerciseProgression(
  workouts: Workout[],
  exerciseName: string,
): ExercisePoint[] {
  const target = exerciseName.trim().toLowerCase()

  if (!target) {
    return []
  }

  const points: ExercisePoint[] = []

  for (const workout of workouts) {
    if (workout.category !== 'musculation') {
      continue
    }

    let maxWeight = 0
    let bestOneRepMax = 0
    let volume = 0
    let matched = false

    for (const exercise of workout.details?.strengthExercises ?? []) {
      if (exercise.name?.trim().toLowerCase() !== target) {
        continue
      }

      const weight = parseSportNumber(exercise.weight)
      const reps = parseSportNumber(exercise.reps)
      const sets = parseSportNumber(exercise.sets)

      if (weight <= 0) {
        continue
      }

      matched = true
      maxWeight = Math.max(maxWeight, weight)
      bestOneRepMax = Math.max(bestOneRepMax, estimateOneRepMax(weight, reps))

      if (sets > 0 && reps > 0) {
        volume += sets * reps * weight
      }
    }

    if (matched) {
      points.push({
        date: workout.date,
        shortLabel: formatShort(workout.date),
        longLabel: formatLong(workout.date),
        maxWeight,
        estimatedOneRepMax: Math.round(bestOneRepMax * 10) / 10,
        volume,
      })
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date))
}

function estimateOneRepMax(weight: number, reps: number) {
  if (reps <= 1) {
    return weight
  }

  return weight * (1 + reps / 30)
}

function formatShort(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${date}T00:00:00`))
}

function formatLong(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}
