import { supabase } from './supabaseClient'
import type { Workout } from '../types/workout'

const WORKOUTS_STORAGE_KEY = 'carnet-de-sport-workouts'

type WorkoutRow = {
  id: string
  user_id: string
  title: string
  sport: Workout['category']
  date: string
  duration: number
  intensity: Workout['intensity']
  feeling: Workout['feeling']
  progress: Workout['trend']
  notes: string | null
  improvement: string | null
  is_record: boolean
  details: unknown | null
}

function getLocalWorkouts() {
  const storedWorkouts = localStorage.getItem(WORKOUTS_STORAGE_KEY)

  if (!storedWorkouts) {
    return null
  }

  try {
    return JSON.parse(storedWorkouts) as Workout[]
  } catch {
    return null
  }
}

function saveLocalWorkouts(workouts: Workout[]) {
  localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts))
}

function mapWorkoutRowToWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    title: row.title,
    category: row.sport,
    date: row.date,
    duration: row.duration,
    intensity: row.intensity,
    feeling: row.feeling,
    trend: row.progress,
    notes: row.notes ?? '',
    improvementIdea: row.improvement ?? '',
    details: row.details ?? undefined,
  } as Workout
}

function mapWorkoutToInsert(workout: Workout, userId: string) {
  return {
    id: workout.id,
    user_id: userId,
    title: workout.title,
    sport: workout.category,
    date: workout.date,
    duration: workout.duration,
    intensity: workout.intensity,
    feeling: workout.feeling,
    progress: workout.trend,
    notes: workout.notes,
    improvement: workout.improvementIdea,
    is_record: workout.trend === 'record',
    details: 'details' in workout ? workout.details ?? null : null,
  }
}

export function getStoredWorkouts(): Workout[] | null
export function getStoredWorkouts(userId: string): Promise<Workout[] | null>
export function getStoredWorkouts(userId?: string) {
  if (!userId) {
    return getLocalWorkouts()
  }

  return getSupabaseWorkouts(userId)
}

async function getSupabaseWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Erreur chargement séances Supabase :', error)
    return getLocalWorkouts()
  }

  const workouts = (data as WorkoutRow[]).map(mapWorkoutRowToWorkout)

  saveLocalWorkouts(workouts)

  return workouts
}

export function saveWorkouts(workouts: Workout[]): void
export function saveWorkouts(workouts: Workout[], userId: string): Promise<void>
export function saveWorkouts(workouts: Workout[], userId?: string) {
  saveLocalWorkouts(workouts)

  if (!userId) {
    return
  }

  return saveSupabaseWorkouts(workouts, userId)
}

async function saveSupabaseWorkouts(workouts: Workout[], userId: string) {
  const { error: deleteError } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Erreur suppression anciennes séances Supabase :', deleteError)
    return
  }

  if (workouts.length === 0) {
    return
  }

  const rows = workouts.map((workout) => {
    return mapWorkoutToInsert(workout, userId)
  })

  const { error: insertError } = await supabase.from('workouts').insert(rows)

  if (insertError) {
    console.error('Erreur sauvegarde séances Supabase :', insertError)
  }
}