import type { StrengthExercise, Workout } from '../types/workout'

/** Un « bucket » = une semaine calendaire (démarrant le lundi). */
export type WeeklyBucket = {
  /** Clé ISO du lundi de la semaine (yyyy-mm-dd). */
  weekStart: string
  /** Étiquette courte pour l'axe (ex. « 12/05 »). */
  shortLabel: string
  /** Étiquette longue pour les infobulles (ex. « Semaine du 12 mai »). */
  longLabel: string
  minutes: number
  sessions: number
  distanceKm: number
  swimMeters: number
  strengthVolume: number
  /** Vrai pour la semaine en cours. */
  isCurrent: boolean
}

const RUN_LIKE: Workout['category'][] = [
  'course',
  'trail',
  'marche',
  'randonnee',
  'velo',
  'vtt',
]

/**
 * Regroupe les séances par semaine (lundi → dimanche) sur les `weeks`
 * dernières semaines, semaine en cours incluse. Renvoie toujours `weeks`
 * buckets, même vides, pour un axe temporel régulier.
 */
export function getWeeklyTrends(
  workouts: Workout[],
  weeks = 12,
): WeeklyBucket[] {
  const currentMonday = getMonday(new Date())

  const buckets: WeeklyBucket[] = []
  const indexByKey = new Map<string, number>()

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const monday = new Date(currentMonday)
    monday.setDate(currentMonday.getDate() - offset * 7)

    const key = getDateKey(monday)

    indexByKey.set(key, buckets.length)
    buckets.push({
      weekStart: key,
      shortLabel: formatShort(monday),
      longLabel: `Semaine du ${formatLong(monday)}`,
      minutes: 0,
      sessions: 0,
      distanceKm: 0,
      swimMeters: 0,
      strengthVolume: 0,
      isCurrent: offset === 0,
    })
  }

  for (const workout of workouts) {
    const workoutMonday = getMonday(parseDate(workout.date))
    const key = getDateKey(workoutMonday)
    const index = indexByKey.get(key)

    if (index === undefined) {
      continue
    }

    const bucket = buckets[index]
    bucket.minutes += workout.duration
    bucket.sessions += 1

    const distance = workout.details?.distance ?? 0

    if (workout.category === 'natation') {
      bucket.swimMeters += distance
    } else if (RUN_LIKE.includes(workout.category)) {
      bucket.distanceKm += distance
    }

    bucket.strengthVolume += getSessionStrengthVolume(workout)
  }

  return buckets
}

/** Compare la semaine en cours à la précédente (variation en %). */
export function getWeekOverWeek(buckets: WeeklyBucket[]) {
  if (buckets.length < 2) {
    return { current: 0, previous: 0, deltaPercent: 0 }
  }

  const current = buckets[buckets.length - 1].minutes
  const previous = buckets[buckets.length - 2].minutes

  const deltaPercent =
    previous > 0
      ? Math.round(((current - previous) / previous) * 100)
      : current > 0
        ? 100
        : 0

  return { current, previous, deltaPercent }
}

export function getSessionStrengthVolume(workout: Workout) {
  const exercises = workout.details?.strengthExercises ?? []

  return exercises.reduce((total, exercise) => {
    return total + getExerciseVolume(exercise)
  }, 0)
}

function getExerciseVolume(exercise: StrengthExercise) {
  const sets = parseSportNumber(exercise.sets)
  const reps = parseSportNumber(exercise.reps)
  const weight = parseSportNumber(exercise.weight)

  if (!sets || !reps || !weight) {
    return 0
  }

  return sets * reps * weight
}

export function parseSportNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  const normalizedValue = String(value).trim().replace(',', '.')
  const match = normalizedValue.match(/\d+(\.\d+)?/)

  if (!match) {
    return 0
  }

  return Number(match[0])
}

/** Lundi 00:00 de la semaine contenant `date`. */
function getMonday(date: Date) {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)

  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day

  monday.setDate(monday.getDate() + diff)

  return monday
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatShort(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function formatLong(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}
