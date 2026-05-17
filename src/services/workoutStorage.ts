import { supabase } from './supabaseClient'
import type { Workout } from '../types/workout'

type WorkoutRow = {
  id: string
  user_id: string
  title: string
  sport: Workout['category']
  date: string
  duration_minutes: number
  intensity: Workout['intensity']
  feeling: Workout['feeling']
  progress: Workout['trend']
  notes: string | null
  improvement: string | null
  is_record?: boolean | null
  details?: Workout['details'] | null
  created_at?: string
  updated_at?: string
}

function logSupabaseError(label: string, error: unknown) {
  console.error(label, error)
}

function mapWorkoutRowToWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    title: row.title,
    category: row.sport,
    date: row.date,
    duration: row.duration_minutes,
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
    duration_minutes: workout.duration,
    intensity: workout.intensity,
    feeling: workout.feeling,
    progress: workout.trend,
    notes: workout.notes,
    improvement: workout.improvementIdea,
    is_record: workout.trend === 'record',
    details: workout.details ?? null,
  }
}

export async function getRemoteWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    logSupabaseError('Erreur récupération séances Supabase :', error)
    throw error
  }

  return (data ?? []).map((row) =>
    mapWorkoutRowToWorkout(row as WorkoutRow),
  )
}

export async function saveRemoteWorkout(workout: Workout, userId: string) {
  const row = mapWorkoutToInsert(workout, userId)

  const { error } = await supabase
    .from('workouts')
    .upsert(row, { onConflict: 'id' })

  if (error) {
    logSupabaseError('Erreur insertion séance Supabase :', error)
    throw error
  }
}

export async function saveRemoteWorkouts(
  workouts: Workout[],
  userId: string,
) {
  const rows = workouts.map((workout) => mapWorkoutToInsert(workout, userId))

  const { error: deleteError } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    logSupabaseError('Erreur suppression séances Supabase :', deleteError)
    throw deleteError
  }

  if (rows.length === 0) {
    return
  }

  const { error: insertError } = await supabase.from('workouts').insert(rows)

  if (insertError) {
    logSupabaseError('Erreur insertion séances Supabase :', insertError)
    throw insertError
  }
}