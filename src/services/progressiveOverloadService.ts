import { parseSportNumber } from './workoutTrendsService'
import type { Workout } from '../types/workout'

/**
 * Surcharge progressive & 1RM estimé.
 *
 * À partir de l'historique, on retrouve la dernière performance sur un exercice
 * de musculation (séries × répétitions @ charge) pour la rappeler au moment de
 * saisir une nouvelle séance, avec un objectif de progression et une estimation
 * de la charge maximale (formule d'Epley).
 */

export type LastPerformance = {
  date: string
  sets: number
  reps: number
  weight: number
  oneRepMax: number | null
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 1RM estimé (Epley) : charge × (1 + reps/30). `null` si non calculable. */
export function estimateOneRepMax(weight: number, reps: number): number | null {
  if (!weight || weight <= 0 || !reps || reps <= 0) return null
  if (reps === 1) return Math.round(weight)
  return Math.round(weight * (1 + reps / 30))
}

/** Dernière perf enregistrée pour un exercice donné (par nom). */
export function getLastPerformance(
  workouts: Workout[],
  exerciseName: string,
): LastPerformance | null {
  const target = normalize(exerciseName)
  if (target.length < 2) return null

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))

  for (const workout of sorted) {
    const list = workout.details?.strengthExercises
    if (!list || list.length === 0) continue

    const match = list.find(
      (exercise) => exercise.name && normalize(exercise.name) === target,
    )
    if (!match) continue

    const sets = parseSportNumber(match.sets)
    const reps = parseSportNumber(match.reps)
    const weight = parseSportNumber(match.weight)

    // On ne rappelle une perf que si elle porte au moins des reps ou une charge.
    if (!reps && !weight) continue

    return {
      date: workout.date,
      sets,
      reps,
      weight,
      oneRepMax: estimateOneRepMax(weight, reps),
    }
  }

  return null
}

/** Petit objectif de progression, jamais culpabilisant. */
export function getOverloadSuggestion(last: LastPerformance): string {
  if (last.weight > 0) {
    const step = last.weight >= 40 ? 2.5 : 1
    return `Vise +${String(step).replace('.', ',')} kg ou +1 rép 💪`
  }
  if (last.reps > 0) {
    return 'Vise +1 à +2 répétitions 💪'
  }
  return 'Bats ta dernière perf 💪'
}

/** Résumé texte de la dernière perf (« 4 × 10 @ 80 kg »). */
export function formatLastPerformance(last: LastPerformance): string {
  const parts: string[] = []
  if (last.sets > 0 && last.reps > 0) parts.push(`${last.sets} × ${last.reps}`)
  else if (last.reps > 0) parts.push(`${last.reps} rép`)
  if (last.weight > 0) parts.push(`@ ${String(last.weight).replace('.', ',')} kg`)
  return parts.join(' ')
}
