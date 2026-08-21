import type {
  SportCategoryId,
  Workout,
  WorkoutIntensity,
} from '../types/workout'
import type { FitnessGoal, HealthProfile } from '../types/health'

/**
 * Valeurs MET (Metabolic Equivalent of Task) indicatives par sport. La dépense
 * énergétique se calcule ensuite : kcal ≈ MET × poids(kg) × durée(h).
 * Valeurs volontairement prudentes, alignées sur le Compendium of Physical
 * Activities. Restent une estimation, pas une mesure.
 */
const MET_BY_CATEGORY: Record<SportCategoryId, number> = {
  musculation: 5,
  course: 9.8,
  trail: 10,
  marche: 3.8,
  randonnee: 6,
  velo: 7.5,
  vtt: 8.5,
  natation: 8,
  hiit: 8,
  yoga: 3,
  escalade: 7.5,
  autre: 5,
}

/** Ajuste la dépense selon l'intensité ressentie de la séance. */
const INTENSITY_FACTOR: Record<WorkoutIntensity, number> = {
  Facile: 0.85,
  Moyenne: 1,
  Difficile: 1.2,
}

/** Estimation des calories brûlées sur une séance (kcal). */
export function estimateWorkoutCalories(
  workout: Workout,
  weightKg: number,
): number {
  if (weightKg <= 0 || workout.duration <= 0) {
    return 0
  }

  const met = MET_BY_CATEGORY[workout.category] ?? 5
  const factor = INTENSITY_FACTOR[workout.intensity] ?? 1
  const hours = workout.duration / 60

  return Math.round(met * factor * weightKg * hours)
}

/** Somme des calories brûlées sur une liste de séances. */
export function getTotalCalories(
  workouts: Workout[],
  weightKg: number,
): number {
  return workouts.reduce((total, workout) => {
    return total + estimateWorkoutCalories(workout, weightKg)
  }, 0)
}

/**
 * Dépense énergétique journalière totale (TDEE) : métabolisme de base (Mifflin-
 * St Jeor) × facteur d'activité. C'est le nombre de calories de « maintien ».
 */
export function getMaintenanceCalories(profile: HealthProfile): number {
  const height = Math.max(profile.height, 1)
  const weight = Math.max(profile.weight, 1)
  const age = Math.max(profile.age, 1)

  const basalMetabolicRate = 10 * weight + 6.25 * height - 5 * age + 5

  const multiplierByActivity: Record<HealthProfile['activityLevel'], number> = {
    sedentaire: 1.2,
    leger: 1.375,
    modere: 1.55,
    actif: 1.725,
    'tres-actif': 1.9,
  }

  return Math.round(basalMetabolicRate * multiplierByActivity[profile.activityLevel])
}

export type CalorieTarget = {
  /** Calories de maintien (TDEE). */
  maintenance: number
  /** Calories cibles selon l'objectif. */
  target: number
  /** Écart quotidien vs maintien (négatif = déficit). */
  delta: number
  /** Libellé court de la stratégie. */
  label: string
}

/** Cible calorique quotidienne conseillée selon l'objectif principal. */
export function getCalorieTarget(profile: HealthProfile): CalorieTarget {
  const maintenance = getMaintenanceCalories(profile)

  const strategyByGoal: Record<FitnessGoal, { delta: number; label: string }> =
    {
      'perte-de-poids': { delta: -400, label: 'Déficit léger' },
      'prise-de-muscle': { delta: 300, label: 'Léger surplus' },
      endurance: { delta: 0, label: 'Maintien' },
      'bien-etre': { delta: 0, label: 'Maintien' },
      performance: { delta: 0, label: 'Maintien' },
    }

  const strategy = strategyByGoal[profile.goal]
  const target = Math.max(maintenance + strategy.delta, 1000)

  return {
    maintenance,
    target,
    delta: strategy.delta,
    label: strategy.label,
  }
}
