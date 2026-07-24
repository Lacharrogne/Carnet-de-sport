import type { Workout } from '../types/workout'
import { getSessionStrengthVolume, parseSportNumber } from './workoutTrendsService'

export type PersonalRecord = {
  id: string
  icon: string
  label: string
  value: string
  detail?: string
  date?: string
}

export type RecordSection = {
  id: string
  title: string
  icon: string
  records: PersonalRecord[]
}

const RUN_CATEGORIES: Workout['category'][] = ['course', 'trail']
const HIKE_CATEGORIES: Workout['category'][] = ['marche', 'randonnee']
const BIKE_CATEGORIES: Workout['category'][] = ['velo', 'vtt']

/**
 * Détecte automatiquement les records personnels à partir de l'historique.
 * Ne renvoie que les sections qui contiennent au moins un record, pour ne
 * jamais afficher de bloc vide.
 */
export function getPersonalRecords(workouts: Workout[]): RecordSection[] {
  if (workouts.length === 0) {
    return []
  }

  const sections: RecordSection[] = []

  const force = getStrengthRecords(workouts)
  if (force.length > 0) {
    sections.push({ id: 'force', title: 'Force', icon: '🏋️', records: force })
  }

  const running = getRunningRecords(workouts)
  if (running.length > 0) {
    sections.push({
      id: 'course',
      title: 'Course & trail',
      icon: '🏃',
      records: running,
    })
  }

  const bike = getBikeRecords(workouts)
  if (bike.length > 0) {
    sections.push({ id: 'velo', title: 'Vélo', icon: '🚴', records: bike })
  }

  const hike = getHikeRecords(workouts)
  if (hike.length > 0) {
    sections.push({
      id: 'marche',
      title: 'Marche & rando',
      icon: '🥾',
      records: hike,
    })
  }

  const swim = getSwimRecords(workouts)
  if (swim.length > 0) {
    sections.push({
      id: 'natation',
      title: 'Natation',
      icon: '🏊',
      records: swim,
    })
  }

  const global = getGlobalRecords(workouts)
  if (global.length > 0) {
    sections.push({
      id: 'global',
      title: 'Général',
      icon: '⭐',
      records: global,
    })
  }

  return sections
}

/** Nombre total de records détectés (pour un compteur). */
export function countPersonalRecords(sections: RecordSection[]) {
  return sections.reduce((total, section) => total + section.records.length, 0)
}

// --- Force ---------------------------------------------------------------

type ExerciseBest = {
  name: string
  maxWeight: number
  maxWeightReps: number
  maxWeightDate: string
  bestOneRepMax: number
}

function getStrengthRecords(workouts: Workout[]): PersonalRecord[] {
  const bestByExercise = new Map<string, ExerciseBest>()

  for (const workout of workouts) {
    if (workout.category !== 'musculation') {
      continue
    }

    const exercises = workout.details?.strengthExercises ?? []

    for (const exercise of exercises) {
      const name = exercise.name?.trim()
      const weight = parseSportNumber(exercise.weight)
      const reps = parseSportNumber(exercise.reps)

      if (!name || weight <= 0) {
        continue
      }

      const key = name.toLowerCase()
      const oneRepMax = estimateOneRepMax(weight, reps)
      const existing = bestByExercise.get(key)

      if (!existing) {
        bestByExercise.set(key, {
          name,
          maxWeight: weight,
          maxWeightReps: reps,
          maxWeightDate: workout.date,
          bestOneRepMax: oneRepMax,
        })
        continue
      }

      if (weight > existing.maxWeight) {
        existing.maxWeight = weight
        existing.maxWeightReps = reps
        existing.maxWeightDate = workout.date
      }

      if (oneRepMax > existing.bestOneRepMax) {
        existing.bestOneRepMax = oneRepMax
      }
    }
  }

  const records = Array.from(bestByExercise.values())
    .sort((a, b) => b.bestOneRepMax - a.bestOneRepMax)
    .slice(0, 6)
    .map<PersonalRecord>((best) => {
      const repsLabel =
        best.maxWeightReps > 0 ? ` · ${best.maxWeightReps} rép.` : ''
      const oneRepLabel =
        best.bestOneRepMax > best.maxWeight
          ? ` · 1RM estimé ~${formatNumber(best.bestOneRepMax, 1)} kg`
          : ''

      return {
        id: `force-${best.name.toLowerCase()}`,
        icon: '🏋️',
        label: capitalize(best.name),
        value: `${formatNumber(best.maxWeight, 1)} kg`,
        detail: `Charge max${repsLabel}${oneRepLabel}`,
        date: best.maxWeightDate,
      }
    })

  // Record de volume sur une seule séance.
  const bestVolumeSession = findBest(workouts, (workout) =>
    workout.category === 'musculation'
      ? getSessionStrengthVolume(workout)
      : 0,
  )

  if (bestVolumeSession && bestVolumeSession.value > 0) {
    records.push({
      id: 'force-volume-session',
      icon: '📦',
      label: 'Plus gros volume (1 séance)',
      value: `${formatNumber(bestVolumeSession.value)} kg`,
      detail: bestVolumeSession.workout.title,
      date: bestVolumeSession.workout.date,
    })
  }

  return records
}

/** Formule d'Epley : 1RM ≈ poids × (1 + reps / 30). */
function estimateOneRepMax(weight: number, reps: number) {
  if (reps <= 1) {
    return weight
  }

  return weight * (1 + reps / 30)
}

// --- Endurance -----------------------------------------------------------

function getRunningRecords(workouts: Workout[]): PersonalRecord[] {
  const runs = workouts.filter((workout) =>
    RUN_CATEGORIES.includes(workout.category),
  )

  if (runs.length === 0) {
    return []
  }

  const records: PersonalRecord[] = []

  const longestDistance = findBest(runs, (w) => w.details?.distance ?? 0)
  if (longestDistance && longestDistance.value > 0) {
    records.push({
      id: 'run-distance',
      icon: '📏',
      label: 'Plus longue distance',
      value: `${formatNumber(longestDistance.value, 2)} km`,
      detail: longestDistance.workout.title,
      date: longestDistance.workout.date,
    })
  }

  // Meilleure allure calculée (min/km) sur les séances avec distance ≥ 1 km.
  const bestPace = findBestPace(runs)
  if (bestPace) {
    records.push({
      id: 'run-pace',
      icon: '⚡',
      label: 'Meilleure allure',
      value: `${formatPace(bestPace.paceSecPerKm)}/km`,
      detail: `${formatNumber(bestPace.workout.details?.distance ?? 0, 2)} km`,
      date: bestPace.workout.date,
    })
  }

  const longestDuration = findBest(runs, (w) => w.duration)
  if (longestDuration && longestDuration.value > 0) {
    records.push({
      id: 'run-duration',
      icon: '⏱️',
      label: 'Plus longue sortie',
      value: formatDuration(longestDuration.value),
      detail: longestDuration.workout.title,
      date: longestDuration.workout.date,
    })
  }

  return records
}

function getBikeRecords(workouts: Workout[]): PersonalRecord[] {
  const rides = workouts.filter((workout) =>
    BIKE_CATEGORIES.includes(workout.category),
  )

  if (rides.length === 0) {
    return []
  }

  const records: PersonalRecord[] = []

  const longestDistance = findBest(rides, (w) => w.details?.distance ?? 0)
  if (longestDistance && longestDistance.value > 0) {
    records.push({
      id: 'bike-distance',
      icon: '📏',
      label: 'Plus longue distance',
      value: `${formatNumber(longestDistance.value, 2)} km`,
      detail: longestDistance.workout.title,
      date: longestDistance.workout.date,
    })
  }

  const mostElevation = findBest(rides, (w) => w.details?.elevation ?? 0)
  if (mostElevation && mostElevation.value > 0) {
    records.push({
      id: 'bike-elevation',
      icon: '⛰️',
      label: 'Plus gros dénivelé',
      value: `${formatNumber(mostElevation.value)} m D+`,
      detail: mostElevation.workout.title,
      date: mostElevation.workout.date,
    })
  }

  const longestDuration = findBest(rides, (w) => w.duration)
  if (longestDuration && longestDuration.value > 0) {
    records.push({
      id: 'bike-duration',
      icon: '⏱️',
      label: 'Plus longue sortie',
      value: formatDuration(longestDuration.value),
      detail: longestDuration.workout.title,
      date: longestDuration.workout.date,
    })
  }

  return records
}

function getHikeRecords(workouts: Workout[]): PersonalRecord[] {
  const hikes = workouts.filter((workout) =>
    HIKE_CATEGORIES.includes(workout.category),
  )

  if (hikes.length === 0) {
    return []
  }

  const records: PersonalRecord[] = []

  const longestDistance = findBest(hikes, (w) => w.details?.distance ?? 0)
  if (longestDistance && longestDistance.value > 0) {
    records.push({
      id: 'hike-distance',
      icon: '📏',
      label: 'Plus longue distance',
      value: `${formatNumber(longestDistance.value, 2)} km`,
      detail: longestDistance.workout.title,
      date: longestDistance.workout.date,
    })
  }

  const mostElevation = findBest(hikes, (w) => w.details?.elevation ?? 0)
  if (mostElevation && mostElevation.value > 0) {
    records.push({
      id: 'hike-elevation',
      icon: '⛰️',
      label: 'Plus gros dénivelé',
      value: `${formatNumber(mostElevation.value)} m D+`,
      detail: mostElevation.workout.title,
      date: mostElevation.workout.date,
    })
  }

  return records
}

function getSwimRecords(workouts: Workout[]): PersonalRecord[] {
  const swims = workouts.filter((workout) => workout.category === 'natation')

  if (swims.length === 0) {
    return []
  }

  const records: PersonalRecord[] = []

  const longestDistance = findBest(swims, (w) => w.details?.distance ?? 0)
  if (longestDistance && longestDistance.value > 0) {
    records.push({
      id: 'swim-distance',
      icon: '📏',
      label: 'Plus longue distance',
      value: `${formatNumber(longestDistance.value)} m`,
      detail: longestDistance.workout.title,
      date: longestDistance.workout.date,
    })
  }

  const longestDuration = findBest(swims, (w) => w.duration)
  if (longestDuration && longestDuration.value > 0) {
    records.push({
      id: 'swim-duration',
      icon: '⏱️',
      label: 'Plus longue séance',
      value: formatDuration(longestDuration.value),
      detail: longestDuration.workout.title,
      date: longestDuration.workout.date,
    })
  }

  return records
}

// --- Général -------------------------------------------------------------

function getGlobalRecords(workouts: Workout[]): PersonalRecord[] {
  const records: PersonalRecord[] = []

  const longestSession = findBest(workouts, (w) => w.duration)
  if (longestSession && longestSession.value > 0) {
    records.push({
      id: 'global-longest',
      icon: '⏱️',
      label: 'Séance la plus longue',
      value: formatDuration(longestSession.value),
      detail: longestSession.workout.title,
      date: longestSession.workout.date,
    })
  }

  const bestWeek = getBestWeek(workouts)
  if (bestWeek && bestWeek.minutes > 0) {
    records.push({
      id: 'global-best-week',
      icon: '🗓️',
      label: 'Meilleure semaine',
      value: formatDuration(bestWeek.minutes),
      detail: `${bestWeek.sessions} séance${
        bestWeek.sessions > 1 ? 's' : ''
      } · semaine du ${bestWeek.label}`,
    })
  }

  const longestStreak = getLongestStreak(workouts)
  if (longestStreak >= 2) {
    records.push({
      id: 'global-streak',
      icon: '🔥',
      label: 'Plus longue série',
      value: `${longestStreak} jours`,
      detail: 'Jours consécutifs avec au moins une séance',
    })
  }

  return records
}

function getBestWeek(workouts: Workout[]) {
  const byWeek = new Map<string, { minutes: number; sessions: number }>()

  for (const workout of workouts) {
    const monday = getMondayKey(workout.date)
    const bucket = byWeek.get(monday) ?? { minutes: 0, sessions: 0 }

    bucket.minutes += workout.duration
    bucket.sessions += 1
    byWeek.set(monday, bucket)
  }

  let best: { label: string; minutes: number; sessions: number } | null = null

  for (const [mondayKey, bucket] of byWeek.entries()) {
    if (!best || bucket.minutes > best.minutes) {
      best = {
        label: formatDayMonth(mondayKey),
        minutes: bucket.minutes,
        sessions: bucket.sessions,
      }
    }
  }

  return best
}

function getLongestStreak(workouts: Workout[]) {
  const days = Array.from(new Set(workouts.map((workout) => workout.date))).sort()

  if (days.length === 0) {
    return 0
  }

  let longest = 1
  let current = 1

  for (let index = 1; index < days.length; index += 1) {
    const previous = new Date(`${days[index - 1]}T00:00:00`)
    const day = new Date(`${days[index]}T00:00:00`)
    const diffDays = Math.round(
      (day.getTime() - previous.getTime()) / 86_400_000,
    )

    if (diffDays === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

// --- Helpers -------------------------------------------------------------

function findBest(
  workouts: Workout[],
  getValue: (workout: Workout) => number,
) {
  let best: { workout: Workout; value: number } | null = null

  for (const workout of workouts) {
    const value = getValue(workout)

    if (value > 0 && (!best || value > best.value)) {
      best = { workout, value }
    }
  }

  return best
}

function findBestPace(workouts: Workout[]) {
  let best: { workout: Workout; paceSecPerKm: number } | null = null

  for (const workout of workouts) {
    const distance = workout.details?.distance ?? 0

    // Sous 1 km, l'allure calculée est trop bruitée pour être un record.
    if (distance < 1 || workout.duration <= 0) {
      continue
    }

    const paceSecPerKm = (workout.duration * 60) / distance

    if (!best || paceSecPerKm < best.paceSecPerKm) {
      best = { workout, paceSecPerKm }
    }
  }

  return best
}

function getMondayKey(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  const day = parsed.getDay()
  const diff = day === 0 ? -6 : 1 - day

  parsed.setDate(parsed.getDate() + diff)

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(parsed.getDate()).padStart(2, '0')

  return `${year}-${month}-${dayOfMonth}`
}

function formatDayMonth(dateKey: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateKey}T00:00:00`))
}

function formatPace(secondsPerKm: number) {
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.round(secondsPerKm % 60)

  if (seconds === 60) {
    return `${minutes + 1}'00"`
  }

  return `${minutes}'${String(seconds).padStart(2, '0')}"`
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits,
  }).format(value)
}

function capitalize(value: string) {
  if (!value) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}
