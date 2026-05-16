export type SportCategoryId =
  | 'musculation'
  | 'course'
  | 'natation'
  | 'football'
  | 'velo'
  | 'marche'
  | 'mobilite'
  | 'autre'

export type WorkoutIntensity = 'Facile' | 'Moyenne' | 'Difficile'

export type WorkoutFeeling =
  | 'Très mauvais'
  | 'Mauvais'
  | 'Correct'
  | 'Bon'
  | 'Excellent'

export type WorkoutTrend = 'progress' | 'stable' | 'regress' | 'record' | 'first'

export type Workout = {
  id: string
  title: string
  category: SportCategoryId
  date: string
  duration: number
  intensity: WorkoutIntensity
  feeling: WorkoutFeeling
  notes: string
  improvementIdea: string
  trend: WorkoutTrend
  details?: WorkoutDetails
}

export type WorkoutFormValues = {
  title: string
  category: SportCategoryId
  date: string
  duration: number
  intensity: WorkoutIntensity
  feeling: WorkoutFeeling
  notes: string
  improvementIdea: string
  trend: WorkoutTrend
  details?: WorkoutDetails
}
export type WorkoutDetails = {
  exercises?: string
  sets?: number
  reps?: number
  weight?: number
  distance?: number
  pace?: string
  swimmingStyle?: string
  position?: string
  goals?: number
  assists?: number
  elevation?: number
  bodyZones?: string
}