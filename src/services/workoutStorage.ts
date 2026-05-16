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
  is_record?: boolean | null
  details?: Workout['details'] | null
  created_at?: string
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
    notes: row.notes ?? '',
    improvementIdea: row.improvement ?? '',
    trend: row.progress,
    details: row.details ?? undefined,
  }
}

function mapWorkoutToInsert(workout: Workout, userId: string): WorkoutRow {
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
    details: workout.details ?? null,
  }
}

export function getStoredWorkouts() {
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

export function saveWorkouts(workouts: Workout[]) {
  localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts))
}

export async function getRemoteWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) =>
    mapWorkoutRowToWorkout(row as WorkoutRow),
  )
}

export async function saveRemoteWorkouts(
  workouts: Workout[],
  userId: string,
) {
  const rows = workouts.map((workout) =>
    mapWorkoutToInsert(workout, userId),
  )

  const { error: deleteError } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    throw deleteError
  }

  if (rows.length === 0) {
    return
  }

  const { error: insertError } = await supabase
    .from('workouts')
    .insert(rows)

  if (insertError) {
    throw insertError
  }
}