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
  source?: string | null
  external_id?: string | null
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
    source: row.source ?? undefined,
    externalId: row.external_id ?? undefined,
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
    details: workout.details ?? {},
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

/** Supprime une seule séance (suppression ciblée, sans toucher aux autres). */
export async function deleteRemoteWorkout(workoutId: string, userId: string) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)
    .eq('id', workoutId)

  if (error) {
    logSupabaseError('Erreur suppression séance Supabase :', error)
    throw error
  }
}

/**
 * Synchronise l'ensemble des séances de l'utilisateur avec Supabase.
 *
 * Stratégie « sûre » : on met d'abord à jour/insère (upsert) les séances
 * voulues, PUIS on supprime uniquement celles qui ont disparu. Ainsi, si
 * quelque chose échoue, on n'a jamais effacé les données avant de les réécrire
 * (contrairement à l'ancien « tout supprimer puis tout réinsérer »).
 */
export async function saveRemoteWorkouts(
  workouts: Workout[],
  userId: string,
) {
  const rows = workouts.map((workout) => mapWorkoutToInsert(workout, userId))

  // 1) Upsert des séances voulues (jamais de perte de données).
  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('workouts')
      .upsert(rows, { onConflict: 'id' })

    if (upsertError) {
      logSupabaseError('Erreur enregistrement séances Supabase :', upsertError)
      throw upsertError
    }
  }

  // 2) Suppression des seules séances qui ne sont plus présentes.
  const keptIds = rows.map((row) => row.id)
  const cleanup = supabase.from('workouts').delete().eq('user_id', userId)
  const { error: deleteError } =
    keptIds.length > 0
      ? await cleanup.not('id', 'in', `(${keptIds.join(',')})`)
      : await cleanup

  if (deleteError) {
    logSupabaseError('Erreur nettoyage séances Supabase :', deleteError)
    throw deleteError
  }
}