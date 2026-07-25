import { EXERCISE_GROUPS } from '../data/exerciseLibrary'
import { parseSportNumber } from './workoutTrendsService'
import type { Workout } from '../types/workout'

export type MuscleZoneStat = {
  zone: string
  sets: number
  volume: number
  /** Nombre de séances où la zone a été travaillée. */
  sessions: number
}

export type MuscleBalance = {
  zones: MuscleZoneStat[]
  totalVolume: number
  /** Zones de la bibliothèque jamais travaillées (négligées). */
  neglected: string[]
}

// Index nom d'exercice (minuscule) → zone musculaire.
const ZONE_BY_EXERCISE = new Map<string, string>()
for (const group of EXERCISE_GROUPS) {
  for (const exercise of group.exercises) {
    ZONE_BY_EXERCISE.set(exercise.toLowerCase(), group.zone)
  }
}

const ALL_ZONES = EXERCISE_GROUPS.map((group) => group.zone)

/** Zone musculaire d'un exercice (correspondance exacte puis approchée). */
function zoneForName(name: string): string | null {
  const cleaned = name.trim().toLowerCase()

  if (!cleaned) {
    return null
  }

  const exact = ZONE_BY_EXERCISE.get(cleaned)
  if (exact) {
    return exact
  }

  // Approché : un nom de la bibliothèque contenu dans le nom saisi (ou l'inverse).
  for (const [exercise, zone] of ZONE_BY_EXERCISE) {
    if (cleaned.includes(exercise) || exercise.includes(cleaned)) {
      return zone
    }
  }

  return null
}

/**
 * Répartition du travail de musculation par zone musculaire, à partir des noms
 * d'exercices enregistrés (rapprochés de la bibliothèque). Sert à repérer les
 * déséquilibres et les zones négligées.
 */
export function getMuscleBalance(workouts: Workout[]): MuscleBalance {
  const byZone = new Map<string, MuscleZoneStat>()

  for (const workout of workouts) {
    if (workout.category !== 'musculation') {
      continue
    }

    const seenZones = new Set<string>()

    for (const exercise of workout.details?.strengthExercises ?? []) {
      const zone = zoneForName(exercise.name ?? '')
      if (!zone) {
        continue
      }

      const sets = parseSportNumber(exercise.sets)
      const reps = parseSportNumber(exercise.reps)
      const weight = parseSportNumber(exercise.weight)

      const stat = byZone.get(zone) ?? {
        zone,
        sets: 0,
        volume: 0,
        sessions: 0,
      }

      stat.sets += sets
      stat.volume += sets * reps * weight

      if (!seenZones.has(zone)) {
        stat.sessions += 1
        seenZones.add(zone)
      }

      byZone.set(zone, stat)
    }
  }

  const zones = Array.from(byZone.values()).sort((a, b) => b.sets - a.sets)
  const totalVolume = zones.reduce((total, zone) => total + zone.volume, 0)
  const neglected = ALL_ZONES.filter((zone) => !byZone.has(zone))

  return { zones, totalVolume, neglected }
}
