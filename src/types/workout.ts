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

export type StrengthExercise = {
  id: string
  name: string
  sets: string
  reps: string
  weight: string
  rest: string
  notes: string
}

export type WorkoutDetails = {
  exercises?: string
  sets?: number
  reps?: number
  weight?: number
  strengthExercises?: StrengthExercise[]
  distance?: number
  pace?: string
  swimmingStyle?: string
  position?: string
  goals?: number
  assists?: number
  elevation?: number
  bodyZones?: string
}

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