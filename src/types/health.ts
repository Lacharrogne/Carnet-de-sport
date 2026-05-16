export type FitnessGoal =
  | 'perte-de-poids'
  | 'prise-de-muscle'
  | 'endurance'
  | 'bien-etre'
  | 'performance'

export type ActivityLevel =
  | 'sedentaire'
  | 'leger'
  | 'modere'
  | 'actif'
  | 'tres-actif'

export type HealthProfile = {
  height: number
  weight: number
  age: number
  goal: FitnessGoal
  activityLevel: ActivityLevel
}