import { supabase } from './supabaseClient'
import type { PlannedWorkout } from '../types/plannedWorkout'

type PlannedWorkoutRow = {
  id: string
  user_id: string
  title: string
  category: PlannedWorkout['category']
  date: string
  duration: number
  objective: string | null
  notes: string | null
  improvement_idea: string | null
  details: PlannedWorkout['details'] | null
  created_at?: string
}

function mapPlannedWorkoutRowToPlannedWorkout(
  row: PlannedWorkoutRow,
): PlannedWorkout {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    duration: row.duration,
    objective: row.objective ?? '',
    notes: row.notes ?? '',
    improvementIdea: row.improvement_idea ?? '',
    details: row.details ?? undefined,
  }
}

function mapPlannedWorkoutToInsert(
  plannedWorkout: PlannedWorkout,
  userId: string,
): PlannedWorkoutRow {
  return {
    id: plannedWorkout.id,
    user_id: userId,
    title: plannedWorkout.title,
    category: plannedWorkout.category,
    date: plannedWorkout.date,
    duration: plannedWorkout.duration,
    objective: plannedWorkout.objective ?? '',
    notes: plannedWorkout.notes ?? '',
    improvement_idea: plannedWorkout.improvementIdea ?? '',
    details: plannedWorkout.details ?? null,
  }
}

export async function getRemotePlannedWorkouts(userId: string) {
  const { data, error } = await supabase
    .from('planned_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) =>
    mapPlannedWorkoutRowToPlannedWorkout(row as PlannedWorkoutRow),
  )
}

/** Supprime une seule séance prévue (suppression ciblée). */
export async function deleteRemotePlannedWorkout(
  plannedWorkoutId: string,
  userId: string,
) {
  const { error } = await supabase
    .from('planned_workouts')
    .delete()
    .eq('user_id', userId)
    .eq('id', plannedWorkoutId)

  if (error) {
    throw error
  }
}

/**
 * Synchronise le planning avec Supabase de façon sûre : upsert d'abord, puis
 * suppression des seules séances prévues qui ont disparu (jamais de « tout
 * effacer avant de réécrire »).
 */
export async function saveRemotePlannedWorkouts(
  plannedWorkouts: PlannedWorkout[],
  userId: string,
) {
  const rows = plannedWorkouts.map((plannedWorkout) =>
    mapPlannedWorkoutToInsert(plannedWorkout, userId),
  )

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('planned_workouts')
      .upsert(rows, { onConflict: 'id' })

    if (upsertError) {
      throw upsertError
    }
  }

  const keptIds = rows.map((row) => row.id)
  const cleanup = supabase
    .from('planned_workouts')
    .delete()
    .eq('user_id', userId)
  const { error: deleteError } =
    keptIds.length > 0
      ? await cleanup.not('id', 'in', `(${keptIds.join(',')})`)
      : await cleanup

  if (deleteError) {
    throw deleteError
  }
}